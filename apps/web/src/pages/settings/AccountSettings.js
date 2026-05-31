import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useAuthStore } from '../../stores/authStore';
import { api } from '../../lib/api';
export default function AccountSettings() {
    const { user } = useAuthStore();
    const openPortal = async () => {
        const { data } = await api.get('/payments/portal');
        window.location.href = data.url;
    };
    return (_jsxs("div", { className: "max-w-2xl mx-auto", children: [_jsx("h1", { className: "font-montserrat font-bold text-2xl text-navy mb-8", children: "Account Settings" }), _jsxs("div", { className: "bg-white rounded-xl p-6 border border-gray-100 mb-6", children: [_jsx("h2", { className: "font-montserrat font-bold text-navy mb-4", children: "Profile" }), _jsxs("div", { className: "space-y-3 text-sm", children: [_jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-steel-grey", children: "Name" }), _jsx("span", { className: "font-medium", children: user?.name })] }), _jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-steel-grey", children: "Email" }), _jsx("span", { className: "font-medium", children: user?.email })] }), _jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-steel-grey", children: "Plan" }), _jsx("span", { className: "font-medium text-navy", children: user?.planTier })] })] })] }), _jsxs("div", { className: "bg-white rounded-xl p-6 border border-gray-100", children: [_jsx("h2", { className: "font-montserrat font-bold text-navy mb-4", children: "Billing" }), _jsx("p", { className: "text-steel-grey text-sm mb-4", children: "Manage your subscription, invoices, and payment method via Stripe." }), _jsx("button", { onClick: openPortal, className: "bg-navy text-white px-5 py-2.5 rounded-lg text-sm font-bold hover:bg-navy/90 transition-colors", children: "Open Billing Portal" })] })] }));
}
