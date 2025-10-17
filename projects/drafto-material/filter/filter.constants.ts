import { DftFilterCompareType } from './filter.model';

export const DFT_FILTER_OVERLAY_CSS_CLASS = 'dft-filter-overlay-panel';

export const DftFilterCompareTypes = Object.values(DftFilterCompareType) as string[];

export const DftFilterCompareTypeLabels = {
  [DftFilterCompareType.Eq]: '=',
  [DftFilterCompareType.Ne]: '!=',
  [DftFilterCompareType.Gt]: '>',
  [DftFilterCompareType.Gte]: '>=',
  [DftFilterCompareType.Lt]: '<',
  [DftFilterCompareType.Lte]: '<=',
  [DftFilterCompareType.Btw]: '<==>',
};
