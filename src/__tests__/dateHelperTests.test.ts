import { convertDateToFormatType, convertPercentDateFormat, convertShortcutDate, convertDateToRegularString } from '../dateHelpers';

// all of these map to November 1, 2017
const american1 = '11-01-2018';
const american2 = '11-01-2017'; // future dates when using shortcut will be converted to previous year
const european1 = '01-11-2018';
const european2 = '01-11-2017'; // future dates when using shortcut will be converted to previous year
const iso1 = '2018-11-01';
const iso2 = '2017-11-01'; // future dates when using shortcut will be converted to previous year
const julian1 = '18-305';
const julian2 = '17-305'; // future dates when using shortcut will be converted to previous year
const newsham1 = '12202';
const regular1 = '2018-11-01';
const regular2 = '2017-11-01'; // future dates when using shortcut will be converted to previous year
const thousand1 = '17202';
const thousand2 = '16837'; // future dates when using shortcut will be converted to previous year

describe('American Format Direct Conversion:', () => {
  test('converts REGULAR date input into expected format', () => {
    const input1ToAmerican = convertDateToFormatType('REGULAR', 'AMERICAN', regular1);
    expect(input1ToAmerican).toEqual(american1);
  });

  test('converts JULIAN date input into expected format', () => {
    const input1ToAmerican = convertDateToFormatType('JULIAN', 'AMERICAN', julian1);
    expect(input1ToAmerican).toEqual(american1);
  });

  test('converts THOUSAND date input into expected format', () => {
    const input1ToAmerican = convertDateToFormatType('THOUSAND', 'AMERICAN', thousand1);
    expect(input1ToAmerican).toEqual(american1);
  });
});

describe('American Shortcut Date Conversion:', () => {
  const shortcut1 = '1101';
  const shortcut2 = '110118';

  test('4 digit string converts properly', () => {
    // future dates should have previous year when using 4-digit shortcut
    expect(convertShortcutDate('american', shortcut1)).toEqual(american2);
  });

  test('6 digit string converts properly', () => {
    expect(convertShortcutDate('american', shortcut2)).toEqual(american1);
  });
});

describe('European Format Direct Conversion', () => {
  test('converts REGULAR date input into expected format', () => {
    const input1ToEuropean = convertDateToFormatType('REGULAR', 'EUROPEAN', regular1);
    expect(input1ToEuropean).toEqual(european1);
  });

  test('converts JULIAN date input into expected format', () => {
    const input1ToEuropean = convertDateToFormatType('JULIAN', 'EUROPEAN', julian1);
    expect(input1ToEuropean).toEqual(european1);
  });

  test('converts THOUSAND date input into expected format', () => {
    const input1ToEuropean = convertDateToFormatType('THOUSAND', 'European', thousand1);
    expect(input1ToEuropean).toEqual(european1);
  });
});

describe('European Shortcut Date Conversion:', () => {
  const shortcut1 = '0111';
  const shortcut2 = '011118';

  test('4 digit string converts properly', () => {
    // future dates should have previous year when using 4-digit shortcut
    expect(convertShortcutDate('european', shortcut1)).toEqual(european2);
  });

  test('6 digit string converts properly', () => {
    expect(convertShortcutDate('EUROPEAN', shortcut2)).toEqual(european1);
  });
});

describe('ISO Format Direct Conversion', () => {
  test('converts REGULAR date input into expected format', () => {
    const input1ToIso = convertDateToFormatType('REGULAR', 'iso', regular1);
    expect(input1ToIso).toEqual(iso1);
  });

  test('converts JULIAN date input into expected format', () => {
    const input1ToIso = convertDateToFormatType('JULIAN', 'iso', julian1);
    expect(input1ToIso).toEqual(iso1);
  });

  test('converts THOUSAND date input into expected format', () => {
    const input1ToIso = convertDateToFormatType('THOUSAND', 'ISO', thousand1);
    expect(input1ToIso).toEqual(iso1);
  });
});

describe('ISO Shortcut Date Conversion:', () => {
  const shortcut1 = '1101';
  const shortcut2 = '181101';

  test('4 digit string converts properly', () => {
    // future dates should have previous year when using 4-digit shortcut
    expect(convertShortcutDate('iso', shortcut1)).toEqual(iso2);
  });

  test('6 digit string converts properly', () => {
    expect(convertShortcutDate('iso', shortcut2)).toEqual(iso1);
  });
});

describe('Julian Format Direct Conversion', () => {
  test('converts REGULAR date input into expected format', () => {
    const input1ToJulian = convertDateToFormatType('REGULAR', 'JULIAN', regular1);
    expect(input1ToJulian).toEqual(julian1);
  });

  test('converts NEWSHAM date input into expected format', () => {
    const input1ToJulian = convertDateToFormatType('NEWSHAM', 'julian', newsham1);
    expect(input1ToJulian).toEqual(julian1);
  });

  test('converts THOUSAND date input into expected format', () => {
    const input1ToJulian = convertDateToFormatType('THOUSAND', 'Julian', thousand1);
    expect(input1ToJulian).toEqual(julian1);
  });
});

describe('Julian Shortcut Date Conversion:', () => {
  const shortcut1 = '1';
  const shortcut2 = '11';

  const shortcut3 = '305';
  const shortcut4 = '1101';
  const shortcut5 = '181101';

  test('single digit converts properly', () => {
    expect(convertShortcutDate('julian', shortcut1)).toEqual('18-001');
  });

  test('2 digit converts properly', () => {
    expect(convertShortcutDate('julian', shortcut2)).toEqual('18-011');
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

describe('Newsham Format Direct Conversion', () => {
  test('converts REGULAR date input into expected format', () => {
    const input1ToNewsham = convertDateToFormatType('REGULAR', 'NEWSHAM', regular1);
    expect(input1ToNewsham).toEqual(newsham1);
  });

  test('converts JULIAN date input into expected format', () => {
    const input1ToNewsham = convertDateToFormatType('JULIAN', 'NEWSHAM', julian1);
    expect(input1ToNewsham).toEqual(newsham1);
  });

  test('converts THOUSAND date input into expected format', () => {
    const input1ToNewsham = convertDateToFormatType('THOUSAND', 'newsham', thousand1);
    expect(input1ToNewsham).toEqual(newsham1);
  });
});

describe('Newsham Shortcut Date Conversion', () => {
  const shortcut1 = '2202';
  const shortcut2 = '181101';

  test('4 digit shortcut converts properly', () => {
    expect(convertShortcutDate('newsham', shortcut1)).toEqual(newsham1);
  });

  test('6 digit regular format used as shortcut converts properly', () => {
    expect(convertShortcutDate('newsham', shortcut2)).toEqual(newsham1);
  });
})

describe('Regular Format Direct Conversion', () => {
  test('converts REGULAR date input into expected format', () => {
    const input1ToRegular = convertDateToFormatType('REGULAR', 'regular', regular1);
    expect(input1ToRegular).toEqual(regular1);
  });

  test('converts JULIAN date input into expected format', () => {
    const input1ToRegular = convertDateToFormatType('JULIAN', 'Regular', julian1);
    expect(input1ToRegular).toEqual(regular1);
  });

  test('converts THOUSAND date input into expected format', () => {
    const input1ToRegular = convertDateToFormatType('THOUSAND', 'regular', thousand1);
    expect(input1ToRegular).toEqual(regular1);
  });
});

describe('Regular Shortcut Date Conversion:', () => {
  const shortcut1 = '1101';
  const shortcut2 = '181101';

  test('4 digit string converts properly', () => {
    // future dates should have previous year when using 4-digit shortcut
    expect(convertShortcutDate('REGULAR', shortcut1)).toEqual(regular2);
  });

  test('6 digit string converts properly', () => {
    expect(convertShortcutDate('regular', shortcut2)).toEqual(regular1);
  });
});

describe('Thousand Format Direct Conversion', () => {
  test('converts REGULAR date input into expected format', () => {
    const input1ToThousand = convertDateToFormatType('REGULAR', 'THOUSAND', regular1);
    expect(input1ToThousand).toEqual(thousand1);
  });

  test('converts JULIAN date input into expected format', () => {
    const input1ToThousand = convertDateToFormatType('JULIAN', 'Thousand', julian1);
    expect(input1ToThousand).toEqual(thousand1);
  });

  test('converts NEWSHAM date input into expected format', () => {
    const input1ToThousand = convertDateToFormatType('NEWSHAM', 'THOUSAND', newsham1);
    expect(input1ToThousand).toEqual(thousand1);
  })
});

describe('Thousand Shortcut Date Conversion', () => {
  const shortcut1 = '1';
  const shortcut2 = '11';

  const shortcut3 = '837';
  const shortcut4 = '1101';
  const shortcut5 = '181101';

  test('single digit shortcut converts properly', () => {
    expect(convertShortcutDate('thousand', shortcut1)).toEqual('17001');
  });

  test('2 digit shortcut converts properly', () => {
    expect(convertShortcutDate('thousand', shortcut2)).toEqual('17011');
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

describe('Report Format from Regular conversions', () => {
  test('%b%d format', () => {
    expect(convertPercentDateFormat('%b%d', regular1)).toEqual('Nov01');
  });

  test('%b%d%y format', () => {
    expect(convertPercentDateFormat('%b%d%y', regular1)).toEqual('Nov01,18');
  });

  test('%b%d%Y format', () => {
    expect(convertPercentDateFormat('%b%d%Y', regular1)).toEqual('Nov01,2018');
  });

  test('%d%b format', () => {
    expect(convertPercentDateFormat('%d%b', regular1)).toEqual('01Nov');
  });

  test('%d%b%y format', () => {
    expect(convertPercentDateFormat('%d%b%y', regular1)).toEqual('01Nov18');
  });

  test('%d%b%Y format', () => {
    expect(convertPercentDateFormat('%d%b%Y', regular1)).toEqual('01Nov2018');
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
    expect(convertPercentDateFormat('%m-%d', regular1)).toEqual('11-01');
  });

  test('%m-%d-%y', () => {
    expect(convertPercentDateFormat('%m-%d-%y', regular1)).toEqual(american1.slice(0, 9));
  });

  test('%m-%d-%Y', () => {
    expect(convertPercentDateFormat('%m-%d-%Y', regular1)).toEqual(american1);
  });

  test('%m/%d format', () => {
    expect(convertPercentDateFormat('%m/%d', regular1)).toEqual('11/01');
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
    expect(convertDateToRegularString('%b%d', 'Nov01')).toEqual(regular1);
  });

  test('%b%d%y format', () => {
    expect(convertDateToRegularString('%b%d%y', 'Nov0118')).toEqual(regular1);
  });

  test('%b%d%Y format', () => {
    expect(convertDateToRegularString('%b%d%Y', 'Nov012018')).toEqual(regular1);
  });

  test('%d%b format', () => {
    expect(convertDateToRegularString('%d%b', '01Nov')).toEqual(regular1);
  });

  test('%d%b%y format', () => {
    expect(convertDateToRegularString('%d%b%y', '01Nov18')).toEqual(regular1);
  });

  test('%d%b%Y format', () => {
    expect(convertDateToRegularString('%d%b%Y', '01Nov2018')).toEqual(regular1);
  });

  test('%d-%m-%y format', () => {
    expect(convertDateToRegularString('%d-%m-%y', european1.replace('2018', '18'))).toEqual(regular1);
  });

  test('%d/%m/%y format', () => {
    expect(convertDateToRegularString('%d/%m/%y', european1.replace('2018', '18').replace(/\-/g, '/'))).toEqual(regular1);
  });

  test('%d-%m-%Y format', () => {
    expect(convertDateToRegularString('%d-%m-%Y', european1)).toEqual(regular1);
  });

  test('%d/%m/%Y format', () => {
    expect(convertDateToRegularString('%d/%m/%Y', european1.replace(/\-/g, '/'))).toEqual(regular1);
  });

  test('%m-%d format', () => {
    expect(convertDateToRegularString('%m-%d', '11-01')).toEqual(regular1);
  });

  test('%m-%d-%y', () => {
    expect(convertDateToRegularString('%m-%d-%y', american1.replace('2018', '18'))).toEqual(regular1);
  });

  test('%m-%d-%Y', () => {
    expect(convertDateToRegularString('%m-%d-%Y', american1)).toEqual(regular1);
  });

  test('%m/%d format', () => {
    expect(convertDateToRegularString('%m/%d', '11/01')).toEqual(regular1);
  });

  test('%m/%d/%y', () => {
    expect(convertDateToRegularString('%m/%d/%y', american1.replace('2018', '18').replace(/\-/g, '/'))).toEqual(regular1);
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
    expect(convertDateToRegularString('%y/%m/%d', '18/11/01')).toEqual(regular1);
  });

  test('%Y/%m/%d', () => {
    expect(convertDateToRegularString('%Y/%m/%d', regular1.replace(/\-/g, '/'))).toEqual(regular1);
  });

  test('%y%mm%d', () => {
    // unsupported format
    expect(convertDateToRegularString('%y%mm%d', '80101')).toEqual('80101');
  });
});
