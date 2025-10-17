import {
  HttpInterceptorFn,
  HttpResponse,
  HttpErrorResponse,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { CustomNGXLoggerService, NgxLoggerLevel } from 'ngx-logger';
import { tap, catchError, throwError } from 'rxjs';
import { injectConfig } from '../http.config';

const TAG = '[LoggingInterceptor]:';

/**
 * HTTP Interceptor that logs details of outgoing HTTP requests and incoming responses.
 * It captures and logs the method, URL, headers, and body of requests, as well as
 * the status and body of responses. Errors are also logged with relevant details.
 *
 * This interceptor is useful for debugging and monitoring HTTP traffic within the application.
 *
 * @param req The outgoing HTTP request to intercept.
 * @param next The next interceptor or the actual HTTP handler that processes the request.
 *
 * @returns An observable of the HTTP request's response or error.
 */
export const loggingInterceptor: HttpInterceptorFn = (req, next) => {
  const cfg = injectConfig().logging;
  if (!cfg || !cfg.level) return next(req);

  const logger = inject(CustomNGXLoggerService).getNewInstance({
    partialConfig: {
      level: cfg.level,
      serverLogLevel: NgxLoggerLevel.OFF,
    },
  });

  if (cfg.logRequest) {
    logger.log(TAG, '[Request]', {
      method: req.method,
      url: req.urlWithParams,
      body: cfg.logBody ? req.body : undefined,
      headers: cfg.logHeaders ? req.headers : undefined,
    });
  }

  return next(req).pipe(
    tap((event) => {
      if (event instanceof HttpResponse) {
        if (!cfg.logResponse) return;

        logger.log(TAG, '[Response]', {
          status: event.status,
          url: event.url,
          body: cfg.logBody ? event.body : undefined,
          headers: cfg.logHeaders ? event.headers : undefined,
        });
      }
    }),
    catchError((error: HttpErrorResponse) => {
      if (!cfg.logError) return throwError(() => error);
      logger.error(TAG, '[Error]', {
        message: error.message,
        status: error.status,
        url: error.url,
        body: cfg.logBody ? error.error : undefined,
        headers: cfg.logHeaders ? error.headers : undefined,
      });
      return throwError(() => error);
    })
  );
};
