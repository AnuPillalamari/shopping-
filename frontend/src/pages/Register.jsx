import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('USER'); // Option to test ADMIN panel easily
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !password || !confirmPassword) {
      showToast('Please fill in all fields', 'error');
      return;
    }

    if (password !== confirmPassword) {
      showToast('Passwords do not match', 'error');
      return;
    }

    if (password.length < 6) {
      showToast('Password must be at least 6 characters long', 'error');
      return;
    }

    try {
      setLoading(true);
      await register(name, email, password, role);
      showToast('Account created successfully!', 'success');
      navigate('/dashboard');
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Registration failed. Please try again.';
      showToast(errorMsg, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-5 mt-4">
      <div className="row justify-content-center">
        <div className="col-md-5">
          <div className="glass-card p-5 fade-in-up">
            {/* Header */}
            <div className="text-center mb-4">
              <h2 className="fw-extrabold mb-1">Create Account</h2>
              <p className="text-muted">Start trading mock stocks with $100,000</p>
            </div>

            {/* Register Form */}
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label text-muted fw-semibold small">Full Name</label>
                <input
                  type="text"
                  className="form-control form-glass"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={loading}
                  required
                />
              </div>

              <div className="mb-3">
                <label className="form-label text-muted fw-semibold small">Email Address</label>
                <input
                  type="email"
                  className="form-control form-glass"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  required
                />
              </div>

              <div className="row mb-3">
                <div className="col-6">
                  <label className="form-label text-muted fw-semibold small">Password</label>
                  <input
                    type="password"
                    className="form-control form-glass"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading}
                    required
                  />
                </div>
                <div className="col-6">
                  <label className="form-label text-muted fw-semibold small">Confirm Password</label>
                  <input
                    type="password"
                    className="form-control form-glass"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={loading}
                    required
                  />
                </div>
              </div>

              {/* Developer Test Role Select */}
              <div className="mb-4">
                <label className="form-label text-muted fw-semibold small">Account Role (Testing)</label>
                <select
                  className="form-select form-glass"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  disabled={loading}
                  style={{ background: '#121826', color: '#fff' }}
                >
                  <option value="USER">Standard User (Investor)</option>
                  <option value="ADMIN">System Admin (Manage Platform)</option>
                </select>
                <div className="form-text text-muted small mt-1">
                  Choose Admin to unlock the Admin Desk management options.
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-primary-glow w-100 py-2.5 mt-2 d-flex justify-content-center align-items-center gap-2"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                    Creating account...
                  </>
                ) : (
                  'Sign Up'
                )}
              </button>
            </form>

            {/* Login Redirect */}
            <div className="text-center mt-4">
              <p className="text-muted mb-0 small">
                Already have an account?{' '}
                <Link to="/login" className="text-primary fw-bold text-decoration-none ms-1">
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
