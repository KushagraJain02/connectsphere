import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createPost } from '../../api/postApi';
import Avatar from '../ui/Avatar';
import { ImagePlus, Send, X, Loader2, FileText, AlignLeft } from 'lucide-react';
import useAuthStore from '../../store/authStore';
import toast from 'react-hot-toast';

const CreatePost = ({ profile }) => {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [content, setContent] = useState('');
  const [image, setImage] = useState(null);
  const [focused, setFocused] = useState(false);

  const mutation = useMutation({
    mutationFn: () => {
      const fd = new FormData();
      fd.append('content', content);
      fd.append('type', image ? 'IMAGE' : 'TEXT');
      if (image) fd.append('image', image);
      return createPost(fd);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['feed']);
      setContent(''); setImage(null); setFocused(false);
      toast.success('Post published!');
    },
    onError: () => toast.error('Failed to publish post'),
  });

  return (
    <div style={{
      background: 'var(--bg-surface)', border: '1px solid var(--border)',
      borderRadius: 'var(--radius-md)', padding: 16,
    }}>
      <div style={{ display: 'flex', gap: 12 }}>
        <Avatar src={profile?.profilePictureUrl} name={user?.fullName} size="md" />
        <div style={{ flex: 1 }}>
          <textarea
            value={content}
            onChange={e => setContent(e.target.value)}
            onFocus={() => setFocused(true)}
            placeholder="Share something with your network..."
            style={{
              width: '100%', background: 'var(--bg-input)', border: '1px solid var(--border)',
              borderRadius: 'var(--radius-sm)', color: 'var(--text-primary)',
              padding: 12, fontSize: 14, resize: 'none',
              minHeight: focused ? 100 : 44,
              outline: 'none', transition: 'all 0.2s, border-color 0.2s',
              lineHeight: 1.6,
            }}
            onMouseEnter={e => e.target.style.borderColor = 'var(--border-light)'}
            onMouseLeave={e => !focused && (e.target.style.borderColor = 'var(--border)')}
          />
        </div>
      </div>

      {/* Image Preview */}
      {image && (
        <div style={{ marginLeft: 56, marginTop: 10, position: 'relative', display: 'inline-block' }}>
          <img src={URL.createObjectURL(image)}
            style={{ maxHeight: 200, borderRadius: 8, objectFit: 'cover', display: 'block' }} alt="preview" />
          <button onClick={() => setImage(null)} style={{
            position: 'absolute', top: 6, right: 6,
            background: 'rgba(0,0,0,0.6)', border: 'none', borderRadius: '50%',
            width: 24, height: 24, display: 'flex', alignItems: 'center',
            justifyContent: 'center', cursor: 'pointer', color: 'white',
          }}>
            <X size={12} />
          </button>
        </div>
      )}

      {/* Footer */}
      {(focused || content) && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12, marginLeft: 56 }}>
          <div style={{ display: 'flex', gap: 4 }}>
            <label className="btn-ghost" style={{ padding: '6px 10px', fontSize: 12, cursor: 'pointer' }}>
              <ImagePlus size={15} /> Photo
              <input type="file" accept="image/*" style={{ display: 'none' }}
                onChange={e => setImage(e.target.files[0])} />
            </label>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            {content.length > 0 && (
              <span style={{ fontSize: 11, color: content.length > 2800 ? 'var(--danger)' : 'var(--text-muted)' }}>
                {content.length}/3000
              </span>
            )}
            <button onClick={() => { setFocused(false); setContent(''); setImage(null); }}
              className="btn-ghost" style={{ padding: '7px 14px', fontSize: 12 }}>
              Cancel
            </button>
            <button className="btn-primary" style={{ padding: '8px 20px', fontSize: 13 }}
              onClick={() => content.trim() && mutation.mutate()}
              disabled={!content.trim() || mutation.isPending || content.length > 3000}>
              {mutation.isPending ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <Send size={14} />}
              Publish
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreatePost;