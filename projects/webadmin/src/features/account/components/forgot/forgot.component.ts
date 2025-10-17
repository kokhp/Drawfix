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
import { NgOtpInputConfig, NgOtpInputModule } from 'ng-otp-input';
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
import { APP_PATH } from '../../../../constants/app.constants';

export declare type ForgotRecoveryMode = 'phone' | 'email';

@Component({
  selector: 'dftwa-forgot',
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
  ],
  templateUrl: './forgot.component.html',
  styleUrl: './forgot.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export default class ForgotComponent {
  private _logger = inject(NGXLogger);

  isBusy = signal(false);
  nextQueryParams = signal<any>(null);
  recoveryMode = signal<ForgotRecoveryMode>('phone');
  signinPhoneUrl = `/${APP_PATH.ACCOUNTS.PARENT}/${APP_PATH.ACCOUNTS.SIGNIN.PARENT}/${APP_PATH.ACCOUNTS.SIGNIN.PHONE}`;
  signinPassowrdUrl = `/${APP_PATH.ACCOUNTS.PARENT}/${APP_PATH.ACCOUNTS.SIGNIN.PARENT}/${APP_PATH.ACCOUNTS.SIGNIN.PASSWORD}`;

  //#region FormOtpForgot

  formPhoneRecovery: FormGroup = new FormGroup({
    phoneNumber: new FormControl('9771793703'),
  });

  isOtpVerifyForm = signal(false);
  otpInputConfig: NgOtpInputConfig = {
    length: 6,
    allowNumbersOnly: true,
    inputClass: 'input-box',
  };
  otpValue?: string;
  otpResendInterval: number = 30000;
  async onOtpChange(otp: any): Promise<void> {
    this._logger.debug('onOtpChange', otp);
    this.otpValue = otp;
    await this.onSubmitOtpClick();
  }

  async onSubmitOtpClick(): Promise<void> {}

  //#endregion

  //#region FormEmailRecovery

  isVerifyEmailSend = signal(false);
  formEmailRecovery: FormGroup = new FormGroup({
    email: new FormControl(null),
  });
  //#endregion
}
