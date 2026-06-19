import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import { ToastProvider } from './context/ToastContext.jsx';

// Pages
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Portfolio from './pages/Portfolio.jsx';
import Transactions from './pages/Transactions.jsx';
import Profile from './pages/Profile.jsx';
import StockDetail from './pages/StockDetail.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';

// Components
import Navbar from './components/Navbar.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';

// Default redirect helper component
const HomeRedirect = () => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />;
};

function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <div className="min-vh-100 d-flex flex-column text-main" style={{ backgroundColor: '#0b0f19' }}>
            <Navbar />
            <div className="flex-grow-1">
              <Routes>
                {/* Public Auth routes */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                {/* Protected User portfolio & trading routes */}
                <Route element={<ProtectedRoute />}>
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/portfolio" element={<Portfolio />} />
                  <Route path="/transactions" element={<Transactions />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/stocks/:id" element={<StockDetail />} />
                </Route>

                {/* Protected Admin management routes */}
                <Route element={<ProtectedRoute adminOnly={true} />}>
                  <Route path="/admin" element={<AdminDashboard />} />
                </Route>

                {/* Default route redirect */}
                <Route path="/" element={<HomeRedirect />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </div>
            
            {/* Footer */}
            <footer className="py-4 text-center mt-auto border-top border-light border-opacity-10 text-muted small" style={{ backgroundColor: '#080c14' }}>
              <div className="container">
                <p className="mb-0">© 2026 TradeEZ Inc. All Virtual Rights Reserved.</p>
                <p className="text-secondary mb-0 mt-1" style={{ fontSize: '0.7rem' }}>Disclaimer: TradeEZ is a simulation sandbox trading platform. No real monetary transactions are involved.</p>
              </div>
            </footer>
          </div>
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}

export default App;
