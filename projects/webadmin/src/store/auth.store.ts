import { NGXLogger } from "ngx-logger";
import { computed, inject, Injector } from "@angular/core";
import { toObservable } from "@angular/core/rxjs-interop";
import {
  BehaviorSubject,
  catchError,
  EMPTY,
  filter,
  finalize,
  forkJoin,
  map,
  Observable,
  of,
  switchMap,
  take,
  tap,
  throwError,
} from "rxjs";
import {
  patchState,
  signalStore,
  withComputed,
  withHooks,
  withMethods,
  withProps,
  withState,
} from "@ngrx/signals";
import { ApiError, CommonService, CookieKeys, transient } from "@drafto/core";
import {
  HttpService,
  retryInterceptor,
  headerInterceptor,
  loggingInterceptor,
  createHttpClient,
} from "@drafto/core/http";
import { User, isUserInstance, TokenResponse, isTokenInstance } from "../models/auth.model";
import { APP_PATH } from "../constants/app.constants";
import { HttpBackend, HttpClient, HttpHeaders } from "@angular/common/http";

type AuthState = {
  _user: User | null;
  initialized: boolean;
  isAuthenticated: boolean;
  permissions: string[];
};

const initialState: AuthState = {
  initialized: false,
  isAuthenticated: false,
  permissions: [],
  _user: null,
};

const TAG = "[AuthStore]:";

export const LOGIN_PATH = `/${APP_PATH.ACCOUNTS.PARENT}/${APP_PATH.ACCOUNTS.LOGIN}`;

export const AuthStore = signalStore(
  { providedIn: "root" },
  withState(initialState),
  withProps(({ initialized }) => ({
    _logger: inject(NGXLogger),
    initialized$: toObservable(initialized),
  })),
  withComputed((store) => ({
    canNavigate: computed(() => store.initialized()),
    getLoggedInUser: computed(() => {
      const user = store._user();
      if (store.isAuthenticated() && user) {
        return user;
      }
      return null;
    }),
  })),
  withMethods(({ _logger, ...store }) => {
    const _injector = inject(Injector);
    const _httpBackend = inject(HttpBackend);
    const _http = transient(
      HttpService,
      Injector.create({
        providers: [
          {
            provide: HttpClient,
            useValue: createHttpClient(
              _httpBackend,
              [loggingInterceptor, headerInterceptor, retryInterceptor],
              _injector
            ),
          },
        ],
        parent: _injector,
      })
    );
    const _common = inject(CommonService);

    const getAuthToken = (): string | null => {
      const token = _common.getLsOrCookie(CookieKeys.AuthToken);
      return token || null;
    };

    const _getAuthHeader = () => {
      return new HttpHeaders({
        Authorization: `Bearer ${getAuthToken()}`,
      });
    };

    const _getLsOrCookie = <T>(key: string): T | null => {
      const jsonString = _common.getLsOrCookie(key);
      return _common.tryParseJson<T>(jsonString);
    };

    const refreshToken = (): Observable<void> => {
      const authData = _getLsOrCookie<TokenResponse>(CookieKeys.AuthData);
      if (!authData || !isTokenInstance(authData)) {
        resetAuthStore();
        return throwError(() => new Error("No valid auth data found"));
      }

      return _http
        .post<TokenResponse>("/oauth/tokens/refresh", {
          token: authData.token,
          refreshToken: authData.refreshToken,
        })
        .pipe(
          tap((token) => {
            _logger.debug(TAG, "Token refreshed successfully");
            _common.setLsOrCookie(CookieKeys.AuthData, token);
            _common.setLsOrCookie(CookieKeys.AuthToken, token.token);
          }),
          map(() => void 0),
          catchError((error) => {
            resetAuthStore();
            return throwError(() => error);
          })
        );
    };

    const getPermissions = (allowRefresh?: boolean): Observable<string[]> => {
      const currentPermissions = store.permissions();
      if (currentPermissions.length > 0) {
        _logger.debug(TAG, "Using cached permissions");
        return of(currentPermissions);
      }

      return _http.get<string[]>("/users/permissions", _getAuthHeader()).pipe(
        tap((permissions) => patchState(store, { permissions })),
        catchError((error) => {
          if (error instanceof ApiError && error.code === 401 && allowRefresh) {
            _logger.debug(TAG, "Attempting to refresh token due to 401 error");
            return refreshToken().pipe(
              switchMap(() => getPermissions(false)),
              catchError((refreshError) => {
                _logger.error(TAG, "Token refresh failed", refreshError);
                patchState(store, { permissions: [] });
                return throwError(() => refreshError);
              })
            );
          }
          patchState(store, { permissions: [] });
          return throwError(() => error);
        })
      );
    };

    const getMe = (allowRefresh?: boolean): Observable<User> => {
      const cachedUser = _getLsOrCookie<User>(CookieKeys.UserData);
      if (cachedUser && isUserInstance(cachedUser)) {
        patchState(store, { _user: cachedUser });
        return of(cachedUser);
      }

      return _http.get<User>("/users/me", _getAuthHeader()).pipe(
        tap((user: User) => {
          _common.setLsOrCookie(CookieKeys.UserData, user);
          patchState(store, { _user: user });
        }),
        catchError((error) => {
          if (error instanceof ApiError && error.code === 401 && allowRefresh) {
            _logger.debug(TAG, "Attempting to refresh token due to 401 error");
            return refreshToken().pipe(
              switchMap(() => getMe(false)),
              catchError((refreshError) => {
                _logger.error(TAG, "Token refresh failed", refreshError);
                patchState(store, { _user: null });
                return throwError(() => refreshError);
              })
            );
          }
          patchState(store, { _user: undefined });
          return throwError(() => error);
        })
      );
    };

    const resetAuthStore = (): void => {
      _common.removeLsOrCookie(CookieKeys.AuthToken);
      _common.removeLsOrCookie(CookieKeys.AuthData);
      _common.removeLsOrCookie(CookieKeys.UserData);
      patchState(store, {
        isAuthenticated: false,
        permissions: [],
        _user: null,
      });
    };

    let isAuthenticating = false;
    let authenticatorSubject = new BehaviorSubject<boolean | null>(null);

    return {
      _init(): void {
        const token = getAuthToken();
        _logger.debug(TAG, "Initializing AuthStore Token:", token);
        if (!token) {
          resetAuthStore();
          patchState(store, { initialized: true });
          return;
        }

        forkJoin([getMe(true), getPermissions(true)])
          .pipe(
            take(1),
            tap(() => patchState(store, { isAuthenticated: true })),
            catchError(() => {
              resetAuthStore();
              return EMPTY;
            }),
            finalize(() => {
              _logger.debug(TAG, "Initialized -> Authenticated:", store.isAuthenticated());
              patchState(store, { initialized: true });
            })
          )
          .subscribe();
      },

      getAuthToken,
      resetAuthStore,
      refreshToken,

      authenticate(token: TokenResponse): Observable<boolean> {
        if (isAuthenticating) {
          return authenticatorSubject.pipe(
            filter((success): success is boolean => success !== null),
            take(1),
            switchMap((success) =>
              success ? of(true) : throwError(() => new Error("Authentication failed"))
            )
          );
        }

        isAuthenticating = true;
        authenticatorSubject.next(null);
        resetAuthStore();

        if (!token || !token.token || !(token.refreshTokenExpiredAt instanceof Date)) {
          return throwError(() => new Error("Invalid token response"));
        }

        const now = new Date();
        if (token.refreshTokenExpiredAt <= now) {
          return throwError(() => new Error("Refresh token has expired"));
        }

        // Set token in storage
        _common.setLsOrCookie(CookieKeys.AuthData, token);
        _common.setLsOrCookie(CookieKeys.AuthToken, token.token);

        // Return the forkJoin observable
        return forkJoin([getPermissions(), getMe()]).pipe(
          tap(() => {
            isAuthenticating = false;
            authenticatorSubject.next(true);
            patchState(store, { isAuthenticated: true, initialized: true });
            _logger.debug(TAG, "Authenticated successfully");
          }),
          map(() => true),
          catchError((error) => {
            isAuthenticating = false;
            authenticatorSubject.next(null);
            _logger.error(TAG, "Error in authenticate method", error);
            patchState(store, { isAuthenticated: false, initialized: true });
            return throwError(() => error);
          })
        );
      },
    };
  }),
  withHooks(({ _init, _logger }) => ({
    onInit() {
      _init();
      _logger.debug(TAG, "AuthStore instance created");
    },
  }))
);
