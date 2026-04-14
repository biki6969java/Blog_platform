import { useState, useEffect } from 'react';
import API from '../api/axios';

export default function AdminPanel() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await API.get('/users');
      setUsers(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load users');
      console.error('Failed to load users:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      await fetchUsers();
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await API.get(`/users/search?keyword=${encodeURIComponent(searchQuery.trim())}`);
      setUsers(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to search users');
      console.error('Failed to search users:', err);
    } finally {
      setLoading(false);
    }
  };

  const refreshVisibleUsers = async () => {
    if (searchQuery.trim()) {
      await handleSearch();
      return;
    }
    await fetchUsers();
  };

  const handleToggleEnabled = async (userId, currentEnabled) => {
    try {
      setError('');
      await API.put(`/users/${userId}/enable?enabled=${!currentEnabled}`);
      await refreshVisibleUsers();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to toggle user status');
      console.error('Failed to toggle user:', err);
    }
  };

  const handlePromote = async (userId) => {
    try {
      setError('');
      await API.put(`/users/${userId}/promote`);
      await refreshVisibleUsers();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to promote user');
      console.error('Failed to promote user:', err);
    }
  };

  const handleDemote = async (userId) => {
    try {
      setError('');
      await API.put(`/users/${userId}/demote`);
      await refreshVisibleUsers();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to demote user');
      console.error('Failed to demote user:', err);
    }
  };

  const handleDelete = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      setError('');
      await API.delete(`/users/${userId}`);
      await refreshVisibleUsers();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete user');
      console.error('Failed to delete user:', err);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="page-container" id="admin-panel-page">
      <div className="page-header">
        <h1 className="page-title">Admin Panel</h1>
        <p className="page-subtitle">Manage users and platform settings</p>
      </div>

      {error && (
        <div className="empty-state" style={{ minHeight: 'auto', marginBottom: '1.5rem', color: 'var(--error)' }}>
          <div className="empty-state-title">Action failed</div>
          <div className="empty-state-text">{error}</div>
        </div>
      )}

      {/* Search */}
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', maxWidth: 500 }}>
        <div className="search-container" style={{ flex: 1 }}>
          <span className="search-icon">🔍</span>
          <input
            type="text"
            className="search-input"
            placeholder="Search users…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            id="admin-search-input"
          />
        </div>
        <button className="btn btn-secondary btn-sm" onClick={handleSearch}>Search</button>
        {searchQuery && (
          <button className="btn btn-ghost btn-sm" onClick={() => { setSearchQuery(''); fetchUsers(); }}>Clear</button>
        )}
      </div>

      {loading ? (
        <div className="loader"><div className="spinner" /></div>
      ) : users.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">👥</div>
          <div className="empty-state-title">No users found</div>
        </div>
      ) : (
        <div className="admin-table-wrapper">
          <table className="admin-table" id="admin-users-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Username</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th>Joined</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td style={{ color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)', fontSize: '0.8125rem' }}>
                    {u.id}
                  </td>
                  <td style={{ fontWeight: 600 }}>{u.username}</td>
                  <td style={{ color: 'var(--text-secondary)' }}>{u.email}</td>
                  <td>
                    <span className={`role-badge ${u.role === 'ROLE_ADMIN' ? 'admin' : 'user'}`}>
                      {u.role === 'ROLE_ADMIN' ? 'Admin' : 'User'}
                    </span>
                  </td>
                  <td>
                    <span className={`status-badge ${u.enabled ? 'published' : 'draft'}`}>
                      <span className="status-badge-dot" />
                      {u.enabled ? 'Active' : 'Disabled'}
                    </span>
                  </td>
                  <td style={{ color: 'var(--text-tertiary)', fontSize: '0.875rem' }}>
                    {formatDate(u.createdAt)}
                  </td>
                  <td>
                    <div className="admin-actions">
                      <button
                        className={`btn btn-sm ${u.enabled ? 'btn-ghost' : 'btn-primary'}`}
                        onClick={() => handleToggleEnabled(u.id, u.enabled)}
                        title={u.enabled ? 'Disable user' : 'Enable user'}
                      >
                        {u.enabled ? '🚫' : '✅'}
                      </button>
                      {u.role === 'ROLE_USER' ? (
                        <button className="btn btn-ghost btn-sm" onClick={() => handlePromote(u.id)} title="Promote to admin">
                          ⬆️
                        </button>
                      ) : (
                        <button className="btn btn-ghost btn-sm" onClick={() => handleDemote(u.id)} title="Demote to user">
                          ⬇️
                        </button>
                      )}
                      <button className="btn btn-ghost btn-sm" style={{ color: 'var(--error)' }} onClick={() => handleDelete(u.id)} title="Delete user">
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
