import { DISCOVERY_CONSTANTS } from '../constants';
import { Entity } from './entity';

/**
 * 剧集来源
 */
export class Discovery extends Entity {
  /** 标题 */
  title!: string;
  /** 发现页地址 */
  discoveryUrl!: string;
  /** 来源 id */
  sourceId!: number;

  static fromMap(map: { [key: string]: any }): Discovery {
    const e = new Discovery();
    e.id = map[DISCOVERY_CONSTANTS.IDENTIFIER];
    e.title = map[DISCOVERY_CONSTANTS.FIELDS.TITLE];
    e.discoveryUrl = map[DISCOVERY_CONSTANTS.FIELDS.DISCOVERY_URL];
    e.sourceId = map[DISCOVERY_CONSTANTS.FIELDS.SOURCE_ID];
    return e;
  }

  toMap(): { [key: string]: any } {
    return {
      [DISCOVERY_CONSTANTS.IDENTIFIER]: this.id,
      [DISCOVERY_CONSTANTS.FIELDS.TITLE]: this.title,
      [DISCOVERY_CONSTANTS.FIELDS.DISCOVERY_URL]: this.discoveryUrl,
      [DISCOVERY_CONSTANTS.FIELDS.SOURCE_ID]: this.sourceId,
    };
  }

  toParams(): any[] {
    return [this.title, this.discoveryUrl, this.sourceId];
  }
}
