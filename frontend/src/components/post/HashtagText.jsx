import { useNavigate } from 'react-router-dom';

const HashtagText = ({ content, style = {} }) => {
    const navigate = useNavigate();

    if (!content) return null;

    // Split content by hashtags
    const parts = content.split(/(#\w+)/g);

    return (
        <p style={{ fontSize: 14, color: 'var(--text-primary)',
                    lineHeight: 1.8, whiteSpace: 'pre-line', ...style }}>
            {parts.map((part, i) => {
                if (part.startsWith('#')) {
                    const tag = part.slice(1);
                    return (
                        <span
                            key={i}
                            onClick={() => navigate(`/hashtag/${tag}`)}
                            style={{
                                color: 'var(--accent)',
                                cursor: 'pointer',
                                fontWeight: 600,
                            }}
                            onMouseEnter={e =>
                                e.currentTarget.style.textDecoration = 'underline'}
                            onMouseLeave={e =>
                                e.currentTarget.style.textDecoration = 'none'}
                        >
                            {part}
                        </span>
                    );
                }
                return part;
            })}
        </p>
    );
};

export default HashtagText;