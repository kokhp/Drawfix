import { DftNavTabItem } from '@drafto/material/navtabs';
import { APP_PATH } from './app.constants';

export const CONTENT_NAV_TABS = Object.freeze({
  allPosters: Object.freeze({
    id: 100,
    label: 'Posters',
    routePath: `/${APP_PATH.CONTENT.PARENT}/${APP_PATH.CONTENT.POSTERS}`,
  } as DftNavTabItem),
  homeCategories: Object.freeze({
    id: 102,
    label: 'Categories',
    routePath: `/${APP_PATH.CONTENT.PARENT}/${APP_PATH.CONTENT.CATEGORIES}`,
  } as DftNavTabItem),
  politicalParties: Object.freeze({
    id: 103,
    label: 'Parties',
    routePath: `/${APP_PATH.CONTENT.PARENT}/${APP_PATH.CONTENT.PARTIES}`,
  } as DftNavTabItem),
  iconicLeaders: Object.freeze({
    id: 104,
    label: 'Leaders',
    routePath: `/${APP_PATH.CONTENT.PARENT}/${APP_PATH.CONTENT.LEADERS}`,
  } as DftNavTabItem),
});
