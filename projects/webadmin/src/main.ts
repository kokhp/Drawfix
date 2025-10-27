import { appConfig } from './main.config';
import { AppComponent } from './components/app/app.component';
import { bootstrapApplication } from '@angular/platform-browser';

bootstrapApplication(AppComponent, appConfig).catch((err) =>
  console.error(err)
);
