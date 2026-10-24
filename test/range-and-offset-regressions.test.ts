import { describe, it, expect } from 'vite-plus/test';
import { api, T, instant, parseFailure, parseSuccess, sequence, ym } from './behavior/support.js';

describe('Offset and month range regressions', () => {
  for (const token of ['XX', 'XXX']) {
    const formatOffset = (offset: string) => (token === 'XX' ? offset.replace(':', '') : offset);
    const pattern = `yyyy-MM-dd HH:mm ${token}`;
    for (const offset of ['+01:60', '-00:60', '+24:00', '-24:00']) {
      it(`PAR-023 regression: ${token} rejects ${offset}`, () => {
        parseFailure(`2026-10-23 12:00 ${formatOffset(offset)}`, pattern, instant(), {
          timeZone: 'UTC',
        });
      });
    }
    for (const offset of ['Z', '+23:59', '-23:59', '+00:59', '-00:59']) {
      it(`PAR-023 regression: ${token} accepts ${offset}`, () => {
        parseSuccess(
          `2026-10-23 12:00 ${formatOffset(offset)}`,
          pattern,
          instant(),
          instant(`2026-10-23T12:00${offset}`),
          { timeZone: 'UTC' },
        );
      });
    }
  }

  const intervals: [string, string, string, number, string[]][] = [
    [
      'lower bound, step 1',
      '-271821-04',
      '-271821-07',
      1,
      ['-271821-04', '-271821-05', '-271821-06', '-271821-07'],
    ],
    ['lower bound, step 2', '-271821-04', '-271821-07', 2, ['-271821-04', '-271821-06']],
    ['lower bound, reached endpoint', '-271821-04', '-271821-07', 3, ['-271821-04', '-271821-07']],
    ['lower bound, unreached endpoint', '-271821-04', '-271821-06', 3, ['-271821-04']],
    [
      'lower bound, largest safe step',
      '-271821-04',
      '-271821-05',
      Number.MAX_SAFE_INTEGER,
      ['-271821-04'],
    ],
    ['upper bound', '+275760-08', '+275760-09', 1, ['+275760-08', '+275760-09']],
    ['upper bound, overshooting step', '+275760-08', '+275760-09', 2, ['+275760-08']],
    ['equal minimum months', '-271821-04', '-271821-04', 1, ['-271821-04']],
    ['equal maximum months', '+275760-09', '+275760-09', 1, ['+275760-09']],
    [
      'year zero rollover',
      '-000001-11',
      '0000-02',
      1,
      ['-000001-11', '-000001-12', '0000-01', '0000-02'],
    ],
    ['steps longer than a year', '-000001-11', '0002-03', 14, ['-000001-11', '0001-01', '0002-03']],
  ];
  for (const [description, start, end, step, expected] of intervals) {
    it(`SEQ-027 regression: ${description}`, () => {
      sequence(
        api.eachMonthOfInterval({ start: ym(start), end: ym(end) }, { step }),
        'PlainYearMonth',
        expected,
      );
    });
  }
  it('SEQ-027 regression: hidden reference days do not affect month stepping', () => {
    const start = new T.PlainYearMonth(-271821, 4, 'iso8601', 30);
    const end = new T.PlainYearMonth(-271821, 6, 'iso8601', 30);
    const result = api.eachMonthOfInterval({ start, end });
    sequence(result, 'PlainYearMonth', ['-271821-04', '-271821-05', '-271821-06']);
    for (const month of result) expect(month.calendarId).toBe('iso8601');
  });
});
