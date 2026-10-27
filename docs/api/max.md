# max

[API index](README.md) · [Input types and conventions](conventions.md#collection-selection) · [Installation](../../README.md#install)

`max(values) → input kind | undefined`

Select the latest value. Equal maxima retain the first original object.

```ts
import { max } from '@helpy/temporal-fns';

const early = Temporal.PlainYearMonth.from('2026-10');
const late = Temporal.PlainYearMonth.from('2027-01');
max([late, early]) === late; // => true
max([late, Temporal.PlainYearMonth.from('2027-01')]) === late; // => true
max([]); // => undefined
```

Related: [min](min.md), [closestTo](closestTo.md), [clamp](clamp.md).

Behaviors: [SEL-001: Minima and maxima preserve the selected object](../../test/features/collections.feature#L5); [SEL-003: Empty collections return undefined](../../test/features/collections.feature#L41); [SEL-004: Equal extrema keep the first occurrence](../../test/features/collections.feature#L53); [SEL-005: Exact time, rather than displayed local order, orders zoned values](../../test/features/collections.feature#L63).
