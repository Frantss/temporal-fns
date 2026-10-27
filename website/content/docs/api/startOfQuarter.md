---
title: 'startOfQuarter'
---

[API index](./index.md) · [Input types and conventions](./conventions.md#period-boundaries) · [Installation](/docs#install)

`startOfQuarter(value) → same kind`

Find the first date of the containing ISO quarter (January, April, July, or October). Also accepts `PlainYearMonth` and returns its quarter's first month without adding day precision.

```ts
import { startOfQuarter } from '@frantss/temporal-fns';

startOfQuarter(Temporal.PlainDate.from('2026-05-17')).toString(); // => '2026-04-01'
startOfQuarter(Temporal.PlainYearMonth.from('2026-12')).toString(); // => '2026-10'
startOfQuarter(Temporal.PlainDateTime.from('2026-12-31T23:59')).toString(); // => '2026-10-01T00:00:00'
```

Related: [endOfQuarter](./endOfQuarter.md), [getQuarter](./getQuarter.md), [isSameQuarter](./isSameQuarter.md).

Behaviors: [BND-001: Plain date boundaries return complete dates](https://github.com/Frantss/temporal-fns/blob/main/test/features/boundaries.feature#L5); [BND-002: Plain date-time boundaries retain nanosecond endpoint precision](https://github.com/Frantss/temporal-fns/blob/main/test/features/boundaries.feature#L23); [BND-005: Year-month boundaries return months rather than invent days](https://github.com/Frantss/temporal-fns/blob/main/test/features/boundaries.feature#L72).
