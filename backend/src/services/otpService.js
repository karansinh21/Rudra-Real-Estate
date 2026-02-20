// In-memory OTP storage (for development)
const otpStorage = new Map();

// Generate OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Store OTP
const storeOTP = (phone, otp) => {
  const expiryTime = Date.now() + 10 * 60 * 1000; // 10 minutes
  otpStorage.set(phone, { otp, expiryTime });
  console.log(`🔐 OTP stored for ${phone}: ${otp}`);
};

// Verify OTP
const verifyOTP = (phone, otp) => {
  const stored = otpStorage.get(phone);
  
  if (!stored) {
    return { success: false, message: 'OTP not found' };
  }

  if (Date.now() > stored.expiryTime) {
    otpStorage.delete(phone);
    return { success: false, message: 'OTP expired' };
  }

  if (stored.otp !== otp) {
    return { success: false, message: 'Invalid OTP' };
  }

  otpStorage.delete(phone);
  return { success: true, message: 'OTP verified successfully' };
};

module.exports = {
  generateOTP,
  storeOTP,
  verifyOTP
};