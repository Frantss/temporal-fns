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
  dt,
  equal,
  instant,
  kindOf,
  literal,
  time,
  value,
  withNow,
  zoned,
} from './support.js';

registerScenario<ExampleRows['PAR-001']>('PAR-001', () => {
  let v!: TemporalValue;
  let out!: Observation;
  let text!: string;
  let pattern!: string;
  return {
    steps: [
      Given('a <kind> reference "<reference>"', (r) => {
        v = value(r.kind, r.reference);
      }),
      When('parse is called with text "<text>" and pattern "<pattern>"', (r) => {
        text = r.text;
        pattern = r.pattern;
        out = observe(() => api.parse(text, pattern, v));
      }),
      Then('the result is a <kind> equal to "<result>"', (r) => {
        equal(returned(out), value(kindOf(v), r.result));
      }),
      When('tryParse is called with the same text, pattern and reference', () => {
        out = observe(() => api.tryParse(text, pattern, v));
      }),
      Then('its tuple is [null, a <kind> equal to "<result>"]', (r) => {
        const tuple = returned(out) as unknown[];
        expect(tuple).toHaveLength(2);
        expect(tuple[0]).toBe(null);
        equal(tuple[1], value(kindOf(v), r.result));
      }),
      When('isMatch is called with the same text, pattern and reference', () => {
        out = observe(() => api.isMatch(text, pattern, v));
      }),
      Then('the result is true', () => {
        expect(returned(out)).toBe(true);
      }),
    ],
  };
});

registerScenario<ExampleRows['PAR-002']>('PAR-002', () => {
  let v!: TemporalValue;
  let out!: Observation;
  let text!: string;
  let pattern!: string;
  return {
    steps: [
      Given('a <kind> reference "<reference>"', (r) => {
        v = value(r.kind, r.reference);
      }),
      When('parse is called with text "<text>" and pattern "<pattern>"', (r) => {
        text = r.text;
        pattern = r.pattern;
        out = observe(() => api.parse(text, pattern, v));
      }),
      Then('the result equals "<result>" without changing kind', (r) => {
        equal(returned(out), value(kindOf(v), r.result));
      }),
      When('tryParse is called with the same text, pattern and reference', () => {
        out = observe(() => api.tryParse(text, pattern, v));
      }),
      Then('its result element equals "<result>" with a null error element', (r) => {
        const tuple = returned(out) as unknown[];
        expect(tuple).toHaveLength(2);
        expect(tuple[0]).toBe(null);
        equal(tuple[1], value(kindOf(v), r.result));
      }),
    ],
  };
});

registerScenario<ExampleRows['PAR-003']>('PAR-003', () => {
  let v!: TemporalValue;
  let out!: Observation;
  return {
    steps: [
      Given('a PlainDate reference "2000-01-01"', () => {
        v = date('2000-01-01');
      }),
      When('tryParse is called with text "02/29/2024" and pattern "MM/dd/yyyy"', () => {
        out = observe(() => api.tryParse('02/29/2024', 'MM/dd/yyyy', v));
      }),
      Then('the tuple is [null, PlainDate "2024-02-29"]', () => {
        const t = returned(out) as unknown[];
        expect(t).toHaveLength(2);
        expect(t[0]).toBe(null);
        equal(t[1], date('2024-02-29'));
      }),
      Then('exactly one tuple element is non-null', () => {
        expect((returned(out) as unknown[]).filter((x) => x !== null)).toHaveLength(1);
      }),
      Then('a caller narrowing the error to null can use the result as PlainDate', () => {
        const tuple = returned(out) as ReturnType<typeof api.tryParse>;
        if (tuple[0] !== null) throw tuple[0];
        equal(tuple[1], date('2024-02-29'));
      }),
    ],
  };
});

registerScenario<ExampleRows['PAR-004']>('PAR-004', () => {
  let v!: TemporalValue;
  let out!: Observation;
  let text!: string;
  let pattern!: string;
  let tried!: Observation;
  let matched!: Observation;
  return {
    steps: [
      Given('a PlainDate reference "2000-01-01"', () => {
        v = value('PlainDate', '2000-01-01');
      }),
      When('the text "<text>" is processed with pattern "MM/dd/yyyy"', (r) => {
        text = r.text;
        pattern = 'MM/dd/yyyy';
        out = observe(() => api.parse(text, pattern, v));
        tried = observe(() => api.tryParse(text, pattern, v));
        matched = observe(() => api.isMatch(text, pattern, v));
      }),
      Then('parse throws RangeError', () => {
        failed(out, RangeError);
      }),
      Then('tryParse returns [RangeError, null]', () => {
        const tuple = returned(tried) as unknown[];
        expect(tuple).toHaveLength(2);
        expect(tuple[0]).toBeInstanceOf(RangeError);
        expect(tuple[1]).toBe(null);
      }),
      Then('isMatch returns false', () => {
        expect(returned(matched)).toBe(false);
      }),
    ],
  };
});

registerScenario<ExampleRows['PAR-005']>('PAR-005', () => {
  let v!: TemporalValue;
  let out!: Observation;
  let text!: string;
  let pattern!: string;
  let tried!: Observation;
  let matched!: Observation;
  return {
    steps: [
      Given('a PlainDate reference "2000-01-01"', () => {
        v = value('PlainDate', '2000-01-01');
      }),
      Given('input consists of "02/29/2024" followed by a line feed', () => {
        text = '02/29/2024\n';
      }),
      When('the input is processed with pattern "MM/dd/yyyy"', () => {
        text = '02/29/2024\n';
        pattern = 'MM/dd/yyyy';
        out = observe(() => api.parse(text, pattern, v));
        tried = observe(() => api.tryParse(text, pattern, v));
        matched = observe(() => api.isMatch(text, pattern, v));
      }),
      Then('parse throws RangeError', () => {
        failed(out, RangeError);
      }),
      Then('tryParse returns [RangeError, null]', () => {
        const tuple = returned(tried) as unknown[];
        expect(tuple).toHaveLength(2);
        expect(tuple[0]).toBeInstanceOf(RangeError);
        expect(tuple[1]).toBe(null);
      }),
      Then('isMatch returns false', () => {
        expect(returned(matched)).toBe(false);
      }),
    ],
  };
});

registerScenario<ExampleRows['PAR-006']>('PAR-006', () => {
  let v!: TemporalValue;
  let out!: Observation;
  let text!: string;
  let pattern!: string;
  let matched!: Observation;
  return {
    steps: [
      Given('a PlainDate reference "2000-07-19"', () => {
        v = date('2000-07-19');
      }),
      When('the text "<text>" is processed with pattern "yyyy"', (r) => {
        text = r.text;
        pattern = 'yyyy';
        out = observe(() => api.parse(text, pattern, v));
        matched = observe(() => api.isMatch(text, pattern, v));
      }),
      Then('isMatch returns <matches>', (r) => {
        expect(returned(matched)).toBe(r.matches === 'true');
      }),
      Then('parse <outcome>', (r) => {
        if (r.matches === 'true') equal(returned(out), date(r.outcome.match(/"([^"]+)"/)![1]!));
        else failed(out, RangeError);
      }),
    ],
  };
});

registerScenario<ExampleRows['PAR-007']>('PAR-007', () => {
  let v!: TemporalValue;
  let out!: Observation;
  let text!: string;
  let pattern!: string;
  let tried!: Observation;
  let matched!: Observation;
  return {
    steps: [
      Given('a PlainTime reference "12:34:56"', () => {
        v = value('PlainTime', '12:34:56');
      }),
      When('text "<text>" is processed with pattern "<pattern>"', (r) => {
        text = r.text;
        pattern = r.pattern;
        out = observe(() => api.parse(text, pattern, v));
        tried = observe(() => api.tryParse(text, pattern, v));
        matched = observe(() => api.isMatch(text, pattern, v));
      }),
      Then('parse throws RangeError', () => {
        failed(out, RangeError);
      }),
      Then('tryParse returns [RangeError, null]', () => {
        const tuple = returned(tried) as unknown[];
        expect(tuple).toHaveLength(2);
        expect(tuple[0]).toBeInstanceOf(RangeError);
        expect(tuple[1]).toBe(null);
      }),
      Then('isMatch returns false', () => {
        expect(returned(matched)).toBe(false);
      }),
    ],
  };
});

registerScenario<ExampleRows['PAR-008']>('PAR-008', () => {
  let v!: TemporalValue;
  let out!: Observation;
  let text!: string;
  let pattern!: string;
  return {
    steps: [
      Given('a PlainTime reference "21:34:56.123456789"', () => {
        v = value('PlainTime', '21:34:56.123456789');
      }),
      When('parse is called with text "<text>" and pattern "hh:mm a"', (r) => {
        text = r.text;
        pattern = 'hh:mm a';
        out = observe(() => api.parse(text, pattern, v));
      }),
      Then('the result equals "<result>"', (r) => {
        equal(returned(out), value(kindOf(v), r.result));
      }),
    ],
  };
});

registerScenario<ExampleRows['PAR-009']>('PAR-009', () => {
  let v!: TemporalValue;
  let out!: Observation;
  let text!: string;
  let pattern!: string;
  let tried!: Observation;
  let matched!: Observation;
  return {
    steps: [
      Given('a <kind> reference "<reference>"', (r) => {
        v = value(r.kind, r.reference);
      }),
      When('text "<text>" is processed with pattern "<pattern>"', (r) => {
        text = r.text;
        pattern = r.pattern;
        out = observe(() => api.parse(text, pattern, v));
        tried = observe(() => api.tryParse(text, pattern, v));
        matched = observe(() => api.isMatch(text, pattern, v));
      }),
      Then('parse, tryParse and isMatch each throw an invalid-pattern error', () => {
        [out, tried, matched].forEach((o) => failed(o));
      }),
      Then('no error tuple or false result masks that configuration error', () => {
        [out, tried, matched].forEach((o) => expect(o.value).toBeUndefined());
      }),
    ],
  };
});

registerScenario<ExampleRows['PAR-010']>('PAR-010', () => {
  let v!: TemporalValue;
  let out!: Observation;
  let text!: string;
  let pattern!: string;
  return {
    steps: [
      Given('a PlainDate reference "2000-07-19"', () => {
        v = date('2000-07-19');
      }),
      When('parse is called with text "2026.[02]" and pattern "yyyy.[MM]"', () => {
        text = '2026.[02]';
        pattern = 'yyyy.[MM]';
        out = observe(() => api.parse(text, pattern, v));
      }),
      Then('the result equals "2026-02-01"', () => {
        equal(returned(out), date('2026-02-01'));
      }),
      When('isMatch is called with text "2026x[02]" and the same pattern and reference', () => {
        out = observe(() => api.isMatch('2026x[02]', pattern, v));
      }),
      Then('the result is false', () => {
        expect(returned(out)).toBe(false);
      }),
    ],
  };
});

registerScenario<ExampleRows['PAR-011']>('PAR-011', () => {
  let v!: TemporalValue;
  let out!: Observation;
  let text!: string;
  let pattern!: string;
  let opts: Record<string, unknown> | undefined;
  return {
    steps: [
      Given('an Instant reference "2026-01-01T01:30Z"', () => {
        v = value('Instant', '2026-01-01T01:30Z');
      }),
      When('parse is called with text "<text>", pattern "<pattern>" and timeZone "<zone>"', (r) => {
        text = r.text;
        pattern = r.pattern;
        opts = { timeZone: r.zone };
        out = observe(() => api.parse(text, pattern, v, opts));
      }),
      Then('the result is an Instant equal to "<result>"', (r) => {
        equal(returned(out), value(kindOf(v), r.result));
      }),
      When('tryParse is called with the same text, pattern, reference and options', () => {
        out = observe(() => api.tryParse(text, pattern, v, opts));
      }),
      Then('it returns [null, an Instant equal to "<result>"]', (r) => {
        const tuple = returned(out) as unknown[];
        expect(tuple).toHaveLength(2);
        expect(tuple[0]).toBe(null);
        equal(tuple[1], value(kindOf(v), r.result));
      }),
      When('isMatch is called with the same text, pattern, reference and options', () => {
        out = observe(() => api.isMatch(text, pattern, v, opts));
      }),
      Then('it returns true', () => {
        expect(returned(out)).toBe(true);
      }),
    ],
  };
});

registerScenario<ExampleRows['PAR-012']>('PAR-012', () => {
  let v!: TemporalValue;
  let opts: Record<string, unknown> | undefined;
  let observations!: Observation[];
  return {
    steps: [
      Given('a <kind> reference "<reference>"', (r) => {
        v = value(r.kind, r.reference);
      }),
      When('parse, tryParse or isMatch is called with a compatible pattern and <context>', (r) => {
        opts = r.context.startsWith('omitted')
          ? undefined
          : { timeZone: r.context.match(/"([^"]+)"/)![1] };
        observations = ['parse', 'tryParse', 'isMatch'].map((f) =>
          observe(() => api[f as 'parse']('literal', "'literal'", v, opts)),
        );
      }),
      Then('the call throws a zone-context error', () => {
        observations.forEach((o) => failed(o));
      }),
    ],
  };
});

registerScenario<ExampleRows['PAR-013']>('PAR-013', () => {
  let v!: TemporalValue;
  let out!: Observation;
  let text!: string;
  let pattern!: string;
  let opts: Record<string, unknown> | undefined;
  return {
    steps: [
      Given('a ZonedDateTime reference "2026-01-01T12:00[America/New_York]"', () => {
        v = value('ZonedDateTime', '2026-01-01T12:00[America/New_York]');
      }),
      When(
        'parse is called with text "2026-11-01 01:30", pattern "yyyy-MM-dd HH:mm" and disambiguation "<policy>"',
        (r) => {
          text = '2026-11-01 01:30';
          pattern = 'yyyy-MM-dd HH:mm';
          opts = { disambiguation: r.policy };
          out = observe(() => api.parse(text, pattern, v, opts));
        },
      ),
      Then('the result equals "<result>"', (r) => {
        equal(returned(out), value(kindOf(v), r.result));
      }),
    ],
  };
});

registerScenario<ExampleRows['PAR-014']>('PAR-014', () => {
  let v!: TemporalValue;
  let out!: Observation;
  let text!: string;
  let pattern!: string;
  let opts: Record<string, unknown> | undefined;
  return {
    steps: [
      Given('a ZonedDateTime reference "2026-01-01T12:00[America/New_York]"', () => {
        v = value('ZonedDateTime', '2026-01-01T12:00[America/New_York]');
      }),
      When(
        'parse is called with text "2026-03-08 02:30", pattern "yyyy-MM-dd HH:mm" and <context>',
        (r) => {
          text = '2026-03-08 02:30';
          pattern = 'yyyy-MM-dd HH:mm';
          opts = r.context.startsWith('omitted')
            ? undefined
            : { disambiguation: r.context.match(/"([^"]+)"/)![1] };
          out = observe(() => api.parse(text, pattern, v, opts));
        },
      ),
      Then('the result equals "<result>"', (r) => {
        equal(returned(out), value(kindOf(v), r.result));
      }),
    ],
  };
});

registerScenario<ExampleRows['PAR-015']>('PAR-015', () => {
  let v!: TemporalValue;
  let out!: Observation;
  let text!: string;
  let pattern!: string;
  let opts: Record<string, unknown> | undefined;
  let tried!: Observation;
  let matched!: Observation;
  return {
    steps: [
      Given('a ZonedDateTime reference "2026-01-01T12:00[America/New_York]"', () => {
        v = value('ZonedDateTime', '2026-01-01T12:00[America/New_York]');
      }),
      When(
        'text "<text>" is processed with pattern "yyyy-MM-dd HH:mm" and disambiguation "reject"',
        (r) => {
          text = r.text;
          pattern = 'yyyy-MM-dd HH:mm';
          opts = { disambiguation: 'reject' };
          out = observe(() => api.parse(text, pattern, v, opts));
          tried = observe(() => api.tryParse(text, pattern, v, opts));
          matched = observe(() => api.isMatch(text, pattern, v, opts));
        },
      ),
      Then('parse throws RangeError', () => {
        failed(out, RangeError);
      }),
      Then('tryParse returns [RangeError, null]', () => {
        const tuple = returned(tried) as unknown[];
        expect(tuple).toHaveLength(2);
        expect(tuple[0]).toBeInstanceOf(RangeError);
        expect(tuple[1]).toBe(null);
      }),
      Then('isMatch returns false', () => {
        expect(returned(matched)).toBe(false);
      }),
    ],
  };
});

registerScenario<ExampleRows['PAR-016']>('PAR-016', () => {
  let v!: TemporalValue;
  let out!: Observation;
  return {
    steps: [
      Given('a ZonedDateTime reference "2026-01-01T12:00[America/New_York]"', () => {
        v = zoned('2026-01-01T12:00[America/New_York]');
      }),
      When(
        'parse is called with text "2026-07-01T12:00+0100" and pattern "yyyy-MM-dd\'T\'HH:mmXX"',
        () => {
          out = observe(() => api.parse('2026-07-01T12:00+0100', "yyyy-MM-dd'T'HH:mmXX", v));
        },
      ),
      Then('the result has instant "2026-07-01T11:00Z"', () => {
        equal(asTemporal(returned(out), 'ZonedDateTime').toInstant(), instant('2026-07-01T11:00Z'));
      }),
      Then('the result retains zone "America/New_York"', () => {
        expect(asTemporal(returned(out), 'ZonedDateTime').timeZoneId).toBe('America/New_York');
      }),
      Then('its local clock time is "07:00"', () => {
        equal(asTemporal(returned(out), 'ZonedDateTime').toPlainTime(), time('07:00'));
      }),
    ],
  };
});

registerScenario<ExampleRows['PAR-017']>('PAR-017', () => {
  let v!: TemporalValue;
  let out!: Observation;
  let text!: string;
  let pattern!: string;
  let opts: Record<string, unknown> | undefined;
  return {
    steps: [
      Given('an Instant reference "2026-10-23T12:34:56.123456789Z"', () => {
        v = value('Instant', '2026-10-23T12:34:56.123456789Z');
      }),
      When('parse is called with text "+01:00", pattern "XXX" and timeZone "UTC"', () => {
        text = '+01:00';
        pattern = 'XXX';
        opts = { timeZone: 'UTC' };
        out = observe(() => api.parse(text, pattern, v, opts));
      }),
      Then('the result is Instant "2026-10-23T11:34:56.123456789Z"', () => {
        equal(returned(out), value(kindOf(v), '2026-10-23T11:34:56.123456789Z'));
      }),
    ],
  };
});

registerScenario<ExampleRows['PAR-018']>('PAR-018', () => {
  let v!: TemporalValue;
  let out!: Observation;
  let text!: string;
  let pattern!: string;
  let tried!: Observation;
  let matched!: Observation;
  return {
    steps: [
      Given('a PlainDateTime reference "2000-07-19T21:34:56.123456789"', () => {
        v = dt('2000-07-19T21:34:56.123456789');
      }),
      When('text "<text>" is processed with pattern "<pattern>"', (r) => {
        text = r.text;
        pattern = r.pattern;
        out = observe(() => api.parse(text, pattern, v));
        tried = observe(() => api.tryParse(text, pattern, v));
        matched = observe(() => api.isMatch(text, pattern, v));
      }),
      Then('parse returns a PlainDateTime equal to the reference', () => {
        equal(returned(out), v);
      }),
      Then('tryParse returns [null, a PlainDateTime equal to the reference]', () => {
        const tuple = returned(tried) as unknown[];
        expect(tuple).toHaveLength(2);
        expect(tuple[0]).toBe(null);
        equal(tuple[1], v);
      }),
      Then('isMatch returns true', () => {
        expect(returned(matched)).toBe(true);
      }),
    ],
  };
});

registerScenario<ExampleRows['PAR-019']>('PAR-019', () => {
  let v!: TemporalValue;
  let out!: Observation;
  let text!: string;
  let pattern!: string;
  let tried!: Observation;
  let matched!: Observation;
  return {
    steps: [
      Given('a PlainDate reference "2000-07-19"', () => {
        v = value('PlainDate', '2000-07-19');
      }),
      When('text "<text>" is processed with pattern "<pattern>"', (r) => {
        text = r.text;
        pattern = r.pattern;
        out = observe(() => api.parse(text, pattern, v));
        tried = observe(() => api.tryParse(text, pattern, v));
        matched = observe(() => api.isMatch(text, pattern, v));
      }),
      Then('parse throws RangeError', () => {
        failed(out, RangeError);
      }),
      Then('tryParse returns [RangeError, null]', () => {
        const tuple = returned(tried) as unknown[];
        expect(tuple).toHaveLength(2);
        expect(tuple[0]).toBeInstanceOf(RangeError);
        expect(tuple[1]).toBe(null);
      }),
      Then('isMatch returns false', () => {
        expect(returned(matched)).toBe(false);
      }),
    ],
  };
});

registerScenario<ExampleRows['PAR-020']>('PAR-020', () => {
  let v!: TemporalValue;
  let results!: Observation[];
  return {
    steps: [
      Given('a PlainDate reference "2000-07-19"', () => {
        v = date('2000-07-19');
      }),
      When(
        'parse is called with text "02", pattern "MM" and that reference on two different current dates',
        () => {
          results = ['2020-01-01T00:00Z', '2030-12-31T00:00Z'].map((now) =>
            observe(() => withNow(now, () => api.parse('02', 'MM', v))),
          );
        },
      ),
      Then('both results equal PlainDate "2000-02-01"', () => {
        results.forEach((o) => equal(returned(o), date('2000-02-01')));
      }),
      Then('the reference still equals "2000-07-19"', () => {
        equal(v, date('2000-07-19'));
      }),
    ],
  };
});

registerScenario<ExampleRows['PAR-021']>('PAR-021', () => {
  let v!: TemporalValue;
  let out!: Observation;
  let text!: string;
  let pattern!: string;
  let tried!: Observation;
  let matched!: Observation;
  return {
    steps: [
      Given('a PlainDate reference "2000-07-19"', () => {
        v = date('2000-07-19');
      }),
      Given('text consisting of one space followed by "02/29/2024"', () => {
        text = ' 02/29/2024';
      }),
      When('the text is processed with pattern "MM/dd/yyyy"', () => {
        pattern = 'MM/dd/yyyy';
        out = observe(() => api.parse(text, pattern, v));
        tried = observe(() => api.tryParse(text, pattern, v));
        matched = observe(() => api.isMatch(text, pattern, v));
      }),
      Then('parse throws RangeError', () => {
        failed(out, RangeError);
      }),
      Then('tryParse returns [RangeError, null]', () => {
        const tuple = returned(tried) as unknown[];
        expect(tuple).toHaveLength(2);
        expect(tuple[0]).toBeInstanceOf(RangeError);
        expect(tuple[1]).toBe(null);
      }),
      Then('isMatch returns false', () => {
        expect(returned(matched)).toBe(false);
      }),
      When(
        'parse is called with the same text and a pattern consisting of one space followed by "MM/dd/yyyy"',
        () => {
          out = observe(() => api.parse(text, ' MM/dd/yyyy', v));
        },
      ),
      Then('it returns PlainDate "2024-02-29"', () => {
        equal(returned(out), date('2024-02-29'));
      }),
    ],
  };
});

registerScenario<ExampleRows['PAR-022']>('PAR-022', () => {
  let v!: TemporalValue;
  let out!: Observation;
  let text!: string;
  let pattern!: string;
  return {
    steps: [
      Given('a <kind> reference "<reference>"', (r) => {
        v = value(r.kind, r.reference);
      }),
      When('parse is called with text "<text>" and pattern "<pattern>"', (r) => {
        text = r.text;
        pattern = r.pattern;
        out = observe(() => api.parse(text, pattern, v));
      }),
      Then('the result equals "<result>"', (r) => {
        equal(returned(out), value(kindOf(v), r.result));
      }),
    ],
  };
});

registerScenario<ExampleRows['PAR-023']>('PAR-023', () => {
  let v!: TemporalValue;
  let out!: Observation;
  let text!: string;
  let pattern!: string;
  let opts: Record<string, unknown> | undefined;
  let tried!: Observation;
  let matched!: Observation;
  return {
    steps: [
      Given('an Instant reference "2026-01-01T00:00Z" with timeZone "UTC"', () => {
        v = value('Instant', '2026-01-01T00:00Z');
        opts = { timeZone: 'UTC' };
      }),
      When('text "<text>" is processed with pattern "yyyy-MM-dd HH:mm XXX"', (r) => {
        text = r.text;
        pattern = 'yyyy-MM-dd HH:mm XXX';
        out = observe(() => api.parse(text, pattern, v, opts));
        tried = observe(() => api.tryParse(text, pattern, v, opts));
        matched = observe(() => api.isMatch(text, pattern, v, opts));
      }),
      Then('parse throws RangeError', () => {
        failed(out, RangeError);
      }),
      Then('tryParse returns [RangeError, null]', () => {
        const tuple = returned(tried) as unknown[];
        expect(tuple).toHaveLength(2);
        expect(tuple[0]).toBeInstanceOf(RangeError);
        expect(tuple[1]).toBe(null);
      }),
      Then('isMatch returns false', () => {
        expect(returned(matched)).toBe(false);
      }),
    ],
  };
});

registerScenario<ExampleRows['PAR-024']>('PAR-024', () => {
  let v!: TemporalValue;
  let out!: Observation;
  let text!: string;
  let pattern!: string;
  let opts: Record<string, unknown> | undefined;
  let tried!: Observation;
  let matched!: Observation;
  return {
    steps: [
      Given('a ZonedDateTime reference "2026-01-01T12:00[America/New_York]"', () => {
        v = zoned('2026-01-01T12:00[America/New_York]');
      }),
      When(
        'valid text "2026-10-23 12:00" is processed with pattern "yyyy-MM-dd HH:mm" and disambiguation <policy>',
        (r) => {
          text = '2026-10-23 12:00';
          pattern = 'yyyy-MM-dd HH:mm';
          opts = { disambiguation: literal(r.policy) };
          out = observe(() => api.parse(text, pattern, v, opts));
          tried = observe(() => api.tryParse(text, pattern, v, opts));
          matched = observe(() => api.isMatch(text, pattern, v, opts));
        },
      ),
      Then('parse, tryParse and isMatch each throw an invalid-option error', () => {
        [out, tried, matched].forEach((o) => failed(o));
      }),
      Then('none converts that failure into false or an error tuple', () => {
        [out, tried, matched].forEach((o) => expect(o.value).toBeUndefined());
      }),
    ],
  };
});

registerScenario<ExampleRows['PAR-025']>('PAR-025', () => {
  let v!: TemporalValue;
  let out!: Observation;
  return {
    steps: [
      Given('an Instant reference "2026-10-23T12:34:56.123456789Z"', () => {
        v = instant('2026-10-23T12:34:56.123456789Z');
      }),
      When(
        '<function> is called with text "literal", pattern "\'literal\'" and omitted timeZone',
        (r) => {
          out = observe(() => api[r.function]('literal', "'literal'", v));
        },
      ),
      Then('it throws a missing-zone error', () => {
        failed(out);
      }),
    ],
  };
});

registerScenario<ExampleRows['PAR-026']>('PAR-026', () => {
  let v!: TemporalValue;
  let out!: Observation;
  let text!: string;
  let pattern!: string;
  let opts: Record<string, unknown> | undefined;
  return {
    steps: [
      Given('an Instant reference "2026-10-23T12:34:56.123456789Z"', () => {
        v = instant('2026-10-23T12:34:56.123456789Z');
      }),
      When(
        'parse is called with text "literal", pattern "\'literal\'" and timeZone "America/Montevideo"',
        () => {
          text = 'literal';
          pattern = "'literal'";
          opts = { timeZone: 'America/Montevideo' };
          out = observe(() => api.parse(text, pattern, v, opts));
        },
      ),
      Then('the result is an Instant equal to that original reference', () => {
        equal(returned(out), v);
      }),
      When('tryParse is called with the same arguments', () => {
        out = observe(() => api.tryParse(text, pattern, v, opts));
      }),
      Then('it returns [null, an Instant equal to that original reference]', () => {
        const t = returned(out) as unknown[];
        expect(t).toHaveLength(2);
        expect(t[0]).toBe(null);
        equal(t[1], v);
      }),
      When('isMatch is called with the same arguments', () => {
        out = observe(() => api.isMatch(text, pattern, v, opts));
      }),
      Then('it returns true', () => {
        expect(returned(out)).toBe(true);
      }),
    ],
  };
});

registerScenario<ExampleRows['PAR-027']>('PAR-027', () => {
  let v!: TemporalValue;
  let out!: Observation;
  let pattern!: string;
  let input: unknown;
  return {
    steps: [
      Given('a PlainDate reference "2000-01-01" and valid pattern "yyyy-MM-dd"', () => {
        v = date('2000-01-01');
        pattern = 'yyyy-MM-dd';
      }),
      Given('a non-string primary argument <input>', (r) => {
        input = literal(r.input);
      }),
      When('<function> is called with that argument, pattern and reference', (r) => {
        out = observe(() => api[r.function](input, pattern, v));
      }),
      Then('the call throws rather than returning false or an error tuple', () => {
        failed(out);
        expect(out.value).toBeUndefined();
      }),
    ],
  };
});
