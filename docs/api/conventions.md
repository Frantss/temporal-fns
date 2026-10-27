# Input types and conventions

[API index](README.md) · [Types and options](types.md)

These rules apply to the linked functions. See each function file for its description, examples, related APIs, and behavior links.

## Formatting and parsing

All four functions support `PlainDate`, `PlainDateTime`, `ZonedDateTime`, `PlainTime`, `PlainYearMonth`, `PlainMonthDay`, and `Instant`. Patterns can only use fields present on the input or reference. See the [shared contracts](README.md#shared-contracts).

### Tokens

| Field           | Formatting                       | Parsing                       |
| --------------- | -------------------------------- | ----------------------------- |
| Year of era     | `yyyy`, `yy`                     | `yyyy` (positive, 4–6 digits) |
| Month           | `M`, `MM`, `MMM`, `MMMM`         | `M`, `MM`                     |
| Day of month    | `d`, `dd`                        | `d`, `dd`                     |
| Weekday label   | `EEE`, `EEEE`                    | Unsupported                   |
| 24-hour clock   | `H`, `HH`                        | `H`, `HH`                     |
| 12-hour clock   | `h`, `hh`, `a`                   | `h` or `hh` together with `a` |
| Minute / second | `m`, `mm`, `s`, `ss`             | Same                          |
| Millisecond     | `SSS`                            | `SSS` (exactly 3 digits)      |
| UTC offset      | `XX` (`+0530`), `XXX` (`+05:30`) | Same; `Z` also accepted       |

Quote literal letters with single quotes. A doubled apostrophe represents one apostrophe. Unsupported tokens throw `RangeError`. `yyyy` and `yy` format year of era: year zero becomes `0001` and year −1 becomes `0002`. These are not signed ISO-year tokens.

For parsing, single-width numeric tokens accept one or two digits; double-width tokens require two. `a` accepts uppercase `AM` or `PM`. A pattern cannot specify the same field twice, combine `H` and `h`, or use `h` without `a`.

| Kind                                         | Available fields                      |
| -------------------------------------------- | ------------------------------------- |
| `PlainDate`                                  | Year, month, day, weekday             |
| `PlainDateTime`                              | Date and clock fields, without offset |
| `ZonedDateTime`, `Instant` with viewing zone | Date, clock, and offset fields        |
| `PlainTime`                                  | Clock fields                          |
| `PlainYearMonth`                             | Year and month                        |
| `PlainMonthDay`                              | Month and day                         |

Weekday and month-name tokens remain formatting-only, even when the value contains those fields.

## Duration text

These functions read or render `Temporal.Duration` components. They do not balance hours into days or minutes into hours. Labels support `en-US` only. See the [shared contracts](README.md#shared-contracts).

## Relative descriptions

Accept `PlainDate`, `PlainDateTime`, `ZonedDateTime`, or `Instant`. Pair calls require matching kinds and follow the [calendar comparison zone rules](README.md#calendar-comparison-zones). Text supports `en-US` only.

Plain date-times use wall-clock distance. Zoned values and instants use elapsed seconds, minutes, and hours; calendar days, months, and years depend on the viewing zone. Calendar-relative totals preserve successful native Temporal results. At range edges, extended month/year totals support plain values and fixed-offset/UTC contexts; named zones retain native range failures. See the [range behaviors](../../test/features/relative-range.feature).

## Period boundaries

Boundary functions return the same Temporal kind as the input. Unless stated otherwise in a function's entry, they accept `PlainDate`, `PlainDateTime`, and `ZonedDateTime`. They use a zoned value's own zone and have no zone override.

Date-only results identify a date. Date-time starts use midnight, or the earliest valid local time if midnight is skipped. Plain date-time ends use `23:59:59.999999999`; zoned ends are one nanosecond before the next local date starts, so actual day length may vary.

`weekStartsOn` uses `0` for Sunday through `6` for Saturday and defaults to `0`. A required boundary outside Temporal's range throws `RangeError` rather than clipping. See the [shared contracts](README.md#shared-contracts).

## Calendar period comparisons

These predicates compare calendar periods, including the year, and ignore clock fields. Inputs must have the same Temporal kind. All six accept `PlainDate`, `PlainDateTime`, `ZonedDateTime`, and `Instant`. Month, quarter, and year comparisons also accept `PlainYearMonth`.

`Instant` requires `timeZone`. Zoned values with different zones require an explicit common `timeZone`; same-zone values use their zone unless overridden. Plain inputs reject `timeZone`. See [calendar comparison zones](README.md#calendar-comparison-zones).

## Business days

Accept `PlainDate`, `PlainDateTime`, or `ZonedDateTime`. A business day is a date whose weekday is not listed in `weekendDays`; there is no holiday calendar.

`weekendDays` defaults to `[0, 6]` (Sunday and Saturday). Weekdays use `0` through `6`. Duplicates are ignored; `[]` makes every existing date a business day. Excluding all seven weekdays throws `RangeError`, even for zero amounts. Configuration belongs to the call and does not change later calls. See the [shared contracts](README.md#shared-contracts).

## Weekday navigation and calendar queries

Navigation and week queries accept `PlainDate`, `PlainDateTime`, and `ZonedDateTime`. Zoned inputs use their own local fields. `getQuarter` and `getWeeksInMonth` also support the partial types described in their entries. These navigation and query functions do not accept `Instant` directly.

Weekday numbers are `0` (Sunday) through `6` (Saturday), unlike Temporal's `dayOfWeek` values `1` through `7`. `weekStartsOn` defaults to `0`. `firstWeekContainsDate` defaults to `1` and must be an integer from `1` through `7`. These options are per call. See the [shared contracts](README.md#shared-contracts).

## Collection selection

Accept homogeneous readonly arrays of `PlainDate`, `PlainDateTime`, `ZonedDateTime`, `PlainTime`, `PlainYearMonth`, or `Instant`. Empty arrays return `undefined`. `min`, `max`, and `closestTo` return an original object; `closestIndexTo` returns its zero-based index. Ties retain the first occurrence. No function sorts or mutates the array.

Zoned values are ordered by exact instant and may have different zones. Plain date-time distance uses wall time; date distance uses days; year-month distance uses whole months without hidden reference days. Clock-only distance is linear and does not wrap at midnight. See the [shared contracts](README.md#shared-contracts).

## Interval queries

An interval is `{ start, end }` with same-kind endpoints and `start ≤ end`. Accepts `PlainDate`, `PlainDateTime`, `ZonedDateTime`, `PlainTime`, `PlainYearMonth`, or `Instant`. All value and interval arguments must share the same kind.

Zoned inputs compare exact instants and may use different zones without extra context. Year-month intervals compare months. Reversed endpoints throw `RangeError`; a `PlainTime` interval never means an overnight range. See the [shared contracts](README.md#shared-contracts).

## Interval sequences

Sequences return arrays of the endpoint kind, ordered by increasing time or calendar value. Endpoints must share a supported kind; zoned endpoints must also have matching zone IDs. Reversed intervals throw `RangeError`.

The first result is the start of the containing period, so it can precede the precise interval start. Include subsequent period starts at or before the interval end. Equal endpoints still emit their containing period, except when a weekend filter removes it.

Where supported, `step` defaults to `1` and must be a positive safe integer. Steps advance from the first containing period; the final endpoint is included only when reached. A missing first boundary throws; advancing beyond the representable range stops enumeration after the emitted values. No extra value past the endpoint is required. See the [sequence range behaviors](../../test/features/sequences.feature#L196).

## Calendar widget adapters

Import these functions from `@helpy/temporal-fns/calendar`. They exchange displayed calendar fields with `Date`-based widgets using the host's local time zone. They copy fields rather than preserve the original instant.

A global `Temporal` is still required. These adapters do not accept options. See the [shared contracts](README.md#shared-contracts).
