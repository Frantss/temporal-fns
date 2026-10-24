# Behavior specification

This is a documentation-only Gherkin draft for all 56 public functions. It translates the existing API proposal into consumer-visible examples. No step definitions, test runner, tests, implementation, package settings, or dependencies are added or changed.

The API proposal is the source of expected behavior. Existing source and tests are evidence of current behavior only. An implementation result does not settle an unspecified rule. The discovery record separates accepted decisions and unspecified details from the supported specification. This draft does not imply new user acceptance or passing system tests.

## Reading the suite

Start with [discovery.md](discovery.md), then [coverage.md](coverage.md). The [review findings](review.md) distinguish specification corrections from the known implementation discrepancy. Feature files are grouped by behavior rather than implementation modules. Each scenario has a stable `@case-...` identifier. `@source-...` tags resolve through the table below. `@derived` marks concrete examples derived from those rules. Type acceptance is covered separately from value semantics.

Gherkin here is a formulation, without executable bindings. A function name identifies a public API call. JSON-shaped options and arrays describe caller-visible values. An omitted option means the options argument or property is absent; explicit `undefined` is stated separately. A thrown error is asserted only by class when the source defines that class. Error messages and validation order are not specified.

Temporal kind names are explicit. An ISO string following a kind names a value of that kind, rather than a string argument. Date-only values have no implicit zone; `Z` identifies UTC instants; bracketed zones identify zoned values. Comparisons of returned Temporal values mean equal public fields, kind, calendar, and zone where relevant. Object identity is asserted separately when promised. Duration examples assert components and do not imply balancing.

Inputs are valid ISO-calendar Temporal objects unless a scenario says otherwise. A host-zone or clock condition is a starting condition, not a request to change global settings. Locale text follows the host's Intl data; examples pin the locale and assert semantic parts where whitespace or punctuation can vary. Historical-zone scenarios assume host data containing the stated transition. The suite does not promise identical time-zone databases across hosts.

## Source map

| Tag                                 | Authoritative source                                                                                                                                                                                  |
| ----------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `@source-conventions`               | [Conventions](../api-proposal.md#conventions)                                                                                                                                                         |
| `@source-types`                     | [Type coverage](../api-proposal.md#type-coverage), [PlainYearMonth](../api-proposal.md#plainyearmonth-support), [PlainMonthDay and PlainTime](../api-proposal.md#plainmonthday-and-plaintime-support) |
| `@source-format`                    | [Formatting](../api-proposal.md#formatting)                                                                                                                                                           |
| `@source-parse`                     | [Pattern parsing and validation](../api-proposal.md#pattern-parsing-and-validation)                                                                                                                   |
| `@source-duration`                  | [Duration formatting and parsing](../api-proposal.md#duration-formatting-and-parsing)                                                                                                                 |
| `@source-boundaries`                | [Calendar boundaries](../api-proposal.md#calendar-boundaries)                                                                                                                                         |
| `@source-comparisons`               | [Calendar comparisons](../api-proposal.md#calendar-comparisons)                                                                                                                                       |
| `@source-relative`                  | [Relative descriptions](../api-proposal.md#relative-descriptions)                                                                                                                                     |
| `@source-range`                     | Month/year total paragraphs in [Relative descriptions](../api-proposal.md#relative-descriptions), including the reviewed native-error rule                                                            |
| `@source-selection`                 | [Collection selection](../api-proposal.md#collection-selection)                                                                                                                                       |
| `@source-intervals`                 | [Intervals and sequences](../api-proposal.md#intervals-and-sequences)                                                                                                                                 |
| `@source-business`                  | [Business days, weekdays, quarters, and week numbering](../api-proposal.md#business-days-weekdays-quarters-and-week-numbering)                                                                        |
| `@source-adapters`                  | [Optional widget adapters](../api-proposal.md#optional-widget-adapters)                                                                                                                               |
| `@source-package`                   | [README setup](../../README.md#setup), [API](../../README.md#api), [Types and time zones](../../README.md#types-and-time-zones)                                                                       |
| `@source-D01` through `@source-D07` | User decisions recorded in [discovery.md](discovery.md), confirmed in this conversation                                                                                                               |

## Scope and verification

The suite covers signatures as observable type acceptance, successful values, invalid inputs and configuration, options and defaults, partial types, precision, identity, immutability, calendar boundaries, DST gaps and folds, skipped dates, and supported range behavior. Compile-time enforcement is described as a consumer contract, without adding TypeScript tests.

Ordinary Temporal arithmetic, ISO parsing, field access, and zone conversion are used to describe inputs and expected relationships. They are not proposed library exports. No new wrappers, holiday calendars, non-ISO calendar support, localized phrase catalogs, or additional parser tokens are introduced.

Specification validation consists of source review, unique-case and source-link checks, Examples-table checks, and API coverage reconciliation. No system tests are run for this task. Parser availability and final counts are recorded in coverage.md. Pending decisions are not counted as settled scenarios.
