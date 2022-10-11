import { EPISODE_SOURCE_CONSTANTS } from '../constants';
import { EpisodeSource } from '../modals';
import { DBProvider } from './db-provider';

export class EpisodeSourceProvider extends DBProvider<EpisodeSource> {
  private static provider: EpisodeSourceProvider;
  private constructor() {
    super(EPISODE_SOURCE_CONSTANTS);
  }

  static getProvider() {
    if (!EpisodeSourceProvider.provider) {
      EpisodeSourceProvider.provider = new EpisodeSourceProvider();
    }
    return EpisodeSourceProvider.provider;
  }
}
