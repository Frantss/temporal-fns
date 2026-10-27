---
title: 'min'
---

[API index](./index.md) · [Input types and conventions](./conventions.md#collection-selection) · [Installation](/docs#install)

`min(values) → input kind | undefined`

Select the earliest value. Equal minima retain the first original object.

```ts
import { min } from '@helpy/temporal-fns';

const early = Temporal.PlainDate.from('2026-10-22');
const late = Temporal.PlainDate.from('2026-10-23');
min([late, early]) === early; // => true
min([early, Temporal.PlainDate.from('2026-10-22')]) === early; // => true
min([]); // => undefined
```

Related: [max](./max.md), [closestTo](./closestTo.md), [clamp](./clamp.md).

Behaviors: [SEL-001: Minima and maxima preserve the selected object](https://github.com/Frantss/temporal-fns/blob/main/test/features/collections.feature#L5); [SEL-003: Empty collections return undefined](https://github.com/Frantss/temporal-fns/blob/main/test/features/collections.feature#L41); [SEL-004: Equal extrema keep the first occurrence](https://github.com/Frantss/temporal-fns/blob/main/test/features/collections.feature#L53); [SEL-005: Exact time, rather than displayed local order, orders zoned values](https://github.com/Frantss/temporal-fns/blob/main/test/features/collections.feature#L63).
