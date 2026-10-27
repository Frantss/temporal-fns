import type { Temporal } from 'temporal-spec';
import type {
  Interval,
  OrderedValue,
  PlainOptions,
  RequiredZoneOptions,
  TryResult,
  ZoneOptions,
} from './types.js';

type Dates = [Temporal.PlainDate, Temporal.PlainDateTime, Temporal.ZonedDateTime];
type Ordered = [...Dates, Temporal.PlainTime, Temporal.PlainYearMonth, Temporal.Instant];
type References = [
  ...Dates,
  Temporal.PlainTime,
  Temporal.PlainYearMonth,
  Temporal.PlainMonthDay,
  Temporal.Instant,
];
type Value = OrderedValue | Temporal.PlainMonthDay;
type Results<T> = {
  value: T;
  optional: T | undefined;
  array: T[];
  try: TryResult<T, RangeError>;
};
type Result<T, R> = R extends keyof Results<T> ? Results<T>[R] : R;
type NeedsZone<T, M> = M extends 'now'
  ? T extends Temporal.ZonedDateTime
    ? false
    : true
  : T extends Temporal.Instant
    ? true
    : false;
type Context<T, O, M> =
  NeedsZone<T, M> extends true
    ? [context: O & RequiredZoneOptions]
    : [
        context?: O &
          (M extends 'parse'
            ? PlainOptions
            : T extends Temporal.ZonedDateTime
              ? ZoneOptions
              : PlainOptions),
      ];
type Arguments<T extends Value, O> = {
  parse: [text: string, pattern: string, reference: T, ...Context<T, O, 'parse'>];
  pair: [value: T, base: T, ...Context<T, O, 'pair'>];
  now: [value: T, ...Context<T, O, 'now'>];
  list: [values: readonly T[]];
  closest: [target: T, values: readonly T[]];
  interval: [value: T, interval: Interval<Extract<T, OrderedValue>>];
  overlap: [
    first: Interval<Extract<T, OrderedValue>>,
    second: Interval<Extract<T, OrderedValue>>,
    context?: O,
  ];
  sequence: [interval: Interval<Extract<T, OrderedValue>>, context?: O];
};
type Overloads<
  Types extends Value[],
  M extends keyof Arguments<Value, unknown>,
  O,
  R,
> = Types extends [infer T extends Value, ...infer Rest extends Value[]]
  ? ((...args: Arguments<T, O>[M]) => Result<T, R>) & Overloads<Rest, M, O, R>
  : unknown;

export type Pair<O, R, Months extends boolean = false, Instants extends boolean = true> = Overloads<
  [
    ...Dates,
    ...(Instants extends true ? [Temporal.Instant] : []),
    ...(Months extends true ? [Temporal.PlainYearMonth] : []),
  ],
  'pair',
  O,
  R
>;
export type Parser<O, R> = Overloads<References, 'parse', O, R>;
export type Selection<M extends 'list' | 'closest', R> = Overloads<Ordered, M, never, R>;
export type IntervalCall<M extends 'interval' | 'overlap', R, O = never> = Overloads<
  Ordered,
  M,
  O,
  R
>;
export type Sequence<O, Months extends boolean = false, Clock extends boolean = false> = Overloads<
  Clock extends true
    ? [Temporal.PlainTime, Temporal.PlainDateTime, Temporal.ZonedDateTime]
    : [...Dates, ...(Months extends true ? [Temporal.PlainYearMonth] : [])],
  'sequence',
  O,
  'array'
>;
export type ToNow<O> = Overloads<[...Dates, Temporal.Instant], 'now', O, string>;
