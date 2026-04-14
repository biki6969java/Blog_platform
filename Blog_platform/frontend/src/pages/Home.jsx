import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';
import PostCard from '../components/PostCard';

export default function Home() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [activeTag, setActiveTag] = useState(searchParams.get('tag') || '');

  useEffect(() => {
    fetchPosts();
  }, [page, searchParams]);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const q = searchParams.get('q');
      const tag = searchParams.get('tag');
      let res;

      if (q) {
        res = await API.get(`/posts/search?keyword=${encodeURIComponent(q)}&page=${page}&size=9&sort=createdAt,desc`);
      } else if (tag) {
        res = await API.get(`/posts/tag/${encodeURIComponent(tag)}?page=${page}&size=9&sort=createdAt,desc`);
      } else {
        res = await API.get(`/posts?page=${page}&size=9&sort=createdAt,desc`);
      }

      setPosts(res.data.content || []);
      setTotalPages(res.data.totalPages || 0);
    } catch (err) {
      console.error('Failed to load posts:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(0);
    if (searchQuery.trim()) {
      setSearchParams({ q: searchQuery.trim() });
    } else {
      setSearchParams({});
    }
    setActiveTag('');
  };

  const clearFilters = () => {
    setSearchQuery('');
    setActiveTag('');
    setSearchParams({});
    setPage(0);
  };

  return (
    <div className="page-container" id="home-page">
      {/* Hero */}
      {!searchParams.get('q') && !searchParams.get('tag') && page === 0 && (
        <section className="hero">
          <h1 className="hero-title">
            Discover Ideas That <br />
            <span className="hero-title-gradient">Inspire & Innovate</span>
          </h1>
          <p className="hero-subtitle">
            A beautifully crafted space for writers and readers. Share your stories,
            explore new perspectives, and connect with a community of thinkers.
          </p>
          <div className="hero-actions">
            {user ? (
              <Link to="/create" className="btn btn-primary btn-lg" id="hero-write-btn">
                ✍️ Start Writing
              </Link>
            ) : (
              <>
                <Link to="/register" className="btn btn-primary btn-lg" id="hero-signup-btn">
                  Get Started Free
                </Link>
                <Link to="/login" className="btn btn-secondary btn-lg" id="hero-login-btn">
                  Log In
                </Link>
              </>
            )}
          </div>
        </section>
      )}

      {/* Search Bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
        <form onSubmit={handleSearch} className="search-container" style={{ flex: 1 }}>
          <span className="search-icon">🔍</span>
          <input
            type="text"
            className="search-input"
            placeholder="Search posts…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            id="search-input"
          />
        </form>
        {(searchParams.get('q') || searchParams.get('tag')) && (
          <button className="btn btn-ghost btn-sm" onClick={clearFilters}>
            ✕ Clear filters
          </button>
        )}
      </div>

      {/* Active filter indicator */}
      {searchParams.get('q') && (
        <div className="page-header" style={{ marginBottom: '1.5rem' }}>
          <p className="page-subtitle">Results for "<strong>{searchParams.get('q')}</strong>"</p>
        </div>
      )}
      {searchParams.get('tag') && (
        <div className="page-header" style={{ marginBottom: '1.5rem' }}>
          <p className="page-subtitle">Posts tagged with <strong>#{searchParams.get('tag')}</strong></p>
        </div>
      )}

      {/* Loading */}
      {loading ? (
        <div className="loader"><div className="spinner" /></div>
      ) : posts.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📝</div>
          <div className="empty-state-title">No posts found</div>
          <div className="empty-state-text">
            {searchParams.get('q') || searchParams.get('tag')
              ? 'Try a different search term or clear filters.'
              : 'Be the first to share something amazing!'}
          </div>
        </div>
      ) : (
        <>
          <div className="post-grid stagger">
            {posts.map((post, i) => (
              <PostCard key={post.id} post={post} style={{ animationDelay: `${i * 60}ms` }} />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="pagination">
              <button
                className="pagination-btn"
                disabled={page === 0}
                onClick={() => setPage(page - 1)}
                id="pagination-prev"
              >
                ←
              </button>
              {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                let pageNum;
                if (totalPages <= 7) {
                  pageNum = i;
                } else if (page < 4) {
                  pageNum = i;
                } else if (page > totalPages - 4) {
                  pageNum = totalPages - 7 + i;
                } else {
                  pageNum = page - 3 + i;
                }
                return (
                  <button
                    key={pageNum}
                    className={`pagination-btn ${page === pageNum ? 'active' : ''}`}
                    onClick={() => setPage(pageNum)}
                  >
                    {pageNum + 1}
                  </button>
                );
              })}
              <button
                className="pagination-btn"
                disabled={page >= totalPages - 1}
                onClick={() => setPage(page + 1)}
                id="pagination-next"
              >
                →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
