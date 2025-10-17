import {
  signalStore,
  withState,
  withMethods,
  withHooks,
  patchState,
  withComputed,
  withProps,
} from '@ngrx/signals';
import { effect, inject, PLATFORM_ID } from '@angular/core';
import {
  debounceTime,
  fromEvent,
  map,
  startWith,
} from 'rxjs';
import {
  toObservable,
  toSignal,
} from '@angular/core/rxjs-interop';
import { WindowSize } from '../models/common.model';
import { isPlatformBrowser } from '@angular/common';
import { NGXLogger } from 'ngx-logger';
import { HttpService } from '@drafto/core/http';

type AppState = {
  windowSize: WindowSize;
  isBrowser: boolean;
};

const initialState: AppState = {
  windowSize: {
    height: 0,
    width: 0,
  },
  isBrowser: false,
};

const TAG = '[AppStore]:';

export const AppStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withProps(({ windowSize }) => {
    return {
      _logger: inject(NGXLogger),
      _http: inject(HttpService),
      windowResize$: toObservable(windowSize),
    };
  }),
  withComputed(({ ...store }) => ({})),
  withMethods(({ _logger, _http, ...store }) => {
    return {};
  }),
  withHooks(({ _logger, ...store }) => {
    const platformId = inject(PLATFORM_ID);

    return {
      onInit() {
        if (isPlatformBrowser(platformId)) {
          patchState(store, { isBrowser: true });

          const resizeSignal = toSignal(
            fromEvent(window, 'resize').pipe(
              debounceTime(200),
              map(() => ({
                width: window.innerWidth,
                height: window.innerHeight,
              })),
              startWith({
                width: window.innerWidth,
                height: window.innerHeight,
              })
            ),
            {
              initialValue: {
                width: window.innerWidth,
                height: window.innerHeight,
              },
            }
          );

          effect(() => {
            const resize = resizeSignal();
            patchState(store, { windowSize: resize });
            _logger.debug(TAG, 'Window resized:', resize);
          });
        }
      },
    };
  })
);
