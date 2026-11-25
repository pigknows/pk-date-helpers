import {
  convertDateToFormatType,
  convertDateToRegularString,
  convertPercentDateFormat,
  detectFormatType,
  detectIfValidPKDate,
} from '../src/dateHelpers';

/**
 * Spec for shortcut detection that accepts a string from a form or upload.
 *
 * A recognized format is one detectFormatType returns. Callers that accept any
 * recognized format pass that format and the original text to the cycle
 * converters. These tests fail while a short string of letters, punctuation, or
 * a placeholder is labeled Thousand, Julian, or Newsham.
 */

const PLACEHOLDERS = ['n/a', 'N/A', 'no', 'abc', 'na'];
const PUNCTUATION = ['.', '?', '-', '/'];
const MIXED_SHORT = ['12a', '5a', 'a1', '0a0', 'n.a'];
// Five digits plus letters: the same fallback's other branch (standardized
// digit count is 5, but the string is not all digits).
const MIXED_FIVE_DIGITS = ['ab12345', '12345a', 'x17000'];

const NON_DIGITS = [...PLACEHOLDERS, ...PUNCTUATION, ...MIXED_SHORT, ...MIXED_FIVE_DIGITS, ' '];

function recognizedFormat(input: string, ignoreFormats: string[] = []): string {
  // One-argument call uses the default standard-format preference.
  if (ignoreFormats.length === 0) {
    return detectFormatType(input);
  }
  return detectFormatType(input, true, ignoreFormats);
}

/**
 * What a caller stores after accepting any recognized format.
 * Both public converters run on the original input. An unrecognized format
 * stores nothing. A thrown conversion is not a stored day.
 */
function storedCycleDate(input: string, ignoreFormats: string[] = []): string {
  const format = recognizedFormat(input, ignoreFormats);
  if (!format) {
    return '';
  }

  const viaRegular = convertDateToRegularString(format, input);
  const viaEntry = convertDateToFormatType(format, 'REGULAR', input);
  if (viaRegular !== viaEntry) {
    throw new Error(`converters disagree for ${JSON.stringify(input)} as ${format}: ${viaRegular} vs ${viaEntry}`);
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(viaRegular) || !detectIfValidPKDate(viaRegular)) {
    return '';
  }
  return viaRegular;
}

describe('shortcut detection rejects non-digits', () => {
  test.each(NON_DIGITS)('default preference does not label %j as a cycle format', (input) => {
    expect(recognizedFormat(input)).toBe('');
  });

  test.each(NON_DIGITS)('ignoring Thousand does not label %j as Julian', (input) => {
    expect(recognizedFormat(input, ['THOUSAND'])).toBe('');
  });

  test.each(NON_DIGITS)('ignoring Thousand and Julian does not label %j as Newsham', (input) => {
    expect(recognizedFormat(input, ['THOUSAND', 'JULIAN'])).toBe('');
  });

  test.each([
    { label: 'default', ignoreFormats: [] as string[], expected: 'THOUSAND' },
    { label: 'Thousand ignored', ignoreFormats: ['THOUSAND'], expected: 'JULIAN' },
    { label: 'Thousand and Julian ignored', ignoreFormats: ['THOUSAND', 'JULIAN'], expected: 'NEWSHAM' },
  ])('digit shortcuts stay $expected when $label', ({ ignoreFormats, expected }) => {
    for (const input of ['1', '01', '001', '0', '000']) {
      expect(recognizedFormat(input, ignoreFormats)).toBe(expected);
    }
  });

  test('a five-digit cycle code is still Thousand', () => {
    expect(detectFormatType('17001')).toBe('THOUSAND');
  });

  test('percent-style detection is unchanged for a non-digit short string', () => {
    expect(detectFormatType('abc', false)).toBe('');
    expect(detectFormatType('n/a', false)).toBe('');
  });
});

describe('a recognized format is not stored as a cycle day', () => {
  test.each(NON_DIGITS)('default preference does not store %j', (input) => {
    expect(storedCycleDate(input)).toBe('');
  });

  test.each(NON_DIGITS)('Julian preference does not store %j', (input) => {
    expect(storedCycleDate(input, ['THOUSAND'])).toBe('');
  });

  test.each(NON_DIGITS)('Newsham preference does not store %j', (input) => {
    expect(storedCycleDate(input, ['THOUSAND', 'JULIAN'])).toBe('');
  });

  test('distinct digit shortcuts still store distinct days', () => {
    const dayOne = storedCycleDate('1');
    const dayTwo = storedCycleDate('2');
    expect(dayOne).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(dayTwo).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(detectIfValidPKDate(dayOne)).toBe(true);
    expect(detectIfValidPKDate(dayTwo)).toBe(true);
    expect(dayOne).not.toBe(dayTwo);
  });

  test('a full Thousand code still stores its calendar day', () => {
    expect(storedCycleDate('17001')).toBe('2018-04-14');
  });
});

describe('report shortcut lengths reject non-digits', () => {
  // convertPercentDateFormat classifies raw lengths 1, 2, 3, and 5 as Thousand
  // before it ever calls detectFormatType.
  const reportInputs = [
    ...PLACEHOLDERS,
    ...PUNCTUATION,
    ...MIXED_SHORT,
    'a',
    '??',
    '1700a',
    '1a000',
    '1234a',
    '0000a',
    'n/a/x',
    'hello',
    '17a00',
  ];

  test.each(reportInputs)('convertPercentDateFormat rejects %j', (input) => {
    expect(() => convertPercentDateFormat('%Y-%m-%d', input)).toThrow(/does not match/);
  });

  test('numeric report shortcuts still become calendar days', () => {
    expect(convertPercentDateFormat('%Y-%m-%d', '17001')).toBe('2018-04-14');
    const dayOne = convertPercentDateFormat('%Y-%m-%d', '1');
    const dayTwo = convertPercentDateFormat('%Y-%m-%d', '2');
    expect(dayOne).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(dayTwo).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(dayOne).not.toBe(dayTwo);
  });
});
