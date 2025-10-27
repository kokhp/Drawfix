# Drafto Angular Project Architecture

## Project Overview
This is a sophisticated Angular workspace with multiple interconnected libraries following modern Angular best practices and patterns.

```
📁 angular/
├── 📄 angular.json                    # Angular CLI workspace configuration
├── 📄 package.json                    # Project dependencies and scripts
├── 📄 tailwind.config.js             # TailwindCSS configuration
├── 📄 tsconfig.json                   # TypeScript configuration
├── 📄 README.md                       # Project documentation
├── 📄 log.txt                        # Application logs
│
├── 📁 projects/                       # Multi-project workspace
│   │
│   ├── 📁 drafto/                     # Core library (@drafto/core)
│   │   ├── 📄 index.ts               # Library entry point
│   │   ├── 📄 ng-package.json        # Angular package configuration
│   │   ├── 📄 package.json           # Library package metadata
│   │   ├── 📄 public-api.ts          # Public API exports
│   │   ├── 📄 README.md              # Library documentation
│   │   ├── 📄 tsconfig.lib.json      # Library TypeScript config
│   │   ├── 📄 tsconfig.lib.prod.json # Production TypeScript config
│   │   ├── 📄 tsconfig.spec.json     # Test TypeScript config
│   │   │
│   │   ├── 📁 constants/              # Application constants
│   │   │   ├── 📄 cookiekeys.constant.ts    # Cookie key definitions
│   │   │   ├── 📄 headerkeys.constant.ts    # HTTP header keys
│   │   │   └── 📄 utils.constant.ts         # Utility constants
│   │   │
│   │   ├── 📁 forms/                  # Form utilities and validators
│   │   │   ├── 📄 index.ts
│   │   │   ├── 📄 ng-package.json
│   │   │   ├── 📄 public-api.ts
│   │   │   └── 📁 validators/         # Custom form validators
│   │   │
│   │   ├── 📁 http/                   # HTTP services and configuration
│   │   │   ├── 📄 http.config.ts      # HTTP configuration interface
│   │   │   ├── 📄 http.service.ts     # Main HTTP service
│   │   │   ├── 📄 http.service.spec.ts # HTTP service tests
│   │   │   ├── 📄 index.ts
│   │   │   ├── 📄 ng-package.json
│   │   │   ├── 📄 public-api.ts
│   │   │   └── 📁 interceptors/       # HTTP interceptors
│   │   │       ├── 📄 base.interceptor.ts
│   │   │       ├── 📄 header.interceptor.ts
│   │   │       └── 📄 retry.interceptor.ts
│   │   │
│   │   ├── 📁 models/                 # Data models and interfaces
│   │   │   └── 📄 wrappers.model.ts   # Wrapper models
│   │   │
│   │   ├── 📁 services/               # Shared services
│   │   │   ├── 📄 common.service.ts   # Common utility service
│   │   │   └── 📄 common.service.spec.ts # Service tests
│   │   │
│   │   ├── 📁 store/                  # State management
│   │   │   ├── 📄 index.ts
│   │   │   ├── 📄 ng-package.json
│   │   │   ├── 📄 public-api.ts
│   │   │   └── 📄 query-params.store.ts # Query parameter store
│   │   │
│   │   └── 📁 util/                   # Utility functions
│   │       ├── 📄 array-utils.ts      # Array manipulation utilities
│   │       ├── 📄 coercion.ts         # Type coercion utilities
│   │       ├── 📄 common-utils.ts     # Common utility functions
│   │       ├── 📄 number-utils.ts     # Number manipulation utilities
│   │       ├── 📄 rxjs-operators.ts   # Custom RxJS operators
│   │       ├── 📄 ui-utils.ts         # UI utility functions
│   │       └── 📄 uri-utils.ts        # URI manipulation utilities
│   │
│   ├── 📁 drafto-material/            # Material Design component library (@drafto/material)
│   │   ├── 📄 _index.scss             # SCSS entry point
│   │   ├── 📄 index.ts
│   │   ├── 📄 ng-package.json
│   │   ├── 📄 package.json
│   │   ├── 📄 public-api.ts
│   │   ├── 📄 README.md
│   │   ├── 📄 tsconfig.lib.json
│   │   ├── 📄 tsconfig.lib.prod.json
│   │   ├── 📄 tsconfig.spec.json
│   │   │
│   │   ├── 📁 carousal/               # Carousel component
│   │   │   ├── 📄 carousal.component.html
│   │   │   ├── 📄 carousal.component.scss
│   │   │   ├── 📄 carousal.component.spec.ts
│   │   │   └── 📄 carousal.component.ts
│   │   │
│   │   ├── 📁 core/                   # Material Design core
│   │   │   ├── 📄 index.ts
│   │   │   ├── 📄 ng-package.json
│   │   │   ├── 📄 public-api.ts
│   │   │   ├── 📁 color/              # Color system
│   │   │   ├── 📁 density/            # Density system
│   │   │   ├── 📁 m2/                 # Material Design 2
│   │   │   ├── 📁 style/              # Style utilities
│   │   │   ├── 📁 theming/            # Theme configuration
│   │   │   ├── 📁 tokens/             # Design tokens
│   │   │   └── 📁 typography/         # Typography system
│   │   │
│   │   ├── 📁 filter/                 # Advanced filter component
│   │   │   ├── 📄 filter.component.html
│   │   │   ├── 📄 filter.component.scss
│   │   │   ├── 📄 filter.component.spec.ts
│   │   │   ├── 📄 filter.component.ts
│   │   │   ├── 📄 filter.constants.ts # Filter constants
│   │   │   ├── 📄 filter.model.ts     # Filter data models
│   │   │   ├── 📄 filter.pipes.ts     # Filter pipes
│   │   │   ├── 📄 filter.store.ts     # Filter state management
│   │   │   ├── 📄 filter.token.ts     # Dependency injection tokens
│   │   │   ├── 📄 index.ts
│   │   │   ├── 📄 ng-package.json
│   │   │   ├── 📄 public-api.ts
│   │   │   ├── 📁 compare/            # Filter comparison logic
│   │   │   ├── 📁 options/            # Filter options
│   │   │   └── 📁 text/               # Text filter components
│   │   │
│   │   └── 📁 navtabs/                # Navigation tabs component
│   │       ├── 📄 index.ts
│   │       ├── 📄 navtabs.component.html
│   │       ├── 📄 navtabs.component.scss
│   │       ├── 📄 navtabs.component.ts
│   │       ├── 📄 navtabs.model.ts    # Tab models
│   │       ├── 📄 navtabs.store.ts    # Tab state management
│   │       ├── 📄 ng-package.json
│   │       └── 📄 public-api.ts
│   │
│   └── 📁 webadmin/                   # Main application
│       ├── 📄 tsconfig.app.json       # App TypeScript config
│       ├── 📄 tsconfig.spec.json      # Test TypeScript config
│       │
│       ├── 📁 public/                 # Static assets
│       │   ├── 📄 favicon.ico
│       │   └── 📁 img/                # Images
│       │
│       └── 📁 src/                    # Source code
│           ├── 📄 index.html          # Main HTML template
│           ├── 📄 main.ts             # Application bootstrap
│           ├── 📄 styles.scss         # Global styles
│           │
│           ├── 📁 app/                # Application root
│           │   └── 📄 app.store.ts    # Global app state
│           │
│           ├── 📁 components/         # Shared components
│           ├── 📁 constants/          # App constants
│           ├── 📁 environments/       # Environment configurations
│           │
│           ├── 📁 features/           # Feature modules
│           │   ├── 📄 main.routes.ts  # Main routing configuration
│           │   ├── 📁 account/        # Authentication features
│           │   ├── 📁 dashboard/      # Dashboard features
│           │   └── 📁 poster/         # Poster management features
│           │
│           ├── 📁 guards/             # Route guards
│           ├── 📁 models/             # Application models
│           ├── 📁 services/           # Application services
│           ├── 📁 store/              # Application state stores
│           └── 📁 style/              # Style utilities
```

## Technology Stack

### Core Technologies
- **Angular 20.1.2** - Latest Angular framework
- **TypeScript 5.8.3** - Type-safe JavaScript
- **RxJS 7.8.0** - Reactive programming
- **Angular Material 20.1.2** - UI components
- **TailwindCSS 3.4.17** - Utility-first CSS framework

### State Management
- **NgRx Signals 19.0.0** - Modern reactive state management
- **@ngrx/effects 19.0.1** - Side effects management
- **@ngrx/router-store 19.0.1** - Router integration
- **@ngrx/store-devtools 19.0.0** - Development tools

### Additional Libraries
- **ngx-logger 5.0.12** - Comprehensive logging
- **ngx-cookie-service 19.0.0** - Cookie management
- **ngxtension 4.2.0** - Angular utilities
- **ngx-infinite-scroll 19.0.0** - Infinite scrolling
- **ngx-skeleton-loader 10.0.0** - Loading states
- **ng-otp-input 2.0.6** - OTP input component

## Architecture Patterns

### 1. Library Architecture
- **Multi-library workspace** with clear separation of concerns
- **@drafto/core** - Core utilities, services, and shared functionality
- **@drafto/material** - Custom Material Design components
- **webadmin** - Main application consuming the libraries

### 2. State Management Pattern
```typescript
// Modern NgRx Signals pattern used throughout
export const ExampleStore = signalStore(
  withState(initialState),
  withProps(() => ({ _logger: inject(NGXLogger) })),
  withComputed(() => ({ /* computed values */ })),
  withMethods(() => ({ /* actions */ })),
  withHooks(() => ({ onInit() { /* initialization */ } }))
);
```

### 3. Service Architecture
- **Dependency injection** using `inject()` function
- **Service composition** with proper interfaces
- **Transient services** for specific use cases
- **Singleton services** with `providedIn: 'root'`

### 4. Component Architecture
- **Signal-based** reactive components
- **OnPush change detection** strategy
- **Standalone components** pattern
- **Input/Output** decorators with proper typing

### 5. HTTP Architecture
- **Centralized HTTP service** with configuration
- **Interceptor-based** approach for cross-cutting concerns
- **Error handling** and logging integration
- **Type-safe** request/response handling

## Key Features

### 1. Query Parameter Management
- **Centralized store** for query parameter tracking
- **Route-based synchronization** with component state
- **Automatic persistence** across navigation

### 2. Advanced Filtering System
- **Dynamic filter generation** with multiple types
- **State persistence** with query parameters
- **Search and comparison** capabilities
- **Extensible filter options**

### 3. Navigation System
- **Tab-based navigation** with state management
- **Route integration** with automatic active state
- **Query parameter preservation** across tabs

### 4. Logging and Monitoring
- **Comprehensive logging** with NGX Logger
- **Environment-based** log levels
- **Error tracking** and reporting

### 5. Styling System
- **TailwindCSS** for utility classes
- **Material Design** integration
- **Custom theming** support
- **Responsive design** patterns

## Code Organization Standards

### 1. Naming Conventions
- **Components**: PascalCase with `.component.ts` suffix
- **Services**: PascalCase with `.service.ts` suffix
- **Stores**: PascalCase with `.store.ts` suffix
- **Models**: PascalCase with `.model.ts` suffix
- **Constants**: UPPER_SNAKE_CASE

### 2. File Structure
- **Barrel exports** (`index.ts`, `public-api.ts`)
- **Feature-based** folder organization
- **Separation of concerns** (components, services, models, constants)
- **Test files** co-located with source files

### 3. Import Organization
- **Angular imports** first
- **Third-party imports** second
- **Internal imports** last
- **Relative imports** organized by proximity

## Build and Development

### Scripts
- `npm start` - Development server
- `npm run build` - Production build
- `npm test` - Run tests
- `npm run watch` - Development build with watch mode

### Build Configuration
- **Multi-project** build support
- **Library packaging** with ng-packagr
- **Production optimizations** enabled
- **Source maps** for debugging

## Performance Optimizations

### 1. Change Detection
- **OnPush strategy** for components
- **Signal-based** reactivity
- **Computed values** for derived state
- **Immutable updates** in stores

### 2. Bundle Optimization
- **Tree-shaking** friendly exports
- **Lazy loading** with `loadComponent()` and `loadChildren()`
- **Angular build optimization** enabled
- **TailwindCSS purging** for smaller bundles

### 3. State Management
- **Selective subscriptions** with proper unsubscription
- **Computed signals** for efficient recalculation
- **RxJS operators** for optimized data flow

## Testing Strategy

### 1. Unit Testing
- **Jasmine/Karma** setup
- **Component testing** with TestBed
- **Service testing** with dependency injection
- **Store testing** with signal stores

### 2. Code Quality
- **TypeScript strict mode** enabled
- **Linting** with ESLint
- **Consistent formatting** standards

## Security Considerations

### 1. Authentication
- **Token-based authentication** 
- **Secure cookie storage**
- **Route guards** for protected routes

### 2. Data Protection
- **Type safety** with TypeScript
- **Input validation** with reactive forms
- **XSS protection** with Angular sanitization

## Deployment Ready Features

### 1. Environment Configuration
- **Multi-environment** support
- **Configuration injection** tokens
- **Build-time optimization**

### 2. Production Optimizations
- **Minification** and bundling
- **Compression** support
- **Cache busting** strategies

## Future Extensibility

### 1. Modular Architecture
- **Plugin-based** component system
- **Feature modules** for easy extension
- **Library packaging** for reusability

### 2. State Management
- **Signal stores** for modern reactivity
- **Effect management** for side effects
- **DevTools integration** for debugging

This architecture demonstrates modern Angular best practices with a focus on:
- **Scalability** through modular design
- **Maintainability** through consistent patterns
- **Performance** through optimization strategies
- **Developer Experience** through proper tooling and structure
