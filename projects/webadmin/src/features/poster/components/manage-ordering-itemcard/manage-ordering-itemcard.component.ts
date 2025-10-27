import {
  Component,
  ViewEncapsulation,
  ChangeDetectionStrategy,
  signal,
  input,
  computed,
  output,
} from "@angular/core";
import { MatButtonModule } from "@angular/material/button";
import { MatCard } from "@angular/material/card";
import { MatCheckbox } from "@angular/material/checkbox";
import { MatIcon } from "@angular/material/icon";
import { DatePipe } from "@angular/common";
import { MtxPopoverModule } from "@ng-matero/extensions/popover";
import { ManageOrderingListItemModel } from "../../models/manage-ordering.model";

@Component({
  selector: "dftwa-manage-ordering-itemcard",
  imports: [
    MatCard,
    MatButtonModule,
    MatIcon,
    MatCheckbox,
    DatePipe,
    MtxPopoverModule,
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

  item = input.required<ManageOrderingListItemModel>();
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
