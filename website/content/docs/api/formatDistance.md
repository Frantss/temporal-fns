---
title: 'formatDistance'
---

[API index](./index.md) · [Input types and conventions](./conventions.md#relative-descriptions) · [Installation](/docs#install)

`formatDistance(value, base, options?) → string`

Describe `value` relative to `base` with approximate phrases such as `about 1 hour`. `addSuffix` defaults to `false`; when enabled it produces `in …` or `… ago`. `includeSeconds` defaults to `false` and refines phrases below 90 seconds. `locale` defaults to `en-US`.

Phrase thresholds are specified by the linked behaviors, including transitions at 30/90 seconds, 45/90 minutes, 24/42 hours, and 30/45/60/365 days. Longer month/year counts use calendar totals.

```ts
import { formatDistance } from '@frantss/temporal-fns';

const base = Temporal.PlainDateTime.from('2026-01-01T00:00');
formatDistance(base.add({ minutes: 45 }), base); // => 'about 1 hour'
formatDistance(base.add({ seconds: 10 }), base, { includeSeconds: true }); // => 'less than 20 seconds'
formatDistance(base.add({ days: 2 }), base, { addSuffix: true }); // => 'in 2 days'
formatDistance(base.subtract({ days: 2 }), base, { addSuffix: true }); // => '2 days ago'
```

Related: [formatDistanceStrict](./formatDistanceStrict.md), [formatDistanceToNow](./formatDistanceToNow.md), [formatRelative](./formatRelative.md).

Behaviors: [REL-001: Approximate phrases change at documented lower-inclusive thresholds](https://github.com/Frantss/temporal-fns/blob/main/test/features/relative-descriptions.feature#L5); [REL-002: includeSeconds refines only the first ninety seconds](https://github.com/Frantss/temporal-fns/blob/main/test/features/relative-descriptions.feature#L35); [REL-003: Suffixes describe value relative to base](https://github.com/Frantss/temporal-fns/blob/main/test/features/relative-descriptions.feature#L57); [REL-014: Relative pair zones follow the calendar comparison rules](https://github.com/Frantss/temporal-fns/blob/main/test/features/relative-descriptions.feature#L204); [RNG-004: Plain date-times preserve their range and kind without an invented zone](https://github.com/Frantss/temporal-fns/blob/main/test/features/relative-range.feature#L48).
