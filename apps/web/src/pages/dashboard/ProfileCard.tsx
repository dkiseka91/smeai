import React from 'react';
import { Link } from 'react-router-dom';
import { FileText, BarChart3, PresentationIcon, MessageCircle, Pencil, Trash2 } from 'lucide-react';
import { useWorkspaceStore } from '../../stores/workspaceStore';
import { useDeleteProfile } from '../../hooks/useProfile';

interface Profile { id: string; name: string; industry: string; stage: string; isComplete: boolean; }

interface Props { profile: Profile; }

const STAGE_LABELS: Record<string, string> = {
  IDEA: 'Idea', PRE_REVENUE: 'Pre-Revenue', EARLY: 'Early', GROWTH: 'Growth', SCALE: 'Scale',
};

export default function ProfileCard({ profile }: Props) {
  const { setProfile } = useWorkspaceStore();
  const deleteProfile = useDeleteProfile();

  const handleDelete = async () => {
    if (!confirm(`Delete "${profile.name}"? This cannot be undone.`)) return;
    await deleteProfile.mutateAsync(profile.id);
  };

  return (
    <div className="bg-white rounded-xl p-6 border border-gray-100 hover:shadow-lg hover:border-amber/30 transition-all flex flex-col">
      <div className="flex items-start justify-between mb-1">
        <div className="flex-1 min-w-0">
          <h3 className="font-montserrat font-bold text-navy truncate">{profile.name}</h3>
          <p className="text-steel-grey text-xs mt-0.5">{profile.industry} · {STAGE_LABELS[profile.stage] ?? profile.stage}</p>
        </div>
        <span className={`ml-2 shrink-0 text-xs px-2 py-1 rounded-full font-medium ${
          profile.isComplete ? 'bg-green-100 text-green-700' : 'bg-amber/20 text-amber'
        }`}>
          {profile.isComplete ? 'Complete' : 'In Progress'}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2 mt-4">
        <Link to={`/plan/${profile.id}`} onClick={() => setProfile(profile)}
          className="flex items-center justify-center gap-1.5 text-xs font-medium bg-navy/5 text-navy py-2 rounded-lg hover:bg-navy/10 transition-colors">
          <FileText size={13} /> Business Plan
        </Link>
        <Link to={`/deck/${profile.id}`} onClick={() => setProfile(profile)}
          className="flex items-center justify-center gap-1.5 text-xs font-medium bg-navy/5 text-navy py-2 rounded-lg hover:bg-navy/10 transition-colors">
          <PresentationIcon size={13} /> Pitch Deck
        </Link>
        <Link to={`/financial/${profile.id}`} onClick={() => setProfile(profile)}
          className="flex items-center justify-center gap-1.5 text-xs font-medium bg-navy/5 text-navy py-2 rounded-lg hover:bg-navy/10 transition-colors">
          <BarChart3 size={13} /> Financial Model
        </Link>
        <Link to={`/chat/${profile.id}`} onClick={() => setProfile(profile)}
          className="flex items-center justify-center gap-1.5 text-xs font-medium bg-navy/5 text-navy py-2 rounded-lg hover:bg-navy/10 transition-colors">
          <MessageCircle size={13} /> AI Advisor
        </Link>
      </div>

      <div className="flex justify-end gap-3 mt-4 pt-3 border-t border-gray-50">
        <Link to={`/onboarding/${profile.id}`}
          className="flex items-center gap-1 text-xs text-steel-grey hover:text-navy transition-colors">
          <Pencil size={12} /> Edit Profile
        </Link>
        <button onClick={handleDelete} disabled={deleteProfile.isPending}
          className="flex items-center gap-1 text-xs text-steel-grey hover:text-error transition-colors disabled:opacity-40">
          <Trash2 size={12} /> Delete
        </button>
      </div>
    </div>
  );
}
