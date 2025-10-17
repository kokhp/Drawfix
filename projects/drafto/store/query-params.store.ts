import { inject } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import {
  patchState,
  signalStore,
  withHooks,
  withMethods,
  withProps,
  withState,
} from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { NGXLogger } from 'ngx-logger';
import {
  BehaviorSubject,
  distinctUntilChanged,
  filter,
  map,
  Observable,
  tap,
} from 'rxjs';
import { stringifyQueryParams } from '@drafto/core';

interface QueryParamState {
  readonly _trackingPaths: Set<string>;
  readonly _queryParams: Record<string, Params>;
  readonly _callerTracking: Record<string, Set<string>>;
}

interface PathUpdate {
  readonly path: string;
  readonly params: Params;
}

const initialState: QueryParamState = {
  _trackingPaths: new Set(),
  _queryParams: {},
  _callerTracking: {},
};

const TAG = '[DftQueryParamStore]:';

export const DftQueryParamStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withProps(() => ({
    _logger: inject(NGXLogger),
    _activatedRoute: inject(ActivatedRoute),
  })),
  withMethods(({ _logger, _activatedRoute, ...store }) => {
    const router = inject(Router);
    const onChanges$ = new BehaviorSubject<PathUpdate | null>(null);

    const getCurrentPath = (): string => router.url.split('?')[0] || '';

    const areParamsEqual = (params1: Params, params2: Params): boolean => {
      const keys1 = Object.keys(params1);
      const keys2 = Object.keys(params2);
      return (
        keys1.length === keys2.length &&
        keys1.every((key) => params1[key] === params2[key])
      );
    };

    const updateParams = (params?: Params): void => {
      const path = getCurrentPath();

      if (!store._trackingPaths().has(path)) return;

      const newParams = params ?? _activatedRoute.snapshot.queryParams;
      const currentParams = store._queryParams()[path] || {};

      if (areParamsEqual(currentParams, newParams)) return;

      patchState(store, {
        _queryParams: {
          ...store._queryParams(),
          [path]: newParams,
        },
      });

      onChanges$.next({ path, params: newParams });
      _logger.debug(TAG, 'Changes:', newParams, path);
    };

    const isPathTrackedByOtherCallers = (
      caller: string,
      path: string
    ): boolean => {
      return Object.entries(store._callerTracking()).some(
        ([tc, paths]) => tc !== caller && paths.has(path)
      );
    };

    const stopTracking = (caller: string, path: string): void => {
      const callerTracking = store._callerTracking();

      if (!callerTracking[caller]?.has(path)) return;

      // clone caller tracking
      const updatedCallerTracking: Record<string, Set<string>> = {
        ...callerTracking,
        [caller]: new Set(callerTracking[caller]),
      };
      updatedCallerTracking[caller].delete(path);

      if (updatedCallerTracking[caller].size === 0) {
        delete updatedCallerTracking[caller];
      }

      const shouldRemovePath = !isPathTrackedByOtherCallers(caller, path);

      const updatedTrackingPaths = shouldRemovePath
        ? (() => {
            const newPaths = new Set(store._trackingPaths());
            newPaths.delete(path);
            return newPaths;
          })()
        : store._trackingPaths();

      const updatedQueryParams = shouldRemovePath
        ? (() => {
            const newParams = { ...store._queryParams() };
            delete newParams[path];
            return newParams;
          })()
        : store._queryParams();

      patchState(store, {
        _trackingPaths: updatedTrackingPaths,
        _queryParams: updatedQueryParams,
        _callerTracking: updatedCallerTracking,
      });
    };

    return {
      _setOnChanges: rxMethod<Params>(tap(updateParams)),

      startTracking(caller: string, path: string): void {
        const callerTracking = store._callerTracking();
        const isNewPath = !store._trackingPaths().has(path);

        // clone caller tracking
        const updatedCallerTracking: Record<string, Set<string>> = {
          ...callerTracking,
          [caller]: new Set(callerTracking[caller] ?? []),
        };
        updatedCallerTracking[caller].add(path);

        const updatedTrackingPaths = isNewPath
          ? new Set([...store._trackingPaths(), path])
          : store._trackingPaths();

        patchState(store, {
          _trackingPaths: updatedTrackingPaths,
          _callerTracking: updatedCallerTracking,
        });

        if (isNewPath) {
          updateParams();
        }
      },

      stopTracking,

      getParams(path: string): Params | null {
        return store._queryParams()[path] ?? null;
      },

      getFullRoute(path: string, params?: Params): string {
        const queryParams = params ?? this.getParams(path);
        if (!queryParams || Object.keys(queryParams).length === 0) return path;
        return `${path}?${stringifyQueryParams(queryParams)}`;
      },

      onChanges(path: string): Observable<Params> {
        return onChanges$.pipe(
          filter((x): x is PathUpdate => x !== null && x.path === path),
          map((update) => update.params),
          distinctUntilChanged(areParamsEqual)
        );
      },

      stopAllTracking(caller: string): void {
        const callerTracking = store._callerTracking();
        const trackedPaths = callerTracking[caller];

        if (!trackedPaths) return;

        Array.from(trackedPaths).forEach((path) => stopTracking(caller, path));
      },
    };
  }),
  withHooks(({ _setOnChanges, _activatedRoute, _logger }) => ({
    onInit() {
      _setOnChanges(_activatedRoute.queryParams);
      _logger.debug(TAG, 'Initialized');
    },
  }))
);
