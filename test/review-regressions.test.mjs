import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as f from '../dist/index.js';

const T = globalThis.Temporal;

test('month and weekday tokens use grammatical formatting forms for the locale', () => {
  const date = T.PlainDate.from('2026-05-23');
  assert.equal(f.format(date, 'd MMMM', { locale: 'ru' }), '23 мая');
  assert.equal(f.format(date, 'd MMMM', { locale: 'fi' }), '23 toukokuuta');
  assert.equal(f.format(date, 'EEEE', { locale: 'fi' }), 'lauantaina');
  assert.equal(f.format(T.PlainYearMonth.from('2026-05'), 'MMMM', { locale: 'ru' }), 'мая');
  assert.equal(
    f.format(T.PlainMonthDay.from('05-23'), 'd MMMM', { locale: 'fi' }),
    '23 toukokuuta',
  );
});

test('a range with no working dates returns zero in both directions', () => {
  const saturday = T.PlainDate.from('2026-10-24');
  const sunday = saturday.add({ days: 1 });
  assert.equal(f.differenceInBusinessDays(sunday, saturday), 0);
  assert.equal(f.differenceInBusinessDays(saturday, sunday), 0);
});

test('week comparisons work even when the week starts outside Temporal range', () => {
  const low = T.PlainDate.from('-271821-04-19');
  const next = low.add({ days: 1 });
  for (let weekStartsOn = 0; weekStartsOn < 7; weekStartsOn++) {
    assert.equal(f.isSameWeek(low, low, { weekStartsOn }), true);
    assert.equal(f.isSameWeek(low, next, { weekStartsOn }), next.dayOfWeek % 7 !== weekStartsOn);
  }
  assert.equal(f.isSameISOWeek(low, low), true);
  assert.equal(f.isSameWeek(low.toPlainDateTime('12:00'), next.toPlainDateTime('23:00')), true);
});

test('unknown duration units remain input errors, including object prototype names', () => {
  for (const text of ['1 constructor', '1 toString', '1 valueOf', '1 hasOwnProperty']) {
    assert.throws(() => f.parseDuration(text), RangeError);
    const [error, value] = f.tryParseDuration(text);
    assert.ok(error instanceof RangeError);
    assert.equal(value, null);
  }
});

test('large exact duration fields round-trip without scientific notation or precision loss', () => {
  for (const number of [10_000_000_000_000_000, 1e21, 1e23]) {
    const duration = T.Duration.from({ nanoseconds: number });
    const text = `${BigInt(number)} nanoseconds`;
    assert.equal(f.formatDuration(duration, { format: ['nanoseconds'] }), text);
    assert.equal(f.parseDuration(text).nanoseconds, number);
    assert.equal(f.parseDuration('-' + text).nanoseconds, -number);
  }
  const [error, value] = f.tryParseDuration('9007199254740993ns');
  assert.ok(error instanceof RangeError);
  assert.equal(value, null);
});

test('forwarding options retains inherited properties and validates their values', () => {
  const instant = T.Instant.from('2026-10-23T12:00Z');
  assert.equal(f.isSameISOWeek(instant, instant, Object.create({ timeZone: 'UTC' })), true);
  const zoned = instant.toZonedDateTimeISO('UTC');
  for (const fn of [f.formatDistanceToNow, f.formatDistanceToNowStrict]) {
    assert.throws(() => fn(zoned, Object.create({ locale: 'fr' })), RangeError);
  }
});

test('fixed-unit relative distances do not need representable year boundaries', () => {
  const date = T.PlainDate.from('-271821-04-19');
  const high = T.PlainDate.from('+275760-09-13');
  assert.equal(f.formatDistanceStrict(high, date, { unit: 'day' }), '200000001 days');
  assert.equal(f.formatDistanceStrict(high, date, { unit: 'hour' }), '4800000024 hours');
  const datetime = T.PlainDateTime.from('-271821-04-19T00:00:00.000000001');
  assert.equal(
    f.formatDistanceStrict(datetime.add({ hours: 48 }), datetime, { unit: 'hour' }),
    '48 hours',
  );
  assert.equal(f.formatDistanceStrict(date, date, { unit: 'month' }), '0 months');
  assert.equal(f.formatDistanceStrict(datetime, datetime, { unit: 'year' }), '0 years');
});

test('relative distances agree with native totals for ordinary calendar and DST cases', () => {
  for (const text of [
    '2024-02-29T23:30',
    '2026-01-31T23:30',
    '2026-03-07T23:30',
    '2026-10-31T23:30',
  ]) {
    const plain = T.PlainDateTime.from(text);
    for (const base of [plain.toPlainDate(), plain, plain.toZonedDateTime('America/New_York')]) {
      for (const days of [-400, -45, -1, 1, 45, 400]) {
        const value = base.add({ days });
        const duration = base.until(value, { largestUnit: 'year' });
        const relativeTo = base instanceof T.PlainDateTime ? base.toPlainDate() : base;
        for (const unit of ['second', 'minute', 'hour', 'day', 'month', 'year']) {
          const expected = Math.round(Math.abs(duration.total({ unit, relativeTo })));
          assert.equal(
            f.formatDistanceStrict(value, base, { unit }),
            `${expected} ${unit}${expected === 1 ? '' : 's'}`,
          );
        }
      }
    }
  }
});

test('invalid options are rejected instead of treated as missing values', () => {
  const date = T.PlainDate.from('2026-10-23');
  const zoned = date.toZonedDateTime('UTC');
  const interval = { start: date, end: date };
  for (const fn of [f.startOfWeek, f.endOfWeek, f.getWeekOfMonth, f.getWeeksInMonth]) {
    assert.throws(() => fn(date, { weekStartsOn: null }), RangeError);
  }
  for (const fn of [f.getWeek, f.getWeekYear]) {
    assert.throws(() => fn(date, { firstWeekContainsDate: null }), RangeError);
  }
  for (const fn of [f.eachDayOfInterval, f.eachWeekOfInterval, f.eachMonthOfInterval]) {
    assert.throws(() => fn(interval, { step: null }), RangeError);
  }
  for (const fn of [f.formatDistanceToNow, f.formatDistanceToNowStrict]) {
    assert.throws(() => fn(zoned, { timeZone: null }), TypeError);
  }
  assert.throws(() => f.formatDuration(T.Duration.from('PT1H'), { format: null }), RangeError);
  assert.throws(() => f.formatDuration(T.Duration.from('PT1H'), { format: Array(1) }), RangeError);
  assert.throws(() => f.isWeekend(date, { weekendDays: Array(1) }), RangeError);
  assert.throws(() => f.addBusinessDays(date, 0, { weekendDays: Array(1) }), RangeError);
});

test('business arithmetic skips dates that never occurred in its zone', () => {
  const thursday = T.ZonedDateTime.from('2011-12-29T12:34:56.123456789[Pacific/Apia]');
  const saturday = T.ZonedDateTime.from('2011-12-31T12:34:56.123456789[Pacific/Apia]');
  const monday = T.ZonedDateTime.from('2012-01-02T12:34:56.123456789[Pacific/Apia]');
  assert.ok(f.addBusinessDays(thursday, 1).equals(monday));
  assert.ok(f.subBusinessDays(monday, 1).equals(thursday));
  assert.ok(f.addBusinessDays(thursday, 1, { weekendDays: [] }).equals(saturday));
  assert.ok(f.subBusinessDays(saturday, 1, { weekendDays: [] }).equals(thursday));
  assert.equal(f.differenceInBusinessDays(monday, thursday), 1);
  assert.equal(f.differenceInBusinessDays(thursday, monday), -1);
  assert.equal(f.differenceInBusinessDays(saturday, thursday, { weekendDays: [] }), 1);
  for (const amount of [-10, -5, -1, 1, 5, 10]) {
    const result = f.addBusinessDays(thursday, amount);
    assert.equal(f.isBusinessDay(result), true);
    assert.ok(f.addBusinessDays(result, -amount).equals(thursday));
    assert.ok(result.toPlainTime().equals(thursday.toPlainTime()));
  }
});

test('weekday navigation returns the requested weekday when an occurrence was skipped', () => {
  const thursday = T.ZonedDateTime.from('2011-12-29T12:00[Pacific/Apia]');
  const saturday = T.ZonedDateTime.from('2011-12-31T12:00[Pacific/Apia]');
  assert.equal(f.nextDay(thursday, 5).toPlainDate().toString(), '2012-01-06');
  assert.equal(f.previousDay(saturday, 5).toPlainDate().toString(), '2011-12-23');
});
