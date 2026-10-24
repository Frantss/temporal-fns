import { test } from 'node:test';
import assert from 'node:assert/strict';
import { calendarTotal } from '../dist/calendar-total.js';
import { formatDistanceStrict } from '../dist/index.js';

const T = globalThis.Temporal;
const roundings = ['floor', 'ceil', 'round', 'trunc'];
const units = ['month', 'year'];
const label = (count, unit) => `${count} ${unit}${count === 1 ? '' : 's'}`;
function total(value, base, unit) {
  return base
    .until(value, { largestUnit: 'year' })
    .total({ unit, relativeTo: base instanceof T.PlainDateTime ? base.toPlainDate() : base });
}

test('unrelated native RangeErrors away from the date limits are not masked', () => {
  const base = T.PlainDate.from('2026-01-01'),
    value = T.PlainDate.from('2026-02-01');
  const original = T.Duration.prototype.total;
  const failure = new RangeError('unrelated native failure');
  try {
    T.Duration.prototype.total = function () {
      throw failure;
    };
    for (const unit of units)
      assert.throws(
        () => formatDistanceStrict(value, base, { unit }),
        (error) => error === failure,
      );
  } finally {
    T.Duration.prototype.total = original;
  }
});

test('a named zone with a zero current offset is not treated as a fixed-offset zone', () => {
  const end =
    T.Instant.fromEpochNanoseconds(8_640_000_000_000_000_000_000n).toZonedDateTimeISO(
      'Africa/Abidjan',
    );
  const base = end.subtract({ days: 50 });
  assert.equal(end.offsetNanoseconds, 0);
  assert.throws(() => formatDistanceStrict(end, base, { unit: 'year' }), RangeError);
  assert.equal(
    formatDistanceStrict(end.withTimeZone('+00:00'), base.withTimeZone('+00:00'), { unit: 'year' }),
    '0 years',
  );
});

test('exact named-zone anniversaries preserve native errors at an unsupported boundary', () => {
  const value =
    T.Instant.fromEpochNanoseconds(8_640_000_000_000_000_000_000n).toZonedDateTimeISO(
      'America/New_York',
    );
  const base = value.subtract({ months: 1 });
  assert.throws(() => total(value, base, 'month'), RangeError);
  assert.throws(() => formatDistanceStrict(value, base, { unit: 'month' }), RangeError);
});

test('named-zone anniversary construction always queries the original year', () => {
  const original = T.ZonedDateTime.from;
  for (const year of [-271821, 275760]) {
    const base = original({ year, month: 6, day: 1, hour: 12, timeZone: 'America/New_York' });
    const value = base.add({ days: 10 });
    const expected = total(value, base, 'month');
    const calls = [];
    try {
      T.ZonedDateTime.from = function (fields, options) {
        calls.push(fields.year);
        return Reflect.apply(original, this, [fields, options]);
      };
      const actual = calendarTotal(value, base, 'month');
      assert.ok(Math.abs(actual - expected) <= Number.EPSILON);
    } finally {
      T.ZonedDateTime.from = original;
    }
    assert.ok(calls.length > 0);
    assert.ok(
      calls.every((actualYear) => actualYear === year),
      String(calls),
    );
  }
});

test('an unavailable named-zone boundary preserves the original native RangeError', () => {
  const max =
    T.Instant.fromEpochNanoseconds(8_640_000_000_000_000_000_000n).toZonedDateTimeISO(
      'America/New_York',
    );
  const base = max.subtract({ days: 50 });
  const original = T.Duration.prototype.total;
  let nativeError;
  try {
    T.Duration.prototype.total = function (options) {
      try {
        return Reflect.apply(original, this, [options]);
      } catch (error) {
        nativeError = error;
        throw error;
      }
    };
    assert.throws(
      () => formatDistanceStrict(max, base, { unit: 'year' }),
      (error) => error instanceof RangeError && error === nativeError,
    );
  } finally {
    T.Duration.prototype.total = original;
  }
});

test('native disambiguation is retained for both folds, gaps and skipped calendar dates', () => {
  const pairs = [
    ['2026-11-01T01:30-05:00[America/New_York]', '2026-11-01T01:30-04:00[America/New_York]'],
    ['2026-02-08T02:30-05:00[America/New_York]', '2026-03-08T03:30-04:00[America/New_York]'],
    ['2026-03-05T01:45+11:00[Australia/Lord_Howe]', '2026-04-05T01:45+10:30[Australia/Lord_Howe]'],
    ['2011-11-30T12:00-10:00[Pacific/Apia]', '2011-12-31T12:00+14:00[Pacific/Apia]'],
    ['2000-02-29T23:30[UTC]', '2001-03-28T22:30[UTC]'],
  ];
  for (const [a, b] of pairs) {
    const first = T.ZonedDateTime.from(a),
      second = T.ZonedDateTime.from(b);
    for (const [value, base] of [
      [first, second],
      [second, first],
    ])
      for (const unit of units) {
        const expected = total(value, base, unit);
        const fallback = calendarTotal(value, base, unit);
        assert.ok(
          Math.abs(fallback - expected) <= Number.EPSILON * Math.max(1, Math.abs(expected)) * 2,
        );
        for (const roundingMethod of roundings)
          assert.equal(
            formatDistanceStrict(value, base, { unit, roundingMethod }),
            label(Math[roundingMethod](Math.abs(expected)), unit),
          );
      }
  }
});

test('public rounding preserves the native result when a total is representable', () => {
  const base = T.PlainDateTime.from('2000-03-01T00:00');
  const halfYear = base.add({ days: 182, hours: 12 });
  for (const nanoseconds of [-1, 0, 1]) {
    const value = halfYear.add({ nanoseconds });
    for (const roundingMethod of roundings) {
      const expected = Math[roundingMethod](Math.abs(total(value, base, 'year')));
      assert.equal(
        formatDistanceStrict(value, base, { unit: 'year', roundingMethod }),
        label(expected, 'year'),
      );
    }
  }
});
