import { Observable, of, throwError } from 'rxjs';
import {
  DftFilterItem,
  DftFilterOption,
  DftFilterOptionFilter,
} from '../filter.model';

export function getFilterOptions(
  filterItem: DftFilterItem,
  optionFilter: DftFilterOptionFilter
): Observable<DftFilterOption[]> {
  if (!filterItem.isDynamicOptions) {
    const searchTerm = optionFilter.searchTerm?.toLowerCase() || '';
    const filteredOptions = (filterItem.options || [])
      .filter(({ label }) => {
        if (!searchTerm) return true;
        const _lowerLabel = label?.toLowerCase() || '';
        return searchTerm.length <= 3
          ? _lowerLabel.startsWith(searchTerm)
          : _lowerLabel.includes(searchTerm);
      })
      .sort((a, b) => {
        const orderDiff = (a.order ?? Infinity) - (b.order ?? Infinity);
        return (
          orderDiff ||
          a.label?.localeCompare(b.label || '', undefined, {
            sensitivity: 'base',
          }) ||
          0
        );
      });

    return of(filteredOptions);
  }

  if (!filterItem.getOptions) {
    return throwError(() => new Error('getOptions obserable is not defined.'));
  }

  return filterItem.getOptions(optionFilter);
}
