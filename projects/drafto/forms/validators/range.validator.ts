import { AbstractControl, ValidatorFn } from '@angular/forms';

/**
 * A custom validator function for comparing two fields in a FormGroup to ensure
 * the start value is less than or equal to the end value. Can validate both
 * numeric and date ranges.
 *
 * @param {string} startField - The name of the control representing the start value.
 * @param {string} endField - The name of the control representing the end value.
 * @param {boolean} isDate - Whether the values should be treated as dates.
 * @returns {ValidatorFn} A validator function to be used in a FormGroup.
 */
export function rangeValidator(
  startField: string,
  endField: string,
  isDate: boolean
): ValidatorFn {
  return (control: AbstractControl) => {
    const startControl = control.get(startField);
    const endControl = control.get(endField);

    if (!startControl || !endControl) {
      return null; // Skip validation if controls are missing
    }

    let startValue: any = startControl.value;
    let endValue: any = endControl.value;

    if (!startValue || !endValue) {
      return null; // Skip validation if either value is missing
    }

    if (isDate) {
      // Convert to Date
      startValue = new Date(startValue);
      endValue = new Date(endValue);

      if (isNaN(startValue.getTime()) || isNaN(endValue.getTime())) {
        return { invalidDate: true }; // Invalid date format
      }
    } else {
      // Convert to Number
      startValue = Number(startValue);
      endValue = Number(endValue);

      if (isNaN(startValue) || isNaN(endValue)) {
        return { invalidNumber: true }; // Invalid number format
      }
    }

    if (startValue > endValue) {
      return { rangeError: true }; // Start should be <= End
    }

    return null; // Validation passed
  };
}
