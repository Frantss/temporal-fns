import type { Temporal } from 'temporal-spec';
import type { CalendarValue, Formattable, OrderedValue, ZoneOptions } from './types.js';

export type Kind =
  | 'PlainDate'
  | 'PlainDateTime'
  | 'ZonedDateTime'
  | 'PlainTime'
  | 'PlainYearMonth'
  | 'PlainMonthDay'
  | 'Instant'
  | 'Duration';
const kinds: readonly Kind[] = [
  'PlainDate',
  'PlainDateTime',
  'ZonedDateTime',
  'PlainTime',
  'PlainYearMonth',
  'PlainMonthDay',
  'Instant',
  'Duration',
];
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
export function compare(a: OrderedValue, b: OrderedValue): number {
  const name = sameKind(a, b);
  const T = temporal();
  switch (name) {
    case 'Instant':
      return T.Instant.compare(a as Temporal.Instant, b as Temporal.Instant);
    case 'ZonedDateTime':
      return T.ZonedDateTime.compare(a as Temporal.ZonedDateTime, b as Temporal.ZonedDateTime);
    case 'PlainDateTime':
      return T.PlainDateTime.compare(a as Temporal.PlainDateTime, b as Temporal.PlainDateTime);
    case 'PlainDate':
      return T.PlainDate.compare(a as Temporal.PlainDate, b as Temporal.PlainDate);
    case 'PlainTime':
      return T.PlainTime.compare(a as Temporal.PlainTime, b as Temporal.PlainTime);
    default: {
      const left = a as Temporal.PlainYearMonth,
        right = b as Temporal.PlainYearMonth;
      return Math.sign(left.year - right.year || left.month - right.month);
    }
  }
}
export function distance(a: OrderedValue, b: OrderedValue): bigint {
  const name = sameKind(a, b);
  let value: bigint;
  if (name === 'Instant' || name === 'ZonedDateTime')
    value = (a as Temporal.Instant).epochNanoseconds - (b as Temporal.Instant).epochNanoseconds;
  else if (name === 'PlainYearMonth')
    value = BigInt(
      ((a as Temporal.PlainYearMonth).year - (b as Temporal.PlainYearMonth).year) * 12 +
        (a as Temporal.PlainYearMonth).month -
        (b as Temporal.PlainYearMonth).month,
    );
  else if (name === 'PlainDate')
    value = BigInt((a as Temporal.PlainDate).since(b as Temporal.PlainDate).days);
  else {
    const clock = (item: Temporal.PlainTime | Temporal.PlainDateTime): bigint =>
      BigInt(item.hour) * 3_600_000_000_000n +
      BigInt(item.minute) * 60_000_000_000n +
      BigInt(item.second) * 1_000_000_000n +
      BigInt(item.millisecond) * 1_000_000n +
      BigInt(item.microsecond) * 1_000n +
      BigInt(item.nanosecond);
    value = clock(a as Temporal.PlainTime) - clock(b as Temporal.PlainTime);
    if (name === 'PlainDateTime')
      value +=
        BigInt(
          (a as Temporal.PlainDateTime)
            .toPlainDate()
            .since((b as Temporal.PlainDateTime).toPlainDate()).days,
        ) * 86_400_000_000_000n;
  }
  return value < 0n ? -value : value;
}
export function calendarPair(
  a: CalendarValue | Temporal.PlainYearMonth | Temporal.Instant,
  b: typeof a,
  context?: ZoneOptions,
): [CalendarValue | Temporal.PlainYearMonth, CalendarValue | Temporal.PlainYearMonth] {
  const name = sameKind(a, b, [...yearMonthKinds, 'Instant']);
  if (name === 'Instant') {
    const tz = zone(context?.timeZone);
    return [
      (a as Temporal.Instant).toZonedDateTimeISO(tz),
      (b as Temporal.Instant).toZonedDateTimeISO(tz),
    ];
  }
  if (name === 'ZonedDateTime') {
    const left = a as Temporal.ZonedDateTime,
      right = b as Temporal.ZonedDateTime;
    if (context?.timeZone !== undefined) {
      const tz = zone(context.timeZone);
      return [left.withTimeZone(tz), right.withTimeZone(tz)];
    }
    if (left.timeZoneId !== right.timeZoneId)
      throw new RangeError('Different zones require an explicit comparison timeZone');
  } else if (context?.timeZone !== undefined)
    throw new RangeError('Plain values do not accept a timeZone');
  return [
    a as CalendarValue | Temporal.PlainYearMonth,
    b as CalendarValue | Temporal.PlainYearMonth,
  ];
}
