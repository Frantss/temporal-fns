@source-parse @source-types @source-conventions @derived
Feature: Parse and validate patterns with an explicit reference

  @case-PAR-001
  Scenario Outline: Parsing preserves the reference kind
    Given a <kind> reference "<reference>"
    When parse is called with text "<text>" and pattern "<pattern>"
    Then the result is a <kind> equal to "<result>"
    When tryParse is called with the same text, pattern and reference
    Then its tuple is [null, a <kind> equal to "<result>"]
    When isMatch is called with the same text, pattern and reference
    Then the result is true
    Examples:
      | kind           | reference                     | text                    | pattern                 | result                      |
      | PlainDate      | 2000-07-19                    | 02/29/2024              | MM/dd/yyyy              | 2024-02-29                  |
      | PlainDateTime  | 2000-07-19T21:34:56.123456789 | 2024-02-29 23:15:16.123 | yyyy-MM-dd HH:mm:ss.SSS | 2024-02-29T23:15:16.123     |
      | PlainTime      | 21:34:56.123456789            | 08:15:16.123            | HH:mm:ss.SSS            | 08:15:16.123                |
      | PlainYearMonth | 2000-07                       | 02/2024                 | MM/yyyy                 | 2024-02                     |
      | PlainMonthDay  | 12-25                         | 02/29                   | MM/dd                   | 02-29                       |
      | ZonedDateTime  | 2000-07-19T12:00[UTC]         | 2024-02-29 23:15        | yyyy-MM-dd HH:mm        | 2024-02-29T23:15+00:00[UTC] |

  @case-PAR-002
  Scenario Outline: Omitted higher fields come from the reference and lower fields reset
    Given a <kind> reference "<reference>"
    When parse is called with text "<text>" and pattern "<pattern>"
    Then the result equals "<result>" without changing kind
    When tryParse is called with the same text, pattern and reference
    Then its result element equals "<result>" with a null error element
    Examples:
      | kind           | reference                     | text | pattern | result           |
      | PlainDate      | 2000-07-19                    | 2026 | yyyy    | 2026-01-01       |
      | PlainDate      | 2000-07-19                    | 02   | MM      | 2000-02-01       |
      | PlainDate      | 2000-07-19                    | 05   | dd      | 2000-07-05       |
      | PlainDateTime  | 2000-07-19T21:34:56.123456789 | 08   | HH      | 2000-07-19T08:00 |
      | PlainTime      | 21:34:56.123456789            | 15   | mm      | 21:15:00         |
      | PlainTime      | 21:34:56.123456789            | 007  | SSS     | 21:34:56.007     |
      | PlainYearMonth | 2000-07                       | 2026 | yyyy    | 2026-01          |
      | PlainYearMonth | 2000-07                       | 02   | MM      | 2000-02          |
      | PlainMonthDay  | 12-25                         | 02   | MM      | 02-01            |
      | PlainMonthDay  | 12-25                         | 29   | dd      | 12-29            |

  @case-PAR-003
  Scenario: tryParse returns an error-first success tuple
    Given a PlainDate reference "2000-01-01"
    When tryParse is called with text "02/29/2024" and pattern "MM/dd/yyyy"
    Then the tuple is [null, PlainDate "2024-02-29"]
    And exactly one tuple element is non-null
    And a caller narrowing the error to null can use the result as PlainDate

  @case-PAR-004
  Scenario Outline: Impossible or incomplete input has the same failure across parser variants
    Given a PlainDate reference "2000-01-01"
    When the text "<text>" is processed with pattern "MM/dd/yyyy"
    Then parse throws RangeError
    And tryParse returns [RangeError, null]
    And isMatch returns false
    Examples:
      | text            |
      | 02/29/2025      |
      | 02/30/2024      |
      | 00/01/2024      |
      | 13/01/2024      |
      | 01/00/2024      |
      | 01/32/2024      |
      | 2/29/2024       |
      | 02/29/24        |
      | 02/29/2024extra |

  @case-PAR-005
  Scenario: Input consumption includes trailing line breaks
    Given a PlainDate reference "2000-01-01"
    And input consists of "02/29/2024" followed by a line feed
    When the input is processed with pattern "MM/dd/yyyy"
    Then parse throws RangeError
    And tryParse returns [RangeError, null]
    And isMatch returns false

  @case-PAR-006
  Scenario Outline: Year-of-era parsing accepts positive four-to-six-digit years
    Given a PlainDate reference "2000-07-19"
    When the text "<text>" is processed with pattern "yyyy"
    Then isMatch returns <matches>
    And parse <outcome>
    Examples:
      | text    | matches | outcome                           |
      | 0001    | true    | returns PlainDate "0001-01-01"    |
      | 0099    | true    | returns PlainDate "0099-01-01"    |
      | 12345   | true    | returns PlainDate "+012345-01-01" |
      | 123456  | true    | returns PlainDate "+123456-01-01" |
      | 275760  | true    | returns PlainDate "+275760-01-01" |
      | 275761  | false   | throws RangeError                 |
      | 0000    | false   | throws RangeError                 |
      | -000001 | false   | throws RangeError                 |
      | +012345 | false   | throws RangeError                 |
      | 123     | false   | throws RangeError                 |
      | 1234567 | false   | throws RangeError                 |

  @case-PAR-007
  Scenario Outline: Clock fields reject overflow rather than constrain it
    Given a PlainTime reference "12:34:56"
    When text "<text>" is processed with pattern "<pattern>"
    Then parse throws RangeError
    And tryParse returns [RangeError, null]
    And isMatch returns false
    Examples:
      | text     | pattern  |
      | 24:00    | HH:mm    |
      | 23:60    | HH:mm    |
      | 23:59:60 | HH:mm:ss |
      | 00:00 AM | hh:mm a  |
      | 13:00 PM | hh:mm a  |
      | 12:00 am | hh:mm a  |

  @case-PAR-008
  Scenario Outline: Twelve-hour parsing distinguishes noon and midnight
    Given a PlainTime reference "21:34:56.123456789"
    When parse is called with text "<text>" and pattern "hh:mm a"
    Then the result equals "<result>"
    Examples:
      | text     | result   |
      | 12:00 AM | 00:00:00 |
      | 12:00 PM | 12:00:00 |
      | 01:05 PM | 13:05:00 |
      | 11:59 PM | 23:59:00 |

  @case-PAR-009
  Scenario Outline: Configuration failures still throw from all parser variants
    Given a <kind> reference "<reference>"
    When text "<text>" is processed with pattern "<pattern>"
    Then parse, tryParse and isMatch each throw an invalid-pattern error
    And no error tuple or false result masks that configuration error
    Examples:
      | kind           | reference  | text      | pattern   |
      | PlainDate      | 2000-01-01 | 2026      | YYYY      |
      | PlainDate      | 2000-01-01 | 26        | yy        |
      | PlainDate      | 2000-01-01 | October   | MMMM      |
      | PlainDate      | 2000-01-01 | 2026 2026 | yyyy yyyy |
      | PlainDate      | 2000-01-01 | 12        | HH        |
      | PlainTime      | 12:00      | 12        | hh        |
      | PlainTime      | 12:00      | 12 AM     | HH a      |
      | PlainYearMonth | 2000-07    | 01        | dd        |
      | PlainMonthDay  | 02-29      | 2026      | yyyy      |

  @case-PAR-010
  Scenario: Literal punctuation is matched exactly
    Given a PlainDate reference "2000-07-19"
    When parse is called with text "2026.[02]" and pattern "yyyy.[MM]"
    Then the result equals "2026-02-01"
    When isMatch is called with text "2026x[02]" and the same pattern and reference
    Then the result is false

  @case-PAR-011
  Scenario Outline: An instant reference supplies fields in the explicit viewing zone
    Given an Instant reference "2026-01-01T01:30Z"
    When parse is called with text "<text>", pattern "<pattern>" and timeZone "<zone>"
    Then the result is an Instant equal to "<result>"
    When tryParse is called with the same text, pattern, reference and options
    Then it returns [null, an Instant equal to "<result>"]
    When isMatch is called with the same text, pattern, reference and options
    Then it returns true
    Examples:
      | text                  | pattern              | zone               | result            |
      | 12:00                 | HH:mm                | America/Montevideo | 2025-12-31T15:00Z |
      | 12:00                 | HH:mm                | UTC                | 2026-01-01T12:00Z |
      | 2026-10-23 12:00      | yyyy-MM-dd HH:mm     | America/Montevideo | 2026-10-23T15:00Z |
      | 2026-10-23T12:00+0530 | yyyy-MM-dd'T'HH:mmXX | UTC                | 2026-10-23T06:30Z |

  @case-PAR-012
  Scenario Outline: Zone options follow the reference kind
    Given a <kind> reference "<reference>"
    When parse, tryParse or isMatch is called with a compatible pattern and <context>
    Then the call throws a zone-context error
    Examples:
      | kind          | reference             | context              |
      | Instant       | 2026-01-01T00:00Z     | omitted timeZone     |
      | Instant       | 2026-01-01T00:00Z     | timeZone "Not/AZone" |
      | PlainDate     | 2026-01-01            | timeZone "UTC"       |
      | PlainTime     | 12:00                 | timeZone "UTC"       |
      | ZonedDateTime | 2026-01-01T12:00[UTC] | timeZone "UTC"       |

  @case-PAR-013
  Scenario Outline: Fold disambiguation selects an occurrence in the reference zone
    Given a ZonedDateTime reference "2026-01-01T12:00[America/New_York]"
    When parse is called with text "2026-11-01 01:30", pattern "yyyy-MM-dd HH:mm" and disambiguation "<policy>"
    Then the result equals "<result>"
    Examples:
      | policy     | result                                   |
      | compatible | 2026-11-01T01:30-04:00[America/New_York] |
      | earlier    | 2026-11-01T01:30-04:00[America/New_York] |
      | later      | 2026-11-01T01:30-05:00[America/New_York] |

  @case-PAR-014
  Scenario Outline: Gap disambiguation follows the selected native policy
    Given a ZonedDateTime reference "2026-01-01T12:00[America/New_York]"
    When parse is called with text "2026-03-08 02:30", pattern "yyyy-MM-dd HH:mm" and <context>
    Then the result equals "<result>"
    Examples:
      | context                     | result                                   |
      | omitted disambiguation      | 2026-03-08T03:30-04:00[America/New_York] |
      | disambiguation "compatible" | 2026-03-08T03:30-04:00[America/New_York] |
      | disambiguation "later"      | 2026-03-08T03:30-04:00[America/New_York] |
      | disambiguation "earlier"    | 2026-03-08T01:30-05:00[America/New_York] |

  @case-PAR-015
  Scenario Outline: Rejecting a gap or fold is an input failure
    Given a ZonedDateTime reference "2026-01-01T12:00[America/New_York]"
    When text "<text>" is processed with pattern "yyyy-MM-dd HH:mm" and disambiguation "reject"
    Then parse throws RangeError
    And tryParse returns [RangeError, null]
    And isMatch returns false
    Examples:
      | text             |
      | 2026-03-08 02:30 |
      | 2026-11-01 01:30 |

  @case-PAR-016
  Scenario: An input offset determines the instant without requiring agreement with the reference zone
    Given a ZonedDateTime reference "2026-01-01T12:00[America/New_York]"
    When parse is called with text "2026-07-01T12:00+0100" and pattern "yyyy-MM-dd'T'HH:mmXX"
    Then the result has instant "2026-07-01T11:00Z"
    And the result retains zone "America/New_York"
    And its local clock time is "07:00"

  @case-PAR-017
  Scenario: Offset-only parsing preserves the reference's unspecified fields
    Given an Instant reference "2026-10-23T12:34:56.123456789Z"
    When parse is called with text "+01:00", pattern "XXX" and timeZone "UTC"
    Then the result is Instant "2026-10-23T11:34:56.123456789Z"

  @case-PAR-018 @source-D03
  Scenario Outline: A complete literal match retains all reference fields
    Given a PlainDateTime reference "2000-07-19T21:34:56.123456789"
    When text "<text>" is processed with pattern "<pattern>"
    Then parse returns a PlainDateTime equal to the reference
    And tryParse returns [null, a PlainDateTime equal to the reference]
    And isMatch returns true
    Examples:
      | text    | pattern   |
      |         |           |
      | literal | 'literal' |
      | it's    | 'it''s'   |

  @case-PAR-019 @source-D03
  Scenario Outline: Literal-only patterns still require a complete match
    Given a PlainDate reference "2000-07-19"
    When text "<text>" is processed with pattern "<pattern>"
    Then parse throws RangeError
    And tryParse returns [RangeError, null]
    And isMatch returns false
    Examples:
      | text         | pattern   |
      | extra        |           |
      | literalextra | 'literal' |
      | wrong        | 'literal' |

  @case-PAR-020
  Scenario: Repeated calls depend on the supplied reference rather than the current date
    Given a PlainDate reference "2000-07-19"
    When parse is called with text "02", pattern "MM" and that reference on two different current dates
    Then both results equal PlainDate "2000-02-01"
    And the reference still equals "2000-07-19"

  @case-PAR-021
  Scenario: Leading whitespace is input unless the pattern explicitly includes it
    Given a PlainDate reference "2000-07-19"
    And text consisting of one space followed by "02/29/2024"
    When the text is processed with pattern "MM/dd/yyyy"
    Then parse throws RangeError
    And tryParse returns [RangeError, null]
    And isMatch returns false
    When parse is called with the same text and a pattern consisting of one space followed by "MM/dd/yyyy"
    Then it returns PlainDate "2024-02-29"

  @case-PAR-022
  Scenario Outline: Single-width tokens accept unpadded numeric fields
    Given a <kind> reference "<reference>"
    When parse is called with text "<text>" and pattern "<pattern>"
    Then the result equals "<result>"
    Examples:
      | kind      | reference  | text     | pattern  | result     |
      | PlainDate | 2000-07-19 | 2/9/2024 | M/d/yyyy | 2024-02-09 |
      | PlainTime | 21:34:56   | 8:5:6    | H:m:s    | 08:05:06   |
      | PlainTime | 21:34:56   | 1:5 PM   | h:m a    | 13:05:00   |

  @case-PAR-023
  Scenario Outline: Offset text is validated as a complete offset
    Given an Instant reference "2026-01-01T00:00Z" with timeZone "UTC"
    When text "<text>" is processed with pattern "yyyy-MM-dd HH:mm XXX"
    Then parse throws RangeError
    And tryParse returns [RangeError, null]
    And isMatch returns false
    Examples:
      | text                       |
      | 2026-10-23 12:00 +24:00    |
      | 2026-10-23 12:00 +01:60    |
      | 2026-10-23 12:00 +0100     |
      | 2026-10-23 12:00 +01:00:30 |

  @case-PAR-024
  Scenario Outline: Invalid disambiguation is a configuration failure
    Given a ZonedDateTime reference "2026-01-01T12:00[America/New_York]"
    When valid text "2026-10-23 12:00" is processed with pattern "yyyy-MM-dd HH:mm" and disambiguation <policy>
    Then parse, tryParse and isMatch each throw an invalid-option error
    And none converts that failure into false or an error tuple
    Examples:
      | policy    |
      | 'invalid' |
      | null      |

  @case-PAR-025 @source-D03
  Scenario Outline: A literal-only pattern does not remove an instant reference's zone requirement
    Given an Instant reference "2026-10-23T12:34:56.123456789Z"
    When <function> is called with text "literal", pattern "'literal'" and omitted timeZone
    Then it throws a missing-zone error
    Examples:
      | function |
      | parse    |
      | tryParse |
      | isMatch  |

  @case-PAR-026 @source-D03
  Scenario: Literal-only instant parsing retains the reference when context is valid
    Given an Instant reference "2026-10-23T12:34:56.123456789Z"
    When parse is called with text "literal", pattern "'literal'" and timeZone "America/Montevideo"
    Then the result is an Instant equal to that original reference
    When tryParse is called with the same arguments
    Then it returns [null, an Instant equal to that original reference]
    When isMatch is called with the same arguments
    Then it returns true

  @case-PAR-027
  Scenario Outline: Non-text primary arguments are not ordinary parse failures
    Given a PlainDate reference "2000-01-01" and valid pattern "yyyy-MM-dd"
    And a non-string primary argument <input>
    When <function> is called with that argument, pattern and reference
    Then the call throws rather than returning false or an error tuple
    Examples:
      | function | input              |
      | parse    | null               |
      | tryParse | null               |
      | isMatch  | null               |
      | parse    | number 20261023    |
      | tryParse | number 20261023    |
      | isMatch  | number 20261023    |
      | parse    | an ordinary object |
      | tryParse | an ordinary object |
      | isMatch  | an ordinary object |
