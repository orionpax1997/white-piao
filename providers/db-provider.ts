import { SQLResultSet } from 'expo-sqlite';

import { EntityConstants } from '../constants';
import { getDB } from '../contexts/database-context';
import { Entity } from '../modals/entity';

export abstract class DBProvider<E extends Entity> {
  private constants: EntityConstants;

  constructor(constants: EntityConstants) {
    this.constants = constants;
  }

  /**
   * 执行 sql
   * @param sqlStatement sql
   * @param args 参数
   * @returns SQLResultSet
   */
  execSql(sqlStatement: string, args?: (number | string | null)[]): Promise<SQLResultSet> {
    return new Promise((resolve, reject) => {
      getDB().then(db =>
        db.transaction(tx => {
          tx.executeSql(
            sqlStatement,
            args,
            (_, rs) => {
              resolve(rs);
            },
            (_, error) => {
              reject(error);
              return false;
            }
          );
        })
      );
    });
  }

  /**
   * 新增
   * @param e Entity
   * @returns Entity
   */
  async create(e: E): Promise<E> {
    const { insertId } = await this.execSql(
      `INSERT INTO ${this.constants.TABLE_NAME}(${this.constants.FIELD_NAMES.join(
        ','
      )}) VALUES(${this.constants.FIELD_NAMES.map(_ => '?').join(',')})`,
      e.toParams()
    );
    e.id = insertId;
    return e;
  }

  /**
   * 删除
   * @param where 条件
   * @param args 参数数组
   * @returns 影响行数
   */
  async delete(where?: string, args?: (number | string | null)[]): Promise<number> {
    const { rowsAffected } = await this.execSql(
      `DELETE FROM ${this.constants.TABLE_NAME}${where ? ` WHERE ${where}` : ''}`,
      args
    );
    return rowsAffected;
  }

  /**
   * 根据 id 删除
   * @param id id
   * @returns 影响行数
   */
  async deleteById(id: number): Promise<number> {
    return this.delete(`${this.constants.IDENTIFIER} = ?`, [id]);
  }

  /**
   * 修改
   * @param e Entity
   * @returns 影响行数
   */
  async update(e: E): Promise<number> {
    const { rowsAffected } = await this.execSql(
      `UPDATE ${this.constants.TABLE_NAME} SET ${this.constants.FIELD_NAMES.map(fieldName => `${fieldName} = ?`).join(
        ','
      )} WHERE ${this.constants.IDENTIFIER} = ?`,
      [...e.toParams(), e.id]
    );
    return rowsAffected;
  }

  /**
   * 查询
   * @param where 条件
   * @param args 参数数组
   * @returns rows
   */
  async read(where?: string, args?: (number | string | null)[]): Promise<{ [key: string]: any }[]> {
    const { rows } = await this.execSql(
      `SELECT ${this.constants.IDENTIFIER},${this.constants.FIELD_NAMES.join(',')} FROM ${this.constants.TABLE_NAME}${
        where ? ` WHERE ${where}` : ''
      }`,
      args
    );
    return rows._array;
  }

  /**
   * 根据 id 查询
   * @param id id
   * @returns row
   */
  async readById(id: number): Promise<{ [key: string]: any }> {
    const rows = await this.read(`${this.constants.IDENTIFIER} = ?`, [id]);
    return rows[0];
  }
}
