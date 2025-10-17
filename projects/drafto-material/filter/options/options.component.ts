import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnInit,
  signal,
  ViewEncapsulation,
} from '@angular/core';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatCard } from '@angular/material/card';
import { MatIcon } from '@angular/material/icon';
import { DFT_MAT_FILTER_DISPOSED, DFT_MAT_FILTER_ITEM, DFT_MAT_FILTER_DEPENDENCY_CONTEXT } from '../filter.token';
import { DftFilterOption } from '../filter.model';
import { MatTooltip } from '@angular/material/tooltip';
import { MatError, MatFormField } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';
import { MatInput } from '@angular/material/input';
import { NgTemplateOutlet } from '@angular/common';
import {
  MatListOption,
  MatSelectionList,
  MatSelectionListChange,
} from '@angular/material/list';
import { InfiniteScrollDirective } from 'ngx-infinite-scroll';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { NGXLogger } from 'ngx-logger';
import {
  catchError,
  debounceTime,
  distinctUntilChanged,
  finalize,
  lastValueFrom,
  Observable,
  of,
  pipe,
  skip,
  switchMap,
  take,
  tap,
} from 'rxjs';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { getFilterOptions } from './options.util';

const TAG = '[DftFilterOptionsComponent]:';

/**
 * DftFilterOptionsComponent is a dynamic filter options component that
 * allows users to search, select, and apply filtering criteria.
 */
@Component({
  selector: "dft-mat-filter-options",
  imports: [
    MatCard,
    MatIcon,
    MatIconButton,
    MatTooltip,
    MatFormField,
    FormsModule,
    MatInput,
    MatSelectionList,
    MatListOption,
    InfiniteScrollDirective,
    MatProgressSpinner,
    MatError,
    MatButton,
    NgTemplateOutlet,
  ],
  host: { "[class.dft-mat-filter-options]": "true" },
  templateUrl: "./options.component.html",
  styleUrl: "./options.component.scss",
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DftFilterOptionsComponent implements OnInit {
  /**
   * Logger instance for debugging and error tracking using `NGXLogger`.
   */
  private readonly _logger = inject(NGXLogger);

  /**
   * Subject to notify when the filter component is closed.
   */
  private readonly _onClosed$ = inject(DFT_MAT_FILTER_DISPOSED);

  /**
   * Injected filter item containing filter metadata and values.
   */
  protected readonly filterItem = inject(DFT_MAT_FILTER_ITEM);

  /**
   * Injected dependency context containing parent filter values.
   */
  protected readonly dependencyContext = inject(DFT_MAT_FILTER_DEPENDENCY_CONTEXT, { optional: true }) || {};

  /**
   * Initializes the component and sets up search term subscriptions.
   *
   * - Listens for changes in the search term.
   * - Debounces input to reduce excessive API calls.
   * - Fetches options dynamically based on user input.
   * - Manages loading state and error handling.
   */
  constructor() {
    if (this.filterItem.optionsSearchable) {
      this._filterByQuery(this.searchTerm);
    }
  }

  /**
   * Initializes the component by fetching the initial option list.
   */
  async ngOnInit(): Promise<void> {
    this.isBusy.set(true);
    this.errors.set(null);
    this.isInitialized.set(false);

    const values = [].concat(this.filterItem.value || []);
    const options =
      this.filterItem.options
        ?.filter((x) => values.some((y) => x.value === y))
        .map((option) => ({ ...option, selected: true })) ?? [];

    this.optionList.set([...options]);
    this.selectedList.set([...options]);

    await lastValueFrom(
      getFilterOptions(this.filterItem, {
        pageIndex: 1,
        dependencyContext: this.dependencyContext
      }).pipe(
        take(1),
        tap((options) => {
          this.optionList.update((arr) => [
            ...arr,
            ...options
              .filter((item) => !arr.some((x) => x.value === item.value))
              .map((option) => ({
                ...option,
                selected: this.selectedList().some((sel) => sel.value === option.value),
              })),
          ]);
        }),
        catchError((err) => this._handleErrors(err)),
        finalize(() => {
          this.isBusy.set(false);
          this.isInitialized.set(true);
        })
      )
    );
  }

  //#region Properties

  /**
   * Indicates whether the component is currently processing a request.
   */
  protected readonly isBusy = signal(false);

  /**
   * Indicates whether the component has been initialized.
   */
  protected readonly isInitialized = signal(false);

  /**
   * Current page index for paginated options.
   */
  protected readonly pageIndex = signal(1);

  /**
   * The current search term used for filtering options.
   */
  protected readonly searchTerm = signal("");

  /**
   * Holds error messages when loading options fails.
   */
  protected readonly errors = signal<string | null>(null);

  /**
   * List of available options for selection.
   */
  protected readonly optionList = signal<DftFilterOption[]>([]);

  /**
   * List of selected options.
   */
  protected readonly selectedList = signal<DftFilterOption[]>([]);

  /**
   * Indicates whether the selection view is currently displayed.
   */
  protected readonly showSelection = signal(false);

  /**
   * Determines whether the selection view should be available.
   */
  protected readonly hasSelectionView = computed(
    () =>
      this.filterItem.optionsPreservedSelection &&
      this.filterItem.optionsMultiple &&
      this.filterItem.optionsSearchable &&
      this.selectedList().length > 0
  );

  /**
   * Determines whether the selection view should be visible.
   */
  protected readonly isSelectionVisible = computed(() => this.showSelection() && this.hasSelectionView());

  //#endregion

  private _handleErrors(err: any): Observable<null> {
    this._logger.error(err);
    const errorMessage =
      err instanceof Error
        ? err.message
        : typeof err === "string"
        ? err
        : "An unexpected error occurred. Please check logs or contact support.";

    this.errors.set(errorMessage);
    return of(null);
  }

  private _filterByQuery = rxMethod<string>(
    pipe(
      skip(1),
      debounceTime(300),
      distinctUntilChanged(),
      tap(() => {
        this.isBusy.set(true);
        this.errors.set(null);
        this.optionList.set([]);
      }),
      switchMap((term) =>
        getFilterOptions(this.filterItem, {
          pageIndex: 1,
          searchTerm: term,
          dependencyContext: this.dependencyContext,
        }).pipe(
          tap((options) => {
            this._logger.debug(TAG, "SearchOptions", options);
            this.optionList.set(
              options.map((opt) => ({
                ...opt,
                selected: this.selectedList().some((sel) => sel.value === opt.value),
              }))
            );
          }),
          catchError((err) => this._handleErrors(err)),
          finalize(() => this.isBusy.set(false))
        )
      )
    )
  );

  //#region Methods

  /**
   * Applies the selected options and emits the closing event.
   */
  protected applyClick(): void {
    if (!this.selectedList().length) return;
    this._logger.debug(TAG, "ApplyClick", this.selectedList());

    this.filterItem.options = this.filterItem.isDynamicOptions
      ? this.selectedList()
      : this.filterItem.options;

    this.filterItem.value = this.filterItem.optionsMultiple
      ? this.selectedList().map((x) => x.value)
      : this.selectedList()[0]?.value;

    this._onClosed$.next(this.filterItem);
  }

  /**
   * Closes the filter options panel without applying changes.
   */
  protected closeClick(): void {
    this._onClosed$.next(null);
  }

  /**
   * Handles infinite scrolling to load more options dynamically.
   */
  protected async onListScrolled(): Promise<void> {
    if (this.isBusy() || !this.filterItem.optionsPaginated) return;

    this.isBusy.set(true);
    this.errors.set(null);

    const nextPageIndex = this.pageIndex() + 1;

    await lastValueFrom(
      getFilterOptions(this.filterItem, {
        pageIndex: nextPageIndex,
        searchTerm: this.searchTerm(),
        dependencyContext: this.dependencyContext,
      }).pipe(
        take(1),
        tap((options) => {
          this.optionList.update((arr) => [
            ...arr,
            ...options.filter((item) => !arr.some((x) => x.value === item.value)),
          ]);
          this.pageIndex.set(nextPageIndex);
        }),
        catchError((err) => this._handleErrors(err)),
        finalize(() => this.isBusy.set(false))
      )
    );
  }

  /**
   * Handles selection change events from the option list.
   *
   * @param event The selection list change event.
   * @param fromSelection Whether the change originated from the selection view.
   */
  protected onSelectionChanged(event: MatSelectionListChange, fromSelection: boolean = false): void {
    this._logger.debug(TAG, "SelectionChanged", event, fromSelection);
    const selectedValue = event.options[0]?.value;
    if (!selectedValue) {
      return;
    }

    this.optionList.update((options) => {
      return options.map((opt) => {
        if (opt.value === selectedValue) {
          const isSelected = fromSelection ? false : !opt.selected;

          this.selectedList.update((list) => {
            if (isSelected) {
              return this.filterItem.optionsMultiple
                ? [...list, { ...opt, selected: true }]
                : [{ ...opt, selected: true }];
            }
            return list.filter((item) => item.value !== selectedValue);
          });

          return { ...opt, selected: isSelected };
        } else if (!this.filterItem.optionsMultiple && opt.selected) {
          // For single selection, unselect all other options when a new one is selected
          const newSelection = !fromSelection && event.options[0]?.selected;
          return newSelection ? { ...opt, selected: false } : opt;
        }
        return opt;
      });
    });

    if (fromSelection && this.showSelection() && this.selectedList().length == 0) {
      this.showSelection.set(false);
    }
  }

  //#endregion
}
