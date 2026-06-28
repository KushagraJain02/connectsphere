const EmptyState = ({ icon, title, description, action }) => (
  <div style={{
    textAlign: 'center', padding: '60px 24px',
    background: 'var(--bg-surface)', border: '1px solid var(--border)',
    borderRadius: 'var(--radius-md)',
  }}>
    <div style={{
      fontSize: 48, marginBottom: 16, opacity: 0.4,
      filter: 'grayscale(100%)',
    }}>
      {icon}
    </div>
    <h3 style={{ fontSize: 17, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>
      {title}
    </h3>
    {description && (
      <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 20, lineHeight: 1.6 }}>
        {description}
      </p>
    )}
    {action}
  </div>
);

export default EmptyState;