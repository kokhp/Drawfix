import {
  AfterViewInit,
  Component,
  ElementRef,
  ViewEncapsulation,
  inject,
  viewChild,
} from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { MatToolbar } from '@angular/material/toolbar';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatProgressBar } from '@angular/material/progress-bar';
import { MainLayoutStore } from '../../store/main-layout.store';
import { AppService } from '../../services/app.service';

@Component({
  selector: 'dftwa-main-topnav',
  standalone: true,
  imports: [MatIcon, MatToolbar, MatButton, MatIconButton, MatProgressBar],
  host: {},
  templateUrl: './main-topnav.component.html',
  styleUrl: './main-topnav.component.scss',
  encapsulation: ViewEncapsulation.None,
})
export class MainTopnavComponent implements AfterViewInit {
  //#region Services
  private readonly _appService = inject(AppService);
  protected readonly layoutStore = inject(MainLayoutStore);


  //#endregion

  //#region References

  private containerElement = viewChild<ElementRef>('container');

  //#endregion

  //#region Implementations

  ngAfterViewInit(): void {
    if (this.containerElement()?.nativeElement) {
      const height = this.containerElement()?.nativeElement.offsetHeight || 0;
      if (height != this.layoutStore.topnavHeight()) {
        this.layoutStore.setTopnavHeight(height);
      }
    }
  }

  //#endregion

  protected async btnUploadPostersClick(): Promise<void> {
    await this._appService.openUploadPosterDialog();
  }
}
