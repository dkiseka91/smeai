import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Menu, Bell, User } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { useNavigate } from 'react-router-dom';
export default function Navbar({ onMenuClick }) {
    const { user, logout } = useAuthStore();
    const navigate = useNavigate();
    const handleLogout = () => {
        logout();
        navigate('/login');
    };
    return (_jsxs("header", { className: "h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 shrink-0", children: [_jsx("button", { onClick: onMenuClick, className: "p-2 rounded hover:bg-light-grey", "aria-label": "Toggle sidebar", children: _jsx(Menu, { size: 20, className: "text-dark-grey" }) }), _jsxs("div", { className: "flex items-center gap-4", children: [_jsx("button", { className: "p-2 rounded hover:bg-light-grey", "aria-label": "Notifications", children: _jsx(Bell, { size: 20, className: "text-dark-grey" }) }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx("div", { className: "w-8 h-8 rounded-full bg-navy flex items-center justify-center", children: _jsx(User, { size: 16, className: "text-white" }) }), _jsxs("div", { className: "hidden md:block", children: [_jsx("p", { className: "text-sm font-semibold text-near-black", children: user?.name }), _jsxs("p", { className: "text-xs text-steel-grey", children: [user?.planTier, " plan"] })] }), _jsx("button", { onClick: handleLogout, className: "text-xs text-steel-grey hover:text-error ml-2", children: "Logout" })] })] })] }));
}
