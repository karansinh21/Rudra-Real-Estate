const axios = require('axios');

// Configuration
const FAST2SMS_API_KEY = process.env.FAST2SMS_API_KEY;
const SMS_ENABLED = process.env.SMS_ENABLED === 'true';
const NODE_ENV = process.env.NODE_ENV;

// Initialize logs
console.log('');
console.log('╔════════════════════════════════════════════════╗');
console.log('║   📱 SMS SERVICE INITIALIZED                   ║');
console.log('╠════════════════════════════════════════════════╣');
console.log('║ Environment:', NODE_ENV === 'production' ? 'PRODUCTION ✅' : 'DEVELOPMENT ⚠️');
console.log('║ API Key:', FAST2SMS_API_KEY ? 'Configured ✅  ' : 'Missing ❌     ');
console.log('║ SMS Enabled:', SMS_ENABLED ? 'YES ✅         ' : 'NO (Testing) ⚠️');
console.log('╚════════════════════════════════════════════════╝');
console.log('');

// Send SMS function
const sendSMS = async (phoneNumber, message) => {
  try {
    console.log('');
    console.log('═══════════════════════════════════════');
    console.log('📱 SMS REQUEST');
    console.log('═══════════════════════════════════════');
    console.log('📞 Phone:', phoneNumber);
    console.log('📝 Message:', message.substring(0, 60) + '...');
    
    // Validate phone number
    const cleanPhone = phoneNumber.replace(/\D/g, '');
    
    if (cleanPhone.length !== 10) {
      console.error('❌ Invalid phone number!');
      return { success: false, error: 'Invalid phone number' };
    }

    // ⚠️ TESTING MODE - Skip real SMS
    if (!SMS_ENABLED) {
      console.log('⚠️  SMS DISABLED (Testing Mode)');
      console.log('✅ SMS logged in console only');
      console.log('💡 To enable: Set SMS_ENABLED=true in .env');
      console.log('═══════════════════════════════════════');
      return {
        success: true,
        data: { 
          mode: 'testing',
          message: 'SMS not sent - testing mode'
        }
      };
    }

    // ✅ PRODUCTION MODE - Send real SMS
    console.log('🚀 Sending real SMS via Fast2SMS...');
    
    if (!FAST2SMS_API_KEY) {
      console.error('❌ API Key missing!');
      return { success: false, error: 'API key not configured' };
    }

    const url = 'https://www.fast2sms.com/dev/bulkV2';
    
    const params = {
      route: 'q',
      sender_id: 'FSTSMS',
      message: message,
      language: 'english',
      flash: 0,
      numbers: cleanPhone
    };

    const response = await axios.get(url, {
      params,
      headers: {
        'authorization': FAST2SMS_API_KEY
      },
      timeout: 10000 // 10 second timeout
    });

    console.log('📊 Response:', response.data);

    if (response.data && response.data.return === true) {
      console.log('✅ SMS SENT SUCCESSFULLY! 🎉');
      console.log('📱 Request ID:', response.data.request_id || 'N/A');
    } else {
      console.log('⚠️  Unexpected response:', response.data.message);
    }

    console.log('═══════════════════════════════════════');

    return {
      success: response.data.return === true,
      data: response.data
    };

  } catch (error) {
    console.log('❌ SMS FAILED!');
    console.error('Error:', error.message);
    
    if (error.response) {
      console.error('API Error:', error.response.data);
    }
    
    console.log('═══════════════════════════════════════');

    return {
      success: false,
      error: error.message,
      details: error.response?.data
    };
  }
};

// Send Welcome SMS
const sendWelcomeSMS = async (name, phone) => {
  const message = `Welcome to Rudra Real Estate, ${name}! Your account is now active. Start exploring properties today!`;
  return await sendSMS(phone, message);
};

// Send OTP SMS
const sendOTPSMS = async (phone, otp) => {
  const message = `Your OTP for Rudra Real Estate is: ${otp}. Valid for 10 minutes. Do not share this code with anyone.`;
  return await sendSMS(phone, message);
};

// Send Enquiry Confirmation
const sendEnquiryConfirmationSMS = async (clientName, clientPhone, propertyTitle) => {
  const message = `Hi ${clientName}, Thank you for your enquiry about "${propertyTitle}". Our team will contact you soon. - Rudra Real Estate`;
  return await sendSMS(clientPhone, message);
};

// Send Broker Alert
const sendNewEnquiryAlertSMS = async (brokerName, brokerPhone, clientName, propertyTitle) => {
  const message = `New enquiry! ${clientName} is interested in "${propertyTitle}". Contact them ASAP. - Rudra Real Estate`;
  return await sendSMS(brokerPhone, message);
};

module.exports = {
  sendSMS,
  sendWelcomeSMS,
  sendOTPSMS,
  sendEnquiryConfirmationSMS,
  sendNewEnquiryAlertSMS
};