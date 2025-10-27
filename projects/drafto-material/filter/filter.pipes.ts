import { Pipe, PipeTransform, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { DftFilterCompareType, DftFilterItem } from './filter.model';
import { DftFilterCompareTypeLabels, DftFilterCompareTypes } from './filter.constants';
import { NGXLogger } from 'ngx-logger';

const TAG = '[TagValuePipe]:';

@Pipe({
  name: 'tagValue',
  standalone: true,
})
export class TagValuePipe implements PipeTransform {
  private readonly _datePipe = inject(DatePipe);
  private readonly _logger = inject(NGXLogger);

  transform(value: any, filter: DftFilterItem): string {
    this._logger.debug(TAG, 'Transform', value);
    switch (filter.type) {
      case 'none':
        return filter.tagLabel || filter.label;

      case 'text':
        return `${filter.tagLabel || ''}  ${filter.inputLabel}  '${value}'`;

      case 'options':
        const selectedValues = Array.isArray(value) ? value : [value];
        const values =
          filter.options
            ?.filter((x) => selectedValues.some((y) => x.value == y))
            .map((x) => x.tagLabel || x.label) || [];
        return `${filter.tagLabel}: ${
          values.length <= 2
            ? values.join(', ')
            : `${values.slice(0, 2).join(', ')} + ${values.length - 2} more`
        }`;

      case 'compare':
        if (!DftFilterCompareTypes.includes(value.name)) {
          return '';
        }

        const label = filter.tagLabel || filter.label;
        const isBetween = Array.isArray(value.value);
        if (isBetween && (value.value as string[]).length == 2) {
          const gteLabel = DftFilterCompareTypeLabels[DftFilterCompareType.Gte];
          const lteLabel = DftFilterCompareTypeLabels[DftFilterCompareType.Lte];
          let gteValue = value.value[0],
            lteValue = value.value[1];
          if (filter.datePicker) {
            gteValue = this._datePipe.transform(gteValue);
            lteValue = this._datePipe.transform(lteValue);
          }
          return `${label} ${gteLabel} ${gteValue} && ${lteLabel} ${lteValue}`;
        }

        let tagValue = value.value;
        if (filter.datePicker) {
          tagValue = this._datePipe.transform(tagValue);
        }

        const optionType = value.name as DftFilterCompareType;
        return `${label} ${DftFilterCompareTypeLabels[optionType]} ${tagValue}`;

      default:
        return '';
    }
  }
}

@Pipe({
  name: 'highlight',
  standalone: true,
})
export class HighlightPipe implements PipeTransform {
  transform(value: string, searchTerm: string): string {
    if (searchTerm.length >= 1) {
      const escapedSearchTerm = searchTerm.replace(
        /[.*+?^${}()|[\]\\]/g,
        '\\$&'
      );
      const searchTermRegex = new RegExp(escapedSearchTerm, 'ig');
      return value.replace(
        searchTermRegex,
        (match) => `<span class="_highlight">${match}</span>`
      );
    }
    return value;
  }
}
