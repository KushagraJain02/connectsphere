import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useLocation } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import { getAllJobs, searchJobs, createJob, applyForJob, getMyPostedJobs, getMyApplications, closeJob } from '../api/jobApi';
import useAuthStore from '../store/authStore';
import { Briefcase, MapPin, Search, Plus, Loader2, Clock, X, DollarSign, ChevronRight } from 'lucide-react';
import { timeAgo } from '../utils/helpers';
import toast from 'react-hot-toast';
import JobCard from '../components/job/JobCard';

const JobsPage = () => {
  const { user } = useAuthStore();
  const isRecruiter = user?.role === 'RECRUITER';
  const location = useLocation();
  const queryClient = useQueryClient();
  const searchParam = new URLSearchParams(location.search).get('search') || '';

  const [keyword, setKeyword] = useState(searchParam);
  const [selectedJob, setSelectedJob] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [applyForm, setApplyForm] = useState({ coverLetter: '', resumeUrl: '' });
  const [newJob, setNewJob] = useState({
    title: '', description: '', companyName: '',
    location: '', jobType: 'FULL_TIME', experienceLevel: 'MID',
    salaryRange: '', requiredSkills: '',
  });

  const { data: jobs, isLoading } = useQuery({
    queryKey: ['jobs', keyword],
    queryFn: () => keyword ? searchJobs(keyword).then(r => r.data) : getAllJobs().then(r => r.data),
  });

  const { data: myApplications } = useQuery({
    queryKey: ['myApplications'],
    queryFn: () => getMyApplications().then(r => r.data),
    enabled: !isRecruiter,
  });

  const { data: myPostedJobs } = useQuery({
    queryKey: ['myPostedJobs'],
    queryFn: () => getMyPostedJobs().then(r => r.data),
    enabled: isRecruiter,
  });

  const createMutation = useMutation({
    mutationFn: () => createJob({ ...newJob, requiredSkills: newJob.requiredSkills.split(',').map(s => s.trim()).filter(Boolean) }),
    onSuccess: () => {
      queryClient.invalidateQueries(['jobs', '']);
      queryClient.invalidateQueries(['myPostedJobs']);
      setShowCreate(false);
      setNewJob({ title: '', description: '', companyName: '', location: '', jobType: 'FULL_TIME', experienceLevel: 'MID', salaryRange: '', requiredSkills: '' });
      toast.success('Job posted!');
    },
    onError: err => toast.error(err.response?.data?.message || 'Failed'),
  });

  const applyMutation = useMutation({
    mutationFn: () => applyForJob(selectedJob.id, applyForm),
    onSuccess: () => {
      queryClient.invalidateQueries(['jobs', keyword]);
      queryClient.invalidateQueries(['myApplications']);
      setSelectedJob(null);
      setApplyForm({ coverLetter: '', resumeUrl: '' });
      toast.success('Application submitted!');
    },
    onError: err => toast.error(err.response?.data?.message || 'Failed to apply'),
  });

  const statusColors = {
    APPLIED: { bg: '#7c3aed20', color: '#a855f7' },
    REVIEWING: { bg: '#f59e0b20', color: '#f59e0b' },
    SHORTLISTED: { bg: '#10b98120', color: '#10b981' },
    REJECTED: { bg: '#f43f5e20', color: '#f43f5e' },
    HIRED: { bg: '#10b98130', color: '#10b981' },
  };

  const displayJobs = isRecruiter ? myPostedJobs : jobs?.content;

  return (
    <Layout>
      <div style={{ maxWidth: 900, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 16 }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 700 }}>{isRecruiter ? 'Manage Jobs' : 'Find Your Dream Job'}</h1>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>
              {isRecruiter ? `${myPostedJobs?.length || 0} jobs posted` : `${jobs?.totalElements || 0} opportunities available`}
            </p>
          </div>
          {isRecruiter && (
            <button className="btn-primary" onClick={() => setShowCreate(!showCreate)}>
              <Plus size={15} /> Post a Job
            </button>
          )}
        </div>

        {/* Create Job Form */}
        {showCreate && (
          <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--primary)', borderRadius: 'var(--radius-md)', padding: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h2 style={{ fontSize: 17, fontWeight: 700 }}>Post New Job</h2>
              <button className="btn-ghost" onClick={() => setShowCreate(false)} style={{ padding: '4px 8px' }}>
                <X size={16} />
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <input value={newJob.title} onChange={e => setNewJob({ ...newJob, title: e.target.value })}
                  className="input" placeholder="Job Title *" />
                <input value={newJob.companyName} onChange={e => setNewJob({ ...newJob, companyName: e.target.value })}
                  className="input" placeholder="Company Name *" />
              </div>
              <textarea value={newJob.description} onChange={e => setNewJob({ ...newJob, description: e.target.value })}
                className="input" placeholder="Job Description *" style={{ minHeight: 100, resize: 'none' }} />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 12 }}>
                <input value={newJob.location} onChange={e => setNewJob({ ...newJob, location: e.target.value })}
                  className="input" placeholder="Location" />
                <input value={newJob.salaryRange} onChange={e => setNewJob({ ...newJob, salaryRange: e.target.value })}
                  className="input" placeholder="Salary Range" />
                <select value={newJob.jobType} onChange={e => setNewJob({ ...newJob, jobType: e.target.value })}
                  className="input">
                  {['FULL_TIME', 'PART_TIME', 'CONTRACT', 'REMOTE'].map(t => (
                    <option key={t} value={t}>{t.replace('_', ' ')}</option>
                  ))}
                </select>
                <select value={newJob.experienceLevel} onChange={e => setNewJob({ ...newJob, experienceLevel: e.target.value })}
                  className="input">
                  {['ENTRY', 'MID', 'SENIOR'].map(l => (
                    <option key={l} value={l}>{l}</option>
                  ))}
                </select>
              </div>
              <input value={newJob.requiredSkills} onChange={e => setNewJob({ ...newJob, requiredSkills: e.target.value })}
                className="input" placeholder="Required Skills (comma separated: Java, Spring Boot, Docker)" />
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn-primary" onClick={() => createMutation.mutate()} disabled={createMutation.isPending}>
                  {createMutation.isPending ? <Loader2 size={14} /> : null} Post Job
                </button>
                <button className="btn-ghost" onClick={() => setShowCreate(false)}>Cancel</button>
              </div>
            </div>
          </div>
        )}

        {/* Search */}
        {!isRecruiter && (
          <div style={{ position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input value={keyword} onChange={e => setKeyword(e.target.value)}
              placeholder="Search by title, company, location, or skills..."
              style={{
                width: '100%', background: 'var(--bg-surface)', border: '1px solid var(--border)',
                borderRadius: 'var(--radius-md)', color: 'var(--text-primary)',
                padding: '14px 16px 14px 46px', fontSize: 14, outline: 'none',
              }}
              onFocus={e => e.target.style.borderColor = 'var(--primary)'}
              onBlur={e => e.target.style.borderColor = 'var(--border)'}
            />
          </div>
        )}

        {/* My Applications */}
        {!isRecruiter && myApplications?.length > 0 && (
          <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: 20 }}>
            <h2 style={{ fontSize: 15, fontWeight: 700, marginBottom: 14 }}>
              My Applications ({myApplications.length})
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {myApplications.map(app => (
                <div key={app.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: 'var(--bg-card)', borderRadius: 'var(--radius-sm)' }}>
                  <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Application #{app.id.slice(0, 8)}</span>
                  <span style={{
                    ...statusColors[app.status],
                    padding: '3px 10px', borderRadius: 'var(--radius-full)',
                    fontSize: 11, fontWeight: 700,
                  }}>
                    {app.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Jobs List */}
        {isLoading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
            <Loader2 size={32} style={{ color: 'var(--primary)', animation: 'spin 1s linear infinite' }} />
          </div>
        ) : displayJobs?.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 60, background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)' }}>
            <Briefcase size={48} style={{ color: 'var(--text-muted)', margin: '0 auto 12px', opacity: 0.2 }} />
            <p style={{ fontSize: 16, color: 'var(--text-secondary)' }}>No jobs found</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {displayJobs?.map(job => (
              <JobCard key={job.id} job={job} isRecruiter={isRecruiter} />
            ))}
          </div>
        )}

        {/* Apply Modal */}
        {selectedJob && (
          <div style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: 24,
          }}
            onClick={e => e.target === e.currentTarget && setSelectedJob(null)}
          >
            <div style={{
              background: 'var(--bg-surface)', border: '1px solid var(--border)',
              borderRadius: 'var(--radius-lg)', padding: 32, width: '100%', maxWidth: 480,
              boxShadow: 'var(--shadow)',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
                <div>
                  <h2 style={{ fontSize: 20, fontWeight: 700 }}>{selectedJob.title}</h2>
                  <p style={{ fontSize: 13, color: 'var(--accent)', marginTop: 4 }}>{selectedJob.companyName}</p>
                </div>
                <button className="btn-ghost" onClick={() => setSelectedJob(null)} style={{ padding: '4px 8px' }}>
                  <X size={18} />
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Resume URL
                  </label>
                  <input value={applyForm.resumeUrl} onChange={e => setApplyForm({ ...applyForm, resumeUrl: e.target.value })}
                    className="input" placeholder="https://your-resume-link.com" />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Cover Letter
                  </label>
                  <textarea value={applyForm.coverLetter} onChange={e => setApplyForm({ ...applyForm, coverLetter: e.target.value })}
                    className="input" placeholder="Tell them why you're the perfect fit..."
                    style={{ minHeight: 120, resize: 'none' }} />
                </div>
              </div>

              <div style={{ display: 'flex', gap: 10, marginTop: 24 }}>
                <button className="btn-primary" style={{ flex: 1, justifyContent: 'center', padding: 12 }}
                  onClick={() => applyMutation.mutate()} disabled={applyMutation.isPending}>
                  {applyMutation.isPending ? <Loader2 size={15} /> : null}
                  {applyMutation.isPending ? 'Submitting...' : 'Submit Application'}
                </button>
                <button className="btn-ghost" style={{ flex: 1, justifyContent: 'center', padding: 12, border: '1px solid var(--border)', borderRadius: 'var(--radius-full)' }}
                  onClick={() => setSelectedJob(null)}>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default JobsPage;