import { Observable } from 'rxjs';
import { map, filter, throttleTime } from 'rxjs/operators';
import { CdkScrollable } from '@angular/cdk/scrolling';

/**
 * Creates a custom RxJS operator to calculate the scroll position as a percentage and emit
 * values when the scroll position meets or exceeds a specified threshold.
 *
 * @param threshold - The percentage of the scroll height at which to emit values (0-100).
 * @param throttle - The time in milliseconds to throttle the scroll events (default is 100 ms).
 * @returns A function that takes an Observable of void or CdkScrollable events and returns
 * an Observable emitting the scroll percentage when it meets the threshold.
 */
export function trackScrollThreshold(threshold: number, throttle: number = 100) {
  return (source: Observable<void | CdkScrollable>) =>
    source.pipe(
      throttleTime(throttle),
      map((cdk: void | CdkScrollable) => {
        if (cdk instanceof CdkScrollable) {
          const element = cdk.getElementRef().nativeElement;
          const scrollTop = element.scrollTop;
          const scrollHeight = element.scrollHeight;
          const clientHeight = element.clientHeight;

          // Calculate scroll position as a percentage
          return ((scrollTop + clientHeight) / scrollHeight) * 100;
        }
        return 0;
      }),
      filter((scrollPosition) => scrollPosition >= threshold)
    );
}
