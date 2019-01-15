import { convertDateToRegularString, convertPercentDateFormat } from '../dateHelpers';
import {
  american1,
  currentYear,
  european1,
  lastYear,
  julian1,
  newsham1,
  regular1,
  regular2,
  thousand1,
} from './dataEntryDateHelpers.test';

const currentYearShort = currentYear.toString().slice(2);
const lastYearShort = lastYear.toString().slice(2);

describe('Report Format from Regular conversions', () => {
  test('%b%d format', () => {
    expect(convertPercentDateFormat('%b%d', regular1)).toEqual('Dec31');
  });

  test('%b%d%y format', () => {
    expect(convertPercentDateFormat('%b%d%y', regular1)).toEqual(`Dec31,${currentYearShort}`);
  });

  test('%b%d%Y format', () => {
    expect(convertPercentDateFormat('%b%d%Y', regular1)).toEqual(`Dec31,${currentYear}`);
  });

  test('%d%b format', () => {
    expect(convertPercentDateFormat('%d%b', regular1)).toEqual('31Dec');
  });

  test('%d%b%y format', () => {
    expect(convertPercentDateFormat('%d%b%y', regular1)).toEqual(`31Dec${currentYearShort}`);
  });

  test('%d%b%Y format', () => {
    expect(convertPercentDateFormat('%d%b%Y', regular1)).toEqual(`31Dec${currentYear}`);
  });

  test('%d-%m-%y format', () => {
    expect(convertPercentDateFormat('%d-%m-%y', regular1)).toEqual(european1.slice(0, 9));
  });

  test('%d/%m/%y format', () => {
    expect(convertPercentDateFormat('%d/%m/%y', regular1)).toEqual(european1.slice(0, 9).replace(/\-/g, '/'));
  });

  test('%d-%m-%Y format', () => {
    expect(convertPercentDateFormat('%d-%m-%Y', regular1)).toEqual(european1);
  });

  test('%d/%m/%Y format', () => {
    expect(convertPercentDateFormat('%d/%m/%Y', regular1)).toEqual(european1.replace(/\-/g, '/'));
  });

  test('%m-%d format', () => {
    expect(convertPercentDateFormat('%m-%d', regular1)).toEqual('12-31');
  });

  test('%m-%d-%y', () => {
    expect(convertPercentDateFormat('%m-%d-%y', regular1)).toEqual(american1.slice(0, 9));
  });

  test('%m-%d-%Y', () => {
    expect(convertPercentDateFormat('%m-%d-%Y', regular1)).toEqual(american1);
  });

  test('%m/%d format', () => {
    expect(convertPercentDateFormat('%m/%d', regular1)).toEqual('12/31');
  });

  test('%m/%d/%y', () => {
    expect(convertPercentDateFormat('%m/%d/%y', regular1)).toEqual(american1.slice(0, 9).replace(/\-/g, '/'));
  });

  test('%m/%d/%Y', () => {
    expect(convertPercentDateFormat('%m/%d/%Y', regular1)).toEqual(american1.replace(/\-/g, '/'));
  });

  test('%j', () => {
    expect(convertPercentDateFormat('%j', regular1)).toEqual(julian1.slice(2));
  });

  test('%J', () => {
    expect(convertPercentDateFormat('%J', regular1)).toEqual(julian1);
  });

  test('%n', () => {
    expect(convertPercentDateFormat('%n', regular1)).toEqual(newsham1.slice(2));
  });

  test('%N', () => {
    expect(convertPercentDateFormat('%N', regular1)).toEqual(newsham1);
  });

  test('%t', () => {
    expect(convertPercentDateFormat('%t', regular1)).toEqual(thousand1.slice(2));
  });

  test('%T', () => {
    expect(convertPercentDateFormat('%T', regular1)).toEqual(thousand1);
  });

  test('%y-%m-%d', () => {
    expect(convertPercentDateFormat('%y-%m-%d', regular1)).toEqual(regular1.slice(2));
  });

  test('%Y-%m-%d', () => {
    expect(convertPercentDateFormat('%Y-%m-%d', regular1)).toEqual(regular1);
  });

  test('%y/%m/%d', () => {
    expect(convertPercentDateFormat('%y/%m/%d', regular1)).toEqual(regular1.slice(2).replace(/\-/g, '/'));
  });

  test('%Y/%m/%d', () => {
    expect(convertPercentDateFormat('%Y/%m/%d', regular1)).toEqual(regular1.replace(/\-/g, '/'));
  });

  test('%y%mm%d', () => {
    // unsupported format
    expect(convertPercentDateFormat('%y%mm%d', regular1)).toEqual(regular1);
  });
});

describe('Report Format to Regular conversions', () => {
  test('%b%d format', () => {
    expect(convertDateToRegularString('%b%d', 'Dec31')).toEqual(regular1);
  });

  test('%b%d%y format', () => {
    expect(convertDateToRegularString('%b%d%y', `Dec31${currentYearShort}`)).toEqual(regular1);
  });

  test('%b%d%Y format', () => {
    expect(convertDateToRegularString('%b%d%Y', `Dec31${currentYear}`)).toEqual(regular1);
  });

  test('%d%b format', () => {
    expect(convertDateToRegularString('%d%b', '31Dec')).toEqual(regular1);
  });

  test('%d%b%y format', () => {
    expect(convertDateToRegularString('%d%b%y', `31Dec${currentYearShort}`)).toEqual(regular1);
  });

  test('%d%b%Y format', () => {
    expect(convertDateToRegularString('%d%b%Y', `31Dec${currentYear}`)).toEqual(regular1);
  });

  test('%d-%m-%y format', () => {
    expect(convertDateToRegularString('%d-%m-%y', european1.replace(currentYear.toString(), currentYearShort))).toEqual(regular1);
  });

  test('%d/%m/%y format', () => {
    expect(convertDateToRegularString('%d/%m/%y', european1.replace(currentYear.toString(), currentYearShort).replace(/\-/g, '/'))).toEqual(regular1);
  });

  test('%d-%m-%Y format', () => {
    expect(convertDateToRegularString('%d-%m-%Y', european1)).toEqual(regular1);
  });

  test('%d/%m/%Y format', () => {
    expect(convertDateToRegularString('%d/%m/%Y', european1.replace(/\-/g, '/'))).toEqual(regular1);
  });

  test('%m-%d format', () => {
    expect(convertDateToRegularString('%m-%d', '12-31')).toEqual(regular1);
  });

  test('%m-%d-%y', () => {
    expect(convertDateToRegularString('%m-%d-%y', american1.replace(currentYear.toString(), currentYearShort))).toEqual(regular1);
  });

  test('%m-%d-%Y', () => {
    expect(convertDateToRegularString('%m-%d-%Y', american1)).toEqual(regular1);
  });

  test('%m/%d format', () => {
    expect(convertDateToRegularString('%m/%d', '12/31')).toEqual(regular1);
  });

  test('%m/%d/%y', () => {
    expect(convertDateToRegularString('%m/%d/%y', american1.replace(currentYear.toString(), currentYearShort).replace(/\-/g, '/'))).toEqual(regular1);
  });

  test('%m/%d/%Y', () => {
    expect(convertDateToRegularString('%m/%d/%Y', american1.replace(/\-/g, '/'))).toEqual(regular1);
  });

  test('%j', () => {
    // remember shortcuts are subject to previous year fallback
    const compareDate = (new Date()).getTime() > (new Date(regular1).getTime())
      ? regular1
      : regular2;
    expect(convertDateToRegularString('%j', julian1.slice(3))).toEqual(compareDate);
  });

  test('%J', () => {
    expect(convertDateToRegularString('%J', julian1)).toEqual(regular1);
  });

  test('%n', () => {
    // remember shortcuts are subject to previous cycle fallback
    const shortNewsham = newsham1.slice(2);
    const compareDate = convertDateToRegularString('NEWSHAM', (new Date()).getTime() > (new Date(regular1).getTime())
      ? newsham1
      : `11${shortNewsham}`);
    expect(convertDateToRegularString('%n', shortNewsham)).toEqual(compareDate);
  });

  test('%N', () => {
    expect(convertDateToRegularString('%N', newsham1)).toEqual(regular1);
  });

  test('%t', () => {
    // remember shortcuts are subject to previous cycle fallback
    const shortThousand = thousand1.slice(2);
    const compareDate = convertDateToRegularString('THOUSAND', (new Date()).getTime() > (new Date(regular1).getTime())
      ? thousand1
      : `16${shortThousand}`);
    expect(convertDateToRegularString('%t', shortThousand)).toEqual(compareDate);
  });

  test('%T', () => {
    expect(convertDateToRegularString('%T', thousand1)).toEqual(regular1);
  });

  test('%y-%m-%d', () => {
    expect(convertDateToRegularString('%y-%m-%d', regular1.slice(2))).toEqual(regular1);
  });

  test('%Y-%m-%d', () => {
    expect(convertDateToRegularString('%Y-%m-%d', regular1)).toEqual(regular1);
  });

  test('%y/%m/%d', () => {
    expect(convertDateToRegularString('%y/%m/%d', `${currentYearShort}/12/31`)).toEqual(regular1);
  });

  test('%Y/%m/%d', () => {
    expect(convertDateToRegularString('%Y/%m/%d', regular1.replace(/\-/g, '/'))).toEqual(regular1);
  });

  test('%y%mm%d', () => {
    // unsupported format
    /* tslint:disable */
    expect(convertDateToRegularString('%y%mm%d', '80101')).toEqual('80101');
    /* tslint:enable */
  });
});

describe('Report Format from shortcut', () => {
  test('1 digit shortcut (always read as THOUSAND)', () => {
    expect(convertPercentDateFormat('%Y-%m-%d', '1')).toEqual('2018-04-14');
  });

  test('2 digit shortcut (always read as THOUSAND)', () => {
    expect(convertPercentDateFormat('%Y-%m-%d', '10')).toEqual('2018-04-23');
  });

  test('3 digit shortcut (always read as THOUSAND)', () => {
    expect(convertPercentDateFormat('%Y-%m-%d', '100')).toEqual('2018-07-22');
  });

  test('4 digit shortcut (always read as THOUSAND)', () => {
    expect(convertPercentDateFormat('%Y-%m-%d', '0101')).toEqual(`${currentYear}-01-01`);
  });

  test('5 digit shortcut (always read as THOUSAND)', () => {
    expect(convertPercentDateFormat('%Y-%m-%d', '17001')).toEqual('2018-04-14');
  });

  test('6 digit shortcut (always read as THOUSAND)', () => {
    expect(convertPercentDateFormat('%Y-%m-%d', '170101')).toEqual('2017-01-01');
  });

  test('8 digit shortcut (always read as THOUSAND)', () => {
    expect(convertPercentDateFormat('%Y-%m-%d', '20170101')).toEqual('2017-01-01');
  });
});