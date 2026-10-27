# temporal-fns

Date-fns-style utilities for the Temporal API.

> **Experimental.** The API and behavior may change. The package is currently private.

ESM with TypeScript declarations and tree-shakable named imports.

The full API, including `/calendar`, bundles to approximately **23.5 kB minified (8.6 kB gzipped)** with Rolldown 1.2.15, excluding any Temporal polyfill.

## Usage

Requires a global `Temporal`. If your runtime lacks it, install `temporal-polyfill` separately.

```ts
import 'temporal-polyfill/global'; // Only needed when Temporal is unavailable globally.
import { addBusinessDays, format, tryParse } from '@frantss/temporal-fns';

const reference = Temporal.PlainDate.from('2026-10-22');
const nextWorkingDate = addBusinessDays(reference, 1, { weekendDays: [5, 6] });

format(nextWorkingDate, 'yyyy-MM-dd'); // 2026-10-25

const [error, parsed] = tryParse('2024-02-29', 'yyyy-MM-dd', reference);
if (error === null) {
  console.log(parsed.toString()); // 2024-02-29
}
```

- Calendar operations support ISO 8601 only.
- Calendar operations on `Instant` require an explicit `timeZone`.
- Relative descriptions and duration labels support `en-US` only. Token text uses the host's `Intl` locale data.
- `tryParse` and `tryParseDuration` return `[null, result]` or `[error, null]`. Invalid patterns, options, and incompatible inputs still throw.

See the [API reference](docs/api-proposal.md) for supported types, options, and behavior. Calendar-widget adapters use the `@frantss/temporal-fns/calendar` entry point.

## Development

Use the Node version in [`.node-version`](.node-version).

```sh
npm ci
npm run build
npm run check
```

See the [test guide](test/README.md) for the executable Gherkin specifications and native Temporal testing.
