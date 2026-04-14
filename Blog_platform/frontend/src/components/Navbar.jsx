import { useState, useRef, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    setDropdownOpen(false);
    navigate('/');
  };

  const getInitials = (name) => {
    if (!name) return '?';
    return name.charAt(0).toUpperCase();
  };

  const isAdmin = user?.role === 'ROLE_ADMIN';

  return (
    <nav className="navbar" id="main-navbar">
      <Link to="/" className="navbar-brand">
        <svg viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="28" height="28" rx="8" fill="url(#brand-grad)" />
          <path d="M8 8h3v12H8V8zm5 0h3l4 12h-3l-4-12z" fill="#fff" />
          <defs>
            <linearGradient id="brand-grad" x1="0" y1="0" x2="28" y2="28">
              <stop stopColor="#7c3aed" />
              <stop offset="1" stopColor="#06b6d4" />
            </linearGradient>
          </defs>
        </svg>
        Inkwell
      </Link>

      <div className={`navbar-links ${mobileOpen ? 'open' : ''}`}>
        <NavLink to="/" className={({ isActive }) => `navbar-link ${isActive ? 'active' : ''}`}
          onClick={() => setMobileOpen(false)}>
          Home
        </NavLink>
        {user && (
          <>
            <NavLink to="/create" className={({ isActive }) => `navbar-link ${isActive ? 'active' : ''}`}
              onClick={() => setMobileOpen(false)}>
              Write
            </NavLink>
            <NavLink to="/my-posts" className={({ isActive }) => `navbar-link ${isActive ? 'active' : ''}`}
              onClick={() => setMobileOpen(false)}>
              My Posts
            </NavLink>
            {isAdmin && (
              <NavLink to="/admin" className={({ isActive }) => `navbar-link ${isActive ? 'active' : ''}`}
                onClick={() => setMobileOpen(false)}>
                Admin
              </NavLink>
            )}
          </>
        )}
      </div>

      <div className="navbar-actions">
        {user ? (
          <div style={{ position: 'relative' }} ref={dropdownRef}>
            <div
              className="navbar-avatar"
              onClick={() => setDropdownOpen(!dropdownOpen)}
              id="navbar-avatar-btn"
              title={user.username}
            >
              {getInitials(user.username)}
            </div>
            {dropdownOpen && (
              <div className="navbar-dropdown" id="navbar-dropdown">
                <div style={{ padding: '0.5rem 0.875rem', marginBottom: '0.25rem' }}>
                  <div style={{ fontWeight: 600, fontSize: '0.9375rem' }}>{user.username}</div>
                  <div style={{ fontSize: '0.8125rem', color: 'var(--text-tertiary)' }}>{user.email}</div>
                </div>
                <div className="navbar-dropdown-divider" />
                <div className="navbar-dropdown-item" onClick={() => { navigate('/profile'); setDropdownOpen(false); }}>
                  ⚙️ Profile & Settings
                </div>
                <div className="navbar-dropdown-item" onClick={() => { navigate('/my-posts'); setDropdownOpen(false); }}>
                  📝 My Posts
                </div>
                <div className="navbar-dropdown-divider" />
                <div className="navbar-dropdown-item" style={{ color: 'var(--error)' }} onClick={handleLogout}>
                  🚪 Log Out
                </div>
              </div>
            )}
          </div>
        ) : (
          <>
            <Link to="/login" className="btn btn-ghost btn-sm" id="login-btn">Log In</Link>
            <Link to="/register" className="btn btn-primary btn-sm" id="register-btn">Sign Up</Link>
          </>
        )}

        <button
          className="navbar-mobile-toggle"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle navigation"
        >
          {mobileOpen ? '✕' : '☰'}
        </button>
      </div>
    </nav>
  );
}
