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
import {
  api,
  arrangement,
  asTemporal,
  date,
  dt,
  equal,
  instant,
  literal,
  options,
  value,
  zoned,
} from './support.js';

registerScenario<ExampleRows['BUS-001']>('BUS-001', () => {
  let v!: TemporalValue;
  let out!: Observation;
  return {
    steps: [
      Given('a PlainDate "<value>"', (r) => {
        v = value('PlainDate', r.value);
      }),
      When('<function> is called with amount <amount> and omitted options', (r) => {
        out = observe(() => api[r.function](v, literal(r.amount)));
      }),
      Then('the result is PlainDate "<result>"', (r) => {
        equal(returned(out), value('PlainDate', r.result));
      }),
    ],
  };
});

registerScenario<ExampleRows['BUS-002']>('BUS-002', () => {
  let v!: TemporalValue;
  let out!: Observation;
  return {
    steps: [
      Given('a PlainDate "2026-10-24"', () => {
        v = value('PlainDate', '2026-10-24');
      }),
      When('<function> is called with amount 0 and valid options', (r) => {
        out = observe(() => api[r.function](v, 0));
      }),
      Then('the result is the same input object', () => {
        expect(returned(out)).toBe(v);
      }),
    ],
  };
});

registerScenario<ExampleRows['BUS-003']>('BUS-003', () => {
  let v!: TemporalValue;
  let out!: Observation;
  return {
    steps: [
      Given('a PlainDate "2026-10-22"', () => {
        v = value('PlainDate', '2026-10-22');
      }),
      When('<function> is called with amount <amount> and weekendDays <weekends>', (r) => {
        out = observe(() =>
          api[r.function](v, literal(r.amount), { weekendDays: literal(r.weekends) }),
        );
      }),
      Then('the result is PlainDate "<result>"', (r) => {
        equal(returned(out), value('PlainDate', r.result));
      }),
    ],
  };
});

registerScenario<ExampleRows['BUS-004']>('BUS-004', () => {
  let v!: TemporalValue;
  let out!: Observation;
  let business!: Observation;
  return {
    steps: [
      Given('a PlainDate "<value>"', (r) => {
        v = date(r.value);
      }),
      When('isWeekend and isBusinessDay are called with <context>', (r) => {
        out = observe(() => api.isWeekend(v, options(r.context)));
        business = observe(() => api.isBusinessDay(v, options(r.context)));
      }),
      Then('isWeekend returns <weekend>', (r) => {
        expect(returned(out)).toBe(r.weekend === 'true');
      }),
      Then('isBusinessDay returns <business>', (r) => {
        expect(returned(business)).toBe(r.business === 'true');
      }),
    ],
  };
});

registerScenario<ExampleRows['BUS-005']>('BUS-005', () => {
  let a!: TemporalValue;
  let b!: TemporalValue;
  let out!: Observation;
  return {
    steps: [
      Given('PlainDate earlier "<earlier>" and later "<later>"', (r) => {
        a = date(r.earlier);
        b = date(r.later);
      }),
      When('differenceInBusinessDays is called as later, earlier with <context>', (r) => {
        out = observe(() => api.differenceInBusinessDays(b, a, options(r.context)));
      }),
      Then('the result is <count>', (r) => {
        expect(returned(out)).toBe(Number(r.count));
      }),
      When('the same inputs are passed in reverse order', (r) => {
        out = observe(() => api.differenceInBusinessDays(a, b, options(r.context)));
      }),
      Then('the result is <reverse>', (r) => {
        expect(returned(out)).toBe(Number(r.reverse));
      }),
    ],
  };
});

registerScenario<ExampleRows['BUS-006']>('BUS-006', () => {
  let a!: TemporalValue;
  let b!: TemporalValue;
  let out!: Observation;
  return {
    steps: [
      Given(
        'PlainDateTime earlier "2026-10-23T23:59:59.999999999" and later "2026-10-26T00:00"',
        () => {
          a = dt('2026-10-23T23:59:59.999999999');
          b = dt('2026-10-26T00:00');
        },
      ),
      When('differenceInBusinessDays is called as later, earlier', () => {
        out = observe(() => api.differenceInBusinessDays(b, a));
      }),
      Then('the result is 1', () => {
        expect(returned(out)).toBe(1);
      }),
    ],
  };
});

registerScenario<ExampleRows['BUS-007']>('BUS-007', () => {
  let v!: TemporalValue;
  let out!: Observation;
  return {
    steps: [
      Given('a ZonedDateTime "2026-03-06T12:34:56.123456789[America/New_York]"', () => {
        v = value('ZonedDateTime', '2026-03-06T12:34:56.123456789[America/New_York]');
      }),
      When('addBusinessDays is called with amount 1', () => {
        out = observe(() => api['addBusinessDays'](v, 1));
      }),
      Then(
        'the result is ZonedDateTime "2026-03-09T12:34:56.123456789-04:00[America/New_York]"',
        () => {
          equal(
            returned(out),
            value('ZonedDateTime', '2026-03-09T12:34:56.123456789-04:00[America/New_York]'),
          );
        },
      ),
      Then('the original value has offset "-05:00"', () => {
        expect(asTemporal(v, 'ZonedDateTime').offset).toBe('-05:00');
      }),
    ],
  };
});

registerScenario<ExampleRows['BUS-008']>('BUS-008', () => {
  let v!: TemporalValue;
  let out!: Observation;
  return {
    steps: [
      Given('a ZonedDateTime "2026-03-07T02:30[America/New_York]"', () => {
        v = value('ZonedDateTime', '2026-03-07T02:30[America/New_York]');
      }),
      When('addBusinessDays is called with amount 1 and weekendDays []', () => {
        out = observe(() => api['addBusinessDays'](v, 1, { weekendDays: [] }));
      }),
      Then('the result is ZonedDateTime "2026-03-08T03:30-04:00[America/New_York]"', () => {
        equal(returned(out), value('ZonedDateTime', '2026-03-08T03:30-04:00[America/New_York]'));
      }),
    ],
  };
});

registerScenario<ExampleRows['BUS-009']>('BUS-009', () => {
  let v!: TemporalValue;
  let out!: Observation;
  return {
    steps: [
      Given('a ZonedDateTime "<value>"', (r) => {
        v = zoned(r.value);
      }),
      Given('the host data skips December 30, 2011 in Pacific/Apia', () => {
        expect(zoned('2011-12-29T12:00[Pacific/Apia]').add({ days: 1 }).day).toBe(31);
      }),
      When('<function> is called with amount <amount> and <context>', (r) => {
        out = observe(() => api[r.function](v, Number(r.amount), options(r.context)));
      }),
      Then('the result is ZonedDateTime "<result>"', (r) => {
        equal(returned(out), zoned(r.result));
      }),
    ],
  };
});

registerScenario<ExampleRows['BUS-010']>('BUS-010', () => {
  let a!: TemporalValue;
  let b!: TemporalValue;
  let out!: Observation;
  let reverse!: Observation;
  return {
    steps: [
      Given('ZonedDateTime earlier "2011-12-29T12:00[Pacific/Apia]" and later "<later>"', (r) => {
        a = zoned('2011-12-29T12:00[Pacific/Apia]');
        b = zoned(r.later);
      }),
      Given('the host data skips December 30, 2011 in Pacific/Apia', () => {
        expect(zoned('2011-12-29T12:00[Pacific/Apia]').add({ days: 1 }).day).toBe(31);
      }),
      When('differenceInBusinessDays is called as later, earlier with <context>', (r) => {
        out = observe(() => api.differenceInBusinessDays(b, a, options(r.context)));
        reverse = observe(() => api.differenceInBusinessDays(a, b, options(r.context)));
      }),
      Then('the result is 1', () => {
        expect(returned(out)).toBe(1);
      }),
      Then('reversing the arguments returns -1', () => {
        expect(returned(reverse)).toBe(-1);
      }),
    ],
  };
});

registerScenario<ExampleRows['BUS-011']>('BUS-011', () => {
  let v!: TemporalValue;
  let out!: Observation;
  return {
    steps: [
      Given('a PlainDate "2026-10-23"', () => {
        v = value('PlainDate', '2026-10-23');
      }),
      When('<function> is called with amount 0 and weekendDays <weekends>', (r) => {
        out = observe(() => api[r.function](v, 0, { weekendDays: literal(r.weekends) }));
      }),
      Then('the call throws an invalid-weekend error', () => {
        failed(out);
      }),
    ],
  };
});

registerScenario<ExampleRows['BUS-012']>('BUS-012', () => {
  let v!: TemporalValue;
  let out!: Observation;
  return {
    steps: [
      Given('a PlainDate "2026-10-23"', () => {
        v = value('PlainDate', '2026-10-23');
      }),
      When('<function> is called with amount <amount>', (r) => {
        out = observe(() => api[r.function](v, literal(r.amount)));
      }),
      Then('the call throws an invalid-amount error', () => {
        failed(out);
      }),
    ],
  };
});

registerScenario<ExampleRows['BUS-013']>('BUS-013', () => {
  let a!: TemporalValue;
  let b!: TemporalValue;
  let out!: Observation;
  return {
    steps: [
      Given('the same Instant "2026-01-01T01:00Z" viewed in UTC and America/New_York', () => {
        a = instant('2026-01-01T01:00Z').toZonedDateTimeISO('UTC');
        b = instant('2026-01-01T01:00Z').toZonedDateTimeISO('America/New_York');
      }),
      When(
        'differenceInBusinessDays is called with those ZonedDateTime values and omitted timeZone',
        () => {
          out = observe(() => api.differenceInBusinessDays(a, b));
        },
      ),
      Then('the call throws a missing-common-zone error', () => {
        failed(out);
      }),
      When('it is called with timeZone "UTC"', () => {
        out = observe(() => api.differenceInBusinessDays(a, b, { timeZone: 'UTC' }));
      }),
      Then('the result is 0', () => {
        expect(returned(out)).toBe(0);
      }),
    ],
  };
});

registerScenario<ExampleRows['BUS-014']>('BUS-014', () => {
  let v!: TemporalValue;
  let out!: Observation;
  return {
    steps: [
      Given('a PlainDate "+275760-09-13"', () => {
        v = value('PlainDate', '+275760-09-13');
      }),
      When('addBusinessDays is called with amount 1 and weekendDays []', () => {
        out = observe(() => api['addBusinessDays'](v, 1, { weekendDays: [] }));
      }),
      Then('the call throws RangeError', () => {
        failed(out, RangeError);
      }),
    ],
  };
});

registerScenario<ExampleRows['BUS-015']>('BUS-015', () => {
  let v!: TemporalValue;
  let out!: Observation;
  return {
    steps: [
      Given('a PlainDate "2026-10-23"', () => {
        v = value('PlainDate', '2026-10-23');
      }),
      When('<function> is called with amount <amount>', (r) => {
        out = observe(() => api[r.function](v, literal(r.amount)));
      }),
      Then('it throws an invalid-amount error', () => {
        failed(out);
      }),
    ],
  };
});

registerScenario<ExampleRows['BUS-016']>('BUS-016', () => {
  let a!: TemporalValue;
  let b!: TemporalValue;
  let out!: Observation;
  return {
    steps: [
      Given(
        'Instant "2026-10-26T01:00Z" viewed as ZonedDateTime values in UTC and America/New_York',
        () => {
          a = instant('2026-10-26T01:00Z').toZonedDateTimeISO('UTC');
          b = instant('2026-10-26T01:00Z').toZonedDateTimeISO('America/New_York');
        },
      ),
      When('isWeekend is called with default options on the UTC value', () => {
        out = observe(() => api.isWeekend(a));
      }),
      Then('the result is false', () => {
        expect(returned(out)).toBe(false);
      }),
      When('isWeekend is called on the New York value', () => {
        out = observe(() => api.isWeekend(b));
      }),
      Then('the result is true', () => {
        expect(returned(out)).toBe(true);
      }),
      When('isBusinessDay is called on the New York value', () => {
        out = observe(() => api.isBusinessDay(b));
      }),
      Then('the result is false', () => {
        expect(returned(out)).toBe(false);
      }),
    ],
  };
});

registerScenario<ExampleRows['BUS-017']>('BUS-017', () => {
  let call!: () => unknown;
  let out!: Observation;
  return {
    steps: [
      Given('compatible valid inputs for <function> using PlainDate "2026-10-23"', (r) => {
        call = arrangement(r.function, date(), 'PlainDate', { weekendDays: [0, 1, 2, 3, 4, 5, 6] });
      }),
      When('<function> is called with weekendDays [0,1,2,3,4,5,6]', () => {
        out = observe(call);
      }),
      Then('it throws RangeError', () => {
        failed(out, RangeError);
      }),
    ],
  };
});
