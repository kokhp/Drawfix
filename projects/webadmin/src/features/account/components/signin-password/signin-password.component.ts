import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
  ViewEncapsulation,
} from '@angular/core';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBar } from '@angular/material/progress-bar';
import { RouterLink } from '@angular/router';
import { NGXLogger } from 'ngx-logger';

@Component({
  selector: 'dftwa-signin-password',
  imports: [
    MatCardModule,
    MatProgressBar,
    ReactiveFormsModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    RouterLink,
    MatButtonModule,
  ],
  templateUrl: './signin-password.component.html',
  styleUrl: './signin-password.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export default class SigninPasswordComponent {
  private _logger = inject(NGXLogger);

  isBusy = signal(false);
  form: FormGroup = new FormGroup({
    username: new FormControl(null),
    password: new FormControl(null),
  });

  nextQueryParams = signal<any>(null);
  isPasswordVisible = signal(false);
}
