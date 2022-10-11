import { CONFIG_CONSTANTS } from '../constants';
import { Entity } from './entity';

/**
 * 配置
 */
export class Config extends Entity {
  /** 配置项名称 */
  name!: string;
  /** 配置项值 */
  value!: string;

  static fromMap(map: { [key: string]: any }): Config {
    const c = new Config();
    c.id = map[CONFIG_CONSTANTS.IDENTIFIER];
    c.name = map[CONFIG_CONSTANTS.FIELDS.NAME];
    c.value = map[CONFIG_CONSTANTS.FIELDS.VALUE];
    return c;
  }

  toMap(): { [key: string]: any } {
    return {
      [CONFIG_CONSTANTS.IDENTIFIER]: this.id,
      [CONFIG_CONSTANTS.FIELDS.NAME]: this.name,
      [CONFIG_CONSTANTS.FIELDS.VALUE]: this.value,
    };
  }

  toParams(): any[] {
    return [this.name, this.value];
  }
}
