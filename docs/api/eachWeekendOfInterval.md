# eachWeekendOfInterval

[API index](README.md) · [Input types and conventions](conventions.md#interval-sequences) · [Installation](../../README.md#install)

`eachWeekendOfInterval(interval, options?) → same-kind array`

Enumerate containing day starts whose weekdays appear in `weekendDays`, for `PlainDate`, `PlainDateTime`, or `ZonedDateTime` endpoints. Defaults to Saturday and Sunday. Accepts `weekendDays` only; there is no `step` option. No matching dates returns `[]`.

```ts
import { eachWeekendOfInterval } from '@helpy/temporal-fns';

const interval = {
  start: Temporal.PlainDate.from('2026-10-23'),
  end: Temporal.PlainDate.from('2026-10-27'),
};
eachWeekendOfInterval(interval).map((value) => value.toString()); // => ['2026-10-24', '2026-10-25']
eachWeekendOfInterval(interval, { weekendDays: [5, 6] }).map((value) => value.toString()); // => ['2026-10-23', '2026-10-24']
eachWeekendOfInterval(interval, { weekendDays: [] }); // => []
```

Related: [isWeekend](isWeekend.md), [eachDayOfInterval](eachDayOfInterval.md), [addBusinessDays](addBusinessDays.md).

Behaviors: [SEQ-006: Weekend sequences filter containing days by weekendDays](../../test/features/sequences.feature#L56); [SEQ-014: Calendar day sequences omit dates that never occurred](../../test/features/sequences.feature#L131); [SEQ-021: Sequence configuration shares the week and weekend constraints](../../test/features/sequences.feature#L209); [SEQ-024: Weekend filtering does not require a weekend to occur](../../test/features/sequences.feature#L238); [BUS-017: All weekend consumers validate a configuration with no working day](../../test/features/business-days.feature#L183).
