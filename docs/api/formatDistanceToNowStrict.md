# formatDistanceToNowStrict

[API index](README.md) · [Input types and conventions](conventions.md#relative-descriptions) · [Installation](../../README.md#install)

`formatDistanceToNowStrict(value, options?) → string`

Use [formatDistanceStrict](formatDistanceStrict.md)'s units, rounding, and suffix options against a fresh clock reading. Zone requirements are the same as [formatDistanceToNow](formatDistanceToNow.md); the zone determines today's date for plain inputs.

Examples assume immediate evaluation after creating each value.

```ts
import { formatDistanceToNowStrict } from '@helpy/temporal-fns';

const future = Temporal.Now.instant().add({ minutes: 5 });
formatDistanceToNowStrict(future, {
  timeZone: 'UTC',
  unit: 'minute',
  addSuffix: true,
}); // => 'in 5 minutes'
const past = Temporal.Now.zonedDateTimeISO('UTC').subtract({ hours: 2 });
formatDistanceToNowStrict(past, { unit: 'hour', addSuffix: true }); // => '2 hours ago'
const tomorrow = Temporal.Now.plainDateISO('UTC').add({ days: 1 });
formatDistanceToNowStrict(tomorrow, { timeZone: 'UTC', unit: 'day' }); // => '1 day'
```

Related: [formatDistanceStrict](formatDistanceStrict.md), [formatDistanceToNow](formatDistanceToNow.md), [formatRelative](formatRelative.md).

Behaviors: [REL-015: ToNow supports all four relative kinds in an explicit clock context](../../test/features/relative-descriptions.feature#L216); [REL-018: The viewing zone determines today's date for a plain ToNow input](../../test/features/relative-descriptions.feature#L254); [REL-019: ToNow requires an explicit zone for plain and instant values](../../test/features/relative-descriptions.feature#L263); [REL-027: Strict ToNow calls retain explicit units and rounding](../../test/features/relative-descriptions.feature#L354); [REL-030: A ToNow zone override changes the calendar-day context for a zoned input](../../test/features/relative-descriptions.feature#L397); [RNG-011: ToNow retains boundary support in explicit UTC context](../../test/features/relative-range.feature#L130).
