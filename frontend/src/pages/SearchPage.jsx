import { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import Layout from '../components/layout/Layout';
import { searchJobs } from '../api/jobApi';
import { getAllJobs } from '../api/jobApi';
import Avatar from '../components/ui/Avatar';
import JobCard from '../components/job/JobCard';
import { Search, Users, Briefcase, Loader2 } from 'lucide-react';
import api from '../api/axios';
import useAuthStore from '../store/authStore';

// Search users by name via user-service
const searchUsers = (keyword) => api.get(`/users/search?keyword=${encodeURIComponent(keyword)}`);

const SearchPage = () => {
  const location = useLocation();
  const { user } = useAuthStore();
  const keyword = new URLSearchParams(location.search).get('q') || '';
  const [activeTab, setActiveTab] = useState('people');

  const { data: jobResults, isLoading: loadingJobs } = useQuery({
    queryKey: ['searchJobs', keyword],
    queryFn: () => searchJobs(keyword).then(r => r.data),
    enabled: !!keyword && activeTab === 'jobs',
  });

  return (
    <Layout>
      <div style={{ maxWidth: 780, margin: '0 auto' }}>

        {/* Header */}
        <div style={{
          background: 'var(--bg-surface)', border: '1px solid var(--border)',
          borderRadius: 'var(--radius-md)', padding: '16px 24px', marginBottom: 16,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Search size={18} style={{ color: 'var(--accent)' }} />
            <div>
              <h1 style={{ fontSize: 18, fontWeight: 700 }}>
                Results for "<span style={{ color: 'var(--accent)' }}>{keyword}</span>"
              </h1>
            </div>
          </div>

          {/* Tabs */}
          <div style={{ display: 'flex', gap: 4, marginTop: 14 }}>
            {[
              { key: 'people', label: 'People', icon: Users },
              { key: 'jobs', label: 'Jobs', icon: Briefcase },
            ].map(({ key, label, icon: Icon }) => (
              <button key={key} onClick={() => setActiveTab(key)} style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '8px 16px', borderRadius: 'var(--radius-full)',
                fontSize: 13, fontWeight: 600, cursor: 'pointer',
                background: activeTab === key ? 'var(--primary)' : 'var(--bg-card)',
                color: activeTab === key ? 'white' : 'var(--text-secondary)',
                border: 'none', transition: 'all 0.2s',
              }}>
                <Icon size={14} /> {label}
              </button>
            ))}
          </div>
        </div>

        {/* People Tab */}
        {activeTab === 'people' && (
          <PeopleSearch keyword={keyword} currentUserId={user?.userId} />
        )}

        {/* Jobs Tab */}
        {activeTab === 'jobs' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {loadingJobs ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
                <Loader2 size={28} style={{ color: 'var(--primary)', animation: 'spin 1s linear infinite' }} />
              </div>
            ) : jobResults?.content?.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 60, background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', color: 'var(--text-muted)' }}>
                <Briefcase size={40} style={{ margin: '0 auto 12px', opacity: 0.2 }} />
                <p>No jobs found for "{keyword}"</p>
              </div>
            ) : (
              jobResults?.content?.map(job => <JobCard key={job.id} job={job} />)
            )}
          </div>
        )}
      </div>
    </Layout>
  );
};

// People search component
const PeopleSearch = ({ keyword, currentUserId }) => {
  const { data, isLoading } = useQuery({
    queryKey: ['searchUsers', keyword],
    queryFn: () => api.get(`/users/search?keyword=${encodeURIComponent(keyword)}`).then(r => r.data),
    enabled: !!keyword,
  });

  if (isLoading) return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
      <Loader2 size={28} style={{ color: 'var(--primary)', animation: 'spin 1s linear infinite' }} />
    </div>
  );

  if (!data?.length) return (
    <div style={{ textAlign: 'center', padding: 60, background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', color: 'var(--text-muted)' }}>
      <Users size={40} style={{ margin: '0 auto 12px', opacity: 0.2 }} />
      <p>No people found for "{keyword}"</p>
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {data.map(profile => (
        <div key={profile.userId} style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          background: 'var(--bg-surface)', border: '1px solid var(--border)',
          borderRadius: 'var(--radius-md)', padding: 16,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <Avatar src={profile.profilePictureUrl} name={profile.fullName} size="lg" />
            <div>
              <Link to={`/profile/${profile.userId}`}
                style={{ textDecoration: 'none', fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>
                {profile.fullName}
              </Link>
              <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 2 }}>{profile.headline}</p>
              <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{profile.location}</p>
              {profile.skills?.length > 0 && (
                <div style={{ display: 'flex', gap: 4, marginTop: 6, flexWrap: 'wrap' }}>
                  {profile.skills.slice(0, 3).map(skill => (
                    <span key={skill} style={{
                      background: 'var(--primary-light)', color: 'var(--accent)',
                      padding: '2px 8px', borderRadius: 'var(--radius-full)', fontSize: 11, fontWeight: 600,
                    }}>
                      {skill}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
          {profile.userId !== currentUserId && (
            <Link to={`/profile/${profile.userId}`} className="btn-outline" style={{ textDecoration: 'none', flexShrink: 0 }}>
              View Profile
            </Link>
          )}
        </div>
      ))}
    </div>
  );
};

export default SearchPage;