import { EntityConstants } from './entity-constants';

export const DISCOVERY_CONSTANTS: EntityConstants = {
  TABLE_NAME: 'discovery',
  IDENTIFIER: '_id',
  FIELD_NAMES: ['title', 'discoveryUrl', 'sourceId'],
  FIELDS: {
    TITLE: 'title',
    DISCOVERY_URL: 'discoveryUrl',
    SOURCE_ID: 'sourceId',
  },
};
