import type { Temporal } from 'temporal-spec';
import { expect } from 'vitest';
import { observe, returned, type Observation } from './bindings.js';
import { nativeTotal } from './relative-support.js';
import { T, api, kindOf, type ApiName, type TemporalValue } from './support.js';

export const list = (text: string): string[] =>
  text
    .trim()
    .slice(1, -1)
    .split(',')
    .map((x) => x.trim())
    .filter(Boolean);
export function snapshot(v: unknown): unknown {
  if (v === null || typeof v !== 'object') return v;
  if (v instanceof Date) return { kind: 'Date', epoch: v.getTime() };
  if (kindOf(v).startsWith('Plain') || ['Duration', 'Instant', 'ZonedDateTime'].includes(kindOf(v)))
    return { kind: kindOf(v), text: (v as TemporalValue).toString() };
  if (Array.isArray(v)) return v.map(snapshot);
  return Object.fromEntries(Object.entries(v).map(([k, v]) => [k, snapshot(v)]));
}
export function freezeContainers(v: unknown): void {
  if (
    v &&
    typeof v === 'object' &&
    (Array.isArray(v) || Object.getPrototypeOf(v) === Object.prototype)
  ) {
    Object.values(v).forEach(freezeContainers);
    Object.freeze(v);
  }
}
export function globalSnapshot(): unknown {
  return {
    temporal: Reflect.get(globalThis, 'Temporal'),
    namespace: Object.getOwnPropertyDescriptors(T),
    now: Object.getOwnPropertyDescriptors(T.Now),
    zone: process.env.TZ,
    hostZone: new Intl.DateTimeFormat().resolvedOptions().timeZone,
  };
}
type RelativeValue = Temporal.PlainDate | Temporal.PlainDateTime | Temporal.ZonedDateTime;
export interface NativeObservation {
  value: RelativeValue;
  base: RelativeValue;
  unit: 'month' | 'year';
  method: 'floor' | 'ceil' | 'round' | 'trunc';
  total: number;
  actual: Observation;
}
export function observeNative(
  value: TemporalValue,
  base: TemporalValue,
  units: ('month' | 'year')[] = ['month', 'year'],
): NativeObservation[] {
  const v = value as RelativeValue,
    b = base as RelativeValue;
  return units.flatMap((unit) => {
    const total = nativeTotal(v, b, unit);
    return (['floor', 'ceil', 'round', 'trunc'] as const).map((method) => ({
      value: v,
      base: b,
      unit,
      method,
      total,
      actual: observe(() => api.formatDistanceStrict(v, b, { unit, roundingMethod: method })),
    }));
  });
}
export function assertNative(rows: NativeObservation[]): void {
  expect(rows.length).toBeGreaterThan(0);
  for (const row of rows) {
    expect(Number.isFinite(row.total)).toBe(true);
    const n = Math[row.method](Math.abs(row.total));
    expect(returned(row.actual)).toBe(`${n} ${row.unit}${n === 1 ? '' : 's'}`);
  }
}
export function assertShape(
  f: ApiName,
  kind: string,
  input: unknown,
  out: unknown,
  shapes: Record<string, string>,
): void {
  const key = f.startsWith('format')
    ? 'format, formatDuration, relative descriptions'
    : f === 'parse'
      ? 'parse'
      : f === 'tryParse'
        ? 'tryParse'
        : f === 'parseDuration'
          ? 'parseDuration'
          : f === 'tryParseDuration'
            ? 'tryParseDuration'
            : f === 'isMatch' || /^is|^are/.test(f)
              ? 'isMatch and predicates'
              : ['min', 'max', 'closestTo'].includes(f)
                ? 'min, max, closestTo'
                : f === 'closestIndexTo'
                  ? 'closestIndexTo'
                  : f === 'differenceInBusinessDays'
                    ? 'differenceInBusinessDays'
                    : f.startsWith('get')
                      ? 'calendar queries'
                      : f.startsWith('each')
                        ? 'sequences'
                        : f === 'toCalendarDate'
                          ? 'toCalendarDate'
                          : f === 'fromCalendarDate'
                            ? 'fromCalendarDate'
                            : 'boundaries, business additions, weekday navigation, clamp';
  switch (shapes[key]) {
    case 'string':
      expect(typeof out).toBe('string');
      break;
    case 'the reference Temporal kind':
    case 'the input Temporal kind':
      expect(kindOf(out)).toBe(kind);
      break;
    case '[null, the reference Temporal kind]':
    case '[null, Duration]': {
      expect(Array.isArray(out)).toBe(true);
      const t = out as unknown[];
      expect(t).toHaveLength(2);
      expect(t[0]).toBe(null);
      expect(kindOf(t[1])).toBe(f === 'tryParseDuration' ? 'Duration' : kind);
      break;
    }
    case 'boolean':
      expect(typeof out).toBe('boolean');
      break;
    case 'the original singleton input object':
      expect(out).toBe(input);
      break;
    case 'number 0':
      expect(out).toBe(0);
      break;
    case 'number':
      expect(typeof out).toBe('number');
      break;
    case 'an array of the endpoint Temporal kind':
      expect(Array.isArray(out)).toBe(true);
      for (const x of out as unknown[]) expect(kindOf(x)).toBe(kind);
      break;
    case 'Date':
      expect(out).toBeInstanceOf(Date);
      break;
    case 'PlainDateTime':
    case 'Duration':
      expect(kindOf(out)).toBe(shapes[key]);
      break;
    default:
      throw new Error(`Unbound return shape for ${f}: ${shapes[key]}`);
  }
}

export function arrangeFromTable(
  f: ApiName,
  v: unknown,
  kind: string,
  fixture: { pattern: string; text: string },
  arrangements: Record<string, string>,
  zone: string,
): ReturnType<typeof import('./support.js').arrangement> {
  const key =
    f === 'format'
      ? 'format'
      : f === 'parse' || f === 'tryParse' || f === 'isMatch'
        ? 'parse, tryParse, isMatch'
        : f === 'formatDuration'
          ? 'formatDuration'
          : f === 'parseDuration' || f === 'tryParseDuration'
            ? 'parseDuration, tryParseDuration'
            : /^isSame|^formatDistance$|^formatDistanceStrict$|^formatRelative$/.test(f)
              ? 'calendar comparisons and relative pairs'
              : f === 'min' || f === 'max'
                ? 'min, max'
                : f === 'closestTo' || f === 'closestIndexTo'
                  ? 'closestTo, closestIndexTo'
                  : f === 'isWithinInterval' || f === 'clamp'
                    ? 'isWithinInterval, clamp'
                    : f === 'areIntervalsOverlapping'
                      ? 'areIntervalsOverlapping'
                      : f.startsWith('each')
                        ? 'each interval sequence'
                        : f === 'addBusinessDays' || f === 'subBusinessDays'
                          ? 'addBusinessDays, subBusinessDays'
                          : f === 'differenceInBusinessDays'
                            ? 'differenceInBusinessDays'
                            : f === 'nextDay' || f === 'previousDay'
                              ? 'nextDay, previousDay'
                              : 'other unary functions';
  const interval = { start: v, end: v };
  const needsZone =
    (kind === 'Instant' && /^format|^parse$|^tryParse$|^isMatch$|^isSame/.test(f)) ||
    (/ToNow/.test(f) && kind !== 'ZonedDateTime');
  const args: unknown[] = (() => {
    switch (arrangements[key]) {
      case 'value, compatible pattern':
        return [v, fixture.pattern];
      case 'matching text, compatible pattern, value as reference':
        return [fixture.text, fixture.pattern, v];
      case 'value':
        return [v];
      case 'the representative primary argument, without conversion':
        return [v];
      case 'value, the same value as base':
        return [v, v];
      case 'a singleton array containing value':
        return [[v]];
      case 'value as target, a singleton array containing value':
        return [v, [v]];
      case 'value, an interval whose two endpoints are value':
        return [v, interval];
      case 'two intervals whose endpoints are value':
        return [interval, interval];
      case 'an interval whose two endpoints are value':
        return [interval];
      case 'value, amount 1':
        return [v, 1];
      case 'value, the same value as earlier':
        return [v, v];
      case 'value, weekday 1':
        return [v, 1];
      default:
        throw new Error(`Unbound argument arrangement for ${f}: ${arrangements[key]}`);
    }
  })();
  if (needsZone) args.push({ timeZone: zone });
  const call = () => api[f](...args);
  call.inputs = args;
  return call;
}
