import { useMutation, useQueryClient } from '@tanstack/react-query';
import { applyForJob, closeJob, deleteJob } from '../../api/jobApi';
import { Briefcase, MapPin, Clock, DollarSign, ChevronRight, X, Trash2 } from 'lucide-react';
import { timeAgo } from '../../utils/helpers';
import useAuthStore from '../../store/authStore';
import { useState } from 'react';
import Modal from '../ui/Modal';
import toast from 'react-hot-toast';

const JobCard = ({ job, isRecruiter = false }) => {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [showApply, setShowApply] = useState(false);
  const [applyForm, setApplyForm] = useState({ coverLetter: '', resumeUrl: '' });

  const applyMutation = useMutation({
    mutationFn: () => applyForJob(job.id, applyForm),
    onSuccess: () => {
      queryClient.invalidateQueries(['jobs']);
      queryClient.invalidateQueries(['myApplications']);
      setShowApply(false);
      toast.success('Application submitted!');
    },
    onError: err => toast.error(err.response?.data?.message || 'Failed to apply'),
  });

  const closeMutation = useMutation({
    mutationFn: () => closeJob(job.id),
    onSuccess: () => { queryClient.invalidateQueries(['myPostedJobs']); toast.success('Job closed'); },
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteJob(job.id),
    onSuccess: () => { queryClient.invalidateQueries(['myPostedJobs']); toast.success('Job deleted'); },
  });

  const inputStyle = {
    background: 'var(--bg-input)', border: '1px solid var(--border)',
    borderRadius: 'var(--radius-sm)', color: 'var(--text-primary)',
    padding: '10px 14px', fontSize: 13, width: '100%', outline: 'none',
  };

  return (
    <>
      <div style={{
        background: 'var(--bg-surface)', border: '1px solid var(--border)',
        borderRadius: 'var(--radius-md)', padding: 20, transition: 'all 0.2s',
      }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(124,58,237,0.15)'; }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}
      >
        <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
          {/* Icon */}
          <div style={{
            width: 52, height: 52, background: 'var(--primary-light)',
            borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center',
            justifyContent: 'center', flexShrink: 0,
          }}>
            <Briefcase size={24} style={{ color: 'var(--accent)' }} />
          </div>

          {/* Info */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>{job.title}</h3>
                <p style={{ fontSize: 13, color: 'var(--accent)', fontWeight: 600, marginTop: 2 }}>{job.companyName}</p>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6, flexShrink: 0 }}>
                <span style={{
                  padding: '3px 10px', borderRadius: 'var(--radius-full)', fontSize: 11, fontWeight: 700,
                  background: job.status === 'OPEN' ? 'var(--success-light)' : 'var(--danger-light)',
                  color: job.status === 'OPEN' ? 'var(--success)' : 'var(--danger)',
                }}>
                  {job.status}
                </span>
                {isRecruiter ? (
                  <div style={{ display: 'flex', gap: 4 }}>
                    {job.status === 'OPEN' && (
                      <button className="btn-ghost" style={{ padding: '4px 8px', fontSize: 11, color: 'var(--warning)' }}
                        onClick={() => closeMutation.mutate()}>
                        Close
                      </button>
                    )}
                    <button className="btn-ghost" style={{ padding: '4px 8px', color: 'var(--danger)' }}
                      onClick={() => deleteMutation.mutate()}>
                      <Trash2 size={13} />
                    </button>
                  </div>
                ) : (
                  job.status === 'OPEN' && (
                    job.alreadyApplied ? (
                      <span style={{ fontSize: 11, color: 'var(--success)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                        ✓ Applied
                      </span>
                    ) : (
                      <button className="btn-primary" style={{ padding: '6px 14px', fontSize: 12 }}
                        onClick={() => setShowApply(true)}>
                        Apply <ChevronRight size={13} />
                      </button>
                    )
                  )
                )}
              </div>
            </div>

            {/* Meta */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginTop: 8 }}>
              {job.location && (
                <span style={{ fontSize: 12, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 3 }}>
                  <MapPin size={12} /> {job.location}
                </span>
              )}
              <span style={{ fontSize: 12, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 3 }}>
                <Clock size={12} /> {timeAgo(job.createdAt)}
              </span>
              {job.salaryRange && (
                <span style={{ fontSize: 12, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 3 }}>
                  <DollarSign size={12} /> {job.salaryRange}
                </span>
              )}
              <span style={{
                fontSize: 11, fontWeight: 600, padding: '2px 8px',
                borderRadius: 'var(--radius-full)', background: 'var(--bg-card)', color: 'var(--text-secondary)',
              }}>
                {job.jobType?.replace('_', ' ')}
              </span>
              <span style={{
                fontSize: 11, fontWeight: 600, padding: '2px 8px',
                borderRadius: 'var(--radius-full)', background: 'var(--bg-card)', color: 'var(--text-secondary)',
              }}>
                {job.experienceLevel}
              </span>
              {isRecruiter && (
                <span style={{ fontSize: 11, color: 'var(--text-muted)', marginLeft: 'auto' }}>
                  {job.applicationCount} applicants
                </span>
              )}
            </div>

            {/* Description */}
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 10, lineHeight: 1.6 }}>
              {job.description?.length > 180 ? job.description.slice(0, 180) + '...' : job.description}
            </p>

            {/* Skills */}
            {job.requiredSkills?.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 10 }}>
                {job.requiredSkills.map(skill => (
                  <span key={skill} style={{
                    background: 'var(--bg-card)', color: 'var(--text-secondary)',
                    padding: '3px 10px', borderRadius: 'var(--radius-full)', fontSize: 11,
                  }}>
                    {skill}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Apply Modal */}
      <Modal isOpen={showApply} onClose={() => setShowApply(false)} title={`Apply — ${job.title}`}>
        <p style={{ fontSize: 13, color: 'var(--accent)', marginBottom: 20, fontWeight: 600 }}>{job.companyName}</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Resume URL
            </label>
            <input value={applyForm.resumeUrl} onChange={e => setApplyForm({ ...applyForm, resumeUrl: e.target.value })}
              style={inputStyle} placeholder="https://your-resume.com" />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Cover Letter
            </label>
            <textarea value={applyForm.coverLetter} onChange={e => setApplyForm({ ...applyForm, coverLetter: e.target.value })}
              style={{ ...inputStyle, minHeight: 120, resize: 'vertical' }}
              placeholder="Why are you the perfect fit for this role?" />
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn-primary" style={{ flex: 1, justifyContent: 'center', padding: 12 }}
              onClick={() => applyMutation.mutate()} disabled={applyMutation.isPending}>
              {applyMutation.isPending ? 'Submitting...' : 'Submit Application'}
            </button>
            <button className="btn-ghost" style={{ flex: 1, justifyContent: 'center', padding: 12, border: '1px solid var(--border)', borderRadius: 'var(--radius-full)' }}
              onClick={() => setShowApply(false)}>
              Cancel
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default JobCard;