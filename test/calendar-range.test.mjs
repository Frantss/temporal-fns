import { test } from 'node:test';
import assert from 'node:assert/strict';
import { calendarTotal } from '../dist/calendar-total.js';
import {
  formatDistance,
  formatDistanceStrict,
  formatDistanceToNow,
  formatDistanceToNowStrict,
} from '../dist/index.js';

const T = globalThis.Temporal;
const min = T.Instant.fromEpochNanoseconds(-8_640_000_000_000_000_000_000n);
const max = T.Instant.fromEpochNanoseconds(8_640_000_000_000_000_000_000n);
const roundingMethods = ['floor', 'ceil', 'round', 'trunc'];
const units = ['month', 'year'];
const label = (count, unit) => `${count} ${unit}${count === 1 ? '' : 's'}`;
function nativeTotal(value, base, unit) {
  const duration = base.until(value, { largestUnit: 'year' });
  const relativeTo = base instanceof T.PlainDateTime ? base.toPlainDate() : base;
  return duration.total({ unit, relativeTo });
}

test('virtual calendar fractions agree with native totals for month ends, leap years and DST', () => {
  const samples = [
    '-000001-01-31T23:59:59.123456789',
    '0000-02-29T12:30',
    '0099-12-31T12:30',
    '2000-02-29T23:59:59.123456789',
    '2024-01-31T12:30',
    '2026-03-08T01:30',
    '2026-11-01T01:30',
  ];
  for (const text of samples) {
    const plain = T.PlainDateTime.from(text);
    for (const base of [
      plain.toPlainDate(),
      plain,
      ...['America/New_York', 'Australia/Lord_Howe', 'Pacific/Apia'].map((zone) =>
        plain.toZonedDateTime(zone),
      ),
    ]) {
      for (const duration of [
        { days: 15 },
        { days: -15 },
        { months: 1, days: 5 },
        { months: -1, days: -5 },
        { years: 1, months: 1 },
        { years: -1, months: -1 },
        { years: 4, days: 1 },
      ]) {
        const value = base.add(duration);
        for (const unit of units) {
          const actual = calendarTotal(value, base, unit),
            expected = nativeTotal(value, base, unit);
          assert.ok(
            Math.abs(actual - expected) <= Number.EPSILON * Math.max(1, Math.abs(expected)) * 2,
            `${base} -> ${value}, ${unit}: ${actual} !== ${expected}`,
          );
          for (const rounding of roundingMethods)
            assert.equal(Math[rounding](Math.abs(actual)), Math[rounding](Math.abs(expected)));
        }
      }
    }
  }
});

test('full-range totals preserve rounding, direction and suffixes for all four relative kinds', () => {
  const pairs = [
    [T.PlainDate.from('-271821-04-19'), T.PlainDate.from('+275760-09-13'), undefined],
    [
      T.PlainDateTime.from('-271821-04-19T00:00:00.000000001'),
      T.PlainDateTime.from('+275760-09-13T23:59:59.999999999'),
      undefined,
    ],
    [min, max, { timeZone: 'UTC' }],
    ...['UTC', '+23:59', '-23:59', 'Etc/UTC', 'Etc/GMT', 'GMT'].map((zone) => [
      min.toZonedDateTimeISO(zone),
      max.toZonedDateTimeISO(zone),
      undefined,
    ]),
  ];
  for (const [earlier, later, context] of pairs) {
    for (const [value, base, direction] of [
      [later, earlier, 1],
      [earlier, later, -1],
    ]) {
      for (const unit of units)
        for (const roundingMethod of roundingMethods) {
          const floor = unit === 'month' ? 6_570_976 : 547_581;
          const count =
            roundingMethod === 'ceil' || (roundingMethod === 'round' && unit === 'month')
              ? floor + 1
              : floor;
          const text = label(count, unit);
          assert.equal(
            formatDistanceStrict(value, base, { ...context, unit, roundingMethod }),
            text,
          );
          assert.equal(
            formatDistanceStrict(value, base, {
              ...context,
              unit,
              roundingMethod,
              addSuffix: true,
            }),
            direction > 0 ? 'in ' + text : text + ' ago',
          );
        }
      assert.equal(formatDistanceStrict(value, base, context), '547581 years');
      assert.equal(formatDistance(value, base, context), 'about 547581 years');
    }
  }
});

test('exact month/year anniversaries at the limits do not need a further boundary', () => {
  for (const bound of [T.PlainDate.from('-271821-04-19'), T.PlainDate.from('+275760-09-13')]) {
    const direction = bound.year < 0 ? 1 : -1;
    for (const unit of units) {
      const other = bound.add({ [unit + 's']: direction });
      for (const [value, base] of [
        [bound, other],
        [other, bound],
      ])
        for (const roundingMethod of roundingMethods) {
          assert.equal(formatDistanceStrict(value, base, { unit, roundingMethod }), `1 ${unit}`);
        }
    }
  }
});

test('named-zone range results and errors match unshifted native totals in every host zone', () => {
  for (const zone of Intl.supportedValuesOf('timeZone'))
    for (const edge of [min, max]) {
      const boundary = edge.toZonedDateTimeISO(zone);
      const nearby = boundary.add({ days: boundary.year < 0 ? 50 : -50 });
      for (const [value, base] of [
        [boundary, nearby],
        [nearby, boundary],
      ])
        for (const unit of units) {
          let expected;
          try {
            expected = nativeTotal(value, base, unit);
          } catch (error) {
            assert.ok(error instanceof RangeError);
            for (const roundingMethod of roundingMethods)
              assert.throws(
                () => formatDistanceStrict(value, base, { unit, roundingMethod }),
                RangeError,
                `${zone}, ${unit}`,
              );
            continue;
          }
          for (const roundingMethod of roundingMethods)
            assert.equal(
              formatDistanceStrict(value, base, { unit, roundingMethod }),
              label(Math[roundingMethod](Math.abs(expected)), unit),
              `${zone}, ${unit}, ${roundingMethod}`,
            );
        }
    }
});

test('half-unit thresholds retain nanoseconds when the next boundary is out of range', () => {
  for (const [text, unit, direction] of [
    ['+275760-08-14T00:00', 'month', 1],
    ['-271821-05-15T00:00', 'month', -1],
    ['+275760-03-01T00:00', 'year', 1],
    ['-271821-12-01T00:00', 'year', -1],
  ]) {
    const base = T.PlainDateTime.from(text);
    const shift = direction > 0 ? -400 : 400;
    const sampleBase = base.with({ year: base.year + shift });
    const next = sampleBase.add({ [unit + 's']: direction });
    const midpoint = sampleBase.add({
      nanoseconds: Number(sampleBase.until(next, { largestUnit: 'nanosecond' }).nanoseconds / 2),
    });
    for (const nanoseconds of [-1, 0, 1]) {
      const sampleValue = midpoint.add({ nanoseconds });
      const value = sampleValue.with({ year: sampleValue.year - shift });
      for (const roundingMethod of roundingMethods) {
        const expected =
          roundingMethod === 'ceil' || (roundingMethod === 'round' && nanoseconds * direction >= 0)
            ? 1
            : 0;
        assert.equal(
          formatDistanceStrict(value, base, { unit, roundingMethod }),
          label(expected, unit),
        );
      }
    }
  }
});

test('ToNow wrappers support boundary dates, date-times, instants and zoned values in UTC', () => {
  const values = [
    T.PlainDate.from('-271821-04-19'),
    T.PlainDate.from('+275760-09-13'),
    T.PlainDateTime.from('-271821-04-19T00:00:00.000000001'),
    T.PlainDateTime.from('+275760-09-13T23:59:59.999999999'),
    min,
    max,
    min.toZonedDateTimeISO('America/New_York'),
    max.toZonedDateTimeISO('Australia/Lord_Howe'),
  ];
  for (const value of values) {
    assert.match(formatDistanceToNow(value, { timeZone: 'UTC' }), /^about \d+ years$/);
    for (const unit of units)
      assert.match(
        formatDistanceToNowStrict(value, { timeZone: 'UTC', unit }),
        /^\d+ (months|years)$/,
      );
  }
});
