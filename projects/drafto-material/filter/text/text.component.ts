import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  inject,
  OnInit,
  viewChild,
  ViewEncapsulation,
} from '@angular/core';
import { DFT_MAT_FILTER_ITEM, DFT_MAT_FILTER_DISPOSED } from '../filter.token';
import { MatCard } from '@angular/material/card';
import { MatIcon } from '@angular/material/icon';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatError, MatFormField } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatButton, MatIconButton } from '@angular/material/button';
import { KeyValuePipe } from '@angular/common';


/**
 * DftFilterTextComponent is a filter input component that allows users
 * to enter and apply text-based filters.
 *
 * This component provides form validation, auto-focus on input, and
 * emits an event when the filter is applied or closed.
 */
@Component({
  selector: 'dft-mat-filter-text',
  imports: [
    MatCard,
    MatIcon,
    MatIconButton,
    ReactiveFormsModule,
    MatFormField,
    MatInput,
    MatError,
    MatButton,
    KeyValuePipe,
  ],
  host: { '[class.dft-mat-filter-text]': 'true' },
  templateUrl: './text.component.html',
  styleUrl: './text.component.scss',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DftFilterTextComponent implements OnInit, AfterViewInit {
  /**
   * Subject to notify when the filter component is closed.
   */
  private readonly _onClosed$ = inject(DFT_MAT_FILTER_DISPOSED);

  /**
   * Reference to the input element inside the template.
   */
  private readonly inputElement = viewChild<ElementRef>('textInput');

  /**
   * Injected filter item containing filter metadata and values.
   */
  protected readonly filterItem = inject(DFT_MAT_FILTER_ITEM);

  /**
   * Form group for handling filter input validation and value binding.
   */
  protected readonly formGroup = new FormGroup({
    query: new FormControl(''),
  });

  /**
   * Initializes the form group with validators and preset values.
   */
  ngOnInit(): void {
    this.formGroup.reset();
    const validators = this.filterItem.validators || [Validators.required];
    this.formGroup.controls.query.setValidators(validators);
    this.formGroup.controls.query.setValue(this.filterItem.value);
    this.formGroup.updateValueAndValidity();
  }

  /**
   * Focuses the input field when the view is initialized.
   */
  ngAfterViewInit(): void {
    setTimeout(() => {
      if (this.inputElement()?.nativeElement) {
        this.inputElement()?.nativeElement.focus();
      }
    });
  }

  /**
   * Applies the entered filter value and emits the closing event.
   */
  protected applyClick(): void {
    if (this.formGroup.invalid) {
      this.formGroup.setErrors({
        invalid: { message: 'Invalid input. Please check your data.' },
      });
      return;
    }
    this.filterItem.value = this.formGroup.controls.query.value;
    this._onClosed$.next(this.filterItem);
  }

  /**
   * Closes the filter component without applying changes.
   */
  protected closeClick(): void {
    this._onClosed$.next(null);
  }
}
