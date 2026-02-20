import React, { createContext, useState, useContext } from 'react';

const LanguageContext = createContext();

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used within LanguageProvider');
  return context;
};

// ✅ Badha translations yahan che
export const translations = {
  en: {
    // Navbar
    home: 'Home',
    properties: 'Properties',
    lawyers: 'Lawyers',
    land: 'Land',
    wishlist: 'Wishlist',
    tours: 'Tours',
    calculator: 'Calculator',
    dashboard: 'Dashboard',
    myAccount: 'My Account',
    admin: 'Admin',
    signIn: 'Sign In',
    getStarted: 'Get Started',
    logout: 'Logout',
    myProperties: 'My Properties',
    addProperty: 'Add Property',
    enquiries: 'Enquiries',
    myServices: 'My Services',

    // Home Page
    heroTitle: 'Find Your Dream Property',
    heroSubtitle: 'Discover the best properties across Gujarat with Rudra Real Estate',
    searchPlaceholder: 'Search properties...',
    browseProperties: 'Browse Properties',
    bookConsultation: 'Book Consultation',

    // Property
    forSale: 'For Sale',
    forRent: 'For Rent',
    bedrooms: 'Bedrooms',
    bathrooms: 'Bathrooms',
    area: 'Area',
    price: 'Price',
    viewDetails: 'View Details',
    addToWishlist: 'Add to Wishlist',
    contactBroker: 'Contact Broker',
    scheduleVisit: 'Schedule Visit',

    // Auth
    login: 'Login',
    register: 'Register',
    email: 'Email',
    password: 'Password',
    name: 'Full Name',
    phone: 'Phone Number',
    loginTitle: 'Welcome Back!',
    registerTitle: 'Create Account',
    alreadyAccount: 'Already have an account?',
    noAccount: "Don't have an account?",

    // Chat
    chatTitle: 'Rudra Assistant',
    chatSubtitle: 'Online • Ready to help',
    chatPlaceholder: 'Type your message...',
    chatWelcome: 'Hello! 👋 Welcome to Rudra Real Estate. How can I help you today?',
    quickReplies: ['Show Properties', 'Book Viewing', 'Contact Broker', 'Legal Help'],

    // Common
    loading: 'Loading...',
    save: 'Save',
    cancel: 'Cancel',
    delete: 'Delete',
    edit: 'Edit',
    submit: 'Submit',
    back: 'Back',
    next: 'Next',
    close: 'Close',
  },

  gu: {
    // Navbar
    home: 'હોમ',
    properties: 'પ્રોપર્ટી',
    lawyers: 'વકીલો',
    land: 'જમીન',
    wishlist: 'વિશલિસ્ટ',
    tours: 'ટૂર',
    calculator: 'કેલ્ક્યુલેટર',
    dashboard: 'ડેશબોર્ડ',
    myAccount: 'મારું ખાતું',
    admin: 'એડમિન',
    signIn: 'સાઇન ઇન',
    getStarted: 'શરૂ કરો',
    logout: 'લોગઆઉટ',
    myProperties: 'મારી પ્રોપર્ટી',
    addProperty: 'પ્રોપર્ટી ઉમેરો',
    enquiries: 'પૂછપરછ',
    myServices: 'મારી સેવાઓ',

    // Home Page
    heroTitle: 'તમારી સ્વપ્ન પ્રોપર્ટી શોધો',
    heroSubtitle: 'રુદ્ર રિયલ એસ્ટેટ સાથે ગુજરાત ભરમાં શ્રેષ્ઠ પ્રોપર્ટી શોધો',
    searchPlaceholder: 'પ્રોપર્ટી શોધો...',
    browseProperties: 'પ્રોપર્ટી જુઓ',
    bookConsultation: 'સલાહ બુક કરો',

    // Property
    forSale: 'વેચાણ માટે',
    forRent: 'ભાડે',
    bedrooms: 'બેડરૂમ',
    bathrooms: 'બાથરૂમ',
    area: 'વિસ્તાર',
    price: 'કિંમત',
    viewDetails: 'વિગત જુઓ',
    addToWishlist: 'વિશલિસ્ટમાં ઉમેરો',
    contactBroker: 'બ્રોકરનો સંપર્ક',
    scheduleVisit: 'મુલાકાત નક્કી કરો',

    // Auth
    login: 'લોગિન',
    register: 'નોંધણી',
    email: 'ઇમેઇલ',
    password: 'પાસવર્ડ',
    name: 'પૂરું નામ',
    phone: 'ફોન નંબર',
    loginTitle: 'પાછા આવ્યા!',
    registerTitle: 'ખાતું બનાવો',
    alreadyAccount: 'પહેલેથી ખાતું છે?',
    noAccount: 'ખાતું નથી?',

    // Chat
    chatTitle: 'રુદ્ર સહાયક',
    chatSubtitle: 'ઓનલાઇન • મદદ માટે તૈયાર',
    chatPlaceholder: 'તમારો સંદેશ લખો...',
    chatWelcome: 'નમસ્તે! 👋 રુદ્ર રિયલ એસ્ટેટમાં આપનું સ્વાગત છે. હું કેવી રીતે મદદ કરી શકું?',
    quickReplies: ['પ્રોપર્ટી જુઓ', 'મુલાકાત બુક', 'બ્રોકર સંપર્ક', 'કાનૂની મદદ'],

    // Common
    loading: 'લોડ થઈ રહ્યું છે...',
    save: 'સેવ કરો',
    cancel: 'રદ કરો',
    delete: 'ડિલીટ',
    edit: 'સંપાદિત',
    submit: 'સબમિટ',
    back: 'પાછા',
    next: 'આગળ',
    close: 'બંધ',
  },

  hi: {
    // Navbar
    home: 'होम',
    properties: 'प्रॉपर्टी',
    lawyers: 'वकील',
    land: 'जमीन',
    wishlist: 'विशलिस्ट',
    tours: 'टूर',
    calculator: 'कैलकुलेटर',
    dashboard: 'डैशबोर्ड',
    myAccount: 'मेरा खाता',
    admin: 'एडमिन',
    signIn: 'साइन इन',
    getStarted: 'शुरू करें',
    logout: 'लॉगआउट',
    myProperties: 'मेरी प्रॉपर्टी',
    addProperty: 'प्रॉपर्टी जोड़ें',
    enquiries: 'पूछताछ',
    myServices: 'मेरी सेवाएं',

    // Home Page
    heroTitle: 'अपनी सपनों की प्रॉपर्टी खोजें',
    heroSubtitle: 'रुद्र रियल एस्टेट के साथ गुजरात में सर्वश्रेष्ठ प्रॉपर्टी खोजें',
    searchPlaceholder: 'प्रॉपर्टी खोजें...',
    browseProperties: 'प्रॉपर्टी देखें',
    bookConsultation: 'परामर्श बुक करें',

    // Property
    forSale: 'बिक्री के लिए',
    forRent: 'किराये पर',
    bedrooms: 'बेडरूम',
    bathrooms: 'बाथरूम',
    area: 'क्षेत्र',
    price: 'कीमत',
    viewDetails: 'विवरण देखें',
    addToWishlist: 'विशलिस्ट में जोड़ें',
    contactBroker: 'ब्रोकर से संपर्क',
    scheduleVisit: 'विज़िट शेड्यूल करें',

    // Auth
    login: 'लॉगिन',
    register: 'रजिस्टर',
    email: 'ईमेल',
    password: 'पासवर्ड',
    name: 'पूरा नाम',
    phone: 'फोन नंबर',
    loginTitle: 'वापस आए!',
    registerTitle: 'खाता बनाएं',
    alreadyAccount: 'पहले से खाता है?',
    noAccount: 'खाता नहीं है?',

    // Chat
    chatTitle: 'रुद्र सहायक',
    chatSubtitle: 'ऑनलाइन • मदद के लिए तैयार',
    chatPlaceholder: 'अपना संदेश लिखें...',
    chatWelcome: 'नमस्ते! 👋 रुद्र रियल एस्टेट में आपका स्वागत है। मैं कैसे मदद कर सकता हूं?',
    quickReplies: ['प्रॉपर्टी देखें', 'विज़िट बुक', 'ब्रोकर संपर्क', 'कानूनी मदद'],

    // Common
    loading: 'लोड हो रहा है...',
    save: 'सेव करें',
    cancel: 'रद्द करें',
    delete: 'डिलीट',
    edit: 'संपादित',
    submit: 'सबमिट',
    back: 'वापस',
    next: 'आगे',
    close: 'बंद करें',
  }
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(localStorage.getItem('language') || 'en');

  const changeLanguage = (lang) => {
    setLanguage(lang);
    localStorage.setItem('language', lang);
  };

  const t = (key) => {
    return translations[language]?.[key] || translations['en']?.[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, changeLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};