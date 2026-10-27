export const dateFields = ['year', 'month', 'day'] as const;
export const timeFields = [
  'hour',
  'minute',
  'second',
  'millisecond',
  'microsecond',
  'nanosecond',
] as const;
export const fields = [...dateFields, ...timeFields] as const;
export type Fields = Record<(typeof fields)[number], number>;
export const dayNanoseconds = 86_400_000_000_000n;
export const leap = (year: number): boolean =>
  year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
export const daysInMonth = (year: number, month: number): number =>
  month === 2 ? (leap(year) ? 29 : 28) : [4, 6, 9, 11].includes(month) ? 30 : 31;

// ISO arithmetic also covers the neighboring anniversary outside Temporal's range.
export function dayNumber(year: number, month: number, day = 1): number {
  const previous = year - 1;
  return (
    365 * previous +
    Math.floor(previous / 4) -
    Math.floor(previous / 100) +
    Math.floor(previous / 400) +
    [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334][month - 1]! +
    (month > 2 && leap(year) ? 1 : 0) +
    day -
    719_163
  );
}
export function clockNanoseconds(
  value: Partial<Pick<Fields, (typeof timeFields)[number]>>,
): bigint {
  return timeFields.reduce(
    (total, field, index) =>
      total * BigInt([1, 60, 60, 1000, 1000, 1000][index]!) + BigInt(value[field] ?? 0),
    0n,
  );
}
export type Period = 'day' | 'week' | 'month' | 'quarter' | 'year';
export function periodIndex(
  value: { year: number; month: number; day?: number },
  unit: Period,
  starts = 0,
): number {
  if (unit === 'year') return value.year;
  const months = value.year * 12 + value.month - 1;
  if (unit === 'month') return months;
  if (unit === 'quarter') return Math.floor(months / 3);
  const day = dayNumber(value.year, value.month, value.day!);
  return unit === 'day' ? day : Math.floor((day + 4 - starts) / 7);
}
