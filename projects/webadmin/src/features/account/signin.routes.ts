import { Routes } from '@angular/router';
import { APP_PATH } from '../../constants/app.constants';
import { guestGuard } from '../../guards/guest.guard';

const routes: Routes = [
  {
    path: APP_PATH.EMPTY,
    loadComponent: () => import('./components/onboarding/onboarding.component'),
    children: [
      {
        path: APP_PATH.ACCOUNTS.SIGNIN.PHONE,
        loadComponent: () =>
          import('./components/signin-phone/signin-phone.component'),
        canActivate: [guestGuard],
      },
      {
        path: APP_PATH.ACCOUNTS.SIGNIN.PASSWORD,
        loadComponent: () =>
          import('./components/signin-password/signin-password.component'),
        canActivate: [guestGuard],
      },
      { path: APP_PATH.WILDCARD, redirectTo: APP_PATH.ACCOUNTS.SIGNIN.PHONE },
    ],
  },
];

export default routes;
