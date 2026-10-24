# Temporal utilities

The utilities from our [API proposal](docs/api-proposal.md), implemented with Temporal values and standard date-fns argument order. All 56 functions are available: 54 from the main entry point and two widget adapters from `/calendar`.

## Setup

This package uses the host's global `Temporal`. It does not install a polyfill or change global settings. For a host without Temporal, load a polyfill before calling any utility:

```ts
import 'temporal-polyfill/global';
import { addBusinessDays, format, tryParse } from '@frantss/temporal-fns';

const date = Temporal.PlainDate.from('2026-10-22');
const nextWorkingDate = addBusinessDays(date, 1, { weekendDays: [5, 6] });

format(nextWorkingDate, 'EEEE, MMMM d, yyyy');
// Sunday, October 25, 2026

const [error, parsed] = tryParse('02/29/2024', 'MM/dd/yyyy', date);
if (error === null) {
  console.log(parsed.toString()); // 2024-02-29
}
```

The package is currently private and named `@frantss/temporal-fns` to avoid the existing public `temporal-fns` package. It builds as ESM with TypeScript declarations. `temporal-spec` provides types only; the emitted JavaScript has no third-party runtime imports. An application that needs the polyfill must install it separately.

## API

| Family                        | Functions                                                                                                                               |
| ----------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| Patterns                      | `format`, `parse`, `tryParse`, `isMatch`                                                                                                |
| Durations                     | `formatDuration`, `parseDuration`, `tryParseDuration`                                                                                   |
| Starts                        | `startOfWeek`, `startOfISOWeek`, `startOfMonth`, `startOfQuarter`, `startOfYear`                                                        |
| Ends                          | `endOfDay`, `endOfWeek`, `endOfISOWeek`, `endOfMonth`, `endOfQuarter`, `endOfYear`                                                      |
| Comparisons                   | `isSameDay`, `isSameWeek`, `isSameISOWeek`, `isSameMonth`, `isSameQuarter`, `isSameYear`                                                |
| Relative descriptions         | `formatDistance`, `formatDistanceStrict`, `formatDistanceToNow`, `formatDistanceToNowStrict`, `formatRelative`                          |
| Selection                     | `min`, `max`, `closestTo`, `closestIndexTo`                                                                                             |
| Intervals                     | `isWithinInterval`, `areIntervalsOverlapping`, `clamp`                                                                                  |
| Sequences                     | `eachDayOfInterval`, `eachWeekOfInterval`, `eachMonthOfInterval`, `eachWeekendOfInterval`, `eachHourOfInterval`, `eachMinuteOfInterval` |
| Business days                 | `addBusinessDays`, `subBusinessDays`, `differenceInBusinessDays`, `isWeekend`, `isBusinessDay`                                          |
| Calendar queries              | `nextDay`, `previousDay`, `getQuarter`, `getWeek`, `getWeekYear`, `getWeekOfMonth`, `getWeeksInMonth`                                   |
| Widget adapters (`/calendar`) | `toCalendarDate`, `fromCalendarDate`                                                                                                    |

See the [full API specification](docs/api-proposal.md) for supported types, options, tokens, parsing defaults, relative thresholds, and interval rules. The exported declarations enforce matching kinds and required zones.

## Types and time zones

All eight main Temporal types have utilities appropriate to their information. For example, `PlainYearMonth` supports month sequences and quarter boundaries; `PlainMonthDay` supports month/day patterns; `Duration` has dedicated text utilities.

```ts
import { eachMonthOfInterval, format, isSameDay } from '@frantss/temporal-fns';

eachMonthOfInterval({
  start: Temporal.PlainYearMonth.from('2026-10'),
  end: Temporal.PlainYearMonth.from('2026-12'),
}); // October, November, December as PlainYearMonth values

const instant = Temporal.Instant.from('2026-10-24T01:00Z');
format(instant, 'yyyy-MM-dd HH:mm', { timeZone: 'America/Montevideo' });
// 2026-10-23 22:00

isSameDay(instant, instant.add({ hours: 1 }), { timeZone: 'America/Montevideo' });
// true
```

Plain values retain their fields and reject zone options. Calendar operations on instants require an explicit zone. Zoned values use their own zone; comparisons across different zones require a common zone. `ToNow` functions also require a zone for plain values. Collections order zoned values and instants by exact time.

Weeks start on Sunday by default, and weekdays use `0` for Sunday through `6` for Saturday. Weekend-aware functions default to `[0, 6]`. These settings are per call.

## Errors and precision

`tryParse` and `tryParseDuration` return `[null, result]` or `[RangeError, null]`. `isMatch` returns `false` for invalid text. Invalid patterns, options, and incompatible inputs still throw.

Temporal values remain immutable. Date-time end boundaries retain nanosecond precision, and zoned boundaries follow actual day lengths. Intervals require ordered, same-kind endpoints. Empty collections return `undefined`; ties select the first input.

The optional widget adapters copy displayed fields to/from a host-local `Date`:

```ts
import { toCalendarDate, fromCalendarDate } from '@frantss/temporal-fns/calendar';

const widgetDate = toCalendarDate(Temporal.PlainDate.from('2026-10-23'));
const selectedDate = fromCalendarDate(widgetDate).toPlainDate();
```

These adapters copy calendar fields rather than convert timestamps. They reject sub-millisecond precision and local times the host zone cannot represent.

## Initial scope

- Calendar operations accept `iso8601` only.
- Text month/weekday/day-period formatting uses the host's `Intl` locale data. Relative descriptions and duration labels accept `en-US` only.
- Parsing supports numeric date/time tokens, `AM`/`PM`, offsets, and quoted literals. Textual month/weekday parsing and two-digit year parsing are deferred.
- `yyyy` and `yy` format years of era. Era parsing is deferred; `yyyy` parses positive Common Era years. Native `.toString()` / `.from()` retain signed ISO years.
- Holiday calendars are deferred. Business days are defined by configurable weekends.
- Calendar-relative month/year totals support the full range for plain values, UTC, and explicit fixed-offset zones. Other named zones retain native Temporal range limits and errors when a required calendar boundary is unavailable.
- Names and argument order follow date-fns; the [documented behavior](docs/api-proposal.md) defines compatibility.

Arithmetic, field access, ISO parsing, rounding, and ordinary zone conversion use native Temporal methods.

## Development

```sh
npm ci
npm run check
```

`check` verifies formatting, type declarations and invalid-call type tests, builds the package, and runs runtime tests with `temporal-polyfill/global`. On a host with native Temporal, the polyfill leaves the native implementation in place. To run the built tests directly against native Temporal:

```sh
npm run build
node --test test/*.test.mjs
```

The suite covers all exports and all eight types, including DST gaps/repeated hours, skipped midnight, range boundaries, custom weekends, parsing failures, tuple narrowing, and host-local widget dates.
