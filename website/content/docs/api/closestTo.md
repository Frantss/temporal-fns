---
title: 'closestTo'
---

[API index](./index.md) · [Input types and conventions](./conventions.md#collection-selection) · [Installation](/docs#install)

`closestTo(target, values) → input kind | undefined`

Select the value at the smallest absolute distance from `target`. Target and candidates must share a supported kind, even when another candidate already matches exactly. Ties retain the first candidate.

```ts
import { closestTo } from '@helpy/temporal-fns';

const target = Temporal.PlainTime.from('12:00');
const first = Temporal.PlainTime.from('11:00');
const second = Temporal.PlainTime.from('13:00');
closestTo(target, [first, second]) === first; // => true
closestTo(target, []); // => undefined
closestTo(Temporal.PlainTime.from('23:59'), [
  Temporal.PlainTime.from('00:00'),
  Temporal.PlainTime.from('22:00'),
])?.toString(); // => '22:00:00'
```

Related: [closestIndexTo](./closestIndexTo.md), [min](./min.md), [max](./max.md).

Behaviors: [SEL-002: Closest selection uses the first occurrence in a distance tie](https://github.com/Frantss/temporal-fns/blob/main/test/features/collections.feature#L23); [SEL-003: Empty collections return undefined](https://github.com/Frantss/temporal-fns/blob/main/test/features/collections.feature#L41); [SEL-006: Closest exact instants retain nanosecond differences](https://github.com/Frantss/temporal-fns/blob/main/test/features/collections.feature#L73); [SEL-007: Clock distance is linear and never wraps across midnight](https://github.com/Frantss/temporal-fns/blob/main/test/features/collections.feature#L83); [SEL-009: Plain date-time distance is wall-clock distance](https://github.com/Frantss/temporal-fns/blob/main/test/features/collections.feature#L95); [SEL-010: Mixed kinds are rejected throughout a collection](https://github.com/Frantss/temporal-fns/blob/main/test/features/collections.feature#L103).
