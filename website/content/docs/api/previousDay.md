---
title: 'previousDay'
---

[API index](./index.md) · [Input types and conventions](./conventions.md#weekday-navigation-and-calendar-queries) · [Installation](/docs#install)

`previousDay(value, weekday) → same kind`

Move strictly backward to the previous occurrence of the requested weekday. Matching the input's own weekday moves back a week. Clock preservation, skipped occurrences, weekday validation, and range rules match [nextDay](./nextDay.md).

```ts
import { previousDay } from '@helpy/temporal-fns';

const thursday = Temporal.PlainDate.from('2026-10-22');
previousDay(thursday, 3).toString(); // => '2026-10-21'
previousDay(thursday, 4).toString(); // => '2026-10-15'
previousDay(thursday, 0).toString(); // => '2026-10-18'
previousDay(Temporal.PlainDateTime.from('2026-10-22T12:30'), 3).toString(); // => '2026-10-21T12:30:00'
```

Related: [nextDay](./nextDay.md), [subBusinessDays](./subBusinessDays.md), [endOfWeek](./endOfWeek.md).

Behaviors: [CAL-001: Weekday navigation is strictly next or previous](https://github.com/Frantss/temporal-fns/blob/main/test/features/calendar-queries.feature#L5); [CAL-003: A missing weekday occurrence is skipped rather than returning another weekday](https://github.com/Frantss/temporal-fns/blob/main/test/features/calendar-queries.feature#L25); [CAL-004: Weekday numbers cannot wrap or be fractional](https://github.com/Frantss/temporal-fns/blob/main/test/features/calendar-queries.feature#L37).
