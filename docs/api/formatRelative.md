# formatRelative

[API index](README.md) · [Input types and conventions](conventions.md#relative-descriptions) · [Installation](../../README.md#install)

`formatRelative(value, base, options?) → string`

Label the calendar date relative to `base`: `yesterday`, `today`, `tomorrow`, `last <weekday>` for −6 through −2 days, and `<weekday>` for +2 through +6 days. Beyond that window, render `MM/dd/yyyy`. Date-time, zoned, and instant inputs append `at` and a host `en-US` 12-hour clock; date-only inputs do not.

Options are `locale` (only `en-US`) and the applicable `timeZone` context.

```ts
import { formatRelative } from '@helpy/temporal-fns';

const base = Temporal.PlainDate.from('2026-10-23');
formatRelative(base, base); // => 'today'
formatRelative(base.subtract({ days: 2 }), base); // => 'last Wednesday'
formatRelative(base.add({ days: 2 }), base); // => 'Sunday'
formatRelative(base.add({ days: 7 }), base); // => '10/30/2026'
const clock = Temporal.PlainDateTime.from('2026-10-23T14:30');
formatRelative(clock.add({ days: 1 }), clock); // => 'tomorrow at 2:30 PM'
```

Related: [format](format.md), [formatDistance](formatDistance.md), [formatDistanceStrict](formatDistanceStrict.md).

Behaviors: [REL-010: Relative phrases select calendar dates around the base](../../test/features/relative-descriptions.feature#L154); [REL-011: Date-time relative phrases include the value's clock even for distant dates](../../test/features/relative-descriptions.feature#L172); [REL-012: Relative instant dates are determined in the explicit zone](../../test/features/relative-descriptions.feature#L185); [REL-028: A common zone determines both the date phrase and clock of a zoned relative call](../../test/features/relative-descriptions.feature#L367).
