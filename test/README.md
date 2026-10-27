# Tests

Vitest runs the [Gherkin features](features/) through Cucumber, alongside TypeScript declaration and regression checks. For initial setup, follow the [development instructions](../README.md#development).

## Run

```sh
npm test
npm run check
npm run test:watch
```

Tests use the Temporal polyfill by default. Run `npm run test:native` on a runtime with native Temporal.

Run one feature or select a scenario by its case tag:

```sh
npm test -- test/features/sequences.feature
CUCUMBER_OPTIONS='--tags @case-SEQ-027' npm test -- test/features/sequences.feature
```

## Change a test

Keep feature scenarios and their matching Given/When/Then bindings in [behavior/](behavior/) in sync. Use each scenario's `@case-*` tag to select it during debugging.

Package-boundary and declaration checks read `dist/`. `npm test` rebuilds it; rebuild manually before running `npx vp test` directly or after changing declarations during a watch session.
