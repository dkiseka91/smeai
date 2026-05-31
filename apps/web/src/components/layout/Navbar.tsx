import React from 'react';
import { Menu, Bell, User } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { useNavigate } from 'react-router-dom';

export default function Navbar({ onMenuClick }: { onMenuClick: () => void }) {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 shrink-0">
      <button onClick={onMenuClick} className="p-2 rounded hover:bg-light-grey" aria-label="Toggle sidebar">
        <Menu size={20} className="text-dark-grey" />
      </button>
      <div className="flex items-center gap-4">
        <button className="p-2 rounded hover:bg-light-grey" aria-label="Notifications">
          <Bell size={20} className="text-dark-grey" />
        </button>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-navy flex items-center justify-center">
            <User size={16} className="text-white" />
          </div>
          <div className="hidden md:block">
            <p className="text-sm font-semibold text-near-black">{user?.name}</p>
            <p className="text-xs text-steel-grey">{user?.planTier} plan</p>
          </div>
          <button onClick={handleLogout} className="text-xs text-steel-grey hover:text-error ml-2">Logout</button>
        </div>
      </div>
    </header>
  );
}
