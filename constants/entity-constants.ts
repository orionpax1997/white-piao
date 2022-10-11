/** 数据库实体常量 */
export type EntityConstants = {
  /** 表名 */
  TABLE_NAME: string;
  /** Id 名 */
  IDENTIFIER: string;
  /** 字段名列表 */
  FIELD_NAMES: string[];
  /** 字段名映射 */
  FIELDS: { [key: string]: string };
};
