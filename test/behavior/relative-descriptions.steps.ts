import { expect } from 'vitest';
import { assertNative, observeNative, type NativeObservation } from './assertions.js';
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
import { clock, nativeTotal } from './relative-support.js';
import type { TemporalValue } from './support.js';
import {
  api,
  asTemporal,
  date,
  dt,
  instant,
  options,
  value,
  withNow,
  withZone,
  zoned,
} from './support.js';

registerScenario<ExampleRows['REL-001']>('REL-001', () => {
  let b!: TemporalValue;
  let v!: TemporalValue;
  let out!: Observation;
  return {
    steps: [
      Given('a PlainDateTime base "2026-01-01T00:00"', () => {
        b = value('PlainDateTime', '2026-01-01T00:00');
      }),
      Given('a value <seconds> wall-clock seconds after the base', (r) => {
        v = asTemporal(b, 'PlainDateTime').add({ seconds: Number(r.seconds) });
      }),
      When('formatDistance is called with omitted options', () => {
        out = observe(() => api['formatDistance'](v, b));
      }),
      Then('the text is "<text>"', (r) => {
        expect(returned(out)).toBe(r.text);
      }),
    ],
  };
});

registerScenario<ExampleRows['REL-002']>('REL-002', () => {
  let b!: TemporalValue;
  let v!: TemporalValue;
  let out!: Observation;
  return {
    steps: [
      Given('a PlainDateTime base "2026-01-01T00:00"', () => {
        b = value('PlainDateTime', '2026-01-01T00:00');
      }),
      Given('a value <seconds> seconds after the base', (r) => {
        v = asTemporal(b, 'PlainDateTime').add({ seconds: Number(r.seconds) });
      }),
      When('formatDistance is called with includeSeconds true', () => {
        out = observe(() => api['formatDistance'](v, b, { includeSeconds: true }));
      }),
      Then('the text is "<text>"', (r) => {
        expect(returned(out)).toBe(r.text);
      }),
    ],
  };
});

registerScenario<ExampleRows['REL-003']>('REL-003', () => {
  let b!: TemporalValue;
  let v!: TemporalValue;
  let out!: Observation;
  return {
    steps: [
      Given('a PlainDateTime base "2026-01-01T00:00"', () => {
        b = value('PlainDateTime', '2026-01-01T00:00');
      }),
      Given('a value <seconds> seconds relative to the base', (r) => {
        v = asTemporal(b, 'PlainDateTime').add({ seconds: Number(r.seconds) });
      }),
      When('<function> is called with <options>', (r) => {
        out = observe(() => api[r.function](v, b, options(r.options)));
      }),
      Then('the text is "<text>"', (r) => {
        expect(returned(out)).toBe(r.text);
      }),
    ],
  };
});

registerScenario<ExampleRows['REL-004']>('REL-004', () => {
  let b!: TemporalValue;
  let v!: TemporalValue;
  let out!: Observation;
  return {
    steps: [
      Given('a PlainDateTime base "2026-01-01T00:00"', () => {
        b = value('PlainDateTime', '2026-01-01T00:00');
      }),
      Given('a value <seconds> seconds after the base', (r) => {
        v = asTemporal(b, 'PlainDateTime').add({ seconds: Number(r.seconds) });
      }),
      When('formatDistanceStrict is called with omitted options', () => {
        out = observe(() => api['formatDistanceStrict'](v, b));
      }),
      Then('the text is "<text>"', (r) => {
        expect(returned(out)).toBe(r.text);
      }),
    ],
  };
});

registerScenario<ExampleRows['REL-005']>('REL-005', () => {
  let b!: TemporalValue;
  let v!: TemporalValue;
  let out!: Observation;
  return {
    steps: [
      Given('a PlainDateTime base "2026-01-01T00:00"', () => {
        b = value('PlainDateTime', '2026-01-01T00:00');
      }),
      Given('a value <seconds> seconds relative to the base', (r) => {
        v = asTemporal(b, 'PlainDateTime').add({ seconds: Number(r.seconds) });
      }),
      When(
        'formatDistanceStrict is called with unit minute, roundingMethod "<rounding>" and addSuffix true',
        (r) => {
          out = observe(() =>
            api['formatDistanceStrict'](v, b, {
              unit: 'minute',
              roundingMethod: r.rounding,
              addSuffix: true,
            }),
          );
        },
      ),
      Then('the text is "<text>"', (r) => {
        expect(returned(out)).toBe(r.text);
      }),
    ],
  };
});

registerScenario<ExampleRows['REL-006']>('REL-006', () => {
  let b!: TemporalValue;
  let v!: TemporalValue;
  let out!: Observation;
  return {
    steps: [
      Given('a PlainDateTime base "2026-01-01T00:00"', () => {
        b = value('PlainDateTime', '2026-01-01T00:00');
      }),
      Given('value "2026-01-03T00:00"', () => {
        v = dt('2026-01-03T00:00');
      }),
      When('formatDistanceStrict is called with unit "<unit>"', (r) => {
        out = observe(() => api['formatDistanceStrict'](v, b, { unit: r.unit }));
      }),
      Then('the text is "<text>"', (r) => {
        expect(returned(out)).toBe(r.text);
      }),
    ],
  };
});

registerScenario<ExampleRows['REL-007']>('REL-007', () => {
  let b!: TemporalValue;
  let v!: TemporalValue;
  let out!: Observation;
  return {
    steps: [
      Given('PlainDate base "<base>" and value "<value>"', (r) => {
        b = value('PlainDate', r.base);
        v = value('PlainDate', r.value);
      }),
      When('formatDistanceStrict is called with unit "<unit>"', (r) => {
        out = observe(() => api.formatDistanceStrict(v, b, { unit: r.unit }));
      }),
      Then('the text is "<text>"', (r) => {
        expect(returned(out)).toBe(r.text);
      }),
    ],
  };
});

registerScenario<ExampleRows['REL-008']>('REL-008', () => {
  let b!: TemporalValue;
  let v!: TemporalValue;
  let out!: Observation;
  return {
    steps: [
      Given('ZonedDateTime base "<base>" and value one calendar day later', (r) => {
        b = value('ZonedDateTime', r.base);
        v = asTemporal(b, 'ZonedDateTime').add({ days: 1 });
      }),
      When('formatDistanceStrict is called with unit "<unit>"', (r) => {
        out = observe(() => api.formatDistanceStrict(v, b, { unit: r.unit }));
      }),
      Then('the text is "<text>"', (r) => {
        expect(returned(out)).toBe(r.text);
      }),
    ],
  };
});

registerScenario<ExampleRows['REL-009']>('REL-009', () => {
  let b!: TemporalValue;
  let v!: TemporalValue;
  let out!: Observation;
  let results!: Observation[];
  return {
    steps: [
      Given('PlainDateTime base "2026-03-07T12:00" and value "2026-03-08T12:00"', () => {
        b = dt('2026-03-07T12:00');
        v = dt('2026-03-08T12:00');
      }),
      When('formatDistanceStrict is called with unit hour', () => {
        out = observe(() => api.formatDistanceStrict(v, b, { unit: 'hour' }));
        results = ['UTC', 'America/New_York'].map((zone) =>
          observe(() => withZone(zone, () => api.formatDistanceStrict(v, b, { unit: 'hour' }))),
        );
      }),
      Then('the text is "24 hours"', () => {
        expect(returned(out)).toBe('24 hours');
      }),
      Then('no host time zone changes that result', () => {
        results.forEach((o) => expect(returned(o)).toBe('24 hours'));
      }),
    ],
  };
});

registerScenario<ExampleRows['REL-010']>('REL-010', () => {
  let b!: TemporalValue;
  let v!: TemporalValue;
  let out!: Observation;
  return {
    steps: [
      Given('a PlainDate base "2026-10-23"', () => {
        b = value('PlainDate', '2026-10-23');
      }),
      Given('a value <days> calendar days relative to the base', (r) => {
        v = asTemporal(b, 'PlainDate').add({ days: Number(r.days) });
      }),
      When('formatRelative is called', () => {
        out = observe(() => api['formatRelative'](v, b));
      }),
      Then('the text is "<text>"', (r) => {
        expect(returned(out)).toBe(r.text);
      }),
    ],
  };
});

registerScenario<ExampleRows['REL-011']>('REL-011', () => {
  let b!: TemporalValue;
  let v!: TemporalValue;
  let out!: Observation;
  return {
    steps: [
      Given('a PlainDateTime base "2026-10-23T08:00"', () => {
        b = dt('2026-10-23T08:00');
      }),
      Given('a PlainDateTime value "<value>"', (r) => {
        v = dt(r.value);
      }),
      When('formatRelative is called with locale "en-US"', () => {
        out = observe(() => api.formatRelative(v, b, { locale: 'en-US' }));
      }),
      Then('the date phrase is "<date phrase>"', (r) => {
        expect((returned(out) as string).split(' at ')[0]).toBe(r['date phrase']);
      }),
      Then('it is followed by " at " and a locale rendering of 2:30 PM', (r) => {
        clock(returned(out) as string, r['date phrase'], 14, 30);
      }),
    ],
  };
});

registerScenario<ExampleRows['REL-012']>('REL-012', () => {
  let b!: TemporalValue;
  let v!: TemporalValue;
  let out!: Observation;
  return {
    steps: [
      Given('Instant value "2026-10-24T01:00Z" and base "2026-10-23T23:00Z"', () => {
        v = instant('2026-10-24T01:00Z');
        b = instant('2026-10-23T23:00Z');
      }),
      When('formatRelative is called with timeZone "America/Montevideo"', () => {
        out = observe(() => api.formatRelative(v, b, { timeZone: 'America/Montevideo' }));
      }),
      Then('the text has date phrase "today" and clock text for 10:00 PM', () => {
        clock(returned(out) as string, 'today', 22);
      }),
      When('the same call uses timeZone "UTC"', () => {
        out = observe(() => api.formatRelative(v, b, { timeZone: 'UTC' }));
      }),
      Then('the text has date phrase "tomorrow" and clock text for 1:00 AM', () => {
        clock(returned(out) as string, 'tomorrow', 1);
      }),
    ],
  };
});

registerScenario<ExampleRows['REL-013']>('REL-013', () => {
  let b!: TemporalValue;
  let v!: TemporalValue;
  let out!: Observation;
  return {
    steps: [
      Given('a PlainDate "2026-10-23" and ZonedDateTime "2026-10-23T12:00[UTC]"', () => {
        v = date('2026-10-23');
        b = zoned('2026-10-23T12:00[UTC]');
      }),
      When('<function> is called with those two values', (r) => {
        out = observe(() => api[r.function](v, b));
      }),
      Then('it throws an incompatible-kind error', () => {
        failed(out);
      }),
    ],
  };
});

registerScenario<ExampleRows['REL-014']>('REL-014', () => {
  let b!: TemporalValue;
  let v!: TemporalValue;
  let out!: Observation;
  return {
    steps: [
      Given('the same Instant "2026-01-01T01:00Z" viewed in UTC and America/New_York', () => {
        v = instant('2026-01-01T01:00Z').toZonedDateTimeISO('UTC');
        b = instant('2026-01-01T01:00Z').toZonedDateTimeISO('America/New_York');
      }),
      When('<function> is called with those ZonedDateTime values and omitted timeZone', (r) => {
        out = observe(() => api[r.function](v, b));
      }),
      Then('it throws a missing-common-zone error', () => {
        failed(out);
      }),
      When('it is called with timeZone "UTC"', (r) => {
        out = observe(() => api[r.function](v, b, { timeZone: 'UTC' }));
      }),
      Then('the text is "<text>"', (r) => {
        expect(returned(out)).toBe(r.text);
      }),
    ],
  };
});

registerScenario<ExampleRows['REL-015']>('REL-015', () => {
  let v!: TemporalValue;
  let out!: Observation;
  let now!: string;
  return {
    steps: [
      Given('the current instant is "2026-10-23T12:00Z"', () => {
        now = '2026-10-23T12:00Z';
      }),
      Given('a <kind> value "<value>"', (r) => {
        v = value(r.kind, r.value);
      }),
      When('formatDistanceToNow is called with timeZone "UTC" and addSuffix true', () => {
        out = observe(() =>
          withNow(now, () => api.formatDistanceToNow(v, { timeZone: 'UTC', addSuffix: true })),
        );
      }),
      Then('the text is "in 2 days"', () => {
        expect(returned(out)).toBe('in 2 days');
      }),
      When(
        'formatDistanceToNowStrict is called with timeZone "UTC", unit day and addSuffix true',
        () => {
          out = observe(() =>
            withNow(now, () =>
              api.formatDistanceToNowStrict(v, { timeZone: 'UTC', unit: 'day', addSuffix: true }),
            ),
          );
        },
      ),
      Then('the text is "in 2 days"', () => {
        expect(returned(out)).toBe('in 2 days');
      }),
    ],
  };
});

registerScenario<ExampleRows['REL-016']>('REL-016', () => {
  let v!: TemporalValue;
  let out!: Observation;
  let now!: string;
  let opts!: Record<string, unknown>;
  return {
    steps: [
      Given('a PlainDate value "2026-10-25"', () => {
        v = date('2026-10-25');
      }),
      Given('the current instant for the first call is "2026-10-23T12:00Z"', () => {
        now = '2026-10-23T12:00Z';
      }),
      When('<function> is called with timeZone "UTC" and <options>', (r) => {
        opts = { timeZone: 'UTC', ...(r.options === 'unit day' ? { unit: 'day' } : {}) };
        out = observe(() => withNow(now, () => api[r.function](v, opts)));
      }),
      Then('the text is "2 days"', () => {
        expect(returned(out)).toBe('2 days');
      }),
      Given('the current instant for the second call is "2026-10-24T12:00Z"', () => {
        now = '2026-10-24T12:00Z';
      }),
      When('the same call is made again', (r) => {
        out = observe(() => withNow(now, () => api[r.function](v, opts)));
      }),
      Then('the text is "1 day"', () => {
        expect(returned(out)).toBe('1 day');
      }),
    ],
  };
});

registerScenario<ExampleRows['REL-017']>('REL-017', () => {
  let v!: TemporalValue;
  let out!: Observation;
  let now!: string;
  return {
    steps: [
      Given('the current instant is "2026-10-23T12:00Z"', () => {
        now = '2026-10-23T12:00Z';
      }),
      Given('a ZonedDateTime value "2026-10-25T08:00[America/New_York]"', () => {
        v = zoned('2026-10-25T08:00[America/New_York]');
      }),
      When('formatDistanceToNow is called with omitted options', () => {
        out = observe(() => withNow(now, () => api.formatDistanceToNow(v)));
      }),
      Then('the text is "2 days"', () => {
        expect(returned(out)).toBe('2 days');
      }),
      When('formatDistanceToNowStrict is called with unit day and omitted timeZone', () => {
        out = observe(() => withNow(now, () => api.formatDistanceToNowStrict(v, { unit: 'day' })));
      }),
      Then('the text is "2 days"', () => {
        expect(returned(out)).toBe('2 days');
      }),
    ],
  };
});

registerScenario<ExampleRows['REL-018']>('REL-018', () => {
  let v!: TemporalValue;
  let out!: Observation;
  let now!: string;
  return {
    steps: [
      Given('the current instant is "2026-10-24T01:00Z"', () => {
        now = '2026-10-24T01:00Z';
      }),
      Given('a PlainDate value "2026-10-24"', () => {
        v = date('2026-10-24');
      }),
      When(
        'formatDistanceToNowStrict is called with unit day and timeZone "America/Montevideo"',
        () => {
          out = observe(() =>
            withNow(now, () =>
              api.formatDistanceToNowStrict(v, { unit: 'day', timeZone: 'America/Montevideo' }),
            ),
          );
        },
      ),
      Then('the text is "1 day"', () => {
        expect(returned(out)).toBe('1 day');
      }),
      When('the same call uses timeZone "UTC"', () => {
        out = observe(() =>
          withNow(now, () => api.formatDistanceToNowStrict(v, { unit: 'day', timeZone: 'UTC' })),
        );
      }),
      Then('the text is "0 days"', () => {
        expect(returned(out)).toBe('0 days');
      }),
    ],
  };
});

registerScenario<ExampleRows['REL-019']>('REL-019', () => {
  let v!: TemporalValue;
  let out!: Observation;
  return {
    steps: [
      Given('a <kind> value "<value>"', (r) => {
        v = value(r.kind, r.value);
      }),
      When('<function> is called with omitted timeZone', (r) => {
        out = observe(() => api[r.function](v));
      }),
      Then('the call throws a missing-zone error', () => {
        failed(out);
      }),
    ],
  };
});

registerScenario<ExampleRows['REL-020']>('REL-020', () => {
  let b!: TemporalValue;
  let v!: TemporalValue;
  let out!: Observation;
  return {
    steps: [
      Given('PlainDateTime base "2026-01-01T00:00" and value "2026-01-02T00:00"', () => {
        b = dt('2026-01-01T00:00');
        v = dt('2026-01-02T00:00');
      }),
      When('formatDistanceStrict is called with <options>', (r) => {
        out = observe(() => api.formatDistanceStrict(v, b, options(r.options)));
      }),
      Then('the call throws an invalid-option error', () => {
        failed(out);
      }),
    ],
  };
});

registerScenario<ExampleRows['REL-021']>('REL-021', () => {
  let b!: TemporalValue;
  let values!: TemporalValue[];
  let observations!: NativeObservation[];
  return {
    steps: [
      Given('PlainDateTime base "2000-03-01T00:00"', () => {
        b = dt('2000-03-01T00:00');
      }),
      Given(
        'values one nanosecond below, at, and above 182 days and 12 hours after the base',
        () => {
          const midpoint = asTemporal(b, 'PlainDateTime').add({ days: 182, hours: 12 });
          values = [-1, 0, 1].map((nanoseconds) => midpoint.add({ nanoseconds }));
        },
      ),
      When(
        'formatDistanceStrict is called with unit year and each supported roundingMethod',
        () => {
          observations = values.flatMap((v) => observeNative(v, b, ['year']));
        },
      ),
      Then(
        "each text uses that runtime's successful native calendar total rounded by the selected method",
        () => {
          assertNative(observations);
        },
      ),
      Then('an alternative calculation does not replace the successful native total', () => {
        for (const row of observations)
          expect(row.total).toBe(nativeTotal(row.value, row.base, row.unit));
      }),
    ],
  };
});

registerScenario<ExampleRows['REL-022']>('REL-022', () => {
  let b!: TemporalValue;
  let v!: TemporalValue;
  let out!: Observation;
  return {
    steps: [
      Given('ZonedDateTime base "<base>" and value "<value>"', (r) => {
        b = value('ZonedDateTime', r.base);
        v = value('ZonedDateTime', r.value);
      }),
      When('formatDistanceStrict is called with unit "<unit>"', (r) => {
        out = observe(() => api.formatDistanceStrict(v, b, { unit: r.unit }));
      }),
      Then('the text is "<text>"', (r) => {
        expect(returned(out)).toBe(r.text);
      }),
    ],
  };
});

registerScenario<ExampleRows['REL-023']>('REL-023', () => {
  let b!: TemporalValue;
  let v!: TemporalValue;
  let out!: Observation;
  return {
    steps: [
      Given('PlainDateTime base "2026-01-01T00:00" and value "2026-01-01T00:00:10"', () => {
        b = dt('2026-01-01T00:00');
        v = dt('2026-01-01T00:00:10');
      }),
      When('formatDistance is called with <options>', (r) => {
        out = observe(() => api.formatDistance(v, b, options(r.options)));
      }),
      Then('it throws an invalid-option error', () => {
        failed(out);
      }),
    ],
  };
});

registerScenario<ExampleRows['REL-024']>('REL-024', () => {
  let b!: TemporalValue;
  let v!: TemporalValue;
  let out!: Observation;
  return {
    steps: [
      Given('two Instants both equal to "2026-10-23T12:00Z"', () => {
        v = instant('2026-10-23T12:00Z');
        b = instant('2026-10-23T12:00Z');
      }),
      When('<function> is called with omitted timeZone', (r) => {
        out = observe(() => api[r.function](v, b));
      }),
      Then('it throws a missing-zone error', () => {
        failed(out);
      }),
    ],
  };
});

registerScenario<ExampleRows['REL-025']>('REL-025', () => {
  let b!: TemporalValue;
  let v!: TemporalValue;
  let out!: Observation;
  return {
    steps: [
      Given('two PlainDate values both equal to "2026-10-23"', () => {
        v = date('2026-10-23');
        b = date('2026-10-23');
      }),
      When('<function> is called with timeZone "UTC"', (r) => {
        out = observe(() => api[r.function](v, b, { timeZone: 'UTC' }));
      }),
      Then('it throws an invalid-zone-context error', () => {
        failed(out);
      }),
    ],
  };
});

registerScenario<ExampleRows['REL-026']>('REL-026', () => {
  let v!: TemporalValue;
  let out!: Observation;
  let now!: string;
  return {
    steps: [
      Given('the current instant is "2026-01-01T00:00Z"', () => {
        now = '2026-01-01T00:00Z';
      }),
      Given('a ZonedDateTime value "2026-01-01T00:00:10[UTC]"', () => {
        v = zoned('2026-01-01T00:00:10[UTC]');
      }),
      When('formatDistanceToNow is called with <options>', (r) => {
        out = observe(() => withNow(now, () => api.formatDistanceToNow(v, options(r.options))));
      }),
      Then('the text is "<text>"', (r) => {
        expect(returned(out)).toBe(r.text);
      }),
    ],
  };
});

registerScenario<ExampleRows['REL-027']>('REL-027', () => {
  let v!: TemporalValue;
  let out!: Observation;
  let now!: string;
  return {
    steps: [
      Given('the current instant is "2026-01-01T00:00Z"', () => {
        now = '2026-01-01T00:00Z';
      }),
      Given('an Instant value "2026-01-01T00:01:31Z"', () => {
        v = instant('2026-01-01T00:01:31Z');
      }),
      When(
        'formatDistanceToNowStrict is called with timeZone UTC, unit minute, roundingMethod "<rounding>" and addSuffix true',
        (r) => {
          out = observe(() =>
            withNow(now, () =>
              api.formatDistanceToNowStrict(v, {
                timeZone: 'UTC',
                unit: 'minute',
                roundingMethod: r.rounding,
                addSuffix: true,
              }),
            ),
          );
        },
      ),
      Then('the text is "<text>"', (r) => {
        expect(returned(out)).toBe(r.text);
      }),
    ],
  };
});

registerScenario<ExampleRows['REL-028']>('REL-028', () => {
  let b!: TemporalValue;
  let v!: TemporalValue;
  let out!: Observation;
  return {
    steps: [
      Given('the same Instant "2026-01-01T01:00Z" viewed in UTC and America/New_York', () => {
        v = instant('2026-01-01T01:00Z').toZonedDateTimeISO('UTC');
        b = instant('2026-01-01T01:00Z').toZonedDateTimeISO('America/New_York');
      }),
      When('formatRelative is called with those ZonedDateTime values and omitted timeZone', () => {
        out = observe(() => api.formatRelative(v, b));
      }),
      Then('it throws a missing-common-zone error', () => {
        failed(out);
      }),
      When('it is called with timeZone "UTC"', () => {
        out = observe(() => api.formatRelative(v, b, { timeZone: 'UTC' }));
      }),
      Then('its date phrase is "today"', () => {
        expect((returned(out) as string).split(' at ')[0]).toBe('today');
      }),
      Then('the phrase is followed by " at " and an en-US rendering of 1:00 AM', () => {
        clock(returned(out) as string, 'today', 1);
      }),
      Then('the original values retain their respective zones', () => {
        expect(asTemporal(v, 'ZonedDateTime').timeZoneId).toBe('UTC');
        expect(asTemporal(b, 'ZonedDateTime').timeZoneId).toBe('America/New_York');
      }),
    ],
  };
});

registerScenario<ExampleRows['REL-029']>('REL-029', () => {
  let b!: TemporalValue;
  let v!: TemporalValue;
  let out!: Observation;
  return {
    steps: [
      Given('a PlainDateTime base "2026-01-01T00:00"', () => {
        b = value('PlainDateTime', '2026-01-01T00:00');
      }),
      Given('a value <nanoseconds> nanoseconds relative to that base', (r) => {
        v = asTemporal(b, 'PlainDateTime').add({ nanoseconds: Number(r.nanoseconds) });
      }),
      When(
        'formatDistanceStrict is called with unit second, roundingMethod "<rounding>" and addSuffix true',
        (r) => {
          out = observe(() =>
            api['formatDistanceStrict'](v, b, {
              unit: 'second',
              roundingMethod: r.rounding,
              addSuffix: true,
            }),
          );
        },
      ),
      Then('the text is "<text>"', (r) => {
        expect(returned(out)).toBe(r.text);
      }),
    ],
  };
});

registerScenario<ExampleRows['REL-030']>('REL-030', () => {
  let v!: TemporalValue;
  let out!: Observation;
  let now!: string;
  return {
    steps: [
      Given('the current instant is "2026-03-07T17:00Z"', () => {
        now = '2026-03-07T17:00Z';
      }),
      Given('a ZonedDateTime value "2026-03-08T12:00-04:00[America/New_York]"', () => {
        v = zoned('2026-03-08T12:00-04:00[America/New_York]');
      }),
      When(
        'formatDistanceToNowStrict is called with unit day and roundingMethod floor and omitted timeZone',
        () => {
          out = observe(() =>
            withNow(now, () =>
              api.formatDistanceToNowStrict(v, { unit: 'day', roundingMethod: 'floor' }),
            ),
          );
        },
      ),
      Then('the text is "1 day"', () => {
        expect(returned(out)).toBe('1 day');
      }),
      When('the same call uses explicit timeZone "UTC"', () => {
        out = observe(() =>
          withNow(now, () =>
            api.formatDistanceToNowStrict(v, {
              unit: 'day',
              roundingMethod: 'floor',
              timeZone: 'UTC',
            }),
          ),
        );
      }),
      Then('the text is "0 days"', () => {
        expect(returned(out)).toBe('0 days');
      }),
      Then('the input retains zone "America/New_York"', () => {
        expect(asTemporal(v, 'ZonedDateTime').timeZoneId).toBe('America/New_York');
      }),
    ],
  };
});
