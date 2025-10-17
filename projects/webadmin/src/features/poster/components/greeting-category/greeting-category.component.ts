import { ENTER, COMMA } from '@angular/cdk/keycodes';
import { Component, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  MatAutocompleteModule,
  MatAutocompleteSelectedEvent,
} from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';

export type SelectedCategory = {
  id: string;
  title: string;
};

@Component({
  selector: 'dftwa-greeting-category',
  imports: [
    FormsModule,
    MatSlideToggleModule,
    MatIconModule,
    MatButtonModule,
    MatFormFieldModule,
    MatChipsModule,
    MatAutocompleteModule,
  ],
  templateUrl: './greeting-category.component.html',
  styleUrl: './greeting-category.component.scss',
})
export class GreetingCategoryComponent {
  readonly separatorKeysCodes = [ENTER, COMMA] as const;
  checked = false;
  categorySetting = signal(false);
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
    {
      id: '5',
      title: 'Category 5',
    },
    {
      id: '6',
      title: 'Category 6',
    },
  ]);

  selectedCategories = signal<SelectedCategory[]>([]);

  filteredCategory = computed(() => {
    const ids = this.selectedCategories().map((s) => s.id);
    return this.categories().filter((category) => !ids.includes(category.id));
  });

  categoryRemove(categoryId: string): void {
    this.selectedCategories.update((categories) => {
      return categories.filter((category) => category.id !== categoryId);
    });
  }

  categorySelected(event: MatAutocompleteSelectedEvent): void {
    this.selectedCategories.update((categories) => {
      categories.push(event.option.value);
      return [...categories];
    });
  }

  clearAll(event: MouseEvent) {
    event.stopPropagation();
    this.selectedCategories.set([]);
  }

  toggleSettings(event: MouseEvent) {
    event.stopPropagation();
    this.categorySetting.set(!this.categorySetting());
  }
}
