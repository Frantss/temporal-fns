@source-intervals @source-types @source-conventions @derived
Feature: Query closed interval membership and configurable overlap

  @case-INT-001
  Scenario Outline: Membership includes both endpoints
    Given a PlainTime interval from "10:00" through "12:00"
    When isWithinInterval is called with PlainTime "<value>"
    Then the result is <result>
    Examples:
      | value              | result |
      | 09:59:59.999999999 | false  |
      | 10:00              | true   |
      | 11:00              | true   |
      | 12:00              | true   |
      | 12:00:00.000000001 | false  |

  @case-INT-002
  Scenario Outline: Clamp returns the input or an original endpoint
    Given PlainDate endpoint objects start "2026-10-02" and end "2026-10-04"
    And a distinct PlainDate input object "<value>"
    When clamp is called with that input and the interval
    Then the result is the original <object> object
    Examples:
      | value      | object |
      | 2026-10-01 | start  |
      | 2026-10-02 | input  |
      | 2026-10-03 | input  |
      | 2026-10-04 | input  |
      | 2026-10-05 | end    |

  @case-INT-003
  Scenario Outline: Overlap distinguishes disjoint, contained and touching intervals
    Given a PlainTime first interval from "10:00" through "12:00"
    And a PlainTime second interval from "<start>" through "<end>"
    When areIntervalsOverlapping is called with <options>
    Then the result is <result>
    And swapping the intervals produces the same result
    Examples:
      | start | end   | options            | result |
      | 08:00 | 09:00 | omitted options    | false  |
      | 09:00 | 10:00 | omitted options    | false  |
      | 09:00 | 10:00 | {inclusive: true}  | true   |
      | 09:00 | 11:00 | omitted options    | true   |
      | 10:30 | 11:30 | omitted options    | true   |
      | 09:00 | 13:00 | omitted options    | true   |
      | 10:00 | 12:00 | omitted options    | true   |
      | 12:00 | 13:00 | omitted options    | false  |
      | 12:00 | 13:00 | {inclusive: false} | false  |
      | 12:00 | 13:00 | {inclusive: true}  | true   |

  @case-INT-004 @source-D01
  Scenario Outline: Point intervals overlap only when strictly inside or explicitly included
    Given a PlainTime first interval from "11:00" through "13:00"
    And a point interval whose start and end both equal PlainTime "<point>"
    When areIntervalsOverlapping is called with <options>
    Then the result is <result>
    And swapping the intervals produces the same result
    Examples:
      | point | options           | result |
      | 10:00 | omitted options   | false  |
      | 11:00 | omitted options   | false  |
      | 12:00 | omitted options   | true   |
      | 13:00 | omitted options   | false  |
      | 14:00 | omitted options   | false  |
      | 11:00 | {inclusive: true} | true   |
      | 12:00 | {inclusive: true} | true   |
      | 13:00 | {inclusive: true} | true   |

  @case-INT-005 @source-D01
  Scenario Outline: Two equal point intervals meet at an endpoint
    Given two PlainTime intervals each from "12:00" through "12:00"
    When areIntervalsOverlapping is called with <options>
    Then the result is <result>
    Examples:
      | options           | result |
      | omitted options   | false  |
      | {inclusive: true} | true   |

  @case-INT-006
  Scenario: Point membership and clamping still use closed endpoints
    Given PlainDate interval endpoint objects start and end both equal "2026-10-23"
    And distinct input object equal to PlainDate "2026-10-23"
    When isWithinInterval is called with the input and interval
    Then the result is true
    When clamp is called with the input and interval
    Then the result is the original input object

  @case-INT-007
  Scenario Outline: Reversed intervals are invalid for every interval query
    Given a PlainTime interval from "23:00" through "01:00"
    And a PlainTime value "00:00" and another valid PlainTime interval where needed
    When <function> is called using the reversed interval
    Then the call throws an invalid-interval error
    And it does not reinterpret the interval as overnight
    Examples:
      | function                |
      | isWithinInterval        |
      | areIntervalsOverlapping |
      | clamp                   |

  @case-INT-008
  Scenario Outline: Month-only intervals use inclusive month endpoints
    Given a PlainYearMonth interval from "2026-10" through "2026-12"
    When isWithinInterval is called with PlainYearMonth "<value>"
    Then the result is <result>
    Examples:
      | value   | result |
      | 2026-09 | false  |
      | 2026-10 | true   |
      | 2026-11 | true   |
      | 2026-12 | true   |
      | 2027-01 | false  |

  @case-INT-009
  Scenario: Zoned interval membership compares exact instants across different zones
    Given a ZonedDateTime interval from "2026-10-23T00:00[UTC]" through "2026-10-24T00:00[UTC]"
    And ZonedDateTime value "2026-10-23T12:00[Asia/Tokyo]"
    When isWithinInterval is called with that value and interval
    Then the result is true
    And no comparison timeZone option is required

  @case-INT-010
  Scenario Outline: Interval kinds must match both internally and across arguments
    Given <inputs>
    When <function> is called
    Then it throws an incompatible-kind error
    Examples:
      | function                | inputs                                                                       |
      | isWithinInterval        | a PlainDate value and a PlainDateTime interval                               |
      | clamp                   | a PlainYearMonth value and a PlainDate interval                              |
      | areIntervalsOverlapping | a PlainDate interval and a PlainDateTime interval                            |
      | isWithinInterval        | a PlainDate value and an interval with PlainDate start and PlainDateTime end |

  @case-INT-011
  Scenario Outline: Inclusion is a boolean option
    Given valid overlapping PlainDate intervals
    When areIntervalsOverlapping is called with inclusive <value>
    Then the call throws an invalid-option error
    Examples:
      | value  |
      | 1      |
      | 'true' |
      | null   |

  @case-INT-012
  Scenario Outline: All ordered kinds preserve membership, clamping identity and overlap rules
    Given original <kind> objects a "<a>", b "<b>", c "<c>" and d "<d>"
    And the interval has start b and end c
    When isWithinInterval is called for a, b, c and d
    Then the corresponding results are [false, true, true, false]
    When clamp is called for a, b, c and d
    Then the corresponding objects returned by identity are [b, b, c, c]
    When areIntervalsOverlapping compares the interval with [c,d] using omitted options
    Then the result is false
    When that comparison uses inclusive true
    Then the result is true
    Examples:
      | kind           | a                     | b                     | c                     | d                     |
      | PlainDate      | 2026-10-01            | 2026-10-02            | 2026-10-03            | 2026-10-04            |
      | PlainDateTime  | 2026-10-01T12:00      | 2026-10-02T12:00      | 2026-10-03T12:00      | 2026-10-04T12:00      |
      | PlainYearMonth | 2026-01               | 2026-02               | 2026-03               | 2026-04               |
      | PlainTime      | 10:00                 | 11:00                 | 12:00                 | 13:00                 |
      | Instant        | 2026-10-01T00:00Z     | 2026-10-02T00:00Z     | 2026-10-03T00:00Z     | 2026-10-04T00:00Z     |
      | ZonedDateTime  | 2026-10-01T00:00[UTC] | 2026-10-02T00:00[UTC] | 2026-10-03T00:00[UTC] | 2026-10-04T00:00[UTC] |
