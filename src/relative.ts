import type { Temporal } from 'temporal-spec';
import { calendarTotal } from './calendar-total.js';
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
import type { Pair, ToNow } from './signatures.js';
import type {
  CalendarValue,
  DistanceOptions,
  StrictDistanceOptions,
  ZoneOptions,
} from './types.js';

type RelativeValue = CalendarValue | Temporal.Instant;
type RelativeOptions = DistanceOptions & StrictDistanceOptions;
const units = ['second', 'minute', 'hour', 'day', 'month', 'year'] as const;
const thresholds = [60, 3600, 86400, 2592000, 31536000, Infinity];
const distanceKeys = (strict: boolean) => [
  'locale',
  'addSuffix',
  'timeZone',
  ...(strict ? ['unit', 'roundingMethod'] : ['includeSeconds']),
];
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
    const duration = base.until(value as never, { largestUnit: 'year' });
    return duration.total({
      unit,
      relativeTo: name === 'PlainDateTime' ? (base as Temporal.PlainDateTime).toPlainDate() : base,
    });
  } catch (error) {
    if (
      error instanceof RangeError &&
      (unit === 'month' || unit === 'year') &&
      (nearRangeEdge(value) || nearRangeEdge(base))
    ) {
      try {
        const total = calendarTotal(value, base, unit);
        if (total !== undefined) return total;
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
  options(context, distanceKeys(strict));
  locale(context?.locale, true);
  booleanOption(context?.addSuffix, 'addSuffix');
  booleanOption(context?.includeSeconds, 'includeSeconds');
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
    const unit = context?.unit ?? units[thresholds.findIndex((limit) => seconds < limit)]!;
    const count = Math[context?.roundingMethod ?? 'round'](Math.abs(amount(a, b, unit)));
    text = label(count, unit);
  } else if (context?.includeSeconds && seconds < 90) {
    text = [
      'less than 5 seconds',
      'less than 10 seconds',
      'less than 20 seconds',
      'half a minute',
      'less than a minute',
      '1 minute',
    ][[5, 10, 20, 40, 60, 90].findIndex((limit) => seconds < limit)]!;
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

export const formatDistance: Pair<DistanceOptions, string> = (value, base, context) =>
  renderDistance(value, base, context);
export const formatDistanceStrict: Pair<StrictDistanceOptions, string> = (value, base, context) =>
  renderDistance(value, base, context, true);

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

function toNow(
  value: RelativeValue,
  context: RelativeOptions | undefined,
  strict: boolean,
): string {
  const keys = distanceKeys(strict);
  options(context, keys);
  const [now, normalized] = current(value, context);
  const rest = Object.fromEntries(
    keys
      .filter((key) => key !== 'timeZone')
      .map((key) => [key, context?.[key as keyof RelativeOptions]]),
  );
  return renderDistance(value, now, { ...rest, ...normalized }, strict);
}
export const formatDistanceToNow: ToNow<DistanceOptions> = (value, context) =>
  toNow(value, context, false);
export const formatDistanceToNowStrict: ToNow<StrictDistanceOptions> = (value, context) =>
  toNow(value, context, true);

export const formatRelative: Pair<{ locale?: string }, string> = (value, baseValue, context) => {
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
};
