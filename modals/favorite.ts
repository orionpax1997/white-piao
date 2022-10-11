import { FAVORITE_CONSTANTS } from '../constants';
import { Entity } from './entity';

/**
 * 收藏项
 */
export class Favorite extends Entity {
  /** 标题 */
  title!: string;
  /** 目录地址 */
  seriesUrl!: string;
  /** 类型 */
  type?: string;
  /** 演员 */
  actors?: string;
  /** 简介 */
  intro?: string;
  /** 图片 */
  image?: string;
  /** 来源 id */
  sourceId!: number;
  /** 来源名称 */
  sourceName!: string;
  /** 创建时间 */
  createTime!: string;
  /** 剧集更新时间 */
  episodeUpdateTime!: string;
  /** 剧集更新标志 0: 无更新 1: 有更新 */
  episodeUpdateFlag!: number;
  /** 最后观看时间 */
  lastWatchTime!: string;
  /** 播放位置 */
  seek!: number;
  /** 当前视频源下标 */
  currEpisodeSource!: number;
  /** 当前集下标 */
  currEpisode!: number;

  static fromMap(map: { [key: string]: any }): Favorite {
    const f = new Favorite();
    f.id = map[FAVORITE_CONSTANTS.IDENTIFIER];
    f.title = map[FAVORITE_CONSTANTS.FIELDS.TITLE];
    f.seriesUrl = map[FAVORITE_CONSTANTS.FIELDS.SERIES_URL];
    f.type = map[FAVORITE_CONSTANTS.FIELDS.TYPE];
    f.actors = map[FAVORITE_CONSTANTS.FIELDS.ACTORS];
    f.intro = map[FAVORITE_CONSTANTS.FIELDS.INTRO];
    f.image = map[FAVORITE_CONSTANTS.FIELDS.IMAGE];
    f.sourceId = map[FAVORITE_CONSTANTS.FIELDS.SOURCE_ID];
    f.sourceName = map[FAVORITE_CONSTANTS.FIELDS.SOURCE_NAME];
    f.createTime = map[FAVORITE_CONSTANTS.FIELDS.CREATE_TIME];
    f.episodeUpdateTime = map[FAVORITE_CONSTANTS.FIELDS.EPISODE_UPDATE_TIME];
    f.episodeUpdateFlag = map[FAVORITE_CONSTANTS.FIELDS.EPISODE_UPDATE_FLAG];
    f.lastWatchTime = map[FAVORITE_CONSTANTS.FIELDS.LAST_WATCH_TIME];
    f.seek = map[FAVORITE_CONSTANTS.FIELDS.SEEK];
    f.currEpisodeSource = map[FAVORITE_CONSTANTS.FIELDS.CURR_EPISODE_SOURCE];
    f.currEpisode = map[FAVORITE_CONSTANTS.FIELDS.CURR_EPISODE];
    return f;
  }

  toMap(): { [key: string]: any } {
    return {
      [FAVORITE_CONSTANTS.IDENTIFIER]: this.id,
      [FAVORITE_CONSTANTS.FIELDS.TITLE]: this.title,
      [FAVORITE_CONSTANTS.FIELDS.SERIES_URL]: this.seriesUrl,
      [FAVORITE_CONSTANTS.FIELDS.TYPE]: this.type,
      [FAVORITE_CONSTANTS.FIELDS.ACTORS]: this.actors,
      [FAVORITE_CONSTANTS.FIELDS.INTRO]: this.intro,
      [FAVORITE_CONSTANTS.FIELDS.IMAGE]: this.image,
      [FAVORITE_CONSTANTS.FIELDS.SOURCE_ID]: this.sourceId,
      [FAVORITE_CONSTANTS.FIELDS.SOURCE_NAME]: this.sourceName,
      [FAVORITE_CONSTANTS.FIELDS.CREATE_TIME]: this.createTime,
      [FAVORITE_CONSTANTS.FIELDS.EPISODE_UPDATE_TIME]: this.episodeUpdateTime,
      [FAVORITE_CONSTANTS.FIELDS.EPISODE_UPDATE_FLAG]: this.episodeUpdateFlag,
      [FAVORITE_CONSTANTS.FIELDS.LAST_WATCH_TIME]: this.lastWatchTime,
      [FAVORITE_CONSTANTS.FIELDS.SEEK]: this.seek,
      [FAVORITE_CONSTANTS.FIELDS.CURR_EPISODE_SOURCE]: this.currEpisodeSource,
      [FAVORITE_CONSTANTS.FIELDS.CURR_EPISODE]: this.currEpisode,
    };
  }

  toParams(): any[] {
    return [
      this.title,
      this.seriesUrl,
      this.type,
      this.actors,
      this.intro,
      this.image,
      this.sourceId,
      this.sourceName,
      this.createTime,
      this.episodeUpdateTime,
      this.episodeUpdateFlag,
      this.lastWatchTime,
      this.seek,
      this.currEpisodeSource,
      this.currEpisode,
    ];
  }
}
