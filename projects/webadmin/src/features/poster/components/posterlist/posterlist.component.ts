import {
  AfterViewInit,
  Component,
  effect,
  inject,
  OnInit,
  signal,
  TemplateRef,
  viewChild,
} from "@angular/core";
import { DftFilterComponent, DftFilterItem, DftFilterApplyModel } from "@drafto/material/filter";

import { PosterlistItemcardComponent } from "../posterlist-itemcard/posterlist-itemcard.component";
import { PosterListStore } from "../../store/posterlist.store";
import { NGXLogger } from "ngx-logger";
import { MatButton, MatIconButton } from "@angular/material/button";
import { MatIcon } from "@angular/material/icon";
import { MatTooltip } from "@angular/material/tooltip";
import { MatProgressSpinner } from "@angular/material/progress-spinner";
import { InfiniteScrollDirective } from "ngx-infinite-scroll";
import { MatExpansionModule } from "@angular/material/expansion";
import { ContentTabsSotre } from "../../../../store/content-tabs.store";
import { POSTER_LIST_FILTERS } from "../../constants/posterlist.constant";
import { SlicePipe } from "@angular/common";
import { AppService } from "projects/webadmin/src/services/app.service";

const TAG = "[PosterlistComponent]:";

@Component({
  selector: "dftwa-posterlist",
  imports: [
    DftFilterComponent,
    PosterlistItemcardComponent,
    MatTooltip,
    MatIcon,
    MatIconButton,
    MatProgressSpinner,
    InfiniteScrollDirective,
    MatExpansionModule,
    MatButton,
    SlicePipe,
  ],
  templateUrl: "./posterlist.component.html",
  styleUrl: "./posterlist.component.scss",
})
export default class PosterlistComponent implements OnInit, AfterViewInit {
  private readonly _logger = inject(NGXLogger);
  private readonly _store = inject(PosterListStore);
  private readonly _tabStore = inject(ContentTabsSotre);
  private readonly _appService = inject(AppService);
  constructor() {
    effect(() => {
      const busy = this._store.isBusy();
      if (this._store.initialized()) {
        this.isBusy.set(busy);
        this._logger.debug(TAG, "Store isBusy state changed", busy);
      }
    });
  }

  ngOnInit(): void {
    this.isBusy.set(true);
  }

  private _navTabHeaderTemplate = viewChild<TemplateRef<any>>("navTabHeaderTemplate");
  private _categoryFilterItemTemplate = viewChild<TemplateRef<any>>("categoryFilterItemTemplate");
  private _partyFilterItemTemplate = viewChild<TemplateRef<any>>("partyFilterItemTemplate");
  private _languageFilterItemTemplate = viewChild<TemplateRef<any>>("languageFilterItemTemplate");

  ngAfterViewInit(): void {
    this._tabStore.setNavTabHeaderTemplateRef(this._navTabHeaderTemplate() ?? null);
    const filters = [];
    const appliedFilters = this._store.appliedFilters();
    for (const flt of this._store.filterList()) {
      const f = { ...flt };
      const af = appliedFilters.find((af) => af.name === flt.name);
      if (af) {
        f.applied = true;
        f.value = af.value;
      }

      if (f.name === POSTER_LIST_FILTERS.category.name) {
        f.optionsItemTemplateRef = this._categoryFilterItemTemplate();
      } else if (f.name === POSTER_LIST_FILTERS.party.name) {
        f.optionsItemTemplateRef = this._partyFilterItemTemplate();
      } else if (f.name === POSTER_LIST_FILTERS.languages.name) {
        f.optionsItemTemplateRef = this._languageFilterItemTemplate();
      }
      filters.push(f);
    }
    this.filterList.set(filters);
    this._logger.debug(TAG, "Initialized", { filters, appliedFilters });
    this.initialized.set(true);
  }

  protected readonly isBusy = signal(true);
  protected readonly initialized = signal(false);
  protected readonly filterList = signal<DftFilterItem[]>([]);
  protected readonly posterList = this._store.posters;
  protected readonly apiError = this._store.apiError;
  protected readonly allPostersLoaded = this._store.allPostersLoaded;

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
  }

   protected async btnManageOrderingClick(): Promise<void> {
    await this._appService.openManageOrderingDialog();
  }
}
