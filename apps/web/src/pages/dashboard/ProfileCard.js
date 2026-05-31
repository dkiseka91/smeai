import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Link } from 'react-router-dom';
import { FileText, BarChart3, PresentationIcon, MessageCircle, Pencil, Trash2 } from 'lucide-react';
import { useWorkspaceStore } from '../../stores/workspaceStore';
import { useDeleteProfile } from '../../hooks/useProfile';
const STAGE_LABELS = {
    IDEA: 'Idea', PRE_REVENUE: 'Pre-Revenue', EARLY: 'Early', GROWTH: 'Growth', SCALE: 'Scale',
};
export default function ProfileCard({ profile }) {
    const { setProfile } = useWorkspaceStore();
    const deleteProfile = useDeleteProfile();
    const handleDelete = async () => {
        if (!confirm(`Delete "${profile.name}"? This cannot be undone.`))
            return;
        await deleteProfile.mutateAsync(profile.id);
    };
    return (_jsxs("div", { className: "bg-white rounded-xl p-6 border border-gray-100 hover:shadow-lg hover:border-amber/30 transition-all flex flex-col", children: [_jsxs("div", { className: "flex items-start justify-between mb-1", children: [_jsxs("div", { className: "flex-1 min-w-0", children: [_jsx("h3", { className: "font-montserrat font-bold text-navy truncate", children: profile.name }), _jsxs("p", { className: "text-steel-grey text-xs mt-0.5", children: [profile.industry, " \u00B7 ", STAGE_LABELS[profile.stage] ?? profile.stage] })] }), _jsx("span", { className: `ml-2 shrink-0 text-xs px-2 py-1 rounded-full font-medium ${profile.isComplete ? 'bg-green-100 text-green-700' : 'bg-amber/20 text-amber'}`, children: profile.isComplete ? 'Complete' : 'In Progress' })] }), _jsxs("div", { className: "grid grid-cols-2 gap-2 mt-4", children: [_jsxs(Link, { to: `/plan/${profile.id}`, onClick: () => setProfile(profile), className: "flex items-center justify-center gap-1.5 text-xs font-medium bg-navy/5 text-navy py-2 rounded-lg hover:bg-navy/10 transition-colors", children: [_jsx(FileText, { size: 13 }), " Business Plan"] }), _jsxs(Link, { to: `/deck/${profile.id}`, onClick: () => setProfile(profile), className: "flex items-center justify-center gap-1.5 text-xs font-medium bg-navy/5 text-navy py-2 rounded-lg hover:bg-navy/10 transition-colors", children: [_jsx(PresentationIcon, { size: 13 }), " Pitch Deck"] }), _jsxs(Link, { to: `/financial/${profile.id}`, onClick: () => setProfile(profile), className: "flex items-center justify-center gap-1.5 text-xs font-medium bg-navy/5 text-navy py-2 rounded-lg hover:bg-navy/10 transition-colors", children: [_jsx(BarChart3, { size: 13 }), " Financial Model"] }), _jsxs(Link, { to: `/chat/${profile.id}`, onClick: () => setProfile(profile), className: "flex items-center justify-center gap-1.5 text-xs font-medium bg-navy/5 text-navy py-2 rounded-lg hover:bg-navy/10 transition-colors", children: [_jsx(MessageCircle, { size: 13 }), " AI Advisor"] })] }), _jsxs("div", { className: "flex justify-end gap-3 mt-4 pt-3 border-t border-gray-50", children: [_jsxs(Link, { to: `/onboarding/${profile.id}`, className: "flex items-center gap-1 text-xs text-steel-grey hover:text-navy transition-colors", children: [_jsx(Pencil, { size: 12 }), " Edit Profile"] }), _jsxs("button", { onClick: handleDelete, disabled: deleteProfile.isPending, className: "flex items-center gap-1 text-xs text-steel-grey hover:text-error transition-colors disabled:opacity-40", children: [_jsx(Trash2, { size: 12 }), " Delete"] })] })] }));
}
