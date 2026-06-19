import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../utils/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import Spinner from '../components/Spinner.jsx';

// Chart.js imports
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
  Legend
);

const StockDetail = () => {
  const { id } = useParams();
  const [stock, setStock] = useState(null);
  const [holding, setHolding] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tradeLoading, setTradeLoading] = useState(false);
  const [quantity, setQuantity] = useState(1);

  const { user, refreshProfile } = useAuth();
  const { showToast } = useToast();

  const fetchStockAndHolding = async (isSilent = false) => {
    try {
      if (!isSilent) setLoading(true);
      
      // Fetch stock detail
      const stockRes = await api.get(`/stocks/${id}`);
      setStock(stockRes.data);

      // Fetch user holding if logged in
      try {
        const portfolioRes = await api.get('/users/portfolio');
        const userHolding = portfolioRes.data.holdings.find(
          (h) => h.stock._id === stockRes.data._id
        );
        setHolding(userHolding || null);
      } catch (err) {
        console.error('Failed to load portfolio holding details:', err);
      }
    } catch (error) {
      console.error(error);
      if (!isSilent) showToast('Failed to load stock details', 'error');
    } finally {
      if (!isSilent) setLoading(false);
    }
  };

  useEffect(() => {
    fetchStockAndHolding();

    // Set up polling to refresh prices and holdings every 10 seconds
    const interval = setInterval(() => {
      fetchStockAndHolding(true);
    }, 10000);

    return () => clearInterval(interval);
  }, [id]);

  const handleTrade = async (type) => {
    const qty = parseInt(quantity);
    if (isNaN(qty) || qty <= 0) {
      showToast('Please enter a valid quantity greater than 0', 'error');
      return;
    }

    try {
      setTradeLoading(true);
      const endpoint = type === 'BUY' ? '/trade/buy' : '/trade/sell';
      const response = await api.post(endpoint, {
        stockId: stock._id,
        quantity: qty,
      });

      showToast(response.data.message, 'success');
      await refreshProfile(); // Refresh wallet balance in navbar
      await fetchStockAndHolding(true); // Update stock detail and local position info
      setQuantity(1); // Reset input
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Transaction failed. Please try again.';
      showToast(errorMsg, 'error');
    } finally {
      setTradeLoading(false);
    }
  };

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(val || 0);
  };

  if (loading && !stock) return <Spinner size="large" />;
  if (!stock) {
    return (
      <div className="container py-5 text-center">
        <div className="glass-card p-5">
          <i className="bi bi-exclamation-octagon text-danger fs-1 mb-3"></i>
          <h4>Stock Not Found</h4>
          <p className="text-muted">The requested stock asset could not be loaded.</p>
          <Link to="/dashboard" className="btn btn-primary-glow mt-3">
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  // Calculate transaction total cost/earning
  const transactionTotal = stock.currentPrice * (parseInt(quantity) || 0);

  // Setup Chart Data & Design Options
  const dates = stock.historicalData.map((d) =>
    new Date(d.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
  );
  const prices = stock.historicalData.map((d) => d.price);

  const chartThemeColor = stock.dailyChange >= 0 ? '#10b981' : '#f43f5e';
  const chartFillGradientColor = stock.dailyChange >= 0 ? 'rgba(16, 185, 129, 0.1)' : 'rgba(244, 63, 94, 0.1)';

  const chartData = {
    labels: dates,
    datasets: [
      {
        fill: true,
        label: `${stock.symbol} Price`,
        data: prices,
        borderColor: chartThemeColor,
        backgroundColor: chartFillGradientColor,
        borderWidth: 2.5,
        pointRadius: 1,
        pointHoverRadius: 5,
        tension: 0.25,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        backgroundColor: '#121826',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
        titleColor: '#9ca3af',
        bodyColor: '#ffffff',
        displayColors: false,
        callbacks: {
          label: (context) => `Price: ${formatCurrency(context.parsed.y)}`,
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: '#9ca3af',
          font: {
            size: 10,
          },
          maxTicksLimit: 8,
        },
      },
      y: {
        grid: {
          color: 'rgba(255, 255, 255, 0.05)',
        },
        ticks: {
          color: '#9ca3af',
          font: {
            size: 10,
          },
          callback: (value) => formatCurrency(value),
        },
      },
    },
  };

  return (
    <div className="container py-4 fade-in-up">
      {/* Navigation Breadcrumb */}
      <div className="mb-4">
        <Link to="/dashboard" className="text-decoration-none text-muted small d-flex align-items-center gap-2">
          <i className="bi bi-arrow-left"></i> Back to Market
        </Link>
      </div>

      {/* Main Stock Headers */}
      <div className="row g-4 mb-4">
        <div className="col-12">
          <div className="glass-card p-4 d-flex justify-content-between align-items-center flex-wrap gap-3">
            <div>
              <div className="d-flex align-items-center gap-2 mb-1">
                <h1 className="fw-extrabold text-white mb-0">{stock.symbol}</h1>
                <span className="text-muted fs-4">|</span>
                <span className="text-muted fs-5 fw-semibold">{stock.companyName}</span>
              </div>
              <p className="text-muted mb-0 small">Asset ID: {stock._id}</p>
            </div>
            
            <div className="text-end">
              <h2 className="fw-extrabold text-white mb-1">{formatCurrency(stock.currentPrice)}</h2>
              <span className={stock.dailyChange >= 0 ? 'badge-growth' : 'badge-decline'}>
                {stock.dailyChange >= 0 ? (
                  <>
                    <i className="bi bi-caret-up-fill"></i>
                    +{stock.dailyChange}%
                  </>
                ) : (
                  <>
                    <i className="bi bi-caret-down-fill"></i>
                    {stock.dailyChange}%
                  </>
                )}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="row g-4">
        {/* Historical Price Chart */}
        <div className="col-lg-8">
          <div className="glass-card p-4 h-100">
            <h5 className="fw-bold mb-4 d-flex align-items-center gap-2">
              <i className="bi bi-graph-up text-primary"></i> Price History
            </h5>
            <div className="chart-container" style={{ minHeight: '350px' }}>
              <Line data={chartData} options={chartOptions} />
            </div>
          </div>
        </div>

        {/* Trade Desk Terminal */}
        <div className="col-lg-4">
          <div className="d-flex flex-column gap-4 h-100">
            {/* Holdings Pill (If owned) */}
            {holding && (
              <div className="glass-card p-4 border border-success border-opacity-25" style={{ background: 'rgba(16, 185, 129, 0.04)' }}>
                <h6 className="fw-bold text-success mb-3 d-flex align-items-center gap-2">
                  <i className="bi bi-check-circle-fill"></i>
                  Your Holding Position
                </h6>
                <div className="row text-center">
                  <div className="col-6 border-end border-light border-opacity-10">
                    <span className="text-muted d-block small">Shares Owned</span>
                    <span className="fs-5 fw-bold text-white">{holding.quantity}</span>
                  </div>
                  <div className="col-6">
                    <span className="text-muted d-block small">Average Cost</span>
                    <span className="fs-5 fw-bold text-white">{formatCurrency(holding.averagePrice)}</span>
                  </div>
                </div>
                <div className="row mt-3 border-top border-light border-opacity-10 pt-2 text-center">
                  <div className="col-6 border-end border-light border-opacity-10">
                    <span className="text-muted d-block small">Current Value</span>
                    <span className="fw-bold text-white">{formatCurrency(holding.currentValue)}</span>
                  </div>
                  <div className="col-6">
                    <span className="text-muted d-block small">Return (P/L)</span>
                    <span className={`fw-bold ${holding.profitLoss >= 0 ? 'text-success' : 'text-danger'}`}>
                      {holding.profitLoss >= 0 ? '+' : ''}{formatCurrency(holding.profitLoss)}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Trading card */}
            <div className="glass-card p-4 flex-grow-1">
              <h5 className="fw-bold mb-4 d-flex align-items-center gap-2">
                <i className="bi bi-currency-exchange text-primary"></i> Execution Desk
              </h5>

              <div className="mb-4">
                <span className="text-muted small d-block mb-1">Available Funds</span>
                <span className="fw-extrabold text-white fs-4">{formatCurrency(user?.walletBalance)}</span>
              </div>

              {/* Quantity Input */}
              <div className="mb-4">
                <label className="form-label text-muted small fw-semibold">Order Quantity</label>
                <div className="input-group">
                  <button
                    className="btn btn-dark-glass py-2 border-end-0"
                    type="button"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={tradeLoading}
                  >
                    -
                  </button>
                  <input
                    type="number"
                    className="form-control form-glass text-center py-2"
                    min="1"
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    disabled={tradeLoading}
                  />
                  <button
                    className="btn btn-dark-glass py-2 border-start-0"
                    type="button"
                    onClick={() => setQuantity(quantity + 1)}
                    disabled={tradeLoading}
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Order summary stats */}
              <div className="p-3 rounded mb-4" style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--border-glass)' }}>
                <div className="d-flex justify-content-between small mb-2">
                  <span className="text-muted">Unit Price</span>
                  <span className="text-white fw-medium">{formatCurrency(stock.currentPrice)}</span>
                </div>
                <div className="d-flex justify-content-between small">
                  <span className="text-muted">Total Cost</span>
                  <span className="text-white fw-bold fs-6">{formatCurrency(transactionTotal)}</span>
                </div>
              </div>

              {/* Buy & Sell Actions */}
              <div className="row g-2">
                <div className="col-6">
                  <button
                    className="btn btn-primary-glow w-100 py-2.5 d-flex justify-content-center align-items-center gap-2"
                    style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', boxShadow: '0 4px 14px 0 rgba(16, 185, 129, 0.3)' }}
                    onClick={() => handleTrade('BUY')}
                    disabled={tradeLoading}
                  >
                    {tradeLoading ? (
                      <span className="spinner-border spinner-border-sm" role="status"></span>
                    ) : (
                      'Buy Shares'
                    )}
                  </button>
                </div>
                <div className="col-6">
                  <button
                    className="btn btn-primary-glow w-100 py-2.5 d-flex justify-content-center align-items-center gap-2"
                    style={{ background: 'linear-gradient(135deg, #f43f5e 0%, #e11d48 100%)', boxShadow: '0 4px 14px 0 rgba(244, 63, 94, 0.3)' }}
                    onClick={() => handleTrade('SELL')}
                    disabled={tradeLoading || !holding || holding.quantity === 0}
                  >
                    {tradeLoading ? (
                      <span className="spinner-border spinner-border-sm" role="status"></span>
                    ) : (
                      'Sell Shares'
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StockDetail;
