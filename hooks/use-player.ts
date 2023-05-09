import create from 'zustand';

import { Episode, EpisodeSource, Favorite } from '../modals';

type VideoInfo = {
  title: string;
  seriesUrl: string;
  type?: string;
  actors?: string;
  intro?: string;
  image?: string;
  sourceId: number;
  sourceName: string;
};

export type HistoryStatus = {
  seek: number;
  currEpisodeSource: number;
  currEpisode: number;
};

interface PlayerState {
  needReload: boolean;
  streamUrl: string | null;
  videoInfo: VideoInfo;
  historyStatus: HistoryStatus;
  favorite: Favorite | null;
  episodeSources: EpisodeSource[];
  episodesBySourceIndex: { [id: number]: Episode[] };
  init: () => void;
  setNeedReload: (v: boolean) => void;
  setStreamUrl: (v: string | null) => void;
  setVideoInfo: (v: VideoInfo) => void;
  setHistoryStatus: (v: HistoryStatus) => void;
  setFavorite: (v: Favorite | null) => void;
  setEpisodeSources: (v: EpisodeSource[]) => void;
  setEpisodesBySourceIndex: (v: { [id: number]: Episode[] }) => void;
}

const initState = {
  needReload: true,
  streamUrl: null,
  videoInfo: {
    title: '',
    seriesUrl: '',
    sourceName: '',
    sourceId: 0,
  },
  historyStatus: {
    seek: 0,
    currEpisodeSource: 0,
    currEpisode: 0,
    lastWatchTime: new Date().toISOString(),
  },
  favorite: null,
  episodeSources: [],
  episodesBySourceIndex: {},
};

export const usePlayer = create<PlayerState>()(set => ({
  ...initState,
  init: () => set(() => ({ ...initState })),
  setNeedReload: v => set(() => ({ needReload: v })),
  setStreamUrl: v => set(() => ({ streamUrl: v })),
  setVideoInfo: v => set(() => ({ videoInfo: v })),
  setHistoryStatus: v =>
    set(() => {
      return { historyStatus: v };
    }),
  setFavorite: v => set(() => ({ favorite: v })),
  setEpisodeSources: v => set(() => ({ episodeSources: v })),
  setEpisodesBySourceIndex: v => set(() => ({ episodesBySourceIndex: v })),
}));
