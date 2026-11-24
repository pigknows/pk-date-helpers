/**
 * Spec for impossible calendar days in the public converters.
 *
 * These tests fail while the bug is present: a string shaped like yyyy-MM-dd
 * (and the direct regular-string / percent parsers) is formatted even when the
 * day cannot exist. Luxon 3.4.4 then yields the fixed text "Invalid DateTime",
 * or "NaNNaN" for the Newsham and Thousand formatters. Callers that only
 * reject the INVALID DATE sentinel treat that text as a successful conversion.
 *
 * A fix must return INVALID DATE for the value the caller receives. Checking
 * validity and then formatting a different value (a second parse, or a parse
 * that rolls the day into the next month) still fails these assertions.
 */
import assert from 'node:assert/strict';
import { describe, test } from 'node:test';
import {
  convertDateToFormatType,
  convertDateToRegularString,
  convertPercentDateFormat,
} from '../src/dateHelpers';
import type { FormatNames, ReportFormats } from '../src/types';

const INVALID = 'INVALID DATE';

const destinations = [
  'AMERICAN',
  'american',
  'EUROPEAN',
  'European',
  'ISO',
  'iso',
  'JULIAN',
  'julian',
  'NEWSHAM',
  'newsham',
  'REGULAR',
  'regular',
  'THOUSAND',
  'thousand',
] as const satisfies readonly FormatNames[];

// Every input format hits the same yyyy-MM-dd shape shortcut before parsing.
const inputFormats = [
  'AMERICAN',
  'EUROPEAN',
  'ISO',
  'JULIAN',
  'NEWSHAM',
  'REGULAR',
  'regular',
  'THOUSAND',
  '%Y-%m-%d',
  '%m-%d-%Y',
  '%d-%m-%Y',
] as const satisfies readonly (FormatNames | ReportFormats)[];

// Days that match \d{4}-\d{2}-\d{2} and are not real calendar days.
const impossibleRegular = [
  '2026-02-31',
  '2026-02-29',
  '2026-02-00',
  '2026-04-31',
  '2026-06-31',
  '2026-09-31',
  '2026-11-31',
  '2026-01-32',
  '2026-00-15',
  '2026-13-01',
  '2023-02-29',
  '2024-02-30',
  '9999-02-31',
] as const;

function assertSentinel(actual: string): void {
  assert.equal(actual, INVALID);
  assert.notEqual(actual, 'Invalid DateTime');
  assert.notEqual(actual, 'NaNNaN');
}

describe('convertDateToFormatType rejects impossible yyyy-MM-dd input', () => {
  for (const date of impossibleRegular) {
    for (const destination of destinations) {
      test(`${date} from REGULAR to ${destination} is INVALID DATE`, () => {
        assertSentinel(convertDateToFormatType('REGULAR', destination, date));
      });
    }

    for (const inputFormat of inputFormats) {
      test(`${date} is not treated as already converted for input ${inputFormat}`, () => {
        assertSentinel(convertDateToFormatType(inputFormat, 'REGULAR', date));
      });
    }
  }

  test('a real leap day still converts to every destination', () => {
    assert.equal(convertDateToFormatType('REGULAR', 'AMERICAN', '2024-02-29'), '02-29-2024');
    assert.equal(convertDateToFormatType('REGULAR', 'EUROPEAN', '2024-02-29'), '29-02-2024');
    assert.equal(convertDateToFormatType('REGULAR', 'ISO', '2024-02-29'), '2024-02-29');
    assert.equal(convertDateToFormatType('REGULAR', 'REGULAR', '2024-02-29'), '2024-02-29');
    assert.equal(convertDateToFormatType('REGULAR', 'JULIAN', '2024-02-29'), '24-060');
    assert.equal(convertDateToFormatType('REGULAR', 'NEWSHAM', '2024-02-29'), '14148');
    assert.equal(convertDateToFormatType('REGULAR', 'THOUSAND', '2024-02-29'), '19148');
  });

  test('a real non-leap day still converts', () => {
    assert.equal(convertDateToFormatType('AMERICAN', 'ISO', '2026-02-28'), '2026-02-28');
    assert.equal(convertDateToFormatType('REGULAR', 'american', '2026-03-01'), '03-01-2026');
  });

  test('impossible dates that are not already yyyy-MM-dd stay on the INVALID DATE sentinel', () => {
    assertSentinel(convertDateToFormatType('REGULAR', 'AMERICAN', '20260231'));
    assertSentinel(convertDateToFormatType('REGULAR', 'AMERICAN', '2026/02/31'));
    assertSentinel(convertDateToFormatType('AMERICAN', 'REGULAR', '02-31-2026'));
    assertSentinel(convertDateToFormatType('EUROPEAN', 'REGULAR', '31-02-2026'));
    assertSentinel(convertDateToFormatType('JULIAN', 'REGULAR', '26-400'));
    assertSentinel(convertDateToFormatType('%Y-%m-%d', 'REGULAR', '20260231'));
  });
});

describe('convertDateToRegularString rejects impossible days before formatting', () => {
  const directCases: readonly (readonly [FormatNames | ReportFormats, string])[] = [
    ['REGULAR', '2026-02-31'],
    ['regular', '2026-02-31'],
    ['ISO', '2026-02-31'],
    ['iso', '20260231'],
    ['REGULAR', '20260231'],
    ['REGULAR', '2026-02-29'],
    ['REGULAR', '2026-04-31'],
    ['REGULAR', '2026-11-31'],
    ['REGULAR', '2026-00-10'],
    ['REGULAR', '2026-13-01'],
    ['AMERICAN', '02-31-2026'],
    ['AMERICAN', '02312026'],
    ['American', '2026-02-31'],
    ['EUROPEAN', '31-02-2026'],
    ['european', '31022026'],
    ['EUROPEAN', '2026-02-31'],
    ['JULIAN', '26400'],
    ['JULIAN', '26-400'],
    ['julian', '26366'],
    ['%J', '26400'],
    ['%J', '26366'],
    ['%b%d', 'Feb31'],
    ['%b%d%y', 'Feb3126'],
    ['%b%d%Y', 'Feb312026'],
    ['%d%b', '31Feb'],
    ['%d%b%y', '31Feb26'],
    ['%d%b%Y', '31Feb2026'],
    ['%d-%m-%y', '310226'],
    ['%d/%m/%y', '31/02/26'],
    ['%d-%m-%Y', '31022026'],
    ['%d/%m/%Y', '31/02/2026'],
    ['%m-%d', '0231'],
    ['%m/%d', '02/31'],
    ['%m-%d-%y', '023126'],
    ['%m/%d/%y', '02/31/26'],
    ['%m-%d-%Y', '02312026'],
    ['%m/%d/%Y', '02/31/2026'],
    ['%y-%m-%d', '260231'],
    ['%y/%m/%d', '26/02/31'],
    ['%Y-%m-%d', '20260231'],
    ['%Y/%m/%d', '2026/02/31'],
  ];

  for (const [format, value] of directCases) {
    test(`${format} ${value} is INVALID DATE`, () => {
      assertSentinel(convertDateToRegularString(format, value));
    });
  }

  test('real dates still come back as yyyy-MM-dd', () => {
    assert.equal(convertDateToRegularString('REGULAR', '2024-02-29'), '2024-02-29');
    assert.equal(convertDateToRegularString('REGULAR', '20240229'), '2024-02-29');
    assert.equal(convertDateToRegularString('AMERICAN', '02-29-2024'), '2024-02-29');
    assert.equal(convertDateToRegularString('EUROPEAN', '29-02-2024'), '2024-02-29');
    assert.equal(convertDateToRegularString('JULIAN', '24-060'), '2024-02-29');
    assert.equal(convertDateToRegularString('%J', '24366'), '2024-12-31');
    assert.equal(convertDateToRegularString('%Y-%m-%d', '20240229'), '2024-02-29');
    assert.equal(convertDateToRegularString('%Y/%m/%d', '2024/02/29'), '2024-02-29');
    assert.equal(convertDateToRegularString('%m-%d-%Y', '02292024'), '2024-02-29');
    assert.equal(convertDateToRegularString('%d-%m-%Y', '29022024'), '2024-02-29');
    assert.equal(convertDateToRegularString('%b%d%Y', 'Feb292024'), '2024-02-29');
    assert.equal(convertDateToRegularString('%d%b%Y', '29Feb2024'), '2024-02-29');
    assert.equal(convertDateToRegularString('%y-%m-%d', '240229'), '2024-02-29');
    const year = String(new Date().getFullYear());
    assert.equal(convertDateToRegularString('%b%d', 'Feb28'), `${year}-02-28`);
    assert.equal(convertDateToRegularString('%m-%d', '0228'), `${year}-02-28`);
  });
});

describe('convertPercentDateFormat already refuses impossible regular dates', () => {
  test('2026-02-31 throws instead of returning a formatted non-date', () => {
    assert.throws(
      () => convertPercentDateFormat('%Y-%m-%d', '2026-02-31'),
      /2026-02-31/,
    );
    assert.throws(
      () => convertPercentDateFormat('%m-%d-%Y', '20260231'),
      /20260231/,
    );
  });
});
