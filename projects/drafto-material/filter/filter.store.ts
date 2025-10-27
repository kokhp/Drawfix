import { NGXLogger } from 'ngx-logger';
import { computed, inject } from '@angular/core';
import { Validators } from '@angular/forms';
import { toObservable } from '@angular/core/rxjs-interop';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import {
  catchError,
  filter,
  forkJoin,
  map,
  Observable,
  of,
  pipe,
  switchMap,
  take,
  tap,
  throwError,
} from 'rxjs';
import {
  patchState,
  signalStore,
  withComputed,
  withHooks,
  withMethods,
  withProps,
  withState,
} from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { CommonService } from '@drafto/core';
import { getFilterOptions } from './options/options.util';
import { DftFilterCompareTypeLabels } from './filter.constants';
import {
  DftFilterApplyModel,
  DftFilterCompareType,
  DftFilterItem,
} from './filter.model';
import {
  isFilterAvailable,
  isFilterDisabled,
  getFiltersToClearOnParentChange,
  buildDependencyTree,
  processMutualExclusivity,
  buildDependencyContext,
} from './filter.util';

type FilterState = {
  _searchTerm: string;
  id: string;
  isBusy: boolean;
  initialized: boolean;
  enableQueryParam: boolean;
  queryParamName: string;
  filterList: DftFilterItem[];
  errors: string | null;
};

let nextUniqueId = 0;

const initialState: FilterState = {
  _searchTerm: '',
  id: `dft-mat-filter-${nextUniqueId++}`,
  isBusy: false,
  initialized: false,
  enableQueryParam: false,
  queryParamName: 'filter',
  filterList: [],
  errors: null,
};

const TAG = '[DftFilterStore]:';

export const DftFilterStore = signalStore(
  withState(initialState),
  withProps((store) => ({
    _logger: inject(NGXLogger),
    onInitChanges$: toObservable(store.initialized),
  })),
  withComputed(({ filterList, _searchTerm, id, _logger }) => ({
    appliedFilters: computed(() => {
      const appliedList = filterList()
        .filter((x) => !x.hidden && x.applied)
        .sort(
          (a, b) =>
            (a.appliedOrder ?? Infinity) - (b.appliedOrder ?? Infinity) ||
            a.label.localeCompare(b.label)
        );
      _logger.debug(TAG, id(), 'AppliedFilters', appliedList);
      return appliedList;
    }),
    availableFilters: computed(() => {
      const filters = filterList();
      const availableWithDeps = filters
        .filter((x) => !x.hidden && !x.applied && isFilterAvailable(x, filters))
        .map((x) => ({
          ...x,
          disabled: isFilterDisabled(x, filters),
        }))
        .sort((a, b) => {
          // Sort by dependency level first, then by label
          const levelDiff = (a.dependencyLevel || 0) - (b.dependencyLevel || 0);
          return levelDiff !== 0 ? levelDiff : a.label.localeCompare(b.label);
        });

      if (_searchTerm().length > 0) {
        const term = _searchTerm().toLowerCase();
        return availableWithDeps
          .filter(
            (x) => x.stickySearch || x.label.toLowerCase().startsWith(term)
          )
          .sort((a, b) => {
            if (a.stickySearch && !b.stickySearch) return -1;
            if (!a.stickySearch && b.stickySearch) return 1;
            return a.label.localeCompare(b.label);
          });
      }
      _logger.debug(TAG, id(), 'Filters', availableWithDeps);
      return availableWithDeps;
    }),
    dividerIndex: computed<number | null>(() => {
      const hasSticky = filterList().some((x) => x.stickySearch);
      if (hasSticky && _searchTerm().length > 0)
        return filterList().findIndex((x) => !x.stickySearch);
      return null;
    }),
  })),
  withMethods(
    (
      store,
      router = inject(Router),
      activateRoute = inject(ActivatedRoute),
      common = inject(CommonService)
    ) => {
      const getQueryModels = () => {
        let queryModels: DftFilterApplyModel[] = [];
        if (store.enableQueryParam()) {
          const param = activateRoute.snapshot.queryParamMap.get(
            store.queryParamName()
          );
          queryModels = common.tryParseJson<DftFilterApplyModel[]>(param) || [];
          store._logger.debug(TAG, store.id(), 'Query', queryModels);
        }
        return queryModels;
      };

      return {
        syncId: rxMethod<string>(tap((id) => patchState(store, { id }))),
        syncEnableQueryParam: rxMethod<boolean>(
          tap((enabled) => patchState(store, { enableQueryParam: enabled }))
        ),
        syncFilters: rxMethod<DftFilterItem[]>(
          pipe(
            tap(() => {
              patchState(store, {
                initialized: false,
                errors: null,
                filterList: [],
              });
              store._logger.debug(TAG, store.id(), 'ListInit');
            }),
            switchMap((filters) => {
              if (router.currentNavigation()) {
                store._logger.debug(TAG, store.id(), "Waiting for navigation end");
                return router.events.pipe(
                  filter((event) => event instanceof NavigationEnd),
                  take(1),
                  map(() => ({ filters, queryModels: getQueryModels() }))
                );
              }
              return of({ filters, queryModels: getQueryModels() });
            }),
            switchMap(({ filters, queryModels }) => {
              const optionsObservables: Observable<DftFilterItem>[] = [];

              // Build dependency tree first to get correct processing order
              const filtersWithDependencies = buildDependencyTree(filters);

              // Sort filters by dependency level (parents first)
              const sortedFilters = [...filtersWithDependencies].sort((a, b) => {
                const levelDiff = (a.dependencyLevel || 0) - (b.dependencyLevel || 0);
                return levelDiff || a.name.localeCompare(b.name);
              });

              const updatedfilters: DftFilterItem[] = [];
              for (const it of sortedFilters) {
                if (it.type == 'none' && !it.value) {
                  const message =
                    "Please provide value for 'None' type filter.";
                  return throwError(() => new Error(message));
                } else if (it.type == 'options') {
                  if (it.isDynamicOptions && !it.getOptions) {
                    const message = 'No obserable defined for dynamic options.';
                    return throwError(() => new Error(message));
                  } else if (!it.isDynamicOptions && !it.options) {
                    const message = 'No options found for non dynamic options.';
                    return throwError(() => new Error(message));
                  }
                } else if (it.type == 'compare' && !it.options) {
                  const message = 'No compare options found.';
                  return throwError(() => new Error(message));
                }

                it.headerLabel = it.headerLabel || it.label;
                it.tagLabel = (it.tagLabel || it.label).replace(/:$/, '');

                let appliedValue = queryModels.reduce(
                  (val, x) =>
                    x.name.toLowerCase() === it.name.toLowerCase()
                      ? x.value
                      : val,
                  it.applied ? it.value : null
                );

                store._logger.debug(TAG, store.id(), "AppliedValue", {
                  filter: it,
                  appliedValue,
                  queryModels
                });

                switch (it.type) {
                  case 'none':
                    if (appliedValue) it.applied = true;
                    break;

                  case 'text':
                    it.inputLabel = it.inputLabel || 'contains';
                    it.validators = it.validators || [Validators.required];
                    if (appliedValue) {
                      it.value = appliedValue;
                      it.applied = true;
                    }
                    break;

                  case 'options':
                    const selectedValues = [].concat(appliedValue || []);
                    if (selectedValues.length === 0) break;

                    // Build dependency context using already processed filters
                    const dependencyContext = buildDependencyContext(it, updatedfilters);
                    optionsObservables.push(
                      getFilterOptions(it, {
                        pageIndex: 1,
                        values: selectedValues,
                        dependencyContext,
                      }).pipe(
                        take(1),
                        map((options) => {
                          it.options = options;
                          const filteredValues = selectedValues.filter((x) =>
                            options.some((option) => option.value === x)
                          );

                          it.value =
                            filteredValues.length > 1
                              ? filteredValues
                              : filteredValues[0] ?? null;
                          if (it.value) it.applied = true;
                          store._logger.debug(TAG, store.id(), 'Options', {
                            _filter: it,
                            selectedValues,
                          });
                          return it;
                        })
                      )
                    );
                    break;

                  case 'compare':
                    it.options?.forEach((x) => {
                      const compareType = x.value as DftFilterCompareType;
                      x.label ||= DftFilterCompareTypeLabels[compareType];
                      x.tagLabel ||= x.label;
                    });
                    if (appliedValue) {
                      it.value = appliedValue;
                      it.applied = true;
                    }
                    break;
                }
                updatedfilters.push(it);
              }

              return optionsObservables.length > 0
                ? forkJoin(optionsObservables).pipe(map(() => updatedfilters))
                : of(updatedfilters);
            }),
            tap((processedFilters) => {
              let maxAppliedOrder = 1;
              processedFilters
                .filter((x) => x.applied)
                .forEach((it) => {
                  if (it.appliedOrder) {
                    maxAppliedOrder = Math.max(
                      maxAppliedOrder,
                      it.appliedOrder + 1
                    );
                  }
                  it.appliedOrder = maxAppliedOrder++;
                });

              patchState(store, {
                filterList: processedFilters,
                initialized: true,
              });
            }),
            catchError((err) => {
              const message =
                err instanceof Error
                  ? `Filter initialization failed: ${err.message}`
                  : 'An unexpected error occurred while initializing filters. Please try again.';
              patchState(store, { errors: message, initialized: true });
              store._logger.error(message, TAG, store.id(), err);
              return of([]);
            })
          )
        ),
        syncSearchTerm: rxMethod<string>(
          tap((term) => patchState(store, { _searchTerm: term }))
        ),
        getApplyModels(flt?: DftFilterItem): DftFilterApplyModel[] {
          if (flt) {
            const currentFilters = store.filterList();
            let updatedFilters = currentFilters.map((x) =>
              x.name.toLowerCase() === flt.name.toLowerCase()
                ? { ...flt, applied: true, appliedOrder: Date.now() }
                : x
            );

            // Handle mutual exclusivity first
            const appliedFilter = updatedFilters.find(
              (x) => x.name.toLowerCase() === flt.name.toLowerCase()
            );
            if (appliedFilter) {
              updatedFilters = processMutualExclusivity(appliedFilter, updatedFilters);
            }

            // Handle dependency cascading internally when a filter is applied
            const dependentFilterNames = getFiltersToClearOnParentChange(
              flt,
              updatedFilters
            );
            if (dependentFilterNames.length > 0) {
              updatedFilters = updatedFilters.map((x) =>
                dependentFilterNames.includes(x.name)
                  ? { ...x, applied: false, value: null, appliedOrder: 0 }
                  : x
              );
            }

            patchState(store, { filterList: updatedFilters });
          }

          return store
            .filterList()
            .reduce<DftFilterApplyModel[]>((acc, { applied, name, value }) => {
              if (applied) acc.push({ name, value });
              return acc;
            }, []);
        },
        clearFilter(fltItem?: DftFilterItem): void {
          let filters: DftFilterItem[];
          if (fltItem) {
            const currentFilters = store.filterList();
            filters = currentFilters.map((x) =>
              x.name.toLowerCase() === fltItem.name.toLowerCase()
                ? { ...x, applied: false, value: null, appliedOrder: 0 }
                : x
            );

            // Handle dependency cascading internally - clear dependent filters
            const dependentFilterNames = getFiltersToClearOnParentChange(
              fltItem,
              filters
            );
            if (dependentFilterNames.length > 0) {
              filters = filters.map((x) =>
                dependentFilterNames.includes(x.name)
                  ? { ...x, applied: false, value: null, appliedOrder: 0 }
                  : x
              );
            }
          } else {
            filters = store.filterList().map((x) => ({
              ...x,
              applied: false,
              value: null,
              appliedOrder: 0,
            }));
          }

          store._logger.debug(TAG, store.id(), 'RemoveFilter', {
            item: fltItem,
            filters,
          });
          patchState(store, { filterList: filters });
        },
        stringifyQuery(value: any) {
          return common.tryStringifyJson(value);
        },
      };
    }
  ),
  withHooks(({ _logger, id }) => ({
    onInit() {
      _logger.debug(TAG, 'Initialized', id());
    },
  }))
);
