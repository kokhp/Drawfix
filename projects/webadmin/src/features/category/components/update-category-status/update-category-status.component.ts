import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatIcon } from '@angular/material/icon';
import { MatRadioModule } from '@angular/material/radio';

@Component({
  selector: 'dftwa-update-category-status',
  imports: [
    MatRadioModule,
    MatButtonModule,
    FormsModule,
    CommonModule,
    MatCardModule,
    MatChipsModule,
    MatIcon
  ],
  templateUrl: './update-category-status.component.html',
  styleUrl: './update-category-status.component.scss'
})
export class UpdateCategoryStatusComponent {
  @Input() status: 'Active' | 'Inactive' = 'Active';
  @Output() statusChange = new EventEmitter<'Active' | 'Inactive'>();
  @Output() cancel = new EventEmitter<void>();

  selectedStatus: 'Active' | 'Inactive' = 'Active';

  ngOnInit() {
    this.selectedStatus = this.status;
  }

  onSave() {
    this.statusChange.emit(this.selectedStatus);
  }

  onCancel() {
    this.cancel.emit();
  }
}
