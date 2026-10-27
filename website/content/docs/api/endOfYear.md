---
title: 'endOfYear'
---

[API index](./index.md) · [Input types and conventions](./conventions.md#period-boundaries) · [Installation](/docs#install)

`endOfYear(value) → same kind`

Find December 31, or its final nanosecond, in the containing year. For `PlainYearMonth`, return December.

```ts
import { endOfYear } from '@helpy/temporal-fns';

endOfYear(Temporal.PlainDate.from('2024-02-29')).toString(); // => '2024-12-31'
endOfYear(Temporal.PlainYearMonth.from('2026-01')).toString(); // => '2026-12'
endOfYear(Temporal.PlainDateTime.from('2026-10-23T14:30')).toString(); // => '2026-12-31T23:59:59.999999999'
```

Related: [startOfYear](./startOfYear.md), [isSameYear](./isSameYear.md), [endOfQuarter](./endOfQuarter.md).

Behaviors: [BND-001: Plain date boundaries return complete dates](https://github.com/Frantss/temporal-fns/blob/main/test/features/boundaries.feature#L5); [BND-002: Plain date-time boundaries retain nanosecond endpoint precision](https://github.com/Frantss/temporal-fns/blob/main/test/features/boundaries.feature#L23); [BND-005: Year-month boundaries return months rather than invent days](https://github.com/Frantss/temporal-fns/blob/main/test/features/boundaries.feature#L72); [BND-013: Unavailable required boundaries are rejected rather than clipped](https://github.com/Frantss/temporal-fns/blob/main/test/features/boundaries.feature#L155).
