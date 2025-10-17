# DftNavTabsComponent

A sophisticated Angular navigation tabs component that provides seamless routing integration, query parameter tracking, and advanced navigation features for @drafto/material library.

## Table of Contents

- [Features](#features)
- [Installation](#installation)
- [Basic Usage](#basic-usage)
- [API Reference](#api-reference)
- [Use Cases](#use-cases)
- [Advanced Examples](#advanced-examples)
- [Styling](#styling)
- [Best Practices](#best-practices)
- [Troubleshooting](#troubleshooting)

## Features

✅ **Router Integration**: Automatic route synchronization and navigation  
✅ **Query Parameter Tracking**: Persistent query parameters across tab switches  
✅ **Smart Tab Filtering**: Automatic deduplication and hidden tab handling  
✅ **Template Customization**: Support for custom header templates  
✅ **Material Design**: Built on Angular Material tabs with custom styling  
✅ **Signal-based**: Modern Angular signals for reactive state management  
✅ **TypeScript**: Full type safety with comprehensive interfaces  
✅ **Performance Optimized**: OnPush change detection and efficient tracking  

## Installation

The component is part of the `@drafto/material` library:

```bash
npm install @drafto/material @drafto/core
```

Import in your module or standalone component:

```typescript
import { DftNavTabsComponent } from '@drafto/material/navtabs';
```

## Basic Usage

### Simple Tab Navigation

```typescript
import { Component } from '@angular/core';
import { MatTabNavPanel } from '@angular/material/tabs';
import { DftNavTabsComponent, DftNavTabItem } from '@drafto/material/navtabs';

@Component({
  selector: 'app-example',
  standalone: true,
  imports: [DftNavTabsComponent],
  template: `
    <mat-tab-nav-panel #tabPanel>
      <router-outlet></router-outlet>
    </mat-tab-nav-panel>
    
    <dft-navtabs
      [tabs]="tabs"
      [tabPanel]="tabPanel"
      (tabChanged)="onTabChanged($event)">
    </dft-navtabs>
  `
})
export class ExampleComponent {
  tabs: DftNavTabItem[] = [
    { id: 1, label: 'Dashboard', routePath: '/dashboard' },
    { id: 2, label: 'Users', routePath: '/users' },
    { id: 3, label: 'Settings', routePath: '/settings' }
  ];

  onTabChanged(tab: DftNavTabItem) {
    console.log('Active tab changed:', tab);
  }
}
```

### With Query Parameter Tracking

```typescript
@Component({
  template: `
    <mat-tab-nav-panel #tabPanel>
      <router-outlet></router-outlet>
    </mat-tab-nav-panel>
    
    <dft-navtabs
      [tabs]="tabs"
      [tabPanel]="tabPanel"
      [trackQueryParams]="true"
      (tabChanged)="onTabChanged($event)">
    </dft-navtabs>
  `
})
export class QueryTrackingExample {
  tabs: DftNavTabItem[] = [
    { 
      id: 1, 
      label: 'Products', 
      routePath: '/products',
      queryParams: { view: 'grid' } 
    },
    { 
      id: 2, 
      label: 'Orders', 
      routePath: '/orders',
      queryParams: { status: 'pending' } 
    }
  ];
}
```

## API Reference

### Inputs

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `tabs` | `DftNavTabItem[]` | Required | Array of tab configurations |
| `tabPanel` | `MatTabNavPanel` | Required | Angular Material tab panel reference |
| `headerExtraTemplateRef` | `TemplateRef<any>` | `undefined` | Optional template for additional header content |
| `trackQueryParams` | `boolean` | `false` | Enable query parameter persistence |
| `fitInkBarToContent` | `boolean` | `true` | Fit ink bar to tab content width |
| `stretchTabs` | `boolean` | `false` | Stretch tabs to fill available width |
| `id` | `string` | Auto-generated | Unique component identifier |

### Outputs

| Event | Type | Description |
|-------|------|-------------|
| `tabChanged` | `DftNavTabItem` | Emitted when active tab changes |

### DftNavTabItem Interface

```typescript
interface DftNavTabItem {
  id: string | number;           // Unique identifier
  label: string;                 // Display text
  routePath: string;            // Route path for navigation
  queryParams?: Params;         // Default query parameters
  hidden?: boolean;             // Hide tab from display
  disabled?: boolean;           // Disable tab interaction
}
```

## Use Cases

### 1. Dashboard Navigation

```typescript
@Component({
  template: `
    <dft-navtabs
      [tabs]="dashboardTabs"
      [tabPanel]="tabPanel"
      [headerExtraTemplateRef]="headerActions">
    </dft-navtabs>
    
    <ng-template #headerActions>
      <button mat-icon-button>
        <mat-icon>refresh</mat-icon>
      </button>
      <button mat-icon-button>
        <mat-icon>settings</mat-icon>
      </button>
    </ng-template>
  `
})
export class DashboardComponent {
  dashboardTabs: DftNavTabItem[] = [
    { id: 'overview', label: 'Overview', routePath: '/dashboard/overview' },
    { id: 'analytics', label: 'Analytics', routePath: '/dashboard/analytics' },
    { id: 'reports', label: 'Reports', routePath: '/dashboard/reports' }
  ];
}
```

### 2. Data Management with Filters

```typescript
@Component({
  template: `
    <dft-navtabs
      [tabs]="dataTabs"
      [tabPanel]="tabPanel"
      [trackQueryParams]="true">
    </dft-navtabs>
  `
})
export class DataManagementComponent {
  dataTabs: DftNavTabItem[] = [
    { 
      id: 'all', 
      label: 'All Items', 
      routePath: '/data/all',
      queryParams: { filter: 'all', sort: 'name' }
    },
    { 
      id: 'active', 
      label: 'Active', 
      routePath: '/data/active',
      queryParams: { filter: 'active', sort: 'created' }
    },
    { 
      id: 'archived', 
      label: 'Archived', 
      routePath: '/data/archived',
      queryParams: { filter: 'archived', sort: 'archived' }
    }
  ];
}
```

### 3. User Profile Sections

```typescript
@Component({
  template: `
    <dft-navtabs
      [tabs]="profileTabs"
      [tabPanel]="tabPanel"
      [stretchTabs]="true">
    </dft-navtabs>
  `
})
export class UserProfileComponent {
  profileTabs: DftNavTabItem[] = [
    { id: 'info', label: 'Personal Info', routePath: '/profile/info' },
    { id: 'security', label: 'Security', routePath: '/profile/security' },
    { id: 'preferences', label: 'Preferences', routePath: '/profile/preferences' },
    { 
      id: 'billing', 
      label: 'Billing', 
      routePath: '/profile/billing',
      hidden: !this.hasSubscription 
    }
  ];

  hasSubscription = true; // Based on user data
}
```

### 4. Admin Panel with Role-Based Tabs

```typescript
@Component({
  template: `
    <dft-navtabs
      [tabs]="adminTabs"
      [tabPanel]="tabPanel">
    </dft-navtabs>
  `
})
export class AdminPanelComponent {
  get adminTabs(): DftNavTabItem[] {
    const baseTabs = [
      { id: 'users', label: 'Users', routePath: '/admin/users' },
      { id: 'content', label: 'Content', routePath: '/admin/content' }
    ];

    if (this.userService.hasRole('super-admin')) {
      baseTabs.push(
        { id: 'system', label: 'System', routePath: '/admin/system' },
        { id: 'logs', label: 'Logs', routePath: '/admin/logs' }
      );
    }

    return baseTabs;
  }
}
```

### 5. Conditional Tab Display

```typescript
@Component({
  template: `
    <dft-navtabs
      [tabs]="dynamicTabs"
      [tabPanel]="tabPanel">
    </dft-navtabs>
  `
})
export class ConditionalTabsComponent {
  featureFlags = inject(FeatureFlagService);

  get dynamicTabs(): DftNavTabItem[] {
    return [
      { id: 'home', label: 'Home', routePath: '/home' },
      { id: 'products', label: 'Products', routePath: '/products' },
      { 
        id: 'beta', 
        label: 'Beta Features', 
        routePath: '/beta',
        hidden: !this.featureFlags.isEnabled('beta-features')
      },
      { 
        id: 'admin', 
        label: 'Admin', 
        routePath: '/admin',
        disabled: !this.userService.isAdmin()
      }
    ];
  }
}
```

## Advanced Examples

### Custom Styling

```scss
// Override default tab spacing
.dft-navtabs {
  .__item {
    &:not(:first-child) {
      margin-left: 1rem; // Custom spacing
    }

    &.mdc-tab--active {
      .mdc-tab__text-label {
        font-weight: 600;
        color: var(--primary-color);
      }
    }
  }
}

// Custom header extras styling
.extras {
  .action-button {
    margin-left: 0.5rem;
  }
}
```

### Integration with State Management

```typescript
@Component({
  template: `
    <dft-navtabs
      [tabs]="tabs$ | async"
      [tabPanel]="tabPanel"
      (tabChanged)="onTabChanged($event)">
    </dft-navtabs>
  `
})
export class StateIntegratedComponent {
  private store = inject(Store);
  
  tabs$ = this.store.select(selectNavigationTabs);

  onTabChanged(tab: DftNavTabItem) {
    this.store.dispatch(NavigationActions.tabChanged({ tab }));
  }
}
```

### Dynamic Tab Loading

```typescript
@Component({
  template: `
    <dft-navtabs
      [tabs]="availableTabs"
      [tabPanel]="tabPanel">
    </dft-navtabs>
  `
})
export class DynamicTabsComponent implements OnInit {
  availableTabs: DftNavTabItem[] = [];

  async ngOnInit() {
    // Load tabs based on user permissions
    const permissions = await this.permissionService.getUserPermissions();
    this.availableTabs = this.generateTabsFromPermissions(permissions);
  }

  private generateTabsFromPermissions(permissions: string[]): DftNavTabItem[] {
    const allTabs = [
      { id: 'dashboard', label: 'Dashboard', routePath: '/dashboard', permission: 'read:dashboard' },
      { id: 'users', label: 'Users', routePath: '/users', permission: 'read:users' },
      { id: 'reports', label: 'Reports', routePath: '/reports', permission: 'read:reports' }
    ];

    return allTabs
      .filter(tab => permissions.includes(tab.permission))
      .map(({ permission, ...tab }) => tab);
  }
}
```

## Styling

### CSS Custom Properties

```scss
.dft-navtabs {
  --tab-spacing: 2.5rem;
  --tab-active-color: #1976d2;
  --tab-inactive-opacity: 0.7;
  --ink-bar-height: 3px;
  
  .__item {
    &:not(:first-child) {
      margin-left: var(--tab-spacing);
    }
  }
}
```

### Material Design Overrides

The component uses Angular Material's tab overrides system:

```scss
@include mat.tabs-overrides((
  divider-height: 0px,
  active-indicator-height: 3px,
  label-text-weight: var(--mat-sys-title-medium-weight),
  inactive-ripple-color: transparent,
  active-ripple-color: transparent
));
```

## Best Practices

### 1. Route Configuration

```typescript
// Ensure routes match tab routePaths exactly
const routes: Routes = [
  {
    path: 'dashboard',
    children: [
      { path: 'overview', component: OverviewComponent },
      { path: 'analytics', component: AnalyticsComponent },
      { path: '', redirectTo: 'overview', pathMatch: 'full' }
    ]
  }
];
```

### 2. Query Parameter Management

```typescript
// Use trackQueryParams for persistent filters
@Component({
  template: `
    <dft-navtabs
      [tabs]="tabs"
      [tabPanel]="tabPanel"
      [trackQueryParams]="shouldTrackParams">
    </dft-navtabs>
  `
})
export class FilterableComponent {
  shouldTrackParams = true; // Enable for filter persistence
  
  tabs = [
    { 
      id: 'products', 
      label: 'Products', 
      routePath: '/products',
      queryParams: { view: 'grid', sort: 'name' }
    }
  ];
}
```

### 3. Performance Optimization

```typescript
// Use OnPush change detection with observables
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <dft-navtabs
      [tabs]="tabs$ | async"
      [tabPanel]="tabPanel">
    </dft-navtabs>
  `
})
export class OptimizedComponent {
  tabs$ = this.dataService.getTabs().pipe(
    map(data => this.transformToTabs(data))
  );
}
```

### 4. Accessibility

```html
<!-- Ensure proper ARIA labels -->
<dft-navtabs
  [tabs]="tabs"
  [tabPanel]="tabPanel"
  role="navigation"
  aria-label="Main navigation">
</dft-navtabs>
```

## Troubleshooting

### Common Issues

#### 1. Tabs not showing as active

**Problem**: Current route doesn't match any tab routePath  
**Solution**: Ensure route paths match exactly, including leading slashes

```typescript
// ❌ Incorrect
{ id: 'home', label: 'Home', routePath: 'home' }

// ✅ Correct  
{ id: 'home', label: 'Home', routePath: '/home' }
```

#### 2. Query parameters not persisting

**Problem**: trackQueryParams is false or QueryParamStore not configured  
**Solution**: Enable tracking and ensure store is properly injected

```typescript
// ✅ Enable tracking
<dft-navtabs [trackQueryParams]="true" ...>

// ✅ Ensure store is provided
providers: [DftQueryParamStore]
```

#### 3. Duplicate tabs appearing

**Problem**: Multiple tabs with same routePath  
**Solution**: Component automatically deduplicates, but check tab configuration

```typescript
// ❌ Will be deduplicated
tabs = [
  { id: 1, label: 'Home', routePath: '/home' },
  { id: 2, label: 'Home Copy', routePath: '/home' } // Removed automatically
];
```

#### 4. Navigation not working

**Problem**: Router not configured or circular navigation  
**Solution**: Verify router configuration and tab routePath validity

```typescript
// ✅ Check router configuration
const routes: Routes = [
  { path: 'home', component: HomeComponent },
  { path: 'about', component: AboutComponent }
];
```

### Debug Mode

Enable debug logging to troubleshoot navigation issues:

```typescript
// Enable in component
constructor() {
  this._logger.debug('DftNavTabsComponent initialized with tabs:', this.tabs());
}
```

### Performance Monitoring

```typescript
// Monitor tab change performance
onTabChanged(tab: DftNavTabItem) {
  console.time('Tab Navigation');
  // Navigation logic
  console.timeEnd('Tab Navigation');
}
```

## Migration Guide

### From Material Tabs to DftNavTabs

```typescript
// Before: Basic Material Tabs
<mat-tab-group>
  <mat-tab label="Tab 1">Content 1</mat-tab>
  <mat-tab label="Tab 2">Content 2</mat-tab>
</mat-tab-group>

// After: DftNavTabs with routing
<mat-tab-nav-panel #tabPanel>
  <router-outlet></router-outlet>
</mat-tab-nav-panel>

<dft-navtabs
  [tabs]="[
    { id: 1, label: 'Tab 1', routePath: '/tab1' },
    { id: 2, label: 'Tab 2', routePath: '/tab2' }
  ]"
  [tabPanel]="tabPanel">
</dft-navtabs>
```

## Contributing

When contributing to this component:

1. **Add tests** for new features in `navtabs.component.spec.ts`
2. **Update this README** with new use cases and examples
3. **Follow Angular style guide** for component development
4. **Test accessibility** with screen readers and keyboard navigation
5. **Verify performance** with large tab arrays

## License

Part of the @drafto/material library. See project license for details.
