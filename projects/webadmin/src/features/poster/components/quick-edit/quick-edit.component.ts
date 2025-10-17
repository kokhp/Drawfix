import { Component } from '@angular/core';
import { PublishAtComponent } from '../publish-at/publish-at.component';
import { ExpiryAtComponent } from '../expiry-at/expiry-at.component';
import { PoliticalToggleComponent } from '../political-toggle/political-toggle.component';
import { GreetingToggleComponent } from '../greeting-toggle/greeting-toggle.component';
import { TemplatePreviewComponent } from '../template-preview/template-preview.component';

@Component({
  selector: 'dftwa-quick-edit',
  host: {
    class: 'h-full overflow-hidden',
  },
  imports: [
    PublishAtComponent,
    ExpiryAtComponent,
    PoliticalToggleComponent,
    GreetingToggleComponent,
    TemplatePreviewComponent,
  ],
  templateUrl: './quick-edit.component.html',
  styleUrl: './quick-edit.component.scss',
})
export class QuickEditComponent {}
