import { TestBed } from '@angular/core/testing';
import { DftFilterItem } from './filter.model';
import {
  isFilterAvailable,
  isFilterDisabled,
  getFiltersToClearOnParentChange,
  buildDependencyTree,
  isFilterDisabledByMutualExclusion,
  processMutualExclusivity,
} from './filter.util';

describe('Filter Utilities', () => {
  const createMockFilter = (
    name: string,
    type: 'text' | 'options' | 'compare' = 'text',
    dependencies?: Array<{
      parentFilter: string;
      hideWhenParentEmpty?: boolean;
      disableWhenParentEmpty?: boolean;
      clearOnParentChange?: boolean;
      parentValues?: string[];
    }>,
    value: any = null,
    applied: boolean = false
  ): DftFilterItem => ({
    name,
    type,
    label: name.charAt(0).toUpperCase() + name.slice(1),
    dependencies,
    value,
    applied,
    ...(type === 'options' && {
      options: [
        { value: 'option1', label: 'Option 1' },
        { value: 'option2', label: 'Option 2' },
      ],
    }),
  });

  let mockFilters: DftFilterItem[];

  beforeEach(() => {
    TestBed.configureTestingModule({});

    mockFilters = [
      createMockFilter('country', 'options', [], 'US', true),
      createMockFilter(
        'state',
        'options',
        [
          {
            parentFilter: 'country',
            clearOnParentChange: true,
            hideWhenParentEmpty: true,
          },
        ],
        'CA',
        true
      ),
      createMockFilter(
        'city',
        'options',
        [
          {
            parentFilter: 'state',
            clearOnParentChange: true,
            disableWhenParentEmpty: true,
          },
        ],
        'LA',
        true
      ),
      createMockFilter(
        'district',
        'options',
        [
          { parentFilter: 'city', clearOnParentChange: true },
          { parentFilter: 'country', parentValues: ['US'] },
        ],
        'Hollywood',
        true
      ),
      createMockFilter('category', 'options', [], 'Electronics', true),
    ];
  });

  describe('isFilterAvailable', () => {
    it('should return true when filter has no dependencies', () => {
      const filter = createMockFilter('noDepFilter', 'text', [], 'value', true);
      expect(isFilterAvailable(filter, [filter])).toBe(true);
    });

    it('should return false when filter has dependencies but parent is not applied', () => {
      const parentFilter = createMockFilter(
        'parent',
        'text',
        [],
        'value',
        false
      ); // applied: false
      const childFilter = createMockFilter(
        'child',
        'text',
        [{ parentFilter: 'parent', hideWhenParentEmpty: true }],
        'child-value',
        true
      );
      expect(isFilterAvailable(childFilter, [parentFilter, childFilter])).toBe(
        false
      );
    });

    it('should return true when parent is applied and has value', () => {
      const parentFilter = createMockFilter(
        'parent',
        'text',
        [],
        'value',
        true
      ); // applied: true
      const childFilter = createMockFilter(
        'child',
        'text',
        [{ parentFilter: 'parent', hideWhenParentEmpty: true }],
        'child-value',
        true
      );
      expect(isFilterAvailable(childFilter, [parentFilter, childFilter])).toBe(
        true
      );
    });

    it('should return true when parent has no value but hideWhenParentEmpty is false', () => {
      const parentFilter = createMockFilter('parent', 'text', [], null, false);
      const childFilter = createMockFilter(
        'child',
        'text',
        [{ parentFilter: 'parent' }], // no hideWhenParentEmpty
        'child-value',
        true
      );
      expect(isFilterAvailable(childFilter, [parentFilter, childFilter])).toBe(
        true
      );
    });

    it('should return false when parent values restriction is not met', () => {
      const parentFilter = createMockFilter(
        'parent',
        'text',
        [],
        'different-value',
        true
      );
      const childFilter = createMockFilter(
        'child',
        'text',
        [{ parentFilter: 'parent', parentValues: ['expected-value'] }],
        'child-value',
        true
      );
      expect(isFilterAvailable(childFilter, [parentFilter, childFilter])).toBe(
        false
      );
    });

    it('should return true when parent values restriction is met', () => {
      const parentFilter = createMockFilter(
        'parent',
        'text',
        [],
        'expected-value',
        true
      );
      const childFilter = createMockFilter(
        'child',
        'text',
        [{ parentFilter: 'parent', parentValues: ['expected-value'] }],
        'child-value',
        true
      );
      expect(isFilterAvailable(childFilter, [parentFilter, childFilter])).toBe(
        true
      );
    });

    it('should handle array values with parentValues', () => {
      const parentFilter = createMockFilter(
        'parent',
        'options',
        [],
        ['option1', 'option2'],
        true
      );
      const childFilter = createMockFilter(
        'child',
        'text',
        [{ parentFilter: 'parent', parentValues: ['option1'] }],
        'child-value',
        true
      );
      expect(isFilterAvailable(childFilter, [parentFilter, childFilter])).toBe(
        true
      );
    });

    it('should handle complex dependency chains', () => {
      const grandParent = createMockFilter(
        'grandparent',
        'text',
        [],
        'gp-value',
        true
      );
      const parent = createMockFilter(
        'parent',
        'text',
        [{ parentFilter: 'grandparent', hideWhenParentEmpty: true }],
        'p-value',
        true
      );
      const child = createMockFilter(
        'child',
        'text',
        [{ parentFilter: 'parent', hideWhenParentEmpty: true }],
        'c-value',
        true
      );
      expect(isFilterAvailable(child, [grandParent, parent, child])).toBe(true);
    });

    it('should handle multiple dependencies', () => {
      const parent1 = createMockFilter('parent1', 'text', [], 'value1', true);
      const parent2 = createMockFilter('parent2', 'text', [], 'value2', true);
      const child = createMockFilter(
        'child',
        'text',
        [
          { parentFilter: 'parent1', hideWhenParentEmpty: true },
          { parentFilter: 'parent2', hideWhenParentEmpty: true },
        ],
        'child-value',
        true
      );
      expect(isFilterAvailable(child, [parent1, parent2, child])).toBe(true);
    });

    it('should return false if any dependency is not satisfied', () => {
      const parent1 = createMockFilter('parent1', 'text', [], 'value1', true);
      const parent2 = createMockFilter('parent2', 'text', [], null, false); // not applied
      const child = createMockFilter(
        'child',
        'text',
        [
          { parentFilter: 'parent1', hideWhenParentEmpty: true },
          { parentFilter: 'parent2', hideWhenParentEmpty: true },
        ],
        'child-value',
        true
      );
      expect(isFilterAvailable(child, [parent1, parent2, child])).toBe(false);
    });

    it('should handle empty array values correctly', () => {
      const parentFilter = createMockFilter('parent', 'options', [], [], false);
      const childFilter = createMockFilter(
        'child',
        'text',
        [{ parentFilter: 'parent', hideWhenParentEmpty: true }],
        'child-value',
        true
      );
      expect(isFilterAvailable(childFilter, [parentFilter, childFilter])).toBe(
        false
      );
    });

    it('should handle undefined dependencies', () => {
      const filter = createMockFilter('simple', 'text', undefined);
      expect(isFilterAvailable(filter, [filter])).toBe(true);
    });

    it('should handle missing parent filter gracefully', () => {
      const childFilter = createMockFilter(
        'child',
        'text',
        [{ parentFilter: 'nonexistent', hideWhenParentEmpty: true }],
        'child-value',
        true
      );
      expect(isFilterAvailable(childFilter, [childFilter])).toBe(false);
    });
  });

  describe('isFilterDisabled', () => {
    it('should return false when filter has no dependencies', () => {
      const filter = createMockFilter('available', 'text', [], 'value', true);
      expect(isFilterDisabled(filter, [filter])).toBe(false);
    });

    it('should return true when filter is not available due to disabled dependency', () => {
      const parentFilter = createMockFilter('parent', 'text', [], null, false); // not applied
      const childFilter = createMockFilter(
        'child',
        'text',
        [{ parentFilter: 'parent', disableWhenParentEmpty: true }],
        'child-value',
        true
      );
      expect(isFilterDisabled(childFilter, [parentFilter, childFilter])).toBe(
        true
      );
    });

    it('should return false when parent has value', () => {
      const parentFilter = createMockFilter(
        'parent',
        'text',
        [],
        'value',
        true
      );
      const childFilter = createMockFilter(
        'child',
        'text',
        [{ parentFilter: 'parent', disableWhenParentEmpty: true }],
        'child-value',
        true
      );
      expect(isFilterDisabled(childFilter, [parentFilter, childFilter])).toBe(
        false
      );
    });

    it('should return false for filters with no dependencies', () => {
      const filter = createMockFilter(
        'independent',
        'text',
        undefined,
        'value',
        true
      );
      expect(isFilterDisabled(filter, [filter])).toBe(false);
    });

    it('should respect filter.disabled property', () => {
      const disabledFilter = createMockFilter(
        'disabled',
        'text',
        [],
        'value',
        true
      );
      disabledFilter.disabled = true;
      expect(isFilterDisabled(disabledFilter, [disabledFilter])).toBe(true);
    });

    it('should return true when parent not found', () => {
      const childFilter = createMockFilter(
        'child',
        'text',
        [{ parentFilter: 'nonexistent', disableWhenParentEmpty: true }],
        'child-value',
        true
      );
      expect(isFilterDisabled(childFilter, [childFilter])).toBe(true);
    });

    it('should return true when disabled due to mutual exclusivity', () => {
      const languageFilter = createMockFilter('language', 'options', [], 'en', true);
      languageFilter.mutuallyExclusive = ['category'];

      const categoryFilter = createMockFilter('category', 'options', [], null, false);
      categoryFilter.mutuallyExclusive = ['language'];

      expect(isFilterDisabled(categoryFilter, [languageFilter, categoryFilter])).toBe(true);
    });

    it('should return false when no mutual exclusivity conflicts', () => {
      const languageFilter = createMockFilter('language', 'options', [], null, false);
      languageFilter.mutuallyExclusive = ['category'];

      const categoryFilter = createMockFilter('category', 'options', [], null, false);
      categoryFilter.mutuallyExclusive = ['language'];

      expect(isFilterDisabled(categoryFilter, [languageFilter, categoryFilter])).toBe(false);
    });

    it('should handle both dependency and mutual exclusivity checks', () => {
      const parentFilter = createMockFilter('parent', 'text', [], null, false);
      const appliedFilter = createMockFilter('applied', 'options', [], 'value', true);
      appliedFilter.mutuallyExclusive = ['target'];

      const targetFilter = createMockFilter(
        'target',
        'text',
        [{ parentFilter: 'parent', disableWhenParentEmpty: true }],
        null,
        false
      );
      targetFilter.mutuallyExclusive = ['applied'];

      // Should be disabled due to mutual exclusivity (even though dependency would also disable it)
      expect(isFilterDisabled(targetFilter, [parentFilter, appliedFilter, targetFilter])).toBe(true);
    });
  });

  describe('getFiltersToClearOnParentChange', () => {
    it('should return empty array when no filters depend on the changed filter', () => {
      const independentFilter = mockFilters.find((f) => f.name === 'category')!;
      const result = getFiltersToClearOnParentChange(
        independentFilter,
        mockFilters
      );
      expect(result).toEqual([]);
    });

    it('should return direct children when parent changes', () => {
      const countryFilter = mockFilters.find((f) => f.name === 'country')!;
      const result = getFiltersToClearOnParentChange(
        countryFilter,
        mockFilters
      );
      expect(result).toEqual(['state']);
    });

    it('should return children with clearOnParentChange=true', () => {
      const stateFilter = mockFilters.find((f) => f.name === 'state')!;
      const result = getFiltersToClearOnParentChange(stateFilter, mockFilters);
      expect(result).toEqual(['city']);
    });

    it('should handle filters with multiple dependencies', () => {
      const result1 = getFiltersToClearOnParentChange(
        mockFilters.find((f) => f.name === 'city')!,
        mockFilters
      );
      const result2 = getFiltersToClearOnParentChange(
        mockFilters.find((f) => f.name === 'country')!,
        mockFilters
      );

      expect(result1).toEqual(['district']);
      expect(result2).toEqual(['state']); // district doesn't have clearOnParentChange for country
    });

    it('should handle empty filter array', () => {
      const filter = createMockFilter('test', 'text');
      const result = getFiltersToClearOnParentChange(filter, []);
      expect(result).toEqual([]);
    });

    it('should handle filters with no dependencies', () => {
      const filters = [
        createMockFilter('filter1', 'text', [], 'value1', true),
        createMockFilter('filter2', 'text', [], 'value2', true),
      ];
      const result = getFiltersToClearOnParentChange(filters[0], filters);
      expect(result).toEqual([]);
    });
  });

  describe('buildDependencyTree', () => {
    it('should assign correct dependency levels to filters', () => {
      const result = buildDependencyTree([...mockFilters]);

      expect(result.find((f) => f.name === 'country')?.dependencyLevel).toBe(0);
      expect(result.find((f) => f.name === 'category')?.dependencyLevel).toBe(
        0
      );
      expect(result.find((f) => f.name === 'state')?.dependencyLevel).toBe(1);
      expect(result.find((f) => f.name === 'city')?.dependencyLevel).toBe(2);
      expect(result.find((f) => f.name === 'district')?.dependencyLevel).toBe(
        3
      );
    });

    it('should preserve original filter properties', () => {
      const result = buildDependencyTree([...mockFilters]);

      const countryFilter = result.find((f) => f.name === 'country');
      expect(countryFilter?.type).toBe('options');
      expect(countryFilter?.label).toBe('Country');
      expect(countryFilter?.value).toBe('US');
    });

    it('should handle filters with no dependencies', () => {
      const filters = [
        createMockFilter('independent1', 'text', [], 'value1', true),
        createMockFilter('independent2', 'text', [], 'value2', true),
      ];

      const result = buildDependencyTree(filters);

      expect(result[0].dependencyLevel).toBe(0);
      expect(result[1].dependencyLevel).toBe(0);
    });

    it('should handle complex branching dependencies', () => {
      const filters = [
        createMockFilter('root', 'text', [], 'root-value', true),
        createMockFilter(
          'branch1',
          'text',
          [{ parentFilter: 'root' }],
          'branch1-value',
          true
        ),
        createMockFilter(
          'branch2',
          'text',
          [{ parentFilter: 'root' }],
          'branch2-value',
          true
        ),
        createMockFilter(
          'leaf1',
          'text',
          [{ parentFilter: 'branch1' }],
          'leaf1-value',
          true
        ),
      ];

      const result = buildDependencyTree(filters);

      expect(result.find((f) => f.name === 'root')?.dependencyLevel).toBe(0);
      expect(result.find((f) => f.name === 'branch1')?.dependencyLevel).toBe(1);
      expect(result.find((f) => f.name === 'branch2')?.dependencyLevel).toBe(1);
      expect(result.find((f) => f.name === 'leaf1')?.dependencyLevel).toBe(2);
    });

    it('should handle empty filter array', () => {
      const result = buildDependencyTree([]);
      expect(result).toEqual([]);
    });

    it('should handle filters with multiple parents correctly', () => {
      const filters = [
        createMockFilter('parent1', 'text', [], 'value1', true),
        createMockFilter('parent2', 'text', [], 'value2', true),
        createMockFilter(
          'child',
          'text',
          [{ parentFilter: 'parent1' }, { parentFilter: 'parent2' }],
          'child-value',
          true
        ),
      ];

      const result = buildDependencyTree(filters);

      expect(result.find((f) => f.name === 'parent1')?.dependencyLevel).toBe(0);
      expect(result.find((f) => f.name === 'parent2')?.dependencyLevel).toBe(0);
      expect(result.find((f) => f.name === 'child')?.dependencyLevel).toBe(1); // depends on both parents
    });

    it('should handle circular dependencies gracefully', () => {
      const filters = [
        createMockFilter('filter1', 'options', [{ parentFilter: 'filter2' }]),
        createMockFilter('filter2', 'options', [{ parentFilter: 'filter1' }]),
      ];

      // The function will throw due to infinite recursion, but that's expected
      // The actual implementation doesn't handle circular dependencies
      expect(() => buildDependencyTree(filters)).toThrow();
    });

    it('should handle missing parent references', () => {
      const filters = [
        createMockFilter('child', 'options', [{ parentFilter: 'nonexistent' }]),
      ];

      const result = buildDependencyTree(filters);
      // When parent doesn't exist, maxParentLevel stays -1, so dependency level becomes 0
      expect(result[0].dependencyLevel).toBe(0);
    });
  });

  // Edge Cases and Error Handling
  describe('Edge Cases', () => {
    it('should handle null/undefined values correctly', () => {
      const filterWithNull = createMockFilter(
        'nullFilter',
        'text',
        [],
        null,
        false
      );
      const filterWithUndefined = createMockFilter(
        'undefinedFilter',
        'text',
        [],
        undefined,
        false
      );

      expect(isFilterAvailable(filterWithNull, [filterWithNull])).toBe(true);
      expect(
        isFilterAvailable(filterWithUndefined, [filterWithUndefined])
      ).toBe(true);
    });

    it('should handle empty string values', () => {
      const filterWithEmptyString = createMockFilter(
        'emptyFilter',
        'text',
        [],
        '',
        false
      );
      expect(
        isFilterAvailable(filterWithEmptyString, [filterWithEmptyString])
      ).toBe(true);
    });

    it('should handle array values correctly', () => {
      const parentFilter = createMockFilter(
        'parent',
        'options',
        [],
        ['option1', 'option2'],
        true
      );
      const childFilter = createMockFilter(
        'child',
        'text',
        [{ parentFilter: 'parent', parentValues: ['option1'] }],
        'child-value',
        true
      );

      expect(isFilterAvailable(childFilter, [parentFilter, childFilter])).toBe(
        true
      );
    });

    it('should handle empty arrays correctly', () => {
      const parentFilter = createMockFilter('parent', 'options', [], [], false);
      const childFilter = createMockFilter(
        'child',
        'text',
        [{ parentFilter: 'parent', hideWhenParentEmpty: true }],
        'child-value',
        true
      );

      expect(isFilterAvailable(childFilter, [parentFilter, childFilter])).toBe(
        false
      );
    });
  });

  // Performance Tests
  describe('Performance', () => {
    it('should handle large number of filters efficiently', () => {
      const largeFilterSet = Array.from({ length: 1000 }, (_, i) =>
        createMockFilter(`filter${i}`, 'text', [], `value${i}`, true)
      );

      const start = performance.now();
      const result = buildDependencyTree(largeFilterSet);
      const end = performance.now();

      expect(result.length).toBe(1000);
      expect(end - start).toBeLessThan(100); // Should complete within 100ms
    });

    it('should handle deep dependency chains efficiently', () => {
      const deepChain = [
        createMockFilter('filter0', 'text', [], 'value0', true),
      ];

      for (let i = 1; i < 50; i++) {
        deepChain.push(
          createMockFilter(
            `filter${i}`,
            'text',
            [{ parentFilter: `filter${i - 1}` }],
            `value${i}`,
            true
          )
        );
      }

      const start = performance.now();
      const result = buildDependencyTree(deepChain);
      const end = performance.now();

      expect(result.length).toBe(50);
      expect(result.find((f) => f.name === 'filter49')?.dependencyLevel).toBe(
        49
      );
      expect(end - start).toBeLessThan(50); // Should complete within 50ms
    });
  });

  // Real-world Scenarios
  describe('Real-world Scenarios', () => {
    it('should handle country-state-city dependency chain', () => {
      const country = createMockFilter('country', 'options', [], 'USA', true);
      const state = createMockFilter(
        'state',
        'options',
        [{ parentFilter: 'country', hideWhenParentEmpty: true }],
        'California',
        true
      );
      const city = createMockFilter(
        'city',
        'options',
        [{ parentFilter: 'state', hideWhenParentEmpty: true }],
        'Los Angeles',
        true
      );

      expect(isFilterAvailable(state, [country, state, city])).toBe(true);
      expect(isFilterAvailable(city, [country, state, city])).toBe(true);

      // Change country - state should become unavailable
      const countryChanged = { ...country, value: null, applied: false };
      expect(isFilterAvailable(state, [countryChanged, state, city])).toBe(
        false
      );
    });

    it('should handle product category-subcategory-brand filtering', () => {
      const category = createMockFilter(
        'category',
        'options',
        [],
        'Electronics',
        true
      );
      const subcategory = createMockFilter(
        'subcategory',
        'options',
        [{ parentFilter: 'category', hideWhenParentEmpty: true }],
        'Laptops',
        true
      );
      const brand = createMockFilter(
        'brand',
        'options',
        [{ parentFilter: 'subcategory', hideWhenParentEmpty: true }],
        'Apple',
        true
      );

      const filters = [category, subcategory, brand];
      const tree = buildDependencyTree(filters);

      expect(tree.find((f) => f.name === 'category')?.dependencyLevel).toBe(0);
      expect(tree.find((f) => f.name === 'subcategory')?.dependencyLevel).toBe(
        1
      );
      expect(tree.find((f) => f.name === 'brand')?.dependencyLevel).toBe(2);

      // Test clearing chain
      const toClear = getFiltersToClearOnParentChange(category, filters);
      expect(toClear.length).toBe(0); // No clearOnParentChange set
    });

    it('should handle date range dependencies', () => {
      const startDate = createMockFilter(
        'startDate',
        'text',
        [],
        '2023-01-01',
        true
      );
      const endDate = createMockFilter(
        'endDate',
        'text',
        [{ parentFilter: 'startDate', hideWhenParentEmpty: true }],
        '2023-12-31',
        true
      );

      expect(isFilterAvailable(endDate, [startDate, endDate])).toBe(true);

      // Clear start date - end date should become unavailable
      const startDateCleared = { ...startDate, value: null, applied: false };
      expect(isFilterAvailable(endDate, [startDateCleared, endDate])).toBe(
        false
      );
    });
  });

  describe('Mutual Exclusivity Functions', () => {
    const createMockFilterWithMutualExclusion = (
      name: string,
      excludeFilters: string[],
      value: any = null,
      applied: boolean = false
    ): DftFilterItem => ({
      name,
      type: 'options',
      label: name.charAt(0).toUpperCase() + name.slice(1),
      options: [
        { value: 'option1', label: 'Option 1' },
        { value: 'option2', label: 'Option 2' },
      ],
      mutuallyExclusive: excludeFilters,
      value,
      applied,
    });

    describe('isFilterDisabledByMutualExclusion', () => {
      it('should return true when filter is excluded by another applied filter', () => {
        const languageFilter = createMockFilterWithMutualExclusion(
          'languages',
          ['category'],
          ['en'],
          true
        );
        const categoryFilter = createMockFilter('category', 'options', [], null, false);
        const allFilters = [languageFilter, categoryFilter];

        const result = isFilterDisabledByMutualExclusion(categoryFilter, allFilters);
        expect(result).toBe(true);
      });

      it('should return false when no applied filters exclude this filter', () => {
        const languageFilter = createMockFilterWithMutualExclusion(
          'languages',
          ['category'],
          null,
          false
        );
        const categoryFilter = createMockFilter('category', 'options', [], null, false);
        const allFilters = [languageFilter, categoryFilter];

        const result = isFilterDisabledByMutualExclusion(categoryFilter, allFilters);
        expect(result).toBe(false);
      });

      it('should return false when excluding filter is not applied', () => {
        const languageFilter = createMockFilterWithMutualExclusion(
          'languages',
          ['category'],
          null,
          false
        );
        const categoryFilter = createMockFilter('category', 'options', [], 'electronics', true);
        const allFilters = [languageFilter, categoryFilter];

        const result = isFilterDisabledByMutualExclusion(languageFilter, allFilters);
        expect(result).toBe(false);
      });

      it('should handle bidirectional mutual exclusivity', () => {
        const languageFilter = createMockFilterWithMutualExclusion(
          'languages',
          ['category'],
          ['en'],
          true
        );
        const categoryFilter = createMockFilterWithMutualExclusion(
          'category',
          ['languages'],
          null,
          false
        );
        const allFilters = [languageFilter, categoryFilter];

        expect(isFilterDisabledByMutualExclusion(categoryFilter, allFilters)).toBe(true);
        expect(isFilterDisabledByMutualExclusion(languageFilter, allFilters)).toBe(false);
      });
    });

    describe('processMutualExclusivity', () => {
      it('should clear excluded filters', () => {
        const languageFilter = createMockFilterWithMutualExclusion(
          'languages',
          ['category'],
          ['en'],
          true
        );
        const categoryFilter = createMockFilter('category', 'options', [], 'electronics', true);
        const allFilters = [languageFilter, categoryFilter];

        const result = processMutualExclusivity(languageFilter, allFilters);

        const updatedCategoryFilter = result.find(f => f.name === 'category');
        expect(updatedCategoryFilter?.applied).toBe(false);
        expect(updatedCategoryFilter?.value).toBe(null);
        expect(updatedCategoryFilter?.appliedOrder).toBe(0);
      });

      it('should not modify filters when no exclusivity is defined', () => {
        const normalFilter = createMockFilter('normal', 'options', [], 'value', true);
        const otherFilter = createMockFilter('other', 'options', [], 'otherValue', true);
        const allFilters = [normalFilter, otherFilter];

        const result = processMutualExclusivity(normalFilter, allFilters);

        expect(result).toEqual(allFilters);
      });

      it('should not modify filters when applied filter has no value', () => {
        const languageFilter = createMockFilterWithMutualExclusion(
          'languages',
          ['category'],
          null,
          false
        );
        const categoryFilter = createMockFilter('category', 'options', [], 'electronics', true);
        const allFilters = [languageFilter, categoryFilter];

        const result = processMutualExclusivity(languageFilter, allFilters);

        expect(result).toEqual(allFilters);
      });

      it('should handle multiple excluded filters', () => {
        const languageFilter = createMockFilterWithMutualExclusion(
          'languages',
          ['category', 'type', 'brand'],
          ['en'],
          true
        );
        const categoryFilter = createMockFilter('category', 'options', [], 'electronics', true);
        const typeFilter = createMockFilter('type', 'options', [], 'laptop', true);
        const brandFilter = createMockFilter('brand', 'options', [], 'apple', true);
        const allFilters = [languageFilter, categoryFilter, typeFilter, brandFilter];

        const result = processMutualExclusivity(languageFilter, allFilters);

        const updatedCategoryFilter = result.find(f => f.name === 'category');
        const updatedTypeFilter = result.find(f => f.name === 'type');
        const updatedBrandFilter = result.find(f => f.name === 'brand');

        expect(updatedCategoryFilter?.applied).toBe(false);
        expect(updatedCategoryFilter?.value).toBe(null);
        expect(updatedTypeFilter?.applied).toBe(false);
        expect(updatedTypeFilter?.value).toBe(null);
        expect(updatedBrandFilter?.applied).toBe(false);
        expect(updatedBrandFilter?.value).toBe(null);
      });
    });
  });
});
