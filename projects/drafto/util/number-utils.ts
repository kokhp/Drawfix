/**
 * Converts a numeric value to a pixel string.
 *
 * @param value - The numeric value to convert.
 * @returns A string representing the pixel value (e.g., "10px").
 */
export function toPixel(value?: number, fallbackValue: string = '0px'): string {
  return value != null ? `${value}px` : fallbackValue;
}

/**
 * Converts a pixel value string to a numeric value.
 *
 * @param px - A string containing a pixel value (e.g., "10px").
 * @returns The numeric value of the pixel string.
 */
export function fromPixel(px: string): number {
  const numericValue = px.replace(/[^0-9.]/g, '');
  return parseFloat(numericValue);
}


/**
 * Converts a number to a corresponding column name in Excel-style notation.
 *
 * @param n - The column number (1-based).
 * @returns The column name (e.g., 1 -> "A", 27 -> "AA").
 */
export function toExcelColumnName(n: number): string {
  let columnName = '';
  while (n > 0) {
    n--;
    columnName = String.fromCharCode(65 + (n % 26)) + columnName;
    n = Math.floor(n / 26);
  }
  return columnName;
}
