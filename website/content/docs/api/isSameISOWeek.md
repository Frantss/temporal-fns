---
title: 'isSameISOWeek'
---

[API index](./index.md) · [Input types and conventions](./conventions.md#calendar-period-comparisons) · [Installation](/docs#install)

`isSameISOWeek(value, base, options?) → boolean`

Check whether two values share the same Monday-based ISO week. Matching week numbers from different week-years do not imply equality. Only applicable zone context is accepted as an option.

```ts
import { isSameISOWeek } from '@helpy/temporal-fns';

isSameISOWeek(Temporal.PlainDate.from('2026-10-19'), Temporal.PlainDate.from('2026-10-25')); // => true
isSameISOWeek(Temporal.PlainDate.from('2026-10-18'), Temporal.PlainDate.from('2026-10-19')); // => false
isSameISOWeek(Temporal.PlainDate.from('2025-01-01'), Temporal.PlainDate.from('2026-01-01')); // => false
```

Related: [isSameWeek](./isSameWeek.md), [startOfISOWeek](./startOfISOWeek.md), [getWeekYear](./getWeekYear.md).

Behaviors: [CMP-001: Period equality checks the period and its year](https://github.com/Frantss/temporal-fns/blob/main/test/features/comparisons.feature#L5); [CMP-003: Week equality crosses a calendar-year boundary](https://github.com/Frantss/temporal-fns/blob/main/test/features/comparisons.feature#L41); [CMP-004: Equal week numbers in different years do not imply equal weeks](https://github.com/Frantss/temporal-fns/blob/main/test/features/comparisons.feature#L51).
