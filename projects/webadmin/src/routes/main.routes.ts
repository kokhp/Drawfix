import { Routes } from "@angular/router";
import { APP_PATH } from "../constants/app.constants";
import { authGuard } from "../guards/auth.guard";

const routes: Routes = [
  {
    path: APP_PATH.EMPTY,
    canActivateChild: [authGuard],
    loadComponent: () => import("../components/main-layout/main-layout.component"),
    children: [
      {
        path: APP_PATH.DASHBOARD,
        loadComponent: () => import("../features/dashboard/components/layout/layout.component"),
      },
      {
        path: APP_PATH.CONTENT.PARENT,
        loadChildren: () => import("./content.routes"),
      },
    ],
  },
];

export default routes;
