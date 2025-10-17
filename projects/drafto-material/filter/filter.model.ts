import { ValidatorFn } from '@angular/forms';
import { Observable } from 'rxjs';
import { TemplateRef } from '@angular/core';

export declare type DftFilterType = 'none' | 'text' | 'options' | 'compare';

export enum DftFilterCompareType {
  Eq = 'EQUAL',
  Ne = 'NOT_EQUAL',
  Gt = 'GREATER',
  Gte = 'GREATER_EQUAL',
  Lt = 'LESS',
  Lte = 'LESS_EQUAL',
  Btw = 'BETWEEN',
}

export declare type DftFilterOption = {
  value: string | number | DftFilterCompareType;
  label?: string;
  tagLabel?: string;
  order?: number;
  selected?: boolean;
  extras?: { [key: string]: any };
};

export declare type DftFilterDependency = {
  parentFilter: string;
  parentValues?: (string | number)[]; // If specified, only these parent values trigger dependency
  clearOnParentChange?: boolean; // Whether to clear this filter when parent changes
  hideWhenParentEmpty?: boolean; // Whether to hide this filter when parent has no value
  disableWhenParentEmpty?: boolean; // Whether to disable this filter when parent has no value
};

export declare type DftFilterOptionFilter = {
  pageIndex?: number;
  searchTerm?: string;
  values?: (string | number)[];
  dependencyContext?: { [key: string]: any };
};

export declare type DftFilterItem = {
  name: string;
  type: DftFilterType;
  label: string;
  value?: any;
  tagLabel?: string;
  headerLabel?: string;
  options?: DftFilterOption[];
  stickySearch?: boolean;
  disabled?: boolean;
  hidden?: boolean;
  applied?: boolean;
  appliedOrder?: number;
  controlMinWidth?: string;
  controlMaxWidth?: string;
  controlMinHeight?: string;
  controlMaxHeight?: string;
  inputLabel?: string;
  datePicker?: boolean;
  validators?: ValidatorFn | ValidatorFn[];
  isDynamicOptions?: boolean;
  getOptions?: (filter: DftFilterOptionFilter) => Observable<DftFilterOption[]>;
  optionsSearchable?: boolean;
  optionsPaginated?: boolean;
  optionsMultiple?: boolean;
  optionsFilter?: DftFilterOptionFilter;
  optionsPreservedSelection?: boolean;
  optionsItemTemplateRef?: TemplateRef<{
    $implicit: DftFilterOption;
    index: number;
    selected: boolean;
  }>;
  compareSelectWidth?: string;
  compareInputMaxWidth?: string;

  dependencies?: DftFilterDependency[]; // This filter depends on these parent filters
  dependencyLevel?: number; // 0 = no dependencies, 1 = depends on level 0, etc.
  mutuallyExclusive?: string[]; // List of filter names that should be cleared when this filter is applied
};

export declare type DftFilterApplyModel = {
  name: string;
  value: any;
};
