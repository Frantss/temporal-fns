---
title: 'eachMinuteOfInterval'
---

[API index](./index.md) · [Input types and conventions](./conventions.md#interval-sequences) · [Installation](/docs#install)

`eachMinuteOfInterval(interval, options?) → same-kind array`

Enumerate minute starts for `PlainTime`, `PlainDateTime`, or `ZonedDateTime` endpoints. Supports `step`. Floor the first value to a minute. Zoned steps use elapsed minutes and preserve both sides of a fold; clock-only values never wrap into another day.

```ts
import { eachMinuteOfInterval } from '@frantss/temporal-fns';

eachMinuteOfInterval({
  start: Temporal.PlainTime.from('23:57:30'),
  end: Temporal.PlainTime.from('23:59:59'),
}).map((value) => value.toString()); // => ['23:57:00', '23:58:00', '23:59:00']
eachMinuteOfInterval(
  {
    start: Temporal.PlainTime.from('12:00:59'),
    end: Temporal.PlainTime.from('12:03'),
  },
  { step: 2 },
).map((value) => value.toString()); // => ['12:00:00', '12:02:00']
eachMinuteOfInterval({
  start: Temporal.ZonedDateTime.from('2026-11-01T01:59:30-04:00[America/New_York]'),
  end: Temporal.ZonedDateTime.from('2026-11-01T01:01:10-05:00[America/New_York]'),
}).map((value) => [value.minute, value.offset]); // => [[59, '-04:00'], [0, '-05:00'], [1, '-05:00']]
```

Related: [eachHourOfInterval](./eachHourOfInterval.md), [eachDayOfInterval](./eachDayOfInterval.md), [isWithinInterval](./isWithinInterval.md).

Behaviors: [SEQ-007: Hour and minute sequences floor the first value](https://github.com/Frantss/temporal-fns/blob/main/test/features/sequences.feature#L68); [SEQ-008: Clock-only sequences stop before midnight wrapping even for oversized steps](https://github.com/Frantss/temporal-fns/blob/main/test/features/sequences.feature#L80); [SEQ-009: Date-time clock sequences can cross midnight](https://github.com/Frantss/temporal-fns/blob/main/test/features/sequences.feature#L92); [SEQ-012: Zoned minute steps retain both sides of a fold](https://github.com/Frantss/temporal-fns/blob/main/test/features/sequences.feature#L117); [SEQ-025: Safe positive steps can exceed the remaining interval](https://github.com/Frantss/temporal-fns/blob/main/test/features/sequences.feature#L244).
