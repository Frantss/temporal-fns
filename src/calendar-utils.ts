import type { Temporal } from 'temporal-spec';
import type {
  CalendarValue,
  YearMonthValue,
  QuarterValue,
  WeekOptions,
  WeekNumberOptions,
  BusinessDayOptions,
  BusinessDayDifferenceOptions,
  Weekday,
  ZoneOptions,
  PlainOptions,
  RequiredZoneOptions,
} from './types.js';
import {
  calendarKinds,
  yearMonthKinds,
  kind,
  options,
  calendarPair,
  toDate,
  month,
  integer,
  weekday,
  weekStart,
} from './internal.js';

function samePeriod(
  a: YearMonthValue | Temporal.Instant,
  b: typeof a,
  unit: 'day' | 'week' | 'month' | 'quarter' | 'year',
  context?: ZoneOptions & WeekOptions,
): boolean {
  options(context, unit === 'week' ? ['timeZone', 'weekStartsOn'] : ['timeZone']);
  const starts = unit === 'week' ? weekStart(context?.weekStartsOn) : 0;
  if (unit === 'day' || unit === 'week') {
    kind(a, [...calendarKinds, 'Instant']);
    kind(b, [...calendarKinds, 'Instant']);
  }
  const [left, right] = calendarPair(a, b, context);
  if (unit === 'week') {
    const first = toDate(left as CalendarValue),
      second = toDate(right as CalendarValue);
    const firstOffset = ((first.dayOfWeek % 7) - starts + 7) % 7;
    const secondOffset = ((second.dayOfWeek % 7) - starts + 7) % 7;
    return first.until(second).days === secondOffset - firstOffset;
  }
  if (left.year !== right.year) return false;
  if (unit === 'year') return true;
  if (unit === 'quarter')
    return Math.floor((left.month - 1) / 3) === Math.floor((right.month - 1) / 3);
  if (left.month !== right.month) return false;
  return unit === 'month' || (left as Temporal.PlainDate).day === (right as Temporal.PlainDate).day;
}
export function isSameDay(
  a: Temporal.PlainDate,
  b: Temporal.PlainDate,
  context?: PlainOptions,
): boolean;
export function isSameDay(
  a: Temporal.PlainDateTime,
  b: Temporal.PlainDateTime,
  context?: PlainOptions,
): boolean;
export function isSameDay(
  a: Temporal.ZonedDateTime,
  b: Temporal.ZonedDateTime,
  context?: ZoneOptions,
): boolean;
export function isSameDay(
  a: Temporal.Instant,
  b: Temporal.Instant,
  context: RequiredZoneOptions,
): boolean;
export function isSameDay(
  a: YearMonthValue | Temporal.Instant,
  b: typeof a,
  context?: ZoneOptions & WeekOptions,
): boolean {
  return samePeriod(a, b, 'day', context);
}
export function isSameWeek(
  a: Temporal.PlainDate,
  b: Temporal.PlainDate,
  context?: PlainOptions & WeekOptions,
): boolean;
export function isSameWeek(
  a: Temporal.PlainDateTime,
  b: Temporal.PlainDateTime,
  context?: PlainOptions & WeekOptions,
): boolean;
export function isSameWeek(
  a: Temporal.ZonedDateTime,
  b: Temporal.ZonedDateTime,
  context?: ZoneOptions & WeekOptions,
): boolean;
export function isSameWeek(
  a: Temporal.Instant,
  b: Temporal.Instant,
  context: RequiredZoneOptions & WeekOptions,
): boolean;
export function isSameWeek(
  a: YearMonthValue | Temporal.Instant,
  b: typeof a,
  context?: ZoneOptions & WeekOptions,
): boolean {
  return samePeriod(a, b, 'week', context);
}
export function isSameISOWeek(
  a: Temporal.PlainDate,
  b: Temporal.PlainDate,
  context?: PlainOptions,
): boolean;
export function isSameISOWeek(
  a: Temporal.PlainDateTime,
  b: Temporal.PlainDateTime,
  context?: PlainOptions,
): boolean;
export function isSameISOWeek(
  a: Temporal.ZonedDateTime,
  b: Temporal.ZonedDateTime,
  context?: ZoneOptions,
): boolean;
export function isSameISOWeek(
  a: Temporal.Instant,
  b: Temporal.Instant,
  context: RequiredZoneOptions,
): boolean;
export function isSameISOWeek(
  a: YearMonthValue | Temporal.Instant,
  b: typeof a,
  context?: ZoneOptions & WeekOptions,
): boolean {
  options(context, ['timeZone']);
  return samePeriod(a, b, 'week', { timeZone: context?.timeZone, weekStartsOn: 1 });
}
export function isSameMonth(
  a: Temporal.PlainDate,
  b: Temporal.PlainDate,
  context?: PlainOptions,
): boolean;
export function isSameMonth(
  a: Temporal.PlainDateTime,
  b: Temporal.PlainDateTime,
  context?: PlainOptions,
): boolean;
export function isSameMonth(
  a: Temporal.ZonedDateTime,
  b: Temporal.ZonedDateTime,
  context?: ZoneOptions,
): boolean;
export function isSameMonth(
  a: Temporal.Instant,
  b: Temporal.Instant,
  context: RequiredZoneOptions,
): boolean;
export function isSameMonth(
  a: Temporal.PlainYearMonth,
  b: Temporal.PlainYearMonth,
  context?: PlainOptions,
): boolean;
export function isSameMonth(
  a: YearMonthValue | Temporal.Instant,
  b: typeof a,
  context?: ZoneOptions & WeekOptions,
): boolean {
  return samePeriod(a, b, 'month', context);
}
export function isSameQuarter(
  a: Temporal.PlainDate,
  b: Temporal.PlainDate,
  context?: PlainOptions,
): boolean;
export function isSameQuarter(
  a: Temporal.PlainDateTime,
  b: Temporal.PlainDateTime,
  context?: PlainOptions,
): boolean;
export function isSameQuarter(
  a: Temporal.ZonedDateTime,
  b: Temporal.ZonedDateTime,
  context?: ZoneOptions,
): boolean;
export function isSameQuarter(
  a: Temporal.Instant,
  b: Temporal.Instant,
  context: RequiredZoneOptions,
): boolean;
export function isSameQuarter(
  a: Temporal.PlainYearMonth,
  b: Temporal.PlainYearMonth,
  context?: PlainOptions,
): boolean;
export function isSameQuarter(
  a: YearMonthValue | Temporal.Instant,
  b: typeof a,
  context?: ZoneOptions & WeekOptions,
): boolean {
  return samePeriod(a, b, 'quarter', context);
}
export function isSameYear(
  a: Temporal.PlainDate,
  b: Temporal.PlainDate,
  context?: PlainOptions,
): boolean;
export function isSameYear(
  a: Temporal.PlainDateTime,
  b: Temporal.PlainDateTime,
  context?: PlainOptions,
): boolean;
export function isSameYear(
  a: Temporal.ZonedDateTime,
  b: Temporal.ZonedDateTime,
  context?: ZoneOptions,
): boolean;
export function isSameYear(
  a: Temporal.Instant,
  b: Temporal.Instant,
  context: RequiredZoneOptions,
): boolean;
export function isSameYear(
  a: Temporal.PlainYearMonth,
  b: Temporal.PlainYearMonth,
  context?: PlainOptions,
): boolean;
export function isSameYear(
  a: YearMonthValue | Temporal.Instant,
  b: typeof a,
  context?: ZoneOptions & WeekOptions,
): boolean {
  return samePeriod(a, b, 'year', context);
}

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
  const direction = amount < 0 ? -1 : 1;
  let date = start,
    remaining = Math.abs(amount);
  while (remaining && excluded.has(date.dayOfWeek % 7)) {
    date = date.add({ days: direction });
    if (!excluded.has(date.dayOfWeek % 7)) remaining--;
  }
  const weeks = Math.floor(remaining / (7 - excluded.size));
  if (weeks) {
    date = date.add({ days: direction * weeks * 7 });
    remaining -= weeks * (7 - excluded.size);
  }
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
export function differenceInBusinessDays(
  later: Temporal.PlainDate,
  earlier: Temporal.PlainDate,
  context?: BusinessDayOptions & PlainOptions,
): number;
export function differenceInBusinessDays(
  later: Temporal.PlainDateTime,
  earlier: Temporal.PlainDateTime,
  context?: BusinessDayOptions & PlainOptions,
): number;
export function differenceInBusinessDays(
  later: Temporal.ZonedDateTime,
  earlier: Temporal.ZonedDateTime,
  context?: BusinessDayOptions & ZoneOptions,
): number;

export function differenceInBusinessDays(
  later: CalendarValue,
  earlier: CalendarValue,
  context?: BusinessDayDifferenceOptions,
): number {
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
}
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
function leap(year: number): boolean {
  return year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
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
  const date = toDate(value),
    day = date.dayOfYear - 1,
    length = date.daysInYear;
  const jan = ((((date.dayOfWeek % 7) - day) % 7) + 7) % 7;
  const anchor = (weekdayJan: number) => first - 1 - ((weekdayJan + first - 1 - starts + 7) % 7);
  const current = anchor(jan),
    next = length + anchor((jan + length) % 7);
  if (day >= next) return { week: 1, year: date.year + 1 };
  if (day < current) {
    const previousLength = leap(date.year - 1) ? 366 : 365;
    const previousAnchor = -previousLength + anchor((((jan - previousLength) % 7) + 7) % 7);
    return { week: Math.floor((day - previousAnchor) / 7) + 1, year: date.year - 1 };
  }
  return { week: Math.floor((day - current) / 7) + 1, year: date.year };
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
  const firstDow = ((((value.dayOfWeek % 7) - value.day + 1) % 7) + 7) % 7;
  return Math.ceil((value.day + ((firstDow - starts + 7) % 7)) / 7);
}
export function getWeeksInMonth(value: YearMonthValue, context?: WeekOptions): number {
  options(context, ['weekStartsOn']);
  kind(value, yearMonthKinds);
  const starts = weekStart(context?.weekStartsOn),
    previousYear = value.year - 1;
  const daysBeforeYear =
    365 * previousYear +
    Math.floor(previousYear / 4) -
    Math.floor(previousYear / 100) +
    Math.floor(previousYear / 400);
  const beforeMonth =
    [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334][value.month - 1]! +
    (value.month > 2 && leap(value.year) ? 1 : 0);
  const firstDow = (((daysBeforeYear + beforeMonth + 1) % 7) + 7) % 7;
  return Math.ceil((value.daysInMonth + ((firstDow - starts + 7) % 7)) / 7);
}
