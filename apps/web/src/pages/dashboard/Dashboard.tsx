import React from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { useProfiles } from '../../hooks/useProfile';
import ProfileCard from './ProfileCard';
import { Plus, FileText } from 'lucide-react';

export default function Dashboard() {
  const { user } = useAuthStore();
  const { data: profiles = [], isLoading } = useProfiles();

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-montserrat font-bold text-2xl text-navy">
            Welcome back, {user?.name?.split(' ')[0]}
          </h1>
          <p className="text-steel-grey text-sm mt-1">Manage your business profiles and documents</p>
        </div>
        <Link to="/onboarding"
          className="flex items-center gap-2 bg-amber text-navy px-5 py-2.5 rounded-lg font-bold text-sm hover:bg-amber/90 transition-colors">
          <Plus size={18} /> New Business Profile
        </Link>
      </div>

      {isLoading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => <div key={i} className="h-52 bg-gray-100 rounded-xl animate-pulse" />)}
        </div>
      ) : profiles.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border-2 border-dashed border-gray-200">
          <FileText size={40} className="text-navy/20 mx-auto mb-4" />
          <h3 className="font-montserrat font-bold text-navy text-lg mb-2">No business profiles yet</h3>
          <p className="text-steel-grey text-sm mb-6">
            Create your first profile to generate plans, decks, and financial models.
          </p>
          <Link to="/onboarding" className="bg-amber text-navy px-6 py-3 rounded-lg font-bold text-sm hover:bg-amber/90">
            Create Your First Profile
          </Link>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {profiles.map(profile => (
            <ProfileCard key={profile.id} profile={profile} />
          ))}
        </div>
      )}
    </div>
  );
}
