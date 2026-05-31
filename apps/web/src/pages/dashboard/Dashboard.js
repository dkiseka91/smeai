import { jsxs as _jsxs, jsx as _jsx } from "react/jsx-runtime";
import { Link } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { useProfiles } from '../../hooks/useProfile';
import ProfileCard from './ProfileCard';
import { Plus, FileText } from 'lucide-react';
export default function Dashboard() {
    const { user } = useAuthStore();
    const { data: profiles = [], isLoading } = useProfiles();
    return (_jsxs("div", { className: "max-w-6xl mx-auto", children: [_jsxs("div", { className: "flex items-center justify-between mb-8", children: [_jsxs("div", { children: [_jsxs("h1", { className: "font-montserrat font-bold text-2xl text-navy", children: ["Welcome back, ", user?.name?.split(' ')[0]] }), _jsx("p", { className: "text-steel-grey text-sm mt-1", children: "Manage your business profiles and documents" })] }), _jsxs(Link, { to: "/onboarding", className: "flex items-center gap-2 bg-amber text-navy px-5 py-2.5 rounded-lg font-bold text-sm hover:bg-amber/90 transition-colors", children: [_jsx(Plus, { size: 18 }), " New Business Profile"] })] }), isLoading ? (_jsx("div", { className: "grid md:grid-cols-2 lg:grid-cols-3 gap-6", children: [1, 2, 3].map(i => _jsx("div", { className: "h-52 bg-gray-100 rounded-xl animate-pulse" }, i)) })) : profiles.length === 0 ? (_jsxs("div", { className: "text-center py-20 bg-white rounded-2xl border-2 border-dashed border-gray-200", children: [_jsx(FileText, { size: 40, className: "text-navy/20 mx-auto mb-4" }), _jsx("h3", { className: "font-montserrat font-bold text-navy text-lg mb-2", children: "No business profiles yet" }), _jsx("p", { className: "text-steel-grey text-sm mb-6", children: "Create your first profile to generate plans, decks, and financial models." }), _jsx(Link, { to: "/onboarding", className: "bg-amber text-navy px-6 py-3 rounded-lg font-bold text-sm hover:bg-amber/90", children: "Create Your First Profile" })] })) : (_jsx("div", { className: "grid md:grid-cols-2 lg:grid-cols-3 gap-6", children: profiles.map(profile => (_jsx(ProfileCard, { profile: profile }, profile.id))) }))] }));
}
