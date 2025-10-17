import { inject } from '@angular/core';
import { shouldApplyInterceptor } from './base.interceptor';
import { HttpInterceptorFn } from '@angular/common/http';
import { CommonService, CookieKeys, HeaderKeys } from '@drafto/core';
import { DEFAULT_HTTP_CONFIG, HTTP_CONFIG_TOKEN } from '../http.config';

/**
 * An HTTP interceptor to add custom headers to outgoing requests.
 *
 * This interceptor checks for the presence of specific headers in the request and adds them if they are missing.
 * It uses an injectable configuration object (`HTTP_CONFIG_TOKEN`) to fetch default values for the headers.
 * If the consuming application does not provide a configuration, a default configuration (`DEFAULT_HTTP_CONFIG`) is used.
 *
 * Headers added by this interceptor:
 * - `ApiClient`: Identifier for the client making the request.
 * - `ApiVersion`: Version of the API being used.
 * - `DeviceId`: A unique identifier for the device, retrieved from local storage or cookies.
 * - `AppVersion`: The version of the application making the request.
 *
 * @param req - The outgoing HTTP request to intercept.
 * @param next - The next interceptor in the chain or the backend handler.
 * @returns An observable that emits the HTTP response.
 */
export const headerInterceptor: HttpInterceptorFn = (req, next) => {
  const _common = inject(CommonService);
  const _httpConfig =
    inject(HTTP_CONFIG_TOKEN, { optional: true }) ?? DEFAULT_HTTP_CONFIG;

  if (!shouldApplyInterceptor(req, _httpConfig)) {
    return next(req); // Skip interceptor logic
  }

  const extraHeaders: Record<string, string> = {};

  if (
    _httpConfig.headerKeys.includes(HeaderKeys.ApiClient) &&
    !req.headers.has(HeaderKeys.ApiClient)
  ) {
    extraHeaders[HeaderKeys.ApiClient] = _httpConfig.apiClient;
  }

  if (
    _httpConfig.headerKeys.includes(HeaderKeys.ApiVersion) &&
    !req.headers.has(HeaderKeys.ApiVersion)
  ) {
    extraHeaders[HeaderKeys.ApiVersion] = _httpConfig.apiVersion;
  }

  if (
    _httpConfig.headerKeys.includes(HeaderKeys.DeviceId) &&
    !req.headers.has(HeaderKeys.DeviceId)
  ) {
    const deviceId = _common.getLsOrCookie(CookieKeys.DeviceId);
    if (deviceId) {
      extraHeaders[HeaderKeys.DeviceId] = deviceId;
    }
  }

  if (
    _httpConfig.headerKeys.includes(HeaderKeys.AppVersion) &&
    !req.headers.has(HeaderKeys.AppVersion)
  ) {
    extraHeaders[HeaderKeys.AppVersion] = _httpConfig.appVersion;
  }

  return next(req.clone({ setHeaders: extraHeaders }));
};
