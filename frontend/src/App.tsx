import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './stores/authStore';
import Layout from './components/Layout';
import VaultLogin from './pages/VaultLogin';
import Register from './pages/Register';
import MalwareScan from './pages/MalwareScan';
import Dashboard from './pages/Dashboard';
import Portfolio from './pages/Portfolio';
import Threats from './pages/Threats';
import Compliance from './pages/Compliance';
import ComplianceDashboard from './pages/ComplianceDashboard';
import Settings from './pages/Settings';
import TaxReport from './pages/TaxReport';
import ExpertRecovery from './pages/ExpertRecovery';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuthStore();

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
}

function App() {
  return (
    <Routes>
      <Route path="/login" element={<VaultLogin />} />
      <Route path="/register" element={<Register />} />

      <Route path="/scan" element={
        <PrivateRoute>
          <MalwareScan />
        </PrivateRoute>
      } />

      <Route path="/" element={
        <PrivateRoute>
          <Layout />
        </PrivateRoute>
      }>
        <Route index element={<Dashboard />} />
        <Route path="portfolio" element={<Portfolio />} />
        <Route path="threats" element={<Threats />} />
        <Route path="compliance" element={<Compliance />} />
        <Route path="compliance/dashboard" element={<ComplianceDashboard />} />
        <Route path="settings" element={<Settings />} />
        <Route path="tax-report" element={<TaxReport />} />
        <Route path="expert-recovery" element={<ExpertRecovery />} />
// Admin route will be accessible through the Layout component navigation
      </Route>

      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default App;
