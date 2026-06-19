import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api.js';
import Spinner from '../components/Spinner.jsx';
import { useToast } from '../context/ToastContext.jsx';

const Transactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const response = await api.get('/users/transactions');
      setTransactions(response.data);
    } catch (error) {
      console.error(error);
      showToast('Failed to load transaction history', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(val || 0);
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleString([], {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) return <Spinner size="large" />;

  return (
    <div className="container py-4 fade-in-up">
      {/* Page Header */}
      <div className="mb-4">
        <h1 className="fw-bold mb-1">Transaction History</h1>
        <p className="text-muted">Review all completed buy and sell orders executed on your account.</p>
      </div>

      <div className="glass-card p-4">
        {transactions.length === 0 ? (
          <div className="text-center py-5 text-muted">
            <i className="bi bi-clock-history fs-1 mb-3 text-secondary d-block"></i>
            <h5>No Transactions Found</h5>
            <p className="small">Your filled order logs will appear here once you trade stocks.</p>
            <Link to="/dashboard" className="btn btn-primary-glow btn-sm mt-3">
              Trade Now
            </Link>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table table-hover table-glass align-middle mb-0">
              <thead>
                <tr>
                  <th scope="col">Timestamp</th>
                  <th scope="col">Stock Asset</th>
                  <th scope="col">Action Type</th>
                  <th scope="col" className="text-end">Quantity</th>
                  <th scope="col" className="text-end">Execution Price</th>
                  <th scope="col" className="text-end">Total Value</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((tx) => {
                  const stockSymbol = tx.stockId ? tx.stockId.symbol : 'N/A';
                  const companyName = tx.stockId ? tx.stockId.companyName : 'Deleted Asset';
                  const txTotal = tx.price * tx.quantity;

                  return (
                    <tr key={tx._id}>
                      <td className="text-white-50">{formatDate(tx.timestamp)}</td>
                      <td>
                        {tx.stockId ? (
                          <Link to={`/stocks/${tx.stockId._id}`} className="text-decoration-none fw-bold text-white d-block">
                            {stockSymbol} <span className="fw-normal text-muted small ms-1">({companyName})</span>
                          </Link>
                        ) : (
                          <span className="text-white-50">{stockSymbol} ({companyName})</span>
                        )}
                      </td>
                      <td>
                        <span className={tx.type === 'BUY' ? 'badge-growth' : 'badge-decline'} style={{ fontSize: '0.75rem' }}>
                          {tx.type === 'BUY' ? (
                            <>
                              <i className="bi bi-plus-lg me-1"></i> BUY
                            </>
                          ) : (
                            <>
                              <i className="bi bi-dash-lg me-1"></i> SELL
                            </>
                          )}
                        </span>
                      </td>
                      <td className="text-end text-white">{tx.quantity}</td>
                      <td className="text-end text-white-50">{formatCurrency(tx.price)}</td>
                      <td className="text-end text-white fw-bold">{formatCurrency(txTotal)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Transactions;
