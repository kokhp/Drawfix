import { Routes } from "@angular/router";
import { APP_PATH } from "../constants/app.constants";

export const routes: Routes = [
  {
    pathMatch: "full",
    path: APP_PATH.EMPTY,
    redirectTo: APP_PATH.DASHBOARD,
  },
  {
    pathMatch: "full",
    path: APP_PATH.ACCOUNTS.LOGIN,
    redirectTo: `${APP_PATH.ACCOUNTS.PARENT}/${APP_PATH.ACCOUNTS.SIGNIN.PARENT}`,
  },
  {
    path: APP_PATH.EMPTY,
    loadChildren: () => import("../features/account/account.routes"),
  },
  {
    path: APP_PATH.EMPTY,
    loadChildren: () => import("./main.routes"),
  },
  { path: APP_PATH.WILDCARD, redirectTo: APP_PATH.DASHBOARD },
];
