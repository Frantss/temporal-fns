# isSameMonth

[API index](README.md) · [Input types and conventions](conventions.md#calendar-period-comparisons) · [Installation](../../README.md#install)

`isSameMonth(value, base, options?) → boolean`

Check whether the year and month match. `PlainYearMonth` input remains month-only; hidden reference days do not affect equality.

```ts
import { isSameMonth } from '@helpy/temporal-fns';

isSameMonth(Temporal.PlainDate.from('2026-10-01'), Temporal.PlainDate.from('2026-10-31')); // => true
isSameMonth(Temporal.PlainYearMonth.from('2026-10'), Temporal.PlainYearMonth.from('2026-11')); // => false
isSameMonth(Temporal.PlainYearMonth.from('2025-10'), Temporal.PlainYearMonth.from('2026-10')); // => false
```

Related: [isSameQuarter](isSameQuarter.md), [startOfMonth](startOfMonth.md), [eachMonthOfInterval](eachMonthOfInterval.md).

Behaviors: [CMP-001: Period equality checks the period and its year](../../test/features/comparisons.feature#L5); [CMP-002: Plain date-time comparisons ignore clocks](../../test/features/comparisons.feature#L27); [CMP-006: Partial months compare only at their supported precision](../../test/features/comparisons.feature#L97).
