import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Layout from '../components/layout/Layout';
import { getNotifications, markAllAsRead, markOneAsRead } from '../api/notificationApi';
import { Bell, Heart, MessageCircle, UserPlus, Briefcase, CheckCheck, Loader2 } from 'lucide-react';
import { timeAgo } from '../utils/helpers';

const typeConfig = {
  POST_LIKED: { icon: Heart, color: '#f43f5e', bg: '#f43f5e20', label: 'liked your post' },
  POST_COMMENTED: { icon: MessageCircle, color: '#a855f7', bg: '#a855f720', label: 'commented on your post' },
  POST_CREATED: { icon: Bell, color: '#f59e0b', bg: '#f59e0b20', label: 'created a new post' },
  CONNECTION_REQUESTED: { icon: UserPlus, color: '#10b981', bg: '#10b98120', label: 'sent you a connection request' },
  CONNECTION_ACCEPTED: { icon: UserPlus, color: '#7c3aed', bg: '#7c3aed20', label: 'accepted your request' },
  MESSAGE_RECEIVED: { icon: MessageCircle, color: '#e879f9', bg: '#e879f920', label: 'sent you a message' },
  JOB_APPLIED: { icon: Briefcase, color: '#f59e0b', bg: '#f59e0b20', label: 'applied to your job' },
};

const NotificationsPage = () => {
  const queryClient = useQueryClient();

  const { data: notifications, isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => getNotifications().then(r => r.data),
  });

  const markAllMutation = useMutation({
    mutationFn: markAllAsRead,
    onSuccess: () => queryClient.invalidateQueries(['notifications']),
  });

  const markOneMutation = useMutation({
    mutationFn: markOneAsRead,
    onSuccess: () => queryClient.invalidateQueries(['notifications']),
  });

  const unreadCount = notifications?.filter(n => !n.read).length || 0;

  return (
    <Layout>
      <div style={{ maxWidth: 680, margin: '0 auto' }}>
        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>

          {/* Header */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '20px 24px', borderBottom: '1px solid var(--border)',
          }}>
            <div>
              <h1 style={{ fontSize: 20, fontWeight: 700 }}>Notifications</h1>
              {unreadCount > 0 && (
                <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 3 }}>
                  {unreadCount} unread notification{unreadCount > 1 ? 's' : ''}
                </p>
              )}
            </div>
            {unreadCount > 0 && (
              <button className="btn-ghost" onClick={() => markAllMutation.mutate()}
                style={{ color: 'var(--accent)', fontWeight: 600 }}>
                <CheckCheck size={15} /> Mark all read
              </button>
            )}
          </div>

          {/* List */}
          {isLoading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
              <Loader2 size={28} style={{ color: 'var(--primary)', animation: 'spin 1s linear infinite' }} />
            </div>
          ) : notifications?.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 80 }}>
              <Bell size={48} style={{ color: 'var(--text-muted)', margin: '0 auto 12px', opacity: 0.2 }} />
              <p style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-secondary)' }}>All caught up!</p>
              <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 6 }}>No notifications yet</p>
            </div>
          ) : (
            notifications?.map(n => {
              const config = typeConfig[n.type] || typeConfig.POST_CREATED;
              const Icon = config.icon;
              return (
                <div key={n.id}
                  onClick={() => !n.read && markOneMutation.mutate(n.id)}
                  style={{
                    display: 'flex', alignItems: 'flex-start', gap: 14,
                    padding: '16px 24px', cursor: !n.read ? 'pointer' : 'default',
                    background: !n.read ? 'rgba(124,58,237,0.05)' : 'transparent',
                    borderBottom: '1px solid var(--border)',
                    transition: 'background 0.2s',
                  }}
                  onMouseEnter={e => { if (!n.read) e.currentTarget.style.background = 'rgba(124,58,237,0.1)'; }}
                  onMouseLeave={e => { if (!n.read) e.currentTarget.style.background = 'rgba(124,58,237,0.05)'; }}
                >
                  <div style={{
                    width: 42, height: 42, borderRadius: '50%',
                    background: config.bg, display: 'flex', alignItems: 'center',
                    justifyContent: 'center', flexShrink: 0,
                  }}>
                    <Icon size={18} style={{ color: config.color }} />
                  </div>

                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: 13, color: 'var(--text-primary)', lineHeight: 1.5 }}>
                      <span style={{ fontWeight: 700, color: 'var(--text-accent)' }}>{n.actorName}</span>
                      {' '}{config.label}
                    </p>
                    <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
                      {timeAgo(n.createdAt)}
                    </p>
                  </div>

                  {!n.read && (
                    <div style={{
                      width: 8, height: 8, borderRadius: '50%',
                      background: 'var(--primary)', flexShrink: 0, marginTop: 6,
                    }} />
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </Layout>
  );
};

export default NotificationsPage;