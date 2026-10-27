# eachWeekOfInterval

[API index](README.md) · [Input types and conventions](conventions.md#interval-sequences) · [Installation](../../README.md#install)

`eachWeekOfInterval(interval, options?) → same-kind array`

Enumerate starts of containing weeks for `PlainDate`, `PlainDateTime`, or `ZonedDateTime` endpoints. Supports `step` and `weekStartsOn` (default Sunday, `0`). Zoned steps follow local calendar weeks across offset changes.

```ts
import { eachWeekOfInterval } from '@helpy/temporal-fns';

const interval = {
  start: Temporal.PlainDate.from('2026-10-23'),
  end: Temporal.PlainDate.from('2026-10-27'),
};
eachWeekOfInterval(interval).map((value) => value.toString()); // => ['2026-10-18', '2026-10-25']
eachWeekOfInterval(interval, { weekStartsOn: 1 }).map((value) => value.toString()); // => ['2026-10-19', '2026-10-26']
eachWeekOfInterval(interval, { weekStartsOn: 1, step: 2 }).map((value) => value.toString()); // => ['2026-10-19']
```

Related: [startOfWeek](startOfWeek.md), [eachDayOfInterval](eachDayOfInterval.md), [getWeeksInMonth](getWeeksInMonth.md).

Behaviors: [SEQ-003: Week sequences enumerate containing weeks with the selected start](../../test/features/sequences.feature#L24); [SEQ-018: Zoned sequences require matching endpoint zones](../../test/features/sequences.feature#L182); [SEQ-021: Sequence configuration shares the week and weekend constraints](../../test/features/sequences.feature#L209); [SEQ-022: A missing first containing period is not silently clipped](../../test/features/sequences.feature#L221); [SEQ-028: Zoned week and month sequences advance by local calendar units across a fold](../../test/features/sequences.feature#L275).
