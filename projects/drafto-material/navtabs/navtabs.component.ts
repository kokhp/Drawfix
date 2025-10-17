import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  OnDestroy,
  output,
  signal,
  TemplateRef,
  ViewEncapsulation,
} from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { MatTabLink, MatTabNav, MatTabNavPanel } from '@angular/material/tabs';
import { DftNavTabItem } from './navtabs.model';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import {
  exhaustMap,
  filter,
  finalize,
  from,
  map,
  Observable,
  of,
  pipe,
  Subject,
  switchMap,
  take,
  takeUntil,
  tap,
} from 'rxjs';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { DftQueryParamStore } from '@drafto/core/store';
import { NGXLogger } from 'ngx-logger';

let nextUniqueId = 0;
const TAG = '[DftNavTabsComponent]:';
function shallowEqualParams(
  a: Record<string, any> = {},
  b: Record<string, any> = {}
) {
  const aKeys = Object.keys(a);
  const bKeys = Object.keys(b);
  if (aKeys.length !== bKeys.length) return false;
  for (const k of aKeys) {
    if (a[k] !== b[k]) return false;
  }
  return true;
}

@Component({
  selector: 'dft-navtabs',
  standalone: true,
  imports: [MatTabNav, MatTabLink, NgTemplateOutlet],
  host: { '[class.dft-navtabs]': 'true' },
  templateUrl: './navtabs.component.html',
  styleUrls: ['./navtabs.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DftNavTabsComponent implements OnDestroy {
  //#region Inject Services
  private readonly _router = inject(Router);
  private readonly _logger = inject(NGXLogger);
  private readonly _route = inject(ActivatedRoute);
  private readonly _queryStore = inject(DftQueryParamStore);
  private readonly _routerEventDestroyRef = new Subject<void>();

  //#endregion

  //#region Input & Output

  id = input(`dft-mat-navtabs-${nextUniqueId++}`);
  tabs = input.required({
    transform: (items: DftNavTabItem[]) => {
      const seen = new Set<string>();
      return items.filter(({ routePath }) => {
        return routePath && !seen.has(routePath) && seen.add(routePath);
      });
    },
  });
  tabPanel = input.required<MatTabNavPanel>();
  headerExtraTemplateRef = input<TemplateRef<any>>();
  trackQueryParams = input(false, { transform: booleanAttribute });
  fitInkBarToContent = input(true, { transform: booleanAttribute });
  stretchTabs = input(false, { transform: booleanAttribute });
  tabChanged = output<DftNavTabItem>();

  //#endregion

  constructor() {
    this.syncTabs(this.tabs);
  }

  ngOnDestroy(): void {
    this._routerEventDestroyRef.complete();
    this._queryStore.stopAllTracking(this.id());
  }

  private readonly isBusy = signal(false);
  protected readonly activeTab = signal<DftNavTabItem | null>(null);
  protected readonly filteredTabs = computed(() =>
    this.tabs().filter((x) => !x.hidden)
  );

  private currentPath(): string {
    return this._router.url.split('?')[0] || '';
  }

  private pickActiveTab(tabs?: DftNavTabItem[]): DftNavTabItem | null {
    const path = this.currentPath();
    // Prefer the longest matching routePath (most specific)
    return (tabs ?? this.tabs())
      .filter((x) => !x.hidden && path.startsWith(x.routePath))
      .reduce<DftNavTabItem | null>((best, tab) => {
        if (!best) return tab;
        return tab.routePath.length > best.routePath.length ? tab : best;
      }, null);
  }

  private startNavigation(
    tabs?: DftNavTabItem[]
  ): Observable<DftNavTabItem | null> {
    const path = this.currentPath();
    const activeTab = this.pickActiveTab(tabs);

    if (!activeTab) return of(null);

    const trackedParams = this.trackQueryParams()
      ? this._queryStore.getParams(activeTab.routePath)
      : null;
    const currentParams = this._route.snapshot.queryParams;

    const needsParamFix =
      trackedParams != null &&
      !shallowEqualParams(trackedParams, currentParams);
    const needsPathFix = path !== activeTab.routePath;

    if (needsPathFix || needsParamFix) {
      this._logger.debug(
        TAG,
        'Routing to',
        activeTab.routePath,
        'with params',
        trackedParams ?? currentParams
      );
      return from(
        this._router.navigate([activeTab.routePath], {
          replaceUrl: true,
          relativeTo: this._route,
          queryParams: trackedParams ?? currentParams,
          queryParamsHandling: trackedParams ? undefined : 'merge',
        })
      ).pipe(map(() => activeTab));
    }

    return of(activeTab);
  }

  private readonly syncTabs = rxMethod<DftNavTabItem[]>(
    pipe(
      tap(() => {
        this.isBusy.set(true);
        this.activeTab.set(null);
        this._routerEventDestroyRef.next();
      }),
      switchMap((tabs) => {
        // Wait for initial navigation if router is in the middle of one
        if (this._router.getCurrentNavigation()) {
          this._logger.debug(TAG, 'Waiting for initial navigation');
          return this._router.events.pipe(
            filter((event) => event instanceof NavigationEnd),
            take(1),
            map(() => tabs)
          );
        }
        return of(tabs);
      }),
      tap((tabs) => {
        this._logger.debug(TAG, 'Syncing tabs:', tabs);
        tabs.forEach((it) => {
          if (it.hidden || !this.trackQueryParams()) {
            this._queryStore.stopTracking(this.id(), it.routePath);
          } else if (this.trackQueryParams()) {
            this._queryStore.startTracking(this.id(), it.routePath);
          }
        });
      }),
      switchMap((tabs) => {
        // Perform first navigation and set active tab
        return this.startNavigation(tabs).pipe(
          tap((activeTab) => {
            this.isBusy.set(false);
            if (activeTab) {
              this.activeTab.set(activeTab);
              this.tabChanged?.emit(activeTab);
              this._logger.debug(TAG, 'Active tab changed first:', activeTab);
            }
          }),
          switchMap(() => {
            // Listen for future navigation events
            return this._router.events.pipe(
              takeUntil(this._routerEventDestroyRef),
              filter((event) => event instanceof NavigationEnd),
              exhaustMap(() =>
                this.startNavigation().pipe(
                  tap((activeTab) => {
                    this.isBusy.set(false);
                    if (activeTab && this.activeTab() !== activeTab) {
                      this.activeTab.set(activeTab);
                      this.tabChanged?.emit(activeTab);
                      this._logger.debug(TAG, 'Active tab changed future:', activeTab);
                    }
                  })
                )
              )
            );
          })
        );
      }),
      finalize(() => this.isBusy.set(false))
    )
  );

  protected navigateTab(tab: DftNavTabItem): void {
    if (!tab.routePath) return;

    const currentTab = this.activeTab();
    if (currentTab?.routePath === tab.routePath) return;

    const trackedParams = this.trackQueryParams()
      ? this._queryStore.getParams(tab.routePath)
      : {};

    const queryParams = {
      ...(tab.queryParams ?? {}),
      ...(trackedParams || {}),
    };

    this._logger.debug(
      TAG,
      'Navigating to tab',
      tab.routePath,
      'with params',
      queryParams
    );

    this._router.navigate([tab.routePath], {
      queryParams,
    });
  }
}
