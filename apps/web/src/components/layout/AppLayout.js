import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
export default function AppLayout() {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    return (_jsxs("div", { className: "flex h-screen bg-light-grey overflow-hidden", children: [_jsx(Sidebar, { open: sidebarOpen, onClose: () => setSidebarOpen(false) }), _jsxs("div", { className: "flex-1 flex flex-col overflow-hidden", children: [_jsx(Navbar, { onMenuClick: () => setSidebarOpen(!sidebarOpen) }), _jsx("main", { className: "flex-1 overflow-auto p-6", children: _jsx(Outlet, {}) })] })] }));
}
