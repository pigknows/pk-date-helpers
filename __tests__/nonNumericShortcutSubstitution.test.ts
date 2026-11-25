import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  convertDateToFormatType,
  convertDateToRegularString,
  convertPercentDateFormat,
  convertShortcutDate,
  detectIfValidPKDate,
} from '../src/dateHelpers';
import type { ReportFormats } from '../src/types';

// Placeholders and other non-dates must not become a calendar day.
// A numeric Thousand/Newsham shortcut (including day 0) still converts.
// Separators may wrap digits ("1-2"). Letters may not ("n/a", "a1").

const REPORT_FORMATS: Array<ReportFormats | 'default'> = [
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

// Raw lengths 1, 2, 3, and 5 are the report formatter's Thousand branches.
// None of these is 1, 2, 3, or 5 digits after separators are removed.
const NON_DATES = [
  'n/a',
  'N/A',
  'a',
  'x',
  '.',
  '..',
  '...',
  '.....',
  '??',
  '***',
  'ab',
  'na',
  'a/b',
  'n.a',
  'n/a/x',
  ' ',
  '  ',
  '   ',
  '     ',
  '\t',
  '\n',
  '///',
  'a1',
  '1a',
  '12a',
  'x00',
  'a/1',
  '1/a',
  '--a',
  '0a000',
  '0000a',
];

const SHORTCUT_FORMATS = ['THOUSAND', 'NEWSHAM', 'thousand', 'newsham'] as const;

function assertNotASuccessfulDate(produce: () => unknown, label: string) {
  let result: unknown;
  try {
    result = produce();
  } catch (err) {
    assert.ok(err instanceof Error, label);
    return;
  }

  const text = String(result);
  const accepted = /^\d{4}[/-]\d{2}[/-]\d{2}$/.test(text)
    || /^\d{2}[/-]\d{2}[/-]\d{2,4}$/.test(text)
    || /^\d{2}[/-]\d{2}$/.test(text)
    || /^\d{5}$/.test(text)
    || /^\d{3}$/.test(text)
    || /^\d{2}-\d{3}$/.test(text)
    || /^[A-Za-z]{3}\d{2}/.test(text)
    || /^\d{2}[A-Za-z]{3}/.test(text);
  assert.equal(
    accepted,
    false,
    `${label} was accepted as ${text}`,
  );
}

test('report formats reject placeholders and other non-dates', () => {
  for (const format of REPORT_FORMATS) {
    for (const input of NON_DATES) {
      assertNotASuccessfulDate(
        () => convertPercentDateFormat(format, input),
        `convertPercentDateFormat(${format}, ${JSON.stringify(input)})`,
      );
    }
  }
});

test('Thousand and Newsham shortcuts reject an empty or non-digit day', () => {
  for (const format of SHORTCUT_FORMATS) {
    for (const input of ['n/a', 'N/A', 'a', '.', '...', '.....', '??', '', ' ', 'ab', 'a1', '12a', 'x00', '///']) {
      assertNotASuccessfulDate(
        () => convertShortcutDate(format, input),
        `convertShortcutDate(${format}, ${JSON.stringify(input)})`,
      );
    }
  }
});

test('regular-string converters reject the same non-dates for both cycles', () => {
  const formats = ['THOUSAND', 'NEWSHAM', 'Thousand', 'Newsham', '%t', '%n', '%T', '%N'] as const;
  for (const format of formats) {
    for (const input of ['n/a', 'a', '...', '.....', 'a1', 'x00', ' ']) {
      assertNotASuccessfulDate(
        () => convertDateToRegularString(format, input),
        `convertDateToRegularString(${format}, ${JSON.stringify(input)})`,
      );
    }
  }
});

test('three-digit percent shortcuts reject a word with no digits', () => {
  // %t and %n always expand through the cycle shortcut. A five-letter word
  // takes a different branch of THOUSAND and NEWSHAM and already throws there.
  for (const format of ['%t', '%n'] as const) {
    assertNotASuccessfulDate(
      () => convertDateToRegularString(format, 'abcde'),
      `convertDateToRegularString(${format}, abcde)`,
    );
  }
});

test('format conversion rejects non-dates before they become a PigKnows date', () => {
  const destinations = ['REGULAR', 'AMERICAN', 'EUROPEAN'] as const;
  for (const source of ['THOUSAND', 'NEWSHAM'] as const) {
    for (const destination of destinations) {
      for (const input of ['n/a', 'a', '...', '.....', 'a1', '0a000', '0000a']) {
        assertNotASuccessfulDate(
          () => convertDateToFormatType(source, destination, input),
          `convertDateToFormatType(${source}, ${destination}, ${JSON.stringify(input)})`,
        );
      }
    }
  }
});

test('a substituted cycle code would have passed the PigKnows date check', () => {
  // Documents the outcome the rejections above close: day 000 of the current
  // Thousand cycle is a real calendar day. This stays true for an explicit code.
  const fromCode = convertDateToFormatType('THOUSAND', 'REGULAR', '20000');
  assert.equal(fromCode, '2026-06-30');
  assert.equal(detectIfValidPKDate(fromCode), true);
  const newsham = convertDateToFormatType('NEWSHAM', 'REGULAR', '15000');
  assert.equal(newsham, '2026-06-30');
  assert.equal(detectIfValidPKDate(newsham), true);
});

test('digits the user actually entered still convert', () => {
  for (const input of ['0', '1', '10', '100', '000', '001', '20000']) {
    const result = convertPercentDateFormat('%Y-%m-%d', input);
    assert.match(result, /^\d{4}-\d{2}-\d{2}$/);
    assert.equal(detectIfValidPKDate(result), true, input);
  }
  assert.equal(convertPercentDateFormat('%Y-%m-%d', '20000'), '2026-06-30');
  assert.equal(convertPercentDateFormat('%Y-%m-%d', '0'), convertPercentDateFormat('%Y-%m-%d', '000'));

  for (const format of ['THOUSAND', 'NEWSHAM'] as const) {
    for (const input of ['0', '1', '12', '000', '1-2', '1/2', '....1']) {
      const code = convertShortcutDate(format, input);
      assert.match(code, /^\d{5}$/, `${format} ${input}`);
      const regular = convertDateToFormatType(format, 'REGULAR', code);
      assert.match(regular, /^\d{4}-\d{2}-\d{2}$/);
      assert.equal(detectIfValidPKDate(regular), true);
    }
  }

  // Separators are not part of the day. What remains must be the digits the user entered.
  for (const input of ['1-2', '1/2/3', '....1', '1....']) {
    const separated = convertPercentDateFormat('%Y-%m-%d', input);
    assert.match(separated, /^\d{4}-\d{2}-\d{2}$/, input);
    assert.equal(detectIfValidPKDate(separated), true, input);
  }
  assert.equal(
    convertPercentDateFormat('%Y-%m-%d', '....1'),
    convertPercentDateFormat('%Y-%m-%d', '1'),
  );

  const monthDay = convertPercentDateFormat('%Y-%m-%d', '12/31');
  assert.match(monthDay, /^\d{4}-\d{2}-\d{2}$/);
  assert.equal(detectIfValidPKDate(monthDay), true);
});

test('five-character cycle codes that are not all digits are not calendar days', () => {
  for (const format of ['THOUSAND', 'NEWSHAM', '%T', '%N'] as const) {
    for (const input of ['0a000', '0000a', '00a00', 'a0000']) {
      assertNotASuccessfulDate(
        () => convertDateToRegularString(format, input),
        `convertDateToRegularString(${format}, ${JSON.stringify(input)})`,
      );
    }
  }
});
