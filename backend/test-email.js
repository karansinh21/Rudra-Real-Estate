require('dotenv').config();
const nodemailer = require('nodemailer');

const testEmail = async () => {
  console.log('📧 Testing email...');
  console.log('From:', process.env.EMAIL_USER);
  console.log('Password:', process.env.EMAIL_PASSWORD ? '***set***' : 'NOT SET');

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    }
  });

  try {
    const info = await transporter.sendMail({
      from: `"Rudra Real Estate Test" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER, // આપણે જ ને મોકલીએ test માટે
      subject: 'Email',
      html: '<h1>Email Working! ✅</h1><p>If you receive this, email is configured correctly!</p>'
    });

    console.log('✅ Email sent successfully!');
    console.log('Message ID:', info.messageId);
    console.log('Preview URL:', nodemailer.getTestMessageUrl(info));
  } catch (error) {
    console.error('❌ Email failed:', error.message);
    console.error('Full error:', error);
  }
};

testEmail();