---
title: 'parse'
---

[API index](./index.md) · [Input types and conventions](./conventions.md#formatting-and-parsing) · [Installation](/docs#install)

`parse(text, pattern, reference, options?) → same kind as reference`

Read a complete input string into a Temporal value. The reference is required. Unspecified higher fields come from it; unspecified lower fields reset to month/day `1` or clock field `0` after the highest parsed field. A matching empty or literal-only pattern preserves the reference fields.

Input mismatch, impossible dates, and clock overflow throw `RangeError`. Input is not trimmed. `Instant` references require `timeZone`; zoned references use their own zone and reject a zone override. `disambiguation` defaults to `compatible` and also accepts `earlier`, `later`, or `reject`. An explicit parsed offset determines the instant, then a zoned result is viewed in the reference's zone.

```ts
import { parse } from '@helpy/temporal-fns';

const reference = Temporal.PlainDateTime.from('2000-07-19T21:34:56.123456789');
parse('02/29/2024', 'MM/dd/yyyy', reference).toString(); // => '2024-02-29T00:00:00'
parse('08', 'HH', reference).toString(); // => '2000-07-19T08:00:00'
parse('ready', "'ready'", reference).equals(reference); // => true
parse('02/29/2025', 'MM/dd/yyyy', reference); // throws RangeError

parse('02/2024', 'MM/yyyy', Temporal.PlainYearMonth.from('2000-07')).toString(); // => '2024-02'
parse('02/29', 'MM/dd', Temporal.PlainMonthDay.from('12-25')).toString(); // => '02-29'
parse('12:00', 'HH:mm', Temporal.Instant.from('2026-01-01T01:30Z'), {
  timeZone: 'America/Montevideo',
}).toString(); // => '2025-12-31T15:00:00Z'

const zoned = Temporal.ZonedDateTime.from('2026-01-01T12:00[America/New_York]');
parse('2026-11-01 01:30', 'yyyy-MM-dd HH:mm', zoned, {
  disambiguation: 'later',
}).offset; // => '-05:00'
```

Related: [tryParse](./tryParse.md), [isMatch](./isMatch.md), [format](./format.md).

Behaviors: [PAR-001: Parsing preserves the reference kind](https://github.com/Frantss/temporal-fns/blob/main/test/features/parsing.feature#L5); [PAR-002: Omitted higher fields come from the reference and lower fields reset](https://github.com/Frantss/temporal-fns/blob/main/test/features/parsing.feature#L23); [PAR-004: Impossible or incomplete input has the same failure across parser variants](https://github.com/Frantss/temporal-fns/blob/main/test/features/parsing.feature#L51); [PAR-012: Zone options follow the reference kind](https://github.com/Frantss/temporal-fns/blob/main/test/features/parsing.feature#L169); [PAR-013: Fold disambiguation selects an occurrence in the reference zone](https://github.com/Frantss/temporal-fns/blob/main/test/features/parsing.feature#L182); [PAR-016: An input offset determines the instant without requiring agreement with the reference zone](https://github.com/Frantss/temporal-fns/blob/main/test/features/parsing.feature#L217); [PAR-018: A complete literal match retains all reference fields](https://github.com/Frantss/temporal-fns/blob/main/test/features/parsing.feature#L231); [PAR-011: An instant reference supplies fields in the explicit viewing zone](https://github.com/Frantss/temporal-fns/blob/main/test/features/parsing.feature#L153).
