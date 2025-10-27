import { inject } from '@angular/core';
import { NGXLogger } from 'ngx-logger';
import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { retry, throwError, timer } from 'rxjs';
import { shouldApplyInterceptor } from './base.interceptor';
import {
  DEFAULT_HTTP_CONFIG,
  HTTP_CONFIG_TOKEN,
  HttpConfig,
} from '../http.config';

const TAG = '[RetryInterceptor]:';

/**
 * HTTP Interceptor that retries failed HTTP requests a specified number of times.
 * The retry attempts are made based on the HTTP status codes and network conditions.
 *
 * - If the browser is online and the error is retryable (based on status code), the request is retried.
 * - The interceptor limits the number of retry attempts (`HTTP_RETRY_MAX_LIMIT`).
 * - If retries are exhausted or the error is not retryable, the error is propagated.
 *
 * The retry delay is configurable, and a log is generated at each retry attempt, indicating the retry count.
 *
 * @param req The outgoing HTTP request to intercept.
 * @param next The next interceptor or the actual HTTP handler that processes the request.
 *
 * @returns An observable of the HTTP request's response or error.
 *
 * @throws HttpErrorResponse The original error after all retries have been exhausted or if the error is not retryable.
 */
export const retryInterceptor: HttpInterceptorFn = (req, next) => {
  const _logger = inject(NGXLogger);
  const _httpConfig: HttpConfig =
    inject(HTTP_CONFIG_TOKEN, { optional: true }) ?? DEFAULT_HTTP_CONFIG;

  if (!shouldApplyInterceptor(req, _httpConfig)) {
    return next(req); // Skip interceptor logic and forward the request as-is
  }

  return next(req).pipe(
    retry({
      count: _httpConfig.retryMaxLimit,
      delay: (error, retryCount) => {
        if (
          navigator.onLine &&
          error instanceof HttpErrorResponse &&
          _httpConfig.retryStatusCodes.includes(error.status)
        ) {
          _logger.warn(
            TAG,
            `Retrying... ${retryCount}/${_httpConfig.retryMaxLimit}`,
            error
          );
          return timer(_httpConfig.retryDelay);
        }
        return throwError(() => error);
      },
    })
  );
};
