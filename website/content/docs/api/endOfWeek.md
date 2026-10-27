---
title: 'endOfWeek'
---

[API index](./index.md) · [Input types and conventions](./conventions.md#period-boundaries) · [Installation](/docs#install)

`endOfWeek(value, options?) → same kind`

Find the last date or final nanosecond of the containing week. The default Sunday start makes Saturday its last date; `weekStartsOn` changes both boundaries.

```ts
import { endOfWeek } from '@helpy/temporal-fns';

const date = Temporal.PlainDate.from('2026-10-23');
endOfWeek(date).toString(); // => '2026-10-24'
endOfWeek(date, { weekStartsOn: 1 }).toString(); // => '2026-10-25'
endOfWeek(Temporal.PlainDateTime.from('2026-10-23T14:30')).toString(); // => '2026-10-24T23:59:59.999999999'
```

Related: [startOfWeek](./startOfWeek.md), [endOfISOWeek](./endOfISOWeek.md), [eachWeekOfInterval](./eachWeekOfInterval.md).

Behaviors: [BND-001: Plain date boundaries return complete dates](https://github.com/Frantss/temporal-fns/blob/main/test/features/boundaries.feature#L5); [BND-002: Plain date-time boundaries retain nanosecond endpoint precision](https://github.com/Frantss/temporal-fns/blob/main/test/features/boundaries.feature#L23); [BND-003: Week configuration changes starts and ends together](https://github.com/Frantss/temporal-fns/blob/main/test/features/boundaries.feature#L42).
