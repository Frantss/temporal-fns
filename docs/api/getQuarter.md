# getQuarter

[API index](README.md) · [Input types and conventions](conventions.md#weekday-navigation-and-calendar-queries) · [Installation](../../README.md#install)

`getQuarter(value) → 1 | 2 | 3 | 4`

Return the ISO quarter of the represented month. Accepts calendar values, `PlainYearMonth`, and `PlainMonthDay`. Quarters start in January, April, July, and October.

```ts
import { getQuarter } from '@helpy/temporal-fns';

getQuarter(Temporal.PlainDate.from('2026-03-31')); // => 1
getQuarter(Temporal.PlainYearMonth.from('2026-04')); // => 2
getQuarter(Temporal.PlainMonthDay.from('07-01')); // => 3
getQuarter(Temporal.PlainYearMonth.from('2026-12')); // => 4
```

Related: [startOfQuarter](startOfQuarter.md), [endOfQuarter](endOfQuarter.md), [isSameQuarter](isSameQuarter.md).

Behaviors: [CAL-005: Quarters are determined by the represented ISO month](../../test/features/calendar-queries.feature#L49); [CAL-011: Calendar queries use a zoned value's local calendar fields](../../test/features/calendar-queries.feature#L138).
