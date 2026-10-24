import { expect, vi } from 'vitest';
import * as calendar from '../../src/calendar.js';
import * as root from '../../src/index.js';

import type { Temporal } from 'temporal-spec';

type PublicApi = typeof root & typeof calendar;
export type ApiName = keyof PublicApi;
type RuntimeApi = { [K in ApiName]: (...args: unknown[]) => ReturnType<PublicApi[K]> };
export const api = { ...root, ...calendar } as unknown as RuntimeApi;
export type TemporalTypes = {
  PlainDate: Temporal.PlainDate;
  PlainDateTime: Temporal.PlainDateTime;
  PlainYearMonth: Temporal.PlainYearMonth;
  PlainMonthDay: Temporal.PlainMonthDay;
  PlainTime: Temporal.PlainTime;
  ZonedDateTime: Temporal.ZonedDateTime;
  Instant: Temporal.Instant;
  Duration: Temporal.Duration;
};
export type TemporalKind = keyof TemporalTypes;
export type TemporalValue = TemporalTypes[TemporalKind];

export const T = (globalThis as unknown as { Temporal: typeof Temporal }).Temporal;
expect(
  T,
  'Global Temporal is required. Use npm test to preload the polyfill, or run test:native on a host with native Temporal.',
).toBeTruthy();
export function value<K extends TemporalKind>(
  kind: K,
  text: string | Record<string, number>,
): TemporalTypes[K];
export function value(kind: string, text: string | Record<string, number>): TemporalValue;
export function value(kind: string, text: string | Record<string, number>): TemporalValue {
  if (!(kind in T)) throw new Error(`Unknown Temporal kind: ${kind}`);
  const constructor = T[kind as TemporalKind] as unknown as { from(input: unknown): TemporalValue };
  return constructor.from(text);
}
export const date = (s: string | Record<string, number> = '2026-10-23') => value('PlainDate', s);
export const time = (s = '12:00') => value('PlainTime', s);
export const dt = (s = '2026-10-23T12:00') => value('PlainDateTime', s);
export const zoned = (s = '2026-10-23T12:00[UTC]') => value('ZonedDateTime', s);
export const instant = (s = '2026-10-23T12:00Z') => value('Instant', s);
export const ym = (s = '2026-10') => value('PlainYearMonth', s);
export const kindOf = (v: unknown): string =>
  Object.prototype.toString.call(v).slice(8, -1).replace('Temporal.', '');
export function equal(actual: unknown, expected: TemporalValue): void {
  expect(kindOf(actual)).toBe(kindOf(expected));
  if (kindOf(actual) === 'PlainYearMonth') {
    const a = actual as Temporal.PlainYearMonth;
    const b = expected as Temporal.PlainYearMonth;
    expect([a.year, a.month, a.calendarId]).toEqual([b.year, b.month, b.calendarId]);
  } else {
    expect(
      (actual as Exclude<TemporalValue, Temporal.Duration>).equals(expected as never),
      `${String(actual)} != ${expected.toString()}`,
    ).toBe(true);
  }
}
export function sequence(
  actual: readonly unknown[],
  kind: TemporalKind,
  expected: readonly string[],
): void {
  expect(actual.length).toBe(expected.length);
  actual.forEach((v, i) => equal(v, value(kind, expected[i]!)));
}
export function literal(text: string | undefined): unknown {
  if (text === undefined || text.startsWith('omitted')) return undefined;
  if (text === 'NaN') return NaN;
  if (text === 'Infinity') return Infinity;
  if (text === 'a sparse array with one empty slot') return Array(1);
  if (text === 'an ordinary object') return {};
  if (text.startsWith('number ')) return Number(text.slice(7));
  return JSON.parse(text.replace(/'/g, '"'));
}
export function options(text: string | undefined): Record<string, unknown> | undefined {
  if (!text || text.startsWith('omitted')) return undefined;
  if (text.startsWith('weekendDays ')) return { weekendDays: literal(text.slice(12)) };
  if (text.includes('a sparse array')) return { format: Array(1) };
  return JSON.parse(
    text
      .replace(/'/g, '"')
      .replace(
        /(:\s*)([a-zA-Z]\w*)(?=\s*[,}])/g,
        (_, a, b) => a + (['true', 'false', 'null'].includes(b) ? b : JSON.stringify(b)),
      )
      .replace(/([{,]\s*)(\w+)\s*:/g, '$1"$2":')
      .replace(
        /([[, ]+)(years|months|weeks|days|hours|minutes|seconds|milliseconds|microseconds|nanoseconds|fortnights)(?=\s*[,\]])/g,
        '$1"$2"',
      ),
  );
}
export function withZone<R>(zone: string, fn: () => R): R {
  const old = process.env.TZ;
  process.env.TZ = zone;
  try {
    return fn();
  } finally {
    if (old === undefined) delete process.env.TZ;
    else process.env.TZ = old;
  }
}
export function withNow<R>(iso: string, fn: () => R): R {
  const i = instant(iso);
  const clock = vi
    .spyOn(T.Now, 'zonedDateTimeISO')
    .mockImplementation((zone) => i.toZonedDateTimeISO(zone ?? T.Now.timeZoneId()));
  try {
    return fn();
  } finally {
    clock.mockRestore();
  }
}

export const durationKeys = [
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
] as const;
export function durationEqual(
  actual: unknown,
  expected: Partial<Record<(typeof durationKeys)[number], number>>,
): void {
  expect(actual instanceof T.Duration).toBeTruthy();
  for (const k of durationKeys) expect((actual as Temporal.Duration)[k], k).toBe(expected[k] ?? 0);
}
export function parseSuccess(
  text: string,
  pattern: string,
  ref: TemporalValue,
  expected: TemporalValue,
  opts?: Record<string, unknown>,
): void {
  equal(api.parse(text, pattern, ref, opts), expected);
  const tuple = api.tryParse(text, pattern, ref, opts);
  expect(tuple.length).toBe(2);
  expect(tuple[0]).toBe(null);
  equal(tuple[1], expected);
  expect(api.isMatch(text, pattern, ref, opts)).toBe(true);
}
export function parseFailure(
  text: string,
  pattern: string,
  ref: TemporalValue,
  opts?: Record<string, unknown>,
): void {
  expect(() => api.parse(text, pattern, ref, opts)).toThrow(RangeError);
  const tuple = api.tryParse(text, pattern, ref, opts);
  expect(tuple.length).toBe(2);
  expect(tuple[0] instanceof RangeError).toBeTruthy();
  expect(tuple[1]).toBe(null);
  expect(api.isMatch(text, pattern, ref, opts)).toBe(false);
}
const catalog: Record<string, readonly [string, string, string]> = {
  PlainDate: ['2026-10-23', 'yyyy-MM-dd', '2026-10-23'],
  PlainDateTime: ['2026-10-23T12:34:56.123', 'yyyy-MM-dd HH:mm:ss.SSS', '2026-10-23 12:34:56.123'],
  ZonedDateTime: [
    '2026-10-23T12:34:56.123[UTC]',
    'yyyy-MM-dd HH:mm:ss.SSS',
    '2026-10-23 12:34:56.123',
  ],
  PlainTime: ['12:34:56.123', 'HH:mm:ss.SSS', '12:34:56.123'],
  PlainYearMonth: ['2026-10', 'yyyy-MM', '2026-10'],
  PlainMonthDay: ['10-23', 'MM-dd', '10-23'],
  Instant: ['2026-10-23T12:34:56.123Z', 'yyyy-MM-dd HH:mm:ss.SSS', '2026-10-23 12:34:56.123'],
  Duration: ['PT25H30M', "'literal'", 'literal'],
  Date: ['2026-10-23T12:34:56.123', "'literal'", 'literal'],
  string: ['25h 30m', "'literal'", 'literal'],
};
export function representative(kind: string): TemporalValue | Date | string {
  const entry = catalog[kind];
  if (!entry) throw new Error(`Unknown fixture kind: ${kind}`);
  const [s] = entry;
  return kind === 'string' ? s : kind === 'Date' ? new Date(s) : value(kind, s);
}
export function arrangement(
  f: ApiName,
  v: unknown,
  kind: string,
  opts?: Record<string, unknown>,
  fixture?: readonly [string, string, string],
): (() => unknown) & { inputs: unknown[] } {
  const entry = fixture ?? catalog[kind];
  if (!entry) throw new Error(`Unknown fixture kind: ${kind}`);
  const [, pattern, text] = entry;
  const needsZone =
    (kind === 'Instant' && /^format|^parse$|^tryParse$|^isMatch$|^isSame/.test(f)) ||
    (/ToNow/.test(f) && kind !== 'ZonedDateTime');
  const context = opts ?? (needsZone ? { timeZone: 'UTC' } : undefined);
  const interval = { start: v, end: v };
  let args: unknown[] = [v, context];
  if (f === 'format') args = [v, pattern, context];
  else if (['parse', 'tryParse', 'isMatch'].includes(f)) args = [text, pattern, v, context];
  else if (
    /^isSame|^formatDistance$|^formatDistanceStrict$|^formatRelative$|^differenceInBusinessDays$/.test(
      f,
    )
  )
    args = [v, v, context];
  else if (['min', 'max'].includes(f)) args = [[v]];
  else if (['closestTo', 'closestIndexTo'].includes(f)) args = [v, [v]];
  else if (['clamp', 'isWithinInterval'].includes(f)) args = [v, interval];
  else if (f === 'areIntervalsOverlapping') args = [interval, interval, context];
  else if (f.startsWith('each')) args = [interval, opts];
  else if (f.endsWith('BusinessDays')) args = [v, 1, opts];
  else if (['nextDay', 'previousDay'].includes(f)) args = [v, 1];
  const call = () => api[f](...args);
  call.inputs = args;
  return call;
}
export function asTemporal<K extends TemporalKind>(actual: unknown, kind: K): TemporalTypes[K] {
  expect(kindOf(actual)).toBe(kind);
  return actual as TemporalTypes[K];
}

export function dateTimeFromDate(input: Date): Temporal.PlainDateTime {
  return T.PlainDateTime.from({
    year: input.getFullYear(),
    month: input.getMonth() + 1,
    day: input.getDate(),
    hour: input.getHours(),
    minute: input.getMinutes(),
    second: input.getSeconds(),
    millisecond: input.getMilliseconds(),
  });
}
