import type { Temporal } from 'temporal-spec';
import { expect } from 'vite-plus/test';
import { T, instant } from './support.js';
type RelativeValue = Temporal.PlainDate | Temporal.PlainDateTime | Temporal.ZonedDateTime;
type CalendarUnit = 'month' | 'year';
export const clock = (text: string, phrase: string, hour: number, minute = 0) => {
  const rendered = new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    timeZone: 'UTC',
  }).format(new Date(Date.UTC(2026, 9, 23, hour, minute)));
  expect(text.replace(/\s+/gu, ' ')).toBe(`${phrase} at ${rendered}`.replace(/\s+/gu, ' '));
};
export function nativeTotal(v: RelativeValue, b: RelativeValue, unit: CalendarUnit) {
  const duration = b.until(v as never, { largestUnit: 'year' });
  return duration.total({ unit, relativeTo: b instanceof T.PlainDateTime ? b.toPlainDate() : b });
}
export const low = () => instant('-271821-04-20T00:00Z');
export const high = () => instant('+275760-09-13T00:00Z');
export const edge = (name: string, zone: string) =>
  (name === 'minimum' ? low() : high()).toZonedDateTimeISO(zone);
export const toward = (v: Temporal.ZonedDateTime, name: string, days = 50) =>
  v.add({ days: name === 'minimum' ? days : -days });
