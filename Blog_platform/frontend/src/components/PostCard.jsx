import { useNavigate } from 'react-router-dom';
import TagBadge from './TagBadge';
import { resolveMediaUrl } from '../utils/media';

export default function PostCard({ post, style }) {
  const navigate = useNavigate();

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getExcerpt = (content) => {
    if (!content) return '';
    // strip any HTML-like tags
    const text = content.replace(/<[^>]*>/g, '');
    return text.length > 160 ? text.substring(0, 160) + '…' : text;
  };

  return (
    <article
      className="post-card"
      onClick={() => navigate(`/post/${post.id}`)}
      style={style}
      id={`post-card-${post.id}`}
    >
      {post.imageUrl ? (
        <img src={resolveMediaUrl(post.imageUrl)} alt={post.title} className="post-card-image" loading="lazy" />
      ) : (
        <div className="post-card-image-placeholder">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.3">
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <path d="M21 15l-5-5L5 21" />
          </svg>
        </div>
      )}

      <div className="post-card-body">
        <div className="post-card-meta">
          <span className="post-card-author">{post.author?.username || 'Unknown'}</span>
          <span className="post-card-dot" />
          <span className="post-card-date">{formatDate(post.createdAt)}</span>
        </div>

        <h3 className="post-card-title">{post.title}</h3>
        <p className="post-card-excerpt">{getExcerpt(post.content)}</p>

        <div className="post-card-footer">
          <div className="post-card-tags">
            {post.tags?.slice(0, 3).map((tag) => (
              <TagBadge key={tag.id || tag.name} name={tag.name} />
            ))}
          </div>
          <span className="post-card-comments">
            💬 {post.comments?.length || 0}
          </span>
        </div>
      </div>
    </article>
  );
}
