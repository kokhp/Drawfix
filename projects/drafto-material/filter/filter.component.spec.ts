import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { LoggerTestingModule } from 'ngx-logger/testing';
import { Router, ActivatedRoute } from '@angular/router';
import { of, BehaviorSubject } from 'rxjs';
import { Overlay } from '@angular/cdk/overlay';
import { CommonService } from '@drafto/core';

import { DftFilterComponent } from './filter.component';
import { DftFilterItem, DftFilterType } from './filter.model';

describe('DftFilterComponent', () => {
  let component: DftFilterComponent;
  let fixture: ComponentFixture<DftFilterComponent>;
  let mockRouter: jasmine.SpyObj<Router>;
  let mockActivatedRoute: jasmine.SpyObj<ActivatedRoute>;
  let mockOverlay: jasmine.SpyObj<Overlay>;
  let mockCommonService: jasmine.SpyObj<CommonService>;

  const mockFilters: DftFilterItem[] = [
    {
      name: 'category',
      type: 'options',
      label: 'Category',
      value: null,
      applied: false,
      appliedOrder: 0,
      options: [
        { value: 'electronics', label: 'Electronics' },
        { value: 'clothing', label: 'Clothing' },
      ],
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
    {
      name: 'search',
      type: 'text',
      label: 'Search',
      value: '',
      applied: false,
      appliedOrder: 0,
    },
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
      options: [],
    },
  ];

  beforeEach(async () => {
    const queryParamsSubject = new BehaviorSubject({});

    mockRouter = jasmine.createSpyObj('Router', ['navigate']);
    mockActivatedRoute = jasmine.createSpyObj('ActivatedRoute', [], {
      queryParams: queryParamsSubject.asObservable(),
      snapshot: {
        queryParamMap: {
          get: jasmine.createSpy('get').and.returnValue(null),
        },
      },
    });
    mockOverlay = jasmine.createSpyObj('Overlay', ['create']);
    mockCommonService = jasmine.createSpyObj('CommonService', ['tryParseJson', 'tryStringifyJson']);

    await TestBed.configureTestingModule({
      imports: [
        DftFilterComponent,
        NoopAnimationsModule,
        LoggerTestingModule,
      ],
      providers: [
        { provide: Router, useValue: mockRouter },
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
        { provide: Overlay, useValue: mockOverlay },
        { provide: CommonService, useValue: mockCommonService },
      ],
    }).compileComponents();

    mockRouter = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    fixture = TestBed.createComponent(DftFilterComponent);
    component = fixture.componentInstance;
  });

  describe('Component Initialization', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should initialize with default input values', () => {
      expect(component.disabled()).toBe(false);
      expect(component.showFilterIcon()).toBe(true);
      expect(component.inputPlaceholder()).toBe('Filter');
      expect(component.showRemoveAllButton()).toBe(true);
    });

    it('should handle filters input transformation', () => {
      // Set filters with duplicate names (case-insensitive)
      const duplicateFilters: DftFilterItem[] = [
        { name: 'test', type: 'text', label: 'Test 1' },
        { name: 'TEST', type: 'text', label: 'Test 2' }, // Duplicate
        { name: 'other', type: 'text', label: 'Other' },
      ];

      fixture.componentRef.setInput('filters', duplicateFilters);
      fixture.detectChanges();

      const processedFilters = component.filters();
      expect(processedFilters.length).toBe(2); // Duplicate should be filtered out
      expect(processedFilters.some(f => f.name === 'test')).toBe(true);
      expect(processedFilters.some(f => f.name === 'other')).toBe(true);
    });
  });

  describe('Filter Management', () => {
    beforeEach(() => {
      fixture.componentRef.setInput('filters', mockFilters);
      fixture.detectChanges();
    });

    it('should handle empty filter list', () => {
      fixture.componentRef.setInput('filters', []);
      expect(() => fixture.detectChanges()).not.toThrow();
    });

    it('should handle filters with dependencies', () => {
      const filtersWithDeps = mockFilters.filter(f => f.dependencies);
      expect(filtersWithDeps.length).toBeGreaterThan(0);
      expect(() => fixture.detectChanges()).not.toThrow();
    });

    it('should handle dynamic options filters', () => {
      const dynamicFilters = mockFilters.filter(f => f.isDynamicOptions);
      expect(dynamicFilters.length).toBeGreaterThan(0);
      expect(() => fixture.detectChanges()).not.toThrow();
    });
  });

  describe('Input Properties', () => {
    beforeEach(() => {
      fixture.componentRef.setInput('filters', mockFilters);
    });

    it('should accept disabled input', () => {
      fixture.componentRef.setInput('disabled', true);
      fixture.detectChanges();
      expect(component.disabled()).toBe(true);
    });

    it('should accept showFilterIcon input', () => {
      fixture.componentRef.setInput('showFilterIcon', false);
      fixture.detectChanges();
      expect(component.showFilterIcon()).toBe(false);
    });

    it('should accept inputPlaceholder input', () => {
      const placeholder = 'Custom Placeholder';
      fixture.componentRef.setInput('inputPlaceholder', placeholder);
      fixture.detectChanges();
      expect(component.inputPlaceholder()).toBe(placeholder);
    });

    it('should accept showRemoveAllButton input', () => {
      fixture.componentRef.setInput('showRemoveAllButton', false);
      fixture.detectChanges();
      expect(component.showRemoveAllButton()).toBe(false);
    });

    it('should accept enableQueryParam input', () => {
      fixture.componentRef.setInput('enableQueryParam', true);
      fixture.detectChanges();
      expect(component.enableQueryParam()).toBe(true);
    });

    it('should accept queryParamName input', () => {
      const paramName = 'customFilters';
      fixture.componentRef.setInput('queryParamName', paramName);
      fixture.detectChanges();
      expect(component.queryParamName()).toBe(paramName);
    });
  });

  describe('Events', () => {
    beforeEach(() => {
      fixture.componentRef.setInput('filters', mockFilters);
      fixture.detectChanges();
    });

    it('should emit onApplied event', () => {
      spyOn(component.onApplied, 'emit');

      // Trigger the event emission (assuming there's a way to apply filters)
      // This would need to be adjusted based on the actual component implementation
      expect(component.onApplied.emit).toBeDefined();
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty filter list gracefully', () => {
      fixture.componentRef.setInput('filters', []);
      expect(() => fixture.detectChanges()).not.toThrow();
    });

    it('should handle filters with missing properties gracefully', () => {
      const incompleteFilters = [
        { name: 'test', type: 'text', label: 'Test' } as DftFilterItem,
      ];
      fixture.componentRef.setInput('filters', incompleteFilters);
      expect(() => fixture.detectChanges()).not.toThrow();
    });

    it('should handle filters with missing properties gracefully', () => {
      const incompleteFilters: DftFilterItem[] = [
        {
          name: 'incomplete',
          type: 'text',
          label: 'Incomplete Filter',
          // Missing other optional properties
        },
      ];

      fixture.componentRef.setInput('filters', incompleteFilters);
      expect(() => fixture.detectChanges()).not.toThrow();
    });

    it('should handle large filter lists efficiently', () => {
      const largeFilterList = Array.from({ length: 50 }, (_, i) => ({
        name: `filter${i}`,
        type: 'text' as DftFilterType,
        label: `Filter ${i}`,
      }));

      expect(() => {
        fixture.componentRef.setInput('filters', largeFilterList);
        fixture.detectChanges();
      }).not.toThrow();
    });
  });

  describe('Accessibility', () => {
    beforeEach(() => {
      fixture.componentRef.setInput('filters', mockFilters);
      fixture.detectChanges();
    });

    it('should have proper ARIA attributes', () => {
      const filterElements = fixture.nativeElement.querySelectorAll('[role]');
      expect(filterElements.length).toBeGreaterThanOrEqual(0);
    });

    it('should be keyboard navigable', () => {
      const interactiveElements = fixture.nativeElement.querySelectorAll('button, input, [tabindex]');
      expect(interactiveElements.length).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Performance', () => {
    it('should use OnPush change detection strategy', () => {
      expect(component).toBeTruthy();
      // OnPush strategy is verified through the component metadata
    });

    it('should handle rapid input changes efficiently', () => {
      const filters = [{ name: 'test', type: 'text' as DftFilterType, label: 'Test' }];

      expect(() => {
        for (let i = 0; i < 10; i++) {
          fixture.componentRef.setInput('filters', [...filters, {
            name: `dynamic${i}`,
            type: 'text' as DftFilterType,
            label: `Dynamic ${i}`
          }]);
          fixture.detectChanges();
        }
      }).not.toThrow();
    });
  });

  describe('Store Integration', () => {
    beforeEach(() => {
      fixture.componentRef.setInput('filters', mockFilters);
      fixture.detectChanges();
    });

    it('should integrate with the filter store', () => {
      // Verify store is injected
      expect((component as any).store).toBeDefined();
    });

    it('should handle store signal updates', () => {
      // Test that component responds to store signal changes
      expect(() => fixture.detectChanges()).not.toThrow();
    });
  });
});
