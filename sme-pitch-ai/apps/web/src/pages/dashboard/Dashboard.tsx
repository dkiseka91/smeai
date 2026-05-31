import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { useAuthStore } from '../../stores/authStore';
import { useWorkspaceStore } from '../../stores/workspaceStore';
import { Plus, FileText, BarChart3, PresentationIcon, ArrowRight } from 'lucide-react';

interface Profile { id: string; name: string; industry: string; stage: string; isComplete: boolean; updatedAt: string; }

export default function Dashboard() {
  const { user } = useAuthStore();
  const { setProfile } = useWorkspaceStore();

  const { data: profiles = [], isLoading } = useQuery<Profile[]>({
    queryKey: ['profiles'],
    queryFn: () => api.get('/profiles').then(r => r.data),
  });

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-montserrat font-bold text-2xl text-navy">Welcome back, {user?.name?.split(' ')[0]} 👋</h1>
          <p className="text-steel-grey text-sm mt-1">Manage your business profiles and documents</p>
        </div>
        <Link to="/onboarding" className="flex items-center gap-2 bg-amber text-navy px-5 py-2.5 rounded-lg font-bold text-sm hover:bg-amber/90 transition-colors">
          <Plus size={18} /> New Business Profile
        </Link>
      </div>

      {isLoading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1,2,3].map(i => <div key={i} className="h-48 bg-gray-100 rounded-xl animate-pulse" />)}
        </div>
      ) : profiles.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border-2 border-dashed border-gray-200">
          <div className="w-16 h-16 bg-navy/5 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText size={28} className="text-navy" />
          </div>
          <h3 className="font-montserrat font-bold text-navy text-lg mb-2">No business profiles yet</h3>
          <p className="text-steel-grey text-sm mb-6">Create your first profile to generate plans, decks, and financial models.</p>
          <Link to="/onboarding" className="bg-amber text-navy px-6 py-3 rounded-lg font-bold text-sm hover:bg-amber/90">
            Create Your First Profile
          </Link>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {profiles.map(profile => (
            <div key={profile.id} className="bg-white rounded-xl p-6 border border-gray-100 hover:shadow-lg hover:border-amber/30 transition-all">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-montserrat font-bold text-navy">{profile.name}</h3>
                  <p className="text-steel-grey text-xs mt-0.5">{profile.industry} · {profile.stage}</p>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${profile.isComplete ? 'bg-green-100 text-success' : 'bg-amber/20 text-amber'}`}>
                  {profile.isComplete ? 'Complete' : 'In Progress'}
                </span>
              </div>
              <div className="flex gap-2 mt-4">
                <Link to={`/plan/${profile.id}`} onClick={() => setProfile(profile)}
                  className="flex-1 flex items-center justify-center gap-1.5 text-xs font-medium bg-navy/5 text-navy py-2 rounded-lg hover:bg-navy/10 transition-colors">
                  <FileText size={14} /> Plan
                </Link>
                <Link to={`/financial/${profile.id}`} onClick={() => setProfile(profile)}
                  className="flex-1 flex items-center justify-center gap-1.5 text-xs font-medium bg-navy/5 text-navy py-2 rounded-lg hover:bg-navy/10 transition-colors">
                  <BarChart3 size={14} /> Financial
                </Link>
                <Link to={`/deck/${profile.id}`} onClick={() => setProfile(profile)}
                  className="flex-1 flex items-center justify-center gap-1.5 text-xs font-medium bg-navy/5 text-navy py-2 rounded-lg hover:bg-navy/10 transition-colors">
                  <PresentationIcon size={14} /> Deck
                </Link>
              </div>
              <Link to={`/onboarding/${profile.id}`} onClick={() => setProfile(profile)}
                className="flex items-center justify-center gap-1 text-xs text-steel-grey hover:text-navy mt-3 transition-colors">
                Edit profile <ArrowRight size={12} />
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
