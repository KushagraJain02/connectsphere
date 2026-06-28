import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getComments, addComment } from '../../api/postApi';
import Avatar from '../ui/Avatar';
import { timeAgo } from '../../utils/helpers';
import { Send, Loader2 } from 'lucide-react';
import useAuthStore from '../../store/authStore';

const CommentSection = ({ postId }) => {
  const [text, setText] = useState('');
  const { user } = useAuthStore();
  const queryClient = useQueryClient();

  const { data: comments, isLoading } = useQuery({
    queryKey: ['comments', postId],
    queryFn: () => getComments(postId).then(r => r.data),
  });

  const mutation = useMutation({
    mutationFn: () => addComment(postId, { content: text }),
    onSuccess: () => {
      queryClient.invalidateQueries(['comments', postId]);
      queryClient.invalidateQueries(['feed']);
      setText('');
    },
  });

  return (
    <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: 12 }}>
      {/* Input */}
      <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
        <Avatar name={user?.fullName} size="sm" />
        <div style={{ flex: 1, display: 'flex', gap: 8 }}>
          <input value={text} onChange={e => setText(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && text.trim() && mutation.mutate()}
            placeholder="Write a comment..."
            style={{
              flex: 1, background: 'var(--bg-input)', border: '1px solid var(--border)',
              borderRadius: 'var(--radius-full)', color: 'var(--text-primary)',
              padding: '8px 16px', fontSize: 13, outline: 'none',
            }}
            onFocus={e => e.target.style.borderColor = 'var(--primary)'}
            onBlur={e => e.target.style.borderColor = 'var(--border)'}
          />
          <button onClick={() => text.trim() && mutation.mutate()}
            disabled={!text.trim() || mutation.isPending}
            style={{
              background: text.trim() ? 'var(--primary)' : 'var(--bg-card)',
              border: 'none', borderRadius: '50%', width: 36, height: 36,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: text.trim() ? 'pointer' : 'default', color: 'white', transition: 'all 0.2s',
            }}>
            {mutation.isPending ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
          </button>
        </div>
      </div>

      {/* Comments */}
      {isLoading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 12 }}>
          <Loader2 size={18} style={{ color: 'var(--primary)' }} />
        </div>
      ) : (
        comments?.map(comment => (
          <div key={comment.id} style={{ display: 'flex', gap: 10 }}>
            <Avatar name={comment.authorName} size="sm" />
            <div style={{
              background: 'var(--bg-card)', borderRadius: 'var(--radius-sm)',
              padding: '10px 14px', flex: 1,
            }}>
              <p style={{ fontWeight: 600, fontSize: 12, color: 'var(--text-accent)', marginBottom: 4 }}>
                {comment.authorName}
              </p>
              <p style={{ fontSize: 13, color: 'var(--text-primary)', lineHeight: 1.5 }}>{comment.content}</p>
              <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 6 }}>{timeAgo(comment.createdAt)}</p>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default CommentSection;