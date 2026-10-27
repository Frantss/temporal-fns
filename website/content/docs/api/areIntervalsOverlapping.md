---
title: 'areIntervalsOverlapping'
---

[API index](./index.md) · [Input types and conventions](./conventions.md#interval-queries) · [Installation](/docs#install)

`areIntervalsOverlapping(first, second, options?) → boolean`

Check whether intervals overlap. `inclusive` defaults to `false`, so touching endpoints alone do not count. Set `inclusive: true` to count them.

A point interval strictly inside another interval overlaps by default. A point at an endpoint, or two equal point intervals, requires `inclusive: true`. The result is symmetric.

```ts
import { areIntervalsOverlapping } from '@frantss/temporal-fns';

const first = {
  start: Temporal.PlainTime.from('10:00'),
  end: Temporal.PlainTime.from('12:00'),
};
const touching = {
  start: Temporal.PlainTime.from('12:00'),
  end: Temporal.PlainTime.from('13:00'),
};
areIntervalsOverlapping(first, touching); // => false
areIntervalsOverlapping(first, touching, { inclusive: true }); // => true
const point = Temporal.PlainTime.from('11:00');
areIntervalsOverlapping(first, { start: point, end: point }); // => true
areIntervalsOverlapping({ start: point, end: point }, { start: point, end: point }); // => false
```

Related: [isWithinInterval](./isWithinInterval.md), [clamp](./clamp.md), [isSameDay](./isSameDay.md).

Behaviors: [INT-003: Overlap distinguishes disjoint, contained and touching intervals](https://github.com/Frantss/temporal-fns/blob/main/test/features/intervals.feature#L32); [INT-004: Point intervals overlap only when strictly inside or explicitly included](https://github.com/Frantss/temporal-fns/blob/main/test/features/intervals.feature#L52); [INT-005: Two equal point intervals meet at an endpoint](https://github.com/Frantss/temporal-fns/blob/main/test/features/intervals.feature#L70); [INT-007: Reversed intervals are invalid for every interval query](https://github.com/Frantss/temporal-fns/blob/main/test/features/intervals.feature#L89); [INT-011: Inclusion is a boolean option](https://github.com/Frantss/temporal-fns/blob/main/test/features/intervals.feature#L135).
