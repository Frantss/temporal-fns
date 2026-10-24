import type { Temporal } from 'temporal-spec';
import type {
  Formattable,
  ParseReference,
  FormatOptions,
  ParseOptions,
  TryResult,
} from './types.js';
import { kind, locale, options, temporal, zone, month } from './internal.js';

type Part = { token: string } | { literal: string };
const formatTokens = new Set([
  'yyyy',
  'yy',
  'M',
  'MM',
  'MMM',
  'MMMM',
  'd',
  'dd',
  'EEE',
  'EEEE',
  'H',
  'HH',
  'h',
  'hh',
  'm',
  'mm',
  's',
  'ss',
  'SSS',
  'a',
  'XX',
  'XXX',
]);
const parseTokens = new Set([
  'yyyy',
  'M',
  'MM',
  'd',
  'dd',
  'H',
  'HH',
  'h',
  'hh',
  'm',
  'mm',
  's',
  'ss',
  'SSS',
  'a',
  'XX',
  'XXX',
]);
function tokenize(pattern: string, parsing = false): Part[] {
  if (typeof pattern !== 'string') throw new TypeError('pattern must be a string');
  const parts: Part[] = [];
  let i = 0;
  while (i < pattern.length) {
    const char = pattern[i]!;
    if (char === "'") {
      i++;
      if (pattern[i] === "'") {
        parts.push({ literal: "'" });
        i++;
        continue;
      }
      let literal = '',
        closed = false;
      while (i < pattern.length) {
        if (pattern[i] === "'") {
          if (pattern[i + 1] === "'") {
            literal += "'";
            i += 2;
            continue;
          }
          i++;
          closed = true;
          break;
        }
        literal += pattern[i++]!;
      }
      if (!closed) throw new RangeError('Unclosed pattern literal');
      parts.push({ literal });
    } else if (/[A-Za-z]/.test(char)) {
      let token = char;
      i++;
      while (pattern[i] === char) {
        token += char;
        i++;
      }
      if (!(parsing ? parseTokens : formatTokens).has(token))
        throw new RangeError(`Unsupported token: ${token}`);
      parts.push({ token });
    } else {
      let literal = char;
      i++;
      while (i < pattern.length && !/[A-Za-z']/.test(pattern[i]!)) literal += pattern[i++]!;
      parts.push({ literal });
    }
  }
  return parts;
}
function validateTokens(value: Formattable, parts: Part[]): void {
  const name = kind(value, [
    'PlainDate',
    'PlainDateTime',
    'ZonedDateTime',
    'PlainTime',
    'PlainYearMonth',
    'PlainMonthDay',
    'Instant',
  ]);
  for (const part of parts) {
    if (!('token' in part)) continue;
    const token = part.token,
      field = token[0]!;
    if (name === 'Instant' || name === 'ZonedDateTime') continue;
    if (
      field === 'X' ||
      (field === 'y' && ['PlainTime', 'PlainMonthDay'].includes(name)) ||
      (field === 'M' && name === 'PlainTime') ||
      (field === 'd' && ['PlainTime', 'PlainYearMonth'].includes(name)) ||
      (field === 'E' && ['PlainTime', 'PlainYearMonth', 'PlainMonthDay'].includes(name)) ||
      (/[HhmsSa]/.test(field) && ['PlainDate', 'PlainYearMonth', 'PlainMonthDay'].includes(name))
    )
      throw new RangeError(`Token ${token} is incompatible with ${name}`);
  }
}
const pad = (value: number, length = 2): string => String(Math.abs(value)).padStart(length, '0');
export function format(
  value: Temporal.Instant,
  pattern: string,
  context: FormatOptions & { timeZone: string },
): string;
export function format(
  value: Temporal.ZonedDateTime,
  pattern: string,
  context?: FormatOptions,
): string;
export function format(
  value: Exclude<Formattable, Temporal.Instant | Temporal.ZonedDateTime>,
  pattern: string,
  context?: Omit<FormatOptions, 'timeZone'> & { timeZone?: never },
): string;
export function format(value: Formattable, pattern: string, context?: FormatOptions): string {
  options(context, ['locale', 'timeZone']);
  const language = locale(context?.locale),
    parts = tokenize(pattern);
  const name = kind(value, [
    'PlainDate',
    'PlainDateTime',
    'ZonedDateTime',
    'PlainTime',
    'PlainYearMonth',
    'PlainMonthDay',
    'Instant',
  ]);
  if (name === 'Instant')
    value = (value as Temporal.Instant).toZonedDateTimeISO(zone(context?.timeZone));
  else if (context?.timeZone !== undefined) {
    if (name !== 'ZonedDateTime') throw new RangeError('Plain values do not accept a timeZone');
    value = (value as Temporal.ZonedDateTime).withTimeZone(zone(context.timeZone));
  }
  validateTokens(value, parts);
  const fields = value as Temporal.PlainDateTime;
  const text = (unit: 'month' | 'weekday', width: 'short' | 'long'): string => {
    const sample = new Date(
      Date.UTC(
        2000,
        unit === 'month' ? month(value) - 1 : 0,
        unit === 'month' ? 1 : 2 + fields.dayOfWeek,
      ),
    );
    const formatter = new Intl.DateTimeFormat(language, {
      calendar: 'iso8601',
      timeZone: 'UTC',
      day: 'numeric',
      ...(unit === 'month'
        ? { month: width }
        : { weekday: width, month: 'numeric', year: 'numeric' }),
    });
    return formatter.formatToParts(sample).find((part) => part.type === unit)!.value;
  };
  return parts
    .map((part) => {
      if ('literal' in part) return part.literal;
      const token = part.token;
      switch (token) {
        case 'yyyy':
          return pad(fields.year > 0 ? fields.year : 1 - fields.year, 4);
        case 'yy':
          return pad((fields.year > 0 ? fields.year : 1 - fields.year) % 100);
        case 'M':
          return String(month(value));
        case 'MM':
          return pad(month(value));
        case 'MMM':
          return text('month', 'short');
        case 'MMMM':
          return text('month', 'long');
        case 'd':
          return String(fields.day);
        case 'dd':
          return pad(fields.day);
        case 'EEE':
          return text('weekday', 'short');
        case 'EEEE':
          return text('weekday', 'long');
        case 'H':
          return String(fields.hour);
        case 'HH':
          return pad(fields.hour);
        case 'h':
          return String(fields.hour % 12 || 12);
        case 'hh':
          return pad(fields.hour % 12 || 12);
        case 'm':
          return String(fields.minute);
        case 'mm':
          return pad(fields.minute);
        case 's':
          return String(fields.second);
        case 'ss':
          return pad(fields.second);
        case 'SSS':
          return pad(fields.millisecond, 3);
        case 'a': {
          const time = temporal().PlainTime.from({ hour: fields.hour });
          const rendered = time.toLocaleString(language, { hour: 'numeric', hour12: true });
          const sample = new Intl.DateTimeFormat(language, {
            hour: 'numeric',
            hour12: true,
            timeZone: 'UTC',
          }).formatToParts(new Date(Date.UTC(2000, 0, 1, fields.hour)));
          return sample.find((item) => item.type === 'dayPeriod')?.value ?? rendered;
        }
        default: {
          const offset = (value as Temporal.ZonedDateTime).offset.slice(0, 6);
          return offset === '+00:00' ? 'Z' : token === 'XX' ? offset.replace(':', '') : offset;
        }
      }
    })
    .join('');
}
class InputError extends RangeError {}
function fieldFor(token: string): string {
  return (
    {
      y: 'year',
      M: 'month',
      d: 'day',
      H: 'hour',
      h: 'hour',
      m: 'minute',
      s: 'second',
      S: 'millisecond',
      a: 'period',
      X: 'offset',
    } as Record<string, string>
  )[token[0]!]!;
}
function compile(
  pattern: string,
  reference: ParseReference,
  context?: ParseOptions,
): { parts: Part[]; zone?: string } {
  options(context, ['timeZone', 'disambiguation']);
  const name = kind(reference, [
    'PlainDate',
    'PlainDateTime',
    'ZonedDateTime',
    'PlainTime',
    'PlainYearMonth',
    'PlainMonthDay',
    'Instant',
  ]);
  const parts = tokenize(pattern, true);
  validateTokens(reference, parts);
  const used = new Set<string>();
  let twelve = false;
  for (const part of parts)
    if ('token' in part) {
      const field = fieldFor(part.token);
      if (used.has(field)) throw new RangeError(`Duplicate pattern field: ${field}`);
      used.add(field);
      if (part.token[0] === 'h') twelve = true;
    }
  if (twelve !== used.has('period'))
    throw new RangeError('12-hour tokens require a, and a requires a 12-hour token');
  if (
    context?.disambiguation !== undefined &&
    !['compatible', 'earlier', 'later', 'reject'].includes(context.disambiguation)
  )
    throw new RangeError('Invalid disambiguation');
  if (name === 'Instant') return { parts, zone: zone(context?.timeZone) };
  if (context?.timeZone !== undefined)
    throw new RangeError('Only Instant references accept timeZone');
  return {
    parts,
    zone: name === 'ZonedDateTime' ? (reference as Temporal.ZonedDateTime).timeZoneId : undefined,
  };
}
function escaped(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
function read(
  text: string,
  reference: ParseReference,
  compiled: ReturnType<typeof compile>,
  context?: ParseOptions,
): ParseReference {
  if (typeof text !== 'string') throw new TypeError('text must be a string');
  const captures: string[] = [];
  const expression = compiled.parts
    .map((part) => {
      if ('literal' in part) return escaped(part.literal);
      const token = part.token;
      captures.push(token);
      if (token === 'yyyy') return '(\\d{4,6})';
      if (token === 'a') return '(AM|PM)';
      if (token === 'XX') return '(Z|[+-](?:[01]\\d|2[0-3])[0-5]\\d)';
      if (token === 'XXX') return '(Z|[+-](?:[01]\\d|2[0-3]):[0-5]\\d)';
      return token === 'SSS' ? '(\\d{3})' : token.length === 2 ? '(\\d{2})' : '(\\d{1,2})';
    })
    .join('');
  const match = new RegExp(`^${expression}$`).exec(text);
  if (!match || match[0].length !== text.length)
    throw new InputError('Input does not match the pattern');
  if (!captures.length) return reference;
  const name = kind(reference);
  const base = (
    name === 'Instant'
      ? (reference as Temporal.Instant).toZonedDateTimeISO(compiled.zone!)
      : reference
  ) as Temporal.PlainDateTime;
  const values: Record<string, number> = {};
  let offset: string | undefined, period: string | undefined;
  for (let i = 0; i < captures.length; i++) {
    const token = captures[i]!,
      raw = match[i + 1]!,
      field = fieldFor(token);
    if (field === 'offset') offset = raw;
    else if (field === 'period') period = raw;
    else {
      const numeric = Number(raw);
      if (token[0] === 'h' && (numeric < 1 || numeric > 12))
        throw new InputError('12-hour clock values must be between 1 and 12');
      if (field === 'year' && numeric === 0) throw new InputError('Year-of-era must be positive');
      values[field] = numeric;
    }
  }
  if (period) values.hour = (values.hour! % 12) + (period === 'PM' ? 12 : 0);
  const fields = [
    'year',
    'month',
    'day',
    'hour',
    'minute',
    'second',
    'millisecond',
    'microsecond',
    'nanosecond',
  ];
  const defaults: Record<string, number> = {
    month: 1,
    day: 1,
    hour: 0,
    minute: 0,
    second: 0,
    millisecond: 0,
    microsecond: 0,
    nanosecond: 0,
  };
  const firstSpecified = fields.findIndex((field) => values[field] !== undefined);
  const first = firstSpecified === -1 ? fields.length : firstSpecified;
  const available =
    name === 'PlainTime'
      ? fields.slice(3)
      : name === 'PlainMonthDay'
        ? fields.slice(1, 3)
        : name === 'PlainYearMonth'
          ? fields.slice(0, 2)
          : name === 'PlainDate'
            ? fields.slice(0, 3)
            : fields;
  const result: Record<string, number> = {};
  for (const field of available) {
    const original =
      field === 'month' && name === 'PlainMonthDay'
        ? month(reference)
        : (base as unknown as Record<string, number>)[field]!;
    result[field] = values[field] ?? (fields.indexOf(field) > first ? defaults[field]! : original);
  }
  const T = temporal();
  try {
    if (name === 'PlainTime') return T.PlainTime.from(result, { overflow: 'reject' });
    if (name === 'PlainMonthDay')
      return T.PlainMonthDay.from(
        { month: result.month!, day: result.day! },
        { overflow: 'reject' },
      );
    if (name === 'PlainYearMonth') return T.PlainYearMonth.from(result, { overflow: 'reject' });
    if (name === 'PlainDate')
      return T.PlainDate.from(
        { year: result.year!, month: result.month!, day: result.day! },
        { overflow: 'reject' },
      );
    const datetime = T.PlainDateTime.from(
      { ...result, year: result.year!, month: result.month!, day: result.day! },
      { overflow: 'reject' },
    );
    if (name === 'PlainDateTime') return datetime;
    const instant = offset
      ? T.Instant.from(datetime.toString() + offset)
      : datetime
          .toZonedDateTime(compiled.zone!, {
            disambiguation: context?.disambiguation ?? 'compatible',
          })
          .toInstant();
    return name === 'Instant' ? instant : instant.toZonedDateTimeISO(compiled.zone!);
  } catch (error) {
    if (error instanceof RangeError) throw new InputError(error.message, { cause: error });
    throw error;
  }
}
export function parse(
  text: string,
  pattern: string,
  reference: Temporal.PlainDate,
  context?: Omit<ParseOptions, 'timeZone'> & { timeZone?: never },
): Temporal.PlainDate;
export function parse(
  text: string,
  pattern: string,
  reference: Temporal.PlainDateTime,
  context?: Omit<ParseOptions, 'timeZone'> & { timeZone?: never },
): Temporal.PlainDateTime;
export function parse(
  text: string,
  pattern: string,
  reference: Temporal.ZonedDateTime,
  context?: Omit<ParseOptions, 'timeZone'> & { timeZone?: never },
): Temporal.ZonedDateTime;
export function parse(
  text: string,
  pattern: string,
  reference: Temporal.PlainTime,
  context?: Omit<ParseOptions, 'timeZone'> & { timeZone?: never },
): Temporal.PlainTime;
export function parse(
  text: string,
  pattern: string,
  reference: Temporal.PlainYearMonth,
  context?: Omit<ParseOptions, 'timeZone'> & { timeZone?: never },
): Temporal.PlainYearMonth;
export function parse(
  text: string,
  pattern: string,
  reference: Temporal.PlainMonthDay,
  context?: Omit<ParseOptions, 'timeZone'> & { timeZone?: never },
): Temporal.PlainMonthDay;
export function parse(
  text: string,
  pattern: string,
  reference: Temporal.Instant,
  context: ParseOptions & { timeZone: string },
): Temporal.Instant;
export function parse(
  text: string,
  pattern: string,
  reference: ParseReference,
  context?: ParseOptions,
): ParseReference {
  const compiled = compile(pattern, reference, context);
  return read(text, reference, compiled, context);
}
export function tryParse(
  text: string,
  pattern: string,
  reference: Temporal.PlainDate,
  context?: Omit<ParseOptions, 'timeZone'> & { timeZone?: never },
): TryResult<Temporal.PlainDate, RangeError>;
export function tryParse(
  text: string,
  pattern: string,
  reference: Temporal.PlainDateTime,
  context?: Omit<ParseOptions, 'timeZone'> & { timeZone?: never },
): TryResult<Temporal.PlainDateTime, RangeError>;
export function tryParse(
  text: string,
  pattern: string,
  reference: Temporal.ZonedDateTime,
  context?: Omit<ParseOptions, 'timeZone'> & { timeZone?: never },
): TryResult<Temporal.ZonedDateTime, RangeError>;
export function tryParse(
  text: string,
  pattern: string,
  reference: Temporal.PlainTime,
  context?: Omit<ParseOptions, 'timeZone'> & { timeZone?: never },
): TryResult<Temporal.PlainTime, RangeError>;
export function tryParse(
  text: string,
  pattern: string,
  reference: Temporal.PlainYearMonth,
  context?: Omit<ParseOptions, 'timeZone'> & { timeZone?: never },
): TryResult<Temporal.PlainYearMonth, RangeError>;
export function tryParse(
  text: string,
  pattern: string,
  reference: Temporal.PlainMonthDay,
  context?: Omit<ParseOptions, 'timeZone'> & { timeZone?: never },
): TryResult<Temporal.PlainMonthDay, RangeError>;
export function tryParse(
  text: string,
  pattern: string,
  reference: Temporal.Instant,
  context: ParseOptions & { timeZone: string },
): TryResult<Temporal.Instant, RangeError>;
export function tryParse(
  text: string,
  pattern: string,
  reference: ParseReference,
  context?: ParseOptions,
): TryResult<ParseReference, RangeError> {
  const compiled = compile(pattern, reference, context);
  try {
    const result = read(text, reference, compiled, context);
    return [null, result];
  } catch (error) {
    if (error instanceof InputError) return [error, null];
    throw error;
  }
}
export function isMatch(
  text: string,
  pattern: string,
  reference: Temporal.PlainDate,
  context?: Omit<ParseOptions, 'timeZone'> & { timeZone?: never },
): boolean;
export function isMatch(
  text: string,
  pattern: string,
  reference: Temporal.PlainDateTime,
  context?: Omit<ParseOptions, 'timeZone'> & { timeZone?: never },
): boolean;
export function isMatch(
  text: string,
  pattern: string,
  reference: Temporal.ZonedDateTime,
  context?: Omit<ParseOptions, 'timeZone'> & { timeZone?: never },
): boolean;
export function isMatch(
  text: string,
  pattern: string,
  reference: Temporal.PlainTime,
  context?: Omit<ParseOptions, 'timeZone'> & { timeZone?: never },
): boolean;
export function isMatch(
  text: string,
  pattern: string,
  reference: Temporal.PlainYearMonth,
  context?: Omit<ParseOptions, 'timeZone'> & { timeZone?: never },
): boolean;
export function isMatch(
  text: string,
  pattern: string,
  reference: Temporal.PlainMonthDay,
  context?: Omit<ParseOptions, 'timeZone'> & { timeZone?: never },
): boolean;
export function isMatch(
  text: string,
  pattern: string,
  reference: Temporal.Instant,
  context: ParseOptions & { timeZone: string },
): boolean;
export function isMatch(
  text: string,
  pattern: string,
  reference: ParseReference,
  context?: ParseOptions,
): boolean {
  const compiled = compile(pattern, reference, context);
  try {
    read(text, reference, compiled, context);
    return true;
  } catch (error) {
    if (error instanceof InputError) return false;
    throw error;
  }
}
