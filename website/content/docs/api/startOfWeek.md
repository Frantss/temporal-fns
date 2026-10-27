---
title: 'startOfWeek'
---

[API index](./index.md) · [Input types and conventions](./conventions.md#period-boundaries) · [Installation](/docs#install)

`startOfWeek(value, options?) → same kind`

Find the start of the containing seven-date week. Set `weekStartsOn` to change its first weekday; this is independent of business-day weekend configuration.

```ts
import { startOfWeek } from '@helpy/temporal-fns';

const date = Temporal.PlainDate.from('2026-10-23');
startOfWeek(date).toString(); // => '2026-10-18'
startOfWeek(date, { weekStartsOn: 1 }).toString(); // => '2026-10-19'
startOfWeek(Temporal.PlainDateTime.from('2026-10-23T14:30')).toString(); // => '2026-10-18T00:00:00'
```

Related: [endOfWeek](./endOfWeek.md), [startOfISOWeek](./startOfISOWeek.md), [eachWeekOfInterval](./eachWeekOfInterval.md).

Behaviors: [BND-001: Plain date boundaries return complete dates](https://github.com/Frantss/temporal-fns/blob/main/test/features/boundaries.feature#L5); [BND-002: Plain date-time boundaries retain nanosecond endpoint precision](https://github.com/Frantss/temporal-fns/blob/main/test/features/boundaries.feature#L23); [BND-003: Week configuration changes starts and ends together](https://github.com/Frantss/temporal-fns/blob/main/test/features/boundaries.feature#L42); [BND-008: A skipped midnight produces the earliest valid start](https://github.com/Frantss/temporal-fns/blob/main/test/features/boundaries.feature#L109).
