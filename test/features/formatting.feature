@source-format @source-types @source-conventions @derived
Feature: Format the fields carried by a Temporal value
  Calling code selects tokens, locale and explicit zone context.

  @case-FMT-001
  Scenario Outline: Numeric tokens retain their distinct meanings
    Given a PlainDateTime "2026-10-23T12:03:04.005006007"
    When format is called with pattern "<pattern>" and omitted options
    Then the returned text is "<text>"
    Examples:
      | pattern       | text          |
      | yyyy          | 2026          |
      | yy            | 26            |
      | M MM d dd     | 10 10 23 23   |
      | H HH h hh     | 12 12 12 12   |
      | m mm s ss SSS | 3 03 4 04 005 |

  @case-FMT-002
  Scenario Outline: Padding and twelve-hour clocks are distinct from field values
    Given a PlainDateTime "<value>"
    When format is called with pattern "<pattern>"
    Then the returned text is "<text>"
    Examples:
      | value                   | pattern      | text          |
      | 2026-01-02T00:03:04.005 | M MM d dd    | 1 01 2 02     |
      | 2026-01-02T00:03:04.005 | H HH h hh a  | 0 00 12 12 AM |
      | 2026-01-02T13:03:04.005 | H HH h hh a  | 13 13 1 01 PM |
      | 2026-01-02T23:59:59.999 | HH:mm:ss.SSS | 23:59:59.999  |

  @case-FMT-003
  Scenario Outline: Years are years of era
    Given a PlainDate "<value>"
    When format is called with pattern "yyyy yy"
    Then the returned text is "<text>"
    Examples:
      | value         | text     |
      | 0001-01-01    | 0001 01  |
      | 0000-01-01    | 0001 01  |
      | -000001-01-01 | 0002 02  |
      | 0099-01-01    | 0099 99  |
      | 0100-01-01    | 0100 00  |
      | +012345-01-01 | 12345 45 |

  @case-FMT-004
  Scenario Outline: Quoted literals and escaped apostrophes are preserved
    Given a PlainDateTime "2026-10-23T12:03:00"
    When format is called with pattern "<pattern>"
    Then the returned text is "<text>"
    Examples:
      | pattern            | text             |
      | yyyy-MM-dd'T'HH:mm | 2026-10-23T12:03 |
      | 'it''s' HH:mm      | it's 12:03       |
      | ''yyyy''           | '2026'           |
      | 'unchanged'        | unchanged        |

  @case-FMT-005
  Scenario Outline: Partial values expose only the information they contain
    Given a <kind> "<value>"
    When format is called with pattern "<pattern>"
    Then the returned text is "<text>"
    Examples:
      | kind           | value        | pattern      | text         |
      | PlainYearMonth | 2026-10      | yyyy-MM      | 2026-10      |
      | PlainMonthDay  | 02-29        | MM/dd        | 02/29        |
      | PlainTime      | 12:03:04.005 | HH:mm:ss.SSS | 12:03:04.005 |

  @case-FMT-006
  Scenario Outline: Missing fields cannot be invented by formatting
    Given a <kind> "<value>"
    When format is called with pattern "<pattern>"
    Then the call throws an incompatible-pattern error
    Examples:
      | kind           | value      | pattern |
      | PlainDate      | 2026-10-23 | HH      |
      | PlainDate      | 2026-10-23 | XXX     |
      | PlainTime      | 12:00      | yyyy    |
      | PlainTime      | 12:00      | MM      |
      | PlainYearMonth | 2026-10    | dd      |
      | PlainYearMonth | 2026-10    | EEEE    |
      | PlainMonthDay  | 02-29      | yyyy    |
      | PlainMonthDay  | 02-29      | EEEE    |
      | PlainMonthDay  | 02-29      | HH      |

  @case-FMT-007
  Scenario Outline: Unsupported or unfinished tokens are rejected
    Given a PlainDateTime "2026-10-23T12:00"
    When format is called with pattern "<pattern>"
    Then the call throws an invalid-pattern error
    Examples:
      | pattern    |
      | YYYY-MM-DD |
      | Q          |
      | SSSSSSSSS  |
      | LLLL       |
      | G yyyy     |
      | yyyy'      |

  @case-FMT-008
  Scenario Outline: Instant formatting requires a viewing zone
    Given an Instant "2026-10-24T01:00Z"
    When format is called with pattern "yyyy-MM-dd HH:mm XXX" and timeZone "<zone>"
    Then the returned text is "<text>"
    Examples:
      | zone               | text                    |
      | UTC                | 2026-10-24 01:00 Z      |
      | America/Montevideo | 2026-10-23 22:00 -03:00 |
      | +05:30             | 2026-10-24 06:30 +05:30 |

  @case-FMT-009
  Scenario: An instant cannot acquire an implicit zone
    Given an Instant "2026-10-24T01:00Z"
    When format is called with pattern "yyyy-MM-dd" and omitted timeZone
    Then the call throws a missing-zone error

  @case-FMT-010
  Scenario: A zoned value defaults to its zone and supports an explicit viewing zone
    Given a ZonedDateTime "2026-10-23T22:00-03:00[America/Montevideo]"
    When format is called with pattern "yyyy-MM-dd HH:mm" and omitted options
    Then the returned text is "2026-10-23 22:00"
    When format is called with the same value and pattern and timeZone "UTC"
    Then the returned text is "2026-10-24 01:00"
    And the original value still has zone "America/Montevideo" and hour 22

  @case-FMT-011
  Scenario Outline: Plain values reject zone options
    Given a <kind> "<value>"
    When format is called with pattern "<pattern>" and timeZone "UTC"
    Then the call throws an invalid-zone-context error
    Examples:
      | kind           | value            | pattern    |
      | PlainDate      | 2026-10-23       | yyyy-MM-dd |
      | PlainDateTime  | 2026-10-23T12:00 | yyyy-MM-dd |
      | PlainYearMonth | 2026-10          | yyyy-MM    |
      | PlainMonthDay  | 02-29            | MM-dd      |
      | PlainTime      | 12:00            | HH:mm      |

  @case-FMT-012
  Scenario Outline: Locale selects grammatical text labels
    Given a <kind> "<value>"
    When format is called with pattern "<pattern>" and locale "<locale>"
    Then the returned text is "<text>"
    Examples:
      | kind           | value      | pattern            | locale | text                     |
      | PlainDate      | 2026-10-23 | EEEE, MMMM d, yyyy | en-US  | Friday, October 23, 2026 |
      | PlainDate      | 2026-10-23 | EEE MMM            | en-US  | Fri Oct                  |
      | PlainDate      | 2026-10-23 | MMMM               | es-UY  | octubre                  |
      | PlainDate      | 2026-05-23 | d MMMM             | ru     | 23 мая                   |
      | PlainYearMonth | 2026-05    | MMMM               | ru     | мая                      |
      | PlainMonthDay  | 05-23      | d MMMM             | fi     | 23 toukokuuta            |

  @case-FMT-013
  Scenario: Numeric tokens use ASCII digits with a non-Latin numbering locale
    Given a PlainDate "2026-10-23"
    When format is called with pattern "yyyy-MM-dd" and locale "ar-EG"
    Then the returned text is "2026-10-23"

  @case-FMT-014
  Scenario Outline: Offset token shapes differ at minute precision
    Given a ZonedDateTime "<value>"
    When format is called with pattern "XX XXX"
    Then the returned text is "<text>"
    Examples:
      | value                    | text         |
      | 2026-10-23T12:00[UTC]    | Z Z          |
      | 2026-10-23T12:00[+05:30] | +0530 +05:30 |
      | 2026-10-23T12:00[-03:00] | -0300 -03:00 |

  @case-FMT-015 @source-D02
  Scenario: Offset tokens intentionally discard historical offset seconds
    Given host time-zone data assigns offset "+00:09:21" to Paris at Instant "1890-01-01T00:00Z"
    And that instant is viewed as a ZonedDateTime in "Europe/Paris"
    When format is called with pattern "XX XXX"
    Then the returned text is "+0009 +00:09"
    And the original value retains its full offset

  @case-FMT-016
  Scenario: Sub-millisecond precision is retained in the input
    Given a PlainDateTime "2026-10-23T12:03:04.005006007"
    When format is called with pattern "SSS"
    Then the returned text is "005"
    And the input remains "2026-10-23T12:03:04.005006007"

  @case-FMT-017
  Scenario Outline: Invalid locale or zone configuration throws
    Given an Instant "2026-10-23T12:00Z"
    When format is called with pattern "yyyy-MM-dd" and <options>
    Then it throws an invalid-option error
    Examples:
      | options                                     |
      | {timeZone: 'Not/AZone'}                     |
      | {timeZone: 'UTC', locale: 'invalid_locale'} |
      | {timeZone: 'UTC', locale: null}             |
