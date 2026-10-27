import type { Temporal } from 'temporal-spec';
import { calendarKinds, kind, temporal } from './internal.js';
import type { CalendarValue } from './types.js';

export function toCalendarDate(value: CalendarValue): Date {
  const name = kind(value, calendarKinds);
  const plain =
    name === 'PlainDateTime'
      ? (value as Temporal.PlainDateTime)
      : (value as Temporal.PlainDate | Temporal.ZonedDateTime).toPlainDateTime();
  if (plain.microsecond || plain.nanosecond)
    throw new RangeError('Date cannot represent sub-millisecond precision');
  const result = new Date(plain.toString({ smallestUnit: 'millisecond' }));
  if (!Number.isFinite(result.getTime()) || !plain.equals(legacyFields(result)))
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
  return temporal().PlainDateTime.from(legacyFields(value));
}
function legacyFields(value: Date): Temporal.PlainDateTimeLike {
  return {
    year: value.getFullYear(),
    month: value.getMonth() + 1,
    day: value.getDate(),
    hour: value.getHours(),
    minute: value.getMinutes(),
    second: value.getSeconds(),
    millisecond: value.getMilliseconds(),
  };
}
