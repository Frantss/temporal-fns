---
title: 'eachMonthOfInterval'
---

[API index](./index.md) · [Input types and conventions](./conventions.md#interval-sequences) · [Installation](/docs#install)

`eachMonthOfInterval(interval, options?) → same-kind array`

Enumerate containing month starts for calendar values, or whole months for `PlainYearMonth` endpoints. Supports `step`. Month-only results do not acquire a day or zone, including at Temporal's lower bound. Zoned steps follow local calendar months.

```ts
import { eachMonthOfInterval } from '@helpy/temporal-fns';

const interval = {
  start: Temporal.PlainYearMonth.from('2026-11'),
  end: Temporal.PlainYearMonth.from('2027-02'),
};
eachMonthOfInterval(interval).map((value) => value.toString()); // => ['2026-11', '2026-12', '2027-01', '2027-02']
eachMonthOfInterval(interval, { step: 2 }).map((value) => value.toString()); // => ['2026-11', '2027-01']
eachMonthOfInterval({
  start: Temporal.PlainYearMonth.from('-271821-04'),
  end: Temporal.PlainYearMonth.from('-271821-05'),
}).map((value) => value.toString()); // => ['-271821-04', '-271821-05']
```

Related: [startOfMonth](./startOfMonth.md), [eachWeekOfInterval](./eachWeekOfInterval.md), [isSameMonth](./isSameMonth.md).

Behaviors: [SEQ-004: Month sequences enumerate starts across year boundaries](https://github.com/Frantss/temporal-fns/blob/main/test/features/sequences.feature#L35); [SEQ-005: Month-only endpoints remain month-only values](https://github.com/Frantss/temporal-fns/blob/main/test/features/sequences.feature#L45); [SEQ-022: A missing first containing period is not silently clipped](https://github.com/Frantss/temporal-fns/blob/main/test/features/sequences.feature#L221); [SEQ-027: Month-only iteration at the lower bound does not require a complete date](https://github.com/Frantss/temporal-fns/blob/main/test/features/sequences.feature#L267); [SEQ-028: Zoned week and month sequences advance by local calendar units across a fold](https://github.com/Frantss/temporal-fns/blob/main/test/features/sequences.feature#L275).
