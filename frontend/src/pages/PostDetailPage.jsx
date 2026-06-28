import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Layout from '../components/layout/Layout';
import { getPost, toggleLike, deletePost } from '../api/postApi';
import CommentSection from '../components/post/CommentSection';
import Avatar from '../components/ui/Avatar';
import useAuthStore from '../store/authStore';
import { Heart, MessageCircle, Trash2, ArrowLeft, Share2, Loader2 } from 'lucide-react';
import { timeAgo } from '../utils/helpers';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const PostDetailPage = () => {
  const { postId } = useParams();
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { data: post, isLoading } = useQuery({
    queryKey: ['post', postId],
    queryFn: () => getPost(postId).then(r => r.data),
  });

  const likeMutation = useMutation({
    mutationFn: () => toggleLike(postId),
    onSuccess: () => queryClient.invalidateQueries(['post', postId]),
  });

  const deleteMutation = useMutation({
    mutationFn: () => deletePost(postId),
    onSuccess: () => {
      toast.success('Post deleted');
      navigate('/feed');
    },
  });

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Link copied to clipboard!');
  };

  if (isLoading) return (
    <Layout>
      <div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}>
        <Loader2 size={32} style={{ color: 'var(--primary)', animation: 'spin 1s linear infinite' }} />
      </div>
    </Layout>
  );

  if (!post) return (
    <Layout>
      <div style={{ textAlign: 'center', padding: 80, color: 'var(--text-muted)' }}>
        <p style={{ fontSize: 18 }}>Post not found</p>
        <Link to="/feed" style={{ color: 'var(--accent)', textDecoration: 'none', marginTop: 12, display: 'inline-block' }}>
          ← Back to feed
        </Link>
      </div>
    </Layout>
  );

  return (
    <Layout>
      <div style={{ maxWidth: 680, margin: '0 auto' }}>

        {/* Back button */}
        <button
          onClick={() => navigate(-1)}
          className="btn-ghost"
          style={{ marginBottom: 16, padding: '8px 12px' }}
        >
          <ArrowLeft size={16} /> Back
        </button>

        {/* Post Card */}
        <div style={{
          background: 'var(--bg-surface)', border: '1px solid var(--border)',
          borderRadius: 'var(--radius-lg)', overflow: 'hidden',
        }}>
          {/* Post Header */}
          <div style={{ padding: 24, borderBottom: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ display: 'flex', gap: 12 }}>
                <Link to={`/profile/${post.authorId}`} style={{ textDecoration: 'none' }}>
                  <Avatar name={post.authorName} size="lg" />
                </Link>
                <div>
                  <Link to={`/profile/${post.authorId}`}
                    style={{ textDecoration: 'none', fontWeight: 700, fontSize: 15, color: 'var(--text-primary)' }}>
                    {post.authorName}
                  </Link>
                  <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 3 }}>
                    {timeAgo(post.createdAt)}
                  </p>
                </div>
              </div>

              {post.authorId === user?.userId && (
                <button
                  className="btn-ghost"
                  style={{ padding: '6px 8px', color: 'var(--danger)' }}
                  onClick={() => deleteMutation.mutate()}
                >
                  <Trash2 size={16} />
                </button>
              )}
            </div>
          </div>

          {/* Post Content */}
          <div style={{ padding: 24 }}>
            <p style={{
              fontSize: 15, color: 'var(--text-primary)',
              lineHeight: 1.8, whiteSpace: 'pre-line',
            }}>
              {post.content}
            </p>

            {post.imageUrl && (
              <img src={post.imageUrl} alt="post"
                style={{
                  marginTop: 16, borderRadius: 'var(--radius-sm)',
                  width: '100%', maxHeight: 500, objectFit: 'cover',
                }} />
            )}
          </div>

          {/* Stats */}
          {(post.likeCount > 0 || post.commentCount > 0) && (
            <div style={{
              padding: '10px 24px', borderTop: '1px solid var(--border)',
              display: 'flex', gap: 20,
            }}>
              {post.likeCount > 0 && (
                <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                  ❤️ {post.likeCount} {post.likeCount === 1 ? 'like' : 'likes'}
                </span>
              )}
              {post.commentCount > 0 && (
                <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                  💬 {post.commentCount} {post.commentCount === 1 ? 'comment' : 'comments'}
                </span>
              )}
            </div>
          )}

          {/* Actions */}
          <div style={{
            padding: '8px 16px', borderTop: '1px solid var(--border)',
            display: 'flex', gap: 4,
          }}>
            <button
              className="btn-ghost"
              style={{
                flex: 1, justifyContent: 'center',
                color: post.likedByMe ? 'var(--accent)' : 'var(--text-muted)',
              }}
              onClick={() => likeMutation.mutate()}
            >
              <Heart size={16} style={{
                fill: post.likedByMe ? 'var(--accent)' : 'transparent',
                color: post.likedByMe ? 'var(--accent)' : 'inherit',
              }} />
              Like
            </button>
            <button className="btn-ghost" style={{ flex: 1, justifyContent: 'center' }}>
              <MessageCircle size={16} /> Comment
            </button>
            <button
              className="btn-ghost"
              style={{ flex: 1, justifyContent: 'center' }}
              onClick={handleShare}
            >
              <Share2 size={16} /> Share
            </button>
          </div>

          {/* Comments */}
          <div style={{ padding: '0 24px 24px' }}>
            <CommentSection postId={postId} />
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default PostDetailPage;