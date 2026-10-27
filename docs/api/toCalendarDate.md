# toCalendarDate

[API index](README.md) · [Input types and conventions](conventions.md#calendar-widget-adapters) · [Installation](../../README.md#install)

`toCalendarDate(value) → Date`

Copy a `PlainDate`, `PlainDateTime`, or `ZonedDateTime` into a host-local `Date` with the same calendar fields. Date-only input uses midnight; a zoned input's zone is not transferred.

Reject microsecond or nanosecond precision, host-local gaps or skipped dates, and values outside the host's Date range with `RangeError`. Years 0–99 retain their literal year. A repeated host time can round-trip its displayed fields, without identifying an original instant.

The successful examples use ordinary October dates; they require the displayed times to exist in the host zone.

```ts
import { toCalendarDate } from '@helpy/temporal-fns/calendar';

const date = toCalendarDate(Temporal.PlainDate.from('2026-10-23'));
[date.getFullYear(), date.getMonth() + 1, date.getDate(), date.getHours()]; // => [2026, 10, 23, 0]
const zoned = Temporal.ZonedDateTime.from('2026-10-23T14:30[Asia/Tokyo]');
toCalendarDate(zoned).getHours(); // => 14
toCalendarDate(Temporal.PlainDateTime.from('2026-10-23T12:00:00.000001')); // throws RangeError
```

Related: [fromCalendarDate](fromCalendarDate.md), [format](format.md), [parse](parse.md).

Behaviors: [ADP-001: toCalendarDate copies fields into the host zone](../../test/features/adapters.feature#L5); [ADP-002: A zoned calendar adapter deliberately copies fields rather than the instant](../../test/features/adapters.feature#L17); [ADP-003: Years zero through ninety-nine are copied literally](../../test/features/adapters.feature#L25); [ADP-005: Sub-millisecond precision cannot be silently discarded](../../test/features/adapters.feature#L48); [ADP-006: A host gap is rejected instead of shifting the copied fields](../../test/features/adapters.feature#L59); [ADP-011: A valid Temporal value may exceed the Date range in the host zone](../../test/features/adapters.feature#L102).
