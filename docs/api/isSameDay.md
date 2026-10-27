# isSameDay

[API index](README.md) · [Input types and conventions](conventions.md#calendar-period-comparisons) · [Installation](../../README.md#install)

`isSameDay(value, base, options?) → boolean`

Check whether two values fall on the same calendar date in the selected context.

```ts
import { isSameDay } from '@helpy/temporal-fns';

isSameDay(
  Temporal.PlainDateTime.from('2026-10-23T00:00'),
  Temporal.PlainDateTime.from('2026-10-23T23:59'),
); // => true
const a = Temporal.Instant.from('2026-01-01T00:30Z');
const b = Temporal.Instant.from('2026-01-01T03:30Z');
isSameDay(a, b, { timeZone: 'UTC' }); // => true
isSameDay(a, b, { timeZone: 'America/Montevideo' }); // => false
```

Related: [isSameWeek](isSameWeek.md), [formatRelative](formatRelative.md), [isWithinInterval](isWithinInterval.md).

Behaviors: [CMP-001: Period equality checks the period and its year](../../test/features/comparisons.feature#L5); [CMP-002: Plain date-time comparisons ignore clocks](../../test/features/comparisons.feature#L27); [CMP-007: Instant comparisons use the supplied zone](../../test/features/comparisons.feature#L111); [CMP-008: Different zoned inputs require a common viewing zone](../../test/features/comparisons.feature#L121).
