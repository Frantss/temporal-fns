---
title: 'isBusinessDay'
---

[API index](./index.md) · [Input types and conventions](./conventions.md#business-days) · [Installation](/docs#install)

`isBusinessDay(value, options?) → boolean`

Check whether the value's own local weekday is absent from `weekendDays`. It is the exact inverse of [isWeekend](./isWeekend.md) under the same valid configuration.

```ts
import { isBusinessDay } from '@frantss/temporal-fns';

isBusinessDay(Temporal.PlainDate.from('2026-10-23')); // => true
isBusinessDay(Temporal.PlainDate.from('2026-10-24')); // => false
isBusinessDay(Temporal.PlainDate.from('2026-10-25'), { weekendDays: [5, 6] }); // => true
isBusinessDay(Temporal.PlainDate.from('2026-10-24'), { weekendDays: [] }); // => true
```

Related: [isWeekend](./isWeekend.md), [addBusinessDays](./addBusinessDays.md), [differenceInBusinessDays](./differenceInBusinessDays.md).

Behaviors: [BUS-004: Weekend and business predicates are exact inverses](https://github.com/Frantss/temporal-fns/blob/main/test/features/business-days.feature#L46); [BUS-016: Weekend predicates use the value's own local date](https://github.com/Frantss/temporal-fns/blob/main/test/features/business-days.feature#L173); [BUS-017: All weekend consumers validate a configuration with no working day](https://github.com/Frantss/temporal-fns/blob/main/test/features/business-days.feature#L183).
