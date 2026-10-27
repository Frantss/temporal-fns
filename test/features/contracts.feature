@source-conventions @source-package @derived
Feature: Calls preserve caller ownership and package boundaries

  @case-CON-001
  Scenario: Importing the package does not install a Temporal global
    Given a host without a global Temporal namespace
    When the caller imports the root entry point and the calendar subpath
    Then both imports complete
    And global Temporal remains absent
    And the package does not install a polyfill

  @case-CON-002
  Scenario: A call requiring Temporal reports that Temporal is unavailable
    Given the package has been imported
    And valid Temporal PlainTime input "12:00" was created before global Temporal became unavailable
    When endOfDay is called with that input while global Temporal is unavailable
    Then the call throws a Temporal-unavailable error
    And it does not install a Temporal namespace

  @case-CON-003
  Scenario: The public runtime surface has the proposed entry points
    When a caller imports the root entry point
    Then it exposes exactly the 54 root functions listed in coverage.md
    When the caller imports the calendar subpath
    Then it exposes toCalendarDate and fromCalendarDate
    And the root does not expose the two calendar adapters

  @case-CON-004
  Scenario Outline: Calendar-bearing non-ISO inputs are rejected
    Given a <kind> value with calendar "gregory" and ISO reference fields "<fields>"
    When <function> is called with <arguments>
    Then it throws RangeError for the unsupported calendar
    Examples:
      | function            | kind           | fields                | arguments                                                    |
      | format              | PlainDate      | 2026-10-23            | value and pattern "yyyy-MM-dd"                               |
      | parse               | PlainDate      | 2026-10-23            | matching date text, pattern "yyyy-MM-dd", value as reference |
      | startOfYear         | PlainDate      | 2026-10-23            | value                                                        |
      | endOfQuarter        | PlainYearMonth | 2026-10-01            | value                                                        |
      | isSameMonth         | ZonedDateTime  | 2026-10-23T12:00[UTC] | value and the same value                                     |
      | min                 | PlainDate      | 2026-10-23            | a singleton array containing value                           |
      | eachMonthOfInterval | PlainYearMonth | 2026-10-01            | a singleton interval containing value                        |
      | addBusinessDays     | PlainDateTime  | 2026-10-23T12:00      | value and amount 0                                           |
      | getQuarter          | PlainMonthDay  | 1972-10-23            | value                                                        |
      | toCalendarDate      | PlainDate      | 2026-10-23            | value                                                        |

  @case-CON-005
  Scenario Outline: Documented option defaults apply to omitted and undefined properties
    Given a PlainDate "2026-10-23"
    When <function> is called once with omitted options and once with <options>
    Then both calls return equivalent results
    Examples:
      | function        | options                                                     |
      | startOfWeek     | {weekStartsOn: undefined}                                   |
      | endOfWeek       | {weekStartsOn: undefined}                                   |
      | getWeek         | {weekStartsOn: undefined, firstWeekContainsDate: undefined} |
      | getWeekYear     | {weekStartsOn: undefined, firstWeekContainsDate: undefined} |
      | getWeekOfMonth  | {weekStartsOn: undefined}                                   |
      | getWeeksInMonth | {weekStartsOn: undefined}                                   |
      | isWeekend       | {weekendDays: undefined}                                    |
      | isBusinessDay   | {weekendDays: undefined}                                    |

  @case-CON-006
  Scenario Outline: Null does not select a documented default
    Given compatible valid inputs for <function>
    When <function> is called with <options>
    Then the call throws an invalid-option error
    Examples:
      | function             | options                       |
      | startOfWeek          | {weekStartsOn: null}          |
      | getWeek              | {firstWeekContainsDate: null} |
      | eachDayOfInterval    | {step: null}                  |
      | isWeekend            | {weekendDays: null}           |
      | formatDuration       | {format: null}                |
      | formatDistance       | {addSuffix: null}             |
      | formatDistanceStrict | {roundingMethod: null}        |
      | format               | {locale: null}                |

  @case-CON-007
  Scenario Outline: Documented locale limits are explicit
    Given compatible valid inputs for <function>
    When <function> is called with locale "fr"
    Then it throws an unsupported-locale error
    Examples:
      | function                  |
      | formatDuration            |
      | formatDistance            |
      | formatDistanceStrict      |
      | formatDistanceToNow       |
      | formatDistanceToNowStrict |
      | formatRelative            |

  @case-CON-008
  Scenario Outline: Every function leaves caller-owned data and global settings unchanged
    Given the representative <kind> input and invocation of <function> defined in type-coverage.feature
    And snapshots of its input values, arrays, options and interval endpoints
    And snapshots of the global Temporal namespace and host zone settings
    When <function> is called
    Then every input retains its original public value and array order
    And caller-owned options and interval endpoints retain their original values
    And the global Temporal namespace and host zone settings remain unchanged
    Examples:
      | function                  | kind      |
      | format                    | PlainDate |
      | parse                     | PlainDate |
      | tryParse                  | PlainDate |
      | isMatch                   | PlainDate |
      | formatDuration            | Duration  |
      | parseDuration             | string    |
      | tryParseDuration          | string    |
      | startOfWeek               | PlainDate |
      | startOfISOWeek            | PlainDate |
      | startOfMonth              | PlainDate |
      | endOfWeek                 | PlainDate |
      | endOfISOWeek              | PlainDate |
      | endOfMonth                | PlainDate |
      | startOfQuarter            | PlainDate |
      | startOfYear               | PlainDate |
      | endOfQuarter              | PlainDate |
      | endOfYear                 | PlainDate |
      | endOfDay                  | PlainTime |
      | isSameDay                 | PlainDate |
      | isSameWeek                | PlainDate |
      | isSameISOWeek             | PlainDate |
      | isSameMonth               | PlainDate |
      | isSameQuarter             | PlainDate |
      | isSameYear                | PlainDate |
      | formatDistance            | PlainDate |
      | formatDistanceStrict      | PlainDate |
      | formatDistanceToNow       | PlainDate |
      | formatDistanceToNowStrict | PlainDate |
      | formatRelative            | PlainDate |
      | min                       | PlainDate |
      | max                       | PlainDate |
      | closestTo                 | PlainDate |
      | closestIndexTo            | PlainDate |
      | isWithinInterval          | PlainDate |
      | areIntervalsOverlapping   | PlainDate |
      | clamp                     | PlainDate |
      | eachDayOfInterval         | PlainDate |
      | eachWeekOfInterval        | PlainDate |
      | eachWeekendOfInterval     | PlainDate |
      | eachMonthOfInterval       | PlainDate |
      | eachHourOfInterval        | PlainTime |
      | eachMinuteOfInterval      | PlainTime |
      | addBusinessDays           | PlainDate |
      | subBusinessDays           | PlainDate |
      | differenceInBusinessDays  | PlainDate |
      | isWeekend                 | PlainDate |
      | isBusinessDay             | PlainDate |
      | nextDay                   | PlainDate |
      | previousDay               | PlainDate |
      | getQuarter                | PlainDate |
      | getWeek                   | PlainDate |
      | getWeekYear               | PlainDate |
      | getWeekOfMonth            | PlainDate |
      | getWeeksInMonth           | PlainDate |
      | toCalendarDate            | PlainDate |
      | fromCalendarDate          | Date      |

  @case-CON-009 @source-boundaries
  Scenario: A custom week start affects only its own call
    Given a PlainDate "2026-10-23"
    When startOfWeek is called with weekStartsOn 1
    Then the result is PlainDate "2026-10-19"
    When startOfWeek is called again with omitted options
    Then the result is PlainDate "2026-10-18"

  @case-CON-010 @source-business
  Scenario: Custom weekends do not change later default calls
    Given a PlainDate "2026-10-23"
    When isWeekend is called with weekendDays [5,6]
    Then the result is true
    When isWeekend is called again with omitted options
    Then the result is false
    When isBusinessDay is called with omitted options
    Then the result is true
