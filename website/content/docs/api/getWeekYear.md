---
title: 'getWeekYear'
---

[API index](./index.md) · [Input types and conventions](./conventions.md#weekday-navigation-and-calendar-queries) · [Installation](/docs#install)

`getWeekYear(value, options?) → number`

Return the year that owns the selected week. This may differ from `value.year` near New Year. Use the same `weekStartsOn` and `firstWeekContainsDate` options as [getWeek](./getWeek.md).

```ts
import { getWeekYear } from '@frantss/temporal-fns';

getWeekYear(Temporal.PlainDate.from('2025-12-31')); // => 2026
getWeekYear(Temporal.PlainDate.from('2021-01-01'), {
  weekStartsOn: 1,
  firstWeekContainsDate: 4,
}); // => 2020
getWeekYear(Temporal.PlainDate.from('2026-01-01'), {
  firstWeekContainsDate: 7,
}); // => 2025
```

Related: [getWeek](./getWeek.md), [isSameISOWeek](./isSameISOWeek.md), [startOfYear](./startOfYear.md).

Behaviors: [CAL-006: Week numbers and their week-years are a pair](https://github.com/Frantss/temporal-fns/blob/main/test/features/calendar-queries.feature#L65); [CAL-007: Every week-start and first-week anchor combination follows the containing week rule](https://github.com/Frantss/temporal-fns/blob/main/test/features/calendar-queries.feature#L81); [CAL-010: First-week anchors are dates from 1 through 7](https://github.com/Frantss/temporal-fns/blob/main/test/features/calendar-queries.feature#L126); [CAL-011: Calendar queries use a zoned value's local calendar fields](https://github.com/Frantss/temporal-fns/blob/main/test/features/calendar-queries.feature#L138).
