import { SOURCE_CONSTANTS } from '../constants';
import { Source } from '../modals';
import { DBProvider } from './db-provider';

export class SourceProvider extends DBProvider<Source> {
  private static provider: SourceProvider;
  private constructor() {
    super(SOURCE_CONSTANTS);
  }

  static getProvider() {
    if (!SourceProvider.provider) {
      SourceProvider.provider = new SourceProvider();
    }
    return SourceProvider.provider;
  }
}
