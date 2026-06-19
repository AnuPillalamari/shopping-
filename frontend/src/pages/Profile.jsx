import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';

const Profile = () => {
  const { user, updateProfile } = useAuth();
  const { showToast } = useToast();

  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email) {
      showToast('Name and Email are required', 'error');
      return;
    }

    if (password && password !== confirmPassword) {
      showToast('Passwords do not match', 'error');
      return;
    }

    try {
      setLoading(true);
      const payload = { name, email };
      if (password) {
        payload.password = password;
      }

      await updateProfile(payload);
      showToast('Profile updated successfully!', 'success');
      setPassword('');
      setConfirmPassword('');
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to update profile settings.';
      showToast(errorMsg, 'error');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(val || 0);
  };

  return (
    <div className="container py-4 fade-in-up">
      {/* Page Title */}
      <div className="mb-4">
        <h1 className="fw-bold mb-1">Account Profile Settings</h1>
        <p className="text-muted">Manage your personal credentials, view security details, and review virtual balance.</p>
      </div>

      <div className="row g-4">
        {/* User Card info */}
        <div className="col-md-4">
          <div className="glass-card p-4 text-center h-100 d-flex flex-column justify-content-center">
            <div className="position-relative d-inline-block mx-auto mb-3">
              <i className="bi bi-person-circle text-primary" style={{ fontSize: '5rem' }}></i>
              <span className="position-absolute bottom-0 end-0 bg-success border border-dark rounded-circle p-2" title="Investor Active"></span>
            </div>
            
            <h4 className="fw-bold text-white mb-1">{user?.name}</h4>
            <p className="text-muted small mb-3">{user?.email}</p>

            <span className="badge bg-secondary-subtle text-secondary-emphasis rounded-pill px-3 py-1.5 fw-bold mx-auto mb-4" style={{ fontSize: '0.8rem' }}>
              Account Role: {user?.role}
            </span>

            <div className="p-3 rounded border border-light border-opacity-10 text-center" style={{ background: 'rgba(255, 255, 255, 0.01)' }}>
              <span className="text-muted d-block small mb-1">Total Available Cash</span>
              <span className="fw-extrabold text-white fs-4">{formatCurrency(user?.walletBalance)}</span>
            </div>
          </div>
        </div>

        {/* Change Form Card */}
        <div className="col-md-8">
          <div className="glass-card p-4 h-100">
            <h5 className="fw-bold mb-4 d-flex align-items-center gap-2">
              <i className="bi bi-shield-check text-primary"></i> Edit Information
            </h5>

            <form onSubmit={handleSubmit}>
              <div className="row mb-3">
                <div className="col-md-6">
                  <label className="form-label text-muted small fw-semibold">Full Name</label>
                  <input
                    type="text"
                    className="form-control form-glass"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={loading}
                    required
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label text-muted small fw-semibold">Email Address</label>
                  <input
                    type="email"
                    className="form-control form-glass"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={loading}
                    required
                  />
                </div>
              </div>

              <div className="row mb-4">
                <div className="col-md-6">
                  <label className="form-label text-muted small fw-semibold">New Password (Leave blank to keep current)</label>
                  <input
                    type="password"
                    className="form-control form-glass"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading}
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label text-muted small fw-semibold">Confirm New Password</label>
                  <input
                    type="password"
                    className="form-control form-glass"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={loading}
                  />
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-primary-glow px-4 py-2.5 d-flex align-items-center gap-2"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm" role="status"></span>
                    Saving Changes...
                  </>
                ) : (
                  'Save Settings'
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
