import create from 'zustand';

import { Discovery } from '../modals';

interface DiscoveryState {
  discovery?: Discovery;
  setDiscovery: (v: Discovery) => void;
}

export const useDiscovery = create<DiscoveryState>()(set => ({
  setDiscovery: v => set(() => ({ discovery: v })),
}));
