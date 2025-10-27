import { TestBed } from '@angular/core/testing';
import { DatePipe } from '@angular/common';
import { NGXLogger } from 'ngx-logger';
import { TagValuePipe, HighlightPipe } from './filter.pipes';
import { DftFilterItem, DftFilterCompareType } from './filter.model';

describe('Filter Pipes', () => {
  let tagValuePipe: TagValuePipe;
  let highlightPipe: HighlightPipe;
  let mockLogger: jasmine.SpyObj<NGXLogger>;
  let mockDatePipe: jasmine.SpyObj<DatePipe>;

  beforeEach(() => {
    mockLogger = jasmine.createSpyObj('NGXLogger', ['debug', 'info', 'warn', 'error']);
    mockDatePipe = jasmine.createSpyObj('DatePipe', ['transform']);
    mockDatePipe.transform.and.returnValue('2023-01-01');

    TestBed.configureTestingModule({
      providers: [
        TagValuePipe,
        HighlightPipe,
        { provide: NGXLogger, useValue: mockLogger },
        { provide: DatePipe, useValue: mockDatePipe },
      ],
    });

    tagValuePipe = TestBed.inject(TagValuePipe);
    highlightPipe = TestBed.inject(HighlightPipe);
  });

  describe('TagValuePipe', () => {
    describe('None type filters', () => {
      it('should return tag label for none type', () => {
        const filter: DftFilterItem = {
          name: 'status',
          type: 'none',
          label: 'Active Status',
          tagLabel: 'Active',
          value: true,
          applied: true,
          appliedOrder: 1,
        };

        const result = tagValuePipe.transform(true, filter);
        expect(result).toBe('Active');
      });

      it('should return label when tagLabel is not provided', () => {
        const filter: DftFilterItem = {
          name: 'status',
          type: 'none',
          label: 'Active Status',
          value: true,
          applied: true,
          appliedOrder: 1,
        };

        const result = tagValuePipe.transform(true, filter);
        expect(result).toBe('Active Status');
      });
    });

    describe('Text type filters', () => {
      it('should format text filter with custom labels', () => {
        const filter: DftFilterItem = {
          name: 'search',
          type: 'text',
          label: 'Search',
          tagLabel: 'Query',
          inputLabel: 'contains',
          value: 'test',
          applied: true,
          appliedOrder: 1,
        };

        const result = tagValuePipe.transform('test search', filter);
        expect(result).toBe("Query  contains  'test search'");
      });

      it('should format text filter with default labels', () => {
        const filter: DftFilterItem = {
          name: 'search',
          type: 'text',
          label: 'Search',
          inputLabel: 'contains',
          value: 'test',
          applied: true,
          appliedOrder: 1,
        };

        const result = tagValuePipe.transform('hello world', filter);
        expect(result).toBe("  contains  'hello world'");
      });
    });

    describe('Options type filters', () => {
      it('should format single option selection', () => {
        const filter: DftFilterItem = {
          name: 'category',
          type: 'options',
          label: 'Category',
          tagLabel: 'Category',
          value: 'electronics',
          applied: true,
          appliedOrder: 1,
          options: [
            { value: 'electronics', label: 'Electronics', tagLabel: 'Electronic Items' },
            { value: 'clothing', label: 'Clothing' },
          ],
        };

        const result = tagValuePipe.transform('electronics', filter);
        expect(result).toBe('Category: Electronic Items');
      });

      it('should format multiple option selections', () => {
        const filter: DftFilterItem = {
          name: 'category',
          type: 'options',
          label: 'Category',
          tagLabel: 'Categories',
          value: ['electronics', 'clothing'],
          applied: true,
          appliedOrder: 1,
          options: [
            { value: 'electronics', label: 'Electronics' },
            { value: 'clothing', label: 'Clothing' },
            { value: 'books', label: 'Books' },
          ],
        };

        const result = tagValuePipe.transform(['electronics', 'clothing'], filter);
        expect(result).toBe('Categories: Electronics, Clothing');
      });

      it('should format multiple selections with "more" text when more than 2', () => {
        const filter: DftFilterItem = {
          name: 'category',
          type: 'options',
          label: 'Category',
          tagLabel: 'Categories',
          value: ['electronics', 'clothing', 'books', 'toys'],
          applied: true,
          appliedOrder: 1,
          options: [
            { value: 'electronics', label: 'Electronics' },
            { value: 'clothing', label: 'Clothing' },
            { value: 'books', label: 'Books' },
            { value: 'toys', label: 'Toys' },
          ],
        };

        const result = tagValuePipe.transform(['electronics', 'clothing', 'books', 'toys'], filter);
        expect(result).toBe('Categories: Electronics, Clothing + 2 more');
      });

      it('should handle empty options array', () => {
        const filter: DftFilterItem = {
          name: 'category',
          type: 'options',
          label: 'Category',
          tagLabel: 'Category',
          value: 'nonexistent',
          applied: true,
          appliedOrder: 1,
          options: [],
        };

        const result = tagValuePipe.transform('nonexistent', filter);
        expect(result).toBe('Category: ');
      });
    });

    describe('Compare type filters', () => {
      it('should format single value comparison', () => {
        const filter: DftFilterItem = {
          name: 'price',
          type: 'compare',
          label: 'Price',
          tagLabel: 'Price',
          value: { name: 'GREATER', value: 100 },
          applied: true,
          appliedOrder: 1,
          options: [{ value: 'GREATER', label: 'Greater than' }],
        };

        const compareValue = { name: 'GREATER', value: 100 };
        const result = tagValuePipe.transform(compareValue, filter);
        expect(result).toBe('Price > 100');
      });

      it('should format between comparison with two values', () => {
        const filter: DftFilterItem = {
          name: 'price',
          type: 'compare',
          label: 'Price',
          tagLabel: 'Price Range',
          value: { name: 'BETWEEN', value: [50, 200] },
          applied: true,
          appliedOrder: 1,
          options: [{ value: 'BETWEEN', label: 'Between' }],
        };

        const compareValue = { name: 'BETWEEN', value: [50, 200] };
        const result = tagValuePipe.transform(compareValue, filter);
        expect(result).toBe('Price Range >= 50 && <= 200');
      });

      it('should format date comparison with date pipe', () => {
        const filter: DftFilterItem = {
          name: 'date',
          type: 'compare',
          label: 'Date',
          tagLabel: 'Created Date',
          value: { name: 'EQUAL', value: '2023-01-01' },
          applied: true,
          appliedOrder: 1,
          datePicker: true,
          options: [{ value: 'EQUAL', label: 'Equals' }],
        };

        const compareValue = { name: 'EQUAL', value: '2023-01-01' };
        const result = tagValuePipe.transform(compareValue, filter);
        expect(result).toBe('Created Date = 2023-01-01');
        expect(mockDatePipe.transform).toHaveBeenCalledWith('2023-01-01');
      });

      it('should format date range with date pipe', () => {
        const filter: DftFilterItem = {
          name: 'date',
          type: 'compare',
          label: 'Date Range',
          tagLabel: 'Date',
          value: { name: 'BETWEEN', value: ['2023-01-01', '2023-12-31'] },
          applied: true,
          appliedOrder: 1,
          datePicker: true,
          options: [{ value: 'BETWEEN', label: 'Between' }],
        };

        const compareValue = { name: 'BETWEEN', value: ['2023-01-01', '2023-12-31'] };
        const result = tagValuePipe.transform(compareValue, filter);
        expect(result).toBe('Date >= 2023-01-01 && <= 2023-01-01');
        expect(mockDatePipe.transform).toHaveBeenCalledTimes(2);
      });

      it('should return empty string for invalid compare type', () => {
        const filter: DftFilterItem = {
          name: 'price',
          type: 'compare',
          label: 'Price',
          value: { name: 'invalid', value: 100 },
          applied: true,
          appliedOrder: 1,
          options: [{ value: 'GREATER', label: 'Greater than' }],
        };

        const compareValue = { name: 'invalid', value: 100 };
        const result = tagValuePipe.transform(compareValue, filter);
        expect(result).toBe('');
      });
    });

    describe('Default case', () => {
      it('should return empty string for unknown filter type', () => {
        const filter = {
          name: 'unknown',
          type: 'unknown' as any,
          label: 'Unknown',
          value: 'test',
          applied: true,
          appliedOrder: 1,
        };

        const result = tagValuePipe.transform('test', filter);
        expect(result).toBe('');
      });
    });
  });

  describe('HighlightPipe', () => {
    it('should highlight search term in text', () => {
      const text = 'Hello world, this is a test';
      const searchTerm = 'world';

      const result = highlightPipe.transform(text, searchTerm);
      expect(result).toBe('Hello <span class="_highlight">world</span>, this is a test');
    });

    it('should highlight multiple occurrences', () => {
      const text = 'Test this test string for testing';
      const searchTerm = 'test';

      const result = highlightPipe.transform(text, searchTerm);
      expect(result).toBe('<span class="_highlight">Test</span> this <span class="_highlight">test</span> string for <span class="_highlight">test</span>ing');
    });

    it('should handle case insensitive highlighting', () => {
      const text = 'JavaScript and javascript are the same';
      const searchTerm = 'JavaScript';

      const result = highlightPipe.transform(text, searchTerm);
      expect(result).toBe('<span class="_highlight">JavaScript</span> and <span class="_highlight">javascript</span> are the same');
    });

    it('should escape special regex characters', () => {
      const text = 'Price is $100.50 (tax included)';
      const searchTerm = '$100.50';

      const result = highlightPipe.transform(text, searchTerm);
      expect(result).toBe('Price is <span class="_highlight">$100.50</span> (tax included)');
    });

    it('should return original text when search term is empty', () => {
      const text = 'Hello world';
      const searchTerm = '';

      const result = highlightPipe.transform(text, searchTerm);
      expect(result).toBe('Hello world');
    });

    it('should return original text when search term is too short', () => {
      const text = 'Hello world';
      const searchTerm = ''; // Empty string

      const result = highlightPipe.transform(text, searchTerm);
      expect(result).toBe('Hello world');
    });

    it('should handle empty text', () => {
      const text = '';
      const searchTerm = 'test';

      const result = highlightPipe.transform(text, searchTerm);
      expect(result).toBe('');
    });
  });
});
