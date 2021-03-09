import { Observable } from 'rxjs';
import { Sample } from '../../../raw-metrics-query/public';

/**
 * A `PolishedMetricSource` is used to obtain a complex, processed metric from an `SloTarget`.
 *
 * @param V The TypeScript type that represents the values of the polished metric.
 */
export interface PolishedMetricSource<V> {

    /**
     * @returns An observable that emits the current value of the polished metric and then completes.
     */
    getCurrentValue(): Observable<Sample<V>>;

    /**
     * @returns An observable that emits the polished metric's values as they become available, starting with
     * the current value.
     */
    getValueStream(): Observable<Sample<V>>;

}
