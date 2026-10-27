import type { Temporal } from 'temporal-spec';
import { kind } from './internal.js';
import {
  clockNanoseconds,
  dayNanoseconds,
  dayNumber,
  daysInMonth,
  fields,
  type Fields,
} from './iso.js';
import type { CalendarValue } from './types.js';

type CalendarUnit = 'month' | 'year';
const wall = (point: Fields): bigint =>
  BigInt(dayNumber(point.year, point.month, point.day)) * dayNanoseconds + clockNanoseconds(point);
function add(value: Fields, count: number, unit: CalendarUnit): Fields {
  const index = value.year * 12 + value.month - 1 + count * (unit === 'year' ? 12 : 1);
  const year = Math.floor(index / 12),
    month = index - year * 12 + 1;
  return { ...value, year, month, day: Math.min(value.day, daysInMonth(year, month)) };
}
function fixedZone(value: CalendarValue): boolean {
  if (kind(value) !== 'ZonedDateTime') return true;
  const zone = (value as Temporal.ZonedDateTime).timeZoneId;
  return (
    /^[+-]/.test(zone) ||
    new Intl.DateTimeFormat('en-US', { timeZone: zone }).resolvedOptions().timeZone === 'UTC'
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
): number | undefined {
  if (!fixedZone(base)) return undefined;
  const copy = (value: CalendarValue): Fields =>
    Object.fromEntries(
      fields.map((field) => [field, (value as unknown as Partial<Fields>)[field] ?? 0]),
    ) as Fields;
  const origin = copy(base),
    target = copy(value),
    start = wall(origin),
    end = wall(target);
  if (start === end) return 0;
  const direction = end > start ? 1 : -1,
    sign = BigInt(direction);
  const at = (count: number): bigint => (count === 0 ? start : wall(add(origin, count, unit)));
  let whole =
    unit === 'year'
      ? target.year - origin.year
      : (target.year - origin.year) * 12 + target.month - origin.month;
  let lower = at(whole);
  if ((lower - end) * sign > 0n) lower = at((whole -= direction));
  if (lower === end) return whole;
  const upper = at(whole + direction),
    span = (upper - lower) * sign;
  return ratioToNumber(BigInt(whole) * span + (end - lower), span);
}
