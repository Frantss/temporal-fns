# endOfISOWeek

[API index](README.md) · [Input types and conventions](conventions.md#period-boundaries) · [Installation](../../README.md#install)

`endOfISOWeek(value) → same kind`

Find Sunday, or its final nanosecond, at the end of the containing ISO week.

```ts
import { endOfISOWeek } from '@helpy/temporal-fns';

endOfISOWeek(Temporal.PlainDate.from('2026-10-23')).toString(); // => '2026-10-25'
endOfISOWeek(Temporal.PlainDate.from('2025-12-31')).toString(); // => '2026-01-04'
endOfISOWeek(Temporal.PlainDateTime.from('2026-10-23T14:30')).toString(); // => '2026-10-25T23:59:59.999999999'
```

Related: [startOfISOWeek](startOfISOWeek.md), [endOfWeek](endOfWeek.md), [isSameISOWeek](isSameISOWeek.md).

Behaviors: [BND-001: Plain date boundaries return complete dates](../../test/features/boundaries.feature#L5); [BND-002: Plain date-time boundaries retain nanosecond endpoint precision](../../test/features/boundaries.feature#L23); [BND-015: Every zoned boundary returns the local period boundary in the original zone](../../test/features/boundaries.feature#L177); [BND-004: Month and quarter ends follow leap years and year boundaries](../../test/features/boundaries.feature#L54); [BND-016: An available final week boundary is returned exactly at the date limit](../../test/features/boundaries.feature#L196).
