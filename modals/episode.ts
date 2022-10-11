import { EPISODE_CONSTANTS } from '../constants';
import { Entity } from './entity';

/**
 * 剧集
 */
export class Episode extends Entity {
  /** 下标 */
  index!: number;
  /** 标题 */
  title!: string;
  /** 播放页地址 */
  playPageUrl!: string;
  /** 收藏 id */
  favoriteId?: number;

  static fromMap(map: { [key: string]: any }): Episode {
    const e = new Episode();
    e.id = map[EPISODE_CONSTANTS.IDENTIFIER];
    e.index = map[EPISODE_CONSTANTS.FIELDS.INDEX];
    e.title = map[EPISODE_CONSTANTS.FIELDS.TITLE];
    e.playPageUrl = map[EPISODE_CONSTANTS.FIELDS.PLAY_PAGE_URL];
    e.favoriteId = map[EPISODE_CONSTANTS.FIELDS.FAVORITE_ID];
    return e;
  }

  toMap(): { [key: string]: any } {
    return {
      [EPISODE_CONSTANTS.IDENTIFIER]: this.id,
      [EPISODE_CONSTANTS.FIELDS.INDEX]: this.index,
      [EPISODE_CONSTANTS.FIELDS.TITLE]: this.title,
      [EPISODE_CONSTANTS.FIELDS.PLAY_PAGE_URL]: this.playPageUrl,
      [EPISODE_CONSTANTS.FIELDS.FAVORITE_ID]: this.favoriteId,
    };
  }

  toParams(): any[] {
    return [this.index, this.title, this.playPageUrl, this.favoriteId];
  }
}
