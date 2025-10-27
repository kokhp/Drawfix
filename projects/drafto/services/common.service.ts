import { isPlatformBrowser } from '@angular/common';
import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, NavigationStart, Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { NGXLogger } from 'ngx-logger';
import { BehaviorSubject, tap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CommonService {
  //#region  Inject Services

  private readonly _platformId = inject(PLATFORM_ID);
  private readonly _cookie = inject(CookieService);
  private readonly _logger = inject(NGXLogger);
  private readonly _router = inject(Router);

  private readonly _navigationEnd = new BehaviorSubject<NavigationEnd | null>(
    null
  );

  private readonly _navigationStart =
    new BehaviorSubject<NavigationStart | null>(null);

  //#endregion

  constructor() {
    this._router.events
      .pipe(
        takeUntilDestroyed(),
        tap((event) => {
          if (event instanceof NavigationEnd) this._navigationEnd.next(event);
          else if (event instanceof NavigationStart)
            this._navigationStart.next(event);
        })
      )
      .subscribe();
  }

  private _logLocalStorageError: boolean = false;

  private logLocalStorageError(error: any): void {
    if (!this._logLocalStorageError) return;
    this._logger.error(error);
  }

  readonly onNavigationEnd = this._navigationEnd.asObservable();

  readonly onNavigationStart = this._navigationStart.asObservable();

  isBrowser(): boolean {
    if (isPlatformBrowser(this._platformId)) return true;
    return false;
  }

  /**
   * Retrieves the value of a given key from either local storage or cookies.
   * If the value is a JSON object, it will be parsed and returned as an object.
   * If the value has expired (in the case of local storage), it will be removed
   * and null will be returned.
   *
   * @param {string} key - The key of the value to retrieve.
   * @returns {string} The value of the key, or null if it does not exist or has expired.
   */
  getLsOrCookie(key: string): string | null | undefined {
    if (!isPlatformBrowser(this._platformId)) return null;

    try {
      let val = localStorage.getItem(key);
      if (val != null) {
        let index = val.indexOf('##');
        if (index > 0) {
          let expire = new Date(
            parseFloat(val.substring(index + 2, val.length))
          );
          if (expire < new Date()) {
            localStorage.removeItem(key);
            return null;
          }
          return val.substring(0, index);
        }
      }
      return null;
    } catch (error) {
      this.logLocalStorageError(error);
      return this._cookie.get(key);
    }
  }

  /**
   * The function can be used to store key-value pairs either in localStorage or as cookies, depending on the availability of localStorage.
   *
   * @param {string} key - a string representing the key to be used to store the value.
   * @param {any} val - the value to be stored. If it is an object, it is first converted to a string using JSON.stringify().
   * @param {Date?} expire -  (optional) - an optional parameter that represents the expiration date for the key-value pair.
   */
  setLsOrCookie(key: string, val: any, expire?: Date): void {
    if (!isPlatformBrowser(this._platformId)) return;

    if (val instanceof Object) {
      val = JSON.stringify(val);
    }

    try {
      let lsVal = val + '##' + expire?.toString();
      localStorage.setItem(key, lsVal);
    } catch (error) {
      this.logLocalStorageError(error);
      this._cookie.set(key, val, expire);
    }
  }

  removeLsOrCookie(key: string): void {
    if (!isPlatformBrowser(this._platformId)) return;
    try {
      localStorage.removeItem(key);
    } finally {
      this._cookie.delete(key);
    }
  }

  tryParseJson<T>(json: string | undefined | null): T | null {
    try {
      if (!json || json == 'undefined') return null;
      return JSON.parse(json) as T;
    } catch (error) {
      this._logger.error(error);
      return null;
    }
  }

  tryStringifyJson(value: any): string | null {
    try {
      return JSON.stringify(value);
    } catch (error) {
      this._logger.error(error);
      return null;
    }
  }
}
