---
title: Getting started
description: Date-fns-style utilities for the Temporal API.
---

> **Experimental.** The API and behavior may change.

ESM with TypeScript declarations and tree-shakable named imports. The library uses Temporal values directly.

## Install

```sh
npm install @helpy/temporal-fns
```

A global `Temporal` is required. If your runtime does not provide it, install the polyfill:

```sh
npm install temporal-polyfill
```

Load it once in your application entry point, before using the library:

```ts
import 'temporal-polyfill/global';
```

For global TypeScript declarations, see [TypeScript setup](./api/types.md#typescript-setup).

## Usage

```ts
import { addBusinessDays, format, tryParse } from '@helpy/temporal-fns';

const reference = Temporal.PlainDate.from('2026-10-22');
const nextWorkingDate = addBusinessDays(reference, 1, { weekendDays: [5, 6] });

format(nextWorkingDate, 'yyyy-MM-dd'); // => '2026-10-25'

const [error, parsed] = tryParse('2024-02-29', 'yyyy-MM-dd', reference);
if (error === null) {
  parsed.toString(); // => '2024-02-29'
}
```

## API reference

Browse [all functions](./api/index.md), [input conventions](./api/conventions.md), and [exported types and options](./api/types.md).

Each function has its own page with examples, related APIs, and links to the executable Gherkin behaviors. Calendar widget adapters use the `@helpy/temporal-fns/calendar` entry point.
