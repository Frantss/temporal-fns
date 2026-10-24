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
import { api, asTemporal, dt, instant, options, value, zoned } from './support.js';

registerScenario<ExampleRows['FMT-001']>('FMT-001', () => {
  let v!: TemporalValue;
  let out!: Observation;
  return {
    steps: [
      Given('a PlainDateTime "2026-10-23T12:03:04.005006007"', () => {
        v = value('PlainDateTime', '2026-10-23T12:03:04.005006007');
      }),
      When('format is called with pattern "<pattern>" and omitted options', (r) => {
        out = observe(() => api.format(v, r.pattern));
      }),
      Then('the returned text is "<text>"', (r) => {
        expect(returned(out)).toBe(r.text);
      }),
    ],
  };
});

registerScenario<ExampleRows['FMT-002']>('FMT-002', () => {
  let v!: TemporalValue;
  let out!: Observation;
  return {
    steps: [
      Given('a PlainDateTime "<value>"', (r) => {
        v = value('PlainDateTime', r.value);
      }),
      When('format is called with pattern "<pattern>"', (r) => {
        out = observe(() => api.format(v, r.pattern));
      }),
      Then('the returned text is "<text>"', (r) => {
        expect(returned(out)).toBe(r.text);
      }),
    ],
  };
});

registerScenario<ExampleRows['FMT-003']>('FMT-003', () => {
  let v!: TemporalValue;
  let out!: Observation;
  return {
    steps: [
      Given('a PlainDate "<value>"', (r) => {
        v = value('PlainDate', r.value);
      }),
      When('format is called with pattern "yyyy yy"', () => {
        out = observe(() => api.format(v, 'yyyy yy'));
      }),
      Then('the returned text is "<text>"', (r) => {
        expect(returned(out)).toBe(r.text);
      }),
    ],
  };
});

registerScenario<ExampleRows['FMT-004']>('FMT-004', () => {
  let v!: TemporalValue;
  let out!: Observation;
  return {
    steps: [
      Given('a PlainDateTime "2026-10-23T12:03:00"', () => {
        v = value('PlainDateTime', '2026-10-23T12:03:00');
      }),
      When('format is called with pattern "<pattern>"', (r) => {
        out = observe(() => api.format(v, r.pattern));
      }),
      Then('the returned text is "<text>"', (r) => {
        expect(returned(out)).toBe(r.text);
      }),
    ],
  };
});

registerScenario<ExampleRows['FMT-005']>('FMT-005', () => {
  let v!: TemporalValue;
  let out!: Observation;
  return {
    steps: [
      Given('a <kind> "<value>"', (r) => {
        v = value(r.kind, r.value);
      }),
      When('format is called with pattern "<pattern>"', (r) => {
        out = observe(() => api.format(v, r.pattern));
      }),
      Then('the returned text is "<text>"', (r) => {
        expect(returned(out)).toBe(r.text);
      }),
    ],
  };
});

registerScenario<ExampleRows['FMT-006']>('FMT-006', () => {
  let v!: TemporalValue;
  let out!: Observation;
  return {
    steps: [
      Given('a <kind> "<value>"', (r) => {
        v = value(r.kind, r.value);
      }),
      When('format is called with pattern "<pattern>"', (r) => {
        out = observe(() => api.format(v, r.pattern));
      }),
      Then('the call throws an incompatible-pattern error', () => {
        failed(out);
      }),
    ],
  };
});

registerScenario<ExampleRows['FMT-007']>('FMT-007', () => {
  let v!: TemporalValue;
  let out!: Observation;
  return {
    steps: [
      Given('a PlainDateTime "2026-10-23T12:00"', () => {
        v = value('PlainDateTime', '2026-10-23T12:00');
      }),
      When('format is called with pattern "<pattern>"', (r) => {
        out = observe(() => api.format(v, r.pattern));
      }),
      Then('the call throws an invalid-pattern error', () => {
        failed(out);
      }),
    ],
  };
});

registerScenario<ExampleRows['FMT-008']>('FMT-008', () => {
  let v!: TemporalValue;
  let out!: Observation;
  return {
    steps: [
      Given('an Instant "2026-10-24T01:00Z"', () => {
        v = value('Instant', '2026-10-24T01:00Z');
      }),
      When('format is called with pattern "yyyy-MM-dd HH:mm XXX" and timeZone "<zone>"', (r) => {
        out = observe(() => api.format(v, 'yyyy-MM-dd HH:mm XXX', { timeZone: r.zone }));
      }),
      Then('the returned text is "<text>"', (r) => {
        expect(returned(out)).toBe(r.text);
      }),
    ],
  };
});

registerScenario<ExampleRows['FMT-009']>('FMT-009', () => {
  let v!: TemporalValue;
  let out!: Observation;
  return {
    steps: [
      Given('an Instant "2026-10-24T01:00Z"', () => {
        v = value('Instant', '2026-10-24T01:00Z');
      }),
      When('format is called with pattern "yyyy-MM-dd" and omitted timeZone', () => {
        out = observe(() => api.format(v, 'yyyy-MM-dd'));
      }),
      Then('the call throws a missing-zone error', () => {
        failed(out);
      }),
    ],
  };
});

registerScenario<ExampleRows['FMT-010']>('FMT-010', () => {
  let v!: TemporalValue;
  let out!: Observation;
  return {
    steps: [
      Given('a ZonedDateTime "2026-10-23T22:00-03:00[America/Montevideo]"', () => {
        v = zoned('2026-10-23T22:00-03:00[America/Montevideo]');
      }),
      When('format is called with pattern "yyyy-MM-dd HH:mm" and omitted options', () => {
        out = observe(() => api.format(v, 'yyyy-MM-dd HH:mm'));
      }),
      Then('the returned text is "2026-10-23 22:00"', () => {
        expect(returned(out)).toBe('2026-10-23 22:00');
      }),
      When('format is called with the same value and pattern and timeZone "UTC"', () => {
        out = observe(() => api.format(v, 'yyyy-MM-dd HH:mm', { timeZone: 'UTC' }));
      }),
      Then('the returned text is "2026-10-24 01:00"', () => {
        expect(returned(out)).toBe('2026-10-24 01:00');
      }),
      Then('the original value still has zone "America/Montevideo" and hour 22', () => {
        expect(asTemporal(v, 'ZonedDateTime').timeZoneId).toBe('America/Montevideo');
        expect(asTemporal(v, 'ZonedDateTime').hour).toBe(22);
      }),
    ],
  };
});

registerScenario<ExampleRows['FMT-011']>('FMT-011', () => {
  let v!: TemporalValue;
  let out!: Observation;
  return {
    steps: [
      Given('a <kind> "<value>"', (r) => {
        v = value(r.kind, r.value);
      }),
      When('format is called with pattern "<pattern>" and timeZone "UTC"', (r) => {
        out = observe(() => api.format(v, r.pattern, { timeZone: 'UTC' }));
      }),
      Then('the call throws an invalid-zone-context error', () => {
        failed(out);
      }),
    ],
  };
});

registerScenario<ExampleRows['FMT-012']>('FMT-012', () => {
  let v!: TemporalValue;
  let out!: Observation;
  return {
    steps: [
      Given('a <kind> "<value>"', (r) => {
        v = value(r.kind, r.value);
      }),
      When('format is called with pattern "<pattern>" and locale "<locale>"', (r) => {
        out = observe(() => api.format(v, r.pattern, { locale: r.locale }));
      }),
      Then('the returned text is "<text>"', (r) => {
        expect(returned(out)).toBe(r.text);
      }),
    ],
  };
});

registerScenario<ExampleRows['FMT-013']>('FMT-013', () => {
  let v!: TemporalValue;
  let out!: Observation;
  return {
    steps: [
      Given('a PlainDate "2026-10-23"', () => {
        v = value('PlainDate', '2026-10-23');
      }),
      When('format is called with pattern "yyyy-MM-dd" and locale "ar-EG"', () => {
        out = observe(() => api.format(v, 'yyyy-MM-dd', { locale: 'ar-EG' }));
      }),
      Then('the returned text is "2026-10-23"', () => {
        expect(returned(out)).toBe('2026-10-23');
      }),
    ],
  };
});

registerScenario<ExampleRows['FMT-014']>('FMT-014', () => {
  let v!: TemporalValue;
  let out!: Observation;
  return {
    steps: [
      Given('a ZonedDateTime "<value>"', (r) => {
        v = value('ZonedDateTime', r.value);
      }),
      When('format is called with pattern "XX XXX"', () => {
        out = observe(() => api.format(v, 'XX XXX'));
      }),
      Then('the returned text is "<text>"', (r) => {
        expect(returned(out)).toBe(r.text);
      }),
    ],
  };
});

registerScenario<ExampleRows['FMT-015']>('FMT-015', () => {
  let v!: TemporalValue;
  let out!: Observation;
  let i!: ReturnType<typeof instant>;
  let offset!: string;
  return {
    steps: [
      Given(
        'host time-zone data assigns offset "+00:09:21" to Paris at Instant "1890-01-01T00:00Z"',
        () => {
          i = instant('1890-01-01T00:00Z');
          expect(i.toZonedDateTimeISO('Europe/Paris').offset).toBe('+00:09:21');
        },
      ),
      Given('that instant is viewed as a ZonedDateTime in "Europe/Paris"', () => {
        v = i.toZonedDateTimeISO('Europe/Paris');
        offset = asTemporal(v, 'ZonedDateTime').offset;
      }),
      When('format is called with pattern "XX XXX"', () => {
        out = observe(() => api.format(v, 'XX XXX'));
      }),
      Then('the returned text is "+0009 +00:09"', () => {
        expect(returned(out)).toBe('+0009 +00:09');
      }),
      Then('the original value retains its full offset', () => {
        expect(asTemporal(v, 'ZonedDateTime').offset).toBe(offset);
      }),
    ],
  };
});

registerScenario<ExampleRows['FMT-016']>('FMT-016', () => {
  let v!: TemporalValue;
  let out!: Observation;
  return {
    steps: [
      Given('a PlainDateTime "2026-10-23T12:03:04.005006007"', () => {
        v = dt('2026-10-23T12:03:04.005006007');
      }),
      When('format is called with pattern "SSS"', () => {
        out = observe(() => api.format(v, 'SSS'));
      }),
      Then('the returned text is "005"', () => {
        expect(returned(out)).toBe('005');
      }),
      Then('the input remains "2026-10-23T12:03:04.005006007"', () => {
        expect(v.toString()).toBe('2026-10-23T12:03:04.005006007');
      }),
    ],
  };
});

registerScenario<ExampleRows['FMT-017']>('FMT-017', () => {
  let v!: TemporalValue;
  let out!: Observation;
  return {
    steps: [
      Given('an Instant "2026-10-23T12:00Z"', () => {
        v = value('Instant', '2026-10-23T12:00Z');
      }),
      When('format is called with pattern "yyyy-MM-dd" and <options>', (r) => {
        out = observe(() => api.format(v, 'yyyy-MM-dd', options(r.options)));
      }),
      Then('it throws an invalid-option error', () => {
        failed(out);
      }),
    ],
  };
});
