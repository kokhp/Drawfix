import {
  ChangeDetectionStrategy,
  Component,
  signal,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatTooltip } from '@angular/material/tooltip';
import { QuickEditComponent } from "../quick-edit/quick-edit.component";
import { ChooseComponent } from "../choose/choose.component";
import { CarousalComponent } from "../../../../../../drafto-material/carousal/carousal.component";
import { MatRippleModule } from '@angular/material/core';

@Component({
  selector: 'dftwa-upload-posters',
  imports: [
    MatIcon,
    MatButtonModule,
    MatTooltip,
    QuickEditComponent,
    ChooseComponent,
    CarousalComponent,
    MatRippleModule
],
  templateUrl: './upload-posters.component.html',
  styleUrl: './upload-posters.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UploadPostersComponent {
  // private readonly _dialogRef = inject(DialogRef);

  isPicker = signal(false);
  posterList = signal(Array.from({ length: 20 }, (_, i) => i))

  protected close(): void {
    // this._dialogRef?.close();
  }
}
