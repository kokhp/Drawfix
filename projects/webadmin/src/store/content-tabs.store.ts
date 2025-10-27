import { computed, inject, TemplateRef } from "@angular/core";
import { Router } from "@angular/router";
import {
  signalStore,
  withProps,
  withState,
  withComputed,
  withMethods,
  withHooks,
  patchState,
} from "@ngrx/signals";
import { NGXLogger } from "ngx-logger";
import { DftNavTabItem } from "@drafto/material/navtabs";
import { CONTENT_NAV_TABS } from "../constants/content.constant";

type ContentTabsState = {
  _tabs: DftNavTabItem[];
  activeTab: DftNavTabItem | null;
  headerTemplateRef: TemplateRef<any> | null;
  navTabHeaderTemplateRef: TemplateRef<any> | null;
};
const initialState: ContentTabsState = {
  _tabs: [],
  activeTab: null,
  headerTemplateRef: null,
  navTabHeaderTemplateRef: null,
};
const TAG = "[ContentTabsSotre]:";

export const ContentTabsSotre = signalStore(
  { providedIn: "root" },
  withState(initialState),
  withProps(() => {
    return {
      _logger: inject(NGXLogger),
      _router: inject(Router),
    };
  }),
  withComputed((store) => ({
    filteredTabs: computed(() => {
      return store._tabs().filter((x) => !x.hidden && x.routePath);
    }),
  })),
  withMethods(({ _logger, _router, ...store }) => {
    return {
      setActiveTab(tab: DftNavTabItem | null): void {
        patchState(store, { activeTab: tab });
      },

      setHeaderTemplateRef(templateRef: TemplateRef<any> | null): void {
        patchState(store, { headerTemplateRef: templateRef });
      },
      setNavTabHeaderTemplateRef(templateRef: TemplateRef<any> | null): void {
        patchState(store, { navTabHeaderTemplateRef: templateRef });
      },
    };
  }),
  withHooks(({ _logger, ...store }) => {
    const loadTabs = () => {
      const navTabs = Object.values(CONTENT_NAV_TABS).map((it) => ({ ...it }));
      patchState(store, { _tabs: navTabs });
    };

    return {
      onInit() {
        loadTabs();
        _logger.debug(TAG, "Initialized");
      },
    };
  })
);
