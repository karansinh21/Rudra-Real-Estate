import React, { useState, useRef, useEffect } from 'react';

// ============================================================
// MULTILANGUAGE TEXT
// ============================================================
const CHAT_TEXT = {
  en: {
    title: 'Rudra AI Assistant',
    subtitle: 'Your Real Estate Expert',
    online: 'Live',
    placeholder: 'Ask about properties, land, legal help...',
    poweredBy: 'Rudra Real Estate · Gujarat',
    typing: 'Thinking',
    newChat: 'New Chat',
  },
  gu: {
    title: 'રુદ્ર AI સહાયક',
    subtitle: 'તમારા રિયલ એસ્ટેટ નિષ્ણાત',
    online: 'ઓનલાઇન',
    placeholder: 'પ્રોપર્ટી, જમીન, કાનૂની... પૂછો',
    poweredBy: 'રુદ્ર રિયલ એસ્ટેટ · ગુજરાત',
    typing: 'વિચારી રહ્યું છે',
    newChat: 'નવી વાત',
  },
  hi: {
    title: 'रुद्र AI सहायक',
    subtitle: 'आपका रियल एस्टेट विशेषज्ञ',
    online: 'ऑनलाइन',
    placeholder: 'प्रॉपर्टी, जमीन, कानूनी... पूछें',
    poweredBy: 'रुद्र रियल एस्टेट · गुजरात',
    typing: 'सोच रहा हूं',
    newChat: 'नई बात',
  }
};

// ============================================================
// INTRO WELCOME MESSAGE (shown on open)
// ============================================================
const INTRO = {
  en: `🏛️ Welcome to Rudra Real Estate!

I'm your personal AI assistant. I can help you with:

🏠 Properties — Buy, Rent or Sell
🌿 Land & Plots — NA, Agricultural, Industrial
⚖️ Legal Help — Agreements, Title Search, Disputes
✨ About Us — 15 years · 10,000+ properties sold

What would you like to know today?`,

  gu: `🏛️ રુદ્ર રિયલ એસ્ટેટમાં આપનું સ્વાગત છે!

હું તમારો વ્યક્તિગત AI સહાયક છું. આ બાબ.ByRefतमा मदद करीश:

🏠 પ્રોπર્ŌI — ખProperty, ભHire, V.yyechaI
🌿 JMinI & Plota — NA, Khetiṇi, IndustriYal
⚖️ KaNuNi SaHay — KArar, Title, Vivad
✨ AMari vishe — 15 Varshe · 10,000+ PropARTy

Aaj Shu JaNava Ichu Cho?`,

  hi: `🏛️ रुद्र रियल एस्टेट में आपका स्वागत है!

मैं आपका व्यक्तिगत AI सहायक हूं। इन विषयों में मदद करूंगा:

🏠 प्रॉपर्टी — खरीदें, किराया या बेचें
🌿 जमीन & प्लॉट — NA, कृषि, औद्योगिक
⚖️ कानूनी — समझौता, टाइटल, विवाद
✨ हमारे बारे में — 15 साल · 10,000+ प्रॉपर्टी

आज क्या जानना चाहते हैं?`
};

// ============================================================
// QUICK REPLY BUTTONS
// ============================================================
const QUICK_REPLIES = {
  en: ['🏠 Buy Property', '🏡 Rent Property', '💰 Sell Property', '🌿 Land & Plots', '⚖️ Legal Help', '✨ About Rudra'],
  gu: ['🏠 ખProperty', '🏡 BHare', '💰 V.yyechaI', '🌿 JMinI', '⚖️ KaNuNi', '✨ Amara Vishe'],
  hi: ['🏠 खरीदें', '🏡 किराया', '💰 बेचें', '🌿 जमीन', '⚖️ कानूनी', '✨ हमारे बारे में'],
};

// ============================================================
// SMART BOT RESPONSES
// ============================================================
const RESPONSES = {
  en: {
    buy: `🔑 Buying a Property with Rudra

We have 500+ verified listings across Gujarat:
• Apartments & Villas — ₹25L to ₹5Cr+
• Commercial Offices & Shops
• Luxury Penthouses
• Budget Homes & Studios

What we offer:
✅ Free site visit within 24 hours
✅ Legal document verification
✅ Home loan assistance (all major banks)
✅ Zero brokerage on select properties
✅ RERA registered listings only

📞 Call us: +91 98765 43210
📧 Email: buy@rudra-realestate.com`,

    rent: `📋 Rental Properties Available

Monthly Rent Ranges:
🏡 1BHK — ₹8,000 to ₹15,000/month
🏡 2BHK — ₹12,000 to ₹25,000/month
🏡 3BHK — ₹20,000 to ₹45,000/month
🏢 Commercial — Custom pricing

Our Services:
✅ Police-verified tenants & landlords
✅ Rent agreement in just 1 day — ₹1,500
✅ Zero deposit options available
✅ Move-in ready properties

📞 Call us: +91 98765 43210`,

    sell: `💰 Sell Your Property with Rudra

Why list with us?
📸 Free professional photography
📣 Listed on 10+ platforms instantly
👥 5,000+ active verified buyers
⚡ Average sale time: just 30 days
💎 Best price guarantee
🔒 100% secure & transparent process

Free Services:
✅ Property valuation — FREE
✅ Legal title check — FREE
✅ Market price analysis — FREE

📞 Call now: +91 98765 43210`,

    land: `🌿 Land & Plots in Gujarat

Price Range by Region:
📍 Vadodara — ₹500 to ₹2,000/sq ft
📍 Ahmedabad — ₹800 to ₹3,500/sq ft
📍 Surat & Rajkot — ₹600 to ₹2,500/sq ft

Types Available:
🏗️ NA Plots — Ready for construction
🌾 Agricultural Land — 1 to 100+ Bigha
🏭 Industrial Plots — All sizes
🏘️ Residential Layouts — Gated communities

All plots:
✅ RERA registered
✅ Clear title verified
✅ Bank loan available

📞 Call: +91 98765 43210`,

    legal: `⚖️ Legal Assistance Services

Document Services & Pricing:
📄 Rent Agreement — ₹1,500 (1 day)
📄 Sale Deed Drafting — ₹5,000 (3 days)
📄 Property Title Search — ₹3,000 (2 days)
📄 Due Diligence Report — ₹8,000 (5 days)
📄 Power of Attorney — ₹4,000 (2 days)

Legal Advisory:
⚖️ Property dispute resolution
⚖️ Builder-buyer disputes
⚖️ RERA complaint filing
⚖️ Inheritance & succession
⚖️ Mortgage & loan documentation

✅ First consultation absolutely FREE
✅ Senior lawyer assigned
✅ Available Mon–Sat, 9am to 7pm

📞 Call: +91 98765 43210
📧 legal@rudra-realestate.com`,

    about: `✨ About Rudra Real Estate

Our Track Record:
🏆 15+ Years of excellence in Gujarat
🏠 10,000+ Properties successfully sold
😊 8,500+ Happy clients served
⭐ 4.8 out of 5 average rating
📍 Offices in Vadodara, Ahmedabad & Surat

Why Choose Rudra?
✅ RERA registered & government certified
✅ 500+ active verified listings
✅ In-house expert legal team
✅ 24/7 customer support
✅ Zero hidden charges — guaranteed
✅ Free property valuation

Contact Us:
📞 +91 98765 43210
📧 info@rudra-realestate.com
🌐 www.rudra-realestate.com
📍 Rudra Tower, Alkapuri, Vadodara`,

    default: `Thank you for contacting Rudra Real Estate!

I can help you with:
🏠 Property — Buy, Rent or Sell
🌿 Land & Plots across Gujarat
⚖️ Legal assistance & documents
✨ Company information

Please choose a topic above or ask me anything!

📞 Direct line: +91 98765 43210
⏱️ We respond within 2 hours`,
  },

  gu: {
    buy: `🔑 RudraJode Property Kharido

Gujarat Ma 500+ CheckAyeli Propaty!
• Apartment & Villa — ₹25L thi ₹5Cr+
• Commercial Office & Dukan
• Luxury Penthouse

AMari Sevao:
✅ 24 KaLakMa Free Site Visit
✅ Document Check
✅ Home Loan Sahay
✅ Zero Brokeraje (Chundayal Propaty Ma)

📞 Samparka Karo: +91 98765 43210`,

    rent: `📋 BHara Ni Propaty

MahiNo Bhara:
🏡 1BHK — ₹8,000 thi ₹15,000
🏡 2BHK — ₹12,000 thi ₹25,000
🏡 3BHK — ₹20,000 thi ₹45,000

✅ BHara Karar 1 Divase — ₹1,500
✅ Zero Deposit Vikalpa
✅ Taiyar Propaty

📞 Samparka: +91 98765 43210`,

    sell: `💰 Tamari Propaty Vecho

Shu Malashe:
📸 Free Professional Photo
📣 10+ PlatForm Par List
👥 5,000+ Khariadaro
⚡ 30 Divase Vhechan
💎 Shreshtha Bhav Garanti

✅ Free Propaty Mulyankan
✅ Free Title Check

📞 Hame Kaho: +91 98765 43210`,

    land: `🌿 Gujarat Ma Jamin & Plot

Bhav:
📍 Vadodara — ₹500–₹2,000/Cho.Fu
📍 Ahmedabad — ₹800–₹3,500/Cho.Fu
📍 Surat & Rajkot — ₹600–₹2,500/Cho.Fu

Prakar:
🏗️ NA Plot — Bandhkam Taiyar
🌾 Kheti Ni Jamin — 1 thi 100+ Bigha
🏭 Industrial Plot

✅ RERA Register
✅ Bank Loan Uplabdha

📞 Samparka: +91 98765 43210`,

    legal: `⚖️ Kanuni Sahay Sevao

Dakhalat & Bhav:
📄 Bhara Karar — ₹1,500 (1 Divas)
📄 Sale Deed — ₹5,000 (3 Divas)
📄 Title Search — ₹3,000 (2 Divas)
📄 Due Diligence — ₹8,000 (5 Divas)

Kanuni Salah:
⚖️ Propaty Vivad
⚖️ RERA Farayad
⚖️ Varasat & Succession

✅ Pratham Salah Muft!
✅ Ane Sr Vakil

📞 Samparka: +91 98765 43210`,

    about: `✨ Rudra Real Estate Vishe

Amaro Record:
🏆 15+ Varsha Gujarat Ma
🏠 10,000+ Propaty Vhechai
😊 8,500+ Khushi Grahako
⭐ 4.8/5 Rating
📍 Office: Vadodara, Ahmedabad, Surat

Ame Kem?
✅ RERA Register
✅ Ghar Betha Seva
✅ Zero Chupeli Kharach
✅ 24/7 Support

📞 +91 98765 43210`,

    default: `Rudra Real Estate Ma Aapnu Swagat!

Hoo Madad Kari Shakoo Chhoo:
🏠 Propaty — Kharido, Bhare, Vecho
🌿 Jamin & Plot
⚖️ Kanuni Sahay
✨ Amari Company Vishe

Uparna Ma Thi Ek Pasand Karo!

📞 +91 98765 43210`,
  },

  hi: {
    buy: `🔑 रुद्र के साथ प्रॉपर्टी खरीदें

गुजरात में 500+ सत्यापित प्रॉपर्टी!
• अपार्टमेंट & विला — ₹25L से ₹5Cr+
• कमर्शियल ऑफिस & दुकान
• लक्जरी पेंटहाउस

हमारी सेवाएं:
✅ 24 घंटे में फ्री साइट विज़िट
✅ दस्तावेज़ सत्यापन
✅ होम लोन सहायता
✅ चुनिंदा प्रॉपर्टी पर जीरो ब्रोकरेज

📞 कॉल करें: +91 98765 43210`,

    rent: `📋 किराये की प्रॉपर्टी

मासिक किराया:
🏡 1BHK — ₹8,000 से ₹15,000
🏡 2BHK — ₹12,000 से ₹25,000
🏡 3BHK — ₹20,000 से ₹45,000

✅ किराया समझौता 1 दिन में — ₹1,500
✅ जीरो डिपॉजिट विकल्प
✅ तैयार प्रॉपर्टी

📞 कॉल: +91 98765 43210`,

    sell: `💰 अपनी प्रॉपर्टी बेचें

हमारे साथ क्या मिलेगा:
📸 फ्री प्रोफेशनल फोटोग्राफी
📣 10+ प्लेटफॉर्म पर लिस्टिंग
👥 5,000+ सक्रिय खरीदार
⚡ औसत 30 दिन में बिक्री
💎 सर्वोत्तम मूल्य गारंटी

✅ फ्री प्रॉपर्टी वैल्यूएशन
✅ फ्री टाइटल चेक

📞 अभी कॉल: +91 98765 43210`,

    land: `🌿 गुजरात में जमीन & प्लॉट

क्षेत्र अनुसार भाव:
📍 वडोदरा — ₹500–₹2,000/वर्ग फुट
📍 अहमदाबाद — ₹800–₹3,500/वर्ग फुट
📍 सूरत & राजकोट — ₹600–₹2,500/वर्ग फुट

प्रकार:
🏗️ NA प्लॉट — निर्माण के लिए तैयार
🌾 कृषि भूमि — 1 से 100+ बीघा
🏭 औद्योगिक प्लॉट

✅ RERA पंजीकृत
✅ बैंक लोन उपलब्ध

📞 कॉल: +91 98765 43210`,

    legal: `⚖️ कानूनी सहायता सेवाएं

दस्तावेज़ & मूल्य:
📄 किराया समझौता — ₹1,500 (1 दिन)
📄 बिक्री विलेख — ₹5,000 (3 दिन)
📄 टाइटल सर्च — ₹3,000 (2 दिन)
📄 ड्यू डिलिजेंस — ₹8,000 (5 दिन)

कानूनी सलाह:
⚖️ संपत्ति विवाद समाधान
⚖️ RERA शिकायत
⚖️ उत्तराधिकार & विरासत

✅ पहली सलाह बिल्कुल मुफ्त!
✅ वरिष्ठ वकील नियुक्त

📞 कॉल: +91 98765 43210`,

    about: `✨ रुद्र रियल एस्टेट के बारे में

हमारा रिकॉर्ड:
🏆 15+ साल गुजरात में
🏠 10,000+ प्रॉपर्टी बेची
😊 8,500+ खुश ग्राहक
⭐ 4.8/5 रेटिंग
📍 वडोदरा, अहमदाबाद & सूरत

हमें क्यों चुनें?
✅ RERA पंजीकृत
✅ कोई छुपा शुल्क नहीं
✅ 24/7 सपोर्ट
✅ इन-हाउस लीगल टीम

📞 +91 98765 43210`,

    default: `रुद्र रियल एस्टेट में आपका स्वागत!

मैं इन विषयों में मदद कर सकता हूं:
🏠 प्रॉपर्टी — खरीद, किराया या बिक्री
🌿 जमीन और प्लॉट
⚖️ कानूनी सहायता
✨ कंपनी की जानकारी

ऊपर से कोई विषय चुनें!

📞 +91 98765 43210`,
  }
};

// ============================================================
// DETECT INTENT FROM USER MESSAGE
// ============================================================
function getResponse(msg, lang) {
  const m = msg.toLowerCase();
  const r = RESPONSES[lang] || RESPONSES.en;

  if (m.includes('buy') || m.includes('purchase') || m.includes('kharid') || m.includes('ખProperty') || m.includes('खरीद') || m.includes('ખ') && m.includes('roperty')) return r.buy;
  if (m.includes('rent') || m.includes('bhara') || m.includes('bhare') || m.includes('bhaad') || m.includes('किराया') || m.includes('🏡')) return r.rent;
  if (m.includes('sell') || m.includes('vech') || m.includes('बेच') || m.includes('💰') || m.includes('sale')) return r.sell;
  if (m.includes('land') || m.includes('plot') || m.includes('jamin') || m.includes('जमीन') || m.includes('bigha') || m.includes('🌿')) return r.land;
  if (m.includes('legal') || m.includes('lawyer') || m.includes('kanun') || m.includes('कानून') || m.includes('agreement') || m.includes('deed') || m.includes('⚖️')) return r.legal;
  if (m.includes('about') || m.includes('rudra') || m.includes('company') || m.includes('vishe') || m.includes('बारे') || m.includes('✨')) return r.about;

  // keyword fallback
  if (m.includes('property') || m.includes('flat') || m.includes('apartment') || m.includes('house') || m.includes('villa')) return r.buy;
  if (m.includes('price') || m.includes('cost') || m.includes('rate') || m.includes('bhav')) return r.buy;
  if (m.includes('docu') || m.includes('deed') || m.includes('title') || m.includes('dispute')) return r.legal;

  return r.default;
}

// ============================================================
// MAIN COMPONENT
// ============================================================
export default function RudraAIChatBot() {
  const [lang, setLang] = useState(() => localStorage.getItem('rudra_lang') || 'en');
  const [isOpen, setIsOpen] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState([]);
  const [unread, setUnread] = useState(1);
  const endRef = useRef(null);
  const inputRef = useRef(null);

  function now() {
    return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  function makeWelcome(l) {
    return { id: 0, from: 'bot', text: INTRO[l], time: now() };
  }

  useEffect(() => {
    setMessages([makeWelcome(lang)]);
  }, [lang]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  useEffect(() => {
    if (isOpen) { setUnread(0); setTimeout(() => inputRef.current?.focus(), 200); }
  }, [isOpen]);

  function changeLang(l) {
    setLang(l);
    localStorage.setItem('rudra_lang', l);
  }

  function resetChat() {
    setMessages([makeWelcome(lang)]);
  }

  function send(text) {
    const t = (text || input).trim();
    if (!t) return;
    setInput('');
    const uMsg = { id: Date.now(), from: 'user', text: t, time: now() };
    setMessages(p => [...p, uMsg]);
    setIsTyping(true);
    setTimeout(() => {
      const bMsg = { id: Date.now() + 1, from: 'bot', text: getResponse(t, lang), time: now() };
      setMessages(p => [...p, bMsg]);
      setIsTyping(false);
    }, 1000 + Math.random() * 600);
  }

  const ct = CHAT_TEXT[lang];
  const qr = QUICK_REPLIES[lang];

  return (
    <>
      <style>{`
        @keyframes rp { 0%,100%{box-shadow:0 0 0 0 rgba(99,102,241,0.4)} 70%{box-shadow:0 0 0 14px rgba(99,102,241,0)} }
        @keyframes rb { 0%,80%,100%{transform:translateY(0)} 40%{transform:translateY(-6px)} }
        @keyframes rs { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
        @keyframes rw { from{opacity:0;transform:scale(0.95) translateY(20px)} to{opacity:1;transform:scale(1) translateY(0)} }
        .rudra-scroll::-webkit-scrollbar{width:4px}
        .rudra-scroll::-webkit-scrollbar-track{background:transparent}
        .rudra-scroll::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.1);border-radius:4px}
        .rudra-qbtn:hover{background:rgba(99,102,241,0.3)!important;border-color:rgba(99,102,241,0.5)!important;color:#fff!important}
        .rudra-ibtn:hover{background:rgba(255,255,255,0.15)!important}
        .rudra-send:hover{transform:scale(1.05)}
        .rudra-fab:hover{transform:scale(1.08)}
        .rudra-msg{animation:rs 0.25s ease}
      `}</style>

      <div style={{ position:'fixed', bottom:24, right:24, zIndex:99999, fontFamily:"'Segoe UI',system-ui,sans-serif" }}>

        {/* ── FAB BUTTON ── */}
        {!isOpen && (
          <button
            className="rudra-fab"
            onClick={() => setIsOpen(true)}
            style={{
              width:64, height:64, borderRadius:'50%', border:'none', cursor:'pointer',
              background:'linear-gradient(135deg,#4f46e5,#7c3aed)',
              animation:'rp 2s infinite',
              display:'flex', alignItems:'center', justifyContent:'center',
              fontSize:28, position:'relative', transition:'transform 0.2s',
              boxShadow:'0 8px 32px rgba(79,70,229,0.5)',
            }}
          >
            💬
            {unread > 0 && (
              <span style={{
                position:'absolute', top:-4, right:-4,
                background:'#ef4444', color:'#fff', fontSize:11, fontWeight:700,
                borderRadius:'50%', width:20, height:20,
                display:'flex', alignItems:'center', justifyContent:'center',
              }}>{unread}</span>
            )}
          </button>
        )}

        {/* ── CHAT WINDOW ── */}
        {isOpen && (
          <div style={{
            width:390, borderRadius:24, overflow:'hidden',
            boxShadow:'0 32px 80px rgba(0,0,0,0.5)',
            background:'#0d1117',
            border:'1px solid rgba(255,255,255,0.07)',
            animation:'rw 0.3s ease',
          }}>

            {/* HEADER */}
            <div style={{ background:'linear-gradient(135deg,#1e1b4b 0%,#312e81 50%,#4c1d95 100%)', padding:'14px 16px' }}>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>

                {/* Left: Avatar + Info */}
                <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                  <div style={{
                    width:48, height:48, borderRadius:'50%', flexShrink:0,
                    background:'linear-gradient(135deg,#4f46e5,#7c3aed)',
                    display:'flex', alignItems:'center', justifyContent:'center',
                    fontSize:22, boxShadow:'0 4px 16px rgba(99,102,241,0.4)',
                  }}>🏛️</div>
                  <div>
                    <div style={{ color:'#fff', fontWeight:700, fontSize:15, letterSpacing:0.3 }}>{ct.title}</div>
                    <div style={{ color:'rgba(255,255,255,0.6)', fontSize:11.5, marginTop:2, display:'flex', alignItems:'center', gap:5 }}>
                      <span style={{ width:7, height:7, borderRadius:'50%', background:'#22c55e', display:'inline-block', boxShadow:'0 0 6px #22c55e' }}></span>
                      {ct.online} · {ct.subtitle}
                    </div>
                  </div>
                </div>

                {/* Right: Lang + Buttons */}
                <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                  {/* Language Switcher */}
                  <div style={{ display:'flex', background:'rgba(0,0,0,0.25)', borderRadius:20, padding:'3px 4px', gap:2 }}>
                    {['en','gu','hi'].map(l => (
                      <button key={l} onClick={() => changeLang(l)} style={{
                        padding:'3px 9px', borderRadius:16, border:'none', cursor:'pointer',
                        fontSize:11.5, fontWeight:700,
                        background: lang===l ? '#4f46e5' : 'transparent',
                        color: lang===l ? '#fff' : 'rgba(255,255,255,0.5)',
                        transition:'all 0.2s',
                      }}>{l==='en'?'EN':l==='gu'?'ગુ':'हि'}</button>
                    ))}
                  </div>
                  {/* Reset */}
                  <button className="rudra-ibtn" onClick={resetChat} title="New Chat" style={{
                    background:'rgba(255,255,255,0.1)', border:'none', cursor:'pointer',
                    borderRadius:'50%', width:30, height:30, color:'rgba(255,255,255,0.7)', fontSize:14,
                    display:'flex', alignItems:'center', justifyContent:'center', transition:'background 0.2s',
                  }}>↺</button>
                  {/* Minimize */}
                  <button className="rudra-ibtn" onClick={() => setMinimized(!minimized)} style={{
                    background:'rgba(255,255,255,0.1)', border:'none', cursor:'pointer',
                    borderRadius:'50%', width:30, height:30, color:'rgba(255,255,255,0.7)', fontSize:14,
                    display:'flex', alignItems:'center', justifyContent:'center', transition:'background 0.2s',
                  }}>{minimized?'▲':'▬'}</button>
                  {/* Close */}
                  <button className="rudra-ibtn" onClick={() => setIsOpen(false)} style={{
                    background:'rgba(255,255,255,0.1)', border:'none', cursor:'pointer',
                    borderRadius:'50%', width:30, height:30, color:'rgba(255,255,255,0.7)', fontSize:14,
                    display:'flex', alignItems:'center', justifyContent:'center', transition:'background 0.2s',
                  }}>✕</button>
                </div>
              </div>
            </div>

            {!minimized && (
              <>
                {/* MESSAGES */}
                <div className="rudra-scroll" style={{
                  height:360, overflowY:'auto', padding:'16px 14px',
                  display:'flex', flexDirection:'column', gap:10,
                  background:'#0d1117',
                }}>
                  {messages.map(msg => (
                    <div key={msg.id} className="rudra-msg" style={{
                      display:'flex', flexDirection:'column',
                      alignItems: msg.from==='user' ? 'flex-end' : 'flex-start',
                    }}>
                      {msg.from === 'bot' && (
                        <div style={{ display:'flex', alignItems:'flex-end', gap:8, maxWidth:'88%' }}>
                          <div style={{
                            width:28, height:28, borderRadius:'50%', flexShrink:0,
                            background:'linear-gradient(135deg,#4f46e5,#7c3aed)',
                            display:'flex', alignItems:'center', justifyContent:'center', fontSize:13,
                          }}>🏛️</div>
                          <div style={{
                            background:'rgba(255,255,255,0.05)',
                            border:'1px solid rgba(255,255,255,0.08)',
                            borderRadius:'4px 16px 16px 16px',
                            padding:'10px 14px', color:'#d1d5db', fontSize:13, lineHeight:1.65,
                            whiteSpace:'pre-wrap', wordBreak:'break-word',
                          }}>{msg.text}</div>
                        </div>
                      )}
                      {msg.from === 'user' && (
                        <div style={{
                          maxWidth:'80%',
                          background:'linear-gradient(135deg,#4f46e5,#7c3aed)',
                          borderRadius:'16px 4px 16px 16px',
                          padding:'10px 14px', color:'#fff', fontSize:13, lineHeight:1.65,
                          wordBreak:'break-word',
                        }}>{msg.text}</div>
                      )}
                      <div style={{ fontSize:10, color:'rgba(255,255,255,0.28)', marginTop:3, paddingLeft: msg.from==='bot'?38:0 }}>{msg.time}</div>
                    </div>
                  ))}

                  {/* Typing Indicator */}
                  {isTyping && (
                    <div style={{ display:'flex', alignItems:'flex-end', gap:8 }}>
                      <div style={{
                        width:28, height:28, borderRadius:'50%',
                        background:'linear-gradient(135deg,#4f46e5,#7c3aed)',
                        display:'flex', alignItems:'center', justifyContent:'center', fontSize:13,
                      }}>🏛️</div>
                      <div style={{
                        background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.08)',
                        borderRadius:'4px 16px 16px 16px', padding:'12px 16px',
                        display:'flex', alignItems:'center', gap:6,
                      }}>
                        {[0,1,2].map(i => (
                          <span key={i} style={{
                            width:8, height:8, borderRadius:'50%', background:'#6366f1', display:'block',
                            animation:'rb 1.2s infinite', animationDelay:`${i*0.2}s`,
                          }}></span>
                        ))}
                        <span style={{ color:'rgba(255,255,255,0.35)', fontSize:11.5, marginLeft:4 }}>{ct.typing}...</span>
                      </div>
                    </div>
                  )}
                  <div ref={endRef} />
                </div>

                {/* QUICK REPLIES */}
                <div style={{
                  padding:'10px 14px 8px',
                  background:'#0d1117',
                  borderTop:'1px solid rgba(255,255,255,0.05)',
                }}>
                  <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
                    {qr.map((q, i) => (
                      <button key={i} className="rudra-qbtn" onClick={() => send(q)} style={{
                        padding:'5px 12px', borderRadius:20, cursor:'pointer',
                        background:'rgba(255,255,255,0.05)',
                        border:'1px solid rgba(255,255,255,0.1)',
                        color:'#9ca3af', fontSize:12, transition:'all 0.2s',
                      }}>{q}</button>
                    ))}
                  </div>
                </div>

                {/* INPUT */}
                <div style={{
                  display:'flex', alignItems:'center', gap:8,
                  padding:'10px 14px 14px', background:'#0d1117',
                }}>
                  <input
                    ref={inputRef}
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={e => e.key==='Enter' && !e.shiftKey && send()}
                    placeholder={ct.placeholder}
                    style={{
                      flex:1, background:'rgba(255,255,255,0.06)',
                      border:'1px solid rgba(255,255,255,0.1)',
                      borderRadius:24, padding:'10px 18px',
                      color:'#e5e7eb', fontSize:13.5, outline:'none',
                      transition:'border-color 0.2s',
                    }}
                    onFocus={e => e.target.style.borderColor='rgba(99,102,241,0.5)'}
                    onBlur={e => e.target.style.borderColor='rgba(255,255,255,0.1)'}
                  />
                  <button
                    className="rudra-send"
                    onClick={() => send()}
                    disabled={!input.trim()}
                    style={{
                      width:42, height:42, borderRadius:'50%', border:'none', cursor:'pointer',
                      background: input.trim() ? 'linear-gradient(135deg,#4f46e5,#7c3aed)' : 'rgba(255,255,255,0.1)',
                      color:'#fff', fontSize:17, display:'flex', alignItems:'center', justifyContent:'center',
                      flexShrink:0, transition:'all 0.2s',
                      boxShadow: input.trim() ? '0 4px 16px rgba(99,102,241,0.4)' : 'none',
                    }}
                  >➤</button>
                </div>

                {/* FOOTER */}
                <div style={{
                  textAlign:'center', fontSize:10.5, color:'rgba(255,255,255,0.2)',
                  padding:'0 16px 12px', background:'#0d1117',
                }}>
                  ✦ {ct.poweredBy}
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </>
  );
}