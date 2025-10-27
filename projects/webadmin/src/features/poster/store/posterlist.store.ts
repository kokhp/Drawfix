import { inject } from "@angular/core";
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
import { toUnixStartOfDay, toUnixEndOfDay, CommonService, ApiError, normalizeText } from "@drafto/core";
import { HttpService } from "@drafto/core/http";
import {
  DftFilterApplyModel,
  DftFilterItem,
  DftFilterOption,
  DftFilterOptionFilter,
} from "@drafto/material/filter";
import { rxMethod } from "@ngrx/signals/rxjs-interop";
import { catchError, EMPTY, finalize, map, Observable, of, pipe, switchMap, tap, throwError } from "rxjs";
import { POSTER_LIST_FILTERS } from "../constants/posterlist.constant";

import { ListItemModel, ListRequestModel, ListResponse } from "../models/posterlist.model";
import { MainLayoutStore } from "projects/webadmin/src/store/main-layout.store";
import { ListItemModel as CategoryListItemModel } from "../../category/models/common.model";
import { ListItemModel as LanguageListItemModel } from "../../language/models/common.model";
import { ListItemModel as PartyListItemModel } from "../../party/models/common.model";
import { ListItemModel as StateListItemModel } from "../../countrystate/models/common.model";

type PosterListState = {
  initialized: boolean;
  _nextPageToken: string | null;

  isBusy: boolean;
  filterList: DftFilterItem[];
  posters: ListItemModel[];
  appliedFilters: DftFilterApplyModel[];
  apiError: string | null;
  allPostersLoaded: boolean;

  _filterCategoryOptions: DftFilterOption[] | null;
  _filterLanguageOptions: DftFilterOption[] | null;
  _filterPartyOptions: DftFilterOption[] | null;
  _filterStateOptions: DftFilterOption[] | null;
};
const initialState: PosterListState = {
  initialized: false,
  _nextPageToken: null,
  isBusy: false,
  filterList: [],
  posters: [],
  appliedFilters: [],
  apiError: null,
  allPostersLoaded: false,

  _filterCategoryOptions: null,
  _filterLanguageOptions: null,
  _filterPartyOptions: null,
  _filterStateOptions: null,
};
const TAG = "[PosterListStore]:";

export const PosterListStore = signalStore(
  { providedIn: "root" },
  withState(initialState),
  withProps(() => {
    return {
      _logger: inject(NGXLogger),
      _http: inject(HttpService),
    };
  }),
  withComputed((store) => {
    return {};
  }),
  withMethods(({ _logger, _http, ...store }) => {
    const _common = inject(CommonService);
    const _layoutStore = inject(MainLayoutStore);

    const getPostersFromApi = () => {
      _layoutStore.setTopnavProgress(true);
      const appliedFilters = store.appliedFilters();
      const nextPageToken = store._nextPageToken();
      const requestBody: ListRequestModel = {
        maxResults: 50,
      };

      if (nextPageToken) {
        requestBody.pageToken = nextPageToken;
      }

      _logger.debug(TAG, "AppliedFilters:", appliedFilters);
      appliedFilters.forEach((flt) => {
        if (!flt.value) return;

        switch (flt.name) {
          case POSTER_LIST_FILTERS.category.name:
            requestBody.categoryId = flt.value as string;
            break;
          case POSTER_LIST_FILTERS.languages.name:
            requestBody.languageIds = Array.isArray(flt.value) ? flt.value : [flt.value].filter(Boolean);
            break;
          case POSTER_LIST_FILTERS.posterType.name:
            requestBody.posterType = flt.value as string;
            break;
          case POSTER_LIST_FILTERS.status.name:
            requestBody.active = flt.value === "ACTIVE";
            break;
          case POSTER_LIST_FILTERS.publishedAt.name:
            const pubAt = flt.value.value;
            if (Array.isArray(pubAt) && pubAt.length > 0) {
              const fromDate = pubAt[0];
              const toDate = pubAt.length > 1 ? pubAt[1] : pubAt[0];

              requestBody.publishedFrom = toUnixStartOfDay(fromDate);
              requestBody.publisheTo = toUnixEndOfDay(toDate);
            } else {
              requestBody.publishedFrom = toUnixStartOfDay(pubAt);
              requestBody.publisheTo = toUnixEndOfDay(pubAt);
            }
            break;
          case POSTER_LIST_FILTERS.createdAt.name:
            const createdAt = flt.value.value;
            if (Array.isArray(createdAt) && createdAt.length > 0) {
              const fromDate = createdAt[0];
              const toDate = createdAt.length > 1 ? createdAt[1] : createdAt[0];

              requestBody.createdFrom = toUnixStartOfDay(fromDate);
              requestBody.createdTo = toUnixEndOfDay(toDate);
            } else {
              requestBody.createdFrom = toUnixStartOfDay(createdAt);
              requestBody.createdTo = toUnixEndOfDay(createdAt);
            }
            break;
          case POSTER_LIST_FILTERS.party.name:
            requestBody.partyId = flt.value as string;
            break;
          case POSTER_LIST_FILTERS.partyState.name:
            requestBody.stateId = flt.value as string;
            break;
        }
      });

      return _http.post<ListResponse>("/posters/paginated", requestBody).pipe(
        catchError((error) => {
          let apiError = "An error occurred while fetching posters.";
          if (error instanceof ApiError) {
            const errorMessages: Record<number, string> = {
              400: "Bad request. Please check your filter parameters.",
              422: "Invalid filter parameters. Please adjust your filters and try again.",
              500: "Server error. Please try again later.",
            };
            apiError = errorMessages[error.code] ?? apiError;
          }
          return throwError(() => apiError);
        }),
        finalize(() => _layoutStore.setTopnavProgress(false))
      );
    };

    return {
      loadPosters: rxMethod<{ refresh?: boolean; loadMore?: boolean }>(
        pipe(
          tap(() => patchState(store, { isBusy: true, apiError: null })),
          switchMap(({ refresh, loadMore }) => {
            // For refresh operations - always reload
            if (refresh) {
              _logger.debug(TAG, "Refreshing data");
              patchState(store, {
                posters: [],
                initialized: false,
                allPostersLoaded: false,
                _nextPageToken: null,
              });
            }
            // For load more operations
            else if (loadMore) {
              if (store.allPostersLoaded()) {
                _logger.debug(TAG, "All posters already loaded, skipping load more");
                patchState(store, { isBusy: false });
                return EMPTY;
              }
              _logger.debug(TAG, "Loading more data");
            }
            // If already initialized (data loaded for current filters), skip loading
            else if (store.initialized()) {
              _logger.debug(
                TAG,
                "Data already loaded for current filters, skipping load. Posters count:",
                store.posters().length
              );
              patchState(store, { isBusy: false });
              return EMPTY;
            }

            // If we reach here, we need to load data
            _logger.debug(TAG, "Loading data from API");

            return getPostersFromApi().pipe(
              tap((response) => {
                const currentPosters = store.posters();
                const nextPageToken = response.pageInfo.nextPageToken || null;
                const posters = store.initialized()
                  ? [...currentPosters, ...response.items]
                  : [...response.items];

                patchState(store, {
                  posters: posters,
                  initialized: true,
                  allPostersLoaded: nextPageToken === null,
                  _nextPageToken: nextPageToken,
                });
              }),
              catchError((error) => {
                patchState(store, { apiError: error });
                return EMPTY;
              }),
              finalize(() => patchState(store, { isBusy: false }))
            );
          })
        )
      ),
      setAppliedFilters(filters: DftFilterApplyModel[]) {
        const oldFiltersJson = _common.tryStringifyJson(store.appliedFilters());
        const filtersJson = _common.tryStringifyJson(filters);
        if (oldFiltersJson === filtersJson && store.initialized()) {
          _logger.debug(TAG, "Filters unchanged and already initialized, keeping existing data");
          return;
        }

        // If filters changed, reset store and update applied filters
        _logger.debug(TAG, "Filters changed, resetting store for new data");
        patchState(store, {
          posters: [],
          initialized: false,
          appliedFilters: [...filters],
          allPostersLoaded: false,
          _nextPageToken: null,
        });
      },
    };
  }),
  withHooks(({ _logger, _http, ...store }) => {
    const getFilterCategoryOptions = (optFlt: DftFilterOptionFilter): Observable<DftFilterOption[]> => {
      _logger.debug(TAG, "Loading category filter options", optFlt);
      const cacheOptions = store._filterCategoryOptions();
      const source$ = cacheOptions
        ? of(cacheOptions)
        : _http.get<CategoryListItemModel[]>("/categories/list").pipe(
            map((res) =>
              res
                .sort((a, b) => Number(b.isActive) - Number(a.isActive))
                .map(
                  (cat) =>
                    ({
                      label: cat.title,
                      value: cat.id,
                      extras: { isActive: cat.isActive },
                    } as DftFilterOption)
                )
            ),
            tap((options) => patchState(store, { _filterCategoryOptions: options })),
            catchError((error) => {
              _logger.error(TAG, "Failed to load categories for filter", error);
              return throwError(() => "Failed to load categories");
            })
          );

      return source$.pipe(
        map((options) => {
          if (optFlt.searchTerm) {
            const term = normalizeText(optFlt.searchTerm);
            return options.filter((o) => normalizeText(o.label || "").includes(term));
          }
          if (optFlt.values?.length) {
            return options.filter((o) => optFlt.values?.includes(o.value));
          }
          return options;
        })
      );
    };

    const getFilterLanguageOptions = (optFlt: DftFilterOptionFilter): Observable<DftFilterOption[]> => {
      _logger.debug(TAG, "Loading language filter options", optFlt);
      const cacheOptions = store._filterLanguageOptions();
      const source$ = cacheOptions
        ? of(cacheOptions)
        : _http.get<LanguageListItemModel[]>("/languages/list").pipe(
            map((res) =>
              res.map(
                (lan) =>
                  ({
                    label: lan.name,
                    value: lan.id,
                    extras: { isActive: lan.isActive, altName: lan.altName, iconText: lan.iconText },
                  } as DftFilterOption)
              )
            ),
            tap((options) => patchState(store, { _filterLanguageOptions: options })),
            catchError((error) => {
              _logger.error(TAG, "Failed to load languages for filter", error);
              return throwError(() => "Failed to load languages");
            })
          );

      return source$.pipe(
        map((options) => {
          if (optFlt.searchTerm) {
            const term = normalizeText(optFlt.searchTerm);
            return options.filter((o) => normalizeText(o.label || "").includes(term));
          }
          if (optFlt.values?.length) {
            return options.filter((o) => optFlt.values?.includes(o.value));
          }
          return options;
        })
      );
    };

    const getFilterPartyOptions = (optFlt: DftFilterOptionFilter): Observable<DftFilterOption[]> => {
      _logger.debug(TAG, "Loading party filter options", optFlt);
      const cacheOptions = store._filterPartyOptions();
      const source$ = cacheOptions
        ? of(cacheOptions)
        : _http.get<PartyListItemModel[]>("/parties/list").pipe(
            map((res) => {
              const options: DftFilterOption[] = [];
              for (const party of res) {
                options.push({
                  label: party.name,
                  value: party.id,
                  extras: {
                    isActive: party.isActive,
                    shortName: party.shortName,
                    logoUrl: party.logoUrl,
                    stateIds: party.stateIds,
                  },
                });
              }
              return options;
            }),
            tap((options) => patchState(store, { _filterPartyOptions: options })),
            catchError((error) => {
              _logger.error(TAG, "Failed to load parties for filter", error);
              return throwError(() => "Failed to load parties");
            })
          );

      return source$.pipe(
        map((options) => {
          _logger.debug(TAG, "Total party options loaded:", options.length);
          if (optFlt.searchTerm) {
            const term = normalizeText(optFlt.searchTerm);
            return options.filter((o) => normalizeText(o.label || "").includes(term));
          }
          if (optFlt.values?.length) {
            return options.filter((o) => optFlt.values?.includes(o.value));
          }
          return options;
        })
      );
    };

    const getFilterStateOptions = (optFlt: DftFilterOptionFilter): Observable<DftFilterOption[]> => {
      _logger.debug(TAG, "Loading state filter options", optFlt);

      if (!optFlt.dependencyContext || !optFlt.dependencyContext[POSTER_LIST_FILTERS.party.name]) {
        const message = "No party selected, returning empty state options";
        _logger.debug(TAG, message);
        return throwError(() => message);
      }

      // Load state options (cache first)
      const cacheOptions = store._filterStateOptions();
      const source$ = cacheOptions
        ? of(cacheOptions)
        : _http.get<StateListItemModel[]>("/states/list").pipe(
            map((res) => {
              const options: DftFilterOption[] = [];
              for (const cs of res) {
                options.push({
                  label: cs.name,
                  value: cs.id,
                  extras: {
                    code: cs.code,
                    isMain: cs.isMain,
                    isActive: cs.isActive,
                  },
                });
              }
              return options;
            }),
            tap((options) => patchState(store, { _filterStateOptions: options })),
            catchError((error) => {
              _logger.error(TAG, "Failed to load states for filter", error);
              return throwError(() => "Failed to load states");
            })
          );

      const partyId = optFlt.dependencyContext[POSTER_LIST_FILTERS.party.name];

      return getFilterPartyOptions({ values: [partyId] }).pipe(
        switchMap((partyOptions) => {
          if (partyOptions.length === 0 || !partyOptions[0].extras?.["stateIds"]) {
            return throwError(() => "No party selected, returning empty state options");
          }

          const stateIds = partyOptions[0].extras["stateIds"] as string[];
          if (stateIds.length === 0) {
            return throwError(() => "No states for selected party, returning empty state options");
          }

          return source$.pipe(
            map((options) => {
              let filtered = options.filter((o) => stateIds.includes(o.value as string));

              // Apply searchTerm filter
              if (optFlt.searchTerm) {
                const term = normalizeText(optFlt.searchTerm);
                filtered = filtered.filter((o) => normalizeText(o.label || "").includes(term));
              }

              // Apply selected values filter
              if (optFlt.values?.length) {
                filtered = filtered.filter((o) => optFlt.values?.includes(o.value));
              }

              return filtered;
            })
          );
        })
      );
    };

    const loadFilters = () => {
      const filters = Object.values(POSTER_LIST_FILTERS).map((f) => {
        const flt = { ...f };
        switch (f.name) {
          case POSTER_LIST_FILTERS.category.name:
            flt.options = [];
            flt.isDynamicOptions = true;
            flt.getOptions = getFilterCategoryOptions;
            break;

          case POSTER_LIST_FILTERS.languages.name:
            flt.options = [];
            flt.isDynamicOptions = true;
            flt.getOptions = getFilterLanguageOptions;
            break;

          case POSTER_LIST_FILTERS.party.name:
            flt.options = [];
            flt.isDynamicOptions = true;
            flt.getOptions = getFilterPartyOptions;
            break;

          case POSTER_LIST_FILTERS.partyState.name:
            flt.options = [];
            flt.isDynamicOptions = true;
            flt.getOptions = getFilterStateOptions;
            break;
        }
        return flt;
      });
      patchState(store, { filterList: filters });
    };

    return {
      onInit() {
        loadFilters();
        _logger.debug(TAG, "Initialized");
      },
    };
  })
);
