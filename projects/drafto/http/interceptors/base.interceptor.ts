import {
  HttpBackend,
  HttpClient,
  HttpEvent,
  HttpHandler,
  HttpHandlerFn,
  HttpInterceptorFn,
  HttpRequest,
} from '@angular/common/http';
import { HttpConfig } from '../http.config';
import { Observable } from 'rxjs';
import { Injector, runInInjectionContext } from '@angular/core';

/**
 * Determines whether an interceptor should be applied to the given request.
 *
 * @param req - The HTTP request to evaluate.
 * @param config - The HTTP configuration containing the base URL.
 * @returns `true` if the request's URL matches the base URL in the config, otherwise `false`.
 */
export function shouldApplyInterceptor(
  req: HttpRequest<unknown>,
  config?: HttpConfig
): boolean {
  return !!config && req.url.startsWith(config.baseUrl);
}

/**
 * A custom `HttpHandler` implementation that executes a chain of functional interceptors
 * (`HttpInterceptorFn`) before delegating the request to the final backend.
 *
 * This mimics Angular's internal interceptor chaining mechanism, but works with
 * function-style interceptors instead of class-based interceptors.
 */
export class InterceptorHandlerFn implements HttpHandler {
  constructor(
    private interceptors: HttpInterceptorFn[],
    private backend: HttpBackend,
    private injector: Injector
  ) {}

  handle(req: HttpRequest<any>): Observable<HttpEvent<any>> {
    const chain = this.interceptors.reduceRight<HttpHandlerFn>(
      (next, interceptor) => (r) =>
        runInInjectionContext(this.injector, () => interceptor(r, next)),
      (r) => this.backend.handle(r)
    );
    return chain(req);
  }
}

export function createHttpClient(
  backend: HttpBackend,
  interceptors: HttpInterceptorFn[],
  injector: Injector
): HttpClient {
  const handler = new InterceptorHandlerFn(interceptors, backend, injector);
  return new HttpClient(handler);
}
