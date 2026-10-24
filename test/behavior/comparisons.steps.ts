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
import { api, asTemporal, date, dt, instant, ym } from './support.js';

registerScenario<ExampleRows['CMP-001']>('CMP-001', () => {
  let a!: TemporalValue;
  let b!: TemporalValue;
  let out!: Observation;
  return {
    steps: [
      Given('PlainDate values "<first>" and "<second>"', (r) => {
        a = date(r.first);
        b = date(r.second);
      }),
      When('<function> is called with those values', (r) => {
        out = observe(() => api[r.function](a, b));
      }),
      Then('the result is <result>', (r) => {
        expect(returned(out)).toBe(r.result === 'true');
      }),
    ],
  };
});

registerScenario<ExampleRows['CMP-002']>('CMP-002', () => {
  let a!: TemporalValue;
  let b!: TemporalValue;
  let out!: Observation;
  return {
    steps: [
      Given('PlainDateTime values "2026-10-23T00:00" and "2026-10-23T23:59:59.999999999"', () => {
        a = dt('2026-10-23T00:00');
        b = dt('2026-10-23T23:59:59.999999999');
      }),
      When('<function> is called', (r) => {
        out = observe(() => api[r.function](a, b));
      }),
      Then('the result is true', () => {
        expect(returned(out)).toBe(true);
      }),
    ],
  };
});

registerScenario<ExampleRows['CMP-003']>('CMP-003', () => {
  let a!: TemporalValue;
  let b!: TemporalValue;
  let out!: Observation;
  return {
    steps: [
      Given('PlainDate values "2025-12-31" and "2026-01-01"', () => {
        a = date('2025-12-31');
        b = date('2026-01-01');
      }),
      When('<function> is called', (r) => {
        out = observe(() => api[r.function](a, b));
      }),
      Then('the result is true', () => {
        expect(returned(out)).toBe(true);
      }),
    ],
  };
});

registerScenario<ExampleRows['CMP-004']>('CMP-004', () => {
  let a!: TemporalValue;
  let b!: TemporalValue;
  let out!: Observation;
  return {
    steps: [
      Given('PlainDate values "2025-01-01" and "2026-01-01"', () => {
        a = date('2025-01-01');
        b = date('2026-01-01');
      }),
      Given('each has ISO week number 1', () => {
        expect(asTemporal(a, 'PlainDate').weekOfYear).toBe(1);
        expect(asTemporal(b, 'PlainDate').weekOfYear).toBe(1);
      }),
      When('isSameISOWeek is called', () => {
        out = observe(() => api.isSameISOWeek(a, b));
      }),
      Then('the result is false', () => {
        expect(returned(out)).toBe(false);
      }),
    ],
  };
});

registerScenario<ExampleRows['CMP-005']>('CMP-005', () => {
  let a!: TemporalValue;
  let b!: TemporalValue;
  let out!: Observation;
  return {
    steps: [
      Given('PlainDate values "2026-10-24" and "2026-10-25"', () => {
        a = date('2026-10-24');
        b = date('2026-10-25');
      }),
      When('isSameWeek is called with weekStartsOn <weekday>', (r) => {
        out = observe(() => api['isSameWeek'](a, b, { weekStartsOn: Number(r.weekday) }));
      }),
      Then('the result is <result>', (r) => {
        expect(returned(out)).toBe(r.result === 'true');
      }),
    ],
  };
});

registerScenario<ExampleRows['CMP-011']>('CMP-011', () => {
  let a!: TemporalValue;
  let b!: TemporalValue;
  let out!: Observation;
  return {
    steps: [
      Given('two Instants both equal to "2026-10-23T12:00Z"', () => {
        a = instant('2026-10-23T12:00Z');
        b = instant('2026-10-23T12:00Z');
      }),
      When('<function> is called with omitted timeZone', (r) => {
        out = observe(() => api[r.function](a, b));
      }),
      Then('it throws a missing-zone error', () => {
        failed(out);
      }),
    ],
  };
});

registerScenario<ExampleRows['CMP-012']>('CMP-012', () => {
  let a!: TemporalValue;
  let b!: TemporalValue;
  let out!: Observation;
  return {
    steps: [
      Given('two PlainDate values both equal to "2026-10-23"', () => {
        a = date('2026-10-23');
        b = date('2026-10-23');
      }),
      When('<function> is called with timeZone "UTC"', (r) => {
        out = observe(() => api[r.function](a, b, { timeZone: 'UTC' }));
      }),
      Then('it throws an invalid-zone-context error', () => {
        failed(out);
      }),
    ],
  };
});

registerScenario<ExampleRows['CMP-006']>('CMP-006', () => {
  let a!: TemporalValue;
  let b!: TemporalValue;
  let out!: Observation;
  return {
    steps: [
      Given('PlainYearMonth values "2026-10" and "<other>"', (r) => {
        a = ym('2026-10');
        b = ym(r.other);
      }),
      When('<function> is called', (r) => {
        out = observe(() => api[r.function](a, b));
      }),
      Then('the result is <result>', (r) => {
        expect(returned(out)).toBe(r.result === 'true');
      }),
    ],
  };
});

registerScenario<ExampleRows['CMP-007']>('CMP-007', () => {
  let a!: TemporalValue;
  let b!: TemporalValue;
  let out!: Observation;
  return {
    steps: [
      Given('Instants "2026-01-01T00:30Z" and "2026-01-01T03:30Z"', () => {
        a = instant('2026-01-01T00:30Z');
        b = instant('2026-01-01T03:30Z');
      }),
      When('isSameDay is called with timeZone "<zone>"', (r) => {
        out = observe(() => api['isSameDay'](a, b, { timeZone: r.zone }));
      }),
      Then('the result is <result>', (r) => {
        expect(returned(out)).toBe(r.result === 'true');
      }),
    ],
  };
});

registerScenario<ExampleRows['CMP-008']>('CMP-008', () => {
  let a!: TemporalValue;
  let b!: TemporalValue;
  let out!: Observation;
  return {
    steps: [
      Given('the same Instant "2026-01-01T01:00Z" viewed in UTC and America/New_York', () => {
        a = instant('2026-01-01T01:00Z').toZonedDateTimeISO('UTC');
        b = instant('2026-01-01T01:00Z').toZonedDateTimeISO('America/New_York');
      }),
      When('<function> is called with those ZonedDateTime values and omitted timeZone', (r) => {
        out = observe(() => api[r.function](a, b));
      }),
      Then('it throws a missing-common-zone error', () => {
        failed(out);
      }),
      When('<function> is called with those values and timeZone "UTC"', (r) => {
        out = observe(() => api[r.function](a, b, { timeZone: 'UTC' }));
      }),
      Then('the result is true', () => {
        expect(returned(out)).toBe(true);
      }),
      Then("neither input's zone changes", () => {
        expect(asTemporal(a, 'ZonedDateTime').timeZoneId).toBe('UTC');
        expect(asTemporal(b, 'ZonedDateTime').timeZoneId).toBe('America/New_York');
      }),
    ],
  };
});

registerScenario<ExampleRows['CMP-009']>('CMP-009', () => {
  let a!: TemporalValue;
  let b!: TemporalValue;
  let out!: Observation;
  return {
    steps: [
      Given('a PlainDate "2026-10-23" and a PlainDateTime "2026-10-23T00:00"', () => {
        a = date('2026-10-23');
        b = dt('2026-10-23T00:00');
      }),
      When('<function> is called with those values', (r) => {
        out = observe(() => api[r.function](a, b));
      }),
      Then('it throws an incompatible-kind error', () => {
        failed(out);
      }),
    ],
  };
});

registerScenario<ExampleRows['CMP-010']>('CMP-010', () => {
  let a!: TemporalValue;
  let b!: TemporalValue;
  let out!: Observation;
  return {
    steps: [
      Given('PlainDate values "-271821-04-19" and "-271821-04-20"', () => {
        a = date('-271821-04-19');
        b = date('-271821-04-20');
      }),
      When('isSameWeek is called with weekStartsOn <weekday>', (r) => {
        out = observe(() => api['isSameWeek'](a, b, { weekStartsOn: Number(r.weekday) }));
      }),
      Then('the result is <result>', (r) => {
        expect(returned(out)).toBe(r.result === 'true');
      }),
    ],
  };
});
