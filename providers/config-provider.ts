import { CONFIG_CONSTANTS } from '../constants';
import { Config } from '../modals';
import { DBProvider } from './db-provider';

export class ConfigProvider extends DBProvider<Config> {
  private static provider: ConfigProvider;
  private constructor() {
    super(CONFIG_CONSTANTS);
  }

  static getProvider() {
    if (!ConfigProvider.provider) {
      ConfigProvider.provider = new ConfigProvider();
    }
    return ConfigProvider.provider;
  }
}
