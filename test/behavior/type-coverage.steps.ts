import { expect } from 'vitest';
import { arrangeFromTable, assertShape } from './assertions.js';
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
import { arrangement, value, withNow } from './support.js';

registerScenario<ExampleRows['TYPE-001']>('TYPE-001', () => {
  let catalog!: Record<string, { value: string; pattern: string; text: string }>;
  let arrangements!: Record<string, string>;
  let shapes!: Record<string, string>;
  let zone!: string;
  let omitOptions!: boolean;
  let literalPattern!: boolean;
  let v: unknown;
  let call!: ReturnType<typeof arrangement>;
  let out!: Observation;
  return {
    steps: [
      Given('these representative values in a host whose local zone is UTC:', (_r, table) => {
        catalog = Object.fromEntries(
          table.hashes().map((row) => [
            row.kind!,
            {
              value: row.value!,
              pattern: row['compatible pattern']!,
              text: row['matching text']!,
            },
          ]),
        );
      }),
      Given('calls use the following public argument arrangements:', (_r, table) => {
        arrangements = Object.fromEntries(
          table.hashes().map((row) => [row.operation!, row.arrangement!]),
        );
      }),
      Given('Instant calendar calls and plain ToNow calls receive timeZone "UTC"', () => {
        zone = 'UTC';
      }),
      Given('all other options are omitted', () => {
        omitOptions = true;
      }),
      Given(
        'unsupported reference/value kinds use the valid literal-only pattern from the catalog',
        () => {
          literalPattern = true;
        },
      ),
      Given(
        'any failure is attributable to that unsupported kind rather than an invalid pattern',
        () => {
          expect(catalog.Duration?.pattern).toBe("'literal'");
          expect(catalog.Date?.pattern).toBe("'literal'");
          expect(catalog.string?.pattern).toBe("'literal'");
        },
      ),
      Given('documented return shapes mean:', (_r, table) => {
        shapes = Object.fromEntries(
          table.hashes().map((row) => [row.operation!, row['successful return shape']!]),
        );
      }),
      Given('the representative <kind> value and the public arrangement for <function>', (r) => {
        const fixture = catalog[r.kind];
        if (!fixture) throw new Error(`Missing catalog kind ${r.kind}`);
        expect(zone).toBe('UTC');
        expect(omitOptions).toBe(true);
        expect(literalPattern).toBe(true);
        expect(Object.keys(arrangements)).toHaveLength(14);
        v =
          r.kind === 'Date'
            ? new Date(fixture.value.replace('host-local ', ''))
            : r.kind === 'string'
              ? fixture.value
              : value(r.kind, fixture.value);
        expect(Object.keys(shapes)).toHaveLength(14);
        call = arrangeFromTable(r.function, v, r.kind, fixture, arrangements, zone);
      }),
      When('<function> is called', () => {
        out = observe(() => withNow('2026-10-23T12:34:56.123Z', call));
      }),
      Then('it returns successfully', () => {
        returned(out);
      }),
      Then('its result has the documented return shape for <function> and <kind>', (r) => {
        assertShape(r.function, r.kind, v, returned(out), shapes);
      }),
    ],
  };
});

registerScenario<ExampleRows['TYPE-002']>('TYPE-002', () => {
  let catalog!: Record<string, { value: string; pattern: string; text: string }>;
  let arrangements!: Record<string, string>;
  let shapes!: Record<string, string>;
  let zone!: string;
  let omitOptions!: boolean;
  let literalPattern!: boolean;
  let v: unknown;
  let call!: ReturnType<typeof arrangement>;
  let out!: Observation;
  return {
    steps: [
      Given('these representative values in a host whose local zone is UTC:', (_r, table) => {
        catalog = Object.fromEntries(
          table.hashes().map((row) => [
            row.kind!,
            {
              value: row.value!,
              pattern: row['compatible pattern']!,
              text: row['matching text']!,
            },
          ]),
        );
      }),
      Given('calls use the following public argument arrangements:', (_r, table) => {
        arrangements = Object.fromEntries(
          table.hashes().map((row) => [row.operation!, row.arrangement!]),
        );
      }),
      Given('Instant calendar calls and plain ToNow calls receive timeZone "UTC"', () => {
        zone = 'UTC';
      }),
      Given('all other options are omitted', () => {
        omitOptions = true;
      }),
      Given(
        'unsupported reference/value kinds use the valid literal-only pattern from the catalog',
        () => {
          literalPattern = true;
        },
      ),
      Given(
        'any failure is attributable to that unsupported kind rather than an invalid pattern',
        () => {
          expect(catalog.Duration?.pattern).toBe("'literal'");
          expect(catalog.Date?.pattern).toBe("'literal'");
          expect(catalog.string?.pattern).toBe("'literal'");
        },
      ),
      Given('documented return shapes mean:', (_r, table) => {
        shapes = Object.fromEntries(
          table.hashes().map((row) => [row.operation!, row['successful return shape']!]),
        );
      }),
      Given('the representative <kind> value and the public arrangement for <function>', (r) => {
        const fixture = catalog[r.kind];
        if (!fixture) throw new Error(`Missing catalog kind ${r.kind}`);
        expect(zone).toBe('UTC');
        expect(omitOptions).toBe(true);
        expect(literalPattern).toBe(true);
        expect(Object.keys(arrangements)).toHaveLength(14);
        v =
          r.kind === 'Date'
            ? new Date(fixture.value.replace('host-local ', ''))
            : r.kind === 'string'
              ? fixture.value
              : value(r.kind, fixture.value);
        expect(Object.keys(shapes)).toHaveLength(14);
        call = arrangeFromTable(r.function, v, r.kind, fixture, arrangements, zone);
      }),
      When('<function> is called with that unsupported value', () => {
        out = observe(() => withNow('2026-10-23T12:34:56.123Z', call));
      }),
      Then('the call throws', () => {
        failed(out);
      }),
      Then('it does not return a converted value, false, or an input-error tuple', () => {
        expect(out.value).toBeUndefined();
      }),
    ],
  };
});
