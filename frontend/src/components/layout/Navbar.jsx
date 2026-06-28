import { Link, useNavigate } from 'react-router-dom';
import { LogOut, Search, Bell } from 'lucide-react';
import useAuthStore from '../../store/authStore';
import useNotificationStore from '../../store/notificationStore';
import Avatar from '../ui/Avatar';
import NotificationDropdown from '../notification/NotificationDropdown';
import { useState, useRef, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getMyProfile } from '../../api/userApi';
import { getUnreadCount } from '../../api/notificationApi';

const Navbar = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const notifRef = useRef(null);

  const { data: profile } = useQuery({
    queryKey: ['myProfile'],
    queryFn: () => getMyProfile().then(r => r.data),
    enabled: !!user,
    staleTime: 30000,
  });

  const { data: unreadCount } = useQuery({
    queryKey: ['unreadCount'],
    queryFn: () => getUnreadCount().then(r => r.data),
    enabled: !!user,
    refetchInterval: 20000,
  });

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClick = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
      background: 'rgba(15,15,26,0.97)',
      backdropFilter: 'blur(20px)',
      borderBottom: '1px solid var(--border)',
      height: 56,
      display: 'flex', alignItems: 'center',
    }}>
      <div style={{
        width: '100%', padding: '0 32px',
        display: 'flex', alignItems: 'center', gap: 20,
      }}>

        {/* Logo */}
        <Link to="/feed" style={{ textDecoration: 'none', flexShrink: 0 }}>
          <span className="gradient-text" style={{
            fontSize: 20, fontWeight: 700, letterSpacing: '-0.5px',
          }}>
            ConnectSphere
          </span>
        </Link>

        {/* Search */}
        <div style={{ position: 'relative', flex: 1, maxWidth: 360 }}>
          <Search style={{
            position: 'absolute', left: 12, top: '50%',
            transform: 'translateY(-50%)',
            width: 15, height: 15, color: 'var(--text-muted)',
          }} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && search.trim()) {
                navigate(`/search?q=${encodeURIComponent(search)}`);
                setSearch('');
              }
            }}
            placeholder="Search people, jobs..."
            style={{
              background: 'var(--bg-card)', border: '1px solid var(--border)',
              borderRadius: 'var(--radius-full)', color: 'var(--text-primary)',
              padding: '8px 14px 8px 36px', fontSize: 13,
              width: '100%', outline: 'none', transition: 'border-color 0.2s',
            }}
            onFocus={e => e.target.style.borderColor = 'var(--primary)'}
            onBlur={e => e.target.style.borderColor = 'var(--border)'}
          />
        </div>

        {/* Spacer */}
        <div style={{ flex: 1 }} />

        {/* Right side */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>

          {/* Notification Bell */}
          <div ref={notifRef} style={{ position: 'relative' }}>
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              style={{
                position: 'relative', background: 'transparent',
                border: 'none', cursor: 'pointer', padding: '8px',
                borderRadius: 'var(--radius-sm)', color: 'var(--text-secondary)',
                transition: 'all 0.2s',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = 'var(--bg-hover)';
                e.currentTarget.style.color = 'var(--text-primary)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.color = 'var(--text-secondary)';
              }}
            >
              <Bell size={20} />
              {unreadCount > 0 && (
                <span style={{
                  position: 'absolute', top: 4, right: 4,
                  background: 'var(--danger)', color: 'white',
                  fontSize: 9, fontWeight: 700, borderRadius: '50%',
                  width: 16, height: 16,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  border: '2px solid var(--bg-primary)',
                }}>
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {/* Dropdown */}
            {showNotifications && (
              <NotificationDropdown onClose={() => setShowNotifications(false)} />
            )}
          </div>

          {/* Divider */}
          <div style={{ width: 1, height: 28, background: 'var(--border)' }} />

          {/* Profile */}
          <Link to="/profile/me" style={{
            textDecoration: 'none', display: 'flex',
            alignItems: 'center', gap: 10,
            padding: '4px 8px', borderRadius: 'var(--radius-sm)',
            transition: 'background 0.2s',
          }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            <Avatar src={profile?.profilePictureUrl} name={user?.fullName} size="sm" />
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.2 }}>
                {user?.fullName?.split(' ')[0]}
              </span>
              <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>
                {user?.role === 'RECRUITER' ? '🏢 Recruiter' : '👤 Professional'}
              </span>
            </div>
          </Link>

          {/* Logout */}
          <button
            onClick={() => { logout(); navigate('/login'); }}
            className="btn-ghost"
            style={{ padding: '7px 10px', fontSize: 12, color: 'var(--text-muted)' }}
            title="Sign out"
          >
            <LogOut size={15} />
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;