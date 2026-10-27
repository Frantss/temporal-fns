# format

[API index](README.md) · [Input types and conventions](conventions.md#formatting-and-parsing) · [Installation](../../README.md#install)

`format(value, pattern, options?) → string`

Render selected fields for display or fixed text output. `locale` defaults to `en-US` and controls month, weekday, and day-period labels through the host's `Intl` data. Numeric output uses ASCII digits.

`Instant` requires `timeZone`. `ZonedDateTime` uses its own zone unless overridden; plain values reject zone options. `XX` and `XXX` output `Z` at zero offset and discard historical offset seconds. `SSS` displays milliseconds without rounding the input's finer precision.

```ts
import { format } from '@helpy/temporal-fns';

const date = Temporal.PlainDate.from('2026-10-23');
format(date, 'EEEE, MMMM d, yyyy'); // => 'Friday, October 23, 2026'
format(Temporal.PlainYearMonth.from('2026-10'), 'yyyy-MM'); // => '2026-10'
format(Temporal.PlainMonthDay.from('02-29'), 'MM/dd'); // => '02/29'
format(date, 'MMMM', { locale: 'es-UY' }); // => 'octubre'
format(Temporal.Instant.from('2026-10-24T01:00Z'), 'yyyy-MM-dd HH:mm XXX', {
  timeZone: 'America/Montevideo',
}); // => '2026-10-23 22:00 -03:00'
format(date, 'HH:mm'); // throws RangeError
```

Related: [parse](parse.md), [formatRelative](formatRelative.md), [formatDuration](formatDuration.md).

Behaviors: [FMT-001: Numeric tokens retain their distinct meanings](../../test/features/formatting.feature#L6); [FMT-005: Partial values expose only the information they contain](../../test/features/formatting.feature#L57); [FMT-008: Instant formatting requires a viewing zone](../../test/features/formatting.feature#L99); [FMT-012: Locale selects grammatical text labels](../../test/features/formatting.feature#L138); [FMT-015: Offset tokens intentionally discard historical offset seconds](../../test/features/formatting.feature#L169).
