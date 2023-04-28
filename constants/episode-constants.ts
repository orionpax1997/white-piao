import { EntityConstants } from './entity-constants';

export const EPISODE_CONSTANTS: EntityConstants = {
  TABLE_NAME: 'episodes',
  IDENTIFIER: '_id',
  FIELD_NAMES: ['_index', 'title', 'playPageUrl', 'favoriteId', 'sourceIndex'],
  FIELDS: {
    INDEX: '_index',
    TITLE: 'title',
    PLAY_PAGE_URL: 'playPageUrl',
    FAVORITE_ID: 'favoriteId',
    SOURCE_INDEX: 'sourceIndex',
  },
};
