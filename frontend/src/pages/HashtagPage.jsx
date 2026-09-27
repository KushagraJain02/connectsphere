import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import Layout from '../components/layout/Layout';
import PostCard from '../components/post/PostCard';
import { getPostsByHashtag } from '../api/postApi';
import { Hash, Loader2 } from 'lucide-react';

const HashtagPage = () => {
    const { tag } = useParams();

    const { data, isLoading } = useQuery({
        queryKey: ['hashtag', tag],
        queryFn: () => getPostsByHashtag(tag).then(r => r.data),
        enabled: !!tag,
    });

    return (
        <Layout>
            <div style={{ maxWidth: 680, margin: '0 auto' }}>

                {/* Header */}
                <div style={{
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-md)',
                    padding: 24, marginBottom: 16,
                    display: 'flex', alignItems: 'center', gap: 14,
                }}>
                    <div style={{
                        width: 52, height: 52, borderRadius: '50%',
                        background: 'var(--primary-light)',
                        display: 'flex', alignItems: 'center',
                        justifyContent: 'center',
                    }}>
                        <Hash size={26} style={{ color: 'var(--accent)' }} />
                    </div>
                    <div>
                        <h1 style={{ fontSize: 22, fontWeight: 800 }}>
                            #{tag}
                        </h1>
                        <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 3 }}>
                            {data?.totalElements || 0} posts
                        </p>
                    </div>
                </div>

                {/* Posts */}
                {isLoading ? (
                    <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
                        <Loader2 size={28} style={{
                            color: 'var(--primary)',
                            animation: 'spin 1s linear infinite'
                        }} />
                    </div>
                ) : data?.content?.length === 0 ? (
                    <div style={{
                        textAlign: 'center', padding: 60,
                        background: 'var(--bg-surface)',
                        border: '1px solid var(--border)',
                        borderRadius: 'var(--radius-md)',
                        color: 'var(--text-muted)',
                    }}>
                        <Hash size={40} style={{ margin: '0 auto 12px', opacity: 0.2 }} />
                        <p style={{ fontSize: 16 }}>No posts with #{tag} yet</p>
                        <p style={{ fontSize: 13, marginTop: 6 }}>
                            Be the first to use this hashtag!
                        </p>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                        {data?.content?.map(post => (
                            <PostCard key={post.id} post={post}
                                      queryKey={['hashtag', tag]} />
                        ))}
                    </div>
                )}
            </div>
        </Layout>
    );
};

export default HashtagPage;