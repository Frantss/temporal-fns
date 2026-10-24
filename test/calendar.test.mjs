import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as f from '../dist/index.js';
const T = globalThis.Temporal;

test('end boundaries do not construct unnecessary dates outside the supported range', () => {
  const low = T.PlainDate.from('-271821-04-19');
  const high = T.PlainDate.from('+275760-09-13');
  assert.equal(f.endOfMonth(low).toString(), '-271821-04-30');
  assert.equal(f.endOfQuarter(low).toString(), '-271821-06-30');
  assert.equal(f.endOfYear(low).toString(), '-271821-12-31');
  assert.equal(f.endOfWeek(high).toString(), '+275760-09-13');
  assert.equal(f.endOfDay(high.toPlainDateTime()).toString(), '+275760-09-13T23:59:59.999999999');
  assert.throws(() => f.endOfMonth(high), RangeError);
});

test('calendar boundaries preserve kind and nanosecond precision', () => {
  const date = T.PlainDate.from('2026-05-13');
  const expected = {
    startOfWeek: '2026-05-10',
    startOfISOWeek: '2026-05-11',
    startOfMonth: '2026-05-01',
    startOfQuarter: '2026-04-01',
    startOfYear: '2026-01-01',
    endOfWeek: '2026-05-16',
    endOfISOWeek: '2026-05-17',
    endOfMonth: '2026-05-31',
    endOfQuarter: '2026-06-30',
    endOfYear: '2026-12-31',
  };
  for (const [name, result] of Object.entries(expected)) {
    assert.equal(f[name](date).toString(), result);
    const datetime = date.toPlainDateTime('14:24:36');
    assert.equal(
      f[name](datetime).toString(),
      result + (name.startsWith('start') ? 'T00:00:00' : 'T23:59:59.999999999'),
    );
  }
  assert.equal(f.startOfWeek(date, { weekStartsOn: 1 }).toString(), '2026-05-11');
  assert.equal(f.endOfDay(T.PlainTime.from('12:00')).toString(), '23:59:59.999999999');
  assert.throws(() => f.startOfWeek(date, { weekStartsOn: 7 }), RangeError);
  assert.throws(() => f.endOfDay(date), TypeError);
});

test('year/month and month/day utilities retain partial information', () => {
  const value = T.PlainYearMonth.from('2026-05');
  for (const [name, result] of Object.entries({
    startOfYear: '2026-01',
    endOfYear: '2026-12',
    startOfQuarter: '2026-04',
    endOfQuarter: '2026-06',
  }))
    assert.equal(f[name](value).toString(), result);
  assert.equal(f.getQuarter(value), 2);
  assert.equal(f.getQuarter(T.PlainMonthDay.from('12-25')), 4);
  assert.equal(f.isSameMonth(value, T.PlainYearMonth.from('2026-05')), true);
  assert.equal(f.isSameQuarter(value, T.PlainYearMonth.from('2026-06')), true);
  assert.equal(f.isSameYear(value, T.PlainYearMonth.from('2026-12')), true);
  assert.equal(f.getWeeksInMonth(T.PlainYearMonth.from('2026-02')), 4);
  assert.throws(() => f.isSameDay(value, value), TypeError);
  assert.throws(() => f.isSameMonth(value, T.PlainDate.from('2026-05-01')), TypeError);
});

test('zoned boundaries use actual day lengths and earliest valid clock time', () => {
  for (const [date, hours] of [
    ['2026-03-08', 23],
    ['2026-11-01', 25],
  ]) {
    const value = T.ZonedDateTime.from(`${date}T12:00[America/New_York]`);
    const start = value.startOfDay(),
      end = f.endOfDay(value);
    assert.equal(
      end.epochNanoseconds - start.epochNanoseconds,
      BigInt(hours) * 3_600_000_000_000n - 1n,
    );
    assert.equal(f.startOfMonth(value).hour, 0);
  }
  const skippedMidnight = T.ZonedDateTime.from('2018-11-04T12:00[America/Sao_Paulo]');
  assert.equal(f.startOfWeek(skippedMidnight).hour, 1);
  const skippedDate = T.ZonedDateTime.from('2011-12-31T12:00[Pacific/Apia]');
  assert.equal(f.startOfMonth(skippedDate).toPlainDate().toString(), '2011-12-01');
});

test('calendar comparisons normalize zones only when explicitly requested', () => {
  const instant = T.Instant.from('2026-01-01T01:00Z');
  const utc = instant.toZonedDateTimeISO('UTC'),
    ny = instant.toZonedDateTimeISO('America/New_York');
  for (const name of [
    'isSameDay',
    'isSameWeek',
    'isSameISOWeek',
    'isSameMonth',
    'isSameQuarter',
    'isSameYear',
  ]) {
    assert.throws(() => f[name](utc, ny), RangeError);
    assert.equal(f[name](utc, ny, { timeZone: 'UTC' }), true);
    assert.equal(f[name](instant, instant, { timeZone: 'UTC' }), true);
    assert.throws(() => f[name](instant, instant), TypeError);
  }
  assert.equal(
    f.isSameDay(T.PlainDateTime.from('2026-01-01T01:00'), T.PlainDateTime.from('2026-01-01T23:00')),
    true,
  );
  assert.equal(f.isSameWeek(T.PlainDate.from('2025-12-31'), T.PlainDate.from('2026-01-01')), true);
  assert.throws(
    () =>
      f.isSameDay(T.PlainDate.from('2026-01-01'), T.PlainDate.from('2026-01-01'), {
        timeZone: 'UTC',
      }),
    RangeError,
  );
  assert.throws(
    () => f.getQuarter(T.PlainDate.from('2026-01-01').withCalendar('gregory')),
    RangeError,
  );
});

test('configurable weekends affect arithmetic, predicates and differences', () => {
  const thursday = T.PlainDate.from('2026-10-22'),
    custom = { weekendDays: [5, 6] };
  assert.equal(f.addBusinessDays(thursday, 1, custom).toString(), '2026-10-25');
  assert.equal(f.subBusinessDays(thursday, 1, custom).toString(), '2026-10-21');
  assert.equal(f.isWeekend(thursday.add({ days: 1 }), custom), true);
  assert.equal(f.isBusinessDay(thursday.add({ days: 3 }), custom), true);
  assert.equal(f.isWeekend(thursday, { weekendDays: [] }), false);
  assert.equal(f.addBusinessDays(thursday, 10, { weekendDays: [] }).toString(), '2026-11-01');
  assert.equal(f.addBusinessDays(thursday, 0), thursday);
  assert.equal(f.addBusinessDays(thursday, 1, { weekendDays: [5, 5, 6] }).toString(), '2026-10-25');
  assert.equal(f.differenceInBusinessDays(thursday.add({ days: 1 }), thursday), 1);
  assert.equal(f.differenceInBusinessDays(thursday, thursday.add({ days: 1 })), -1);
  assert.equal(f.nextDay(thursday, 4).toString(), '2026-10-29');
  assert.equal(f.previousDay(thursday, 4).toString(), '2026-10-15');
  for (const weekendDays of [[0, 1, 2, 3, 4, 5, 6], [7], [-1], [1.5]])
    assert.throws(() => f.addBusinessDays(thursday, 0, { weekendDays }), RangeError);
  assert.throws(() => f.addBusinessDays(thursday, 1.5), RangeError);
});

test('optimized business arithmetic agrees with day-by-day counting', () => {
  for (const weekendDays of [[], [0, 6], [5, 6], [1, 2, 3, 4, 5, 6]]) {
    const custom = { weekendDays };
    for (let day = 0; day < 7; day++)
      for (let amount = -25; amount <= 25; amount++) {
        const start = T.PlainDate.from('2026-10-18').add({ days: day });
        let expected = start,
          remaining = Math.abs(amount);
        while (remaining) {
          expected = expected.add({ days: Math.sign(amount) });
          if (!weekendDays.includes(expected.dayOfWeek % 7)) remaining--;
        }
        assert.equal(f.addBusinessDays(start, amount, custom).toString(), expected.toString());
      }
  }
  const value = T.ZonedDateTime.from('2026-03-06T12:00[America/New_York]');
  assert.equal(f.addBusinessDays(value, 1).hour, 12);
  assert.equal(f.addBusinessDays(value, 1).offset, '-04:00');
});

test('week numbering handles year boundaries and month grids', () => {
  const iso = { weekStartsOn: 1, firstWeekContainsDate: 4 };
  for (let year = 1990; year <= 2035; year++)
    for (const md of ['01-01', '01-04', '06-15', '12-28', '12-31']) {
      const value = T.PlainDate.from(`${year}-${md}`);
      assert.equal(f.getWeek(value, iso), value.weekOfYear);
      assert.equal(f.getWeekYear(value, iso), value.yearOfWeek);
    }
  assert.equal(f.getWeekYear(T.PlainDate.from('2025-12-31')), 2026);
  assert.equal(f.getWeekOfMonth(T.PlainDate.from('2026-05-31')), 6);
  assert.equal(f.getWeeksInMonth(T.PlainYearMonth.from('2026-05')), 6);
  assert.equal(f.getWeeksInMonth(T.PlainYearMonth.from('2026-02'), { weekStartsOn: 1 }), 5);
  assert.throws(
    () => f.getWeek(T.PlainDate.from('2026-01-01'), { firstWeekContainsDate: 0 }),
    RangeError,
  );
});
