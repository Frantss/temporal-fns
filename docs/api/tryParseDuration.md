# tryParseDuration

[API index](README.md) · [Input types and conventions](conventions.md#duration-text) · [Installation](../../README.md#install)

`tryParseDuration(text) → TryResult<Temporal.Duration, RangeError>`

Read human duration text with [parseDuration](parseDuration.md)'s grammar. Return `[null, duration]` on success or `[error, null]` when parsing throws `RangeError`. Non-string arguments still throw `TypeError`.

```ts
import { tryParseDuration } from '@helpy/temporal-fns';

const [error, duration] = tryParseDuration('1h 30m');
if (error === null) {
  duration.toString(); // => 'PT1H30M'
}
const [invalid, absent] = tryParseDuration('1.5h');
invalid instanceof RangeError; // => true
absent; // => null
tryParseDuration('   ')[0] instanceof RangeError; // => true
```

Related: [parseDuration](parseDuration.md), [formatDuration](formatDuration.md), [tryParse](tryParse.md).

Behaviors: [DUR-007: tryParseDuration returns a discriminated success tuple](../../test/features/durations.feature#L95); [DUR-008: Invalid duration text fails consistently](../../test/features/durations.feature#L101); [DUR-015: Whitespace-only text has no duration component](../../test/features/durations.feature#L188); [DUR-017: A try parser does not convert non-text programmer errors into input failures](../../test/features/durations.feature#L208).
