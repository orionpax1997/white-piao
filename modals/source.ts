import { SOURCE_CONSTANTS } from '../constants';
import { Entity } from './entity';

/**
 * 资源/来源
 */
export class Source extends Entity {
  /** leanCloud id */
  objectId!: string;
  /** 名称 */
  name!: string;
  /** 根路径 */
  baseURL!: string;
  /** 作者 */
  author!: string;
  /** 作者邮箱 */
  authorEmail!: string;
  /** 搜索时间 */
  searchTime!: number;
  /** 搜索表达式 */
  searchScript!: string;
  /** 发现目录表达式 */
  findSeriesScript!: string;
  /** 发现流表达式 */
  findStreamScript!: string;
  /** 创建时间 */
  createdAt!: string;
  /** 修改时间 */
  updatedAt!: string;
  /** 资源服务地址 */
  resourceServerUrl!: string;
  /** 是否启用 0: 停用 1: 启用 */
  isEnabled!: number;

  static fromMap(map: { [key: string]: any }): Source {
    const s = new Source();
    s.id = map[SOURCE_CONSTANTS.IDENTIFIER];
    s.objectId = map[SOURCE_CONSTANTS.FIELDS.OBJECT_ID];
    s.name = map[SOURCE_CONSTANTS.FIELDS.NAME];
    s.baseURL = map[SOURCE_CONSTANTS.FIELDS.BASE_URL];
    s.author = map[SOURCE_CONSTANTS.FIELDS.AUTHOR];
    s.authorEmail = map[SOURCE_CONSTANTS.FIELDS.AUTHOR_EMAIL];
    s.searchTime = map[SOURCE_CONSTANTS.FIELDS.SEARCH_TIME];
    s.searchScript = map[SOURCE_CONSTANTS.FIELDS.SEARCH_SCRIPT];
    s.findSeriesScript = map[SOURCE_CONSTANTS.FIELDS.FIND_SERIES_SCRIPT];
    s.findStreamScript = map[SOURCE_CONSTANTS.FIELDS.FIND_STREAM_SCRIPT];
    s.createdAt = map[SOURCE_CONSTANTS.FIELDS.CREATED_AT];
    s.updatedAt = map[SOURCE_CONSTANTS.FIELDS.UPDATED_AT];
    s.resourceServerUrl = map[SOURCE_CONSTANTS.FIELDS.RESOURCE_SERVER_URL];
    s.isEnabled = map[SOURCE_CONSTANTS.FIELDS.IS_ENABLED];
    return s;
  }

  toMap(): { [key: string]: any } {
    return {
      [SOURCE_CONSTANTS.IDENTIFIER]: this.id,
      [SOURCE_CONSTANTS.FIELDS.OBJECT_ID]: this.objectId,
      [SOURCE_CONSTANTS.FIELDS.NAME]: this.name,
      [SOURCE_CONSTANTS.FIELDS.BASE_URL]: this.baseURL,
      [SOURCE_CONSTANTS.FIELDS.AUTHOR]: this.author,
      [SOURCE_CONSTANTS.FIELDS.AUTHOR_EMAIL]: this.authorEmail,
      [SOURCE_CONSTANTS.FIELDS.SEARCH_TIME]: this.searchTime,
      [SOURCE_CONSTANTS.FIELDS.SEARCH_SCRIPT]: this.searchScript,
      [SOURCE_CONSTANTS.FIELDS.FIND_SERIES_SCRIPT]: this.findSeriesScript,
      [SOURCE_CONSTANTS.FIELDS.FIND_STREAM_SCRIPT]: this.findStreamScript,
      [SOURCE_CONSTANTS.FIELDS.CREATED_AT]: this.createdAt,
      [SOURCE_CONSTANTS.FIELDS.UPDATED_AT]: this.updatedAt,
      [SOURCE_CONSTANTS.FIELDS.RESOURCE_SERVER_URL]: this.resourceServerUrl,
      [SOURCE_CONSTANTS.FIELDS.IS_ENABLED]: this.isEnabled,
    };
  }

  toParams(): any[] {
    return [
      this.objectId,
      this.name,
      this.baseURL,
      this.author,
      this.authorEmail,
      this.searchTime,
      this.searchScript,
      this.findSeriesScript,
      this.findStreamScript,
      this.createdAt,
      this.updatedAt,
      this.resourceServerUrl,
      this.isEnabled,
    ];
  }
}
