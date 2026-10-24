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
import { api, date, dt, instant, T, time, value, withZone, ym, zoned } from './support.js';

registerScenario<ExampleRows['SEL-001']>('SEL-001', () => {
  let a!: TemporalValue;
  let b!: TemporalValue;
  let c!: TemporalValue;
  let items!: TemporalValue[];
  let out!: Observation;
  return {
    steps: [
      Given('<kind> objects first "<first>", middle "<middle>" and last "<last>"', (r) => {
        a = value(r.kind, r.first);
        b = value(r.kind, r.middle);
        c = value(r.kind, r.last);
      }),
      Given('an array [middle, last, first]', () => {
        items = [b, c, a];
      }),
      When('min is called with that array', () => {
        out = observe(() => api.min(items));
      }),
      Then('the result is the original first object', () => {
        expect(returned(out)).toBe(a);
      }),
      When('max is called with that array', () => {
        out = observe(() => api.max(items));
      }),
      Then('the result is the original last object', () => {
        expect(returned(out)).toBe(c);
      }),
      Then('the array order remains [middle, last, first]', () => {
        expect(items).toHaveLength(3);
        items.forEach((v, i) => expect(v).toBe([b, c, a][i]));
      }),
    ],
  };
});

registerScenario<ExampleRows['SEL-002']>('SEL-002', () => {
  let a!: TemporalValue;
  let b!: TemporalValue;
  let target!: TemporalValue;
  let out!: Observation;
  let index!: Observation;
  return {
    steps: [
      Given(
        '<kind> target "<target>" and distinct candidate objects left "<left>" and right "<right>"',
        (r) => {
          target = value(r.kind, r.target);
          a = value(r.kind, r.left);
          b = value(r.kind, r.right);
        },
      ),
      When('closestTo is called with target and [right, left]', () => {
        out = observe(() => api.closestTo(target, [b, a]));
      }),
      Then('the result is the original right object', () => {
        expect(returned(out)).toBe(b);
      }),
      When('closestIndexTo is called with target and [right, left]', () => {
        out = observe(() => api.closestIndexTo(target, [b, a]));
      }),
      Then('the result is 0', () => {
        expect(returned(out)).toBe(0);
      }),
      When('the candidate order is reversed', () => {
        out = observe(() => api.closestTo(target, [a, b]));
        index = observe(() => api.closestIndexTo(target, [a, b]));
      }),
      Then('closestTo returns the original left object and closestIndexTo returns 0', () => {
        expect(returned(out)).toBe(a);
        expect(returned(index)).toBe(0);
      }),
    ],
  };
});

registerScenario<ExampleRows['SEL-003']>('SEL-003', () => {
  let target!: TemporalValue;
  let items!: TemporalValue[];
  let out!: Observation;
  return {
    steps: [
      Given('an empty homogeneous collection and, where needed, a valid PlainDate target', () => {
        items = [];
        target = date();
      }),
      When('<function> is called', (r) => {
        out = observe(() =>
          r.function === 'min' || r.function === 'max'
            ? api[r.function](items)
            : api[r.function](target, items),
        );
      }),
      Then('the result is undefined', () => {
        expect(returned(out)).toBeUndefined();
      }),
    ],
  };
});

registerScenario<ExampleRows['SEL-004']>('SEL-004', () => {
  let a!: TemporalValue;
  let b!: TemporalValue;
  let out!: Observation;
  return {
    steps: [
      Given('distinct PlainDate objects first and second both equal to "2026-10-23"', () => {
        a = date('2026-10-23');
        b = date('2026-10-23');
      }),
      When('<function> is called with [second, first]', (r) => {
        out = observe(() => api[r.function]([b, a]));
      }),
      Then('the result is the original second object', () => {
        expect(returned(out)).toBe(b);
      }),
    ],
  };
});

registerScenario<ExampleRows['SEL-005']>('SEL-005', () => {
  let a!: TemporalValue;
  let b!: TemporalValue;
  let out!: Observation;
  return {
    steps: [
      Given('ZonedDateTime early "2026-10-24T00:00[Asia/Tokyo]"', () => {
        a = zoned('2026-10-24T00:00[Asia/Tokyo]');
      }),
      Given('ZonedDateTime late "2026-10-23T23:00[America/New_York]"', () => {
        b = zoned('2026-10-23T23:00[America/New_York]');
      }),
      When('min is called with [late, early]', () => {
        out = observe(() => api.min([b, a]));
      }),
      Then('the result is the original early object', () => {
        expect(returned(out)).toBe(a);
      }),
      When('max is called with [late, early]', () => {
        out = observe(() => api.max([b, a]));
      }),
      Then('the result is the original late object', () => {
        expect(returned(out)).toBe(b);
      }),
      Then('no common timeZone option is required', () => {
        expect(out.succeeded).toBe(true);
      }),
    ],
  };
});

registerScenario<ExampleRows['SEL-006']>('SEL-006', () => {
  let a!: TemporalValue;
  let b!: TemporalValue;
  let target!: TemporalValue;
  let out!: Observation;
  return {
    steps: [
      Given('Instant target "2026-10-23T00:00:00.000000001Z"', () => {
        target = instant('2026-10-23T00:00:00.000000001Z');
      }),
      Given('Instant near "2026-10-23T00:00:00.000000002Z"', () => {
        a = instant('2026-10-23T00:00:00.000000002Z');
      }),
      Given('Instant far "2026-10-23T00:00:00.000000003Z"', () => {
        b = instant('2026-10-23T00:00:00.000000003Z');
      }),
      When('closestTo is called with target and [far, near]', () => {
        out = observe(() => api.closestTo(target, [b, a]));
      }),
      Then('the result is the original near object', () => {
        expect(returned(out)).toBe(a);
      }),
      When('closestIndexTo is called with target and [far, near]', () => {
        out = observe(() => api.closestIndexTo(target, [b, a]));
      }),
      Then('the result is 1', () => {
        expect(returned(out)).toBe(1);
      }),
    ],
  };
});

registerScenario<ExampleRows['SEL-007']>('SEL-007', () => {
  let a!: TemporalValue;
  let b!: TemporalValue;
  let target!: TemporalValue;
  let out!: Observation;
  return {
    steps: [
      Given('PlainTime target "00:00", late "23:59:59" and noon "12:00"', () => {
        target = time('00:00');
        a = time('23:59:59');
        b = time('12:00');
      }),
      When('closestTo is called with target and [late, noon]', () => {
        out = observe(() => api.closestTo(target, [a, b]));
      }),
      Then('the result is the original noon object', () => {
        expect(returned(out)).toBe(b);
      }),
    ],
  };
});

registerScenario<ExampleRows['SEL-008']>('SEL-008', () => {
  let a!: TemporalValue;
  let b!: TemporalValue;
  let target!: TemporalValue;
  let out!: Observation;
  return {
    steps: [
      Given('PlainYearMonth target "2026-03", January "2026-01" and April "2026-04"', () => {
        target = ym('2026-03');
        a = ym('2026-01');
        b = ym('2026-04');
      }),
      When('closestTo is called with target and [January, April]', () => {
        out = observe(() => api.closestTo(target, [a, b]));
      }),
      Then('the result is the original April object', () => {
        expect(returned(out)).toBe(b);
      }),
    ],
  };
});

registerScenario<ExampleRows['SEL-009']>('SEL-009', () => {
  let a!: TemporalValue;
  let b!: TemporalValue;
  let target!: TemporalValue;
  let out!: Observation;
  let results!: Observation[];
  return {
    steps: [
      Given('PlainDateTime target "2026-03-08T12:00"', () => {
        target = dt('2026-03-08T12:00');
      }),
      Given('PlainDateTime near "2026-03-08T13:00" and far "2026-03-07T12:00"', () => {
        a = dt('2026-03-08T13:00');
        b = dt('2026-03-07T12:00');
      }),
      When('closestTo is called with target and [far, near]', () => {
        out = observe(() => api.closestTo(target, [b, a]));
        results = ['UTC', 'America/New_York', 'Asia/Tokyo'].map((zone) =>
          observe(() => withZone(zone, () => api.closestTo(target, [b, a]))),
        );
      }),
      Then('the result is the original near object', () => {
        expect(returned(out)).toBe(a);
      }),
      Then('the host zone does not change the result', () => {
        results.forEach((o) => expect(returned(o)).toBe(a));
      }),
    ],
  };
});

registerScenario<ExampleRows['SEL-010']>('SEL-010', () => {
  let a!: TemporalValue;
  let b!: TemporalValue;
  let target!: TemporalValue;
  let out!: Observation;
  return {
    steps: [
      Given('a PlainDate "2026-10-23" and a PlainDateTime "2026-10-23T00:00"', () => {
        a = date('2026-10-23');
        b = dt('2026-10-23T00:00');
      }),
      Given('a PlainDate target is supplied where required', () => {
        target = date();
      }),
      When('<function> is called with a collection containing both values', (r) => {
        out = observe(() =>
          r.function === 'min' || r.function === 'max'
            ? api[r.function]([a, b])
            : api[r.function](target, [a, b]),
        );
      }),
      Then('the call throws an incompatible-kind error', () => {
        failed(out);
      }),
    ],
  };
});

registerScenario<ExampleRows['SEL-011']>('SEL-011', () => {
  let target!: TemporalValue;
  let items!: TemporalValue[];
  let out!: Observation;
  return {
    steps: [
      Given('a PlainDate target "2026-10-23"', () => {
        target = date('2026-10-23');
      }),
      Given('a collection containing PlainYearMonth "2026-10"', () => {
        items = [ym('2026-10')];
      }),
      When('<function> is called', (r) => {
        out = observe(() => api[r.function](target, items));
      }),
      Then('it throws an incompatible-kind error', () => {
        failed(out);
      }),
    ],
  };
});

registerScenario<ExampleRows['SEL-012']>('SEL-012', () => {
  let a!: TemporalValue;
  let b!: TemporalValue;
  let out!: Observation;
  return {
    steps: [
      Given('PlainDateTime low "-271821-04-19T00:00:00.000000001"', () => {
        a = dt('-271821-04-19T00:00:00.000000001');
      }),
      Given('PlainDateTime high "+275760-09-13T23:59:59.999999999"', () => {
        b = dt('+275760-09-13T23:59:59.999999999');
      }),
      When('closestTo is called with low and [high, low]', () => {
        out = observe(() => api.closestTo(a, [b, a]));
      }),
      Then('the result is the original low object', () => {
        expect(returned(out)).toBe(a);
      }),
      When('closestTo is called with high and [low, high]', () => {
        out = observe(() => api.closestTo(b, [a, b]));
      }),
      Then('the result is the original high object', () => {
        expect(returned(out)).toBe(b);
      }),
    ],
  };
});

registerScenario<ExampleRows['SEL-013']>('SEL-013', () => {
  let a!: TemporalValue;
  let b!: TemporalValue;
  let outputs!: Observation[];
  return {
    steps: [
      Given(
        'distinct ISO PlainYearMonth values for "2026-10" constructed with reference days 1 and 31',
        () => {
          a = new T.PlainYearMonth(2026, 10, 'iso8601', 1);
          b = new T.PlainYearMonth(2026, 10, 'iso8601', 31);
        },
      ),
      When('min is called with those objects in either order', () => {
        outputs = [
          [a, b],
          [b, a],
        ].map((items) => observe(() => api.min(items)));
      }),
      Then('it returns the first input object in that order', () => {
        outputs.forEach((o, i) => expect(returned(o)).toBe([a, b][i]));
      }),
      When(
        'closestTo is called with either object as target and the other as its only candidate',
        () => {
          outputs = [observe(() => api.closestTo(a, [b])), observe(() => api.closestTo(b, [a]))];
        },
      ),
      Then('it returns that candidate at zero month distance', () => {
        outputs.forEach((o, i) => expect(returned(o)).toBe([b, a][i]));
      }),
    ],
  };
});
