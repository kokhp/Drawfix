import { inject, InjectionToken, Injector, Provider } from '@angular/core';
import { HeaderKeys } from '@drafto/core';
import { NgxLoggerLevel } from 'ngx-logger';

/**
 * Interface representing the logging configuration for HTTP requests and responses.
 * Allows customization of log levels and the inclusion of request/response details
 * such as headers and body content.
 *
 * @interface HttpLoggingConfig
 */
export interface HttpLoggingConfig {
  /** The log level to be used for logging HTTP activities. */
  level?: NgxLoggerLevel;

  /** Whether to log HTTP request and response details. */
  logRequest?: boolean;

  /** Whether to log HTTP response details. */
  logResponse?: boolean;

  /** Whether to log HTTP errors. */
  logError?: boolean;

  /* Whether to log the full URL of requests. */
  logBody?: boolean;

  /* Whether to log the body of requests and responses. */
  logHeaders?: boolean;
}

/**
 * Interface representing the HTTP configuration for making requests within the application.
 * Includes settings for base URL, timeouts, retry configurations, headers, and more.
 * This configuration can be customized through the `HTTP_CONFIG_TOKEN` injection token.
 *
 * @interface HttpConfig
 */
export interface HttpConfig {
  /** The base URL for the API endpoints. */
  baseUrl: string;

  /** The timeout duration for HTTP requests in milliseconds. */
  timeout: number;

  /** The client identifier used in the request headers. */
  apiClient: string;

  /** The version of the API to be used in the request headers. */
  apiVersion: string;

  /** The version of the app sending the request. */
  appVersion: string;

  /** The maximum number of retry attempts for failed requests. */
  retryMaxLimit: number;

  /** The delay between retries in milliseconds. */
  retryDelay: number;

  /** List of HTTP status codes that trigger a retry. */
  retryStatusCodes: number[];

  /** List of HTTP header keys to be used in requests. */
  headerKeys: string[];

  /** Configuration for logging HTTP requests and responses. */
  logging?: HttpLoggingConfig;
}

/**
 * Injection token for providing the HTTP configuration throughout the application.
 * Used to retrieve custom HTTP settings or fallback to the default configuration.
 *
 * @type {InjectionToken<HttpConfig>}
 */
export const HTTP_CONFIG_TOKEN: InjectionToken<HttpConfig> =
  new InjectionToken<HttpConfig>('HttpConfig');

/**
 * Default HTTP configuration to be used if no custom configuration is provided.
 * Contains default values for base URL, timeouts, retry logic, and header keys.
 *
 * @constant {HttpConfig}
 */
export const DEFAULT_HTTP_CONFIG: HttpConfig = {
  baseUrl: 'https://default-api-url.com',
  timeout: 30000,
  apiClient: 'WebClient',
  apiVersion: '1.0.0',
  appVersion: '1.0.0',
  retryMaxLimit: 3,
  retryDelay: 1000,
  retryStatusCodes: [500, 502, 503, 504],
  headerKeys: [
    HeaderKeys.ApiClient,
    HeaderKeys.ApiVersion,
    HeaderKeys.AppVersion,
    HeaderKeys.DeviceId,
  ],
  logging: {
    level: NgxLoggerLevel.INFO,
    logRequest: true,
    logResponse: false,
    logError: true,
    logBody: false,
    logHeaders: false,
  },
};

/**
 * Function to inject the HTTP configuration using the provided injector or the default injector.
 * Falls back to the default configuration if no custom configuration is found.
 *
 * @param {Injector} [injector] - Optional Angular injector to retrieve the configuration.
 * @returns {HttpConfig} The injected or default HTTP configuration.
 */
export function injectConfig(injector?: Injector): HttpConfig {
  const tokenValue = injector
    ? injector.get(HTTP_CONFIG_TOKEN, DEFAULT_HTTP_CONFIG)
    : inject(HTTP_CONFIG_TOKEN, { optional: true });

  return tokenValue ?? DEFAULT_HTTP_CONFIG;
}

/**
 * Factory function to provide HttpConfig
 * @param config Partial user config
 * @returns Angular provider with merged config
 */
export function provideHttpConfig(config?: Partial<HttpConfig>): Provider {
  const mergedConfig: HttpConfig = { ...DEFAULT_HTTP_CONFIG, ...config };
  return {
    provide: HTTP_CONFIG_TOKEN,
    useValue: mergedConfig,
  };
}
