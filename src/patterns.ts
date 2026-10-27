import type { Temporal } from 'temporal-spec';
import { calendarKinds, kind, locale, month, named, options, temporal, zone } from './internal.js';
import { fields, type Fields } from './iso.js';
import type { Parser } from './signatures.js';
import type { FormatOptions, Formattable, ParseOptions, ParseReference } from './types.js';

type Part = { token: string } | { literal: string };
const tokenFields: Record<string, string> = {
  y: 'year',
  M: 'month',
  d: 'day',
  E: 'dayOfWeek',
  H: 'hour',
  h: 'hour',
  m: 'minute',
  s: 'second',
  S: 'millisecond',
  a: 'hour',
  X: 'offset',
};
const formatTokens = 'yyyy yy M MM MMM MMMM d dd EEE EEEE H HH h hh m mm s ss SSS a XX XXX'.split(
  ' ',
);
const formattableKinds = [
  ...calendarKinds,
  'PlainTime',
  'PlainYearMonth',
  'PlainMonthDay',
  'Instant',
] as const;
function tokenize(pattern: string, parsing = false): Part[] {
  if (typeof pattern !== 'string') throw new TypeError('pattern must be a string');
  const expression = /''|'(?:[^']|'')*'|([A-Za-z])\1*|[^A-Za-z']+/gy;
  const parts: Part[] = [];
  while (expression.lastIndex < pattern.length) {
    const match = expression.exec(pattern);
    if (!match) throw new RangeError('Unclosed pattern literal');
    const token = match[0];
    if (!match[1])
      parts.push({
        literal:
          token[0] !== "'"
            ? token
            : token === "''"
              ? "'"
              : token.slice(1, -1).replaceAll("''", "'"),
      });
    else {
      if (
        !formatTokens.includes(token) ||
        (parsing && ['yy', 'MMM', 'MMMM', 'EEE', 'EEEE'].includes(token))
      )
        throw new RangeError(`Unsupported token: ${token}`);
      parts.push({ token });
    }
  }
  return parts;
}
function validateTokens(value: Formattable, parts: Part[]): void {
  const name = kind(value, formattableKinds);
  const missing: Partial<Record<typeof name, RegExp>> = {
    PlainDate: /[HhmsSaX]/,
    PlainDateTime: /X/,
    PlainTime: /[yMdEX]/,
    PlainYearMonth: /[dEHhmsSaX]/,
    PlainMonthDay: /[yEHhmsSaX]/,
  };
  for (const part of parts)
    if ('token' in part && missing[name]?.test(part.token[0]!))
      throw new RangeError(`Token ${part.token} is incompatible with ${name}`);
}
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
    parts = tokenize(pattern),
    name = kind(value, formattableKinds);
  if (name === 'Instant')
    value = (value as Temporal.Instant).toZonedDateTimeISO(zone(context?.timeZone));
  else if (context?.timeZone !== undefined) {
    if (name !== 'ZonedDateTime') throw new RangeError('Plain values do not accept a timeZone');
    value = (value as Temporal.ZonedDateTime).withTimeZone(zone(context.timeZone));
  }
  validateTokens(value, parts);
  const input = value as Temporal.PlainDateTime;
  const text = (unit: 'month' | 'weekday', width: 'short' | 'long'): string =>
    new Intl.DateTimeFormat(language, {
      calendar: 'iso8601',
      timeZone: 'UTC',
      day: 'numeric',
      ...(unit === 'month'
        ? { month: width }
        : { weekday: width, month: 'numeric', year: 'numeric' }),
    })
      .formatToParts(
        new Date(
          Date.UTC(
            2000,
            unit === 'month' ? month(value) - 1 : 0,
            unit === 'month' ? 1 : 2 + input.dayOfWeek,
          ),
        ),
      )
      .find((part) => part.type === unit)!.value;
  return parts
    .map((part) => {
      if ('literal' in part) return part.literal;
      const token = part.token,
        initial = token[0]!;
      if (['MMM', 'MMMM', 'EEE', 'EEEE'].includes(token))
        return text(initial === 'M' ? 'month' : 'weekday', token.length === 3 ? 'short' : 'long');
      if (initial === 'X') {
        const offset = (value as Temporal.ZonedDateTime).offset.slice(0, 6);
        return offset === '+00:00' ? 'Z' : token === 'XX' ? offset.replace(':', '') : offset;
      }
      if (initial === 'a') {
        temporal();
        const sample = new Intl.DateTimeFormat(language, {
          hour: 'numeric',
          hour12: true,
          timeZone: 'UTC',
        }).formatToParts(new Date(Date.UTC(2000, 0, 1, input.hour)));
        return (
          sample.find((item) => item.type === 'dayPeriod')?.value ??
          temporal()
            .PlainTime.from({ hour: input.hour })
            .toLocaleString(language, { hour: 'numeric', hour12: true })
        );
      }
      let amount =
        initial === 'M'
          ? month(value)
          : (input as unknown as Fields)[tokenFields[initial] as keyof Fields];
      if (initial === 'y') amount = input.year > 0 ? input.year : 1 - input.year;
      if (token === 'yy') amount %= 100;
      if (initial === 'h') amount = input.hour % 12 || 12;
      return String(amount).padStart(token.length, '0');
    })
    .join('');
}
class InputError extends RangeError {}
function fieldFor(token: string): string {
  return token === 'a' ? 'period' : tokenFields[token[0]!]!;
}
function compile(
  pattern: string,
  reference: ParseReference,
  context?: ParseOptions,
): { parts: Part[]; zone?: string } {
  options(context, ['timeZone', 'disambiguation']);
  const name = kind(reference, formattableKinds),
    parts = tokenize(pattern, true);
  validateTokens(reference, parts);
  const tokens = parts.flatMap((part) => ('token' in part ? [part.token] : [])),
    used = tokens.map(fieldFor);
  const duplicate = used.find((field, index) => used.indexOf(field) !== index);
  if (duplicate) throw new RangeError(`Duplicate pattern field: ${duplicate}`);
  if (tokens.some((token) => token[0] === 'h') !== used.includes('period'))
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
      if ('literal' in part) return part.literal.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const token = part.token;
      captures.push(token);
      return (
        (
          {
            yyyy: '(\\d{4,6})',
            a: '(AM|PM)',
            XX: '(Z|[+-](?:[01]\\d|2[0-3])[0-5]\\d)',
            XXX: '(Z|[+-](?:[01]\\d|2[0-3]):[0-5]\\d)',
          } as Record<string, string>
        )[token] ?? (token === 'SSS' ? '(\\d{3})' : token.length === 2 ? '(\\d{2})' : '(\\d{1,2})')
      );
    })
    .join('');
  const match = new RegExp(`^${expression}$`).exec(text);
  if (!match || match[0].length !== text.length)
    throw new InputError('Input does not match the pattern');
  if (!captures.length) return reference;
  const name = kind(reference),
    base = (
      name === 'Instant'
        ? (reference as Temporal.Instant).toZonedDateTimeISO(compiled.zone!)
        : reference
    ) as Temporal.PlainDateTime;
  const values: Record<string, number> = {};
  let offset: string | undefined, period: string | undefined;
  captures.forEach((token, index) => {
    const raw = match[index + 1]!,
      field = fieldFor(token),
      numeric = Number(raw);
    if (field === 'offset') offset = raw;
    else if (field === 'period') period = raw;
    else {
      if (token[0] === 'h' && (numeric < 1 || numeric > 12))
        throw new InputError('12-hour clock values must be between 1 and 12');
      if (field === 'year' && numeric === 0) throw new InputError('Year-of-era must be positive');
      values[field] = numeric;
    }
  });
  if (period) values.hour = (values.hour! % 12) + (period === 'PM' ? 12 : 0);
  const first = fields.findIndex((field) => values[field] !== undefined);
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
  const result = Object.fromEntries(
    available.map((field) => [
      field,
      values[field] ??
        (first !== -1 && fields.indexOf(field) > first
          ? field === 'month' || field === 'day'
            ? 1
            : 0
          : field === 'month'
            ? month(base)
            : (base as unknown as Fields)[field]),
    ]),
  );
  const T = temporal();
  try {
    if (name !== 'Instant' && name !== 'ZonedDateTime') {
      const constructor = T[name] as unknown as {
        from(fields: Record<string, number>, options: { overflow: 'reject' }): ParseReference;
      };
      return constructor.from(result, { overflow: 'reject' });
    }
    const datetime = T.PlainDateTime.from(result as unknown as Temporal.PlainDateTimeLike, {
      overflow: 'reject',
    });
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
function parser(mode: 'parse' | 'tryParse' | 'isMatch') {
  return named(
    mode,
    (text: string, pattern: string, reference: ParseReference, context?: ParseOptions) => {
      const compiled = compile(pattern, reference, context);
      try {
        const result = read(text, reference, compiled, context);
        return mode === 'isMatch' ? true : mode === 'tryParse' ? ([null, result] as const) : result;
      } catch (error) {
        if (mode === 'parse' || !(error instanceof InputError)) throw error;
        return mode === 'isMatch' ? false : ([error, null] as const);
      }
    },
  );
}
export const parse = /* @__PURE__ */ parser('parse') as Parser<ParseOptions, 'value'>;
export const tryParse = /* @__PURE__ */ parser('tryParse') as Parser<ParseOptions, 'try'>;
export const isMatch = /* @__PURE__ */ parser('isMatch') as Parser<ParseOptions, boolean>;
