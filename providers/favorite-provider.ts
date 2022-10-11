import { FAVORITE_CONSTANTS } from '../constants';
import { Favorite } from '../modals';
import { DBProvider } from './db-provider';

export class FavoriteProvider extends DBProvider<Favorite> {
  private static provider: FavoriteProvider;
  private constructor() {
    super(FAVORITE_CONSTANTS);
  }

  static getProvider() {
    if (!FavoriteProvider.provider) {
      FavoriteProvider.provider = new FavoriteProvider();
    }
    return FavoriteProvider.provider;
  }
}
