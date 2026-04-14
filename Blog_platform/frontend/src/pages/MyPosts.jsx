import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/axios';

export default function MyPosts() {
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    fetchMyPosts();
  }, [page]);

  const fetchMyPosts = async () => {
    setLoading(true);
    try {
      const res = await API.get(`/posts/me?page=${page}&size=10&sort=createdAt,desc`);
      setPosts(res.data.content || []);
      setTotalPages(res.data.totalPages || 0);
    } catch (err) {
      console.error('Failed to load posts:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const handlePublish = async (postId) => {
    try {
      await API.put(`/posts/${postId}/publish`);
      fetchMyPosts();
    } catch (err) {
      console.error('Failed to publish:', err);
    }
  };

  const handleUnpublish = async (postId) => {
    try {
      await API.put(`/posts/${postId}/draft`);
      fetchMyPosts();
    } catch (err) {
      console.error('Failed to save as draft:', err);
    }
  };

  const handleDelete = async (postId) => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;
    try {
      await API.delete(`/posts/${postId}`);
      fetchMyPosts();
    } catch (err) {
      console.error('Failed to delete:', err);
    }
  };

  return (
    <div className="page-container" id="my-posts-page">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className="page-title">My Posts</h1>
          <p className="page-subtitle">Manage your published and draft posts</p>
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/create')} id="new-post-btn">
          ✍️ New Post
        </button>
      </div>

      {loading ? (
        <div className="loader"><div className="spinner" /></div>
      ) : posts.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📄</div>
          <div className="empty-state-title">No posts yet</div>
          <div className="empty-state-text">Start writing your first post and share it with the world!</div>
          <button className="btn btn-primary" onClick={() => navigate('/create')} style={{ marginTop: '1.5rem' }}>
            ✍️ Write Your First Post
          </button>
        </div>
      ) : (
        <div className="my-posts-list stagger">
          {posts.map((post, i) => (
            <div className="my-post-item" key={post.id} style={{ animationDelay: `${i * 60}ms` }}>
              <div className="my-post-info">
                <div className="my-post-title" onClick={() => navigate(`/post/${post.id}`)}>
                  {post.title}
                </div>
                <div className="my-post-date">
                  {formatDate(post.createdAt)}
                  {post.updatedAt && post.updatedAt !== post.createdAt && (
                    <span> · Updated {formatDate(post.updatedAt)}</span>
                  )}
                </div>
              </div>

              <div className="my-post-actions">
                <span className={`status-badge ${post.status === 'PUBLISHED' ? 'published' : 'draft'}`}>
                  <span className="status-badge-dot" />
                  {post.status === 'PUBLISHED' ? 'Published' : 'Draft'}
                </span>

                {post.status === 'DRAFT' ? (
                  <button className="btn btn-primary btn-sm" onClick={() => handlePublish(post.id)}>
                    Publish
                  </button>
                ) : (
                  <button className="btn btn-secondary btn-sm" onClick={() => handleUnpublish(post.id)}>
                    Unpublish
                  </button>
                )}

                <button className="btn btn-secondary btn-sm" onClick={() => navigate(`/edit/${post.id}`)}>
                  ✏️
                </button>
                <button className="btn btn-ghost btn-sm" style={{ color: 'var(--error)' }} onClick={() => handleDelete(post.id)}>
                  🗑️
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="pagination">
          <button className="pagination-btn" disabled={page === 0} onClick={() => setPage(page - 1)}>←</button>
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i}
              className={`pagination-btn ${page === i ? 'active' : ''}`}
              onClick={() => setPage(i)}
            >
              {i + 1}
            </button>
          ))}
          <button className="pagination-btn" disabled={page >= totalPages - 1} onClick={() => setPage(page + 1)}>→</button>
        </div>
      )}
    </div>
  );
}
