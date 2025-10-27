import {
  Injector,
  ProviderToken,
  TypeProvider,
  WritableSignal,
  inject,
} from '@angular/core';
import { NgxLoggerLevel } from 'ngx-logger';

/**
 * Generates a list of time slots within a 24-hour period.
 *
 * @param intervalMinutes Number of minutes between each time slot. Defaults to 5.
 * @returns An array of time strings in 12-hour format with AM/PM suffix.
 */
export function generateTimeSlots(intervalMinutes: number = 5): string[] {
  const times: string[] = [];
  const periods = ['AM', 'PM'];

  for (let i = 0; i < 24; i++) {
    for (let j = 0; j < 60; j += intervalMinutes) {
      const hour = i % 12 === 0 ? 12 : i % 12;
      const minute = j.toString().padStart(2, '0');
      const period = periods[Math.floor(i / 12)];
      times.push(`${hour}:${minute} ${period}`);
    }
  }

  return times;
}

/**
 * Creates a transient (non-singleton) instance of the provided injectable token.
 *
 * This method is useful when you want to create a new instance of a service or class
 * every time it is called, without making it globally available or shared across components.
 *
 * ⚠️ Note:
 * - Unlike Angular’s default DI behavior, this does **not** cache or share the instance.
 * - The instance will not be available to sub-components or other parts of the DI graph.
 *
 * @template T The type of the class or token to inject.
 * @param token The injectable class or token to instantiate.
 * @param injector Optional Angular `Injector` to use for resolving dependencies.
 *   - If not provided, the current injector (via `inject()`) will be used.
 *   - Providing an injector is necessary when calling `transient()` outside of a class constructor or property initializer.
 *
 * @returns A newly created instance of the provided token.
 */
export function transient<T>(token: ProviderToken<T>, injector?: Injector): T {
  injector ??= inject(Injector);
  return Injector.create({
    providers: [token as TypeProvider],
    parent: injector,
  }).get(token, undefined, { self: true });
}

/**
 * Regular expression to detect ISO 8601 date strings.
 * Matches formats like:
 *   - 2025-08-25T08:30:00Z
 *   - 2025-08-25T08:30:00+05:30
 *   - 2025-08-25T08:30:00.123Z
 */
const ISO_REGEX =
  /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d*)?(?:Z|[-+]\d{2}:?\d{2})?$/;

/**
 * Checks whether a given value is a string in ISO 8601 date format.
 *
 * @param value - The value to check.
 * @returns True if the value is an ISO date string, false otherwise.
 */
export function isISODateString(value: unknown): value is string {
  return typeof value === 'string' && ISO_REGEX.test(value);
}

/**
 * Recursively traverses an object or array and converts all ISO 8601 date strings
 * into JavaScript `Date` objects.
 *
 * Behavior:
 * - Detects ISO strings in nested arrays and objects.
 * - Converts strings with 'Z' (UTC) or with timezone offsets into local `Date` objects.
 * - Leaves non-ISO strings and other primitive values unchanged.
 *
 * @param obj - The object, array, or value to parse.
 * @returns The same structure with ISO date strings replaced by `Date` instances.
 */
export function parseDates(obj: any): any {
  if (obj === null || obj === undefined) return obj;

  if (Array.isArray(obj)) {
    for (let i = 0; i < obj.length; i++) {
      obj[i] = parseDates(obj[i]);
    }
    return obj;
  }

  if (typeof obj === 'object') {
    for (const key in obj) {
      if (!obj.hasOwnProperty(key)) continue;
      const val = obj[key];
      if (isISODateString(val)) {
        obj[key] = new Date(val);
      } else if (typeof val === 'object' && val !== null) {
        obj[key] = parseDates(val);
      }
    }
    return obj;
  }

  return obj;
}

/**
 * Maps a string representation of a log level to its corresponding
 * `NgxLoggerLevel` enum value.
 *
 * If the provided string does not match any known log level,
 * the default level will be returned (default: `NgxLoggerLevel.OFF`).
 *
 * @param level - The log level as a string (e.g., `"debug"`, `"info"`).
 * @returns The corresponding `NgxLoggerLevel` value.
 */
export function mapNgxLoggerLevel(level: string): NgxLoggerLevel {
  switch (level?.toLowerCase()) {
    case 'trace':
      return NgxLoggerLevel.TRACE;
    case 'debug':
      return NgxLoggerLevel.DEBUG;
    case 'info':
      return NgxLoggerLevel.INFO;
    case 'log':
      return NgxLoggerLevel.LOG;
    case 'warn':
      return NgxLoggerLevel.WARN;
    case 'error':
      return NgxLoggerLevel.ERROR;
    case 'fatal':
      return NgxLoggerLevel.FATAL;
    case 'off':
      return NgxLoggerLevel.OFF;
    default:
      return NgxLoggerLevel.OFF; // ✅ fixed default
  }
}

/**
 * Starts a countdown timer and updates a WritableSignal.
 *
 * @param durationMs Total duration in milliseconds.
 * @param targetSignal WritableSignal<T> to receive remaining value.
 * @param tickIntervalMs Tick interval in milliseconds (default: 1000).
 * @param mapValue Optional mapper to transform remaining ms into another type (e.g., seconds).
 * @returns A stop function to cancel the countdown manually.
 */
export function startCountdown<T = number>(
  durationMs: number,
  targetSignal: WritableSignal<T>,
  tickIntervalMs: number = 1000,
  mapValue: (remainingMs: number) => T = (v) => v as unknown as T
): () => void {
  let intervalId: ReturnType<typeof setInterval> | undefined;
  const startTime = Date.now();
  const endTime = startTime + durationMs;

  const stop = () => {
    if (intervalId) {
      clearInterval(intervalId);
      intervalId = undefined;
    }
  };

  const tick = () => {
    const now = Date.now();
    const remaining = Math.max(0, endTime - now);
    targetSignal.set(mapValue(remaining));

    if (remaining <= 0) {
      stop();
    }
  };

  // Initial set
  targetSignal.set(mapValue(durationMs));
  tick();

  intervalId = setInterval(tick, tickIntervalMs);

  return stop;
}

/**
 * Converts a Date, date string, or timestamp into Unix time (seconds since epoch).
 *
 * @param value The input value to convert. Can be a Date object, ISO date string, or timestamp (in ms or s).
 * @returns The Unix timestamp in seconds, or null if the input is invalid or null/undefined.
 */
export function toUnixSeconds(
  value: Date | string | number | null | undefined
): number | null {
  if (!value) {
    return null;
  }

  if (value instanceof Date) {
    return Math.floor(value.getTime() / 1000);
  }

  if (typeof value === 'number') {
    // already seconds? assume >= 10 digits = ms
    return value > 9999999999 ? Math.floor(value / 1000) : value;
  }

  const parsed = new Date(value);
  return isNaN(parsed.getTime()) ? null : Math.floor(parsed.getTime() / 1000);
}

/**
 *  Start of the day (00:00:00 local time) → Unix timestamp in seconds
 *
 * @param value The input value to convert. Can be a Date object, ISO date string, or timestamp (in ms or s).
 * @returns The Unix timestamp in seconds, or null if the input is invalid or null/undefined.
 */
export function toUnixStartOfDay(
  value: Date | string | number | null | undefined
): number | null {
  if (!value) return null;
  const d =
    value instanceof Date
      ? new Date(value)
      : typeof value === 'number'
      ? new Date(value > 9999999999 ? value : value * 1000)
      : new Date(value);

  if (isNaN(d.getTime())) return null;
  d.setHours(0, 0, 0, 0);
  return Math.floor(d.getTime() / 1000);
}

/**
 * End of the day (23:59:59 local time) → Unix timestamp in seconds
 *
 * @param value The input value to convert. Can be a Date object, ISO date string, or timestamp (in ms or s).
 * @returns The Unix timestamp in seconds, or null if the input is invalid or null/undefined.
 */
export function toUnixEndOfDay(
  value: Date | string | number | null | undefined
): number | null {
  if (!value) return null;
  const d =
    value instanceof Date
      ? new Date(value)
      : typeof value === 'number'
      ? new Date(value > 9999999999 ? value : value * 1000)
      : new Date(value);

  if (isNaN(d.getTime())) return null;
  d.setHours(23, 59, 59, 999);
  return Math.floor(d.getTime() / 1000);
}


/**
 * Normalizes text by removing diacritics, converting to lowercase, and trimming whitespace.
 * This is useful for consistent text comparisons and searches.
 *
 * @param text The input text to normalize.
 * @returns The normalized text.
 */
export function normalizeText(text: string): string {
  return text
    .normalize("NFKD") // decompose accents & compatibility chars
    .replace(/\p{Diacritic}/gu, "") // strip accents (requires Unicode regex flag)
    .toLowerCase()
    .trim();
}
