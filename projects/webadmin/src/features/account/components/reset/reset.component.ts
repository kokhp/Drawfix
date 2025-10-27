import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
  ViewEncapsulation,
} from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  FormsModule,
} from '@angular/forms';
import { NgOtpInputModule } from 'ng-otp-input';
import { NGXLogger } from 'ngx-logger';

import { MatCardModule } from '@angular/material/card';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatChipsModule } from '@angular/material/chips';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatCheckboxModule } from '@angular/material/checkbox';

@Component({
  selector: 'dftwa-reset',
  imports: [
    RouterModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NgOtpInputModule,
    MatCardModule,
    MatProgressBarModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatGridListModule,
    MatSelectModule,
    MatChipsModule,
    MatButtonToggleModule,
    MatCheckboxModule,
  ],
  templateUrl: './reset.component.html',
  styleUrl: './reset.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export default class ResetComponent {
  private _logger = inject(NGXLogger);

  isBusy = signal(false);
  nextQueryParams = signal<any>(null);
  isPasswordResetSuccess = signal(false);

  formPassword: FormGroup = new FormGroup({
    username: new FormControl(null),
    password: new FormControl(null),
    confirmPassword: new FormControl(null),
  });
  isPasswordVisible = signal(false);

  async onNextClick(): Promise<void> {
    this.isPasswordResetSuccess.set(true);
    this._logger.debug('onNextClick()');
  }

  async onSkipClick(): Promise<void> {
    this._logger.debug('onSkipClick()');
  }

  async onGotoHomeClick(): Promise<void> {
    this._logger.debug('onGotoHomeClick()');
  }
}
