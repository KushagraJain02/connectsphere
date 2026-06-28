import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Layout from '../components/layout/Layout';
import { getMyPostedJobs, getJobApplicants, updateApplicationStatus, closeJob, deleteJob } from '../api/jobApi';
import useAuthStore from '../store/authStore';
import Avatar from '../components/ui/Avatar';
import {
  Briefcase, Users, ChevronDown, ChevronUp,
  CheckCircle, XCircle, Eye, Clock,
  Loader2, ExternalLink, Trash2, X
} from 'lucide-react';
import { timeAgo } from '../utils/helpers';
import toast from 'react-hot-toast';

const statusConfig = {
  APPLIED:     { color: '#a855f7', bg: '#a855f720', label: 'Applied',     icon: Clock },
  REVIEWING:   { color: '#f59e0b', bg: '#f59e0b20', label: 'Reviewing',   icon: Eye },
  SHORTLISTED: { color: '#10b981', bg: '#10b98120', label: 'Shortlisted', icon: CheckCircle },
  REJECTED:    { color: '#f43f5e', bg: '#f43f5e20', label: 'Rejected',    icon: XCircle },
  HIRED:       { color: '#10b981', bg: '#10b98130', label: 'Hired ✓',     icon: CheckCircle },
};

const StatusBadge = ({ status }) => {
  const config = statusConfig[status] || statusConfig.APPLIED;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      padding: '4px 10px', borderRadius: 'var(--radius-full)',
      fontSize: 11, fontWeight: 700,
      background: config.bg, color: config.color,
    }}>
      {config.label}
    </span>
  );
};

const ApplicantCard = ({ app, jobId, recruiterToken }) => {
  const queryClient = useQueryClient();
  const [showCover, setShowCover] = useState(false);

  const statusMutation = useMutation({
    mutationFn: (status) => updateApplicationStatus(app.id, status),
    onSuccess: (_, status) => {
      queryClient.invalidateQueries(['applicants', jobId]);
      toast.success(`Marked as ${status}`);
    },
    onError: err => toast.error(err.response?.data?.message || 'Failed'),
  });

  const actions = [
    { label: 'Reviewing', status: 'REVIEWING', color: 'var(--warning)' },
    { label: 'Shortlist', status: 'SHORTLISTED', color: 'var(--success)' },
    { label: 'Reject', status: 'REJECTED', color: 'var(--danger)' },
    { label: 'Hire ✓', status: 'HIRED', color: '#10b981' },
  ];

  return (
    <div style={{
      background: 'var(--bg-card)', border: '1px solid var(--border)',
      borderRadius: 'var(--radius-sm)', padding: 16, transition: 'border-color 0.2s',
    }}
      onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--border-light)'}
      onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
    >
      {/* Applicant Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <Avatar name={app.applicantName} size="md" />
          <div>
            <p style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-primary)' }}>
              {app.applicantName}
            </p>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
              {app.applicantEmail}
            </p>
            <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
              Applied {timeAgo(app.appliedAt)}
            </p>
          </div>
        </div>
        <StatusBadge status={app.status} />
      </div>

      {/* Resume Link */}
      {app.resumeUrl && (
        <a href={app.resumeUrl} target="_blank" rel="noreferrer" style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          marginTop: 12, fontSize: 12, color: 'var(--accent)',
          textDecoration: 'none', fontWeight: 600,
          padding: '5px 12px', background: 'var(--primary-light)',
          borderRadius: 'var(--radius-full)', border: '1px solid rgba(124,58,237,0.2)',
        }}>
          <ExternalLink size={12} /> View Resume
        </a>
      )}

      {/* Cover Letter Toggle */}
      {app.coverLetter && (
        <div style={{ marginTop: 10 }}>
          <button
            onClick={() => setShowCover(!showCover)}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              fontSize: 12, color: 'var(--text-secondary)', fontWeight: 600,
              display: 'flex', alignItems: 'center', gap: 4, padding: 0,
            }}
          >
            {showCover ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            {showCover ? 'Hide' : 'Read'} Cover Letter
          </button>
          {showCover && (
            <div style={{
              marginTop: 8, padding: 14, background: 'var(--bg-surface)',
              borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)',
              fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7,
            }}>
              {app.coverLetter}
            </div>
          )}
        </div>
      )}

      {/* Action Buttons */}
      <div style={{ display: 'flex', gap: 6, marginTop: 14, flexWrap: 'wrap' }}>
        {actions.map(({ label, status, color }) => (
          <button
            key={status}
            onClick={() => statusMutation.mutate(status)}
            disabled={app.status === status || statusMutation.isPending}
            style={{
              padding: '6px 14px', borderRadius: 'var(--radius-full)',
              fontSize: 12, fontWeight: 600, cursor: 'pointer',
              border: `1px solid ${color}`,
              background: app.status === status ? color : 'transparent',
              color: app.status === status ? 'white' : color,
              opacity: app.status === status ? 1 : 0.8,
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => { if (app.status !== status) e.currentTarget.style.background = `${color}20`; }}
            onMouseLeave={e => { if (app.status !== status) e.currentTarget.style.background = 'transparent'; }}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
};

const JobPanel = ({ job }) => {
  const [expanded, setExpanded] = useState(false);
  const queryClient = useQueryClient();

  const { data: applicants, isLoading } = useQuery({
    queryKey: ['applicants', job.id],
    queryFn: () => getJobApplicants(job.id).then(r => r.data),
    enabled: expanded,
  });

  const closeMutation = useMutation({
    mutationFn: () => closeJob(job.id),
    onSuccess: () => { queryClient.invalidateQueries(['myPostedJobs']); toast.success('Job closed'); },
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteJob(job.id),
    onSuccess: () => { queryClient.invalidateQueries(['myPostedJobs']); toast.success('Job deleted'); },
  });

  const statusCounts = applicants ? {
    APPLIED:     applicants.filter(a => a.status === 'APPLIED').length,
    REVIEWING:   applicants.filter(a => a.status === 'REVIEWING').length,
    SHORTLISTED: applicants.filter(a => a.status === 'SHORTLISTED').length,
    REJECTED:    applicants.filter(a => a.status === 'REJECTED').length,
    HIRED:       applicants.filter(a => a.status === 'HIRED').length,
  } : {};

  return (
    <div style={{
      background: 'var(--bg-surface)', border: '1px solid var(--border)',
      borderRadius: 'var(--radius-md)', overflow: 'hidden',
      transition: 'border-color 0.2s',
    }}>
      {/* Job Header */}
      <div
        onClick={() => setExpanded(!expanded)}
        style={{
          padding: 20, cursor: 'pointer', display: 'flex',
          justifyContent: 'space-between', alignItems: 'center',
        }}
        onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
      >
        <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
          <div style={{
            width: 48, height: 48, background: 'var(--primary-light)',
            borderRadius: 'var(--radius-sm)', display: 'flex',
            alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            <Briefcase size={22} style={{ color: 'var(--accent)' }} />
          </div>
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>{job.title}</h3>
            <div style={{ display: 'flex', gap: 12, marginTop: 4, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 12, color: 'var(--accent)', fontWeight: 600 }}>{job.companyName}</span>
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{job.location}</span>
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Posted {timeAgo(job.createdAt)}</span>
              <span style={{
                fontSize: 11, fontWeight: 700, padding: '2px 8px',
                borderRadius: 'var(--radius-full)',
                background: job.status === 'OPEN' ? 'var(--success-light)' : 'var(--danger-light)',
                color: job.status === 'OPEN' ? 'var(--success)' : 'var(--danger)',
              }}>
                {job.status}
              </span>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexShrink: 0 }}>
          {/* Applicant count */}
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontSize: 22, fontWeight: 800, color: 'var(--accent)' }}>
              {job.applicationCount}
            </p>
            <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>applicants</p>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: 6 }} onClick={e => e.stopPropagation()}>
            {job.status === 'OPEN' && (
              <button
                className="btn-ghost"
                style={{ padding: '6px 12px', fontSize: 12, color: 'var(--warning)', border: '1px solid var(--warning)', borderRadius: 'var(--radius-full)' }}
                onClick={() => closeMutation.mutate()}
                disabled={closeMutation.isPending}
              >
                Close Job
              </button>
            )}
            <button
              className="btn-ghost"
              style={{ padding: '6px 8px', color: 'var(--danger)' }}
              onClick={() => deleteMutation.mutate()}
              disabled={deleteMutation.isPending}
            >
              <Trash2 size={14} />
            </button>
          </div>

          {expanded ? <ChevronUp size={20} style={{ color: 'var(--text-muted)' }} /> : <ChevronDown size={20} style={{ color: 'var(--text-muted)' }} />}
        </div>
      </div>

      {/* Applicants Panel */}
      {expanded && (
        <div style={{ borderTop: '1px solid var(--border)', padding: 20 }}>

          {/* Status Summary */}
          {applicants?.length > 0 && (
            <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
              {Object.entries(statusCounts).filter(([, v]) => v > 0).map(([status, count]) => (
                <div key={status} style={{
                  padding: '8px 14px', borderRadius: 'var(--radius-sm)',
                  background: statusConfig[status]?.bg,
                  border: `1px solid ${statusConfig[status]?.color}40`,
                  display: 'flex', alignItems: 'center', gap: 6,
                }}>
                  <span style={{ fontSize: 18, fontWeight: 800, color: statusConfig[status]?.color }}>{count}</span>
                  <span style={{ fontSize: 11, color: statusConfig[status]?.color, fontWeight: 600 }}>
                    {statusConfig[status]?.label}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Applicants List */}
          {isLoading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}>
              <Loader2 size={24} style={{ color: 'var(--primary)', animation: 'spin 1s linear infinite' }} />
            </div>
          ) : applicants?.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>
              <Users size={36} style={{ margin: '0 auto 10px', opacity: 0.2 }} />
              <p style={{ fontSize: 14 }}>No applications yet</p>
              <p style={{ fontSize: 12, marginTop: 4 }}>Share the job posting to attract candidates</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {/* Filter by status */}
              <ApplicantFilter applicants={applicants} jobId={job.id} />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Filter applicants by status
const ApplicantFilter = ({ applicants, jobId }) => {
  const [filter, setFilter] = useState('ALL');

  const filtered = filter === 'ALL'
    ? applicants
    : applicants.filter(a => a.status === filter);

  return (
    <div>
      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 14, flexWrap: 'wrap' }}>
        {['ALL', 'APPLIED', 'REVIEWING', 'SHORTLISTED', 'HIRED', 'REJECTED'].map(f => {
          const count = f === 'ALL' ? applicants.length : applicants.filter(a => a.status === f).length;
          if (count === 0 && f !== 'ALL') return null;
          return (
            <button key={f} onClick={() => setFilter(f)} style={{
              padding: '5px 12px', borderRadius: 'var(--radius-full)',
              fontSize: 11, fontWeight: 700, cursor: 'pointer',
              border: '1px solid var(--border)',
              background: filter === f ? 'var(--primary)' : 'var(--bg-card)',
              color: filter === f ? 'white' : 'var(--text-muted)',
              transition: 'all 0.2s',
            }}>
              {f} ({count})
            </button>
          );
        })}
      </div>

      {/* Applicant Cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {filtered.map(app => (
          <ApplicantCard key={app.id} app={app} jobId={jobId} />
        ))}
      </div>
    </div>
  );
};

const RecruiterDashboardPage = () => {
  const { user } = useAuthStore();

  const { data: jobs, isLoading } = useQuery({
    queryKey: ['myPostedJobs'],
    queryFn: () => getMyPostedJobs().then(r => r.data),
  });

  const openJobs = jobs?.filter(j => j.status === 'OPEN') || [];
  const closedJobs = jobs?.filter(j => j.status === 'CLOSED') || [];
  const totalApplicants = jobs?.reduce((sum, j) => sum + (j.applicationCount || 0), 0) || 0;

  return (
    <Layout>
      <div style={{ maxWidth: 960, margin: '0 auto' }}>

        {/* Header */}
        <div style={{
          background: 'var(--bg-surface)', border: '1px solid var(--border)',
          borderRadius: 'var(--radius-md)', padding: 24, marginBottom: 20,
        }}>
          <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 4 }}>Recruiter Dashboard</h1>
          <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
            Manage your job postings and review applicants
          </p>

          {/* Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginTop: 20 }}>
            {[
              { label: 'Total Jobs Posted', value: jobs?.length || 0, color: 'var(--accent)', icon: Briefcase },
              { label: 'Active Openings', value: openJobs.length, color: 'var(--success)', icon: CheckCircle },
              { label: 'Total Applicants', value: totalApplicants, color: 'var(--warning)', icon: Users },
            ].map(({ label, value, color, icon: Icon }) => (
              <div key={label} style={{
                padding: 16, background: 'var(--bg-card)',
                borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)',
                display: 'flex', alignItems: 'center', gap: 14,
              }}>
                <div style={{ width: 44, height: 44, borderRadius: 'var(--radius-sm)', background: `${color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon size={22} style={{ color }} />
                </div>
                <div>
                  <p style={{ fontSize: 24, fontWeight: 800, color }}>{value}</p>
                  <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Jobs List */}
        {isLoading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
            <Loader2 size={32} style={{ color: 'var(--primary)', animation: 'spin 1s linear infinite' }} />
          </div>
        ) : jobs?.length === 0 ? (
          <div style={{
            textAlign: 'center', padding: 80, background: 'var(--bg-surface)',
            border: '1px solid var(--border)', borderRadius: 'var(--radius-md)',
          }}>
            <Briefcase size={48} style={{ margin: '0 auto 12px', opacity: 0.2, color: 'var(--text-muted)' }} />
            <p style={{ fontSize: 18, fontWeight: 600, color: 'var(--text-secondary)' }}>No jobs posted yet</p>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 6 }}>
              Go to Jobs page to post your first opening
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

            {/* Active Jobs */}
            {openJobs.length > 0 && (
              <div>
                <h2 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 10 }}>
                  Active Openings ({openJobs.length})
                </h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {openJobs.map(job => <JobPanel key={job.id} job={job} />)}
                </div>
              </div>
            )}

            {/* Closed Jobs */}
            {closedJobs.length > 0 && (
              <div style={{ marginTop: 8 }}>
                <h2 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 10 }}>
                  Closed ({closedJobs.length})
                </h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {closedJobs.map(job => <JobPanel key={job.id} job={job} />)}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default RecruiterDashboardPage;