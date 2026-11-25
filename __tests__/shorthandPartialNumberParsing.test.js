/**
 * Spec for partial-number parsing of shorthand dates.
 *
 * A Thousand, Newsham, or Julian value whose normalized form is five characters
 * long is parsed with parseInt. parseInt keeps the leading digits and drops the
 * rest, so a code such as 2014x is stored as cycle 20 day 14, and 2636a is stored
 * as ordinal 36. The same split is used for an eight-character American, European,
 * Regular, or ISO value. These tests fail while that happens.
 *
 * A fixed build rejects every value below whose normalized field contains a
 * non-digit. Rejection is a thrown Error, an empty string, "INVALID DATE", or
 * "Invalid DateTime". A real calendar day, Julian code, or five-digit cycle code
 * is not rejection. All-digit codes of the same formats must still convert.
 *
 * Run (expected to fail until the fix):
 *   yarn build && node --test __tests__/shorthandPartialNumberParsing.test.js
 */
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { DateTime } from 'luxon';
import {
  convertDateToFormatType,
  convertDateToRegularString,
  convertPercentDateFormat,
} from '../dist/index.js';

const THOUSAND_DAY_ZERO = '1971-09-27';
const NEWSHAM_DAY_ZERO = '1985-06-05';

function cycleDate(dayZero, cycles, day) {
  return DateTime.fromISO(dayZero).plus({ days: (cycles * 1000) + day }).toFormat('yyyy-MM-dd');
}

function isRealYmd(year, month, day) {
  const y = Number(year);
  const m = Number(month);
  const d = Number(day);
  const parsed = DateTime.fromObject({ year: y, month: m, day: d });
  return parsed.isValid && parsed.year === y && parsed.month === m && parsed.day === d;
}

/** True when a converter emitted a real day instead of refusing the input. */
function isAcceptedCalendarOutput(value) {
  if (typeof value !== 'string') {
    return value instanceof Date && !Number.isNaN(value.getTime());
  }

  const text = value.trim();
  if (text === '' || text === 'INVALID DATE' || text === 'Invalid DateTime') {
    return false;
  }

  // Five-digit Thousand/Newsham codes and three-digit day shortcuts are stored days.
  if (/^\d{5}$/.test(text) || /^\d{3}$/.test(text)) {
    return true;
  }

  let match = text.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (match) {
    return isRealYmd(match[1], match[2], match[3]);
  }

  match = text.match(/^(\d{2})-(\d{2})-(\d{4})$/);
  if (match) {
    return isRealYmd(match[3], match[1], match[2]) || isRealYmd(match[3], match[2], match[1]);
  }

  match = text.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (match) {
    return isRealYmd(match[3], match[1], match[2]) || isRealYmd(match[3], match[2], match[1]);
  }

  match = text.match(/^(\d{2})-(\d{3})$/);
  if (match) {
    const year = 2000 + Number(match[1]);
    const ordinal = Number(match[2]);
    const parsed = DateTime.fromObject({ year, ordinal });
    return parsed.isValid && parsed.year === year && parsed.ordinal === ordinal;
  }

  return false;
}

function assertRejected(invoke) {
  let result;
  try {
    result = invoke();
  } catch (err) {
    assert.ok(err instanceof Error);
    return;
  }
  assert.equal(
    isAcceptedCalendarOutput(result),
    false,
    `converted a non-digit shorthand into calendar output ${JSON.stringify(result)}`,
  );
}

describe('all-digit shorthand still converts', () => {
  it('converts a five-digit Thousand code, including through report format %T', () => {
    const expected = cycleDate(THOUSAND_DAY_ZERO, 20, 14);
    assert.equal(expected, '2026-07-14');
    assert.equal(convertDateToRegularString('THOUSAND', '20014'), expected);
    assert.equal(convertDateToFormatType('THOUSAND', 'REGULAR', '20014'), expected);
    assert.equal(convertDateToFormatType('THOUSAND', 'AMERICAN', '20014'), '07-14-2026');
    assert.equal(convertDateToRegularString('%T', '20014'), expected);
    assert.equal(convertPercentDateFormat('%Y-%m-%d', '20014'), expected);
  });

  it('converts a five-digit Newsham code, including through report format %N', () => {
    const expected = cycleDate(NEWSHAM_DAY_ZERO, 20, 14);
    assert.equal(expected, '2040-03-22');
    assert.equal(convertDateToRegularString('NEWSHAM', '20014'), expected);
    assert.equal(convertDateToFormatType('NEWSHAM', 'REGULAR', '20014'), expected);
    assert.equal(convertDateToRegularString('%N', '20014'), expected);
  });

  it('converts a Julian ordinal with or without the hyphen, including through %J', () => {
    assert.equal(convertDateToRegularString('JULIAN', '26036'), '2026-02-05');
    assert.equal(convertDateToRegularString('JULIAN', '26-036'), '2026-02-05');
    assert.equal(convertDateToFormatType('JULIAN', 'REGULAR', '26-036'), '2026-02-05');
    assert.equal(convertDateToRegularString('%J', '26-036'), '2026-02-05');
  });

  it('converts all-digit American, European, Regular, and ISO dates', () => {
    assert.equal(convertDateToRegularString('AMERICAN', '12-31-2026'), '2026-12-31');
    assert.equal(convertDateToRegularString('AMERICAN', '2026-12-31'), '2026-12-31');
    assert.equal(convertDateToRegularString('EUROPEAN', '31-12-2026'), '2026-12-31');
    assert.equal(convertDateToRegularString('EUROPEAN', '2026-12-31'), '2026-12-31');
    assert.equal(convertDateToRegularString('REGULAR', '2026-12-31'), '2026-12-31');
    assert.equal(convertDateToRegularString('ISO', '20261231'), '2026-12-31');
  });
});

describe('five-character cycle and ordinal codes with a non-digit', () => {
  const codes = [
    ['THOUSAND', '2014x'],
    ['THOUSAND', '2014X'],
    ['Thousand', '2014x'],
    ['thousand', '2001x'],
    ['THOUSAND', '2x014'],
    ['THOUSAND', '0114x'],
    ['THOUSAND', '20-14x'],
    ['THOUSAND', '20 14x'],
    ['NEWSHAM', '2014x'],
    ['Newsham', '2014x'],
    ['newsham', '2x014'],
    ['NEWSHAM', '2001x'],
    ['JULIAN', '2636a'],
    ['Julian', '2636a'],
    ['julian', '263a6'],
    ['JULIAN', '2a036'],
    ['JULIAN', '26-36a'],
    ['JULIAN', 'a0101'],
    ['%T', '2014x'],
    ['%T', '0114x'],
    ['%T', '20-14x'],
    ['%N', '2014x'],
    ['%N', '2x014'],
    ['%N', '20-014x'],
    ['%J', '2636a'],
    ['%J', '26-36a'],
    ['%J', '263a6'],
  ];

  for (const [format, value] of codes) {
    it(`rejects ${format} ${JSON.stringify(value)} from every converter that parses it`, () => {
      assertRejected(() => convertDateToRegularString(format, value));
      assertRejected(() => convertDateToFormatType(format, 'REGULAR', value));
      assertRejected(() => convertDateToFormatType(format, 'AMERICAN', value));
      assertRejected(() => convertDateToFormatType(format, 'JULIAN', value));
      assertRejected(() => convertDateToFormatType(format, 'THOUSAND', value));
    });
  }
});

describe('convertPercentDateFormat sends a five-character value through Thousand parsing', () => {
  const destinations = ['%Y-%m-%d', '%m-%d-%Y', '%J', '%T', '%d/%m/%Y'];
  const values = ['2014x', '0114x', '2x014', '2636a'];

  for (const destination of destinations) {
    for (const value of values) {
      it(`rejects ${JSON.stringify(value)} when reporting as ${destination}`, () => {
        assertRejected(() => convertPercentDateFormat(destination, value));
      });
    }
  }
});

describe('eight-character calendar codes with a non-digit', () => {
  const codes = [
    ['AMERICAN', '1231202x'],
    ['American', '123126xx'],
    ['american', '2026-1x-31'],
    ['AMERICAN', '2026-12-3x'],
    ['EUROPEAN', '3112202x'],
    ['European', '311226xx'],
    ['european', '2026-1x-31'],
    ['EUROPEAN', '2026-12-3x'],
    ['REGULAR', '2026123x'],
    ['Regular', '20ab1231'],
    ['regular', '2026-12-3x'],
    ['ISO', '2026123a'],
    ['iso', '20ab1231'],
  ];

  for (const [format, value] of codes) {
    it(`rejects ${format} ${JSON.stringify(value)}`, () => {
      assertRejected(() => convertDateToRegularString(format, value));
      assertRejected(() => convertDateToFormatType(format, 'REGULAR', value));
      assertRejected(() => convertDateToFormatType(format, 'EUROPEAN', value));
    });
  }
});
