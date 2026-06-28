import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getNotifications, markAllAsRead, markOneAsRead } from '../../api/notificationApi';
import { Bell, Heart, MessageCircle, UserPlus, Briefcase, CheckCheck } from 'lucide-react';
import { timeAgo } from '../../utils/helpers';
import { Link } from 'react-router-dom';

const iconMap = {
  POST_LIKED: { icon: Heart, color: '#f43f5e' },
  POST_COMMENTED: { icon: MessageCircle, color: '#a855f7' },
  POST_CREATED: { icon: Bell, color: '#f59e0b' },
  CONNECTION_REQUESTED: { icon: UserPlus, color: '#10b981' },
  CONNECTION_ACCEPTED: { icon: UserPlus, color: '#7c3aed' },
  MESSAGE_RECEIVED: { icon: MessageCircle, color: '#e879f9' },
  JOB_APPLIED: { icon: Briefcase, color: '#f59e0b' },
};

const NotificationDropdown = ({ onClose }) => {
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

  const unread = notifications?.filter(n => !n.read) || [];

  return (
    <div style={{
      position: 'absolute', top: '100%', right: 0, marginTop: 8,
      width: 360, background: 'var(--bg-surface)', border: '1px solid var(--border)',
      borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow)', zIndex: 200, overflow: 'hidden',
    }}>
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '14px 16px', borderBottom: '1px solid var(--border)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontWeight: 700, fontSize: 14 }}>Notifications</span>
          {unread.length > 0 && (
            <span style={{
              background: 'var(--primary-light)', color: 'var(--accent)',
              fontSize: 10, fontWeight: 700, padding: '1px 6px', borderRadius: 'var(--radius-full)',
            }}>
              {unread.length} new
            </span>
          )}
        </div>
        {unread.length > 0 && (
          <button className="btn-ghost" style={{ fontSize: 11, padding: '4px 8px', color: 'var(--accent)' }}
            onClick={() => markAllMutation.mutate()}>
            <CheckCheck size={12} /> Mark all read
          </button>
        )}
      </div>

      <div style={{ maxHeight: 380, overflowY: 'auto' }}>
        {isLoading ? (
          <div style={{ textAlign: 'center', padding: 32, color: 'var(--text-muted)', fontSize: 13 }}>
            Loading...
          </div>
        ) : notifications?.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>
            <Bell size={28} style={{ margin: '0 auto 8px', opacity: 0.2 }} />
            <p style={{ fontSize: 13 }}>All caught up!</p>
          </div>
        ) : (
          notifications?.slice(0, 10).map(n => {
            const config = iconMap[n.type] || iconMap.POST_CREATED;
            const Icon = config.icon;
            return (
              <div key={n.id}
                onClick={() => { if (!n.read) markOneMutation.mutate(n.id); onClose?.(); }}
                style={{
                  display: 'flex', gap: 10, padding: '12px 16px', cursor: 'pointer',
                  background: !n.read ? 'rgba(124,58,237,0.06)' : 'transparent',
                  borderBottom: '1px solid var(--border)', transition: 'background 0.2s',
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
                onMouseLeave={e => e.currentTarget.style.background = !n.read ? 'rgba(124,58,237,0.06)' : 'transparent'}
              >
                <div style={{
                  width: 34, height: 34, borderRadius: '50%',
                  background: `${config.color}20`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}>
                  <Icon size={15} style={{ color: config.color }} />
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 12, color: 'var(--text-primary)', lineHeight: 1.5 }}>
                    <span style={{ fontWeight: 700 }}>{n.actorName}</span> {n.message?.replace(n.actorName, '').trim()}
                  </p>
                  <p style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 3 }}>{timeAgo(n.createdAt)}</p>
                </div>
                {!n.read && (
                  <div style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--primary)', flexShrink: 0, marginTop: 4 }} />
                )}
              </div>
            );
          })
        )}
      </div>

      <Link to="/notifications" onClick={onClose} style={{
        display: 'block', textAlign: 'center', padding: '12px',
        fontSize: 13, color: 'var(--accent)', fontWeight: 600,
        textDecoration: 'none', borderTop: '1px solid var(--border)',
        transition: 'background 0.2s',
      }}
        onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
      >
        View all notifications →
      </Link>
    </div>
  );
};

export default NotificationDropdown;