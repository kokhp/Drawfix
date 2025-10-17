import { CommonModule } from '@angular/common';
import { Component, ElementRef, input, signal, viewChild, AfterViewInit, TemplateRef, contentChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatRippleModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'dft-mat-carousal',
  imports: [MatIconModule, MatButtonModule, CommonModule],
  templateUrl: './carousal.component.html',
  styleUrl: './carousal.component.scss',
})
export class CarousalComponent implements AfterViewInit {
  private _ContainerElement = viewChild<ElementRef>('carousal');
  cardTemplate = contentChild.required<TemplateRef<unknown>>('card')

  list = input<any[]>([]);

  isPaginationEnabled = signal(false);
  paginationLeftEnabled = signal(false);
  paginationRightEnabled = signal(false);

  ngAfterViewInit(): void {
    this._initOverflow();
  }

  private _initOverflow(): void {
    if (this._ContainerElement()) {
      const element = this._ContainerElement()?.nativeElement;
      const isOverflowingX = element.scrollWidth > element.clientWidth;
      if (isOverflowingX) {
        this.isPaginationEnabled.set(true);
        this._updatePagination();
      }
    }
  }

  private _scrollContent(scrollFactor: number): void {
    if (this.isPaginationEnabled()) {
      const element = this._ContainerElement()?.nativeElement;
      const maxScrollLeft = element.scrollWidth - element.clientWidth;
      const scrollAmount = maxScrollLeft * scrollFactor;
      element.scrollBy({ left: scrollAmount, behavior: 'smooth' });
      setTimeout(() => this._updatePagination(), 0);
    }
  }

  private _updatePagination(): void {
    if (this.isPaginationEnabled()) {
      const element = this._ContainerElement()?.nativeElement;
      this.paginationLeftEnabled.set(element.scrollLeft > 0);
      this.paginationRightEnabled.set(
        Math.round(element.scrollLeft) < element.scrollWidth - element.clientWidth
      );
    }
  }

  protected paginationBtnClick(next: boolean = false): void {
    if (this.isPaginationEnabled()) {
      const scrollFactor = next ? 0.7 : -0.7;
      this._scrollContent(scrollFactor);
    }
  }
}
