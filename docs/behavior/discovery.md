# Behavior discovery

Subject: the public Temporal utility API. Consumer: calling JavaScript or TypeScript code. Observable boundary: exported function calls, return values, thrown errors, identities, and effects on caller-owned values and global settings.

Baseline: the API proposal and README at commit `efcd7c8`. All 54 root exports and both `/calendar` adapters are included. This is standalone discovery and formulation, without test integration or implementation work.

## Existing agreements

The proposal remains authoritative for data-first arguments, per-call options, eight Temporal types with operation-specific support, ISO-only calendar operations, same-kind inputs, explicit instant zones, partial precision, error-first `try*` tuples, configurable weekends, interval endpoints and steps, and English relative/duration phrases. Ordinary arithmetic stays native.

The completed range review also establishes that successful native totals remain authoritative. Full-range month/year extension is limited to plain values, UTC aliases recognized by Intl, and explicit fixed offsets. Other named zones retain original native errors. A 400-year Gregorian cycle is not authority for named-zone extrapolation.

The suite expresses these existing definitions without requesting approval again. It does not treat every existing branch, error message, or optimization as a requirement.

## Decisions confirmed during discovery

| ID  | Area and example                                                                                                | Current observation                                                                                               | Recommended rule                                                                                                    | Status                                |
| --- | --------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- | ------------------------------------- |
| D01 | `areIntervalsOverlapping`: `[12:00,12:00]` strictly inside `[11:00,13:00]`                                      | Returns true without inclusive mode                                                                               | Treat the interval as a point; strictly interior points overlap, while touching endpoints require inclusive mode    | Accepted by user in this conversation |
| D02 | `format`: `XX`/`XXX` for an offset of `+00:09:21`                                                               | Emits `+0009`/`+00:09`                                                                                            | Retain minute precision and discard offset seconds, consistent with the token's precision                           | Accepted by user in this conversation |
| D03 | `parse`/`tryParse`/`isMatch`: empty or literal-only matching pattern                                            | Accepts the reference fields unchanged                                                                            | Accept complete literal matches and preserve reference fields                                                       | Accepted by user in this conversation |
| D04 | A required period boundary is outside the Temporal range, including the first containing boundary of a sequence | Throws when constructing that boundary                                                                            | Throw rather than clip the boundary or invent a partial period                                                      | Accepted by user in this conversation |
| D05 | Human duration unit case and surrounding whitespace                                                             | Accepts case-insensitive units and trims the outside                                                              | Accept case-insensitive units and trim surrounding whitespace                                                       | Accepted by user in this conversation |
| D06 | Numeric business-day amounts and interval steps                                                                 | Requires safe integers; steps are positive                                                                        | Require JavaScript safe integers in [-9007199254740991, 9007199254740991]; interval steps additionally exceed zero  | Accepted by user in this conversation |
| D07 | Month-only interval from `-271821-04` through `-271821-05`                                                      | Native month addition throws on an unavailable reference date; the sequence catch currently truncates after April | Require both representable months; an internal native limitation must not silently truncate the month-only interval | Accepted by user during this review   |

The user accepted the recommended rule for D01 through D07. Dependent scenarios carry the corresponding source tag. The rest of the suite derives from the existing proposal; accepting these seven decisions does not imply review of every scenario.

## Details without a specified consumer promise

Error message wording, which invalid argument is checked first, object identity of newly calculated Temporal values, sparse collections of Temporal inputs, duck-typed objects, proxies, cross-realm branding, unknown option keys and performance complexity have no settled consumer promise here. They are not inferred from private code. This does not exclude any public function or documented rule.

D04 settles missing-boundary behavior: if a required start or end is outside the representable range, the call throws rather than clipping. A sequence can still stop after valid emitted periods when a further step is already beyond its endpoint. This does not require constructing an extra out-of-range result.

## Evidence and conflicts

The source currently accepts literal-only patterns and truncates historical offset seconds. These observations motivated D02 and D03. The user has now accepted both behaviors, making their definitions normative for this suite.

The proposal uses two descriptions for zoned sequence steps: calendar units generally, and elapsed hours/minutes specifically. The specific clock-sequence rule governs `eachHourOfInterval` and `eachMinuteOfInterval`; calendar steps govern days/weeks/months. The scenarios make that distinction explicit.

The package imports global Temporal lazily. Runtime availability is therefore specified at package import and at calls requiring Temporal constructors, rather than claiming every call fails if Temporal is absent.

This is not an implementation conformance certification. The scenarios have been reviewed against their sources, with one source-level discrepancy recorded below; the full suite has not been executed against the library. A mismatch must be assessed without treating current code as automatic authority.

## Review finding requiring future implementation work

SEQ-027 is now explicitly supported by D07. Native Node 26.12.1 rejects `Temporal.PlainYearMonth.from('-271821-04').add({months: 1})`. Reading `src/collections.ts` shows that the sequence catches that RangeError and stops, so the current implementation truncates the interval after April. This is an implementation discrepancy, not a reason to weaken the accepted expectation. No source or tests are changed in this documentation review.

D04 and D07 address different boundaries. A PlainDate month start on April 1 is an unavailable required result and must throw. April as a PlainYearMonth is representable; its sequence must reach the representable May endpoint. A speculative step already beyond the endpoint may still terminate normally.
