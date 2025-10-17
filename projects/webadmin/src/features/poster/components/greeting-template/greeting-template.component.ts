import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggle } from '@angular/material/slide-toggle';
import { CarousalComponent } from '@drafto/material';

@Component({
  selector: 'dftwa-greeting-template',
  imports: [FormsModule, MatSlideToggle, CarousalComponent, MatIconModule],
  templateUrl: './greeting-template.component.html',
  styleUrl: './greeting-template.component.scss',
})
export class GreetingTemplateComponent {
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
