import {
  ApplicationConfig,
  enableProdMode,
  importProvidersFrom,
  provideZoneChangeDetection,
} from "@angular/core";
import {
  provideRouter,
  withComponentInputBinding,
} from "@angular/router";
import { provideHttpClient, withFetch, withInterceptors } from "@angular/common/http";
import { LoggerModule, NgxLoggerLevel } from "ngx-logger";
import { MAT_DATE_FORMATS, provideNativeDateAdapter } from "@angular/material/core";
import { DatePipe } from "@angular/common";
import { provideStore } from "@ngrx/store";
import { provideStoreDevtools } from "@ngrx/store-devtools";
import { mapNgxLoggerLevel } from "@drafto/core";
import {
  HttpConfig,
  retryInterceptor,
  headerInterceptor,
  provideHttpConfig,
  loggingInterceptor,
} from "@drafto/core/http";
import { routes } from "./routes/app.routes";
import { environment } from "./environments/environment";
import { authInterceptor } from "./interceptors/auth.interceptor";

let LOG_LEVEL = mapNgxLoggerLevel(environment.logLevel);
const httpConfig: Partial<HttpConfig> = {
  apiClient: environment.apiClient,
  apiVersion: environment.apiVersion,
  appVersion: environment.version,
  baseUrl: environment.apiBaseUrl,
  logging: {
    level: LOG_LEVEL,
    logRequest: true,
    logResponse: true,
    logError: true,
    logBody: true,
    logHeaders: true,
  },
};
if (environment.production) {
  enableProdMode();
  LOG_LEVEL = NgxLoggerLevel.ERROR;
  httpConfig.logging = {
    level: NgxLoggerLevel.OFF,
    logRequest: false,
    logResponse: false,
    logError: true,
    logBody: false,
    logHeaders: false,
  };
}

export const appConfig: ApplicationConfig = {
  providers: [
    importProvidersFrom(
      LoggerModule.forRoot({
        level: LOG_LEVEL,
      })
    ),
    provideStore(),
    provideStoreDevtools(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes, withComponentInputBinding()),
    provideHttpClient(
      withInterceptors([loggingInterceptor, headerInterceptor, authInterceptor, retryInterceptor]),
      withFetch()
    ),
    provideHttpConfig(httpConfig),
    provideNativeDateAdapter(),
    {
      provide: MAT_DATE_FORMATS,
      useValue: environment.matDateFormats,
    },
    DatePipe,
  ],
};
