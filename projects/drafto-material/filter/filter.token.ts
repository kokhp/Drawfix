import { InjectionToken } from "@angular/core";
import { DftFilterItem } from "./filter.model";
import { Subject } from "rxjs";

export const DFT_MAT_FILTER_ITEM = new InjectionToken<DftFilterItem>(
  'DFT_MAT_FILTER_ITEM'
);

export const DFT_MAT_FILTER_DISPOSED = new InjectionToken<
  Subject<DftFilterItem | null>
>('DFT_MAT_FILTER_DISPOSED');

export const DFT_MAT_FILTER_DEPENDENCY_CONTEXT = new InjectionToken<{ [key: string]: any }>(
  'DFT_MAT_FILTER_DEPENDENCY_CONTEXT'
);
