import create from 'zustand';

import { Favorite } from '../modals';

interface SearchListState {
  list: Favorite[];
  init: () => void;
  concat: (v: Favorite[]) => void;
}

export const useSearchList = create<SearchListState>()(set => ({
  list: [],
  init: () => set(() => ({ list: [] })),
  concat: v => set(state => ({ list: [...state.list, ...v] })),
}));
