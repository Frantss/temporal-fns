# startOfMonth

[API index](README.md) · [Input types and conventions](conventions.md#period-boundaries) · [Installation](../../README.md#install)

`startOfMonth(value) → same kind`

Find the first date of the containing month. `PlainYearMonth` is not accepted because it already represents a whole month.

```ts
import { startOfMonth } from '@helpy/temporal-fns';

startOfMonth(Temporal.PlainDate.from('2024-02-29')).toString(); // => '2024-02-01'
startOfMonth(Temporal.PlainDateTime.from('2026-10-23T14:30')).toString(); // => '2026-10-01T00:00:00'
startOfMonth(Temporal.PlainDate.from('-271821-04-19')); // throws RangeError
```

Related: [endOfMonth](endOfMonth.md), [eachMonthOfInterval](eachMonthOfInterval.md), [isSameMonth](isSameMonth.md).

Behaviors: [BND-001: Plain date boundaries return complete dates](../../test/features/boundaries.feature#L5); [BND-002: Plain date-time boundaries retain nanosecond endpoint precision](../../test/features/boundaries.feature#L23); [BND-013: Unavailable required boundaries are rejected rather than clipped](../../test/features/boundaries.feature#L155).
