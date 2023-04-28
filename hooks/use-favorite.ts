import create from 'zustand';

import { Favorite, Episode, EpisodeSource } from '../modals';

interface FavoriteState {
  list: number[];
  byId: { [id: number]: Favorite };
  episodesById: { [id: number]: { [id: number]: Episode[] } };
  episodeSourcesById: { [id: number]: EpisodeSource[] };
  episodeCountById: { [id: number]: number };
  setList: (v: number[]) => void;
  setById: (v: { [id: number]: Favorite }) => void;
  setEpisodesById: (v: { [id: number]: { [id: number]: Episode[] } }) => void;
  setEpisodeSourcesById: (v: { [id: number]: EpisodeSource[] }) => void;
  setEpisodeCountById: (v: { [id: number]: number }) => void;
}

export const useFavorite = create<FavoriteState>()(set => ({
  list: [],
  byId: {},
  episodesById: {},
  episodeSourcesById: {},
  episodeCountById: {},
  setList: v => set(() => ({ list: v })),
  setById: v => set(() => ({ byId: v })),
  setEpisodesById: v => set(() => ({ episodesById: v })),
  setEpisodeSourcesById: v => set(() => ({ episodeSourcesById: v })),
  setEpisodeCountById: v => set(() => ({ episodeCountById: v })),
}));
