import { expect } from 'vitest';
import {
  failed,
  Given,
  observe,
  registerScenario,
  returned,
  Then,
  When,
  type Observation,
} from './bindings.js';
import type { ExampleRows } from './example-types.js';
import type { TemporalValue } from './support.js';
import { api, date, dt, literal, options, time, value, ym, zoned } from './support.js';

registerScenario<ExampleRows['INT-001']>('INT-001', () => {
  let range!: { start: TemporalValue; end: TemporalValue };
  let v!: TemporalValue;
  let out!: Observation;
  return {
    steps: [
      Given('a PlainTime interval from "10:00" through "12:00"', () => {
        range = { start: time('10:00'), end: time('12:00') };
      }),
      When('isWithinInterval is called with PlainTime "<value>"', (r) => {
        v = time(r.value);
        out = observe(() => api.isWithinInterval(v, range));
      }),
      Then('the result is <result>', (r) => {
        expect(returned(out)).toBe(r.result === 'true');
      }),
    ],
  };
});

registerScenario<ExampleRows['INT-002']>('INT-002', () => {
  let range!: { start: TemporalValue; end: TemporalValue };
  let v!: TemporalValue;
  let out!: Observation;
  return {
    steps: [
      Given('PlainDate endpoint objects start "2026-10-02" and end "2026-10-04"', () => {
        range = { start: date('2026-10-02'), end: date('2026-10-04') };
      }),
      Given('a distinct PlainDate input object "<value>"', (r) => {
        v = date(r.value);
      }),
      When('clamp is called with that input and the interval', () => {
        out = observe(() => api.clamp(v, range));
      }),
      Then('the result is the original <object> object', (r) => {
        expect(returned(out)).toBe(r.object === 'input' ? v : range[r.object]);
      }),
    ],
  };
});

registerScenario<ExampleRows['INT-003']>('INT-003', () => {
  let range!: { start: TemporalValue; end: TemporalValue };
  let out!: Observation;
  let other!: typeof range;
  let reverse!: Observation;
  return {
    steps: [
      Given('a PlainTime first interval from "10:00" through "12:00"', () => {
        range = { start: time('10:00'), end: time('12:00') };
      }),
      Given('a PlainTime second interval from "<start>" through "<end>"', (r) => {
        other = { start: time(r.start), end: time(r.end) };
      }),
      When('areIntervalsOverlapping is called with <options>', (r) => {
        out = observe(() => api.areIntervalsOverlapping(range, other, options(r.options)));
        reverse = observe(() => api.areIntervalsOverlapping(other, range, options(r.options)));
      }),
      Then('the result is <result>', (r) => {
        expect(returned(out)).toBe(r.result === 'true');
      }),
      Then('swapping the intervals produces the same result', () => {
        expect(returned(reverse)).toBe(returned(out));
      }),
    ],
  };
});

registerScenario<ExampleRows['INT-004']>('INT-004', () => {
  let range!: { start: TemporalValue; end: TemporalValue };
  let out!: Observation;
  let other!: typeof range;
  let reverse!: Observation;
  return {
    steps: [
      Given('a PlainTime first interval from "11:00" through "13:00"', () => {
        range = { start: time('11:00'), end: time('13:00') };
      }),
      Given('a point interval whose start and end both equal PlainTime "<point>"', (r) => {
        const point = time(r.point);
        other = { start: point, end: point };
      }),
      When('areIntervalsOverlapping is called with <options>', (r) => {
        out = observe(() => api.areIntervalsOverlapping(range, other, options(r.options)));
        reverse = observe(() => api.areIntervalsOverlapping(other, range, options(r.options)));
      }),
      Then('the result is <result>', (r) => {
        expect(returned(out)).toBe(r.result === 'true');
      }),
      Then('swapping the intervals produces the same result', () => {
        expect(returned(reverse)).toBe(returned(out));
      }),
    ],
  };
});

registerScenario<ExampleRows['INT-005']>('INT-005', () => {
  let range!: { start: TemporalValue; end: TemporalValue };
  let out!: Observation;
  let other!: typeof range;
  return {
    steps: [
      Given('two PlainTime intervals each from "12:00" through "12:00"', () => {
        range = { start: time('12:00'), end: time('12:00') };
        other = { start: time('12:00'), end: time('12:00') };
      }),
      When('areIntervalsOverlapping is called with <options>', (r) => {
        out = observe(() => api.areIntervalsOverlapping(range, other, options(r.options)));
      }),
      Then('the result is <result>', (r) => {
        expect(returned(out)).toBe(r.result === 'true');
      }),
    ],
  };
});

registerScenario<ExampleRows['INT-006']>('INT-006', () => {
  let range!: { start: TemporalValue; end: TemporalValue };
  let v!: TemporalValue;
  let out!: Observation;
  return {
    steps: [
      Given('PlainDate interval endpoint objects start and end both equal "2026-10-23"', () => {
        range = { start: date('2026-10-23'), end: date('2026-10-23') };
      }),
      Given('distinct input object equal to PlainDate "2026-10-23"', () => {
        v = date('2026-10-23');
      }),
      When('isWithinInterval is called with the input and interval', () => {
        out = observe(() => api.isWithinInterval(v, range));
      }),
      Then('the result is true', () => {
        expect(returned(out)).toBe(true);
      }),
      When('clamp is called with the input and interval', () => {
        out = observe(() => api.clamp(v, range));
      }),
      Then('the result is the original input object', () => {
        expect(returned(out)).toBe(v);
      }),
    ],
  };
});

registerScenario<ExampleRows['INT-007']>('INT-007', () => {
  let range!: { start: TemporalValue; end: TemporalValue };
  let v!: TemporalValue;
  let out!: Observation;
  let other!: typeof range;
  return {
    steps: [
      Given('a PlainTime interval from "23:00" through "01:00"', () => {
        range = { start: time('23:00'), end: time('01:00') };
      }),
      Given('a PlainTime value "00:00" and another valid PlainTime interval where needed', () => {
        v = time('00:00');
        other = { start: time('00:00'), end: time('02:00') };
      }),
      When('<function> is called using the reversed interval', (r) => {
        out = observe(() =>
          r.function === 'areIntervalsOverlapping'
            ? api.areIntervalsOverlapping(range, other)
            : api[r.function](v, range),
        );
      }),
      Then('the call throws an invalid-interval error', () => {
        failed(out);
      }),
      Then('it does not reinterpret the interval as overnight', () => {
        expect(out.value).toBeUndefined();
      }),
    ],
  };
});

registerScenario<ExampleRows['INT-008']>('INT-008', () => {
  let range!: { start: TemporalValue; end: TemporalValue };
  let v!: TemporalValue;
  let out!: Observation;
  return {
    steps: [
      Given('a PlainYearMonth interval from "2026-10" through "2026-12"', () => {
        range = { start: ym('2026-10'), end: ym('2026-12') };
      }),
      When('isWithinInterval is called with PlainYearMonth "<value>"', (r) => {
        v = ym(r.value);
        out = observe(() => api.isWithinInterval(v, range));
      }),
      Then('the result is <result>', (r) => {
        expect(returned(out)).toBe(r.result === 'true');
      }),
    ],
  };
});

registerScenario<ExampleRows['INT-009']>('INT-009', () => {
  let range!: { start: TemporalValue; end: TemporalValue };
  let v!: TemporalValue;
  let out!: Observation;
  return {
    steps: [
      Given(
        'a ZonedDateTime interval from "2026-10-23T00:00[UTC]" through "2026-10-24T00:00[UTC]"',
        () => {
          range = { start: zoned('2026-10-23T00:00[UTC]'), end: zoned('2026-10-24T00:00[UTC]') };
        },
      ),
      Given('ZonedDateTime value "2026-10-23T12:00[Asia/Tokyo]"', () => {
        v = zoned('2026-10-23T12:00[Asia/Tokyo]');
      }),
      When('isWithinInterval is called with that value and interval', () => {
        out = observe(() => api.isWithinInterval(v, range));
      }),
      Then('the result is true', () => {
        expect(returned(out)).toBe(true);
      }),
      Then('no comparison timeZone option is required', () => {
        expect(out.succeeded).toBe(true);
      }),
    ],
  };
});

registerScenario<ExampleRows['INT-010']>('INT-010', () => {
  let range!: { start: TemporalValue; end: TemporalValue };
  let v!: TemporalValue;
  let out!: Observation;
  let other!: typeof range;
  return {
    steps: [
      Given('<inputs>', (r) => {
        if (r.inputs.includes('internally') || r.inputs.includes('start and')) {
          v = date();
          range = { start: date(), end: dt() };
        } else if (r.function === 'areIntervalsOverlapping') {
          range = { start: date(), end: date() };
          other = { start: dt(), end: dt() };
        } else {
          v = r.function === 'clamp' ? ym() : date();
          range =
            r.function === 'clamp' ? { start: date(), end: date() } : { start: dt(), end: dt() };
        }
      }),
      When('<function> is called', (r) => {
        out = observe(() =>
          r.function === 'areIntervalsOverlapping'
            ? api.areIntervalsOverlapping(range, other)
            : api[r.function](v, range),
        );
      }),
      Then('it throws an incompatible-kind error', () => {
        failed(out);
      }),
    ],
  };
});

registerScenario<ExampleRows['INT-011']>('INT-011', () => {
  let range!: { start: TemporalValue; end: TemporalValue };
  let out!: Observation;
  return {
    steps: [
      Given('valid overlapping PlainDate intervals', () => {
        range = { start: date('2026-10-01'), end: date('2026-10-04') };
      }),
      When('areIntervalsOverlapping is called with inclusive <value>', (r) => {
        out = observe(() =>
          api.areIntervalsOverlapping(range, range, { inclusive: literal(r.value) }),
        );
      }),
      Then('the call throws an invalid-option error', () => {
        failed(out);
      }),
    ],
  };
});

registerScenario<ExampleRows['INT-012']>('INT-012', () => {
  let range!: { start: TemporalValue; end: TemporalValue };
  let out!: Observation;
  let a!: TemporalValue;
  let b!: TemporalValue;
  let c!: TemporalValue;
  let d!: TemporalValue;
  let outputs!: Observation[];
  return {
    steps: [
      Given('original <kind> objects a "<a>", b "<b>", c "<c>" and d "<d>"', (r) => {
        a = value(r.kind, r.a);
        b = value(r.kind, r.b);
        c = value(r.kind, r.c);
        d = value(r.kind, r.d);
      }),
      Given('the interval has start b and end c', () => {
        range = { start: b, end: c };
      }),
      When('isWithinInterval is called for a, b, c and d', () => {
        outputs = [a, b, c, d].map((v) => observe(() => api.isWithinInterval(v, range)));
      }),
      Then('the corresponding results are [false, true, true, false]', () => {
        expect(outputs.map(returned)).toEqual([false, true, true, false]);
      }),
      When('clamp is called for a, b, c and d', () => {
        outputs = [a, b, c, d].map((v) => observe(() => api.clamp(v, range)));
      }),
      Then('the corresponding objects returned by identity are [b, b, c, c]', () => {
        outputs.forEach((o, i) => expect(returned(o)).toBe([b, b, c, c][i]));
      }),
      When('areIntervalsOverlapping compares the interval with [c,d] using omitted options', () => {
        out = observe(() => api.areIntervalsOverlapping(range, { start: c, end: d }));
      }),
      Then('the result is false', () => {
        expect(returned(out)).toBe(false);
      }),
      When('that comparison uses inclusive true', () => {
        out = observe(() =>
          api.areIntervalsOverlapping(range, { start: c, end: d }, { inclusive: true }),
        );
      }),
      Then('the result is true', () => {
        expect(returned(out)).toBe(true);
      }),
    ],
  };
});
