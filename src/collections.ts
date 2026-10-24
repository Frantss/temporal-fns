import type { Temporal } from 'temporal-spec';
import type {
  OrderedValue,
  Interval,
  CalendarValue,
  YearMonthValue,
  TimeValue,
  WeekOptions,
  StepOptions,
  BusinessDayOptions,
} from './types.js';
import {
  compare,
  distance,
  kind,
  sameKind,
  options,
  orderedKinds,
  calendarKinds,
  yearMonthKinds,
  timeKinds,
  step,
  weekStart,
  temporal,
} from './internal.js';
import { boundary } from './boundaries.js';
import { weekends } from './calendar-utils.js';

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
export function min(values: readonly Temporal.PlainDate[]): Temporal.PlainDate | undefined;
export function min(values: readonly Temporal.PlainDateTime[]): Temporal.PlainDateTime | undefined;
export function min(values: readonly Temporal.ZonedDateTime[]): Temporal.ZonedDateTime | undefined;
export function min(values: readonly Temporal.PlainTime[]): Temporal.PlainTime | undefined;
export function min(
  values: readonly Temporal.PlainYearMonth[],
): Temporal.PlainYearMonth | undefined;
export function min(values: readonly Temporal.Instant[]): Temporal.Instant | undefined;
export function min(values: readonly OrderedValue[]): OrderedValue | undefined {
  valuesChecked(values);
  let result = values[0];
  for (const value of values)
    if (result === undefined || compare(value, result) < 0) result = value;
  return result;
}
export function max(values: readonly Temporal.PlainDate[]): Temporal.PlainDate | undefined;
export function max(values: readonly Temporal.PlainDateTime[]): Temporal.PlainDateTime | undefined;
export function max(values: readonly Temporal.ZonedDateTime[]): Temporal.ZonedDateTime | undefined;
export function max(values: readonly Temporal.PlainTime[]): Temporal.PlainTime | undefined;
export function max(
  values: readonly Temporal.PlainYearMonth[],
): Temporal.PlainYearMonth | undefined;
export function max(values: readonly Temporal.Instant[]): Temporal.Instant | undefined;
export function max(values: readonly OrderedValue[]): OrderedValue | undefined {
  valuesChecked(values);
  let result = values[0];
  for (const value of values)
    if (result === undefined || compare(value, result) > 0) result = value;
  return result;
}
export function closestTo(
  target: Temporal.PlainDate,
  values: readonly Temporal.PlainDate[],
): Temporal.PlainDate | undefined;
export function closestTo(
  target: Temporal.PlainDateTime,
  values: readonly Temporal.PlainDateTime[],
): Temporal.PlainDateTime | undefined;
export function closestTo(
  target: Temporal.ZonedDateTime,
  values: readonly Temporal.ZonedDateTime[],
): Temporal.ZonedDateTime | undefined;
export function closestTo(
  target: Temporal.PlainTime,
  values: readonly Temporal.PlainTime[],
): Temporal.PlainTime | undefined;
export function closestTo(
  target: Temporal.PlainYearMonth,
  values: readonly Temporal.PlainYearMonth[],
): Temporal.PlainYearMonth | undefined;
export function closestTo(
  target: Temporal.Instant,
  values: readonly Temporal.Instant[],
): Temporal.Instant | undefined;
export function closestTo(
  target: OrderedValue,
  values: readonly OrderedValue[],
): OrderedValue | undefined {
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
  return index === undefined ? undefined : values[index];
}
export function closestIndexTo(
  target: Temporal.PlainDate,
  values: readonly Temporal.PlainDate[],
): number | undefined;
export function closestIndexTo(
  target: Temporal.PlainDateTime,
  values: readonly Temporal.PlainDateTime[],
): number | undefined;
export function closestIndexTo(
  target: Temporal.ZonedDateTime,
  values: readonly Temporal.ZonedDateTime[],
): number | undefined;
export function closestIndexTo(
  target: Temporal.PlainTime,
  values: readonly Temporal.PlainTime[],
): number | undefined;
export function closestIndexTo(
  target: Temporal.PlainYearMonth,
  values: readonly Temporal.PlainYearMonth[],
): number | undefined;
export function closestIndexTo(
  target: Temporal.Instant,
  values: readonly Temporal.Instant[],
): number | undefined;
export function closestIndexTo(
  target: OrderedValue,
  values: readonly OrderedValue[],
): number | undefined {
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
export function isWithinInterval(
  value: Temporal.PlainDate,
  interval: Interval<Temporal.PlainDate>,
): boolean;
export function isWithinInterval(
  value: Temporal.PlainDateTime,
  interval: Interval<Temporal.PlainDateTime>,
): boolean;
export function isWithinInterval(
  value: Temporal.ZonedDateTime,
  interval: Interval<Temporal.ZonedDateTime>,
): boolean;
export function isWithinInterval(
  value: Temporal.PlainTime,
  interval: Interval<Temporal.PlainTime>,
): boolean;
export function isWithinInterval(
  value: Temporal.PlainYearMonth,
  interval: Interval<Temporal.PlainYearMonth>,
): boolean;
export function isWithinInterval(
  value: Temporal.Instant,
  interval: Interval<Temporal.Instant>,
): boolean;
export function isWithinInterval(value: OrderedValue, interval: Interval<OrderedValue>): boolean {
  checkInterval(interval);
  sameKind(value, interval.start);
  return compare(value, interval.start) >= 0 && compare(value, interval.end) <= 0;
}
export function areIntervalsOverlapping(
  a: Interval<Temporal.PlainDate>,
  b: Interval<Temporal.PlainDate>,
  context?: { inclusive?: boolean },
): boolean;
export function areIntervalsOverlapping(
  a: Interval<Temporal.PlainDateTime>,
  b: Interval<Temporal.PlainDateTime>,
  context?: { inclusive?: boolean },
): boolean;
export function areIntervalsOverlapping(
  a: Interval<Temporal.ZonedDateTime>,
  b: Interval<Temporal.ZonedDateTime>,
  context?: { inclusive?: boolean },
): boolean;
export function areIntervalsOverlapping(
  a: Interval<Temporal.PlainTime>,
  b: Interval<Temporal.PlainTime>,
  context?: { inclusive?: boolean },
): boolean;
export function areIntervalsOverlapping(
  a: Interval<Temporal.PlainYearMonth>,
  b: Interval<Temporal.PlainYearMonth>,
  context?: { inclusive?: boolean },
): boolean;
export function areIntervalsOverlapping(
  a: Interval<Temporal.Instant>,
  b: Interval<Temporal.Instant>,
  context?: { inclusive?: boolean },
): boolean;
export function areIntervalsOverlapping(
  a: Interval<OrderedValue>,
  b: Interval<OrderedValue>,
  context?: { inclusive?: boolean },
): boolean {
  options(context, ['inclusive']);
  if (context?.inclusive !== undefined && typeof context.inclusive !== 'boolean')
    throw new TypeError('inclusive must be a boolean');
  checkInterval(a);
  checkInterval(b);
  sameKind(a.start, b.start);
  return context?.inclusive
    ? compare(a.start, b.end) <= 0 && compare(b.start, a.end) <= 0
    : compare(a.start, b.end) < 0 && compare(b.start, a.end) < 0;
}
export function clamp(
  value: Temporal.PlainDate,
  interval: Interval<Temporal.PlainDate>,
): Temporal.PlainDate;
export function clamp(
  value: Temporal.PlainDateTime,
  interval: Interval<Temporal.PlainDateTime>,
): Temporal.PlainDateTime;
export function clamp(
  value: Temporal.ZonedDateTime,
  interval: Interval<Temporal.ZonedDateTime>,
): Temporal.ZonedDateTime;
export function clamp(
  value: Temporal.PlainTime,
  interval: Interval<Temporal.PlainTime>,
): Temporal.PlainTime;
export function clamp(
  value: Temporal.PlainYearMonth,
  interval: Interval<Temporal.PlainYearMonth>,
): Temporal.PlainYearMonth;
export function clamp(
  value: Temporal.Instant,
  interval: Interval<Temporal.Instant>,
): Temporal.Instant;
export function clamp(value: OrderedValue, interval: Interval<OrderedValue>): OrderedValue {
  checkInterval(interval);
  sameKind(value, interval.start);
  return compare(value, interval.start) < 0
    ? interval.start
    : compare(value, interval.end) > 0
      ? interval.end
      : value;
}

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
    if (name === 'PlainYearMonth') {
      const month = current as Temporal.PlainYearMonth;
      const end = interval.end as Temporal.PlainYearMonth;
      const remaining = (end.year - month.year) * 12 + end.month - month.month;
      if (increment > remaining) break;
      const index = month.month - 1 + increment;
      current = temporal().PlainYearMonth.from({
        year: month.year + Math.floor(index / 12),
        month: (index % 12) + 1,
      }) as T;
      continue;
    }
    if (name === 'PlainTime') {
      const clock = current as Temporal.PlainTime;
      const unitsLeft = unit === 'hour' ? 24 - clock.hour : 1440 - clock.hour * 60 - clock.minute;
      if (increment >= unitsLeft) break;
    }
    let next: T;
    try {
      next = current.add({ [`${unit}s`]: increment }) as T;
      if (unit !== 'hour' && unit !== 'minute')
        next = boundary(next as CalendarValue, unit, false, startsOn) as T;
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
export function eachDayOfInterval(
  interval: Interval<Temporal.PlainDate>,
  context?: StepOptions,
): Temporal.PlainDate[];
export function eachDayOfInterval(
  interval: Interval<Temporal.PlainDateTime>,
  context?: StepOptions,
): Temporal.PlainDateTime[];
export function eachDayOfInterval(
  interval: Interval<Temporal.ZonedDateTime>,
  context?: StepOptions,
): Temporal.ZonedDateTime[];
export function eachDayOfInterval<T extends CalendarValue>(
  interval: Interval<T>,
  context?: StepOptions,
): T[] {
  return sequence(interval, 'day', context);
}
export function eachWeekOfInterval(
  interval: Interval<Temporal.PlainDate>,
  context?: StepOptions & WeekOptions,
): Temporal.PlainDate[];
export function eachWeekOfInterval(
  interval: Interval<Temporal.PlainDateTime>,
  context?: StepOptions & WeekOptions,
): Temporal.PlainDateTime[];
export function eachWeekOfInterval(
  interval: Interval<Temporal.ZonedDateTime>,
  context?: StepOptions & WeekOptions,
): Temporal.ZonedDateTime[];
export function eachWeekOfInterval<T extends CalendarValue>(
  interval: Interval<T>,
  context?: StepOptions & WeekOptions,
): T[] {
  return sequence(interval, 'week', context);
}
export function eachMonthOfInterval(
  interval: Interval<Temporal.PlainDate>,
  context?: StepOptions,
): Temporal.PlainDate[];
export function eachMonthOfInterval(
  interval: Interval<Temporal.PlainDateTime>,
  context?: StepOptions,
): Temporal.PlainDateTime[];
export function eachMonthOfInterval(
  interval: Interval<Temporal.ZonedDateTime>,
  context?: StepOptions,
): Temporal.ZonedDateTime[];
export function eachMonthOfInterval(
  interval: Interval<Temporal.PlainYearMonth>,
  context?: StepOptions,
): Temporal.PlainYearMonth[];
export function eachMonthOfInterval<T extends YearMonthValue>(
  interval: Interval<T>,
  context?: StepOptions,
): T[] {
  return sequence(interval, 'month', context);
}
export function eachHourOfInterval(
  interval: Interval<Temporal.PlainTime>,
  context?: StepOptions,
): Temporal.PlainTime[];
export function eachHourOfInterval(
  interval: Interval<Temporal.PlainDateTime>,
  context?: StepOptions,
): Temporal.PlainDateTime[];
export function eachHourOfInterval(
  interval: Interval<Temporal.ZonedDateTime>,
  context?: StepOptions,
): Temporal.ZonedDateTime[];
export function eachHourOfInterval<T extends TimeValue>(
  interval: Interval<T>,
  context?: StepOptions,
): T[] {
  return sequence(interval, 'hour', context);
}
export function eachMinuteOfInterval(
  interval: Interval<Temporal.PlainTime>,
  context?: StepOptions,
): Temporal.PlainTime[];
export function eachMinuteOfInterval(
  interval: Interval<Temporal.PlainDateTime>,
  context?: StepOptions,
): Temporal.PlainDateTime[];
export function eachMinuteOfInterval(
  interval: Interval<Temporal.ZonedDateTime>,
  context?: StepOptions,
): Temporal.ZonedDateTime[];
export function eachMinuteOfInterval<T extends TimeValue>(
  interval: Interval<T>,
  context?: StepOptions,
): T[] {
  return sequence(interval, 'minute', context);
}
export function eachWeekendOfInterval(
  interval: Interval<Temporal.PlainDate>,
  context?: BusinessDayOptions,
): Temporal.PlainDate[];
export function eachWeekendOfInterval(
  interval: Interval<Temporal.PlainDateTime>,
  context?: BusinessDayOptions,
): Temporal.PlainDateTime[];
export function eachWeekendOfInterval(
  interval: Interval<Temporal.ZonedDateTime>,
  context?: BusinessDayOptions,
): Temporal.ZonedDateTime[];
export function eachWeekendOfInterval<T extends CalendarValue>(
  interval: Interval<T>,
  context?: BusinessDayOptions,
): T[] {
  options(context, ['weekendDays']);
  const excluded = weekends(context);
  return sequence(interval, 'day').filter((value) => excluded.has(value.dayOfWeek % 7));
}
