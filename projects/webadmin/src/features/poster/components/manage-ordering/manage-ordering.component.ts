import { DialogRef } from '@angular/cdk/dialog';
import { ChangeDetectorRef, Component, effect, inject, signal, TemplateRef, viewChild, ViewChild, ElementRef } from '@angular/core';
import { MatButton, MatButtonModule, MatIconButton } from '@angular/material/button';
import { MatRippleModule } from '@angular/material/core';
import { MatIcon } from '@angular/material/icon';
import { MatTooltip } from '@angular/material/tooltip';
import { DftFilterApplyModel, DftFilterComponent, DftFilterItem } from '@drafto/material/filter';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { InfiniteScrollDirective } from 'ngx-infinite-scroll';
import { MatExpansionModule } from '@angular/material/expansion';
import { SlicePipe } from '@angular/common';
import { NGXLogger } from 'ngx-logger';
import { AppService } from 'projects/webadmin/src/services/app.service';
import { ContentTabsSotre } from 'projects/webadmin/src/store/content-tabs.store';
import { CdkDragDrop, CdkDropList, DragDropModule, moveItemInArray, CdkDragMove } from '@angular/cdk/drag-drop';
import { ManageOrderingItemcardComponent } from '../manage-ordering-itemcard/manage-ordering-itemcard.component';
import { ManageOrderingStore } from '../../store/manage-ordering.store';
import { MANAGE_ORDERING_FILTERS } from '../../constants/manage-ordering.constant';

const TAG = "[ManageOrderingComponent]:";

@Component({
  selector: 'dftwa-manage-ordering',
  imports: [
    MatIcon,
    MatButtonModule,
    MatTooltip,
    MatRippleModule,
    DftFilterComponent,
    ManageOrderingItemcardComponent,
    MatTooltip,
    MatIcon,
    MatIconButton,
    MatProgressSpinner,
    InfiniteScrollDirective,
    MatExpansionModule,
    MatButton,
    SlicePipe,
    DragDropModule
  ],
  templateUrl: './manage-ordering.component.html',
  styleUrl: './manage-ordering.component.scss'
})
export class ManageOrderingComponent {
  private readonly _dialogRef = inject(DialogRef);
  private readonly _logger = inject(NGXLogger);
  private readonly _store = inject(ManageOrderingStore);
  private readonly _tabStore = inject(ContentTabsSotre);
  private readonly _appService = inject(AppService);
  private readonly _cd = inject(ChangeDetectorRef);
  protected readonly isBusy = signal(true);
  protected readonly initialized = signal(false);
  protected readonly filterList = signal<DftFilterItem[]>([]);
  protected readonly posterList = this._store.posters;
  protected readonly apiError = this._store.apiError;
  protected readonly allPostersLoaded = this._store.allPostersLoaded;
  protected localPosterList = signal<any[]>([]);
  protected draggedList = signal<any[]>([]);

  private _navTabHeaderTemplate = viewChild<TemplateRef<any>>("navTabHeaderTemplate");
  private _categoryFilterItemTemplate = viewChild<TemplateRef<any>>("categoryFilterItemTemplate");
  private _partyFilterItemTemplate = viewChild<TemplateRef<any>>("partyFilterItemTemplate");
  private _languageFilterItemTemplate = viewChild<TemplateRef<any>>("languageFilterItemTemplate");
  @ViewChild('dropList', { read: ElementRef }) dropListEl?: ElementRef<HTMLElement>;

  selectedIds: Set<string> = new Set();
  private isDragging = false;
  lastHoverIndex: number | null = null;
  private lastSelectedIndex: number | null = null; // anchor for shift-click selection range
  hoverSide: 'before' | 'after' | null = null;     // which side to drop near the hovered card

  constructor() {
    effect(() => {
      const busy = this._store.isBusy();
      if (this._store.initialized()) {
        this.isBusy.set(busy);
        this._logger.debug(TAG, "Store isBusy state changed", busy);
      }
    });

    effect(() => {
      // Simply sync the store posters to local list
      const storePosters = this._store.posters();
      this.localPosterList.set([...storePosters]);
      this._logger.debug(TAG, "List synced from store", { count: storePosters.length });
    });
  }

  ngOnInit(): void {
    this.isBusy.set(true);
    this.clearFilterUrlParameters();
  }

  private clearFilterUrlParameters(): void {
    const currentUrl = new URL(window.location.href);
    const paramsToRemove = [
      'category', 'party', 'languages', 'status', 'posterType',
      'publishedAt', 'createdAt', 'partyState', 'manage-ordering-category',
      'manage-ordering-party', 'manage-ordering-languages', 'manage-ordering-status',
      'manage-ordering-posterType', 'manage-ordering-publishedAt', 'manage-ordering-createdAt',
      'manage-ordering-partyState'
    ];

    let hasChanges = false;
    paramsToRemove.forEach(param => {
      if (currentUrl.searchParams.has(param)) {
        currentUrl.searchParams.delete(param);
        hasChanges = true;
      }
    });

    if (hasChanges) {
      window.history.replaceState({}, '', currentUrl.toString());
      this._logger.debug(TAG, "Cleared filter URL parameters to prevent synchronization");
    }
  }

  ngAfterViewInit(): void {
    this._tabStore.setNavTabHeaderTemplateRef(this._navTabHeaderTemplate() ?? null);
    this._store.setAppliedFilters([]);

    const filters = [];
    for (const flt of this._store.filterList()) {
      const f = { ...flt };
      f.applied = false;
      f.value = undefined;

      if (f.name === MANAGE_ORDERING_FILTERS.category.name) {
        f.optionsItemTemplateRef = this._categoryFilterItemTemplate();
      } else if (f.name === MANAGE_ORDERING_FILTERS.party.name) {
        f.optionsItemTemplateRef = this._partyFilterItemTemplate();
      } else if (f.name === MANAGE_ORDERING_FILTERS.languages.name) {
        f.optionsItemTemplateRef = this._languageFilterItemTemplate();
      }
      filters.push(f);
    }
    this.filterList.set(filters);
    this._logger.debug(TAG, "Initialized with clean filter state", { filters });
    this.initialized.set(true);
  }

  protected onFilterApplied(event: DftFilterApplyModel[]): void {
    this.isBusy.set(true);
    this._store.setAppliedFilters(event);
    this._store.loadPosters({ loadMore: false, refresh: false });
    this._logger.debug(TAG, "User applied filters", event);
  }

  protected onRefreshClicked(): void {
    this.isBusy.set(true);
    this._store.loadPosters({ loadMore: false, refresh: true });
    this._logger.debug(TAG, "User clicked refresh button");
  }

  protected onScrolled(): void {
    this.isBusy.set(true);
    this._store.loadPosters({ loadMore: true, refresh: false });
    this._logger.debug(TAG, "User scrolled to bottom, loading more posters");
    this._cd.detectChanges();
  }

  protected async btnManageOrderingClick(): Promise<void> {
    await this._appService.openManageOrderingDialog();
  }

  isSelected(id: string): boolean {
    return this.selectedIds.has(id);
  }

  toggleSelection(event: any) {
    const { id, checked } = event;
    if (checked) {
      this.selectedIds.add(id);
      const idx = this.localPosterList().findIndex(it => it.id === id);
      this.lastSelectedIndex = idx !== -1 ? idx : this.lastSelectedIndex;
    } else {
      this.selectedIds.delete(id);
    }
    this._logger.debug(TAG, "Selection toggled", { id, checked, selectedCount: this.selectedIds.size });
  }

  onCardClick(event: MouseEvent, item: any) {
    if (event.defaultPrevented || this.isDragging) {
      return;
    }

    const currentIndex = this.localPosterList().findIndex(it => it.id === item.id);

    if (event.shiftKey && this.lastSelectedIndex !== null && currentIndex !== -1) {
      const start = Math.min(this.lastSelectedIndex, currentIndex);
      const end = Math.max(this.lastSelectedIndex, currentIndex);
      for (let i = start; i <= end; i++) {
        this.selectedIds.add(this.localPosterList()[i].id);
      }
      this._logger.debug(TAG, "Shift-range selected", { start, end, count: this.selectedIds.size });
      return;
    }

    if ((event.ctrlKey || event.metaKey) && !event.shiftKey) {
      const isSelected = this.selectedIds.has(item.id);
      this.toggleSelection({ id: item.id, checked: !isSelected });
      this.lastSelectedIndex = currentIndex !== -1 ? currentIndex : this.lastSelectedIndex;
    } else {
      this.selectedIds.clear();
      this.selectedIds.add(item.id);
      this.lastSelectedIndex = currentIndex !== -1 ? currentIndex : this.lastSelectedIndex;
    }
  }

  /**
   * Handle drag and drop - supports both single and multiple item dragging
   */
  onDrop(event: CdkDragDrop<any[]>): void {
    const list = [...this.localPosterList()];
    const draggedItem = list[event.previousIndex];
    if (!draggedItem) return;
  
    this._logger.debug(TAG, "Drop event (reverted)", {
      previousIndex: event.previousIndex,
      currentIndex: event.currentIndex,
      hoverIndex: this.lastHoverIndex,
      selectedCount: this.selectedIds.size
    });
  
    // Resolve target index without hoverSide: prefer lastHoverIndex, fallback to CDK
    let targetIndex = this.lastHoverIndex != null ? this.lastHoverIndex : event.currentIndex;
    targetIndex = Math.max(0, Math.min(targetIndex, list.length - 1));
  
    // Single item move
    if (this.selectedIds.size <= 1) {
      if (event.previousIndex === targetIndex) return;
  
      const prevDragged = this.draggedList();
      this.draggedList.set([...prevDragged, draggedItem]);
      moveItemInArray(list, event.previousIndex, targetIndex);
      this.localPosterList.set(list);
      this._logger.debug(TAG, "Single item moved (reverted)", { itemId: draggedItem.id, toIndex: targetIndex });
      return;
    }
  
    // Group move (neutral insertion without hoverSide)
    const selectedItems = list.filter(item => this.selectedIds.has(item.id));
    const unselectedItems = list.filter(item => !this.selectedIds.has(item.id));
  
    const findUnselectedInsertionIndex = (): number => {
      const targetItem = list[targetIndex];
  
      // If target is unselected, insert before it (neutral behavior)
      if (targetItem && !this.selectedIds.has(targetItem.id)) {
        const idx = unselectedItems.findIndex(u => u.id === targetItem.id);
        return idx === -1 ? unselectedItems.length : idx;
      }
  
      // Scan left: insert after the nearest unselected on the left
      for (let i = targetIndex - 1; i >= 0; i--) {
        const it = list[i];
        if (it && !this.selectedIds.has(it.id)) {
          const idx = unselectedItems.findIndex(u => u.id === it.id);
          return idx === -1 ? unselectedItems.length : idx + 1;
        }
      }
  
      // Scan right: insert before the nearest unselected on the right
      for (let i = targetIndex + 1; i < list.length; i++) {
        const it = list[i];
        if (it && !this.selectedIds.has(it.id)) {
          const idx = unselectedItems.findIndex(u => u.id === it.id);
          return idx === -1 ? unselectedItems.length : idx;
        }
      }
  
      // No unselected neighbors found
      return unselectedItems.length;
    };
  
    const insertIndex = findUnselectedInsertionIndex();
  
    const finalList = [
      ...unselectedItems.slice(0, insertIndex),
      ...selectedItems,
      ...unselectedItems.slice(insertIndex),
    ];
  
    const prevDragged = this.draggedList();
    this.draggedList.set([...prevDragged, ...selectedItems]);
    this.localPosterList.set(finalList);
  
    this._logger.debug(TAG, "Multiple items moved (reverted)", {
      itemsMoved: selectedItems.length,
      targetIndex: insertIndex,
    });
  }

  clearSelection(): void {
    this.selectedIds.clear();
    this._logger.debug(TAG, "Selection cleared");
  }

  onDragStarted(event: any): void {
    this.isDragging = true;
    if (this.selectedIds.size === 0) {
      const draggedItem = event.source.data;
      if (draggedItem) {
        this.selectedIds.add(draggedItem.id);
        this._logger.debug(TAG, "Auto-selected dragged item", { itemId: draggedItem.id });
      }
    }

    this._logger.debug(TAG, "Drag started", { selectedCount: this.selectedIds.size });
  }

  onDragEnded(): void {
    setTimeout(() => {
      this.isDragging = false;
      this.lastHoverIndex = null;
      this.hoverSide = null;
    }, 100);

    this._logger.debug(TAG, "Drag ended");
  }

  protected close(): void {
    this._store.setAppliedFilters([]);
    this._dialogRef?.close();
  }

  getDropIndexForItem(draggedItem: any): number {
    const updatedList = this.localPosterList();
    return updatedList.findIndex(item => item.id === draggedItem.id);
  }

  onSave(): void {
    const draggedIds = new Set(this.draggedList().map(item => item.id));
    const updatedList = [...this.localPosterList()];

    const timeIncrement = 200 * 1000;

    function getMidpointTimestamp(beforeDate: Date, afterDate: Date): string {
      const beforeTime = beforeDate.getTime();
      const afterTime = afterDate.getTime();
      const midTime = beforeTime + (afterTime - beforeTime) / 2;
      return new Date(midTime).toISOString();
    }

    const resultList = updatedList.map((item, index) => {
      if (!draggedIds.has(item.id)) {
        return item;
      }

      let prevIndex = index - 1;
      while (prevIndex >= 0 && draggedIds.has(updatedList[prevIndex].id)) {
        prevIndex--;
      }

      let nextIndex = index + 1;
      while (nextIndex < updatedList.length && draggedIds.has(updatedList[nextIndex].id)) {
        nextIndex++;
      }

      const prevItem = prevIndex >= 0 ? updatedList[prevIndex] : null;
      const nextItem = nextIndex < updatedList.length ? updatedList[nextIndex] : null;

      let newCreatedAt = item.createdAt;
      let previousPosterId: string | null = null;
      let relativeTo: "after" | "before" | "start" = "start";

      if (prevItem && nextItem) {
        const prevDate = new Date(prevItem.createdAt);
        const nextDate = new Date(nextItem.createdAt);

        if (prevDate.getTime() >= nextDate.getTime()) {
          newCreatedAt = new Date(prevDate.getTime() + timeIncrement).toISOString();
          previousPosterId = prevItem.id;
          relativeTo = "after";
        } else {
          newCreatedAt = getMidpointTimestamp(prevDate, nextDate);
          previousPosterId = prevItem.id;
          relativeTo = "after";
        }
      } else if (prevItem) {
        const prevDate = new Date(prevItem.createdAt);
        newCreatedAt = new Date(prevDate.getTime() + timeIncrement).toISOString();
        previousPosterId = prevItem.id;
        relativeTo = "after";
      } else if (nextItem) {
        const nextDate = new Date(nextItem.createdAt);
        newCreatedAt = new Date(nextDate.getTime() - timeIncrement).toISOString();
        previousPosterId = null;
        relativeTo = "before";
      } else {
        newCreatedAt = new Date().toISOString();
        previousPosterId = null;
        relativeTo = "start";
      }

      return {
        ...item,
        createdAt: newCreatedAt,
        newCreatedAt,
        previousPosterId,
        relativeTo
      };
    });

    const finalList = resultList.map(item => ({
      id: item.id,
      createdAt: item.createdAt
    }));

  }

  trackById(index: number, item: any): string {
    return item.id;
  }

  /**
   * Track hover index during drag to improve drop index resolution in grid layouts.
   */
  onDragMoved(event: CdkDragMove<any>): void {
    const { x, y } = event.pointerPosition;
    const elements = document.elementsFromPoint(x, y);
  
    // Direct hit on a card
    const targetEl = elements.find(el => el instanceof HTMLElement && el.hasAttribute('data-id')) as HTMLElement | undefined;
    if (targetEl) {
      const id = targetEl.getAttribute('data-id');
      const idx = id ? this.localPosterList().findIndex(item => item.id === id) : -1;
      this.lastHoverIndex = idx !== -1 ? idx : null;
  
      // compute insertion side relative to card center
      const rect = targetEl.getBoundingClientRect();
      const cy = rect.top + rect.height / 2;
      this.hoverSide = y < cy ? 'before' : 'after';
  
      if (this.lastHoverIndex !== null) {
        this._logger.debug(TAG, 'Drag moved over index (direct)', { index: this.lastHoverIndex, id, side: this.hoverSide });
      }
      return;
    }
  
    // Fallback: nearest card center (handles empty grid gaps)
    const container = this.dropListEl?.nativeElement ?? document;
    const cardEls = Array.from(container.querySelectorAll<HTMLElement>('[data-id]'));
    if (cardEls.length === 0) {
      this.lastHoverIndex = null;
      this.hoverSide = null;
      return;
    }
  
    let bestIdx: number | null = null;
    let bestDist = Number.POSITIVE_INFINITY;
    let bestEl: HTMLElement | null = null; // declare bestEl
    const list = this.localPosterList();
  
    for (const el of cardEls) {
      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = x - cx;
      const dy = y - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const id = el.getAttribute('data-id');
      const idx = id ? list.findIndex(item => item.id === id) : -1;
      if (idx !== -1 && dist < bestDist) {
        bestDist = dist;
        bestIdx = idx;
        bestEl = el;
      }
    }
  
    this.lastHoverIndex = bestIdx;
  
    if (bestEl) {
      const rect = bestEl.getBoundingClientRect();
      const cy = rect.top + rect.height / 2;
      this.hoverSide = y < cy ? 'before' : 'after';
    } else {
      this.hoverSide = null;
    }
  
    if (this.lastHoverIndex !== null) {
      const id = list[this.lastHoverIndex]?.id;
      this._logger.debug(TAG, 'Drag moved near index (nearest)', { index: this.lastHoverIndex, id, side: this.hoverSide });
    }
  }
}