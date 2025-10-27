import { Injectable, inject } from '@angular/core';
import { NGXLogger } from 'ngx-logger';
import { SidenavMenuItem } from '../models/sidenav.model';
import {
  MatDialog,
  MatDialogConfig,
  MatDialogRef,
} from '@angular/material/dialog';
import { MAT_DIALOG_STYLES } from '../constants/app.constants';

@Injectable({
  providedIn: 'root',
})
export class AppService {
  //#region Inject Services

  private readonly _logger = inject(NGXLogger);
  private readonly _dialog = inject(MatDialog);

  //#endregion

  //#region Methods

  public sortMenus(menus: SidenavMenuItem[]): SidenavMenuItem[] {
    return menus.sort((a, b) => (a.order ?? Infinity) - (b.order ?? Infinity));
  }

  public async openUploadPosterDialog(
    configs?: MatDialogConfig
  ): Promise<MatDialogRef<any>> {
    configs = configs || {
      minWidth: 960,
      maxWidth: 960,
      autoFocus: false,
      disableClose: true,
      closeOnNavigation: false,
      panelClass: MAT_DIALOG_STYLES.HEIGHT.VH90,
    };
    const module = await import(
      '../features/poster/components/upload-posters/upload-posters.component'
    );
    return this._dialog.open(module.UploadPostersComponent, configs);
  }

  public async openManageOrderingDialog(
    configs?: MatDialogConfig
  ): Promise<MatDialogRef<any>> {
    configs = configs || {
      width: '100vw',
      height: '100vw',
      minWidth: '100vw',
      maxWidth: '100vw',
      autoFocus: false,
      disableClose: true,
      closeOnNavigation: false,
      panelClass: [MAT_DIALOG_STYLES.HEIGHT.VH100, 'no-border-radius-dialog'],
    };
    const module = await import(
      '../features/poster/components/manage-ordering/manage-ordering.component'
    );
    return this._dialog.open(module.ManageOrderingComponent, configs);
  }
  //#endregion
}
