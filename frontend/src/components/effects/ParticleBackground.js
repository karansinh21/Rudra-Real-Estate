import React, { useEffect, useRef, useState } from 'react';

const ParticleBackground = ({ 
  color = '#3b82f6', 
  particleCount = 50, 
  connectionDistance = 150 
}) => {
  const canvasRef = useRef(null);
  const [isMobile, setIsMobile] = useState(false);

  // PERFORMANCE: Mobile Detection
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // PERFORMANCE: Reduce particles on mobile (40% of original)
  const adjustedParticleCount = isMobile ? Math.floor(particleCount * 0.4) : particleCount;
  const adjustedConnectionDistance = isMobile ? connectionDistance * 0.7 : connectionDistance;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // PERFORMANCE: Optimized context with desynchronized rendering
    const ctx = canvas.getContext('2d', {
      alpha: true,
      desynchronized: true
    });
    
    let animationFrameId;
    let particles = [];
    let mouse = { x: null, y: null, radius: isMobile ? 50 : 100 }; // Smaller radius on mobile

    // Resize canvas
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Particle class
    class Particle {
      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * (isMobile ? 2 : 3) + 1; // Smaller particles on mobile
        this.speedX = Math.random() * 1 - 0.5;
        this.speedY = Math.random() * 1 - 0.5;
        this.color = color;
      }

      update() {
        this.x += this.speedX;
        this.y += this.speedY;

        // Bounce off edges
        if (this.x > canvas.width || this.x < 0) {
          this.speedX *= -1;
        }
        if (this.y > canvas.height || this.y < 0) {
          this.speedY *= -1;
        }

        // Mouse interaction (disabled on mobile for better performance)
        if (!isMobile && mouse.x !== null) {
          const dx = mouse.x - this.x;
          const dy = mouse.y - this.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < mouse.radius) {
            if (mouse.x < this.x && this.x < canvas.width - this.size * 10) {
              this.x += 2;
            }
            if (mouse.x > this.x && this.x > this.size * 10) {
              this.x -= 2;
            }
            if (mouse.y < this.y && this.y < canvas.height - this.size * 10) {
              this.y += 2;
            }
            if (mouse.y > this.y && this.y > this.size * 10) {
              this.y -= 2;
            }
          }
        }
      }

      draw() {
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.closePath();
        ctx.fill();
      }
    }

    // Initialize particles
    const init = () => {
      particles = [];
      for (let i = 0; i < adjustedParticleCount; i++) {
        particles.push(new Particle());
      }
    };

    // PERFORMANCE: Optimized connection function
    const connect = () => {
      const len = particles.length;
      for (let a = 0; a < len; a++) {
        for (let b = a + 1; b < len; b++) { // Start from a+1 to avoid duplicate connections
          const dx = particles[a].x - particles[b].x;
          const dy = particles[a].y - particles[b].y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < adjustedConnectionDistance) {
            const opacity = 1 - distance / adjustedConnectionDistance;
            ctx.strokeStyle = `${color}${Math.floor(opacity * 255).toString(16).padStart(2, '0')}`;
            ctx.lineWidth = isMobile ? 0.5 : 1; // Thinner lines on mobile
            ctx.beginPath();
            ctx.moveTo(particles[a].x, particles[a].y);
            ctx.lineTo(particles[b].x, particles[b].y);
            ctx.stroke();
          }
        }
      }
    };

    // PERFORMANCE: Use requestAnimationFrame for smooth 60 FPS
    const animate = () => {
      // PERFORMANCE: Efficient canvas clearing
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      particles.forEach(particle => {
        particle.update();
        particle.draw();
      });

      connect();
      animationFrameId = requestAnimationFrame(animate);
    };

    // Mouse move handler (disabled on mobile)
    const handleMouseMove = (e) => {
      if (!isMobile) {
        mouse.x = e.x;
        mouse.y = e.y;
      }
    };

    const handleMouseLeave = () => {
      mouse.x = null;
      mouse.y = null;
    };

    // Only add mouse listeners on desktop
    if (!isMobile) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseleave', handleMouseLeave);
    }

    init();
    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (!isMobile) {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseleave', handleMouseLeave);
      }
      cancelAnimationFrame(animationFrameId);
    };
  }, [color, adjustedParticleCount, adjustedConnectionDistance, isMobile]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ 
        zIndex: 0,
        // PERFORMANCE: GPU acceleration
        willChange: 'transform',
        transform: 'translateZ(0)'
      }}
    />
  );
};

export default ParticleBackground;