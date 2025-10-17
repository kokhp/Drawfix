import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  inject,
  OnInit,
  signal,
  viewChild,
  ViewEncapsulation,
} from '@angular/core';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatCard } from '@angular/material/card';
import { MatIcon } from '@angular/material/icon';
import { MatTooltip } from '@angular/material/tooltip';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { NGXLogger } from 'ngx-logger';
import { DFT_MAT_FILTER_DISPOSED, DFT_MAT_FILTER_ITEM } from '../filter.token';
import {
  MatError,
  MatFormField,
  MatSuffix,
} from '@angular/material/form-field';
import { MatOption, MatSelect } from '@angular/material/select';
import { MatInput } from '@angular/material/input';
import { DftFilterCompareType, DftFilterOption } from '../filter.model';
import { MatNativeDateModule } from '@angular/material/core';
import {
  MatDatepicker,
  MatDatepickerInput,
  MatDatepickerInputEvent,
  MatDatepickerToggle,
} from '@angular/material/datepicker';
import { DftValidators } from '@drafto/core/forms';
import { KeyValuePipe } from '@angular/common';
import { DftFilterCompareTypes } from '../filter.constants';

const TAG = '[DftFilterCompareComponent]:';

/**
 * DftFilterCompareComponent is a filter comparison component that allows users
 * to select and apply comparison-based filters.
 *
 * This component supports various input types, form validation, and auto-focus.
 * It emits an event when the filter is applied or closed.
 */
@Component({
  selector: 'dft-mat-filter-compare',
  imports: [
    MatCard,
    MatIcon,
    MatIconButton,
    MatTooltip,
    FormsModule,
    MatButton,
    MatFormField,
    MatSelect,
    MatOption,
    MatInput,
    MatNativeDateModule,
    MatDatepicker,
    MatDatepickerToggle,
    MatDatepickerInput,
    ReactiveFormsModule,
    MatSuffix,
    MatError,
    KeyValuePipe,
  ],
  host: { '[class.dft-mat-filter-compare]': 'true' },
  templateUrl: './compare.component.html',
  styleUrl: './compare.component.scss',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DftFilterCompareComponent implements OnInit, AfterViewInit {
  /**
   * Logger instance for debugging and error tracking using `NGXLogger`.
   */
  private readonly _logger = inject(NGXLogger);

  /**
   * Subject to notify when the filter component is closed.
   */
  private readonly _onClosed$ = inject(DFT_MAT_FILTER_DISPOSED);

  /**
   * Reference to the input element used for number input.
   */
  private readonly inputElement = viewChild<ElementRef>('numberInput');

  /**
   * List of validators applied to input fields.
   */
  private _validators: ValidatorFn[] = [];

  /**
   * Initializes the filter component, sets up validators, and restores saved values.
   */
  ngOnInit(): void {
    let activeOption = this.filterItem.options?.[0];
    if (
      this.filterItem.value?.name &&
      DftFilterCompareTypes.includes(this.filterItem.value.name)
    ) {
      activeOption =
        this.filterItem.options?.find(
          (x) =>
            x.value === (this.filterItem.value.name as DftFilterCompareType)
        ) ?? activeOption;
    }

    this.selectValue.set(activeOption);
    this.formGroup.reset();
    this._validators = this.filterItem.validators
      ? Array.isArray(this.filterItem.validators)
        ? [...this.filterItem.validators]
        : [this.filterItem.validators]
      : [Validators.required];

    let inputOneValue = this.filterItem.value?.value;
    let inputTwoValue;
    if (this.isBetweenType() && (inputOneValue as string[]).length == 2) {
      inputOneValue = this.filterItem.value.value[0];
      inputTwoValue = this.filterItem.value.value[1];
    }

    if (this.filterItem.datePicker) {
      this.isDateType.set(true);
      this._validators.push(DftValidators.date);
      inputOneValue = new Date(inputOneValue);
      if (inputTwoValue) {
        inputTwoValue = new Date(inputTwoValue);
      }
    } else {
      this._validators.push(Validators.pattern(/^[0-9]+$/));
    }

    this.formGroup.controls.inputOne.setValidators(this._validators);
    this.formGroup.controls.inputOne.setValue(inputOneValue);
    this._toggleInputTwoValidation(inputTwoValue);

    this._logger.debug(
      TAG,
      'Init',
      `One:${inputOneValue}`,
      `Two:${inputTwoValue}`
    );
  }

  /**
   * Focuses the input element after the view is initialized.
   */
  ngAfterViewInit(): void {
    setTimeout(() => {
      if (this.inputElement()?.nativeElement) {
        this.inputElement()?.nativeElement.focus();
      }
    });
  }

  /**
   * Form group containing the input fields for the filter.
   */
  protected formGroup = new FormGroup({
    inputOne: new FormControl<string | Date>(''),
    inputTwo: new FormControl<string | Date>(''),
  });

  /**
   * Injected filter item containing filter metadata and values.
   */
  protected readonly filterItem = inject(DFT_MAT_FILTER_ITEM);

  /**
   * Signal indicating whether the selected filter type requires two inputs (e.g., "Between").
   */
  protected readonly isBetweenType = computed(
    () => this.selectValue()?.value === DftFilterCompareType.Btw
  );

  /**
   * Selected filter option.
   */
  protected readonly selectValue = signal<DftFilterOption | undefined>(
    undefined
  );

  /**
   * Signal indicating whether the input fields should be treated as date fields.
   */
  protected readonly isDateType = signal(false);

  /**
   * Toggles validation rules for the second input field based on the selected filter type.
   * @param value Optional initial value for the second input field.
   */
  private _toggleInputTwoValidation(value?: string | Date): void {
    if (this.isBetweenType()) {
      this.formGroup.controls.inputTwo.setValidators(this._validators);
      this.formGroup.setValidators(
        DftValidators.range('inputOne', 'inputTwo', this.isDateType())
      );
    } else {
      this.formGroup.controls.inputTwo.clearValidators();
      this.formGroup.clearValidators();
    }

    this.formGroup.controls.inputTwo.reset();
    this.formGroup.controls.inputTwo.setValue(value ?? null);
    this.formGroup.updateValueAndValidity();
  }

  //#region Methods

  /**
   * Applies the selected filter criteria and emits the selected filter values.
   */
  protected applyClick(): void {
    if (this.formGroup.invalid) {
      this.formGroup.setErrors({
        invalid: { message: 'Invalid input. Please check your data.' },
      });
      return;
    }

    let value: any = this.formGroup.controls.inputOne.value;
    if (this.isBetweenType()) {
      value = [
        this.formGroup.controls.inputOne.value,
        this.formGroup.controls.inputTwo.value,
      ];
    }

    this.filterItem.value = {
      name: this.selectValue()?.value,
      value,
    };
    this._onClosed$.next(this.filterItem);
  }

  /**
   * Closes the filter without applying any changes.
   */
  protected closeClick(): void {
    this._onClosed$.next(null);
  }

  /**
   * Handles changes in the selected filter type and updates validation rules accordingly.
   */
  protected onSelectChanged(): void {
    this._toggleInputTwoValidation();
  }

  /**
   * Handles changes in the start date and resets the end date if it's earlier than the start date.
   * @param event The datepicker event containing the selected date.
   */
  protected onStartDateChanged(event: MatDatepickerInputEvent<Date>) {
    const endDate = this.formGroup.controls.inputTwo.value as Date;
    if (endDate && event.value && endDate < event.value) {
      this.formGroup.controls.inputTwo.reset();
      this.formGroup.controls.inputTwo.updateValueAndValidity();
    }
  }
  //#endregion
}
