import { getInitials } from '../../utils/helpers';

const sizes = {
  xs: { box: 28, font: 10 },
  sm: { box: 36, font: 12 },
  md: { box: 44, font: 14 },
  lg: { box: 64, font: 20 },
  xl: { box: 96, font: 32 },
};

const colors = [
  '#7c3aed', '#a855f7', '#e879f9', '#10b981',
  '#f59e0b', '#3b82f6', '#ec4899', '#06b6d4',
];

const getColor = (name) => {
  if (!name) return colors[0];
  const i = name.charCodeAt(0) % colors.length;
  return colors[i];
};

const Avatar = ({ src, name, size = 'md' }) => {
  const { box, font } = sizes[size];
  const color = getColor(name);

  if (src) return (
    <img src={src} alt={name}
      style={{ width: box, height: box, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
  );

  return (
    <div style={{
      width: box, height: box, borderRadius: '50%',
      background: `${color}33`, border: `2px solid ${color}66`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: font, fontWeight: 600, color, flexShrink: 0,
    }}>
      {getInitials(name)}
    </div>
  );
};

export default Avatar;