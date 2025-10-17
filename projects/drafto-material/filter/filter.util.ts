import { DftFilterItem } from "./filter.model";

/**
 * Utility functions for handling filter dependencies
 */

/**
 * Check if a filter is available/visible based on its dependencies
 * @param filter The filter to check
 * @param allFilters All filters in the store
 * @returns true if the filter should be available/visible
 */
export function isFilterAvailable(filter: DftFilterItem, allFilters: DftFilterItem[]): boolean {
  if (!filter.dependencies || filter.dependencies.length === 0) {
    return true; // No dependencies, always available
  }

  return filter.dependencies.every((dependency) => {
    const parentFilter = allFilters.find((f) => f.name === dependency.parentFilter);

    if (!parentFilter) {
      console.warn(`Parent filter '${dependency.parentFilter}' not found for filter '${filter.name}'`);
      return false;
    }

    // If parent is not applied, check dependency rules
    if (!parentFilter.applied || !hasValue(parentFilter.value)) {
      if (dependency.hideWhenParentEmpty) {
        return false;
      }
      return true; // Still show but might be disabled
    }

    // If specific parent values are required, check them
    if (dependency.parentValues && dependency.parentValues.length > 0) {
      return dependency.parentValues.some((requiredValue) => isValueMatch(parentFilter.value, requiredValue));
    }

    return true; // Parent has value and no specific values required
  });
}

/**
 * Check if a filter should be disabled based on its dependencies
 * @param filter The filter to check
 * @param allFilters All filters in the store
 * @returns true if the filter should be disabled
 */
export function isFilterDisabled(filter: DftFilterItem, allFilters: DftFilterItem[]): boolean {
  // Check base disabled state
  if (filter.disabled) {
    return true;
  }

  // Check mutual exclusivity
  if (isFilterDisabledByMutualExclusion(filter, allFilters)) {
    return true;
  }

  // Check dependency-based disabling
  if (!filter.dependencies || filter.dependencies.length === 0) {
    return false;
  }

  const hasDisabledDependency = filter.dependencies.some((dependency) => {
    const parentFilter = allFilters.find((f) => f.name === dependency.parentFilter);

    if (!parentFilter) {
      return true; // Disable if parent not found
    }

    // Check if should be disabled when parent is empty
    if (dependency.disableWhenParentEmpty && (!parentFilter.applied || !hasValue(parentFilter.value))) {
      return true;
    }

    return false;
  });

  return hasDisabledDependency;
}

/**
 * Get filters that should be cleared when a parent filter changes
 * @param changedFilter The filter that changed
 * @param allFilters All filters in the store
 * @returns Array of filter names that should be cleared
 */
export function getFiltersToClearOnParentChange(
  changedFilter: DftFilterItem,
  allFilters: DftFilterItem[]
): string[] {
  return allFilters
    .filter((filter) =>
      filter.dependencies?.some((dep) => dep.parentFilter === changedFilter.name && dep.clearOnParentChange)
    )
    .map((filter) => filter.name);
}

/**
 * Build dependency tree and assign levels to filters
 * @param filters Array of filters to process
 * @returns Filters with dependency levels assigned
 */
export function buildDependencyTree(filters: DftFilterItem[]): DftFilterItem[] {
  const processed = new Set<string>();
  const result = [...filters];

  // Helper function to get dependency level recursively
  function getDependencyLevel(filter: DftFilterItem): number {
    if (processed.has(filter.name)) {
      return filter.dependencyLevel || 0;
    }

    if (!filter.dependencies || filter.dependencies.length === 0) {
      filter.dependencyLevel = 0;
      processed.add(filter.name);
      return 0;
    }

    let maxParentLevel = -1;
    filter.dependencies.forEach((dependency) => {
      const parentFilter = result.find((f) => f.name === dependency.parentFilter);
      if (parentFilter) {
        const parentLevel = getDependencyLevel(parentFilter);
        maxParentLevel = Math.max(maxParentLevel, parentLevel);
      }
    });

    filter.dependencyLevel = maxParentLevel + 1;
    processed.add(filter.name);
    return filter.dependencyLevel;
  }

  // Calculate dependency levels for all filters
  result.forEach((filter) => getDependencyLevel(filter));

  return result;
}

/**
 * Check if a value is considered "empty" or "has no value"
 * @param value The value to check
 * @returns true if value is empty/null/undefined
 */
function hasValue(value: any): boolean {
  if (value == null || value === undefined) return false;
  if (typeof value === "string") return value.trim().length > 0;
  if (Array.isArray(value)) return value.length > 0;
  if (typeof value === "object") return Object.keys(value).length > 0;
  return true;
}

/**
 * Check if a filter value matches a required dependency value
 * @param filterValue The current filter value
 * @param requiredValue The required dependency value
 * @returns true if values match
 */
function isValueMatch(filterValue: any, requiredValue: string | number): boolean {
  if (Array.isArray(filterValue)) {
    return filterValue.some((v) => v === requiredValue || v?.value === requiredValue);
  }

  if (typeof filterValue === "object" && filterValue !== null) {
    return filterValue.value === requiredValue || filterValue === requiredValue;
  }

  return filterValue === requiredValue;
}

/**
 * Check if a filter should be disabled due to mutual exclusivity with other applied filters
 * @param filter The filter to check
 * @param allFilters All filters in the store
 * @returns true if the filter should be disabled
 */
export function isFilterDisabledByMutualExclusion(
  filter: DftFilterItem,
  allFilters: DftFilterItem[]
): boolean {
  // Check if any applied filter excludes this filter
  return allFilters.some((appliedFilter) => {
    if (!appliedFilter.applied || !hasValue(appliedFilter.value)) {
      return false;
    }

    return appliedFilter.mutuallyExclusive?.includes(filter.name) || false;
  });
}

/**
 * Process mutual exclusivity when a filter is applied
 * @param appliedFilter The filter that was just applied
 * @param allFilters All filters in the store
 * @returns Updated filters with mutual exclusivity handled
 */
export function processMutualExclusivity(
  appliedFilter: DftFilterItem,
  allFilters: DftFilterItem[]
): DftFilterItem[] {
  if (!appliedFilter.mutuallyExclusive || !hasValue(appliedFilter.value)) {
    return allFilters;
  }

  const excludedFilterNames = appliedFilter.mutuallyExclusive;

  // Simply clear the excluded filters
  return allFilters.map((filter) => {
    if (excludedFilterNames.includes(filter.name)) {
      return {
        ...filter,
        applied: false,
        value: null,
        appliedOrder: 0,
      };
    }
    return filter;
  });
}

/**
 * Build dependency context for a filter based on its parent dependencies
 * @param filter The filter to build context for
 * @param allFilters All filters in the store
 * @returns Dependency context object with parent filter values
 */
export function buildDependencyContext(
  filter: DftFilterItem,
  allFilters: DftFilterItem[]
): { [key: string]: any } {
  const context: { [key: string]: any } = {};

  if (!filter.dependencies || filter.dependencies.length === 0) {
    return context;
  }

  filter.dependencies.forEach((dependency) => {
    const parentFilter = allFilters.find((f) => f.name === dependency.parentFilter);
    if (parentFilter && parentFilter.applied && hasValue(parentFilter.value)) {
      context[dependency.parentFilter] = parentFilter.value;
    }
  });

  return context;
}
