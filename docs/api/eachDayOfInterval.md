# eachDayOfInterval

[API index](README.md) · [Input types and conventions](conventions.md#interval-sequences) · [Installation](../../README.md#install)

`eachDayOfInterval(interval, options?) → same-kind array`

Enumerate day starts for `PlainDate`, `PlainDateTime`, or `ZonedDateTime` endpoints. Supports `step`. Zoned days follow local calendar dates, honor skipped midnight, and omit dates that never occurred.

```ts
import { eachDayOfInterval } from '@helpy/temporal-fns';

const interval = {
  start: Temporal.PlainDate.from('2026-10-23'),
  end: Temporal.PlainDate.from('2026-10-27'),
};
eachDayOfInterval(interval, { step: 2 }).map((value) => value.toString()); // => ['2026-10-23', '2026-10-25', '2026-10-27']
eachDayOfInterval(interval, { step: 3 }).map((value) => value.toString()); // => ['2026-10-23', '2026-10-26']
eachDayOfInterval({
  start: Temporal.PlainDateTime.from('2026-10-23T16:30'),
  end: Temporal.PlainDateTime.from('2026-10-24T01:00'),
}).map((value) => value.toString()); // => ['2026-10-23T00:00:00', '2026-10-24T00:00:00']
```

Related: [eachWeekendOfInterval](eachWeekendOfInterval.md), [eachWeekOfInterval](eachWeekOfInterval.md), [endOfDay](endOfDay.md).

Behaviors: [SEQ-001: Date steps include the endpoint only when reached by the configured step](../../test/features/sequences.feature#L5); [SEQ-002: Date-time day sequences begin at each containing day's start](../../test/features/sequences.feature#L17); [SEQ-013: Zoned day starts honor a skipped midnight](../../test/features/sequences.feature#L124); [SEQ-014: Calendar day sequences omit dates that never occurred](../../test/features/sequences.feature#L131); [SEQ-019: A day sequence terminates after the last representable date](../../test/features/sequences.feature#L196); [SEQ-023: Day enumeration retains leap day](../../test/features/sequences.feature#L232).
