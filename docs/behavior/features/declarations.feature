@source-conventions @source-types @source-package @derived
Feature: TypeScript callers retain Temporal information and required context
  These are declaration-level formulations, without adding compiler tests or bindings.

  @case-TS-001
  Scenario Outline: Return types preserve the supported input kind
    Given a TypeScript caller with <inputs>
    When the caller assigns the result of <function> to <type>
    Then the assignment is permitted without a cast
    Examples:
      | function            | inputs                                                             | type                            |
      | parse               | valid text and pattern with a PlainDate reference                  | Temporal.PlainDate              |
      | parse               | valid text and pattern with a PlainTime reference                  | Temporal.PlainTime              |
      | parse               | valid text and pattern with a PlainYearMonth reference             | Temporal.PlainYearMonth         |
      | parse               | valid text and pattern with a PlainMonthDay reference              | Temporal.PlainMonthDay          |
      | parse               | valid text and pattern with a ZonedDateTime reference              | Temporal.ZonedDateTime          |
      | parse               | valid text and pattern with an Instant reference and required zone | Temporal.Instant                |
      | endOfDay            | PlainTime                                                          | Temporal.PlainTime              |
      | startOfQuarter      | PlainYearMonth                                                     | Temporal.PlainYearMonth         |
      | addBusinessDays     | ZonedDateTime and integer amount                                   | Temporal.ZonedDateTime          |
      | min                 | readonly PlainDate array                                           | Temporal.PlainDate or undefined |
      | eachMonthOfInterval | PlainYearMonth interval                                            | Temporal.PlainYearMonth array   |
      | clamp               | Instant and Instant interval                                       | Temporal.Instant                |
      | fromCalendarDate    | valid Date                                                         | Temporal.PlainDateTime          |

  @case-TS-002
  Scenario Outline: Required zones are enforced before execution
    Given a TypeScript caller with <inputs>
    When the caller calls <function> with omitted required timeZone
    Then the call is rejected by its public declaration
    Examples:
      | function                  | inputs                              |
      | format                    | Instant and pattern                 |
      | parse                     | text, pattern and Instant reference |
      | tryParse                  | text, pattern and Instant reference |
      | isMatch                   | text, pattern and Instant reference |
      | isSameDay                 | two Instants                        |
      | isSameWeek                | two Instants                        |
      | isSameISOWeek             | two Instants                        |
      | isSameMonth               | two Instants                        |
      | isSameQuarter             | two Instants                        |
      | isSameYear                | two Instants                        |
      | formatDistance            | two Instants                        |
      | formatDistanceStrict      | two Instants                        |
      | formatRelative            | two Instants                        |
      | formatDistanceToNow       | PlainDate                           |
      | formatDistanceToNow       | PlainDateTime                       |
      | formatDistanceToNow       | Instant                             |
      | formatDistanceToNowStrict | PlainDate                           |
      | formatDistanceToNowStrict | PlainDateTime                       |
      | formatDistanceToNowStrict | Instant                             |

  @case-TS-003
  Scenario Outline: Type inference cannot silently combine different Temporal kinds
    Given a TypeScript caller using <inputs>
    When the caller calls <function>
    Then the call is rejected by its public declaration
    Examples:
      | function                 | inputs                                          |
      | isSameDay                | PlainDate and PlainDateTime                     |
      | isSameMonth              | PlainYearMonth and PlainDate                    |
      | min                      | an array containing PlainDate and PlainDateTime |
      | max                      | an array containing PlainTime and Instant       |
      | closestTo                | PlainDate target and PlainYearMonth array       |
      | closestIndexTo           | PlainDate target and PlainDateTime array        |
      | isWithinInterval         | PlainDate value and PlainDateTime interval      |
      | areIntervalsOverlapping  | PlainDate interval and PlainYearMonth interval  |
      | clamp                    | PlainDate value and PlainDateTime interval      |
      | differenceInBusinessDays | PlainDate and ZonedDateTime                     |
      | formatDistance           | PlainDate and ZonedDateTime                     |
      | eachDayOfInterval        | PlainDate start and PlainDateTime end           |
      | eachWeekOfInterval       | PlainDate start and ZonedDateTime end           |
      | eachMonthOfInterval      | PlainDate start and PlainYearMonth end          |
      | eachWeekendOfInterval    | PlainDate start and PlainDateTime end           |
      | eachHourOfInterval       | PlainTime start and PlainDateTime end           |
      | eachMinuteOfInterval     | PlainTime start and ZonedDateTime end           |

  @case-TS-004
  Scenario Outline: Error-first parser tuples narrow both elements together
    Given a TypeScript caller receives <tuple> from <function>
    When the caller narrows its error element to null
    Then its result element has type <result> without null
    When the caller instead narrows the error element to non-null
    Then its error has type RangeError and its result has type null
    Examples:
      | function         | tuple                                         | result                  |
      | tryParse         | a try-result using a PlainDate reference      | Temporal.PlainDate      |
      | tryParse         | a try-result using a PlainYearMonth reference | Temporal.PlainYearMonth |
      | tryParseDuration | a duration try-result                         | Temporal.Duration       |

  @case-TS-005
  Scenario Outline: Context that would invent plain fields is statically invalid
    Given a TypeScript caller using <inputs>
    When the caller calls <function>
    Then the call is rejected by its public declaration
    Examples:
      | function        | inputs                                                         |
      | format          | PlainDate, a date pattern and timeZone UTC                     |
      | parse           | text, a date pattern, ZonedDateTime reference and timeZone UTC |
      | isSameMonth     | two PlainYearMonth values and timeZone UTC                     |
      | endOfDay        | PlainDate                                                      |
      | isSameDay       | two PlainYearMonth values                                      |
      | formatRelative  | two PlainYearMonth values                                      |
      | addBusinessDays | PlainYearMonth and amount 1                                    |
      | toCalendarDate  | PlainYearMonth                                                 |
      | getWeeksInMonth | PlainMonthDay                                                  |

  @case-TS-006
  Scenario Outline: Pattern parsers require a reference at the declaration boundary
    Given a TypeScript caller with text "2026-10-23" and pattern "yyyy-MM-dd"
    When the caller calls <function> without a reference argument
    Then its public declaration rejects the call
    Examples:
      | function |
      | parse    |
      | tryParse |
      | isMatch  |

  @case-TS-007
  Scenario Outline: Parser result tuples are readonly at the declaration boundary
    Given a TypeScript caller receives the declared result tuple from <function>
    When the caller assigns a different value to either tuple element
    Then its public tuple type rejects the assignment
    And this does not require freezing the returned array at runtime
    Examples:
      | function         |
      | tryParse         |
      | tryParseDuration |

  @case-TS-008
  Scenario Outline: Selection declarations accept readonly collections
    Given a TypeScript caller with a readonly PlainDate array and a PlainDate target where needed
    When the caller calls <function> with that array
    Then its public declaration permits the call without copying or casting the array
    Examples:
      | function       |
      | min            |
      | max            |
      | closestTo      |
      | closestIndexTo |
