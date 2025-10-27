import { Params } from '@angular/router';

/**
 * Replaces placeholders in a string with values from a params object.
 *
 * @param template - The template string containing placeholders (e.g., ":id").
 * @param params - An object with keys matching placeholders and values for replacement.
 * @returns The formatted string with placeholders replaced.
 */
export function fillPathValues(
  template: string,
  params: { [key: string]: string }
): string {
  return template.replace(/:([a-zA-Z0-9_]+)/g, (match, p1) => {
    return params[p1] ?? match;
  });
}

/**
 * Converts a key-value object of query parameters into a URL-encoded query string.
 *
 * - Skips `null` and `undefined` values.
 * - Supports both single and array values for query parameters.
 *
 * @param params - An object representing the query parameters to serialize.
 * @returns A URL-encoded query string.
 */
export function stringifyQueryParams(params: Params): string {
  return Object.entries(params)
    .flatMap(([key, value]) => {
      if (value == null) return []; // Skip null & undefined

      return Array.isArray(value)
        ? value.map(
            (item) => `${encodeURIComponent(key)}=${encodeURIComponent(item)}`
          )
        : [`${encodeURIComponent(key)}=${encodeURIComponent(value)}`];
    })
    .join('&');
}


/**
 * Extracts the pathname from a given URL string.
 *
 * This function attempts to parse the input as an absolute URL using the `URL` constructor.
 * If successful, it returns only the `.pathname` (excluding protocol, host, and query string).
 *
 * If the input is not a valid absolute URL (e.g., a relative route like `/dashboard?tab=1`),
 * it falls back to splitting the string at `?` and returns the path portion.
 *
 * @param url - The URL or relative path string to extract the path from.
 * @returns The extracted pathname without query parameters or fragments.
 */
export function extractPathFromUrl(url: string): string {
  try {
    return new URL(url).pathname;
  } catch {
    // Fallback for relative URLs
    return url.split('?')[0];
  }
}
