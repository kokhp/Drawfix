import { computed, inject } from '@angular/core';
import {
  patchState,
  signalStore,
  withComputed,
  withHooks,
  withMethods,
  withProps,
  withState,
} from '@ngrx/signals';
import { ActivatedRoute } from '@angular/router';
import { NGXLogger } from 'ngx-logger';
import { HttpService } from '@drafto/core/http';
import { ApiError } from '@drafto/core';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { MatSnackBar } from '@angular/material/snack-bar';
import {
  catchError,
  EMPTY,
  finalize,
  pipe,
  switchMap,
  tap,
  throwError,
} from 'rxjs';
import { AuthStore } from '../../../store/auth.store';
import {
  VerifyPhoneResponse,
  VerifyPhoneSubmitResponse,
} from '../models/onboarding.model';
import { APP_PATH } from '../../../constants/app.constants';


export declare type SignInMethod = 'phone' | 'password';
export declare type VerifyPhoneState = 'form' | 'otp';
export declare type RecoveryMode = 'phone' | 'email';

type OnboardingState = {
  isBusy: boolean;
  redirectUrl: string | null;

  dialcode: string | null;
  phoneNumber: string | null;
  verifyPhoneState: VerifyPhoneState;
  verifyPhoneError?: ApiError | Error | null;
  _verifyPhoneResponse?: VerifyPhoneResponse | null;
  verifyPhoneOtpResendAt: Date | null;
  verifyPhoneResendBanned: boolean;
};

const initialState: OnboardingState = {
  isBusy: false,
  redirectUrl: null,

  dialcode: '+91',
  phoneNumber: null,
  verifyPhoneError: null,
  verifyPhoneState: 'form',
  _verifyPhoneResponse: null,
  verifyPhoneOtpResendAt: null,
  verifyPhoneResendBanned: false,
};

const TAG = '[OnboardingStore]:';

export const DASHBOARD_PATH = `/${APP_PATH.DASHBOARD}`;

export const SIGNIN_PASSWORD_PATH = [
  '',
  APP_PATH.ACCOUNTS.PARENT,
  APP_PATH.ACCOUNTS.SIGNIN.PARENT,
  APP_PATH.ACCOUNTS.SIGNIN.PASSWORD,
].join('/');

export const SIGNIN_PHONE_PATH = [
  '',
  APP_PATH.ACCOUNTS.PARENT,
  APP_PATH.ACCOUNTS.SIGNIN.PARENT,
  APP_PATH.ACCOUNTS.SIGNIN.PHONE,
].join('/');

export const OnboardingStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withProps(() => ({
    _logger: inject(NGXLogger),
    _authStore: inject(AuthStore),
  })),
  withComputed(({ _authStore, ...store }) => ({
    isAuthenticated: computed(() => _authStore.isAuthenticated()),
    phoneOtpLength: computed(() => {
      const verifyResponse = store._verifyPhoneResponse?.();
      return verifyResponse ? verifyResponse.otpLength : 6;
    }),
    phoneOtpResendInterval: computed(() => {
      const verifyResponse = store._verifyPhoneResponse?.();
      return verifyResponse ? verifyResponse.otpResendInterval : 30000;
    }),
  })),
  withMethods(({ _logger, ...store }) => {
    const _snackBar = inject(MatSnackBar);
    const _http = inject(HttpService);

    const toast = (message: string, error: boolean = false) => {
      _snackBar.open(message, 'OK', {
        duration: 3000,
        horizontalPosition: 'center',
        verticalPosition: 'bottom',
        panelClass: [error ? 'error-snackbar' : 'success-snackbar'],
      });
    };

    const setBusy = (isBusy: boolean) => {
      patchState(store, { isBusy });
    };

    return {
      toast,
      setBusy,

      loginWithPhone: rxMethod<{ dialcode: string; phoneNumber: string }>(
        pipe(
          tap(({ dialcode, phoneNumber }) => {
            setBusy(true);
            patchState(store, {
              dialcode,
              phoneNumber,
              verifyPhoneError: null,
              _verifyPhoneResponse: null,
              verifyPhoneOtpResendAt: null,
              verifyPhoneResendBanned: false,
            });
          }),
          switchMap(({ dialcode, phoneNumber }) => {
            return _http
              .post<VerifyPhoneResponse>('/oauth/verify-phone', {
                dialcode: dialcode,
                phoneNumber: phoneNumber,
              })
              .pipe(
                tap((res) =>
                  patchState(store, {
                    _verifyPhoneResponse: res,
                    verifyPhoneState: 'otp',
                  })
                ),
                catchError((error) => {
                  patchState(store, { verifyPhoneError: error });
                  return EMPTY;
                }),
                finalize(() => setBusy(false))
              );
          })
        )
      ),

      resendPhoneOtp: rxMethod<boolean>(
        pipe(
          tap(() => setBusy(true)),
          switchMap(() => {
            return _http
              .post<VerifyPhoneResponse>('/oauth/verify-phone-resend', {
                dialcode: store.dialcode?.(),
                phoneNumber: store.phoneNumber?.(),
                requestId: store._verifyPhoneResponse?.()?.requestId,
              })
              .pipe(
                tap((res) => {
                  patchState(store, {
                    _verifyPhoneResponse: res,
                    verifyPhoneOtpResendAt: new Date(),
                  });
                  toast('OTP Resent Successfully.');
                }),
                catchError((error) => {
                  let message = 'Failed to resend OTP. Please try again.';
                  if (error instanceof ApiError) {
                    message = error.description || message;
                    if (error.code === 429) {
                      patchState(store, { verifyPhoneResendBanned: true });
                    }
                  }

                  toast(message, true);
                  patchState(store, { verifyPhoneOtpResendAt: null });
                  return EMPTY;
                }),
                finalize(() => setBusy(false))
              );
          })
        )
      ),

      submitPhoneOtp: rxMethod<string>(
        pipe(
          tap(() => setBusy(true)),
          switchMap((otp) => {
            return _http
              .post<VerifyPhoneSubmitResponse>('/oauth/verify-phone-submit', {
                otp,
                dialcode: store.dialcode?.(),
                phoneNumber: store.phoneNumber?.(),
                requestId: store._verifyPhoneResponse?.()?.requestId,
              })
              .pipe(
                switchMap((res) => {
                  toast('OTP Verified Successfully. Authenticating...');
                  return store._authStore.authenticate({ ...res }).pipe(
                    switchMap((success) => {
                      if (!success) {
                        const message = 'Authentication failed.';
                        return throwError(() => new Error(message));
                      }
                      toast('Authenticated Successfully.');
                      return EMPTY;
                    }),
                    catchError((error) => {
                      let message = 'Authentication failed. Please try again.';
                      if (error instanceof ApiError)
                        message = error.description;

                      toast(message, true);
                      return EMPTY;
                    })
                  );
                }),
                catchError((error) => {
                  let message = 'Failed to verify OTP. Please try again.';
                  if (error instanceof ApiError) message = error.description;

                  toast(message, true);
                  return EMPTY;
                }),
                finalize(() => setBusy(false))
              );
          })
        )
      ),
    };
  }),
  withHooks(({_logger, ...store}) => {
    const route = inject(ActivatedRoute);
    return {
      onInit() {
        const redirectUrl = route.snapshot.queryParamMap.get('redirectUrl');
        _logger.debug(TAG, 'Init with redirectUrl:', redirectUrl);
        if (redirectUrl) {
          patchState(store, { redirectUrl });
        }
      },
    };
  })
);
