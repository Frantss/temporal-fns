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
import { edge, high, low, nativeTotal, toward } from './relative-support.js';
import type { TemporalValue } from './support.js';
import { api, asTemporal, date, dt, T, value, withNow } from './support.js';

registerScenario<ExampleRows['RNG-001']>('RNG-001', () => {
  let b!: TemporalValue;
  let v!: TemporalValue;
  let out!: Observation;
  return {
    steps: [
      Given('PlainDate base "-271821-04-19" and value "+275760-09-13"', () => {
        b = date('-271821-04-19');
        v = date('+275760-09-13');
      }),
      When(
        'formatDistanceStrict is called with unit "<unit>" and roundingMethod "<rounding>"',
        (r) => {
          out = observe(() =>
            api.formatDistanceStrict(v, b, { unit: r.unit, roundingMethod: r.rounding }),
          );
        },
      ),
      Then('the text is "<text>"', (r) => {
        expect(returned(out)).toBe(r.text);
      }),
    ],
  };
});

registerScenario<ExampleRows['RNG-002']>('RNG-002', () => {
  let b!: TemporalValue;
  let v!: TemporalValue;
  let out!: Observation;
  return {
    steps: [
      Given('PlainDate earlier "-271821-04-19" and later "+275760-09-13"', () => {
        b = date('-271821-04-19');
        v = date('+275760-09-13');
      }),
      When(
        'formatDistanceStrict is called with <value> as value, <base> as base, unit year and addSuffix true',
        (r) => {
          const values = { earlier: b, later: v };
          out = observe(() =>
            api.formatDistanceStrict(values[r.value], values[r.base], {
              unit: 'year',
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

registerScenario<ExampleRows['RNG-003']>('RNG-003', () => {
  let b!: TemporalValue;
  let v!: TemporalValue;
  let out!: Observation;
  let zone!: string;
  return {
    steps: [
      Given('the minimum and maximum representable Instants', () => {
        b = low();
        v = high();
      }),
      Given('both are viewed in zone "<zone>"', (r) => {
        zone = r.zone;
      }),
      When(
        'formatDistanceStrict is called with the later and earlier <kind> inputs and unit year',
        (r) => {
          out = observe(() =>
            api.formatDistanceStrict(
              r.kind.startsWith('Instant') ? v : asTemporal(v, 'Instant').toZonedDateTimeISO(zone),
              r.kind.startsWith('Instant') ? b : asTemporal(b, 'Instant').toZonedDateTimeISO(zone),
              { unit: 'year', ...(r.kind.startsWith('Instant') ? { timeZone: zone } : {}) },
            ),
          );
        },
      ),
      Then('the text is "547581 years"', () => {
        expect(returned(out)).toBe('547581 years');
      }),
    ],
  };
});

registerScenario<ExampleRows['RNG-004']>('RNG-004', () => {
  let b!: TemporalValue;
  let v!: TemporalValue;
  let out!: Observation;
  return {
    steps: [
      Given('PlainDateTime base "-271821-04-19T00:00:00.000000001"', () => {
        b = dt('-271821-04-19T00:00:00.000000001');
      }),
      Given('PlainDateTime value "+275760-09-13T23:59:59.999999999"', () => {
        v = dt('+275760-09-13T23:59:59.999999999');
      }),
      When('formatDistanceStrict is called with unit month', () => {
        out = observe(() => api.formatDistanceStrict(v, b, { unit: 'month' }));
      }),
      Then('the text is "6570977 months"', () => {
        expect(returned(out)).toBe('6570977 months');
      }),
      When('formatDistance is called with omitted options', () => {
        out = observe(() => api.formatDistance(v, b));
      }),
      Then('the text is "about 547581 years"', () => {
        expect(returned(out)).toBe('about 547581 years');
      }),
    ],
  };
});

registerScenario<ExampleRows['RNG-005']>('RNG-005', () => {
  let b!: TemporalValue;
  let v!: TemporalValue;
  let out!: Observation;
  return {
    steps: [
      Given('PlainDate value "<boundary>"', (r) => {
        v = date(r.boundary);
      }),
      Given(
        'its base is <direction> one <unit> away using constrained calendar arithmetic',
        (r) => {
          b = asTemporal(v, 'PlainDate').add({ [r.unit + 's']: r.direction === 'later' ? 1 : -1 });
        },
      ),
      When('formatDistanceStrict is called with unit "<unit>"', (r) => {
        out = observe(() => api.formatDistanceStrict(v, b, { unit: r.unit }));
      }),
      Then('the text is "1 <unit>"', (r) => {
        expect(returned(out)).toBe(`1 ${r.unit}`);
      }),
    ],
  };
});

registerScenario<ExampleRows['RNG-006']>('RNG-006', () => {
  let b!: TemporalValue;
  let v!: TemporalValue;
  let out!: Observation;
  return {
    steps: [
      Given('PlainDateTime base "+275760-08-14T00:00"', () => {
        b = dt('+275760-08-14T00:00');
      }),
      Given('value is 15 days and 12 hours after base plus <nanoseconds> nanoseconds', (r) => {
        v = asTemporal(b, 'PlainDateTime')
          .add({ days: 15, hours: 12 })
          .add({ nanoseconds: Number(r.nanoseconds) });
      }),
      Given('the next constrained month anniversary is beyond the representable range', () => {
        expect(() => asTemporal(b, 'PlainDateTime').add({ months: 1 })).toThrow(RangeError);
      }),
      When('formatDistanceStrict is called with unit month and roundingMethod round', () => {
        out = observe(() =>
          api.formatDistanceStrict(v, b, { unit: 'month', roundingMethod: 'round' }),
        );
      }),
      Then('the text is "<text>"', (r) => {
        expect(returned(out)).toBe(r.text);
      }),
    ],
  };
});

registerScenario<ExampleRows['RNG-007']>('RNG-007', () => {
  let b!: TemporalValue;
  let v!: TemporalValue;
  let observations!: NativeObservation[];
  return {
    steps: [
      Given('the <edge> representable Instant viewed in named zone "<zone>" as the base', (r) => {
        b = edge(r.edge, r.zone);
      }),
      Given('a same-zone value 50 calendar days toward the interior', (r) => {
        v = toward(asTemporal(b, 'ZonedDateTime'), r.edge);
      }),
      Given("the runtime's native month and year totals for those original values succeed", () => {
        for (const unit of ['month', 'year'] as const)
          expect(
            Number.isFinite(
              nativeTotal(asTemporal(v, 'ZonedDateTime'), asTemporal(b, 'ZonedDateTime'), unit),
            ),
          ).toBe(true);
      }),
      When(
        'formatDistanceStrict is called for each unit with each supported roundingMethod',
        () => {
          observations = observeNative(v, b);
        },
      ),
      Then('each text uses the absolute native total rounded by that method', () => {
        assertNative(observations);
      }),
      Then(
        'no offset from a date 400 years away substitutes for the original-year calculation',
        () => {
          for (const row of observations)
            expect(row.total).toBe(
              nativeTotal(asTemporal(v, 'ZonedDateTime'), asTemporal(b, 'ZonedDateTime'), row.unit),
            );
        },
      ),
    ],
  };
});

registerScenario<ExampleRows['RNG-008']>('RNG-008', () => {
  let b!: TemporalValue;
  let v!: TemporalValue;
  let out!: Observation;
  return {
    steps: [
      Given('the maximum Instant viewed in "Africa/Abidjan" has offset "+00:00"', () => {
        v = high().toZonedDateTimeISO('Africa/Abidjan');
        expect(asTemporal(v, 'ZonedDateTime').offset).toBe('+00:00');
      }),
      Given('the same-zone base is 50 calendar days earlier', () => {
        b = asTemporal(v, 'ZonedDateTime').subtract({ days: 50 });
      }),
      Given('the native year total cannot resolve its required anniversary', () => {
        expect(() =>
          nativeTotal(asTemporal(v, 'ZonedDateTime'), asTemporal(b, 'ZonedDateTime'), 'year'),
        ).toThrow(RangeError);
      }),
      When('formatDistanceStrict is called with unit year', () => {
        out = observe(() => api.formatDistanceStrict(v, b, { unit: 'year' }));
      }),
      Then('it throws the native RangeError', () => {
        failed(out, RangeError);
      }),
      When('both values are instead explicitly viewed in "+00:00"', () => {
        out = observe(() =>
          api.formatDistanceStrict(
            asTemporal(v, 'ZonedDateTime').withTimeZone('+00:00'),
            asTemporal(b, 'ZonedDateTime').withTimeZone('+00:00'),
            { unit: 'year' },
          ),
        );
      }),
      Then('the same function returns "0 years"', () => {
        expect(returned(out)).toBe('0 years');
      }),
    ],
  };
});

registerScenario<ExampleRows['RNG-009']>('RNG-009', () => {
  let b!: TemporalValue;
  let v!: TemporalValue;
  let out!: Observation;
  return {
    steps: [
      Given('the maximum Instant viewed in "America/New_York" as the value', () => {
        v = high().toZonedDateTimeISO('America/New_York');
      }),
      Given('its base is one constrained calendar month earlier', () => {
        b = asTemporal(v, 'ZonedDateTime').subtract({ months: 1 });
      }),
      Given('the native month total throws RangeError', () => {
        expect(() =>
          nativeTotal(asTemporal(v, 'ZonedDateTime'), asTemporal(b, 'ZonedDateTime'), 'month'),
        ).toThrow(RangeError);
      }),
      When('formatDistanceStrict is called with unit month', () => {
        out = observe(() => api.formatDistanceStrict(v, b, { unit: 'month' }));
      }),
      Then('it reports that native RangeError rather than inventing a successful total', () => {
        failed(out, RangeError);
      }),
    ],
  };
});

registerScenario<ExampleRows['RNG-010']>('RNG-010', () => {
  let b!: TemporalValue;
  let v!: TemporalValue;
  let out!: Observation;
  return {
    steps: [
      Given('PlainDate base "-271821-04-19" and value "+275760-09-13"', () => {
        b = date('-271821-04-19');
        v = date('+275760-09-13');
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

registerScenario<ExampleRows['RNG-011']>('RNG-011', () => {
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
      When('formatDistanceToNowStrict is called with timeZone "UTC" and unit year', () => {
        out = observe(() =>
          withNow(now, () => api.formatDistanceToNowStrict(v, { timeZone: 'UTC', unit: 'year' })),
        );
      }),
      Then('it returns "<years> years"', (r) => {
        expect(returned(out)).toBe(`${r.years} years`);
      }),
      When('formatDistanceToNow is called with timeZone "UTC"', () => {
        out = observe(() => withNow(now, () => api.formatDistanceToNow(v, { timeZone: 'UTC' })));
      }),
      Then('it returns "about <years> years"', (r) => {
        expect(returned(out)).toBe(`about ${r.years} years`);
      }),
    ],
  };
});

registerScenario<ExampleRows['RNG-012']>('RNG-012', () => {
  let b!: TemporalValue;
  let v!: TemporalValue;
  let out!: Observation;
  return {
    steps: [
      Given('the <edge> representable Instant viewed in named zone "<zone>" as the value', (r) => {
        v = edge(r.edge, r.zone);
      }),
      Given('a same-zone base 50 calendar days toward the interior', (r) => {
        b = toward(asTemporal(v, 'ZonedDateTime'), r.edge);
      }),
      Given(
        'the runtime\'s native total for unit "<unit>" throws RangeError for those original values',
        (r) => {
          expect(() =>
            nativeTotal(
              asTemporal(v, 'ZonedDateTime'),
              asTemporal(b, 'ZonedDateTime'),
              r.unit as 'month' | 'year',
            ),
          ).toThrow(RangeError);
        },
      ),
      When('formatDistanceStrict is called with that unit', (r) => {
        out = observe(() => api.formatDistanceStrict(v, b, { unit: r.unit }));
      }),
      Then('it reports the original native RangeError', () => {
        failed(out, RangeError);
      }),
      Then('it does not use another year to synthesize a successful total', () => {
        expect(out.value).toBeUndefined();
      }),
    ],
  };
});

registerScenario<ExampleRows['RNG-013']>('RNG-013', () => {
  let b!: TemporalValue;
  let v!: TemporalValue;
  let out!: Observation;
  return {
    steps: [
      Given('PlainDateTime base "<base>"', (r) => {
        b = dt(r.base);
      }),
      Given('PlainDateTime value "<midpoint>" plus <nanoseconds> nanoseconds', (r) => {
        v = dt(r.midpoint).add({ nanoseconds: Number(r.nanoseconds) });
      }),
      Given(
        'the neighboring anniversary required for unit "<unit>" is outside the representable range',
        (r) => {
          expect(() =>
            asTemporal(b, 'PlainDateTime').add({
              [r.unit + 's']:
                T.PlainDateTime.compare(
                  asTemporal(v, 'PlainDateTime'),
                  asTemporal(b, 'PlainDateTime'),
                ) < 0
                  ? -1
                  : 1,
            }),
          ).toThrow(RangeError);
        },
      ),
      When('formatDistanceStrict is called with that unit and roundingMethod round', (r) => {
        out = observe(() =>
          api.formatDistanceStrict(v, b, { unit: r.unit, roundingMethod: 'round' }),
        );
      }),
      Then('the text is "<text>"', (r) => {
        expect(returned(out)).toBe(r.text);
      }),
    ],
  };
});
