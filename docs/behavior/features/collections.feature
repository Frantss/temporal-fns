@source-selection @source-types @source-conventions @derived
Feature: Select original values from homogeneous collections

  @case-SEL-001
  Scenario Outline: Minima and maxima preserve the selected object
    Given <kind> objects first "<first>", middle "<middle>" and last "<last>"
    And an array [middle, last, first]
    When min is called with that array
    Then the result is the original first object
    When max is called with that array
    Then the result is the original last object
    And the array order remains [middle, last, first]
    Examples:
      | kind           | first                 | middle                | last                  |
      | PlainDate      | 2026-10-01            | 2026-10-02            | 2026-10-03            |
      | PlainDateTime  | 2026-10-01T12:00      | 2026-10-02T12:00      | 2026-10-03T12:00      |
      | PlainYearMonth | 2026-01               | 2026-02               | 2026-03               |
      | PlainTime      | 10:00                 | 11:00                 | 12:00                 |
      | Instant        | 2026-10-01T00:00Z     | 2026-10-02T00:00Z     | 2026-10-03T00:00Z     |
      | ZonedDateTime  | 2026-10-01T00:00[UTC] | 2026-10-02T00:00[UTC] | 2026-10-03T00:00[UTC] |

  @case-SEL-002
  Scenario Outline: Closest selection uses the first occurrence in a distance tie
    Given <kind> target "<target>" and distinct candidate objects left "<left>" and right "<right>"
    When closestTo is called with target and [right, left]
    Then the result is the original right object
    When closestIndexTo is called with target and [right, left]
    Then the result is 0
    When the candidate order is reversed
    Then closestTo returns the original left object and closestIndexTo returns 0
    Examples:
      | kind           | target                | left                  | right                 |
      | PlainDate      | 2026-10-02            | 2026-10-01            | 2026-10-03            |
      | PlainDateTime  | 2026-10-02T12:00      | 2026-10-01T12:00      | 2026-10-03T12:00      |
      | PlainYearMonth | 2026-02               | 2026-01               | 2026-03               |
      | PlainTime      | 11:00                 | 10:00                 | 12:00                 |
      | Instant        | 2026-10-02T00:00Z     | 2026-10-01T00:00Z     | 2026-10-03T00:00Z     |
      | ZonedDateTime  | 2026-10-02T00:00[UTC] | 2026-10-01T00:00[UTC] | 2026-10-03T00:00[UTC] |

  @case-SEL-003
  Scenario Outline: Empty collections return undefined
    Given an empty homogeneous collection and, where needed, a valid PlainDate target
    When <function> is called
    Then the result is undefined
    Examples:
      | function       |
      | min            |
      | max            |
      | closestTo      |
      | closestIndexTo |

  @case-SEL-004
  Scenario Outline: Equal extrema keep the first occurrence
    Given distinct PlainDate objects first and second both equal to "2026-10-23"
    When <function> is called with [second, first]
    Then the result is the original second object
    Examples:
      | function |
      | min      |
      | max      |

  @case-SEL-005
  Scenario: Exact time, rather than displayed local order, orders zoned values
    Given ZonedDateTime early "2026-10-24T00:00[Asia/Tokyo]"
    And ZonedDateTime late "2026-10-23T23:00[America/New_York]"
    When min is called with [late, early]
    Then the result is the original early object
    When max is called with [late, early]
    Then the result is the original late object
    And no common timeZone option is required

  @case-SEL-006
  Scenario: Closest exact instants retain nanosecond differences
    Given Instant target "2026-10-23T00:00:00.000000001Z"
    And Instant near "2026-10-23T00:00:00.000000002Z"
    And Instant far "2026-10-23T00:00:00.000000003Z"
    When closestTo is called with target and [far, near]
    Then the result is the original near object
    When closestIndexTo is called with target and [far, near]
    Then the result is 1

  @case-SEL-007
  Scenario: Clock distance is linear and never wraps across midnight
    Given PlainTime target "00:00", late "23:59:59" and noon "12:00"
    When closestTo is called with target and [late, noon]
    Then the result is the original noon object

  @case-SEL-008
  Scenario: Month distance is measured in whole calendar months
    Given PlainYearMonth target "2026-03", January "2026-01" and April "2026-04"
    When closestTo is called with target and [January, April]
    Then the result is the original April object

  @case-SEL-009
  Scenario: Plain date-time distance is wall-clock distance
    Given PlainDateTime target "2026-03-08T12:00"
    And PlainDateTime near "2026-03-08T13:00" and far "2026-03-07T12:00"
    When closestTo is called with target and [far, near]
    Then the result is the original near object
    And the host zone does not change the result

  @case-SEL-010
  Scenario Outline: Mixed kinds are rejected throughout a collection
    Given a PlainDate "2026-10-23" and a PlainDateTime "2026-10-23T00:00"
    And a PlainDate target is supplied where required
    When <function> is called with a collection containing both values
    Then the call throws an incompatible-kind error
    Examples:
      | function       |
      | min            |
      | max            |
      | closestTo      |
      | closestIndexTo |

  @case-SEL-011
  Scenario Outline: Closest targets must match the collection kind
    Given a PlainDate target "2026-10-23"
    And a collection containing PlainYearMonth "2026-10"
    When <function> is called
    Then it throws an incompatible-kind error
    Examples:
      | function       |
      | closestTo      |
      | closestIndexTo |

  @case-SEL-012
  Scenario: Full-range plain date-time selection does not require duration balancing
    Given PlainDateTime low "-271821-04-19T00:00:00.000000001"
    And PlainDateTime high "+275760-09-13T23:59:59.999999999"
    When closestTo is called with low and [high, low]
    Then the result is the original low object
    When closestTo is called with high and [low, high]
    Then the result is the original high object

  @case-SEL-013
  Scenario: Hidden reference days do not give month-only values day precision
    Given distinct ISO PlainYearMonth values for "2026-10" constructed with reference days 1 and 31
    When min is called with those objects in either order
    Then it returns the first input object in that order
    When closestTo is called with either object as target and the other as its only candidate
    Then it returns that candidate at zero month distance
