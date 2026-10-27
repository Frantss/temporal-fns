# parseDuration

[API index](README.md) · [Input types and conventions](conventions.md#duration-text) · [Installation](../../README.md#install)

`parseDuration(text) → Temporal.Duration`

Read integer human units in any order. Accepted short names are `y`, `mo`, `w`, `d`, `h`, `m`, `s`, `ms`, `us`, and `ns`; singular and plural full names also work. Units are case-insensitive. Surrounding whitespace is trimmed; components must be separated by whitespace. One optional leading sign applies to every component.

Fractions, repeated units, per-component signs, ISO duration strings, clock notation, unknown units, and integers that cannot be represented exactly as numbers throw `RangeError`. Native Duration component limits also apply.

```ts
import { parseDuration } from '@helpy/temporal-fns';

parseDuration('25h 90m').hours; // => 25
parseDuration('25h 90m').minutes; // => 90
parseDuration('  1H 30Minutes  ').toString(); // => 'PT1H30M'
parseDuration('-1h 30m').toString(); // => '-PT1H30M'
parseDuration('1mo 2d').toString(); // => 'P1M2D'
parseDuration('1h30m'); // throws RangeError
parseDuration('PT1H'); // throws RangeError
```

Related: [tryParseDuration](tryParseDuration.md), [formatDuration](formatDuration.md), [parse](parse.md).

Behaviors: [DUR-004: Every documented short unit maps to its own component](../../test/features/durations.feature#L43); [DUR-005: Singular and plural names are accepted without imposing order](../../test/features/durations.feature#L61); [DUR-006: One leading sign applies to all components](../../test/features/durations.feature#L83); [DUR-008: Invalid duration text fails consistently](../../test/features/durations.feature#L101); [DUR-013: Human units are case-insensitive](../../test/features/durations.feature#L168); [DUR-014: Surrounding whitespace is trimmed without changing component separation](../../test/features/durations.feature#L180).
