import {
  HttpErrorResponse,
  HttpEvent,
  HttpInterceptorFn,
  HttpRequest,
} from '@angular/common/http';
import { inject, Injector } from '@angular/core';
import {
  catchError,
  Observable,
  switchMap,
  throwError,
  EMPTY,
  BehaviorSubject,
  filter,
  take,
  finalize,
} from 'rxjs';
import { environment } from '../environments/environment';
import { AuthStore, LOGIN_PATH } from '../store/auth.store';
import { NGXLogger } from 'ngx-logger';
import { Router } from '@angular/router';
import { extractPathFromUrl } from '@drafto/core';

const TAG = '[AuthInterceptor]';
const SKIP_PATHS = new Set(environment.apiAuthSkipPaths);

let isRefreshing = false;
let refreshTokenSubject = new BehaviorSubject<string | null>(null);

function withAuthHeader(req: HttpRequest<any>, token?: string | null) {
  return token
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;
}

export const authInterceptor: HttpInterceptorFn = (
  req,
  next
): Observable<HttpEvent<any>> => {
  const _logger = inject(NGXLogger);
  const _router = inject(Router);
  const _authStore = inject(AuthStore);

  const isSecureEndpoint = !SKIP_PATHS.has(extractPathFromUrl(req.url));
  const initialToken = _authStore.getAuthToken();

  let authReq = req;
  if (isSecureEndpoint && initialToken) {
    authReq = withAuthHeader(req, initialToken);
    _logger.debug(TAG, 'Attached token to request', req.url);
  }

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401 && isSecureEndpoint) {
        // 🔄 If refresh is already in progress → queue request
        if (isRefreshing) {
          return refreshTokenSubject.pipe(
            filter((token): token is string => token !== null),
            take(1),
            switchMap((token) => {
              _logger.debug(
                TAG,
                'Queued request using refreshed token',
                req.url
              );
              return next(withAuthHeader(req, token));
            })
          );
        }

        // 🚀 Start refresh flow
        isRefreshing = true;
        refreshTokenSubject.next(null);

        return _authStore.refreshToken().pipe(
          switchMap(() => {
            const newToken = _authStore.getAuthToken();
            if (!newToken) {
              return throwError(
                () => new Error('No token after refresh, redirecting to login')
              );
            }

            refreshTokenSubject.next(newToken);
            _logger.debug(
              TAG,
              'Retrying request with refreshed token',
              req.url
            );
            return next(withAuthHeader(req, newToken));
          }),
          catchError((refreshError) => {
            _authStore.resetAuthStore();
            refreshTokenSubject.error(refreshError);
            refreshTokenSubject = new BehaviorSubject<string | null>(null);
            _logger.error(
              `${TAG} Token refresh failed → redirecting`,
              refreshError
            );

            // 🔒 Hard reload to login with redirectUrl
            const redirectUrl = encodeURIComponent(_router.url);
            window.location.href = `${LOGIN_PATH}?redirectUrl=${redirectUrl}`;

            return EMPTY;
          }),
          finalize(() => {
            isRefreshing = false;
          })
        );
      }

      return throwError(() => error);
    })
  );
};
