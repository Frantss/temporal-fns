@source-duration @source-conventions @derived
Feature: Render and parse duration components without balancing

  @case-DUR-001
  Scenario: Default formatting uses all nonzero components in descending order
    Given a Duration with these components:
      | years | months | weeks | days | hours | minutes | seconds | milliseconds | microseconds | nanoseconds |
      | 1     | 2      | 3     | 4    | 25    | 90      | 7       | 8            | 9            | 10          |
    When formatDuration is called with omitted options
    Then the text is "1 year 2 months 3 weeks 4 days 25 hours 90 minutes 7 seconds 8 milliseconds 9 microseconds 10 nanoseconds"
    And hours 25 and minutes 90 remain separate unbalanced components

  @case-DUR-002
  Scenario Outline: Selection, ordering, zero fields and delimiters are caller controlled
    Given a Duration with hours 25 and minutes 30
    When formatDuration is called with <options>
    Then the text is "<text>"
    Examples:
      | options                                     | text                 |
      | {format: [hours, minutes]}                  | 25 hours 30 minutes  |
      | {format: [minutes, hours]}                  | 30 minutes 25 hours  |
      | {format: [days, hours], zero: true}         | 0 days 25 hours      |
      | {format: [days, hours], zero: false}        | 25 hours             |
      | {format: [days]}                            | 0 days               |
      | {format: [hours, minutes], delimiter: ', '} | 25 hours, 30 minutes |
      | {format: [hours, minutes], delimiter: ''}   | 25 hours30 minutes   |

  @case-DUR-003
  Scenario Outline: Zero and negative output have explicit spelling
    Given a Duration "<value>"
    When formatDuration is called with <options>
    Then the text is "<text>"
    Examples:
      | value   | options                                | text              |
      | PT0S    | omitted options                        | 0 nanoseconds     |
      | PT0S    | {format: [hours, minutes]}             | 0 minutes         |
      | PT0S    | {format: [hours, minutes], zero: true} | 0 hours 0 minutes |
      | -P1DT2H | {format: [days, hours]}                | -1 day 2 hours    |
      | PT1H    | {format: [hours]}                      | 1 hour            |
      | PT2H    | {format: [hours]}                      | 2 hours           |

  @case-DUR-004
  Scenario Outline: Every documented short unit maps to its own component
    When parseDuration is called with "<text>"
    Then the Duration has <component> equal to <amount>
    And every other duration component is zero
    Examples:
      | text | component    | amount |
      | 1y   | years        | 1      |
      | 2mo  | months       | 2      |
      | 3w   | weeks        | 3      |
      | 4d   | days         | 4      |
      | 25h  | hours        | 25     |
      | 90m  | minutes      | 90     |
      | 7s   | seconds      | 7      |
      | 8ms  | milliseconds | 8      |
      | 9us  | microseconds | 9      |
      | 10ns | nanoseconds  | 10     |

  @case-DUR-005
  Scenario Outline: Singular and plural names are accepted without imposing order
    When parseDuration is called with "<text>"
    Then its nonzero components are <components>
    Examples:
      | text                                       | components                                    |
      | 1 year 2 months                            | years 1, months 2                             |
      | 2 weeks 1 day                              | weeks 2, days 1                               |
      | 1 hour 2 minutes 3 seconds                 | hours 1, minutes 2, seconds 3                 |
      | 1 millisecond 2 microseconds 3 nanoseconds | milliseconds 1, microseconds 2, nanoseconds 3 |
      | 30 minutes 25 hours                        | hours 25, minutes 30                          |
      | 2 years                                    | years 2                                       |
      | 1 month                                    | months 1                                      |
      | 1 week                                     | weeks 1                                       |
      | 2 days                                     | days 2                                        |
      | 2 hours                                    | hours 2                                       |
      | 1 minute                                   | minutes 1                                     |
      | 1 second                                   | seconds 1                                     |
      | 2 milliseconds                             | milliseconds 2                                |
      | 1 microsecond                              | microseconds 1                                |
      | 1 nanosecond                               | nanoseconds 1                                 |

  @case-DUR-006
  Scenario Outline: One leading sign applies to all components
    When parseDuration is called with "<text>"
    Then its hours component is <hours>
    And its minutes component is <minutes>
    Examples:
      | text    | hours | minutes |
      | 1h 30m  | 1     | 30      |
      | +1h 30m | 1     | 30      |
      | -1h 30m | -1    | -30     |
      | -0h 0m  | 0     | 0       |

  @case-DUR-007
  Scenario: tryParseDuration returns a discriminated success tuple
    When tryParseDuration is called with "25h 30m"
    Then the tuple is [null, Duration with hours 25 and minutes 30]
    And exactly one tuple element is non-null

  @case-DUR-008
  Scenario Outline: Invalid duration text fails consistently
    When the duration text "<text>" is processed
    Then parseDuration throws RangeError
    And tryParseDuration returns [RangeError, null]
    Examples:
      | text               |
      |                    |
      | P1D                |
      | 12:30              |
      | 1h30m              |
      | 1.5h               |
      | 1h -2m             |
      | 1h +2m             |
      | --1h               |
      | 1h 1hour           |
      | 1mo 2months        |
      | 1bad               |
      | 1 constructor      |
      | 1 toString         |
      | 9007199254740993ns |

  @case-DUR-009
  Scenario: Exactly representable large integers use decimal text
    Given a Duration with nanoseconds equal to the exactly representable number 1000000000000000000000
    When formatDuration is called with format [nanoseconds]
    Then the text is "1000000000000000000000 nanoseconds"
    When parseDuration is called with that text
    Then its nanoseconds component is the same exactly representable number

  @case-DUR-010
  Scenario Outline: Calendar duration components at the native limit are rejected
    When parseDuration is called with "<text>"
    Then it throws RangeError
    When tryParseDuration is called with the same text
    Then the result is [RangeError, null]
    Examples:
      | text          |
      | 4294967296y   |
      | -4294967296y  |
      | 4294967296mo  |
      | -4294967296mo |
      | 4294967296w   |
      | -4294967296w  |

  @case-DUR-011
  Scenario Outline: Invalid formatting configuration throws
    Given a Duration "PT25H30M"
    When formatDuration is called with <options>
    Then the call throws an invalid-option error
    Examples:
      | options                                      |
      | {format: []}                                 |
      | {format: [hours, hours]}                     |
      | {format: [fortnights]}                       |
      | {format: a sparse array with one empty slot} |
      | {zero: 'yes'}                                |
      | {delimiter: 123}                             |
      | {locale: 'es'}                               |

  @case-DUR-012
  Scenario: Parsing a human duration does not interpret it as clock time
    When parseDuration is called with "25h 90m"
    Then the result is Duration with hours 25 and minutes 90
    And it is not PlainTime
    And formatting its hours and minutes yields "25 hours 90 minutes"

  @case-DUR-013 @source-D05
  Scenario Outline: Human units are case-insensitive
    When parseDuration is called with "<text>"
    Then the result has hours 1 and minutes 30
    When tryParseDuration is called with the same text
    Then its result is [null, Duration with hours 1 and minutes 30]
    Examples:
      | text            |
      | 1H 30Minutes    |
      | 1HOUR 30M       |
      | 1hour 30mInUtEs |

  @case-DUR-014 @source-D05
  Scenario: Surrounding whitespace is trimmed without changing component separation
    Given duration text consists of two spaces, "1H", a tab, "30Minutes", and two spaces
    When parseDuration is called with that text
    Then the result has hours 1 and minutes 30
    When tryParseDuration is called with that text
    Then its result is [null, Duration with hours 1 and minutes 30]

  @case-DUR-015 @source-D05
  Scenario: Whitespace-only text has no duration component
    Given duration text containing only spaces and a tab
    When the text is processed
    Then parseDuration throws RangeError
    And tryParseDuration returns [RangeError, null]

  @case-DUR-016
  Scenario Outline: Calendar components immediately below the native limit remain valid
    When parseDuration is called with "<text>"
    Then its <component> component is 4294967295
    And every other component is zero
    When tryParseDuration is called with the same text
    Then its error element is null and its result has the same components
    Examples:
      | text         | component |
      | 4294967295y  | years     |
      | 4294967295mo | months    |
      | 4294967295w  | weeks     |

  @case-DUR-017
  Scenario Outline: A try parser does not convert non-text programmer errors into input failures
    Given a non-string primary argument <input>
    When parseDuration is called with that argument
    Then it throws
    When tryParseDuration is called with that argument
    Then it also throws rather than returning an error tuple
    Examples:
      | input              |
      | null               |
      | number 25          |
      | an ordinary object |
