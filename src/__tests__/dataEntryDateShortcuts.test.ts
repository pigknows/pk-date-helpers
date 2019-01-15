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
const shortLastYear = lastYear.toString().slice(2);

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
});

// unsupported shortcuts throw errors
