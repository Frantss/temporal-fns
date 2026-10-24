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
  asTemporal,
  durationEqual,
  durationKeys,
  kindOf,
  literal,
  options,
  T,
  value,
} from './support.js';

registerScenario<ExampleRows['DUR-001']>('DUR-001', () => {
  let v!: TemporalValue;
  let out!: Observation;
  return {
    steps: [
      Given('a Duration with these components:', (_r, table) => {
        v = T.Duration.from(
          Object.fromEntries(Object.entries(table.hashes()[0]!).map(([k, x]) => [k, Number(x)])),
        );
      }),
      When('formatDuration is called with omitted options', () => {
        out = observe(() => api.formatDuration(v));
      }),
      Then(
        'the text is "1 year 2 months 3 weeks 4 days 25 hours 90 minutes 7 seconds 8 milliseconds 9 microseconds 10 nanoseconds"',
        () => {
          expect(returned(out)).toBe(
            '1 year 2 months 3 weeks 4 days 25 hours 90 minutes 7 seconds 8 milliseconds 9 microseconds 10 nanoseconds',
          );
        },
      ),
      Then('hours 25 and minutes 90 remain separate unbalanced components', () => {
        expect(asTemporal(v, 'Duration').hours).toBe(25);
        expect(asTemporal(v, 'Duration').minutes).toBe(90);
      }),
    ],
  };
});

registerScenario<ExampleRows['DUR-002']>('DUR-002', () => {
  let v!: TemporalValue;
  let out!: Observation;
  return {
    steps: [
      Given('a Duration with hours 25 and minutes 30', () => {
        v = T.Duration.from({ hours: 25, minutes: 30 });
      }),
      When('formatDuration is called with <options>', (r) => {
        out = observe(() => api.formatDuration(v, options(r.options)));
      }),
      Then('the text is "<text>"', (r) => {
        expect(returned(out)).toBe(r.text);
      }),
    ],
  };
});

registerScenario<ExampleRows['DUR-003']>('DUR-003', () => {
  let v!: TemporalValue;
  let out!: Observation;
  return {
    steps: [
      Given('a Duration "<value>"', (r) => {
        v = value('Duration', r.value);
      }),
      When('formatDuration is called with <options>', (r) => {
        out = observe(() => api.formatDuration(v, options(r.options)));
      }),
      Then('the text is "<text>"', (r) => {
        expect(returned(out)).toBe(r.text);
      }),
    ],
  };
});

registerScenario<ExampleRows['DUR-004']>('DUR-004', () => {
  let out!: Observation;
  return {
    steps: [
      When('parseDuration is called with "<text>"', (r) => {
        out = observe(() => api.parseDuration(r.text));
      }),
      Then('the Duration has <component> equal to <amount>', (r) => {
        expect(
          asTemporal(returned(out), 'Duration')[r.component as (typeof durationKeys)[number]],
        ).toBe(Number(r.amount));
      }),
      Then('every other duration component is zero', (r) => {
        durationEqual(returned(out), { [r.component]: Number(r.amount) });
      }),
    ],
  };
});

registerScenario<ExampleRows['DUR-005']>('DUR-005', () => {
  let out!: Observation;
  return {
    steps: [
      When('parseDuration is called with "<text>"', (r) => {
        out = observe(() => api.parseDuration(r.text));
      }),
      Then('its nonzero components are <components>', (r) => {
        durationEqual(
          returned(out),
          Object.fromEntries(
            [...r.components.matchAll(/(\w+) (\d+)/g)].map((m) => [m[1], Number(m[2])]),
          ),
        );
      }),
    ],
  };
});

registerScenario<ExampleRows['DUR-006']>('DUR-006', () => {
  let out!: Observation;
  return {
    steps: [
      When('parseDuration is called with "<text>"', (r) => {
        out = observe(() => api.parseDuration(r.text));
      }),
      Then('its hours component is <hours>', (r) => {
        expect(asTemporal(returned(out), 'Duration').hours).toBe(Number(r.hours));
      }),
      Then('its minutes component is <minutes>', (r) => {
        expect(asTemporal(returned(out), 'Duration').minutes).toBe(Number(r.minutes));
      }),
    ],
  };
});

registerScenario<ExampleRows['DUR-007']>('DUR-007', () => {
  let out!: Observation;
  return {
    steps: [
      When('tryParseDuration is called with "25h 30m"', () => {
        out = observe(() => api.tryParseDuration('25h 30m'));
      }),
      Then('the tuple is [null, Duration with hours 25 and minutes 30]', () => {
        const tuple = returned(out) as readonly unknown[];
        expect(tuple).toHaveLength(2);
        expect(tuple[0]).toBe(null);
        durationEqual(tuple[1], { hours: 25, minutes: 30 });
      }),
      Then('exactly one tuple element is non-null', () => {
        expect((returned(out) as unknown[]).filter((x) => x !== null)).toHaveLength(1);
      }),
    ],
  };
});

registerScenario<ExampleRows['DUR-008']>('DUR-008', () => {
  let out!: Observation;
  let tuple!: Observation;
  return {
    steps: [
      When('the duration text "<text>" is processed', (r) => {
        out = observe(() => api.parseDuration(r.text));
        tuple = observe(() => api.tryParseDuration(r.text));
      }),
      Then('parseDuration throws RangeError', () => {
        failed(out, RangeError);
      }),
      Then('tryParseDuration returns [RangeError, null]', () => {
        const t = returned(tuple) as unknown[];
        expect(t).toHaveLength(2);
        expect(t[0]).toBeInstanceOf(RangeError);
        expect(t[1]).toBe(null);
      }),
    ],
  };
});

registerScenario<ExampleRows['DUR-009']>('DUR-009', () => {
  let v!: TemporalValue;
  let out!: Observation;
  let text!: string;
  return {
    steps: [
      Given(
        'a Duration with nanoseconds equal to the exactly representable number 1000000000000000000000',
        () => {
          v = T.Duration.from({ nanoseconds: 1e21 });
        },
      ),
      When('formatDuration is called with format [nanoseconds]', () => {
        out = observe(() => api.formatDuration(v, { format: ['nanoseconds'] }));
      }),
      Then('the text is "1000000000000000000000 nanoseconds"', () => {
        expect(returned(out)).toBe('1000000000000000000000 nanoseconds');
        text = returned(out) as string;
      }),
      When('parseDuration is called with that text', () => {
        out = observe(() => api.parseDuration(text));
      }),
      Then('its nanoseconds component is the same exactly representable number', () => {
        expect(asTemporal(returned(out), 'Duration').nanoseconds).toBe(1e21);
      }),
    ],
  };
});

registerScenario<ExampleRows['DUR-010']>('DUR-010', () => {
  let out!: Observation;
  return {
    steps: [
      When('parseDuration is called with "<text>"', (r) => {
        out = observe(() => api.parseDuration(r.text));
      }),
      Then('it throws RangeError', () => {
        failed(out, RangeError);
      }),
      When('tryParseDuration is called with the same text', (r) => {
        out = observe(() => api.tryParseDuration(r.text));
      }),
      Then('the result is [RangeError, null]', () => {
        const tuple = returned(out) as unknown[];
        expect(tuple).toHaveLength(2);
        expect(tuple[0]).toBeInstanceOf(RangeError);
        expect(tuple[1]).toBe(null);
      }),
    ],
  };
});

registerScenario<ExampleRows['DUR-011']>('DUR-011', () => {
  let v!: TemporalValue;
  let out!: Observation;
  return {
    steps: [
      Given('a Duration "PT25H30M"', () => {
        v = T.Duration.from({ hours: 25, minutes: 30 });
      }),
      When('formatDuration is called with <options>', (r) => {
        out = observe(() => api.formatDuration(v, options(r.options)));
      }),
      Then('the call throws an invalid-option error', () => {
        failed(out);
      }),
    ],
  };
});

registerScenario<ExampleRows['DUR-012']>('DUR-012', () => {
  let out!: Observation;
  return {
    steps: [
      When('parseDuration is called with "25h 90m"', () => {
        out = observe(() => api.parseDuration('25h 90m'));
      }),
      Then('the result is Duration with hours 25 and minutes 90', () => {
        durationEqual(returned(out), { hours: 25, minutes: 90 });
      }),
      Then('it is not PlainTime', () => {
        expect(kindOf(returned(out))).not.toBe('PlainTime');
      }),
      Then('formatting its hours and minutes yields "25 hours 90 minutes"', () => {
        expect(api.formatDuration(returned(out), { format: ['hours', 'minutes'] })).toBe(
          '25 hours 90 minutes',
        );
      }),
    ],
  };
});

registerScenario<ExampleRows['DUR-013']>('DUR-013', () => {
  let out!: Observation;
  return {
    steps: [
      When('parseDuration is called with "<text>"', (r) => {
        out = observe(() => api.parseDuration(r.text));
      }),
      Then('the result has hours 1 and minutes 30', () => {
        durationEqual(returned(out), { hours: 1, minutes: 30 });
      }),
      When('tryParseDuration is called with the same text', (r) => {
        out = observe(() => api.tryParseDuration(r.text));
      }),
      Then('its result is [null, Duration with hours 1 and minutes 30]', () => {
        const t = returned(out) as unknown[];
        expect(t).toHaveLength(2);
        expect(t[0]).toBe(null);
        durationEqual(t[1], { hours: 1, minutes: 30 });
      }),
    ],
  };
});

registerScenario<ExampleRows['DUR-014']>('DUR-014', () => {
  let out!: Observation;
  let text!: string;
  return {
    steps: [
      Given(
        'duration text consists of two spaces, "1H", a tab, "30Minutes", and two spaces',
        () => {
          text = '  1H	30Minutes  ';
        },
      ),
      When('parseDuration is called with that text', () => {
        out = observe(() => api.parseDuration(text));
      }),
      Then('the result has hours 1 and minutes 30', () => {
        durationEqual(returned(out), { hours: 1, minutes: 30 });
      }),
      When('tryParseDuration is called with that text', () => {
        out = observe(() => api.tryParseDuration(text));
      }),
      Then('its result is [null, Duration with hours 1 and minutes 30]', () => {
        const t = returned(out) as unknown[];
        expect(t).toHaveLength(2);
        expect(t[0]).toBe(null);
        durationEqual(t[1], { hours: 1, minutes: 30 });
      }),
    ],
  };
});

registerScenario<ExampleRows['DUR-015']>('DUR-015', () => {
  let out!: Observation;
  let text!: string;
  let tuple!: Observation;
  return {
    steps: [
      Given('duration text containing only spaces and a tab', () => {
        text = '  	  ';
      }),
      When('the text is processed', () => {
        out = observe(() => api.parseDuration(text));
        tuple = observe(() => api.tryParseDuration(text));
      }),
      Then('parseDuration throws RangeError', () => {
        failed(out, RangeError);
      }),
      Then('tryParseDuration returns [RangeError, null]', () => {
        const t = returned(tuple) as unknown[];
        expect(t).toHaveLength(2);
        expect(t[0]).toBeInstanceOf(RangeError);
        expect(t[1]).toBe(null);
      }),
    ],
  };
});

registerScenario<ExampleRows['DUR-016']>('DUR-016', () => {
  let out!: Observation;
  return {
    steps: [
      When('parseDuration is called with "<text>"', (r) => {
        out = observe(() => api.parseDuration(r.text));
      }),
      Then('its <component> component is 4294967295', (r) => {
        expect(
          asTemporal(returned(out), 'Duration')[r.component as (typeof durationKeys)[number]],
        ).toBe(4294967295);
      }),
      Then('every other component is zero', (r) => {
        durationEqual(returned(out), { [r.component]: 4294967295 });
      }),
      When('tryParseDuration is called with the same text', (r) => {
        out = observe(() => api.tryParseDuration(r.text));
      }),
      Then('its error element is null and its result has the same components', (r) => {
        const t = returned(out) as unknown[];
        expect(t).toHaveLength(2);
        expect(t[0]).toBe(null);
        durationEqual(t[1], { [r.component]: 4294967295 });
      }),
    ],
  };
});

registerScenario<ExampleRows['DUR-017']>('DUR-017', () => {
  let input: unknown;
  let out!: Observation;
  return {
    steps: [
      Given('a non-string primary argument <input>', (r) => {
        input = literal(r.input);
      }),
      When('parseDuration is called with that argument', () => {
        out = observe(() => api.parseDuration(input));
      }),
      Then('it throws', () => {
        failed(out);
      }),
      When('tryParseDuration is called with that argument', () => {
        out = observe(() => api.tryParseDuration(input));
      }),
      Then('it also throws rather than returning an error tuple', () => {
        failed(out);
        expect(out.value).toBeUndefined();
      }),
    ],
  };
});
