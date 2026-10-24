import type { Temporal } from 'temporal-spec';
import type { DurationFormatOptions, DurationUnit, TryResult } from './types.js';
import { booleanOption, kind, locale, options, temporal } from './internal.js';

const units: readonly DurationUnit[] = [
  'years',
  'months',
  'weeks',
  'days',
  'hours',
  'minutes',
  'seconds',
  'milliseconds',
  'microseconds',
  'nanoseconds',
];
const aliases: Record<string, DurationUnit> = {
  y: 'years',
  mo: 'months',
  w: 'weeks',
  d: 'days',
  h: 'hours',
  m: 'minutes',
  s: 'seconds',
  ms: 'milliseconds',
  us: 'microseconds',
  ns: 'nanoseconds',
};
for (const unit of units) {
  aliases[unit] = unit;
  aliases[unit.slice(0, -1)] = unit;
}

export function formatDuration(value: Temporal.Duration, context?: DurationFormatOptions): string {
  kind(value, ['Duration']);
  options(context, ['format', 'zero', 'delimiter', 'locale']);
  locale(context?.locale, true);
  booleanOption(context?.zero, 'zero');
  if (context?.delimiter !== undefined && typeof context.delimiter !== 'string')
    throw new TypeError('delimiter must be a string');
  const selected = context?.format === undefined ? units : context.format;
  if (
    !Array.isArray(selected) ||
    selected.length === 0 ||
    new Set(selected).size !== selected.length ||
    [...selected].some((unit) => !units.includes(unit))
  )
    throw new RangeError('format must be a nonempty list of distinct duration units');
  const pieces: string[] = [];
  for (const unit of selected as readonly DurationUnit[]) {
    const amount = Math.abs(value[unit]);
    if (amount || context?.zero)
      pieces.push(`${BigInt(amount)} ${amount === 1 ? unit.slice(0, -1) : unit}`);
  }
  if (!pieces.length) pieces.push(`0 ${selected[selected.length - 1]!}`);
  return (value.sign < 0 ? '-' : '') + pieces.join(context?.delimiter ?? ' ');
}
export function parseDuration(text: string): Temporal.Duration {
  if (typeof text !== 'string') throw new TypeError('text must be a string');
  let input = text.trim(),
    sign = 1;
  if (input[0] === '-' || input[0] === '+') {
    if (input[0] === '-') sign = -1;
    input = input.slice(1);
  }
  if (!input) throw new RangeError('A duration component is required');
  const result: Partial<Record<DurationUnit, number>> = {};
  let position = 0;
  while (position < input.length) {
    const match = /^(\d+)\s*([a-z]+)/i.exec(input.slice(position));
    if (!match) throw new RangeError('Invalid duration component');
    const name = match[2]!.toLowerCase();
    const unit = Object.hasOwn(aliases, name) ? aliases[name] : undefined;
    if (!unit) throw new RangeError(`Unknown duration unit: ${match[2]}`);
    if (result[unit] !== undefined) throw new RangeError(`Repeated duration unit: ${unit}`);
    const amount = Number(match[1]);
    if (!Number.isFinite(amount) || BigInt(amount) !== BigInt(match[1]!))
      throw new RangeError(`${unit} must be exactly representable as a number`);
    result[unit] = sign * amount;
    position += match[0].length;
    if (position === input.length) break;
    const whitespace = /^\s+/.exec(input.slice(position));
    if (!whitespace) throw new RangeError('Duration components must be separated by whitespace');
    position += whitespace[0].length;
  }
  return temporal().Duration.from(result);
}
export function tryParseDuration(text: string): TryResult<Temporal.Duration, RangeError> {
  try {
    return [null, parseDuration(text)];
  } catch (error) {
    if (error instanceof RangeError) return [error, null];
    throw error;
  }
}
