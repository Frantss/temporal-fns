@source-relative @source-range @derived
Feature: Preserve calendar totals and native limits at the Temporal range edges

  @case-RNG-001
  Scenario Outline: Plain date totals span the full representable range
    Given PlainDate base "-271821-04-19" and value "+275760-09-13"
    When formatDistanceStrict is called with unit "<unit>" and roundingMethod "<rounding>"
    Then the text is "<text>"
    Examples:
      | unit  | rounding | text           |
      | month | floor    | 6570976 months |
      | month | trunc    | 6570976 months |
      | month | round    | 6570977 months |
      | month | ceil     | 6570977 months |
      | year  | floor    | 547581 years   |
      | year  | trunc    | 547581 years   |
      | year  | round    | 547581 years   |
      | year  | ceil     | 547582 years   |

  @case-RNG-002
  Scenario Outline: Direction changes suffixes without changing absolute rounding
    Given PlainDate earlier "-271821-04-19" and later "+275760-09-13"
    When formatDistanceStrict is called with <value> as value, <base> as base, unit year and addSuffix true
    Then the text is "<text>"
    Examples:
      | value   | base    | text             |
      | later   | earlier | in 547581 years  |
      | earlier | later   | 547581 years ago |

  @case-RNG-003
  Scenario Outline: Instants and zoned values extend totals only in UTC or explicit fixed offsets
    Given the minimum and maximum representable Instants
    And both are viewed in zone "<zone>"
    When formatDistanceStrict is called with the later and earlier <kind> inputs and unit year
    Then the text is "547581 years"
    Examples:
      | kind                           | zone    |
      | Instant with explicit timeZone | UTC     |
      | Instant with explicit timeZone | +23:59  |
      | ZonedDateTime                  | UTC     |
      | ZonedDateTime                  | +23:59  |
      | ZonedDateTime                  | -23:59  |
      | ZonedDateTime                  | Etc/UTC |
      | ZonedDateTime                  | Etc/GMT |
      | ZonedDateTime                  | GMT     |

  @case-RNG-004
  Scenario: Plain date-times preserve their range and kind without an invented zone
    Given PlainDateTime base "-271821-04-19T00:00:00.000000001"
    And PlainDateTime value "+275760-09-13T23:59:59.999999999"
    When formatDistanceStrict is called with unit month
    Then the text is "6570977 months"
    When formatDistance is called with omitted options
    Then the text is "about 547581 years"

  @case-RNG-005
  Scenario Outline: Exact plain anniversaries at either bound require no extra representable date
    Given PlainDate value "<boundary>"
    And its base is <direction> one <unit> away using constrained calendar arithmetic
    When formatDistanceStrict is called with unit "<unit>"
    Then the text is "1 <unit>"
    Examples:
      | boundary      | direction | unit  |
      | -271821-04-19 | later     | month |
      | -271821-04-19 | later     | year  |
      | +275760-09-13 | earlier   | month |
      | +275760-09-13 | earlier   | year  |

  @case-RNG-006
  Scenario Outline: Out-of-range anniversary fractions retain the nanosecond around a half-month
    Given PlainDateTime base "+275760-08-14T00:00"
    And value is 15 days and 12 hours after base plus <nanoseconds> nanoseconds
    And the next constrained month anniversary is beyond the representable range
    When formatDistanceStrict is called with unit month and roundingMethod round
    Then the text is "<text>"
    Examples:
      | nanoseconds | text     |
      | -1          | 0 months |
      | 0           | 1 month  |
      | 1           | 1 month  |

  @case-RNG-007
  Scenario Outline: Successful named-zone totals retain their original-year native result
    Given the <edge> representable Instant viewed in named zone "<zone>" as the base
    And a same-zone value 50 calendar days toward the interior
    And the runtime's native month and year totals for those original values succeed
    When formatDistanceStrict is called for each unit with each supported roundingMethod
    Then each text uses the absolute native total rounded by that method
    And no offset from a date 400 years away substitutes for the original-year calculation
    Examples:
      | edge    | zone                |
      | minimum | America/New_York    |
      | maximum | America/New_York    |
      | minimum | Australia/Lord_Howe |
      | maximum | Australia/Lord_Howe |
      | minimum | Pacific/Apia        |
      | maximum | Pacific/Apia        |
      | minimum | Africa/Abidjan      |
      | maximum | Africa/Abidjan      |

  @case-RNG-008
  Scenario: An observed zero offset does not turn a named zone into a fixed offset
    Given the maximum Instant viewed in "Africa/Abidjan" has offset "+00:00"
    And the same-zone base is 50 calendar days earlier
    And the native year total cannot resolve its required anniversary
    When formatDistanceStrict is called with unit year
    Then it throws the native RangeError
    When both values are instead explicitly viewed in "+00:00"
    Then the same function returns "0 years"

  @case-RNG-009
  Scenario: Exact named-zone anniversaries still preserve a native range error
    Given the maximum Instant viewed in "America/New_York" as the value
    And its base is one constrained calendar month earlier
    And the native month total throws RangeError
    When formatDistanceStrict is called with unit month
    Then it reports that native RangeError rather than inventing a successful total

  @case-RNG-010
  Scenario Outline: Fixed-unit distances do not require a year anniversary
    Given PlainDate base "-271821-04-19" and value "+275760-09-13"
    When formatDistanceStrict is called with unit "<unit>"
    Then the text is "<text>"
    Examples:
      | unit | text             |
      | day  | 200000001 days   |
      | hour | 4800000024 hours |

  @case-RNG-011
  Scenario Outline: ToNow retains boundary support in explicit UTC context
    Given the current instant is "2026-10-23T12:00Z"
    And a <kind> value "<value>"
    When formatDistanceToNowStrict is called with timeZone "UTC" and unit year
    Then it returns "<years> years"
    When formatDistanceToNow is called with timeZone "UTC"
    Then it returns "about <years> years"
    Examples:
      | kind          | value                            | years  |
      | PlainDate     | -271821-04-19                    | 273848 |
      | PlainDate     | +275760-09-13                    | 273734 |
      | PlainDateTime | -271821-04-19T00:00:00.000000001 | 273848 |
      | PlainDateTime | +275760-09-13T23:59:59.999999999 | 273734 |

  @case-RNG-012
  Scenario Outline: A failing original-year named-zone total retains its native error
    Given the <edge> representable Instant viewed in named zone "<zone>" as the value
    And a same-zone base 50 calendar days toward the interior
    And the runtime's native total for unit "<unit>" throws RangeError for those original values
    When formatDistanceStrict is called with that unit
    Then it reports the original native RangeError
    And it does not use another year to synthesize a successful total
    Examples:
      | edge    | zone                | unit  |
      | minimum | America/New_York    | month |
      | maximum | America/New_York    | year  |
      | minimum | Australia/Lord_Howe | year  |
      | maximum | Australia/Lord_Howe | month |
      | minimum | Pacific/Apia        | month |
      | maximum | Pacific/Apia        | year  |
      | minimum | Africa/Abidjan      | year  |
      | maximum | Africa/Abidjan      | month |

  @case-RNG-013
  Scenario Outline: Reverse months and both year directions retain nanosecond half-unit boundaries
    Given PlainDateTime base "<base>"
    And PlainDateTime value "<midpoint>" plus <nanoseconds> nanoseconds
    And the neighboring anniversary required for unit "<unit>" is outside the representable range
    When formatDistanceStrict is called with that unit and roundingMethod round
    Then the text is "<text>"
    Examples:
      | base                | midpoint            | unit  | nanoseconds | text     |
      | +275760-03-01T00:00 | +275760-08-30T12:00 | year  | -1          | 0 years  |
      | +275760-03-01T00:00 | +275760-08-30T12:00 | year  | 0           | 1 year   |
      | +275760-03-01T00:00 | +275760-08-30T12:00 | year  | 1           | 1 year   |
      | -271821-12-01T00:00 | -271821-06-01T12:00 | year  | -1          | 1 year   |
      | -271821-12-01T00:00 | -271821-06-01T12:00 | year  | 0           | 1 year   |
      | -271821-12-01T00:00 | -271821-06-01T12:00 | year  | 1           | 0 years  |
      | -271821-05-15T00:00 | -271821-04-30T00:00 | month | -1          | 1 month  |
      | -271821-05-15T00:00 | -271821-04-30T00:00 | month | 0           | 1 month  |
      | -271821-05-15T00:00 | -271821-04-30T00:00 | month | 1           | 0 months |
