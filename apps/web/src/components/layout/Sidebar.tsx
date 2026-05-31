import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, FileText, BarChart3, PresentationIcon, MessageCircle, BookOpen, Settings, X } from 'lucide-react';
import { useWorkspaceStore } from '../../stores/workspaceStore';

const navItems = [
  { to: '/dashboard',  icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/plan',       icon: FileText,         label: 'Business Plan' },
  { to: '/financial',  icon: BarChart3,        label: 'Financial Model' },
  { to: '/deck',       icon: PresentationIcon, label: 'Pitch Deck' },
  { to: '/chat',       icon: MessageCircle,    label: 'AI Advisor' },
  { to: '/toolkit',    icon: BookOpen,          label: 'Loan Toolkit' },
  { to: '/settings',   icon: Settings,         label: 'Settings' },
];

export default function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { activeProfile } = useWorkspaceStore();

  function buildTo(base: string) {
    if (base === '/dashboard' || base === '/settings') return base;
    return activeProfile ? `${base}/${activeProfile.id}` : '/dashboard';
  }

  return (
    <>
      {open && <div className="fixed inset-0 bg-black/40 z-20 md:hidden" onClick={onClose} />}
      <aside className={`${open ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 fixed md:static inset-y-0 left-0 w-64 bg-navy z-30 transition-transform flex flex-col`}>
        <div className="h-16 flex items-center justify-between px-6 border-b border-white/10">
          <div>
            <p className="font-montserrat font-bold text-white text-lg leading-tight">AElevate</p>
            <p className="text-amber text-xs font-semibold tracking-wider">FUELING GROWTH</p>
          </div>
          <button onClick={onClose} className="md:hidden text-white/60 hover:text-white" aria-label="Close sidebar">
            <X size={18} />
          </button>
        </div>
        <nav className="flex-1 py-6 px-4 space-y-1">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink key={to} to={buildTo(to)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${isActive ? 'bg-amber text-navy font-bold' : 'text-white/70 hover:bg-white/10 hover:text-white'}`
              }>
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="p-4 border-t border-white/10">
          <p className="text-white/40 text-xs text-center">© 2026 AElevate Business Innovations</p>
        </div>
      </aside>
    </>
  );
}
