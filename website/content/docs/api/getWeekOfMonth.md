---
title: 'getWeekOfMonth'
---

[API index](./index.md) · [Input types and conventions](./conventions.md#weekday-navigation-and-calendar-queries) · [Installation](/docs#install)

`getWeekOfMonth(value, options?) → number`

Return the 1-based row containing the date in a month calendar grid. The first row is the week intersecting the first of the month, even if that week began in the previous month. Accepts `weekStartsOn`; week-year anchor options do not apply.

```ts
import { getWeekOfMonth } from '@helpy/temporal-fns';

getWeekOfMonth(Temporal.PlainDate.from('2026-05-01')); // => 1
getWeekOfMonth(Temporal.PlainDate.from('2026-05-03')); // => 2
getWeekOfMonth(Temporal.PlainDate.from('2026-05-31')); // => 6
getWeekOfMonth(Temporal.PlainDate.from('2026-05-31'), { weekStartsOn: 1 }); // => 5
```

Related: [getWeeksInMonth](./getWeeksInMonth.md), [getWeek](./getWeek.md), [eachWeekOfInterval](./eachWeekOfInterval.md).

Behaviors: [CAL-008: Week-of-month counts intersecting grid rows](https://github.com/Frantss/temporal-fns/blob/main/test/features/calendar-queries.feature#L99); [CAL-013: Every week-grid query validates its weekday boundary](https://github.com/Frantss/temporal-fns/blob/main/test/features/calendar-queries.feature#L155).
