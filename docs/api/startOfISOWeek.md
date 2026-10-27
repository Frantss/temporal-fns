# startOfISOWeek

[API index](README.md) · [Input types and conventions](conventions.md#period-boundaries) · [Installation](../../README.md#install)

`startOfISOWeek(value) → same kind`

Find Monday at the start of the containing ISO week. This function has no options; use [startOfWeek](startOfWeek.md) for another weekday.

```ts
import { startOfISOWeek } from '@helpy/temporal-fns';

startOfISOWeek(Temporal.PlainDate.from('2026-10-25')).toString(); // => '2026-10-19'
startOfISOWeek(Temporal.PlainDate.from('2026-01-01')).toString(); // => '2025-12-29'
startOfISOWeek(Temporal.PlainDateTime.from('2026-10-23T14:30')).hour; // => 0
```

Related: [endOfISOWeek](endOfISOWeek.md), [startOfWeek](startOfWeek.md), [isSameISOWeek](isSameISOWeek.md).

Behaviors: [BND-001: Plain date boundaries return complete dates](../../test/features/boundaries.feature#L5); [BND-002: Plain date-time boundaries retain nanosecond endpoint precision](../../test/features/boundaries.feature#L23); [BND-015: Every zoned boundary returns the local period boundary in the original zone](../../test/features/boundaries.feature#L177).
