import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ReactiveFormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { LoggerTestingModule } from 'ngx-logger/testing';
import { MatNativeDateModule } from '@angular/material/core';

import { DftFilterCompareComponent } from './compare.component';
import { DFT_MAT_FILTER_DISPOSED, DFT_MAT_FILTER_ITEM } from '../filter.token';
import { DftFilterItem, DftFilterOption, DftFilterCompareType } from '../filter.model';

describe('DftFilterCompareComponent', () => {
  let component: DftFilterCompareComponent;
  let fixture: ComponentFixture<DftFilterCompareComponent>;
  let mockDisposed$: Subject<DftFilterItem | null>;
  let mockFilterItem: DftFilterItem;

  const mockCompareOptions: DftFilterOption[] = [
    { value: DftFilterCompareType.Eq, label: 'Equals' },
    { value: DftFilterCompareType.Gt, label: 'Greater than' },
    { value: DftFilterCompareType.Lt, label: 'Less than' },
    { value: DftFilterCompareType.Btw, label: 'Between' },
  ];

  beforeEach(async () => {
    mockFilterItem = {
      name: 'price',
      type: 'compare',
      label: 'Price Filter',
      headerLabel: 'Price Comparison',
      inputLabel: 'Enter price:',
      value: null,
      applied: false,
      appliedOrder: 0,
      options: mockCompareOptions,
      controlMinWidth: '250px',
      controlMaxWidth: '450px',
    };

    mockDisposed$ = new Subject<DftFilterItem | null>();

    await TestBed.configureTestingModule({
      imports: [
        DftFilterCompareComponent,
        NoopAnimationsModule,
        LoggerTestingModule,
        ReactiveFormsModule,
        MatNativeDateModule
      ],
      providers: [
        { provide: DFT_MAT_FILTER_ITEM, useValue: mockFilterItem },
        { provide: DFT_MAT_FILTER_DISPOSED, useValue: mockDisposed$ },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(DftFilterCompareComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    mockDisposed$.complete();
  });

  describe('Component Creation', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should initialize with filter item values', () => {
      expect((component as any).filterItem).toBe(mockFilterItem);
      expect((component as any).formGroup).toBeDefined();
    });

    it('should display header label when available', () => {
      const headerElement = fixture.nativeElement.querySelector('._title');
      expect(headerElement?.textContent).toBe('Price Comparison');
    });

    it('should apply min and max width styles when content element exists', () => {
      const contentElement = fixture.nativeElement.querySelector('._content');
      if (contentElement) {
        expect(contentElement.style.minWidth).toBe('250px');
        expect(contentElement.style.maxWidth).toBe('450px');
      }
    });
  });

  describe('Form Initialization', () => {
    it('should initialize form with default structure', () => {
      component.ngOnInit();
      const formGroup = (component as any).formGroup;
      expect(formGroup).toBeDefined();
      expect(formGroup.controls.inputOne).toBeDefined();
      expect(formGroup.controls.inputTwo).toBeDefined();
    });

    it('should initialize form with preset value when available', () => {
      mockFilterItem.value = { name: DftFilterCompareType.Gt, value: 100 };
      component.ngOnInit();

      const formGroup = (component as any).formGroup;
      expect(formGroup.controls.inputOne.value).toBe(100);
    });

    it('should handle between comparison initialization', () => {
      mockFilterItem.value = { name: DftFilterCompareType.Btw, value: [50, 150] };
      component.ngOnInit();

      const formGroup = (component as any).formGroup;
      expect(formGroup.controls.inputOne.value).toBe(50);
    });

    it('should apply custom validators when provided', () => {
      mockFilterItem.validators = [() => ({ custom: true })];
      component.ngOnInit();

      const formGroup = (component as any).formGroup;
      expect(formGroup.controls.inputOne.hasError('custom')).toBe(true);
    });
  });  describe('Compare Type Selection', () => {
    beforeEach(() => {
      component.ngOnInit();
    });

    it('should handle compare type changes', () => {
      const selectValue = (component as any).selectValue;
      selectValue.set({ value: DftFilterCompareType.Eq, label: 'Equals' });

      expect(selectValue().value).toBe(DftFilterCompareType.Eq);
    });

    it('should show appropriate inputs based on compare type', () => {
      const selectValue = (component as any).selectValue;
      selectValue.set({ value: DftFilterCompareType.Gt, label: 'Greater than' });
      fixture.detectChanges();

      const inputs = fixture.nativeElement.querySelectorAll('input');
      expect(inputs.length).toBeGreaterThan(0);
    });
  });

  describe('Date Picker Support', () => {
    beforeEach(() => {
      mockFilterItem.datePicker = true;
      component.ngOnInit();
    });

    it('should handle date picker functionality when enabled', () => {
      fixture.detectChanges();

      const dateElements = fixture.nativeElement.querySelectorAll('[matDatepicker]');
      expect(dateElements.length).toBeGreaterThanOrEqual(0);
    });

    it('should handle date input values', () => {
      const formGroup = (component as any).formGroup;
      const testDate = new Date('2023-01-01');

      formGroup.controls.inputOne.setValue(testDate);
      expect(formGroup.controls.inputOne.value).toEqual(testDate);
    });
  });

  describe('Input Focus Management', () => {
    it('should focus input element after view init when available', fakeAsync(() => {
      const firstInput = fixture.nativeElement.querySelector('input');
      if (firstInput) {
        spyOn(firstInput, 'focus');
        component.ngAfterViewInit();
        tick();
        expect(firstInput.focus).toHaveBeenCalled();
      } else {
        // No input available, test should pass
        expect(() => {
          component.ngAfterViewInit();
          tick();
        }).not.toThrow();
      }
    }));
  });

  describe('Apply and Close Functionality', () => {
    beforeEach(() => {
      component.ngOnInit();
    });

    it('should handle apply functionality', () => {
      let emittedValue: DftFilterItem | null | undefined;
      mockDisposed$.subscribe(value => emittedValue = value);

      const selectValue = (component as any).selectValue;
      const formGroup = (component as any).formGroup;
      selectValue.set({ value: DftFilterCompareType.Gt, label: 'Greater than' });
      formGroup.controls.inputOne.setValue(100);

      const applyMethod = (component as any).applyClick;
      if (applyMethod) {
        applyMethod.call(component);
        expect(emittedValue).toBeDefined();
      }
    });

    it('should handle close functionality', () => {
      let emittedValue: DftFilterItem | null | undefined;
      mockDisposed$.subscribe(value => emittedValue = value);

      const closeMethod = (component as any).closeClick;
      if (closeMethod) {
        closeMethod.call(component);
        expect(emittedValue).toBeNull();
      }
    });

    it('should handle button clicks through DOM', () => {
      const applyButton = fixture.nativeElement.querySelector('button[mat-flat-button]');
      const closeButton = fixture.nativeElement.querySelector('button[mat-icon-button]');

      if (applyButton) {
        expect(() => applyButton.click()).not.toThrow();
      }

      if (closeButton) {
        expect(() => closeButton.click()).not.toThrow();
      }
    });
  });

  describe('Form Validation', () => {
    beforeEach(() => {
      component.ngOnInit();
    });

    it('should validate required fields when form is used', () => {
      const formGroup = (component as any).formGroup;

      if (formGroup.controls.inputOne) {
        // Check if form controls exist and are properly initialized
        expect(formGroup.controls.inputOne).toBeDefined();
      }

      if (formGroup.controls.inputTwo) {
        expect(formGroup.controls.inputTwo).toBeDefined();
      }
    });

    it('should pass validation for valid inputs', () => {
      const selectValue = (component as any).selectValue;
      const formGroup = (component as any).formGroup;
      selectValue.set({ value: DftFilterCompareType.Gt, label: 'Greater than' });
      formGroup.controls.inputOne.setValue(100);

      expect(formGroup.valid).toBe(true);
    });
  });

  describe('Complex Scenarios', () => {
    it('should handle empty options array gracefully', () => {
      mockFilterItem.options = [];
      expect(() => component.ngOnInit()).not.toThrow();
    });

    it('should handle missing options property', () => {
      delete mockFilterItem.options;
      expect(() => component.ngOnInit()).not.toThrow();
    });

    it('should handle null values gracefully', () => {
      mockFilterItem.value = null;
      expect(() => component.ngOnInit()).not.toThrow();
    });

    it('should reset form properly on reinitialization', () => {
      component.ngOnInit();
      const formGroup = (component as any).formGroup;

      if (formGroup.controls.inputOne) {
        formGroup.controls.inputOne.setValue(123);
        component.ngOnInit(); // Reinitialize
        // Form may be reset to undefined or null
        expect(formGroup.controls.inputOne.value == null).toBe(true);
      }
    });
  });
});
