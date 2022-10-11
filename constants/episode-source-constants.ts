import { EntityConstants } from './entity-constants';

export const EPISODE_SOURCE_CONSTANTS: EntityConstants = {
  TABLE_NAME: 'episode_sources',
  IDENTIFIER: '_id',
  FIELD_NAMES: ['_index', 'title', 'favoriteId'],
  FIELDS: {
    INDEX: '_index',
    TITLE: 'title',
    FAVORITE_ID: 'favoriteId',
  },
};
