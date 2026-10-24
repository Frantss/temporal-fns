# Executable behavior specifications

Vitest runs all 16 `.feature` files through `@lotun/vitest-cucumber` and the official `@cucumber/cucumber` runtime. Their 247 scenario definitions expand to 1,621 cases, covering all 56 public functions. Given steps prepare inputs, When steps invoke the API and capture results or errors, and Then steps verify those observations.

The suite also runs 70 Vitest declaration checks, 30 focused range/offset regressions, and one inventory check: 1,722 checks in total.

## Run

Use Node 24.13.0, pinned in `.node-version`:

```sh
npm ci
npm test
npm run check
npm run test:watch
```

`npm test` builds the package and runs `vp test`. `npm run check` also checks formatting, lint, and TypeScript. Vite+ supplies the runner, Oxlint, and Oxfmt. The integration has a direct Vitest peer dependency, pinned to Vite+'s bundled version through the package overrides.

Run a feature or select a scenario by its existing case tag:

```sh
npm test -- docs/behavior/features/sequences.feature
CUCUMBER_OPTIONS='--tags @case-SEQ-027' npm test -- docs/behavior/features/sequences.feature
npm run test:watch -- docs/behavior/features/sequences.feature
```

Cucumber also supports line selectors, such as `docs/behavior/features/sequences.feature:8`. Failures point to the feature's scenario, Example row, and failing step.

`test/setup.ts` installs the Temporal polyfill for tests and restores the host zone between scenarios. `npm run test:native` omits the polyfill on a host with native Temporal. Feature files run in isolated Node fork workers; their scenarios run serially. Clock fixtures restore their spies after each action. Locale and historical-zone scenarios require the host data stated in their Given steps.

## Bindings

Each `behavior/*.steps.ts` file implements one feature. Cucumber executes Scenario Outlines, Examples, Backgrounds, and DataTables. The type matrix reads its representative values, argument arrangements, and return shapes from its Background tables.

`behavior/bindings.ts` scopes step callbacks to the existing `@case-*` tags. This lets formulations reuse phrases such as “the result is false” and repeat steps within a scenario. Each scenario receives fresh local state. The adapter checks every step against its binding, supplies Example values, and forwards DataTables. Missing scenarios, missing steps, and mismatched wording fail the run. There is no separate feature reader or specification hash lock.

`behavior/support.ts` constructs Temporal fixtures and calls the public API through an adapter that also permits deliberately invalid runtime inputs. `behavior/assertions.ts` holds comparisons and observed results. Tests do not import private implementation functions.

The declaration feature uses `behavior/declaration-compiler.ts` to select the matching TypeScript example in `declarations.test-d.ts` and check compiler diagnostics. That file also runs through Vitest's type-test support using `expectTypeOf` and `@ts-expect-error`. The additional `typescript-compiler` dependency provides the compiler API; the project's TypeScript 7 package provides the build and type-check CLI. Unexpected errors and unused expected-error directives fail the checks.

`formulation-coverage.test.ts` uses the official Gherkin parser and compiler to check the 247 scenario IDs, 1,621 expanded cases, and 560 unique API/type combinations. The executable bindings check the corresponding behavior.

## Edit

Update the matching step binding when changing a formulation. Example cells are executable inputs and expectations. New step wording requires a binding, and changed DataTables must remain supported by their fixture or assertion helpers. Feature and binding changes trigger watch-mode reruns.

Runtime bindings import the public source entry points, so source edits can trigger watch-mode reruns. Package-boundary checks and declaration checks use `dist/`; build before running `npx vp test` directly, and rebuild after changing emitted declarations during a watch session. `npm run lint`, `npm run format:check`, and `npm run format` expose the Vite+ tools separately. Formatting excludes `docs/behavior/` to preserve the reviewed formulations.
