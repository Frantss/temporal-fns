# clamp

[API index](README.md) · [Input types and conventions](conventions.md#interval-queries) · [Installation](../../README.md#install)

`clamp(value, interval) → same kind`

Keep `value` inside the closed interval. Return the original start object when below it, the original end object when above it, or the original input when already inside, including equal endpoints.

```ts
import { clamp } from '@helpy/temporal-fns';

const start = Temporal.PlainDate.from('2026-10-02');
const end = Temporal.PlainDate.from('2026-10-04');
const inside = Temporal.PlainDate.from('2026-10-03');
clamp(Temporal.PlainDate.from('2026-10-01'), { start, end }) === start; // => true
clamp(Temporal.PlainDate.from('2026-10-05'), { start, end }) === end; // => true
clamp(inside, { start, end }) === inside; // => true
```

Related: [isWithinInterval](isWithinInterval.md), [min](min.md), [max](max.md).

Behaviors: [INT-002: Clamp returns the input or an original endpoint](../../test/features/intervals.feature#L18); [INT-006: Point membership and clamping still use closed endpoints](../../test/features/intervals.feature#L80); [INT-007: Reversed intervals are invalid for every interval query](../../test/features/intervals.feature#L89); [INT-012: All ordered kinds preserve membership, clamping identity and overlap rules](../../test/features/intervals.feature#L146).
