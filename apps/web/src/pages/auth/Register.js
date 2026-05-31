import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../lib/api';
export default function Register() {
    const [form, setForm] = useState({ name: '', email: '', password: '' });
    const [done, setDone] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await api.post('/auth/register', form);
            setDone(true);
        }
        catch (err) {
            const msg = err?.response?.data?.error?.message ?? 'Registration failed';
            setError(msg);
        }
        finally {
            setLoading(false);
        }
    };
    if (done)
        return (_jsx("div", { className: "min-h-screen bg-light-grey flex items-center justify-center px-4", children: _jsxs("div", { className: "bg-white rounded-2xl shadow-xl p-8 w-full max-w-md text-center", children: [_jsx("div", { className: "w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4", children: _jsx("svg", { className: "w-8 h-8 text-green-600", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M5 13l4 4L19 7" }) }) }), _jsx("h2", { className: "font-montserrat font-bold text-2xl text-navy mb-2", children: "Check your email" }), _jsxs("p", { className: "text-steel-grey text-sm", children: ["We sent a verification link to ", _jsx("strong", { children: form.email }), "."] })] }) }));
    return (_jsx("div", { className: "min-h-screen bg-light-grey flex items-center justify-center px-4", children: _jsxs("div", { className: "bg-white rounded-2xl shadow-xl p-8 w-full max-w-md", children: [_jsxs("div", { className: "text-center mb-8", children: [_jsx("h1", { className: "font-montserrat font-bold text-2xl text-navy", children: "Create your account" }), _jsx("p", { className: "text-steel-grey text-sm mt-1", children: "Start with a free plan \u2014 no credit card needed" })] }), error && _jsx("div", { className: "bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg p-3 mb-4", children: error }), _jsxs("form", { onSubmit: handleSubmit, className: "space-y-4", children: [['name', 'email', 'password'].map(field => (_jsxs("div", { children: [_jsx("label", { htmlFor: field, className: "block text-sm font-medium text-dark-grey mb-1 capitalize", children: field === 'name' ? 'Full Name' : field.charAt(0).toUpperCase() + field.slice(1) }), _jsx("input", { id: field, type: field === 'password' ? 'password' : field === 'email' ? 'email' : 'text', value: form[field], onChange: e => setForm(f => ({ ...f, [field]: e.target.value })), required: true, className: "w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-navy" })] }, field))), _jsx("button", { type: "submit", disabled: loading, className: "w-full bg-amber text-navy py-3 rounded-lg font-montserrat font-bold text-sm hover:bg-amber/90 disabled:opacity-50 transition-colors", children: loading ? 'Creating account…' : 'Create Free Account' })] }), _jsxs("p", { className: "text-center text-sm text-steel-grey mt-6", children: ["Already have an account? ", _jsx(Link, { to: "/login", className: "text-navy font-semibold hover:underline", children: "Sign in" })] })] }) }));
}
