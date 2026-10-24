import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as f from '../dist/index.js';

const T = globalThis.Temporal;
const strings = (values) => values.map((value) => value.toString());

test('selection and intervals preserve identities for all six ordered types', () => {
  const cases = [
    [T.PlainDate, ['2026-10-01', '2026-10-02', '2026-10-03', '2026-10-04']],
    [
      T.PlainDateTime,
      ['2026-10-01T12:00', '2026-10-02T12:00', '2026-10-03T12:00', '2026-10-04T12:00'],
    ],
    [T.PlainYearMonth, ['2026-01', '2026-02', '2026-03', '2026-04']],
    [T.PlainTime, ['10:00', '11:00', '12:00', '13:00']],
    [
      T.Instant,
      ['2026-10-01T00:00Z', '2026-10-02T00:00Z', '2026-10-03T00:00Z', '2026-10-04T00:00Z'],
    ],
    [
      T.ZonedDateTime,
      [
        '2026-10-01T00:00[UTC]',
        '2026-10-02T00:00[UTC]',
        '2026-10-03T00:00[UTC]',
        '2026-10-04T00:00[UTC]',
      ],
    ],
  ];
  for (const [type, inputs] of cases) {
    const [a, b, c, d] = inputs.map((input) => type.from(input));
    const values = Object.freeze([c, a, b]);
    assert.equal(f.min(values), a);
    assert.equal(f.max(values), c);
    assert.equal(f.closestTo(b, [c, a]), c);
    assert.equal(f.closestIndexTo(b, [c, a]), 0);
    assert.equal(f.closestTo(b, []), undefined);
    assert.equal(f.closestIndexTo(b, []), undefined);
    const interval = { start: b, end: c };
    assert.equal(f.isWithinInterval(b, interval), true);
    assert.equal(f.isWithinInterval(c, interval), true);
    assert.equal(f.isWithinInterval(a, interval), false);
    assert.equal(f.clamp(a, interval), b);
    assert.equal(f.clamp(d, interval), c);
    assert.equal(f.clamp(b, interval), b);
    const touching = { start: c, end: d };
    assert.equal(f.areIntervalsOverlapping(interval, touching), false);
    assert.equal(f.areIntervalsOverlapping(interval, touching, { inclusive: true }), true);
    assert.equal(f.areIntervalsOverlapping(interval, { start: b, end: d }), true);
    assert.throws(() => f.isWithinInterval(b, { start: c, end: a }), RangeError);
    assert.throws(() => f.areIntervalsOverlapping(interval, touching, { inclusive: 1 }), TypeError);
  }
  assert.equal(f.min([]), undefined);
  assert.equal(f.max([]), undefined);
});

test('ordering uses exact instants, linear clock time and month precision', () => {
  const early = T.ZonedDateTime.from('2026-10-24T00:00[Asia/Tokyo]');
  const late = T.ZonedDateTime.from('2026-10-23T23:00[America/New_York]');
  assert.equal(f.min([late, early]), early);
  assert.equal(f.max([late, early]), late);
  const target = T.Instant.from('2026-10-23T00:00:00.000000001Z');
  const next = target.add({ nanoseconds: 1 });
  const far = target.add({ nanoseconds: 2 });
  assert.equal(f.closestTo(target, [far, next]), next);
  const midnight = T.PlainTime.from('00:00');
  const almostMidnight = T.PlainTime.from('23:59:59');
  const noon = T.PlainTime.from('12:00');
  assert.equal(f.closestTo(midnight, [almostMidnight, noon]), noon);
  assert.throws(() => f.eachHourOfInterval({ start: almostMidnight, end: midnight }), RangeError);
  const ym1 = new T.PlainYearMonth(2026, 10, 'iso8601', 1);
  const ym2 = new T.PlainYearMonth(2026, 10, 'iso8601', 31);
  assert.equal(f.min([ym2, ym1]), ym2);
  assert.equal(f.closestTo(ym1, [ym2]), ym2);
});

test('mixed kinds, non-ISO calendars and unsupported endpoint types are rejected', () => {
  const date = T.PlainDate.from('2026-10-23');
  const time = T.PlainTime.from('12:00');
  assert.throws(() => f.min([date, time]), TypeError);
  assert.throws(() => f.max([date, date.withCalendar('gregory')]), RangeError);
  assert.throws(() => f.closestTo(time, [date]), TypeError);
  assert.throws(() => f.isWithinInterval(date, { start: date, end: time }), TypeError);
  for (const value of [T.PlainMonthDay.from('10-23'), T.Duration.from('P1D'), new Date(), null]) {
    assert.throws(() => f.min([value]), TypeError);
  }
});

test('date, week, month and weekend sequences emit containing boundaries', () => {
  const interval = { start: T.PlainDate.from('2026-10-23'), end: T.PlainDate.from('2026-10-27') };
  assert.deepEqual(strings(f.eachDayOfInterval(interval, { step: 2 })), [
    '2026-10-23',
    '2026-10-25',
    '2026-10-27',
  ]);
  assert.deepEqual(strings(f.eachWeekOfInterval(interval)), ['2026-10-18', '2026-10-25']);
  assert.deepEqual(strings(f.eachWeekOfInterval(interval, { weekStartsOn: 1 })), [
    '2026-10-19',
    '2026-10-26',
  ]);
  assert.deepEqual(strings(f.eachWeekendOfInterval(interval)), ['2026-10-24', '2026-10-25']);
  assert.deepEqual(strings(f.eachWeekendOfInterval(interval, { weekendDays: [5, 6] })), [
    '2026-10-23',
    '2026-10-24',
  ]);
  assert.deepEqual(f.eachWeekendOfInterval(interval, { weekendDays: [] }), []);
  const monthly = {
    start: T.PlainDateTime.from('2026-10-23T16:30'),
    end: T.PlainDateTime.from('2027-02-03T01:00'),
  };
  assert.deepEqual(strings(f.eachMonthOfInterval(monthly, { step: 2 })), [
    '2026-10-01T00:00:00',
    '2026-12-01T00:00:00',
    '2027-02-01T00:00:00',
  ]);
  assert.deepEqual(
    strings(
      f.eachMonthOfInterval({
        start: T.PlainYearMonth.from('2026-11'),
        end: T.PlainYearMonth.from('2027-02'),
      }),
    ),
    ['2026-11', '2026-12', '2027-01', '2027-02'],
  );
  for (const step of [0, -1, 0.5, Infinity, NaN])
    assert.throws(() => f.eachDayOfInterval(interval, { step }), RangeError);
  assert.throws(() => f.eachWeekOfInterval(interval, { weekStartsOn: 7 }), RangeError);
  assert.throws(
    () => f.eachDayOfInterval({ start: interval.end, end: interval.start }),
    RangeError,
  );
});

test('hour/minute sequences floor starts and stop before a plain clock wraps', () => {
  const fullDay = { start: T.PlainTime.from('00:00'), end: T.PlainTime.from('23:59') };
  assert.deepEqual(strings(f.eachHourOfInterval(fullDay, { step: 25 })), ['00:00:00']);
  assert.deepEqual(strings(f.eachMinuteOfInterval(fullDay, { step: 1441 })), ['00:00:00']);
  assert.deepEqual(
    strings(
      f.eachHourOfInterval(
        { start: T.PlainTime.from('21:25'), end: T.PlainTime.from('23:59') },
        { step: 2 },
      ),
    ),
    ['21:00:00', '23:00:00'],
  );
  assert.deepEqual(
    strings(
      f.eachMinuteOfInterval({
        start: T.PlainTime.from('23:57:30'),
        end: T.PlainTime.from('23:59:59'),
      }),
    ),
    ['23:57:00', '23:58:00', '23:59:00'],
  );
  assert.deepEqual(
    strings(
      f.eachHourOfInterval({
        start: T.PlainDateTime.from('2026-10-23T23:30'),
        end: T.PlainDateTime.from('2026-10-24T01:05'),
      }),
    ),
    ['2026-10-23T23:00:00', '2026-10-24T00:00:00', '2026-10-24T01:00:00'],
  );
});

test('zoned sequences traverse spring gaps, repeated hours and shifted midnights', () => {
  const spring = {
    start: T.ZonedDateTime.from('2026-03-08T00:30[America/New_York]'),
    end: T.ZonedDateTime.from('2026-03-08T04:10[America/New_York]'),
  };
  assert.deepEqual(
    f.eachHourOfInterval(spring).map((value) => value.hour),
    [0, 1, 3, 4],
  );
  const fall = {
    start: T.ZonedDateTime.from('2026-11-01T00:30[America/New_York]'),
    end: T.ZonedDateTime.from('2026-11-01T02:10[America/New_York]'),
  };
  assert.deepEqual(
    f.eachHourOfInterval(fall).map((value) => [value.hour, value.offset]),
    [
      [0, '-04:00'],
      [1, '-04:00'],
      [1, '-05:00'],
      [2, '-05:00'],
    ],
  );
  const midnight = {
    start: T.ZonedDateTime.from('2018-11-03T12:00[America/Sao_Paulo]'),
    end: T.ZonedDateTime.from('2018-11-05T12:00[America/Sao_Paulo]'),
  };
  assert.deepEqual(
    f.eachDayOfInterval(midnight).map((value) => [value.day, value.hour]),
    [
      [3, 0],
      [4, 1],
      [5, 0],
    ],
  );
  assert.throws(
    () => f.eachHourOfInterval({ start: fall.start, end: fall.end.withTimeZone('UTC') }),
    RangeError,
  );
});

test('distance and iteration work at the supported Temporal range edges', () => {
  const low = T.PlainDateTime.from('-271821-04-19T00:00:00.000000001');
  const high = T.PlainDateTime.from('+275760-09-13T23:59:59.999999999');
  assert.equal(f.closestTo(low, [high, low]), low);
  assert.equal(f.closestTo(high, [low, high]), high);
  const end = T.PlainDate.from('+275760-09-13');
  assert.deepEqual(strings(f.eachDayOfInterval({ start: end.subtract({ days: 1 }), end })), [
    '+275760-09-12',
    '+275760-09-13',
  ]);
  assert.ok(f.getWeek(low, { weekStartsOn: 1, firstWeekContainsDate: 4 }) >= 1);
  assert.ok(f.getWeeksInMonth(T.PlainYearMonth.from('+275760-09')) >= 4);
});
