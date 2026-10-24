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
import { api, asTemporal, date, equal, literal, T, value, zoned } from './support.js';

registerScenario<ExampleRows['BND-001']>('BND-001', () => {
  let v!: TemporalValue;
  let out!: Observation;
  return {
    steps: [
      Given('a PlainDate "2026-05-13"', () => {
        v = value('PlainDate', '2026-05-13');
      }),
      When('<function> is called with omitted options', (r) => {
        out = observe(() => api[r.function](v));
      }),
      Then('the result is PlainDate "<result>"', (r) => {
        equal(returned(out), value('PlainDate', r.result));
      }),
    ],
  };
});

registerScenario<ExampleRows['BND-002']>('BND-002', () => {
  let v!: TemporalValue;
  let out!: Observation;
  return {
    steps: [
      Given('a PlainDateTime "2026-05-13T14:24:36.123456789"', () => {
        v = value('PlainDateTime', '2026-05-13T14:24:36.123456789');
      }),
      When('<function> is called with omitted options', (r) => {
        out = observe(() => api[r.function](v));
      }),
      Then('the result is PlainDateTime "<result>"', (r) => {
        equal(returned(out), value('PlainDateTime', r.result));
      }),
    ],
  };
});

registerScenario<ExampleRows['BND-003']>('BND-003', () => {
  let v!: TemporalValue;
  let out!: Observation;
  let end!: Observation;
  return {
    steps: [
      Given('a PlainDate "2026-05-13"', () => {
        v = date('2026-05-13');
      }),
      When('startOfWeek and endOfWeek are called with weekStartsOn <weekday>', (r) => {
        out = observe(() => api.startOfWeek(v, { weekStartsOn: Number(r.weekday) }));
        end = observe(() => api.endOfWeek(v, { weekStartsOn: Number(r.weekday) }));
      }),
      Then('the start is "<start>" and the end is "<end>"', (r) => {
        equal(returned(out), date(r.start));
        equal(returned(end), date(r.end));
      }),
    ],
  };
});

registerScenario<ExampleRows['BND-004']>('BND-004', () => {
  let v!: TemporalValue;
  let out!: Observation;
  return {
    steps: [
      Given('a PlainDate "<value>"', (r) => {
        v = value('PlainDate', r.value);
      }),
      When('<function> is called', (r) => {
        out = observe(() => api[r.function](v));
      }),
      Then('the result is PlainDate "<result>"', (r) => {
        equal(returned(out), value('PlainDate', r.result));
      }),
    ],
  };
});

registerScenario<ExampleRows['BND-005']>('BND-005', () => {
  let v!: TemporalValue;
  let out!: Observation;
  return {
    steps: [
      Given('a PlainYearMonth "<value>"', (r) => {
        v = value('PlainYearMonth', r.value);
      }),
      When('<function> is called', (r) => {
        out = observe(() => api[r.function](v));
      }),
      Then('the result is PlainYearMonth "<result>"', (r) => {
        equal(returned(out), value('PlainYearMonth', r.result));
      }),
    ],
  };
});

registerScenario<ExampleRows['BND-006']>('BND-006', () => {
  let v!: TemporalValue;
  let out!: Observation;
  return {
    steps: [
      Given('a PlainTime "<value>"', (r) => {
        v = value('PlainTime', r.value);
      }),
      When('endOfDay is called', () => {
        out = observe(() => api['endOfDay'](v));
      }),
      Then('the result is PlainTime "23:59:59.999999999"', () => {
        equal(returned(out), value('PlainTime', '23:59:59.999999999'));
      }),
    ],
  };
});

registerScenario<ExampleRows['BND-007']>('BND-007', () => {
  let v!: TemporalValue;
  let out!: Observation;
  return {
    steps: [
      Given('a ZonedDateTime "<value>"', (r) => {
        v = zoned(r.value);
      }),
      When('endOfDay is called', () => {
        out = observe(() => api.endOfDay(v));
      }),
      Then('the result has local time "23:59:59.999999999" and offset "<offset>"', (r) => {
        const result = asTemporal(returned(out), 'ZonedDateTime');
        expect(result.toPlainTime().toString()).toBe('23:59:59.999999999');
        expect(result.offset).toBe(r.offset);
      }),
      Then(
        "it is <hours> elapsed hours minus one nanosecond after that day's earliest valid instant",
        (r) => {
          expect(
            asTemporal(returned(out), 'ZonedDateTime').epochNanoseconds -
              asTemporal(v, 'ZonedDateTime').startOfDay().epochNanoseconds,
          ).toBe(BigInt(r.hours) * 3600000000000n - 1n);
        },
      ),
      Then('its zone remains "America/New_York"', () => {
        expect(asTemporal(returned(out), 'ZonedDateTime').timeZoneId).toBe('America/New_York');
      }),
    ],
  };
});

registerScenario<ExampleRows['BND-008']>('BND-008', () => {
  let v!: TemporalValue;
  let out!: Observation;
  return {
    steps: [
      Given('a ZonedDateTime "2018-11-04T12:00[America/Sao_Paulo]"', () => {
        v = zoned('2018-11-04T12:00[America/Sao_Paulo]');
      }),
      Given('the host data skips midnight on that date', () => {
        expect(asTemporal(v, 'ZonedDateTime').startOfDay().hour).toBe(1);
      }),
      When('startOfWeek is called with default Sunday week start', () => {
        out = observe(() => api.startOfWeek(v));
      }),
      Then('the result is ZonedDateTime "2018-11-04T01:00-02:00[America/Sao_Paulo]"', () => {
        equal(returned(out), zoned('2018-11-04T01:00-02:00[America/Sao_Paulo]'));
      }),
    ],
  };
});

registerScenario<ExampleRows['BND-009']>('BND-009', () => {
  let v!: TemporalValue;
  let out!: Observation;
  return {
    steps: [
      Given('a ZonedDateTime "2011-12-29T12:00[Pacific/Apia]"', () => {
        v = zoned('2011-12-29T12:00[Pacific/Apia]');
      }),
      Given('the host data skips all of December 30, 2011 in that zone', () => {
        expect(asTemporal(v, 'ZonedDateTime').add({ days: 1 }).day).toBe(31);
      }),
      When('endOfDay is called', () => {
        out = observe(() => api.endOfDay(v));
      }),
      Then('the result is one nanosecond before "2011-12-31T00:00+14:00[Pacific/Apia]"', () => {
        equal(
          returned(out),
          zoned('2011-12-31T00:00+14:00[Pacific/Apia]').subtract({ nanoseconds: 1 }),
        );
      }),
      Then('its displayed date is "2011-12-29"', () => {
        expect(asTemporal(returned(out), 'ZonedDateTime').toPlainDate().toString()).toBe(
          '2011-12-29',
        );
      }),
    ],
  };
});

registerScenario<ExampleRows['BND-010']>('BND-010', () => {
  let v!: TemporalValue;
  let out!: Observation;
  return {
    steps: [
      Given('a PlainDate "-271821-04-19"', () => {
        v = value('PlainDate', '-271821-04-19');
      }),
      When('<function> is called', (r) => {
        out = observe(() => api[r.function](v));
      }),
      Then('the result is PlainDate "<result>"', (r) => {
        equal(returned(out), value('PlainDate', r.result));
      }),
    ],
  };
});

registerScenario<ExampleRows['BND-011']>('BND-011', () => {
  let v!: TemporalValue;
  let out!: Observation;
  return {
    steps: [
      Given('a PlainDateTime "+275760-09-13T12:00"', () => {
        v = value('PlainDateTime', '+275760-09-13T12:00');
      }),
      When('endOfDay is called', () => {
        out = observe(() => api['endOfDay'](v));
      }),
      Then('the result is PlainDateTime "+275760-09-13T23:59:59.999999999"', () => {
        equal(returned(out), value('PlainDateTime', '+275760-09-13T23:59:59.999999999'));
      }),
    ],
  };
});

registerScenario<ExampleRows['BND-012']>('BND-012', () => {
  let v!: TemporalValue;
  let out!: Observation;
  return {
    steps: [
      Given('a PlainDate "2026-05-13"', () => {
        v = value('PlainDate', '2026-05-13');
      }),
      When('<function> is called with weekStartsOn <weekday>', (r) => {
        out = observe(() => api[r.function](v, { weekStartsOn: literal(r.weekday) }));
      }),
      Then('the call throws an invalid-option error', () => {
        failed(out);
      }),
    ],
  };
});

registerScenario<ExampleRows['BND-013']>('BND-013', () => {
  let v!: TemporalValue;
  let out!: Observation;
  return {
    steps: [
      Given('a PlainDate "<value>"', (r) => {
        v = value('PlainDate', r.value);
      }),
      When('<function> is called', (r) => {
        out = observe(() => api[r.function](v));
      }),
      Then('it throws RangeError', () => {
        failed(out, RangeError);
      }),
      Then('it does not return a clipped date at the representable limit', () => {
        expect(out.value).toBeUndefined();
      }),
    ],
  };
});

registerScenario<ExampleRows['BND-014']>('BND-014', () => {
  let v!: TemporalValue;
  let out!: Observation;
  return {
    steps: [
      Given('the maximum representable Instant viewed as a ZonedDateTime in UTC', () => {
        v = T.Instant.fromEpochNanoseconds(8640000000000000000000n).toZonedDateTimeISO('UTC');
      }),
      When('endOfDay is called', () => {
        out = observe(() => api.endOfDay(v));
      }),
      Then('it throws RangeError', () => {
        failed(out, RangeError);
      }),
      Then('it does not substitute the maximum instant for the actual day end', () => {
        expect(out.value).toBeUndefined();
      }),
    ],
  };
});

registerScenario<ExampleRows['BND-015']>('BND-015', () => {
  let v!: TemporalValue;
  let out!: Observation;
  return {
    steps: [
      Given('a ZonedDateTime "2026-05-13T14:24:36.123456789[America/New_York]"', () => {
        v = value('ZonedDateTime', '2026-05-13T14:24:36.123456789[America/New_York]');
      }),
      When('<function> is called with omitted options', (r) => {
        out = observe(() => api[r.function](v));
      }),
      Then('the result is ZonedDateTime "<result>[America/New_York]"', (r) => {
        equal(returned(out), value('ZonedDateTime', r.result + '[America/New_York]'));
      }),
    ],
  };
});

registerScenario<ExampleRows['BND-016']>('BND-016', () => {
  let v!: TemporalValue;
  let out!: Observation;
  return {
    steps: [
      Given('a PlainDate "+275760-09-13"', () => {
        v = date('+275760-09-13');
      }),
      When('endOfWeek is called with omitted options', () => {
        out = observe(() => api.endOfWeek(v));
      }),
      Then('the result is PlainDate "+275760-09-13"', () => {
        equal(returned(out), date('+275760-09-13'));
      }),
      When('endOfISOWeek is called', () => {
        out = observe(() => api.endOfISOWeek(v));
      }),
      Then('it throws RangeError because its required Sunday is outside the range', () => {
        failed(out, RangeError);
      }),
    ],
  };
});
