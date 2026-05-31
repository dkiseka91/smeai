import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { api } from '../../lib/api';
import { useAuthStore } from '../../stores/authStore';
export default function VerifyEmail() {
    const [params] = useSearchParams();
    const [status, setStatus] = useState('loading');
    const { setAuth } = useAuthStore();
    const navigate = useNavigate();
    useEffect(() => {
        const token = params.get('token');
        if (!token) {
            setStatus('error');
            return;
        }
        api.post(`/auth/verify-email?token=${token}`)
            .then(({ data }) => {
            setAuth({ id: '', email: '', name: '', planTier: 'FREE' }, data.accessToken, data.refreshToken);
            setStatus('success');
            setTimeout(() => navigate('/dashboard'), 2000);
        })
            .catch(() => setStatus('error'));
    }, []);
    return (_jsx("div", { className: "min-h-screen bg-light-grey flex items-center justify-center", children: _jsxs("div", { className: "bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center", children: [status === 'loading' && _jsx("p", { className: "text-steel-grey", children: "Verifying your email\u2026" }), status === 'success' && _jsxs(_Fragment, { children: [_jsx("h2", { className: "font-montserrat font-bold text-2xl text-navy mb-2", children: "Email verified!" }), _jsx("p", { className: "text-steel-grey text-sm", children: "Redirecting to your dashboard\u2026" })] }), status === 'error' && _jsxs(_Fragment, { children: [_jsx("h2", { className: "font-montserrat font-bold text-2xl text-red-600 mb-2", children: "Verification failed" }), _jsxs("p", { className: "text-steel-grey text-sm", children: ["The link may be expired. ", _jsx("a", { href: "/login", className: "text-navy underline", children: "Return to login" })] })] })] }) }));
}
