# isSameYear

[API index](README.md) · [Input types and conventions](conventions.md#calendar-period-comparisons) · [Installation](../../README.md#install)

`isSameYear(value, base, options?) → boolean`

Check whether the represented calendar year matches. Also accepts `PlainYearMonth`.

```ts
import { isSameYear } from '@helpy/temporal-fns';

isSameYear(Temporal.PlainDate.from('2026-01-01'), Temporal.PlainDate.from('2026-12-31')); // => true
isSameYear(Temporal.PlainYearMonth.from('2026-01'), Temporal.PlainYearMonth.from('2026-12')); // => true
isSameYear(Temporal.PlainDate.from('2025-12-31'), Temporal.PlainDate.from('2026-01-01')); // => false
```

Related: [startOfYear](startOfYear.md), [endOfYear](endOfYear.md), [isSameQuarter](isSameQuarter.md).

Behaviors: [CMP-001: Period equality checks the period and its year](../../test/features/comparisons.feature#L5); [CMP-002: Plain date-time comparisons ignore clocks](../../test/features/comparisons.feature#L27); [CMP-006: Partial months compare only at their supported precision](../../test/features/comparisons.feature#L97); [CMP-008: Different zoned inputs require a common viewing zone](../../test/features/comparisons.feature#L121).
