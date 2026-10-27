---
title: 'formatDistanceStrict'
---

[API index](./index.md) · [Input types and conventions](./conventions.md#relative-descriptions) · [Installation](/docs#install)

`formatDistanceStrict(value, base, options?) → string`

Return a rounded count with one unit and no approximation wording. `unit` accepts `second`, `minute`, `hour`, `day`, `month`, or `year`. Without it, elapsed magnitude chooses the unit before rounding, at 60 seconds, 60 minutes, 24 hours, 30 days, and 365 days.

`roundingMethod` defaults to `round` and also accepts `floor`, `ceil`, or `trunc`. Rounding applies to the absolute magnitude; `addSuffix` uses the actual direction even when the rounded count is zero. `addSuffix` defaults to `false` and `locale` to `en-US`.

```ts
import { formatDistanceStrict } from '@helpy/temporal-fns';

const base = Temporal.PlainDateTime.from('2026-01-01T00:00');
formatDistanceStrict(base.add({ seconds: 3599 }), base); // => '60 minutes'
formatDistanceStrict(base.subtract({ seconds: 91 }), base, {
  unit: 'minute',
  roundingMethod: 'floor',
  addSuffix: true,
}); // => '1 minute ago'
const zoned = Temporal.ZonedDateTime.from('2026-03-07T12:00[America/New_York]');
formatDistanceStrict(zoned.add({ days: 1 }), zoned, { unit: 'day' }); // => '1 day'
formatDistanceStrict(zoned.add({ days: 1 }), zoned, { unit: 'hour' }); // => '23 hours'
```

Related: [formatDistance](./formatDistance.md), [formatDistanceToNowStrict](./formatDistanceToNowStrict.md), [formatDuration](./formatDuration.md).

Behaviors: [REL-004: Strict default units are chosen before rounding](https://github.com/Frantss/temporal-fns/blob/main/test/features/relative-descriptions.feature#L73); [REL-005: Strict rounding applies to the absolute magnitude](https://github.com/Frantss/temporal-fns/blob/main/test/features/relative-descriptions.feature#L92); [REL-007: Months and years use constrained calendar anniversaries](https://github.com/Frantss/temporal-fns/blob/main/test/features/relative-descriptions.feature#L124); [REL-008: Zoned days and elapsed hours carry different meanings across DST](https://github.com/Frantss/temporal-fns/blob/main/test/features/relative-descriptions.feature#L135); [REL-029: Rounding to zero does not erase the actual suffix direction](https://github.com/Frantss/temporal-fns/blob/main/test/features/relative-descriptions.feature#L377); [RNG-012: A failing original-year named-zone total retains its native error](https://github.com/Frantss/temporal-fns/blob/main/test/features/relative-range.feature#L145).
