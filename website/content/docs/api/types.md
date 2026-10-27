---
title: 'Types and options'
---

All types below are exported from `@frantss/temporal-fns`. Import them with `import type`. The exported `Temporal` namespace comes from `temporal-spec` and supplies types only; it does not install a runtime.

## TypeScript setup

With TypeScript 6 or later, add `ESNext.Temporal` to your existing `compilerOptions.lib` entries so the global `Temporal` has declarations. With older TypeScript and the optional polyfill, load `temporal-polyfill/types/global` once alongside `temporal-polyfill/global`.

This setup supplies global types for the examples below. It does not replace the [runtime setup](/docs#install).

## Value types

| Type             | Meaning                                                   | Related APIs                                                               |
| ---------------- | --------------------------------------------------------- | -------------------------------------------------------------------------- |
| `CalendarValue`  | `PlainDate \| PlainDateTime \| ZonedDateTime`             | [addBusinessDays](./addBusinessDays.md), [startOfMonth](./startOfMonth.md) |
| `DateTimeValue`  | `PlainDateTime \| ZonedDateTime`                          | [endOfDay](./endOfDay.md)                                                  |
| `TimeValue`      | `PlainTime \| DateTimeValue`                              | [eachHourOfInterval](./eachHourOfInterval.md)                              |
| `YearMonthValue` | `CalendarValue \| PlainYearMonth`                         | [getWeeksInMonth](./getWeeksInMonth.md)                                    |
| `QuarterValue`   | `YearMonthValue \| PlainMonthDay`                         | [getQuarter](./getQuarter.md)                                              |
| `OrderedValue`   | `YearMonthValue \| PlainTime \| Instant`                  | [min](./min.md), [clamp](./clamp.md)                                       |
| `ParseReference` | `YearMonthValue \| PlainTime \| PlainMonthDay \| Instant` | [parse](./parse.md)                                                        |
| `Formattable`    | Same union as `ParseReference`                            | [format](./format.md)                                                      |
| `TemporalValue`  | `Formattable \| Duration`                                 | [format](./format.md), [formatDuration](./formatDuration.md)               |

These unions describe available information, not permission to mix kinds within one call. A collection or pair must have one concrete kind. Each function's entry lists its supported subset.

Behavior: [supported and rejected kinds](https://github.com/Frantss/temporal-fns/blob/main/test/features/type-coverage.feature), [declaration constraints](https://github.com/Frantss/temporal-fns/blob/main/test/features/declarations.feature).

```ts
import type { CalendarValue, Formattable, TemporalValue } from '@frantss/temporal-fns';

const date: CalendarValue = Temporal.PlainDate.from('2026-10-23');
const month: Formattable = Temporal.PlainYearMonth.from('2026-10');
const duration: TemporalValue = Temporal.Duration.from('PT1H');
date.toString(); // => '2026-10-23'
month.toString(); // => '2026-10'
duration.toString(); // => 'PT1H'
```

## Interval and result types

| Type                                    | Meaning                                                          | Related APIs                                                                           |
| --------------------------------------- | ---------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| `Interval<T extends OrderedValue>`      | `{ start: T; end: T }`; same-kind endpoints in ascending order   | [isWithinInterval](./isWithinInterval.md), [eachDayOfInterval](./eachDayOfInterval.md) |
| `TryResult<T, E extends Error = Error>` | Readonly `[null, T] \| [E, null]`, labeled `error` then `result` | [tryParse](./tryParse.md), [tryParseDuration](./tryParseDuration.md)                   |

Behavior: [interval validity](https://github.com/Frantss/temporal-fns/blob/main/test/features/intervals.feature), [tuple narrowing and readonly declarations](https://github.com/Frantss/temporal-fns/blob/main/test/features/declarations.feature#L79).

```ts
import { isWithinInterval, tryParse } from '@frantss/temporal-fns';
import type { Interval, Temporal as TemporalTypes, TryResult } from '@frantss/temporal-fns';

const interval: Interval<TemporalTypes.PlainDate> = {
  start: Temporal.PlainDate.from('2026-10-01'),
  end: Temporal.PlainDate.from('2026-10-31'),
};
isWithinInterval(Temporal.PlainDate.from('2026-10-23'), interval); // => true
const result: TryResult<TemporalTypes.PlainDate, RangeError> = tryParse(
  '2026-10-23',
  'yyyy-MM-dd',
  interval.start,
);
if (result[0] === null) {
  result[1].toString(); // => '2026-10-23'
}
const failure: TryResult<TemporalTypes.PlainDate, RangeError> = tryParse(
  '2026-02-30',
  'yyyy-MM-dd',
  interval.start,
);
failure[1]; // => null
```

## Week and business-day options

| Type                           | Fields and defaults                                                                       | Related APIs                                                                                   |
| ------------------------------ | ----------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| `Weekday`                      | `0 \| 1 \| 2 \| 3 \| 4 \| 5 \| 6`, Sunday through Saturday                                | [nextDay](./nextDay.md), [previousDay](./previousDay.md)                                       |
| `WeekOptions`                  | `weekStartsOn?: Weekday`, default `0`                                                     | [startOfWeek](./startOfWeek.md), [isSameWeek](./isSameWeek.md)                                 |
| `WeekNumberOptions`            | `WeekOptions` plus `firstWeekContainsDate?: 1 \| 2 \| 3 \| 4 \| 5 \| 6 \| 7`, default `1` | [getWeek](./getWeek.md), [getWeekYear](./getWeekYear.md)                                       |
| `BusinessDayOptions`           | `weekendDays?: readonly Weekday[]`, default `[0, 6]`                                      | [addBusinessDays](./addBusinessDays.md), [isWeekend](./isWeekend.md)                           |
| `BusinessDayDifferenceOptions` | `BusinessDayOptions` plus optional `timeZone`; only applicable to zoned inputs            | [differenceInBusinessDays](./differenceInBusinessDays.md)                                      |
| `StepOptions`                  | `step?: number`, default `1`; a positive safe integer                                     | [eachDayOfInterval](./eachDayOfInterval.md), [eachMinuteOfInterval](./eachMinuteOfInterval.md) |

Behavior: [week rules](https://github.com/Frantss/temporal-fns/blob/main/test/features/calendar-queries.feature), [weekend configuration](https://github.com/Frantss/temporal-fns/blob/main/test/features/business-days.feature), [step validation](https://github.com/Frantss/temporal-fns/blob/main/test/features/sequences.feature#L167).

```ts
import { addBusinessDays, getWeek, getWeekYear } from '@frantss/temporal-fns';
import type { BusinessDayOptions, WeekNumberOptions } from '@frantss/temporal-fns';

const isoWeek: WeekNumberOptions = { weekStartsOn: 1, firstWeekContainsDate: 4 };
const date = Temporal.PlainDate.from('2021-01-01');
getWeek(date, isoWeek); // => 53
getWeekYear(date, isoWeek); // => 2020
const fridaySaturday: BusinessDayOptions = { weekendDays: [5, 6] };
addBusinessDays(Temporal.PlainDate.from('2026-10-22'), 1, fridaySaturday).toString(); // => '2026-10-25'
```

## Zone, formatting, and parsing options

| Type                  | Fields and defaults                                                                                          | Related APIs                                                            |
| --------------------- | ------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------- |
| `ZoneOptions`         | `timeZone?: string`, subject to the function's input-kind rules                                              | [isSameDay](./isSameDay.md)                                             |
| `RequiredZoneOptions` | `timeZone: string`                                                                                           | [format](./format.md) with `Instant`                                    |
| `PlainOptions`        | `timeZone?: never`; excludes a zone override                                                                 | [parse](./parse.md) with plain references                               |
| `FormatOptions`       | `ZoneOptions` plus `locale?: string`, default `en-US`                                                        | [format](./format.md)                                                   |
| `ParseOptions`        | `ZoneOptions` plus `disambiguation?: 'compatible' \| 'earlier' \| 'later' \| 'reject'`, default `compatible` | [parse](./parse.md), [tryParse](./tryParse.md), [isMatch](./isMatch.md) |

The exported option interfaces are building blocks. Function overloads require or exclude `timeZone` according to the input kind; an option interface alone does not override those constraints.

Behavior: [viewing zones](https://github.com/Frantss/temporal-fns/blob/main/test/features/formatting.feature#L99), [parsing zones and disambiguation](https://github.com/Frantss/temporal-fns/blob/main/test/features/parsing.feature#L169), [required context in TypeScript](https://github.com/Frantss/temporal-fns/blob/main/test/features/declarations.feature#L27).

```ts
import { format, parse } from '@frantss/temporal-fns';
import type { FormatOptions, ParseOptions, RequiredZoneOptions } from '@frantss/temporal-fns';

const utc: FormatOptions & RequiredZoneOptions = { timeZone: 'UTC', locale: 'en-US' };
format(Temporal.Instant.from('2026-10-24T01:00Z'), 'HH:mm', utc); // => '01:00'
const policy: Omit<ParseOptions, 'timeZone'> = { disambiguation: 'later' };
const reference = Temporal.ZonedDateTime.from('2026-01-01T12:00[America/New_York]');
parse('2026-11-01 01:30', 'yyyy-MM-dd HH:mm', reference, policy).offset; // => '-05:00'
```

## Distance and duration options

| Type                    | Fields and defaults                                                                                                                        | Related APIs                                                                                                   |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------- |
| `DistanceOptions`       | `ZoneOptions` plus `locale?: string` (`en-US` only), `addSuffix?: boolean` (`false`), `includeSeconds?: boolean` (`false`)                 | [formatDistance](./formatDistance.md), [formatDistanceToNow](./formatDistanceToNow.md)                         |
| `StrictDistanceOptions` | `ZoneOptions` plus `locale?: string` (`en-US` only), `addSuffix?: boolean` (`false`), optional `unit`, `roundingMethod` (default `round`)  | [formatDistanceStrict](./formatDistanceStrict.md), [formatDistanceToNowStrict](./formatDistanceToNowStrict.md) |
| `DurationUnit`          | Plural component names: `years`, `months`, `weeks`, `days`, `hours`, `minutes`, `seconds`, `milliseconds`, `microseconds`, `nanoseconds`   | [formatDuration](./formatDuration.md)                                                                          |
| `DurationFormatOptions` | `format?: readonly DurationUnit[]` (all units), `zero?: boolean` (`false`), `delimiter?: string` (space), `locale?: string` (`en-US` only) | [formatDuration](./formatDuration.md)                                                                          |

Strict distance units are singular `second`, `minute`, `hour`, `day`, `month`, or `year`. Rounding methods are `floor`, `ceil`, `round`, or `trunc`. Duration formatting selects components without converting them; strict distance computes a total in one unit.

Behavior: [relative options](https://github.com/Frantss/temporal-fns/blob/main/test/features/relative-descriptions.feature), [duration selection and validation](https://github.com/Frantss/temporal-fns/blob/main/test/features/durations.feature).

```ts
import { formatDistanceStrict, formatDuration } from '@frantss/temporal-fns';
import type { DurationFormatOptions, StrictDistanceOptions } from '@frantss/temporal-fns';

const strict: Omit<StrictDistanceOptions, 'timeZone'> = {
  unit: 'minute',
  roundingMethod: 'floor',
  addSuffix: true,
};
const base = Temporal.PlainDateTime.from('2026-01-01T00:00');
formatDistanceStrict(base.add({ seconds: 91 }), base, strict); // => 'in 1 minute'
const selected: DurationFormatOptions = { format: ['hours', 'minutes'], zero: true };
formatDuration(Temporal.Duration.from('PT1H'), selected); // => '1 hour 0 minutes'
```

## Temporal namespace

Use the exported `Temporal` namespace in type annotations. Create runtime values using the global `Temporal` provided by your runtime or the [installation setup](/docs#install).

Related: [value types](#value-types), [interval and result types](#interval-and-result-types).
Behavior: [imports do not install Temporal](https://github.com/Frantss/temporal-fns/blob/main/test/features/contracts.feature#L5).

```ts
import { format } from '@frantss/temporal-fns';
import type { Temporal as TemporalTypes } from '@frantss/temporal-fns';

const date: TemporalTypes.PlainDate = Temporal.PlainDate.from('2026-10-23');
const time: TemporalTypes.PlainTime = Temporal.PlainTime.from('12:30');
format(date, 'yyyy-MM-dd'); // => '2026-10-23'
format(time, 'HH:mm'); // => '12:30'
```
