import { DISCOVERY_CONSTANTS } from '../constants';
import { Discovery } from '../modals';
import { DBProvider } from './db-provider';

export class DiscoveryProvider extends DBProvider<Discovery> {
  private static provider: DiscoveryProvider;
  private constructor() {
    super(DISCOVERY_CONSTANTS);
  }

  static getProvider() {
    if (!DiscoveryProvider.provider) {
      DiscoveryProvider.provider = new DiscoveryProvider();
    }
    return DiscoveryProvider.provider;
  }
}
