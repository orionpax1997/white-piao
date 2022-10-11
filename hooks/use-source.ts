import create from 'zustand';

import { Source } from '../modals';

interface SourceState {
  list: number[];
  byId: { [id: number]: Source };
  needReSync: boolean;
  setList: (v: number[]) => void;
  setById: (v: { [id: number]: Source }) => void;
  setNeedReSync: (v: boolean) => void;
}

export const useSource = create<SourceState>()(set => ({
  list: [],
  byId: {},
  needReSync: false,
  setList: v => set(() => ({ list: v })),
  setById: v => set(() => ({ byId: v })),
  setNeedReSync: v => set(() => ({ needReSync: v })),
}));
