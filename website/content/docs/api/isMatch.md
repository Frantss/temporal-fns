---
title: 'isMatch'
---

[API index](./index.md) · [Input types and conventions](./conventions.md#formatting-and-parsing) · [Installation](/docs#install)

`isMatch(text, pattern, reference, options?) → boolean`

Check whether the complete input can be parsed, including date validity, using the same required reference and options as [parse](./parse.md). Invalid input returns `false`. Invalid configuration or non-string input still throws.

```ts
import { isMatch } from '@frantss/temporal-fns';

const reference = Temporal.PlainDate.from('2000-01-01');
isMatch('2024-02-29', 'yyyy-MM-dd', reference); // => true
isMatch('2025-02-29', 'yyyy-MM-dd', reference); // => false
isMatch('2024-02-29\n', 'yyyy-MM-dd', reference); // => false
isMatch('', '', reference); // => true
isMatch('2026', 'yy', reference); // throws RangeError
```

Related: [parse](./parse.md), [tryParse](./tryParse.md), [format](./format.md).

Behaviors: [PAR-004: Impossible or incomplete input has the same failure across parser variants](https://github.com/Frantss/temporal-fns/blob/main/test/features/parsing.feature#L51); [PAR-005: Input consumption includes trailing line breaks](https://github.com/Frantss/temporal-fns/blob/main/test/features/parsing.feature#L70); [PAR-009: Configuration failures still throw from all parser variants](https://github.com/Frantss/temporal-fns/blob/main/test/features/parsing.feature#L127); [PAR-018: A complete literal match retains all reference fields](https://github.com/Frantss/temporal-fns/blob/main/test/features/parsing.feature#L231).
