# isWithinInterval

[API index](README.md) · [Input types and conventions](conventions.md#interval-queries) · [Installation](../../README.md#install)

`isWithinInterval(value, interval) → boolean`

Check membership in a closed interval, including both endpoints. Equal endpoints form a valid point interval.

```ts
import { isWithinInterval } from '@helpy/temporal-fns';

const interval = {
  start: Temporal.PlainTime.from('10:00'),
  end: Temporal.PlainTime.from('12:00'),
};
isWithinInterval(Temporal.PlainTime.from('10:00'), interval); // => true
isWithinInterval(Temporal.PlainTime.from('12:00'), interval); // => true
isWithinInterval(Temporal.PlainTime.from('12:00:00.000000001'), interval); // => false
const month = Temporal.PlainYearMonth.from('2026-10');
isWithinInterval(month, { start: month, end: month }); // => true
```

Related: [clamp](clamp.md), [areIntervalsOverlapping](areIntervalsOverlapping.md), [eachDayOfInterval](eachDayOfInterval.md).

Behaviors: [INT-001: Membership includes both endpoints](../../test/features/intervals.feature#L5); [INT-006: Point membership and clamping still use closed endpoints](../../test/features/intervals.feature#L80); [INT-008: Month-only intervals use inclusive month endpoints](../../test/features/intervals.feature#L102); [INT-009: Zoned interval membership compares exact instants across different zones](../../test/features/intervals.feature#L115); [INT-007: Reversed intervals are invalid for every interval query](../../test/features/intervals.feature#L89).
