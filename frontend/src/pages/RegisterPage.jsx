import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { register } from '../api/authApi';
import { createProfile } from '../api/userApi';
import useAuthStore from '../store/authStore';
import toast from 'react-hot-toast';
import { Loader2, Mail, Lock, User, Briefcase } from 'lucide-react';

const RegisterPage = () => {
  const [form, setForm] = useState({ fullName: '', email: '', password: '', role: 'USER' });
  const [loading, setLoading] = useState(false);
  const { login: setAuth } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await register(form);
      setAuth(data.token, data);
      await createProfile(data.userId, data.fullName, data.email);
      toast.success(`Welcome, ${data.fullName}!`);
      navigate('/feed');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh', background: 'var(--bg-primary)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24,
    }}>
      <div style={{
        position: 'fixed', top: '20%', left: '50%', transform: 'translateX(-50%)',
        width: 600, height: 400, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(124,58,237,0.15) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      <div style={{ width: '100%', maxWidth: 440, position: 'relative' }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <h1 className="gradient-text" style={{ fontSize: 36, fontWeight: 700, letterSpacing: '-1px' }}>
            ConnectSphere
          </h1>
          <p style={{ color: 'var(--text-muted)', marginTop: 8 }}>
            Join the premium professional network
          </p>
        </div>

        <div style={{
          background: 'var(--bg-surface)', border: '1px solid var(--border)',
          borderRadius: 'var(--radius-lg)', padding: 36, boxShadow: 'var(--shadow)',
        }}>
          <h2 style={{ fontSize: 22, fontWeight: 600, marginBottom: 24 }}>Create account</h2>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {[
              { label: 'Full Name', key: 'fullName', type: 'text', icon: User, placeholder: 'John Doe' },
              { label: 'Email', key: 'email', type: 'email', icon: Mail, placeholder: 'john@example.com' },
              { label: 'Password', key: 'password', type: 'password', icon: Lock, placeholder: '••••••••' },
            ].map(({ label, key, type, icon: Icon, placeholder }) => (
              <div key={key}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  {label}
                </label>
                <div style={{ position: 'relative' }}>
                  <Icon size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input type={type} value={form[key]}
                    onChange={e => setForm({ ...form, [key]: e.target.value })}
                    className="input" style={{ paddingLeft: 36 }}
                    placeholder={placeholder} required minLength={key === 'password' ? 8 : undefined}
                  />
                </div>
              </div>
            ))}

            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                I am a
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                {[
                  { value: 'USER', label: 'Professional', icon: '👤' },
                  { value: 'RECRUITER', label: 'Recruiter', icon: '🏢' },
                ].map(({ value, label, icon }) => (
                  <button key={value} type="button"
                    onClick={() => setForm({ ...form, role: value })}
                    style={{
                      padding: '10px', borderRadius: 'var(--radius-sm)', cursor: 'pointer',
                      border: form.role === value ? '1px solid var(--primary)' : '1px solid var(--border)',
                      background: form.role === value ? 'var(--primary-light)' : 'var(--bg-input)',
                      color: form.role === value ? 'var(--accent)' : 'var(--text-secondary)',
                      fontSize: 13, fontWeight: 600, transition: 'all 0.2s',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                    }}>
                    {icon} {label}
                  </button>
                ))}
              </div>
            </div>

            <button type="submit" className="btn-primary"
              style={{ width: '100%', justifyContent: 'center', padding: 12, fontSize: 14, marginTop: 8 }}
              disabled={loading}>
              {loading && <Loader2 size={16} className="animate-spin" />}
              {loading ? 'Creating account...' : 'Join ConnectSphere'}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: 24, fontSize: 13, color: 'var(--text-muted)' }}>
            Already a member?{' '}
            <Link to="/login" style={{ color: 'var(--accent)', fontWeight: 600, textDecoration: 'none' }}>
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;