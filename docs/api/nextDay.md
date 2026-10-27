# nextDay

[API index](README.md) · [Input types and conventions](conventions.md#weekday-navigation-and-calendar-queries) · [Installation](../../README.md#install)

`nextDay(value, weekday) → same kind`

Move strictly forward to the next occurrence of the requested weekday. If the input already has that weekday, move to the following week. Preserve clock fields with native calendar arithmetic. If an entire weekday occurrence was skipped in a zone, continue to a later occurrence. An unrepresentable result throws.

```ts
import { nextDay } from '@helpy/temporal-fns';

const thursday = Temporal.PlainDate.from('2026-10-22');
nextDay(thursday, 5).toString(); // => '2026-10-23'
nextDay(thursday, 4).toString(); // => '2026-10-29'
nextDay(thursday, 0).toString(); // => '2026-10-25'
nextDay(Temporal.PlainDateTime.from('2026-10-22T12:34:56.123456789'), 5).toString(); // => '2026-10-23T12:34:56.123456789'
```

Related: [previousDay](previousDay.md), [addBusinessDays](addBusinessDays.md), [startOfWeek](startOfWeek.md).

Behaviors: [CAL-001: Weekday navigation is strictly next or previous](../../test/features/calendar-queries.feature#L5); [CAL-002: Date-time navigation preserves the local clock and kind](../../test/features/calendar-queries.feature#L19); [CAL-003: A missing weekday occurrence is skipped rather than returning another weekday](../../test/features/calendar-queries.feature#L25); [CAL-004: Weekday numbers cannot wrap or be fractional](../../test/features/calendar-queries.feature#L37); [CAL-012: Weekday navigation reports an unavailable result at the range limit](../../test/features/calendar-queries.feature#L149).
