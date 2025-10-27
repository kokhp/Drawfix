import { Component, ChangeDetectionStrategy, ViewEncapsulation, input, effect, computed, signal } from '@angular/core'
import { MatIcon } from '@angular/material/icon'
import { MatButtonModule } from '@angular/material/button'
import { MatSlideToggleModule } from '@angular/material/slide-toggle'
import { MatMenuModule } from '@angular/material/menu'
import { MatRadioModule } from '@angular/material/radio'
import { MatSelectModule } from '@angular/material/select'
import { MatDialog, MatDialogModule } from '@angular/material/dialog'
import { DftFilterApplyModel, DftFilterComponent, DftFilterItem, DftFilterCompareType } from '@drafto/material/filter'
import { MatTooltip, MatTooltipModule } from "@angular/material/tooltip";
import { UpdateCategoryStatusComponent } from '../update-category-status/update-category-status.component'
import { CategoryItem, CategoryRow } from '../../models/categorylist.model'


@Component({
  selector: 'dftwa-category-list',
  standalone: true,
  imports: [
    MatIcon,
    MatButtonModule,
    MatSlideToggleModule,
    MatMenuModule,
    MatRadioModule,
    MatSelectModule,
    MatDialogModule,
    DftFilterComponent,
    MatTooltip,
    MatTooltipModule,
    UpdateCategoryStatusComponent
  ],
  templateUrl: './category-list.component.html',
  styleUrl: './category-list.component.scss',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CategoryListComponent {
  // Provide category items to render
  protected readonly initialized = signal(false);
  categories = input<CategoryItem[]>([])

  constructor(private dialog: MatDialog) { }

  // Reactive log for categories input (replaces invalid bare console.log)
  logCategoriesEffect = effect(() => {
    // Logs whenever the input signal changes
    console.log(this.categories())
  })

  // Controls visibility; when false, component renders nothing
  // Default to true so static table shows under Categories tab
  filtersApplied = input<boolean>(true)

  // Fallback signal: if filtersApplied is undefined, treat as true
  showFilters = computed(() => this.filtersApplied() ?? true)

  // Log both raw and computed values for debugging
  filtersAppliedLogEffect = effect(() => {
    console.log('[CategoryListComponent] filtersApplied (raw):', this.filtersApplied());
    console.log('[CategoryListComponent] showFilters (fallback true):', this.showFilters());
  })

  // Static rows to match row layout
  videoRows: CategoryRow[] = [
    {
      id: '1',
      title: "Day's Special",
      pinned: true,
      rulesCount: 1,
      status: 'Active',
      position: 120,
      posters: 1516,
      date: '23 Dec, 24 05:30 AM',
      createdBy: 'Unknown',
      dateType: 'Modified',
      languages: ['English', 'हिंदी', 'മലയാളം', 'ಕನ್ನಡ', 'తెలుగు', 'தமிழ்', 'বাংলা'],
    },
    {
      id: '2',
      title: 'Weekend Picks',
      pinned: false,
      rulesCount: 3,
      status: 'Inactive',
      position: 98,
      posters: 842,
      date: '12 Aug, 24 10:15 AM',
      createdBy: 'Editor',
      dateType: 'Created',
      languages: ['English', 'हिंदी'],
    }
  ]

  // Filter: mirror Manage Ordering filter component usage
  protected readonly filterList = signal<DftFilterItem[]>([
    {
      name: '#ID',
      type: 'text',
      label: '#ID',
      stickySearch: true,
      inputLabel: 'Find',
    },
    {
      name: 'search',
      type: 'text',
      label: 'Search',
      stickySearch: true,
      inputLabel: 'contains',
    },
    {
      name: 'status',
      type: 'options',
      label: 'Status',
      optionsMultiple: true,
      options: [
        { value: 'Active', label: 'Active' },
        { value: 'Inactive', label: 'Inactive' },
      ],
    },
    {
      name: 'languages',
      type: 'options',
      label: 'Languages',
      optionsMultiple: true,
      options: Array.from(new Set(this.videoRows.flatMap((r) => r.languages))).map((lng) => ({ value: lng, label: lng })),
    },
    {
      name: 'position',
      type: 'compare',
      label: 'Position',
      compareSelectWidth: '80px',
      compareInputMaxWidth: '160px',
      options: [
        { value: DftFilterCompareType.Eq, label: 'Equals' },
        { value: DftFilterCompareType.Gt, label: 'Greater than' },
        { value: DftFilterCompareType.Lt, label: 'Less than' },
        { value: DftFilterCompareType.Btw, label: 'Between' },
      ],
    },
  ])

  protected readonly appliedFilters = signal<DftFilterApplyModel[]>([])

  protected readonly filteredRows = computed(() => {
    const models = this.appliedFilters();
    let rows = [...this.videoRows];

    for (const m of models) {
      switch (m.name) {
        case 'search': {
          const q = (m.value || '').toString().trim().toLowerCase();
          if (q.length > 0) rows = rows.filter((r) => r.title.toLowerCase().includes(q));
          break;
        }
        case 'status': {
          const vals = ([] as any[]).concat(m.value || []);
          if (vals.length > 0) rows = rows.filter((r) => vals.includes(r.status));
          break;
        }
        case 'languages': {
          const vals = ([] as any[]).concat(m.value || []);
          if (vals.length > 0) rows = rows.filter((r) => r.languages.some((lng) => vals.includes(lng)));
          break;
        }
        case 'position': {
          const cmp = m.value as { name: DftFilterCompareType; value: number | [number, number] | string | [string, string] };
          if (cmp && cmp.name !== undefined && cmp.value !== undefined) {
            const toNum = (v: unknown) => (typeof v === 'string' ? Number(v) : (v as number));
            const posCheck = (p: number) => {
              switch (cmp.name) {
                case DftFilterCompareType.Eq: {
                  const n = toNum(cmp.value);
                  return Number.isFinite(n) ? p === n : true;
                }
                case DftFilterCompareType.Gt: {
                  const n = toNum(cmp.value);
                  return Number.isFinite(n) ? p > n : true;
                }
                case DftFilterCompareType.Lt: {
                  const n = toNum(cmp.value);
                  return Number.isFinite(n) ? p < n : true;
                }
                case DftFilterCompareType.Btw: {
                  const [a, b] = cmp.value as any;
                  const n1 = toNum(a);
                  const n2 = toNum(b);
                  if (Number.isFinite(n1) && Number.isFinite(n2)) {
                    const min = Math.min(n1, n2);
                    const max = Math.max(n1, n2);
                    return p >= min && p <= max;
                  }
                  return true;
                }
                default:
                  return true;
              }
            };
            rows = rows.filter((r) => posCheck(r.position));
          }
          break;
        }
        default:
          break;
      }
    }
    return rows;
  })

  // Pagination: Next/Previous based on filtered rows
  pageIndex = signal(0)
  pageSize = signal(30) // default to 30 to mirror screenshot
  totalPages = computed(() => Math.ceil(this.filteredRows().length / this.pageSize()))
  pageRows = computed(() => {
    const start = this.pageIndex() * this.pageSize()
    const data = this.filteredRows();
    return data.slice(start, start + this.pageSize())
  })
  startIndex = computed(() => this.pageIndex() * this.pageSize())
  endIndex = computed(() => Math.min(this.startIndex() + this.pageSize(), this.filteredRows().length))

  nextPage() {
    if (this.pageIndex() < this.totalPages() - 1) {
      this.pageIndex.update(i => i + 1)
    }
  }

  previousPage() {
    if (this.pageIndex() > 0) {
      this.pageIndex.update(i => i - 1)
    }
  }

  firstPage() {
    if (this.pageIndex() > 0) {
      this.pageIndex.set(0)
    }
  }

  lastPage() {
    if (this.pageIndex() < this.totalPages() - 1) {
      this.pageIndex.set(this.totalPages() - 1)
    }
  }

  setPageSize(size: number) {
    if (!size || size <= 0) return
    this.pageSize.set(size)
    this.pageIndex.set(0)
  }

  protected onFilterApplied(event: DftFilterApplyModel[]): void {
    this.appliedFilters.set(event);
    this.pageIndex.set(0);
  }

  onStatusChange(e: any, v: any) {
    console.log("eeee", e);
    console.log("vvvv", v);
  }
}