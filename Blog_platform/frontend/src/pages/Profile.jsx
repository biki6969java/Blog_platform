import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';

export default function Profile() {
  const { user, refreshProfile, logout } = useAuth();

  // Update username
  const [newUsername, setNewUsername] = useState(user?.username || '');
  const [usernameMsg, setUsernameMsg] = useState('');
  const [usernameErr, setUsernameErr] = useState('');

  // Update email
  const [newEmail, setNewEmail] = useState(user?.email || '');
  const [emailMsg, setEmailMsg] = useState('');
  const [emailErr, setEmailErr] = useState('');

  // Change password
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [passwordMsg, setPasswordMsg] = useState('');
  const [passwordErr, setPasswordErr] = useState('');

  // Delete account
  const [deletePassword, setDeletePassword] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleUpdateUsername = async (e) => {
    e.preventDefault();
    setUsernameMsg('');
    setUsernameErr('');
    try {
      await API.put('/users/me', { username: newUsername.trim() });
      setUsernameMsg('Username updated!');
      refreshProfile();
    } catch (err) {
      setUsernameErr(err.response?.data?.message || err.response?.data || 'Failed to update');
    }
  };

  const handleUpdateEmail = async (e) => {
    e.preventDefault();
    setEmailMsg('');
    setEmailErr('');
    try {
      await API.put('/users/me/email', { newEmail: newEmail.trim() });
      setEmailMsg('Email updated!');
      refreshProfile();
    } catch (err) {
      setEmailErr(err.response?.data?.message || err.response?.data || 'Failed to update');
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordMsg('');
    setPasswordErr('');
    if (newPassword.length < 6) {
      setPasswordErr('New password must be at least 6 characters');
      return;
    }
    try {
      await API.put('/users/me/password', { oldPassword, newPassword });
      setPasswordMsg('Password changed successfully!');
      setOldPassword('');
      setNewPassword('');
    } catch (err) {
      setPasswordErr(err.response?.data?.message || err.response?.data || 'Failed to change password');
    }
  };

  const handleDeleteAccount = async () => {
    try {
      await API.delete('/users/me', { data: { password: deletePassword } });
      logout();
    } catch (err) {
      alert(err.response?.data?.message || err.response?.data || 'Failed to delete account');
    }
  };

  if (!user) return null;

  const getInitials = (name) => name ? name.charAt(0).toUpperCase() : '?';

  return (
    <div className="page-container" id="profile-page">
      <div className="page-header" style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
          <div
            style={{
              width: 80,
              height: 80,
              borderRadius: '50%',
              background: 'var(--gradient-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '2rem',
              fontWeight: 800,
              color: '#fff',
            }}
          >
            {getInitials(user.username)}
          </div>
        </div>
        <h1 className="page-title">{user.username}</h1>
        <p className="page-subtitle">{user.email}</p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '0.75rem' }}>
          <span className={`role-badge ${user.role === 'ROLE_ADMIN' ? 'admin' : 'user'}`}>
            {user.role === 'ROLE_ADMIN' ? 'Admin' : 'Member'}
          </span>
          <span style={{ fontSize: '0.8125rem', color: 'var(--text-tertiary)' }}>
            Joined {new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </span>
        </div>
      </div>

      <div className="profile-grid">
        {/* Update Username */}
        <div className="profile-card" style={{ animationDelay: '0ms' }}>
          <h3 className="profile-card-title">👤 Update Username</h3>
          {usernameMsg && <div className="toast success" style={{ position: 'relative', bottom: 'auto', right: 'auto', marginBottom: '1rem' }}>{usernameMsg}</div>}
          {usernameErr && <div className="toast error" style={{ position: 'relative', bottom: 'auto', right: 'auto', marginBottom: '1rem' }}>{usernameErr}</div>}
          <form onSubmit={handleUpdateUsername} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label" htmlFor="profile-username">Username</label>
              <input
                type="text"
                className="form-input"
                id="profile-username"
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="btn btn-primary btn-sm" id="update-username-btn">Save</button>
          </form>
        </div>

        {/* Update Email */}
        <div className="profile-card" style={{ animationDelay: '60ms' }}>
          <h3 className="profile-card-title">✉️ Update Email</h3>
          {emailMsg && <div className="toast success" style={{ position: 'relative', bottom: 'auto', right: 'auto', marginBottom: '1rem' }}>{emailMsg}</div>}
          {emailErr && <div className="toast error" style={{ position: 'relative', bottom: 'auto', right: 'auto', marginBottom: '1rem' }}>{emailErr}</div>}
          <form onSubmit={handleUpdateEmail} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label" htmlFor="profile-email">Email</label>
              <input
                type="email"
                className="form-input"
                id="profile-email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="btn btn-primary btn-sm" id="update-email-btn">Save</button>
          </form>
        </div>

        {/* Change Password */}
        <div className="profile-card" style={{ animationDelay: '120ms' }}>
          <h3 className="profile-card-title">🔒 Change Password</h3>
          {passwordMsg && <div className="toast success" style={{ position: 'relative', bottom: 'auto', right: 'auto', marginBottom: '1rem' }}>{passwordMsg}</div>}
          {passwordErr && <div className="toast error" style={{ position: 'relative', bottom: 'auto', right: 'auto', marginBottom: '1rem' }}>{passwordErr}</div>}
          <form onSubmit={handleChangePassword} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label" htmlFor="profile-old-password">Current Password</label>
              <input
                type="password"
                className="form-input"
                id="profile-old-password"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="profile-new-password">New Password</label>
              <input
                type="password"
                className="form-input"
                id="profile-new-password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="btn btn-primary btn-sm" id="change-password-btn">Change Password</button>
          </form>
        </div>

        {/* Danger Zone */}
        <div className="profile-card" style={{ animationDelay: '180ms', borderColor: 'rgba(239, 68, 68, 0.2)' }}>
          <h3 className="profile-card-title" style={{ color: 'var(--error)' }}>⚠️ Danger Zone</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem', marginBottom: '1rem' }}>
            Once you delete your account, there is no going back. Please be certain.
          </p>
          {!showDeleteConfirm ? (
            <button className="btn btn-danger btn-sm" onClick={() => setShowDeleteConfirm(true)} id="show-delete-btn">
              Delete My Account
            </button>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label" htmlFor="delete-password">Enter your password to confirm</label>
                <input
                  type="password"
                  className="form-input"
                  id="delete-password"
                  value={deletePassword}
                  onChange={(e) => setDeletePassword(e.target.value)}
                  placeholder="Your password"
                />
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button className="btn btn-danger btn-sm" onClick={handleDeleteAccount} disabled={!deletePassword} id="confirm-delete-btn">
                  Permanently Delete
                </button>
                <button className="btn btn-ghost btn-sm" onClick={() => { setShowDeleteConfirm(false); setDeletePassword(''); }}>
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
