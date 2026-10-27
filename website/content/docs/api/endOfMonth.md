---
title: 'endOfMonth'
---

[API index](./index.md) · [Input types and conventions](./conventions.md#period-boundaries) · [Installation](/docs#install)

`endOfMonth(value) → same kind`

Find the last date or final nanosecond of the containing month, including leap-day rules. Does not accept `PlainYearMonth`.

```ts
import { endOfMonth } from '@helpy/temporal-fns';

endOfMonth(Temporal.PlainDate.from('2024-02-01')).toString(); // => '2024-02-29'
endOfMonth(Temporal.PlainDate.from('2025-02-01')).toString(); // => '2025-02-28'
endOfMonth(Temporal.PlainDateTime.from('2026-10-23T14:30')).toString(); // => '2026-10-31T23:59:59.999999999'
```

Related: [startOfMonth](./startOfMonth.md), [eachMonthOfInterval](./eachMonthOfInterval.md), [endOfQuarter](./endOfQuarter.md).

Behaviors: [BND-001: Plain date boundaries return complete dates](https://github.com/Frantss/temporal-fns/blob/main/test/features/boundaries.feature#L5); [BND-002: Plain date-time boundaries retain nanosecond endpoint precision](https://github.com/Frantss/temporal-fns/blob/main/test/features/boundaries.feature#L23); [BND-004: Month and quarter ends follow leap years and year boundaries](https://github.com/Frantss/temporal-fns/blob/main/test/features/boundaries.feature#L54); [BND-010: Representable date ends do not require a representable period start](https://github.com/Frantss/temporal-fns/blob/main/test/features/boundaries.feature#L124).
