@source-intervals @source-types @source-business @source-conventions @derived
Feature: Enumerate containing periods without changing endpoint precision

  @case-SEQ-001
  Scenario Outline: Date steps include the endpoint only when reached by the configured step
    Given a PlainDate interval from "2026-10-23" through "2026-10-27"
    When eachDayOfInterval is called with <options>
    Then the resulting PlainDate sequence is <values>
    Examples:
      | options         | values                                                       |
      | omitted options | [2026-10-23, 2026-10-24, 2026-10-25, 2026-10-26, 2026-10-27] |
      | {step: 2}       | [2026-10-23, 2026-10-25, 2026-10-27]                         |
      | {step: 3}       | [2026-10-23, 2026-10-26]                                     |
      | {step: 10}      | [2026-10-23]                                                 |

  @case-SEQ-002
  Scenario: Date-time day sequences begin at each containing day's start
    Given a PlainDateTime interval from "2026-10-23T16:30" through "2026-10-25T01:00"
    When eachDayOfInterval is called
    Then the resulting PlainDateTime sequence is [2026-10-23T00:00, 2026-10-24T00:00, 2026-10-25T00:00]
    And the first result precedes the precise interval start

  @case-SEQ-003
  Scenario Outline: Week sequences enumerate containing weeks with the selected start
    Given a PlainDate interval from "2026-10-23" through "2026-10-27"
    When eachWeekOfInterval is called with <options>
    Then the resulting PlainDate sequence is <values>
    Examples:
      | options                    | values                   |
      | omitted options            | [2026-10-18, 2026-10-25] |
      | {weekStartsOn: 1}          | [2026-10-19, 2026-10-26] |
      | {weekStartsOn: 1, step: 2} | [2026-10-19]             |

  @case-SEQ-004
  Scenario Outline: Month sequences enumerate starts across year boundaries
    Given a PlainDateTime interval from "2026-10-23T16:30" through "2027-02-03T01:00"
    When eachMonthOfInterval is called with <options>
    Then the resulting PlainDateTime sequence is <values>
    Examples:
      | options         | values                                                                                     |
      | omitted options | [2026-10-01T00:00, 2026-11-01T00:00, 2026-12-01T00:00, 2027-01-01T00:00, 2027-02-01T00:00] |
      | {step: 2}       | [2026-10-01T00:00, 2026-12-01T00:00, 2027-02-01T00:00]                                     |

  @case-SEQ-005
  Scenario Outline: Month-only endpoints remain month-only values
    Given a PlainYearMonth interval from "2026-11" through "2027-02"
    When eachMonthOfInterval is called with <options>
    Then the resulting PlainYearMonth sequence is <values>
    And no result has an invented day or time zone
    Examples:
      | options         | values                               |
      | omitted options | [2026-11, 2026-12, 2027-01, 2027-02] |
      | {step: 2}       | [2026-11, 2027-01]                   |

  @case-SEQ-006
  Scenario Outline: Weekend sequences filter containing days by weekendDays
    Given a PlainDate interval from "2026-10-23" through "2026-10-27"
    When eachWeekendOfInterval is called with <options>
    Then the resulting PlainDate sequence is <values>
    Examples:
      | options                | values                   |
      | omitted options        | [2026-10-24, 2026-10-25] |
      | {weekendDays: [5,6]}   | [2026-10-23, 2026-10-24] |
      | {weekendDays: [5,5,6]} | [2026-10-23, 2026-10-24] |
      | {weekendDays: []}      | []                       |

  @case-SEQ-007
  Scenario Outline: Hour and minute sequences floor the first value
    Given a PlainTime interval from "<start>" through "<end>"
    When <function> is called with <options>
    Then the resulting PlainTime sequence is <values>
    Examples:
      | function             | start    | end      | options         | values                |
      | eachHourOfInterval   | 21:25    | 23:59    | omitted options | [21:00, 22:00, 23:00] |
      | eachHourOfInterval   | 21:25    | 23:59    | {step: 2}       | [21:00, 23:00]        |
      | eachMinuteOfInterval | 23:57:30 | 23:59:59 | omitted options | [23:57, 23:58, 23:59] |
      | eachMinuteOfInterval | 12:00:59 | 12:03:00 | {step: 2}       | [12:00, 12:02]        |

  @case-SEQ-008
  Scenario Outline: Clock-only sequences stop before midnight wrapping even for oversized steps
    Given a PlainTime interval from "00:00" through "23:59"
    When <function> is called with step <step>
    Then the resulting sequence is [00:00]
    Examples:
      | function             | step |
      | eachHourOfInterval   | 24   |
      | eachHourOfInterval   | 25   |
      | eachMinuteOfInterval | 1440 |
      | eachMinuteOfInterval | 1441 |

  @case-SEQ-009
  Scenario Outline: Date-time clock sequences can cross midnight
    Given a PlainDateTime interval from "<start>" through "<end>"
    When <function> is called
    Then the resulting PlainDateTime sequence is <values>
    Examples:
      | function             | start               | end                 | values                                                 |
      | eachHourOfInterval   | 2026-10-23T23:30    | 2026-10-24T01:05    | [2026-10-23T23:00, 2026-10-24T00:00, 2026-10-24T01:00] |
      | eachMinuteOfInterval | 2026-10-23T23:59:30 | 2026-10-24T00:01:10 | [2026-10-23T23:59, 2026-10-24T00:00, 2026-10-24T00:01] |

  @case-SEQ-010
  Scenario: Zoned hour steps skip a spring gap using elapsed hours
    Given a ZonedDateTime interval from "2026-03-08T00:30[America/New_York]" through "2026-03-08T04:10[America/New_York]"
    When eachHourOfInterval is called
    Then the local hour sequence is [0,1,3,4]
    And adjacent results are exactly one elapsed hour apart
    And every result retains zone "America/New_York"

  @case-SEQ-011
  Scenario: Zoned hour steps retain both occurrences in a fold
    Given a ZonedDateTime interval from "2026-11-01T00:30[America/New_York]" through "2026-11-01T02:10[America/New_York]"
    When eachHourOfInterval is called
    Then the local hour and offset sequence is [00:-04:00, 01:-04:00, 01:-05:00, 02:-05:00]
    And adjacent results are exactly one elapsed hour apart

  @case-SEQ-012
  Scenario: Zoned minute steps retain both sides of a fold
    Given a ZonedDateTime interval from "2026-11-01T01:59:30-04:00[America/New_York]" through "2026-11-01T01:01:10-05:00[America/New_York]"
    When eachMinuteOfInterval is called
    Then the local time and offset sequence is [01:59:-04:00, 01:00:-05:00, 01:01:-05:00]
    And adjacent results are exactly one elapsed minute apart

  @case-SEQ-013
  Scenario: Zoned day starts honor a skipped midnight
    Given a ZonedDateTime interval from "2018-11-03T12:00[America/Sao_Paulo]" through "2018-11-05T12:00[America/Sao_Paulo]"
    And the host data skips midnight on November 4
    When eachDayOfInterval is called
    Then the local start sequence is [2018-11-03T00:00, 2018-11-04T01:00, 2018-11-05T00:00]

  @case-SEQ-014
  Scenario: Calendar day sequences omit dates that never occurred
    Given a ZonedDateTime interval from "2011-12-29T12:00[Pacific/Apia]" through "2012-01-01T12:00[Pacific/Apia]"
    And the host data skips December 30, 2011
    When eachDayOfInterval is called
    Then its date sequence is [2011-12-29, 2011-12-31, 2012-01-01]
    When eachWeekendOfInterval is called with default weekends
    Then its date sequence is [2011-12-31, 2012-01-01]

  @case-SEQ-015
  Scenario Outline: An equal-endpoint interval emits the containing period
    Given a <kind> interval whose endpoints both equal "<value>"
    When <function> is called
    Then it returns one <kind> value equal to "<result>"
    Examples:
      | function             | kind           | value      | result     |
      | eachDayOfInterval    | PlainDate      | 2026-10-23 | 2026-10-23 |
      | eachWeekOfInterval   | PlainDate      | 2026-10-23 | 2026-10-18 |
      | eachMonthOfInterval  | PlainYearMonth | 2026-10    | 2026-10    |
      | eachHourOfInterval   | PlainTime      | 12:34:56   | 12:00      |
      | eachMinuteOfInterval | PlainTime      | 12:34:56   | 12:34      |

  @case-SEQ-016
  Scenario Outline: Reversed endpoints are rejected for every sequence
    Given a <kind> interval from "<start>" through "<end>"
    When <function> is called with that reversed interval
    Then it throws an invalid-interval error
    Examples:
      | function              | kind           | start      | end        |
      | eachDayOfInterval     | PlainDate      | 2026-10-24 | 2026-10-23 |
      | eachWeekOfInterval    | PlainDate      | 2026-10-24 | 2026-10-23 |
      | eachMonthOfInterval   | PlainYearMonth | 2026-11    | 2026-10    |
      | eachWeekendOfInterval | PlainDate      | 2026-10-24 | 2026-10-23 |
      | eachHourOfInterval    | PlainTime      | 12:00      | 11:00      |
      | eachMinuteOfInterval  | PlainTime      | 12:00      | 11:59      |

  @case-SEQ-017
  Scenario Outline: Steps must be positive integers
    Given a compatible valid interval for <function>
    When <function> is called with step <step>
    Then the call throws an invalid-step error
    Examples:
      | function             | step     |
      | eachDayOfInterval    | 0        |
      | eachDayOfInterval    | -1       |
      | eachWeekOfInterval   | 1.5      |
      | eachMonthOfInterval  | Infinity |
      | eachHourOfInterval   | NaN      |
      | eachMinuteOfInterval | 0        |
      | eachMinuteOfInterval | null     |

  @case-SEQ-018
  Scenario Outline: Zoned sequences require matching endpoint zones
    Given ZonedDateTime start "2026-10-23T00:00[UTC]" and end "2026-10-24T00:00[Asia/Tokyo]"
    When <function> is called with their interval
    Then it throws a mismatched-zone error
    Examples:
      | function              |
      | eachDayOfInterval     |
      | eachWeekOfInterval    |
      | eachMonthOfInterval   |
      | eachWeekendOfInterval |
      | eachHourOfInterval    |
      | eachMinuteOfInterval  |

  @case-SEQ-019
  Scenario: A day sequence terminates after the last representable date
    Given a PlainDate interval from "+275760-09-12" through "+275760-09-13"
    When eachDayOfInterval is called
    Then the sequence is [+275760-09-12, +275760-09-13]
    And no extra date beyond the endpoint is required

  @case-SEQ-020
  Scenario: A step beyond the range and beyond the endpoint does not discard emitted values
    Given a PlainDate interval from "+275760-09-12" through "+275760-09-13"
    When eachDayOfInterval is called with step 10
    Then the sequence is [+275760-09-12]

  @case-SEQ-021
  Scenario Outline: Sequence configuration shares the week and weekend constraints
    Given a valid PlainDate interval from "2026-10-23" through "2026-10-27"
    When <function> is called with <options>
    Then it throws an invalid-option error
    Examples:
      | function              | options                        |
      | eachWeekOfInterval    | {weekStartsOn: 7}              |
      | eachWeekOfInterval    | {weekStartsOn: 0.5}            |
      | eachWeekendOfInterval | {weekendDays: [0,1,2,3,4,5,6]} |
      | eachWeekendOfInterval | {weekendDays: [7]}             |

  @case-SEQ-022 @source-D04
  Scenario Outline: A missing first containing period is not silently clipped
    Given a PlainDate interval from "-271821-04-19" through "-271821-04-20"
    When <function> is called with <options>
    Then it throws RangeError
    And it does not substitute the interval's start for the unavailable period boundary
    Examples:
      | function            | options           |
      | eachMonthOfInterval | omitted options   |
      | eachWeekOfInterval  | {weekStartsOn: 0} |

  @case-SEQ-023
  Scenario: Day enumeration retains leap day
    Given a PlainDate interval from "2024-02-28" through "2024-03-01"
    When eachDayOfInterval is called
    Then the result is [2024-02-28, 2024-02-29, 2024-03-01]

  @case-SEQ-024
  Scenario: Weekend filtering does not require a weekend to occur
    Given a PlainDate interval from "2026-10-19" through "2026-10-23"
    When eachWeekendOfInterval is called with omitted options
    Then the result is an empty array

  @case-SEQ-025 @source-D06
  Scenario Outline: Safe positive steps can exceed the remaining interval
    Given a PlainTime interval from "00:00" through "23:59"
    When <function> is called with step 9007199254740991
    Then the sequence is [00:00]
    Examples:
      | function             |
      | eachHourOfInterval   |
      | eachMinuteOfInterval |

  @case-SEQ-026 @source-D06
  Scenario Outline: Integer-valued steps outside the safe range are rejected
    Given a compatible valid interval for <function>
    When <function> is called with step 9007199254740992
    Then the call throws an invalid-step error
    Examples:
      | function             |
      | eachDayOfInterval    |
      | eachWeekOfInterval   |
      | eachMonthOfInterval  |
      | eachHourOfInterval   |
      | eachMinuteOfInterval |

  @case-SEQ-027 @source-D07
  Scenario: Month-only iteration at the lower bound does not require a complete date
    Given a PlainYearMonth interval from "-271821-04" through "-271821-05"
    When eachMonthOfInterval is called
    Then the result is the PlainYearMonth sequence [-271821-04, -271821-05]
    And it does not require an unavailable April 1 PlainDate as a public input or result
    And an internal arithmetic range error does not silently truncate an interval whose next month is representable

  @case-SEQ-028
  Scenario Outline: Zoned week and month sequences advance by local calendar units across a fold
    Given a ZonedDateTime interval from "<start>[America/New_York]" through "<end>[America/New_York]"
    When <function> is called with omitted options
    Then each result retains zone "America/New_York"
    And the local date-time and offset sequence is <values>
    Examples:
      | function            | start            | end              | values                                                                   |
      | eachWeekOfInterval  | 2026-10-25T12:00 | 2026-11-08T12:00 | [2026-10-25T00:00-04:00, 2026-11-01T00:00-04:00, 2026-11-08T00:00-05:00] |
      | eachMonthOfInterval | 2026-10-23T12:00 | 2026-12-03T12:00 | [2026-10-01T00:00-04:00, 2026-11-01T00:00-04:00, 2026-12-01T00:00-05:00] |
