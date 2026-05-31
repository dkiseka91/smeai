import { create } from 'zustand';
import { persist } from 'zustand/middleware';
export const useWorkspaceStore = create()(persist((set) => ({
    activeWorkspace: null,
    activeProfile: null,
    setWorkspace: (w) => set({ activeWorkspace: w }),
    setProfile: (p) => set({ activeProfile: p }),
}), { name: 'workspace-storage' }));
