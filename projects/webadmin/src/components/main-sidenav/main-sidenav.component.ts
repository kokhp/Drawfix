import { NgClass } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  computed,
  inject,
} from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { RouterModule } from '@angular/router';
import { MatTooltipModule } from '@angular/material/tooltip';
import { SidenavMenuType } from '../../models/sidenav.model';
import { MainLayoutStore } from '../../store/main-layout.store';

@Component({
  selector: 'dftwa-main-sidenav',
  standalone: true,
  imports: [
    NgClass,
    RouterModule,
    MatListModule,
    MatIconModule,
    MatTooltipModule,
  ],
  templateUrl: './main-sidenav.component.html',
  styleUrl: './main-sidenav.component.scss',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MainSidenavComponent {
  //#region Services

  protected readonly layoutStore = inject(MainLayoutStore);

  //#endregion

  //#region Properties

  protected readonly MenuType = SidenavMenuType;

  protected readonly sidenavHeight = computed(() => {
    const topnavHeight = this.layoutStore.topnavHeight();
    return `calc(100vh - ${topnavHeight}px)`;
  });

  protected readonly profilePicSize = computed(() =>
    this.layoutStore.sidenavCollapsed() ? '32' : '100'
  );

  protected readonly activeMenuItemId = computed(() => {
    const menus = this.layoutStore.sidenavMenuItems();
    const fixedMenus = this.layoutStore.sidenavFixedMenuItems();
    const activeRoute = this.layoutStore.activeRoute();

    for (const it of menus.concat(fixedMenus)) {
      const routes: string[] = it.activeRoutes
        ? [...it.activeRoutes, it.route!]
        : [it.route!];
      if (routes.some((x) => activeRoute.startsWith(x))) {
        return it.id;
      }
    }
    return null;
  });

  protected readonly headerClass = computed(() =>
    this.layoutStore.sidenavCollapsed() ? 'py-1' : 'pt-2 pb-1'
  );

  //#endregion
}
