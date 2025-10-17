import { Component, input } from '@angular/core';
import {
  MatDatepickerModule,
} from '@angular/material/datepicker';
import { MatTimepickerModule } from '@angular/material/timepicker';
import {
  MatFormFieldModule,
} from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'dftwa-expiry-at',
  imports: [
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatIconModule,
    MatTimepickerModule,
  ],
  templateUrl: './expiry-at.component.html',
  styleUrl: './expiry-at.component.scss',
})
export class ExpiryAtComponent {
  labelText = input('Expired At');
  helpText = input(`Set an expiration date for the poster.
      If selected, the poster will no longer be available
      after the specified date and time.
      If left blank, the poster will remain available indefinitely
    `);
}
