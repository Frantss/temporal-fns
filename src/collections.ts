import type { Temporal } from 'temporal-spec';
import { boundary } from './boundaries.js';
import { weekends } from './calendar-utils.js';
import {
  calendarKinds,
  compare,
  distance,
  kind,
  named,
  options,
  orderedKinds,
  sameKind,
  step,
  temporal,
  timeKinds,
  weekStart,
  yearMonthKinds,
} from './internal.js';
import { periodIndex } from './iso.js';
import type { IntervalCall, Selection, Sequence } from './signatures.js';
import type {
  BusinessDayOptions,
  CalendarValue,
  Interval,
  OrderedValue,
  StepOptions,
  TimeValue,
  WeekOptions,
  YearMonthValue,
} from './types.js';

function valuesChecked(values: readonly OrderedValue[]): void {
  if (!Array.isArray(values)) throw new TypeError('Values must be an array');
  if (values.length) {
    kind(values[0], orderedKinds);
    for (const value of values) sameKind(values[0], value);
  }
}
export function checkInterval(interval: Interval<OrderedValue>): void {
  if (interval === null || typeof interval !== 'object')
    throw new TypeError('An interval is required');
  sameKind(interval.start, interval.end);
  if (compare(interval.start, interval.end) > 0)
    throw new RangeError('Interval start must be on or before end');
}

function extremum<T extends OrderedValue>(values: readonly T[], direction: number): T | undefined {
  valuesChecked(values);
  let result = values[0];
  for (const value of values)
    if (result === undefined || compare(value, result) * direction < 0) result = value;
  return result;
}
export const min: Selection<'list', 'optional'> = <T extends OrderedValue>(values: readonly T[]) =>
  extremum(values, 1);
export const max: Selection<'list', 'optional'> = <T extends OrderedValue>(values: readonly T[]) =>
  extremum(values, -1);
export const closestTo: Selection<'closest', 'optional'> = <T extends OrderedValue>(
  target: T,
  values: readonly T[],
): T | undefined => {
  const index = closestIndex(target, values);
  return index === undefined ? undefined : values[index];
};

function closestIndex(target: OrderedValue, values: readonly OrderedValue[]): number | undefined {
  valuesChecked(values);
  kind(target, orderedKinds);
  let best: bigint | undefined, index: number | undefined;
  for (let i = 0; i < values.length; i++) {
    const value = values[i]!;
    sameKind(target, value);
    const delta = distance(target, value);
    if (best === undefined || delta < best) {
      best = delta;
      index = i;
    }
  }
  return index;
}
export const closestIndexTo: Selection<'closest', number | undefined> = (target, values) =>
  closestIndex(target, values);

function outside(
  value: OrderedValue,
  interval: Interval<OrderedValue>,
): 'start' | 'end' | undefined {
  checkInterval(interval);
  sameKind(value, interval.start);
  if (compare(value, interval.start) < 0) return 'start';
  if (compare(value, interval.end) > 0) return 'end';
}
export const isWithinInterval: IntervalCall<'interval', boolean> = (value, interval) =>
  outside(value, interval) === undefined;

export const areIntervalsOverlapping: IntervalCall<'overlap', boolean, { inclusive?: boolean }> = (
  a,
  b,
  context,
) => {
  options(context, ['inclusive']);
  if (context?.inclusive !== undefined && typeof context.inclusive !== 'boolean')
    throw new TypeError('inclusive must be a boolean');
  checkInterval(a);
  checkInterval(b);
  sameKind(a.start, b.start);
  return context?.inclusive
    ? compare(a.start, b.end) <= 0 && compare(b.start, a.end) <= 0
    : compare(a.start, b.end) < 0 && compare(b.start, a.end) < 0;
};

export const clamp: IntervalCall<'interval', 'value'> = <T extends OrderedValue>(
  value: T,
  interval: Interval<T>,
): T => {
  const edge = outside(value, interval);
  return edge === undefined ? value : interval[edge];
};

function sequence<T extends CalendarValue | Temporal.PlainYearMonth | Temporal.PlainTime>(
  interval: Interval<T>,
  unit: 'day' | 'week' | 'month' | 'hour' | 'minute',
  context?: StepOptions & WeekOptions,
): T[] {
  options(context, unit === 'week' ? ['step', 'weekStartsOn'] : ['step']);
  const increment = step(context?.step);
  const startsOn = unit === 'week' ? weekStart(context?.weekStartsOn) : 0;
  checkInterval(interval);
  const allowed =
    unit === 'month'
      ? yearMonthKinds
      : unit === 'hour' || unit === 'minute'
        ? timeKinds
        : calendarKinds;
  const name = kind(interval.start, allowed);
  kind(interval.end, allowed);
  if (
    name === 'ZonedDateTime' &&
    (interval.start as Temporal.ZonedDateTime).timeZoneId !==
      (interval.end as Temporal.ZonedDateTime).timeZoneId
  )
    throw new RangeError('Sequences require matching time zones');
  let current: T;
  if (unit === 'hour' || unit === 'minute')
    current = (interval.start as TimeValue).round({
      smallestUnit: unit,
      roundingMode: 'floor',
    }) as T;
  else if (name === 'PlainYearMonth') current = interval.start;
  else current = boundary(interval.start as CalendarValue, unit, false, startsOn) as T;
  const result: T[] = [];
  while (compare(current, interval.end) <= 0) {
    result.push(current);
    if (compare(current, interval.end) === 0) break;
    const clock = unit === 'hour' || unit === 'minute';
    if (name === 'PlainTime' || name === 'PlainYearMonth') {
      const remaining =
        name === 'PlainTime'
          ? Number(
              distance(current, interval.end) /
                (unit === 'hour' ? 3_600_000_000_000n : 60_000_000_000n),
            )
          : periodIndex(interval.end as YearMonthValue, 'month') -
            periodIndex(current as YearMonthValue, 'month');
      if (increment > remaining) break;
    }
    if (name === 'PlainYearMonth') {
      const index = periodIndex(current as Temporal.PlainYearMonth, 'month') + increment;
      current = temporal().PlainYearMonth.from({
        year: Math.floor(index / 12),
        month: (((index % 12) + 12) % 12) + 1,
      }) as T;
      continue;
    }
    let next: T;
    try {
      next = current.add({ [`${unit}s`]: increment }) as T;
      if (!clock) next = boundary(next as CalendarValue, unit, false, startsOn) as T;
    } catch (error) {
      if (error instanceof RangeError) break;
      throw error;
    }
    if (compare(current, next) >= 0) {
      if (name === 'PlainTime') break;
      throw new RangeError('Sequence did not advance');
    }
    current = next;
  }
  return result;
}

function periods(name: string, unit: 'day' | 'week' | 'month' | 'hour' | 'minute') {
  return named(
    name,
    <T extends YearMonthValue | Temporal.PlainTime>(
      interval: Interval<T>,
      context?: StepOptions & WeekOptions,
    ): T[] => sequence(interval, unit, context),
  );
}
export const eachDayOfInterval: Sequence<StepOptions> = /* @__PURE__ */ periods(
  'eachDayOfInterval',
  'day',
);
export const eachWeekOfInterval: Sequence<StepOptions & WeekOptions> = /* @__PURE__ */ periods(
  'eachWeekOfInterval',
  'week',
);
export const eachMonthOfInterval: Sequence<StepOptions, true> = /* @__PURE__ */ periods(
  'eachMonthOfInterval',
  'month',
);
export const eachHourOfInterval: Sequence<StepOptions, false, true> = /* @__PURE__ */ periods(
  'eachHourOfInterval',
  'hour',
);
export const eachMinuteOfInterval: Sequence<StepOptions, false, true> = /* @__PURE__ */ periods(
  'eachMinuteOfInterval',
  'minute',
);

export const eachWeekendOfInterval: Sequence<BusinessDayOptions> = <T extends CalendarValue>(
  interval: Interval<T>,
  context?: BusinessDayOptions,
): T[] => {
  options(context, ['weekendDays']);
  const excluded = weekends(context);
  return sequence(interval, 'day').filter((value) => excluded.has(value.dayOfWeek % 7));
};
