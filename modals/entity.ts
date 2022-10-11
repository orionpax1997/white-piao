/**
 * 数据库实体
 */
export abstract class Entity {
  /** 数据库 id */
  id?: number;
  /** 对象各个属性的值转为数组返回 */
  abstract toParams(): any[];
}
