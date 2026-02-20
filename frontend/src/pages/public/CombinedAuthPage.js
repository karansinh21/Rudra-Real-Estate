import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, User, Phone, Building2, Scale, Users, AlertCircle, CheckCircle, FileText, Apple } from 'lucide-react';
import { useAuth } from '../../utils/AuthContext';

const CombinedAuthPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [registrationType, setRegistrationType] = useState('PUBLIC');
  
  const [loginData, setLoginData] = useState({
    email: '',
    password: ''
  });
  
  const [registerData, setRegisterData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    role: 'PUBLIC',
    professionalType: 'BROKER',
    licenseNumber: '',
    experience: '',
    specialization: '',
    document: null
  });

  const handleLoginChange = (e) => {
    setLoginData({ ...loginData, [e.target.name]: e.target.value });
    if (error) setError('');
  };

  const handleRegisterChange = (e) => {
    setRegisterData({ ...registerData, [e.target.name]: e.target.value });
    if (error) setError('');
  };

  const handleFileChange = (e) => {
    setRegisterData({ ...registerData, document: e.target.files[0] });
  };

  // 🆕 Google Login
  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Google OAuth redirect URL
      const googleAuthUrl = `http://localhost:5000/api/auth/google`;
      
      // Open Google OAuth in popup
      const popup = window.open(
        googleAuthUrl,
        'Google Login',
        'width=500,height=600'
      );

      // Listen for message from popup
      window.addEventListener('message', async (event) => {
        if (event.origin !== window.location.origin) return;
        
        if (event.data.type === 'GOOGLE_AUTH_SUCCESS') {
          const { token, user } = event.data;
          localStorage.setItem('token', token);
          login(user, token);
          popup?.close();
          
          setSuccess('Login successful! Redirecting...');
          setTimeout(() => {
            navigate(user.role === 'PUBLIC' ? '/' : `/${user.role.toLowerCase()}/dashboard`);
          }, 1000);
        } else if (event.data.type === 'GOOGLE_AUTH_ERROR') {
          setError(event.data.message || 'Google login failed');
          popup?.close();
        }
      });
    } catch (err) {
      console.error('Google login error:', err);
      setError('Google login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // 🆕 Apple Login
  const handleAppleLogin = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Apple OAuth redirect URL
      const appleAuthUrl = `http://localhost:5000/api/auth/apple`;
      
      const popup = window.open(
        appleAuthUrl,
        'Apple Login',
        'width=500,height=600'
      );

      window.addEventListener('message', async (event) => {
        if (event.origin !== window.location.origin) return;
        
        if (event.data.type === 'APPLE_AUTH_SUCCESS') {
          const { token, user } = event.data;
          localStorage.setItem('token', token);
          login(user, token);
          popup?.close();
          
          setSuccess('Login successful! Redirecting...');
          setTimeout(() => {
            navigate(user.role === 'PUBLIC' ? '/' : `/${user.role.toLowerCase()}/dashboard`);
          }, 1000);
        } else if (event.data.type === 'APPLE_AUTH_ERROR') {
          setError(event.data.message || 'Apple login failed');
          popup?.close();
        }
      });
    } catch (err) {
      console.error('Apple login error:', err);
      setError('Apple login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // 🆕 Phone Number Login (OTP)
  const handlePhoneLogin = async () => {
    const phoneNumber = prompt('Enter your phone number (with country code):');
    
    if (!phoneNumber) return;
    
    try {
      setLoading(true);
      setError('');
      
      // Send OTP
      const response = await fetch('http://localhost:5000/api/auth/phone/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: phoneNumber })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to send OTP');
      }

      // Prompt for OTP
      const otp = prompt('Enter the OTP sent to your phone:');
      
      if (!otp) {
        setError('OTP is required');
        return;
      }

      // Verify OTP
      const verifyResponse = await fetch('http://localhost:5000/api/auth/phone/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: phoneNumber, otp })
      });

      const verifyData = await verifyResponse.json();

      if (!verifyResponse.ok) {
        throw new Error(verifyData.message || 'Invalid OTP');
      }

      if (verifyData.token && verifyData.user) {
        localStorage.setItem('token', verifyData.token);
        login(verifyData.user, verifyData.token);
        
        setSuccess('Login successful! Redirecting...');
        setTimeout(() => {
          navigate(verifyData.user.role === 'PUBLIC' ? '/' : `/${verifyData.user.role.toLowerCase()}/dashboard`);
        }, 1000);
      }
    } catch (err) {
      console.error('Phone login error:', err);
      setError(err.message || 'Phone login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!loginData.email || !loginData.password) {
        setError('Please fill in all fields');
        setLoading(false);
        return;
      }

      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.message || 'Login failed');
      }

      if (data.token && data.user) {
        localStorage.setItem('token', data.token);
        login(data.user, data.token);
        
        setSuccess('Login successful! Redirecting...');
        
        setTimeout(() => {
          switch (data.user.role) {
            case 'ADMIN':
              navigate('/admin/dashboard');
              break;
            case 'BROKER':
              navigate('/broker/dashboard');
              break;
            case 'LAWYER':
              navigate('/lawyer/dashboard');
              break;
            case 'PUBLIC':
            default:
              navigate('/');
              break;
          }
        }, 1000);
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!registerData.name || !registerData.email || !registerData.password) {
        setError('Please fill in all required fields');
        setLoading(false);
        return;
      }

      if (registerData.password !== registerData.confirmPassword) {
        setError('Passwords do not match');
        setLoading(false);
        return;
      }

      if (registerData.password.length < 6) {
        setError('Password must be at least 6 characters');
        setLoading(false);
        return;
      }

      if (registrationType === 'PROFESSIONAL') {
        if (!registerData.licenseNumber || !registerData.experience) {
          setError('Please fill in all professional details');
          setLoading(false);
          return;
        }
      }

      let finalRole = 'PUBLIC';
      let registrationStatus = 'ACTIVE';

      if (registrationType === 'PROFESSIONAL') {
        finalRole = registerData.professionalType;
        registrationStatus = 'PENDING';
      }

      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: registerData.name,
          email: registerData.email,
          password: registerData.password,
          phone: registerData.phone,
          role: finalRole,
          status: registrationStatus,
          professionalDetails: registrationType === 'PROFESSIONAL' ? {
            licenseNumber: registerData.licenseNumber,
            experience: registerData.experience,
            specialization: registerData.specialization
          } : null
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.message || 'Registration failed');
      }

      if (registrationType === 'PROFESSIONAL') {
        setSuccess('Registration submitted! Your account will be activated after admin verification.');
        setTimeout(() => {
          setIsLogin(true);
          setRegistrationType('PUBLIC');
          setRegisterData({
            name: '',
            email: '',
            password: '',
            confirmPassword: '',
            phone: '',
            role: 'PUBLIC',
            professionalType: 'BROKER',
            licenseNumber: '',
            experience: '',
            specialization: '',
            document: null
          });
          setSuccess('');
        }, 4000);
      } else {
        setSuccess('Registration successful! Redirecting to login...');
        setTimeout(() => {
          setIsLogin(true);
          setLoginData({ email: registerData.email, password: '' });
          setSuccess('');
        }, 2000);
      }
    } catch (err) {
      console.error('Registration error:', err);
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-5xl w-full">
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          <div className="grid md:grid-cols-2">
            {/* Left Side - Branding */}
            <div className="bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 p-12 text-white flex flex-col justify-center">
              <div className="mb-8">
                <h1 className="text-4xl font-bold mb-4">Rudra Real Estate</h1>
                <p className="text-blue-100 text-lg">Your trusted partner in property solutions</p>
              </div>
              
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="bg-white/20 p-3 rounded-lg">
                    <Building2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Wide Property Selection</h3>
                    <p className="text-sm text-blue-100">Browse thousands of verified properties</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="bg-white/20 p-3 rounded-lg">
                    <Scale className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Legal Support</h3>
                    <p className="text-sm text-blue-100">Expert legal consultation available</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="bg-white/20 p-3 rounded-lg">
                    <Users className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Verified Professionals</h3>
                    <p className="text-sm text-blue-100">Connect with trusted brokers & lawyers</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Side - Forms */}
            <div className="p-12">
              {/* Toggle Buttons */}
              <div className="flex bg-gray-100 rounded-xl p-1 mb-8">
                <button
                  onClick={() => {
                    setIsLogin(true);
                    setError('');
                    setSuccess('');
                  }}
                  className={`flex-1 py-3 rounded-lg font-semibold transition-all ${
                    isLogin
                      ? 'bg-white text-blue-600 shadow-md'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Sign In
                </button>
                <button
                  onClick={() => {
                    setIsLogin(false);
                    setError('');
                    setSuccess('');
                  }}
                  className={`flex-1 py-3 rounded-lg font-semibold transition-all ${
                    !isLogin
                      ? 'bg-white text-blue-600 shadow-md'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Sign Up
                </button>
              </div>

              {/* Success Message */}
              {success && (
                <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-green-800 font-medium">{success}</p>
                </div>
              )}

              {/* Error Message */}
              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-800 font-medium">{error}</p>
                </div>
              )}

              {/* Login Form */}
              {isLogin ? (
                <div>
                  {/* 🆕 Social Login Buttons */}
                  <div className="space-y-3 mb-6">
                    <button
                      onClick={handleGoogleLogin}
                      disabled={loading}
                      className="w-full flex items-center justify-center gap-3 px-4 py-3 border-2 border-gray-300 rounded-xl hover:bg-gray-50 transition-colors font-semibold text-gray-700 disabled:opacity-50"
                    >
                      <svg className="w-5 h-5" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                      </svg>
                      Continue with Google
                    </button>

                    <button
                      onClick={handleAppleLogin}
                      disabled={loading}
                      className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-black text-white rounded-xl hover:bg-gray-900 transition-colors font-semibold disabled:opacity-50"
                    >
                      <Apple className="w-5 h-5" />
                      Continue with Apple
                    </button>

                    <button
                      onClick={handlePhoneLogin}
                      disabled={loading}
                      className="w-full flex items-center justify-center gap-3 px-4 py-3 border-2 border-green-500 text-green-700 rounded-xl hover:bg-green-50 transition-colors font-semibold disabled:opacity-50"
                    >
                      <Phone className="w-5 h-5" />
                      Continue with Phone
                    </button>
                  </div>

                  {/* Divider */}
                  <div className="relative mb-6">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-300"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-4 bg-white text-gray-500 font-medium">Or continue with email</span>
                    </div>
                  </div>

                  <form onSubmit={handleLoginSubmit} className="space-y-5">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Email Address
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                          type="email"
                          name="email"
                          value={loginData.email}
                          onChange={handleLoginChange}
                          placeholder="Enter your email"
                          className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Password
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          name="password"
                          value={loginData.password}
                          onChange={handleLoginChange}
                          placeholder="Enter your password"
                          className="w-full pl-11 pr-12 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transform hover:scale-105 transition-all duration-300 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? 'Signing in...' : 'Sign In'}
                    </button>
                  </form>
                </div>
              ) : (
                // Register Form
                <form onSubmit={handleRegisterSubmit} className="space-y-5 max-h-96 overflow-y-auto pr-2">
                  {/* Registration Type Selection */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Register As *
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          setRegistrationType('PUBLIC');
                          setRegisterData({ ...registerData, role: 'PUBLIC' });
                        }}
                        className={`p-4 rounded-xl border-2 transition-all ${
                          registrationType === 'PUBLIC'
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <Users className={`w-6 h-6 mx-auto mb-2 ${
                          registrationType === 'PUBLIC' ? 'text-blue-600' : 'text-gray-400'
                        }`} />
                        <p className={`text-sm font-semibold ${
                          registrationType === 'PUBLIC' ? 'text-blue-700' : 'text-gray-600'
                        }`}>
                          Property Seeker
                        </p>
                        <p className="text-xs text-gray-500 mt-1">Instant Access</p>
                      </button>

                      <button
                        type="button"
                        onClick={() => setRegistrationType('PROFESSIONAL')}
                        className={`p-4 rounded-xl border-2 transition-all ${
                          registrationType === 'PROFESSIONAL'
                            ? 'border-purple-500 bg-purple-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <Building2 className={`w-6 h-6 mx-auto mb-2 ${
                          registrationType === 'PROFESSIONAL' ? 'text-purple-600' : 'text-gray-400'
                        }`} />
                        <p className={`text-sm font-semibold ${
                          registrationType === 'PROFESSIONAL' ? 'text-purple-700' : 'text-gray-600'
                        }`}>
                          Professional
                        </p>
                        <p className="text-xs text-gray-500 mt-1">Needs Approval</p>
                      </button>
                    </div>
                  </div>

                  {registrationType === 'PROFESSIONAL' && (
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3">
                        Professional Type *
                      </label>
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          type="button"
                          onClick={() => setRegisterData({ ...registerData, professionalType: 'BROKER' })}
                          className={`p-3 rounded-xl border-2 transition-all ${
                            registerData.professionalType === 'BROKER'
                              ? 'border-green-500 bg-green-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <Building2 className={`w-5 h-5 mx-auto mb-1 ${
                            registerData.professionalType === 'BROKER' ? 'text-green-600' : 'text-gray-400'
                          }`} />
                          <p className={`text-xs font-semibold ${
                            registerData.professionalType === 'BROKER' ? 'text-green-700' : 'text-gray-600'
                          }`}>
                            Broker
                          </p>
                        </button>

                        <button
                          type="button"
                          onClick={() => setRegisterData({ ...registerData, professionalType: 'LAWYER' })}
                          className={`p-3 rounded-xl border-2 transition-all ${
                            registerData.professionalType === 'LAWYER'
                              ? 'border-purple-500 bg-purple-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <Scale className={`w-5 h-5 mx-auto mb-1 ${
                            registerData.professionalType === 'LAWYER' ? 'text-purple-600' : 'text-gray-400'
                          }`} />
                          <p className={`text-xs font-semibold ${
                            registerData.professionalType === 'LAWYER' ? 'text-purple-700' : 'text-gray-600'
                          }`}>
                            Lawyer
                          </p>
                        </button>
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Full Name *
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="text"
                        name="name"
                        value={registerData.name}
                        onChange={handleRegisterChange}
                        placeholder="Enter your full name"
                        className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Email Address *
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="email"
                        name="email"
                        value={registerData.email}
                        onChange={handleRegisterChange}
                        placeholder="Enter your email"
                        className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Phone Number {registrationType === 'PROFESSIONAL' ? '*' : '(Optional)'}
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="tel"
                        name="phone"
                        value={registerData.phone}
                        onChange={handleRegisterChange}
                        placeholder="Enter your phone number"
                        className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required={registrationType === 'PROFESSIONAL'}
                      />
                    </div>
                  </div>

                  {registrationType === 'PROFESSIONAL' && (
                    <>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          License/Registration Number *
                        </label>
                        <div className="relative">
                          <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                          <input
                            type="text"
                            name="licenseNumber"
                            value={registerData.licenseNumber}
                            onChange={handleRegisterChange}
                            placeholder="Enter license number"
                            className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Years of Experience *
                        </label>
                        <input
                          type="number"
                          name="experience"
                          value={registerData.experience}
                          onChange={handleRegisterChange}
                          placeholder="Enter years of experience"
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Specialization (Optional)
                        </label>
                        <input
                          type="text"
                          name="specialization"
                          value={registerData.specialization}
                          onChange={handleRegisterChange}
                          placeholder="e.g., Residential, Commercial, Property Law"
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    </>
                  )}

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Password *
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        name="password"
                        value={registerData.password}
                        onChange={handleRegisterChange}
                        placeholder="Create a password"
                        className="w-full pl-11 pr-12 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Confirm Password *
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        name="confirmPassword"
                        value={registerData.confirmPassword}
                        onChange={handleRegisterChange}
                        placeholder="Confirm your password"
                        className="w-full pl-11 pr-12 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  {registrationType === 'PROFESSIONAL' && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                      <p className="text-sm text-yellow-800">
                        <strong>Note:</strong> Professional accounts require admin verification.
                      </p>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transform hover:scale-105 transition-all duration-300 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Creating Account...' : registrationType === 'PROFESSIONAL' ? 'Submit for Approval' : 'Create Account'}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CombinedAuthPage;