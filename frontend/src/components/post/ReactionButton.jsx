import { useState, useRef, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { reactToPost } from '../../api/postApi';

const REACTIONS = [
  { type: 'LIKE',       emoji: '👍', label: 'Like',       color: '#7c3aed' },
  { type: 'CELEBRATE',  emoji: '🎉', label: 'Celebrate',  color: '#f59e0b' },
  { type: 'SUPPORT',    emoji: '🤝', label: 'Support',    color: '#10b981' },
  { type: 'INSIGHTFUL', emoji: '💡', label: 'Insightful', color: '#3b82f6' },
  { type: 'FUNNY',      emoji: '😄', label: 'Funny',      color: '#f43f5e' },
];

const ReactionButton = ({ post, queryKey = ['feed'] }) => {
  const queryClient = useQueryClient();
  const [showPicker, setShowPicker] = useState(false);
  const [hoverTimer, setHoverTimer] = useState(null);
  const pickerRef = useRef(null);

  const myReaction = post.myReaction;
  const totalReactions = post.totalReactions || post.likeCount || 0;
  const activeReaction = REACTIONS.find(r => r.type === myReaction);

  const mutation = useMutation({
    mutationFn: (type) => reactToPost(post.id, type),
    onSuccess: () => {
      queryClient.invalidateQueries([queryKey]);
      setShowPicker(false);
    },
  });

  // Close picker when clicking outside
  useEffect(() => {
    const handleClick = (e) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target)) {
        setShowPicker(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleMouseEnter = () => {
    const timer = setTimeout(() => setShowPicker(true), 500);
    setHoverTimer(timer);
  };

  const handleMouseLeave = () => {
    if (hoverTimer) clearTimeout(hoverTimer);
  };

  const handleClick = () => {
    if (myReaction) {
      mutation.mutate(myReaction); // toggle off
    } else {
      mutation.mutate('LIKE'); // default to like
    }
  };

  return (
    <div style={{ position: 'relative' }} ref={pickerRef}>
      {/* Reaction Picker */}
      {showPicker && (
        <div style={{
          position: 'absolute', bottom: '110%', left: 0,
          background: 'var(--bg-surface)', border: '1px solid var(--border)',
          borderRadius: 'var(--radius-full)', padding: '8px 12px',
          display: 'flex', gap: 8, boxShadow: 'var(--shadow)',
          zIndex: 50, whiteSpace: 'nowrap',
          animation: 'slideUp 0.15s ease',
        }}>
          {REACTIONS.map(r => (
            <button
              key={r.type}
              onClick={() => mutation.mutate(r.type)}
              title={r.label}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                fontSize: 22, padding: '2px 4px', borderRadius: '50%',
                transition: 'transform 0.15s',
                transform: myReaction === r.type ? 'scale(1.3)' : 'scale(1)',
              }}
              onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.3)'}
              onMouseLeave={e => e.currentTarget.style.transform =
                myReaction === r.type ? 'scale(1.3)' : 'scale(1)'}
            >
              {r.emoji}
            </button>
          ))}
        </div>
      )}

      {/* Main Button */}
      <button
        className="btn-ghost"
        style={{
          color: activeReaction ? activeReaction.color : 'var(--text-muted)',
          flex: 1, justifyContent: 'center', fontWeight: activeReaction ? 700 : 400,
        }}
        onClick={handleClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <span style={{ fontSize: 15 }}>
          {activeReaction ? activeReaction.emoji : '👍'}
        </span>
        {activeReaction ? activeReaction.label : 'Like'}
        {totalReactions > 0 && (
          <span style={{ fontSize: 12, marginLeft: 4, color: 'var(--text-muted)' }}>
            {totalReactions}
          </span>
        )}
      </button>

      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default ReactionButton;