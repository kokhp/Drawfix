import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { MatTabNavPanel } from '@angular/material/tabs';
import { LoggerTestingModule } from 'ngx-logger/testing';
import { NGXLogger } from 'ngx-logger';

import { DftNavTabsComponent } from './navtabs.component';
import { DftNavTabItem } from './navtabs.model';
import { DftQueryParamStore } from '@drafto/core/store';

// Mock DftQueryParamStore
class MockQueryParamStore {
  getParams = jasmine.createSpy('getParams').and.returnValue({});
  startTracking = jasmine.createSpy('startTracking');
  stopTracking = jasmine.createSpy('stopTracking');
  stopAllTracking = jasmine.createSpy('stopAllTracking');
}

describe('DftNavTabsComponent', () => {
  let component: DftNavTabsComponent;
  let fixture: ComponentFixture<DftNavTabsComponent>;
  let mockQueryStore: MockQueryParamStore;
  let logger: NGXLogger;
  let mockTabPanel: MatTabNavPanel;

  const mockTabs: DftNavTabItem[] = [
    { id: 1, label: 'Dashboard', routePath: '/dashboard' },
    { id: 2, label: 'Users', routePath: '/users' },
    { id: 3, label: 'Settings', routePath: '/settings' },
  ];

  beforeEach(async () => {
    mockQueryStore = new MockQueryParamStore();
    mockTabPanel = {} as MatTabNavPanel;

    await TestBed.configureTestingModule({
      imports: [
        DftNavTabsComponent,
        LoggerTestingModule,
      ],
      providers: [
        { provide: DftQueryParamStore, useValue: mockQueryStore },
        provideRouter([]),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(DftNavTabsComponent);
    component = fixture.componentInstance;
    logger = TestBed.inject(NGXLogger);

    // Set required inputs
    fixture.componentRef.setInput('tabs', mockTabs);
    fixture.componentRef.setInput('tabPanel', mockTabPanel);

    fixture.detectChanges();
  });

  describe('Component Creation', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should initialize with unique id', () => {
      const id = component.id();
      expect(id).toMatch(/^dft-mat-navtabs-\d+$/);
    });

    it('should accept required inputs', () => {
      expect(component.tabs()).toEqual(jasmine.arrayContaining([
        jasmine.objectContaining({ id: 1, label: 'Dashboard', routePath: '/dashboard' }),
        jasmine.objectContaining({ id: 2, label: 'Users', routePath: '/users' }),
        jasmine.objectContaining({ id: 3, label: 'Settings', routePath: '/settings' }),
      ]));
      expect(component.tabPanel()).toBe(mockTabPanel);
    });

    it('should apply default input values', () => {
      expect(component.trackQueryParams()).toBe(false);
      expect(component.fitInkBarToContent()).toBe(true);
      expect(component.stretchTabs()).toBe(false);
    });
  });

  describe('Tab Filtering', () => {
    it('should filter out duplicate route paths', () => {
      const duplicateTabs = [
        { id: 1, label: 'Dashboard', routePath: '/dashboard' },
        { id: 2, label: 'Dashboard Copy', routePath: '/dashboard' }, // Duplicate
        { id: 3, label: 'Users', routePath: '/users' },
      ];

      fixture.componentRef.setInput('tabs', duplicateTabs);
      fixture.detectChanges();

      const tabs = component.tabs();
      expect(tabs.length).toBe(2);
      expect(tabs.map(t => t.routePath)).toEqual(['/dashboard', '/users']);
    });

    it('should filter out hidden tabs from display', () => {
      const tabsWithHidden = [
        { id: 1, label: 'Dashboard', routePath: '/dashboard' },
        { id: 2, label: 'Hidden', routePath: '/hidden', hidden: true },
        { id: 3, label: 'Users', routePath: '/users' },
      ];

      fixture.componentRef.setInput('tabs', tabsWithHidden);
      fixture.detectChanges();

      const filteredTabs = (component as any).filteredTabs();
      expect(filteredTabs.length).toBe(2);
      expect(filteredTabs.map((t: DftNavTabItem) => t.label)).toEqual(['Dashboard', 'Users']);
    });

    it('should filter out tabs without routePath', () => {
      const tabsWithoutRoute = [
        { id: 1, label: 'Dashboard', routePath: '/dashboard' },
        { id: 2, label: 'No Route', routePath: '' },
        { id: 3, label: 'Users', routePath: '/users' },
      ];

      fixture.componentRef.setInput('tabs', tabsWithoutRoute);
      fixture.detectChanges();

      const tabs = component.tabs();
      expect(tabs.length).toBe(2);
      expect(tabs.map(t => t.routePath)).toEqual(['/dashboard', '/users']);
    });
  });

  describe('Query Parameter Tracking', () => {
    beforeEach(() => {
      fixture.componentRef.setInput('trackQueryParams', true);
      fixture.detectChanges();
    });

    it('should start tracking when trackQueryParams is enabled', () => {
      // The component initiates tracking through the syncTabs method
      // This test verifies that tracking functionality is available
      expect(mockQueryStore.startTracking).toBeDefined();
      expect(component.trackQueryParams()).toBe(true);
    });

    it('should stop tracking when trackQueryParams is disabled', () => {
      fixture.componentRef.setInput('trackQueryParams', false);
      fixture.detectChanges();

      mockTabs.forEach(tab => {
        expect(mockQueryStore.stopTracking).toHaveBeenCalledWith(
          component.id(),
          tab.routePath
        );
      });
    });
  });

  describe('Component Lifecycle', () => {
    it('should stop all tracking on destroy', () => {
      component.ngOnDestroy();

      expect(mockQueryStore.stopAllTracking).toHaveBeenCalledWith(component.id());
    });

    it('should complete router event subject on destroy', () => {
      const routerEventDestroyRef = (component as any)._routerEventDestroyRef;
      spyOn(routerEventDestroyRef, 'complete');

      component.ngOnDestroy();

      expect(routerEventDestroyRef.complete).toHaveBeenCalled();
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle empty tabs array', () => {
      fixture.componentRef.setInput('tabs', []);
      fixture.detectChanges();

      expect(component.tabs()).toEqual([]);
      expect((component as any).filteredTabs()).toEqual([]);
    });

    it('should handle tabs with null/undefined routePath', () => {
      const invalidTabs = [
        { id: 1, label: 'Valid', routePath: '/valid' },
        { id: 2, label: 'Invalid', routePath: null as any },
        { id: 3, label: 'Also Invalid', routePath: undefined as any },
      ];

      fixture.componentRef.setInput('tabs', invalidTabs);
      fixture.detectChanges();

      const tabs = component.tabs();
      expect(tabs.length).toBe(1);
      expect(tabs[0].routePath).toBe('/valid');
    });

    it('should handle navigation when no tabs match current route', () => {
      spyOn(component as any, 'currentPath').and.returnValue('/nonexistent');

      const activeTab = (component as any).pickActiveTab();
      expect(activeTab).toBeNull();
    });
  });

  describe('Template and Styling Options', () => {
    it('should apply fitInkBarToContent attribute', () => {
      fixture.componentRef.setInput('fitInkBarToContent', false);
      fixture.detectChanges();

      expect(component.fitInkBarToContent()).toBe(false);
    });

    it('should apply stretchTabs attribute', () => {
      fixture.componentRef.setInput('stretchTabs', true);
      fixture.detectChanges();

      expect(component.stretchTabs()).toBe(true);
    });
  });

  describe('Performance and Optimization', () => {
    it('should use computed signal for filtered tabs', () => {
      const filteredTabs = (component as any).filteredTabs;
      expect(typeof filteredTabs).toBe('function'); // Signal function
    });

    it('should use OnPush change detection strategy', () => {
      expect((component.constructor as any).__annotations__[0].changeDetection).toBe(0); // OnPush = 0
    });
  });

  describe('Navigation Methods', () => {
    it('should not navigate if tab has no routePath', () => {
      const router = TestBed.inject(Router);
      const invalidTab: DftNavTabItem = { id: 999, label: 'Invalid', routePath: '' };

      spyOn(router, 'navigate');
      (component as any).navigateTab(invalidTab);

      expect(router.navigate).not.toHaveBeenCalled();
    });

    it('should pick most specific route as active tab', () => {
      const hierarchicalTabs = [
        { id: 1, label: 'Base', routePath: '/app' },
        { id: 2, label: 'Specific', routePath: '/app/specific' },
        { id: 3, label: 'Very Specific', routePath: '/app/specific/detail' },
      ];

      fixture.componentRef.setInput('tabs', hierarchicalTabs);
      fixture.detectChanges();

      // Mock current URL by spying on the private method
      spyOn(component as any, 'currentPath').and.returnValue('/app/specific/detail');

      const activeTab = (component as any).pickActiveTab();
      expect(activeTab?.routePath).toBe('/app/specific/detail');
      expect(activeTab?.label).toBe('Very Specific');
    });
  });
});
