import { Link } from 'react-router-dom';
import Avatar from '../ui/Avatar';
import { UserCheck, UserX, UserMinus, MessageCircle } from 'lucide-react';
import useAuthStore from '../../store/authStore';

const ConnectionCard = ({ connection, type = 'connected', onAccept, onReject, onRemove }) => {
  const { user } = useAuthStore();

  // Get the OTHER person — not the current user
  const getOtherPerson = () => {
    if (!connection) return { name: 'Unknown', id: null };

    // For pending requests received — sender is the other person
    if (type === 'pending') {
      return { name: connection.senderName, id: connection.senderId };
    }

    // For sent requests — receiver is the other person
    if (type === 'sent') {
      return { name: connection.receiverName, id: connection.receiverId };
    }

    // For accepted connections — figure out who is NOT the current user
    if (connection.senderId === user?.userId) {
      return { name: connection.receiverName, id: connection.receiverId };
    } else {
      return { name: connection.senderName, id: connection.senderId };
    }
  };

  const other = getOtherPerson();

  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: 16, background: 'var(--bg-card)', borderRadius: 'var(--radius-sm)',
      border: '1px solid var(--border)', transition: 'all 0.2s',
    }}
      onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--border-light)'}
      onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <Link to={other.id ? `/profile/${other.id}` : '#'} style={{ textDecoration: 'none' }}>
          <Avatar name={other.name} size="md" />
        </Link>
        <div>
          <Link to={other.id ? `/profile/${other.id}` : '#'}
            style={{ textDecoration: 'none', fontWeight: 600, fontSize: 14, color: 'var(--text-primary)' }}>
            {other.name || 'Unknown User'}
          </Link>
          <p style={{
            fontSize: 11, marginTop: 2,
            color: type === 'connected' ? 'var(--success)' : type === 'pending' ? 'var(--warning)' : 'var(--text-muted)',
            fontWeight: 600,
          }}>
            {type === 'connected' ? '● Connected'
              : type === 'pending' ? '⏳ Wants to connect'
              : '📤 Request sent'}
          </p>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 6 }}>
        {type === 'pending' && (
          <>
            <button className="btn-primary" style={{ padding: '6px 14px', fontSize: 12 }} onClick={onAccept}>
              <UserCheck size={13} /> Accept
            </button>
            <button className="btn-ghost"
              style={{ padding: '6px 14px', fontSize: 12, border: '1px solid var(--border)', borderRadius: 'var(--radius-full)' }}
              onClick={onReject}>
              <UserX size={13} /> Decline
            </button>
          </>
        )}
        {type === 'connected' && (
          <>
            <Link to="/messaging" className="btn-ghost"
              style={{ padding: '6px 10px', textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
              <MessageCircle size={14} />
            </Link>
            <button className="btn-ghost" style={{ padding: '6px 8px', color: 'var(--danger)' }} onClick={onRemove}>
              <UserMinus size={14} />
            </button>
          </>
        )}
        {type === 'sent' && (
          <span style={{
            fontSize: 12, color: 'var(--text-muted)', padding: '6px 12px',
            border: '1px solid var(--border)', borderRadius: 'var(--radius-full)',
          }}>
            Pending
          </span>
        )}
      </div>
    </div>
  );
};

export default ConnectionCard;