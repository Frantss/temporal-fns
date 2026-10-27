---
title: 'addBusinessDays'
---

[API index](./index.md) · [Input types and conventions](./conventions.md#business-days) · [Installation](/docs#install)

`addBusinessDays(value, amount, options?) → same kind`

Move by a signed number of working dates, counting dates reached after moving and excluding the starting date. `amount` must be a safe integer. Zero returns the original object, including on a weekend.

Date-time values retain their local clock where representable. Zoned arithmetic uses Temporal's compatible handling for gaps and folds, and entirely skipped dates do not count. A result outside the range throws.

```ts
import { addBusinessDays } from '@frantss/temporal-fns';

const friday = Temporal.PlainDate.from('2026-10-23');
addBusinessDays(friday, 1).toString(); // => '2026-10-26'
addBusinessDays(friday, -1).toString(); // => '2026-10-22'
addBusinessDays(friday, 0) === friday; // => true
addBusinessDays(Temporal.PlainDate.from('2026-10-22'), 1, {
  weekendDays: [5, 6],
}).toString(); // => '2026-10-25'
const zoned = Temporal.ZonedDateTime.from('2026-03-06T12:00[America/New_York]');
addBusinessDays(zoned, 1).toString(); // => '2026-03-09T12:00:00-04:00[America/New_York]'
```

Related: [subBusinessDays](./subBusinessDays.md), [differenceInBusinessDays](./differenceInBusinessDays.md), [isBusinessDay](./isBusinessDay.md).

Behaviors: [BUS-001: Business-day addition counts dates reached after moving](https://github.com/Frantss/temporal-fns/blob/main/test/features/business-days.feature#L5); [BUS-002: Zero preserves the original object even on a weekend](https://github.com/Frantss/temporal-fns/blob/main/test/features/business-days.feature#L22); [BUS-003: Configurable weekends affect arithmetic and are independent of week starts](https://github.com/Frantss/temporal-fns/blob/main/test/features/business-days.feature#L32); [BUS-007: Zoned arithmetic preserves local clock fields across DST](https://github.com/Frantss/temporal-fns/blob/main/test/features/business-days.feature#L83); [BUS-009: Entirely skipped dates are never counted as working dates](https://github.com/Frantss/temporal-fns/blob/main/test/features/business-days.feature#L96); [BUS-015: Business-day amounts cannot lose integer precision](https://github.com/Frantss/temporal-fns/blob/main/test/features/business-days.feature#L161).
