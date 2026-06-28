import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Layout from '../components/layout/Layout';
import { getConversations, getMessages, sendMessage } from '../api/messagingApi';
import useAuthStore from '../store/authStore';
import Avatar from '../components/ui/Avatar';
import { Send, Loader2, MessageCircle, Search, Plus, X } from 'lucide-react';
import { timeAgo } from '../utils/helpers';
import useWebSocket from '../hooks/useWebSocket';
import api from '../api/axios';
import toast from 'react-hot-toast';

// ─── New Message Search Component ─────────────────────────
const NewMessageSearch = ({ onSelect, selectedName }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!query.trim()) { setResults([]); return; }
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await api.get(`/users/search?keyword=${encodeURIComponent(query)}`);
        setResults(res.data || []);
      } catch {}
      setLoading(false);
    }, 400);
    return () => clearTimeout(timer);
  }, [query]);

  return (
    <div>
      <label style={{
        display: 'block', fontSize: 11, fontWeight: 600,
        color: 'var(--text-secondary)', marginBottom: 6,
        textTransform: 'uppercase', letterSpacing: '0.5px',
      }}>
        To
      </label>

      {selectedName ? (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '8px 12px', background: 'var(--primary-light)',
          borderRadius: 'var(--radius-sm)', border: '1px solid var(--primary)',
        }}>
          <span style={{ fontSize: 13, color: 'var(--accent)', fontWeight: 600 }}>
            {selectedName}
          </span>
          <button
            onClick={() => onSelect('', '')}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'var(--danger)', marginLeft: 'auto',
              display: 'flex', alignItems: 'center',
            }}
          >
            <X size={14} />
          </button>
        </div>
      ) : (
        <div style={{ position: 'relative' }}>
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search by name..."
            autoFocus
            style={{
              width: '100%', background: 'var(--bg-input)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-sm)', color: 'var(--text-primary)',
              padding: '10px 14px', fontSize: 13, outline: 'none',
            }}
            onFocus={e => e.target.style.borderColor = 'var(--primary)'}
            onBlur={e => e.target.style.borderColor = 'var(--border)'}
          />

          {(results.length > 0 || loading) && (
            <div style={{
              position: 'absolute', top: '100%', left: 0, right: 0, marginTop: 4,
              background: 'var(--bg-surface)', border: '1px solid var(--border)',
              borderRadius: 'var(--radius-sm)', boxShadow: 'var(--shadow)',
              zIndex: 10, maxHeight: 220, overflowY: 'auto',
            }}>
              {loading ? (
                <div style={{ padding: 16, textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
                  Searching...
                </div>
              ) : results.length === 0 ? (
                <div style={{ padding: 16, textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
                  No users found
                </div>
              ) : (
                results.map(u => (
                  <div
                    key={u.userId}
                    onClick={() => { onSelect(u.userId, u.fullName); setQuery(''); setResults([]); }}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 10,
                      padding: '10px 14px', cursor: 'pointer', transition: 'background 0.2s',
                      borderBottom: '1px solid var(--border)',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <Avatar name={u.fullName} src={u.profilePictureUrl} size="sm" />
                    <div>
                      <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>
                        {u.fullName}
                      </p>
                      {u.headline && (
                        <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 1 }}>
                          {u.headline}
                        </p>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ─── Main Messaging Page ───────────────────────────────────
const MessagingPage = () => {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [selectedConv, setSelectedConv] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [searchConv, setSearchConv] = useState('');
  const [showNewMessage, setShowNewMessage] = useState(false);
  const [newMsgReceiverId, setNewMsgReceiverId] = useState('');
  const [newMsgReceiverName, setNewMsgReceiverName] = useState('');
  const [newMsgContent, setNewMsgContent] = useState('');
  const messagesEndRef = useRef(null);

  // WebSocket for real-time
  useWebSocket((message) => {
    queryClient.invalidateQueries(['messages', selectedConv?.id]);
    queryClient.invalidateQueries(['conversations']);
    if (message.senderId !== user?.userId) {
      toast(`💬 ${message.senderName}: ${message.content?.slice(0, 40)}`, {
        style: {
          background: 'var(--bg-card)', color: 'var(--text-primary)',
          border: '1px solid var(--border)', borderRadius: '12px',
        },
      });
    }
  });

  const { data: conversations, isLoading: loadingConvs } = useQuery({
    queryKey: ['conversations'],
    queryFn: () => getConversations().then(r => r.data),
    refetchInterval: 10000,
  });

  const { data: messages, isLoading: loadingMessages } = useQuery({
    queryKey: ['messages', selectedConv?.id],
    queryFn: () => getMessages(selectedConv.id).then(r => r.data),
    enabled: !!selectedConv,
    refetchInterval: 5000,
  });

  const sendMutation = useMutation({
    mutationFn: () => {
      const other = selectedConv.participantOne === user?.userId
        ? selectedConv.participantTwo
        : selectedConv.participantOne;
      const otherName = selectedConv.participantOne === user?.userId
        ? selectedConv.participantTwoName
        : selectedConv.participantOneName;
      return sendMessage({ receiverId: other, receiverName: otherName, content: newMessage });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['messages', selectedConv?.id]);
      queryClient.invalidateQueries(['conversations']);
      setNewMessage('');
    },
    onError: () => toast.error('Failed to send message'),
  });

  const newConvMutation = useMutation({
    mutationFn: () => sendMessage({
      receiverId: newMsgReceiverId,
      receiverName: newMsgReceiverName,
      content: newMsgContent,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries(['conversations']);
      setShowNewMessage(false);
      setNewMsgReceiverId('');
      setNewMsgReceiverName('');
      setNewMsgContent('');
      toast.success('Message sent!');
    },
    onError: () => toast.error('Failed to send message'),
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const getOther = (conv) => {
    if (!conv || !user) return { name: '', id: '' };
    if (conv.participantOne === user.userId) {
      return { name: conv.participantTwoName, id: conv.participantTwo };
    }
    return { name: conv.participantOneName, id: conv.participantOne };
  };

  const filteredConvs = conversations?.filter(c =>
    getOther(c).name?.toLowerCase().includes(searchConv.toLowerCase())
  ) || [];

  return (
    <Layout>
      <div style={{
        background: 'var(--bg-surface)', border: '1px solid var(--border)',
        borderRadius: 'var(--radius-lg)', overflow: 'hidden',
        height: 'calc(100vh - 90px)', display: 'flex',
      }}>

        {/* ── Left Sidebar ─────────────────────────────── */}
        <div style={{
          width: 300, borderRight: '1px solid var(--border)',
          display: 'flex', flexDirection: 'column', flexShrink: 0,
        }}>
          {/* Header */}
          <div style={{ padding: 16, borderBottom: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <h2 style={{ fontSize: 16, fontWeight: 700 }}>Messages</h2>
              <button
                className="btn-primary"
                style={{ padding: '6px 12px', fontSize: 12 }}
                onClick={() => setShowNewMessage(true)}
              >
                <Plus size={14} /> New
              </button>
            </div>

            {/* Search conversations */}
            <div style={{ position: 'relative' }}>
              <Search size={13} style={{
                position: 'absolute', left: 10, top: '50%',
                transform: 'translateY(-50%)', color: 'var(--text-muted)',
              }} />
              <input
                value={searchConv}
                onChange={e => setSearchConv(e.target.value)}
                placeholder="Search conversations..."
                style={{
                  width: '100%', background: 'var(--bg-card)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-sm)', color: 'var(--text-primary)',
                  padding: '7px 10px 7px 28px', fontSize: 12, outline: 'none',
                }}
                onFocus={e => e.target.style.borderColor = 'var(--primary)'}
                onBlur={e => e.target.style.borderColor = 'var(--border)'}
              />
            </div>
          </div>

          {/* Conversations List */}
          <div style={{ overflowY: 'auto', flex: 1 }}>
            {loadingConvs ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: 32 }}>
                <Loader2 size={22} style={{ color: 'var(--primary)', animation: 'spin 1s linear infinite' }} />
              </div>
            ) : filteredConvs.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 40 }}>
                <MessageCircle size={32} style={{ color: 'var(--text-muted)', margin: '0 auto 8px', opacity: 0.2 }} />
                <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>No conversations yet</p>
                <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
                  Click "New" to start one
                </p>
              </div>
            ) : (
              filteredConvs.map(conv => {
                const other = getOther(conv);
                const isSelected = selectedConv?.id === conv.id;
                return (
                  <div
                    key={conv.id}
                    onClick={() => setSelectedConv(conv)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 10,
                      padding: '12px 14px', cursor: 'pointer', transition: 'background 0.2s',
                      background: isSelected ? 'var(--primary-light)' : 'transparent',
                      borderBottom: '1px solid var(--border)',
                    }}
                    onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = 'var(--bg-hover)'; }}
                    onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = 'transparent'; }}
                  >
                    <Avatar name={other.name} size="md" />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <p style={{
                          fontWeight: 600, fontSize: 13, color: isSelected ? 'var(--accent)' : 'var(--text-primary)',
                          overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis',
                        }}>
                          {other.name}
                        </p>
                        {conv.unreadCount > 0 && (
                          <span style={{
                            background: 'var(--primary)', color: 'white',
                            fontSize: 10, fontWeight: 700, borderRadius: '50%',
                            width: 18, height: 18, display: 'flex',
                            alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                          }}>
                            {conv.unreadCount > 9 ? '9+' : conv.unreadCount}
                          </span>
                        )}
                      </div>
                      <p style={{
                        fontSize: 11, color: 'var(--text-muted)', marginTop: 2,
                        overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis',
                      }}>
                        {conv.lastMessage || 'Start a conversation'}
                      </p>
                      {conv.lastMessageAt && (
                        <p style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>
                          {timeAgo(conv.lastMessageAt)}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* ── Chat Area ─────────────────────────────────── */}
        {selectedConv ? (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>

            {/* Chat Header */}
            <div style={{
              padding: '12px 20px', borderBottom: '1px solid var(--border)',
              display: 'flex', alignItems: 'center', gap: 12,
              background: 'var(--bg-surface)',
            }}>
              <Avatar name={getOther(selectedConv).name} size="md" />
              <div>
                <p style={{ fontWeight: 700, fontSize: 15 }}>{getOther(selectedConv).name}</p>
                <p style={{ fontSize: 11, color: 'var(--success)', fontWeight: 600 }}>● Active</p>
              </div>
            </div>

            {/* Messages */}
            <div style={{
              flex: 1, overflowY: 'auto', padding: '20px 24px',
              display: 'flex', flexDirection: 'column', gap: 10,
              background: 'var(--bg-primary)',
            }}>
              {loadingMessages ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: 32 }}>
                  <Loader2 size={22} style={{ color: 'var(--primary)', animation: 'spin 1s linear infinite' }} />
                </div>
              ) : messages?.content?.length === 0 ? (
                <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>
                  <MessageCircle size={32} style={{ margin: '0 auto 10px', opacity: 0.2 }} />
                  <p style={{ fontSize: 13 }}>No messages yet. Say hello! 👋</p>
                </div>
              ) : (
                [...(messages?.content || [])].reverse().map((msg, idx, arr) => {
                  const isMe = msg.senderId === user?.userId;
                  const prevMsg = arr[idx - 1];
                  const showAvatar = !prevMsg || prevMsg.senderId !== msg.senderId;

                  return (
                    <div key={msg.id} style={{
                      display: 'flex', justifyContent: isMe ? 'flex-end' : 'flex-start',
                      alignItems: 'flex-end', gap: 8,
                    }}>
                      {/* Other person avatar */}
                      {!isMe && (
                        <div style={{ width: 28, flexShrink: 0 }}>
                          {showAvatar && <Avatar name={getOther(selectedConv).name} size="xs" />}
                        </div>
                      )}

                      <div style={{ maxWidth: '65%' }}>
                        {/* Message bubble */}
                        <div style={{
                          padding: '10px 16px',
                          borderRadius: 18,
                          borderBottomRightRadius: isMe ? 4 : 18,
                          borderBottomLeftRadius: isMe ? 18 : 4,
                          background: isMe ? 'var(--primary)' : 'var(--bg-card)',
                          border: isMe ? 'none' : '1px solid var(--border)',
                        }}>
                          <p style={{
                            fontSize: 13, lineHeight: 1.6,
                            color: isMe ? 'white' : 'var(--text-primary)',
                            wordBreak: 'break-word',
                          }}>
                            {msg.content}
                          </p>
                        </div>

                        {/* Timestamp */}
                        <p style={{
                          fontSize: 10, marginTop: 3,
                          color: 'var(--text-muted)',
                          textAlign: isMe ? 'right' : 'left',
                        }}>
                          {timeAgo(msg.createdAt)}
                          {isMe && msg.seen && ' · Seen ✓'}
                        </p>
                      </div>

                      {/* Own avatar */}
                      {isMe && (
                        <div style={{ width: 28, flexShrink: 0 }}>
                          {showAvatar && <Avatar name={user?.fullName} size="xs" />}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div style={{
              padding: '12px 20px', borderTop: '1px solid var(--border)',
              display: 'flex', gap: 10, alignItems: 'flex-end',
              background: 'var(--bg-surface)',
            }}>
              <textarea
                value={newMessage}
                onChange={e => setNewMessage(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    if (newMessage.trim()) sendMutation.mutate();
                  }
                }}
                placeholder="Write a message... (Enter to send, Shift+Enter for new line)"
                rows={1}
                style={{
                  flex: 1, background: 'var(--bg-card)', border: '1px solid var(--border)',
                  borderRadius: 20, color: 'var(--text-primary)',
                  padding: '10px 18px', fontSize: 13, outline: 'none',
                  resize: 'none', maxHeight: 120, lineHeight: 1.5, transition: 'border-color 0.2s',
                }}
                onFocus={e => e.target.style.borderColor = 'var(--primary)'}
                onBlur={e => e.target.style.borderColor = 'var(--border)'}
                onInput={e => {
                  e.target.style.height = 'auto';
                  e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
                }}
              />
              <button
                onClick={() => newMessage.trim() && sendMutation.mutate()}
                disabled={!newMessage.trim() || sendMutation.isPending}
                style={{
                  width: 42, height: 42, borderRadius: '50%', border: 'none',
                  background: newMessage.trim() ? 'var(--primary)' : 'var(--bg-card)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: newMessage.trim() ? 'pointer' : 'default',
                  color: newMessage.trim() ? 'white' : 'var(--text-muted)',
                  transition: 'all 0.2s', flexShrink: 0,
                }}
              >
                {sendMutation.isPending
                  ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
                  : <Send size={16} />}
              </button>
            </div>
          </div>
        ) : (
          /* Empty State */
          <div style={{
            flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'var(--bg-primary)',
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{
                width: 80, height: 80, borderRadius: '50%', background: 'var(--primary-light)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 20px',
              }}>
                <MessageCircle size={36} style={{ color: 'var(--accent)' }} />
              </div>
              <p style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)' }}>
                Your Messages
              </p>
              <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 8 }}>
                Select a conversation or start a new one
              </p>
              <button
                className="btn-primary"
                style={{ marginTop: 20, padding: '10px 24px' }}
                onClick={() => setShowNewMessage(true)}
              >
                <Plus size={15} /> Start a Conversation
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── New Message Modal ──────────────────────────── */}
      {showNewMessage && (
        <div
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)',
            backdropFilter: 'blur(4px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 300, padding: 24,
          }}
          onClick={e => e.target === e.currentTarget && setShowNewMessage(false)}
        >
          <div style={{
            background: 'var(--bg-surface)', border: '1px solid var(--border)',
            borderRadius: 'var(--radius-lg)', padding: 28, width: '100%', maxWidth: 460,
            boxShadow: 'var(--shadow)',
          }}>
            {/* Modal Header */}
            <div style={{
              display: 'flex', justifyContent: 'space-between',
              alignItems: 'center', marginBottom: 20,
            }}>
              <h2 style={{ fontSize: 18, fontWeight: 700 }}>New Message</h2>
              <button
                className="btn-ghost"
                onClick={() => {
                  setShowNewMessage(false);
                  setNewMsgReceiverId('');
                  setNewMsgReceiverName('');
                  setNewMsgContent('');
                }}
                style={{ padding: '4px 8px' }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Search recipient */}
            <NewMessageSearch
              onSelect={(id, name) => {
                setNewMsgReceiverId(id);
                setNewMsgReceiverName(name);
              }}
              selectedName={newMsgReceiverName}
            />

            {/* Message content — only show after selecting recipient */}
            {newMsgReceiverId && (
              <div style={{ marginTop: 16 }}>
                <label style={{
                  display: 'block', fontSize: 11, fontWeight: 600,
                  color: 'var(--text-secondary)', marginBottom: 6,
                  textTransform: 'uppercase', letterSpacing: '0.5px',
                }}>
                  Message
                </label>
                <textarea
                  value={newMsgContent}
                  onChange={e => setNewMsgContent(e.target.value)}
                  placeholder={`Write a message to ${newMsgReceiverName}...`}
                  autoFocus
                  style={{
                    width: '100%', background: 'var(--bg-input)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-sm)', color: 'var(--text-primary)',
                    padding: 12, fontSize: 13, resize: 'none',
                    minHeight: 110, outline: 'none', lineHeight: 1.6,
                  }}
                  onFocus={e => e.target.style.borderColor = 'var(--primary)'}
                  onBlur={e => e.target.style.borderColor = 'var(--border)'}
                />

                <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                  <button
                    className="btn-primary"
                    style={{ flex: 1, justifyContent: 'center', padding: 11 }}
                    onClick={() => newMsgContent.trim() && newConvMutation.mutate()}
                    disabled={!newMsgContent.trim() || newConvMutation.isPending}
                  >
                    {newConvMutation.isPending
                      ? <Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} />
                      : <Send size={15} />}
                    {newConvMutation.isPending ? 'Sending...' : 'Send Message'}
                  </button>
                  <button
                    className="btn-ghost"
                    style={{
                      flex: 1, justifyContent: 'center', padding: 11,
                      border: '1px solid var(--border)', borderRadius: 'var(--radius-full)',
                    }}
                    onClick={() => setShowNewMessage(false)}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </Layout>
  );
};

export default MessagingPage;