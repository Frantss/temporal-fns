# formatDuration

[API index](README.md) · [Input types and conventions](conventions.md#duration-text) · [Installation](../../README.md#install)

`formatDuration(duration, options?) → string`

Render nonzero components, from years through nanoseconds by default. `format` selects a nonempty, distinct list of plural unit names and controls their order. `zero: true` includes zero components; `delimiter` defaults to a space. `locale` defaults to `en-US`.

A negative duration gets one leading minus sign. When `zero` is omitted or `false` and no selected component is nonzero, output is `0` followed by the last selected plural unit; the default is `0 nanoseconds`. With `zero: true`, every selected component appears, including when all are zero.

```ts
import { formatDuration } from '@helpy/temporal-fns';

const duration = Temporal.Duration.from({ hours: 25, minutes: 30 });
formatDuration(duration); // => '25 hours 30 minutes'
formatDuration(duration, { format: ['minutes', 'hours'], delimiter: ', ' }); // => '30 minutes, 25 hours'
formatDuration(duration, { format: ['days', 'hours'], zero: true }); // => '0 days 25 hours'
formatDuration(Temporal.Duration.from('-P1DT2H')); // => '-1 day 2 hours'
formatDuration(Temporal.Duration.from('PT0S')); // => '0 nanoseconds'
formatDuration(Temporal.Duration.from('PT0S'), { format: ['hours', 'minutes'] }); // => '0 minutes'
formatDuration(Temporal.Duration.from('PT0S'), {
  format: ['hours', 'minutes'],
  zero: true,
}); // => '0 hours 0 minutes'
```

Related: [parseDuration](parseDuration.md), [tryParseDuration](tryParseDuration.md), [formatDistanceStrict](formatDistanceStrict.md).

Behaviors: [DUR-001: Default formatting uses all nonzero components in descending order](../../test/features/durations.feature#L5); [DUR-002: Selection, ordering, zero fields and delimiters are caller controlled](../../test/features/durations.feature#L14); [DUR-003: Zero and negative output have explicit spelling](../../test/features/durations.feature#L29); [DUR-011: Invalid formatting configuration throws](../../test/features/durations.feature#L146).
