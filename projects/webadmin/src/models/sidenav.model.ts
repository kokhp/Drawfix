export type SidenavMenuItem = {
  id?: string;
  icon?: string;
  label: string;
  route?: string;
  activeRoutes?: string[];
  trackRouteQuery?: boolean;
  fixed?: boolean;
  order?: number;
  disabled?: boolean;
  hidden?: boolean;
  onClick?: () => Promise<void>;
};

export enum SidenavMenuType {
  MAIN = 'main',
  POSTER = 'poster'
}
