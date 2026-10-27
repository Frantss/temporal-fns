---
title: 'getWeek'
---

[API index](./index.md) · [Input types and conventions](./conventions.md#weekday-navigation-and-calendar-queries) · [Installation](/docs#install)

`getWeek(value, options?) → number`

Return the 1-based week number within the week-year selected by `weekStartsOn` and `firstWeekContainsDate`. Week 1 contains January's `firstWeekContainsDate`. Use both options `{ weekStartsOn: 1, firstWeekContainsDate: 4 }` for ISO numbering.

```ts
import { getWeek } from '@helpy/temporal-fns';

getWeek(Temporal.PlainDate.from('2025-12-31')); // => 1
getWeek(Temporal.PlainDate.from('2026-01-04')); // => 2
getWeek(Temporal.PlainDate.from('2021-01-01'), {
  weekStartsOn: 1,
  firstWeekContainsDate: 4,
}); // => 53
```

Related: [getWeekYear](./getWeekYear.md), [getWeekOfMonth](./getWeekOfMonth.md), [isSameWeek](./isSameWeek.md).

Behaviors: [CAL-006: Week numbers and their week-years are a pair](https://github.com/Frantss/temporal-fns/blob/main/test/features/calendar-queries.feature#L65); [CAL-007: Every week-start and first-week anchor combination follows the containing week rule](https://github.com/Frantss/temporal-fns/blob/main/test/features/calendar-queries.feature#L81); [CAL-010: First-week anchors are dates from 1 through 7](https://github.com/Frantss/temporal-fns/blob/main/test/features/calendar-queries.feature#L126); [CAL-013: Every week-grid query validates its weekday boundary](https://github.com/Frantss/temporal-fns/blob/main/test/features/calendar-queries.feature#L155).
