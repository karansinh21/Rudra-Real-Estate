import React, { useState, useEffect, useRef, useCallback } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from '../../utils/AuthContext';

const API = process.env.REACT_APP_API_URL?.replace('/api', '') || 'http://localhost:5000';

/* ─── Design System — matches site theme ───────────────────────── */
const DS = {
  bg:           '#F9F6F2',
  card:         '#FFFFFF',
  border:       '#EDE8E3',
  primary:      '#C84B00',
  primaryLight: '#FEF3EE',
  primaryBorder:'rgba(200,75,0,0.18)',
  text:         '#1A0800',
  textSub:      '#6B5748',
  textMuted:    '#9C8B7A',
  green:        '#25D366',   // WhatsApp sent color
  greenDark:    '#128C7E',
  serif:        "Georgia, 'Times New Roman', serif",
  sans:         "'DM Sans', system-ui, sans-serif",
};

/* ─── Chat type configs ─────────────────────────────────────────── */
const CONFIGS = {
  AI: {
    label:   'Rudra AI Assistant',
    sublabel:'Powered by Claude · Instant answers',
    icon:    '🤖',
    color:   '#6366f1',
    colorL:  '#EEF2FF',
    colorB:  'rgba(99,102,241,0.15)',
  },
  BROKER: {
    label:   'Property Broker',
    sublabel:'Buy, sell or rent properties',
    icon:    '🏠',
    color:   DS.primary,
    colorL:  DS.primaryLight,
    colorB:  DS.primaryBorder,
  },
  LAWYER: {
    label:   'Legal Expert',
    sublabel:'Documents, title search & disputes',
    icon:    '⚖️',
    color:   '#7c3aed',
    colorL:  '#F5F3FF',
    colorB:  'rgba(124,58,237,0.15)',
  },
};

/* ─── Translations ──────────────────────────────────────────────── */
const T = {
  en: {
    title:       'Rudra Real Estate',
    subtitle:    'How can we help you today?',
    placeholder: 'Type a message...',
    namePH:      'Your full name...',
    namePrompt:  'Enter your name to start chatting',
    startChat:   'Start Chat',
    typing:      'typing...',
    aiTyping:    'Thinking...',
    tagline:     '15+ Years · 10,000+ Properties · Gujarat',
    emailNote:   'Our team replies via email if offline.',
    clearChat:   'Clear Chat',
    clearConfirm:'Clear all messages?',
    online:      'Online',
    offline:     'Away',
    aiOnline:    'Claude AI · Online',
    quickAI:     ['🏠 Buy Property', '🌿 Land & Plots', '⚖️ Legal Help', '💰 Sell Property', '✨ About Us'],
    quickBroker: ['🏠 Buy Property', '🏡 Rent Property', '💰 Sell Property', '🌿 Land & Plots'],
    quickLawyer: ['📄 Rent Agreement', '📋 Sale Deed', '🔍 Title Search', '⚖️ Property Dispute'],
    connectMsg:  (l) => `✅ Connected with ${l}!\n\nFeel free to type your query. We'll respond shortly. 🙏`,
    offlineMsg:  '⚠️ Our team is currently offline.\n\n📞 Call us: +91 93160 40778\n📧 rudrarealestate001@gmail.com',
    closedMsg:   '✅ Chat ended. Thank you for contacting Rudra Real Estate! 🙏',
    aiWelcome:   '🏛️ Hello! I\'m Rudra Real Estate\'s AI assistant.\n\nI can help you with:\n🏠 Properties — Buy, Rent or Sell\n🌿 Land & Plots — NA, Agricultural\n⚖️ Legal Help — Agreements, Title\n\nWhat would you like to know?',
    options: [
      { type: 'AI',     label: '🤖 AI Assistant',      desc: 'Instant answers powered by Claude' },
      { type: 'BROKER', label: '🏠 Chat with Broker',  desc: 'Buy, sell or rent properties'      },
      { type: 'LAWYER', label: '⚖️ Chat with Lawyer',  desc: 'Legal documents & title search'    },
    ],
  },
  gu: {
    title:       'Rudra Real Estate',
    subtitle:    'Aaj kem madad kari shakiye?',
    placeholder: 'Sandesh lkho...',
    namePH:      'Tamaru puru naam...',
    namePrompt:  'Chat sharu karva naam nakho',
    startChat:   'Chat Sharu Karo',
    typing:      'type kari rahya che...',
    aiTyping:    'Vichar kari rahyo...',
    tagline:     '15+ Varsh · 10,000+ Property · Gujarat',
    emailNote:   'Amari team email dwara jawab aapashe.',
    clearChat:   'Chat Saaf Karo',
    clearConfirm:'Badha message delete karva?',
    online:      'Online',
    offline:     'Away',
    aiOnline:    'Claude AI · Online',
    quickAI:     ['🏠 Property Kharido', '🌿 Jamin', '⚖️ Kanuni', '💰 Vecho', '✨ Amara Vishe'],
    quickBroker: ['🏠 Kharido', '🏡 Bhaade', '💰 Vecho', '🌿 Jamin'],
    quickLawyer: ['📄 Bhada Karar', '📋 Sale Deed', '🔍 Title', '⚖️ Vivad'],
    connectMsg:  (l) => `✅ ${l} sathe connected!\n\nTamaro prashna type karo. Thodi var ma jawab aapashe. 🙏`,
    offlineMsg:  '⚠️ Team atyare offline che.\n\n📞 Phone: +91 93160 40778\n📧 rudrarealestate001@gmail.com',
    closedMsg:   '✅ Chat band. Amaro sampark karva aabhar! 🙏',
    aiWelcome:   '🏛️ Namaste! Hu Rudra Real Estate no AI sahayak chu.\n\nMadad:\n🏠 Property — Kharido, Bhaade, Vecho\n🌿 Jamin — NA, Khetivadi\n⚖️ Kanuni — Karar, Title\n\nShu janava ichu cho?',
    options: [
      { type: 'AI',     label: '🤖 AI Sahayak',        desc: 'Claude AI thi turant jawab'   },
      { type: 'BROKER', label: '🏠 Broker sathe Chat', desc: 'Gujarat ma property'           },
      { type: 'LAWYER', label: '⚖️ Vakil sathe Chat',  desc: 'Kanuni dastavej, title'        },
    ],
  },
  hi: {
    title:       'Rudra Real Estate',
    subtitle:    'Aaj hum kaise madad kar sakte hain?',
    placeholder: 'Sandesh likhein...',
    namePH:      'Aapka poora naam...',
    namePrompt:  'Chat shuru karne ke liye naam darj karein',
    startChat:   'Chat Shuru Karein',
    typing:      'typing...',
    aiTyping:    'Soch raha hun...',
    tagline:     '15+ Saal · 10,000+ Properties · Gujarat',
    emailNote:   'Hamare team email dwara jawab denge.',
    clearChat:   'Chat Saaf Karein',
    clearConfirm:'Sabhi messages delete karein?',
    online:      'Online',
    offline:     'Away',
    aiOnline:    'Claude AI · Online',
    quickAI:     ['🏠 Property Khareedein', '🌿 Zameen', '⚖️ Legal', '💰 Bechein', '✨ Hamare Baare Mein'],
    quickBroker: ['🏠 Khareedein', '🏡 Kiraya', '💰 Bechein', '🌿 Zameen'],
    quickLawyer: ['📄 Kiraya Samjhauta', '📋 Sale Deed', '🔍 Title Search', '⚖️ Vivad'],
    connectMsg:  (l) => `✅ ${l} se connected!\n\nApna prashna type karein. Jald jawab milega. 🙏`,
    offlineMsg:  '⚠️ Team abhi offline hai.\n\n📞 Call: +91 93160 40778\n📧 rudrarealestate001@gmail.com',
    closedMsg:   '✅ Chat band. Sampark karne ke liye shukriya! 🙏',
    aiWelcome:   '🏛️ Namaste! Main Rudra Real Estate ka AI sahayak hun.\n\nMadad:\n🏠 Property — Khareedein, Kiraya, Bechein\n🌿 Zameen — NA, Krishi\n⚖️ Legal — Samjhauta, Title\n\nAap kya jaanna chahte hain?',
    options: [
      { type: 'AI',     label: '🤖 AI Sahayak',       desc: 'Claude AI se turant jawab'  },
      { type: 'BROKER', label: '🏠 Broker se Chat',   desc: 'Gujarat mein property'      },
      { type: 'LAWYER', label: '⚖️ Lawyer se Chat',   desc: 'Legal documents, title'     },
    ],
  },
};

/* ─── AI System Prompt ──────────────────────────────────────────── */
const AI_SYSTEM = `You are Rudra Real Estate's AI assistant for Vadodara, Gujarat, India. Key facts: 15+ years experience, 10,000+ properties sold, 8,500+ happy clients. Phone: +91 93160 40778. Email: rudrarealestate001@gmail.com. RERA registered. Services: Buy/Sell/Rent residential, commercial, industrial properties. Land: NA plots, agricultural, industrial across Gujarat. Legal: Rent agreement ₹1,500, Sale deed ₹5,000, Title search ₹3,000. Free valuation, free site visit in 24 hours. Vadodara land: ₹500–₹2,000/sqft. Properties: ₹25L to ₹5Cr+. Reply helpfully and concisely in the user's language. Under 150 words unless more detail needed. Always include contact at end of detailed answers.`;

function aiFallback(text) {
  const m = text.toLowerCase();
  if (m.match(/buy|kharid|खरीद|ખરીદ/))    return '🏠 500+ verified properties available!\n\n✅ Free site visit in 24 hours\n✅ Home loan assistance\n✅ Legal verification included\n\n📞 +91 93160 40778';
  if (m.match(/rent|bhar|किराय|ભાડ/))      return '🏡 Rental properties available!\n\n1BHK: ₹8K–15K/month\n2BHK: ₹12K–25K/month\n3BHK: ₹20K–45K/month\n\n📞 +91 93160 40778';
  if (m.match(/sell|vech|बेच|વેચ/))        return '💰 Sell with Rudra!\n\n✅ Free valuation\n✅ Listed on 10+ platforms\n⚡ Average sale in 30 days\n\n📞 +91 93160 40778';
  if (m.match(/land|plot|jamin|जमीन|જમ/))  return '🌿 Land & Plots in Gujarat\n\nVadodara: ₹500–₹2,000/sqft\n✅ RERA registered\n✅ Bank loan available\n\n📞 +91 93160 40778';
  if (m.match(/legal|agreement|deed|title/)) return '⚖️ Legal Services\n\nRent Agreement: ₹1,500\nSale Deed: ₹5,000\nTitle Search: ₹3,000\n✅ First consult FREE\n\n📞 +91 93160 40778';
  return '🏛️ Rudra Real Estate\n\n15 years · 10,000+ properties sold\n\n📞 +91 93160 40778\n📧 rudrarealestate001@gmail.com';
}

function fmtTime(d) {
  return new Date(d || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

/* ════════════════════════════════════════════════════════════════ */
export default function UnifiedChatWidget() {
  const { user } = useAuth();

  const [lang,        setLang]        = useState(() => localStorage.getItem('rudra_lang') || 'en');
  const [isOpen,      setIsOpen]      = useState(false);
  const [step,        setStep]        = useState('home');   // home | name | chat
  const [chatType,    setChatType]    = useState(null);
  const [nameInput,   setNameInput]   = useState('');
  const [input,       setInput]       = useState('');
  const [messages,    setMessages]    = useState([]);
  const [isTyping,    setIsTyping]    = useState(false);
  const [unread,      setUnread]      = useState(1);
  const [sessionId,   setSessionId]   = useState(null);
  const [agentOnline, setAgentOnline] = useState(false);
  const [showClear,   setShowClear]   = useState(false);

  // Draggable FAB state
  const [fabPos,    setFabPos]    = useState({ x: 20, y: 20 }); // right, bottom offset
  const [dragging,  setDragging]  = useState(false);
  const dragStart   = useRef(null);
  const fabRef      = useRef(null);

  const socketRef   = useRef(null);
  const endRef      = useRef(null);
  const inputRef    = useRef(null);
  const aiHistory   = useRef([]);
  const typingTimer = useRef(null);

  const t   = T[lang] || T.en;
  const cfg = chatType ? CONFIGS[chatType] : CONFIGS.AI;
  const isAI = chatType === 'AI';

  // Filtered options — broker/lawyer only if logged in as that role
  const visibleOptions = t.options.filter(opt => {
    if (opt.type === 'AI')     return true;
    if (opt.type === 'BROKER') return !user || user.role === 'PUBLIC' || user.role === 'USER';
    if (opt.type === 'LAWYER') return !user || user.role === 'PUBLIC' || user.role === 'USER';
    return true;
  });

  // Broker/Lawyer logged in — skip home, go direct to chat
  useEffect(() => {
    if (user?.role === 'BROKER' || user?.role === 'LAWYER') {
      // They have their own dashboard chat — don't show chat widget to them
      // Widget only for PUBLIC users + AI
    }
  }, [user]);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, isTyping]);

  useEffect(() => {
    if (isOpen && step === 'chat') {
      setUnread(0);
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen, step]);

  // Request notification permission
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  // ── Draggable FAB ─────────────────────────────────────────────
  const onMouseDown = (e) => {
    if (isOpen) return;
    setDragging(true);
    dragStart.current = {
      mouseX: e.clientX,
      mouseY: e.clientY,
      fabX:   fabPos.x,
      fabY:   fabPos.y,
    };
    e.preventDefault();
  };

  useEffect(() => {
    const onMove = (e) => {
      if (!dragging || !dragStart.current) return;
      const dx = dragStart.current.mouseX - e.clientX;
      const dy = dragStart.current.mouseY - e.clientY;
      const newX = Math.max(10, Math.min(window.innerWidth - 80,  dragStart.current.fabX + dx));
      const newY = Math.max(10, Math.min(window.innerHeight - 80, dragStart.current.fabY + dy));
      setFabPos({ x: newX, y: newY });
    };
    const onUp = () => { setDragging(false); dragStart.current = null; };
    if (dragging) {
      window.addEventListener('mousemove', onMove);
      window.addEventListener('mouseup',   onUp);
    }
    return () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp); };
  }, [dragging]);

  // ── Notification ──────────────────────────────────────────────
  const notify = useCallback((text, senderName) => {
    if (isOpen) return;
    setUnread(n => n + 1);
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(`${senderName} — Rudra Real Estate`, {
        body: text.slice(0, 80),
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        tag: 'rudra-chat',
      });
    }
  }, [isOpen]);

  // ── Socket ────────────────────────────────────────────────────
  const connectSocket = useCallback((sid) => {
    if (socketRef.current?.connected) return;
    const sock = io(API, { transports: ['websocket', 'polling'] });
    socketRef.current = sock;

    sock.on('connect',    () => { sock.emit('join-room', sid); setAgentOnline(true); });
    sock.on('disconnect', () => setAgentOnline(false));

    sock.on('receive-message', data => {
      if (data.sessionId !== sid || data.senderRole === 'USER') return;
      const msg = {
        id:         data.id || Date.now(),
        text:       data.text,
        from:       'agent',
        senderName: data.senderName || cfg.label,
        time:       fmtTime(data.createdAt),
      };
      setMessages(p => [...p, msg]);
      notify(data.text, data.senderName || cfg.label);
    });

    sock.on('user-typing', data => {
      if (['ADMIN', 'BROKER', 'LAWYER'].includes(data.role)) {
        setIsTyping(data.typing);
        if (data.typing) {
          clearTimeout(typingTimer.current);
          typingTimer.current = setTimeout(() => setIsTyping(false), 3000);
        }
      }
    });

    sock.on('session-closed', () => {
      addMsg('agent', t.closedMsg, 'Rudra');
    });
  }, [cfg.label, notify, t.closedMsg]);

  useEffect(() => () => socketRef.current?.disconnect(), []);

  const addMsg = (from, text, senderName = '') => {
    setMessages(p => [...p, { id: Date.now() + Math.random(), from, text, senderName, time: fmtTime() }]);
  };

  // ── Select chat type ──────────────────────────────────────────
  const selectType = (type) => {
    setChatType(type);
    if (type === 'AI') {
      aiHistory.current = [];
      setMessages([{ id: 'w', from: 'agent', senderName: 'Rudra AI 🤖', text: t.aiWelcome, time: fmtTime() }]);
      setStep('chat');
    } else {
      // If user logged in, skip name step
      if (user?.name) {
        setNameInput(user.name);
        setStep('name'); // still show briefly then auto-start
        setTimeout(() => startLiveSession(type, user.name), 100);
      } else {
        setStep('name');
      }
    }
  };

  // ── Start live session ────────────────────────────────────────
  const startLiveSession = async (type, nameOverride) => {
    const name = nameOverride || nameInput.trim();
    if (!name) return;
    const cType = type || chatType;
    try {
      const res  = await fetch(`${API}/api/chat/session`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          guestName:  user?.name  || name,
          guestEmail: user?.email || '',
          guestPhone: user?.phone || '',
          userId:     user?.id    || null,
          sessionType: cType,
        }),
      });
      const data = await res.json();
      const sid  = data.session?.id;
      if (!sid) throw new Error('No session');
      setSessionId(sid);
      const lbl = cType === 'BROKER' ? 'Broker' : 'Lawyer';
      setMessages([{ id: 'w', from: 'agent', senderName: `Rudra ${lbl}`, text: t.connectMsg(lbl), time: fmtTime() }]);
      connectSocket(sid);
      socketRef.current?.emit('new-session', { sessionId: sid, sessionType: cType, userName: user?.name || name });
      setStep('chat');
    } catch {
      setMessages([{ id: 'w', from: 'agent', senderName: 'Rudra', text: t.offlineMsg, time: fmtTime() }]);
      setStep('chat');
    }
  };

  const startSession = () => startLiveSession(chatType, nameInput);

  // ── Send message ──────────────────────────────────────────────
  const send = async (textArg) => {
    const text = (textArg || input).trim();
    if (!text) return;
    setInput('');

    addMsg('user', text, user?.name || nameInput || 'You');

    if (isAI) {
      setIsTyping(true);
      aiHistory.current.push({ role: 'user', content: text });
      try {
        const res  = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model:      'claude-sonnet-4-20250514',
            max_tokens: 1000,
            system:     AI_SYSTEM,
            messages:   aiHistory.current,
          }),
        });
        const data  = await res.json();
        const reply = data.content?.[0]?.text || aiFallback(text);
        aiHistory.current.push({ role: 'assistant', content: reply });
        setMessages(p => [...p, { id: Date.now(), from: 'agent', senderName: 'Rudra AI 🤖', text: reply, time: fmtTime() }]);
      } catch {
        const reply = aiFallback(text);
        aiHistory.current.push({ role: 'assistant', content: reply });
        setMessages(p => [...p, { id: Date.now(), from: 'agent', senderName: 'Rudra AI 🤖', text: reply, time: fmtTime() }]);
      } finally { setIsTyping(false); }
      return;
    }

    if (!sessionId) return;
    const senderName = user?.name || nameInput || 'Guest';

    // Typing stop emit
    socketRef.current?.emit('typing', { roomId: sessionId, typing: false, role: 'USER' });

    try {
      const res   = await fetch(`${API}/api/chat/session/${sessionId}/message`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, senderName, senderRole: 'USER', senderId: user?.id || null }),
      });
      const saved = await res.json();
      socketRef.current?.emit('send-message', {
        sessionId, sessionType: chatType,
        id: saved.message?.id, text, senderName,
        senderRole: 'USER', createdAt: new Date().toISOString(),
      });
    } catch {}

    // Auto bot reply if agent offline
    if (!agentOnline) {
      setIsTyping(true);
      setTimeout(async () => {
        const reply = aiFallback(text);
        addMsg('agent', reply, chatType === 'BROKER' ? 'Broker Bot' : 'Legal Bot');
        setIsTyping(false);
        try {
          await fetch(`${API}/api/chat/session/${sessionId}/message`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: reply, senderName: 'Bot', senderRole: 'BOT' }),
          });
        } catch {}
      }, 1200);
    }
  };

  const handleInputChange = (e) => {
    setInput(e.target.value);
    if (sessionId && !isAI && socketRef.current?.connected) {
      socketRef.current.emit('typing', { roomId: sessionId, typing: !!e.target.value, role: 'USER' });
      clearTimeout(typingTimer.current);
      typingTimer.current = setTimeout(() => {
        socketRef.current?.emit('typing', { roomId: sessionId, typing: false, role: 'USER' });
      }, 1500);
    }
  };

  // ── Clear chat ────────────────────────────────────────────────
  const clearChat = () => {
    setMessages([]);
    setShowClear(false);
    aiHistory.current = [];
    if (isAI) {
      setMessages([{ id: 'w2', from: 'agent', senderName: 'Rudra AI 🤖', text: t.aiWelcome, time: fmtTime() }]);
    }
  };

  // ── Reset ─────────────────────────────────────────────────────
  const reset = () => {
    setStep('home'); setMessages([]); setSessionId(null);
    setNameInput(''); setChatType(null); aiHistory.current = [];
    socketRef.current?.disconnect(); socketRef.current = null;
    setAgentOnline(false); setIsTyping(false); setShowClear(false);
  };

  const changeLang = (l) => { setLang(l); localStorage.setItem('rudra_lang', l); };

  const quickReplies = chatType === 'BROKER' ? t.quickBroker : chatType === 'LAWYER' ? t.quickLawyer : t.quickAI;

  // ── Don't show widget to Broker/Lawyer (they have dashboard chat) ──
  if (user?.role === 'BROKER' || user?.role === 'LAWYER') return null;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600&display=swap');
        @keyframes ucw-pop    { from{opacity:0;transform:scale(0.92) translateY(16px)} to{opacity:1;transform:scale(1) translateY(0)} }
        @keyframes ucw-slide  { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:translateY(0)} }
        @keyframes ucw-pulse  { 0%,100%{box-shadow:0 8px 28px rgba(200,75,0,0.4)} 50%{box-shadow:0 8px 36px rgba(200,75,0,0.65)} }
        @keyframes ucw-dots   { 0%,80%,100%{transform:translateY(0);opacity:0.4} 40%{transform:translateY(-4px);opacity:1} }
        @keyframes ucw-float1 { 0%,100%{transform:translate(0,0) scale(1)} 33%{transform:translate(20px,-15px) scale(1.05)} 66%{transform:translate(-10px,20px) scale(0.97)} }
        @keyframes ucw-float2 { 0%,100%{transform:translate(0,0)} 50%{transform:translate(-18px,12px)} }
        @keyframes ucw-float3 { 0%,100%{transform:translate(0,0)} 50%{transform:translate(12px,-20px)} }
        @keyframes ucw-shimmer{ 0%{background-position:-200% center} 100%{background-position:200% center} }
        @keyframes ucw-badge  { 0%{transform:scale(1)} 50%{transform:scale(1.3)} 100%{transform:scale(1)} }
        .ucw-root  { font-family:'DM Sans',system-ui,sans-serif; }
        .ucw-scroll::-webkit-scrollbar{width:3px}
        .ucw-scroll::-webkit-scrollbar-thumb{background:${DS.border};border-radius:4px}
        .ucw-qbtn:hover{background:${DS.primaryLight}!important;color:${DS.primary}!important;transform:translateY(-1px)}
        .ucw-opt:hover{transform:translateY(-2px);box-shadow:0 8px 24px rgba(200,75,0,0.12)!important}
        .ucw-fab-btn:hover{transform:scale(1.08)}
        .ucw-send:hover{transform:scale(1.05)}
        .ucw-close:hover{background:${DS.border}!important}
        .ucw-inp:focus{outline:none;border-color:${DS.primary}!important;box-shadow:0 0 0 3px ${DS.primaryLight}!important}
        .ucw-shimmer{background:linear-gradient(90deg,${DS.primary},#E8853A,#D4A853,${DS.primary});background-size:300% auto;-webkit-background-clip:text;-webkit-text-fill-color:transparent;animation:ucw-shimmer 3.5s linear infinite}
      `}</style>

      <div className="ucw-root" style={{
        position: 'fixed', bottom: fabPos.y, right: fabPos.x, zIndex: 99999,
        userSelect: dragging ? 'none' : 'auto',
      }}>

        {/* ══ FAB ══════════════════════════════════════════════════ */}
        {!isOpen && (
          <div style={{ position: 'relative' }}>
            {/* Drag hint ring */}
            <div style={{
              position: 'absolute', inset: -6, borderRadius: '50%',
              border: `2px dashed ${DS.primaryBorder}`,
              opacity: dragging ? 1 : 0, transition: 'opacity 0.2s',
              pointerEvents: 'none',
            }}/>
            <button
              ref={fabRef}
              className="ucw-fab-btn"
              onMouseDown={onMouseDown}
              onClick={(e) => { if (!dragging) setIsOpen(true); }}
              style={{
                width: 58, height: 58, borderRadius: '50%', border: 'none',
                cursor: dragging ? 'grabbing' : 'pointer',
                background: `linear-gradient(135deg, ${DS.primary}, #A83A00)`,
                boxShadow: `0 8px 28px rgba(200,75,0,0.45)`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                position: 'relative', transition: 'transform 0.2s',
                animation: 'ucw-pulse 3s ease infinite',
              }}
            >
              {/* WhatsApp-style chat icon */}
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                <path d="M20.52 3.48A11.93 11.93 0 0 0 12 0C5.37 0 0 5.37 0 12c0 2.11.55 4.1 1.51 5.83L0 24l6.35-1.49A11.96 11.96 0 0 0 12 24c6.63 0 12-5.37 12-12 0-3.21-1.25-6.22-3.48-8.52z" fill="white" opacity="0.15"/>
                <path d="M12 2.25c-5.38 0-9.75 4.37-9.75 9.75 0 1.82.5 3.52 1.37 4.98L2.25 21.75l4.87-1.35A9.72 9.72 0 0 0 12 21.75c5.38 0 9.75-4.37 9.75-9.75S17.38 2.25 12 2.25z" fill="white" opacity="0.9"/>
                <path d="M8.5 10.5c0-.55.45-1 1-1h5c.55 0 1 .45 1 1s-.45 1-1 1h-5c-.55 0-1-.45-1-1zM8.5 13.5c0-.55.45-1 1-1h3c.55 0 1 .45 1 1s-.45 1-1 1h-3c-.55 0-1-.45-1-1z" fill={DS.primary}/>
              </svg>

              {unread > 0 && (
                <span style={{
                  position: 'absolute', top: -2, right: -2,
                  background: '#ef4444', color: '#fff', fontSize: 11, fontWeight: 800,
                  borderRadius: '50%', width: 20, height: 20,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  border: '2px solid #fff',
                  animation: 'ucw-badge 1.5s ease infinite',
                }}>{unread > 9 ? '9+' : unread}</span>
              )}
            </button>
            {/* Drag label */}
            {dragging && (
              <div style={{ position: 'absolute', bottom: -22, left: '50%', transform: 'translateX(-50%)', fontSize: 9, color: DS.textMuted, whiteSpace: 'nowrap', background: DS.card, borderRadius: 6, padding: '2px 6px', border: `1px solid ${DS.border}` }}>
                Drag to move
              </div>
            )}
          </div>
        )}

        {/* ══ CHAT WINDOW ══════════════════════════════════════════ */}
        {isOpen && (
          <div style={{
            width: 370, borderRadius: 24, overflow: 'hidden',
            boxShadow: '0 20px 60px rgba(26,8,0,0.18), 0 0 0 1px rgba(237,232,227,0.8)',
            animation: 'ucw-pop 0.3s cubic-bezier(0.34,1.56,0.64,1)',
            display: 'flex', flexDirection: 'column',
            maxHeight: '88vh', background: DS.card,
            border: `1px solid ${DS.border}`,
          }}>

            {/* ── HEADER ─────────────────────────────────────────── */}
            <div style={{
              background: `linear-gradient(135deg, #1A0800 0%, #3D1200 55%, #1A0800 100%)`,
              padding: '14px 16px', flexShrink: 0, position: 'relative', overflow: 'hidden',
            }}>
              {/* Animated orbs */}
              <div style={{ position:'absolute', top:-30, right:-30, width:130, height:130, borderRadius:'50%', background:'radial-gradient(circle,rgba(200,75,0,0.2) 0%,transparent 70%)', animation:'ucw-float1 7s ease-in-out infinite', pointerEvents:'none' }}/>
              <div style={{ position:'absolute', bottom:-20, left:-10, width:90, height:90, borderRadius:'50%', background:'radial-gradient(circle,rgba(212,168,83,0.12) 0%,transparent 70%)', animation:'ucw-float2 9s ease-in-out infinite', pointerEvents:'none' }}/>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative', zIndex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  {step !== 'home' && (
                    <button onClick={reset} style={{ width: 28, height: 28, borderRadius: '50%', border: 'none', cursor: 'pointer', background: 'rgba(255,255,255,0.12)', color: '#fff', fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      ←
                    </button>
                  )}
                  <div style={{ width: 42, height: 42, borderRadius: '50%', background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>
                    {step === 'home' ? '🏛️' : cfg.icon}
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ color: '#FFF8F0', fontWeight: 700, fontSize: 14 }}>
                        {step === 'home' ? t.title : cfg.label}
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 2 }}>
                      <span style={{
                        width: 6, height: 6, borderRadius: '50%', display: 'inline-block',
                        background: (isAI || agentOnline) ? '#4ade80' : '#fbbf24',
                        boxShadow: `0 0 6px ${(isAI || agentOnline) ? '#4ade80' : '#fbbf24'}`,
                      }}/>
                      <span style={{ color: 'rgba(255,248,240,0.6)', fontSize: 11 }}>
                        {isTyping
                          ? (isAI ? t.aiTyping : t.typing)
                          : isAI ? t.aiOnline : (agentOnline ? t.online : t.offline)
                        }
                      </span>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  {/* Lang switcher */}
                  <div style={{ display: 'flex', background: 'rgba(0,0,0,0.25)', borderRadius: 20, padding: '2px 3px', gap: 1 }}>
                    {['en','gu','hi'].map(l => (
                      <button key={l} onClick={() => changeLang(l)} style={{
                        padding: '2px 7px', borderRadius: 14, border: 'none', cursor: 'pointer',
                        fontSize: 10, fontWeight: 700,
                        background: lang === l ? 'rgba(255,255,255,0.18)' : 'transparent',
                        color: lang === l ? '#fff' : 'rgba(255,255,255,0.4)',
                        transition: 'all 0.15s',
                      }}>
                        {l === 'en' ? 'EN' : l === 'gu' ? 'ગુ' : 'हि'}
                      </button>
                    ))}
                  </div>

                  {/* Clear chat button */}
                  {step === 'chat' && (
                    <button onClick={() => setShowClear(true)} title={t.clearChat} style={{
                      width: 28, height: 28, borderRadius: '50%', border: 'none', cursor: 'pointer',
                      background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.7)',
                      fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>🗑️</button>
                  )}

                  {/* Close */}
                  <button className="ucw-close" onClick={() => setIsOpen(false)} style={{
                    width: 28, height: 28, borderRadius: '50%', border: 'none', cursor: 'pointer',
                    background: 'rgba(255,255,255,0.1)', color: '#fff',
                    fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'background 0.15s',
                  }}>✕</button>
                </div>
              </div>
            </div>

            {/* ── CLEAR CONFIRM MODAL ─────────────────────────────── */}
            {showClear && (
              <div style={{ position: 'absolute', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(26,8,0,0.4)', backdropFilter: 'blur(4px)' }}>
                <div style={{ background: DS.card, borderRadius: 18, padding: 24, margin: 16, boxShadow: '0 16px 48px rgba(26,8,0,0.2)', border: `1px solid ${DS.border}`, textAlign: 'center', animation: 'ucw-pop 0.25s ease' }}>
                  <div style={{ fontSize: 28, marginBottom: 10 }}>🗑️</div>
                  <p style={{ fontFamily: DS.serif, fontWeight: 700, color: DS.text, fontSize: 16, margin: '0 0 6px' }}>Clear Chat?</p>
                  <p style={{ color: DS.textMuted, fontSize: 13, margin: '0 0 18px' }}>{t.clearConfirm}</p>
                  <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
                    <button onClick={() => setShowClear(false)} style={{ padding: '9px 20px', borderRadius: 12, border: `1px solid ${DS.border}`, background: DS.bg, color: DS.textSub, fontWeight: 600, fontSize: 13, cursor: 'pointer', fontFamily: DS.sans }}>Cancel</button>
                    <button onClick={clearChat} style={{ padding: '9px 20px', borderRadius: 12, border: 'none', background: '#FEF2F2', color: '#DC2626', fontWeight: 700, fontSize: 13, cursor: 'pointer', fontFamily: DS.sans }}>Clear</button>
                  </div>
                </div>
              </div>
            )}

            {/* ── HOME ─────────────────────────────────────────────── */}
            {step === 'home' && (
              <div style={{ flex: 1, overflowY: 'auto', background: DS.bg, position: 'relative' }}>
                {/* Animated background orbs */}
                <div style={{ position: 'absolute', top: 10, right: 10, width: 120, height: 120, borderRadius: '50%', background: 'radial-gradient(circle,rgba(200,75,0,0.06) 0%,transparent 70%)', animation: 'ucw-float1 8s ease-in-out infinite', pointerEvents: 'none' }}/>
                <div style={{ position: 'absolute', bottom: 20, left: 0, width: 100, height: 100, borderRadius: '50%', background: 'radial-gradient(circle,rgba(212,168,83,0.08) 0%,transparent 70%)', animation: 'ucw-float2 10s ease-in-out infinite', pointerEvents: 'none' }}/>

                <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 10, position: 'relative', zIndex: 1 }}>
                  {/* Company card */}
                  <div style={{ background: DS.card, borderRadius: 18, padding: 18, textAlign: 'center', border: `1px solid ${DS.border}`, boxShadow: '0 2px 8px rgba(26,8,0,0.05)' }}>
                    <div style={{ fontSize: 36, marginBottom: 8 }}>🏛️</div>
                    <div style={{ fontFamily: DS.serif, fontWeight: 700, fontSize: 17, color: DS.text, marginBottom: 3 }}>
                      <span className="ucw-shimmer">Rudra Real Estate</span>
                    </div>
                    <div style={{ fontSize: 11, color: DS.textMuted }}>{t.tagline}</div>
                  </div>

                  <p style={{ fontSize: 12, color: DS.textMuted, textAlign: 'center', fontWeight: 600, margin: 0 }}>{t.subtitle}</p>

                  {/* Options */}
                  {visibleOptions.map(opt => {
                    const c = CONFIGS[opt.type];
                    return (
                      <button key={opt.type} className="ucw-opt" onClick={() => selectType(opt.type)} style={{
                        background: DS.card, border: `1.5px solid ${DS.border}`,
                        borderRadius: 16, padding: '13px 15px', cursor: 'pointer', textAlign: 'left',
                        transition: 'all 0.2s', boxShadow: '0 2px 8px rgba(26,8,0,0.04)',
                        display: 'flex', alignItems: 'center', gap: 12,
                      }}>
                        <div style={{ width: 42, height: 42, borderRadius: 12, background: c.colorL, border: `1px solid ${c.colorB}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>
                          {c.icon}
                        </div>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: 13.5, color: DS.text }}>{opt.label}</div>
                          <div style={{ fontSize: 11.5, color: DS.textMuted, marginTop: 2 }}>{opt.desc}</div>
                        </div>
                        <span style={{ marginLeft: 'auto', color: DS.textMuted, fontSize: 16 }}>›</span>
                      </button>
                    );
                  })}

                  {/* Email note */}
                  <div style={{ background: DS.card, borderRadius: 12, padding: '10px 14px', border: `1px solid ${DS.border}` }}>
                    <p style={{ margin: 0, fontSize: 11, color: DS.textMuted, textAlign: 'center' }}>
                      📧 {t.emailNote}
                    </p>
                  </div>
                  <p style={{ textAlign: 'center', fontSize: 11, color: DS.textMuted, margin: 0 }}>
                    📞 +91 93160 40778
                  </p>
                </div>
              </div>
            )}

            {/* ── NAME ─────────────────────────────────────────────── */}
            {step === 'name' && (
              <div style={{ flex: 1, padding: 18, display: 'flex', flexDirection: 'column', gap: 14, background: DS.bg }}>
                <div style={{ background: DS.card, borderRadius: 16, padding: 16, textAlign: 'center', border: `1.5px solid ${cfg.colorB}` }}>
                  <div style={{ fontSize: 30, marginBottom: 8 }}>{cfg.icon}</div>
                  <div style={{ fontWeight: 700, fontSize: 14, color: DS.text }}>{cfg.label}</div>
                  <div style={{ fontSize: 12, color: DS.textMuted, marginTop: 3 }}>{cfg.sublabel}</div>
                </div>

                <p style={{ fontSize: 13, color: DS.textSub, textAlign: 'center', margin: 0 }}>{t.namePrompt}</p>

                <input
                  autoFocus value={nameInput}
                  onChange={e => setNameInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && startSession()}
                  placeholder={t.namePH}
                  className="ucw-inp"
                  style={{
                    background: DS.card, border: `1.5px solid ${DS.border}`,
                    borderRadius: 12, padding: '11px 15px', fontSize: 14,
                    color: DS.text, outline: 'none', fontFamily: DS.sans,
                    transition: 'all 0.2s',
                  }}
                />

                <button onClick={startSession} disabled={!nameInput.trim()} style={{
                  background: nameInput.trim() ? DS.primary : DS.border,
                  color: nameInput.trim() ? '#fff' : DS.textMuted,
                  border: 'none', borderRadius: 12, padding: '13px',
                  fontSize: 14, fontWeight: 700, cursor: nameInput.trim() ? 'pointer' : 'not-allowed',
                  boxShadow: nameInput.trim() ? '0 4px 20px rgba(200,75,0,0.3)' : 'none',
                  transition: 'all 0.2s', fontFamily: DS.sans,
                }}>
                  {cfg.icon} {t.startChat}
                </button>
              </div>
            )}

            {/* ── CHAT ─────────────────────────────────────────────── */}
            {step === 'chat' && (
              <>
                {/* Messages area */}
                <div className="ucw-scroll" style={{
                  flex: 1, overflowY: 'auto', padding: '14px 12px',
                  background: DS.bg, minHeight: 260, maxHeight: 360,
                  display: 'flex', flexDirection: 'column', gap: 2,
                  position: 'relative',
                }}>
                  {/* Subtle bg pattern */}
                  <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(rgba(200,75,0,0.03) 1px, transparent 1px)', backgroundSize: '20px 20px', pointerEvents: 'none' }}/>

                  {messages.length === 0 && (
                    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 8, opacity: 0.5 }}>
                      <div style={{ fontSize: 32 }}>💬</div>
                      <p style={{ fontSize: 12, color: DS.textMuted, textAlign: 'center' }}>Start the conversation...</p>
                    </div>
                  )}

                  {messages.map(msg => {
                    const own = msg.from === 'user';
                    return (
                      <div key={msg.id} style={{ display: 'flex', flexDirection: 'column', alignItems: own ? 'flex-end' : 'flex-start', marginBottom: 4, animation: 'ucw-slide 0.2s ease', position: 'relative', zIndex: 1 }}>
                        {!own && (
                          <span style={{ fontSize: 10, fontWeight: 700, color: cfg.color, marginBottom: 3, marginLeft: 12, opacity: 0.9 }}>
                            {msg.senderName}
                          </span>
                        )}
                        <div style={{
                          maxWidth: '80%', position: 'relative',
                          // WhatsApp-style: sent = green, received = white
                          background: own ? DS.green : DS.card,
                          borderRadius: own ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                          border: own ? 'none' : `1px solid ${DS.border}`,
                          padding: '9px 13px 6px',
                          boxShadow: own
                            ? '0 2px 8px rgba(37,211,102,0.25)'
                            : '0 1px 4px rgba(26,8,0,0.07)',
                        }}>
                          {/* WhatsApp tail */}
                          <div style={{
                            position: 'absolute',
                            [own ? 'right' : 'left']: -6,
                            bottom: 8, width: 0, height: 0,
                            borderTop: '6px solid transparent',
                            borderBottom: '0px solid transparent',
                            [own ? 'borderLeft' : 'borderRight']: `8px solid ${own ? DS.green : DS.card}`,
                          }}/>

                          <p style={{
                            margin: 0, fontSize: 13.5, lineHeight: 1.55,
                            whiteSpace: 'pre-wrap', wordBreak: 'break-word',
                            color: own ? '#fff' : DS.text,
                          }}>{msg.text}</p>

                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 3, marginTop: 3 }}>
                            <span style={{ fontSize: 10, color: own ? 'rgba(255,255,255,0.65)' : DS.textMuted }}>
                              {msg.time}
                            </span>
                            {own && (
                              <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)' }}>✓✓</span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {/* Typing indicator */}
                  {isTyping && (
                    <div style={{ display: 'flex', alignItems: 'flex-end', marginBottom: 4, animation: 'ucw-slide 0.2s ease', paddingLeft: 4 }}>
                      <div style={{ background: DS.card, border: `1px solid ${DS.border}`, borderRadius: '18px 18px 18px 4px', padding: '11px 15px', display: 'flex', gap: 4, alignItems: 'center', boxShadow: '0 1px 4px rgba(26,8,0,0.07)' }}>
                        {[0,1,2].map(i => (
                          <span key={i} style={{ width: 7, height: 7, borderRadius: '50%', background: DS.textMuted, display: 'block', animation: 'ucw-dots 1.4s ease infinite', animationDelay: `${i * 0.18}s` }}/>
                        ))}
                      </div>
                    </div>
                  )}
                  <div ref={endRef}/>
                </div>

                {/* Quick replies */}
                <div style={{
                  padding: '7px 10px', background: DS.card,
                  borderTop: `1px solid ${DS.border}`,
                  display: 'flex', gap: 6, overflowX: 'auto',
                }}>
                  {quickReplies.map((q, i) => (
                    <button key={i} className="ucw-qbtn" onClick={() => send(q)} style={{
                      padding: '5px 12px', borderRadius: 20, cursor: 'pointer', flexShrink: 0,
                      background: DS.bg, border: `1px solid ${DS.border}`,
                      color: DS.textSub, fontSize: 11.5, fontWeight: 600,
                      transition: 'all 0.15s', fontFamily: DS.sans,
                    }}>{q}</button>
                  ))}
                </div>

                {/* Input row */}
                <div style={{
                  padding: '10px 12px 12px', background: DS.card,
                  borderTop: `1px solid ${DS.border}`,
                  display: 'flex', alignItems: 'center', gap: 8,
                }}>
                  <input
                    ref={inputRef}
                    className="ucw-inp"
                    value={input}
                    onChange={handleInputChange}
                    onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()}
                    placeholder={t.placeholder}
                    style={{
                      flex: 1, background: DS.bg, border: `1.5px solid ${DS.border}`,
                      borderRadius: 22, padding: '10px 15px',
                      fontSize: 13.5, color: DS.text, fontFamily: DS.sans,
                      outline: 'none', transition: 'all 0.2s',
                    }}
                    onFocus={e => { e.target.style.borderColor = DS.primary; e.target.style.boxShadow = `0 0 0 3px ${DS.primaryLight}`; }}
                    onBlur={e  => { e.target.style.borderColor = DS.border;  e.target.style.boxShadow = 'none'; }}
                  />

                  {/* Send button — WhatsApp style */}
                  <button
                    className="ucw-send"
                    onClick={() => send()}
                    disabled={!input.trim() || isTyping}
                    style={{
                      width: 42, height: 42, borderRadius: '50%', border: 'none',
                      background: input.trim() && !isTyping ? DS.green : DS.border,
                      cursor: input.trim() && !isTyping ? 'pointer' : 'not-allowed',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      flexShrink: 0, transition: 'all 0.2s',
                      boxShadow: input.trim() && !isTyping ? '0 4px 14px rgba(37,211,102,0.35)' : 'none',
                    }}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                      <path d="M22 2L11 13M22 2L15 22L11 13L2 9L22 2Z" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                </div>

                {/* Footer */}
                <div style={{ padding: '4px 12px 8px', background: DS.card, textAlign: 'center', borderTop: `1px solid ${DS.border}` }}>
                  <span style={{ fontSize: 10, color: DS.textMuted }}>
                    {isAI ? '🤖 Powered by Claude AI · Rudra Real Estate' : '📞 +91 93160 40778 · Rudra Real Estate'}
                  </span>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </>
  );
}