/**
 * Spec for the loose year-month-day gate in American, European, ISO, and Regular conversion.
 *
 * These tests fail while the vulnerability is present. A 10-character string with a hyphen
 * in the fifth position is treated as a calendar date, and parseInt on the fixed slices
 * stops at a hyphen or a letter, so the converter returns a different real date.
 *
 * After the fix, every non-canonical input below is rejected:
 * - convertDateToFormatType returns the string INVALID DATE
 * - convertDateToRegularString returns INVALID DATE or Invalid DateTime
 *   (neither is a yyyy-MM-dd a caller can store)
 *
 * A fix that only re-checks the hyphen and then still parseInt's the same slices, or that
 * falls through to the digit parser and emits another real calendar date, still fails.
 *
 * Run from the repository root:
 *   yarn install --frozen-lockfile
 *   yarn build
 *   node --test __tests__/looseHyphenDateSubstitution.test.mjs
 */
import assert from 'node:assert/strict';
import { describe, test } from 'node:test';
import { convertDateToFormatType, convertDateToRegularString } from '../dist/dateHelpers.js';

const AMERICAN_FORMATS = ['AMERICAN', 'American', 'american'];
const EUROPEAN_FORMATS = ['EUROPEAN', 'European', 'european'];
const ISO_FORMATS = ['ISO', 'iso', 'REGULAR', 'Regular', 'regular'];
const ENTRY_FORMATS = [...AMERICAN_FORMATS, ...EUROPEAN_FORMATS];
const DESTINATIONS = ['REGULAR', 'ISO', 'AMERICAN', 'EUROPEAN', 'regular', 'american'];

// Values a caller would persist as a business date.
const STORED_DATE = /^(?:\d{4}-\d{2}-\d{2}|\d{2}-\d{2}-\d{4})$/;
const REGULAR_REJECTION = new Set(['INVALID DATE', 'Invalid DateTime']);

function assertRegularRejected(format, input, daysAheadAllowed) {
  const result = convertDateToRegularString(format, input, daysAheadAllowed);
  assert.ok(
    REGULAR_REJECTION.has(result),
    `${format} convertDateToRegularString(${JSON.stringify(input)}) returned ${JSON.stringify(result)}, which can be stored as a date`,
  );
  assert.doesNotMatch(result, STORED_DATE);
}

function assertFormatRejected(format, input, daysAheadAllowed) {
  for (const destination of DESTINATIONS) {
    const result = convertDateToFormatType(format, destination, input, daysAheadAllowed);
    assert.equal(
      result,
      'INVALID DATE',
      `${format} -> ${destination} convertDateToFormatType(${JSON.stringify(input)}) returned ${JSON.stringify(result)}`,
    );
  }
}

describe('loose hyphen gate substitutes a real calendar date', () => {
  // Hyphen or letter sits inside a slice. The current branch still returns a real date.
  const substitutedInputs = [
    '2026-1-031', // month slice "1-" parses as 1, day slice "31" -> 2026-01-31
    '2026-3-015', // month slice "3-" parses as 3, day slice "15" -> 2026-03-15
    '2026-4-301', // month slice "4-" parses as 4, day slice "01" -> 2026-04-01
    '2026-12-3x', // day slice "3x" parses as 3 -> 2026-12-03
    '2026-12-3X', // parseInt stops at an uppercase letter the same way
    '2026-01-3a', // day slice "3a" parses as 3 -> 2026-01-03
    '2026-1x-31', // month slice "1x" parses as 1 -> 2026-01-31
    '202x-01-31', // year slice "202x" parses as 202 -> 0202-01-31
  ];

  for (const format of ENTRY_FORMATS) {
    for (const input of substitutedInputs) {
      test(`${format} rejects ${input} instead of storing a substituted day`, () => {
        assertRegularRejected(format, input);
        assertRegularRejected(format, input, 30);
        assertFormatRejected(format, input);
        assertFormatRejected(format, input, 30);
      });
    }
  }
});

describe('ISO and Regular parseInt slices stop at a letter', () => {
  // Same return path as the American and European branch. Punctuation is stripped first,
  // then parseInt reads a slice that still contains a letter.
  const letterInputs = [
    '2026-12-3x',
    '2026-12-3X',
    '2026-01-3a',
    '2026-1x-31',
    '202x-01-31',
  ];

  for (const format of ISO_FORMATS) {
    for (const input of letterInputs) {
      test(`${format} rejects ${input}`, () => {
        assertRegularRejected(format, input);
        assertFormatRejected(format, input);
      });
    }
  }
});

describe('strict year-month-day values still convert', () => {
  const strictDates = ['2026-01-31', '2026-12-03', '2024-02-29'];

  for (const format of [...ENTRY_FORMATS, ...ISO_FORMATS]) {
    for (const input of strictDates) {
      test(`${format} keeps ${input}`, () => {
        assert.equal(convertDateToRegularString(format, input), input);
        assert.equal(convertDateToFormatType(format, 'REGULAR', input), input);
        assert.equal(convertDateToFormatType(format, 'ISO', input), input);
      });
    }
  }

  test('American and European destinations keep the strict calendar day', () => {
    assert.equal(convertDateToFormatType('AMERICAN', 'EUROPEAN', '2026-01-31'), '31-01-2026');
    assert.equal(convertDateToFormatType('EUROPEAN', 'AMERICAN', '2026-01-31'), '01-31-2026');
    assert.equal(convertDateToFormatType('AMERICAN', 'AMERICAN', '2026-12-03'), '12-03-2026');
    assert.equal(convertDateToFormatType('EUROPEAN', 'EUROPEAN', '2026-12-03'), '03-12-2026');
    assert.equal(convertDateToFormatType('ISO', 'AMERICAN', '2024-02-29'), '02-29-2024');
  });
});

describe('a strict pattern whose calendar day does not exist is not rolled over', () => {
  // Luxon already refuses these. The result must stay a non-date if a fix rebuilds the
  // parts with a calendar that overflows, such as 31 February becoming 3 March.
  const impossible = ['2026-02-31', '2026-02-29', '2026-13-01', '2026-00-10', '2026-01-00'];

  for (const format of [...ENTRY_FORMATS, ...ISO_FORMATS]) {
    for (const input of impossible) {
      test(`${format} does not store a real date for ${input}`, () => {
        const regular = convertDateToRegularString(format, input);
        const formatted = convertDateToFormatType(format, 'REGULAR', input);
        assert.doesNotMatch(regular, STORED_DATE);
        assert.doesNotMatch(formatted, STORED_DATE);
        assert.ok(REGULAR_REJECTION.has(regular) || regular === 'INVALID DATE');
        assert.ok(formatted === 'INVALID DATE' || formatted === 'Invalid DateTime');
      });
    }
  }
});
