---
title: 'closestIndexTo'
---

[API index](./index.md) · [Input types and conventions](./conventions.md#collection-selection) · [Installation](/docs#install)

`closestIndexTo(target, values) → number | undefined`

Return the zero-based index selected by [closestTo](./closestTo.md), or `undefined` for an empty array. Tied distances choose the first index.

```ts
import { closestIndexTo } from '@helpy/temporal-fns';

const target = Temporal.PlainYearMonth.from('2026-11');
closestIndexTo(target, [
  Temporal.PlainYearMonth.from('2026-10'),
  Temporal.PlainYearMonth.from('2026-12'),
]); // => 0
closestIndexTo(target, [
  Temporal.PlainYearMonth.from('2026-01'),
  Temporal.PlainYearMonth.from('2026-11'),
]); // => 1
closestIndexTo(target, []); // => undefined
```

Related: [closestTo](./closestTo.md), [min](./min.md), [max](./max.md).

Behaviors: [SEL-002: Closest selection uses the first occurrence in a distance tie](https://github.com/Frantss/temporal-fns/blob/main/test/features/collections.feature#L23); [SEL-003: Empty collections return undefined](https://github.com/Frantss/temporal-fns/blob/main/test/features/collections.feature#L41); [SEL-010: Mixed kinds are rejected throughout a collection](https://github.com/Frantss/temporal-fns/blob/main/test/features/collections.feature#L103); [SEL-006: Closest exact instants retain nanosecond differences](https://github.com/Frantss/temporal-fns/blob/main/test/features/collections.feature#L73).
