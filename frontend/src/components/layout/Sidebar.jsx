import { Link, useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getMyProfile } from '../../api/userApi';
import { getUnreadCount } from '../../api/notificationApi';
import { getMyConnections } from '../../api/connectionApi';
import useAuthStore from '../../store/authStore';
import Avatar from '../ui/Avatar';
import {
  Home, Users, Briefcase, MessageCircle,
  Bell, User, MapPin, Eye, Award,
  LayoutDashboard,
} from 'lucide-react';

import { getTrendingHashtags } from '../../api/postApi';
import { Hash } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// ─── Single Nav Link ───────────────────────────────────────
const NavLink = ({ to, icon: Icon, label, badge }) => {
  const location = useLocation();
  const active = location.pathname === to;

  return (
    <Link to={to} style={{ textDecoration: 'none' }}>
      <div
        style={{
          display: 'flex', alignItems: 'center', gap: 12,
          padding: '10px 14px', borderRadius: 'var(--radius-sm)',
          background: active ? 'var(--primary-light)' : 'transparent',
          color: active ? 'var(--accent)' : 'var(--text-secondary)',
          fontWeight: active ? 700 : 500, fontSize: 14,
          border: active ? '1px solid rgba(124,58,237,0.2)' : '1px solid transparent',
          transition: 'all 0.2s', position: 'relative',
        }}
        onMouseEnter={e => {
          if (!active) {
            e.currentTarget.style.background = 'var(--bg-hover)';
            e.currentTarget.style.color = 'var(--text-primary)';
          }
        }}
        onMouseLeave={e => {
          if (!active) {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.color = 'var(--text-secondary)';
          }
        }}
      >
        {/* Icon with badge */}
        <div style={{ position: 'relative', flexShrink: 0 }}>
          <Icon size={18} />
          {badge > 0 && (
            <span style={{
              position: 'absolute', top: -6, right: -6,
              background: 'var(--danger)', color: 'white',
              fontSize: 9, fontWeight: 700, borderRadius: '50%',
              width: 16, height: 16,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {badge > 9 ? '9+' : badge}
            </span>
          )}
        </div>
        <span style={{ flex: 1 }}>{label}</span>

        {/* Active indicator */}
        {active && (
          <div style={{
            width: 4, height: 4, borderRadius: '50%',
            background: 'var(--accent)', flexShrink: 0,
          }} />
        )}
      </div>
    </Link>
  );
};

// ─── Sidebar ───────────────────────────────────────────────
const Sidebar = () => {
  const { user } = useAuthStore();
  const isRecruiter = user?.role === 'RECRUITER';
  const navigate = useNavigate();

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

  const { data: connections } = useQuery({
    queryKey: ['connections'],
    queryFn: () => getMyConnections().then(r => r.data),
    enabled: !!user,
    staleTime: 60000,
  });

  const { data: trendingHashtags } = useQuery({
    queryKey: ['trendingHashtags'],
    queryFn: () => getTrendingHashtags().then(r => r.data),
    staleTime: 300000, // 5 minutes
  });

  return (
    <aside style={{
      width: 255, flexShrink: 0,
      display: 'flex', flexDirection: 'column', gap: 12,
      position: 'sticky', top: 72, alignSelf: 'flex-start',
      maxHeight: 'calc(100vh - 90px)', overflowY: 'auto',
    }}>

      {/* ── Profile Card ────────────────────────────────── */}
      <div style={{
        background: 'var(--bg-surface)', border: '1px solid var(--border)',
        borderRadius: 'var(--radius-md)', overflow: 'hidden',
      }}>
        {/* Banner */}
        <div style={{
          height: 56,
          background: 'linear-gradient(135deg, #4c1d95, #7c3aed, #e879f9)',
        }} />

        {/* Profile Info */}
        <div style={{ padding: '0 14px 14px', marginTop: -24 }}>
          <Link to="/profile/me" style={{ textDecoration: 'none', display: 'inline-block' }}>
            <div style={{ border: '3px solid var(--bg-surface)', borderRadius: '50%', display: 'inline-block' }}>
              <Avatar src={profile?.profilePictureUrl} name={user?.fullName} size="md" />
            </div>
          </Link>

          <Link to="/profile/me" style={{ textDecoration: 'none' }}>
            <h3 style={{
              fontWeight: 700, marginTop: 6, fontSize: 14,
              color: 'var(--text-primary)', lineHeight: 1.3,
            }}>
              {user?.fullName}
            </h3>
          </Link>

          <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 3, lineHeight: 1.4 }}>
            {profile?.headline || 'Add a headline'}
          </p>

          {profile?.location && (
            <p style={{
              fontSize: 11, color: 'var(--text-muted)', marginTop: 5,
              display: 'flex', alignItems: 'center', gap: 3,
            }}>
              <MapPin size={10} /> {profile.location}
            </p>
          )}

          {/* Role badge */}
          <div style={{ marginTop: 8 }}>
            <span style={{
              fontSize: 10, fontWeight: 700, padding: '2px 8px',
              borderRadius: 'var(--radius-full)', textTransform: 'uppercase',
              letterSpacing: '0.5px',
              background: isRecruiter ? 'rgba(245,158,11,0.15)' : 'var(--primary-light)',
              color: isRecruiter ? 'var(--warning)' : 'var(--accent)',
            }}>
              {isRecruiter ? '🏢 Recruiter' : '👤 Professional'}
            </span>
          </div>

          {/* Stats */}
          <div style={{
            borderTop: '1px solid var(--border)',
            marginTop: 12, paddingTop: 10,
            display: 'flex', flexDirection: 'column', gap: 6,
          }}>
            {[
              { label: 'Profile views', value: profile?.profileViews || 0, icon: Eye, color: 'var(--accent)' },
              { label: 'Connections', value: connections?.length || 0, icon: Users, color: 'var(--success)' },
            ].map(({ label, value, icon: Icon, color }) => (
              <div key={label} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              }}>
                <span style={{
                  fontSize: 11, color: 'var(--text-muted)',
                  display: 'flex', alignItems: 'center', gap: 4,
                }}>
                  <Icon size={11} /> {label}
                </span>
                <span style={{ fontSize: 13, fontWeight: 700, color }}>{value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Navigation ──────────────────────────────────── */}
      <div style={{
        background: 'var(--bg-surface)', border: '1px solid var(--border)',
        borderRadius: 'var(--radius-md)', padding: '10px 8px',
      }}>
        <p style={{
          fontSize: 10, fontWeight: 700, color: 'var(--text-muted)',
          textTransform: 'uppercase', letterSpacing: '0.8px',
          padding: '4px 14px 8px',
        }}>
          Menu
        </p>

        <NavLink to="/feed"          icon={Home}            label="Home Feed" />
        <NavLink to="/connections"   icon={Users}           label="My Network" />
        <NavLink to="/jobs"          icon={Briefcase}       label="Jobs" />
        <NavLink to="/messaging"     icon={MessageCircle}   label="Messages" />
        <NavLink
          to="/notifications"
          icon={Bell}
          label="Notifications"
          badge={unreadCount || 0}
        />
        <NavLink to="/profile/me"    icon={User}            label="My Profile" />

        {/* Recruiter Dashboard — only for recruiters */}
        {isRecruiter && (
          <>
            <div style={{ height: 1, background: 'var(--border)', margin: '8px 14px' }} />
            <NavLink to="/recruiter" icon={LayoutDashboard} label="Recruiter Dashboard" />
          </>
        )}
      </div>

      {/* ── Top Skills ──────────────────────────────────── */}
      {profile?.skills?.length > 0 && (
        <div style={{
          background: 'var(--bg-surface)', border: '1px solid var(--border)',
          borderRadius: 'var(--radius-md)', padding: 14,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
            <Award size={13} style={{ color: 'var(--accent)' }} />
            <p style={{
              fontSize: 10, fontWeight: 700, color: 'var(--text-muted)',
              textTransform: 'uppercase', letterSpacing: '0.5px',
            }}>
              Top Skills
            </p>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
            {profile.skills.slice(0, 6).map(skill => (
              <span key={skill} style={{
                background: 'var(--primary-light)', color: 'var(--accent)',
                padding: '4px 10px', borderRadius: 'var(--radius-full)',
                fontSize: 11, fontWeight: 600,
                border: '1px solid rgba(124,58,237,0.2)',
              }}>
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* ── Trending Hashtags ───────────────────────────── */}
      {trendingHashtags?.length > 0 && (
        <div style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-md)',
          padding: 14,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
            <Hash size={13} style={{ color: 'var(--accent)' }} />
            <p style={{
              fontSize: 10, fontWeight: 700,
              color: 'var(--text-muted)',
              textTransform: 'uppercase', letterSpacing: '0.5px',
            }}>
              Trending
            </p>
          </div>
          {trendingHashtags.map(tag => (
            <div
              key={tag}
              onClick={() => navigate(`/hashtag/${tag}`)}
              style={{
                padding: '6px 0', cursor: 'pointer',
                fontSize: 13, color: 'var(--accent)',
                fontWeight: 600, transition: 'color 0.2s',
              }}
              onMouseEnter={e => e.currentTarget.style.color = 'var(--text-primary)'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--accent)'}
            >
              #{tag}
            </div>
          ))}
        </div>
      )}

      {/* ── Footer ──────────────────────────────────────── */}
      <div style={{ padding: '8px 4px' }}>
        <p style={{ fontSize: 10, color: 'var(--text-muted)', textAlign: 'center', lineHeight: 1.6 }}>
          ConnectSphere © 2026
        </p>
      </div>
    </aside>
  );
};

export default Sidebar;