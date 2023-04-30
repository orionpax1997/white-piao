import create from 'zustand';

import { Config } from '../modals';

interface ConfigState {
  serverUrl?: Config;
  concurrencyNumber?: Config;
  setServerUrl: (v: Config) => void;
  setConcurrencyNumber: (v: Config) => void;
}

export const useConfig = create<ConfigState>()(set => ({
  setServerUrl: v => set(() => ({ serverUrl: v })),
  setConcurrencyNumber: v => set(() => ({ concurrencyNumber: v })),
}));
