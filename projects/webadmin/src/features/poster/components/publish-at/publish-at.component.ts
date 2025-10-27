import {
  ChangeDetectionStrategy,
  Component,
  input,
  numberAttribute,
  OnChanges,
  OnInit,
  output,
  signal,
  SimpleChanges,
  ViewEncapsulation,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  MatDatepicker,
  MatDatepickerInput,
  MatDatepickerInputEvent,
  MatDatepickerModule,
  MatDatepickerToggle,
  MatDatepickerToggleIcon,
} from '@angular/material/datepicker';
import { MatFormField } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatInput, MatSuffix } from '@angular/material/input';
import {
  MatAutocomplete,
  MatAutocompleteTrigger,
  MatOption,
} from '@angular/material/autocomplete';
import { MatRipple } from '@angular/material/core';
import { DatePipe } from '@angular/common';
import { MatButton } from '@angular/material/button';

function generateTimeOptions(interval: number = 5): string[] {
  const times: string[] = [];
  const period = ['AM', 'PM'];

  for (let i = 0; i < 24; i++) {
    const hour = i % 12 || 12; // Converts 24-hour to 12-hour format, keeping 12 instead of 0
    const suffix = period[Math.floor(i / 12)];

    for (let j = 0; j < 60; j += interval) {
      times.push(`${hour}:${j.toString().padStart(2, '0')} ${suffix}`);
    }
  }

  return times;
}

@Component({
  selector: 'dftwa-publish-at',
  imports: [
    MatButton,
    MatRipple,
    MatInput,
    FormsModule,
    MatIcon,
    DatePipe,
    MatSuffix,
    MatDatepickerModule,
    MatDatepickerInput,
    MatFormField,
    MatAutocomplete,
    MatAutocompleteTrigger,
    MatOption,
    MatDatepicker,
    MatDatepickerToggle,
    MatDatepickerToggleIcon,
  ],
  templateUrl: './publish-at.component.html',
  styleUrl: './publish-at.component.scss',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PublishAtComponent implements OnInit, OnChanges {
  labelText = input('Published At');
  helpText = input(
    'Select the date and time to publish this poster.' +
      'You can also choose a different publication date in other categories, ' +
      'but it cannot be earlier than this date.'
  );
  nowButtonText = input('Now');
  value = input<Date | null>(null);
  timeOptionInterval = input(5, { transform: numberAttribute });
  onChanges = output<Date | null>();

  ngOnInit(): void {
    this.timeOptions.set(generateTimeOptions(this.timeOptionInterval()));
    const value = this.parseValue(this.value());
    if (value) {
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['timeOptionInterval']) {
    }
  }

  private parseValue(value: any): Date | null {
    if (!value) return null;
    if (value instanceof Date) {
      return isNaN(value.getTime()) ? null : new Date(value.getTime());
    }

    if (typeof value === 'number' && Number.isFinite(value)) {
      return new Date(value);
    }
    if (typeof value === 'string' && value.trim()) {
      const parsedDate = new Date(value);
      return isNaN(parsedDate.getTime()) ? null : parsedDate;
    }
    return null;
  }

  protected readonly timeOptions = signal<string[]>([]);
  protected readonly dateTimeValue = signal<Date | null>(null);
  protected readonly dateValue = signal<string>('Choose a date');

  protected onDateChanges(event: MatDatepickerInputEvent<Date>): void {
    this.dateTimeValue.set(event.value);
  }
}
