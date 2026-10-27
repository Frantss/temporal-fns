import type { Temporal } from 'temporal-spec';
import { clockNanoseconds, dayNanoseconds, dayNumber } from './iso.js';
import type { CalendarValue, Formattable, OrderedValue, ZoneOptions } from './types.js';

const kinds = [
  'PlainDate',
  'PlainDateTime',
  'ZonedDateTime',
  'PlainTime',
  'PlainYearMonth',
  'PlainMonthDay',
  'Instant',
  'Duration',
] as const;
export type Kind = (typeof kinds)[number];
export const calendarKinds: readonly Kind[] = ['PlainDate', 'PlainDateTime', 'ZonedDateTime'];
export const yearMonthKinds: readonly Kind[] = [...calendarKinds, 'PlainYearMonth'];
export const orderedKinds: readonly Kind[] = [...yearMonthKinds, 'PlainTime', 'Instant'];
export const timeKinds: readonly Kind[] = ['PlainTime', 'PlainDateTime', 'ZonedDateTime'];

export function temporal(): typeof Temporal {
  const value = (globalThis as unknown as { Temporal?: typeof Temporal }).Temporal;
  if (!value)
    throw new ReferenceError(
      'Temporal is unavailable. Load a Temporal polyfill before calling this library.',
    );
  return value;
}
export function kind(value: unknown, allowed: readonly Kind[] = kinds): Kind {
  const name = Object.prototype.toString.call(value).slice(17, -1) as Kind;
  if (!allowed.includes(name)) throw new TypeError(`Expected ${allowed.join(' or ')}`);
  const calendar = (value as { calendarId?: string }).calendarId;
  if (calendar !== undefined && calendar !== 'iso8601')
    throw new RangeError('Only the iso8601 calendar is supported');
  return name;
}
export function sameKind(a: unknown, b: unknown, allowed: readonly Kind[] = orderedKinds): Kind {
  const name = kind(a, allowed);
  if (kind(b, allowed) !== name) throw new TypeError('Temporal inputs must have the same kind');
  return name;
}
export function options(value: unknown, allowed: readonly string[]): void {
  if (value === undefined) return;
  if (value === null || typeof value !== 'object' || Array.isArray(value))
    throw new TypeError('Options must be an object');
  for (const key of Object.keys(value))
    if (!allowed.includes(key)) throw new RangeError(`Unsupported option: ${key}`);
}
export function booleanOption(value: unknown, name: string): void {
  if (value !== undefined && typeof value !== 'boolean')
    throw new TypeError(`${name} must be a boolean`);
}
export function integer(value: number, name: string): number {
  if (!Number.isSafeInteger(value)) throw new RangeError(`${name} must be a safe integer`);
  return value;
}
export function weekday(value: number): number {
  integer(value, 'weekday');
  if (value < 0 || value > 6) throw new RangeError('Weekdays must be between 0 and 6');
  return value;
}
export function weekStart(value: number | undefined): number {
  return weekday(value === undefined ? 0 : value);
}
export function step(value: number | undefined): number {
  const result = integer(value === undefined ? 1 : value, 'step');
  if (result < 1) throw new RangeError('step must be positive');
  return result;
}
export function zone(value: unknown): string {
  if (typeof value !== 'string' || value.length === 0)
    throw new TypeError('An explicit timeZone is required');
  temporal().Instant.fromEpochMilliseconds(0).toZonedDateTimeISO(value);
  return value;
}
export function locale(value: unknown, englishOnly = false): string {
  if (value !== undefined && typeof value !== 'string')
    throw new TypeError('locale must be a language tag');
  const result = Intl.getCanonicalLocales(value === undefined ? 'en-US' : (value as string))[0]!;
  if (englishOnly && result !== 'en-US')
    throw new RangeError('Only en-US text is currently supported');
  return result;
}
export function toDate(value: CalendarValue): Temporal.PlainDate {
  return kind(value, calendarKinds) === 'PlainDate'
    ? (value as Temporal.PlainDate)
    : (value as Temporal.PlainDateTime | Temporal.ZonedDateTime).toPlainDate();
}
export function month(value: Formattable): number {
  return kind(value) === 'PlainMonthDay'
    ? Number((value as Temporal.PlainMonthDay).monthCode.slice(1))
    : (value as Temporal.PlainDate).month;
}
export function atDate<T extends CalendarValue>(value: T, date: Temporal.PlainDate): T {
  const name = kind(value, calendarKinds);
  if (name === 'PlainDate') return date as T;
  if (name === 'PlainDateTime') return date.toPlainDateTime() as T;
  return date.toZonedDateTime((value as Temporal.ZonedDateTime).timeZoneId) as T;
}
function coordinate(value: OrderedValue, name: Kind): bigint {
  if (name === 'Instant' || name === 'ZonedDateTime')
    return (value as Temporal.Instant).epochNanoseconds;
  if (name === 'PlainYearMonth')
    return BigInt(
      (value as Temporal.PlainYearMonth).year * 12 + (value as Temporal.PlainYearMonth).month,
    );
  if (name === 'PlainTime') return clockNanoseconds(value as Temporal.PlainTime);
  const date = value as Temporal.PlainDateTime;
  const days = BigInt(dayNumber(date.year, date.month, date.day));
  return name === 'PlainDate' ? days : days * dayNanoseconds + clockNanoseconds(date);
}
export function compare(a: OrderedValue, b: OrderedValue): number {
  const name = sameKind(a, b);
  const T = temporal();
  if (name === 'PlainYearMonth')
    return Math.sign(
      (a as Temporal.PlainYearMonth).year - (b as Temporal.PlainYearMonth).year ||
        (a as Temporal.PlainYearMonth).month - (b as Temporal.PlainYearMonth).month,
    );
  return (T[name] as typeof T.Instant).compare(a as Temporal.Instant, b as Temporal.Instant);
}
export function distance(a: OrderedValue, b: OrderedValue): bigint {
  const name = sameKind(a, b),
    delta = coordinate(a, name) - coordinate(b, name);
  return delta < 0n ? -delta : delta;
}
export function named<T extends (...args: never[]) => unknown>(name: string, fn: T): T {
  return Object.defineProperty(fn, 'name', { value: name });
}
type CalendarInput = CalendarValue | Temporal.PlainYearMonth | Temporal.Instant;
export function calendarPair(
  a: CalendarInput,
  b: typeof a,
  context?: ZoneOptions,
): [CalendarValue | Temporal.PlainYearMonth, CalendarValue | Temporal.PlainYearMonth] {
  const name = sameKind(a, b, [...yearMonthKinds, 'Instant']);
  if (name === 'Instant' || (name === 'ZonedDateTime' && context?.timeZone !== undefined)) {
    const tz = zone(context?.timeZone);
    const convert = (value: CalendarInput) =>
      name === 'Instant'
        ? (value as Temporal.Instant).toZonedDateTimeISO(tz)
        : (value as Temporal.ZonedDateTime).withTimeZone(tz);
    return [convert(a), convert(b)];
  }
  if (name === 'ZonedDateTime') {
    if ((a as Temporal.ZonedDateTime).timeZoneId !== (b as Temporal.ZonedDateTime).timeZoneId)
      throw new RangeError('Different zones require an explicit comparison timeZone');
  } else if (context?.timeZone !== undefined)
    throw new RangeError('Plain values do not accept a timeZone');
  return [
    a as CalendarValue | Temporal.PlainYearMonth,
    b as CalendarValue | Temporal.PlainYearMonth,
  ];
}
