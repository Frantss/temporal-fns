# temporal-fns

Date-fns-style utilities for the Temporal API.

Read the [documentation](https://temporal-fns.frantss.uy).

> **Experimental.** The API and behavior may change.

ESM with TypeScript declarations and tree-shakable named imports.

The full API, including `/calendar`, bundles to approximately **23.5 kB minified (8.6 kB gzipped)** with Rolldown 1.2.15, excluding any Temporal polyfill.

## Install

```sh
npm install @frantss/temporal-fns
```

Requires a global `Temporal`. If your runtime does not provide it, install the polyfill:

```sh
npm install temporal-polyfill
```

Load it once in your application entry point, before using the library:

```ts
import 'temporal-polyfill/global';
```

## Usage

```ts
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

Browse the [API reference](https://temporal-fns.frantss.uy/docs/api/) for descriptions, examples, related APIs, and behavior specifications. Calendar-widget adapters use the `@frantss/temporal-fns/calendar` entry point.

## Development

Use the Node version in [`.node-version`](.node-version).

```sh
npm ci
npm run build
npm run check
```

Run the executable [Gherkin specifications](test/features/) with `npm test`. Tests use the Temporal polyfill by default; use `npm run test:native` on a runtime with native Temporal.

Run the Fumadocs site with `npm run docs:dev`. Build static files with `npm run docs:build`. The site uses the reusable [@frantss/fumadocs-theme package](https://github.com/Frantss/fumadocs-theme).
