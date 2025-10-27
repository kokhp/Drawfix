import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  inject,
  Injector,
  input,
  output,
  signal,
  TemplateRef,
  Type,
  viewChild,
  ViewContainerRef,
  ViewEncapsulation,
} from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { MatIcon } from "@angular/material/icon";
import { MatChip, MatChipListbox, MatChipRemove } from "@angular/material/chips";
import { MatIconButton } from "@angular/material/button";
import { MatTooltip } from "@angular/material/tooltip";
import { Subject, take } from "rxjs";
import { FormsModule } from "@angular/forms";
import { DftFilterApplyModel, DftFilterItem } from "./filter.model";
import { TagValuePipe, HighlightPipe } from "./filter.pipes";
import { CdkOverlayOrigin, Overlay, OverlayRef } from "@angular/cdk/overlay";
import { MatList, MatListItem } from "@angular/material/list";
import { MatDivider } from "@angular/material/divider";
import { ComponentPortal, TemplatePortal } from "@angular/cdk/portal";
import {
  DFT_MAT_FILTER_ITEM,
  DFT_MAT_FILTER_DISPOSED,
  DFT_MAT_FILTER_DEPENDENCY_CONTEXT,
} from "./filter.token";
import { DftFilterTextComponent } from "./text/text.component";
import { DftFilterOptionsComponent } from "./options/options.component";
import { DftFilterCompareComponent } from "./compare/compare.component";
import { DftFilterStore } from "./filter.store";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { NgxSkeletonLoaderModule } from "ngx-skeleton-loader";
import { NGXLogger } from "ngx-logger";
import { buildDependencyContext } from "./filter.util";

const TAG = "[DftFilterComponent]:";

/**
 * DftFilterComponent
 *
 * A reusable filter component that allows users to apply, manage, and persist filters.
 * Supports multiple filter types, query parameter syncing, and dynamic options.
 */
@Component({
  selector: "dft-mat-filter",
  imports: [
    MatIcon,
    MatChipListbox,
    MatChip,
    MatChipRemove,
    MatTooltip,
    MatIconButton,
    TagValuePipe,
    HighlightPipe,
    CdkOverlayOrigin,
    MatList,
    MatListItem,
    MatDivider,
    FormsModule,
    NgxSkeletonLoaderModule,
  ],
  providers: [DftFilterStore],
  host: { "[class.dft-mat-filter]": "true" },
  templateUrl: "./filter.component.html",
  styleUrl: "./filter.component.scss",
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DftFilterComponent {
  private readonly _router = inject(Router);
  private readonly _overlay = inject(Overlay);
  private readonly _logger = inject(NGXLogger);
  private readonly _activatedRoute = inject(ActivatedRoute);
  private readonly _viewContainerRef = inject(ViewContainerRef);

  private _overlayRef!: OverlayRef;
  private _filterDisposed$ = new Subject<DftFilterItem | null>();
  protected readonly store = inject(DftFilterStore);

  constructor() {
    this.store.syncId(this.id);
    this.store.syncSearchTerm(this.searchTerm);
    this.store.syncEnableQueryParam(this.enableQueryParam);
    this.store.syncFilters(this.filters);
    this.store.onInitChanges$.pipe(takeUntilDestroyed()).subscribe(() => {
      this._logger.debug(TAG, "StoreInitChanges", this.store.initialized());
      if (this.store.initialized() && !this.store.errors()) {
        const models = this.store.getApplyModels();
        this.onApplied?.emit(models);
        this._appendQueryParam(models);
      }
    });
  }

  //#region Inputs & Outputs

  /**
   * Unique identifier for the filter component.
   */
  id = input(this.store.id());

  /**
   * List of filter items with a transformation that ensures unique names (case-insensitive).
   */
  filters = input.required({
    transform: (_items: DftFilterItem[]) => {
      const seen = new Set<string>();
      return _items.filter(({ name }) => {
        const key = name.toLowerCase();
        return seen.has(key) ? false : seen.add(key);
      });
    },
  });

  /**
   * Determines if the filter component is disabled.
   */
  disabled = input(false, { transform: booleanAttribute });

  /**
   * Enables query parameter synchronization for filters.
   */
  enableQueryParam = input(this.store.enableQueryParam(), {
    transform: booleanAttribute,
  });

  /**
   * Name of the query parameter used for storing filter state.
   */
  queryParamName = input(this.store.queryParamName());

  /**
   * Determines if the filter icon should be displayed.
   */
  showFilterIcon = input(true, { transform: booleanAttribute });

  /**
   * Placeholder text for the filter input field.
   */
  inputPlaceholder = input("Filter");

  /**
   * Determines if the "Remove All" button should be displayed.
   */
  showRemoveAllButton = input(true, { transform: booleanAttribute });

  /**
   * Right margin for the "Remove All" button.
   */
  removeAllButtonRightMargin = input("0px");

  xPadding = input("0px");

  /**
   * Event emitted when filters are applied.
   */
  onApplied = output<DftFilterApplyModel[]>();

  //#endregion

  //#region Element Refs

  /**
   * ViewChild reference to the filter input element.
   * Used for managing user input interactions.
   */
  inputElement = viewChild<ElementRef>("filterInput");

  /**
   * ViewChild reference to the list template.
   * Used for rendering filter options dynamically.
   */
  listTemplateRef = viewChild<TemplateRef<any>>("listTemplateRef");

  //#endregion

  //#region Utilities

  /**
   * Updates the URL with the applied filter models as a query parameter.
   *
   * - Converts the filter models to a JSON string.
   * - Merges the filter data into the existing query parameters.
   * - Updates the route without adding a new history entry.
   *
   * @param {DftFilterApplyModel[]} models - The list of applied filter models.
   */
  private _appendQueryParam(models: DftFilterApplyModel[]): void {
    if (!this.enableQueryParam()) return;

    const filterQuery = this.store.stringifyQuery(models) || "[]";

    const queryParams = { ...this._activatedRoute.snapshot.queryParams };
    if (queryParams[this.queryParamName()] === filterQuery) {
      this._logger.debug(TAG, "QueryAppend", "SameFilters", queryParams);
      return;
    }

    queryParams[this.queryParamName()] = filterQuery;
    this._router.navigate([], {
      replaceUrl: true,
      relativeTo: this._activatedRoute,
      queryParams,
      queryParamsHandling: "merge",
    });
  }

  /**
   * Opens a filter overlay component.
   *
   * - Disposes of any existing overlay before creating a new one.
   * - Positions the overlay relative to the provided element.
   * - Subscribes to the filter's close event and applies the filter if needed.
   *
   * @template T - The type of the filter component.
   * @param {Type<T>} compType - The filter component to open.
   * @param {DftFilterItem} fltItem - The filter item being processed.
   * @param {ElementRef<any>} elementRef - The reference element for positioning the overlay.
   */
  private _openFilter<T>(compType: Type<T>, fltItem: DftFilterItem, elementRef: ElementRef<any>): void {
    this._overlayRef?.dispose();
    const positionStrategy = this._overlay
      .position()
      .flexibleConnectedTo(elementRef)
      .withPositions([
        {
          originX: "start",
          originY: "bottom",
          overlayX: "start",
          overlayY: "top",
          offsetY: -36,
        },
      ]);

    this._overlayRef = this._overlay.create({
      hasBackdrop: true,
      positionStrategy: positionStrategy,
      scrollStrategy: this._overlay.scrollStrategies.reposition(),
      backdropClass: "cdk-overlay-transparent-backdrop",
      panelClass: "dft-filter-overlay-panel",
    });

    this._overlayRef.backdropClick().subscribe(() => this._overlayRef?.dispose());

    this._filterDisposed$ = new Subject<DftFilterItem | null>();
    this._filterDisposed$.pipe(take(1)).subscribe((value) => {
      this._overlayRef?.dispose();
      this._logger.debug(TAG, "FilterClosed", fltItem.name, value);
      if (value) this.applyFilter(value);
    });

    // Build dependency context for this filter
    const dependencyContext = buildDependencyContext(fltItem, this.store.filterList());

    const portalInjector = Injector.create({
      providers: [
        {
          provide: DFT_MAT_FILTER_ITEM,
          useValue: { ...fltItem },
        },
        {
          provide: DFT_MAT_FILTER_DISPOSED,
          useValue: this._filterDisposed$,
        },
        {
          provide: DFT_MAT_FILTER_DEPENDENCY_CONTEXT,
          useValue: dependencyContext,
        },
      ],
    });
    const portal = new ComponentPortal(compType, null, portalInjector);
    this._overlayRef.attach(portal);
  }

  //#endregion

  protected readonly searchTerm = signal("");

  //#region Methods

  /**
   * Handles a filter item click event.
   *
   * - Clears the search term before proceeding.
   * - If the filter type is 'none', applies the filter immediately.
   * - Otherwise, opens the corresponding filter component based on its type.
   *
   * @param {DftFilterItem} fltItem - The filter item that was clicked.
   */
  protected onFilterItemClick(fltItem: DftFilterItem): void {
    if (fltItem.disabled) return;

    const elementRef = this.inputElement()?.nativeElement;
    if (!elementRef) return;

    this.searchTerm.set("");
    if (fltItem.type == "none") {
      this.applyFilter(fltItem);
      return;
    }

    switch (fltItem.type) {
      case "text":
        this._openFilter(DftFilterTextComponent, fltItem, elementRef);
        break;

      case "options":
        this._openFilter(DftFilterOptionsComponent, fltItem, elementRef);
        break;

      case "compare":
        this._openFilter(DftFilterCompareComponent, fltItem, elementRef);
        break;
    }
  }

  /**
   * Opens the filter list overlay with a configured position strategy.
   *
   * - Closes any existing overlay before creating a new one.
   * - Positions the overlay below the input element.
   * - Sets backdrop behavior to allow closing on outside click.
   * - Attaches the filter list template to the overlay.
   */
  protected openFilterList(): void {
    this._overlayRef?.dispose();
    const positionStrategy = this._overlay
      .position()
      .flexibleConnectedTo(this.inputElement()?.nativeElement)
      .withPositions([
        {
          originX: "start",
          originY: "bottom",
          overlayX: "start",
          overlayY: "top",
        },
      ]);

    this._overlayRef = this._overlay.create({
      hasBackdrop: true,
      positionStrategy: positionStrategy,
      scrollStrategy: this._overlay.scrollStrategies.reposition(),
      backdropClass: "cdk-overlay-transparent-backdrop",
      panelClass: "dft-filter-overlay-panel",
    });

    this._overlayRef.backdropClick().subscribe(() => this._overlayRef?.dispose());

    const portal = new TemplatePortal(this.listTemplateRef()!, this._viewContainerRef);
    this._overlayRef.attach(portal);
  }

  /**
   * Applies the selected filter item and updates the filter list.
   *
   * @param {DftFilterItem} fltItem - The filter item to be applied.
   *
   * - Closes the overlay if it exists.
   * - If the filter item supports sticky search and a search term is present,
   *   assigns the search term as its value and clears the search input.
   * - Assigns an `appliedOrder` if not already set, ensuring the highest order.
   * - Emits the updated filter models and updates query parameters accordingly.
   */
  protected applyFilter(fltItem: DftFilterItem): void {
    this._overlayRef?.dispose();
    if (fltItem.stickySearch && this.searchTerm().length > 0) {
      fltItem.value = this.searchTerm();
      this.searchTerm.set("");
    }

    if (!fltItem.appliedOrder) {
      fltItem.appliedOrder =
        this.store
          .filterList()
          .reduce(
            (max, x) => (x.applied && x.appliedOrder != null ? Math.max(max, x.appliedOrder) : max),
            0
          ) + 1;
    }

    const models = this.store.getApplyModels(fltItem);
    this.onApplied?.emit(models);
    this._appendQueryParam(models);
  }

  /**
   * Handles the click event on a filter tag and opens the corresponding filter component.
   *
   * @param {MouseEvent} event - The mouse event from the tag click.
   * @param {DftFilterItem} fltItem - The filter item associated with the clicked tag.
   */
  protected onTagClick(event: MouseEvent, fltItem: DftFilterItem): void {
    if (fltItem.type == "none") return;
    const elementRef = new ElementRef(event.currentTarget);
    switch (fltItem.type) {
      case "text":
        this._openFilter(DftFilterTextComponent, fltItem, elementRef);
        break;

      case "options":
        this._openFilter(DftFilterOptionsComponent, fltItem, elementRef);
        break;

      case "compare":
        this._openFilter(DftFilterCompareComponent, fltItem, elementRef);
        break;
    }
  }

  /**
   * Clears a specific filter or all filters in `_filterItems`.
   * Resets `applied`, `value`, and `appliedOrder` properties.
   * Emits updated filters via `onApplied` and updates query parameters.
   *
   * @param {DftFilterItem} [fltItem] - (Optional) The filter item to clear.
   */
  protected clearFilter(fltItem?: DftFilterItem): void {
    this.store.clearFilter(fltItem);
    const models = this.store.getApplyModels();
    this.onApplied?.emit(models);
    this._appendQueryParam(models);
  }

  //#endregion
}
