import { AbstractControl, ValidatorFn } from '@angular/forms';

export function dateValidator(): ValidatorFn {
  return (control: AbstractControl) => {
    if (!control.value) return null; // Ignore empty values

    const date = new Date(control.value);
    return isNaN(date.getTime()) ? { invalidDate: true } : null;
  };
}
