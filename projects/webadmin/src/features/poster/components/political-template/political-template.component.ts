import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { CarousalComponent } from '../../../../../../drafto-material/carousal/carousal.component';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'dftwa-political-template',
  imports: [
    FormsModule,
    MatSlideToggleModule,
    CarousalComponent,
    MatCardModule,
    MatChipsModule,
    MatIconModule,
    MatButtonModule,
  ],
  templateUrl: './political-template.component.html',
  styleUrl: './political-template.component.scss',
})
export class PoliticalTemplateComponent {
  checked = false;
  templateSettings = signal(false);

  templates = signal(Array.from({ length: 20 }, (_, i) => ({ id: i })));

  toggleSettings(event: MouseEvent, templateId: string) {
    event.stopPropagation();
    this.templateSettings.set(!this.templateSettings());
  }

  resetTemplates() {
    if (this.checked) {
      this.templates.set(
        this.templates().map((t) => ({ ...t, selected: false }))
      );
    }
  }
}
