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
  dateTimeFromDate,
  dt,
  equal,
  kindOf,
  value,
  withZone,
  zoned,
} from './support.js';

registerScenario<ExampleRows['ADP-001']>('ADP-001', () => {
  let v!: TemporalValue;
  let out!: Observation;
  let host!: string;
  return {
    steps: [
      Given('the host local zone is "<host>"', (r) => {
        host = r.host;
      }),
      Given('a <kind> value "<value>"', (r) => {
        v = value(r.kind, r.value);
      }),
      When('toCalendarDate is called', () => {
        out = observe(() => withZone(host, () => api.toCalendarDate(v)));
      }),
      Then('the result is a Date whose host-local fields equal "<local>"', (r) => {
        const d = returned(out) as Date;
        expect(d).toBeInstanceOf(Date);
        withZone(host, () => equal(dateTimeFromDate(d), dt(r.local)));
      }),
    ],
  };
});

registerScenario<ExampleRows['ADP-002']>('ADP-002', () => {
  let v!: TemporalValue;
  let out!: Observation;
  let host!: string;
  return {
    steps: [
      Given('the host local zone is "America/New_York"', () => {
        host = 'America/New_York';
      }),
      Given('a ZonedDateTime "2026-10-23T12:00[Asia/Tokyo]"', () => {
        v = zoned('2026-10-23T12:00[Asia/Tokyo]');
      }),
      When('toCalendarDate is called', () => {
        out = observe(() => withZone(host, () => api.toCalendarDate(v)));
      }),
      Then("the Date's host-local clock reads 12:00 on October 23, 2026", () => {
        withZone(host, () =>
          equal(dateTimeFromDate(returned(out) as Date), dt('2026-10-23T12:00')),
        );
      }),
      Then('its epoch milliseconds differ from those of the input', () => {
        expect((returned(out) as Date).getTime()).not.toBe(
          asTemporal(v, 'ZonedDateTime').epochMilliseconds,
        );
      }),
    ],
  };
});

registerScenario<ExampleRows['ADP-003']>('ADP-003', () => {
  let v!: TemporalValue;
  let out!: Observation;
  let host!: string;
  let widget!: Date;
  return {
    steps: [
      Given('the host local zone is "UTC"', () => {
        host = 'UTC';
      }),
      Given('a PlainDateTime "<value>"', (r) => {
        v = dt(r.value);
      }),
      When('toCalendarDate is called', () => {
        out = observe(() => withZone(host, () => api.toCalendarDate(v)));
      }),
      Then("the Date's full year is <year>", (r) => {
        widget = returned(out) as Date;
        withZone(host, () => expect(widget.getFullYear()).toBe(Number(r.year)));
      }),
      When('fromCalendarDate is called with that Date', () => {
        out = observe(() => withZone(host, () => api.fromCalendarDate(widget)));
      }),
      Then('the result equals the original PlainDateTime', () => {
        equal(returned(out), v);
      }),
    ],
  };
});

registerScenario<ExampleRows['ADP-004']>('ADP-004', () => {
  let host!: string;
  let input!: Date;
  let out!: Observation;
  return {
    steps: [
      Given('the host local zone is "America/New_York"', () => {
        host = 'America/New_York';
      }),
      Given('a Date with instant "2026-10-23T16:30:15.123Z"', () => {
        input = new Date('2026-10-23T16:30:15.123Z');
      }),
      When('fromCalendarDate is called', () => {
        out = observe(() => withZone(host, () => api.fromCalendarDate(input)));
      }),
      Then('the result is PlainDateTime "2026-10-23T12:30:15.123"', () => {
        equal(returned(out), dt('2026-10-23T12:30:15.123'));
      }),
      Then('it carries no time zone', () => {
        expect(kindOf(returned(out))).toBe('PlainDateTime');
        expect(returned(out)).not.toHaveProperty('timeZoneId');
      }),
      Then('its microsecond and nanosecond fields are zero', () => {
        const v = asTemporal(returned(out), 'PlainDateTime');
        expect(v.microsecond).toBe(0);
        expect(v.nanosecond).toBe(0);
      }),
    ],
  };
});

registerScenario<ExampleRows['ADP-005']>('ADP-005', () => {
  let v!: TemporalValue;
  let out!: Observation;
  return {
    steps: [
      Given('a PlainDateTime "<value>"', (r) => {
        v = dt(r.value);
      }),
      When('toCalendarDate is called', () => {
        out = observe(() => api.toCalendarDate(v));
      }),
      Then('it throws a precision-loss error', () => {
        failed(out);
      }),
    ],
  };
});

registerScenario<ExampleRows['ADP-006']>('ADP-006', () => {
  let v!: TemporalValue;
  let out!: Observation;
  let host!: string;
  return {
    steps: [
      Given('the host local zone is "America/New_York"', () => {
        host = 'America/New_York';
      }),
      Given('a PlainDateTime "2026-03-08T02:30"', () => {
        v = dt('2026-03-08T02:30');
      }),
      When('toCalendarDate is called', () => {
        out = observe(() => withZone(host, () => api.toCalendarDate(v)));
      }),
      Then('it throws an unrepresentable-host-time error', () => {
        failed(out);
      }),
    ],
  };
});

registerScenario<ExampleRows['ADP-007']>('ADP-007', () => {
  let v!: TemporalValue;
  let out!: Observation;
  let host!: string;
  return {
    steps: [
      Given('the host local zone is "America/New_York"', () => {
        host = 'America/New_York';
      }),
      Given('a PlainDateTime "2026-11-01T01:30"', () => {
        v = dt('2026-11-01T01:30');
      }),
      When('toCalendarDate is called and its Date is passed to fromCalendarDate', () => {
        out = observe(() => withZone(host, () => api.fromCalendarDate(api.toCalendarDate(v))));
      }),
      Then('the result is PlainDateTime "2026-11-01T01:30"', () => {
        equal(returned(out), dt('2026-11-01T01:30'));
      }),
      Then('the contract does not choose an original instant for that zone-free input', () => {
        expect(returned(out)).not.toHaveProperty('epochNanoseconds');
        expect(returned(out)).not.toHaveProperty('timeZoneId');
      }),
    ],
  };
});

registerScenario<ExampleRows['ADP-008']>('ADP-008', () => {
  let v!: TemporalValue;
  let out!: Observation;
  let host!: string;
  return {
    steps: [
      Given('the host local zone is "Pacific/Apia"', () => {
        host = 'Pacific/Apia';
      }),
      Given('the host data skips December 30, 2011', () => {
        expect(zoned('2011-12-29T12:00[Pacific/Apia]').add({ days: 1 }).day).toBe(31);
      }),
      Given('a PlainDate "2011-12-30"', () => {
        v = date('2011-12-30');
      }),
      When('toCalendarDate is called', () => {
        out = observe(() => withZone(host, () => api.toCalendarDate(v)));
      }),
      Then('it throws an unrepresentable-host-time error', () => {
        failed(out);
      }),
    ],
  };
});

registerScenario<ExampleRows['ADP-009']>('ADP-009', () => {
  let input: unknown;
  let out!: Observation;
  return {
    steps: [
      Given('<input>', (r) => {
        input = r.input.startsWith('a Date')
          ? new Date(NaN)
          : r.input.startsWith('an ordinary')
            ? {}
            : r.input.startsWith('a string')
              ? '2026-10-23'
              : null;
      }),
      When('fromCalendarDate is called', () => {
        out = observe(() => api.fromCalendarDate(input));
      }),
      Then('it throws an invalid-input error', () => {
        failed(out);
      }),
    ],
  };
});

registerScenario<ExampleRows['ADP-010']>('ADP-010', () => {
  let host!: string;
  let input!: Date;
  let out!: Observation;
  return {
    steps: [
      Given('the host local zone is "UTC"', () => {
        host = 'UTC';
      }),
      Given('a Date whose host-local fields are "2026-10-23T14:30:15.123"', () => {
        input = withZone(host, () => new Date(2026, 9, 23, 14, 30, 15, 123));
      }),
      When('fromCalendarDate is called', () => {
        out = observe(() => withZone(host, () => api.fromCalendarDate(input)));
      }),
      Then('it returns PlainDateTime "2026-10-23T14:30:15.123"', () => {
        equal(returned(out), dt('2026-10-23T14:30:15.123'));
      }),
      Then(
        'the caller can select PlainDate "2026-10-23" through the returned value\'s native conversion',
        () => {
          equal(asTemporal(returned(out), 'PlainDateTime').toPlainDate(), date('2026-10-23'));
        },
      ),
    ],
  };
});

registerScenario<ExampleRows['ADP-011']>('ADP-011', () => {
  let v!: TemporalValue;
  let out!: Observation;
  let host!: string;
  return {
    steps: [
      Given('the host local zone is "UTC"', () => {
        host = 'UTC';
      }),
      Given('a <kind> "<value>"', (r) => {
        v = value(r.kind, r.value);
      }),
      When('toCalendarDate is called', () => {
        out = observe(() => withZone(host, () => api.toCalendarDate(v)));
      }),
      Then('it throws an unrepresentable-host-time error', () => {
        failed(out);
      }),
    ],
  };
});
