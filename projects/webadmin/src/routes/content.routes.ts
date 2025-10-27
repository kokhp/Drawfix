import { Routes } from "@angular/router"
import { APP_PATH } from "../constants/app.constants"

const routes: Routes = [
  {
    path: APP_PATH.EMPTY,
    loadComponent: () => import("../components/content-tabs/content-tabs.component"),
    children: [
      {
        path: APP_PATH.CONTENT.POSTERS,
        loadComponent: () => import("../features/poster/components/posterlist/posterlist.component"),
      },
      {
        path: APP_PATH.CONTENT.CATEGORIES,
        loadComponent: () =>
          import("../features/category/components/category-list/category-list.component").then(
            (m) => m.CategoryListComponent,
          ),
      },
    ],
  },
]

export default routes
