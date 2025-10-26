import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Import pages
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ScanPage from './pages/ScanPage';
import ActivationPage from './pages/ActivationPage';
import VerifyPage from './pages/VerifyPage';
import ReturnPage from './pages/ReturnPage';
import AdminDashboard from './pages/AdminDashboard';

// Import components
import Header from './components/Header';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="app">
          <Header />
          <main className="container mx-auto px-4 py-8">
            <Routes>
              {/* Public routes */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              
              {/* Protected routes */}
              <Route element={<ProtectedRoute />}>
                <Route path="/scan" element={<ScanPage />} />
                <Route path="/activate/:qrToken" element={<ActivationPage />} />
                <Route path="/verify/:qrToken" element={<VerifyPage />} />
                <Route path="/return/:qrToken" element={<ReturnPage />} />
              </Route>

              {/* Admin routes */}
              <Route element={<ProtectedRoute adminOnly />}>
                <Route path="/admin" element={<AdminDashboard />} />
              </Route>

              {/* Default redirect */}
              <Route path="/" element={<Navigate to="/scan" replace />} />
            </Routes>
          </main>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;