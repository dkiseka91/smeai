import React, { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './stores/authStore';
import AppLayout from './components/layout/AppLayout';

const Landing = lazy(() => import('./pages/Landing'));
const Login = lazy(() => import('./pages/auth/Login'));
const Register = lazy(() => import('./pages/auth/Register'));
const VerifyEmail = lazy(() => import('./pages/auth/VerifyEmail'));
const ForgotPassword = lazy(() => import('./pages/auth/ForgotPassword'));
const Dashboard = lazy(() => import('./pages/dashboard/Dashboard'));
const OnboardingWizard = lazy(() => import('./pages/onboarding/OnboardingWizard'));
const BusinessPlanEditor = lazy(() => import('./pages/documents/BusinessPlanEditor'));
const PitchDeckEditor = lazy(() => import('./pages/documents/PitchDeckEditor'));
const FinancialModelBuilder = lazy(() => import('./pages/financial/FinancialModelBuilder'));
const AdvisorChat = lazy(() => import('./pages/chat/AdvisorChat'));
const PricingPage = lazy(() => import('./pages/settings/PricingPage'));
const AccountSettings = lazy(() => import('./pages/settings/AccountSettings'));

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { user } = useAuthStore();
  return user ? <>{children}</> : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<div className="flex items-center justify-center h-screen"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-navy" /></div>}>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/pricing" element={<PricingPage />} />
          <Route element={<PrivateRoute><AppLayout /></PrivateRoute>}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/onboarding" element={<OnboardingWizard />} />
            <Route path="/onboarding/:profileId" element={<OnboardingWizard />} />
            <Route path="/plan/:profileId" element={<BusinessPlanEditor />} />
            <Route path="/deck/:profileId" element={<PitchDeckEditor />} />
            <Route path="/financial/:profileId" element={<FinancialModelBuilder />} />
            <Route path="/chat/:profileId" element={<AdvisorChat />} />
            <Route path="/settings" element={<AccountSettings />} />
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
