import React, { useState, useEffect, useRef, useCallback } from 'react';
import { io } from 'socket.io-client';
import { MessageCircle, Send, X, RefreshCw, Circle } from 'lucide-react';

const API = process.env.REACT_APP_API_URL?.replace('/api', '') || 'http://localhost:5000';

const DS = {
  bg:'#F9F6F2', card:'#FFFFFF', border:'#EDE8E3',
  primary:'#C84B00', primaryLight:'#FEF3EE', primaryBorder:'rgba(200,75,0,0.18)',
  text:'#1A0800', textSub:'#6B5748', textMuted:'#9C8B7A',
  sent:'#DCF8C6', recv:'#FFFFFF', chatBg:'#ECE5DD',
};

function fmtTime(d) {
  return new Date(d || Date.now()).toLocaleTimeString([], { hour:'2-digit', minute:'2-digit' });
}
function fmtDate(d) {
  return new Date(d).toLocaleDateString('en-IN', { day:'numeric', month:'short' });
}

export default function AdminLiveChat({ currentUser }) {
  const [sessions,    setSessions]    = useState([]);
  const [active,      setActive]      = useState(null); // selected session
  const [messages,    setMessages]    = useState([]);
  const [input,       setInput]       = useState('');
  const [isTyping,    setIsTyping]    = useState(false);
  const [unreadMap,   setUnreadMap]   = useState({}); // sessionId → count
  const [loading,     setLoading]     = useState(true);
  const [sending,     setSending]     = useState(false);

  const socketRef = useRef(null);
  const endRef    = useRef(null);
  const inputRef  = useRef(null);

  const token = localStorage.getItem('token');

  // ── Fetch all sessions ───────────────────────────────────────────
  const fetchSessions = useCallback(async () => {
    try {
      const res = await fetch(`${API}/api/chat/sessions`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setSessions(data.sessions || []);
    } catch (err) {
      console.error(err);
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
      // Join all active session rooms
      sessions.forEach(s => socket.emit('join-room', s.id));
    });

    // New message from user
    socket.on('receive-message', (data) => {
      if (data.senderRole !== 'USER' && data.senderRole !== 'BOT') return;

      // Add to messages if this session is active
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
          // Mark seen
          socket.emit('messages-seen', { sessionId: data.sessionId });
        } else {
          // Increment unread for other sessions
          setUnreadMap(u => ({ ...u, [data.sessionId]: (u[data.sessionId] || 0) + 1 }));
        }
        return prev;
      });

      // Update session last message preview
      setSessions(prev => prev.map(s =>
        s.id === data.sessionId
          ? { ...s, messages: [{ text: data.text, createdAt: data.createdAt }], updatedAt: new Date().toISOString() }
          : s
      ));
    });

    // User typing
    socket.on('user-typing', (data) => {
      if (data.role === 'USER') setIsTyping(data.typing);
    });

    return () => socket.disconnect();
  }, [sessions.length]); // eslint-disable-line

  // ── Open session ─────────────────────────────────────────────────
  const openSession = async (session) => {
    setActive(session);
    setUnreadMap(u => ({ ...u, [session.id]: 0 }));
    setMessages([]);

    // Join socket room
    socketRef.current?.emit('join-room', session.id);
    socketRef.current?.emit('messages-seen', { sessionId: session.id });

    try {
      const res = await fetch(`${API}/api/chat/session/${session.id}/messages`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setMessages((data.messages || []).map(m => ({
        id:         m.id,
        text:       m.text,
        from:       m.senderRole === 'USER' || m.senderRole === 'BOT' ? (m.senderRole === 'BOT' ? 'bot' : 'user') : 'admin',
        senderName: m.senderName,
        time:       fmtTime(m.createdAt),
        status:     'seen',
      })));
    } catch {}

    setTimeout(() => {
      endRef.current?.scrollIntoView({ behavior: 'smooth' });
      inputRef.current?.focus();
    }, 100);
  };

  // ── Scroll on new messages ────────────────────────────────────────
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // ── Send message ──────────────────────────────────────────────────
  const send = async () => {
    if (!input.trim() || !active || sending) return;
    const text = input.trim();
    setInput('');
    setSending(true);

    const senderName = currentUser?.name || 'Support Team';
    const senderRole = currentUser?.role || 'ADMIN';

    const tempId = Date.now();
    setMessages(prev => [...prev, {
      id: tempId, text, from: 'admin',
      senderName, time: fmtTime(), status: 'sent',
    }]);

    try {
      const res = await fetch(`${API}/api/chat/session/${active.id}/message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ text, senderName, senderRole, senderId: currentUser?.id })
      });
      const saved = await res.json();

      // Emit to user via socket
      socketRef.current?.emit('send-message', {
        sessionId:  active.id,
        id:         saved.message?.id,
        text,
        senderName,
        senderRole,
        createdAt:  new Date().toISOString(),
      });

      setMessages(prev => prev.map(m =>
        m.id === tempId ? { ...m, status: 'delivered', id: saved.message?.id || tempId } : m
      ));

      // Update session preview
      setSessions(prev => prev.map(s =>
        s.id === active.id ? { ...s, messages: [{ text, createdAt: new Date().toISOString() }], updatedAt: new Date().toISOString() } : s
      ));
    } catch {
      setMessages(prev => prev.map(m => m.id === tempId ? { ...m, status: 'error' } : m));
    } finally {
      setSending(false);
    }
  };

  // Typing emit
  const handleInput = (e) => {
    setInput(e.target.value);
    if (active) socketRef.current?.emit('typing', { roomId: active.id, typing: !!e.target.value, role: senderRole });
  };

  const senderRole = currentUser?.role || 'ADMIN';

  const totalUnread = Object.values(unreadMap).reduce((a, b) => a + b, 0);

  // ════════════════════════════════════════════════════════════════
  return (
    <div style={{ display:'flex', height:'100%', minHeight:500, background:DS.bg, borderRadius:20, overflow:'hidden', border:`1px solid ${DS.border}`, fontFamily:"'DM Sans',system-ui,sans-serif" }}>
      <style>{`
        .alc-scroll::-webkit-scrollbar{width:4px}
        .alc-scroll::-webkit-scrollbar-thumb{background:rgba(0,0,0,0.1);border-radius:4px}
        .alc-msg{animation:alc-in 0.2s ease}
        @keyframes alc-in{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
        @keyframes alc-dot{0%,80%,100%{transform:translateY(0)}40%{transform:translateY(-4px)}}
        .alc-session:hover{background:#FEF3EE!important}
        .alc-input:focus{outline:none}
        .alc-send:hover{opacity:0.85}
      `}</style>

      {/* ── LEFT: Session List ─────────────────────────────── */}
      <div style={{ width:280, borderRight:`1px solid ${DS.border}`, display:'flex', flexDirection:'column', background:DS.card, flexShrink:0 }}>

        {/* Header */}
        <div style={{ padding:'16px 16px 12px', borderBottom:`1px solid ${DS.border}` }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
            <div style={{ display:'flex', alignItems:'center', gap:8 }}>
              <MessageCircle size={18} color={DS.primary}/>
              <span style={{ fontWeight:700, fontSize:15, color:DS.text }}>Live Chats</span>
              {totalUnread > 0 && (
                <span style={{ background:DS.primary, color:'#fff', fontSize:10, fontWeight:700, borderRadius:20, padding:'2px 7px' }}>
                  {totalUnread}
                </span>
              )}
            </div>
            <button onClick={fetchSessions} style={{ background:'none', border:'none', cursor:'pointer', color:DS.textMuted }}>
              <RefreshCw size={14} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }}/>
            </button>
          </div>
        </div>

        {/* Sessions */}
        <div className="alc-scroll" style={{ flex:1, overflowY:'auto' }}>
          {loading ? (
            <div style={{ padding:24, textAlign:'center', color:DS.textMuted, fontSize:13 }}>Loading...</div>
          ) : sessions.length === 0 ? (
            <div style={{ padding:24, textAlign:'center' }}>
              <MessageCircle size={36} color={DS.border} style={{ margin:'0 auto 10px' }}/>
              <p style={{ color:DS.textMuted, fontSize:13 }}>Koi active chat nathi</p>
            </div>
          ) : sessions.map(s => {
            const unread = unreadMap[s.id] || 0;
            const isSelected = active?.id === s.id;
            const lastMsg = s.messages?.[0];
            return (
              <div key={s.id} className="alc-session" onClick={() => openSession(s)}
                style={{
                  padding:'12px 14px', cursor:'pointer', borderBottom:`1px solid ${DS.border}`,
                  background: isSelected ? DS.primaryLight : DS.card, transition:'background 0.15s',
                }}>
                <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                  {/* Avatar */}
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
                        {lastMsg?.text?.slice(0,38) || 'No messages yet'}
                        {(lastMsg?.text?.length || 0) > 38 ? '…' : ''}
                      </span>
                      {unread > 0 && (
                        <span style={{ background:DS.primary, color:'#fff', fontSize:10, fontWeight:700, borderRadius:'50%', minWidth:18, height:18, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, marginLeft:4 }}>
                          {unread}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── RIGHT: Chat Area ───────────────────────────────── */}
      {!active ? (
        <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', flexDirection:'column', gap:12 }}>
          <MessageCircle size={52} color={DS.border}/>
          <p style={{ color:DS.textMuted, fontSize:14 }}>Select a conversation</p>
          <p style={{ color:DS.textMuted, fontSize:12 }}>Live chats yahan dikhashe</p>
        </div>
      ) : (
        <div style={{ flex:1, display:'flex', flexDirection:'column', minWidth:0 }}>

          {/* Chat Header */}
          <div style={{ padding:'12px 16px', background:DS.card, borderBottom:`1px solid ${DS.border}`, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
            <div style={{ display:'flex', alignItems:'center', gap:10 }}>
              <div style={{ width:36, height:36, borderRadius:'50%', background:DS.primary+'20', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700, fontSize:15, color:DS.primary }}>
                {active.userName?.[0]?.toUpperCase()}
              </div>
              <div>
                <div style={{ fontWeight:700, fontSize:14, color:DS.text }}>{active.userName}</div>
                <div style={{ fontSize:11, color: isTyping ? DS.primary : DS.textMuted }}>
                  {isTyping ? '✏️ typing...' : (active.userPhone || active.userEmail || 'Guest')}
                </div>
              </div>
            </div>
            <button onClick={() => setActive(null)} style={{ background:'none', border:'none', cursor:'pointer', color:DS.textMuted }}>
              <X size={16}/>
            </button>
          </div>

          {/* Messages */}
          <div className="alc-scroll" style={{
            flex:1, overflowY:'auto', padding:'14px 14px',
            background: DS.chatBg, display:'flex', flexDirection:'column', gap:4,
          }}>
            {messages.map(msg => (
              <div key={msg.id} className="alc-msg"
                style={{ display:'flex', flexDirection:'column', alignItems: msg.from === 'admin' ? 'flex-end' : 'flex-start', marginBottom:2 }}>

                {msg.from !== 'admin' && (
                  <span style={{ fontSize:10, color:'#075E54', fontWeight:700, marginBottom:2, marginLeft:10 }}>
                    {msg.senderName}
                  </span>
                )}

                <div style={{
                  maxWidth:'75%', padding:'7px 10px 5px',
                  background: msg.from === 'admin' ? DS.sent : DS.recv,
                  borderRadius: msg.from === 'admin' ? '8px 0 8px 8px' : '0 8px 8px 8px',
                  boxShadow:'0 1px 2px rgba(0,0,0,0.1)', position:'relative',
                }}>
                  <div style={{ position:'absolute', top:0,
                    [msg.from === 'admin' ? 'right' : 'left']: -7, width:0, height:0, borderStyle:'solid',
                    borderWidth: msg.from === 'admin' ? '0 8px 8px 0' : '0 0 8px 8px',
                    borderColor: msg.from === 'admin'
                      ? `transparent ${DS.sent} transparent transparent`
                      : `transparent transparent transparent ${DS.recv}`,
                  }}/>
                  <p style={{ fontSize:13, color:DS.text, margin:0, lineHeight:1.5, whiteSpace:'pre-wrap', wordBreak:'break-word' }}>
                    {msg.text}
                  </p>
                  <div style={{ display:'flex', justifyContent:'flex-end', alignItems:'center', gap:3, marginTop:3 }}>
                    <span style={{ fontSize:10, color:'#667781' }}>{msg.time}</span>
                    {msg.from === 'admin' && (
                      <span style={{ fontSize:12, color: msg.status==='seen' ? '#53bdeb' : '#aaa' }}>
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
                  {[0,1,2].map(i => <span key={i} style={{ width:7, height:7, borderRadius:'50%', background:'#aaa', display:'block', animation:`alc-dot 1.2s infinite`, animationDelay:`${i*0.2}s` }}/>)}
                </div>
              </div>
            )}
            <div ref={endRef}/>
          </div>

          {/* Input Bar */}
          <div style={{ padding:'10px 12px', background:'#f0f0f0', display:'flex', alignItems:'center', gap:8, borderTop:`1px solid ${DS.border}` }}>
            <input
              ref={inputRef}
              className="alc-input"
              value={input}
              onChange={handleInput}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()}
              placeholder="Type a message..."
              style={{
                flex:1, background:'#fff', border:'none', borderRadius:24,
                padding:'10px 16px', fontSize:13.5, color:DS.text,
                boxShadow:'0 1px 2px rgba(0,0,0,0.08)',
              }}
            />
            <button className="alc-send" onClick={send} disabled={!input.trim() || sending}
              style={{
                width:42, height:42, borderRadius:'50%', border:'none',
                background: input.trim() ? '#075E54' : '#ccc',
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