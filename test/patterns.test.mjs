import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  format,
  parse,
  tryParse,
  isMatch,
  formatDuration,
  parseDuration,
  tryParseDuration,
} from '../dist/index.js';

const T = globalThis.Temporal;
const reference = T.PlainDate.from('2000-07-19');

test('year tokens use year-of-era semantics, while native ISO strings retain signed years', () => {
  assert.equal(format(T.PlainDate.from('0000-01-01'), 'yyyy yy'), '0001 01');
  assert.equal(format(T.PlainDate.from('-000001-01-01'), 'yyyy yy'), '0002 02');
  assert.equal(format(T.PlainDate.from('+012345-01-01'), 'yyyy yy'), '12345 45');
  assert.equal(tryParse('0000', 'yyyy', reference)[1], null);
  assert.equal(tryParse('-000001', 'yyyy', reference)[1], null);
});

test('formatting and parsing preserve all seven point/partial types', () => {
  const cases = [
    [T.PlainDate.from('2024-02-29'), 'yyyy-MM-dd', '2024-02-29', undefined],
    [
      T.PlainDateTime.from('2024-02-29T23:15:16.123'),
      "yyyy-MM-dd'T'HH:mm:ss.SSS",
      '2024-02-29T23:15:16.123',
      undefined,
    ],
    [T.PlainTime.from('23:15:16.123'), 'HH:mm:ss.SSS', '23:15:16.123', undefined],
    [T.PlainYearMonth.from('2024-02'), 'MM/yyyy', '02/2024', undefined],
    [T.PlainMonthDay.from('02-29'), 'MM/dd', '02/29', undefined],
    [
      T.Instant.from('2024-02-29T23:15:16.123Z'),
      "yyyy-MM-dd'T'HH:mm:ss.SSSXXX",
      '2024-02-29T20:15:16.123-03:00',
      { timeZone: 'America/Montevideo' },
    ],
    [
      T.ZonedDateTime.from('2024-02-29T20:15:16.123-03:00[America/Montevideo]'),
      "yyyy-MM-dd'T'HH:mm:ss.SSSXXX",
      '2024-02-29T20:15:16.123-03:00',
      undefined,
    ],
  ];
  for (const [value, pattern, text, options] of cases) {
    assert.equal(format(value, pattern, options), text);
    assert.ok(parse(text, pattern, value, options).equals(value));
    const [error, result] = tryParse(text, pattern, value, options);
    assert.equal(error, null);
    assert.ok(result.equals(value));
    assert.equal(isMatch(text, pattern, value, options), true);
  }
});

test('tokens, literals, locale labels and missing information', () => {
  const date = T.PlainDateTime.from('2026-10-23T12:03:04.005');
  assert.equal(
    format(date, "EEEE, MMMM d, yyyy 'at' h:mm a"),
    'Friday, October 23, 2026 at 12:03 PM',
  );
  assert.equal(
    format(date, 'yy M MM d dd EEE H HH h hh m mm s ss SSS'),
    '26 10 10 23 23 Fri 12 12 12 12 3 03 4 04 005',
  );
  assert.equal(format(date, "'it''s' HH:mm"), "it's 12:03");
  assert.equal(format(T.PlainMonthDay.from('02-29'), 'MMMM d'), 'February 29');
  assert.equal(format(T.PlainYearMonth.from('2026-10'), 'MMMM yyyy'), 'October 2026');
  assert.equal(
    format(T.PlainDate.from('2026-10-23'), 'MMMM', { locale: 'es-UY' }).toLowerCase(),
    'octubre',
  );
  for (const pattern of ['YYYY', 'yyyy Q', "yyyy'"])
    assert.throws(() => format(date, pattern), RangeError);
  assert.throws(() => format(T.PlainTime.from('12:00'), 'yyyy'), RangeError);
  assert.throws(() => format(T.PlainMonthDay.from('02-29'), 'EEE'), RangeError);
  assert.throws(() => format(reference, 'HH'), RangeError);
  assert.throws(() => format(T.Instant.fromEpochMilliseconds(0), 'yyyy'), TypeError);
  assert.throws(() => format(reference, 'yyyy', { timeZone: 'UTC' }), RangeError);
  assert.throws(() => format(reference, 'yyyy', { locale: 'invalid_locale' }), RangeError);
});

test('input failures are tuples, while programmer errors still throw', () => {
  for (const input of [
    '02/29/2025',
    '13/01/2024',
    '00/00/2024',
    '02/29/2024\n',
    ' 02/29/2024',
    'not a date',
  ]) {
    assert.throws(() => parse(input, 'MM/dd/yyyy', reference), RangeError);
    const [error, result] = tryParse(input, 'MM/dd/yyyy', reference);
    assert.ok(error instanceof RangeError);
    assert.equal(result, null);
    assert.equal(isMatch(input, 'MM/dd/yyyy', reference), false);
  }
  for (const fn of [parse, tryParse, isMatch]) {
    assert.throws(() => fn('2026', 'YYYY', reference), RangeError);
    assert.throws(() => fn('12', 'HH', reference), RangeError);
    assert.throws(() => fn('2026', 'yyyy yyyy', reference), RangeError);
    assert.throws(() => fn('2026', 'yyyy', reference, { disambiguation: 'invalid' }), RangeError);
    assert.throws(() => fn('2026', 'yyyy', reference, { timeZone: 'UTC' }), RangeError);
  }
  assert.equal(tryParse('2026x02x28', 'yyyy.MM.dd', reference)[1], null);
  assert.equal(parse('2026.[02]', 'yyyy.[MM]', reference).toString(), '2026-02-01');
  assert.equal(parse("2026 o'clock", "yyyy 'o''clock'", reference).toString(), '2026-01-01');
  assert.ok(parse('literal', "'literal'", reference).equals(reference));
});

test('partial patterns retain higher fields and reset lower fields', () => {
  assert.equal(parse('2026', 'yyyy', reference).toString(), '2026-01-01');
  assert.equal(parse('02', 'MM', reference).toString(), '2000-02-01');
  assert.equal(parse('05', 'dd', reference).toString(), '2000-07-05');
  const time = T.PlainTime.from('21:34:56.123456789');
  assert.equal(parse('08', 'HH', time).toString(), '08:00:00');
  assert.equal(parse('15', 'mm', time).toString(), '21:15:00');
  assert.equal(parse('2026', 'yyyy', T.PlainYearMonth.from('2000-06')).toString(), '2026-01');
  assert.equal(parse('02/29', 'MM/dd', T.PlainMonthDay.from('12-25')).toString(), '02-29');
  assert.equal(parse('12:00 AM', 'hh:mm a', time).hour, 0);
  assert.equal(parse('12:00 PM', 'hh:mm a', time).hour, 12);
  assert.equal(tryParse('00:00 AM', 'hh:mm a', time)[1], null);
  assert.equal(tryParse('24:00', 'HH:mm', time)[1], null);
  assert.throws(() => tryParse('12', 'hh', time), RangeError);
  assert.throws(() => tryParse('12 AM', 'HH a', time), RangeError);
});

test('offset parsing and DST disambiguation remain explicit', () => {
  const offsetReference = T.Instant.from('2026-10-23T12:34:56.123456789Z');
  assert.equal(
    parse('+01:00', 'XXX', offsetReference, { timeZone: 'UTC' }).toString(),
    '2026-10-23T11:34:56.123456789Z',
  );
  const zoned = T.ZonedDateTime.from('2026-01-01T12:00[America/New_York]');
  assert.equal(parse('2026-03-08 02:30', 'yyyy-MM-dd HH:mm', zoned).hour, 3);
  assert.equal(
    tryParse('2026-03-08 02:30', 'yyyy-MM-dd HH:mm', zoned, { disambiguation: 'reject' })[1],
    null,
  );
  const early = parse('2026-11-01 01:30', 'yyyy-MM-dd HH:mm', zoned, { disambiguation: 'earlier' });
  const late = parse('2026-11-01 01:30', 'yyyy-MM-dd HH:mm', zoned, { disambiguation: 'later' });
  assert.equal(late.epochNanoseconds - early.epochNanoseconds, 3_600_000_000_000n);
  assert.equal(parse('2026-11-01T01:30-0500', "yyyy-MM-dd'T'HH:mmXX", zoned).offset, '-05:00');
  const instant = T.Instant.fromEpochMilliseconds(0);
  assert.equal(
    parse('2026-10-23 12:00', 'yyyy-MM-dd HH:mm', instant, {
      timeZone: 'America/Montevideo',
    }).toString(),
    '2026-10-23T15:00:00Z',
  );
  assert.throws(() => tryParse('2026', 'yyyy', instant, { timeZone: 'Not/AZone' }), RangeError);
});

test('human duration text preserves components and error tuples', () => {
  const value = parseDuration('25h 30m 1ns');
  assert.equal(value.hours, 25);
  assert.equal(value.minutes, 30);
  assert.equal(value.nanoseconds, 1);
  assert.equal(formatDuration(value, { format: ['hours', 'minutes'] }), '25 hours 30 minutes');
  assert.equal(
    formatDuration(parseDuration('-1 day 2 hours'), { format: ['days', 'hours'] }),
    '-1 day 2 hours',
  );
  assert.equal(
    formatDuration(T.Duration.from({ minutes: 90 }), {
      format: ['hours', 'minutes'],
      zero: true,
      delimiter: ', ',
    }),
    '0 hours, 90 minutes',
  );
  assert.equal(formatDuration(new T.Duration(), { format: ['hours', 'minutes'] }), '0 minutes');
  assert.equal(parseDuration('+2 YEARS 1mo 3w 4d 5h 6m 7s 8ms 9us 10ns').years, 2);
  const [error, result] = tryParseDuration('1h 30m');
  assert.equal(error, null);
  assert.equal(result.minutes, 30);
  for (const input of [
    '',
    'P1D',
    '1h30m',
    '1.5h',
    '1h -2m',
    '1h 1hour',
    '1bad',
    '999999999999999999999h',
  ]) {
    assert.throws(() => parseDuration(input), RangeError);
    const [failure, empty] = tryParseDuration(input);
    assert.ok(failure instanceof RangeError);
    assert.equal(empty, null);
  }
  assert.throws(() => formatDuration(value, { format: [] }), RangeError);
  assert.throws(() => formatDuration(value, { format: ['hours', 'hours'] }), RangeError);
  assert.throws(() => formatDuration(value, { locale: 'es' }), RangeError);
});
