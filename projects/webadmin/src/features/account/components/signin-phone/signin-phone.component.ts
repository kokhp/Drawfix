import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
  OnInit,
  signal,
  ViewEncapsulation,
} from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatProgressBar } from '@angular/material/progress-bar';
import { MatChip, MatChipAvatar } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { NgOtpInputConfig, NgOtpInputModule } from 'ng-otp-input';
import { MatFormFieldModule, MatLabel } from '@angular/material/form-field';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Params, Router, RouterLink } from '@angular/router';
import { NGXLogger } from 'ngx-logger';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { toSignal } from '@angular/core/rxjs-interop';
import { ApiError, startCountdown } from '@drafto/core';
import {
  DASHBOARD_PATH,
  OnboardingStore,
  SIGNIN_PASSWORD_PATH,
} from '../../store/onboarding.store';
import { MatProgressSpinner } from '@angular/material/progress-spinner';

const TAG = '[SigninPhoneComponent]:';

@Component({
  selector: 'dftwa-signin-phone',
  imports: [
    RouterLink,
    MatIconModule,
    MatCardModule,
    MatProgressBar,
    MatChip,
    MatChipAvatar,
    FormsModule,
    ReactiveFormsModule,
    MatInputModule,
    MatFormFieldModule,
    MatLabel,
    NgOtpInputModule,
    MatButtonModule,
    MatProgressSpinner,
  ],
  templateUrl: './signin-phone.component.html',
  styleUrl: './signin-phone.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export default class SigninPhoneComponent implements OnInit {
  private readonly _fb = inject(FormBuilder);
  private readonly _logger = inject(NGXLogger);
  private readonly _router = inject(Router);

  private otpResendCountdownFn?: () => void;

  protected readonly store = inject(OnboardingStore);
  protected readonly form: FormGroup;

  constructor() {
    this.form = this._fb.group({
      dialcode: [this.store.dialcode?.() ?? '+91', [Validators.required]],
      phoneNumber: [
        this.store.phoneNumber?.(),
        [Validators.required, Validators.pattern('^[0-9]*$')],
      ],
    });

    const formValueSignal = toSignal(this.form.valueChanges, {
      initialValue: this.form.value,
    });

    /**
     * Effect to update sign-in query parameters.
     * - Combines the form's phone number and store's redirect URL.
     * - Updates `signInPasswordQueryParams` signal with the current values.
     */
    effect(() => {
      const formValue = formValueSignal();
      const redirectUrl = this.store.redirectUrl?.();
      this.signInPasswordQueryParams.set({
        ...(formValue.phoneNumber && {
          username: `${formValue.dialcode?.replace(/^\+/, '') || ''}${
            formValue.phoneNumber
          }`,
        }),
        ...(redirectUrl && { redirectUrl }),
      });
    });

    /**
     * Effect to handle API validation errors and update the form state accordingly.
     *
     * This effect monitors `verifyPhoneError` from the store and updates the Angular form:
     * 1. If there is **no error**, it enables the form and clears any existing validation errors.
     * 2. If the error is an instance of `ApiError` and contains field-specific errors (`details.errors`):
     *    - Iterates over each field error.
     *    - Sets the corresponding form control's error using `{ api: errorMessage }`.
     *    - Ensures the user sees validation feedback for the specific fields.
     * 3. If the error is not field-specific:
     *    - Sets a general form-level error using `form.setErrors` with a default fallback message.
     *
     * Side effects:
     * - Enables the form to allow user input regardless of error state.
     * - Updates form controls and form-level errors based on the API response.
     */
    effect(() => {
      const error = this.store.verifyPhoneError?.();
      this.form.enable();
      if (!error) {
        this.form.setErrors(null);
        return;
      }

      if (error && error instanceof ApiError && error.details.errors) {
        error.details.errors.forEach((err) => {
          const control = this.form.get(err.field);
          control?.setErrors({ api: err.message || 'Invalid value' });
        });
        return;
      }

      this.form.setErrors({
        api: error.message || 'Something went wrong. Please try again.',
      });
    });

    /**
     * Effect that reacts to changes in phone verification state.
     * - Starts OTP resend countdown if state is 'otp'.
     * - Otherwise, enables the form, cancels any countdown, and updates UI state.
     * - Logs state changes for debugging.
     */
    effect(() => {
      const state = this.store.verifyPhoneState?.();
      this._logger.debug(TAG, 'State changed', state);
      if (state === 'otp') {
        this.startResendOtpCountdown();
        return;
      }

      this.form.enable();
      this.otpResendCountdownFn?.();
      this.isOtpVerifyForm.set(false);
    });

    /**
     * Effect to manage OTP resend state.
     * - Starts the resend countdown if `verifyPhoneOtpResendAt` is set.
     * - Otherwise, enables the OTP input for user interaction.
     */
    effect(() => {
      if (this.store.verifyPhoneOtpResendAt?.()) {
        this.startResendOtpCountdown();
        return;
      }
      this.otpInputDisable.set(false);
    });

    effect(() => {
      if (this.store.isAuthenticated()) {
        this.store.setBusy(true);
        this.otpInputDisable.set(true);
        const redirectUrl = this.store.redirectUrl?.() || DASHBOARD_PATH;
        this._logger.debug(TAG, 'Redirecting to:', redirectUrl);
        this._router.navigateByUrl(redirectUrl);
      }
    });
  }

  isBusy = this.store.isBusy;
  signInPassowrdPath = SIGNIN_PASSWORD_PATH;
  signInPasswordQueryParams = signal<Params>({});

  otpValue?: string;
  isOtpVerifyForm = signal(false);
  otpInputConfig: NgOtpInputConfig = {
    length: this.store.phoneOtpLength(),
    allowNumbersOnly: true,
    inputClass: 'input-box',
  };
  otpInputDisable = signal(false);
  otpResendCountdown = signal(0);
  otpResendBanned = this.store.verifyPhoneResendBanned;

  ngOnInit(): void {}

  private startResendOtpCountdown(): void {
    this.otpValue = undefined;
    this.isOtpVerifyForm.set(true);
    this.otpInputDisable.set(false);
    this.otpResendCountdownFn?.();
    this.otpResendCountdownFn = startCountdown(
      this.store.phoneOtpResendInterval() * 1000,
      this.otpResendCountdown, // WritableSignal<number>
      1000, // tick every second
      (ms) => Math.ceil(ms / 1000) // map ms → secs
    );
  }

  protected onOtpChange(otp: any): void {
    this._logger.debug('onOtpChange', otp);
    this.otpValue = otp;
    if (otp && otp.length == this.store.phoneOtpLength()) {
      this.onSubmitOtpClick();
    }
  }

  protected onSubmitOtpClick(): void {
    const otp = this.otpValue;
    if (!otp || otp.length !== this.store.phoneOtpLength()) {
      this.store.toast('Please enter a valid OTP', true);
      return;
    }

    this.otpInputDisable.set(true);
    this.store.submitPhoneOtp(otp);
  }

  protected onNextClick(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.form.disable();
    const { dialcode, phoneNumber } = this.form.getRawValue();
    this._logger.debug(TAG, 'onNextClick', { dialcode, phoneNumber });
    this.store.loginWithPhone({ dialcode, phoneNumber });
  }

  protected onResendOtpClick(): void {
    if (this.otpResendCountdown() > 0) {
      return;
    }

    this.otpInputDisable.set(true);
    this.store.resendPhoneOtp(this.otpResendBanned());
  }
}
