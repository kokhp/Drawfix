import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { map, filter, take, catchError, of, tap } from 'rxjs';
import { AuthStore } from '../store/auth.store';
import { APP_PATH } from '../constants/app.constants';
import { NGXLogger } from 'ngx-logger';

const TAG = '[GuestGuard]:';

export const guestGuard: CanActivateFn = () => {
  const router = inject(Router);
  const logger = inject(NGXLogger);
  const authStore = inject(AuthStore);
  const homeUrlTree = router.createUrlTree([`/${APP_PATH.DASHBOARD}`]);

  return authStore.initialized$.pipe(
    tap((init) => logger.debug(TAG, 'Triggered', init)),
    filter(Boolean),
    take(1),
    map(() => {
      const isAuthenticated = authStore.isAuthenticated();
      logger.debug(TAG, 'Authenticated', isAuthenticated, homeUrlTree);
      return isAuthenticated ? homeUrlTree : true;
    }),
    catchError(() => of(true))
  );
};
