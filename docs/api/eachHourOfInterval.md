# eachHourOfInterval

[API index](README.md) · [Input types and conventions](conventions.md#interval-sequences) · [Installation](../../README.md#install)

`eachHourOfInterval(interval, options?) → same-kind array`

Enumerate hour starts for `PlainTime`, `PlainDateTime`, or `ZonedDateTime` endpoints. Supports `step`. The first result floors the start to an hour. Zoned steps use elapsed hours, skipping a spring gap and retaining both occurrences of a repeated hour. PlainTime sequences stop before midnight wrapping; use dated values for overnight intervals.

```ts
import { eachHourOfInterval } from '@helpy/temporal-fns';

eachHourOfInterval(
  {
    start: Temporal.PlainTime.from('21:25'),
    end: Temporal.PlainTime.from('23:59'),
  },
  { step: 2 },
).map((value) => value.toString()); // => ['21:00:00', '23:00:00']
eachHourOfInterval(
  {
    start: Temporal.PlainTime.from('00:00'),
    end: Temporal.PlainTime.from('23:59'),
  },
  { step: 24 },
).map((value) => value.toString()); // => ['00:00:00']
eachHourOfInterval({
  start: Temporal.ZonedDateTime.from('2026-03-08T00:30[America/New_York]'),
  end: Temporal.ZonedDateTime.from('2026-03-08T04:10[America/New_York]'),
}).map((value) => value.hour); // => [0, 1, 3, 4]
```

Related: [eachMinuteOfInterval](eachMinuteOfInterval.md), [eachDayOfInterval](eachDayOfInterval.md), [isWithinInterval](isWithinInterval.md).

Behaviors: [SEQ-007: Hour and minute sequences floor the first value](../../test/features/sequences.feature#L68); [SEQ-008: Clock-only sequences stop before midnight wrapping even for oversized steps](../../test/features/sequences.feature#L80); [SEQ-009: Date-time clock sequences can cross midnight](../../test/features/sequences.feature#L92); [SEQ-010: Zoned hour steps skip a spring gap using elapsed hours](../../test/features/sequences.feature#L102); [SEQ-011: Zoned hour steps retain both occurrences in a fold](../../test/features/sequences.feature#L110).
