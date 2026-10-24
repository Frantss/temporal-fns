import type { Temporal } from 'temporal-spec';
import type { CalendarValue, TimeValue, WeekOptions, YearMonthValue } from './types.js';
import {
  atDate,
  calendarKinds,
  kind,
  options,
  temporal,
  toDate,
  weekStart,
  yearMonthKinds,
} from './internal.js';

export type Period = 'day' | 'week' | 'month' | 'quarter' | 'year';
export function boundary<T extends YearMonthValue>(
  value: T,
  unit: Period,
  end = false,
  starts = 0,
): T {
  const name = kind(value, unit === 'quarter' || unit === 'year' ? yearMonthKinds : calendarKinds);
  if (name === 'PlainYearMonth') {
    const input = value as Temporal.PlainYearMonth;
    const first = unit === 'year' ? 1 : Math.floor((input.month - 1) / 3) * 3 + 1;
    return input.with({ month: end ? first + (unit === 'year' ? 11 : 2) : first }) as T;
  }
  let date = toDate(value as CalendarValue);
  const offset = ((date.dayOfWeek % 7) - starts + 7) % 7;
  if (end) {
    if (unit === 'week') date = date.add({ days: 6 - offset });
    if (unit === 'month') date = date.with({ day: date.daysInMonth });
    if (unit === 'quarter') {
      date = date.with({ month: Math.floor((date.month - 1) / 3) * 3 + 3, day: 1 });
      date = date.with({ day: date.daysInMonth });
    }
    if (unit === 'year') date = date.with({ month: 12, day: 31 });
    if (name === 'PlainDate') return date as T;
    if (name === 'PlainDateTime') return date.toPlainDateTime('23:59:59.999999999') as T;
    return (
      atDate(value as CalendarValue, date.add({ days: 1 })) as Temporal.ZonedDateTime
    ).subtract({ nanoseconds: 1 }) as T;
  }
  if (unit === 'week') date = date.subtract({ days: offset });
  if (unit === 'month') date = date.with({ day: 1 });
  if (unit === 'quarter')
    date = date.with({ month: Math.floor((date.month - 1) / 3) * 3 + 1, day: 1 });
  if (unit === 'year') date = date.with({ month: 1, day: 1 });
  return atDate(value as CalendarValue, date) as T;
}
export function startOfWeek<T extends CalendarValue>(value: T, context?: WeekOptions): T {
  options(context, ['weekStartsOn']);
  return boundary(value, 'week', false, weekStart(context?.weekStartsOn));
}
export function startOfISOWeek<T extends CalendarValue>(value: T): T {
  return boundary(value, 'week', false, 1);
}
export function startOfMonth<T extends CalendarValue>(value: T): T {
  return boundary(value, 'month');
}
export function startOfQuarter<T extends YearMonthValue>(value: T): T {
  return boundary(value, 'quarter');
}
export function startOfYear<T extends YearMonthValue>(value: T): T {
  return boundary(value, 'year');
}
export function endOfDay<T extends TimeValue>(value: T): T {
  if (kind(value, ['PlainTime', 'PlainDateTime', 'ZonedDateTime']) === 'PlainTime')
    return temporal().PlainTime.from('23:59:59.999999999') as T;
  return boundary(value as CalendarValue, 'day', true) as T;
}
export function endOfWeek<T extends CalendarValue>(value: T, context?: WeekOptions): T {
  options(context, ['weekStartsOn']);
  return boundary(value, 'week', true, weekStart(context?.weekStartsOn));
}
export function endOfISOWeek<T extends CalendarValue>(value: T): T {
  return boundary(value, 'week', true, 1);
}
export function endOfMonth<T extends CalendarValue>(value: T): T {
  return boundary(value, 'month', true);
}
export function endOfQuarter<T extends YearMonthValue>(value: T): T {
  return boundary(value, 'quarter', true);
}
export function endOfYear<T extends YearMonthValue>(value: T): T {
  return boundary(value, 'year', true);
}
