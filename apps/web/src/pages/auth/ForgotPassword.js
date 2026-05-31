import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../lib/api';
export default function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [done, setDone] = useState(false);
    const [loading, setLoading] = useState(false);
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        await api.post('/auth/forgot-password', { email }).catch(() => { });
        setDone(true);
        setLoading(false);
    };
    if (done)
        return (_jsx("div", { className: "min-h-screen bg-light-grey flex items-center justify-center px-4", children: _jsxs("div", { className: "bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center", children: [_jsx("h2", { className: "font-montserrat font-bold text-2xl text-navy mb-2", children: "Check your email" }), _jsx("p", { className: "text-steel-grey text-sm", children: "If that email is registered, a reset link has been sent." }), _jsx(Link, { to: "/login", className: "mt-6 inline-block text-navy font-semibold text-sm hover:underline", children: "Back to login" })] }) }));
    return (_jsx("div", { className: "min-h-screen bg-light-grey flex items-center justify-center px-4", children: _jsxs("div", { className: "bg-white rounded-2xl shadow-xl p-8 max-w-md w-full", children: [_jsx("h1", { className: "font-montserrat font-bold text-2xl text-navy mb-2 text-center", children: "Reset your password" }), _jsx("p", { className: "text-steel-grey text-sm text-center mb-6", children: "Enter your email and we'll send a reset link." }), _jsxs("form", { onSubmit: handleSubmit, className: "space-y-4", children: [_jsxs("div", { children: [_jsx("label", { htmlFor: "email", className: "block text-sm font-medium text-dark-grey mb-1", children: "Email" }), _jsx("input", { id: "email", type: "email", value: email, onChange: e => setEmail(e.target.value), required: true, className: "w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-navy" })] }), _jsx("button", { type: "submit", disabled: loading, className: "w-full bg-navy text-white py-3 rounded-lg font-montserrat font-bold text-sm hover:bg-navy/90 disabled:opacity-50", children: loading ? 'Sending…' : 'Send Reset Link' })] }), _jsx("p", { className: "text-center mt-4", children: _jsx(Link, { to: "/login", className: "text-sm text-navy hover:underline", children: "Back to login" }) })] }) }));
}
