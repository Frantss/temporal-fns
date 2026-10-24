@source-business @source-conventions @derived
Feature: Count and navigate working calendar dates

  @case-BUS-001
  Scenario Outline: Business-day addition counts dates reached after moving
    Given a PlainDate "<value>"
    When <function> is called with amount <amount> and omitted options
    Then the result is PlainDate "<result>"
    Examples:
      | function        | value      | amount | result     |
      | addBusinessDays | 2026-10-22 | 1      | 2026-10-23 |
      | addBusinessDays | 2026-10-23 | 1      | 2026-10-26 |
      | addBusinessDays | 2026-10-23 | 5      | 2026-10-30 |
      | addBusinessDays | 2026-10-26 | -1     | 2026-10-23 |
      | addBusinessDays | 2026-10-24 | 1      | 2026-10-26 |
      | addBusinessDays | 2026-10-25 | -1     | 2026-10-23 |
      | subBusinessDays | 2026-10-26 | 1      | 2026-10-23 |
      | subBusinessDays | 2026-10-23 | -1     | 2026-10-26 |
      | subBusinessDays | 2026-10-30 | 5      | 2026-10-23 |

  @case-BUS-002
  Scenario Outline: Zero preserves the original object even on a weekend
    Given a PlainDate "2026-10-24"
    When <function> is called with amount 0 and valid options
    Then the result is the same input object
    Examples:
      | function        |
      | addBusinessDays |
      | subBusinessDays |

  @case-BUS-003
  Scenario Outline: Configurable weekends affect arithmetic and are independent of week starts
    Given a PlainDate "2026-10-22"
    When <function> is called with amount <amount> and weekendDays <weekends>
    Then the result is PlainDate "<result>"
    Examples:
      | function        | amount | weekends      | result     |
      | addBusinessDays | 1      | [5,6]         | 2026-10-25 |
      | subBusinessDays | 1      | [5,6]         | 2026-10-21 |
      | addBusinessDays | 1      | [5,5,6]       | 2026-10-25 |
      | addBusinessDays | 10     | []            | 2026-11-01 |
      | subBusinessDays | 1      | []            | 2026-10-21 |
      | addBusinessDays | 1      | [0,1,2,3,4,6] | 2026-10-23 |

  @case-BUS-004
  Scenario Outline: Weekend and business predicates are exact inverses
    Given a PlainDate "<value>"
    When isWeekend and isBusinessDay are called with <context>
    Then isWeekend returns <weekend>
    And isBusinessDay returns <business>
    Examples:
      | value      | context           | weekend | business |
      | 2026-10-23 | omitted options   | false   | true     |
      | 2026-10-24 | omitted options   | true    | false    |
      | 2026-10-25 | omitted options   | true    | false    |
      | 2026-10-23 | weekendDays [5,6] | true    | false    |
      | 2026-10-25 | weekendDays [5,6] | false   | true     |
      | 2026-10-24 | weekendDays []    | false   | true     |

  @case-BUS-005
  Scenario Outline: Business differences count the lower-inclusive upper-exclusive date range
    Given PlainDate earlier "<earlier>" and later "<later>"
    When differenceInBusinessDays is called as later, earlier with <context>
    Then the result is <count>
    When the same inputs are passed in reverse order
    Then the result is <reverse>
    Examples:
      | earlier    | later      | context           | count | reverse |
      | 2026-10-22 | 2026-10-23 | omitted options   | 1     | -1      |
      | 2026-10-23 | 2026-10-26 | omitted options   | 1     | -1      |
      | 2026-10-24 | 2026-10-25 | omitted options   | 0     | 0       |
      | 2026-10-23 | 2026-10-23 | omitted options   | 0     | 0       |
      | 2026-10-22 | 2026-10-25 | weekendDays [5,6] | 1     | -1      |
      | 2026-10-22 | 2026-10-25 | weekendDays []    | 3     | -3      |

  @case-BUS-006
  Scenario: Business differences ignore clock fields
    Given PlainDateTime earlier "2026-10-23T23:59:59.999999999" and later "2026-10-26T00:00"
    When differenceInBusinessDays is called as later, earlier
    Then the result is 1

  @case-BUS-007
  Scenario: Zoned arithmetic preserves local clock fields across DST
    Given a ZonedDateTime "2026-03-06T12:34:56.123456789[America/New_York]"
    When addBusinessDays is called with amount 1
    Then the result is ZonedDateTime "2026-03-09T12:34:56.123456789-04:00[America/New_York]"
    And the original value has offset "-05:00"

  @case-BUS-008
  Scenario: Compatible handling applies when the target working clock time is skipped
    Given a ZonedDateTime "2026-03-07T02:30[America/New_York]"
    When addBusinessDays is called with amount 1 and weekendDays []
    Then the result is ZonedDateTime "2026-03-08T03:30-04:00[America/New_York]"

  @case-BUS-009
  Scenario Outline: Entirely skipped dates are never counted as working dates
    Given a ZonedDateTime "<value>"
    And the host data skips December 30, 2011 in Pacific/Apia
    When <function> is called with amount <amount> and <context>
    Then the result is ZonedDateTime "<result>"
    Examples:
      | function        | value                          | amount | context         | result                               |
      | addBusinessDays | 2011-12-29T12:00[Pacific/Apia] | 1      | omitted options | 2012-01-02T12:00+14:00[Pacific/Apia] |
      | subBusinessDays | 2012-01-02T12:00[Pacific/Apia] | 1      | omitted options | 2011-12-29T12:00-10:00[Pacific/Apia] |
      | addBusinessDays | 2011-12-29T12:00[Pacific/Apia] | 1      | weekendDays []  | 2011-12-31T12:00+14:00[Pacific/Apia] |
      | subBusinessDays | 2011-12-31T12:00[Pacific/Apia] | 1      | weekendDays []  | 2011-12-29T12:00-10:00[Pacific/Apia] |

  @case-BUS-010
  Scenario Outline: Zoned differences exclude skipped working dates
    Given ZonedDateTime earlier "2011-12-29T12:00[Pacific/Apia]" and later "<later>"
    And the host data skips December 30, 2011 in Pacific/Apia
    When differenceInBusinessDays is called as later, earlier with <context>
    Then the result is 1
    And reversing the arguments returns -1
    Examples:
      | later                          | context         |
      | 2012-01-02T12:00[Pacific/Apia] | omitted options |
      | 2011-12-31T12:00[Pacific/Apia] | weekendDays []  |

  @case-BUS-011
  Scenario Outline: Invalid weekends are rejected even when the amount is zero
    Given a PlainDate "2026-10-23"
    When <function> is called with amount 0 and weekendDays <weekends>
    Then the call throws an invalid-weekend error
    Examples:
      | function        | weekends                           |
      | addBusinessDays | [0,1,2,3,4,5,6]                    |
      | subBusinessDays | [0,1,2,3,4,5,6]                    |
      | addBusinessDays | [-1]                               |
      | subBusinessDays | [7]                                |
      | addBusinessDays | [1.5]                              |
      | addBusinessDays | a sparse array with one empty slot |

  @case-BUS-012
  Scenario Outline: Working-date amounts are integers
    Given a PlainDate "2026-10-23"
    When <function> is called with amount <amount>
    Then the call throws an invalid-amount error
    Examples:
      | function        | amount   |
      | addBusinessDays | 1.5      |
      | subBusinessDays | -1.5     |
      | addBusinessDays | NaN      |
      | subBusinessDays | Infinity |

  @case-BUS-013
  Scenario: Different zoned differences require an explicit comparison zone
    Given the same Instant "2026-01-01T01:00Z" viewed in UTC and America/New_York
    When differenceInBusinessDays is called with those ZonedDateTime values and omitted timeZone
    Then the call throws a missing-common-zone error
    When it is called with timeZone "UTC"
    Then the result is 0

  @case-BUS-014
  Scenario: Arithmetic that cannot produce a representable working date reports failure
    Given a PlainDate "+275760-09-13"
    When addBusinessDays is called with amount 1 and weekendDays []
    Then the call throws RangeError

  @case-BUS-015 @source-D06
  Scenario Outline: Business-day amounts cannot lose integer precision
    Given a PlainDate "2026-10-23"
    When <function> is called with amount <amount>
    Then it throws an invalid-amount error
    Examples:
      | function        | amount            |
      | addBusinessDays | 9007199254740992  |
      | addBusinessDays | -9007199254740992 |
      | subBusinessDays | 9007199254740992  |
      | subBusinessDays | -9007199254740992 |

  @case-BUS-016
  Scenario: Weekend predicates use the value's own local date
    Given Instant "2026-10-26T01:00Z" viewed as ZonedDateTime values in UTC and America/New_York
    When isWeekend is called with default options on the UTC value
    Then the result is false
    When isWeekend is called on the New York value
    Then the result is true
    When isBusinessDay is called on the New York value
    Then the result is false

  @case-BUS-017
  Scenario Outline: All weekend consumers validate a configuration with no working day
    Given compatible valid inputs for <function> using PlainDate "2026-10-23"
    When <function> is called with weekendDays [0,1,2,3,4,5,6]
    Then it throws RangeError
    Examples:
      | function                 |
      | isWeekend                |
      | isBusinessDay            |
      | differenceInBusinessDays |
      | eachWeekendOfInterval    |
