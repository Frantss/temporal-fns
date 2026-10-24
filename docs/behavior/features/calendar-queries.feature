@source-business @source-types @source-conventions @derived
Feature: Navigate weekdays and query quarters and week grids

  @case-CAL-001
  Scenario Outline: Weekday navigation is strictly next or previous
    Given a PlainDate "2026-10-22"
    When <function> is called with weekday <weekday>
    Then the result is PlainDate "<result>"
    Examples:
      | function    | weekday | result     |
      | nextDay     | 4       | 2026-10-29 |
      | previousDay | 4       | 2026-10-15 |
      | nextDay     | 5       | 2026-10-23 |
      | previousDay | 3       | 2026-10-21 |
      | nextDay     | 0       | 2026-10-25 |
      | previousDay | 0       | 2026-10-18 |

  @case-CAL-002
  Scenario: Date-time navigation preserves the local clock and kind
    Given a PlainDateTime "2026-10-22T12:34:56.123456789"
    When nextDay is called with weekday 5
    Then the result is PlainDateTime "2026-10-23T12:34:56.123456789"

  @case-CAL-003
  Scenario Outline: A missing weekday occurrence is skipped rather than returning another weekday
    Given a ZonedDateTime "<value>"
    And the host data skips December 30, 2011 in Pacific/Apia
    When <function> is called with weekday 5
    Then the result is ZonedDateTime "<result>"
    And its weekday is Friday
    Examples:
      | function    | value                          | result                               |
      | nextDay     | 2011-12-29T12:00[Pacific/Apia] | 2012-01-06T12:00+14:00[Pacific/Apia] |
      | previousDay | 2011-12-31T12:00[Pacific/Apia] | 2011-12-23T12:00-10:00[Pacific/Apia] |

  @case-CAL-004
  Scenario Outline: Weekday numbers cannot wrap or be fractional
    Given a PlainDate "2026-10-22"
    When <function> is called with weekday <weekday>
    Then the call throws an invalid-weekday error
    Examples:
      | function    | weekday |
      | nextDay     | -1      |
      | nextDay     | 7       |
      | previousDay | 1.5     |
      | previousDay | NaN     |

  @case-CAL-005
  Scenario Outline: Quarters are determined by the represented ISO month
    Given a <kind> "<value>"
    When getQuarter is called
    Then the result is <quarter>
    Examples:
      | kind           | value                 | quarter |
      | PlainDate      | 2026-01-01            | 1       |
      | PlainDate      | 2026-03-31            | 1       |
      | PlainYearMonth | 2026-04               | 2       |
      | PlainDateTime  | 2026-06-30T23:59      | 2       |
      | PlainMonthDay  | 07-01                 | 3       |
      | ZonedDateTime  | 2026-09-30T23:59[UTC] | 3       |
      | PlainMonthDay  | 10-01                 | 4       |
      | PlainYearMonth | 2026-12               | 4       |

  @case-CAL-006
  Scenario Outline: Week numbers and their week-years are a pair
    Given a PlainDate "<value>"
    When getWeek and getWeekYear are called with <options>
    Then getWeek returns <week>
    And getWeekYear returns <year>
    Examples:
      | value      | options                                     | week | year |
      | 2025-12-31 | omitted options                             | 1    | 2026 |
      | 2026-01-01 | omitted options                             | 1    | 2026 |
      | 2026-01-04 | omitted options                             | 2    | 2026 |
      | 2021-01-01 | {weekStartsOn: 1, firstWeekContainsDate: 4} | 53   | 2020 |
      | 2021-01-04 | {weekStartsOn: 1, firstWeekContainsDate: 4} | 1    | 2021 |
      | 2026-01-01 | {weekStartsOn: 0, firstWeekContainsDate: 7} | 52   | 2025 |
      | 2026-01-04 | {weekStartsOn: 0, firstWeekContainsDate: 7} | 1    | 2026 |

  @case-CAL-007
  Scenario Outline: Every week-start and first-week anchor combination follows the containing week rule
    Given a PlainDate "<value>"
    When getWeek and getWeekYear are called for each weekStartsOn from 0 through 6 and each firstWeekContainsDate from 1 through 7
    Then the first week of the returned week-year contains its January firstWeekContainsDate
    And it begins on weekStartsOn
    And the input lies in the returned 1-based seven-date week
    And the input is on or after the first week start of the returned week-year
    And the input is strictly before the first week start of the following week-year
    And the returned week is between 1 and the number of weeks in that week-year
    Examples:
      | value      |
      | 1999-12-31 |
      | 2000-01-01 |
      | 2000-12-31 |
      | 2001-01-01 |
      | 2026-01-07 |

  @case-CAL-008
  Scenario Outline: Week-of-month counts intersecting grid rows
    Given a PlainDate "<value>"
    When getWeekOfMonth is called with <options>
    Then the result is <week>
    Examples:
      | value      | options           | week |
      | 2026-05-01 | omitted options   | 1    |
      | 2026-05-03 | omitted options   | 2    |
      | 2026-05-31 | omitted options   | 6    |
      | 2026-05-31 | {weekStartsOn: 1} | 5    |
      | 2026-02-01 | omitted options   | 1    |
      | 2026-02-28 | omitted options   | 4    |

  @case-CAL-009
  Scenario Outline: Month grid size needs a year and month but does not need a day
    Given a <kind> "<value>"
    When getWeeksInMonth is called with <options>
    Then the result is <weeks>
    Examples:
      | kind           | value            | options           | weeks |
      | PlainYearMonth | 2026-02          | omitted options   | 4     |
      | PlainDate      | 2026-02-28       | {weekStartsOn: 1} | 5     |
      | PlainYearMonth | 2026-05          | omitted options   | 6     |
      | PlainDateTime  | 2026-05-31T23:59 | {weekStartsOn: 1} | 5     |
      | PlainYearMonth | 2024-02          | omitted options   | 5     |

  @case-CAL-010
  Scenario Outline: First-week anchors are dates from 1 through 7
    Given a PlainDate "2026-01-01"
    When <function> is called with firstWeekContainsDate <anchor>
    Then the call throws an invalid-option error
    Examples:
      | function    | anchor |
      | getWeek     | 0      |
      | getWeek     | 8      |
      | getWeekYear | 1.5    |
      | getWeekYear | NaN    |

  @case-CAL-011
  Scenario Outline: Calendar queries use a zoned value's local calendar fields
    Given Instant "2026-01-01T01:00Z" viewed as a ZonedDateTime in "<zone>"
    When getQuarter and getWeekYear are called with omitted options
    Then getQuarter returns <quarter>
    And getWeekYear returns 2026
    Examples:
      | zone             | quarter |
      | UTC              | 1       |
      | America/New_York | 4       |

  @case-CAL-012
  Scenario: Weekday navigation reports an unavailable result at the range limit
    Given a PlainDate "+275760-09-13"
    When nextDay is called with the input's own weekday number
    Then the call throws RangeError

  @case-CAL-013
  Scenario Outline: Every week-grid query validates its weekday boundary
    Given a PlainDate "2026-10-23"
    When <function> is called with weekStartsOn <weekday>
    Then the call throws an invalid-option error
    Examples:
      | function        | weekday |
      | getWeek         | -1      |
      | getWeek         | 7       |
      | getWeekYear     | -1      |
      | getWeekYear     | 7       |
      | getWeekOfMonth  | -1      |
      | getWeekOfMonth  | 7       |
      | getWeeksInMonth | -1      |
      | getWeeksInMonth | 7       |

  @case-CAL-014
  Scenario Outline: Month grids at the limits do not invent a required reference day
    Given a PlainYearMonth "<value>"
    When getWeeksInMonth is called with omitted options
    Then the result is 5
    Examples:
      | value      |
      | -271821-04 |
      | +275760-09 |
