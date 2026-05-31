import { Fragment as _Fragment, jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { lazy, Suspense } from 'react';
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
const LoanApplicationToolkit = lazy(() => import('./pages/toolkit/LoanApplicationToolkit'));
const DocumentHistory = lazy(() => import('./pages/documents/DocumentHistory'));
const PricingPage = lazy(() => import('./pages/settings/PricingPage'));
const AccountSettings = lazy(() => import('./pages/settings/AccountSettings'));
function PrivateRoute({ children }) {
    const { user } = useAuthStore();
    return user ? _jsx(_Fragment, { children: children }) : _jsx(Navigate, { to: "/login", replace: true });
}
export default function App() {
    return (_jsx(BrowserRouter, { children: _jsx(Suspense, { fallback: _jsx("div", { className: "flex items-center justify-center h-screen", children: _jsx("div", { className: "animate-spin rounded-full h-12 w-12 border-b-2 border-navy" }) }), children: _jsxs(Routes, { children: [_jsx(Route, { path: "/", element: _jsx(Landing, {}) }), _jsx(Route, { path: "/login", element: _jsx(Login, {}) }), _jsx(Route, { path: "/register", element: _jsx(Register, {}) }), _jsx(Route, { path: "/verify-email", element: _jsx(VerifyEmail, {}) }), _jsx(Route, { path: "/forgot-password", element: _jsx(ForgotPassword, {}) }), _jsx(Route, { path: "/pricing", element: _jsx(PricingPage, {}) }), _jsxs(Route, { element: _jsx(PrivateRoute, { children: _jsx(AppLayout, {}) }), children: [_jsx(Route, { path: "/dashboard", element: _jsx(Dashboard, {}) }), _jsx(Route, { path: "/onboarding", element: _jsx(OnboardingWizard, {}) }), _jsx(Route, { path: "/onboarding/:profileId", element: _jsx(OnboardingWizard, {}) }), _jsx(Route, { path: "/plan/:profileId", element: _jsx(BusinessPlanEditor, {}) }), _jsx(Route, { path: "/deck/:profileId", element: _jsx(PitchDeckEditor, {}) }), _jsx(Route, { path: "/financial/:profileId", element: _jsx(FinancialModelBuilder, {}) }), _jsx(Route, { path: "/chat/:profileId", element: _jsx(AdvisorChat, {}) }), _jsx(Route, { path: "/toolkit/:profileId", element: _jsx(LoanApplicationToolkit, {}) }), _jsx(Route, { path: "/history/:profileId", element: _jsx(DocumentHistory, {}) }), _jsx(Route, { path: "/settings", element: _jsx(AccountSettings, {}) })] })] }) }) }));
}
