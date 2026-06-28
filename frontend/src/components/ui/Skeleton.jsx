const Skeleton = ({ width = '100%', height = 16, borderRadius = 8, style = {} }) => (
  <div style={{
    width, height, borderRadius,
    background: 'linear-gradient(90deg, var(--bg-card) 25%, var(--bg-hover) 50%, var(--bg-card) 75%)',
    backgroundSize: '200% 100%',
    animation: 'shimmer 1.5s infinite',
    ...style,
  }}>
    <style>{`
      @keyframes shimmer {
        0% { background-position: 200% 0; }
        100% { background-position: -200% 0; }
      }
    `}</style>
  </div>
);

export const PostSkeleton = () => (
  <div style={{
    background: 'var(--bg-surface)', border: '1px solid var(--border)',
    borderRadius: 'var(--radius-md)', padding: 20,
  }}>
    <div style={{ display: 'flex', gap: 12, marginBottom: 14 }}>
      <Skeleton width={44} height={44} borderRadius="50%" />
      <div style={{ flex: 1 }}>
        <Skeleton width="40%" height={14} style={{ marginBottom: 8 }} />
        <Skeleton width="25%" height={10} />
      </div>
    </div>
    <Skeleton height={14} style={{ marginBottom: 8 }} />
    <Skeleton height={14} width="90%" style={{ marginBottom: 8 }} />
    <Skeleton height={14} width="75%" style={{ marginBottom: 16 }} />
    <Skeleton height={160} borderRadius={8} style={{ marginBottom: 14 }} />
    <div style={{ display: 'flex', gap: 8 }}>
      <Skeleton width={80} height={32} borderRadius={20} />
      <Skeleton width={80} height={32} borderRadius={20} />
      <Skeleton width={80} height={32} borderRadius={20} />
    </div>
  </div>
);

export const ProfileSkeleton = () => (
  <div style={{
    background: 'var(--bg-surface)', border: '1px solid var(--border)',
    borderRadius: 'var(--radius-lg)', overflow: 'hidden',
  }}>
    <Skeleton height={160} borderRadius={0} />
    <div style={{ padding: 24 }}>
      <Skeleton width={96} height={96} borderRadius="50%" style={{ marginTop: -48 }} />
      <Skeleton width="40%" height={24} style={{ marginTop: 16, marginBottom: 8 }} />
      <Skeleton width="60%" height={14} style={{ marginBottom: 8 }} />
      <Skeleton width="30%" height={12} />
    </div>
  </div>
);

export const JobSkeleton = () => (
  <div style={{
    background: 'var(--bg-surface)', border: '1px solid var(--border)',
    borderRadius: 'var(--radius-md)', padding: 20,
  }}>
    <div style={{ display: 'flex', gap: 14 }}>
      <Skeleton width={52} height={52} borderRadius={8} />
      <div style={{ flex: 1 }}>
        <Skeleton width="50%" height={16} style={{ marginBottom: 8 }} />
        <Skeleton width="30%" height={12} style={{ marginBottom: 8 }} />
        <Skeleton width="70%" height={10} />
      </div>
    </div>
    <Skeleton height={12} style={{ marginTop: 14, marginBottom: 6 }} />
    <Skeleton height={12} width="85%" />
  </div>
);

export const NotificationSkeleton = () => (
  <div style={{ display: 'flex', gap: 12, padding: '14px 20px', borderBottom: '1px solid var(--border)' }}>
    <Skeleton width={40} height={40} borderRadius="50%" />
    <div style={{ flex: 1 }}>
      <Skeleton width="80%" height={12} style={{ marginBottom: 6 }} />
      <Skeleton width="30%" height={10} />
    </div>
  </div>
);

export default Skeleton;