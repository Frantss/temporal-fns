import { Temporal } from 'temporal-polyfill';
import {
  addBusinessDays,
  areIntervalsOverlapping,
  clamp,
  closestTo,
  closestIndexTo,
  differenceInBusinessDays,
  eachDayOfInterval,
  eachWeekOfInterval,
  eachMonthOfInterval,
  eachWeekendOfInterval,
  eachHourOfInterval,
  eachMinuteOfInterval,
  endOfDay,
  endOfQuarter,
  format,
  formatDistance,
  formatDistanceToNow,
  formatDistanceToNowStrict,
  formatRelative,
  getQuarter,
  getWeeksInMonth,
  isMatch,
  isSameDay,
  isSameMonth,
  isWithinInterval,
  max,
  min,
  parse,
  parseDuration,
  startOfQuarter,
  tryParse,
  tryParseDuration,
  type TryResult,
} from '../src/index.js';
import { fromCalendarDate, toCalendarDate } from '../src/calendar.js';

const date = Temporal.PlainDate.from('2026-10-23');
const datetime = date.toPlainDateTime();
const time = Temporal.PlainTime.from('12:00');
const month = date.toPlainYearMonth();
const monthDay = date.toPlainMonthDay();
const zoned = date.toZonedDateTime('UTC');
const instant = zoned.toInstant();
const context = { timeZone: 'UTC' };
const interval = { start: date, end: date };

const parsedDate: Temporal.PlainDate = parse('2026', 'yyyy', date);
const parsedTime: Temporal.PlainTime = parse('12', 'HH', time);
const parsedMonth: Temporal.PlainYearMonth = parse('2026-10', 'yyyy-MM', month);
const parsedMonthDay: Temporal.PlainMonthDay = parse('10-23', 'MM-dd', monthDay);
const parsedInstant: Temporal.Instant = parse('2026', 'yyyy', instant, context);
const parsedZoned: Temporal.ZonedDateTime = parse('2026', 'yyyy', zoned);
const result: TryResult<Temporal.PlainDate, RangeError> = tryParse('2026', 'yyyy', date);
const [error, value] = result;
if (error === null) {
  const narrowed: Temporal.PlainDate = value;
} else {
  const failure: RangeError = error;
  const empty: null = value;
}
const duration: Temporal.Duration = parseDuration('25h');
const durationResult: TryResult<Temporal.Duration, RangeError> = tryParseDuration('25h');
const readonlyDates = [date, date] as const;
const selected: Temporal.PlainDate | undefined = min(readonlyDates);
const index: number | undefined = closestIndexTo(date, readonlyDates);
const selectedMonth: Temporal.PlainYearMonth | undefined = max([month]);
const end: Temporal.PlainTime = endOfDay(time);
const quarter: Temporal.PlainYearMonth = endOfQuarter(startOfQuarter(month));
const days: Temporal.PlainDate[] = eachDayOfInterval(interval);
const months: Temporal.PlainYearMonth[] = eachMonthOfInterval({ start: month, end: month });
const hours: Temporal.ZonedDateTime[] = eachHourOfInterval({ start: zoned, end: zoned });
const clamped: Temporal.Instant = clamp(instant, { start: instant, end: instant });
const added: Temporal.ZonedDateTime = addBusinessDays(zoned, 1, { weekendDays: [5, 6] });
const jsDate: Date = toCalendarDate(zoned);
const fromJsDate: Temporal.PlainDateTime = fromCalendarDate(jsDate);
format(instant, 'HH', context);
format(time, 'HH');
format(monthDay, 'MM-dd');
isSameDay(instant, instant, context);
isSameMonth(month, month);
formatDistance(instant, instant, context);
formatDistanceToNow(date, context);
formatDistanceToNowStrict(instant, context);
formatRelative(zoned, zoned);
getQuarter(monthDay);
getWeeksInMonth(month);

// @ts-expect-error Instant formatting requires a zone.
format(instant, 'HH');
// @ts-expect-error Plain values reject zone options.
format(date, 'yyyy', context);
// @ts-expect-error Instant parsing requires a zone.
parse('2026', 'yyyy', instant);
// @ts-expect-error Zoned references already supply the parser's zone.
parse('2026', 'yyyy', zoned, context);
// @ts-expect-error Instant validation requires a zone.
isMatch('2026', 'yyyy', instant);
// @ts-expect-error Calendar comparisons require matching kinds.
isSameDay(date, datetime);
// @ts-expect-error Instant comparisons require a zone.
isSameDay(instant, instant);
// @ts-expect-error Plain comparisons reject zones.
isSameMonth(month, month, context);
// @ts-expect-error Partial months do not support day comparisons.
isSameDay(month, month);
// @ts-expect-error Relative descriptions require matching kinds.
formatDistance(date, zoned);
// @ts-expect-error ToNow requires a zone for plain values.
formatDistanceToNow(date);
// @ts-expect-error Partial months have no relative-description overload.
formatRelative(month, month);
// @ts-expect-error Collections cannot infer a union of different kinds.
min([date, datetime]);
// @ts-expect-error Target and collection must have the same kind.
closestTo(date, [month]);
// @ts-expect-error Duration ordering needs an explicit relative context.
min([duration]);
// @ts-expect-error Annual month/day values have no chronological order.
max([monthDay]);
// @ts-expect-error Membership requires matching endpoint and value kinds.
isWithinInterval(date, { start: datetime, end: datetime });
// @ts-expect-error Overlap requires matching interval kinds.
areIntervalsOverlapping(interval, { start: month, end: month });
// @ts-expect-error Business differences require matching full-date kinds.
differenceInBusinessDays(date, zoned);
// @ts-expect-error Month/day values do not determine weeks in a month.
getWeeksInMonth(monthDay);
// @ts-expect-error Month-only values do not determine calendar weekdays.
addBusinessDays(month, 1);
// @ts-expect-error Widget adapters require complete dates.
toCalendarDate(month);
// @ts-expect-error PlainDate has no clock to end.
endOfDay(date);
// @ts-expect-error Day sequences require homogeneous kinds.
eachDayOfInterval({ start: date, end: datetime });
// @ts-expect-error Week sequences require homogeneous kinds.
eachWeekOfInterval({ start: date, end: zoned });
// @ts-expect-error Month sequences require homogeneous kinds.
eachMonthOfInterval({ start: date, end: month });
// @ts-expect-error Weekend sequences require homogeneous kinds.
eachWeekendOfInterval({ start: date, end: datetime });
// @ts-expect-error Hour sequences require homogeneous kinds.
eachHourOfInterval({ start: time, end: datetime });
// @ts-expect-error Minute sequences require homogeneous kinds.
eachMinuteOfInterval({ start: time, end: zoned });
