---
title: 'API reference'
---

The API is experimental. See [installation and setup](/docs#install) before running these examples.

Import functions from `@frantss/temporal-fns`, except the two [calendar widget adapters](./conventions.md#calendar-widget-adapters), which use `@frantss/temporal-fns/calendar`. Each function has its own file with examples, related APIs, and executable Gherkin behavior links. Group links describe shared input types and conventions.

## Functions

| Group                                                                                               | APIs                                                                                                                                                                                                                                                                                                                                                                        |
| --------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [Formatting and parsing](./conventions.md#formatting-and-parsing)                                   | [format](./format.md), [parse](./parse.md), [tryParse](./tryParse.md), [isMatch](./isMatch.md)                                                                                                                                                                                                                                                                              |
| [Duration text](./conventions.md#duration-text)                                                     | [formatDuration](./formatDuration.md), [parseDuration](./parseDuration.md), [tryParseDuration](./tryParseDuration.md)                                                                                                                                                                                                                                                       |
| [Relative descriptions](./conventions.md#relative-descriptions)                                     | [formatDistance](./formatDistance.md), [formatDistanceStrict](./formatDistanceStrict.md), [formatDistanceToNow](./formatDistanceToNow.md), [formatDistanceToNowStrict](./formatDistanceToNowStrict.md), [formatRelative](./formatRelative.md)                                                                                                                               |
| [Period boundaries](./conventions.md#period-boundaries)                                             | [startOfWeek](./startOfWeek.md), [startOfISOWeek](./startOfISOWeek.md), [startOfMonth](./startOfMonth.md), [startOfQuarter](./startOfQuarter.md), [startOfYear](./startOfYear.md), [endOfDay](./endOfDay.md), [endOfWeek](./endOfWeek.md), [endOfISOWeek](./endOfISOWeek.md), [endOfMonth](./endOfMonth.md), [endOfQuarter](./endOfQuarter.md), [endOfYear](./endOfYear.md) |
| [Calendar period comparisons](./conventions.md#calendar-period-comparisons)                         | [isSameDay](./isSameDay.md), [isSameWeek](./isSameWeek.md), [isSameISOWeek](./isSameISOWeek.md), [isSameMonth](./isSameMonth.md), [isSameQuarter](./isSameQuarter.md), [isSameYear](./isSameYear.md)                                                                                                                                                                        |
| [Business days](./conventions.md#business-days)                                                     | [addBusinessDays](./addBusinessDays.md), [subBusinessDays](./subBusinessDays.md), [differenceInBusinessDays](./differenceInBusinessDays.md), [isWeekend](./isWeekend.md), [isBusinessDay](./isBusinessDay.md)                                                                                                                                                               |
| [Weekday navigation and calendar queries](./conventions.md#weekday-navigation-and-calendar-queries) | [nextDay](./nextDay.md), [previousDay](./previousDay.md), [getQuarter](./getQuarter.md), [getWeek](./getWeek.md), [getWeekYear](./getWeekYear.md), [getWeekOfMonth](./getWeekOfMonth.md), [getWeeksInMonth](./getWeeksInMonth.md)                                                                                                                                           |
| [Collection selection](./conventions.md#collection-selection)                                       | [min](./min.md), [max](./max.md), [closestTo](./closestTo.md), [closestIndexTo](./closestIndexTo.md)                                                                                                                                                                                                                                                                        |
| [Interval queries](./conventions.md#interval-queries)                                               | [isWithinInterval](./isWithinInterval.md), [areIntervalsOverlapping](./areIntervalsOverlapping.md), [clamp](./clamp.md)                                                                                                                                                                                                                                                     |
| [Interval sequences](./conventions.md#interval-sequences)                                           | [eachDayOfInterval](./eachDayOfInterval.md), [eachWeekOfInterval](./eachWeekOfInterval.md), [eachMonthOfInterval](./eachMonthOfInterval.md), [eachWeekendOfInterval](./eachWeekendOfInterval.md), [eachHourOfInterval](./eachHourOfInterval.md), [eachMinuteOfInterval](./eachMinuteOfInterval.md)                                                                          |
| [Calendar widget adapters](./conventions.md#calendar-widget-adapters)                               | [toCalendarDate](./toCalendarDate.md), [fromCalendarDate](./fromCalendarDate.md)                                                                                                                                                                                                                                                                                            |

## Shared contracts

- Supply a global `Temporal`; importing this package does not install it.
- Pass Temporal objects of a supported kind. Strings and legacy Date objects are not implicitly converted; [fromCalendarDate](./fromCalendarDate.md) explicitly accepts Date.
- Calendar-bearing values must use `iso8601`. Non-ISO calendars throw `RangeError`.
- Pairs, collections, and interval arguments require matching kinds. A `PlainDate` and a `PlainDateTime` cannot be combined even when they identify the same date.
- Inputs, arrays, options, and global defaults are not changed. Options apply only to the call.
- Omitted options and properties set to `undefined` select defaults. `null` does not select defaults. Unknown option keys and invalid option values throw.
- Functions return a supported input kind unless their entry specifies a scalar, Date, tuple, or array. Partial values do not gain fields they lack.
- All examples assume the installation and [TypeScript setup](./types.md#typescript-setup) are complete. Each TypeScript block has its own imports and variables. `// =>` comments show expected results; `// throws` comments identify deliberate failures.

Behaviors: [package and ownership contracts](https://github.com/Frantss/temporal-fns/blob/main/test/features/contracts.feature), [input-kind coverage](https://github.com/Frantss/temporal-fns/blob/main/test/features/type-coverage.feature), [TypeScript overload constraints](https://github.com/Frantss/temporal-fns/blob/main/test/features/declarations.feature).

## Calendar comparison zones

[Period comparisons](./conventions.md#calendar-period-comparisons), [relative pair descriptions](./conventions.md#relative-descriptions), and [business-day differences](./differenceInBusinessDays.md) select calendar fields as follows:

| Input kind                              | Zone context                                             |
| --------------------------------------- | -------------------------------------------------------- |
| Plain values                            | Reject `timeZone`; use their own calendar fields         |
| `Instant`, where supported              | Require explicit `timeZone`                              |
| `ZonedDateTime` with matching zone IDs  | Use that zone, or an explicit common `timeZone` override |
| `ZonedDateTime` with different zone IDs | Require an explicit common `timeZone`                    |

These rules are specific to calendar comparisons. [Collection selection](./conventions.md#collection-selection) and [interval queries](./conventions.md#interval-queries) order zoned values by exact instant across zones. [Sequences](./conventions.md#interval-sequences) require matching endpoint zones. Parsing, formatting, and ToNow functions describe their own context requirements.

Behaviors: [comparison context](https://github.com/Frantss/temporal-fns/blob/main/test/features/comparisons.feature), [relative context](https://github.com/Frantss/temporal-fns/blob/main/test/features/relative-descriptions.feature), [business-day context](https://github.com/Frantss/temporal-fns/blob/main/test/features/business-days.feature#L147).

## Types and options

See [exported types and options](./types.md) for value unions, result tuples, intervals, and option interfaces.

## Behavior specifications

The links on each function lead to the source Gherkin scenarios under [test/features](https://github.com/Frantss/temporal-fns/tree/main/test/features). Stable case IDs identify each rule; scenario outlines contain the full set of examples. See the [development instructions](https://github.com/Frantss/temporal-fns/blob/main/README.md#development) to run them.
