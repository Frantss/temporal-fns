import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { expect } from 'vitest';
import * as calendar from '../../dist/calendar.js';
import * as root from '../../dist/index.js';
import { freezeContainers, globalSnapshot, snapshot } from './assertions.js';
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
import type { TemporalKind, TemporalValue } from './support.js';
import {
  api,
  arrangement,
  date,
  equal,
  options,
  representative,
  time,
  value,
  withNow,
} from './support.js';

registerScenario<ExampleRows['CON-001']>('CON-001', () => {
  let result!: ReturnType<typeof import('node:child_process').spawnSync>;
  let code!: string;
  return {
    steps: [
      Given('a host without a global Temporal namespace', () => {
        code = "Reflect.deleteProperty(globalThis,'Temporal');";
      }),
      When('the caller imports the root entry point and the calendar subpath', () => {
        result = spawnSync(
          process.execPath,
          [
            '--input-type=module',
            '-e',
            code +
              "await import('@frantss/temporal-fns');await import('@frantss/temporal-fns/calendar');console.log(JSON.stringify({absent:typeof Reflect.get(globalThis,'Temporal')==='undefined'}));",
          ],
          { encoding: 'utf8' },
        );
      }),
      Then('both imports complete', () => {
        expect(result.status, String(result.stderr)).toBe(0);
      }),
      Then('global Temporal remains absent', () => {
        expect(JSON.parse(String(result.stdout))).toEqual({ absent: true });
      }),
      Then('the package does not install a polyfill', () => {
        expect(JSON.parse(String(result.stdout)).absent).toBe(true);
      }),
    ],
  };
});

registerScenario<ExampleRows['CON-002']>('CON-002', () => {
  let v!: TemporalValue;
  let out!: Observation;
  let missing!: boolean;
  return {
    steps: [
      Given('the package has been imported', () => {
        expect(Object.keys(api)).toContain('endOfDay');
      }),
      Given(
        'valid Temporal PlainTime input "12:00" was created before global Temporal became unavailable',
        () => {
          v = time('12:00');
        },
      ),
      When('endOfDay is called with that input while global Temporal is unavailable', () => {
        const descriptor = Object.getOwnPropertyDescriptor(globalThis, 'Temporal')!;
        try {
          Reflect.deleteProperty(globalThis, 'Temporal');
          out = observe(() => api.endOfDay(v));
          missing = Reflect.get(globalThis, 'Temporal') === undefined;
        } finally {
          Object.defineProperty(globalThis, 'Temporal', descriptor);
        }
      }),
      Then('the call throws a Temporal-unavailable error', () => {
        failed(out);
      }),
      Then('it does not install a Temporal namespace', () => {
        expect(missing).toBe(true);
      }),
    ],
  };
});

registerScenario<ExampleRows['CON-003']>('CON-003', () => {
  let exported!: string[];
  let rootNames!: string[];
  return {
    steps: [
      When('a caller imports the root entry point', () => {
        exported = Object.keys(root);
        rootNames = [
          ...readFileSync(
            new URL('../../docs/behavior/coverage.md', import.meta.url),
            'utf8',
          ).matchAll(/^\| `(\w+)`\s*\|/gm),
        ].map((m) => m[1]!);
      }),
      Then('it exposes exactly the 54 root functions listed in coverage.md', () => {
        expect(exported.sort()).toEqual(
          rootNames.filter((f) => !['toCalendarDate', 'fromCalendarDate'].includes(f)).sort(),
        );
        expect(exported).toHaveLength(54);
      }),
      When('the caller imports the calendar subpath', () => {
        exported = Object.keys(calendar);
      }),
      Then('it exposes toCalendarDate and fromCalendarDate', () => {
        expect(exported.sort()).toEqual(['fromCalendarDate', 'toCalendarDate']);
      }),
      Then('the root does not expose the two calendar adapters', () => {
        expect(Object.keys(root)).not.toContain('toCalendarDate');
        expect(Object.keys(root)).not.toContain('fromCalendarDate');
      }),
    ],
  };
});

registerScenario<ExampleRows['CON-004']>('CON-004', () => {
  let v!: TemporalValue;
  let out!: Observation;
  return {
    steps: [
      Given('a <kind> value with calendar "gregory" and ISO reference fields "<fields>"', (r) => {
        v = value(r.kind, r.fields + '[u-ca=gregory]');
      }),
      When('<function> is called with <arguments>', (r) => {
        out = observe(() =>
          r.function === 'addBusinessDays'
            ? api.addBusinessDays(v, 0)
            : arrangement(r.function, v, r.kind)(),
        );
      }),
      Then('it throws RangeError for the unsupported calendar', () => {
        failed(out, RangeError);
      }),
    ],
  };
});

registerScenario<ExampleRows['CON-005']>('CON-005', () => {
  let v!: TemporalValue;
  let out!: Observation;
  let second!: Observation;
  return {
    steps: [
      Given('a PlainDate "2026-10-23"', () => {
        v = date('2026-10-23');
      }),
      When('<function> is called once with omitted options and once with <options>', (r) => {
        const opts = Object.fromEntries(
          [...r.options.matchAll(/(\w+): undefined/g)].map((m) => [m[1], undefined]),
        );
        out = observe(() => api[r.function](v));
        second = observe(() => api[r.function](v, opts));
      }),
      Then('both calls return equivalent results', () => {
        const a = returned(out),
          b = returned(second);
        if (a && typeof a === 'object') equal(a, b as TemporalValue);
        else expect(a).toBe(b);
      }),
    ],
  };
});

registerScenario<ExampleRows['CON-006']>('CON-006', () => {
  let v!: TemporalValue;
  let out!: Observation;
  let kind!: TemporalKind;
  return {
    steps: [
      Given('compatible valid inputs for <function>', (r) => {
        kind = r.function === 'formatDuration' ? 'Duration' : 'PlainDate';
        v = representative(kind) as TemporalValue;
      }),
      When('<function> is called with <options>', (r) => {
        out = observe(() => arrangement(r.function, v, kind, options(r.options))());
      }),
      Then('the call throws an invalid-option error', () => {
        failed(out);
      }),
    ],
  };
});

registerScenario<ExampleRows['CON-007']>('CON-007', () => {
  let v!: TemporalValue;
  let out!: Observation;
  let kind!: TemporalKind;
  return {
    steps: [
      Given('compatible valid inputs for <function>', (r) => {
        kind = r.function === 'formatDuration' ? 'Duration' : 'PlainDate';
        v = representative(kind) as TemporalValue;
      }),
      When('<function> is called with locale "fr"', (r) => {
        out = observe(() =>
          arrangement(r.function, v, kind, {
            locale: 'fr',
            ...(/ToNow/.test(r.function) ? { timeZone: 'UTC' } : {}),
          })(),
        );
      }),
      Then('it throws an unsupported-locale error', () => {
        failed(out);
      }),
    ],
  };
});

registerScenario<ExampleRows['CON-008']>('CON-008', () => {
  let call!: ReturnType<typeof arrangement>;
  let before: unknown;
  let globals: unknown;
  let out!: Observation;
  let afterGlobals: unknown;
  return {
    steps: [
      Given(
        'the representative <kind> input and invocation of <function> defined in type-coverage.feature',
        (r) => {
          call = arrangement(
            r.function,
            representative(r.kind),
            r.kind,
            /ToNow/.test(r.function) ? { timeZone: 'UTC' } : {},
          );
        },
      ),
      Given('snapshots of its input values, arrays, options and interval endpoints', () => {
        before = snapshot(call.inputs);
        call.inputs.forEach(freezeContainers);
      }),
      Given('snapshots of the global Temporal namespace and host zone settings', () => {
        globals = globalSnapshot();
      }),
      When('<function> is called', () => {
        out = observe(() => withNow('2026-10-23T12:34:56.123Z', call));
        afterGlobals = globalSnapshot();
      }),
      Then('every input retains its original public value and array order', () => {
        returned(out);
        expect(snapshot(call.inputs)).toEqual(before);
      }),
      Then('caller-owned options and interval endpoints retain their original values', () => {
        expect(snapshot(call.inputs)).toEqual(before);
      }),
      Then('the global Temporal namespace and host zone settings remain unchanged', () => {
        expect(afterGlobals).toEqual(globals);
      }),
    ],
  };
});

registerScenario<ExampleRows['CON-009']>('CON-009', () => {
  let v!: TemporalValue;
  let out!: Observation;
  return {
    steps: [
      Given('a PlainDate "2026-10-23"', () => {
        v = date('2026-10-23');
      }),
      When('startOfWeek is called with weekStartsOn 1', () => {
        out = observe(() => api.startOfWeek(v, { weekStartsOn: 1 }));
      }),
      Then('the result is PlainDate "2026-10-19"', () => {
        equal(returned(out), date('2026-10-19'));
      }),
      When('startOfWeek is called again with omitted options', () => {
        out = observe(() => api.startOfWeek(v));
      }),
      Then('the result is PlainDate "2026-10-18"', () => {
        equal(returned(out), date('2026-10-18'));
      }),
    ],
  };
});

registerScenario<ExampleRows['CON-010']>('CON-010', () => {
  let v!: TemporalValue;
  let out!: Observation;
  return {
    steps: [
      Given('a PlainDate "2026-10-23"', () => {
        v = date('2026-10-23');
      }),
      When('isWeekend is called with weekendDays [5,6]', () => {
        out = observe(() => api.isWeekend(v, { weekendDays: [5, 6] }));
      }),
      Then('the result is true', () => {
        expect(returned(out)).toBe(true);
      }),
      When('isWeekend is called again with omitted options', () => {
        out = observe(() => api.isWeekend(v));
      }),
      Then('the result is false', () => {
        expect(returned(out)).toBe(false);
      }),
      When('isBusinessDay is called with omitted options', () => {
        out = observe(() => api.isBusinessDay(v));
      }),
      Then('the result is true', () => {
        expect(returned(out)).toBe(true);
      }),
    ],
  };
});
