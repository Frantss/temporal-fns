# subBusinessDays

[API index](README.md) · [Input types and conventions](conventions.md#business-days) · [Installation](../../README.md#install)

`subBusinessDays(value, amount, options?) → same kind`

Move backward by `amount` working dates, with the same rules as [addBusinessDays](addBusinessDays.md). A negative amount moves forward. Amounts must be safe integers; zero returns the original object after validating configuration.

```ts
import { subBusinessDays } from '@helpy/temporal-fns';

const monday = Temporal.PlainDate.from('2026-10-26');
subBusinessDays(monday, 1).toString(); // => '2026-10-23'
subBusinessDays(monday, -1).toString(); // => '2026-10-27'
subBusinessDays(monday, 0) === monday; // => true
subBusinessDays(monday, 1, { weekendDays: [] }).toString(); // => '2026-10-25'
```

Related: [addBusinessDays](addBusinessDays.md), [differenceInBusinessDays](differenceInBusinessDays.md), [previousDay](previousDay.md).

Behaviors: [BUS-001: Business-day addition counts dates reached after moving](../../test/features/business-days.feature#L5); [BUS-002: Zero preserves the original object even on a weekend](../../test/features/business-days.feature#L22); [BUS-003: Configurable weekends affect arithmetic and are independent of week starts](../../test/features/business-days.feature#L32); [BUS-009: Entirely skipped dates are never counted as working dates](../../test/features/business-days.feature#L96); [BUS-015: Business-day amounts cannot lose integer precision](../../test/features/business-days.feature#L161).
