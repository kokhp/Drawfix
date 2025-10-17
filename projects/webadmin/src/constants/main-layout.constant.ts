import { APP_PATH } from './app.constants';
import { SidenavMenuItem } from '../models/sidenav.model';

export const SIDE_NAV_WIDTH = 255;
export const SIDE_NAV_COLLAPSED_WIDTH = 72;
export const TOP_NAV_HEIGHT = 68;

export const MAIN_MENUS = Object.freeze({
  dashboard: Object.freeze({
    label: "Dashboard",
    icon: "dashboard",
    route: `/${APP_PATH.DASHBOARD}`,
  } as SidenavMenuItem),
  content: Object.freeze({
    label: "Content",
    icon: "collections",
    route: `/${APP_PATH.CONTENT.PARENT}/${APP_PATH.CONTENT.POSTERS}`,
    activeRoutes: [
      `/${APP_PATH.CONTENT.PARENT}/${APP_PATH.CONTENT.POSTERS}`,
      `/${APP_PATH.CONTENT.PARENT}/${APP_PATH.CONTENT.CATEGORIES}`,
      `/${APP_PATH.CONTENT.PARENT}/${APP_PATH.CONTENT.PARTIES}`,
      `/${APP_PATH.CONTENT.PARENT}/${APP_PATH.CONTENT.LEADERS}`,
    ],
  } as SidenavMenuItem),
  settings: Object.freeze({
    label: "Settings",
    icon: "settings",
    fixed: true,
    onClick: () => new Promise(() => alert("Hello Settings")),
  } as SidenavMenuItem),
});
