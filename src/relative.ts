import type { Temporal } from 'temporal-spec';
import { calendarTotal, canExtendCalendarRange } from './calendar-total.js';
import type {
  CalendarValue,
  DistanceOptions,
  StrictDistanceOptions,
  ZoneOptions,
  PlainOptions,
  RequiredZoneOptions,
} from './types.js';
import {
  booleanOption,
  calendarKinds,
  calendarPair,
  compare,
  distance,
  kind,
  locale,
  options,
  temporal,
  toDate,
  zone,
} from './internal.js';

type RelativeValue = CalendarValue | Temporal.Instant;
type RelativeOptions = DistanceOptions & StrictDistanceOptions;
function nearRangeEdge(value: CalendarValue): boolean {
  return value.year <= -271_821 + 1 || value.year >= 275_760 - 1;
}
function prepare(
  value: RelativeValue,
  base: RelativeValue,
  context?: ZoneOptions,
): [CalendarValue, CalendarValue] {
  kind(value, [...calendarKinds, 'Instant']);
  kind(base, [...calendarKinds, 'Instant']);
  return calendarPair(value, base, context) as [CalendarValue, CalendarValue];
}
function amount(
  value: CalendarValue,
  base: CalendarValue,
  unit: NonNullable<StrictDistanceOptions['unit']>,
): number {
  const name = kind(base);
  const fixedUnit =
    unit === 'second' ||
    unit === 'minute' ||
    unit === 'hour' ||
    (unit === 'day' && name !== 'ZonedDateTime');
  if (fixedUnit) {
    const nanoseconds = distance(value, base) * (name === 'PlainDate' ? 86_400_000_000_000n : 1n);
    const scale =
      unit === 'second' ? 1e9 : unit === 'minute' ? 6e10 : unit === 'hour' ? 3.6e12 : 8.64e13;
    return (compare(value, base) * Number(nanoseconds)) / scale;
  }
  if (compare(value, base) === 0) return 0;
  try {
    if (name === 'PlainDate') {
      const duration = (base as Temporal.PlainDate).until(value as Temporal.PlainDate, {
        largestUnit: 'year',
      });
      return duration.total({ unit, relativeTo: base as Temporal.PlainDate });
    }
    if (name === 'PlainDateTime') {
      const duration = (base as Temporal.PlainDateTime).until(value as Temporal.PlainDateTime, {
        largestUnit: 'year',
      });
      return duration.total({ unit, relativeTo: (base as Temporal.PlainDateTime).toPlainDate() });
    }
    const duration = (base as Temporal.ZonedDateTime).until(value as Temporal.ZonedDateTime, {
      largestUnit: 'year',
    });
    return duration.total({ unit, relativeTo: base as Temporal.ZonedDateTime });
  } catch (error) {
    if (
      error instanceof RangeError &&
      (unit === 'month' || unit === 'year') &&
      (nearRangeEdge(value) || nearRangeEdge(base))
    ) {
      try {
        if (canExtendCalendarRange(base)) return calendarTotal(value, base, unit);
      } catch (fallbackError) {
        if (!(fallbackError instanceof RangeError)) throw fallbackError;
      }
    }
    throw error;
  }
}
function suffixed(text: string, direction: number, suffix: boolean | undefined): string {
  return !suffix || direction === 0 ? text : direction < 0 ? text + ' ago' : 'in ' + text;
}
const label = (count: number, unit: string) => `${count} ${unit}${count === 1 ? '' : 's'}`;
function renderDistance(
  value: RelativeValue,
  base: RelativeValue,
  context?: RelativeOptions,
  strict = false,
): string {
  options(
    context,
    strict
      ? ['locale', 'addSuffix', 'unit', 'roundingMethod', 'timeZone']
      : ['locale', 'addSuffix', 'includeSeconds', 'timeZone'],
  );
  locale(context?.locale, true);
  booleanOption(context?.addSuffix, 'addSuffix');
  booleanOption(context?.includeSeconds, 'includeSeconds');
  const units = ['second', 'minute', 'hour', 'day', 'month', 'year'] as const;
  if (context?.unit !== undefined && !units.includes(context.unit))
    throw new RangeError('Invalid distance unit');
  if (
    context?.roundingMethod !== undefined &&
    !['floor', 'ceil', 'round', 'trunc'].includes(context.roundingMethod)
  )
    throw new RangeError('Invalid roundingMethod');
  const [a, b] = prepare(value, base, context),
    seconds = Math.abs(amount(a, b, 'second')),
    direction = compare(a, b);
  let text: string;
  if (strict) {
    const unit =
      context?.unit ??
      (seconds < 60
        ? 'second'
        : seconds < 3600
          ? 'minute'
          : seconds < 86400
            ? 'hour'
            : seconds < 2592000
              ? 'day'
              : seconds < 31536000
                ? 'month'
                : 'year');
    const count = Math[context?.roundingMethod ?? 'round'](Math.abs(amount(a, b, unit)));
    text = label(count, unit);
  } else if (context?.includeSeconds && seconds < 90) {
    text =
      seconds < 5
        ? 'less than 5 seconds'
        : seconds < 10
          ? 'less than 10 seconds'
          : seconds < 20
            ? 'less than 20 seconds'
            : seconds < 40
              ? 'half a minute'
              : seconds < 60
                ? 'less than a minute'
                : '1 minute';
  } else if (seconds < 30) text = 'less than a minute';
  else if (seconds < 90) text = '1 minute';
  else if (seconds < 2700) text = label(Math.round(seconds / 60), 'minute');
  else if (seconds < 5400) text = 'about 1 hour';
  else if (seconds < 86400) text = 'about ' + label(Math.round(seconds / 3600), 'hour');
  else if (seconds < 151200) text = '1 day';
  else if (seconds < 2592000) text = label(Math.round(Math.abs(amount(a, b, 'day'))), 'day');
  else if (seconds < 3888000) text = 'about 1 month';
  else if (seconds < 5184000) text = '2 months';
  else if (seconds < 31536000)
    text = label(Math.max(2, Math.round(Math.abs(amount(a, b, 'month')))), 'month');
  else text = 'about ' + label(Math.max(1, Math.round(Math.abs(amount(a, b, 'year')))), 'year');
  return suffixed(text, direction, context?.addSuffix);
}
export function formatDistance(
  value: Temporal.PlainDate,
  baseValue: Temporal.PlainDate,
  context?: DistanceOptions & PlainOptions,
): string;
export function formatDistance(
  value: Temporal.PlainDateTime,
  baseValue: Temporal.PlainDateTime,
  context?: DistanceOptions & PlainOptions,
): string;
export function formatDistance(
  value: Temporal.ZonedDateTime,
  baseValue: Temporal.ZonedDateTime,
  context?: DistanceOptions & ZoneOptions,
): string;
export function formatDistance(
  value: Temporal.Instant,
  baseValue: Temporal.Instant,
  context: DistanceOptions & RequiredZoneOptions,
): string;
export function formatDistance(
  value: RelativeValue,
  baseValue: RelativeValue,
  context?: DistanceOptions,
): string {
  return renderDistance(value, baseValue, context, false);
}
export function formatDistanceStrict(
  value: Temporal.PlainDate,
  baseValue: Temporal.PlainDate,
  context?: StrictDistanceOptions & PlainOptions,
): string;
export function formatDistanceStrict(
  value: Temporal.PlainDateTime,
  baseValue: Temporal.PlainDateTime,
  context?: StrictDistanceOptions & PlainOptions,
): string;
export function formatDistanceStrict(
  value: Temporal.ZonedDateTime,
  baseValue: Temporal.ZonedDateTime,
  context?: StrictDistanceOptions & ZoneOptions,
): string;
export function formatDistanceStrict(
  value: Temporal.Instant,
  baseValue: Temporal.Instant,
  context: StrictDistanceOptions & RequiredZoneOptions,
): string;
export function formatDistanceStrict(
  value: RelativeValue,
  baseValue: RelativeValue,
  context?: StrictDistanceOptions,
): string {
  return renderDistance(value, baseValue, context, true);
}

function current(value: RelativeValue, context?: ZoneOptions): [RelativeValue, ZoneOptions] {
  const name = kind(value, [...calendarKinds, 'Instant']);
  const tz =
    name === 'ZonedDateTime'
      ? zone(
          context?.timeZone === undefined
            ? (value as Temporal.ZonedDateTime).timeZoneId
            : context.timeZone,
        )
      : zone(context?.timeZone);
  const now = temporal().Now.zonedDateTimeISO(tz);
  if (name === 'Instant') return [now.toInstant(), { timeZone: tz }];
  if (name === 'ZonedDateTime') return [now, { timeZone: tz }];
  return [name === 'PlainDate' ? now.toPlainDate() : now.toPlainDateTime(), {}];
}
export function formatDistanceToNow(
  value: Temporal.PlainDate,
  context: DistanceOptions & RequiredZoneOptions,
): string;
export function formatDistanceToNow(
  value: Temporal.PlainDateTime,
  context: DistanceOptions & RequiredZoneOptions,
): string;
export function formatDistanceToNow(
  value: Temporal.ZonedDateTime,
  context?: DistanceOptions & ZoneOptions,
): string;
export function formatDistanceToNow(
  value: Temporal.Instant,
  context: DistanceOptions & RequiredZoneOptions,
): string;
export function formatDistanceToNow(value: RelativeValue, context?: DistanceOptions): string {
  options(context, ['locale', 'addSuffix', 'includeSeconds', 'timeZone']);
  const [now, normalized] = current(value, context);
  return renderDistance(
    value,
    now,
    {
      locale: context?.locale,
      addSuffix: context?.addSuffix,
      includeSeconds: context?.includeSeconds,
      ...normalized,
    },
    false,
  );
}
export function formatDistanceToNowStrict(
  value: Temporal.PlainDate,
  context: StrictDistanceOptions & RequiredZoneOptions,
): string;
export function formatDistanceToNowStrict(
  value: Temporal.PlainDateTime,
  context: StrictDistanceOptions & RequiredZoneOptions,
): string;
export function formatDistanceToNowStrict(
  value: Temporal.ZonedDateTime,
  context?: StrictDistanceOptions & ZoneOptions,
): string;
export function formatDistanceToNowStrict(
  value: Temporal.Instant,
  context: StrictDistanceOptions & RequiredZoneOptions,
): string;
export function formatDistanceToNowStrict(
  value: RelativeValue,
  context?: StrictDistanceOptions,
): string {
  options(context, ['locale', 'addSuffix', 'unit', 'roundingMethod', 'timeZone']);
  const [now, normalized] = current(value, context);
  return renderDistance(
    value,
    now,
    {
      locale: context?.locale,
      addSuffix: context?.addSuffix,
      unit: context?.unit,
      roundingMethod: context?.roundingMethod,
      ...normalized,
    },
    true,
  );
}
export function formatRelative(
  value: Temporal.PlainDate,
  baseValue: Temporal.PlainDate,
  context?: { locale?: string } & PlainOptions,
): string;
export function formatRelative(
  value: Temporal.PlainDateTime,
  baseValue: Temporal.PlainDateTime,
  context?: { locale?: string } & PlainOptions,
): string;
export function formatRelative(
  value: Temporal.ZonedDateTime,
  baseValue: Temporal.ZonedDateTime,
  context?: { locale?: string } & ZoneOptions,
): string;
export function formatRelative(
  value: Temporal.Instant,
  baseValue: Temporal.Instant,
  context: { locale?: string } & RequiredZoneOptions,
): string;

export function formatRelative(
  value: RelativeValue,
  baseValue: RelativeValue,
  context?: ZoneOptions & { locale?: string },
): string {
  options(context, ['locale', 'timeZone']);
  locale(context?.locale, true);
  const [a, b] = prepare(value, baseValue, context),
    date = toDate(a),
    days = toDate(b).until(date).days;
  let text =
    days < -6 || days > 6
      ? `${String(date.month).padStart(2, '0')}/${String(date.day).padStart(2, '0')}/${date.year < 0 ? '-' : ''}${String(Math.abs(date.year)).padStart(4, '0')}`
      : days === -1
        ? 'yesterday'
        : days === 0
          ? 'today'
          : days === 1
            ? 'tomorrow'
            : (days < 0 ? 'last ' : '') + date.toLocaleString('en-US', { weekday: 'long' });
  if (kind(a) !== 'PlainDate')
    text +=
      ' at ' +
      (a as Temporal.PlainDateTime | Temporal.ZonedDateTime)
        .toPlainTime()
        .toLocaleString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  return text;
}
