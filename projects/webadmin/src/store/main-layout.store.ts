import {
  signalStore,
  withState,
  withMethods,
  withHooks,
  patchState,
  withComputed,
  withProps,
} from '@ngrx/signals';
import { computed, inject } from '@angular/core';
import { filter, pipe, tap } from 'rxjs';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { MatDrawerMode } from '@angular/material/sidenav';
import { SidenavMenuItem, SidenavMenuType } from '../models/sidenav.model';
import {
  TOP_NAV_HEIGHT,
  SIDE_NAV_WIDTH,
  SIDE_NAV_COLLAPSED_WIDTH,
  MAIN_MENUS,
} from '../constants/main-layout.constant';
import {
  NavigationEnd,
  NavigationError,
  NavigationStart,
  Router,
} from '@angular/router';
import { AppStore } from './app.store';
import { NGXLogger } from 'ngx-logger';
import { APP_PATH } from '../constants/app.constants';

type MainLayoutState = {
  topnavHeight: number;
  topnavProgress: boolean;
  sidenavMode: MatDrawerMode;
  sidenavCollapsed: boolean;
  sidenavAutoCollapsed: boolean;
  sidenavActiveMenuType: SidenavMenuType;
  _sidenavMenuDict: { [key: string]: SidenavMenuItem[] };
  _sidenavMenuRouteDict: { [key: string]: string[] };
  activeRoute: string;
};

const initialState: MainLayoutState = {
  topnavHeight: TOP_NAV_HEIGHT,
  topnavProgress: false,
  sidenavMode: 'side',
  sidenavCollapsed: true,
  sidenavAutoCollapsed: false,
  sidenavActiveMenuType: SidenavMenuType.MAIN,
  _sidenavMenuDict: {},
  _sidenavMenuRouteDict: {},
  activeRoute: `/${APP_PATH.DASHBOARD}`,
};

const TAG = '[MainLayoutSotre]:';

function getSidenavActiveMenuType(
  route: string,
  routeDict: { [key: string]: string[] }
): SidenavMenuType {
  for (const [key, value] of Object.entries(routeDict)) {
    if (key === SidenavMenuType.MAIN) {
      if (value.some((x) => route.startsWith(x))) {
        return SidenavMenuType.MAIN;
      }
    }
  }
  return SidenavMenuType.MAIN;
}

export const MainLayoutStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withProps((store) => {
    return {
      _logger: inject(NGXLogger),
      _appStore: inject(AppStore),
    };
  }),
  withComputed(({ _appStore, ...store }) => ({
    sidenavWidth: computed(() => {
      const width = store.sidenavCollapsed()
        ? SIDE_NAV_COLLAPSED_WIDTH
        : SIDE_NAV_WIDTH;
      return `${width}px`;
    }),
    sidenavContentWidth: computed(() => {
      const windowSize = _appStore.windowSize();
      const sidenavWidth = store.sidenavCollapsed()
        ? SIDE_NAV_COLLAPSED_WIDTH
        : SIDE_NAV_WIDTH;
      return windowSize.width - sidenavWidth;
    }),
    sidenavMenuItems: computed(() => {
      const activeType = store.sidenavActiveMenuType();
      const menus = (store._sidenavMenuDict()[activeType] || []).filter((x) => {
        if (x.hidden || x.fixed) return false;

        const hasRoute = typeof x.route === 'string' && x.route !== '';
        const hasOnClick = typeof x.onClick === 'function';
        if (!hasRoute && !hasOnClick) return false;

        return true;
      });
      return menus;
    }),
    sidenavFixedMenuItems: computed(() => {
      const mainMenus = store._sidenavMenuDict()[SidenavMenuType.MAIN] || [];
      return mainMenus.filter((x) => x.fixed);
    }),
  })),
  withMethods(({ _logger, ...store }) => {
    const setTopnavProgress = (inProgress: boolean) => {
      patchState(store, { topnavProgress: inProgress });
    };

    return {
      setTopnavProgress,
      setTopnavHeight(height: number): void {
        height = height || TOP_NAV_HEIGHT;
        patchState(store, { topnavHeight: height });
      },
      toggleSidenav(): void {
        const isCollapsed = store.sidenavCollapsed();
        patchState(store, { sidenavCollapsed: !isCollapsed });
      },
    };
  }),
  withHooks(({ setTopnavProgress, _logger, ...store }) => {
    const router = inject(Router);

    const allowedEvents = [NavigationStart, NavigationEnd, NavigationError];
    const onNavigation = rxMethod<any>(
      pipe(
        filter((event) => allowedEvents.some((x) => event instanceof x)),
        tap((event) => {
          if (event instanceof NavigationStart) {
            setTopnavProgress(true);
            return;
          }

          const currentRoute = router.url.split('?')[0] || '';
          const activeMenuType = getSidenavActiveMenuType(
            currentRoute,
            store._sidenavMenuRouteDict()
          );
          patchState(store, {
            topnavProgress: false,
            activeRoute: currentRoute,
          });

          if (activeMenuType !== store.sidenavActiveMenuType()) {
            patchState(store, { sidenavActiveMenuType: activeMenuType });
            _logger.debug(TAG, 'SidenavMenuTypeChanged', activeMenuType);
          }
        })
      )
    );

    const loadMenus = () => {
      setTopnavProgress(true);
      const menuDict: { [key: string]: SidenavMenuItem[] } = {};
      const menuRouteDict: { [key: string]: string[] } = {};

      menuDict[SidenavMenuType.MAIN] = [];
      menuRouteDict[SidenavMenuType.MAIN] = [];
      let _id = 0;
      for (const item of Object.values(MAIN_MENUS)) {
        menuDict[SidenavMenuType.MAIN].push({
          ...item,
          id: `${SidenavMenuType.MAIN}-${_id++}`,
        });
        if (item.route !== undefined && item.route !== '') {
          menuRouteDict[SidenavMenuType.MAIN].push(item.route);
        }
      }

      patchState(store, {
        topnavProgress: false,
        _sidenavMenuDict: menuDict,
        _sidenavMenuRouteDict: menuRouteDict,
      });
    };

    return {
      onInit() {
        loadMenus();
        onNavigation(router.events);
        _logger.debug(TAG, 'Main Layout Initialized');
      },
    };
  })
);
