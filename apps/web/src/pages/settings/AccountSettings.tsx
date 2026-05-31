import React from 'react';
import { useAuthStore } from '../../stores/authStore';
import { api } from '../../lib/api';

export default function AccountSettings() {
  const { user } = useAuthStore();

  const openPortal = async () => {
    const { data } = await api.get('/payments/portal');
    window.location.href = data.url;
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="font-montserrat font-bold text-2xl text-navy mb-8">Account Settings</h1>
      <div className="bg-white rounded-xl p-6 border border-gray-100 mb-6">
        <h2 className="font-montserrat font-bold text-navy mb-4">Profile</h2>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between"><span className="text-steel-grey">Name</span><span className="font-medium">{user?.name}</span></div>
          <div className="flex justify-between"><span className="text-steel-grey">Email</span><span className="font-medium">{user?.email}</span></div>
          <div className="flex justify-between"><span className="text-steel-grey">Plan</span><span className="font-medium text-navy">{user?.planTier}</span></div>
        </div>
      </div>
      <div className="bg-white rounded-xl p-6 border border-gray-100">
        <h2 className="font-montserrat font-bold text-navy mb-4">Billing</h2>
        <p className="text-steel-grey text-sm mb-4">Manage your subscription, invoices, and payment method via Stripe.</p>
        <button onClick={openPortal} className="bg-navy text-white px-5 py-2.5 rounded-lg text-sm font-bold hover:bg-navy/90 transition-colors">
          Open Billing Portal
        </button>
      </div>
    </div>
  );
}
