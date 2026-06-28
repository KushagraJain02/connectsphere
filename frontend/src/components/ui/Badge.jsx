const variants = {
  purple: { background: 'var(--primary-light)', color: 'var(--accent)', border: '1px solid rgba(124,58,237,0.2)' },
  green: { background: 'var(--success-light)', color: 'var(--success)', border: '1px solid rgba(16,185,129,0.2)' },
  red: { background: 'var(--danger-light)', color: 'var(--danger)', border: '1px solid rgba(244,63,94,0.2)' },
  yellow: { background: 'rgba(245,158,11,0.15)', color: 'var(--warning)', border: '1px solid rgba(245,158,11,0.2)' },
  gray: { background: 'var(--bg-card)', color: 'var(--text-secondary)', border: '1px solid var(--border)' },
};

const Badge = ({ children, variant = 'purple', style = {} }) => (
  <span style={{
    display: 'inline-flex', alignItems: 'center', gap: 4,
    padding: '3px 10px', borderRadius: 'var(--radius-full)',
    fontSize: 11, fontWeight: 700,
    ...variants[variant],
    ...style,
  }}>
    {children}
  </span>
);

export default Badge;