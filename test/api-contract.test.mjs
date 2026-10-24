import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as f from '../dist/index.js';
import { toCalendarDate } from '../dist/calendar.js';

const T = globalThis.Temporal;
const values = {
  PlainDate: T.PlainDate.from('2026-10-23'),
  PlainDateTime: T.PlainDateTime.from('2026-10-23T12:34:56.123456789'),
  ZonedDateTime: T.ZonedDateTime.from('2026-10-23T12:34:56.123456789[America/Montevideo]'),
  PlainYearMonth: T.PlainYearMonth.from('2026-10'),
  PlainMonthDay: T.PlainMonthDay.from('10-23'),
  PlainTime: T.PlainTime.from('12:34:56.123456789'),
  Instant: T.Instant.from('2026-10-23T12:34:56.123456789Z'),
  Duration: T.Duration.from('P1DT2H'),
};
const calendar = ['PlainDate', 'PlainDateTime', 'ZonedDateTime'];
const months = [...calendar, 'PlainYearMonth'];
const ordered = [...months, 'PlainTime', 'Instant'];
const clock = ['PlainTime', 'PlainDateTime', 'ZonedDateTime'];
const relative = [...calendar, 'Instant'];
const tag = (value) => Object.prototype.toString.call(value);

test('every boundary and query accepts exactly the proposal types and preserves kind', () => {
  const groups = [
    [
      ['startOfWeek', 'startOfISOWeek', 'startOfMonth', 'endOfWeek', 'endOfISOWeek', 'endOfMonth'],
      calendar,
      'value',
    ],
    [['startOfQuarter', 'startOfYear', 'endOfQuarter', 'endOfYear'], months, 'value'],
    [['endOfDay'], clock, 'value'],
    [['isWeekend', 'isBusinessDay', 'getWeek', 'getWeekYear', 'getWeekOfMonth'], calendar, 'query'],
    [['getWeeksInMonth'], months, 'query'],
    [['getQuarter'], [...months, 'PlainMonthDay'], 'query'],
  ];
  for (const [names, supported, returnType] of groups)
    for (const name of names) {
      for (const [kind, value] of Object.entries(values)) {
        if (!supported.includes(kind))
          assert.throws(() => f[name](value), TypeError, `${name} rejects ${kind}`);
        else {
          const before = value.toString();
          const result = f[name](value);
          if (returnType === 'value') assert.equal(tag(result), tag(value), `${name}: ${kind}`);
          assert.equal(value.toString(), before);
        }
      }
    }
});

test('every comparison and selector enforces the proposal type coverage', () => {
  for (const name of [
    'isSameDay',
    'isSameWeek',
    'isSameISOWeek',
    'isSameMonth',
    'isSameQuarter',
    'isSameYear',
  ]) {
    const supported =
      name === 'isSameDay' || name.includes('Week') ? relative : [...relative, 'PlainYearMonth'];
    for (const [kind, value] of Object.entries(values)) {
      const context = kind === 'Instant' ? { timeZone: 'UTC' } : undefined;
      if (supported.includes(kind)) assert.equal(f[name](value, value, context), true);
      else assert.throws(() => f[name](value, value, context), TypeError);
    }
  }
  for (const [kind, value] of Object.entries(values)) {
    const operations = [
      () => f.min([value]),
      () => f.max([value]),
      () => f.closestTo(value, [value]),
      () => f.closestIndexTo(value, [value]),
      () => f.isWithinInterval(value, { start: value, end: value }),
      () => f.clamp(value, { start: value, end: value }),
      () =>
        f.areIntervalsOverlapping(
          { start: value, end: value },
          { start: value, end: value },
          { inclusive: true },
        ),
    ];
    for (const operation of operations) {
      if (ordered.includes(kind)) assert.notEqual(operation(), undefined);
      else assert.throws(operation, TypeError);
    }
  }
});

test('every sequence supports exactly its proposed endpoint kinds', () => {
  const groups = [
    ['eachDayOfInterval', calendar],
    ['eachWeekOfInterval', calendar],
    ['eachMonthOfInterval', months],
    ['eachWeekendOfInterval', calendar],
    ['eachHourOfInterval', clock],
    ['eachMinuteOfInterval', clock],
  ];
  for (const [name, supported] of groups)
    for (const [kind, value] of Object.entries(values)) {
      const interval = { start: value, end: value };
      if (!supported.includes(kind)) assert.throws(() => f[name](interval), TypeError);
      else {
        const result = f[name](interval);
        assert.ok(Array.isArray(result));
        for (const item of result) assert.equal(tag(item), tag(value));
        if (name !== 'eachWeekendOfInterval') assert.equal(result.length, 1);
      }
    }
});

test('relative descriptions, business arithmetic and adapters enforce their type subsets', () => {
  for (const [kind, value] of Object.entries(values)) {
    for (const name of ['formatDistance', 'formatDistanceStrict', 'formatRelative']) {
      const run = () => f[name](value, value, kind === 'Instant' ? { timeZone: 'UTC' } : undefined);
      if (relative.includes(kind)) assert.equal(typeof run(), 'string');
      else assert.throws(run, TypeError);
    }
    for (const name of ['formatDistanceToNow', 'formatDistanceToNowStrict']) {
      const run = () => f[name](value, { timeZone: 'UTC' });
      if (relative.includes(kind)) assert.equal(typeof run(), 'string');
      else assert.throws(run, TypeError);
    }
    for (const run of [
      () => f.addBusinessDays(value, 1),
      () => f.subBusinessDays(value, 1),
      () => f.nextDay(value, 1),
      () => f.previousDay(value, 1),
    ]) {
      if (calendar.includes(kind)) assert.equal(tag(run()), tag(value));
      else assert.throws(run, TypeError);
    }
    if (calendar.includes(kind)) {
      assert.equal(f.differenceInBusinessDays(value, value), 0);
      const rounded = kind === 'PlainDate' ? value : value.with({ microsecond: 0, nanosecond: 0 });
      assert.ok(toCalendarDate(rounded) instanceof Date);
    } else {
      assert.throws(() => f.differenceInBusinessDays(value, value), TypeError);
      assert.throws(() => toCalendarDate(value), TypeError);
    }
  }
});

test('week numbering honors every combination of week-start and first-week settings', () => {
  const start = (date, weekStartsOn) =>
    date.subtract({ days: ((date.dayOfWeek % 7) - weekStartsOn + 7) % 7 });
  for (const year of [1999, 2000, 2001, 2026])
    for (const month of [1, 12])
      for (const day of [1, 4, 7, 25, 28, 31]) {
        const date = T.PlainDate.from({ year, month, day });
        for (let weekStartsOn = 0; weekStartsOn < 7; weekStartsOn++)
          for (let firstWeekContainsDate = 1; firstWeekContainsDate <= 7; firstWeekContainsDate++) {
            const options = { weekStartsOn, firstWeekContainsDate };
            let weekYear = year;
            let first = start(
              T.PlainDate.from({ year, month: 1, day: firstWeekContainsDate }),
              weekStartsOn,
            );
            const next = start(
              T.PlainDate.from({ year: year + 1, month: 1, day: firstWeekContainsDate }),
              weekStartsOn,
            );
            if (T.PlainDate.compare(date, first) < 0) {
              weekYear--;
              first = start(
                T.PlainDate.from({ year: weekYear, month: 1, day: firstWeekContainsDate }),
                weekStartsOn,
              );
            } else if (T.PlainDate.compare(date, next) >= 0) {
              weekYear++;
              first = next;
            }
            assert.equal(f.getWeekYear(date, options), weekYear);
            assert.equal(f.getWeek(date, options), Math.floor(first.until(date).days / 7) + 1);
          }
      }
});

test('zoned business-day arithmetic agrees with walking only dates that exist', () => {
  for (const [zone, anchor] of [
    ['Pacific/Apia', '2011-12-26'],
    ['Pacific/Kiritimati', '1994-12-27'],
    ['Pacific/Kwajalein', '1993-08-17'],
    ['America/New_York', '2026-03-02'],
  ]) {
    for (const weekendDays of [[0, 6], [0], [], [0, 1, 2, 3, 4, 6]]) {
      const excluded = new Set(weekendDays);
      for (const amount of [-30, -10, -1, 1, 10, 30]) {
        const value = T.ZonedDateTime.from(`${anchor}T12:34:56.123456789[${zone}]`);
        let date = value.toPlainDate(),
          remaining = Math.abs(amount);
        const direction = Math.sign(amount);
        while (remaining) {
          date = date.add({ days: direction });
          const exists = date.toZonedDateTime(zone).toPlainDate().equals(date);
          if (exists && !excluded.has(date.dayOfWeek % 7)) remaining--;
        }
        const result = f.addBusinessDays(value, amount, { weekendDays });
        assert.ok(result.toPlainDate().equals(date), `${zone}, ${amount}, weekend=${weekendDays}`);
        assert.ok(result.toPlainTime().equals(value.toPlainTime()));
        const earlier =
          T.PlainDate.compare(value.toPlainDate(), date) < 0 ? value.toPlainDate() : date;
        const later = earlier.equals(date) ? value.toPlainDate() : date;
        let count = 0;
        for (
          let current = earlier;
          T.PlainDate.compare(current, later) < 0;
          current = current.add({ days: 1 })
        ) {
          if (
            !excluded.has(current.dayOfWeek % 7) &&
            current.toZonedDateTime(zone).toPlainDate().equals(current)
          )
            count++;
        }
        assert.equal(f.differenceInBusinessDays(result, value, { weekendDays }), direction * count);
      }
    }
  }
});
