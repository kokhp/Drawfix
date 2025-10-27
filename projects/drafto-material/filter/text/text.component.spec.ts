import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ReactiveFormsModule, Validators } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { Subject } from 'rxjs';
import { HarnessLoader } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { MatInputHarness } from '@angular/material/input/testing';
import { MatButtonHarness } from '@angular/material/button/testing';

import { DftFilterTextComponent } from './text.component';
import { DFT_MAT_FILTER_DISPOSED, DFT_MAT_FILTER_ITEM } from '../filter.token';
import { DftFilterItem } from '../filter.model';

describe('DftFilterTextComponent', () => {
  let component: DftFilterTextComponent;
  let fixture: ComponentFixture<DftFilterTextComponent>;
  let mockDisposed$: Subject<DftFilterItem | null>;
  let mockFilterItem: DftFilterItem;
  let loader: HarnessLoader;

  beforeEach(async () => {
    mockFilterItem = {
      name: 'search',
      type: 'text',
      label: 'Search Filter',
      headerLabel: 'Search Items',
      inputLabel: 'Search for:',
      value: '',
      applied: false,
      appliedOrder: 0,
      controlMinWidth: '200px',
      controlMaxWidth: '400px',
    };

    mockDisposed$ = new Subject<DftFilterItem | null>();

    await TestBed.configureTestingModule({
      imports: [DftFilterTextComponent, ReactiveFormsModule, NoopAnimationsModule],
      providers: [
        { provide: DFT_MAT_FILTER_ITEM, useValue: mockFilterItem },
        { provide: DFT_MAT_FILTER_DISPOSED, useValue: mockDisposed$ },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(DftFilterTextComponent);
    component = fixture.componentInstance;
    loader = TestbedHarnessEnvironment.loader(fixture);
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
      expect(component['filterItem']).toBe(mockFilterItem);
      expect(component['formGroup'].value.query).toBe('');
    });

    it('should display header label', () => {
      const headerElement = fixture.nativeElement.querySelector('._title');
      expect(headerElement.textContent).toBe('Search Items');
    });

    it('should display input label', () => {
      const labelElement = fixture.nativeElement.querySelector('label');
      expect(labelElement.textContent).toBe('Search for:');
    });

    it('should apply min and max width styles', () => {
      const contentElement = fixture.nativeElement.querySelector('._content');
      expect(contentElement.style.minWidth).toBe('200px');
      expect(contentElement.style.maxWidth).toBe('400px');
    });
  });

  describe('Form Initialization', () => {
    it('should initialize form with preset value', () => {
      mockFilterItem.value = 'preset value';
      component.ngOnInit();

      expect(component['formGroup'].controls.query.value).toBe('preset value');
    });

    it('should apply default required validator', () => {
      component.ngOnInit();
      const control = component['formGroup'].controls.query;

      expect(control.hasError('required')).toBe(true);

      control.setValue('test');
      expect(control.hasError('required')).toBe(false);
    });

    it('should apply custom validators when provided', () => {
      mockFilterItem.validators = [Validators.required, Validators.minLength(3)];
      component.ngOnInit();
      const control = component['formGroup'].controls.query;

      control.setValue('ab');
      expect(control.hasError('minlength')).toBe(true);

      control.setValue('abc');
      expect(control.hasError('minlength')).toBe(false);
    });
  });

  describe('Input Focus', () => {
    it('should focus input element after view init', fakeAsync(() => {
      const inputElement = fixture.nativeElement.querySelector('#text-input');
      spyOn(inputElement, 'focus');

      component.ngAfterViewInit();
      tick();

      expect(inputElement.focus).toHaveBeenCalled();
    }));

    it('should handle missing input element gracefully', fakeAsync(() => {
      // Remove input element
      const inputElement = fixture.nativeElement.querySelector('#text-input');
      inputElement.remove();

      expect(() => {
        component.ngAfterViewInit();
        tick();
      }).not.toThrow();
    }));
  });

  describe('User Interactions', () => {
    it('should update form value when user types', async () => {
      const input = await loader.getHarness(MatInputHarness.with({ selector: '#text-input' }));

      await input.setValue('test query');
      expect(component['formGroup'].controls.query.value).toBe('test query');
    });

    it('should trigger apply on Enter key press', async () => {
      spyOn(component, 'applyClick' as any);
      const input = await loader.getHarness(MatInputHarness.with({ selector: '#text-input' }));

      await input.setValue('test');
      // Simulate Enter key press on the native element
      const nativeInput = await input.host();
      await nativeInput.dispatchEvent('keydown', { key: 'Enter' });

      expect(component['applyClick']).toHaveBeenCalled();
    });
  });

  describe('Apply Functionality', () => {
    it('should apply valid filter value', () => {
      let emittedValue: DftFilterItem | null | undefined;
      mockDisposed$.subscribe(value => emittedValue = value);

      component['formGroup'].controls.query.setValue('test search');
      component['applyClick']();

      expect(mockFilterItem.value).toBe('test search');
      expect(emittedValue).toEqual(mockFilterItem);
    });

    it('should not apply invalid form', () => {
      let emittedValue: DftFilterItem | null | undefined;
      mockDisposed$.subscribe(value => emittedValue = value);

      // Form is invalid (required field empty)
      component['formGroup'].controls.query.setValue('');
      component['applyClick']();

      expect(component['formGroup'].errors).toEqual({
        invalid: { message: 'Invalid input. Please check your data.' }
      });
      expect(emittedValue).toBeUndefined();
    });

    it('should handle apply button click', () => {
      spyOn(component, 'applyClick' as any);

      // Set a valid value first
      component['formGroup'].controls.query.setValue('test');
      fixture.detectChanges();

      const applyButton = fixture.nativeElement.querySelector('button[mat-flat-button]');
      applyButton.click();

      expect(component['applyClick']).toHaveBeenCalled();
    });
  });

  describe('Close Functionality', () => {
    it('should emit null when closing without applying', () => {
      let emittedValue: DftFilterItem | null | undefined;
      mockDisposed$.subscribe(value => emittedValue = value);

      component['closeClick']();
      expect(emittedValue).toBeNull();
    });

    it('should handle close button click', async () => {
      spyOn(component, 'closeClick' as any);
      const closeButton = await loader.getHarness(MatButtonHarness.with({ selector: '[matTooltip="Close"]' }));

      await closeButton.click();
      expect(component['closeClick']).toHaveBeenCalled();
    });
  });

  describe('Form Validation Display', () => {
    it('should show validation errors when form is touched and invalid', async () => {
      const input = await loader.getHarness(MatInputHarness.with({ selector: '#text-input' }));

      // Make form touched and invalid
      await input.focus();
      await input.blur();

      fixture.detectChanges();

      const errorElement = fixture.nativeElement.querySelector('._errors');
      expect(errorElement).toBeTruthy();
    });

    it('should display custom validation errors', () => {
      mockFilterItem.validators = [Validators.minLength(5)];
      component.ngOnInit();

      const control = component['formGroup'].controls.query;
      control.setValue('abc');
      control.markAsTouched();

      fixture.detectChanges();

      const errorElement = fixture.nativeElement.querySelector('._errors');
      expect(errorElement).toBeTruthy();
    });
  });

  describe('Complex Scenarios', () => {
    it('should handle multiple apply attempts', () => {
      const emittedValues: (DftFilterItem | null)[] = [];
      mockDisposed$.subscribe(value => emittedValues.push(value));

      // First apply
      component['formGroup'].controls.query.setValue('first search');
      component['applyClick']();

      // Second apply
      component['formGroup'].controls.query.setValue('second search');
      component['applyClick']();

      expect(emittedValues.length).toBe(2);
      expect(emittedValues[0]).toBe(mockFilterItem);
      expect(emittedValues[1]).toBe(mockFilterItem);
      expect(mockFilterItem.value).toBe('second search');
    });

    it('should reset form and maintain validators on reinit', () => {
      mockFilterItem.validators = [Validators.required, Validators.maxLength(10)];

      // First initialization
      component.ngOnInit();
      component['formGroup'].controls.query.setValue('test');

      // Reinitialize
      component.ngOnInit();

      const control = component['formGroup'].controls.query;
      expect(control.value).toBe('');
      expect(control.hasError('required')).toBe(true);

      control.setValue('very long text that exceeds limit');
      expect(control.hasError('maxlength')).toBe(true);
    });

    it('should handle special characters in input', () => {
      let emittedValue: DftFilterItem | null | undefined;
      mockDisposed$.subscribe(value => emittedValue = value);

      const specialText = '!@#$%^&*()_+{}|:"<>?[]\\;\',./ ';
      component['formGroup'].controls.query.setValue(specialText);
      component['applyClick']();

      expect(mockFilterItem.value).toBe(specialText);
      expect(emittedValue).toEqual(mockFilterItem);
    });
  });
});
