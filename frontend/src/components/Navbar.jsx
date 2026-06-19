import React from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const Navbar = () => {
  const { user, logout, isAuthenticated, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(val || 0);
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark navbar-custom sticky-top">
      <div className="container">
        {/* Brand */}
        <Link className="navbar-brand d-flex align-items-center gap-2 fw-extrabold fs-4" to="/">
          <i className="bi bi-graph-up-arrow text-primary"></i>
          <span>Trade<span className="text-gradient">EZ</span></span>
        </Link>

        {/* Toggle button */}
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#tradeezNavbar"
          aria-controls="tradeezNavbar"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        {/* Collapsible Content */}
        <div className="collapse navbar-collapse" id="tradeezNavbar">
          {isAuthenticated ? (
            <>
              {/* User Navigation Links */}
              <ul className="navbar-nav me-auto mb-2 mb-lg-0 gap-1 ms-lg-3">
                <li className="nav-item">
                  <NavLink
                    className={({ isActive }) =>
                      `nav-link nav-link-custom ${isActive ? 'active' : ''}`
                    }
                    to="/dashboard"
                  >
                    <i className="bi bi-compass me-1"></i> Market
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink
                    className={({ isActive }) =>
                      `nav-link nav-link-custom ${isActive ? 'active' : ''}`
                    }
                    to="/portfolio"
                  >
                    <i className="bi bi-briefcase me-1"></i> Portfolio
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink
                    className={({ isActive }) =>
                      `nav-link nav-link-custom ${isActive ? 'active' : ''}`
                    }
                    to="/transactions"
                  >
                    <i className="bi bi-clock-history me-1"></i> Transactions
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink
                    className={({ isActive }) =>
                      `nav-link nav-link-custom ${isActive ? 'active' : ''}`
                    }
                    to="/profile"
                  >
                    <i className="bi bi-person me-1"></i> Profile
                  </NavLink>
                </li>
                {isAdmin && (
                  <li className="nav-item">
                    <NavLink
                      className={({ isActive }) =>
                        `nav-link nav-link-custom border border-warning text-warning ${
                          isActive ? 'active bg-warning-subtle' : ''
                        }`
                      }
                      to="/admin"
                    >
                      <i className="bi bi-shield-lock me-1"></i> Admin Desk
                    </NavLink>
                  </li>
                )}
              </ul>

              {/* User Financials and Profile Dropdown */}
              <div className="d-flex align-items-center gap-3 ms-auto mt-3 mt-lg-0">
                {/* Wallet Balance Pill */}
                <div
                  className="d-flex align-items-center gap-2 px-3 py-2 rounded-pill shadow-sm"
                  style={{
                    background: 'rgba(99, 102, 241, 0.12)',
                    border: '1px solid rgba(99, 102, 241, 0.25)',
                  }}
                  title="Virtual Wallet Balance"
                >
                  <i className="bi bi-wallet2 text-primary fs-5"></i>
                  <span className="fw-bold text-white fs-6">
                    {formatCurrency(user?.walletBalance)}
                  </span>
                </div>

                {/* Account Actions */}
                <div className="dropdown">
                  <button
                    className="btn btn-dark-glass dropdown-toggle d-flex align-items-center gap-2 py-2"
                    type="button"
                    id="userDropdown"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                  >
                    <i className="bi bi-person-circle fs-5 text-primary"></i>
                    <span className="fw-semibold">{user?.name}</span>
                  </button>
                  <ul
                    className="dropdown-menu dropdown-menu-end dropdown-menu-dark border border-secondary shadow-lg mt-2"
                    style={{ borderRadius: '12px', background: '#121826' }}
                    aria-labelledby="userDropdown"
                  >
                    <li>
                      <Link className="dropdown-item py-2" to="/profile">
                        <i className="bi bi-gear me-2"></i> Settings
                      </Link>
                    </li>
                    {isAdmin && (
                      <li>
                        <Link className="dropdown-item py-2 text-warning" to="/admin">
                          <i className="bi bi-shield-check me-2"></i> Admin Panel
                        </Link>
                      </li>
                    )}
                    <li>
                      <hr className="dropdown-divider border-secondary" />
                    </li>
                    <li>
                      <button className="dropdown-item py-2 text-danger" onClick={handleLogout}>
                        <i className="bi bi-box-arrow-right me-2"></i> Logout
                      </button>
                    </li>
                  </ul>
                </div>
              </div>
            </>
          ) : (
            /* Auth actions if logged out */
            <div className="d-flex align-items-center gap-2 ms-auto mt-3 mt-lg-0">
              <Link className="btn btn-dark-glass px-4" to="/login">
                Sign In
              </Link>
              <Link className="btn btn-primary-glow px-4" to="/register">
                Get Started
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
