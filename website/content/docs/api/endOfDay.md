---
title: 'endOfDay'
---

[API index](./index.md) · [Input types and conventions](./conventions.md#period-boundaries) · [Installation](/docs#install)

`endOfDay(value) → same kind`

Find the last nanosecond of the day. Accepts `PlainTime`, `PlainDateTime`, and `ZonedDateTime`; `PlainDate` is not accepted. Clock-only input returns `23:59:59.999999999`.

```ts
import { endOfDay } from '@frantss/temporal-fns';

endOfDay(Temporal.PlainTime.from('12:30')).toString(); // => '23:59:59.999999999'
endOfDay(Temporal.PlainDateTime.from('2024-02-29T12:30')).toString(); // => '2024-02-29T23:59:59.999999999'
endOfDay(Temporal.ZonedDateTime.from('2026-03-08T00:00[America/New_York]')).toString(); // => '2026-03-08T23:59:59.999999999-04:00[America/New_York]'
```

Related: [endOfWeek](./endOfWeek.md), [endOfMonth](./endOfMonth.md), [eachDayOfInterval](./eachDayOfInterval.md).

Behaviors: [BND-006: A clock-only end of day is independent of its starting time](https://github.com/Frantss/temporal-fns/blob/main/test/features/boundaries.feature#L86); [BND-007: Zoned day ends follow the actual day length](https://github.com/Frantss/temporal-fns/blob/main/test/features/boundaries.feature#L97); [BND-009: An end boundary ends before the next existing calendar date](https://github.com/Frantss/temporal-fns/blob/main/test/features/boundaries.feature#L116); [BND-014: A zoned day end beyond the maximum instant is unavailable](https://github.com/Frantss/temporal-fns/blob/main/test/features/boundaries.feature#L170); [BND-002: Plain date-time boundaries retain nanosecond endpoint precision](https://github.com/Frantss/temporal-fns/blob/main/test/features/boundaries.feature#L23).
