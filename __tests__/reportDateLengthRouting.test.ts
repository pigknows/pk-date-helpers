import { convertPercentDateFormat } from '../src/dateHelpers';
import type { ReportFormats } from '../src/types';

// Every destination that formats the date produced by the length router.
const destinations: Array<ReportFormats | 'default'> = [
  '%b%d',
  '%b%d%y',
  '%b%d%Y',
  '%d%b',
  '%d%b%y',
  '%d%b%Y',
  '%d-%m-%y',
  '%d/%m/%y',
  '%d-%m-%Y',
  '%d/%m/%Y',
  '%m-%d',
  '%m/%d',
  '%m-%d-%y',
  '%m/%d/%y',
  '%m-%d-%Y',
  '%m/%d/%Y',
  '%j',
  '%J',
  '%N',
  '%n',
  '%t',
  '%T',
  '%y-%m-%d',
  '%Y-%m-%d',
  '%y/%m/%d',
  '%Y/%m/%d',
  'default',
];

// Eight-character strings. Separators make the raw length look like the
// YYYYMMDD shortcut, and the regular shortcut then reads the remaining
// six digits as YYMMDD (01/02/26 → 2001-02-26).
const eightCharacterPunctuated = [
  '01/02/26',
  '01-02-26',
  '01.02.26',
  '01 02 26',
  '01//0226',
  '--010226',
  '010226--',
  '2001-2-6',
  '13/01/26',
  '26/02/01',
];

// Same router, other arms: raw length 3 or 5 selects the thousand shortcut,
// raw length 6 selects the regular shortcut. Punctuation is not a shortcut.
const otherPunctuatedLengths = [
  '1/2',
  '1-2',
  '1.2',
  '12/31',
  '1/2/6',
  '1-2-6',
  '1/2/26',
  '12/3/1',
  '12-1-6',
];

function expectRejected(date: string) {
  for (const destination of destinations) {
    let emitted: string | undefined;
    expect(() => {
      emitted = convertPercentDateFormat(destination, date);
    }).toThrow();
    // A value assigned above would mean the formatter emitted a date
    // before refusing. Rejection must produce no report date.
    expect(emitted).toBeUndefined();
  }
}

describe('report date length routing', () => {
  test.each(eightCharacterPunctuated)(
    'rejects punctuated eight-character date %j instead of a six-digit shortcut',
    (date) => {
      expectRejected(date);
    },
  );

  test.each(otherPunctuatedLengths)(
    'rejects punctuated date %j whose raw length selects a shortcut arm',
    (date) => {
      expectRejected(date);
    },
  );

  test('keeps the six-digit year-month-day rule for a pure six-digit string', () => {
    expect(convertPercentDateFormat('%Y-%m-%d', '010226')).toBe('2001-02-26');
    expect(convertPercentDateFormat('%d%b%Y', '010226')).toBe('26Feb2001');
    expect(convertPercentDateFormat('%m/%d/%Y', '010226')).toBe('02/26/2001');
    expect(convertPercentDateFormat('%b%d%Y', '010226')).toBe('Feb26,2001');
    expect(convertPercentDateFormat('%Y-%m-%d', '170101')).toBe('2017-01-01');
    expect(convertPercentDateFormat('%d%b%Y', '170101')).toBe('01Jan2017');
  });

  test('keeps the eight-digit year-month-day rule for a pure eight-digit string', () => {
    expect(convertPercentDateFormat('%Y-%m-%d', '20170101')).toBe('2017-01-01');
    expect(convertPercentDateFormat('%d%b%Y', '20170101')).toBe('01Jan2017');
    expect(convertPercentDateFormat('%m/%d/%Y', '20170101')).toBe('01/01/2017');
    expect(convertPercentDateFormat('%J', '20170101')).toBe('17-001');
  });

  test('keeps a pure four-digit month-day shortcut', () => {
    const year = new Date().getFullYear();
    expect(convertPercentDateFormat('%Y-%m-%d', '0101')).toBe(`${year}-01-01`);
  });

  test('formats a ten-character regular date without rerouting it', () => {
    expect(convertPercentDateFormat('%Y-%m-%d', '2001-02-26')).toBe('2001-02-26');
    expect(convertPercentDateFormat('%d%b%Y', '2001-02-26')).toBe('26Feb2001');
    expect(convertPercentDateFormat('%m/%d/%Y', '2001-02-26')).toBe('02/26/2001');
    expect(convertPercentDateFormat('%b%d%Y', '2001-02-26')).toBe('Feb26,2001');
    expect(convertPercentDateFormat('%y-%m-%d', '2001-02-26')).toBe('01-02-26');
    expect(convertPercentDateFormat('%J', '2001-02-26')).toBe('01-057');
    expect(convertPercentDateFormat('%T', '2001-02-26')).toBe('10745');
    expect(convertPercentDateFormat('default', '2001-02-26')).toBe('2001-02-26');
    expect(convertPercentDateFormat('%Y-%m-%d', '2017-01-01')).toBe('2017-01-01');
    expect(convertPercentDateFormat('%d%b%Y', '2026-01-02')).toBe('02Jan2026');
  });

  test('still rejects punctuated dates that are not a valid calendar day', () => {
    expect(() => convertPercentDateFormat('%Y-%m-%d', '02/31/26')).toThrow();
    expect(() => convertPercentDateFormat('%d%b%Y', '12/31/26')).toThrow();
    expect(() => convertPercentDateFormat('%Y-%m-%d', '01/02/2026')).toThrow();
    expect(() => convertPercentDateFormat('%m/%d/%Y', '2017/01/01')).toThrow();
  });
});
