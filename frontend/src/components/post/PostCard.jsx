import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toggleLike, deletePost } from '../../api/postApi';
import Avatar from '../ui/Avatar';
import CommentSection from './CommentSection';
import { Heart, MessageCircle, Trash2, Share2 } from 'lucide-react';
import { timeAgo } from '../../utils/helpers';
import useAuthStore from '../../store/authStore';
import toast from 'react-hot-toast';
import ReactionButton from './ReactionButton';
import HashtagText from './HashtagText';

const PostCard = ({ post, queryKey = ['feed'] }) => {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [showComments, setShowComments] = useState(false);

  const likeMutation = useMutation({
    mutationFn: () => toggleLike(post.id),
    onSuccess: () => queryClient.invalidateQueries([queryKey]),
  });

  const deleteMutation = useMutation({
    mutationFn: () => deletePost(post.id),
    onSuccess: () => {
      queryClient.invalidateQueries([queryKey]);
      toast.success('Post deleted');
    },
  });

  const handleShare = () => {
    navigator.clipboard.writeText(`${window.location.origin}/post/${post.id}`);
    toast.success('Link copied!');
  };

  return (
    <div style={{
      background: 'var(--bg-surface)', border: '1px solid var(--border)',
      borderRadius: 'var(--radius-md)', padding: 20, transition: 'border-color 0.2s',
    }}
      onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--border-light)'}
      onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
    >
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ display: 'flex', gap: 12 }}>
          <Link to={`/profile/${post.authorId}`} style={{ textDecoration: 'none' }}>
            <Avatar name={post.authorName} size="md" />
          </Link>
          <div>
            <Link to={`/profile/${post.authorId}`}
              style={{ textDecoration: 'none', fontWeight: 700, fontSize: 14, color: 'var(--text-primary)' }}>
              {post.authorName}
            </Link>
            <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
              {timeAgo(post.createdAt)}
            </p>
          </div>
        </div>
        {post.authorId === user?.userId && (
          <button onClick={() => deleteMutation.mutate()} className="btn-ghost"
            style={{ padding: '4px 8px', color: 'var(--danger)' }}>
            <Trash2 size={14} />
          </button>
        )}
      </div>

      {/* Content */}
      <Link to={`/post/${post.id}`} style={{ textDecoration: 'none' }}>
        <HashtagText
    content={post.content.length > 300
        ? post.content.slice(0, 300) + '...'
        : post.content}
/>
      </Link>
      {post.imageUrl && (
        <img src={post.imageUrl} alt="post"
          style={{ marginTop: 12, borderRadius: 'var(--radius-sm)', width: '100%', maxHeight: 400, objectFit: 'cover' }} />
      )}

      {/* Stats */}
      {(post.likeCount > 0 || post.commentCount > 0) && (
        <div style={{ display: 'flex', gap: 16, marginTop: 12, paddingBottom: 10, borderBottom: '1px solid var(--border)' }}>
          {post.likeCount > 0 && (
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              ❤️ {post.likeCount} {post.likeCount === 1 ? 'like' : 'likes'}
            </span>
          )}
          {post.commentCount > 0 && (
            <span style={{ fontSize: 12, color: 'var(--text-muted)', cursor: 'pointer' }}
              onClick={() => setShowComments(!showComments)}>
              💬 {post.commentCount} {post.commentCount === 1 ? 'comment' : 'comments'}
            </span>
          )}
        </div>
      )}

      {/* Actions */}
      <div style={{ display: 'flex', gap: 4, marginTop: 10 }}>
        <ReactionButton post={post} queryKey={queryKey} />
        <button className="btn-ghost"
          style={{ flex: 1, justifyContent: 'center' }}
          onClick={() => setShowComments(!showComments)}>
          <MessageCircle size={15} /> Comment
        </button>
        <button className="btn-ghost"
          style={{ flex: 1, justifyContent: 'center' }}
          onClick={handleShare}>
          <Share2 size={15} /> Share
        </button>
      </div>

      {/* Comments */}
      {showComments && <CommentSection postId={post.id} />}
    </div>
  );
};

export default PostCard;