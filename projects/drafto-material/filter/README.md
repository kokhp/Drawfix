# DftFilter Component Library

A comprehensive, production-ready Angular filter component library that provides flexible, dependency-aware filtering capabilities with custom template support.

## Features

- 🔍 **Multiple Filter Types**: Support for text, options, and compare filters
- 🔗 **Smart Dependencies**: Filters can depend on other filters with configurable behavior
- 🎨 **Custom Templates**: Use custom templates for filter options with `optionsItemTemplateRef`
- ⚡ **Performance Optimized**: Built with Angular Signals and OnPush change detection
- 📱 **Responsive Design**: Mobile-friendly with collapsible filter panels
- ♿ **Accessibility**: Full ARIA support and keyboard navigation
- 🧪 **Fully Tested**: Comprehensive test coverage for production reliability
- 📦 **Standalone Components**: Modern Angular standalone architecture

## Installation

```bash
npm install @drafto/material
```

```typescript
import { DftFilterComponent } from '@drafto/material/filter';

@Component({
  imports: [DftFilterComponent]
})
export class MyComponent {}
```

## Basic Usage

```typescript
import { Component } from '@angular/core';
import { DftFilterComponent, DftFilterItem, DftFilterApplyModel } from '@drafto/material/filter';

@Component({
  selector: 'app-example',
  template: `
    <dft-mat-filter
      [filters]="filters"
      [disabled]="isLoading"
      [enableQueryParam]="true"
      queryParamName="myFilters"
      (onApplied)="onFiltersApplied($event)">
    </dft-mat-filter>
  `,
  imports: [DftFilterComponent]
})
export class ExampleComponent {
  filters: DftFilterItem[] = [
    // Define your filters here
  ];

  onFiltersApplied(appliedFilters: DftFilterApplyModel[]) {
    console.log('Applied filters:', appliedFilters);
    // Handle applied filters
  }
}
```

## Filter Types

### 1. None Type Filter

Simple filters that don't require user input.

```typescript
{
  name: 'activeOnly',
  label: 'Active Items Only',
  type: 'none',
  value: true,
  applied: false,
  hidden: false
}
```

### 2. Text Type Filter

Text input filters with validation.

```typescript
{
  name: 'search',
  label: 'Search',
  type: 'text',
  inputLabel: 'Enter search term',
  validators: [Validators.required, Validators.minLength(3)],
  applied: false,
  hidden: false
}
```

### 3. Options Type Filter

Single or multiple selection from predefined options.

#### Static Options

```typescript
{
  name: 'status',
  label: 'Status',
  type: 'options',
  isDynamicOptions: false,
  options: [
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
    { value: 'pending', label: 'Pending' }
  ],
  applied: false,
  hidden: false
}
```

#### Dynamic Options

```typescript
{
  name: 'category',
  label: 'Category',
  type: 'options',
  isDynamicOptions: true,
  getOptions: this.getCategoryOptions.bind(this),
  options: [],
  applied: false,
  hidden: false
}

private getCategoryOptions(context: { [key: string]: any }): Observable<DftFilterOption[]> {
  // context contains values from parent filters for dependencies
  return this.http.get<DftFilterOption[]>('/api/categories');
}
```

### 4. Compare Type Filter

Comparison filters with operators.

```typescript
{
  name: 'price',
  label: 'Price Range',
  type: 'compare',
  options: [
    { value: 'EQUAL', label: 'Equal to' },
    { value: 'GREATER', label: 'Greater than' },
    { value: 'LESS', label: 'Less than' },
    { value: 'BETWEEN', label: 'Between' }
  ],
  applied: false,
  hidden: false
}
```

## Dependencies

Create cascading filter relationships where child filters depend on parent selections.

### Basic Dependency

```typescript
const filters: DftFilterItem[] = [
  // Parent filter
  {
    name: 'country',
    label: 'Country',
    type: 'options',
    options: [
      { value: 'us', label: 'United States' },
      { value: 'ca', label: 'Canada' },
      { value: 'in', label: 'India' }
    ],
    applied: false,
    hidden: false
  },

  // Child filter with dependency
  {
    name: 'state',
    label: 'State/Province',
    type: 'options',
    isDynamicOptions: true,
    getOptions: (context) => this.getStates(context['country']),
    options: [],
    applied: false,
    hidden: false,
    dependencies: [{
      parentFilter: 'country',
      hideWhenParentEmpty: true,     // Hide when no country selected
      clearOnParentChange: true,     // Clear when country changes
      disableWhenParentEmpty: true   // Disable when no country selected
    }]
  }
];
```

### Multi-level Dependencies

```typescript
const filters: DftFilterItem[] = [
  {
    name: 'country',
    label: 'Country',
    type: 'options',
    options: [/* ... */]
  },
  {
    name: 'state',
    label: 'State',
    type: 'options',
    isDynamicOptions: true,
    getOptions: (context) => this.getStates(context['country']),
    dependencies: [{ parentFilter: 'country', hideWhenParentEmpty: true, clearOnParentChange: true }]
  },
  {
    name: 'city',
    label: 'City',
    type: 'options',
    isDynamicOptions: true,
    getOptions: (context) => this.getCities(context['state']),
    dependencies: [{ parentFilter: 'state', hideWhenParentEmpty: true, clearOnParentChange: true }]
  },
  {
    name: 'district',
    label: 'District',
    type: 'options',
    isDynamicOptions: true,
    getOptions: (context) => this.getDistricts(context['city']),
    dependencies: [{ parentFilter: 'city', hideWhenParentEmpty: true, clearOnParentChange: true }]
  }
];
```

### Conditional Dependencies

```typescript
{
  name: 'zipcode',
  label: 'ZIP Code',
  type: 'text',
  dependencies: [{
    parentFilter: 'country',
    parentValues: ['us'],           // Only show for US
    hideWhenParentEmpty: false,     // Still show for other countries
    clearOnParentChange: true       // Clear when country changes
  }]
}
```

### Dependency Context Usage

The `getOptions` function receives a `dependencyContext` parameter containing values from parent filters:

```typescript
// Component method
private getStates(filter: DftFilterOptionFilter): Observable<DftFilterOption[]> {
  const countryId = filter.dependencyContext?.['country']; // Get parent country value

  if (!countryId) {
    return of([]); // No country selected, return empty
  }

  return this.http.get<DftFilterOption[]>(`/api/states?countryId=${countryId}`);
}

private getCities(filter: DftFilterOptionFilter): Observable<DftFilterOption[]> {
  const stateId = filter.dependencyContext?.['state']; // Get parent state value
  const countryId = filter.dependencyContext?.['country']; // Also available

  if (!stateId) {
    return of([]);
  }

  return this.http.get<DftFilterOption[]>(`/api/cities?stateId=${stateId}`);
}

// Filter configuration
[
  {
    name: 'country',
    label: 'Country',
    type: 'options',
    isDynamicOptions: true,
    getOptions: () => this.getCountries(), // No dependencies
  },
  {
    name: 'state',
    label: 'State',
    type: 'options',
    isDynamicOptions: true,
    getOptions: (filter) => this.getStates(filter), // Receives context with country value
    dependencies: [{ parentFilter: 'country', clearOnParentChange: true }]
  },
  {
    name: 'city',
    label: 'City',
    type: 'options',
    isDynamicOptions: true,
    getOptions: (filter) => this.getCities(filter), // Receives context with state & country values
    dependencies: [{ parentFilter: 'state', clearOnParentChange: true }]
  }
];
```

## Component API

### Inputs

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `filters` | `DftFilterItem[]` | `[]` | **Required.** Array of filter configurations |
| `disabled` | `boolean` | `false` | Disables the entire filter component |
| `enableQueryParam` | `boolean` | `false` | Enables URL query parameter synchronization |
| `queryParamName` | `string` | `'filter'` | Name of the query parameter |
| `showFilterIcon` | `boolean` | `true` | Shows/hides the filter icon |
| `inputPlaceholder` | `string` | `'Filter'` | Placeholder text for filter search |
| `showRemoveAll` | `boolean` | `true` | Shows/hides the "Remove All" button |
| `id` | `string` | auto-generated | Unique identifier for the component |

### Outputs

| Event | Type | Description |
|-------|------|-------------|
| `onApplied` | `DftFilterApplyModel[]` | Emitted when filters are applied/changed |

### Types

#### DftFilterItem

```typescript
interface DftFilterItem {
  name: string;                          // Unique filter name
  type: DftFilterType;                   // Filter type: 'none' | 'text' | 'options' | 'compare'
  label: string;                         // Display label
  value?: any;                           // Current filter value
  tagLabel?: string;                     // Label for applied filter tags
  headerLabel?: string;                  // Header label in filter dropdown
  options?: DftFilterOption[];           // Options for 'options' and 'compare' types
  stickySearch?: boolean;                // Keep at top during search
  disabled?: boolean;                    // Disable this filter
  hidden?: boolean;                      // Hide this filter
  applied?: boolean;                     // Is filter currently applied
  appliedOrder?: number;                 // Order of application (auto-managed)

  // For text filters
  inputLabel?: string;                   // Input field label
  validators?: ValidatorFn[];            // Form validators

  // For dynamic options
  isDynamicOptions?: boolean;            // Load options dynamically
  getOptions?: (context: any) => Observable<DftFilterOption[]>; // Option loader function

  // For dependencies
  dependencies?: DftFilterDependency[];  // Parent dependencies
  dependents?: string[];                 // Child filter names (auto-calculated)
  dependencyLevel?: number;              // Hierarchy level (auto-calculated)
}
```

#### DftFilterDependency

```typescript
interface DftFilterDependency {
  parentFilter: string;                  // Name of parent filter
  parentValues?: (string | number)[];    // Required parent values
  clearOnParentChange?: boolean;         // Clear when parent changes
  hideWhenParentEmpty?: boolean;         // Hide when parent is empty
  disableWhenParentEmpty?: boolean;      // Disable when parent is empty
}
```

#### DftFilterOption

```typescript
interface DftFilterOption {
  value: string | number;                // Option value
  label?: string;                        // Display label
  tagLabel?: string;                     // Label for tags
  order?: number;                        // Sort order
  selected?: boolean;                    // Pre-selected state
}
```

#### DftFilterApplyModel

```typescript
interface DftFilterApplyModel {
  name: string;                          // Filter name
  value: any;                            // Applied value
}
```

## Examples

### E-commerce Filters

```typescript
filters: DftFilterItem[] = [
  // Search
  {
    name: 'search',
    label: 'Search Products',
    type: 'text',
    inputLabel: 'Enter product name',
    validators: [Validators.minLength(2)]
  },

  // Category
  {
    name: 'category',
    label: 'Category',
    type: 'options',
    isDynamicOptions: true,
    getOptions: () => this.productService.getCategories()
  },

  // Subcategory (depends on category)
  {
    name: 'subcategory',
    label: 'Subcategory',
    type: 'options',
    isDynamicOptions: true,
    getOptions: (context) => this.productService.getSubcategories(context['category']),
    dependencies: [{
      parentFilter: 'category',
      hideWhenParentEmpty: true,
      clearOnParentChange: true
    }]
  },

  // Price range
  {
    name: 'price',
    label: 'Price',
    type: 'compare',
    options: [
      { value: 'LESS', label: 'Less than' },
      { value: 'GREATER', label: 'Greater than' },
      { value: 'BETWEEN', label: 'Between' }
    ]
  },

  // In stock only
  {
    name: 'inStock',
    label: 'In Stock Only',
    type: 'none',
    value: true
  },

  // Brand
  {
    name: 'brand',
    label: 'Brand',
    type: 'options',
    options: [
      { value: 'apple', label: 'Apple' },
      { value: 'samsung', label: 'Samsung' },
      { value: 'sony', label: 'Sony' }
    ]
  }
];
```

### User Management Filters

```typescript
filters: DftFilterItem[] = [
  // User status
  {
    name: 'status',
    label: 'User Status',
    type: 'options',
    options: [
      { value: 'active', label: 'Active' },
      { value: 'inactive', label: 'Inactive' },
      { value: 'pending', label: 'Pending Approval' },
      { value: 'blocked', label: 'Blocked' }
    ]
  },

  // Role
  {
    name: 'role',
    label: 'User Role',
    type: 'options',
    isDynamicOptions: true,
    getOptions: () => this.userService.getRoles()
  },

  // Department
  {
    name: 'department',
    label: 'Department',
    type: 'options',
    isDynamicOptions: true,
    getOptions: () => this.userService.getDepartments()
  },

  // Registration date
  {
    name: 'registrationDate',
    label: 'Registration Date',
    type: 'compare',
    options: [
      { value: 'GREATER', label: 'After' },
      { value: 'LESS', label: 'Before' },
      { value: 'BETWEEN', label: 'Between' }
    ]
  },

  // Email verified only
  {
    name: 'emailVerified',
    label: 'Email Verified Only',
    type: 'none',
    value: true
  }
];
```

### Location-based Filters

```typescript
filters: DftFilterItem[] = [
  // Country
  {
    name: 'country',
    label: 'Country',
    type: 'options',
    isDynamicOptions: true,
    getOptions: () => this.locationService.getCountries()
  },

  // State (depends on country)
  {
    name: 'state',
    label: 'State/Province',
    type: 'options',
    isDynamicOptions: true,
    getOptions: (context) => this.locationService.getStates(context['country']),
    dependencies: [{
      parentFilter: 'country',
      hideWhenParentEmpty: true,
      clearOnParentChange: true,
      disableWhenParentEmpty: true
    }]
  },

  // City (depends on state)
  {
    name: 'city',
    label: 'City',
    type: 'options',
    isDynamicOptions: true,
    getOptions: (context) => this.locationService.getCities(context['state']),
    dependencies: [{
      parentFilter: 'state',
      hideWhenParentEmpty: true,
      clearOnParentChange: true,
      disableWhenParentEmpty: true
    }]
  },

  // ZIP Code (only for certain countries)
  {
    name: 'zipcode',
    label: 'ZIP Code',
    type: 'text',
    inputLabel: 'Enter ZIP code',
    validators: [Validators.pattern(/^\d{5}(-\d{4})?$/)],
    dependencies: [{
      parentFilter: 'country',
      parentValues: ['us', 'ca'],
      hideWhenParentEmpty: false,
      clearOnParentChange: true
    }]
  }
];
```

## Advanced Features

### Query Parameter Synchronization

Enable URL synchronization to persist filter state across page reloads:

```typescript
<dft-mat-filter
  [filters]="filters"
  [enableQueryParam]="true"
  queryParamName="productFilters"
  (onApplied)="onFiltersApplied($event)">
</dft-mat-filter>
```

### Custom Option Loading

Implement complex option loading with error handling:

```typescript
private getCategoryOptions(context: { [key: string]: any }): Observable<DftFilterOption[]> {
  return this.http.get<any[]>('/api/categories').pipe(
    map(categories => categories.map(cat => ({
      value: cat.id,
      label: cat.name,
      order: cat.sortOrder
    }))),
    catchError(error => {
      console.error('Failed to load categories:', error);
      return of([]);
    })
  );
}
```

### Dynamic Filter Configuration

Load filter configuration from API:

```typescript
ngOnInit() {
  this.configService.getFilterConfig('products').subscribe(config => {
    this.filters = config.filters;
  });
}
```

### Custom Validation

Add complex validation logic:

```typescript
{
  name: 'email',
  label: 'Email',
  type: 'text',
  validators: [
    Validators.required,
    Validators.email,
    this.customEmailValidator.bind(this)
  ]
}

private customEmailValidator(control: AbstractControl): ValidationErrors | null {
  const value = control.value;
  if (value && !value.includes('@company.com')) {
    return { invalidDomain: true };
  }
  return null;
}
```

## Best Practices

### 1. Filter Organization

- Group related filters together
- Use clear, descriptive labels
- Order filters by importance/frequency of use
- Use sticky search for important filters

### 2. Performance Optimization

- Cache option data when possible
- Use debouncing for text filters
- Implement virtual scrolling for large option lists
- Lazy load dependent filter options

### 3. User Experience

- Provide loading states for dynamic options
- Show clear dependency relationships
- Use appropriate validation messages
- Implement progressive disclosure for complex filters

### 4. Error Handling

- Handle API failures gracefully
- Provide fallback options
- Log errors for debugging
- Show user-friendly error messages

### 5. Accessibility

- Use semantic HTML
- Provide keyboard navigation
- Include ARIA labels
- Support screen readers

### 6. Testing

- Unit test filter logic
- Test dependency cascading
- Validate option loading
- Test query parameter synchronization

## Migration from Previous Versions

If upgrading from an earlier version:

1. Update import statements
2. Review filter type definitions
3. Test dependency configurations
4. Update query parameter handling
5. Verify option loading functions

## Troubleshooting

### Common Issues

1. **Filters not showing**: Check `hidden` property and dependency logic
2. **Options not loading**: Verify `getOptions` function and API endpoints
3. **Dependencies not working**: Check parent filter names and dependency configuration
4. **Query params not syncing**: Ensure `enableQueryParam` is true and route is configured

### Debug Mode

Enable debug logging to troubleshoot issues:

```typescript
// In your component
ngOnInit() {
  // Enable debug mode in development
  if (!environment.production) {
    console.log('Filter configuration:', this.filters);
  }
}
```

## Support

For additional support and examples, refer to:
- Component source code
- Unit tests
- Example applications
- GitHub issues
