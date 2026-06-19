import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api.js';
import Spinner from '../components/Spinner.jsx';
import { useToast } from '../context/ToastContext.jsx';

const Dashboard = () => {
  const [stocks, setStocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const { showToast } = useToast();

  // Fetch stocks function
  const fetchStocks = async (isSilent = false) => {
    try {
      if (!isSilent) setLoading(true);
      const response = await api.get(`/stocks${search ? `?search=${search}` : ''}`);
      setStocks(response.data);
    } catch (error) {
      console.error('Failed to load market stocks:', error);
      if (!isSilent) showToast('Failed to load market stock list', 'error');
    } finally {
      if (!isSilent) setLoading(false);
    }
  };

  // Trigger search fetch
  useEffect(() => {
    fetchStocks();
  }, [search]);

  // Set up background polling every 10 seconds to fetch real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      fetchStocks(true);
    }, 10000);

    return () => clearInterval(interval);
  }, [search]);

  // Format currency
  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(val || 0);
  };

  // Format market cap
  const formatMarketCap = (val) => {
    if (val >= 1e12) return `$${(val / 1e12).toFixed(2)}T`;
    if (val >= 1e9) return `$${(val / 1e9).toFixed(2)}B`;
    if (val >= 1e6) return `$${(val / 1e6).toFixed(2)}M`;
    return formatCurrency(val);
  };

  // Sort lists for widgets
  const getTopGainers = () => {
    return [...stocks]
      .filter((s) => s.dailyChange > 0)
      .sort((a, b) => b.dailyChange - a.dailyChange)
      .slice(0, 3);
  };

  const getTopLosers = () => {
    return [...stocks]
      .filter((s) => s.dailyChange < 0)
      .sort((a, b) => a.dailyChange - b.dailyChange)
      .slice(0, 3);
  };

  const getTrending = () => {
    return [...stocks]
      .sort((a, b) => b.marketCap - a.marketCap)
      .slice(0, 3);
  };

  // Calculate composite market average index (mock S&P indicator)
  const getMarketIndexChange = () => {
    if (stocks.length === 0) return 0;
    const avgChange = stocks.reduce((acc, curr) => acc + curr.dailyChange, 0) / stocks.length;
    return parseFloat(avgChange.toFixed(2));
  };

  const indexChange = getMarketIndexChange();

  return (
    <div className="container py-4 fade-in-up">
      {/* Welcome Banner */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="glass-card p-4 d-flex justify-content-between align-items-center flex-wrap gap-3">
            <div>
              <h1 className="fw-bold mb-1">Market Dashboard</h1>
              <p className="text-muted mb-0">Browse real-time stocks, check performance statistics, and trade assets.</p>
            </div>
            
            {/* Market Index status indicator */}
            <div className="d-flex align-items-center gap-3">
              <span className="text-muted fw-semibold small">Composite Index:</span>
              <div className={indexChange >= 0 ? 'badge-growth' : 'badge-decline'}>
                {indexChange >= 0 ? (
                  <i className="bi bi-graph-up"></i>
                ) : (
                  <i className="bi bi-graph-down"></i>
                )}
                <span className="fw-bold">{indexChange >= 0 ? `+${indexChange}%` : `${indexChange}%`}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Analytics widgets row */}
      <div className="row g-4 mb-4">
        {/* Top Gainers */}
        <div className="col-md-4">
          <div className="glass-card p-4 h-100">
            <h5 className="fw-bold text-success mb-3 d-flex align-items-center gap-2">
              <i className="bi bi-arrow-up-right-circle-fill"></i>
              Top Gainers
            </h5>
            {loading ? (
              <div className="py-3 text-center text-muted">Loading...</div>
            ) : getTopGainers().length === 0 ? (
              <div className="text-muted small">No gainers currently.</div>
            ) : (
              <div className="d-flex flex-column gap-3">
                {getTopGainers().map((stock) => (
                  <Link
                    key={stock._id}
                    to={`/stocks/${stock._id}`}
                    className="d-flex justify-content-between align-items-center text-decoration-none py-1 border-bottom border-light-subtle border-opacity-10"
                  >
                    <div>
                      <span className="fw-bold text-white mb-0 d-block">{stock.symbol}</span>
                      <span className="text-muted small">{stock.companyName}</span>
                    </div>
                    <div className="text-end">
                      <span className="text-white fw-semibold d-block">{formatCurrency(stock.currentPrice)}</span>
                      <span className="badge-growth small">+{stock.dailyChange}%</span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Top Losers */}
        <div className="col-md-4">
          <div className="glass-card p-4 h-100">
            <h5 className="fw-bold text-danger mb-3 d-flex align-items-center gap-2">
              <i className="bi bi-arrow-down-right-circle-fill"></i>
              Top Losers
            </h5>
            {loading ? (
              <div className="py-3 text-center text-muted">Loading...</div>
            ) : getTopLosers().length === 0 ? (
              <div className="text-muted small">No decliners currently.</div>
            ) : (
              <div className="d-flex flex-column gap-3">
                {getTopLosers().map((stock) => (
                  <Link
                    key={stock._id}
                    to={`/stocks/${stock._id}`}
                    className="d-flex justify-content-between align-items-center text-decoration-none py-1 border-bottom border-light-subtle border-opacity-10"
                  >
                    <div>
                      <span className="fw-bold text-white mb-0 d-block">{stock.symbol}</span>
                      <span className="text-muted small">{stock.companyName}</span>
                    </div>
                    <div className="text-end">
                      <span className="text-white fw-semibold d-block">{formatCurrency(stock.currentPrice)}</span>
                      <span className="badge-decline small">{stock.dailyChange}%</span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Trending Stocks */}
        <div className="col-md-4">
          <div className="glass-card p-4 h-100">
            <h5 className="fw-bold text-primary mb-3 d-flex align-items-center gap-2">
              <i className="bi bi-lightning-charge-fill"></i>
              Trending (Market Cap)
            </h5>
            {loading ? (
              <div className="py-3 text-center text-muted">Loading...</div>
            ) : (
              <div className="d-flex flex-column gap-3">
                {getTrending().map((stock) => (
                  <Link
                    key={stock._id}
                    to={`/stocks/${stock._id}`}
                    className="d-flex justify-content-between align-items-center text-decoration-none py-1 border-bottom border-light-subtle border-opacity-10"
                  >
                    <div>
                      <span className="fw-bold text-white mb-0 d-block">{stock.symbol}</span>
                      <span className="text-muted small">{stock.companyName}</span>
                    </div>
                    <div className="text-end">
                      <span className="text-white fw-semibold d-block">{formatCurrency(stock.currentPrice)}</span>
                      <span className="text-muted small">{formatMarketCap(stock.marketCap)}</span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Stock Table */}
      <div className="row">
        <div className="col-12">
          <div className="glass-card p-4">
            {/* Search and Table Title */}
            <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-4">
              <h4 className="fw-bold mb-0">Market Securities</h4>
              <div className="input-group style-search" style={{ maxWidth: '350px' }}>
                <span className="input-group-text bg-transparent border-end-0 border-light border-opacity-10">
                  <i className="bi bi-search text-muted"></i>
                </span>
                <input
                  type="text"
                  className="form-control form-glass border-start-0 py-2"
                  placeholder="Search symbol or name..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>

            {loading && stocks.length === 0 ? (
              <Spinner />
            ) : stocks.length === 0 ? (
              <div className="text-center py-5 text-muted">
                <i className="bi bi-search fs-2 mb-3 d-block text-secondary"></i>
                <h5>No stocks match your query "{search}"</h5>
                <button className="btn btn-dark-glass mt-3 btn-sm" onClick={() => setSearch('')}>
                  Clear Search
                </button>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover table-glass align-middle mb-0">
                  <thead>
                    <tr>
                      <th scope="col">Symbol</th>
                      <th scope="col">Company</th>
                      <th scope="col" className="text-end">Price</th>
                      <th scope="col" className="text-end">Change</th>
                      <th scope="col" className="text-end">Market Cap</th>
                      <th scope="col" className="text-center">Action</th>
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
                          <span className={stock.dailyChange >= 0 ? 'badge-growth' : 'badge-decline'}>
                            {stock.dailyChange >= 0 ? (
                              <>
                                <i className="bi bi-arrow-up-short"></i>
                                +{stock.dailyChange}%
                              </>
                            ) : (
                              <>
                                <i className="bi bi-arrow-down-short"></i>
                                {stock.dailyChange}%
                              </>
                            )}
                          </span>
                        </td>
                        <td className="text-end">{formatMarketCap(stock.marketCap)}</td>
                        <td className="text-center">
                          <Link to={`/stocks/${stock._id}`} className="btn btn-primary-glow btn-sm px-3">
                            <i className="bi bi-activity me-1"></i> Trade
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            
            {/* Live Indicator Note */}
            <div className="d-flex align-items-center justify-content-end gap-2 mt-4 text-muted small">
              <span className="position-relative d-inline-flex">
                <span className="position-absolute rounded-circle bg-success opacity-75 animate-ping" style={{ width: '8px', height: '8px', top: '4px', left: '0px' }}></span>
                <span className="rounded-circle bg-success" style={{ width: '8px', height: '8px', marginTop: '4px' }}></span>
              </span>
              <span>Prices update automatically in background (10s intervals)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
