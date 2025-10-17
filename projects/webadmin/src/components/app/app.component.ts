import {
  ChangeDetectionStrategy,
  Component,
  inject,
  ViewEncapsulation,
} from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonService } from '@drafto/core';

@Component({
  standalone: true,
  selector: 'app-root',
  imports: [RouterOutlet],
  template: '<router-outlet />',
  styleUrls: ['./app.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {
  title = 'webadmin';
  common = inject(CommonService);

  constructor() {
    // this.common.onNavigationStart.subscribe((ev) => {
    //   console.log('Route start', ev);
    // });

    // this.common.onNavigationEnd.subscribe((ev)=> {
    //   console.log("Route", ev);
    // })
  }
}
