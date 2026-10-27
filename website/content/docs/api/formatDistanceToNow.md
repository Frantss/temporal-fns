---
title: 'formatDistanceToNow'
---

[API index](./index.md) · [Input types and conventions](./conventions.md#relative-descriptions) · [Installation](/docs#install)

`formatDistanceToNow(value, options?) → string`

Use [formatDistance](./formatDistance.md)'s phrases and options with the current clock as the base. Each call reads the clock again. `PlainDate`, `PlainDateTime`, and `Instant` require `timeZone` to select the clock context. `ZonedDateTime` defaults to its own zone and accepts an override.

Examples below create values relative to the live clock and assume they are evaluated immediately.

```ts
import { formatDistanceToNow } from '@helpy/temporal-fns';

const future = Temporal.Now.instant().add({ minutes: 5 });
formatDistanceToNow(future, { timeZone: 'UTC', addSuffix: true }); // => 'in 5 minutes'
const past = Temporal.Now.zonedDateTimeISO('UTC').subtract({ days: 2 });
formatDistanceToNow(past, { addSuffix: true }); // => '2 days ago'
const tomorrow = Temporal.Now.plainDateISO('UTC').add({ days: 1 });
formatDistanceToNow(tomorrow, { timeZone: 'UTC' }); // => '1 day'
```

Related: [formatDistance](./formatDistance.md), [formatDistanceToNowStrict](./formatDistanceToNowStrict.md), [formatRelative](./formatRelative.md).

Behaviors: [REL-015: ToNow supports all four relative kinds in an explicit clock context](https://github.com/Frantss/temporal-fns/blob/main/test/features/relative-descriptions.feature#L216); [REL-016: ToNow reads the current clock separately for each call](https://github.com/Frantss/temporal-fns/blob/main/test/features/relative-descriptions.feature#L231); [REL-017: Zoned ToNow values supply their own default viewing zone](https://github.com/Frantss/temporal-fns/blob/main/test/features/relative-descriptions.feature#L245); [REL-019: ToNow requires an explicit zone for plain and instant values](https://github.com/Frantss/temporal-fns/blob/main/test/features/relative-descriptions.feature#L263); [REL-026: Approximate ToNow calls retain phrase options](https://github.com/Frantss/temporal-fns/blob/main/test/features/relative-descriptions.feature#L342).
