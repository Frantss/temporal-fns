import type { Temporal } from 'temporal-spec';
import {
  calendarKinds,
  calendarPair,
  integer,
  kind,
  month,
  options,
  toDate,
  weekday,
  weekStart,
  yearMonthKinds,
} from './internal.js';
import { periodIndex, type Period } from './iso.js';
import type { Pair } from './signatures.js';
import type {
  BusinessDayOptions,
  CalendarValue,
  QuarterValue,
  Weekday,
  WeekNumberOptions,
  WeekOptions,
  YearMonthValue,
  ZoneOptions,
} from './types.js';

function samePeriod(
  a: YearMonthValue | Temporal.Instant,
  b: typeof a,
  unit: Period,
  context?: ZoneOptions & WeekOptions,
): boolean {
  options(context, unit === 'week' ? ['timeZone', 'weekStartsOn'] : ['timeZone']);
  const starts = unit === 'week' ? weekStart(context?.weekStartsOn) : 0;
  if (unit === 'day' || unit === 'week') {
    kind(a, [...calendarKinds, 'Instant']);
    kind(b, [...calendarKinds, 'Instant']);
  }
  const [left, right] = calendarPair(a, b, context);
  return periodIndex(left, unit, starts) === periodIndex(right, unit, starts);
}

export const isSameDay: Pair<{}, boolean> = (a, b, context) => samePeriod(a, b, 'day', context);
export const isSameWeek: Pair<WeekOptions, boolean> = (a, b, context) =>
  samePeriod(a, b, 'week', context);
export const isSameISOWeek: Pair<{}, boolean> = (a, b, context) => {
  options(context, ['timeZone']);
  return samePeriod(a, b, 'week', { timeZone: context?.timeZone, weekStartsOn: 1 });
};
export const isSameMonth: Pair<{}, boolean, true> = (a, b, context) =>
  samePeriod(a, b, 'month', context);
export const isSameQuarter: Pair<{}, boolean, true> = (a, b, context) =>
  samePeriod(a, b, 'quarter', context);
export const isSameYear: Pair<{}, boolean, true> = (a, b, context) =>
  samePeriod(a, b, 'year', context);

export function weekends(context?: BusinessDayOptions): Set<number> {
  if (context?.weekendDays !== undefined && !Array.isArray(context.weekendDays))
    throw new TypeError('weekendDays must be an array');
  const days = new Set(Array.from(context?.weekendDays ?? [0, 6], weekday));
  if (days.size === 7) throw new RangeError('At least one business day must remain');
  return days;
}
export function isWeekend(value: CalendarValue, context?: BusinessDayOptions): boolean {
  options(context, ['weekendDays']);
  kind(value, calendarKinds);
  return weekends(context).has(value.dayOfWeek % 7);
}
export function isBusinessDay(value: CalendarValue, context?: BusinessDayOptions): boolean {
  return !isWeekend(value, context);
}
function addWorkingDates(
  start: Temporal.PlainDate,
  amount: number,
  excluded: Set<number>,
): Temporal.PlainDate {
  const direction = Math.sign(amount),
    working = 7 - excluded.size;
  const weeks = Math.floor((Math.abs(amount) - 1) / working);
  let date = start.add({ days: direction * weeks * 7 }),
    remaining = Math.abs(amount) - weeks * working;
  while (remaining) {
    date = date.add({ days: direction });
    if (!excluded.has(date.dayOfWeek % 7)) remaining--;
  }
  return date;
}
function* skippedDates(
  a: Temporal.ZonedDateTime,
  b: Temporal.ZonedDateTime,
): Generator<Temporal.PlainDate> {
  const [first, last] = a.epochNanoseconds <= b.epochNanoseconds ? [a, b] : [b, a];
  // A skipped target date can resolve to the starting date, after the relevant transition.
  let transition = first.getTimeZoneTransition('previous') ?? first.getTimeZoneTransition('next');
  while (transition && transition.epochNanoseconds <= last.epochNanoseconds) {
    const before = transition.subtract({ nanoseconds: 1 }).toPlainDate();
    const after = transition.toPlainDate();
    const days = before.until(after).days;
    for (let i = 1; i < days; i++) yield before.add({ days: i });
    transition = transition.getTimeZoneTransition('next');
  }
}
function skippedWorkingDates(
  a: Temporal.ZonedDateTime,
  b: Temporal.ZonedDateTime,
  start: Temporal.PlainDate,
  end: Temporal.PlainDate,
  excluded: Set<number>,
): number {
  const span = start.until(end).days,
    direction = Math.sign(span);
  let total = 0;
  for (const date of skippedDates(a, b)) {
    const position = start.until(date).days * direction;
    if (position > 0 && position <= Math.abs(span) && !excluded.has(date.dayOfWeek % 7)) total++;
  }
  return total;
}
export function addBusinessDays<T extends CalendarValue>(
  value: T,
  amount: number,
  context?: BusinessDayOptions,
): T {
  options(context, ['weekendDays']);
  const name = kind(value, calendarKinds);
  integer(amount, 'amount');
  const excluded = weekends(context);
  if (amount === 0) return value;
  const start = toDate(value),
    direction = Math.sign(amount);
  let date = start,
    remaining = amount,
    result = value;
  while (remaining) {
    const next = addWorkingDates(date, remaining, excluded);
    const nextResult = value.add({ days: next.since(start).days }) as T;
    remaining =
      name === 'ZonedDateTime'
        ? direction *
          skippedWorkingDates(
            result as Temporal.ZonedDateTime,
            nextResult as Temporal.ZonedDateTime,
            date,
            next,
            excluded,
          )
        : 0;
    date = next;
    result = nextResult;
  }
  return result;
}
export function subBusinessDays<T extends CalendarValue>(
  value: T,
  amount: number,
  context?: BusinessDayOptions,
): T {
  integer(amount, 'amount');
  return addBusinessDays(value, -amount, context);
}

export const differenceInBusinessDays: Pair<BusinessDayOptions, number, false, false> = (
  later,
  earlier,
  context,
) => {
  options(context, ['weekendDays', 'timeZone']);
  kind(later, calendarKinds);
  kind(earlier, calendarKinds);
  const excluded = weekends(context),
    [left, right] = calendarPair(later, earlier, context);
  let start = toDate(right as CalendarValue),
    end = toDate(left as CalendarValue);
  const direction = Math.sign(start.until(end).days);
  if (direction < 0) [start, end] = [end, start];
  const days = start.until(end).days;
  let total = Math.floor(days / 7) * (7 - excluded.size);
  for (let i = 0; i < days % 7; i++) if (!excluded.has(((start.dayOfWeek % 7) + i) % 7)) total++;
  if (direction && kind(left) === 'ZonedDateTime')
    total -= skippedWorkingDates(
      left as Temporal.ZonedDateTime,
      right as Temporal.ZonedDateTime,
      start,
      end,
      excluded,
    );
  return total === 0 ? 0 : direction * total;
};
function moveToWeekday<T extends CalendarValue>(value: T, day: Weekday, direction: 1 | -1): T {
  kind(value, calendarKinds);
  weekday(day);
  let days = (((day - (value.dayOfWeek % 7)) * direction + 7) % 7 || 7) * direction;
  while (true) {
    const result = value.add({ days }) as T;
    if (result.dayOfWeek % 7 === day) return result;
    days += 7 * direction;
  }
}
export function nextDay<T extends CalendarValue>(value: T, day: Weekday): T {
  return moveToWeekday(value, day, 1);
}
export function previousDay<T extends CalendarValue>(value: T, day: Weekday): T {
  return moveToWeekday(value, day, -1);
}
export function getQuarter(value: QuarterValue): 1 | 2 | 3 | 4 {
  kind(value, [...yearMonthKinds, 'PlainMonthDay']);
  return (Math.floor((month(value) - 1) / 3) + 1) as 1 | 2 | 3 | 4;
}
function weekInfo(
  value: CalendarValue,
  context?: WeekNumberOptions,
): { week: number; year: number } {
  options(context, ['weekStartsOn', 'firstWeekContainsDate']);
  kind(value, calendarKinds);
  const starts = weekStart(context?.weekStartsOn),
    first = context?.firstWeekContainsDate === undefined ? 1 : context.firstWeekContainsDate;
  if (!Number.isInteger(first) || first < 1 || first > 7)
    throw new RangeError('firstWeekContainsDate must be between 1 and 7');
  const index = periodIndex(value, 'week', starts);
  const anchor = (year: number) => periodIndex({ year, month: 1, day: first }, 'week', starts);
  const year =
    value.year + (index < anchor(value.year) ? -1 : index >= anchor(value.year + 1) ? 1 : 0);
  return { week: index - anchor(year) + 1, year };
}
export function getWeek(value: CalendarValue, context?: WeekNumberOptions): number {
  return weekInfo(value, context).week;
}
export function getWeekYear(value: CalendarValue, context?: WeekNumberOptions): number {
  return weekInfo(value, context).year;
}
export function getWeekOfMonth(value: CalendarValue, context?: WeekOptions): number {
  options(context, ['weekStartsOn']);
  kind(value, calendarKinds);
  const starts = weekStart(context?.weekStartsOn);
  return (
    periodIndex(value, 'week', starts) -
    periodIndex({ year: value.year, month: value.month, day: 1 }, 'week', starts) +
    1
  );
}
export function getWeeksInMonth(value: YearMonthValue, context?: WeekOptions): number {
  options(context, ['weekStartsOn']);
  kind(value, yearMonthKinds);
  const starts = weekStart(context?.weekStartsOn),
    month = { year: value.year, month: value.month };
  return (
    periodIndex({ ...month, day: value.daysInMonth }, 'week', starts) -
    periodIndex({ ...month, day: 1 }, 'week', starts) +
    1
  );
}
