import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api.js';
import Spinner from '../components/Spinner.jsx';
import { useToast } from '../context/ToastContext.jsx';

// Chart.js imports
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

const Portfolio = () => {
  const [holdings, setHoldings] = useState([]);
  const [summary, setSummary] = useState({
    totalInvestment: 0,
    totalCurrentValue: 0,
    totalProfitLoss: 0,
    totalProfitLossPercentage: 0,
    walletBalance: 0,
  });
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  const fetchPortfolio = async (isSilent = false) => {
    try {
      if (!isSilent) setLoading(true);
      const response = await api.get('/users/portfolio');
      setHoldings(response.data.holdings);
      setSummary(response.data.summary);
    } catch (error) {
      console.error('Failed to load portfolio:', error);
      if (!isSilent) showToast('Failed to retrieve portfolio data', 'error');
    } finally {
      if (!isSilent) setLoading(false);
    }
  };

  useEffect(() => {
    fetchPortfolio();

    // Poll every 10s to reflect stock price variations in values
    const interval = setInterval(() => {
      fetchPortfolio(true);
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(val || 0);
  };

  if (loading && holdings.length === 0) return <Spinner size="large" />;

  // Setup Doughnut chart data for asset allocation
  const chartLabels = holdings.map((h) => h.stock.symbol);
  const chartDataValues = holdings.map((h) => h.currentValue);
  
  // Custom vibrant HSL palette for chart slices
  const backgroundColors = holdings.map((_, index) => {
    const hue = (index * 137.5) % 360; // Golden ratio spacing
    return `hsla(${hue}, 70%, 55%, 0.75)`;
  });
  const borderColors = holdings.map((_, index) => {
    const hue = (index * 137.5) % 360;
    return `hsla(${hue}, 70%, 55%, 1)`;
  });

  const doughnutData = {
    labels: chartLabels,
    datasets: [
      {
        data: chartDataValues,
        backgroundColor: backgroundColors,
        borderColor: borderColors,
        borderWidth: 1.5,
      },
    ],
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
        labels: {
          color: '#f3f4f6',
          font: {
            size: 11,
          },
        },
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const label = context.label || '';
            const value = context.parsed || 0;
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
            return `${label}: ${formatCurrency(value)} (${percentage}%)`;
          },
        },
      },
    },
  };

  return (
    <div className="container py-4 fade-in-up">
      {/* Page Header */}
      <div className="mb-4">
        <h1 className="fw-bold mb-1">Portfolio Dashboard</h1>
        <p className="text-muted">Analyze allocations, track cost basis, and review total profit/loss margins.</p>
      </div>

      {/* Summary Cards Row */}
      <div className="row g-4 mb-4">
        <div className="col-md-3">
          <div className="glass-card p-4">
            <span className="text-muted small fw-semibold d-block mb-1">Net Portfolio Value</span>
            <h3 className="fw-extrabold text-white mb-0">
              {formatCurrency(summary.totalCurrentValue + summary.walletBalance)}
            </h3>
            <span className="text-muted small">Holdings + Cash</span>
          </div>
        </div>

        <div className="col-md-3">
          <div className="glass-card p-4">
            <span className="text-muted small fw-semibold d-block mb-1">Total Investment</span>
            <h3 className="fw-extrabold text-white mb-0">
              {formatCurrency(summary.totalInvestment)}
            </h3>
            <span className="text-muted small">Total Cost Basis</span>
          </div>
        </div>

        <div className="col-md-3">
          <div className="glass-card p-4">
            <span className="text-muted small fw-semibold d-block mb-1">Total Return (P/L)</span>
            <h3 className={`fw-extrabold mb-0 ${summary.totalProfitLoss >= 0 ? 'text-success' : 'text-danger'}`}>
              {summary.totalProfitLoss >= 0 ? '+' : ''}
              {formatCurrency(summary.totalProfitLoss)}
            </h3>
            <span className={`small fw-semibold ${summary.totalProfitLoss >= 0 ? 'text-success' : 'text-danger'}`}>
              {summary.totalProfitLoss >= 0 ? '▲' : '▼'} {summary.totalProfitLossPercentage.toFixed(2)}%
            </span>
          </div>
        </div>

        <div className="col-md-3">
          <div className="glass-card p-4">
            <span className="text-muted small fw-semibold d-block mb-1">Wallet Cash</span>
            <h3 className="fw-extrabold text-white mb-0">
              {formatCurrency(summary.walletBalance)}
            </h3>
            <span className="text-muted small">Buying Power</span>
          </div>
        </div>
      </div>

      {holdings.length === 0 ? (
        /* Empty State */
        <div className="glass-card p-5 text-center">
          <i className="bi bi-briefcase text-secondary fs-1 mb-3"></i>
          <h4>Your Portfolio is Empty</h4>
          <p className="text-muted mb-4">You don't own any stock shares yet. Head over to the Market Dashboard to make your first trade.</p>
          <Link to="/dashboard" className="btn btn-primary-glow px-4">
            Browse Stocks
          </Link>
        </div>
      ) : (
        /* Content Panel Layout */
        <div className="row g-4">
          {/* Allocation Chart */}
          <div className="col-lg-5">
            <div className="glass-card p-4 h-100 d-flex flex-column">
              <h5 className="fw-bold mb-4 d-flex align-items-center gap-2">
                <i className="bi bi-pie-chart text-primary"></i> Asset Allocation
              </h5>
              <div className="flex-grow-1 d-flex align-items-center justify-content-center" style={{ minHeight: '260px', maxHeight: '300px' }}>
                <Doughnut data={doughnutData} options={doughnutOptions} />
              </div>
            </div>
          </div>

          {/* Holdings Details Grid */}
          <div className="col-lg-7">
            <div className="glass-card p-4 h-100">
              <h5 className="fw-bold mb-4 d-flex align-items-center gap-2">
                <i className="bi bi-list-check text-primary"></i> Securities Positions
              </h5>

              <div className="table-responsive">
                <table className="table table-hover table-glass align-middle mb-0">
                  <thead>
                    <tr>
                      <th scope="col">Asset</th>
                      <th scope="col" className="text-end">Shares</th>
                      <th scope="col" className="text-end">Avg Cost</th>
                      <th scope="col" className="text-end">Value</th>
                      <th scope="col" className="text-end">Return</th>
                      <th scope="col" className="text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {holdings.map((holding) => (
                      <tr key={holding._id}>
                        <td>
                          <div>
                            <span className="fw-bold text-white d-block">{holding.stock.symbol}</span>
                            <span className="text-muted small" style={{ fontSize: '0.75rem' }}>{holding.stock.companyName}</span>
                          </div>
                        </td>
                        <td className="text-end text-white">{holding.quantity}</td>
                        <td className="text-end text-white-50">{formatCurrency(holding.averagePrice)}</td>
                        <td className="text-end text-white fw-semibold">{formatCurrency(holding.currentValue)}</td>
                        <td className="text-end">
                          <span className={holding.profitLoss >= 0 ? 'text-success' : 'text-danger'} style={{ fontWeight: '600', fontSize: '0.9rem' }}>
                            {holding.profitLoss >= 0 ? '+' : ''}
                            {formatCurrency(holding.profitLoss)}
                            <span className="d-block small text-muted" style={{ fontSize: '0.7rem', fontWeight: 'normal' }}>
                              {holding.profitLossPercentage.toFixed(1)}%
                            </span>
                          </span>
                        </td>
                        <td className="text-center">
                          <Link to={`/stocks/${holding.stock._id}`} className="btn btn-primary-glow btn-sm">
                            Trade
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Portfolio;
