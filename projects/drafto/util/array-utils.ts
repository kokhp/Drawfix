/**
 * Splits an array into smaller arrays of a specified length.
 *
 * @param items - The array to split.
 * @param bulkLength - The maximum length of each sub-array.
 * @returns An array of sub-arrays.
 */
export function splitArrayIntoChunks<T>(items: T[], bulkLength: number): T[][] {
  const result: T[][] = [];
  for (let i = 0; i < items.length; i += bulkLength) {
    result.push(items.slice(i, i + bulkLength));
  }
  return result;
}
