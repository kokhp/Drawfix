
/**
 * Coerces a given value into a pixel string (e.g., "12px").
 * Supports numeric values, strings with "em", "rem", or raw numbers.
 *
 * @param value - The input value to coerce. Can be a number or a string.
 * @param fallbackValue - The fallback pixel string to use if coercion fails. Defaults to "0px".
 * @returns A valid pixel string representation of the input, or the fallback value.
 */
export function pixelAttribute(value: unknown, fallbackValue = '0px'): string {
  const baseFontSize = 16;

  if (typeof value === 'number' && !isNaN(value)) {
    return `${value}px`;
  }

  if (typeof value === 'string' && value.trim() !== '') {
    const trimmedvalue = value.trim();

    if (trimmedvalue.endsWith('em')) {
      const value = parseFloat(trimmedvalue);
      if (!isNaN(value)) {
        return `${value * baseFontSize}px`;
      }
    } else if (trimmedvalue.endsWith('rem')) {
      const value = parseFloat(trimmedvalue);
      if (!isNaN(value)) {
        return `${value * baseFontSize}px`;
      }
    } else if (/^\d+$/.test(trimmedvalue)) {
      return `${trimmedvalue}px`;
    }
  }

  return fallbackValue;
}
