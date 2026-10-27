@source-comparisons @source-types @source-conventions @derived
Feature: Compare calendar periods in an explicit shared context

  @case-CMP-001
  Scenario Outline: Period equality checks the period and its year
    Given PlainDate values "<first>" and "<second>"
    When <function> is called with those values
    Then the result is <result>
    Examples:
      | function      | first      | second     | result |
      | isSameDay     | 2026-10-23 | 2026-10-23 | true   |
      | isSameDay     | 2026-10-23 | 2026-10-24 | false  |
      | isSameWeek    | 2026-10-18 | 2026-10-24 | true   |
      | isSameWeek    | 2026-10-24 | 2026-10-25 | false  |
      | isSameISOWeek | 2026-10-19 | 2026-10-25 | true   |
      | isSameISOWeek | 2026-10-18 | 2026-10-19 | false  |
      | isSameMonth   | 2026-10-01 | 2026-10-31 | true   |
      | isSameMonth   | 2026-10-31 | 2026-11-01 | false  |
      | isSameMonth   | 2025-10-23 | 2026-10-23 | false  |
      | isSameQuarter | 2026-10-01 | 2026-12-31 | true   |
      | isSameQuarter | 2026-09-30 | 2026-10-01 | false  |
      | isSameQuarter | 2025-10-23 | 2026-10-23 | false  |
      | isSameYear    | 2026-01-01 | 2026-12-31 | true   |
      | isSameYear    | 2025-12-31 | 2026-01-01 | false  |

  @case-CMP-002
  Scenario Outline: Plain date-time comparisons ignore clocks
    Given PlainDateTime values "2026-10-23T00:00" and "2026-10-23T23:59:59.999999999"
    When <function> is called
    Then the result is true
    Examples:
      | function      |
      | isSameDay     |
      | isSameWeek    |
      | isSameISOWeek |
      | isSameMonth   |
      | isSameQuarter |
      | isSameYear    |

  @case-CMP-003
  Scenario Outline: Week equality crosses a calendar-year boundary
    Given PlainDate values "2025-12-31" and "2026-01-01"
    When <function> is called
    Then the result is true
    Examples:
      | function      |
      | isSameWeek    |
      | isSameISOWeek |

  @case-CMP-004
  Scenario: Equal week numbers in different years do not imply equal weeks
    Given PlainDate values "2025-01-01" and "2026-01-01"
    And each has ISO week number 1
    When isSameISOWeek is called
    Then the result is false

  @case-CMP-005
  Scenario Outline: Custom week starts change equality at the chosen boundary
    Given PlainDate values "2026-10-24" and "2026-10-25"
    When isSameWeek is called with weekStartsOn <weekday>
    Then the result is <result>
    Examples:
      | weekday | result |
      | 0       | false  |
      | 1       | true   |
      | 6       | true   |

  @case-CMP-011
  Scenario Outline: Every instant calendar comparison requires a zone
    Given two Instants both equal to "2026-10-23T12:00Z"
    When <function> is called with omitted timeZone
    Then it throws a missing-zone error
    Examples:
      | function      |
      | isSameDay     |
      | isSameWeek    |
      | isSameISOWeek |
      | isSameMonth   |
      | isSameQuarter |
      | isSameYear    |

  @case-CMP-012
  Scenario Outline: Plain calendar comparisons reject zone context
    Given two PlainDate values both equal to "2026-10-23"
    When <function> is called with timeZone "UTC"
    Then it throws an invalid-zone-context error
    Examples:
      | function      |
      | isSameDay     |
      | isSameWeek    |
      | isSameISOWeek |
      | isSameMonth   |
      | isSameQuarter |
      | isSameYear    |

  @case-CMP-006
  Scenario Outline: Partial months compare only at their supported precision
    Given PlainYearMonth values "2026-10" and "<other>"
    When <function> is called
    Then the result is <result>
    Examples:
      | function      | other   | result |
      | isSameMonth   | 2026-10 | true   |
      | isSameMonth   | 2026-11 | false  |
      | isSameQuarter | 2026-12 | true   |
      | isSameQuarter | 2026-09 | false  |
      | isSameYear    | 2026-01 | true   |
      | isSameYear    | 2025-10 | false  |

  @case-CMP-007
  Scenario Outline: Instant comparisons use the supplied zone
    Given Instants "2026-01-01T00:30Z" and "2026-01-01T03:30Z"
    When isSameDay is called with timeZone "<zone>"
    Then the result is <result>
    Examples:
      | zone               | result |
      | UTC                | true   |
      | America/Montevideo | false  |

  @case-CMP-008
  Scenario Outline: Different zoned inputs require a common viewing zone
    Given the same Instant "2026-01-01T01:00Z" viewed in UTC and America/New_York
    When <function> is called with those ZonedDateTime values and omitted timeZone
    Then it throws a missing-common-zone error
    When <function> is called with those values and timeZone "UTC"
    Then the result is true
    And neither input's zone changes
    Examples:
      | function      |
      | isSameDay     |
      | isSameWeek    |
      | isSameISOWeek |
      | isSameMonth   |
      | isSameQuarter |
      | isSameYear    |

  @case-CMP-009
  Scenario Outline: Binary functions reject mixed kinds
    Given a PlainDate "2026-10-23" and a PlainDateTime "2026-10-23T00:00"
    When <function> is called with those values
    Then it throws an incompatible-kind error
    Examples:
      | function      |
      | isSameDay     |
      | isSameWeek    |
      | isSameISOWeek |
      | isSameMonth   |
      | isSameQuarter |
      | isSameYear    |

  @case-CMP-010
  Scenario Outline: Week equality can be decided without constructing an unavailable start
    Given PlainDate values "-271821-04-19" and "-271821-04-20"
    When isSameWeek is called with weekStartsOn <weekday>
    Then the result is <result>
    Examples:
      | weekday | result |
      | 0       | true   |
      | 1       | true   |
      | 2       | false  |
      | 3       | true   |
      | 4       | true   |
      | 5       | true   |
      | 6       | true   |
