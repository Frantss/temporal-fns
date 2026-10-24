@source-boundaries @source-types @source-conventions @derived
Feature: Locate calendar boundaries while preserving Temporal kind

  @case-BND-001
  Scenario Outline: Plain date boundaries return complete dates
    Given a PlainDate "2026-05-13"
    When <function> is called with omitted options
    Then the result is PlainDate "<result>"
    Examples:
      | function       | result     |
      | startOfWeek    | 2026-05-10 |
      | startOfISOWeek | 2026-05-11 |
      | startOfMonth   | 2026-05-01 |
      | startOfQuarter | 2026-04-01 |
      | startOfYear    | 2026-01-01 |
      | endOfWeek      | 2026-05-16 |
      | endOfISOWeek   | 2026-05-17 |
      | endOfMonth     | 2026-05-31 |
      | endOfQuarter   | 2026-06-30 |
      | endOfYear      | 2026-12-31 |

  @case-BND-002
  Scenario Outline: Plain date-time boundaries retain nanosecond endpoint precision
    Given a PlainDateTime "2026-05-13T14:24:36.123456789"
    When <function> is called with omitted options
    Then the result is PlainDateTime "<result>"
    Examples:
      | function       | result                        |
      | startOfWeek    | 2026-05-10T00:00:00           |
      | startOfISOWeek | 2026-05-11T00:00:00           |
      | startOfMonth   | 2026-05-01T00:00:00           |
      | startOfQuarter | 2026-04-01T00:00:00           |
      | startOfYear    | 2026-01-01T00:00:00           |
      | endOfDay       | 2026-05-13T23:59:59.999999999 |
      | endOfWeek      | 2026-05-16T23:59:59.999999999 |
      | endOfISOWeek   | 2026-05-17T23:59:59.999999999 |
      | endOfMonth     | 2026-05-31T23:59:59.999999999 |
      | endOfQuarter   | 2026-06-30T23:59:59.999999999 |
      | endOfYear      | 2026-12-31T23:59:59.999999999 |

  @case-BND-003
  Scenario Outline: Week configuration changes starts and ends together
    Given a PlainDate "2026-05-13"
    When startOfWeek and endOfWeek are called with weekStartsOn <weekday>
    Then the start is "<start>" and the end is "<end>"
    Examples:
      | weekday | start      | end        |
      | 0       | 2026-05-10 | 2026-05-16 |
      | 1       | 2026-05-11 | 2026-05-17 |
      | 3       | 2026-05-13 | 2026-05-19 |
      | 6       | 2026-05-09 | 2026-05-15 |

  @case-BND-004
  Scenario Outline: Month and quarter ends follow leap years and year boundaries
    Given a PlainDate "<value>"
    When <function> is called
    Then the result is PlainDate "<result>"
    Examples:
      | function       | value      | result     |
      | endOfMonth     | 2024-02-01 | 2024-02-29 |
      | endOfMonth     | 2025-02-01 | 2025-02-28 |
      | endOfMonth     | 2000-02-01 | 2000-02-29 |
      | endOfMonth     | 1900-02-01 | 1900-02-28 |
      | endOfMonth     | 0000-02-01 | 0000-02-29 |
      | startOfYear    | 0000-06-15 | 0000-01-01 |
      | startOfQuarter | 2026-12-31 | 2026-10-01 |
      | endOfQuarter   | 2026-12-01 | 2026-12-31 |
      | startOfWeek    | 2026-01-01 | 2025-12-28 |
      | endOfISOWeek   | 2025-12-31 | 2026-01-04 |

  @case-BND-005
  Scenario Outline: Year-month boundaries return months rather than invent days
    Given a PlainYearMonth "<value>"
    When <function> is called
    Then the result is PlainYearMonth "<result>"
    Examples:
      | function       | value   | result  |
      | startOfQuarter | 2026-05 | 2026-04 |
      | endOfQuarter   | 2026-05 | 2026-06 |
      | startOfYear    | 2026-05 | 2026-01 |
      | endOfYear      | 2026-05 | 2026-12 |
      | startOfQuarter | 2026-12 | 2026-10 |
      | endOfQuarter   | 2026-12 | 2026-12 |

  @case-BND-006
  Scenario Outline: A clock-only end of day is independent of its starting time
    Given a PlainTime "<value>"
    When endOfDay is called
    Then the result is PlainTime "23:59:59.999999999"
    Examples:
      | value              |
      | 00:00              |
      | 12:00              |
      | 23:59:59.999999999 |

  @case-BND-007
  Scenario Outline: Zoned day ends follow the actual day length
    Given a ZonedDateTime "<value>"
    When endOfDay is called
    Then the result has local time "23:59:59.999999999" and offset "<offset>"
    And it is <hours> elapsed hours minus one nanosecond after that day's earliest valid instant
    And its zone remains "America/New_York"
    Examples:
      | value                              | hours | offset |
      | 2026-03-08T12:00[America/New_York] | 23    | -04:00 |
      | 2026-11-01T12:00[America/New_York] | 25    | -05:00 |

  @case-BND-008
  Scenario: A skipped midnight produces the earliest valid start
    Given a ZonedDateTime "2018-11-04T12:00[America/Sao_Paulo]"
    And the host data skips midnight on that date
    When startOfWeek is called with default Sunday week start
    Then the result is ZonedDateTime "2018-11-04T01:00-02:00[America/Sao_Paulo]"

  @case-BND-009
  Scenario: An end boundary ends before the next existing calendar date
    Given a ZonedDateTime "2011-12-29T12:00[Pacific/Apia]"
    And the host data skips all of December 30, 2011 in that zone
    When endOfDay is called
    Then the result is one nanosecond before "2011-12-31T00:00+14:00[Pacific/Apia]"
    And its displayed date is "2011-12-29"

  @case-BND-010
  Scenario Outline: Representable date ends do not require a representable period start
    Given a PlainDate "-271821-04-19"
    When <function> is called
    Then the result is PlainDate "<result>"
    Examples:
      | function     | result        |
      | endOfMonth   | -271821-04-30 |
      | endOfQuarter | -271821-06-30 |
      | endOfYear    | -271821-12-31 |

  @case-BND-011
  Scenario: The last representable plain date-time retains its final nanosecond
    Given a PlainDateTime "+275760-09-13T12:00"
    When endOfDay is called
    Then the result is PlainDateTime "+275760-09-13T23:59:59.999999999"

  @case-BND-012
  Scenario Outline: Weekday options must use the documented numbering
    Given a PlainDate "2026-05-13"
    When <function> is called with weekStartsOn <weekday>
    Then the call throws an invalid-option error
    Examples:
      | function    | weekday |
      | startOfWeek | -1      |
      | startOfWeek | 7       |
      | startOfWeek | 1.5     |
      | endOfWeek   | -1      |
      | endOfWeek   | 7       |
      | endOfWeek   | NaN     |

  @case-BND-013 @source-D04
  Scenario Outline: Unavailable required boundaries are rejected rather than clipped
    Given a PlainDate "<value>"
    When <function> is called
    Then it throws RangeError
    And it does not return a clipped date at the representable limit
    Examples:
      | function       | value         |
      | startOfMonth   | -271821-04-19 |
      | startOfQuarter | -271821-04-19 |
      | startOfYear    | -271821-04-19 |
      | endOfMonth     | +275760-09-13 |
      | endOfQuarter   | +275760-09-13 |
      | endOfYear      | +275760-09-13 |

  @case-BND-014 @source-D04
  Scenario: A zoned day end beyond the maximum instant is unavailable
    Given the maximum representable Instant viewed as a ZonedDateTime in UTC
    When endOfDay is called
    Then it throws RangeError
    And it does not substitute the maximum instant for the actual day end

  @case-BND-015
  Scenario Outline: Every zoned boundary returns the local period boundary in the original zone
    Given a ZonedDateTime "2026-05-13T14:24:36.123456789[America/New_York]"
    When <function> is called with omitted options
    Then the result is ZonedDateTime "<result>[America/New_York]"
    Examples:
      | function       | result                              |
      | startOfWeek    | 2026-05-10T00:00-04:00              |
      | startOfISOWeek | 2026-05-11T00:00-04:00              |
      | startOfMonth   | 2026-05-01T00:00-04:00              |
      | startOfQuarter | 2026-04-01T00:00-04:00              |
      | startOfYear    | 2026-01-01T00:00-05:00              |
      | endOfDay       | 2026-05-13T23:59:59.999999999-04:00 |
      | endOfWeek      | 2026-05-16T23:59:59.999999999-04:00 |
      | endOfISOWeek   | 2026-05-17T23:59:59.999999999-04:00 |
      | endOfMonth     | 2026-05-31T23:59:59.999999999-04:00 |
      | endOfQuarter   | 2026-06-30T23:59:59.999999999-04:00 |
      | endOfYear      | 2026-12-31T23:59:59.999999999-05:00 |

  @case-BND-016 @source-D04
  Scenario: An available final week boundary is returned exactly at the date limit
    Given a PlainDate "+275760-09-13"
    When endOfWeek is called with omitted options
    Then the result is PlainDate "+275760-09-13"
    When endOfISOWeek is called
    Then it throws RangeError because its required Sunday is outside the range
