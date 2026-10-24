@source-types @source-conventions @source-D03 @derived
Feature: Public functions accept only the information required by their operation
  The examples cover each function against every main Temporal kind, legacy Date, and string.

  Background:
    Given these representative values in a host whose local zone is UTC:
      | kind           | value                              | compatible pattern      | matching text           |
      | PlainDate      | 2026-10-23                         | yyyy-MM-dd              | 2026-10-23              |
      | PlainDateTime  | 2026-10-23T12:34:56.123            | yyyy-MM-dd HH:mm:ss.SSS | 2026-10-23 12:34:56.123 |
      | ZonedDateTime  | 2026-10-23T12:34:56.123[UTC]       | yyyy-MM-dd HH:mm:ss.SSS | 2026-10-23 12:34:56.123 |
      | PlainTime      | 12:34:56.123                       | HH:mm:ss.SSS            | 12:34:56.123            |
      | PlainYearMonth | 2026-10                            | yyyy-MM                 | 2026-10                 |
      | PlainMonthDay  | 10-23                              | MM-dd                   | 10-23                   |
      | Instant        | 2026-10-23T12:34:56.123Z           | yyyy-MM-dd HH:mm:ss.SSS | 2026-10-23 12:34:56.123 |
      | Duration       | PT25H30M                           | 'literal'               | literal                 |
      | Date           | host-local 2026-10-23T12:34:56.123 | 'literal'               | literal                 |
      | string         | 25h 30m                            | 'literal'               | literal                 |
    And calls use the following public argument arrangements:
      | operation                               | arrangement                                             |
      | format                                  | value, compatible pattern                               |
      | parse, tryParse, isMatch                | matching text, compatible pattern, value as reference   |
      | formatDuration                          | value                                                   |
      | parseDuration, tryParseDuration         | the representative primary argument, without conversion |
      | calendar comparisons and relative pairs | value, the same value as base                           |
      | min, max                                | a singleton array containing value                      |
      | closestTo, closestIndexTo               | value as target, a singleton array containing value     |
      | isWithinInterval, clamp                 | value, an interval whose two endpoints are value        |
      | areIntervalsOverlapping                 | two intervals whose endpoints are value                 |
      | each interval sequence                  | an interval whose two endpoints are value               |
      | addBusinessDays, subBusinessDays        | value, amount 1                                         |
      | differenceInBusinessDays                | value, the same value as earlier                        |
      | nextDay, previousDay                    | value, weekday 1                                        |
      | other unary functions                   | value                                                   |
    And Instant calendar calls and plain ToNow calls receive timeZone "UTC"
    And all other options are omitted
    And unsupported reference/value kinds use the valid literal-only pattern from the catalog
    And any failure is attributable to that unsupported kind rather than an invalid pattern

    And documented return shapes mean:
      | operation                                                 | successful return shape                |
      | format, formatDuration, relative descriptions             | string                                 |
      | parse                                                     | the reference Temporal kind            |
      | tryParse                                                  | [null, the reference Temporal kind]    |
      | isMatch and predicates                                    | boolean                                |
      | parseDuration                                             | Duration                               |
      | tryParseDuration                                          | [null, Duration]                       |
      | boundaries, business additions, weekday navigation, clamp | the input Temporal kind                |
      | min, max, closestTo                                       | the original singleton input object    |
      | closestIndexTo                                            | number 0                               |
      | differenceInBusinessDays                                  | number 0                               |
      | calendar queries                                          | number                                 |
      | sequences                                                 | an array of the endpoint Temporal kind |
      | toCalendarDate                                            | Date                                   |
      | fromCalendarDate                                          | PlainDateTime                          |

  @case-TYPE-001
  Scenario Outline: Supported input kinds produce an operation-appropriate result
    Given the representative <kind> value and the public arrangement for <function>
    When <function> is called
    Then it returns successfully
    And its result has the documented return shape for <function> and <kind>
    Examples:
      | function                  | kind           |
      | format                    | PlainDate      |
      | format                    | PlainDateTime  |
      | format                    | ZonedDateTime  |
      | format                    | PlainYearMonth |
      | format                    | PlainTime      |
      | format                    | Instant        |
      | format                    | PlainMonthDay  |
      | parse                     | PlainDate      |
      | parse                     | PlainDateTime  |
      | parse                     | ZonedDateTime  |
      | parse                     | PlainYearMonth |
      | parse                     | PlainTime      |
      | parse                     | Instant        |
      | parse                     | PlainMonthDay  |
      | tryParse                  | PlainDate      |
      | tryParse                  | PlainDateTime  |
      | tryParse                  | ZonedDateTime  |
      | tryParse                  | PlainYearMonth |
      | tryParse                  | PlainTime      |
      | tryParse                  | Instant        |
      | tryParse                  | PlainMonthDay  |
      | isMatch                   | PlainDate      |
      | isMatch                   | PlainDateTime  |
      | isMatch                   | ZonedDateTime  |
      | isMatch                   | PlainYearMonth |
      | isMatch                   | PlainTime      |
      | isMatch                   | Instant        |
      | isMatch                   | PlainMonthDay  |
      | formatDuration            | Duration       |
      | parseDuration             | string         |
      | tryParseDuration          | string         |
      | startOfWeek               | PlainDate      |
      | startOfWeek               | PlainDateTime  |
      | startOfWeek               | ZonedDateTime  |
      | startOfISOWeek            | PlainDate      |
      | startOfISOWeek            | PlainDateTime  |
      | startOfISOWeek            | ZonedDateTime  |
      | startOfMonth              | PlainDate      |
      | startOfMonth              | PlainDateTime  |
      | startOfMonth              | ZonedDateTime  |
      | endOfWeek                 | PlainDate      |
      | endOfWeek                 | PlainDateTime  |
      | endOfWeek                 | ZonedDateTime  |
      | endOfISOWeek              | PlainDate      |
      | endOfISOWeek              | PlainDateTime  |
      | endOfISOWeek              | ZonedDateTime  |
      | endOfMonth                | PlainDate      |
      | endOfMonth                | PlainDateTime  |
      | endOfMonth                | ZonedDateTime  |
      | startOfQuarter            | PlainDate      |
      | startOfQuarter            | PlainDateTime  |
      | startOfQuarter            | ZonedDateTime  |
      | startOfQuarter            | PlainYearMonth |
      | startOfYear               | PlainDate      |
      | startOfYear               | PlainDateTime  |
      | startOfYear               | ZonedDateTime  |
      | startOfYear               | PlainYearMonth |
      | endOfQuarter              | PlainDate      |
      | endOfQuarter              | PlainDateTime  |
      | endOfQuarter              | ZonedDateTime  |
      | endOfQuarter              | PlainYearMonth |
      | endOfYear                 | PlainDate      |
      | endOfYear                 | PlainDateTime  |
      | endOfYear                 | ZonedDateTime  |
      | endOfYear                 | PlainYearMonth |
      | endOfDay                  | PlainTime      |
      | endOfDay                  | PlainDateTime  |
      | endOfDay                  | ZonedDateTime  |
      | isSameDay                 | PlainDate      |
      | isSameDay                 | PlainDateTime  |
      | isSameDay                 | ZonedDateTime  |
      | isSameDay                 | Instant        |
      | isSameWeek                | PlainDate      |
      | isSameWeek                | PlainDateTime  |
      | isSameWeek                | ZonedDateTime  |
      | isSameWeek                | Instant        |
      | isSameISOWeek             | PlainDate      |
      | isSameISOWeek             | PlainDateTime  |
      | isSameISOWeek             | ZonedDateTime  |
      | isSameISOWeek             | Instant        |
      | isSameMonth               | PlainDate      |
      | isSameMonth               | PlainDateTime  |
      | isSameMonth               | ZonedDateTime  |
      | isSameMonth               | PlainYearMonth |
      | isSameMonth               | Instant        |
      | isSameQuarter             | PlainDate      |
      | isSameQuarter             | PlainDateTime  |
      | isSameQuarter             | ZonedDateTime  |
      | isSameQuarter             | PlainYearMonth |
      | isSameQuarter             | Instant        |
      | isSameYear                | PlainDate      |
      | isSameYear                | PlainDateTime  |
      | isSameYear                | ZonedDateTime  |
      | isSameYear                | PlainYearMonth |
      | isSameYear                | Instant        |
      | formatDistance            | PlainDate      |
      | formatDistance            | PlainDateTime  |
      | formatDistance            | ZonedDateTime  |
      | formatDistance            | Instant        |
      | formatDistanceStrict      | PlainDate      |
      | formatDistanceStrict      | PlainDateTime  |
      | formatDistanceStrict      | ZonedDateTime  |
      | formatDistanceStrict      | Instant        |
      | formatDistanceToNow       | PlainDate      |
      | formatDistanceToNow       | PlainDateTime  |
      | formatDistanceToNow       | ZonedDateTime  |
      | formatDistanceToNow       | Instant        |
      | formatDistanceToNowStrict | PlainDate      |
      | formatDistanceToNowStrict | PlainDateTime  |
      | formatDistanceToNowStrict | ZonedDateTime  |
      | formatDistanceToNowStrict | Instant        |
      | formatRelative            | PlainDate      |
      | formatRelative            | PlainDateTime  |
      | formatRelative            | ZonedDateTime  |
      | formatRelative            | Instant        |
      | min                       | PlainDate      |
      | min                       | PlainDateTime  |
      | min                       | ZonedDateTime  |
      | min                       | PlainYearMonth |
      | min                       | PlainTime      |
      | min                       | Instant        |
      | max                       | PlainDate      |
      | max                       | PlainDateTime  |
      | max                       | ZonedDateTime  |
      | max                       | PlainYearMonth |
      | max                       | PlainTime      |
      | max                       | Instant        |
      | closestTo                 | PlainDate      |
      | closestTo                 | PlainDateTime  |
      | closestTo                 | ZonedDateTime  |
      | closestTo                 | PlainYearMonth |
      | closestTo                 | PlainTime      |
      | closestTo                 | Instant        |
      | closestIndexTo            | PlainDate      |
      | closestIndexTo            | PlainDateTime  |
      | closestIndexTo            | ZonedDateTime  |
      | closestIndexTo            | PlainYearMonth |
      | closestIndexTo            | PlainTime      |
      | closestIndexTo            | Instant        |
      | isWithinInterval          | PlainDate      |
      | isWithinInterval          | PlainDateTime  |
      | isWithinInterval          | ZonedDateTime  |
      | isWithinInterval          | PlainYearMonth |
      | isWithinInterval          | PlainTime      |
      | isWithinInterval          | Instant        |
      | areIntervalsOverlapping   | PlainDate      |
      | areIntervalsOverlapping   | PlainDateTime  |
      | areIntervalsOverlapping   | ZonedDateTime  |
      | areIntervalsOverlapping   | PlainYearMonth |
      | areIntervalsOverlapping   | PlainTime      |
      | areIntervalsOverlapping   | Instant        |
      | clamp                     | PlainDate      |
      | clamp                     | PlainDateTime  |
      | clamp                     | ZonedDateTime  |
      | clamp                     | PlainYearMonth |
      | clamp                     | PlainTime      |
      | clamp                     | Instant        |
      | eachDayOfInterval         | PlainDate      |
      | eachDayOfInterval         | PlainDateTime  |
      | eachDayOfInterval         | ZonedDateTime  |
      | eachWeekOfInterval        | PlainDate      |
      | eachWeekOfInterval        | PlainDateTime  |
      | eachWeekOfInterval        | ZonedDateTime  |
      | eachWeekendOfInterval     | PlainDate      |
      | eachWeekendOfInterval     | PlainDateTime  |
      | eachWeekendOfInterval     | ZonedDateTime  |
      | eachMonthOfInterval       | PlainDate      |
      | eachMonthOfInterval       | PlainDateTime  |
      | eachMonthOfInterval       | ZonedDateTime  |
      | eachMonthOfInterval       | PlainYearMonth |
      | eachHourOfInterval        | PlainTime      |
      | eachHourOfInterval        | PlainDateTime  |
      | eachHourOfInterval        | ZonedDateTime  |
      | eachMinuteOfInterval      | PlainTime      |
      | eachMinuteOfInterval      | PlainDateTime  |
      | eachMinuteOfInterval      | ZonedDateTime  |
      | addBusinessDays           | PlainDate      |
      | addBusinessDays           | PlainDateTime  |
      | addBusinessDays           | ZonedDateTime  |
      | subBusinessDays           | PlainDate      |
      | subBusinessDays           | PlainDateTime  |
      | subBusinessDays           | ZonedDateTime  |
      | differenceInBusinessDays  | PlainDate      |
      | differenceInBusinessDays  | PlainDateTime  |
      | differenceInBusinessDays  | ZonedDateTime  |
      | isWeekend                 | PlainDate      |
      | isWeekend                 | PlainDateTime  |
      | isWeekend                 | ZonedDateTime  |
      | isBusinessDay             | PlainDate      |
      | isBusinessDay             | PlainDateTime  |
      | isBusinessDay             | ZonedDateTime  |
      | nextDay                   | PlainDate      |
      | nextDay                   | PlainDateTime  |
      | nextDay                   | ZonedDateTime  |
      | previousDay               | PlainDate      |
      | previousDay               | PlainDateTime  |
      | previousDay               | ZonedDateTime  |
      | getQuarter                | PlainDate      |
      | getQuarter                | PlainDateTime  |
      | getQuarter                | ZonedDateTime  |
      | getQuarter                | PlainYearMonth |
      | getQuarter                | PlainMonthDay  |
      | getWeek                   | PlainDate      |
      | getWeek                   | PlainDateTime  |
      | getWeek                   | ZonedDateTime  |
      | getWeekYear               | PlainDate      |
      | getWeekYear               | PlainDateTime  |
      | getWeekYear               | ZonedDateTime  |
      | getWeekOfMonth            | PlainDate      |
      | getWeekOfMonth            | PlainDateTime  |
      | getWeekOfMonth            | ZonedDateTime  |
      | getWeeksInMonth           | PlainDate      |
      | getWeeksInMonth           | PlainDateTime  |
      | getWeeksInMonth           | ZonedDateTime  |
      | getWeeksInMonth           | PlainYearMonth |
      | toCalendarDate            | PlainDate      |
      | toCalendarDate            | PlainDateTime  |
      | toCalendarDate            | ZonedDateTime  |
      | fromCalendarDate          | Date           |

  @case-TYPE-002
  Scenario Outline: Unsupported input kinds are not silently coerced
    Given the representative <kind> value and the public arrangement for <function>
    When <function> is called with that unsupported value
    Then the call throws
    And it does not return a converted value, false, or an input-error tuple
    Examples:
      | function                  | kind           |
      | format                    | Duration       |
      | format                    | Date           |
      | format                    | string         |
      | parse                     | Duration       |
      | parse                     | Date           |
      | parse                     | string         |
      | tryParse                  | Duration       |
      | tryParse                  | Date           |
      | tryParse                  | string         |
      | isMatch                   | Duration       |
      | isMatch                   | Date           |
      | isMatch                   | string         |
      | formatDuration            | PlainDate      |
      | formatDuration            | PlainDateTime  |
      | formatDuration            | ZonedDateTime  |
      | formatDuration            | PlainTime      |
      | formatDuration            | PlainYearMonth |
      | formatDuration            | PlainMonthDay  |
      | formatDuration            | Instant        |
      | formatDuration            | Date           |
      | formatDuration            | string         |
      | parseDuration             | PlainDate      |
      | parseDuration             | PlainDateTime  |
      | parseDuration             | ZonedDateTime  |
      | parseDuration             | PlainTime      |
      | parseDuration             | PlainYearMonth |
      | parseDuration             | PlainMonthDay  |
      | parseDuration             | Instant        |
      | parseDuration             | Duration       |
      | parseDuration             | Date           |
      | tryParseDuration          | PlainDate      |
      | tryParseDuration          | PlainDateTime  |
      | tryParseDuration          | ZonedDateTime  |
      | tryParseDuration          | PlainTime      |
      | tryParseDuration          | PlainYearMonth |
      | tryParseDuration          | PlainMonthDay  |
      | tryParseDuration          | Instant        |
      | tryParseDuration          | Duration       |
      | tryParseDuration          | Date           |
      | startOfWeek               | PlainTime      |
      | startOfWeek               | PlainYearMonth |
      | startOfWeek               | PlainMonthDay  |
      | startOfWeek               | Instant        |
      | startOfWeek               | Duration       |
      | startOfWeek               | Date           |
      | startOfWeek               | string         |
      | startOfISOWeek            | PlainTime      |
      | startOfISOWeek            | PlainYearMonth |
      | startOfISOWeek            | PlainMonthDay  |
      | startOfISOWeek            | Instant        |
      | startOfISOWeek            | Duration       |
      | startOfISOWeek            | Date           |
      | startOfISOWeek            | string         |
      | startOfMonth              | PlainTime      |
      | startOfMonth              | PlainYearMonth |
      | startOfMonth              | PlainMonthDay  |
      | startOfMonth              | Instant        |
      | startOfMonth              | Duration       |
      | startOfMonth              | Date           |
      | startOfMonth              | string         |
      | endOfWeek                 | PlainTime      |
      | endOfWeek                 | PlainYearMonth |
      | endOfWeek                 | PlainMonthDay  |
      | endOfWeek                 | Instant        |
      | endOfWeek                 | Duration       |
      | endOfWeek                 | Date           |
      | endOfWeek                 | string         |
      | endOfISOWeek              | PlainTime      |
      | endOfISOWeek              | PlainYearMonth |
      | endOfISOWeek              | PlainMonthDay  |
      | endOfISOWeek              | Instant        |
      | endOfISOWeek              | Duration       |
      | endOfISOWeek              | Date           |
      | endOfISOWeek              | string         |
      | endOfMonth                | PlainTime      |
      | endOfMonth                | PlainYearMonth |
      | endOfMonth                | PlainMonthDay  |
      | endOfMonth                | Instant        |
      | endOfMonth                | Duration       |
      | endOfMonth                | Date           |
      | endOfMonth                | string         |
      | startOfQuarter            | PlainTime      |
      | startOfQuarter            | PlainMonthDay  |
      | startOfQuarter            | Instant        |
      | startOfQuarter            | Duration       |
      | startOfQuarter            | Date           |
      | startOfQuarter            | string         |
      | startOfYear               | PlainTime      |
      | startOfYear               | PlainMonthDay  |
      | startOfYear               | Instant        |
      | startOfYear               | Duration       |
      | startOfYear               | Date           |
      | startOfYear               | string         |
      | endOfQuarter              | PlainTime      |
      | endOfQuarter              | PlainMonthDay  |
      | endOfQuarter              | Instant        |
      | endOfQuarter              | Duration       |
      | endOfQuarter              | Date           |
      | endOfQuarter              | string         |
      | endOfYear                 | PlainTime      |
      | endOfYear                 | PlainMonthDay  |
      | endOfYear                 | Instant        |
      | endOfYear                 | Duration       |
      | endOfYear                 | Date           |
      | endOfYear                 | string         |
      | endOfDay                  | PlainDate      |
      | endOfDay                  | PlainYearMonth |
      | endOfDay                  | PlainMonthDay  |
      | endOfDay                  | Instant        |
      | endOfDay                  | Duration       |
      | endOfDay                  | Date           |
      | endOfDay                  | string         |
      | isSameDay                 | PlainTime      |
      | isSameDay                 | PlainYearMonth |
      | isSameDay                 | PlainMonthDay  |
      | isSameDay                 | Duration       |
      | isSameDay                 | Date           |
      | isSameDay                 | string         |
      | isSameWeek                | PlainTime      |
      | isSameWeek                | PlainYearMonth |
      | isSameWeek                | PlainMonthDay  |
      | isSameWeek                | Duration       |
      | isSameWeek                | Date           |
      | isSameWeek                | string         |
      | isSameISOWeek             | PlainTime      |
      | isSameISOWeek             | PlainYearMonth |
      | isSameISOWeek             | PlainMonthDay  |
      | isSameISOWeek             | Duration       |
      | isSameISOWeek             | Date           |
      | isSameISOWeek             | string         |
      | isSameMonth               | PlainTime      |
      | isSameMonth               | PlainMonthDay  |
      | isSameMonth               | Duration       |
      | isSameMonth               | Date           |
      | isSameMonth               | string         |
      | isSameQuarter             | PlainTime      |
      | isSameQuarter             | PlainMonthDay  |
      | isSameQuarter             | Duration       |
      | isSameQuarter             | Date           |
      | isSameQuarter             | string         |
      | isSameYear                | PlainTime      |
      | isSameYear                | PlainMonthDay  |
      | isSameYear                | Duration       |
      | isSameYear                | Date           |
      | isSameYear                | string         |
      | formatDistance            | PlainTime      |
      | formatDistance            | PlainYearMonth |
      | formatDistance            | PlainMonthDay  |
      | formatDistance            | Duration       |
      | formatDistance            | Date           |
      | formatDistance            | string         |
      | formatDistanceStrict      | PlainTime      |
      | formatDistanceStrict      | PlainYearMonth |
      | formatDistanceStrict      | PlainMonthDay  |
      | formatDistanceStrict      | Duration       |
      | formatDistanceStrict      | Date           |
      | formatDistanceStrict      | string         |
      | formatDistanceToNow       | PlainTime      |
      | formatDistanceToNow       | PlainYearMonth |
      | formatDistanceToNow       | PlainMonthDay  |
      | formatDistanceToNow       | Duration       |
      | formatDistanceToNow       | Date           |
      | formatDistanceToNow       | string         |
      | formatDistanceToNowStrict | PlainTime      |
      | formatDistanceToNowStrict | PlainYearMonth |
      | formatDistanceToNowStrict | PlainMonthDay  |
      | formatDistanceToNowStrict | Duration       |
      | formatDistanceToNowStrict | Date           |
      | formatDistanceToNowStrict | string         |
      | formatRelative            | PlainTime      |
      | formatRelative            | PlainYearMonth |
      | formatRelative            | PlainMonthDay  |
      | formatRelative            | Duration       |
      | formatRelative            | Date           |
      | formatRelative            | string         |
      | min                       | PlainMonthDay  |
      | min                       | Duration       |
      | min                       | Date           |
      | min                       | string         |
      | max                       | PlainMonthDay  |
      | max                       | Duration       |
      | max                       | Date           |
      | max                       | string         |
      | closestTo                 | PlainMonthDay  |
      | closestTo                 | Duration       |
      | closestTo                 | Date           |
      | closestTo                 | string         |
      | closestIndexTo            | PlainMonthDay  |
      | closestIndexTo            | Duration       |
      | closestIndexTo            | Date           |
      | closestIndexTo            | string         |
      | isWithinInterval          | PlainMonthDay  |
      | isWithinInterval          | Duration       |
      | isWithinInterval          | Date           |
      | isWithinInterval          | string         |
      | areIntervalsOverlapping   | PlainMonthDay  |
      | areIntervalsOverlapping   | Duration       |
      | areIntervalsOverlapping   | Date           |
      | areIntervalsOverlapping   | string         |
      | clamp                     | PlainMonthDay  |
      | clamp                     | Duration       |
      | clamp                     | Date           |
      | clamp                     | string         |
      | eachDayOfInterval         | PlainTime      |
      | eachDayOfInterval         | PlainYearMonth |
      | eachDayOfInterval         | PlainMonthDay  |
      | eachDayOfInterval         | Instant        |
      | eachDayOfInterval         | Duration       |
      | eachDayOfInterval         | Date           |
      | eachDayOfInterval         | string         |
      | eachWeekOfInterval        | PlainTime      |
      | eachWeekOfInterval        | PlainYearMonth |
      | eachWeekOfInterval        | PlainMonthDay  |
      | eachWeekOfInterval        | Instant        |
      | eachWeekOfInterval        | Duration       |
      | eachWeekOfInterval        | Date           |
      | eachWeekOfInterval        | string         |
      | eachWeekendOfInterval     | PlainTime      |
      | eachWeekendOfInterval     | PlainYearMonth |
      | eachWeekendOfInterval     | PlainMonthDay  |
      | eachWeekendOfInterval     | Instant        |
      | eachWeekendOfInterval     | Duration       |
      | eachWeekendOfInterval     | Date           |
      | eachWeekendOfInterval     | string         |
      | eachMonthOfInterval       | PlainTime      |
      | eachMonthOfInterval       | PlainMonthDay  |
      | eachMonthOfInterval       | Instant        |
      | eachMonthOfInterval       | Duration       |
      | eachMonthOfInterval       | Date           |
      | eachMonthOfInterval       | string         |
      | eachHourOfInterval        | PlainDate      |
      | eachHourOfInterval        | PlainYearMonth |
      | eachHourOfInterval        | PlainMonthDay  |
      | eachHourOfInterval        | Instant        |
      | eachHourOfInterval        | Duration       |
      | eachHourOfInterval        | Date           |
      | eachHourOfInterval        | string         |
      | eachMinuteOfInterval      | PlainDate      |
      | eachMinuteOfInterval      | PlainYearMonth |
      | eachMinuteOfInterval      | PlainMonthDay  |
      | eachMinuteOfInterval      | Instant        |
      | eachMinuteOfInterval      | Duration       |
      | eachMinuteOfInterval      | Date           |
      | eachMinuteOfInterval      | string         |
      | addBusinessDays           | PlainTime      |
      | addBusinessDays           | PlainYearMonth |
      | addBusinessDays           | PlainMonthDay  |
      | addBusinessDays           | Instant        |
      | addBusinessDays           | Duration       |
      | addBusinessDays           | Date           |
      | addBusinessDays           | string         |
      | subBusinessDays           | PlainTime      |
      | subBusinessDays           | PlainYearMonth |
      | subBusinessDays           | PlainMonthDay  |
      | subBusinessDays           | Instant        |
      | subBusinessDays           | Duration       |
      | subBusinessDays           | Date           |
      | subBusinessDays           | string         |
      | differenceInBusinessDays  | PlainTime      |
      | differenceInBusinessDays  | PlainYearMonth |
      | differenceInBusinessDays  | PlainMonthDay  |
      | differenceInBusinessDays  | Instant        |
      | differenceInBusinessDays  | Duration       |
      | differenceInBusinessDays  | Date           |
      | differenceInBusinessDays  | string         |
      | isWeekend                 | PlainTime      |
      | isWeekend                 | PlainYearMonth |
      | isWeekend                 | PlainMonthDay  |
      | isWeekend                 | Instant        |
      | isWeekend                 | Duration       |
      | isWeekend                 | Date           |
      | isWeekend                 | string         |
      | isBusinessDay             | PlainTime      |
      | isBusinessDay             | PlainYearMonth |
      | isBusinessDay             | PlainMonthDay  |
      | isBusinessDay             | Instant        |
      | isBusinessDay             | Duration       |
      | isBusinessDay             | Date           |
      | isBusinessDay             | string         |
      | nextDay                   | PlainTime      |
      | nextDay                   | PlainYearMonth |
      | nextDay                   | PlainMonthDay  |
      | nextDay                   | Instant        |
      | nextDay                   | Duration       |
      | nextDay                   | Date           |
      | nextDay                   | string         |
      | previousDay               | PlainTime      |
      | previousDay               | PlainYearMonth |
      | previousDay               | PlainMonthDay  |
      | previousDay               | Instant        |
      | previousDay               | Duration       |
      | previousDay               | Date           |
      | previousDay               | string         |
      | getQuarter                | PlainTime      |
      | getQuarter                | Instant        |
      | getQuarter                | Duration       |
      | getQuarter                | Date           |
      | getQuarter                | string         |
      | getWeek                   | PlainTime      |
      | getWeek                   | PlainYearMonth |
      | getWeek                   | PlainMonthDay  |
      | getWeek                   | Instant        |
      | getWeek                   | Duration       |
      | getWeek                   | Date           |
      | getWeek                   | string         |
      | getWeekYear               | PlainTime      |
      | getWeekYear               | PlainYearMonth |
      | getWeekYear               | PlainMonthDay  |
      | getWeekYear               | Instant        |
      | getWeekYear               | Duration       |
      | getWeekYear               | Date           |
      | getWeekYear               | string         |
      | getWeekOfMonth            | PlainTime      |
      | getWeekOfMonth            | PlainYearMonth |
      | getWeekOfMonth            | PlainMonthDay  |
      | getWeekOfMonth            | Instant        |
      | getWeekOfMonth            | Duration       |
      | getWeekOfMonth            | Date           |
      | getWeekOfMonth            | string         |
      | getWeeksInMonth           | PlainTime      |
      | getWeeksInMonth           | PlainMonthDay  |
      | getWeeksInMonth           | Instant        |
      | getWeeksInMonth           | Duration       |
      | getWeeksInMonth           | Date           |
      | getWeeksInMonth           | string         |
      | toCalendarDate            | PlainTime      |
      | toCalendarDate            | PlainYearMonth |
      | toCalendarDate            | PlainMonthDay  |
      | toCalendarDate            | Instant        |
      | toCalendarDate            | Duration       |
      | toCalendarDate            | Date           |
      | toCalendarDate            | string         |
      | fromCalendarDate          | PlainDate      |
      | fromCalendarDate          | PlainDateTime  |
      | fromCalendarDate          | ZonedDateTime  |
      | fromCalendarDate          | PlainTime      |
      | fromCalendarDate          | PlainYearMonth |
      | fromCalendarDate          | PlainMonthDay  |
      | fromCalendarDate          | Instant        |
      | fromCalendarDate          | Duration       |
      | fromCalendarDate          | string         |
