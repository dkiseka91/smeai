import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../../lib/api';
import { useAuthStore } from '../../stores/authStore';
export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { setAuth } = useAuthStore();
    const navigate = useNavigate();
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const { data } = await api.post('/auth/login', { email, password });
            setAuth(data.user, data.accessToken, data.refreshToken);
            navigate('/dashboard');
        }
        catch (err) {
            const msg = err?.response?.data?.error?.message ?? 'Login failed';
            setError(msg);
        }
        finally {
            setLoading(false);
        }
    };
    return (_jsx("div", { className: "min-h-screen bg-light-grey flex items-center justify-center px-4", children: _jsxs("div", { className: "bg-white rounded-2xl shadow-xl p-8 w-full max-w-md", children: [_jsxs("div", { className: "text-center mb-8", children: [_jsx("h1", { className: "font-montserrat font-bold text-2xl text-navy", children: "Welcome back" }), _jsx("p", { className: "text-steel-grey text-sm mt-1", children: "Sign in to your AElevate account" })] }), error && _jsx("div", { className: "bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg p-3 mb-4", children: error }), _jsxs("form", { onSubmit: handleSubmit, className: "space-y-4", children: [_jsxs("div", { children: [_jsx("label", { htmlFor: "email", className: "block text-sm font-medium text-dark-grey mb-1", children: "Email" }), _jsx("input", { id: "email", type: "email", value: email, onChange: e => setEmail(e.target.value), required: true, className: "w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-navy" })] }), _jsxs("div", { children: [_jsx("label", { htmlFor: "password", className: "block text-sm font-medium text-dark-grey mb-1", children: "Password" }), _jsx("input", { id: "password", type: "password", value: password, onChange: e => setPassword(e.target.value), required: true, className: "w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-navy" })] }), _jsx("div", { className: "text-right", children: _jsx(Link, { to: "/forgot-password", className: "text-xs text-navy hover:underline", children: "Forgot password?" }) }), _jsx("button", { type: "submit", disabled: loading, className: "w-full bg-navy text-white py-3 rounded-lg font-montserrat font-bold text-sm hover:bg-navy/90 disabled:opacity-50 transition-colors", children: loading ? 'Signing in…' : 'Sign In' })] }), _jsxs("p", { className: "text-center text-sm text-steel-grey mt-6", children: ["Don't have an account? ", _jsx(Link, { to: "/register", className: "text-navy font-semibold hover:underline", children: "Sign up free" })] })] }) }));
}
