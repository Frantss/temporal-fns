@source-relative @source-conventions @source-types @derived
Feature: Describe a value relative to an explicit base or the current clock

  @case-REL-001
  Scenario Outline: Approximate phrases change at documented lower-inclusive thresholds
    Given a PlainDateTime base "2026-01-01T00:00"
    And a value <seconds> wall-clock seconds after the base
    When formatDistance is called with omitted options
    Then the text is "<text>"
    Examples:
      | seconds  | text               |
      | 0        | less than a minute |
      | 29       | less than a minute |
      | 30       | 1 minute           |
      | 89       | 1 minute           |
      | 90       | 2 minutes          |
      | 2699     | 45 minutes         |
      | 2700     | about 1 hour       |
      | 5399     | about 1 hour       |
      | 5400     | about 2 hours      |
      | 86399    | about 24 hours     |
      | 86400    | 1 day              |
      | 151199   | 1 day              |
      | 151200   | 2 days             |
      | 2591999  | 30 days            |
      | 2592000  | about 1 month      |
      | 3887999  | about 1 month      |
      | 3888000  | 2 months           |
      | 5183999  | 2 months           |
      | 5184000  | 2 months           |
      | 31535999 | 12 months          |
      | 31536000 | about 1 year       |

  @case-REL-002
  Scenario Outline: includeSeconds refines only the first ninety seconds
    Given a PlainDateTime base "2026-01-01T00:00"
    And a value <seconds> seconds after the base
    When formatDistance is called with includeSeconds true
    Then the text is "<text>"
    Examples:
      | seconds | text                 |
      | 0       | less than 5 seconds  |
      | 4       | less than 5 seconds  |
      | 5       | less than 10 seconds |
      | 9       | less than 10 seconds |
      | 10      | less than 20 seconds |
      | 19      | less than 20 seconds |
      | 20      | half a minute        |
      | 39      | half a minute        |
      | 40      | less than a minute   |
      | 59      | less than a minute   |
      | 60      | 1 minute             |
      | 89      | 1 minute             |
      | 90      | 2 minutes            |

  @case-REL-003
  Scenario Outline: Suffixes describe value relative to base
    Given a PlainDateTime base "2026-01-01T00:00"
    And a value <seconds> seconds relative to the base
    When <function> is called with <options>
    Then the text is "<text>"
    Examples:
      | function             | seconds | options                         | text               |
      | formatDistance       | 172800  | {addSuffix: true}               | in 2 days          |
      | formatDistance       | -172800 | {addSuffix: true}               | 2 days ago         |
      | formatDistance       | 172800  | omitted options                 | 2 days             |
      | formatDistance       | 0       | {addSuffix: true}               | less than a minute |
      | formatDistanceStrict | 0       | {unit: second, addSuffix: true} | 0 seconds          |
      | formatDistanceStrict | 91      | {unit: minute, addSuffix: true} | in 2 minutes       |
      | formatDistanceStrict | -91     | {unit: minute, addSuffix: true} | 2 minutes ago      |

  @case-REL-004
  Scenario Outline: Strict default units are chosen before rounding
    Given a PlainDateTime base "2026-01-01T00:00"
    And a value <seconds> seconds after the base
    When formatDistanceStrict is called with omitted options
    Then the text is "<text>"
    Examples:
      | seconds  | text       |
      | 59       | 59 seconds |
      | 60       | 1 minute   |
      | 3599     | 60 minutes |
      | 3600     | 1 hour     |
      | 86399    | 24 hours   |
      | 86400    | 1 day      |
      | 2591999  | 30 days    |
      | 2592000  | 1 month    |
      | 31535999 | 12 months  |
      | 31536000 | 1 year     |

  @case-REL-005
  Scenario Outline: Strict rounding applies to the absolute magnitude
    Given a PlainDateTime base "2026-01-01T00:00"
    And a value <seconds> seconds relative to the base
    When formatDistanceStrict is called with unit minute, roundingMethod "<rounding>" and addSuffix true
    Then the text is "<text>"
    Examples:
      | seconds | rounding | text          |
      | 91      | floor    | in 1 minute   |
      | 91      | ceil     | in 2 minutes  |
      | 91      | trunc    | in 1 minute   |
      | 91      | round    | in 2 minutes  |
      | -91     | floor    | 1 minute ago  |
      | -91     | ceil     | 2 minutes ago |
      | -91     | trunc    | 1 minute ago  |
      | -91     | round    | 2 minutes ago |

  @case-REL-006
  Scenario Outline: An explicit unit overrides threshold selection
    Given a PlainDateTime base "2026-01-01T00:00"
    And value "2026-01-03T00:00"
    When formatDistanceStrict is called with unit "<unit>"
    Then the text is "<text>"
    Examples:
      | unit   | text           |
      | second | 172800 seconds |
      | minute | 2880 minutes   |
      | hour   | 48 hours       |
      | day    | 2 days         |
      | month  | 0 months       |
      | year   | 0 years        |

  @case-REL-007
  Scenario Outline: Months and years use constrained calendar anniversaries
    Given PlainDate base "<base>" and value "<value>"
    When formatDistanceStrict is called with unit "<unit>"
    Then the text is "<text>"
    Examples:
      | base       | value      | unit  | text     |
      | 2026-01-31 | 2026-02-28 | month | 1 month  |
      | 2024-02-29 | 2025-02-28 | year  | 1 year   |
      | 2026-01-01 | 2026-07-01 | month | 6 months |

  @case-REL-008
  Scenario Outline: Zoned days and elapsed hours carry different meanings across DST
    Given ZonedDateTime base "<base>" and value one calendar day later
    When formatDistanceStrict is called with unit "<unit>"
    Then the text is "<text>"
    Examples:
      | base                               | unit | text     |
      | 2026-03-07T12:00[America/New_York] | hour | 23 hours |
      | 2026-03-07T12:00[America/New_York] | day  | 1 day    |
      | 2026-10-31T12:00[America/New_York] | hour | 25 hours |
      | 2026-10-31T12:00[America/New_York] | day  | 1 day    |

  @case-REL-009
  Scenario: Plain date-times describe wall-clock time
    Given PlainDateTime base "2026-03-07T12:00" and value "2026-03-08T12:00"
    When formatDistanceStrict is called with unit hour
    Then the text is "24 hours"
    And no host time zone changes that result

  @case-REL-010
  Scenario Outline: Relative phrases select calendar dates around the base
    Given a PlainDate base "2026-10-23"
    And a value <days> calendar days relative to the base
    When formatRelative is called
    Then the text is "<text>"
    Examples:
      | days | text           |
      | -7   | 10/16/2026     |
      | -6   | last Saturday  |
      | -2   | last Wednesday |
      | -1   | yesterday      |
      | 0    | today          |
      | 1    | tomorrow       |
      | 2    | Sunday         |
      | 6    | Thursday       |
      | 7    | 10/30/2026     |

  @case-REL-011
  Scenario Outline: Date-time relative phrases include the value's clock even for distant dates
    Given a PlainDateTime base "2026-10-23T08:00"
    And a PlainDateTime value "<value>"
    When formatRelative is called with locale "en-US"
    Then the date phrase is "<date phrase>"
    And it is followed by " at " and a locale rendering of 2:30 PM
    Examples:
      | value            | date phrase |
      | 2026-10-23T14:30 | today       |
      | 2026-10-24T14:30 | tomorrow    |
      | 2026-10-30T14:30 | 10/30/2026  |

  @case-REL-012
  Scenario: Relative instant dates are determined in the explicit zone
    Given Instant value "2026-10-24T01:00Z" and base "2026-10-23T23:00Z"
    When formatRelative is called with timeZone "America/Montevideo"
    Then the text has date phrase "today" and clock text for 10:00 PM
    When the same call uses timeZone "UTC"
    Then the text has date phrase "tomorrow" and clock text for 1:00 AM

  @case-REL-013
  Scenario Outline: All relative pairs require matching kinds
    Given a PlainDate "2026-10-23" and ZonedDateTime "2026-10-23T12:00[UTC]"
    When <function> is called with those two values
    Then it throws an incompatible-kind error
    Examples:
      | function             |
      | formatDistance       |
      | formatDistanceStrict |
      | formatRelative       |

  @case-REL-014
  Scenario Outline: Relative pair zones follow the calendar comparison rules
    Given the same Instant "2026-01-01T01:00Z" viewed in UTC and America/New_York
    When <function> is called with those ZonedDateTime values and omitted timeZone
    Then it throws a missing-common-zone error
    When it is called with timeZone "UTC"
    Then the text is "<text>"
    Examples:
      | function             | text               |
      | formatDistance       | less than a minute |
      | formatDistanceStrict | 0 seconds          |

  @case-REL-015
  Scenario Outline: ToNow supports all four relative kinds in an explicit clock context
    Given the current instant is "2026-10-23T12:00Z"
    And a <kind> value "<value>"
    When formatDistanceToNow is called with timeZone "UTC" and addSuffix true
    Then the text is "in 2 days"
    When formatDistanceToNowStrict is called with timeZone "UTC", unit day and addSuffix true
    Then the text is "in 2 days"
    Examples:
      | kind          | value                 |
      | PlainDate     | 2026-10-25            |
      | PlainDateTime | 2026-10-25T12:00      |
      | ZonedDateTime | 2026-10-25T12:00[UTC] |
      | Instant       | 2026-10-25T12:00Z     |

  @case-REL-016
  Scenario Outline: ToNow reads the current clock separately for each call
    Given a PlainDate value "2026-10-25"
    And the current instant for the first call is "2026-10-23T12:00Z"
    When <function> is called with timeZone "UTC" and <options>
    Then the text is "2 days"
    Given the current instant for the second call is "2026-10-24T12:00Z"
    When the same call is made again
    Then the text is "1 day"
    Examples:
      | function                  | options                |
      | formatDistanceToNow       | omitted phrase options |
      | formatDistanceToNowStrict | unit day               |

  @case-REL-017
  Scenario: Zoned ToNow values supply their own default viewing zone
    Given the current instant is "2026-10-23T12:00Z"
    And a ZonedDateTime value "2026-10-25T08:00[America/New_York]"
    When formatDistanceToNow is called with omitted options
    Then the text is "2 days"
    When formatDistanceToNowStrict is called with unit day and omitted timeZone
    Then the text is "2 days"

  @case-REL-018
  Scenario: The viewing zone determines today's date for a plain ToNow input
    Given the current instant is "2026-10-24T01:00Z"
    And a PlainDate value "2026-10-24"
    When formatDistanceToNowStrict is called with unit day and timeZone "America/Montevideo"
    Then the text is "1 day"
    When the same call uses timeZone "UTC"
    Then the text is "0 days"

  @case-REL-019
  Scenario Outline: ToNow requires an explicit zone for plain and instant values
    Given a <kind> value "<value>"
    When <function> is called with omitted timeZone
    Then the call throws a missing-zone error
    Examples:
      | function                  | kind          | value             |
      | formatDistanceToNow       | PlainDate     | 2026-10-23        |
      | formatDistanceToNow       | PlainDateTime | 2026-10-23T12:00  |
      | formatDistanceToNow       | Instant       | 2026-10-23T12:00Z |
      | formatDistanceToNowStrict | PlainDate     | 2026-10-23        |
      | formatDistanceToNowStrict | PlainDateTime | 2026-10-23T12:00  |
      | formatDistanceToNowStrict | Instant       | 2026-10-23T12:00Z |

  @case-REL-020
  Scenario Outline: Invalid strict options do not select a fallback
    Given PlainDateTime base "2026-01-01T00:00" and value "2026-01-02T00:00"
    When formatDistanceStrict is called with <options>
    Then the call throws an invalid-option error
    Examples:
      | options                    |
      | {unit: week}               |
      | {unit: millisecond}        |
      | {roundingMethod: halfEven} |
      | {roundingMethod: null}     |
      | {addSuffix: 1}             |

  @case-REL-021
  Scenario: Native totals remain authoritative when a value is close to a rounding boundary
    Given PlainDateTime base "2000-03-01T00:00"
    And values one nanosecond below, at, and above 182 days and 12 hours after the base
    When formatDistanceStrict is called with unit year and each supported roundingMethod
    Then each text uses that runtime's successful native calendar total rounded by the selected method
    And an alternative calculation does not replace the successful native total

  @case-REL-022
  Scenario Outline: Repeated clock readings retain the elapsed difference between their occurrences
    Given ZonedDateTime base "<base>" and value "<value>"
    When formatDistanceStrict is called with unit "<unit>"
    Then the text is "<text>"
    Examples:
      | base                                        | value                                       | unit   | text       |
      | 2026-11-01T01:30-04:00[America/New_York]    | 2026-11-01T01:30-05:00[America/New_York]    | hour   | 1 hour     |
      | 2026-04-05T01:45+11:00[Australia/Lord_Howe] | 2026-04-05T01:45+10:30[Australia/Lord_Howe] | minute | 30 minutes |

  @case-REL-023
  Scenario Outline: Phrase options require their documented boolean values
    Given PlainDateTime base "2026-01-01T00:00" and value "2026-01-01T00:00:10"
    When formatDistance is called with <options>
    Then it throws an invalid-option error
    Examples:
      | options                  |
      | {includeSeconds: 1}      |
      | {includeSeconds: 'true'} |
      | {includeSeconds: null}   |
      | {addSuffix: 'yes'}       |

  @case-REL-024
  Scenario Outline: Instant pair descriptions require a viewing zone
    Given two Instants both equal to "2026-10-23T12:00Z"
    When <function> is called with omitted timeZone
    Then it throws a missing-zone error
    Examples:
      | function             |
      | formatDistance       |
      | formatDistanceStrict |
      | formatRelative       |

  @case-REL-025
  Scenario Outline: Plain pair descriptions reject zone context
    Given two PlainDate values both equal to "2026-10-23"
    When <function> is called with timeZone "UTC"
    Then it throws an invalid-zone-context error
    Examples:
      | function             |
      | formatDistance       |
      | formatDistanceStrict |
      | formatRelative       |

  @case-REL-026
  Scenario Outline: Approximate ToNow calls retain phrase options
    Given the current instant is "2026-01-01T00:00Z"
    And a ZonedDateTime value "2026-01-01T00:00:10[UTC]"
    When formatDistanceToNow is called with <options>
    Then the text is "<text>"
    Examples:
      | options                                 | text                    |
      | omitted options                         | less than a minute      |
      | {includeSeconds: true}                  | less than 20 seconds    |
      | {includeSeconds: true, addSuffix: true} | in less than 20 seconds |

  @case-REL-027
  Scenario Outline: Strict ToNow calls retain explicit units and rounding
    Given the current instant is "2026-01-01T00:00Z"
    And an Instant value "2026-01-01T00:01:31Z"
    When formatDistanceToNowStrict is called with timeZone UTC, unit minute, roundingMethod "<rounding>" and addSuffix true
    Then the text is "<text>"
    Examples:
      | rounding | text         |
      | floor    | in 1 minute  |
      | trunc    | in 1 minute  |
      | ceil     | in 2 minutes |
      | round    | in 2 minutes |

  @case-REL-028
  Scenario: A common zone determines both the date phrase and clock of a zoned relative call
    Given the same Instant "2026-01-01T01:00Z" viewed in UTC and America/New_York
    When formatRelative is called with those ZonedDateTime values and omitted timeZone
    Then it throws a missing-common-zone error
    When it is called with timeZone "UTC"
    Then its date phrase is "today"
    And the phrase is followed by " at " and an en-US rendering of 1:00 AM
    And the original values retain their respective zones

  @case-REL-029
  Scenario Outline: Rounding to zero does not erase the actual suffix direction
    Given a PlainDateTime base "2026-01-01T00:00"
    And a value <nanoseconds> nanoseconds relative to that base
    When formatDistanceStrict is called with unit second, roundingMethod "<rounding>" and addSuffix true
    Then the text is "<text>"
    Examples:
      | nanoseconds | rounding | text          |
      | 0           | round    | 0 seconds     |
      | 1           | round    | in 0 seconds  |
      | -1          | round    | 0 seconds ago |
      | 1           | floor    | in 0 seconds  |
      | -1          | floor    | 0 seconds ago |
      | 1           | ceil     | in 1 second   |
      | -1          | ceil     | 1 second ago  |
      | 499999999   | round    | in 0 seconds  |
      | 500000000   | round    | in 1 second   |
      | -499999999  | round    | 0 seconds ago |
      | -500000000  | round    | 1 second ago  |

  @case-REL-030
  Scenario: A ToNow zone override changes the calendar-day context for a zoned input
    Given the current instant is "2026-03-07T17:00Z"
    And a ZonedDateTime value "2026-03-08T12:00-04:00[America/New_York]"
    When formatDistanceToNowStrict is called with unit day and roundingMethod floor and omitted timeZone
    Then the text is "1 day"
    When the same call uses explicit timeZone "UTC"
    Then the text is "0 days"
    And the input retains zone "America/New_York"
