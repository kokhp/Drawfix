import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  computed,
  inject,
} from '@angular/core';

import {
  MatSidenav,
  MatSidenavContainer,
  MatSidenavContent,
} from '@angular/material/sidenav';
import { RouterOutlet } from '@angular/router';
import { MainTopnavComponent } from '../main-topnav/main-topnav.component';
import { MainSidenavComponent } from '../main-sidenav/main-sidenav.component';
import { MainLayoutStore } from '../../store/main-layout.store';

@Component({
  selector: 'dftwa-main-layout',
  standalone: true,
  templateUrl: './main-layout.component.html',
  styleUrl: './main-layout.component.scss',
  imports: [
    MatSidenav,
    RouterOutlet,
    MatSidenavContent,
    MatSidenavContainer,
    MainTopnavComponent,
    MainSidenavComponent,
  ],
  host: {
    '[style.--dftwa-layout-topnav-height]': 'layoutStore.topnavHeight()',
    '[style.--dftwa-layout-conatiner-height]': 'containerHeight()',
  },
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class MainLayoutComponent {
  //#region Inject Services

  protected readonly layoutStore = inject(MainLayoutStore);

  //#endregion

  //#region Properties

  protected readonly containerHeight = computed(() => {
    const navHeight = this.layoutStore.topnavHeight();
    return `calc(100vh - ${navHeight}px)`;
  });

  //#endregion
}
