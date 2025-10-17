import {
  Component,
  ViewEncapsulation,
  ChangeDetectionStrategy,
  signal,
  input,
  model,
  computed,
  output,
} from "@angular/core";
import { MatButtonModule } from "@angular/material/button";
import { MatCard } from "@angular/material/card";
import { MatCheckbox } from "@angular/material/checkbox";
import { MatIcon } from "@angular/material/icon";
import { MatTooltip } from "@angular/material/tooltip";
import { ListItemModel } from "../../models/posterlist.model";
import { DatePipe, SlicePipe } from "@angular/common";
import { FileSizePipe } from "@drafto/core";
import { MtxPopoverModule } from "@ng-matero/extensions/popover";

@Component({
  selector: "dftwa-manage-ordering-itemcard",
  imports: [
    MatCard,
    MatTooltip,
    MatButtonModule,
    MatIcon,
    MatCheckbox,
    DatePipe,
    FileSizePipe,
    MtxPopoverModule,
    SlicePipe,
  ],
  host: { "[class.posterlist-itemcard]": "true" },
  templateUrl: "./manage-ordering-itemcard.component.html",
  styleUrl: "./manage-ordering-itemcard.component.scss",
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ManageOrderingItemcardComponent {
  protected readonly isHoverActive = signal(false);
  protected readonly isHoverRestricted = signal(false);

  item = input.required<ListItemModel>();
  political = input<boolean>(false);
  isSelected = input<boolean>(false);
  iCheckbox = output<any>();
  protected onMouseLeave(): void {
    if (this.isHoverRestricted()) return;
    this.isHoverActive.set(false);
  }

  protected onCheckboxChanged(checked: boolean): void {
    this.iCheckbox.emit({ id: this.item().id, checked });
  }

  protected readonly visibleLanguages = computed(() => {
    const langs = this.item().languages ?? [];
    if (langs.length > 8) {
      return langs.slice(0, 8);
    }

    return langs;
  });

  protected readonly hasMoreLanguages = computed(() => {
    const langs = this.item().languages ?? [];
    return langs.length > 8;
  });

  protected readonly firstParty = computed(() => {
    const parties = this.item().parties ?? [];
    if (parties.length > 0) {
      const party = parties[0];
      return { ...party, tooltip: `(${party.shortName}) ${party.name}` };
    }
    return null;
  });

  protected readonly hasMoreParties = computed(() => {
    const parties = this.item().parties ?? [];
    return parties.length > 1;
  });

  protected readonly firstCategory = computed(() => {
    const cats = this.item().categories ?? [];
    if (cats.length > 0) {
      return cats[0];
    }
    return null;
  });

  protected readonly hasMoreCategories = computed(() => {
    const cats = this.item().categories ?? [];
    return cats.length > 1;
  });

  protected readonly pendingPublish = computed(() => {
    const publishedAt = this.item().publishedAt;
    if (!this.item().isPublished && publishedAt) {
      const publishedDate = new Date(publishedAt);
      return publishedDate.getTime() > new Date().getTime();
    }
    return false;
  });
}
