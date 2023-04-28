import { Database, openDatabase, SQLResultSet } from 'expo-sqlite';

import {
  DATABASE_VERSION,
  REBUILD_DATABASE,
  CONFIG_CONSTANTS,
  SOURCE_CONSTANTS,
  FAVORITE_CONSTANTS,
  EPISODE_CONSTANTS,
  EPISODE_SOURCE_CONSTANTS,
  ID_TYPE,
  TEXT_NULL_TYPE,
  TEXT_TYPE,
  INTEGER_NULL_TYPE,
} from '../constants';

let database: Database;
let _db: Database;
let _generating: boolean = false;

/**
 * 执行 sql
 * @param sqlStatement sql
 * @param args 参数
 * @returns SQLResultSet
 */
export const execSql = (sqlStatement: string, args?: (number | string | null)[]): Promise<SQLResultSet> => {
  return new Promise((resolve, reject) => {
    _db.transaction(tx => {
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
    });
  });
};

export const getDB = async () => {
  if (_generating) {
    await waitGenerated();
  }
  if (database == null) {
    _generating = true;
    await initDB();
    _generating = false;
  }
  return database;
};

const initDB = async () => {
  _db = openDatabase('white-piao.db');
  const { rows } = await execSql(
    `SELECT name FROM sqlite_master WHERE type='table' AND name='${CONFIG_CONSTANTS.TABLE_NAME}'`
  );
  if (rows.length === 0 || REBUILD_DATABASE) {
    console.log('build database...');
    await generate();
  } else {
    const { rows } = await execSql(
      `SELECT name,value FROM ${CONFIG_CONSTANTS.TABLE_NAME} WHERE ${CONFIG_CONSTANTS.FIELDS.NAME} = ?`,
      ['version']
    );
    const version = parseInt(rows.item(0).value, 10);
    if (version < DATABASE_VERSION) {
      console.log(`upgrade to ${DATABASE_VERSION}`);
      await generate();
    }
  }
  database = _db;
};

const generate = async () => {
  await dropConfigTable();
  await dropSourceTable();
  await dropFavoriteTable();
  await dropEpisodeTable();
  await dropEpisodeSourceTable();
  await createConfigTable();
  await createSourceTable();
  await createFavoriteTable();
  await createEpisodeTable();
  await createEpisodeSourceTable();
  await initConfigData();
};

const waitGenerated = async () => {
  await new Promise(resolve => {
    const timer = setInterval(() => {
      if (!_generating) {
        clearInterval(timer);
        resolve(true);
      }
    }, 100);
  });
};

const dropConfigTable = async () => {
  await execSql(`DROP TABLE IF EXISTS ${CONFIG_CONSTANTS.TABLE_NAME}`);
};

const createConfigTable = async () => {
  await execSql(`CREATE TABLE ${CONFIG_CONSTANTS.TABLE_NAME} ( 
  ${CONFIG_CONSTANTS.IDENTIFIER} ${ID_TYPE}, 
  ${CONFIG_CONSTANTS.FIELDS.NAME} ${TEXT_TYPE},
  ${CONFIG_CONSTANTS.FIELDS.VALUE} ${TEXT_TYPE}
  )`);
};

const initConfigData = async () => {
  await execSql(
    `INSERT INTO ${CONFIG_CONSTANTS.TABLE_NAME}(${CONFIG_CONSTANTS.FIELD_NAMES.join(
      ','
    )}) VALUES(${CONFIG_CONSTANTS.FIELD_NAMES.map(_ => '?').join(',')})`,
    ['version', `${DATABASE_VERSION}`]
  );

  await execSql(
    `INSERT INTO ${CONFIG_CONSTANTS.TABLE_NAME}(${CONFIG_CONSTANTS.FIELD_NAMES.join(
      ','
    )}) VALUES(${CONFIG_CONSTANTS.FIELD_NAMES.map(_ => '?').join(',')})`,
    ['resouce-server-url', `https://white-piao.humblex.top`]
  );
};

const dropSourceTable = async () => {
  await execSql(`DROP TABLE IF EXISTS ${SOURCE_CONSTANTS.TABLE_NAME}`);
};

const createSourceTable = async () => {
  await execSql(`CREATE TABLE ${SOURCE_CONSTANTS.TABLE_NAME} ( 
  ${SOURCE_CONSTANTS.IDENTIFIER} ${ID_TYPE}, 
  ${SOURCE_CONSTANTS.FIELDS.OBJECT_ID} ${TEXT_TYPE},
  ${SOURCE_CONSTANTS.FIELDS.NAME} ${TEXT_TYPE},
  ${SOURCE_CONSTANTS.FIELDS.BASE_URL} ${TEXT_TYPE},
  ${SOURCE_CONSTANTS.FIELDS.AUTHOR} ${TEXT_TYPE},
  ${SOURCE_CONSTANTS.FIELDS.AUTHOR_EMAIL} ${TEXT_TYPE},
  ${SOURCE_CONSTANTS.FIELDS.SEARCH_TIME} ${INTEGER_NULL_TYPE},
  ${SOURCE_CONSTANTS.FIELDS.SEARCH_SCRIPT} ${TEXT_TYPE},
  ${SOURCE_CONSTANTS.FIELDS.FIND_SERIES_SCRIPT} ${TEXT_TYPE},
  ${SOURCE_CONSTANTS.FIELDS.FIND_STREAM_SCRIPT} ${TEXT_TYPE},
  ${SOURCE_CONSTANTS.FIELDS.CREATED_AT} ${TEXT_TYPE},
  ${SOURCE_CONSTANTS.FIELDS.UPDATED_AT} ${TEXT_TYPE},
  ${SOURCE_CONSTANTS.FIELDS.RESOURCE_SERVER_URL} ${TEXT_TYPE},
  ${SOURCE_CONSTANTS.FIELDS.IS_ENABLED} ${INTEGER_NULL_TYPE}
  )`);
};

const dropFavoriteTable = async () => {
  await execSql(`DROP TABLE IF EXISTS ${FAVORITE_CONSTANTS.TABLE_NAME}`);
};

const createFavoriteTable = async () => {
  await execSql(`CREATE TABLE ${FAVORITE_CONSTANTS.TABLE_NAME} ( 
  ${FAVORITE_CONSTANTS.IDENTIFIER} ${ID_TYPE}, 
  ${FAVORITE_CONSTANTS.FIELDS.TITLE} ${TEXT_TYPE},
  ${FAVORITE_CONSTANTS.FIELDS.SERIES_URL} ${TEXT_TYPE},
  ${FAVORITE_CONSTANTS.FIELDS.TYPE} ${TEXT_NULL_TYPE},
  ${FAVORITE_CONSTANTS.FIELDS.ACTORS} ${TEXT_NULL_TYPE},
  ${FAVORITE_CONSTANTS.FIELDS.INTRO} ${TEXT_NULL_TYPE},
  ${FAVORITE_CONSTANTS.FIELDS.IMAGE} ${TEXT_NULL_TYPE},
  ${FAVORITE_CONSTANTS.FIELDS.SOURCE_ID} ${INTEGER_NULL_TYPE},
  ${FAVORITE_CONSTANTS.FIELDS.SOURCE_NAME} ${TEXT_TYPE},
  ${FAVORITE_CONSTANTS.FIELDS.CREATE_TIME} ${TEXT_TYPE},
  ${FAVORITE_CONSTANTS.FIELDS.EPISODE_UPDATE_TIME} ${TEXT_TYPE},
  ${FAVORITE_CONSTANTS.FIELDS.EPISODE_UPDATE_FLAG} ${INTEGER_NULL_TYPE},
  ${FAVORITE_CONSTANTS.FIELDS.LAST_WATCH_TIME} ${TEXT_TYPE},
  ${FAVORITE_CONSTANTS.FIELDS.SEEK} ${INTEGER_NULL_TYPE},
  ${FAVORITE_CONSTANTS.FIELDS.CURR_EPISODE_SOURCE} ${INTEGER_NULL_TYPE},
  ${FAVORITE_CONSTANTS.FIELDS.CURR_EPISODE} ${INTEGER_NULL_TYPE}
  )`);
};

const dropEpisodeTable = async () => {
  await execSql(`DROP TABLE IF EXISTS ${EPISODE_CONSTANTS.TABLE_NAME}`);
};

const createEpisodeTable = async () => {
  await execSql(`CREATE TABLE ${EPISODE_CONSTANTS.TABLE_NAME} ( 
  ${EPISODE_CONSTANTS.IDENTIFIER} ${ID_TYPE}, 
  ${EPISODE_CONSTANTS.FIELDS.INDEX} ${INTEGER_NULL_TYPE},
  ${EPISODE_CONSTANTS.FIELDS.TITLE} ${TEXT_TYPE},
  ${EPISODE_CONSTANTS.FIELDS.PLAY_PAGE_URL} ${TEXT_TYPE},
  ${EPISODE_CONSTANTS.FIELDS.FAVORITE_ID} ${INTEGER_NULL_TYPE},
  ${EPISODE_CONSTANTS.FIELDS.SOURCE_INDEX} ${INTEGER_NULL_TYPE}
  )`);
};

const dropEpisodeSourceTable = async () => {
  await execSql(`DROP TABLE IF EXISTS ${EPISODE_SOURCE_CONSTANTS.TABLE_NAME}`);
};

const createEpisodeSourceTable = async () => {
  await execSql(`CREATE TABLE ${EPISODE_SOURCE_CONSTANTS.TABLE_NAME} ( 
  ${EPISODE_SOURCE_CONSTANTS.IDENTIFIER} ${ID_TYPE}, 
  ${EPISODE_SOURCE_CONSTANTS.FIELDS.INDEX} ${INTEGER_NULL_TYPE},
  ${EPISODE_SOURCE_CONSTANTS.FIELDS.TITLE} ${TEXT_TYPE},
  ${EPISODE_SOURCE_CONSTANTS.FIELDS.FAVORITE_ID} ${INTEGER_NULL_TYPE}
  )`);
};
