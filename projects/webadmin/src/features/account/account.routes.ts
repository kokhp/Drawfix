import { Routes } from "@angular/router";
import { APP_PATH } from "../../constants/app.constants";
import { authGuard } from "../../guards/auth.guard";
import { guestGuard } from "../../guards/guest.guard";

const routes: Routes = [
  {
    path: APP_PATH.ACCOUNTS.PARENT,
    children: [
      {
        path: APP_PATH.ACCOUNTS.SIGNIN.PARENT,
        loadChildren: () => import('./signin.routes'),
        canActivateChild: [guestGuard],
      },
      {
        path: APP_PATH.ACCOUNTS.FORGOT,
        loadComponent: () => import('./components/forgot/forgot.component'),
        canActivate: [guestGuard],
      },
      {
        path: APP_PATH.ACCOUNTS.RESET,
        loadComponent: () => import('./components/reset/reset.component'),
        canActivate: [authGuard],
      },
      {
        path: APP_PATH.ACCOUNTS.SIGNOUT,
        loadComponent: () => import('./components/signout/signout.component'),
        canActivate: [authGuard],
      },
      {
        path: APP_PATH.ACCOUNTS.LOGIN,
        pathMatch: 'full',
        redirectTo: APP_PATH.ACCOUNTS.SIGNIN.PARENT,
      },
    ],
  },
];

export default routes;
