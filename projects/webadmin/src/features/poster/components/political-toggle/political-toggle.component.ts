import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { PartiesComponent } from '../parties/parties.component';
import { PoliticalTemplateComponent } from '../political-template/political-template.component';
import { TemplateCatogoryComponent } from '../template-catogory/template-catogory.component';
import { IconicLeadersComponent } from '../iconic-leaders/iconic-leaders.component';

@Component({
  selector: 'dftwa-political-toggle',
  imports: [
    MatSlideToggleModule,
    FormsModule,
    PartiesComponent,
    PoliticalTemplateComponent,
    TemplateCatogoryComponent,
    IconicLeadersComponent,
  ],
  templateUrl: './political-toggle.component.html',
  styleUrl: './political-toggle.component.scss',
})
export class PoliticalToggleComponent {
  checked = true;
}
