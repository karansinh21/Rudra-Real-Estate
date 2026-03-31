import React, { useState, useEffect, useRef, useCallback } from 'react';
import { io } from 'socket.io-client';
import { Scale, Send, X, RefreshCw, Phone } from 'lucide-react';

const API = process.env.REACT_APP_API_URL?.replace('/api', '') || 'http://localhost:5000';

// ── Purple theme for lawyer ──────────────────────────────────────
const DS = {
  bg:'#FAF5FF', card:'#FFFFFF', border:'#E9D5FF',
  primary:'#7E22CE', primaryLight:'#F5F3FF', primaryBorder:'rgba(126,34,206,0.18)',
  text:'#1A0030', textSub:'#5B2D8A', textMuted:'#9F7ABD',
  sent:'#EDE9FE', recv:'#FFFFFF', chatBg:'#F0EAFF',
};

function fmtTime(d) {
  return new Date(d || Date.now()).toLocaleTimeString([], { hour:'2-digit', minute:'2-digit' });
}
function fmtDate(d) {
  return new Date(d).toLocaleDateString('en-IN', { day:'numeric', month:'short' });
}

export default function LawyerLiveChat({ currentUser }) {
  const [sessions,  setSessions]  = useState([]);
  const [active,    setActive]    = useState(null);
  const [messages,  setMessages]  = useState([]);
  const [input,     setInput]     = useState('');
  const [isTyping,  setIsTyping]  = useState(false);
  const [unreadMap, setUnreadMap] = useState({});
  const [loading,   setLoading]   = useState(true);
  const [sending,   setSending]   = useState(false);
  const [newAlert,  setNewAlert]  = useState(null);

  const socketRef = useRef(null);
  const endRef    = useRef(null);
  const inputRef  = useRef(null);

  const token = localStorage.getItem('token');

  // ── Fetch lawyer sessions ──────────────────────────────────────
  const fetchSessions = useCallback(async () => {
    try {
      const res = await fetch(`${API}/api/chat/sessions?type=LAWYER`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setSessions(data.sessions || []);
    } catch (err) {
      console.error('fetchSessions:', err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { fetchSessions(); }, [fetchSessions]);

  // ── Connect socket ────────────────────────────────────────────────
  useEffect(() => {
    const socket = io(API, { transports: ['websocket', 'polling'] });
    socketRef.current = socket;

    socket.on('connect', () => {
      socket.emit('join-lawyer', {
        lawyerId:   currentUser?.id,
        lawyerName: currentUser?.name
      });
      sessions.forEach(s => socket.emit('join-room', s.id));
    });

    // New session from user
    socket.on('session-started', (data) => {
      if (data.sessionType !== 'LAWYER') return;
      setNewAlert(data);
      setTimeout(() => setNewAlert(null), 5000);
      fetchSessions();
    });

    // Message from user
    socket.on('receive-message', (data) => {
      if (data.senderRole !== 'USER' && data.senderRole !== 'BOT') return;

      setActive(prev => {
        if (prev?.id === data.sessionId) {
          setMessages(m => [...m, {
            id:         data.id || Date.now(),
            text:       data.text,
            from:       'user',
            senderName: data.senderName,
            time:       fmtTime(data.createdAt),
            status:     'seen',
          }]);
          socket.emit('messages-seen', { sessionId: data.sessionId });
        } else {
          setUnreadMap(u => ({ ...u, [data.sessionId]: (u[data.sessionId] || 0) + 1 }));
        }
        return prev;
      });

      setSessions(prev => prev.map(s =>
        s.id === data.sessionId
          ? { ...s, messages: [{ text: data.text, createdAt: data.createdAt }], updatedAt: new Date().toISOString() }
          : s
      ));
    });

    socket.on('user-typing', (data) => {
      if (data.role === 'USER') setIsTyping(data.typing);
    });

    socket.on('messages-seen', () => {
      setMessages(prev => prev.map(m =>
        m.from === 'lawyer' ? { ...m, status: 'seen' } : m
      ));
    });

    return () => socket.disconnect();
  }, [sessions.length, currentUser]); // eslint-disable-line

  // ── Open session ─────────────────────────────────────────────────
  const openSession = async (session) => {
    setActive(session);
    setUnreadMap(u => ({ ...u, [session.id]: 0 }));
    setMessages([]);

    socketRef.current?.emit('join-room', session.id);
    socketRef.current?.emit('messages-seen', { sessionId: session.id });

    // Auto-assign to this lawyer
    try {
      await fetch(`${API}/api/chat/session/${session.id}/assign`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch {}

    try {
      const res = await fetch(`${API}/api/chat/session/${session.id}/messages`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setMessages((data.messages || []).map(m => ({
        id:         m.id,
        text:       m.text,
        from:       m.senderRole === 'USER' ? 'user' : m.senderRole === 'BOT' ? 'bot' : 'lawyer',
        senderName: m.senderName,
        time:       fmtTime(m.createdAt),
        status:     m.read ? 'seen' : 'delivered',
      })));
    } catch {}

    setTimeout(() => {
      endRef.current?.scrollIntoView({ behavior: 'smooth' });
      inputRef.current?.focus();
    }, 100);
  };

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // ── Send message ──────────────────────────────────────────────────
  const send = async () => {
    if (!input.trim() || !active || sending) return;
    const text = input.trim();
    setInput('');
    setSending(true);

    const senderName = currentUser?.name || 'Lawyer';
    const tempId = Date.now();

    setMessages(prev => [...prev, {
      id: tempId, text, from: 'lawyer', senderName, time: fmtTime(), status: 'sent',
    }]);

    try {
      const res = await fetch(`${API}/api/chat/session/${active.id}/message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          text,
          senderName,
          senderRole: 'LAWYER',
          senderId:    currentUser?.id
        })
      });
      const saved = await res.json();

      socketRef.current?.emit('send-message', {
        sessionId:   active.id,
        sessionType: 'LAWYER',
        id:          saved.message?.id,
        text,
        senderName,
        senderRole:  'LAWYER',
        createdAt:   new Date().toISOString(),
      });

      setMessages(prev => prev.map(m =>
        m.id === tempId ? { ...m, status: 'delivered', id: saved.message?.id || tempId } : m
      ));

      setSessions(prev => prev.map(s =>
        s.id === active.id ? { ...s, messages: [{ text, createdAt: new Date().toISOString() }], updatedAt: new Date().toISOString() } : s
      ));
    } catch {
      setMessages(prev => prev.map(m => m.id === tempId ? { ...m, status: 'error' } : m));
    } finally {
      setSending(false);
    }
  };

  const handleInput = (e) => {
    setInput(e.target.value);
    if (active) {
      socketRef.current?.emit('typing', { roomId: active.id, typing: !!e.target.value, role: 'LAWYER' });
    }
  };

  const totalUnread = Object.values(unreadMap).reduce((a, b) => a + b, 0);

  // ════════════════════════════════════════════════════════════════
  return (
    <div style={{ display:'flex', height:'100%', minHeight:500, background:DS.bg, borderRadius:20, overflow:'hidden', border:`1px solid ${DS.border}`, fontFamily:"'DM Sans',system-ui,sans-serif", position:'relative' }}>
      <style>{`
        .llc-scroll::-webkit-scrollbar{width:4px}
        .llc-scroll::-webkit-scrollbar-thumb{background:rgba(0,0,0,0.1);border-radius:4px}
        .llc-msg{animation:llc-in 0.2s ease}
        @keyframes llc-in{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
        @keyframes llc-dot{0%,80%,100%{transform:translateY(0)}40%{transform:translateY(-4px)}}
        .llc-session:hover{background:#F5F3FF!important}
        .llc-input:focus{outline:none}
        .llc-send:hover{opacity:0.85}
        @keyframes llc-alert{from{opacity:0;transform:translateY(-10px)}to{opacity:1;transform:translateY(0)}}
      `}</style>

      {/* ✅ New Session Alert */}
      {newAlert && (
        <div style={{
          position:'absolute', top:12, left:'50%', transform:'translateX(-50%)',
          background:'#7E22CE', color:'#fff', borderRadius:10, padding:'8px 16px',
          fontSize:13, fontWeight:600, zIndex:100, animation:'llc-alert 0.3s ease',
          boxShadow:'0 4px 16px rgba(126,34,206,0.4)', display:'flex', alignItems:'center', gap:8,
        }}>
          🔔 New legal query from {newAlert.userName}!
          <button onClick={() => fetchSessions()} style={{ background:'rgba(255,255,255,0.2)', border:'none', color:'#fff', borderRadius:6, padding:'2px 8px', cursor:'pointer', fontSize:11 }}>
            Refresh
          </button>
        </div>
      )}

      {/* ── LEFT: Session List ─────────────────────────── */}
      <div style={{ width:280, borderRight:`1px solid ${DS.border}`, display:'flex', flexDirection:'column', background:DS.card, flexShrink:0 }}>
        <div style={{ padding:'16px 16px 12px', borderBottom:`1px solid ${DS.border}`, background:'linear-gradient(135deg,#7E22CE,#6B21A8)' }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
            <div style={{ display:'flex', alignItems:'center', gap:8 }}>
              <Scale size={16} color="#fff"/>
              <span style={{ fontWeight:700, fontSize:14, color:'#fff' }}>Legal Chats</span>
              {totalUnread > 0 && (
                <span style={{ background:'#ef4444', color:'#fff', fontSize:10, fontWeight:700, borderRadius:20, padding:'2px 7px' }}>
                  {totalUnread}
                </span>
              )}
            </div>
            <button onClick={fetchSessions} style={{ background:'rgba(255,255,255,0.2)', border:'none', cursor:'pointer', color:'#fff', borderRadius:6, padding:'4px 8px' }}>
              <RefreshCw size={13}/>
            </button>
          </div>
          <p style={{ color:'rgba(255,255,255,0.7)', fontSize:11, marginTop:4 }}>
            Clients seeking legal assistance
          </p>
        </div>

        <div className="llc-scroll" style={{ flex:1, overflowY:'auto' }}>
          {loading ? (
            <div style={{ padding:24, textAlign:'center', color:DS.textMuted, fontSize:13 }}>Loading...</div>
          ) : sessions.length === 0 ? (
            <div style={{ padding:24, textAlign:'center' }}>
              <Scale size={36} color={DS.border} style={{ margin:'0 auto 10px' }}/>
              <p style={{ color:DS.textMuted, fontSize:13 }}>No legal chats yet</p>
              <p style={{ color:DS.textMuted, fontSize:11, marginTop:4 }}>
                Clients will appear here when they click "Chat with Lawyer"
              </p>
            </div>
          ) : sessions.map(s => {
            const unread     = unreadMap[s.id] || 0;
            const isSelected = active?.id === s.id;
            const lastMsg    = s.messages?.[0];
            return (
              <div key={s.id} className="llc-session" onClick={() => openSession(s)}
                style={{
                  padding:'12px 14px', cursor:'pointer', borderBottom:`1px solid ${DS.border}`,
                  background: isSelected ? DS.primaryLight : DS.card, transition:'background 0.15s',
                }}>
                <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                  <div style={{
                    width:42, height:42, borderRadius:'50%', flexShrink:0,
                    background: DS.primary + '20', border:`1px solid ${DS.primaryBorder}`,
                    display:'flex', alignItems:'center', justifyContent:'center',
                    fontWeight:700, fontSize:16, color:DS.primary,
                  }}>
                    {s.userName?.[0]?.toUpperCase() || '?'}
                  </div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                      <span style={{ fontWeight:700, fontSize:13, color:DS.text, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                        {s.userName}
                      </span>
                      <span style={{ fontSize:10, color:DS.textMuted, flexShrink:0, marginLeft:4 }}>
                        {fmtDate(s.updatedAt)}
                      </span>
                    </div>
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginTop:2 }}>
                      <span style={{ fontSize:11.5, color:DS.textMuted, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', flex:1 }}>
                        {lastMsg?.text?.slice(0, 38) || 'Legal inquiry...'}
                        {(lastMsg?.text?.length || 0) > 38 ? '…' : ''}
                      </span>
                      {unread > 0 && (
                        <span style={{ background:DS.primary, color:'#fff', fontSize:10, fontWeight:700, borderRadius:'50%', minWidth:18, height:18, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, marginLeft:4 }}>
                          {unread}
                        </span>
                      )}
                    </div>
                    <span style={{ fontSize:10, color: s.status === 'ACTIVE' ? '#15803d' : '#6b7280', fontWeight:600 }}>
                      {s.status === 'ACTIVE' ? '● Active' : '○ Closed'}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── RIGHT: Chat Area ──────────────────────────── */}
      {!active ? (
        <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', flexDirection:'column', gap:12 }}>
          <div style={{ width:64, height:64, borderRadius:16, background:DS.primaryLight, border:`1px solid ${DS.primaryBorder}`, display:'flex', alignItems:'center', justifyContent:'center' }}>
            <Scale size={32} color={DS.primary}/>
          </div>
          <p style={{ color:DS.textSub, fontSize:15, fontWeight:600 }}>Legal Chat Panel</p>
          <p style={{ color:DS.textMuted, fontSize:12, textAlign:'center', maxWidth:240 }}>
            Select a conversation to provide legal assistance to clients
          </p>
        </div>
      ) : (
        <div style={{ flex:1, display:'flex', flexDirection:'column', minWidth:0 }}>

          {/* Header */}
          <div style={{ padding:'12px 16px', background:DS.card, borderBottom:`1px solid ${DS.border}`, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
            <div style={{ display:'flex', alignItems:'center', gap:10 }}>
              <div style={{ width:36, height:36, borderRadius:'50%', background:DS.primary+'20', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700, fontSize:15, color:DS.primary }}>
                {active.userName?.[0]?.toUpperCase()}
              </div>
              <div>
                <div style={{ fontWeight:700, fontSize:14, color:DS.text }}>{active.userName}</div>
                <div style={{ fontSize:11, color: isTyping ? DS.primary : DS.textMuted }}>
                  {isTyping ? '✏️ typing...' : (active.userPhone ? `📞 ${active.userPhone}` : 'Legal Inquiry')}
                </div>
              </div>
            </div>
            <div style={{ display:'flex', gap:8, alignItems:'center' }}>
              {active.userPhone && (
                <a href={`tel:${active.userPhone}`} style={{ display:'flex', alignItems:'center', gap:4, background:'#f3e8ff', color:'#7E22CE', padding:'6px 10px', borderRadius:8, fontSize:12, fontWeight:600, textDecoration:'none' }}>
                  <Phone size={13}/> Call
                </a>
              )}
              <button onClick={() => setActive(null)} style={{ background:'none', border:'none', cursor:'pointer', color:DS.textMuted }}>
                <X size={16}/>
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="llc-scroll" style={{ flex:1, overflowY:'auto', padding:'14px', background:DS.chatBg, display:'flex', flexDirection:'column', gap:4 }}>
            {messages.map(msg => (
              <div key={msg.id} className="llc-msg"
                style={{ display:'flex', flexDirection:'column', alignItems: msg.from === 'lawyer' ? 'flex-end' : 'flex-start', marginBottom:2 }}>
                {msg.from !== 'lawyer' && (
                  <span style={{ fontSize:10, color:'#7E22CE', fontWeight:700, marginBottom:2, marginLeft:10 }}>
                    {msg.senderName}
                  </span>
                )}
                <div style={{
                  maxWidth:'75%', padding:'7px 10px 5px',
                  background: msg.from === 'lawyer' ? DS.sent : DS.recv,
                  borderRadius: msg.from === 'lawyer' ? '8px 0 8px 8px' : '0 8px 8px 8px',
                  boxShadow:'0 1px 2px rgba(0,0,0,0.1)', position:'relative',
                }}>
                  <div style={{ position:'absolute', top:0,
                    [msg.from === 'lawyer' ? 'right' : 'left']: -7, width:0, height:0, borderStyle:'solid',
                    borderWidth: msg.from === 'lawyer' ? '0 8px 8px 0' : '0 0 8px 8px',
                    borderColor: msg.from === 'lawyer'
                      ? `transparent ${DS.sent} transparent transparent`
                      : `transparent transparent transparent ${DS.recv}`,
                  }}/>
                  <p style={{ fontSize:13, color:DS.text, margin:0, lineHeight:1.5, whiteSpace:'pre-wrap', wordBreak:'break-word' }}>
                    {msg.text}
                  </p>
                  <div style={{ display:'flex', justifyContent:'flex-end', alignItems:'center', gap:3, marginTop:3 }}>
                    <span style={{ fontSize:10, color:'#667781' }}>{msg.time}</span>
                    {msg.from === 'lawyer' && (
                      <span style={{ fontSize:12, color: msg.status === 'seen' ? '#7E22CE' : '#aaa' }}>
                        {msg.status === 'error' ? '⚠' : '✓✓'}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
            {isTyping && (
              <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:4 }}>
                <div style={{ padding:'10px 14px', background:DS.recv, borderRadius:'0 8px 8px 8px', boxShadow:'0 1px 2px rgba(0,0,0,0.1)', display:'flex', gap:4 }}>
                  {[0,1,2].map(i => <span key={i} style={{ width:7, height:7, borderRadius:'50%', background:'#aaa', display:'block', animation:`llc-dot 1.2s infinite`, animationDelay:`${i*0.2}s` }}/>)}
                </div>
              </div>
            )}
            <div ref={endRef}/>
          </div>

          {/* Input */}
          <div style={{ padding:'10px 12px', background:'#f5f0ff', display:'flex', alignItems:'center', gap:8, borderTop:`1px solid ${DS.border}` }}>
            <input
              ref={inputRef}
              className="llc-input"
              value={input}
              onChange={handleInput}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()}
              placeholder="Reply to client..."
              style={{ flex:1, background:'#fff', border:'none', borderRadius:24, padding:'10px 16px', fontSize:13.5, color:DS.text, boxShadow:'0 1px 2px rgba(0,0,0,0.08)' }}
            />
            <button className="llc-send" onClick={send} disabled={!input.trim() || sending}
              style={{
                width:42, height:42, borderRadius:'50%', border:'none',
                background: input.trim() ? '#7E22CE' : '#ccc',
                cursor: input.trim() ? 'pointer' : 'not-allowed',
                display:'flex', alignItems:'center', justifyContent:'center',
                flexShrink:0, transition:'all 0.2s',
              }}>
              <Send size={16} color="#fff"/>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}