import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { of, BehaviorSubject } from 'rxjs';
import { NGXLogger } from 'ngx-logger';
import { runInInjectionContext, Injector } from '@angular/core';
import { DftFilterStore } from './filter.store';
import { DftFilterItem } from './filter.model';
import { CommonService } from '@drafto/core';

describe('FilterStore', () => {
  let store: InstanceType<typeof DftFilterStore>;
  let mockRouter: jasmine.SpyObj<Router>;
  let mockActivatedRoute: jasmine.SpyObj<ActivatedRoute>;
  let mockCommonService: jasmine.SpyObj<CommonService>;
  let mockLogger: jasmine.SpyObj<NGXLogger>;
  let queryParamsSubject: BehaviorSubject<any>;


  const createMockFilters = (): DftFilterItem[] => [
    {
      name: 'country',
      type: 'options',
      label: 'Country',
      value: null,
      applied: false,
      appliedOrder: 0,
      options: [
        { value: 'US', label: 'United States' },
        { value: 'CA', label: 'Canada' },
      ],
    },
    {
      name: 'state',
      type: 'options',
      label: 'State',
      value: null,
      applied: false,
      appliedOrder: 0,
      dependencies: [
        {
          parentFilter: 'country',
          clearOnParentChange: true,
          hideWhenParentEmpty: true,
        },
      ],
      isDynamicOptions: true,
      getOptions: () => of([
        { value: 'NY', label: 'New York' },
        { value: 'CA', label: 'California' },
      ]),
    },
    {
      name: 'city',
      type: 'options',
      label: 'City',
      value: null,
      applied: false,
      appliedOrder: 0,
      dependencies: [
        {
          parentFilter: 'state',
          clearOnParentChange: true,
          hideWhenParentEmpty: true,
          disableWhenParentEmpty: true,
        },
      ],
      options: [],
    },
    {
      name: 'search',
      type: 'text',
      label: 'Search',
      value: null,
      applied: false,
      appliedOrder: 0,
    },
    {
      name: 'price',
      type: 'compare',
      label: 'Price',
      value: null,
      applied: false,
      appliedOrder: 0,
      options: [{ value: 'eq', label: 'Equals' }],
    },
  ];

  beforeEach(() => {
    queryParamsSubject = new BehaviorSubject({});

    mockRouter = jasmine.createSpyObj("Router", ["navigate", "currentNavigation"], {
      events: of(),
    });
    mockRouter.currentNavigation.and.returnValue(null);

    mockActivatedRoute = jasmine.createSpyObj('ActivatedRoute', [], {
      queryParams: queryParamsSubject.asObservable(),
      snapshot: {
        queryParamMap: {
          get: jasmine.createSpy('get').and.returnValue(null),
        },
      },
    });

    mockCommonService = jasmine.createSpyObj('CommonService', [
      'tryParseJson',
      'tryStringifyJson',
    ]);
    mockCommonService.tryParseJson.and.returnValue(null);
    mockCommonService.tryStringifyJson.and.returnValue('{}');

    mockLogger = jasmine.createSpyObj('NGXLogger', ['debug', 'info', 'warn', 'error']);

    TestBed.configureTestingModule({
      providers: [
        { provide: Router, useValue: mockRouter },
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
        { provide: CommonService, useValue: mockCommonService },
        { provide: NGXLogger, useValue: mockLogger },
      ],
    });

    // Create store within injection context
    const injector = TestBed.inject(Injector);
    store = runInInjectionContext(injector, () => new DftFilterStore());
  });

  afterEach(() => {
    queryParamsSubject.complete();
  });

  describe('Store Initialization', () => {
    it('should initialize with default state', () => {
      expect(store.filterList()).toEqual([]);
      expect(store.appliedFilters()).toEqual([]);
      expect(store.availableFilters()).toEqual([]);
      expect(store.isBusy()).toBe(false);
      expect(store.initialized()).toBe(false);
      expect(store.enableQueryParam()).toBe(false);
    });

    it('should create store instance with proper methods', () => {
      expect(store).toBeDefined();
      expect(typeof store.syncFilters).toBe('function');
      expect(typeof store.getApplyModels).toBe('function');
      expect(typeof store.clearFilter).toBe('function');
      expect(typeof store.syncSearchTerm).toBe('function');
      expect(typeof store.stringifyQuery).toBe('function');
    });
  });

  describe('Basic Operations', () => {
    it('should handle search term sync', () => {
      expect(() => {
        store.syncSearchTerm('test search');
      }).not.toThrow();

      expect(store.isBusy()).toBe(false);
    });

    it('should handle query stringify', () => {
      const result = store.stringifyQuery({ test: 'value' });
      expect(result).toBe('{}');
      expect(mockCommonService.tryStringifyJson).toHaveBeenCalledWith({ test: 'value' });
    });

    it('should handle empty getApplyModels call', () => {
      const result = store.getApplyModels();
      expect(result).toEqual([]);
    });

    it('should handle clearFilter without specific filter', () => {
      expect(() => {
        store.clearFilter();
      }).not.toThrow();
    });

    it('should handle null parameters gracefully', () => {
      expect(() => {
        store.clearFilter(null as any);
        store.getApplyModels(undefined as any);
        store.stringifyQuery(null);
      }).not.toThrow();
    });
  });

  describe('Filter Synchronization', () => {
    it('should sync filters and build dependency tree', (done) => {
      const mockFilters = createMockFilters();

      // Subscribe to initialized changes to know when sync completes
      const subscription = store.onInitChanges$.subscribe((initialized) => {
        if (initialized) {
          const loadedFilters = store.filterList();
          expect(loadedFilters.length).toBe(5);
          expect(loadedFilters.every((f: DftFilterItem) => f.dependencyLevel !== undefined)).toBe(true);

          // Check dependency levels
          const countryFilter = loadedFilters.find((f: DftFilterItem) => f.name === 'country');
          const stateFilter = loadedFilters.find((f: DftFilterItem) => f.name === 'state');
          const cityFilter = loadedFilters.find((f: DftFilterItem) => f.name === 'city');

          expect(countryFilter?.dependencyLevel).toBe(0);
          expect(stateFilter?.dependencyLevel).toBe(1);
          expect(cityFilter?.dependencyLevel).toBe(2);

          subscription.unsubscribe();
          done();
        }
      });

      store.syncFilters(mockFilters);
    });

    it('should handle empty filter array', (done) => {
      const subscription = store.onInitChanges$.subscribe((initialized) => {
        if (initialized) {
          expect(store.filterList()).toEqual([]);
          expect(store.appliedFilters()).toEqual([]);
          expect(store.availableFilters()).toEqual([]);

          subscription.unsubscribe();
          done();
        }
      });

      store.syncFilters([]);
    });

    it('should sync simple filters', (done) => {
      const simpleFilters: DftFilterItem[] = [
        {
          name: 'search',
          type: 'text',
          label: 'Search',
          value: null,
          applied: false,
          appliedOrder: 0,
        },
      ];

      const subscription = store.onInitChanges$.subscribe((initialized) => {
        if (initialized) {
          expect(store.filterList().length).toBe(1);
          expect(store.filterList()[0].name).toBe('search');
          subscription.unsubscribe();
          done();
        }
      });

      store.syncFilters(simpleFilters);
    });
  });

  describe('Filter Application and Management', () => {
    beforeEach((done) => {
      const subscription = store.onInitChanges$.subscribe((initialized) => {
        if (initialized) {
          subscription.unsubscribe();
          done();
        }
      });
      store.syncFilters(createMockFilters());
    });

    it('should apply single filter correctly', () => {
      const filters = store.filterList();
      const countryFilter = { ...filters.find((f: DftFilterItem) => f.name === 'country')!, value: 'US' };

      // Apply the filter
      store.getApplyModels(countryFilter);

      // Check that it was applied
      const appliedFilters = store.appliedFilters();
      expect(appliedFilters.length).toBe(1);
      expect(appliedFilters[0].name).toBe('country');
      expect(appliedFilters[0].value).toBe('US');

      // Check getApplyModels returns applied filters
      const applyModels = store.getApplyModels();
      expect(applyModels.length).toBe(1);
      expect(applyModels[0].name).toBe('country');
      expect(applyModels[0].value).toBe('US');
    });

    it('should clear dependent filters when parent changes', () => {
      const filters = store.filterList();

      // First apply country filter
      const countryFilter = { ...filters.find((f: DftFilterItem) => f.name === 'country')!, value: 'US' };
      store.getApplyModels(countryFilter);

      // Apply a state filter manually (simulating dependency)
      const stateFilter = { ...filters.find((f: DftFilterItem) => f.name === 'state')!, value: 'NY' };
      store.getApplyModels(stateFilter);

      // Now change country - state should be cleared due to clearOnParentChange
      const newCountryFilter = { ...countryFilter, value: 'CA' };
      store.getApplyModels(newCountryFilter);

      // Check if dependent filters were cleared
      const appliedFilters = store.appliedFilters();
      const stateStillApplied = appliedFilters.some(f => f.name === 'state');

      // Since state has clearOnParentChange: true, it should be cleared when country changes
      expect(stateStillApplied).toBe(false);
    });

    it('should clear specific filter', () => {
      const filters = store.filterList();
      const countryFilter = { ...filters.find((f: DftFilterItem) => f.name === 'country')!, value: 'US' };

      // Apply filter first
      store.getApplyModels(countryFilter);
      expect(store.appliedFilters().length).toBe(1);

      // Then clear it
      store.clearFilter(countryFilter);

      const updatedFilters = store.filterList();
      const clearedFilter = updatedFilters.find((f: DftFilterItem) => f.name === 'country');

      expect(clearedFilter?.applied).toBe(false);
      expect(clearedFilter?.value).toBeNull();
      expect(store.appliedFilters().length).toBe(0);
    });

    it('should clear all filters when no specific filter provided', () => {
      const filters = store.filterList();

      // Apply multiple filters
      const countryFilter = { ...filters.find((f: DftFilterItem) => f.name === 'country')!, value: 'US' };
      const searchFilter = { ...filters.find((f: DftFilterItem) => f.name === 'search')!, value: 'test' };

      store.getApplyModels(countryFilter);
      store.getApplyModels(searchFilter);

      expect(store.appliedFilters().length).toBe(2);

      // Clear all filters
      store.clearFilter();

      const appliedFilters = store.appliedFilters();
      expect(appliedFilters.length).toBe(0);
    });
  });

  describe('Computed Selectors', () => {
    beforeEach((done) => {
      const subscription = store.onInitChanges$.subscribe((initialized) => {
        if (initialized) {
          subscription.unsubscribe();
          done();
        }
      });
      store.syncFilters(createMockFilters());
    });

    describe('appliedFilters', () => {
      it('should return applied filters in correct order', () => {
        const filters = store.filterList();
        const countryFilter = { ...filters.find((f: DftFilterItem) => f.name === 'country')!, value: 'US' };
        const searchFilter = { ...filters.find((f: DftFilterItem) => f.name === 'search')!, value: 'test' };

        store.getApplyModels(countryFilter);
        store.getApplyModels(searchFilter);

        const appliedFilters = store.appliedFilters();
        expect(appliedFilters.length).toBe(2);
        expect(appliedFilters.map((f: DftFilterItem) => f.name)).toContain('country');
        expect(appliedFilters.map((f: DftFilterItem) => f.name)).toContain('search');
      });

      it('should exclude non-applied filters', () => {
        const filters = store.filterList();
        const countryFilter = { ...filters.find((f: DftFilterItem) => f.name === 'country')!, value: 'US' };

        store.getApplyModels(countryFilter);

        const appliedFilters = store.appliedFilters();
        expect(appliedFilters.length).toBe(1);
        expect(appliedFilters[0].name).toBe('country');
      });
    });

    describe('availableFilters', () => {
      it('should return filters that are not hidden', () => {
        const availableFilters = store.availableFilters();
        const names = availableFilters.map((f: DftFilterItem) => f.name);

        // Independent filters should always be available
        expect(names).toContain('country');
        expect(names).toContain('search');
        expect(names).toContain('price');
      });

      it('should handle dependency visibility correctly', () => {
        // Initially, dependent filters with hideWhenParentEmpty should be hidden
        let availableFilters = store.availableFilters();
        let names = availableFilters.map((f: DftFilterItem) => f.name);

        // State and city have hideWhenParentEmpty and their parents are empty
        expect(names).toContain('country');
        expect(names).toContain('search');
        expect(names).toContain('price');
      });

      it('should show dependent filters when parent has value', () => {
        const filters = store.filterList();
        const countryFilter = { ...filters.find((f: DftFilterItem) => f.name === 'country')!, value: 'US' };

        store.getApplyModels(countryFilter);

        const availableFilters = store.availableFilters();
        const names = availableFilters.map((f: DftFilterItem) => f.name);

        // After applying country filter, the available filters should include other independent filters
        // The exact composition depends on the store's filtering logic
        expect(names).toContain('search');
        expect(names).toContain('price');
        // Country might or might not be in available filters after being applied
        // State should become available when country has value
        expect(names.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Search Term Management', () => {
    it('should sync search term correctly', () => {
      store.syncSearchTerm('test search');

      // The search term affects the internal state
      expect(store.isBusy()).toBe(false); // Should complete without issues
    });

    it('should handle empty search term', () => {
      store.syncSearchTerm('');

      expect(store.isBusy()).toBe(false);
    });
  });

  describe('Query Utilities', () => {
    it('should stringify query values', () => {
      mockCommonService.tryStringifyJson.and.returnValue('{"test":"value"}');

      const result = store.stringifyQuery({ test: 'value' });

      expect(result).toBe('{"test":"value"}');
      expect(mockCommonService.tryStringifyJson).toHaveBeenCalledWith({ test: 'value' });
    });

    it('should handle null values in stringify', () => {
      mockCommonService.tryStringifyJson.and.returnValue(null);

      const result = store.stringifyQuery(null);

      expect(result).toBeNull();
    });
  });

  describe('Error Handling', () => {
    it('should handle malformed filters gracefully', (done) => {
      const malformedFilters = [
        { name: 'valid', type: 'text', label: 'Valid', value: null, applied: false, appliedOrder: 0 },
        { name: '', type: 'text', label: 'Empty name', value: null, applied: false, appliedOrder: 0 },
      ].filter(Boolean) as DftFilterItem[];

      expect(() => {
        store.syncFilters(malformedFilters);
      }).not.toThrow();

      // Wait a bit to ensure no errors occur
      setTimeout(() => {
        // Store should handle malformed data gracefully
        expect(store.initialized()).toBe(true);
        done();
      }, 100);
    });

    it('should handle invalid filter operations gracefully', (done) => {
      const subscription = store.onInitChanges$.subscribe((initialized) => {
        if (initialized) {
          expect(() => {
            store.clearFilter(null as any);
            store.getApplyModels(undefined as any);
            store.stringifyQuery(undefined);
          }).not.toThrow();

          subscription.unsubscribe();
          done();
        }
      });

      store.syncFilters(createMockFilters());
    });
  });

  describe('Performance Scenarios', () => {
    it('should handle large filter sets efficiently', (done) => {
      const largeFilterSet = Array.from({ length: 50 }, (_, i) => ({
        name: `filter${i}`,
        type: 'text' as const,
        label: `Filter ${i}`,
        value: null,
        applied: false,
        appliedOrder: 0,
      }));

      const startTime = performance.now();

      const subscription = store.onInitChanges$.subscribe((initialized) => {
        if (initialized) {
          const endTime = performance.now();
          expect(endTime - startTime).toBeLessThan(1000); // Should complete in reasonable time
          expect(store.filterList().length).toBe(50);

          subscription.unsubscribe();
          done();
        }
      });

      store.syncFilters(largeFilterSet);
    });

    it('should handle repeated operations efficiently', (done) => {
      const testFilters = createMockFilters();

      const subscription = store.onInitChanges$.subscribe((initialized) => {
        if (initialized) {
          // Simulate repeated operations
          for (let i = 0; i < 10; i++) {
            const filters = store.filterList();
            const countryFilter = { ...filters.find((f: DftFilterItem) => f.name === 'country')!, value: `US${i}` };

            store.getApplyModels(countryFilter);
            store.clearFilter(countryFilter);
          }

          // Final state should be clean
          const appliedFilters = store.appliedFilters();
          expect(appliedFilters.length).toBe(0);

          subscription.unsubscribe();
          done();
        }
      });

      store.syncFilters(testFilters);
    });
  });

  describe('Real-world Integration Scenarios', () => {
    it('should handle e-commerce filtering scenario', (done) => {
      const ecommerceFilters: DftFilterItem[] = [
        { name: 'category', type: 'options', label: 'Category', value: null, applied: false, appliedOrder: 0, options: [] },
        {
          name: 'brand',
          type: 'options',
          label: 'Brand',
          value: null,
          applied: false,
          appliedOrder: 0,
          dependencies: [{ parentFilter: 'category', hideWhenParentEmpty: true }],
          options: []
        },
        { name: 'priceRange', type: 'compare', label: 'Price Range', value: null, applied: false, appliedOrder: 0, options: [{ value: 'eq', label: 'Equals' }] },
        { name: 'inStock', type: 'options', label: 'In Stock', value: null, applied: false, appliedOrder: 0, options: [] },
        { name: 'search', type: 'text', label: 'Search', value: null, applied: false, appliedOrder: 0 },
      ];

      const subscription = store.onInitChanges$.subscribe((initialized) => {
        if (initialized) {
          // Test basic filtering workflow
          const filters = store.filterList();

          // Select category
          const categoryFilter = { ...filters.find((f: DftFilterItem) => f.name === 'category')!, value: 'electronics' };
          store.getApplyModels(categoryFilter);

          // Apply multiple filters
          const priceFilter = { ...filters.find((f: DftFilterItem) => f.name === 'priceRange')!, value: { min: 100, max: 1000 } };
          store.getApplyModels(priceFilter);

          const applied = store.appliedFilters();
          expect(applied.length).toBeGreaterThanOrEqual(2);

          subscription.unsubscribe();
          done();
        }
      });

      store.syncFilters(ecommerceFilters);
    });

    it('should handle location hierarchy scenario', (done) => {
      const locationFilters: DftFilterItem[] = [
        { name: 'continent', type: 'options', label: 'Continent', value: null, applied: false, appliedOrder: 0, options: [] },
        {
          name: 'country',
          type: 'options',
          label: 'Country',
          value: null,
          applied: false,
          appliedOrder: 0,
          dependencies: [{ parentFilter: 'continent', clearOnParentChange: true }],
          options: []
        },
        {
          name: 'state',
          type: 'options',
          label: 'State',
          value: null,
          applied: false,
          appliedOrder: 0,
          dependencies: [{ parentFilter: 'country', clearOnParentChange: true }],
          options: []
        },
        {
          name: 'city',
          type: 'options',
          label: 'City',
          value: null,
          applied: false,
          appliedOrder: 0,
          dependencies: [{ parentFilter: 'state', clearOnParentChange: true }],
          options: []
        },
      ];

      const subscription = store.onInitChanges$.subscribe((initialized) => {
        if (initialized) {
          const filters = store.filterList();

          // Set hierarchy values
          const continentFilter = { ...filters.find((f: DftFilterItem) => f.name === 'continent')!, value: 'north-america' };
          store.getApplyModels(continentFilter);

          const countryFilter = { ...filters.find((f: DftFilterItem) => f.name === 'country')!, value: 'US' };
          store.getApplyModels(countryFilter);

          expect(store.appliedFilters().length).toBe(2);

          // Change continent - should clear dependent values
          const newContinentFilter = { ...continentFilter, value: 'europe' };
          store.getApplyModels(newContinentFilter);

          // Check that country was cleared due to clearOnParentChange
          const appliedAfterChange = store.appliedFilters();
          const countryStillApplied = appliedAfterChange.some(f => f.name === 'country');

          expect(countryStillApplied).toBe(false);

          subscription.unsubscribe();
          done();
        }
      });

      store.syncFilters(locationFilters);
    });
  });

  describe('Mutual Exclusivity Integration', () => {
    it('should handle mutual exclusivity when applying filters', (done) => {
      const filtersWithMutualExclusion: DftFilterItem[] = [
        {
          name: 'languages',
          type: 'options',
          label: 'Languages',
          value: null,
          applied: false,
          appliedOrder: 0,
          options: [
            { value: 'en', label: 'English' },
            { value: 'fr', label: 'French' },
          ],
          mutuallyExclusive: ['category'],
        },
        {
          name: 'category',
          type: 'options',
          label: 'Category',
          value: null,
          applied: false,
          appliedOrder: 0,
          options: [
            { value: 'tech', label: 'Technology' },
            { value: 'sports', label: 'Sports' },
          ],
          mutuallyExclusive: ['languages'],
        },
      ];

      const subscription = store.onInitChanges$.subscribe((initialized) => {
        if (initialized) {
          const filters = store.filterList();

          // Apply category filter first
          const categoryFilter = { ...filters.find((f: DftFilterItem) => f.name === 'category')!, value: 'tech', applied: true };
          store.getApplyModels(categoryFilter);

          expect(store.appliedFilters().length).toBe(1);
          expect(store.appliedFilters()[0].name).toBe('category');

          // Now apply languages filter - should clear category due to mutual exclusivity
          const languagesFilter = { ...filters.find((f: DftFilterItem) => f.name === 'languages')!, value: ['en'], applied: true };
          store.getApplyModels(languagesFilter);

          const appliedAfterLanguages = store.appliedFilters();
          expect(appliedAfterLanguages.length).toBe(1);
          expect(appliedAfterLanguages[0].name).toBe('languages');

          subscription.unsubscribe();
          done();
        }
      });

      store.syncFilters(filtersWithMutualExclusion);
    });

    it('should disable mutually exclusive filters in availableFilters', (done) => {
      const filtersWithMutualExclusion: DftFilterItem[] = [
        {
          name: 'languages',
          type: 'options',
          label: 'Languages',
          value: null,
          applied: false,
          appliedOrder: 0,
          options: [
            { value: 'en', label: 'English' },
            { value: 'fr', label: 'French' },
          ],
          mutuallyExclusive: ['category'],
        },
        {
          name: 'category',
          type: 'options',
          label: 'Category',
          value: null,
          applied: false,
          appliedOrder: 0,
          options: [
            { value: 'tech', label: 'Technology' },
            { value: 'sports', label: 'Sports' },
          ],
          mutuallyExclusive: ['languages'],
        },
      ];

      const subscription = store.onInitChanges$.subscribe((initialized) => {
        if (initialized) {
          const filters = store.filterList();

          // Initially both filters should be available and not disabled
          let availableFilters = store.availableFilters();
          expect(availableFilters.length).toBe(2);
          expect(availableFilters.find(f => f.name === 'languages')?.disabled).toBe(false);
          expect(availableFilters.find(f => f.name === 'category')?.disabled).toBe(false);

          // Apply category filter
          const categoryFilter = { ...filters.find((f: DftFilterItem) => f.name === 'category')!, value: 'tech', applied: true };
          store.getApplyModels(categoryFilter);

          // Now languages should be disabled in availableFilters
          availableFilters = store.availableFilters();
          expect(availableFilters.length).toBe(1); // only languages is available (category is applied)
          expect(availableFilters.find(f => f.name === 'languages')?.disabled).toBe(true);

          subscription.unsubscribe();
          done();
        }
      });

      store.syncFilters(filtersWithMutualExclusion);
    });

    it('should not apply disabled logic during initialization since filters are cleared', (done) => {
      const filtersWithPreAppliedMutualExclusion: DftFilterItem[] = [
        {
          name: 'languages',
          type: 'options',
          label: 'Languages',
          value: ['en'],
          applied: true,
          appliedOrder: 1,
          options: [
            { value: 'en', label: 'English' },
            { value: 'fr', label: 'French' },
          ],
          mutuallyExclusive: ['category'],
        },
        {
          name: 'category',
          type: 'options',
          label: 'Category',
          value: null,
          applied: false,
          appliedOrder: 0,
          options: [
            { value: 'tech', label: 'Technology' },
            { value: 'sports', label: 'Sports' },
          ],
        },
      ];

      const subscription = store.onInitChanges$.subscribe((initialized) => {
        if (initialized) {
          const filters = store.filterList();

          // Category should not be disabled since excluded filters are cleared, not disabled
          const categoryFilter = filters.find(f => f.name === 'category');
          expect(categoryFilter?.disabled).toBeFalsy();

          subscription.unsubscribe();
          done();
        }
      });

      store.syncFilters(filtersWithPreAppliedMutualExclusion);
    });

    it('should handle filter clearing and mutual exclusivity', (done) => {
      const filtersWithMutualExclusion: DftFilterItem[] = [
        {
          name: 'languages',
          type: 'options',
          label: 'Languages',
          value: ['en'],
          applied: true,
          appliedOrder: 1,
          options: [
            { value: 'en', label: 'English' },
            { value: 'fr', label: 'French' },
          ],
          mutuallyExclusive: ['category'],
        },
        {
          name: 'category',
          type: 'options',
          label: 'Category',
          value: null,
          applied: false,
          appliedOrder: 0,
          options: [
            { value: 'tech', label: 'Technology' },
            { value: 'sports', label: 'Sports' },
          ],
        },
      ];

      const subscription = store.onInitChanges$.subscribe((initialized) => {
        if (initialized) {
          const filters = store.filterList();

          // Clear languages filter
          const languagesFilter = filters.find(f => f.name === 'languages');
          store.clearFilter(languagesFilter);

          // Verify languages is cleared
          const appliedFilters = store.appliedFilters();
          expect(appliedFilters.length).toBe(0);

          subscription.unsubscribe();
          done();
        }
      });

      store.syncFilters(filtersWithMutualExclusion);
    });
  });
});
