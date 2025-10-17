import { Component, input, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';

@Component({
  selector: 'dftwa-template-catogory',
  imports: [FormsModule, MatSelectModule],
  templateUrl: './template-catogory.component.html',
  styleUrl: './template-catogory.component.scss',
})
export class TemplateCatogoryComponent {
  type = input<'political' | 'greeting'>('political');
  categories = signal([
    {
      id: '1',
      title: 'Category 1',
    },
    {
      id: '2',
      title: 'Category 2',
    },
    {
      id: '3',
      title: 'Category 3',
    },
    {
      id: '4',
      title: 'Category 4',
    },
  ]);
}
