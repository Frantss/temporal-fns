# startOfYear

[API index](README.md) · [Input types and conventions](conventions.md#period-boundaries) · [Installation](../../README.md#install)

`startOfYear(value) → same kind`

Find January 1 of the containing year. Also accepts `PlainYearMonth` and returns January of that year.

```ts
import { startOfYear } from '@helpy/temporal-fns';

startOfYear(Temporal.PlainDate.from('2024-02-29')).toString(); // => '2024-01-01'
startOfYear(Temporal.PlainYearMonth.from('2026-10')).toString(); // => '2026-01'
startOfYear(Temporal.PlainDateTime.from('2026-10-23T14:30')).toString(); // => '2026-01-01T00:00:00'
```

Related: [endOfYear](endOfYear.md), [isSameYear](isSameYear.md), [startOfQuarter](startOfQuarter.md).

Behaviors: [BND-001: Plain date boundaries return complete dates](../../test/features/boundaries.feature#L5); [BND-002: Plain date-time boundaries retain nanosecond endpoint precision](../../test/features/boundaries.feature#L23); [BND-005: Year-month boundaries return months rather than invent days](../../test/features/boundaries.feature#L72).
