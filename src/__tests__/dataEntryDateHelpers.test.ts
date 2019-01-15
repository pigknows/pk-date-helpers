import { convertDateToFormatType } from '../dateHelpers';

// most of these map to December 31, 2018
const currentYear = new Date().getFullYear();
const lastYear = currentYear - 1;
const american1 = `12-31-${currentYear}`;
const american2 = `12-31-${lastYear}`; // future dates when using shortcut will be converted to previous year
const american3 = `11-28-${lastYear}`; 
const european1 = `31-12-${currentYear}`;
const european2 = `31-12-${lastYear}`; // future dates when using shortcut will be converted to previous year
const european3 = `28-11-${lastYear}`; 
const iso1 = `${currentYear}-12-31`;
const iso2 = `${lastYear}-12-31`; // future dates when using shortcut will be converted to previous year
const julian1 = `${currentYear.toString().slice(2)}-365`;
const julian2 = `${lastYear.toString().slice(2)}-365`; // future dates when using shortcut will be converted to previous year
const newsham1 = '12627';
const regular1 = `${currentYear}-12-31`;
const regular2 = `${lastYear}-12-31`; // future dates when using shortcut will be converted to previous year
const thousand1 = '17627';
const thousand2 = '17262';

export {
  currentYear,
  lastYear,
  american1,
  american2,
  american3,
  european1,
  european2,
  european3,
  iso1,
  iso2,
  julian1,
  julian2,
  newsham1,
  regular1,
  regular2,
  thousand1,
  thousand2,
};

describe('American Format Direct Conversion:', () => {
  test('converts REGULAR date input into expected format', () => {
    const input1ToAmerican = convertDateToFormatType('REGULAR', 'AMERICAN', regular1);
    expect(input1ToAmerican).toEqual(american1);
  });

  test('converts JULIAN date input into expected format', () => {
    const input1ToAmerican = convertDateToFormatType('JULIAN', 'AMERICAN', julian1);
    expect(input1ToAmerican).toEqual(american1);
  });

  test('converts AMERICAN date input into expected EUROPEAN format', () => {
    const input1ToEuropean = convertDateToFormatType('EUROPEAN', 'REGULAR', american3);
    expect(input1ToEuropean).toEqual('INVALID DATE');
  });
  
  test('converts EUROPEAN date input into expected AMERICAN format', () => {
    const input1ToEuropean = convertDateToFormatType('AMERICAN', 'REGULAR', european3);
    expect(input1ToEuropean).toEqual('INVALID DATE');
  });

  test('converts THOUSAND date input into expected format', () => {
    const input1ToAmerican = convertDateToFormatType('THOUSAND', 'AMERICAN', thousand1);
    expect(input1ToAmerican).toEqual(american1);
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
