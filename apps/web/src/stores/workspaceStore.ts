import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface Workspace { id: string; name: string; planTier: string; }
interface Profile { id: string; name: string; industry: string; isComplete: boolean; }

interface WorkspaceState {
  activeWorkspace: Workspace | null;
  activeProfile: Profile | null;
  setWorkspace: (w: Workspace) => void;
  setProfile: (p: Profile | null) => void;
}

export const useWorkspaceStore = create<WorkspaceState>()(
  persist(
    (set) => ({
      activeWorkspace: null,
      activeProfile: null,
      setWorkspace: (w) => set({ activeWorkspace: w }),
      setProfile: (p) => set({ activeProfile: p }),
    }),
    { name: 'workspace-storage' }
  )
);
