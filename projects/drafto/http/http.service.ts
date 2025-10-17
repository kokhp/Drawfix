import { NGXLogger } from 'ngx-logger';
import { Params } from '@angular/router';
import { Injectable, inject } from '@angular/core';
import { Observable, catchError, map, throwError } from 'rxjs';
import {
  HttpClient,
  HttpErrorResponse,
  HttpHeaders,
} from '@angular/common/http';
import {
  CommonService,
  HeaderKeys,
  ApiError,
  CookieKeys,
  parseDates,
} from '@drafto/core';
import { injectConfig } from './http.config';

@Injectable({
  providedIn: 'root',
})
export class HttpService {
  /**
   * A reference to the CommonService instance, injected using Angular's dependency injection system.
   * Used for accessing shared functionality across the application.
   */
  private readonly _common = inject(CommonService);

  /**
   * A reference to the NGXLogger instance, injected using Angular's dependency injection system.
   * Used for logging application events and errors.
   */
  private readonly _logger = inject(NGXLogger);

  /**
   * A reference to the HttpClient instance, injected using Angular's dependency injection system.
   * Used for making HTTP requests to external APIs.
   */
  private readonly _http = inject(HttpClient);

  /**
   * A reference to the HTTP configuration object, injected using Angular's dependency injection system.
   * Defaults to `DEFAULT_HTTP_CONFIG` if no custom configuration is provided.
   * Used to manage HTTP settings such as base URL, retry configurations, and header keys.
   */
  private readonly _config = injectConfig();

  /**
   * The base URL for the API. This serves as the root for constructing API request URLs.
   */
  private _baseUrl = this._config.baseUrl;

  /**
   * The authentication token used for API requests.
   * This token is dynamically set and retrieved as needed.
   * @private
   * @type {string | undefined}
   * @default undefined
   */
  private _authToken?: string;

  //#region Private Methods

  /**
   * Processes the HTTP response.
   *
   * @template T - The expected type of the response data.
   * @param {T} response - The response object to process.
   * @returns {T} The processed response object.
   */
  private _handleResponse<T>(response: T): T {
    response = parseDates(response);
    return response as T;
  }

  /**
   * Handles HTTP errors and logs them. Redirects to the logout page if the error is unauthorized (401).
   *
   * @param {any} error - The error object received from the HTTP request.
   * @returns {Observable<never>} An observable that throws an error.
   */
  private _handleError(error: any): Observable<never> {
    return throwError(() =>
      error instanceof HttpErrorResponse ? new ApiError(error) : error
    );
  }

  /**
   * Builds a query string from the provided parameters object.
   *
   * @private
   * @param {Params} [params] - An optional object containing query parameters as key-value pairs.
   *                            Values of `null` or `undefined` are ignored.
   * @returns {string} A URL-encoded query string. Returns an empty string if no parameters are provided.
   */
  private _buildQueryString(params?: Params): string {
    if (!params) return '';
    const queryParams = new URLSearchParams();
    Object.keys(params).forEach((key) => {
      if (params[key] != null) queryParams.append(key, String(params[key]));
    });
    return queryParams.toString();
  }

  /**
   * Retrieves the authentication token from memory or storage.
   *
   * @returns {string | null} The authentication token if available, otherwise `null`.
   */
  private _getAuthToken(): string | null {
    if (this._authToken) return this._authToken;

    const token = this._common.getLsOrCookie(CookieKeys.AuthToken);
    this._authToken = token || undefined;
    return this._authToken ?? null;
  }

  //#endregion

  //#region Public Methods

  /**
   * Sets the base URL for the API service.
   *
   * @param {string} baseUrl - The base URL to use for the API service.
   */
  setBaseUrl(baseUrl: string): void {
    this._baseUrl = baseUrl;
    this._logger.info('Base URL set to:', this._baseUrl);
  }

  /**
   * Constructs and returns the full encoded URL with the given path, query parameters, and optional authentication token.
   *
   * @param {string} path - The API path to append to the base URL.
   * @param {Params} [params] - Optional query parameters as key-value pairs.
   * @param {boolean} [includeAuth=false] - Whether to include the authentication token in the URL.
   * @returns {string} The fully constructed and encoded URL.
   */
  getEncodedUrl(
    path: string,
    params?: Params,
    includeAuth: boolean = false
  ): string {
    let url = `${this._baseUrl}${path}`;
    const queryString = this._buildQueryString(params);
    if (queryString)
      url += path.includes('?') ? `&${queryString}` : `?${queryString}`;
    if (includeAuth) {
      const authToken = this._getAuthToken();
      if (authToken) {
        url += url.includes('?')
          ? `&authcode=${encodeURIComponent(authToken)}`
          : `?authcode=${encodeURIComponent(authToken)}`;
      }
    }
    return url;
  }

  /**
   * Constructs and returns the default HTTP headers for an API request.
   *
   * @returns {HttpHeaders} The HttpHeaders object containing default and optional authorization headers.
   */
  getDefaultHeaders(): HttpHeaders {
    let headers = new HttpHeaders({
      [HeaderKeys.ApiClient]: this._config.apiClient,
      [HeaderKeys.ApiVersion]: this._config.apiVersion,
      [HeaderKeys.AppVersion]: this._config.appVersion,
    });

    const deviceId = this._common.getLsOrCookie(CookieKeys.DeviceId);
    if (deviceId) {
      headers = headers.set(HeaderKeys.DeviceId, deviceId);
    }

    return headers;
  }

  /**
   * Makes an HTTP GET request to the specified path.
   *
   * @template T - The expected type of the response data.
   * @param {string} path - The API path for the request.
   * @param {HttpHeaders} headers - The headers to include in the request.
   * @param {Params} [params] - Optional query parameters as key-value pairs.
   * @returns {Observable<T>} An observable containing the response data.
   */
  get<T>(path: string, headers?: HttpHeaders, params?: Params): Observable<T> {
    const url = this.getEncodedUrl(path, params);
    return this._http.get<T>(url, { headers }).pipe(
      map((response) => this._handleResponse(response)),
      catchError((error) => this._handleError(error))
    );
  }

  /**
   * Makes an HTTP POST request to the specified path.
   *
   * @template T - The expected type of the response data.
   * @param {string} path - The API path for the request.
   * @param {HttpHeaders} headers - The headers to include in the request.
   * @param {any} [body] - The body of the POST request.
   * @param {Params} [params] - Optional query parameters as key-value pairs.
   * @returns {Observable<T>} An observable containing the response data.
   */
  post<T>(
    path: string,
    body?: any,
    headers?: HttpHeaders,
    params?: Params
  ): Observable<T> {
    const url = this.getEncodedUrl(path, params);
    return this._http.post<T>(url, body, { headers }).pipe(
      map((response) => this._handleResponse(response)),
      catchError((error) => this._handleError(error))
    );
  }

  /**
   * Makes an HTTP PUT request to the specified path.
   *
   * @template T - The expected type of the response data.
   * @param {string} path - The API path for the request.
   * @param {HttpHeaders} headers - The headers to include in the request.
   * @param {any} [body] - The body of the PUT request.
   * @param {Params} [params] - Optional query parameters as key-value pairs.
   * @returns {Observable<T>} An observable containing the response data.
   */
  put<T>(
    path: string,
    body?: any,
    headers?: HttpHeaders,
    params?: Params
  ): Observable<T> {
    const url = this.getEncodedUrl(path, params);
    return this._http.put<T>(url, body, { headers }).pipe(
      map((response) => this._handleResponse(response)),
      catchError((error) => this._handleError(error))
    );
  }

  /**
   * Makes an HTTP PATCH request to the specified path.
   *
   * @template T - The expected type of the response data.
   * @param {string} path - The API path for the request.
   * @param {HttpHeaders} headers - The headers to include in the request.
   * @param {any} [body] - The body of the PATCH request.
   * @param {Params} [params] - Optional query parameters as key-value pairs.
   * @returns {Observable<T>} An observable containing the response data.
   */
  patch<T>(
    path: string,
    body?: any,
    headers?: HttpHeaders,
    params?: Params
  ): Observable<T> {
    const url = this.getEncodedUrl(path, params);
    return this._http.patch<T>(url, body, { headers }).pipe(
      map((response) => this._handleResponse(response)),
      catchError((error) => this._handleError(error))
    );
  }

  /**
   * Makes an HTTP DELETE request to the specified path.
   *
   * @template T - The expected type of the response data.
   * @param {string} path - The API path for the request.
   * @param {HttpHeaders} headers - The headers to include in the request.
   * @param {Params} [params] - Optional query parameters as key-value pairs.
   * @returns {Observable<T>} An observable containing the response data.
   */
  delete<T>(
    path: string,
    headers?: HttpHeaders,
    params?: Params
  ): Observable<T> {
    const url = this.getEncodedUrl(path, params);
    return this._http.delete<T>(url, { headers }).pipe(
      map((response) => this._handleResponse(response)),
      catchError((error) => this._handleError(error))
    );
  }
  //#endregion
}
