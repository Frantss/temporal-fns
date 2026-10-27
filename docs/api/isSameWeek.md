# isSameWeek

[API index](README.md) · [Input types and conventions](conventions.md#calendar-period-comparisons) · [Installation](../../README.md#install)

`isSameWeek(value, base, options?) → boolean`

Check whether two values belong to the same containing week, even across a year boundary. `weekStartsOn` defaults to Sunday (`0`). Week numbering options do not apply.

```ts
import { isSameWeek } from '@helpy/temporal-fns';

const a = Temporal.PlainDate.from('2026-10-24');
const b = Temporal.PlainDate.from('2026-10-25');
isSameWeek(a, b); // => false
isSameWeek(a, b, { weekStartsOn: 1 }); // => true
isSameWeek(Temporal.PlainDate.from('2025-12-31'), Temporal.PlainDate.from('2026-01-01')); // => true
```

Related: [isSameISOWeek](isSameISOWeek.md), [startOfWeek](startOfWeek.md), [getWeek](getWeek.md).

Behaviors: [CMP-001: Period equality checks the period and its year](../../test/features/comparisons.feature#L5); [CMP-003: Week equality crosses a calendar-year boundary](../../test/features/comparisons.feature#L41); [CMP-005: Custom week starts change equality at the chosen boundary](../../test/features/comparisons.feature#L58); [CMP-010: Week equality can be decided without constructing an unavailable start](../../test/features/comparisons.feature#L152).
