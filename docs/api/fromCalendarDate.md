# fromCalendarDate

[API index](README.md) · [Input types and conventions](conventions.md#calendar-widget-adapters) · [Installation](../../README.md#install)

`fromCalendarDate(date) → Temporal.PlainDateTime`

Read a valid Date's host-local year, month, date, and clock fields into a zone-free value. Milliseconds are preserved; microseconds and nanoseconds are zero. Call native `.toPlainDate()` to select date-only precision.

An invalid Date throws `RangeError`; non-Date input throws `TypeError`. The result depends on the host zone for a given epoch timestamp.

```ts
import { fromCalendarDate } from '@helpy/temporal-fns/calendar';

const widget = new Date(2026, 9, 23, 14, 30, 15, 123);
fromCalendarDate(widget).toString(); // => '2026-10-23T14:30:15.123'
fromCalendarDate(widget).toPlainDate().toString(); // => '2026-10-23'
fromCalendarDate(new Date(2026, 9, 23)).hour; // => 0
fromCalendarDate(new Date(NaN)); // throws RangeError
```

Related: [toCalendarDate](toCalendarDate.md), [format](format.md), [parse](parse.md).

Behaviors: [ADP-003: Years zero through ninety-nine are copied literally](../../test/features/adapters.feature#L25); [ADP-004: fromCalendarDate reads host-local fields into a zone-free value](../../test/features/adapters.feature#L39); [ADP-007: A repeated host time can preserve its displayed fields](../../test/features/adapters.feature#L66); [ADP-009: Invalid legacy inputs are rejected](../../test/features/adapters.feature#L82); [ADP-010: Callers can choose date-only precision explicitly after reading a widget](../../test/features/adapters.feature#L94).
