import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';

export default function CommentSection({ postId, comments: initialComments }) {
  const { user } = useAuth();
  const [comments, setComments] = useState(initialComments || []);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editContent, setEditContent] = useState('');
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyContent, setReplyContent] = useState('');
  const [replyLoading, setReplyLoading] = useState(false);

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getInitials = (name) => (name ? name.charAt(0).toUpperCase() : '?');

  const insertReply = (tree, parentId, reply) =>
    tree.map((comment) => {
      if (comment.id === parentId) {
        return {
          ...comment,
          replies: [...(comment.replies || []), reply],
        };
      }

      return {
        ...comment,
        replies: insertReply(comment.replies || [], parentId, reply),
      };
    });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;
    setLoading(true);
    try {
      const res = await API.post(`/comments/post/${postId}`, { content: content.trim() });
      setComments((prev) => [res.data, ...prev]);
      setContent('');
    } catch (err) {
      console.error('Failed to add comment:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleReply = async (parentId) => {
    if (!replyContent.trim()) return;
    setReplyLoading(true);
    try {
      const res = await API.post(`/comments/post/${postId}`, {
        content: replyContent.trim(),
        parentId,
      });
      setComments((prev) => insertReply(prev, parentId, res.data));
      setReplyingTo(null);
      setReplyContent('');
    } catch (err) {
      console.error('Failed to add reply:', err);
    } finally {
      setReplyLoading(false);
    }
  };

  const handleEdit = async (commentId) => {
    if (!editContent.trim()) return;
    try {
      const res = await API.put(`/comments/${commentId}`, { content: editContent.trim() });
      setComments((prev) =>
        prev.map((c) => (c.id === commentId ? { ...c, content: res.data.content, edited: true } : c))
      );
      setEditingId(null);
      setEditContent('');
    } catch (err) {
      console.error('Failed to edit comment:', err);
    }
  };

  const handleDelete = async (commentId) => {
    if (!window.confirm('Delete this comment?')) return;
    try {
      await API.delete(`/comments/${commentId}`);
      setComments((prev) => prev.filter((c) => c.id !== commentId));
    } catch (err) {
      console.error('Failed to delete comment:', err);
    }
  };

  const renderComment = (comment, depth = 0) => (
    <div
      className="comment-item"
      key={comment.id}
      id={`comment-${comment.id}`}
      style={{
        marginLeft: depth > 0 ? '1.5rem' : 0,
        paddingLeft: depth > 0 ? '1rem' : 0,
        borderLeft: depth > 0 ? '1px solid var(--border-color)' : 'none',
      }}
    >
      <div className="comment-avatar">{getInitials(comment.authorUsername || comment.author?.username)}</div>
      <div className="comment-body">
        <div className="comment-author">
          {comment.authorUsername || comment.author?.username || 'Unknown'}
          {comment.edited && (
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginLeft: '0.5rem' }}>
              (edited)
            </span>
          )}
        </div>
        <div className="comment-date">{formatDate(comment.createdAt)}</div>

        {editingId === comment.id ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <textarea
              className="form-textarea"
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              style={{ minHeight: '60px' }}
            />
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button type="button" className="btn btn-primary btn-sm" onClick={() => handleEdit(comment.id)}>
                Save
              </button>
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={() => {
                  setEditingId(null);
                  setEditContent('');
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="comment-text">{comment.content}</div>
        )}

        {user && editingId !== comment.id && (
          <div className="comment-actions">
            {(user.id === comment.authorId || user.id === comment.author?.id) && (
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={() => {
                  setEditingId(comment.id);
                  setEditContent(comment.content);
                }}
              >
                Edit
              </button>
            )}
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              style={{ color: 'var(--error)' }}
              onClick={() => handleDelete(comment.id)}
            >
              Delete
            </button>
          </div>
        )}

        {user && (
          <div style={{ marginTop: '0.75rem' }}>
            {replyingTo === comment.id ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <textarea
                  className="form-textarea"
                  placeholder="Write a reply..."
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  style={{ minHeight: '70px' }}
                />
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    disabled={replyLoading || !replyContent.trim()}
                    onClick={() => handleReply(comment.id)}
                  >
                    {replyLoading ? 'Posting...' : 'Post Reply'}
                  </button>
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    onClick={() => {
                      setReplyingTo(null);
                      setReplyContent('');
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={() => {
                  setReplyingTo(comment.id);
                  setReplyContent('');
                }}
              >
                Reply
              </button>
            )}
          </div>
        )}

        {comment.replies?.length > 0 && (
          <div className="comment-replies" style={{ marginTop: '1rem', display: 'grid', gap: '1rem' }}>
            {comment.replies.map((reply) => renderComment(reply, depth + 1))}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <section className="comments-section" id="comments-section">
      <h3 className="comments-header">Comments ({comments.length})</h3>

      {user && (
        <form className="comment-form" onSubmit={handleSubmit}>
          <div className="comment-form-row">
            <div className="comment-form-avatar">{getInitials(user.username)}</div>
            <div className="comment-form-input" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <textarea
                className="form-textarea"
                placeholder="Share your thoughts..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                style={{ minHeight: '80px' }}
                id="comment-input"
              />
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  type="submit"
                  className="btn btn-primary btn-sm"
                  disabled={loading || !content.trim()}
                  id="comment-submit-btn"
                >
                  {loading ? 'Posting...' : 'Post Comment'}
                </button>
              </div>
            </div>
          </div>
        </form>
      )}

      <div className="comment-list">
        {comments.length === 0 && (
          <div className="empty-state">
            <div className="empty-state-icon">💬</div>
            <div className="empty-state-title">No comments yet</div>
            <div className="empty-state-text">Be the first to share your thoughts!</div>
          </div>
        )}
        {comments.map((comment) => renderComment(comment))}
      </div>
    </section>
  );
}
