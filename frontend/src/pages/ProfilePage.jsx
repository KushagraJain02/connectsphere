import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Layout from '../components/layout/Layout';
import { getProfile, getMyProfile, updateProfile, uploadProfilePicture } from '../api/userApi';
import { getUserPosts } from '../api/postApi';
import { getConnectionStatus, sendRequest, getConnectionCount } from '../api/connectionApi';
import useAuthStore from '../store/authStore';
import Avatar from '../components/ui/Avatar';
import { MapPin, Briefcase, Edit2, Camera, Plus, Loader2, UserCheck, Clock, X, Trash2, Save, Heart, MessageCircle } from 'lucide-react';
import { timeAgo } from '../utils/helpers';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { sendMessage } from '../api/messagingApi';

const Section = ({ title, children, action }) => (
  <div style={{
    background: 'var(--bg-surface)', border: '1px solid var(--border)',
    borderRadius: 'var(--radius-md)', padding: 24, marginBottom: 16,
  }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
      <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>{title}</h2>
      {action}
    </div>
    {children}
  </div>
);

const ProfilePage = () => {
  const { userId } = useParams();
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const isMe = userId === 'me' || userId === user?.userId;
  const [activeTab, setActiveTab] = useState('about');

  // Edit states
  const [editingInfo, setEditingInfo] = useState(false);
  const [editingSkills, setEditingSkills] = useState(false);
  const [editingExp, setEditingExp] = useState(false);
  const [form, setForm] = useState({});
  const [newSkill, setNewSkill] = useState('');
  const [newExp, setNewExp] = useState({ company: '', role: '', startDate: '', endDate: '', description: '' });

  const navigate = useNavigate();

  const messageMutation = useMutation({
    mutationFn: () => sendMessage({
      receiverId: profile.userId,
      receiverName: profile.fullName,
      content: `Hi ${profile.fullName}! I came across your profile and would love to connect.`,
    }),
    onSuccess: () => {
      toast.success('Message sent!');
      navigate('/messaging');
    },
    onError: () => toast.error('Failed to send message'),
  });

  const { data: profile, isLoading } = useQuery({
    queryKey: ['profile', userId],
    queryFn: () => isMe ? getMyProfile().then(r => r.data) : getProfile(userId).then(r => r.data),
  });

  const { data: posts } = useQuery({
    queryKey: ['userPosts', profile?.userId],
    queryFn: () => getUserPosts(profile?.userId).then(r => r.data),
    enabled: !!profile?.userId,
  });

  const { data: connectionStatus } = useQuery({
    queryKey: ['connectionStatus', userId],
    queryFn: () => getConnectionStatus(userId).then(r => r.data),
    enabled: !isMe,
  });

  const { data: connectionCount } = useQuery({
    queryKey: ['connectionCount', profile?.userId],
    queryFn: () => getConnectionCount(profile?.userId).then(r => r.data),
    enabled: !!profile?.userId,
  });

  const updateMutation = useMutation({
    mutationFn: (data) => updateProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['profile', userId]);
      queryClient.invalidateQueries(['myProfile']);
      setEditingInfo(false);
      setEditingSkills(false);
      setEditingExp(false);
      toast.success('Profile updated!');
    },
  });

  const connectMutation = useMutation({
    mutationFn: () => sendRequest(profile.userId, profile.fullName),
    onSuccess: () => {
      queryClient.invalidateQueries(['connectionStatus', userId]);
      toast.success('Connection request sent!');
    },
  });

  const pictureMutation = useMutation({
    mutationFn: (file) => {
      const fd = new FormData();
      fd.append('file', file);
      return uploadProfilePicture(fd);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['profile', userId]);
      queryClient.invalidateQueries(['myProfile']);
      toast.success('Profile picture updated!');
    },
  });

  const handleAddSkill = () => {
    if (!newSkill.trim()) return;
    const updated = [...(form.skills || profile?.skills || []), newSkill.trim()];
    updateMutation.mutate({ ...profile, skills: updated });
    setNewSkill('');
  };

  const handleRemoveSkill = (skill) => {
    const updated = (profile?.skills || []).filter(s => s !== skill);
    updateMutation.mutate({ ...profile, skills: updated });
  };

  const handleAddExp = () => {
    if (!newExp.company || !newExp.role) return;
    const updated = [...(profile?.experiences || []), newExp];
    updateMutation.mutate({ ...profile, experiences: updated });
    setNewExp({ company: '', role: '', startDate: '', endDate: '', description: '' });
  };

  const handleRemoveExp = (idx) => {
    const updated = (profile?.experiences || []).filter((_, i) => i !== idx);
    updateMutation.mutate({ ...profile, experiences: updated });
  };

  if (isLoading) return (
    <Layout>
      <div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}>
        <Loader2 size={36} style={{ color: 'var(--primary)', animation: 'spin 1s linear infinite' }} />
      </div>
    </Layout>
  );

  const inputStyle = {
    background: 'var(--bg-input)', border: '1px solid var(--border)',
    borderRadius: 'var(--radius-sm)', color: 'var(--text-primary)',
    padding: '10px 14px', fontSize: 13, width: '100%', outline: 'none',
  };

  return (
    <Layout>
      <div style={{ maxWidth: 860, margin: '0 auto' }}>

        {/* Header Card */}
        <div style={{
          background: 'var(--bg-surface)', border: '1px solid var(--border)',
          borderRadius: 'var(--radius-lg)', overflow: 'hidden', marginBottom: 16,
        }}>
          {/* Banner */}
          <div style={{ height: 160, background: 'linear-gradient(135deg, #3b0764, #7c3aed, #e879f9)', position: 'relative' }}>
            <div style={{
              position: 'absolute', inset: 0,
              backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(255,255,255,0.1) 1px, transparent 1px)',
              backgroundSize: '30px 30px',
            }} />
          </div>

          <div style={{ padding: '0 32px 28px' }}>
            {/* Avatar + Actions */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: -56 }}>
              <div style={{ position: 'relative' }}>
                <div style={{ border: '4px solid var(--bg-surface)', borderRadius: '50%', display: 'inline-block' }}>
                  <Avatar name={profile?.fullName} src={profile?.profilePictureUrl} size="xl" />
                </div>
                {isMe && (
                  <label style={{
                    position: 'absolute', bottom: 6, right: 6,
                    background: 'var(--primary)', borderRadius: '50%',
                    width: 30, height: 30, display: 'flex', alignItems: 'center',
                    justifyContent: 'center', cursor: 'pointer',
                    border: '2px solid var(--bg-surface)', zIndex: 1,
                  }}>
                    <Camera size={14} color="white" />
                    <input type="file" accept="image/*" style={{ display: 'none' }}
                      onChange={e => pictureMutation.mutate(e.target.files[0])} />
                  </label>
                )}
              </div>

              <div style={{ display: 'flex', gap: 10, paddingBottom: 8 }}>
                {isMe ? (
                  <button className="btn-outline"
                    onClick={() => { setEditingInfo(!editingInfo); setForm({ ...profile }); }}>
                    <Edit2 size={14} /> Edit Profile
                  </button>
                ) : (
                  <>
                    {connectionStatus === 'NOT_CONNECTED' && (
                      <button className="btn-primary" onClick={() => connectMutation.mutate()}>
                        <Plus size={14} /> Connect
                      </button>
                    )}
                    {connectionStatus === 'PENDING' && (
                      <span style={{ padding: '8px 16px', borderRadius: 'var(--radius-full)', border: '1px solid var(--warning)', color: 'var(--warning)', fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Clock size={14} /> Pending
                      </span>
                    )}
                    {connectionStatus === 'ACCEPTED' && (
                      <span style={{ padding: '8px 16px', borderRadius: 'var(--radius-full)', border: '1px solid var(--success)', color: 'var(--success)', fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
                        <UserCheck size={14} /> Connected
                      </span>
                    )}

                    {/* Message button — always show for non-self profiles */}
                    <button className="btn-outline"
                      onClick={() => messageMutation.mutate()}
                      disabled={messageMutation.isPending}
                      style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <MessageCircle size={14} />
                      {messageMutation.isPending ? 'Sending...' : 'Message'}
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Edit Info Form */}
            {editingInfo ? (
              <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  <input value={form.fullName || ''} onChange={e => setForm({ ...form, fullName: e.target.value })}
                    style={inputStyle} placeholder="Full Name" />
                  <input value={form.location || ''} onChange={e => setForm({ ...form, location: e.target.value })}
                    style={inputStyle} placeholder="Location (e.g. Pune, Maharashtra)" />
                </div>
                <input value={form.headline || ''} onChange={e => setForm({ ...form, headline: e.target.value })}
                  style={inputStyle} placeholder="Headline (e.g. Senior Developer at TechCorp)" />
                <textarea value={form.bio || ''} onChange={e => setForm({ ...form, bio: e.target.value })}
                  style={{ ...inputStyle, minHeight: 80, resize: 'vertical' }} placeholder="Bio — tell your story..." />
                <div style={{ display: 'flex', gap: 8 }}>
                  <button className="btn-primary" onClick={() => updateMutation.mutate(form)} disabled={updateMutation.isPending}>
                    {updateMutation.isPending ? <Loader2 size={14} /> : <Save size={14} />} Save
                  </button>
                  <button className="btn-ghost" onClick={() => setEditingInfo(false)}>
                    <X size={14} /> Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div style={{ marginTop: 16 }}>
                <h1 style={{ fontSize: 26, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.5px' }}>
                  {profile?.fullName}
                </h1>
                {profile?.headline && (
                  <p style={{ fontSize: 15, color: 'var(--text-secondary)', marginTop: 4 }}>{profile.headline}</p>
                )}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, marginTop: 10 }}>
                  {profile?.location && (
                    <span style={{ fontSize: 13, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                      <MapPin size={13} /> {profile.location}
                    </span>
                  )}
                  <span style={{ fontSize: 13, color: 'var(--accent)', fontWeight: 700 }}>
                    {connectionCount || 0} connections
                  </span>
                  <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                    {profile?.profileViews || 0} views
                  </span>
                </div>
                {profile?.bio && (
                  <p style={{ marginTop: 12, fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.8, maxWidth: 600 }}>
                    {profile.bio}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Tabs */}
          <div style={{ display: 'flex', borderTop: '1px solid var(--border)', padding: '0 32px' }}>
            {['about', 'experience', 'posts'].map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)} style={{
                padding: '14px 20px', fontSize: 13, fontWeight: 600,
                background: 'transparent', border: 'none', cursor: 'pointer',
                color: activeTab === tab ? 'var(--accent)' : 'var(--text-muted)',
                borderBottom: activeTab === tab ? '2px solid var(--accent)' : '2px solid transparent',
                textTransform: 'capitalize', transition: 'all 0.2s',
              }}>
                {tab === 'about' ? 'Skills' : tab === 'experience' ? 'Experience' : 'Posts'}
              </button>
            ))}
          </div>
        </div>

        {/* Skills Tab */}
        {activeTab === 'about' && (
          <Section title="Skills"
            action={isMe && (
              <button className="btn-ghost" style={{ fontSize: 12, color: 'var(--accent)' }}
                onClick={() => setEditingSkills(!editingSkills)}>
                <Edit2 size={13} /> {editingSkills ? 'Done' : 'Edit'}
              </button>
            )}>
            {/* Add skill input */}
            {editingSkills && isMe && (
              <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
                <input value={newSkill} onChange={e => setNewSkill(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleAddSkill()}
                  placeholder="Add a skill (e.g. Spring Boot)" style={{ ...inputStyle, flex: 1 }} />
                <button className="btn-primary" style={{ padding: '8px 16px', flexShrink: 0 }}
                  onClick={handleAddSkill}>
                  <Plus size={14} /> Add
                </button>
              </div>
            )}

            {profile?.skills?.length > 0 ? (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {profile.skills.map(skill => (
                  <div key={skill} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <span style={{
                      background: 'var(--primary-light)', color: 'var(--accent)',
                      padding: '6px 14px', borderRadius: 'var(--radius-full)',
                      fontSize: 12, fontWeight: 600, border: '1px solid rgba(124,58,237,0.2)',
                    }}>
                      {skill}
                    </span>
                    {editingSkills && isMe && (
                      <button onClick={() => handleRemoveSkill(skill)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--danger)', padding: 2 }}>
                        <X size={12} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: 32, color: 'var(--text-muted)' }}>
                <p style={{ fontSize: 14 }}>No skills added yet</p>
                {isMe && <p style={{ fontSize: 12, marginTop: 6 }}>Click Edit to add your skills</p>}
              </div>
            )}
          </Section>
        )}

        {/* Experience Tab */}
        {activeTab === 'experience' && (
          <Section title="Experience"
            action={isMe && (
              <button className="btn-ghost" style={{ fontSize: 12, color: 'var(--accent)' }}
                onClick={() => setEditingExp(!editingExp)}>
                <Plus size={13} /> {editingExp ? 'Done' : 'Add'}
              </button>
            )}>
            {/* Add experience form */}
            {editingExp && isMe && (
              <div style={{
                background: 'var(--bg-card)', border: '1px solid var(--border)',
                borderRadius: 'var(--radius-sm)', padding: 16, marginBottom: 20,
              }}>
                <p style={{ fontSize: 13, fontWeight: 600, marginBottom: 12, color: 'var(--text-accent)' }}>
                  Add New Experience
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
                  <input value={newExp.company} onChange={e => setNewExp({ ...newExp, company: e.target.value })}
                    style={inputStyle} placeholder="Company *" />
                  <input value={newExp.role} onChange={e => setNewExp({ ...newExp, role: e.target.value })}
                    style={inputStyle} placeholder="Role / Title *" />
                  <input value={newExp.startDate} onChange={e => setNewExp({ ...newExp, startDate: e.target.value })}
                    style={inputStyle} placeholder="Start Date (e.g. 2022-01)" />
                  <input value={newExp.endDate} onChange={e => setNewExp({ ...newExp, endDate: e.target.value })}
                    style={inputStyle} placeholder="End Date (leave blank if current)" />
                </div>
                <textarea value={newExp.description} onChange={e => setNewExp({ ...newExp, description: e.target.value })}
                  style={{ ...inputStyle, minHeight: 70, resize: 'none', marginBottom: 10 }}
                  placeholder="Describe your role and achievements..." />
                <div style={{ display: 'flex', gap: 8 }}>
                  <button className="btn-primary" onClick={handleAddExp} disabled={updateMutation.isPending}>
                    <Save size={13} /> Save Experience
                  </button>
                  <button className="btn-ghost" onClick={() => setEditingExp(false)}>Cancel</button>
                </div>
              </div>
            )}

            {profile?.experiences?.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                {profile.experiences.map((exp, i) => (
                  <div key={i} style={{
                    display: 'flex', gap: 16, paddingBottom: 20, marginBottom: 20,
                    borderBottom: i < profile.experiences.length - 1 ? '1px solid var(--border)' : 'none',
                  }}>
                    <div style={{
                      width: 48, height: 48, background: 'var(--primary-light)',
                      borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center',
                      justifyContent: 'center', flexShrink: 0,
                    }}>
                      <Briefcase size={22} style={{ color: 'var(--accent)' }} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                          <p style={{ fontWeight: 700, fontSize: 15, color: 'var(--text-primary)' }}>{exp.role}</p>
                          <p style={{ fontSize: 13, color: 'var(--accent)', fontWeight: 600, marginTop: 2 }}>{exp.company}</p>
                          <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
                            {exp.startDate} — {exp.endDate || 'Present'}
                          </p>
                        </div>
                        {isMe && (
                          <button onClick={() => handleRemoveExp(i)}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--danger)', padding: 4 }}>
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                      {exp.description && (
                        <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 8, lineHeight: 1.7 }}>
                          {exp.description}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: 32, color: 'var(--text-muted)' }}>
                <Briefcase size={36} style={{ margin: '0 auto 10px', opacity: 0.2 }} />
                <p style={{ fontSize: 14 }}>No experience added yet</p>
                {isMe && <p style={{ fontSize: 12, marginTop: 6 }}>Click Add to add your work experience</p>}
              </div>
            )}
          </Section>
        )}

        {/* Posts Tab */}
        {activeTab === 'posts' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {posts?.length > 0 ? posts.map(post => (
              <div key={post.id} style={{
                background: 'var(--bg-surface)', border: '1px solid var(--border)',
                borderRadius: 'var(--radius-md)', padding: 20,
              }}>
                <p style={{ fontSize: 14, color: 'var(--text-primary)', lineHeight: 1.8 }}>{post.content}</p>
                {post.imageUrl && (
                  <img src={post.imageUrl} alt="post" style={{ marginTop: 12, borderRadius: 8, maxHeight: 300, objectFit: 'cover', width: '100%' }} />
                )}
                <div style={{ display: 'flex', gap: 20, marginTop: 14, paddingTop: 12, borderTop: '1px solid var(--border)' }}>
                  <span style={{ fontSize: 12, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Heart size={13} /> {post.likeCount}
                  </span>
                  <span style={{ fontSize: 12, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <MessageCircle size={13} /> {post.commentCount}
                  </span>
                  <span style={{ fontSize: 12, color: 'var(--text-muted)', marginLeft: 'auto' }}>
                    {timeAgo(post.createdAt)}
                  </span>
                </div>
              </div>
            )) : (
              <div style={{
                textAlign: 'center', padding: 60,
                background: 'var(--bg-surface)', border: '1px solid var(--border)',
                borderRadius: 'var(--radius-md)', color: 'var(--text-muted)',
              }}>
                <p style={{ fontSize: 16 }}>No posts yet</p>
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default ProfilePage;