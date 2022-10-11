import { EPISODE_CONSTANTS } from '../constants';
import { Episode } from '../modals';
import { DBProvider } from './db-provider';

export class EpisodeProvider extends DBProvider<Episode> {
  private static provider: EpisodeProvider;
  private constructor() {
    super(EPISODE_CONSTANTS);
  }

  static getProvider() {
    if (!EpisodeProvider.provider) {
      EpisodeProvider.provider = new EpisodeProvider();
    }
    return EpisodeProvider.provider;
  }
}
