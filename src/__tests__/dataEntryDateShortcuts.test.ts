import { convertShortcutDate } from '../dateHelpers';
import {
  american1,
  american2,
  currentYear,
  european1,
  european2,
  iso1,
  iso2,
  julian1,
  julian2,
  lastYear,
  newsham1,
  regular1,
  regular2,
  thousand1,
  thousand2,
} from './dataEntryDateHelpers.test';

const shortCurrentYear = currentYear.toString().slice(2);

describe('American Shortcut Date Conversion:', () => {
  const shortcut1 = '1231';
  const shortcut2 = `1231${shortCurrentYear}`;

  test('4 digit string converts properly', () => {
    // future dates should have previous year when using 4-digit shortcut
    expect(convertShortcutDate('american', shortcut1)).toEqual(american2);
  });

  test('6 digit string converts properly', () => {
    expect(convertShortcutDate('american', shortcut2)).toEqual(american1);
  });

  // full length
  test('8 digit shortut returns unchanged', () => {
    expect(convertShortcutDate('american', american1)).toEqual(american1.replace(/\-/g, ''));
  });

  // unsupported shortcuts
  test('1 digit shortcut throws error', () => {
    expect(() => convertShortcutDate('american', '1')).toThrow();
  });

  test('2 digit shortcut throws error', () => {
    expect(() => convertShortcutDate('american', '12')).toThrow();
  });

  test('3 digit shortcut throws error', () => {
    expect(() => convertShortcutDate('american', '123')).toThrow();
  });

  test('5 digit shortcut throws error', () => {
    expect(() => convertShortcutDate('american', '81231')).toThrow();
  });

  // invalid date
  test('invalid date of correct length is converted without error', () => {
    expect(convertShortcutDate('american', '1301')).toEqual(`13-01-${currentYear}`);
  });
});

describe('European Shortcut Date Conversion:', () => {
  const shortcut1 = '3112';
  const shortcut2 = `3112${shortCurrentYear}`;

  test('4 digit string converts properly', () => {
    // future dates should have previous year when using 4-digit shortcut
    expect(convertShortcutDate('european', shortcut1)).toEqual(european2);
  });

  test('6 digit string converts properly', () => {
    expect(convertShortcutDate('EUROPEAN', shortcut2)).toEqual(european1);
  });

  // full length
  test('8 digit shortut returns unchanged', () => {
    expect(convertShortcutDate('european', european1)).toEqual(european1.replace(/\-/g, ''));
  });

  // unsupported shortcuts
  test('1 digit shortcut throws error', () => {
    expect(() => convertShortcutDate('european', '1')).toThrow();
  });

  test('2 digit shortcut throws error', () => {
    expect(() => convertShortcutDate('european', '12')).toThrow();
  });

  test('3 digit shortcut throws error', () => {
    expect(() => convertShortcutDate('european', '123')).toThrow();
  });

  test('5 digit shortcut throws error', () => {
    expect(() => convertShortcutDate('european', '81231')).toThrow();
  });

  // invalid date
  test('invalid date of correct length is converted without error', () => {
    expect(convertShortcutDate('european', '0131')).toEqual(`01-31-${currentYear}`);
  });
});

describe('ISO Shortcut Date Conversion:', () => {
  const shortcut1 = '1231';
  const shortcut2 = `${shortCurrentYear}1231`;

  test('4 digit string converts properly', () => {
    // future dates should have previous year when using 4-digit shortcut
    expect(convertShortcutDate('iso', shortcut1)).toEqual(iso2);
  });

  test('6 digit string converts properly', () => {
    expect(convertShortcutDate('iso', shortcut2)).toEqual(iso1);
  });
});

describe('Julian Shortcut Date Conversion:', () => {
  const shortcut1 = '1';
  const shortcut2 = '12';

  const shortcut3 = '365';
  const shortcut4 = '1231';
  const shortcut5 = `${shortCurrentYear}1231`;

  test('single digit converts properly', () => {
    expect(convertShortcutDate('julian', shortcut1)).toEqual(`${shortCurrentYear}-001`);
  });

  test('2 digit converts properly', () => {
    expect(convertShortcutDate('julian', shortcut2)).toEqual(`${shortCurrentYear}-012`);
  });

  test('3 digit converts properly', () => {
    // future dates should have previous year when using 3-digit shortcut
    expect(convertShortcutDate('julian', shortcut3)).toEqual(julian2);
  });

  test('4 digit converts properly', () => {
    // future dates should have previous year when using 4-digit shortcut
    expect(convertShortcutDate('julian', shortcut4)).toEqual(julian2);
  });

  test('6 digit converts properly', () => {
    expect(convertShortcutDate('julian', shortcut5)).toEqual(julian1);
  });

  test('8 digit is treated as regular and converts properly', () => {
    expect(convertShortcutDate('julian', regular1)).toEqual(julian1);
  });

  // full length
  test('5 digit shortut returns unchanged', () => {
    expect(convertShortcutDate('julian', julian1)).toEqual(julian1);
  });

  // unsupported shortcuts
  test('7 digit string throws error', () => {
    expect(() => convertShortcutDate('julian', '1234567')).toThrow();
  });
});

describe('Newsham Shortcut Date Conversion', () => {
  const shortcut1 = newsham1.toString().slice(1);
  const shortcut2 = `${shortCurrentYear}1231`;

  test('4 digit shortcut converts properly', () => {
    expect(convertShortcutDate('newsham', shortcut1)).toEqual(newsham1);
  });

  test('6 digit regular format used as shortcut converts properly', () => {
    expect(convertShortcutDate('newsham', shortcut2)).toEqual(newsham1);
  });

  test('1 digit shortcut is padded', () => {
    expect(convertShortcutDate('newsham', '1')).toEqual('12001');
  });

  test('2 digit shortcut is padded', () => {
    expect(convertShortcutDate('newsham', '11')).toEqual('12011');
  });

  test('3 digit shortcut is padded', () => {
    expect(convertShortcutDate('newsham', '101')).toEqual('12101');
  });

  // full length
  test('5 digit string remains unchanged', () => {
    expect(convertShortcutDate('newsham', newsham1)).toEqual(newsham1);
  });

  // unsupported shortcuts
  test('7 digit string throws error', () => {
    expect(() => convertShortcutDate('newsham', '1234567')).toThrow();
  });

  test('8 digit string throws error', () => {
    expect(() => convertShortcutDate('newsham', '12345678')).toThrow();
  });
});

describe('Regular Shortcut Date Conversion:', () => {
  const shortcut1 = '1231';
  const shortcut2 = `${shortCurrentYear}1231`;

  test('4 digit string converts properly', () => {
    // future dates should have previous year when using 4-digit shortcut
    expect(convertShortcutDate('REGULAR', shortcut1)).toEqual(regular2);
  });

  test('6 digit string converts properly', () => {
    expect(convertShortcutDate('regular', shortcut2)).toEqual(regular1);
  });

  // full length
  test('8 digit string returns unchanged', () => {
    expect(convertShortcutDate('regular', `20${shortcut2}`)).toEqual(regular1.replace(/\-/g, ''));
  });

  // unsupported shortcuts
  test('1 digit string throws error', () => {
    expect(() => convertShortcutDate('regular', '1')).toThrow();
  });

  test('2 digit string throws error', () => {
    expect(() => convertShortcutDate('regular', '12')).toThrow();
  });

  test('3 digit string throws error', () => {
    expect(() => convertShortcutDate('regular', '123')).toThrow();
  });

  test('5 digit string throws error', () => {
    expect(() => convertShortcutDate('regular', '12015')).toThrow();
  });

  test('7 digit string throws error', () => {
    expect(() => convertShortcutDate('regular', '1201224')).toThrow();
  });

  // invalid date
  test('invalid date of correct length is converted without error', () => {
    expect(convertShortcutDate('regular', '1301')).toEqual(`${currentYear}-13-01`);
  });
});

describe('Thousand Shortcut Date Conversion', () => {
  const shortcut1 = '1';
  const shortcut2 = '12';

  const shortcut3 = thousand2.toString().slice(2);
  const shortcut4 = '1231';
  const shortcut5 = `${shortCurrentYear}1231`;

  test('single digit shortcut converts properly', () => {
    expect(convertShortcutDate('thousand', shortcut1)).toEqual(`17001`);
  });

  test('2 digit shortcut converts properly', () => {
    expect(convertShortcutDate('thousand', shortcut2)).toEqual('17012');
  });

  test('3 digit shortcut converts properly', () => {
    // future dates should have previous year when using 3-digit shortcut
    expect(convertShortcutDate('thousand', shortcut3)).toEqual(thousand2);
  });

  test('4 digit regular/American shortcut converts properly', () => {
    // future dates should have previous year when using 4-digit shortcut
    expect(convertShortcutDate('thousand', shortcut4)).toEqual(thousand2);
  });

  test('6 digit regular/American shortcut converts properly', () => {
    expect(convertShortcutDate('thousand', shortcut5)).toEqual(thousand1);
  });

  // full length
  test('5 digit string returns unchanged', () => {
    expect(convertShortcutDate('thousand', thousand2)).toEqual(thousand2);
  });

  // unsupported shortcuts throw errors
  test('7 digit shortcut throws error', () => {
    expect(() => convertShortcutDate('thousand', '1712345')).toThrow();
  });

  test('8 digit shortcut throws error', () => {
    expect(() => convertShortcutDate('thousand', '17123456')).toThrow();
  });
});
