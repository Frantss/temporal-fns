# isSameQuarter

[API index](README.md) · [Input types and conventions](conventions.md#calendar-period-comparisons) · [Installation](../../README.md#install)

`isSameQuarter(value, base, options?) → boolean`

Check whether values fall in the same three-month ISO quarter of the same year. Accepts `PlainYearMonth`, but not `PlainMonthDay` because equality needs a year.

```ts
import { isSameQuarter } from '@helpy/temporal-fns';

isSameQuarter(Temporal.PlainYearMonth.from('2026-10'), Temporal.PlainYearMonth.from('2026-12')); // => true
isSameQuarter(Temporal.PlainDate.from('2026-09-30'), Temporal.PlainDate.from('2026-10-01')); // => false
isSameQuarter(Temporal.PlainDate.from('2025-10-23'), Temporal.PlainDate.from('2026-10-23')); // => false
```

Related: [getQuarter](getQuarter.md), [startOfQuarter](startOfQuarter.md), [isSameMonth](isSameMonth.md).

Behaviors: [CMP-001: Period equality checks the period and its year](../../test/features/comparisons.feature#L5); [CMP-002: Plain date-time comparisons ignore clocks](../../test/features/comparisons.feature#L27); [CMP-006: Partial months compare only at their supported precision](../../test/features/comparisons.feature#L97).
