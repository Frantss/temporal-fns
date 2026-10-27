---
title: 'differenceInBusinessDays'
---

[API index](./index.md) · [Input types and conventions](./conventions.md#business-days) · [Installation](/docs#install)

`differenceInBusinessDays(value, base, options?) → number`

Count working dates in the lower-inclusive, upper-exclusive calendar-date range. Return a negative count when `value` precedes `base`, and positive zero when none count. Clocks are ignored. This endpoint convention differs from business-day addition, so the functions are not always inverses for weekend endpoints.

Inputs must have the same kind. Zoned pairs use [calendar comparison zones](./index.md#calendar-comparison-zones), including an optional common `timeZone`. Plain inputs reject zone context. Skipped zoned dates are not counted.

```ts
import { differenceInBusinessDays } from '@frantss/temporal-fns';

const friday = Temporal.PlainDate.from('2026-10-23');
const monday = Temporal.PlainDate.from('2026-10-26');
differenceInBusinessDays(monday, friday); // => 1
differenceInBusinessDays(friday, monday); // => -1
differenceInBusinessDays(Temporal.PlainDate.from('2026-10-25'), friday); // => 1
differenceInBusinessDays(Temporal.PlainDate.from('2026-10-25'), friday, {
  weekendDays: [],
}); // => 2
differenceInBusinessDays(
  Temporal.PlainDateTime.from('2026-10-26T00:00'),
  Temporal.PlainDateTime.from('2026-10-23T23:59'),
); // => 1
```

Related: [addBusinessDays](./addBusinessDays.md), [subBusinessDays](./subBusinessDays.md), [isBusinessDay](./isBusinessDay.md).

Behaviors: [BUS-005: Business differences count the lower-inclusive upper-exclusive date range](https://github.com/Frantss/temporal-fns/blob/main/test/features/business-days.feature#L61); [BUS-006: Business differences ignore clock fields](https://github.com/Frantss/temporal-fns/blob/main/test/features/business-days.feature#L77); [BUS-010: Zoned differences exclude skipped working dates](https://github.com/Frantss/temporal-fns/blob/main/test/features/business-days.feature#L109); [BUS-013: Different zoned differences require an explicit comparison zone](https://github.com/Frantss/temporal-fns/blob/main/test/features/business-days.feature#L147).
