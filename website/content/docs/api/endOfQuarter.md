---
title: 'endOfQuarter'
---

[API index](./index.md) · [Input types and conventions](./conventions.md#period-boundaries) · [Installation](/docs#install)

`endOfQuarter(value) → same kind`

Find the last date or final nanosecond of the containing quarter. For `PlainYearMonth`, return its quarter's last month.

```ts
import { endOfQuarter } from '@helpy/temporal-fns';

endOfQuarter(Temporal.PlainDate.from('2024-02-29')).toString(); // => '2024-03-31'
endOfQuarter(Temporal.PlainYearMonth.from('2026-10')).toString(); // => '2026-12'
endOfQuarter(Temporal.PlainDateTime.from('2026-05-17T14:30')).toString(); // => '2026-06-30T23:59:59.999999999'
```

Related: [startOfQuarter](./startOfQuarter.md), [getQuarter](./getQuarter.md), [endOfYear](./endOfYear.md).

Behaviors: [BND-001: Plain date boundaries return complete dates](https://github.com/Frantss/temporal-fns/blob/main/test/features/boundaries.feature#L5); [BND-002: Plain date-time boundaries retain nanosecond endpoint precision](https://github.com/Frantss/temporal-fns/blob/main/test/features/boundaries.feature#L23); [BND-004: Month and quarter ends follow leap years and year boundaries](https://github.com/Frantss/temporal-fns/blob/main/test/features/boundaries.feature#L54); [BND-005: Year-month boundaries return months rather than invent days](https://github.com/Frantss/temporal-fns/blob/main/test/features/boundaries.feature#L72).
