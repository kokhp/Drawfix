import { inject } from "@angular/core";
import { CanActivateFn, Router, UrlTree } from "@angular/router";
import { map, filter, take, catchError, of, Observable, tap } from "rxjs";
import { AuthStore, LOGIN_PATH } from "../store/auth.store";
import { NGXLogger } from "ngx-logger";

const TAG = "[AuthGuard]:";

export const authGuard: CanActivateFn = (route, state): Observable<boolean | UrlTree> => {
  const authStore = inject(AuthStore);
  if (authStore.isAuthenticated()) {
    return of(true);
  }

  const router = inject(Router);
  const logger = inject(NGXLogger);

  // ✅ Use existing redirectUrl if available, otherwise use current URL
  const redirectUrl = route.queryParamMap.get("redirectUrl") || state.url;
  const loginUrlTree = router.createUrlTree([LOGIN_PATH], {
    queryParams: { redirectUrl },
  });

  return authStore.initialized$.pipe(
    tap((init) => logger.debug(TAG, "Triggered:", init)),
    filter(Boolean),
    take(1),
    map(() => {
      const isAuthenticated = authStore.isAuthenticated();
      logger.debug(TAG, "Authenticated", isAuthenticated, loginUrlTree);
      return isAuthenticated ? true : loginUrlTree;
    }),
    catchError(() => of(loginUrlTree))
  );
};
