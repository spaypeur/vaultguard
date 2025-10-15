import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './stores/authStore';
import Layout from './components/Layout';
import LandingPage from './pages/LandingPage';
import PricingPage from './pages/PricingPage';
import Services from './pages/Services';
import About from './pages/About';
import CaseStudies from './pages/CaseStudies';
import Blog from './pages/Blog';
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
import TaxReportsLanding from './pages/TaxReportsLanding';
import RecoveryIntake from './pages/RecoveryIntake';
import SecurityAudits from './pages/SecurityAudits';
import ExpertRecovery from './pages/ExpertRecovery';
import PaymentSuccess from './pages/PaymentSuccess';
import PaymentCancel from './pages/PaymentCancel';
import EmailVerification from './pages/EmailVerification';

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
  const { isAuthenticated } = useAuthStore();

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/home" element={<LandingPage />} />
      <Route path="/pricing" element={<PricingPage />} />
      <Route path="/services" element={<Services />} />
      <Route path="/services/tax-reports" element={<TaxReportsLanding />} />
      <Route path="/services/recovery" element={<RecoveryIntake />} />
      <Route path="/services/security-audits" element={<SecurityAudits />} />
      <Route path="/about" element={<About />} />
      <Route path="/case-studies" element={<CaseStudies />} />
      <Route path="/blog" element={<Blog />} />
      <Route path="/login" element={<VaultLogin />} />
      <Route path="/register" element={<Register />} />
      <Route path="/verify-email/:token" element={<EmailVerification />} />
      <Route path="/payment/success" element={<PaymentSuccess />} />
      <Route path="/payment/cancel" element={<PaymentCancel />} />

      <Route path="/scan" element={
        <PrivateRoute>
          <MalwareScan />
        </PrivateRoute>
      } />

      {/* Protected Routes */}
      <Route path="/dashboard" element={
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
      </Route>

      {/* Root redirect based on auth status */}
      <Route 
        path="/" 
        element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <LandingPage />} 
      />

      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default App;
