import type { Temporal } from 'temporal-spec';
import type { CalendarValue } from './types.js';
import { kind, temporal } from './internal.js';

type Fields = Pick<Temporal.PlainDate, 'year' | 'month' | 'day'> &
  Pick<
    Temporal.PlainTime,
    'hour' | 'minute' | 'second' | 'millisecond' | 'microsecond' | 'nanosecond'
  >;
type CalendarUnit = 'month' | 'year';
const dayNanoseconds = 86_400_000_000_000n;
const monthStarts = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];

function leap(year: number): boolean {
  return year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
}
function fields(value: CalendarValue): Fields {
  const time = kind(value) === 'PlainDate' ? undefined : (value as Temporal.PlainDateTime);
  return {
    year: value.year,
    month: value.month,
    day: value.day,
    hour: time?.hour ?? 0,
    minute: time?.minute ?? 0,
    second: time?.second ?? 0,
    millisecond: time?.millisecond ?? 0,
    microsecond: time?.microsecond ?? 0,
    nanosecond: time?.nanosecond ?? 0,
  };
}
function wallNanoseconds(value: Fields): bigint {
  const year = value.year - 1;
  const days =
    365 * year +
    Math.floor(year / 4) -
    Math.floor(year / 100) +
    Math.floor(year / 400) +
    monthStarts[value.month - 1]! +
    (value.month > 2 && leap(value.year) ? 1 : 0) +
    value.day -
    1 -
    719_162;
  return (
    BigInt(days) * dayNanoseconds +
    BigInt(value.hour) * 3_600_000_000_000n +
    BigInt(value.minute) * 60_000_000_000n +
    BigInt(value.second) * 1_000_000_000n +
    BigInt(value.millisecond) * 1_000_000n +
    BigInt(value.microsecond) * 1_000n +
    BigInt(value.nanosecond)
  );
}
function addCalendarUnits(value: Fields, count: number, unit: CalendarUnit): Fields {
  const index = value.year * 12 + value.month - 1 + count * (unit === 'year' ? 12 : 1);
  const year = Math.floor(index / 12),
    month = index - year * 12 + 1;
  const days = month === 2 ? (leap(year) ? 29 : 28) : [4, 6, 9, 11].includes(month) ? 30 : 31;
  return { ...value, year, month, day: Math.min(value.day, days) };
}
function fixedOffset(value: Temporal.ZonedDateTime): bigint | undefined {
  const zone = value.timeZoneId;
  if (
    zone[0] === '+' ||
    zone[0] === '-' ||
    new Intl.DateTimeFormat('en-US', { timeZone: zone }).resolvedOptions().timeZone === 'UTC'
  )
    return BigInt(value.offsetNanoseconds);
  return undefined;
}
export function canExtendCalendarRange(value: CalendarValue): boolean {
  return (
    kind(value) !== 'ZonedDateTime' || fixedOffset(value as Temporal.ZonedDateTime) !== undefined
  );
}
function ratioToNumber(numerator: bigint, denominator: bigint): number {
  if (numerator === 0n) return 0;
  // Round the rational once; converting its operands first can change the result.
  const sign = numerator < 0n ? -1 : 1;
  const magnitude = numerator < 0n ? -numerator : numerator;
  let exponent = magnitude.toString(2).length - denominator.toString(2).length;
  if (
    exponent >= 0
      ? magnitude < denominator << BigInt(exponent)
      : magnitude << BigInt(-exponent) < denominator
  )
    exponent--;
  const shift = 52 - exponent;
  const scaledNumerator = shift >= 0 ? magnitude << BigInt(shift) : magnitude;
  const scaledDenominator = shift >= 0 ? denominator : denominator << BigInt(-shift);
  let significand = scaledNumerator / scaledDenominator;
  const remainder = scaledNumerator % scaledDenominator;
  if (
    remainder * 2n > scaledDenominator ||
    (remainder * 2n === scaledDenominator && significand % 2n === 1n)
  )
    significand++;
  return sign * Number(significand) * 2 ** (exponent - 52);
}

export function calendarTotal(
  value: CalendarValue,
  base: CalendarValue,
  unit: CalendarUnit,
): number {
  const origin = fields(base),
    target = fields(value);
  const zoned = kind(base) === 'ZonedDateTime';
  const offset = zoned ? fixedOffset(base as Temporal.ZonedDateTime) : undefined;
  const epoch = (point: Fields): bigint => {
    if (!zoned) return wallNanoseconds(point);
    if (offset !== undefined) return wallNanoseconds(point) - offset;
    return temporal().ZonedDateTime.from(
      { ...point, timeZone: (base as Temporal.ZonedDateTime).timeZoneId },
      { disambiguation: 'compatible' },
    ).epochNanoseconds;
  };
  const start = zoned ? (base as Temporal.ZonedDateTime).epochNanoseconds : wallNanoseconds(origin);
  const end = zoned ? (value as Temporal.ZonedDateTime).epochNanoseconds : wallNanoseconds(target);
  if (start === end) return 0;
  const direction = end > start ? 1 : -1,
    sign = BigInt(direction);
  const guess =
    unit === 'year'
      ? target.year - origin.year
      : (target.year - origin.year) * 12 + target.month - origin.month;
  let whole = direction > 0 ? Math.max(0, guess) : Math.min(0, guess);
  const at = (count: number): bigint =>
    count === 0 ? start : epoch(addCalendarUnits(origin, count, unit));
  let lower = at(whole);
  while ((lower - end) * sign > 0n) {
    whole -= direction;
    lower = at(whole);
  }
  if (lower === end) return whole;
  let upper = at(whole + direction);
  while ((upper - end) * sign <= 0n) {
    whole += direction;
    lower = upper;
    if (lower === end) return whole;
    upper = at(whole + direction);
  }
  const span = (upper - lower) * sign,
    remainder = (end - lower) * sign;
  return ratioToNumber(BigInt(whole) * span + sign * remainder, span);
}
