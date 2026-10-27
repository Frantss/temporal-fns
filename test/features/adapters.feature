@source-adapters @source-types @source-conventions @derived
Feature: Exchange displayed calendar fields with host-local Date widgets

  @case-ADP-001
  Scenario Outline: toCalendarDate copies fields into the host zone
    Given the host local zone is "<host>"
    And a <kind> value "<value>"
    When toCalendarDate is called
    Then the result is a Date whose host-local fields equal "<local>"
    Examples:
      | host             | kind          | value                               | local                   |
      | UTC              | PlainDate     | 2026-10-23                          | 2026-10-23T00:00:00.000 |
      | UTC              | PlainDateTime | 2026-10-23T14:30:15.123             | 2026-10-23T14:30:15.123 |
      | America/New_York | ZonedDateTime | 2026-10-23T14:30:15.123[Asia/Tokyo] | 2026-10-23T14:30:15.123 |

  @case-ADP-002
  Scenario: A zoned calendar adapter deliberately copies fields rather than the instant
    Given the host local zone is "America/New_York"
    And a ZonedDateTime "2026-10-23T12:00[Asia/Tokyo]"
    When toCalendarDate is called
    Then the Date's host-local clock reads 12:00 on October 23, 2026
    And its epoch milliseconds differ from those of the input

  @case-ADP-003
  Scenario Outline: Years zero through ninety-nine are copied literally
    Given the host local zone is "UTC"
    And a PlainDateTime "<value>"
    When toCalendarDate is called
    Then the Date's full year is <year>
    When fromCalendarDate is called with that Date
    Then the result equals the original PlainDateTime
    Examples:
      | value                   | year |
      | 0000-01-01T12:34:56.789 | 0    |
      | 0001-01-01T12:34:56.789 | 1    |
      | 0099-12-31T23:59:59.999 | 99   |

  @case-ADP-004
  Scenario: fromCalendarDate reads host-local fields into a zone-free value
    Given the host local zone is "America/New_York"
    And a Date with instant "2026-10-23T16:30:15.123Z"
    When fromCalendarDate is called
    Then the result is PlainDateTime "2026-10-23T12:30:15.123"
    And it carries no time zone
    And its microsecond and nanosecond fields are zero

  @case-ADP-005
  Scenario Outline: Sub-millisecond precision cannot be silently discarded
    Given a PlainDateTime "<value>"
    When toCalendarDate is called
    Then it throws a precision-loss error
    Examples:
      | value                         |
      | 2026-10-23T12:00:00.000001    |
      | 2026-10-23T12:00:00.000000001 |
      | 2026-10-23T12:00:00.123456789 |

  @case-ADP-006
  Scenario: A host gap is rejected instead of shifting the copied fields
    Given the host local zone is "America/New_York"
    And a PlainDateTime "2026-03-08T02:30"
    When toCalendarDate is called
    Then it throws an unrepresentable-host-time error

  @case-ADP-007
  Scenario: A repeated host time can preserve its displayed fields
    Given the host local zone is "America/New_York"
    And a PlainDateTime "2026-11-01T01:30"
    When toCalendarDate is called and its Date is passed to fromCalendarDate
    Then the result is PlainDateTime "2026-11-01T01:30"
    And the contract does not choose an original instant for that zone-free input

  @case-ADP-008
  Scenario: A skipped host-local date is rejected
    Given the host local zone is "Pacific/Apia"
    And the host data skips December 30, 2011
    And a PlainDate "2011-12-30"
    When toCalendarDate is called
    Then it throws an unrepresentable-host-time error

  @case-ADP-009
  Scenario Outline: Invalid legacy inputs are rejected
    Given <input>
    When fromCalendarDate is called
    Then it throws an invalid-input error
    Examples:
      | input                           |
      | a Date whose time value is NaN  |
      | an ordinary object              |
      | a string containing an ISO date |
      | null                            |

  @case-ADP-010
  Scenario: Callers can choose date-only precision explicitly after reading a widget
    Given the host local zone is "UTC"
    And a Date whose host-local fields are "2026-10-23T14:30:15.123"
    When fromCalendarDate is called
    Then it returns PlainDateTime "2026-10-23T14:30:15.123"
    And the caller can select PlainDate "2026-10-23" through the returned value's native conversion

  @case-ADP-011
  Scenario Outline: A valid Temporal value may exceed the Date range in the host zone
    Given the host local zone is "UTC"
    And a <kind> "<value>"
    When toCalendarDate is called
    Then it throws an unrepresentable-host-time error
    Examples:
      | kind          | value                      |
      | PlainDate     | -271821-04-19              |
      | PlainDateTime | +275760-09-13T23:59:59.999 |
