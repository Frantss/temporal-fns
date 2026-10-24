# Temporal utility API

Status: implemented initial API. All 56 functions are exported with TypeScript declarations.

The library provides utilities that Temporal does not expose directly, using standard date-fns names, data-first arguments, and a final options object. Ordinary arithmetic, field access, ISO parsing, rounding, and time-zone conversion remain Temporal operations.

All eight main Temporal types are supported: `Instant`, `ZonedDateTime`, `PlainDate`, `PlainTime`, `PlainDateTime`, `PlainYearMonth`, `PlainMonthDay`, and `Duration`. Support is operation-specific: each function accepts only types that carry the information it needs. `Temporal.Now` remains the native namespace for current-time queries.

## Conventions

- Functions accept Temporal objects. Strings are accepted by parsers; legacy `Date` values are accepted by the widget adapters only.
- Functions do not mutate their arguments or change global settings.
- Binary functions and collections require one Temporal kind throughout. A `PlainDate` and a `ZonedDateTime` are not interchangeable.
- Partial values retain their precision and are never silently promoted to a more complete type. Parsing defaults are defined relative to the caller's explicit reference. Durations remain amounts of time and are not interpreted as dates or clock times.
- Calendar operations initially support `iso8601`. Other calendar IDs produce a `RangeError`. This is an initial library limit; Temporal itself supports other calendars.
- Options use `timeZone`, `locale`, `weekStartsOn`, and `firstWeekContainsDate` consistently. `locale` is a BCP 47 language tag, rather than a date-fns locale object. The default is `en-US`.
- Weekdays use the date-fns convention: `0` is Sunday and `6` is Saturday. `weekStartsOn` defaults to `0`; `firstWeekContainsDate` defaults to `1`. ISO-week functions always use Monday and January 4.
- Weekend-aware functions share `weekendDays`, using the same weekday numbering. The default is `[0, 6]` (Sunday and Saturday); week starts and weekend days are independent settings.
- Unsupported patterns, invalid options, incompatible inputs, and invalid intervals throw. There is no invalid Temporal value.
- Defaults apply to omitted or `undefined` options. `null` and sparse weekday/unit lists are invalid.
- Functions that return input errors use the `try` prefix and an error-first result tuple: `[null, result]` on success or `[error, null]` on failure.

The signatures below use these shorthand types:

```ts
type CalendarValue = Temporal.PlainDate | Temporal.PlainDateTime | Temporal.ZonedDateTime;

type DateTimeValue = Temporal.PlainDateTime | Temporal.ZonedDateTime;
type TimeValue = Temporal.PlainTime | DateTimeValue;
type YearMonthValue = CalendarValue | Temporal.PlainYearMonth;
type QuarterValue = YearMonthValue | Temporal.PlainMonthDay;
type OrderedValue = YearMonthValue | Temporal.PlainTime | Temporal.Instant;
type ParseReference =
  YearMonthValue | Temporal.PlainTime | Temporal.PlainMonthDay | Temporal.Instant;
type Formattable = ParseReference;
type TemporalValue = Formattable | Temporal.Duration;
type Weekday = 0 | 1 | 2 | 3 | 4 | 5 | 6;

type TryResult<T, E extends Error = Error> =
  readonly [error: null, result: T] | readonly [error: E, result: null];

interface WeekOptions {
  weekStartsOn?: Weekday;
}

interface WeekNumberOptions extends WeekOptions {
  firstWeekContainsDate?: 1 | 2 | 3 | 4 | 5 | 6 | 7;
}

interface BusinessDayOptions {
  weekendDays?: readonly Weekday[];
}

interface BusinessDayDifferenceOptions extends BusinessDayOptions {
  timeZone?: string;
}

interface Interval<T extends OrderedValue> {
  start: T;
  end: T;
}
```

Generic signatures describe return relationships. The declarations use concrete overloads to enforce homogeneous inputs, rather than allow TypeScript to infer a union for mixed kinds.

## Type coverage

| Temporal type    | Supported utility families                                                                                                                                                     |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `Instant`        | Pattern formatting/parsing with explicit zone context, calendar comparisons with a zone, relative descriptions, collections, and interval operations.                          |
| `ZonedDateTime`  | Calendar/time formatting and parsing, calendar boundaries and comparisons, relative descriptions, collections, intervals, sequences, business days, and calendar queries.      |
| `PlainDate`      | Date formatting/parsing, calendar boundaries and comparisons, relative descriptions, collections, date intervals/sequences, business days, and calendar queries.               |
| `PlainTime`      | Time formatting/parsing, `endOfDay`, collections, time interval membership/overlap/clamping, and hour/minute sequences.                                                        |
| `PlainDateTime`  | Date/time formatting and parsing, calendar boundaries and comparisons, relative descriptions, collections, date/time intervals/sequences, business days, and calendar queries. |
| `PlainYearMonth` | Year/month formatting/parsing, month/quarter/year comparisons, quarter/year boundaries, collections, month intervals/sequences, `getQuarter`, and `getWeeksInMonth`.           |
| `PlainMonthDay`  | Month/day formatting/parsing and `getQuarter`. A specific year must be supplied before using dated operations.                                                                 |
| `Duration`       | `formatDuration`, `parseDuration`, and `tryParseDuration`. Arithmetic, comparison with `relativeTo`, totals, and rounding remain native Temporal operations.                   |

`PlainMonthDay` has no implicit chronological order: an annual recurrence needs a year or another explicit anchor. `Duration` is not an interval endpoint or a calendar value; ordering calendar durations may require `relativeTo`, so it is excluded from the generic collection and interval functions.

## PlainYearMonth support

`CalendarValue` continues to mean a value with a complete calendar date. `YearMonthValue` additionally includes `PlainYearMonth` for operations that need only a year and month.

| Operations accepting `PlainYearMonth`                        | Behavior                                                                            |
| ------------------------------------------------------------ | ----------------------------------------------------------------------------------- |
| `format`, `parse`, `tryParse`, `isMatch`                     | Accept year/month patterns and preserve the month-only type.                        |
| `isSameMonth`, `isSameQuarter`, `isSameYear`                 | Compare two month-only values without supplying a day or zone.                      |
| `startOfQuarter`, `endOfQuarter`, `startOfYear`, `endOfYear` | Return the first or last month in the period as `PlainYearMonth`.                   |
| `min`, `max`, `closestTo`, `closestIndexTo`                  | Order by year/month and measure distance in whole calendar months.                  |
| `isWithinInterval`, `areIntervalsOverlapping`, `clamp`       | Operate on same-kind month endpoints using the existing endpoint rules.             |
| `eachMonthOfInterval`                                        | Return month-only values, including both endpoint months, with the configured step. |
| `getQuarter`, `getWeeksInMonth`                              | Calculate from the represented year/month.                                          |

Day/week comparisons and navigation, business-day operations, day/week/month boundaries, relative descriptions, and widget adapters do not accept `PlainYearMonth`. A caller can select a day explicitly with `.toPlainDate({ day: 1 })` when a full date is needed. No operation implicitly mixes month-only values with full dates.

## PlainMonthDay and PlainTime support

`PlainMonthDay` accepts month/day patterns and returns the same type from parsers. ISO months are read through `monthCode`, since this type has no numeric `month` getter. Year, weekday, time, and offset tokens are invalid for a month/day value. February 29 is valid without selecting a particular occurrence year. A caller can use `.toPlainDate({ year })` to select an occurrence explicitly and apply the desired leap-year policy.

`PlainTime` supports time patterns and same-kind collections/intervals. Clock ordering runs from `00:00` through the final nanosecond of the day. Distance is the absolute clock difference; it does not select a shorter route across midnight. An interval with `start` later than `end` is rejected rather than interpreted as overnight. A dated interval must be used for overnight schedules.

## Formatting

```ts
format(value, pattern, options?): string
```

Supported inputs: `PlainDate`, `PlainTime`, `PlainDateTime`, `PlainYearMonth`, `PlainMonthDay`, `ZonedDateTime`, and `Instant`. `Duration` uses the dedicated `formatDuration` API below.

```ts
interface FormatOptions {
  locale?: string;
  timeZone?: string;
}
```

- `Instant` requires `timeZone`.
- A `ZonedDateTime` uses its own zone unless `timeZone` is supplied.
- Plain values retain their fields; supplying `timeZone` for them is an error.
- Year/month tokens accept `PlainYearMonth`. Month/day tokens accept `PlainMonthDay`. Year tokens require a year; weekday tokens require a complete date. Time tokens require a time-bearing value. Offset tokens require an instant or zoned value. Missing information is an error.
- Use date-fns/Unicode token meanings: `yyyy`, `MM`, and `dd`, rather than Day.js `YYYY`, `MM`, and `DD`. Literal text is enclosed in single quotes; `''` emits a quote.
- Initial tokens: `yyyy`, `yy`, `M`, `MM`, `MMM`, `MMMM`, `d`, `dd`, `EEE`, `EEEE`, `H`, `HH`, `h`, `hh`, `m`, `mm`, `s`, `ss`, `SSS`, `a`, `XX`, and `XXX`.
- `yyyy` and `yy` format the year of era: Temporal year `0` is `0001`, and year `-1` is `0002`. Era tokens are not included in the initial token set.
- Numeric output uses ASCII digits. Text labels use `locale`. Unsupported tokens throw instead of silently producing partial output.
- Month and weekday text uses the locale's grammatical formatting forms, including for partial values. Stand-alone `L`/`c` tokens are not in the initial token set.

```ts
format(date, 'MMM d, yyyy');
format(time, 'h:mm a');
format(event, "yyyy-MM-dd'T'HH:mm:ss.SSSXXX");
format(instant, 'HH:mm', { timeZone: 'America/Montevideo' });
format(Temporal.PlainYearMonth.from('2026-10'), 'MMMM yyyy');
format(Temporal.PlainMonthDay.from('02-29'), 'MMMM d');
```

## Pattern parsing and validation

```ts
parse<T extends ParseReference>(text, pattern, reference: T, options?): T
tryParse<T extends ParseReference>(text, pattern, reference: T, options?): TryResult<T, RangeError>
isMatch<T extends ParseReference>(text, pattern, reference: T, options?): boolean
```

```ts
interface ParseOptions {
  timeZone?: string;
  disambiguation?: 'compatible' | 'earlier' | 'later' | 'reject';
}
```

The reference is required, as in date-fns `parse`. Its kind determines the return type and its fields supply missing higher-order components. Omitted lower-order components reset to the start of the specified unit. For example, parsing a month into a date reference retains its year and uses day 1.

- Parsing must consume the complete input and reject impossible dates and out-of-range clock fields.
- A `PlainDate` reference accepts date patterns; a `PlainTime` reference accepts time patterns. Date-time references accept either or both.
- A `PlainYearMonth` reference accepts only year/month patterns and returns `PlainYearMonth`. Omitted higher-order fields come from that reference; parsing only a year resets the month to January. Day, time, and offset tokens are pattern errors for this reference kind.
- A `PlainMonthDay` reference accepts month/day patterns and returns `PlainMonthDay`. An omitted month comes from the reference; parsing only a month resets the day to 1. Year, weekday, time, and offset tokens are pattern errors. Month/day validation accepts February 29 without choosing a year.
- An `Instant` reference returns `Instant` and requires `options.timeZone`, including for offset-bearing patterns. Missing fields are resolved from the reference viewed in that zone. Without an input offset, parsed local fields are resolved in that zone with `disambiguation`; an input offset determines the result instant directly.
- A zoned reference retains its time zone. Without an offset in the input, ambiguous/nonexistent local times follow `disambiguation`, which defaults to Temporal's `compatible` behavior.
- Offset-bearing input requires a zoned or instant reference. For a zoned reference the parsed instant is returned in the reference's zone. `options.timeZone` is valid only for an instant reference; plain references reject it, and zoned references already provide their zone. Concrete instant overloads require this option statically.
- `yyyy` accepts four to six ASCII digits and a positive Common Era year. Zero and signed years are rejected; use native Temporal ISO parsing for signed years. Era parsing is deferred.
- Initial parser tokens are the numeric subset `yyyy`, `M`, `MM`, `d`, `dd`, `H`, `HH`, `h`, `hh`, `m`, `mm`, `s`, `ss`, `SSS`, `a`, `XX`, and `XXX`, plus quoted literals. `a` accepts `AM`/`PM`; a 12-hour token requires `a`. Two-digit years and textual month/weekday parsing are deferred.
- `parse` throws `RangeError` for invalid input. `tryParse` returns `[error, null]` with that error, and `isMatch` returns `false` for that input. Pattern/option errors still throw in all three functions.
- Successful `tryParse` calls return `[null, result]`. Exactly one tuple element is non-null; the discriminated tuple preserves the relationship between the error and result types.
- There is no fallback to `Date.parse`, no implicit current date, and no inferred result kind from the string contents.

`tryParse` and the reference argument on `isMatch` are deliberate additions to the date-fns interface. The reference keeps validation of incomplete patterns deterministic.

```ts
const reference = Temporal.PlainDate.from('2000-01-01');

parse('02/29/2024', 'MM/dd/yyyy', reference); // PlainDate: 2024-02-29
isMatch('2024-02-29', 'yyyy-MM-dd', reference); // true

const [error, date] = tryParse('02/29/2024', 'MM/dd/yyyy', reference);

if (error !== null) {
  console.error(error.message);
} else {
  format(date, 'yyyy-MM-dd');
}
```

For example, parsing `02/29/2025` with `tryParse` returns `[RangeError, null]`; parsing `02/29/2024` returns `[null, PlainDate]`.

```ts
const leapDay = Temporal.PlainMonthDay.from('02-29');
parse('12/25', 'MM/dd', leapDay);

const instantReference = Temporal.Instant.from('2026-01-01T00:00:00Z');
parse('2026-10-23 12:00', 'yyyy-MM-dd HH:mm', instantReference, {
  timeZone: 'America/Montevideo',
});
```

The first parse returns a December 25 `PlainMonthDay`; the second returns the instant `2026-10-23T15:00:00Z`.

## Duration formatting and parsing

```ts
type DurationUnit =
  | 'years' | 'months' | 'weeks' | 'days'
  | 'hours' | 'minutes' | 'seconds'
  | 'milliseconds' | 'microseconds' | 'nanoseconds';

interface DurationFormatOptions {
  format?: readonly DurationUnit[];
  zero?: boolean;
  delimiter?: string;
  locale?: string;
}

formatDuration(value: Temporal.Duration, options?: DurationFormatOptions): string
parseDuration(text: string): Temporal.Duration
tryParseDuration(text: string): TryResult<Temporal.Duration, RangeError>
```

`formatDuration` follows the date-fns duration-formatting style: choose fields, whether to include zeros, and a delimiter. It reads duration components without balancing them or assuming that a month is a fixed number of days. Fields default to years through nanoseconds in descending order; an explicit `format` list controls their selection and order. `zero` defaults to `false` and `delimiter` to a single space. An empty field list and duplicate or unknown field names are option errors. If all selected components are zero and `zero` is false, the result is `0` followed by the final selected unit's label. A negative duration has one leading minus sign. The initial text locale is `en-US`.

The duration parser accepts human unit strings, such as `1h 30m` or `2 days 3 hours`. Components are non-negative integers with a single optional leading sign applying to the whole duration. Units are `y`, `mo`, `w`, `d`, `h`, `m`, `s`, `ms`, `us`, and `ns`, or their singular/plural English names. Components are separated by whitespace; whitespace between a number and its unit is optional. Empty input, repeated units, embedded signs, unknown units, and fractional components are rejected. Component order is unrestricted and clock units do not wrap at 24 hours or 60 minutes. The parser does not rebalance fields. ISO duration strings remain the responsibility of `Temporal.Duration.from()`.

Integer components must be exactly representable by Temporal's number-valued fields and fit its duration limits. Large exactly representable components are accepted; inputs that would lose integer precision are rejected. Duration formatting emits decimal integers rather than scientific notation.

`parseDuration` throws `RangeError` for invalid text; `tryParseDuration` returns `[error, null]` for the same failure and `[null, duration]` on success. A duration pattern is never interpreted as a clock-time pattern.

```ts
formatDuration(Temporal.Duration.from({ hours: 25, minutes: 30 }), {
  format: ['hours', 'minutes'],
});

const [error, duration] = tryParseDuration('25h 30m');
```

Formatting produces `25 hours 30 minutes`; parsing retains `hours: 25` and `minutes: 30`. Localized duration rendering without these field-selection rules is already available through native `toLocaleString()` / `Intl.DurationFormat`.

## Calendar boundaries

```ts
startOfWeek<T extends CalendarValue>(value: T, options?: WeekOptions): T
startOfISOWeek<T extends CalendarValue>(value: T): T
startOfMonth<T extends CalendarValue>(value: T): T
startOfQuarter<T extends YearMonthValue>(value: T): T
startOfYear<T extends YearMonthValue>(value: T): T

endOfDay<T extends TimeValue>(value: T): T
endOfWeek<T extends CalendarValue>(value: T, options?: WeekOptions): T
endOfISOWeek<T extends CalendarValue>(value: T): T
endOfMonth<T extends CalendarValue>(value: T): T
endOfQuarter<T extends YearMonthValue>(value: T): T
endOfYear<T extends YearMonthValue>(value: T): T
```

For `PlainYearMonth`, quarter/year boundaries return the first or final month in the period. For `PlainDate`, an end boundary is the final date in the period. For date-times, it is the final nanosecond before the next period begins. `endOfDay` accepts clock-bearing values, including `PlainTime`, for which it returns `23:59:59.999999999`. All these functions preserve the Temporal kind.

Zoned boundaries use the value's own zone. A day starts at its earliest valid local instant; it need not begin at midnight. An end boundary uses the actual next period boundary, not an assumed count of hours. Hour-level rounding stays with native Temporal.

## Calendar comparisons

```ts
isSameDay(a, b, options?): boolean
isSameWeek(a, b, options?): boolean
isSameISOWeek(a, b, options?): boolean
isSameMonth(a, b, options?): boolean
isSameQuarter(a, b, options?): boolean
isSameYear(a, b, options?): boolean
```

Month/quarter/year comparisons accept pairs of the same kind from `YearMonthValue | Temporal.Instant`, including `PlainYearMonth`. Day/week/ISO-week comparisons accept only `CalendarValue` or `Instant`, with matching kinds. These calendar comparisons exclude `PlainTime`, `PlainMonthDay`, and `Duration`. `isSameWeek` additionally accepts `weekStartsOn`.

- Plain values compare their calendar fields without a zone. `isSameDay` ignores clock fields on `PlainDateTime`.
- A pair of zoned values with the same zone uses that zone. Different zones require `options.timeZone`; both values are viewed in that zone.
- A pair of instants always requires `options.timeZone`.
- Supplying `timeZone` for plain values is an error. ISO variants retain the same zone rules.
- `isSameWeek` compares week boundaries, so equal week numbers in different years do not imply equality.

```ts
isSameDay(firstEvent, secondEvent, { timeZone: 'America/New_York' });
isSameWeek(firstDate, secondDate, { weekStartsOn: 1 });
```

## Relative descriptions

```ts
formatDistance(value, baseValue, options?): string
formatDistanceStrict(value, baseValue, options?): string
formatDistanceToNow(value, options?): string
formatDistanceToNowStrict(value, options?): string
formatRelative(value, baseValue, options?): string
```

```ts
interface DistanceOptions {
  locale?: string;
  addSuffix?: boolean;
  includeSeconds?: boolean;
  timeZone?: string;
}

interface StrictDistanceOptions {
  locale?: string;
  addSuffix?: boolean;
  unit?: 'second' | 'minute' | 'hour' | 'day' | 'month' | 'year';
  roundingMethod?: 'floor' | 'ceil' | 'round' | 'trunc';
  timeZone?: string;
}
```

- `formatDistance` and `formatDistanceToNow` use `DistanceOptions`; strict variants use `StrictDistanceOptions`. `addSuffix` defaults to `false`, `includeSeconds` to `false`, and strict rounding to `round`.
- Pair functions accept matching kinds from `CalendarValue | Temporal.Instant`, with the calendar-comparison zone rules. `PlainYearMonth` is excluded from all relative-description functions. Comparisons of plain date-times describe wall-clock differences, not elapsed time.
- `ToNow` functions read the current clock when called. Plain values and instants require a zone to establish the calendar context; zoned values default to their own zone. Tests can use the explicit-base counterparts.
- A suffix describes `value` relative to `baseValue`: later values produce future wording.
- `formatRelative` accepts `locale` and `timeZone`. It uses yesterday/today/tomorrow for day offsets -1/0/1, weekday descriptions for offsets -6 through -2 and 2 through 6, and a localized date otherwise. Date-time inputs include a clock time; `PlainDate` does not invent one.
- The initial text locale is `en-US`. Other locales require explicit relative-phrase resources; unsupported locales throw for these functions.

Approximate distances use the absolute elapsed seconds to select a phrase. Plain date-times use wall-clock seconds; plain dates use 24-hour calendar days. Ranges include their lower bound and exclude their upper bound.

| Range                    | Phrase                                              |
| ------------------------ | --------------------------------------------------- |
| Less than 30 seconds     | `less than a minute`                                |
| 30 to 90 seconds         | `1 minute`                                          |
| 90 seconds to 45 minutes | Rounded minutes                                     |
| 45 to 90 minutes         | `about 1 hour`                                      |
| 90 minutes to 24 hours   | `about` rounded hours                               |
| 24 to 42 hours           | `1 day`                                             |
| 42 hours to 30 days      | Rounded calendar-relative days                      |
| 30 to 45 days            | `about 1 month`                                     |
| 45 to 60 days            | `2 months`                                          |
| 60 to 365 days           | Rounded calendar-relative months, at least 2        |
| 365 days or longer       | `about` rounded calendar-relative years, at least 1 |

With `includeSeconds`, the first 90 seconds instead use `less than 5 seconds` below 5 seconds, `less than 10 seconds` below 10, `less than 20 seconds` below 20, `half a minute` below 40, `less than a minute` below 60, and `1 minute` below 90.

Strict distances choose seconds/minutes/hours/days/months/years at thresholds of 60 seconds, 60 minutes, 24 hours, 30 days, and 365 days. An explicit `unit` overrides this choice. Once selected, calendar days/months/years use Temporal totals relative to the base value, including its zone when present. Rounding applies to the absolute magnitude before adding any suffix. A zero distance has no directional suffix. These rules do not promise exact date-fns phrase compatibility.

Successful native month/year totals are retained unchanged. At the range edges, plain values, UTC (including aliases resolved to UTC by `Intl`), and explicit fixed-offset zones support fractions whose neighboring calendar boundary lies outside Temporal's representable range. The fallback uses integer nanoseconds and constrained ISO month/year anniversaries, following [Temporal's relative-total algorithm](https://tc39.es/proposal-temporal/#sec-temporal-totalrelativeduration). Strict rounding and suffix options apply as usual.

Other named zones preserve native totals and the original native `RangeError` when arithmetic cannot resolve a required boundary. The library does not shift years or extrapolate time-zone rules. Gregorian dates repeat every 400 years, but [named-zone offset resolution is implementation-defined](https://tc39.es/ecma262/multipage/numbers-and-dates.html#sec-getnamedtimezoneoffsetnanoseconds); Temporal does not guarantee that cycle for zone rules. A named zone's observed zero or constant offset does not qualify it for the fixed-offset fallback. No options or additional Temporal types are required.

## Collection selection

```ts
min<T extends OrderedValue>(values: readonly T[]): T | undefined
max<T extends OrderedValue>(values: readonly T[]): T | undefined
closestTo<T extends OrderedValue>(target: T, values: readonly T[]): T | undefined
closestIndexTo<T extends OrderedValue>(target: T, values: readonly T[]): number | undefined
```

Collections contain one Temporal kind. Zoned values and instants are ordered by exact time, so zoned values may have different zones. Plain dates use calendar-day distance; plain date-times use wall-clock distance. `PlainYearMonth` uses year/month order and whole-calendar-month distance. `PlainTime` uses linear clock order and absolute nanosecond distance within the day, without midnight wrapping. `PlainMonthDay` and `Duration` are excluded. Ties select the first occurrence. Empty collections return `undefined`. Selected values are the original input objects.

## Intervals and sequences

```ts
isWithinInterval<T extends OrderedValue>(value: T, interval: Interval<T>): boolean
areIntervalsOverlapping<T extends OrderedValue>(a: Interval<T>, b: Interval<T>, options?: { inclusive?: boolean }): boolean
clamp<T extends OrderedValue>(value: T, interval: Interval<T>): T

eachDayOfInterval<T extends CalendarValue>(interval: Interval<T>, options?: { step?: number }): T[]
eachWeekOfInterval<T extends CalendarValue>(interval: Interval<T>, options?: WeekOptions & { step?: number }): T[]
eachMonthOfInterval<T extends YearMonthValue>(interval: Interval<T>, options?: { step?: number }): T[]
eachWeekendOfInterval<T extends CalendarValue>(interval: Interval<T>, options?: BusinessDayOptions): T[]
eachHourOfInterval<T extends TimeValue>(interval: Interval<T>, options?: { step?: number }): T[]
eachMinuteOfInterval<T extends TimeValue>(interval: Interval<T>, options?: { step?: number }): T[]
```

- Interval endpoints have the same Temporal kind and must be ordered `start <= end`. Reversed intervals throw instead of being silently normalized.
- Membership includes both endpoints. Overlap excludes intervals that merely touch unless `inclusive: true` is supplied. These follow the corresponding date-fns conventions.
- `clamp` returns the input or the appropriate endpoint.
- Day sequences return each calendar day's start from the day containing `start` through the day containing `end`, inclusive. Week/month sequences similarly return starts of containing weeks/months. The first result can precede the precise interval start.
- For `PlainYearMonth` endpoints, `eachMonthOfInterval` emits month-only values from `start` through `end`, inclusive. Day/week/weekend sequences still require complete dates.
- `PlainTime` intervals use linear clock order and do not wrap overnight. Hour/minute sequences start at the beginning of the containing hour/minute, preserve the endpoint kind, and stop before passing the end or wrapping to the next day. For date-time inputs they may cross midnight; zoned hour/minute steps advance by elapsed hours/minutes through offset changes. Instants, month/day recurrences, and durations are excluded from these two sequence functions.
- `step` defaults to 1 and must be a positive integer. Zero, negative, fractional, and non-finite steps throw.
- Zoned sequences require matching endpoint zones and advance by calendar units. `eachWeekendOfInterval` filters the day sequence using `weekendDays`, defaulting to Sunday/Saturday.

Endpoint validation and positive-only steps are deliberate limits compared with date-fns's permissive interval iteration behavior.

## Business days, weekdays, quarters, and week numbering

```ts
addBusinessDays<T extends CalendarValue>(value: T, amount: number, options?: BusinessDayOptions): T
subBusinessDays<T extends CalendarValue>(value: T, amount: number, options?: BusinessDayOptions): T
differenceInBusinessDays(later, earlier, options?: BusinessDayDifferenceOptions): number
isWeekend(value: CalendarValue, options?: BusinessDayOptions): boolean
isBusinessDay(value: CalendarValue, options?: BusinessDayOptions): boolean

nextDay<T extends CalendarValue>(value: T, day: Weekday): T
previousDay<T extends CalendarValue>(value: T, day: Weekday): T

getQuarter(value: QuarterValue): 1 | 2 | 3 | 4
getWeek(value, options?: WeekNumberOptions): number
getWeekYear(value, options?: WeekNumberOptions): number
getWeekOfMonth(value, options?: WeekOptions): number
getWeeksInMonth(value: YearMonthValue, options?: WeekOptions): number
```

Business-day and weekday functions require `CalendarValue`. `getQuarter` additionally accepts `PlainYearMonth` and `PlainMonthDay`; for the latter it derives the ISO month from `monthCode`. `getWeeksInMonth` additionally accepts `PlainYearMonth`, but still needs a year, so it excludes `PlainMonthDay`. Getters for a date's containing week require a complete date. Binary business-day differences use the calendar-comparison zone rules.

All weekend-aware functions use the same `BusinessDayOptions`. `isBusinessDay` is the inverse of `isWeekend` under the selected configuration. `weekendDays` defaults to `[0, 6]`; an empty list makes every date a business day. Duplicate entries are ignored. Invalid weekday numbers or all seven weekend days produce `RangeError`; at least one business day must remain. Options are validated even when the requested amount is zero. Holiday calendars remain deferred.

Amounts must be integers. Adding zero business days leaves the value unchanged. Other additions count working dates reached after moving in the requested direction and preserve clock fields on date-time inputs using Temporal's compatible DST handling.

For zoned values, dates skipped entirely by an offset change are not working dates and are excluded from both arithmetic and differences. Weekday navigation skips a missing occurrence to reach the requested weekday.

```ts
const fridaySaturdayWeekend = { weekendDays: [5, 6] } as const;
const thursday = Temporal.PlainDate.from('2026-10-22');

addBusinessDays(thursday, 1, fridaySaturdayWeekend);
isWeekend(Temporal.PlainDate.from('2026-10-23'), fridaySaturdayWeekend);
isBusinessDay(Temporal.PlainDate.from('2026-10-25'), fridaySaturdayWeekend);

const october = Temporal.PlainYearMonth.from('2026-10');
getQuarter(october);
isSameYear(october, Temporal.PlainYearMonth.from('2026-01'));
eachMonthOfInterval({ start: october, end: Temporal.PlainYearMonth.from('2026-12') });
```

The business-day addition above returns Sunday, October 25, 2026. The weekend and business-day checks both return `true`. The month interval returns October, November, and December as `PlainYearMonth` values.

`differenceInBusinessDays(later, earlier)` counts working dates in `[earlier, later)` and ignores clock time. Reversing the arguments negates the result. `nextDay` and `previousDay` are strictly next/previous, so an already matching weekday moves seven days. Quarters are January–March, April–June, July–September, and October–December.

Week numbers are 1-based. The first week is the week containing January `firstWeekContainsDate`; `getWeekYear` returns the year to which that week belongs. Week-of-month functions count the weeks intersecting the month, with `getWeekOfMonth` returning the index of the containing week. The ISO equivalents of week/year getters already exist on Temporal dates and are not duplicated.

## Optional widget adapters

These have different semantics from timestamp conversion and are separate exports under the `calendar` subpath.

```ts
toCalendarDate(value: CalendarValue): Date
fromCalendarDate(value: Date): Temporal.PlainDateTime
```

`toCalendarDate` copies displayed fields into a host-local `Date`; a date-only input uses midnight. It does not preserve the original instant. `fromCalendarDate` reads host-local fields and returns a value without a zone. Invalid inputs throw. If the host zone cannot represent the requested local fields, such as a skipped clock time, `toCalendarDate` throws rather than silently shifting them. Sub-millisecond fields cannot be represented by `Date`; nonzero values throw rather than being silently discarded.

An application that needs only the calendar date can call `fromCalendarDate(value).toPlainDate()`. Applications assign a scheduling zone explicitly afterward with native Temporal operations.

## Implementation and validation

The package exports all functions above. Relative and duration phrases initially support `en-US`; token text labels use host `Intl` locale data. ISO calendars, parser references, positive interval steps, and widget adapter semantics follow the rules in this document.

Runtime checks cover all exports on native Temporal and the polyfill, including DST transitions and Temporal range boundaries. Compile-time checks verify preserved return types, tuple narrowing, required zone options, and rejection of mixed-kind arguments. Run `npm run check` to repeat formatting, type, build, and polyfill/native-host checks.

The repository's `test/api-contract.test.mjs` checks supported and excluded kinds for each family, all week-numbering configurations, and zoned business arithmetic against day-by-day counting. `test/review-regressions.test.mjs` preserves reproductions for the implementation review findings.

## References

- [date-fns format signature and tokens](https://github.com/date-fns/date-fns/blob/v4.1.0/src/format/index.ts)
- [date-fns parse reference and options](https://github.com/date-fns/date-fns/blob/v4.1.0/src/parse/index.ts)
- [date-fns interval iteration](https://github.com/date-fns/date-fns/blob/v4.1.0/src/eachDayOfInterval/index.ts)
- [date-fns overlap options](https://github.com/date-fns/date-fns/blob/v4.1.0/src/areIntervalsOverlapping/index.ts)
- [Temporal date API](https://tc39.es/proposal-temporal/docs/plaindate.html)
- [Temporal year/month API](https://tc39.es/proposal-temporal/docs/plainyearmonth.html)
- [Temporal month/day API](https://tc39.es/proposal-temporal/docs/plainmonthday.html)
- [Temporal duration API](https://tc39.es/proposal-temporal/docs/duration.html)
- [Native localized duration formatting](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Temporal/Duration/toLocaleString)
- [Temporal zoned date-time API](https://tc39.es/proposal-temporal/docs/zoneddatetime.html)
- [Guildara migration utility](https://github.com/guildaracom/guildara-frontend/blob/c72c3bc074e2455eca4aaa200f1788fc1b83032a/util/tempo.ts)
