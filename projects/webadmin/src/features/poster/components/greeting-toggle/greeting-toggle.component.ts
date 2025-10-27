import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { GreetingCategoryComponent } from '../greeting-category/greeting-category.component';
import { GreetingTemplateComponent } from '../greeting-template/greeting-template.component';
import { TemplateCatogoryComponent } from '../template-catogory/template-catogory.component';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'dftwa-greeting-toggle',
  imports: [
    MatSlideToggleModule,
    FormsModule,
    GreetingCategoryComponent,
    GreetingTemplateComponent,
    TemplateCatogoryComponent,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule
  ],
  templateUrl: './greeting-toggle.component.html',
  styleUrl: './greeting-toggle.component.scss',
})
export class GreetingToggleComponent {
  checked = true;
  showMore = false;
}
