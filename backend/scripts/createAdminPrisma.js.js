const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

const createAdmin = async () => {
  try {
    const adminEmail = 'rudrarealestate001@gmail.com';
    
    // Check if admin exists
    let admin = await prisma.user.findUnique({
      where: { email: adminEmail }
    });
    
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('rudra123', salt);
    
    if (admin) {
      console.log('✅ User found - Updating to ADMIN...');
      
      admin = await prisma.user.update({
        where: { email: adminEmail },
        data: {
          name: 'Jayraj Padhiyar',
          password: hashedPassword,
          phone: '9316040778',
          role: 'ADMIN',
          status: 'ACTIVE'
        }
      });
      
      console.log('✅ Admin updated!');
    } else {
      console.log('Creating new admin...');
      
      admin = await prisma.user.create({
        data: {
          name: 'Jayraj Padhiyar',
          email: adminEmail,
          password: hashedPassword,
          phone: '9316040778',
          role: 'ADMIN',
          status: 'ACTIVE'
        }
      });
      
      console.log('✅ Admin created!');
    }

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📧 Email: rudrarealestate001@gmail.com');
    console.log('🔑 Password: rudra123');
    console.log('👤 Role: ADMIN');
    console.log('👤 Name: Jayraj Padhiyar');
    console.log('📱 Phone: 9316040778');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
};

createAdmin();