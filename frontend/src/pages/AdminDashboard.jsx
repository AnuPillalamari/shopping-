import React, { useState, useEffect } from 'react';
import api from '../utils/api.js';
import Spinner from '../components/Spinner.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';

const AdminDashboard = () => {
  const { user: currentAdmin } = useAuth();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState('analytics');
  const [loading, setLoading] = useState(true);

  // States
  const [analytics, setAnalytics] = useState(null);
  const [users, setUsers] = useState([]);
  const [stocks, setStocks] = useState([]);
  const [transactions, setTransactions] = useState([]);

  // Stock Form state (Create/Edit)
  const [stockForm, setStockForm] = useState({
    symbol: '',
    companyName: '',
    currentPrice: '',
    marketCap: '',
  });
  const [editingStockId, setEditingStockId] = useState(null);

  // User Edit state
  const [editingUserId, setEditingUserId] = useState(null);
  const [userForm, setUserForm] = useState({
    name: '',
    email: '',
    role: 'USER',
    walletBalance: 100000,
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      if (activeTab === 'analytics') {
        const res = await api.get('/admin/analytics');
        setAnalytics(res.data);
      } else if (activeTab === 'users') {
        const res = await api.get('/admin/users');
        setUsers(res.data);
      } else if (activeTab === 'stocks') {
        const res = await api.get('/stocks'); // Get standard list for editing
        setStocks(res.data);
      } else if (activeTab === 'transactions') {
        const res = await api.get('/admin/transactions');
        setTransactions(res.data);
      }
    } catch (error) {
      console.error(error);
      showToast('Failed to retrieve administration data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const handleStockSubmit = async (e) => {
    e.preventDefault();
    if (!stockForm.symbol || !stockForm.companyName || !stockForm.currentPrice) {
      showToast('Please fill in all required stock fields', 'error');
      return;
    }

    try {
      if (editingStockId) {
        // Edit Stock
        await api.put(`/admin/stocks/${editingStockId}`, stockForm);
        showToast('Stock asset updated successfully', 'success');
      } else {
        // Create Stock
        await api.post('/admin/stocks', stockForm);
        showToast('New stock listed successfully', 'success');
      }
      setStockForm({ symbol: '', companyName: '', currentPrice: '', marketCap: '' });
      setEditingStockId(null);
      fetchData();
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Stock action failed.';
      showToast(errorMsg, 'error');
    }
  };

  const handleStockDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this stock? This will delete it from all user portfolios.')) return;
    try {
      await api.delete(`/admin/stocks/${id}`);
      showToast('Stock listing deleted from platform', 'success');
      fetchData();
    } catch (error) {
      showToast('Failed to delete stock listing', 'error');
    }
  };

  const handleUserEditClick = (user) => {
    setEditingUserId(user._id);
    setUserForm({
      name: user.name,
      email: user.email,
      role: user.role,
      walletBalance: user.walletBalance,
    });
  };

  const handleUserUpdate = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/admin/users/${editingUserId}`, userForm);
      showToast('User settings modified successfully', 'success');
      setEditingUserId(null);
      fetchData();
    } catch (error) {
      showToast('Failed to update user parameters', 'error');
    }
  };

  const handleUserDelete = async (id) => {
    if (id === currentAdmin._id) {
      showToast('You cannot delete your own admin account', 'error');
      return;
    }
    if (!window.confirm('Are you sure you want to delete this investor? This action removes their portfolio assets and transaction history.')) return;
    
    try {
      await api.delete(`/admin/users/${id}`);
      showToast('Investor records deleted', 'success');
      fetchData();
    } catch (error) {
      showToast('Failed to delete investor records', 'error');
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
        <h1 className="fw-bold mb-1 border-bottom border-warning border-opacity-20 pb-3 text-warning">
          <i className="bi bi-shield-lock-fill me-2"></i> Admin Control Panel
        </h1>
        <p className="text-muted">Manage system securities, monitor active accounts, audit records, and analyze trading analytics.</p>
      </div>

      {/* Tabs list */}
      <div className="mb-4">
        <ul className="nav nav-pills gap-2 border-bottom border-light border-opacity-10 pb-3">
          <li className="nav-item">
            <button
              className={`btn ${activeTab === 'analytics' ? 'btn-primary-glow' : 'btn-dark-glass'}`}
              onClick={() => setActiveTab('analytics')}
            >
              <i className="bi bi-speedometer2 me-1"></i> Dashboard Stats
            </button>
          </li>
          <li className="nav-item">
            <button
              className={`btn ${activeTab === 'users' ? 'btn-primary-glow' : 'btn-dark-glass'}`}
              onClick={() => setActiveTab('users')}
            >
              <i className="bi bi-people me-1"></i> Investors (CRUD)
            </button>
          </li>
          <li className="nav-item">
            <button
              className={`btn ${activeTab === 'stocks' ? 'btn-primary-glow' : 'btn-dark-glass'}`}
              onClick={() => setActiveTab('stocks')}
            >
              <i className="bi bi-currency-share me-1"></i> Securities (CRUD)
            </button>
          </li>
          <li className="nav-item">
            <button
              className={`btn ${activeTab === 'transactions' ? 'btn-primary-glow' : 'btn-dark-glass'}`}
              onClick={() => setActiveTab('transactions')}
            >
              <i className="bi bi-journal-text me-1"></i> Audit Logs
            </button>
          </li>
        </ul>
      </div>

      {/* Loading Wrapper */}
      {loading ? (
        <Spinner size="large" />
      ) : (
        <>
          {/* Tab content area */}
          {activeTab === 'analytics' && analytics && (
            <div className="fade-in-up">
              <div className="row g-4 mb-4">
                <div className="col-md-4">
                  <div className="glass-card p-4">
                    <span className="text-muted small fw-semibold d-block mb-1">Total Investors</span>
                    <h2 className="fw-extrabold text-white mb-0">{analytics.userCount}</h2>
                    <span className="text-muted small">Registered Accounts</span>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="glass-card p-4">
                    <span className="text-muted small fw-semibold d-block mb-1">Securities Listed</span>
                    <h2 className="fw-extrabold text-white mb-0">{analytics.stockCount}</h2>
                    <span className="text-muted small">Active stock symbols</span>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="glass-card p-4">
                    <span className="text-muted small fw-semibold d-block mb-1">Total Orders Filled</span>
                    <h2 className="fw-extrabold text-white mb-0">{analytics.transactionCount}</h2>
                    <span className="text-muted small">Buy & Sell transaction events</span>
                  </div>
                </div>
              </div>

              <div className="row g-4">
                <div className="col-md-4">
                  <div className="glass-card p-4">
                    <span className="text-muted small fw-semibold d-block mb-1">Global Wallet Funds</span>
                    <h3 className="fw-extrabold text-white mb-0">{formatCurrency(analytics.totalWalletBalance)}</h3>
                    <span className="text-muted small">Combined user liquid cash</span>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="glass-card p-4">
                    <span className="text-muted small fw-semibold d-block mb-1">System Trade Volume</span>
                    <h3 className="fw-extrabold text-white mb-0">{formatCurrency(analytics.totalTradingVolume)}</h3>
                    <span className="text-muted small">Cumulated dollar trading transactions</span>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="glass-card p-4">
                    <span className="text-muted small fw-semibold d-block mb-1">Most Traded Security</span>
                    <h3 className="fw-extrabold text-warning mb-0">{analytics.topTradedStock}</h3>
                    <span className="text-muted small">Highly transacted symbol</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'users' && (
            <div className="fade-in-up">
              {/* User edit modal/form */}
              {editingUserId && (
                <div className="glass-card p-4 mb-4 border border-warning border-opacity-35">
                  <h5 className="fw-bold mb-3 text-warning">Modify User Details</h5>
                  <form onSubmit={handleUserUpdate}>
                    <div className="row g-3 align-items-end">
                      <div className="col-md-3">
                        <label className="form-label text-muted small">Name</label>
                        <input
                          type="text"
                          className="form-control form-glass"
                          value={userForm.name}
                          onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
                          required
                        />
                      </div>
                      <div className="col-md-3">
                        <label className="form-label text-muted small">Email</label>
                        <input
                          type="email"
                          className="form-control form-glass"
                          value={userForm.email}
                          onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                          required
                        />
                      </div>
                      <div className="col-md-2">
                        <label className="form-label text-muted small">Role</label>
                        <select
                          className="form-select form-glass"
                          value={userForm.role}
                          onChange={(e) => setUserForm({ ...userForm, role: e.target.value })}
                          style={{ background: '#121826', color: '#fff' }}
                        >
                          <option value="USER">USER</option>
                          <option value="ADMIN">ADMIN</option>
                        </select>
                      </div>
                      <div className="col-md-2">
                        <label className="form-label text-muted small">Wallet Funds ($)</label>
                        <input
                          type="number"
                          className="form-control form-glass"
                          value={userForm.walletBalance}
                          onChange={(e) => setUserForm({ ...userForm, walletBalance: parseFloat(e.target.value) || 0 })}
                          required
                        />
                      </div>
                      <div className="col-md-2 d-flex gap-2">
                        <button type="submit" className="btn btn-warning btn-sm py-2 px-3 flex-grow-1 fw-bold">Update</button>
                        <button
                          type="button"
                          className="btn btn-dark-glass btn-sm py-2 px-3"
                          onClick={() => setEditingUserId(null)}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </form>
                </div>
              )}

              {/* Users table */}
              <div className="glass-card p-4">
                <h5 className="fw-bold mb-4">Platform Users</h5>
                <div className="table-responsive">
                  <table className="table table-hover table-glass align-middle mb-0">
                    <thead>
                      <tr>
                        <th scope="col">User ID</th>
                        <th scope="col">Name</th>
                        <th scope="col">Email</th>
                        <th scope="col">Role</th>
                        <th scope="col" className="text-end">Wallet Balance</th>
                        <th scope="col" className="text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((u) => (
                        <tr key={u._id}>
                          <td className="text-muted small" style={{ fontSize: '0.75rem' }}>{u._id}</td>
                          <td className="text-white fw-bold">{u.name}</td>
                          <td>{u.email}</td>
                          <td>
                            <span className={`badge ${u.role === 'ADMIN' ? 'bg-warning text-dark' : 'bg-primary'} fw-bold`}>
                              {u.role}
                            </span>
                          </td>
                          <td className="text-end text-white fw-semibold">{formatCurrency(u.walletBalance)}</td>
                          <td className="text-center">
                            <div className="d-flex justify-content-center gap-2">
                              <button className="btn btn-dark-glass btn-sm py-1 px-2.5" onClick={() => handleUserEditClick(u)}>
                                <i className="bi bi-pencil"></i>
                              </button>
                              <button
                                className="btn btn-primary-glow btn-sm py-1 px-2.5"
                                style={{ background: 'linear-gradient(135deg, #f43f5e 0%, #e11d48 100%)' }}
                                onClick={() => handleUserDelete(u._id)}
                                disabled={u._id === currentAdmin._id}
                              >
                                <i className="bi bi-trash"></i>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'stocks' && (
            <div className="fade-in-up">
              {/* Add/Edit Stock Panel */}
              <div className="glass-card p-4 mb-4">
                <h5 className="fw-bold mb-3 text-white">
                  {editingStockId ? 'Modify Securities Details' : 'List New Securities Asset'}
                </h5>
                <form onSubmit={handleStockSubmit}>
                  <div className="row g-3">
                    <div className="col-md-2">
                      <label className="form-label text-muted small">Symbol (e.g. NVDA)</label>
                      <input
                        type="text"
                        className="form-control form-glass text-uppercase"
                        placeholder="AAPL"
                        value={stockForm.symbol}
                        onChange={(e) => setStockForm({ ...stockForm, symbol: e.target.value })}
                        required
                        disabled={!!editingStockId} // Cannot edit symbol name once created
                      />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label text-muted small">Company Name</label>
                      <input
                        type="text"
                        className="form-control form-glass"
                        placeholder="Apple Inc."
                        value={stockForm.companyName}
                        onChange={(e) => setStockForm({ ...stockForm, companyName: e.target.value })}
                        required
                      />
                    </div>
                    <div className="col-md-2">
                      <label className="form-label text-muted small">Current Price ($)</label>
                      <input
                        type="number"
                        step="0.01"
                        className="form-control form-glass"
                        placeholder="150.00"
                        value={stockForm.currentPrice}
                        onChange={(e) => setStockForm({ ...stockForm, currentPrice: e.target.value })}
                        required
                      />
                    </div>
                    <div className="col-md-2">
                      <label className="form-label text-muted small">Market Cap ($)</label>
                      <input
                        type="number"
                        className="form-control form-glass"
                        placeholder="2500000000000"
                        value={stockForm.marketCap}
                        onChange={(e) => setStockForm({ ...stockForm, marketCap: e.target.value })}
                      />
                    </div>
                    <div className="col-md-2 d-flex align-items-end gap-2">
                      <button type="submit" className="btn btn-primary-glow btn-sm py-2.5 px-3 flex-grow-1">
                        {editingStockId ? 'Save' : 'Create Asset'}
                      </button>
                      {editingStockId && (
                        <button
                          type="button"
                          className="btn btn-dark-glass btn-sm py-2.5 px-3"
                          onClick={() => {
                            setEditingStockId(null);
                            setStockForm({ symbol: '', companyName: '', currentPrice: '', marketCap: '' });
                          }}
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>
                </form>
              </div>

              {/* Stocks list */}
              <div className="glass-card p-4">
                <h5 className="fw-bold mb-4 font-bold">Securities Listed</h5>
                <div className="table-responsive">
                  <table className="table table-hover table-glass align-middle mb-0">
                    <thead>
                      <tr>
                        <th scope="col">Symbol</th>
                        <th scope="col">Company</th>
                        <th scope="col" className="text-end">Current Price</th>
                        <th scope="col" className="text-end">Market Cap</th>
                        <th scope="col" className="text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stocks.map((stock) => (
                        <tr key={stock._id}>
                          <td>
                            <span className="fw-extrabold text-white">{stock.symbol}</span>
                          </td>
                          <td>{stock.companyName}</td>
                          <td className="text-end fw-bold text-white">{formatCurrency(stock.currentPrice)}</td>
                          <td className="text-end">
                            {stock.marketCap ? formatCurrency(stock.marketCap) : 'N/A'}
                          </td>
                          <td className="text-center">
                            <div className="d-flex justify-content-center gap-2">
                              <button
                                className="btn btn-dark-glass btn-sm py-1 px-2.5"
                                onClick={() => {
                                  setEditingStockId(stock._id);
                                  setStockForm({
                                    symbol: stock.symbol,
                                    companyName: stock.companyName,
                                    currentPrice: stock.currentPrice,
                                    marketCap: stock.marketCap || '',
                                  });
                                }}
                              >
                                <i className="bi bi-pencil"></i>
                              </button>
                              <button
                                className="btn btn-primary-glow btn-sm py-1 px-2.5"
                                style={{ background: 'linear-gradient(135deg, #f43f5e 0%, #e11d48 100%)' }}
                                onClick={() => handleStockDelete(stock._id)}
                              >
                                <i className="bi bi-trash"></i>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'transactions' && (
            <div className="glass-card p-4 fade-in-up">
              <h5 className="fw-bold mb-4 text-white">Full Audit Logs</h5>
              {transactions.length === 0 ? (
                <div className="text-center py-5 text-muted">
                  <i className="bi bi-journal-text fs-1 mb-2"></i>
                  <p>No transactions registered in system database yet.</p>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover table-glass align-middle mb-0">
                    <thead>
                      <tr>
                        <th scope="col">Date</th>
                        <th scope="col">Investor</th>
                        <th scope="col">Asset</th>
                        <th scope="col">Action</th>
                        <th scope="col" className="text-end">Qty</th>
                        <th scope="col" className="text-end">Price</th>
                        <th scope="col" className="text-end">Total Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {transactions.map((tx) => {
                        const userEmail = tx.userId ? tx.userId.email : 'Deleted User';
                        const userName = tx.userId ? tx.userId.name : 'N/A';
                        const stockSymbol = tx.stockId ? tx.stockId.symbol : 'Deleted Stock';
                        const txTotalValue = tx.price * tx.quantity;

                        return (
                          <tr key={tx._id}>
                            <td className="text-white-50 small">
                              {new Date(tx.timestamp).toLocaleString()}
                            </td>
                            <td>
                              <div>
                                <span className="fw-bold text-white d-block">{userName}</span>
                                <span className="text-muted small" style={{ fontSize: '0.75rem' }}>{userEmail}</span>
                              </div>
                            </td>
                            <td>
                              <span className="fw-bold text-white">{stockSymbol}</span>
                            </td>
                            <td>
                              <span className={tx.type === 'BUY' ? 'badge-growth' : 'badge-decline'}>
                                {tx.type}
                              </span>
                            </td>
                            <td className="text-end text-white">{tx.quantity}</td>
                            <td className="text-end text-white-50">{formatCurrency(tx.price)}</td>
                            <td className="text-end text-white fw-bold">{formatCurrency(txTotalValue)}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AdminDashboard;
