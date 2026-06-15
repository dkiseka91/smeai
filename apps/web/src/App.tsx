import React, { lazy, Suspense, Component, type ReactNode, type ErrorInfo } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './stores/authStore';
import AppLayout from './components/layout/AppLayout';

class ErrorBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { error: null };
  }
  static getDerivedStateFromError(error: Error) { return { error }; }
  componentDidCatch(error: Error, info: ErrorInfo) { console.error('[ErrorBoundary]', error, info); }
  render() {
    if (this.state.error) return (
      <div className="min-h-screen bg-light-grey flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <h1 className="font-montserrat font-bold text-2xl text-navy mb-2">Something went wrong</h1>
          <p className="text-steel-grey text-sm mb-6">{this.state.error.message}</p>
          <button onClick={() => { this.setState({ error: null }); window.location.href = '/dashboard'; }}
            className="bg-navy text-white px-6 py-2 rounded-lg text-sm font-semibold hover:bg-navy/90">
            Return to Dashboard
          </button>
        </div>
      </div>
    );
    return this.props.children;
  }
}

const Landing = lazy(() => import('./pages/Landing'));
const Login = lazy(() => import('./pages/auth/Login'));
const Register = lazy(() => import('./pages/auth/Register'));
const VerifyEmail = lazy(() => import('./pages/auth/VerifyEmail'));
const ForgotPassword = lazy(() => import('./pages/auth/ForgotPassword'));
const ResetPassword = lazy(() => import('./pages/auth/ResetPassword'));
const Dashboard = lazy(() => import('./pages/dashboard/Dashboard'));
const OnboardingWizard = lazy(() => import('./pages/onboarding/OnboardingWizard'));
const BusinessPlanEditor = lazy(() => import('./pages/documents/BusinessPlanEditor'));
const PitchDeckEditor = lazy(() => import('./pages/documents/PitchDeckEditor'));
const FinancialModelBuilder = lazy(() => import('./pages/financial/FinancialModelBuilder'));
const AdvisorChat = lazy(() => import('./pages/chat/AdvisorChat'));
const LoanApplicationToolkit = lazy(() => import('./pages/toolkit/LoanApplicationToolkit'));
const DocumentHistory = lazy(() => import('./pages/documents/DocumentHistory'));
const PricingPage = lazy(() => import('./pages/settings/PricingPage'));
const AccountSettings = lazy(() => import('./pages/settings/AccountSettings'));

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { user } = useAuthStore();
  return user ? <>{children}</> : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <ErrorBoundary>
    <BrowserRouter>
      <Suspense fallback={<div className="flex items-center justify-center h-screen"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-navy" /></div>}>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/pricing" element={<PricingPage />} />
          <Route element={<PrivateRoute><AppLayout /></PrivateRoute>}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/onboarding" element={<OnboardingWizard />} />
            <Route path="/onboarding/:profileId" element={<OnboardingWizard />} />
            <Route path="/plan/:profileId" element={<BusinessPlanEditor />} />
            <Route path="/deck/:profileId" element={<PitchDeckEditor />} />
            <Route path="/financial/:profileId" element={<FinancialModelBuilder />} />
            <Route path="/chat/:profileId" element={<AdvisorChat />} />
            <Route path="/toolkit/:profileId" element={<LoanApplicationToolkit />} />
            <Route path="/history/:profileId" element={<DocumentHistory />} />
            <Route path="/settings" element={<AccountSettings />} />
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
    </ErrorBoundary>
  );
}
