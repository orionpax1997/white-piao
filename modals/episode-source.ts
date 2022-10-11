import { EPISODE_SOURCE_CONSTANTS } from '../constants';
import { Entity } from './entity';

/**
 * 剧集来源
 */
export class EpisodeSource extends Entity {
  /** 下标 */
  index!: number;
  /** 标题 */
  title!: string;
  /** 收藏 id */
  favoriteId?: number;

  static fromMap(map: { [key: string]: any }): EpisodeSource {
    const e = new EpisodeSource();
    e.id = map[EPISODE_SOURCE_CONSTANTS.IDENTIFIER];
    e.index = map[EPISODE_SOURCE_CONSTANTS.FIELDS.INDEX];
    e.title = map[EPISODE_SOURCE_CONSTANTS.FIELDS.TITLE];
    e.favoriteId = map[EPISODE_SOURCE_CONSTANTS.FIELDS.FAVORITE_ID];
    return e;
  }

  toMap(): { [key: string]: any } {
    return {
      [EPISODE_SOURCE_CONSTANTS.IDENTIFIER]: this.id,
      [EPISODE_SOURCE_CONSTANTS.FIELDS.INDEX]: this.index,
      [EPISODE_SOURCE_CONSTANTS.FIELDS.TITLE]: this.title,
      [EPISODE_SOURCE_CONSTANTS.FIELDS.FAVORITE_ID]: this.favoriteId,
    };
  }

  toParams(): any[] {
    return [this.index, this.title, this.favoriteId];
  }
}
