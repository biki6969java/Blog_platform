import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';
import CommentSection from '../components/CommentSection';
import TagBadge from '../components/TagBadge';
import { resolveMediaUrl } from '../utils/media';

export default function PostDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPost();
  }, [id]);

  const fetchPost = async () => {
    setLoading(true);
    try {
      const postRes = await API.get(`/posts/${id}`);
      setPost(postRes.data);

      try {
        const commentRes = await API.get(`/comments/post/${id}?page=0&size=50&sort=createdAt,desc`);
        setComments(commentRes.data.content || []);
      } catch {
        setComments([]);
      }
    } catch (err) {
      console.error('Failed to load post:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;
    try {
      await API.delete(`/posts/${id}`);
      navigate('/my-posts');
    } catch (err) {
      console.error('Failed to delete post:', err);
    }
  };

  const isAuthor = user && post && (user.id === post.author?.id);
  const isAdmin = user?.role === 'ROLE_ADMIN';

  if (loading) {
    return <div className="page-container"><div className="loader"><div className="spinner" /></div></div>;
  }

  if (!post) {
    return (
      <div className="page-container">
        <div className="empty-state">
          <div className="empty-state-icon">😕</div>
          <div className="empty-state-title">Post not found</div>
          <div className="empty-state-text">This post may have been deleted or doesn't exist.</div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container" id="post-detail-page">
      <article className="post-detail">
        <header className="post-detail-header">
          <h1 className="post-detail-title">{post.title}</h1>
          <div className="post-detail-meta">
            <span>By <span className="post-detail-author-name">{post.author?.username || 'Unknown'}</span></span>
            <span>·</span>
            <span>{formatDate(post.createdAt)}</span>
            {post.status === 'DRAFT' && (
              <>
                <span>·</span>
                <span className="status-badge draft">
                  <span className="status-badge-dot" /> Draft
                </span>
              </>
            )}
          </div>

          {(isAuthor || isAdmin) && (
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1.5rem' }}>
              {isAuthor && (
                <button className="btn btn-secondary btn-sm" onClick={() => navigate(`/edit/${post.id}`)} id="edit-post-btn">
                  ✏️ Edit
                </button>
              )}
              <button className="btn btn-danger btn-sm" onClick={handleDelete} id="delete-post-btn">
                🗑️ Delete
              </button>
            </div>
          )}
        </header>

        {post.imageUrl && (
          <img src={resolveMediaUrl(post.imageUrl)} alt={post.title} className="post-detail-image" />
        )}

        <div className="post-detail-content">
          {post.content.split('\n').map((paragraph, i) => (
            paragraph.trim() ? <p key={i}>{paragraph}</p> : <br key={i} />
          ))}
        </div>

        {post.tags?.length > 0 && (
          <div className="post-detail-tags">
            {post.tags.map((tag) => (
              <TagBadge
                key={tag.id || tag.name}
                name={tag.name}
                onClick={(name) => navigate(`/?tag=${name}`)}
              />
            ))}
          </div>
        )}

        <CommentSection postId={post.id} comments={comments} />
      </article>
    </div>
  );
}
