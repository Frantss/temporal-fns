# tryParse

[API index](README.md) · [Input types and conventions](conventions.md#formatting-and-parsing) · [Installation](../../README.md#install)

`tryParse(text, pattern, reference, options?) → TryResult<reference kind, RangeError>`

Use the same parsing rules as [parse](parse.md), with a readonly error-first tuple: `[null, result]` on success or `[error, null]` for invalid input. Checking `error === null` narrows the result's type.

Invalid patterns, unsupported fields, invalid options, missing zones, incompatible references, and non-string input still throw. The tuple only captures input parsing failures.

```ts
import { tryParse } from '@helpy/temporal-fns';

const reference = Temporal.PlainDate.from('2000-01-01');
const [error, result] = tryParse('2024-02-29', 'yyyy-MM-dd', reference);
if (error === null) {
  result.toString(); // => '2024-02-29'
}
const [invalid, absent] = tryParse('2025-02-29', 'yyyy-MM-dd', reference);
invalid instanceof RangeError; // => true
absent; // => null
tryParse('2026', 'YYYY', reference); // throws RangeError
```

Related: [parse](parse.md), [isMatch](isMatch.md), [tryParseDuration](tryParseDuration.md).

Behaviors: [PAR-003: tryParse returns an error-first success tuple](../../test/features/parsing.feature#L43); [PAR-004: Impossible or incomplete input has the same failure across parser variants](../../test/features/parsing.feature#L51); [PAR-009: Configuration failures still throw from all parser variants](../../test/features/parsing.feature#L127); [PAR-027: Non-text primary arguments are not ordinary parse failures](../../test/features/parsing.feature#L332).
