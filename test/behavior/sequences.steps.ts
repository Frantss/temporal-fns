import { expect } from 'vitest';
import { list } from './assertions.js';
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
  dt,
  equal,
  kindOf,
  literal,
  options,
  representative,
  sequence,
  T,
  value,
  ym,
  zoned,
} from './support.js';

registerScenario<ExampleRows['SEQ-001']>('SEQ-001', () => {
  let range!: { start: TemporalValue; end: TemporalValue };
  let out!: Observation;
  return {
    steps: [
      Given('a PlainDate interval from "2026-10-23" through "2026-10-27"', () => {
        range = { start: value('PlainDate', '2026-10-23'), end: value('PlainDate', '2026-10-27') };
      }),
      When('eachDayOfInterval is called with <options>', (r) => {
        out = observe(() => api['eachDayOfInterval'](range, options(r.options)));
      }),
      Then('the resulting PlainDate sequence is <values>', (r) => {
        sequence(returned(out) as unknown[], 'PlainDate', list(r.values));
      }),
    ],
  };
});

registerScenario<ExampleRows['SEQ-002']>('SEQ-002', () => {
  let range!: { start: TemporalValue; end: TemporalValue };
  let out!: Observation;
  return {
    steps: [
      Given('a PlainDateTime interval from "2026-10-23T16:30" through "2026-10-25T01:00"', () => {
        range = {
          start: value('PlainDateTime', '2026-10-23T16:30'),
          end: value('PlainDateTime', '2026-10-25T01:00'),
        };
      }),
      When('eachDayOfInterval is called', () => {
        out = observe(() => api['eachDayOfInterval'](range));
      }),
      Then(
        'the resulting PlainDateTime sequence is [2026-10-23T00:00, 2026-10-24T00:00, 2026-10-25T00:00]',
        () => {
          sequence(
            returned(out) as unknown[],
            'PlainDateTime',
            list('[2026-10-23T00:00, 2026-10-24T00:00, 2026-10-25T00:00]'),
          );
        },
      ),
      Then('the first result precedes the precise interval start', () => {
        expect(
          T.PlainDateTime.compare(
            asTemporal((returned(out) as unknown[])[0], 'PlainDateTime'),
            asTemporal(range.start, 'PlainDateTime'),
          ),
        ).toBeLessThan(0);
      }),
    ],
  };
});

registerScenario<ExampleRows['SEQ-003']>('SEQ-003', () => {
  let range!: { start: TemporalValue; end: TemporalValue };
  let out!: Observation;
  return {
    steps: [
      Given('a PlainDate interval from "2026-10-23" through "2026-10-27"', () => {
        range = { start: value('PlainDate', '2026-10-23'), end: value('PlainDate', '2026-10-27') };
      }),
      When('eachWeekOfInterval is called with <options>', (r) => {
        out = observe(() => api['eachWeekOfInterval'](range, options(r.options)));
      }),
      Then('the resulting PlainDate sequence is <values>', (r) => {
        sequence(returned(out) as unknown[], 'PlainDate', list(r.values));
      }),
    ],
  };
});

registerScenario<ExampleRows['SEQ-004']>('SEQ-004', () => {
  let range!: { start: TemporalValue; end: TemporalValue };
  let out!: Observation;
  return {
    steps: [
      Given('a PlainDateTime interval from "2026-10-23T16:30" through "2027-02-03T01:00"', () => {
        range = {
          start: value('PlainDateTime', '2026-10-23T16:30'),
          end: value('PlainDateTime', '2027-02-03T01:00'),
        };
      }),
      When('eachMonthOfInterval is called with <options>', (r) => {
        out = observe(() => api['eachMonthOfInterval'](range, options(r.options)));
      }),
      Then('the resulting PlainDateTime sequence is <values>', (r) => {
        sequence(returned(out) as unknown[], 'PlainDateTime', list(r.values));
      }),
    ],
  };
});

registerScenario<ExampleRows['SEQ-005']>('SEQ-005', () => {
  let range!: { start: TemporalValue; end: TemporalValue };
  let out!: Observation;
  return {
    steps: [
      Given('a PlainYearMonth interval from "2026-11" through "2027-02"', () => {
        range = {
          start: value('PlainYearMonth', '2026-11'),
          end: value('PlainYearMonth', '2027-02'),
        };
      }),
      When('eachMonthOfInterval is called with <options>', (r) => {
        out = observe(() => api['eachMonthOfInterval'](range, options(r.options)));
      }),
      Then('the resulting PlainYearMonth sequence is <values>', (r) => {
        sequence(returned(out) as unknown[], 'PlainYearMonth', list(r.values));
      }),
      Then('no result has an invented day or time zone', () => {
        for (const v of returned(out) as unknown[]) {
          expect(v).not.toHaveProperty('day');
          expect(v).not.toHaveProperty('timeZoneId');
        }
      }),
    ],
  };
});

registerScenario<ExampleRows['SEQ-006']>('SEQ-006', () => {
  let range!: { start: TemporalValue; end: TemporalValue };
  let out!: Observation;
  return {
    steps: [
      Given('a PlainDate interval from "2026-10-23" through "2026-10-27"', () => {
        range = { start: value('PlainDate', '2026-10-23'), end: value('PlainDate', '2026-10-27') };
      }),
      When('eachWeekendOfInterval is called with <options>', (r) => {
        out = observe(() => api['eachWeekendOfInterval'](range, options(r.options)));
      }),
      Then('the resulting PlainDate sequence is <values>', (r) => {
        sequence(returned(out) as unknown[], 'PlainDate', list(r.values));
      }),
    ],
  };
});

registerScenario<ExampleRows['SEQ-007']>('SEQ-007', () => {
  let range!: { start: TemporalValue; end: TemporalValue };
  let out!: Observation;
  return {
    steps: [
      Given('a PlainTime interval from "<start>" through "<end>"', (r) => {
        range = { start: value('PlainTime', r.start), end: value('PlainTime', r.end) };
      }),
      When('<function> is called with <options>', (r) => {
        out = observe(() => api[r.function](range, options(r.options)));
      }),
      Then('the resulting PlainTime sequence is <values>', (r) => {
        sequence(returned(out) as unknown[], 'PlainTime', list(r.values));
      }),
    ],
  };
});

registerScenario<ExampleRows['SEQ-008']>('SEQ-008', () => {
  let range!: { start: TemporalValue; end: TemporalValue };
  let out!: Observation;
  return {
    steps: [
      Given('a PlainTime interval from "00:00" through "23:59"', () => {
        range = { start: value('PlainTime', '00:00'), end: value('PlainTime', '23:59') };
      }),
      When('<function> is called with step <step>', (r) => {
        out = observe(() => api[r.function](range, { step: Number(r.step) }));
      }),
      Then('the resulting sequence is [00:00]', () => {
        sequence(returned(out) as unknown[], 'PlainTime', list('[00:00]'));
      }),
    ],
  };
});

registerScenario<ExampleRows['SEQ-009']>('SEQ-009', () => {
  let range!: { start: TemporalValue; end: TemporalValue };
  let out!: Observation;
  return {
    steps: [
      Given('a PlainDateTime interval from "<start>" through "<end>"', (r) => {
        range = { start: value('PlainDateTime', r.start), end: value('PlainDateTime', r.end) };
      }),
      When('<function> is called', (r) => {
        out = observe(() => api[r.function](range));
      }),
      Then('the resulting PlainDateTime sequence is <values>', (r) => {
        sequence(returned(out) as unknown[], 'PlainDateTime', list(r.values));
      }),
    ],
  };
});

registerScenario<ExampleRows['SEQ-010']>('SEQ-010', () => {
  let range!: { start: TemporalValue; end: TemporalValue };
  let out!: Observation;
  return {
    steps: [
      Given(
        'a ZonedDateTime interval from "2026-03-08T00:30[America/New_York]" through "2026-03-08T04:10[America/New_York]"',
        () => {
          range = {
            start: value('ZonedDateTime', '2026-03-08T00:30[America/New_York]'),
            end: value('ZonedDateTime', '2026-03-08T04:10[America/New_York]'),
          };
        },
      ),
      When('eachHourOfInterval is called', () => {
        out = observe(() => api.eachHourOfInterval(range));
      }),
      Then('the local hour sequence is [0,1,3,4]', () => {
        expect(
          (returned(out) as unknown[]).map((v) => asTemporal(v, 'ZonedDateTime').hour),
        ).toEqual([0, 1, 3, 4]);
      }),
      Then('adjacent results are exactly one elapsed hour apart', () => {
        const values = (returned(out) as unknown[]).map((v) => asTemporal(v, 'ZonedDateTime'));
        values
          .slice(1)
          .forEach((v, i) =>
            expect(v.epochNanoseconds - values[i]!.epochNanoseconds).toBe(3600000000000n),
          );
      }),
      Then('every result retains zone "America/New_York"', () => {
        for (const v of returned(out) as unknown[])
          expect(asTemporal(v, 'ZonedDateTime').timeZoneId).toBe('America/New_York');
      }),
    ],
  };
});

registerScenario<ExampleRows['SEQ-011']>('SEQ-011', () => {
  let range!: { start: TemporalValue; end: TemporalValue };
  let out!: Observation;
  return {
    steps: [
      Given(
        'a ZonedDateTime interval from "2026-11-01T00:30[America/New_York]" through "2026-11-01T02:10[America/New_York]"',
        () => {
          range = {
            start: value('ZonedDateTime', '2026-11-01T00:30[America/New_York]'),
            end: value('ZonedDateTime', '2026-11-01T02:10[America/New_York]'),
          };
        },
      ),
      When('eachHourOfInterval is called', () => {
        out = observe(() => api.eachHourOfInterval(range));
      }),
      Then(
        'the local hour and offset sequence is [00:-04:00, 01:-04:00, 01:-05:00, 02:-05:00]',
        () => {
          expect(
            (returned(out) as unknown[]).map((v) => {
              const z = asTemporal(v, 'ZonedDateTime');
              return `${String(z.hour).padStart(2, '0')}:${z.offset}`;
            }),
          ).toEqual(['00:-04:00', '01:-04:00', '01:-05:00', '02:-05:00']);
        },
      ),
      Then('adjacent results are exactly one elapsed hour apart', () => {
        const values = (returned(out) as unknown[]).map((v) => asTemporal(v, 'ZonedDateTime'));
        values
          .slice(1)
          .forEach((v, i) =>
            expect(v.epochNanoseconds - values[i]!.epochNanoseconds).toBe(3600000000000n),
          );
      }),
    ],
  };
});

registerScenario<ExampleRows['SEQ-012']>('SEQ-012', () => {
  let range!: { start: TemporalValue; end: TemporalValue };
  let out!: Observation;
  return {
    steps: [
      Given(
        'a ZonedDateTime interval from "2026-11-01T01:59:30-04:00[America/New_York]" through "2026-11-01T01:01:10-05:00[America/New_York]"',
        () => {
          range = {
            start: value('ZonedDateTime', '2026-11-01T01:59:30-04:00[America/New_York]'),
            end: value('ZonedDateTime', '2026-11-01T01:01:10-05:00[America/New_York]'),
          };
        },
      ),
      When('eachMinuteOfInterval is called', () => {
        out = observe(() => api.eachMinuteOfInterval(range));
      }),
      Then(
        'the local time and offset sequence is [01:59:-04:00, 01:00:-05:00, 01:01:-05:00]',
        () => {
          expect(
            (returned(out) as unknown[]).map((v) => {
              const z = asTemporal(v, 'ZonedDateTime');
              return `${String(z.hour).padStart(2, '0')}:${String(z.minute).padStart(2, '0')}:${z.offset}`;
            }),
          ).toEqual(['01:59:-04:00', '01:00:-05:00', '01:01:-05:00']);
        },
      ),
      Then('adjacent results are exactly one elapsed minute apart', () => {
        const values = (returned(out) as unknown[]).map((v) => asTemporal(v, 'ZonedDateTime'));
        values
          .slice(1)
          .forEach((v, i) =>
            expect(v.epochNanoseconds - values[i]!.epochNanoseconds).toBe(60000000000n),
          );
      }),
    ],
  };
});

registerScenario<ExampleRows['SEQ-013']>('SEQ-013', () => {
  let range!: { start: TemporalValue; end: TemporalValue };
  let out!: Observation;
  return {
    steps: [
      Given(
        'a ZonedDateTime interval from "2018-11-03T12:00[America/Sao_Paulo]" through "2018-11-05T12:00[America/Sao_Paulo]"',
        () => {
          range = {
            start: value('ZonedDateTime', '2018-11-03T12:00[America/Sao_Paulo]'),
            end: value('ZonedDateTime', '2018-11-05T12:00[America/Sao_Paulo]'),
          };
        },
      ),
      Given('the host data skips midnight on November 4', () => {
        expect(zoned('2018-11-04T12:00[America/Sao_Paulo]').startOfDay().hour).toBe(1);
      }),
      When('eachDayOfInterval is called', () => {
        out = observe(() => api.eachDayOfInterval(range));
      }),
      Then(
        'the local start sequence is [2018-11-03T00:00, 2018-11-04T01:00, 2018-11-05T00:00]',
        () => {
          const expected = ['2018-11-03T00:00', '2018-11-04T01:00', '2018-11-05T00:00'];
          (returned(out) as unknown[]).forEach((v, i) =>
            equal(asTemporal(v, 'ZonedDateTime').toPlainDateTime(), dt(expected[i])),
          );
          expect(returned(out)).toHaveLength(3);
        },
      ),
    ],
  };
});

registerScenario<ExampleRows['SEQ-014']>('SEQ-014', () => {
  let range!: { start: TemporalValue; end: TemporalValue };
  let out!: Observation;
  return {
    steps: [
      Given(
        'a ZonedDateTime interval from "2011-12-29T12:00[Pacific/Apia]" through "2012-01-01T12:00[Pacific/Apia]"',
        () => {
          range = {
            start: value('ZonedDateTime', '2011-12-29T12:00[Pacific/Apia]'),
            end: value('ZonedDateTime', '2012-01-01T12:00[Pacific/Apia]'),
          };
        },
      ),
      Given('the host data skips December 30, 2011', () => {
        expect(zoned('2011-12-29T12:00[Pacific/Apia]').add({ days: 1 }).day).toBe(31);
      }),
      When('eachDayOfInterval is called', () => {
        out = observe(() => api.eachDayOfInterval(range));
      }),
      Then('its date sequence is [2011-12-29, 2011-12-31, 2012-01-01]', () => {
        expect(
          (returned(out) as unknown[]).map((v) =>
            asTemporal(v, 'ZonedDateTime').toPlainDate().toString(),
          ),
        ).toEqual(['2011-12-29', '2011-12-31', '2012-01-01']);
      }),
      When('eachWeekendOfInterval is called with default weekends', () => {
        out = observe(() => api.eachWeekendOfInterval(range));
      }),
      Then('its date sequence is [2011-12-31, 2012-01-01]', () => {
        expect(
          (returned(out) as unknown[]).map((v) =>
            asTemporal(v, 'ZonedDateTime').toPlainDate().toString(),
          ),
        ).toEqual(['2011-12-31', '2012-01-01']);
      }),
    ],
  };
});

registerScenario<ExampleRows['SEQ-015']>('SEQ-015', () => {
  let range!: { start: TemporalValue; end: TemporalValue };
  let out!: Observation;
  return {
    steps: [
      Given('a <kind> interval whose endpoints both equal "<value>"', (r) => {
        range = { start: value(r.kind, r.value), end: value(r.kind, r.value) };
      }),
      When('<function> is called', (r) => {
        out = observe(() => api[r.function](range));
      }),
      Then('it returns one <kind> value equal to "<result>"', (r) => {
        sequence(returned(out) as unknown[], r.kind, [r.result]);
      }),
    ],
  };
});

registerScenario<ExampleRows['SEQ-016']>('SEQ-016', () => {
  let range!: { start: TemporalValue; end: TemporalValue };
  let out!: Observation;
  return {
    steps: [
      Given('a <kind> interval from "<start>" through "<end>"', (r) => {
        range = { start: value(r.kind, r.start), end: value(r.kind, r.end) };
      }),
      When('<function> is called with that reversed interval', (r) => {
        out = observe(() => api[r.function](range));
      }),
      Then('it throws an invalid-interval error', () => {
        failed(out);
      }),
    ],
  };
});

registerScenario<ExampleRows['SEQ-017']>('SEQ-017', () => {
  let range!: { start: TemporalValue; end: TemporalValue };
  let out!: Observation;
  return {
    steps: [
      Given('a compatible valid interval for <function>', (r) => {
        const kind = /Hour|Minute/.test(r.function) ? 'PlainTime' : 'PlainDate';
        range = {
          start: representative(kind) as TemporalValue,
          end: representative(kind) as TemporalValue,
        };
      }),
      When('<function> is called with step <step>', (r) => {
        out = observe(() => api[r.function](range, { step: literal(r.step) }));
      }),
      Then('the call throws an invalid-step error', () => {
        failed(out);
      }),
    ],
  };
});

registerScenario<ExampleRows['SEQ-018']>('SEQ-018', () => {
  let range!: { start: TemporalValue; end: TemporalValue };
  let out!: Observation;
  return {
    steps: [
      Given(
        'ZonedDateTime start "2026-10-23T00:00[UTC]" and end "2026-10-24T00:00[Asia/Tokyo]"',
        () => {
          range = {
            start: value('ZonedDateTime', '2026-10-23T00:00[UTC]'),
            end: value('ZonedDateTime', '2026-10-24T00:00[Asia/Tokyo]'),
          };
        },
      ),
      When('<function> is called with their interval', (r) => {
        out = observe(() => api[r.function](range));
      }),
      Then('it throws a mismatched-zone error', () => {
        failed(out);
      }),
    ],
  };
});

registerScenario<ExampleRows['SEQ-019']>('SEQ-019', () => {
  let range!: { start: TemporalValue; end: TemporalValue };
  let out!: Observation;
  return {
    steps: [
      Given('a PlainDate interval from "+275760-09-12" through "+275760-09-13"', () => {
        range = {
          start: value('PlainDate', '+275760-09-12'),
          end: value('PlainDate', '+275760-09-13'),
        };
      }),
      When('eachDayOfInterval is called', () => {
        out = observe(() => api['eachDayOfInterval'](range));
      }),
      Then('the sequence is [+275760-09-12, +275760-09-13]', () => {
        sequence(returned(out) as unknown[], 'PlainDate', list('[+275760-09-12, +275760-09-13]'));
      }),
      Then('no extra date beyond the endpoint is required', () => {
        expect(returned(out) as unknown[]).toHaveLength(2);
      }),
    ],
  };
});

registerScenario<ExampleRows['SEQ-020']>('SEQ-020', () => {
  let range!: { start: TemporalValue; end: TemporalValue };
  let out!: Observation;
  return {
    steps: [
      Given('a PlainDate interval from "+275760-09-12" through "+275760-09-13"', () => {
        range = {
          start: value('PlainDate', '+275760-09-12'),
          end: value('PlainDate', '+275760-09-13'),
        };
      }),
      When('eachDayOfInterval is called with step 10', () => {
        out = observe(() => api['eachDayOfInterval'](range, { step: 10 }));
      }),
      Then('the sequence is [+275760-09-12]', () => {
        sequence(returned(out) as unknown[], 'PlainDate', list('[+275760-09-12]'));
      }),
    ],
  };
});

registerScenario<ExampleRows['SEQ-021']>('SEQ-021', () => {
  let range!: { start: TemporalValue; end: TemporalValue };
  let out!: Observation;
  return {
    steps: [
      Given('a valid PlainDate interval from "2026-10-23" through "2026-10-27"', () => {
        range = { start: value('PlainDate', '2026-10-23'), end: value('PlainDate', '2026-10-27') };
      }),
      When('<function> is called with <options>', (r) => {
        out = observe(() => api[r.function](range, options(r.options)));
      }),
      Then('it throws an invalid-option error', () => {
        failed(out);
      }),
    ],
  };
});

registerScenario<ExampleRows['SEQ-022']>('SEQ-022', () => {
  let range!: { start: TemporalValue; end: TemporalValue };
  let out!: Observation;
  return {
    steps: [
      Given('a PlainDate interval from "-271821-04-19" through "-271821-04-20"', () => {
        range = {
          start: value('PlainDate', '-271821-04-19'),
          end: value('PlainDate', '-271821-04-20'),
        };
      }),
      When('<function> is called with <options>', (r) => {
        out = observe(() => api[r.function](range, options(r.options)));
      }),
      Then('it throws RangeError', () => {
        failed(out, RangeError);
      }),
      Then(
        "it does not substitute the interval's start for the unavailable period boundary",
        () => {
          expect(out.value).toBeUndefined();
        },
      ),
    ],
  };
});

registerScenario<ExampleRows['SEQ-023']>('SEQ-023', () => {
  let range!: { start: TemporalValue; end: TemporalValue };
  let out!: Observation;
  return {
    steps: [
      Given('a PlainDate interval from "2024-02-28" through "2024-03-01"', () => {
        range = { start: value('PlainDate', '2024-02-28'), end: value('PlainDate', '2024-03-01') };
      }),
      When('eachDayOfInterval is called', () => {
        out = observe(() => api['eachDayOfInterval'](range));
      }),
      Then('the result is [2024-02-28, 2024-02-29, 2024-03-01]', () => {
        sequence(
          returned(out) as unknown[],
          'PlainDate',
          list('[2024-02-28, 2024-02-29, 2024-03-01]'),
        );
      }),
    ],
  };
});

registerScenario<ExampleRows['SEQ-024']>('SEQ-024', () => {
  let range!: { start: TemporalValue; end: TemporalValue };
  let out!: Observation;
  return {
    steps: [
      Given('a PlainDate interval from "2026-10-19" through "2026-10-23"', () => {
        range = { start: value('PlainDate', '2026-10-19'), end: value('PlainDate', '2026-10-23') };
      }),
      When('eachWeekendOfInterval is called with omitted options', () => {
        out = observe(() => api['eachWeekendOfInterval'](range));
      }),
      Then('the result is an empty array', () => {
        expect(returned(out)).toEqual([]);
      }),
    ],
  };
});

registerScenario<ExampleRows['SEQ-025']>('SEQ-025', () => {
  let range!: { start: TemporalValue; end: TemporalValue };
  let out!: Observation;
  return {
    steps: [
      Given('a PlainTime interval from "00:00" through "23:59"', () => {
        range = { start: value('PlainTime', '00:00'), end: value('PlainTime', '23:59') };
      }),
      When('<function> is called with step 9007199254740991', (r) => {
        out = observe(() => api[r.function](range, { step: 9007199254740991 }));
      }),
      Then('the sequence is [00:00]', () => {
        sequence(returned(out) as unknown[], 'PlainTime', list('[00:00]'));
      }),
    ],
  };
});

registerScenario<ExampleRows['SEQ-026']>('SEQ-026', () => {
  let range!: { start: TemporalValue; end: TemporalValue };
  let out!: Observation;
  return {
    steps: [
      Given('a compatible valid interval for <function>', (r) => {
        const kind = /Hour|Minute/.test(r.function) ? 'PlainTime' : 'PlainDate';
        range = {
          start: representative(kind) as TemporalValue,
          end: representative(kind) as TemporalValue,
        };
      }),
      When('<function> is called with step 9007199254740992', (r) => {
        out = observe(() => api[r.function](range, { step: 9007199254740992 }));
      }),
      Then('the call throws an invalid-step error', () => {
        failed(out);
      }),
    ],
  };
});

registerScenario<ExampleRows['SEQ-027']>('SEQ-027', () => {
  let range!: { start: TemporalValue; end: TemporalValue };
  let out!: Observation;
  return {
    steps: [
      Given('a PlainYearMonth interval from "-271821-04" through "-271821-05"', () => {
        range = {
          start: value('PlainYearMonth', '-271821-04'),
          end: value('PlainYearMonth', '-271821-05'),
        };
      }),
      When('eachMonthOfInterval is called', () => {
        out = observe(() => api['eachMonthOfInterval'](range));
      }),
      Then('the result is the PlainYearMonth sequence [-271821-04, -271821-05]', () => {
        sequence(returned(out) as unknown[], 'PlainYearMonth', list('[-271821-04, -271821-05]'));
      }),
      Then(
        'it does not require an unavailable April 1 PlainDate as a public input or result',
        () => {
          for (const v of returned(out) as unknown[]) {
            expect(kindOf(v)).toBe('PlainYearMonth');
            expect(v).not.toHaveProperty('day');
          }
        },
      ),
      Then(
        'an internal arithmetic range error does not silently truncate an interval whose next month is representable',
        () => {
          expect(returned(out) as unknown[]).toHaveLength(2);
          equal((returned(out) as unknown[])[1], ym('-271821-05'));
        },
      ),
    ],
  };
});

registerScenario<ExampleRows['SEQ-028']>('SEQ-028', () => {
  let range!: { start: TemporalValue; end: TemporalValue };
  let out!: Observation;
  return {
    steps: [
      Given(
        'a ZonedDateTime interval from "<start>[America/New_York]" through "<end>[America/New_York]"',
        (r) => {
          range = {
            start: value('ZonedDateTime', r.start + '[America/New_York]'),
            end: value('ZonedDateTime', r.end + '[America/New_York]'),
          };
        },
      ),
      When('<function> is called with omitted options', (r) => {
        out = observe(() => api[r.function](range));
      }),
      Then('each result retains zone "America/New_York"', () => {
        for (const v of returned(out) as unknown[])
          expect(asTemporal(v, 'ZonedDateTime').timeZoneId).toBe('America/New_York');
      }),
      Then('the local date-time and offset sequence is <values>', (r) => {
        sequence(
          returned(out) as unknown[],
          'ZonedDateTime',
          list(r.values).map((s) => s + '[America/New_York]'),
        );
      }),
    ],
  };
});
