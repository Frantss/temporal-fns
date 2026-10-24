import type { Temporal } from 'temporal-spec';
import type { CalendarValue } from './types.js';
import { calendarKinds, kind, temporal } from './internal.js';

export function toCalendarDate(value: CalendarValue): Date {
  const name = kind(value, calendarKinds);
  const fields =
    name === 'PlainDate'
      ? (value as Temporal.PlainDate).toPlainDateTime()
      : (value as Temporal.PlainDateTime | Temporal.ZonedDateTime);
  if (fields.microsecond || fields.nanosecond)
    throw new RangeError('Date cannot represent sub-millisecond precision');
  const plain =
    name === 'ZonedDateTime'
      ? (value as Temporal.ZonedDateTime).toPlainDateTime()
      : (fields as Temporal.PlainDateTime);
  const result = new Date(plain.toString({ smallestUnit: 'millisecond' }));
  if (
    result.getFullYear() !== fields.year ||
    result.getMonth() + 1 !== fields.month ||
    result.getDate() !== fields.day ||
    result.getHours() !== fields.hour ||
    result.getMinutes() !== fields.minute ||
    result.getSeconds() !== fields.second ||
    result.getMilliseconds() !== fields.millisecond
  )
    throw new RangeError('The host time zone cannot represent these calendar fields');
  return result;
}
export function fromCalendarDate(value: Date): Temporal.PlainDateTime {
  let timestamp: number;
  try {
    timestamp = Date.prototype.getTime.call(value);
  } catch {
    throw new TypeError('Expected a Date');
  }
  if (!Number.isFinite(timestamp)) throw new RangeError('Invalid Date');
  return temporal().PlainDateTime.from({
    year: value.getFullYear(),
    month: value.getMonth() + 1,
    day: value.getDate(),
    hour: value.getHours(),
    minute: value.getMinutes(),
    second: value.getSeconds(),
    millisecond: value.getMilliseconds(),
  });
}
