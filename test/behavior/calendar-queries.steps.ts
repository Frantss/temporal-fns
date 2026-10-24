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
  date,
  equal,
  instant,
  literal,
  options,
  T,
  value,
  zoned,
} from './support.js';

registerScenario<ExampleRows['CAL-001']>('CAL-001', () => {
  let v!: TemporalValue;
  let out!: Observation;
  return {
    steps: [
      Given('a PlainDate "2026-10-22"', () => {
        v = value('PlainDate', '2026-10-22');
      }),
      When('<function> is called with weekday <weekday>', (r) => {
        out = observe(() => api[r.function](v, literal(r.weekday)));
      }),
      Then('the result is PlainDate "<result>"', (r) => {
        equal(returned(out), value('PlainDate', r.result));
      }),
    ],
  };
});

registerScenario<ExampleRows['CAL-002']>('CAL-002', () => {
  let v!: TemporalValue;
  let out!: Observation;
  return {
    steps: [
      Given('a PlainDateTime "2026-10-22T12:34:56.123456789"', () => {
        v = value('PlainDateTime', '2026-10-22T12:34:56.123456789');
      }),
      When('nextDay is called with weekday 5', () => {
        out = observe(() => api['nextDay'](v, 5));
      }),
      Then('the result is PlainDateTime "2026-10-23T12:34:56.123456789"', () => {
        equal(returned(out), value('PlainDateTime', '2026-10-23T12:34:56.123456789'));
      }),
    ],
  };
});

registerScenario<ExampleRows['CAL-003']>('CAL-003', () => {
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
      When('<function> is called with weekday 5', (r) => {
        out = observe(() => api[r.function](v, 5));
      }),
      Then('the result is ZonedDateTime "<result>"', (r) => {
        equal(returned(out), zoned(r.result));
      }),
      Then('its weekday is Friday', () => {
        expect(asTemporal(returned(out), 'ZonedDateTime').dayOfWeek).toBe(5);
      }),
    ],
  };
});

registerScenario<ExampleRows['CAL-004']>('CAL-004', () => {
  let v!: TemporalValue;
  let out!: Observation;
  return {
    steps: [
      Given('a PlainDate "2026-10-22"', () => {
        v = value('PlainDate', '2026-10-22');
      }),
      When('<function> is called with weekday <weekday>', (r) => {
        out = observe(() => api[r.function](v, literal(r.weekday)));
      }),
      Then('the call throws an invalid-weekday error', () => {
        failed(out);
      }),
    ],
  };
});

registerScenario<ExampleRows['CAL-005']>('CAL-005', () => {
  let v!: TemporalValue;
  let out!: Observation;
  return {
    steps: [
      Given('a <kind> "<value>"', (r) => {
        v = value(r.kind, r.value);
      }),
      When('getQuarter is called', () => {
        out = observe(() => api['getQuarter'](v));
      }),
      Then('the result is <quarter>', (r) => {
        expect(returned(out)).toBe(Number(r.quarter));
      }),
    ],
  };
});

registerScenario<ExampleRows['CAL-006']>('CAL-006', () => {
  let v!: TemporalValue;
  let out!: Observation;
  let year!: Observation;
  return {
    steps: [
      Given('a PlainDate "<value>"', (r) => {
        v = date(r.value);
      }),
      When('getWeek and getWeekYear are called with <options>', (r) => {
        out = observe(() => api.getWeek(v, options(r.options)));
        year = observe(() => api.getWeekYear(v, options(r.options)));
      }),
      Then('getWeek returns <week>', (r) => {
        expect(returned(out)).toBe(Number(r.week));
      }),
      Then('getWeekYear returns <year>', (r) => {
        expect(returned(year)).toBe(Number(r.year));
      }),
    ],
  };
});

registerScenario<ExampleRows['CAL-007']>('CAL-007', () => {
  let v!: TemporalValue;
  let rows!: {
    start: ReturnType<typeof date>;
    next: ReturnType<typeof date>;
    anchor: ReturnType<typeof date>;
    week: number;
    weekday: number;
  }[];
  return {
    steps: [
      Given('a PlainDate "<value>"', (r) => {
        v = date(r.value);
      }),
      When(
        'getWeek and getWeekYear are called for each weekStartsOn from 0 through 6 and each firstWeekContainsDate from 1 through 7',
        () => {
          rows = [];
          for (let weekday = 0; weekday <= 6; weekday++)
            for (let anchor = 1; anchor <= 7; anchor++) {
              const o = { weekStartsOn: weekday, firstWeekContainsDate: anchor };
              const week = api.getWeek(v, o),
                year = api.getWeekYear(v, o);
              const first = (y: number) => {
                const d = date({ year: y, month: 1, day: anchor });
                return d.subtract({ days: ((d.dayOfWeek % 7) - weekday + 7) % 7 });
              };
              rows.push({
                start: first(year),
                next: first(year + 1),
                anchor: date({ year, month: 1, day: anchor }),
                week,
                weekday,
              });
            }
        },
      ),
      Then(
        'the first week of the returned week-year contains its January firstWeekContainsDate',
        () => {
          for (const row of rows) {
            expect(T.PlainDate.compare(row.anchor, row.start)).toBeGreaterThanOrEqual(0);
            expect(row.start.until(row.anchor).days).toBeLessThan(7);
          }
        },
      ),
      Then('it begins on weekStartsOn', () => {
        for (const row of rows) expect(row.start.dayOfWeek % 7).toBe(row.weekday);
      }),
      Then('the input lies in the returned 1-based seven-date week', () => {
        for (const row of rows) {
          const offset = row.start.until(asTemporal(v, 'PlainDate')).days;
          expect(offset).toBeGreaterThanOrEqual((row.week - 1) * 7);
          expect(offset).toBeLessThan(row.week * 7);
        }
      }),
      Then('the input is on or after the first week start of the returned week-year', () => {
        for (const row of rows)
          expect(T.PlainDate.compare(asTemporal(v, 'PlainDate'), row.start)).toBeGreaterThanOrEqual(
            0,
          );
      }),
      Then('the input is strictly before the first week start of the following week-year', () => {
        for (const row of rows)
          expect(T.PlainDate.compare(asTemporal(v, 'PlainDate'), row.next)).toBeLessThan(0);
      }),
      Then('the returned week is between 1 and the number of weeks in that week-year', () => {
        for (const row of rows) {
          expect(row.week).toBeGreaterThanOrEqual(1);
          expect(row.week).toBeLessThanOrEqual(row.start.until(row.next).days / 7);
        }
      }),
    ],
  };
});

registerScenario<ExampleRows['CAL-008']>('CAL-008', () => {
  let v!: TemporalValue;
  let out!: Observation;
  return {
    steps: [
      Given('a PlainDate "<value>"', (r) => {
        v = value('PlainDate', r.value);
      }),
      When('getWeekOfMonth is called with <options>', (r) => {
        out = observe(() => api['getWeekOfMonth'](v, options(r.options)));
      }),
      Then('the result is <week>', (r) => {
        expect(returned(out)).toBe(Number(r.week));
      }),
    ],
  };
});

registerScenario<ExampleRows['CAL-009']>('CAL-009', () => {
  let v!: TemporalValue;
  let out!: Observation;
  return {
    steps: [
      Given('a <kind> "<value>"', (r) => {
        v = value(r.kind, r.value);
      }),
      When('getWeeksInMonth is called with <options>', (r) => {
        out = observe(() => api['getWeeksInMonth'](v, options(r.options)));
      }),
      Then('the result is <weeks>', (r) => {
        expect(returned(out)).toBe(Number(r.weeks));
      }),
    ],
  };
});

registerScenario<ExampleRows['CAL-010']>('CAL-010', () => {
  let v!: TemporalValue;
  let out!: Observation;
  return {
    steps: [
      Given('a PlainDate "2026-01-01"', () => {
        v = value('PlainDate', '2026-01-01');
      }),
      When('<function> is called with firstWeekContainsDate <anchor>', (r) => {
        out = observe(() => api[r.function](v, { firstWeekContainsDate: literal(r.anchor) }));
      }),
      Then('the call throws an invalid-option error', () => {
        failed(out);
      }),
    ],
  };
});

registerScenario<ExampleRows['CAL-011']>('CAL-011', () => {
  let v!: TemporalValue;
  let out!: Observation;
  let year!: Observation;
  return {
    steps: [
      Given('Instant "2026-01-01T01:00Z" viewed as a ZonedDateTime in "<zone>"', (r) => {
        v = instant('2026-01-01T01:00Z').toZonedDateTimeISO(r.zone);
      }),
      When('getQuarter and getWeekYear are called with omitted options', () => {
        out = observe(() => api.getQuarter(v));
        year = observe(() => api.getWeekYear(v));
      }),
      Then('getQuarter returns <quarter>', (r) => {
        expect(returned(out)).toBe(Number(r.quarter));
      }),
      Then('getWeekYear returns 2026', () => {
        expect(returned(year)).toBe(2026);
      }),
    ],
  };
});

registerScenario<ExampleRows['CAL-012']>('CAL-012', () => {
  let v!: TemporalValue;
  let out!: Observation;
  return {
    steps: [
      Given('a PlainDate "+275760-09-13"', () => {
        v = value('PlainDate', '+275760-09-13');
      }),
      When("nextDay is called with the input's own weekday number", () => {
        out = observe(() => api['nextDay'](v, asTemporal(v, 'PlainDate').dayOfWeek % 7));
      }),
      Then('the call throws RangeError', () => {
        failed(out, RangeError);
      }),
    ],
  };
});

registerScenario<ExampleRows['CAL-013']>('CAL-013', () => {
  let v!: TemporalValue;
  let out!: Observation;
  return {
    steps: [
      Given('a PlainDate "2026-10-23"', () => {
        v = value('PlainDate', '2026-10-23');
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

registerScenario<ExampleRows['CAL-014']>('CAL-014', () => {
  let v!: TemporalValue;
  let out!: Observation;
  return {
    steps: [
      Given('a PlainYearMonth "<value>"', (r) => {
        v = value('PlainYearMonth', r.value);
      }),
      When('getWeeksInMonth is called with omitted options', () => {
        out = observe(() => api['getWeeksInMonth'](v));
      }),
      Then('the result is 5', () => {
        expect(returned(out)).toBe(5);
      }),
    ],
  };
});
