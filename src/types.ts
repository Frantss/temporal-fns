import type { Temporal } from 'temporal-spec';

export type { Temporal } from 'temporal-spec';
export type CalendarValue = Temporal.PlainDate | Temporal.PlainDateTime | Temporal.ZonedDateTime;
export type DateTimeValue = Temporal.PlainDateTime | Temporal.ZonedDateTime;
export type TimeValue = Temporal.PlainTime | DateTimeValue;
export type YearMonthValue = CalendarValue | Temporal.PlainYearMonth;
export type QuarterValue = YearMonthValue | Temporal.PlainMonthDay;
export type OrderedValue = YearMonthValue | Temporal.PlainTime | Temporal.Instant;
export type ParseReference =
  | YearMonthValue
  | Temporal.PlainTime
  | Temporal.PlainMonthDay
  | Temporal.Instant;
export type Formattable = ParseReference;
export type TemporalValue = Formattable | Temporal.Duration;
export type Weekday = 0 | 1 | 2 | 3 | 4 | 5 | 6;
export type TryResult<T, E extends Error = Error> =
  | readonly [error: null, result: T]
  | readonly [error: E, result: null];
export interface WeekOptions {
  weekStartsOn?: Weekday;
}
export interface WeekNumberOptions extends WeekOptions {
  firstWeekContainsDate?: 1 | 2 | 3 | 4 | 5 | 6 | 7;
}
export interface BusinessDayOptions {
  weekendDays?: readonly Weekday[];
}
export interface BusinessDayDifferenceOptions extends BusinessDayOptions {
  timeZone?: string;
}
export interface Interval<T extends OrderedValue> {
  start: T;
  end: T;
}
export interface ZoneOptions {
  timeZone?: string;
}
export interface RequiredZoneOptions {
  timeZone: string;
}
export interface PlainOptions {
  timeZone?: never;
}
export interface FormatOptions extends ZoneOptions {
  locale?: string;
}
export interface ParseOptions extends ZoneOptions {
  disambiguation?: 'compatible' | 'earlier' | 'later' | 'reject';
}
export interface DistanceOptions extends ZoneOptions {
  locale?: string;
  addSuffix?: boolean;
  includeSeconds?: boolean;
}
export interface StrictDistanceOptions extends ZoneOptions {
  locale?: string;
  addSuffix?: boolean;
  unit?: 'second' | 'minute' | 'hour' | 'day' | 'month' | 'year';
  roundingMethod?: 'floor' | 'ceil' | 'round' | 'trunc';
}
export type DurationUnit =
  | 'years'
  | 'months'
  | 'weeks'
  | 'days'
  | 'hours'
  | 'minutes'
  | 'seconds'
  | 'milliseconds'
  | 'microseconds'
  | 'nanoseconds';
export interface DurationFormatOptions {
  format?: readonly DurationUnit[];
  zero?: boolean;
  delimiter?: string;
  locale?: string;
}
export interface StepOptions {
  step?: number;
}
