import { useQuery } from '@tanstack/react-query';
import Layout from '../components/layout/Layout';
import { getFeed } from '../api/postApi';
import { getMyProfile } from '../api/userApi';
import useAuthStore from '../store/authStore';
import CreatePost from '../components/post/CreatePost';
import PostCard from '../components/post/PostCard';
import Avatar from '../components/ui/Avatar';
import { MapPin, Eye, Users, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';

const FeedPage = () => {
  const { user } = useAuthStore();

  const { data: feed, isLoading } = useQuery({
    queryKey: ['feed'],
    queryFn: () => getFeed(0).then(r => r.data),
  });

  const { data: profile } = useQuery({
    queryKey: ['myProfile'],
    queryFn: () => getMyProfile().then(r => r.data),
  });

  return (
    <Layout>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 220px', gap: 20 }}>

        {/* Feed */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <CreatePost profile={profile} />

          {isLoading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
              <Loader2 size={32} style={{ color: 'var(--primary)', animation: 'spin 1s linear infinite' }} />
            </div>
          ) : feed?.content?.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 60, background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', color: 'var(--text-muted)' }}>
              <p style={{ fontSize: 16 }}>No posts yet. Be the first to share!</p>
            </div>
          ) : (
            feed?.content?.map(post => <PostCard key={post.id} post={post} />)
          )}
        </div>

        {/* Right Sidebar */}
        <div>
          <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: 16 }}>
            <h3 style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 12 }}>
              Quick Links
            </h3>
            {[
              { label: '👤 My Profile', path: '/profile/me' },
              { label: '🤝 My Network', path: '/connections' },
              { label: '💼 Browse Jobs', path: '/jobs' },
              { label: '💬 Messages', path: '/messaging' },
              { label: '🔔 Notifications', path: '/notifications' },
            ].map(({ label, path }) => (
              <Link key={path} to={path} style={{
                display: 'block', padding: '8px 10px', borderRadius: 'var(--radius-sm)',
                fontSize: 13, color: 'var(--text-secondary)', textDecoration: 'none', transition: 'all 0.2s',
              }}
                onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-hover)'; e.currentTarget.style.color = 'var(--accent)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
              >
                {label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default FeedPage;