---
title: 'getWeeksInMonth'
---

[API index](./index.md) · [Input types and conventions](./conventions.md#weekday-navigation-and-calendar-queries) · [Installation](/docs#install)

`getWeeksInMonth(value, options?) → number`

Count the week rows that intersect the represented month. Accepts calendar values and `PlainYearMonth` with optional `weekStartsOn`. This is a grid row count, not a count of full weeks; it also works for partial months at Temporal's range limits.

```ts
import { getWeeksInMonth } from '@frantss/temporal-fns';

getWeeksInMonth(Temporal.PlainYearMonth.from('2026-02')); // => 4
getWeeksInMonth(Temporal.PlainYearMonth.from('2026-05')); // => 6
getWeeksInMonth(Temporal.PlainYearMonth.from('2026-05'), { weekStartsOn: 1 }); // => 5
getWeeksInMonth(Temporal.PlainYearMonth.from('-271821-04')); // => 5
```

Related: [getWeekOfMonth](./getWeekOfMonth.md), [eachWeekOfInterval](./eachWeekOfInterval.md), [startOfMonth](./startOfMonth.md).

Behaviors: [CAL-009: Month grid size needs a year and month but does not need a day](https://github.com/Frantss/temporal-fns/blob/main/test/features/calendar-queries.feature#L113); [CAL-013: Every week-grid query validates its weekday boundary](https://github.com/Frantss/temporal-fns/blob/main/test/features/calendar-queries.feature#L155); [CAL-014: Month grids at the limits do not invent a required reference day](https://github.com/Frantss/temporal-fns/blob/main/test/features/calendar-queries.feature#L171).
