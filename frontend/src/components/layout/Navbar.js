import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../utils/AuthContext';
import { useLanguage } from '../../utils/LanguageContext';
import { 
  Home, Building2, FileText, Users, LogOut, Menu, X, 
  Scale, MapPin, Heart, Calendar, Calculator, Building,
  PlusCircle, ClipboardList, Briefcase, Globe
} from 'lucide-react';

const navText = {
  en: {
    home: 'Home', properties: 'Properties', lawyers: 'Lawyers', land: 'Land',
    wishlist: 'Wishlist', tours: 'Tours', calculator: 'Calculator',
    dashboard: 'Dashboard', myAccount: 'My Account', admin: 'Admin',
    signIn: 'Sign In', getStarted: 'Get Started', logout: 'Logout',
    myProperties: 'My Properties', addProperty: 'Add Property',
    enquiries: 'Enquiries', myServices: 'My Services',
    brokerMenu: 'Broker Menu', lawyerMenu: 'Lawyer Menu',
    browseProperties: 'Browse Properties', findLawyers: 'Find Lawyers',
    browseLand: 'Browse Land', myWishlist: 'My Wishlist',
    scheduleTour: 'Schedule Tour', calculators: 'Calculators', adminPanel: 'Admin Panel'
  },
  gu: {
    home: 'હોમ', properties: 'પ્રોપર્ટી', lawyers: 'વકીલો', land: 'જમીન',
    wishlist: 'વિશલિસ્ટ', tours: 'ટૂર', calculator: 'કેલ્ક્યુલેટર',
    dashboard: 'ડેશબોર્ડ', myAccount: 'મારું ખાતું', admin: 'એડમિન',
    signIn: 'સાઇન ઇન', getStarted: 'શરૂ કરો', logout: 'લોગઆઉટ',
    myProperties: 'મારી પ્રોપર્ટી', addProperty: 'પ્રોપર્ટી ઉમેરો',
    enquiries: 'પૂછપરછ', myServices: 'મારી સેવાઓ',
    brokerMenu: 'બ્રોકર મેનૂ', lawyerMenu: 'વકીલ મેનૂ',
    browseProperties: 'પ્રોપર્ટી જુઓ', findLawyers: 'વકીલ શોધો',
    browseLand: 'જમીન જુઓ', myWishlist: 'મારી વિશલિસ્ટ',
    scheduleTour: 'ટૂર ગોઠવો', calculators: 'કેલ્ક્યુલેટર', adminPanel: 'એડમિન પેનલ'
  },
  hi: {
    home: 'होम', properties: 'प्रॉपर्टी', lawyers: 'वकील', land: 'जमीन',
    wishlist: 'विशलिस्ट', tours: 'टूर', calculator: 'कैलकुलेटर',
    dashboard: 'डैशबोर्ड', myAccount: 'मेरा खाता', admin: 'एडमिन',
    signIn: 'साइन इन', getStarted: 'शुरू करें', logout: 'लॉगआउट',
    myProperties: 'मेरी प्रॉपर्टी', addProperty: 'प्रॉपर्टी जोड़ें',
    enquiries: 'पूछताछ', myServices: 'मेरी सेवाएं',
    brokerMenu: 'ब्रोकर मेनू', lawyerMenu: 'वकील मेनू',
    browseProperties: 'प्रॉपर्टी देखें', findLawyers: 'वकील खोजें',
    browseLand: 'जमीन देखें', myWishlist: 'मेरी विशलिस्ट',
    scheduleTour: 'टूर शेड्यूल', calculators: 'कैलकुलेटर', adminPanel: 'एडमिन पैनल'
  }
};

const Navbar = () => {
  const { user, logout } = useAuth();
  const { language, changeLanguage } = useLanguage();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLangOpen, setIsLangOpen] = useState(false);

  const t = (key) => navText[language]?.[key] || navText['en'][key];

  const handleLogout = () => {
    logout();
    navigate('/auth');
  };

  const getDashboardLink = () => {
    if (user?.role === 'ADMIN') return '/admin/dashboard';
    if (user?.role === 'BROKER') return '/broker/dashboard';
    if (user?.role === 'LAWYER') return '/lawyer/dashboard';
    if (user?.role === 'PUBLIC') return '/dashboard';
    return '/';
  };

  const languages = [
    { code: 'en', label: 'English', short: 'EN' },
    { code: 'gu', label: 'ગુજરાતી', short: 'ગુ' },
    { code: 'hi', label: 'हिंदी', short: 'हि' },
  ];

  const LangSwitcher = () => (
    <div className="relative">
      <button
        onClick={() => setIsLangOpen(!isLangOpen)}
        className="flex items-center space-x-1 px-3 py-2 rounded-md text-gray-700 hover:text-blue-600 hover:bg-blue-50 transition-colors"
      >
        <Globe className="h-4 w-4" />
        <span className="text-sm font-medium">{languages.find(l => l.code === language)?.short}</span>
      </button>
      {isLangOpen && (
        <div className="absolute right-0 mt-1 w-36 bg-white rounded-xl shadow-lg border border-gray-100 z-50 overflow-hidden">
          {languages.map(lang => (
            <button
              key={lang.code}
              onClick={() => { changeLanguage(lang.code); setIsLangOpen(false); }}
              className={`w-full text-left px-4 py-2 text-sm flex items-center justify-between hover:bg-blue-50 transition-colors ${
                language === lang.code ? 'bg-blue-50 text-blue-600 font-semibold' : 'text-gray-700'
              }`}
            >
              <span>{lang.label}</span>
              {language === lang.code && <span>✓</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <Building2 className="h-8 w-8 text-blue-600" />
              <span className="text-xl font-bold text-gray-900">Rudra Real Estate</span>
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden lg:flex items-center space-x-4">
            <Link to="/" className="text-gray-700 hover:text-blue-600 flex items-center space-x-1 px-3 py-2 rounded-md transition-colors">
              <Home className="h-5 w-5" /><span>{t('home')}</span>
            </Link>
            <Link to="/glass-cards" className="text-gray-700 hover:text-blue-600 flex items-center space-x-1 px-3 py-2 rounded-md transition-colors">
              <Building className="h-5 w-5" /><span>{t('properties')}</span>
            </Link>
            <Link to="/lawyers" className="text-gray-700 hover:text-blue-600 flex items-center space-x-1 px-3 py-2 rounded-md transition-colors">
              <Scale className="h-5 w-5" /><span>{t('lawyers')}</span>
            </Link>
            <Link to="/land-listings" className="text-gray-700 hover:text-blue-600 flex items-center space-x-1 px-3 py-2 rounded-md transition-colors">
              <MapPin className="h-5 w-5" /><span>{t('land')}</span>
            </Link>

            {user && (
              <>
                <Link to="/wishlist" className="text-gray-700 hover:text-blue-600 flex items-center space-x-1 px-3 py-2 rounded-md transition-colors">
                  <Heart className="h-5 w-5" /><span>{t('wishlist')}</span>
                </Link>
                <Link to="/schedule-tour" className="text-gray-700 hover:text-blue-600 flex items-center space-x-1 px-3 py-2 rounded-md transition-colors">
                  <Calendar className="h-5 w-5" /><span>{t('tours')}</span>
                </Link>
                <Link to="/calculators" className="text-gray-700 hover:text-blue-600 flex items-center space-x-1 px-3 py-2 rounded-md transition-colors">
                  <Calculator className="h-5 w-5" /><span>{t('calculator')}</span>
                </Link>
                <Link to={getDashboardLink()} className="text-gray-700 hover:text-blue-600 flex items-center space-x-1 px-3 py-2 rounded-md transition-colors">
                  <FileText className="h-5 w-5" /><span>{user.role === 'PUBLIC' ? t('myAccount') : t('dashboard')}</span>
                </Link>

                {user.role === 'BROKER' && (
                  <>
                    <Link to="/broker/properties" className="text-gray-700 hover:text-blue-600 flex items-center space-x-1 px-3 py-2 rounded-md transition-colors">
                      <Briefcase className="h-5 w-5" /><span>{t('myProperties')}</span>
                    </Link>
                    <Link to="/broker/properties/add" className="text-gray-700 hover:text-blue-600 flex items-center space-x-1 px-3 py-2 rounded-md transition-colors">
                      <PlusCircle className="h-5 w-5" /><span>{t('addProperty')}</span>
                    </Link>
                    <Link to="/broker/enquiries" className="text-gray-700 hover:text-blue-600 flex items-center space-x-1 px-3 py-2 rounded-md transition-colors">
                      <ClipboardList className="h-5 w-5" /><span>{t('enquiries')}</span>
                    </Link>
                  </>
                )}

                {user.role === 'LAWYER' && (
                  <Link to="/lawyer/settings" className="text-gray-700 hover:text-blue-600 flex items-center space-x-1 px-3 py-2 rounded-md transition-colors">
                    <ClipboardList className="h-5 w-5" /><span>{t('myServices')}</span>
                  </Link>
                )}

                {user.role === 'ADMIN' && (
                  <Link to="/admin/panel" className="text-gray-700 hover:text-blue-600 flex items-center space-x-1 px-3 py-2 rounded-md transition-colors">
                    <Users className="h-5 w-5" /><span>{t('admin')}</span>
                  </Link>
                )}

                <div className="flex items-center space-x-2 pl-3 border-l border-gray-300">
                  <LangSwitcher />
                  {user.role === 'BROKER' ? (
                    <Link to="/profile" className="text-sm text-gray-600 hover:text-blue-600 transition-colors">{user.name}</Link>
                  ) : (
                    <span className="text-sm text-gray-600">{user.name}</span>
                  )}
                  <button onClick={handleLogout} className="flex items-center space-x-1 text-red-600 hover:text-red-700 px-3 py-2 rounded-md transition-colors">
                    <LogOut className="h-5 w-5" /><span>{t('logout')}</span>
                  </button>
                </div>
              </>
            )}

            {!user && (
              <div className="flex items-center space-x-3">
                <LangSwitcher />
                <Link to="/auth" className="text-blue-600 px-4 py-2 rounded-md hover:bg-blue-50 transition-colors font-semibold">{t('signIn')}</Link>
                <Link to="/auth" className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors">{t('getStarted')}</Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="lg:hidden flex items-center space-x-2">
            <LangSwitcher />
            <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-gray-700 hover:text-blue-600 p-2">
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden border-t border-gray-200 bg-white">
          <div className="px-2 pt-2 pb-3 space-y-1 max-h-screen overflow-y-auto">
            <Link to="/" className="block px-3 py-2 text-gray-700 hover:bg-blue-50 rounded-md" onClick={() => setIsMobileMenuOpen(false)}>
              <div className="flex items-center space-x-2"><Home className="h-5 w-5" /><span>{t('home')}</span></div>
            </Link>
            <Link to="/glass-cards" className="block px-3 py-2 text-gray-700 hover:bg-blue-50 rounded-md" onClick={() => setIsMobileMenuOpen(false)}>
              <div className="flex items-center space-x-2"><Building className="h-5 w-5" /><span>{t('browseProperties')}</span></div>
            </Link>
            <Link to="/lawyers" className="block px-3 py-2 text-gray-700 hover:bg-blue-50 rounded-md" onClick={() => setIsMobileMenuOpen(false)}>
              <div className="flex items-center space-x-2"><Scale className="h-5 w-5" /><span>{t('findLawyers')}</span></div>
            </Link>
            <Link to="/land-listings" className="block px-3 py-2 text-gray-700 hover:bg-blue-50 rounded-md" onClick={() => setIsMobileMenuOpen(false)}>
              <div className="flex items-center space-x-2"><MapPin className="h-5 w-5" /><span>{t('browseLand')}</span></div>
            </Link>

            {user && (
              <>
                <div className="border-t border-gray-200 my-2"></div>
                <Link to="/wishlist" className="block px-3 py-2 text-gray-700 hover:bg-blue-50 rounded-md" onClick={() => setIsMobileMenuOpen(false)}>
                  <div className="flex items-center space-x-2"><Heart className="h-5 w-5" /><span>{t('myWishlist')}</span></div>
                </Link>
                <Link to="/schedule-tour" className="block px-3 py-2 text-gray-700 hover:bg-blue-50 rounded-md" onClick={() => setIsMobileMenuOpen(false)}>
                  <div className="flex items-center space-x-2"><Calendar className="h-5 w-5" /><span>{t('scheduleTour')}</span></div>
                </Link>
                <Link to="/calculators" className="block px-3 py-2 text-gray-700 hover:bg-blue-50 rounded-md" onClick={() => setIsMobileMenuOpen(false)}>
                  <div className="flex items-center space-x-2"><Calculator className="h-5 w-5" /><span>{t('calculators')}</span></div>
                </Link>
                <Link to={getDashboardLink()} className="block px-3 py-2 text-gray-700 hover:bg-blue-50 rounded-md" onClick={() => setIsMobileMenuOpen(false)}>
                  <div className="flex items-center space-x-2"><FileText className="h-5 w-5" /><span>{user.role === 'PUBLIC' ? t('myAccount') : t('dashboard')}</span></div>
                </Link>

                {user.role === 'BROKER' && (
                  <>
                    <div className="border-t border-gray-200 my-2"></div>
                    <div className="px-3 py-1 text-xs text-gray-400 uppercase font-semibold">{t('brokerMenu')}</div>
                    <Link to="/broker/properties" className="block px-3 py-2 text-gray-700 hover:bg-blue-50 rounded-md" onClick={() => setIsMobileMenuOpen(false)}>
                      <div className="flex items-center space-x-2"><Briefcase className="h-5 w-5" /><span>{t('myProperties')}</span></div>
                    </Link>
                    <Link to="/broker/properties/add" className="block px-3 py-2 text-gray-700 hover:bg-blue-50 rounded-md" onClick={() => setIsMobileMenuOpen(false)}>
                      <div className="flex items-center space-x-2"><PlusCircle className="h-5 w-5" /><span>{t('addProperty')}</span></div>
                    </Link>
                    <Link to="/broker/enquiries" className="block px-3 py-2 text-gray-700 hover:bg-blue-50 rounded-md" onClick={() => setIsMobileMenuOpen(false)}>
                      <div className="flex items-center space-x-2"><ClipboardList className="h-5 w-5" /><span>{t('enquiries')}</span></div>
                    </Link>
                  </>
                )}

                {user.role === 'LAWYER' && (
                  <>
                    <div className="border-t border-gray-200 my-2"></div>
                    <div className="px-3 py-1 text-xs text-gray-400 uppercase font-semibold">{t('lawyerMenu')}</div>
                    <Link to="/lawyer/settings" className="block px-3 py-2 text-gray-700 hover:bg-blue-50 rounded-md" onClick={() => setIsMobileMenuOpen(false)}>
                      <div className="flex items-center space-x-2"><ClipboardList className="h-5 w-5" /><span>{t('myServices')}</span></div>
                    </Link>
                  </>
                )}

                {user.role === 'ADMIN' && (
                  <Link to="/admin/panel" className="block px-3 py-2 text-gray-700 hover:bg-blue-50 rounded-md" onClick={() => setIsMobileMenuOpen(false)}>
                    <div className="flex items-center space-x-2"><Users className="h-5 w-5" /><span>{t('adminPanel')}</span></div>
                  </Link>
                )}

                <div className="border-t border-gray-200 my-2"></div>
                {user.role === 'BROKER' ? (
                  <Link to="/profile" className="block px-3 py-2 text-gray-700 hover:bg-blue-50 rounded-md" onClick={() => setIsMobileMenuOpen(false)}>
                    <div className="flex items-center space-x-2"><Users className="h-5 w-5" /><span>{user.name}</span></div>
                  </Link>
                ) : (
                  <div className="px-3 py-2 text-gray-600 text-sm">
                    <div className="flex items-center space-x-2"><Users className="h-5 w-5" /><span>{user.name}</span></div>
                  </div>
                )}

                <button onClick={() => { handleLogout(); setIsMobileMenuOpen(false); }} className="w-full text-left px-3 py-2 text-red-600 hover:bg-red-50 rounded-md">
                  <div className="flex items-center space-x-2"><LogOut className="h-5 w-5" /><span>{t('logout')}</span></div>
                </button>
              </>
            )}

            {!user && (
              <>
                <div className="border-t border-gray-200 my-2"></div>
                <Link to="/auth" className="block px-3 py-2 bg-blue-50 text-blue-600 rounded-md text-center font-semibold" onClick={() => setIsMobileMenuOpen(false)}>{t('signIn')}</Link>
                <Link to="/auth" className="block px-3 py-2 bg-blue-600 text-white rounded-md text-center" onClick={() => setIsMobileMenuOpen(false)}>{t('getStarted')}</Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;