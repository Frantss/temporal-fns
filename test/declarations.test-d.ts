import { describe, it, expectTypeOf } from 'vite-plus/test';
import * as f from '../dist/index.js';
import * as cal from '../dist/calendar.js';
import type { Temporal } from '../dist/types.js';
declare const pd: Temporal.PlainDate;
declare const pdt: Temporal.PlainDateTime;
declare const pym: Temporal.PlainYearMonth;
declare const pmd: Temporal.PlainMonthDay;
declare const pt: Temporal.PlainTime;
declare const zdt: Temporal.ZonedDateTime;
declare const inst: Temporal.Instant;
declare const legacy: Date;
declare const readonlyDates: readonly Temporal.PlainDate[];

describe('Public declarations', () => {
  describe('TS-001: Return types preserve the supported input kind', () => {
    it('Example 1: {"function":"parse","inputs":"valid text and pattern with a PlainDate reference","type":"Temporal.PlainDate"}', () => {
      const result = f.parse('literal', "'literal'", pd);
      expectTypeOf(result).toEqualTypeOf<Temporal.PlainDate>();
    });
    it('Example 2: {"function":"parse","inputs":"valid text and pattern with a PlainTime reference","type":"Temporal.PlainTime"}', () => {
      const result = f.parse('literal', "'literal'", pt);
      expectTypeOf(result).toEqualTypeOf<Temporal.PlainTime>();
    });
    it('Example 3: {"function":"parse","inputs":"valid text and pattern with a PlainYearMonth reference","type":"Temporal.PlainYearMonth"}', () => {
      const result = f.parse('literal', "'literal'", pym);
      expectTypeOf(result).toEqualTypeOf<Temporal.PlainYearMonth>();
    });
    it('Example 4: {"function":"parse","inputs":"valid text and pattern with a PlainMonthDay reference","type":"Temporal.PlainMonthDay"}', () => {
      const result = f.parse('literal', "'literal'", pmd);
      expectTypeOf(result).toEqualTypeOf<Temporal.PlainMonthDay>();
    });
    it('Example 5: {"function":"parse","inputs":"valid text and pattern with a ZonedDateTime reference","type":"Temporal.ZonedDateTime"}', () => {
      const result = f.parse('literal', "'literal'", zdt);
      expectTypeOf(result).toEqualTypeOf<Temporal.ZonedDateTime>();
    });
    it('Example 6: {"function":"parse","inputs":"valid text and pattern with an Instant reference and required zone","type":"Temporal.Instant"}', () => {
      const result = f.parse('literal', "'literal'", inst, { timeZone: 'UTC' });
      expectTypeOf(result).toEqualTypeOf<Temporal.Instant>();
    });
    it('Example 7: {"function":"endOfDay","inputs":"PlainTime","type":"Temporal.PlainTime"}', () => {
      const result = f.endOfDay(pt);
      expectTypeOf(result).toEqualTypeOf<Temporal.PlainTime>();
    });
    it('Example 8: {"function":"startOfQuarter","inputs":"PlainYearMonth","type":"Temporal.PlainYearMonth"}', () => {
      const result = f.startOfQuarter(pym);
      expectTypeOf(result).toEqualTypeOf<Temporal.PlainYearMonth>();
    });
    it('Example 9: {"function":"addBusinessDays","inputs":"ZonedDateTime and integer amount","type":"Temporal.ZonedDateTime"}', () => {
      const result = f.addBusinessDays(zdt, 1);
      expectTypeOf(result).toEqualTypeOf<Temporal.ZonedDateTime>();
    });
    it('Example 10: {"function":"min","inputs":"readonly PlainDate array","type":"Temporal.PlainDate or undefined"}', () => {
      const result = f.min(readonlyDates);
      expectTypeOf(result).toEqualTypeOf<Temporal.PlainDate | undefined>();
    });
    it('Example 11: {"function":"eachMonthOfInterval","inputs":"PlainYearMonth interval","type":"Temporal.PlainYearMonth array"}', () => {
      const result = f.eachMonthOfInterval({ start: pym, end: pym });
      expectTypeOf(result).toEqualTypeOf<Temporal.PlainYearMonth[]>();
    });
    it('Example 12: {"function":"clamp","inputs":"Instant and Instant interval","type":"Temporal.Instant"}', () => {
      const result = f.clamp(inst, { start: inst, end: inst });
      expectTypeOf(result).toEqualTypeOf<Temporal.Instant>();
    });
    it('Example 13: {"function":"fromCalendarDate","inputs":"valid Date","type":"Temporal.PlainDateTime"}', () => {
      const result = cal.fromCalendarDate(legacy);
      expectTypeOf(result).toEqualTypeOf<Temporal.PlainDateTime>();
    });
  });
  describe('TS-002: Required zones are enforced before execution', () => {
    it('Example 1: {"function":"format","inputs":"Instant and pattern"}', () => {
      // @ts-expect-error required viewing zone
      f.format(inst, 'yyyy-MM-dd');
    });
    it('Example 2: {"function":"parse","inputs":"text, pattern and Instant reference"}', () => {
      // @ts-expect-error required viewing zone
      f.parse('2026-10-23', 'yyyy-MM-dd', inst);
    });
    it('Example 3: {"function":"tryParse","inputs":"text, pattern and Instant reference"}', () => {
      // @ts-expect-error required viewing zone
      f.tryParse('2026-10-23', 'yyyy-MM-dd', inst);
    });
    it('Example 4: {"function":"isMatch","inputs":"text, pattern and Instant reference"}', () => {
      // @ts-expect-error required viewing zone
      f.isMatch('2026-10-23', 'yyyy-MM-dd', inst);
    });
    it('Example 5: {"function":"isSameDay","inputs":"two Instants"}', () => {
      // @ts-expect-error required viewing zone
      f.isSameDay(inst, inst);
    });
    it('Example 6: {"function":"isSameWeek","inputs":"two Instants"}', () => {
      // @ts-expect-error required viewing zone
      f.isSameWeek(inst, inst);
    });
    it('Example 7: {"function":"isSameISOWeek","inputs":"two Instants"}', () => {
      // @ts-expect-error required viewing zone
      f.isSameISOWeek(inst, inst);
    });
    it('Example 8: {"function":"isSameMonth","inputs":"two Instants"}', () => {
      // @ts-expect-error required viewing zone
      f.isSameMonth(inst, inst);
    });
    it('Example 9: {"function":"isSameQuarter","inputs":"two Instants"}', () => {
      // @ts-expect-error required viewing zone
      f.isSameQuarter(inst, inst);
    });
    it('Example 10: {"function":"isSameYear","inputs":"two Instants"}', () => {
      // @ts-expect-error required viewing zone
      f.isSameYear(inst, inst);
    });
    it('Example 11: {"function":"formatDistance","inputs":"two Instants"}', () => {
      // @ts-expect-error required viewing zone
      f.formatDistance(inst, inst);
    });
    it('Example 12: {"function":"formatDistanceStrict","inputs":"two Instants"}', () => {
      // @ts-expect-error required viewing zone
      f.formatDistanceStrict(inst, inst);
    });
    it('Example 13: {"function":"formatRelative","inputs":"two Instants"}', () => {
      // @ts-expect-error required viewing zone
      f.formatRelative(inst, inst);
    });
    it('Example 14: {"function":"formatDistanceToNow","inputs":"PlainDate"}', () => {
      // @ts-expect-error required viewing zone
      f.formatDistanceToNow(pd);
    });
    it('Example 15: {"function":"formatDistanceToNow","inputs":"PlainDateTime"}', () => {
      // @ts-expect-error required viewing zone
      f.formatDistanceToNow(pdt);
    });
    it('Example 16: {"function":"formatDistanceToNow","inputs":"Instant"}', () => {
      // @ts-expect-error required viewing zone
      f.formatDistanceToNow(inst);
    });
    it('Example 17: {"function":"formatDistanceToNowStrict","inputs":"PlainDate"}', () => {
      // @ts-expect-error required viewing zone
      f.formatDistanceToNowStrict(pd);
    });
    it('Example 18: {"function":"formatDistanceToNowStrict","inputs":"PlainDateTime"}', () => {
      // @ts-expect-error required viewing zone
      f.formatDistanceToNowStrict(pdt);
    });
    it('Example 19: {"function":"formatDistanceToNowStrict","inputs":"Instant"}', () => {
      // @ts-expect-error required viewing zone
      f.formatDistanceToNowStrict(inst);
    });
  });
  describe('TS-003: Type inference cannot silently combine different Temporal kinds', () => {
    it('Example 1: {"function":"isSameDay","inputs":"PlainDate and PlainDateTime"}', () => {
      // @ts-expect-error mixed Temporal kinds
      f.isSameDay(pd, pdt);
    });
    it('Example 2: {"function":"isSameMonth","inputs":"PlainYearMonth and PlainDate"}', () => {
      // @ts-expect-error mixed Temporal kinds
      f.isSameMonth(pym, pd);
    });
    it('Example 3: {"function":"min","inputs":"an array containing PlainDate and PlainDateTime"}', () => {
      // @ts-expect-error mixed Temporal kinds
      f.min([pd, pdt]);
    });
    it('Example 4: {"function":"max","inputs":"an array containing PlainTime and Instant"}', () => {
      // @ts-expect-error mixed Temporal kinds
      f.max([pt, inst]);
    });
    it('Example 5: {"function":"closestTo","inputs":"PlainDate target and PlainYearMonth array"}', () => {
      // @ts-expect-error mixed Temporal kinds
      f.closestTo(pd, [pym]);
    });
    it('Example 6: {"function":"closestIndexTo","inputs":"PlainDate target and PlainDateTime array"}', () => {
      // @ts-expect-error mixed Temporal kinds
      f.closestIndexTo(pd, [pdt]);
    });
    it('Example 7: {"function":"isWithinInterval","inputs":"PlainDate value and PlainDateTime interval"}', () => {
      // @ts-expect-error mixed Temporal kinds
      f.isWithinInterval(pd, { start: pdt, end: pdt });
    });
    it('Example 8: {"function":"areIntervalsOverlapping","inputs":"PlainDate interval and PlainYearMonth interval"}', () => {
      // @ts-expect-error mixed Temporal kinds
      f.areIntervalsOverlapping({ start: pd, end: pd }, { start: pym, end: pym });
    });
    it('Example 9: {"function":"clamp","inputs":"PlainDate value and PlainDateTime interval"}', () => {
      // @ts-expect-error mixed Temporal kinds
      f.clamp(pd, { start: pdt, end: pdt });
    });
    it('Example 10: {"function":"differenceInBusinessDays","inputs":"PlainDate and ZonedDateTime"}', () => {
      // @ts-expect-error mixed Temporal kinds
      f.differenceInBusinessDays(pd, zdt);
    });
    it('Example 11: {"function":"formatDistance","inputs":"PlainDate and ZonedDateTime"}', () => {
      // @ts-expect-error mixed Temporal kinds
      f.formatDistance(pd, zdt);
    });
    it('Example 12: {"function":"eachDayOfInterval","inputs":"PlainDate start and PlainDateTime end"}', () => {
      // @ts-expect-error mixed Temporal kinds
      f.eachDayOfInterval({ start: pd, end: pdt });
    });
    it('Example 13: {"function":"eachWeekOfInterval","inputs":"PlainDate start and ZonedDateTime end"}', () => {
      // @ts-expect-error mixed Temporal kinds
      f.eachWeekOfInterval({ start: pd, end: zdt });
    });
    it('Example 14: {"function":"eachMonthOfInterval","inputs":"PlainDate start and PlainYearMonth end"}', () => {
      // @ts-expect-error mixed Temporal kinds
      f.eachMonthOfInterval({ start: pd, end: pym });
    });
    it('Example 15: {"function":"eachWeekendOfInterval","inputs":"PlainDate start and PlainDateTime end"}', () => {
      // @ts-expect-error mixed Temporal kinds
      f.eachWeekendOfInterval({ start: pd, end: pdt });
    });
    it('Example 16: {"function":"eachHourOfInterval","inputs":"PlainTime start and PlainDateTime end"}', () => {
      // @ts-expect-error mixed Temporal kinds
      f.eachHourOfInterval({ start: pt, end: pdt });
    });
    it('Example 17: {"function":"eachMinuteOfInterval","inputs":"PlainTime start and ZonedDateTime end"}', () => {
      // @ts-expect-error mixed Temporal kinds
      f.eachMinuteOfInterval({ start: pt, end: zdt });
    });
  });
  describe('TS-004: Error-first parser tuples narrow both elements together', () => {
    it('Example 1: {"function":"tryParse","tuple":"a try-result using a PlainDate reference","result":"Temporal.PlainDate"}', () => {
      const [error, result] = f.tryParse('literal', "'literal'", pd);
      if (error === null) {
        const _parsed: Temporal.PlainDate = result;
        expectTypeOf(result).toEqualTypeOf<Temporal.PlainDate>();
      } else {
        const _failure: RangeError = error;
        expectTypeOf(error).toEqualTypeOf<RangeError>();
        const _absent: null = result;
        expectTypeOf(result).toEqualTypeOf<null>();
      }
    });
    it('Example 2: {"function":"tryParse","tuple":"a try-result using a PlainYearMonth reference","result":"Temporal.PlainYearMonth"}', () => {
      const [error, result] = f.tryParse('literal', "'literal'", pym);
      if (error === null) {
        const _parsed: Temporal.PlainYearMonth = result;
        expectTypeOf(result).toEqualTypeOf<Temporal.PlainYearMonth>();
      } else {
        const _failure: RangeError = error;
        expectTypeOf(error).toEqualTypeOf<RangeError>();
        const _absent: null = result;
        expectTypeOf(result).toEqualTypeOf<null>();
      }
    });
    it('Example 3: {"function":"tryParseDuration","tuple":"a duration try-result","result":"Temporal.Duration"}', () => {
      const [error, result] = f.tryParseDuration('1h');
      if (error === null) {
        const _parsed: Temporal.Duration = result;
        expectTypeOf(result).toEqualTypeOf<Temporal.Duration>();
      } else {
        const _failure: RangeError = error;
        expectTypeOf(error).toEqualTypeOf<RangeError>();
        const _absent: null = result;
        expectTypeOf(result).toEqualTypeOf<null>();
      }
    });
  });
  describe('TS-005: Context that would invent plain fields is statically invalid', () => {
    it('Example 1: {"function":"format","inputs":"PlainDate, a date pattern and timeZone UTC"}', () => {
      // @ts-expect-error incompatible kind or context
      f.format(pd, 'yyyy-MM-dd', { timeZone: 'UTC' });
    });
    it('Example 2: {"function":"parse","inputs":"text, a date pattern, ZonedDateTime reference and timeZone UTC"}', () => {
      // @ts-expect-error incompatible kind or context
      f.parse('2026-10-23', 'yyyy-MM-dd', zdt, { timeZone: 'UTC' });
    });
    it('Example 3: {"function":"isSameMonth","inputs":"two PlainYearMonth values and timeZone UTC"}', () => {
      // @ts-expect-error incompatible kind or context
      f.isSameMonth(pym, pym, { timeZone: 'UTC' });
    });
    it('Example 4: {"function":"endOfDay","inputs":"PlainDate"}', () => {
      // @ts-expect-error incompatible kind or context
      f.endOfDay(pd);
    });
    it('Example 5: {"function":"isSameDay","inputs":"two PlainYearMonth values"}', () => {
      // @ts-expect-error incompatible kind or context
      f.isSameDay(pym, pym);
    });
    it('Example 6: {"function":"formatRelative","inputs":"two PlainYearMonth values"}', () => {
      // @ts-expect-error incompatible kind or context
      f.formatRelative(pym, pym);
    });
    it('Example 7: {"function":"addBusinessDays","inputs":"PlainYearMonth and amount 1"}', () => {
      // @ts-expect-error incompatible kind or context
      f.addBusinessDays(pym, 1);
    });
    it('Example 8: {"function":"toCalendarDate","inputs":"PlainYearMonth"}', () => {
      // @ts-expect-error incompatible kind or context
      cal.toCalendarDate(pym);
    });
    it('Example 9: {"function":"getWeeksInMonth","inputs":"PlainMonthDay"}', () => {
      // @ts-expect-error incompatible kind or context
      f.getWeeksInMonth(pmd);
    });
  });
  describe('TS-006: Pattern parsers require a reference at the declaration boundary', () => {
    it('Example 1: {"function":"parse"}', () => {
      // @ts-expect-error reference is mandatory
      f.parse('2026-10-23', 'yyyy-MM-dd');
    });
    it('Example 2: {"function":"tryParse"}', () => {
      // @ts-expect-error reference is mandatory
      f.tryParse('2026-10-23', 'yyyy-MM-dd');
    });
    it('Example 3: {"function":"isMatch"}', () => {
      // @ts-expect-error reference is mandatory
      f.isMatch('2026-10-23', 'yyyy-MM-dd');
    });
  });
  describe('TS-007: Parser result tuples are readonly at the declaration boundary', () => {
    it('Example 1: {"function":"tryParse"}', () => {
      const tuple = f.tryParse('2026-10-23', 'yyyy-MM-dd', pd);
      // @ts-expect-error readonly error slot
      tuple[0] = null;
      // @ts-expect-error readonly result slot
      tuple[1] = null;
    });
    it('Example 2: {"function":"tryParseDuration"}', () => {
      const tuple = f.tryParseDuration('1h');
      // @ts-expect-error readonly error slot
      tuple[0] = null;
      // @ts-expect-error readonly result slot
      tuple[1] = null;
    });
  });
  describe('TS-008: Selection declarations accept readonly collections', () => {
    it('Example 1: {"function":"min"}', () => {
      f.min(readonlyDates);
    });
    it('Example 2: {"function":"max"}', () => {
      f.max(readonlyDates);
    });
    it('Example 3: {"function":"closestTo"}', () => {
      f.closestTo(pd, readonlyDates);
    });
    it('Example 4: {"function":"closestIndexTo"}', () => {
      f.closestIndexTo(pd, readonlyDates);
    });
  });
});
