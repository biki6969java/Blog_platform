import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../api/axios';
import { resolveMediaUrl } from '../utils/media';

export default function CreatePost() {
  const { id } = useParams(); // if editing
  const navigate = useNavigate();
  const isEditing = Boolean(id);

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState('');
  const [status, setStatus] = useState('DRAFT');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (isEditing) {
      fetchPost();
    }
  }, [id]);

  const fetchPost = async () => {
    try {
      const res = await API.get(`/posts/${id}`);
      const post = res.data;
      setTitle(post.title);
      setContent(post.content);
      setImageUrl(post.imageUrl || '');
      setTags(post.tags?.map((t) => t.name) || []);
      setStatus(post.status);
    } catch {
      setError('Failed to load post');
    }
  };

  const handleTagKeyDown = (e) => {
    if ((e.key === 'Enter' || e.key === ',') && tagInput.trim()) {
      e.preventDefault();
      const newTag = tagInput.trim().toLowerCase().replace(/,/g, '');
      if (newTag && !tags.includes(newTag)) {
        setTags([...tags, newTag]);
      }
      setTagInput('');
    } else if (e.key === 'Backspace' && !tagInput && tags.length > 0) {
      setTags(tags.slice(0, -1));
    }
  };

  const removeTag = (tagToRemove) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);
    setUploading(true);
    try {
      const res = await API.post('/posts/upload-image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setImageUrl(res.data);
    } catch (err) {
      setError('Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (submitStatus) => {
    setError('');
    if (!title.trim()) {
      setError('Title is required');
      return;
    }
    if (!content.trim()) {
      setError('Content is required');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        title: title.trim(),
        content: content.trim(),
        imageUrl: imageUrl || null,
        status: submitStatus,
        tags,
      };

      if (isEditing) {
        await API.put(`/posts/${id}`, payload);
      } else {
        await API.post('/posts', payload);
      }
      navigate('/my-posts');
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data || 'Failed to save post');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container" id="create-post-page">
      <div className="editor-page">
        <div className="page-header">
          <h1 className="page-title">{isEditing ? 'Edit Post' : 'Write a New Post'}</h1>
          <p className="page-subtitle">
            {isEditing ? 'Update your post content and settings.' : 'Share your thoughts with the world.'}
          </p>
        </div>

        {error && (
          <div className="toast error" style={{ position: 'relative', bottom: 'auto', right: 'auto', marginBottom: '1.5rem' }}>
            {error}
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Title */}
          <div className="form-group">
            <label className="form-label" htmlFor="post-title">Title</label>
            <input
              type="text"
              className="form-input"
              id="post-title"
              placeholder="An attention-grabbing title…"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              style={{ fontSize: '1.25rem', fontWeight: 600 }}
            />
          </div>

          {/* Image upload */}
          <div className="form-group">
            <label className="form-label">Cover Image</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <label className="btn btn-secondary btn-sm" style={{ cursor: 'pointer' }}>
                {uploading ? 'Uploading…' : '📷 Upload Image'}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  style={{ display: 'none' }}
                  id="image-upload"
                />
              </label>
              {imageUrl && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <img
                    src={resolveMediaUrl(imageUrl)}
                    alt="Cover"
                    style={{ width: 48, height: 48, objectFit: 'cover', borderRadius: '0.5rem' }}
                  />
                  <button className="btn btn-ghost btn-sm" onClick={() => setImageUrl('')}>✕</button>
                </div>
              )}
            </div>
          </div>

          {/* Content */}
          <div className="form-group">
            <label className="form-label" htmlFor="post-content">Content</label>
            <textarea
              className="form-textarea"
              id="post-content"
              placeholder="Write your post content here…"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              style={{ minHeight: '320px', fontFamily: 'var(--font-sans)', lineHeight: 1.8 }}
            />
          </div>

          {/* Tags */}
          <div className="form-group">
            <label className="form-label">Tags</label>
            <div className="tag-input-container" id="tag-input-container">
              {tags.map((tag) => (
                <span key={tag} className="tag-input-tag">
                  #{tag}
                  <button onClick={() => removeTag(tag)} aria-label={`Remove tag ${tag}`}>×</button>
                </span>
              ))}
              <input
                type="text"
                className="tag-input-field"
                placeholder={tags.length === 0 ? 'Type a tag and press Enter…' : ''}
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleTagKeyDown}
                id="tag-input"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="editor-actions">
            <button
              className="btn btn-secondary"
              onClick={() => handleSubmit('DRAFT')}
              disabled={loading}
              id="save-draft-btn"
            >
              💾 Save as Draft
            </button>
            <button
              className="btn btn-primary"
              onClick={() => handleSubmit('PUBLISHED')}
              disabled={loading}
              id="publish-btn"
            >
              {loading ? 'Publishing…' : '🚀 Publish'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
