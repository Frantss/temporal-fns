# isWeekend

[API index](README.md) · [Input types and conventions](conventions.md#business-days) · [Installation](../../README.md#install)

`isWeekend(value, options?) → boolean`

Check whether the value's own local date has a weekday listed in `weekendDays`. Does not accept a viewing zone; convert a zoned value first if needed.

```ts
import { isWeekend } from '@helpy/temporal-fns';

isWeekend(Temporal.PlainDate.from('2026-10-24')); // => true
isWeekend(Temporal.PlainDate.from('2026-10-23')); // => false
isWeekend(Temporal.PlainDate.from('2026-10-23'), { weekendDays: [5, 6] }); // => true
isWeekend(Temporal.PlainDate.from('2026-10-24'), { weekendDays: [] }); // => false
```

Related: [isBusinessDay](isBusinessDay.md), [eachWeekendOfInterval](eachWeekendOfInterval.md), [addBusinessDays](addBusinessDays.md).

Behaviors: [BUS-004: Weekend and business predicates are exact inverses](../../test/features/business-days.feature#L46); [BUS-016: Weekend predicates use the value's own local date](../../test/features/business-days.feature#L173); [BUS-017: All weekend consumers validate a configuration with no working day](../../test/features/business-days.feature#L183).
