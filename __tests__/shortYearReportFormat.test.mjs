/**
 * Spec for two-digit report dates from convertPercentDateFormat.
 *
 * The documented forms are two-digit years (README: 02-01-18, 02/01/18,
 * 01/02/18, 01-02-18). These tests fail while the formatter keeps the first
 * nine characters of the ten-character four-digit date.
 *
 * Run (from the repository root, after dependencies are installed):
 *   yarn build && node --test __tests__/shortYearReportFormat.test.mjs
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { convertDateToRegularString, convertPercentDateFormat } from '../dist/index.js';

const require = createRequire(import.meta.url);
const cjs = require('../dist/cjs/index.js');

// source is the yyyy-MM-dd event date when the input is a shortcut or compact form.
const twoDigitCases = [
  { format: '%d-%m-%y', date: '2026-12-31', expected: '31-12-26' },
  { format: '%d/%m/%y', date: '2026-12-31', expected: '31/12/26' },
  { format: '%m-%d-%y', date: '2026-12-31', expected: '12-31-26' },
  { format: '%m/%d/%y', date: '2026-12-31', expected: '12/31/26' },
  { format: '%d-%m-%y', date: '2018-01-02', expected: '02-01-18' },
  { format: '%d/%m/%y', date: '2018-01-02', expected: '02/01/18' },
  { format: '%m-%d-%y', date: '2018-01-02', expected: '01-02-18' },
  { format: '%m/%d/%y', date: '2018-01-02', expected: '01/02/18' },
  { format: '%d-%m-%y', date: '1999-12-31', expected: '31-12-99' },
  { format: '%d/%m/%y', date: '1999-12-31', expected: '31/12/99' },
  { format: '%m-%d-%y', date: '1999-12-31', expected: '12-31-99' },
  { format: '%m/%d/%y', date: '1999-12-31', expected: '12/31/99' },
  { format: '%d-%m-%y', date: '2000-01-01', expected: '01-01-00' },
  { format: '%d/%m/%y', date: '2000-01-01', expected: '01/01/00' },
  { format: '%m-%d-%y', date: '2000-01-01', expected: '01-01-00' },
  { format: '%m/%d/%y', date: '2000-01-01', expected: '01/01/00' },
  { format: '%d-%m-%y', date: '2026-01-09', expected: '09-01-26' },
  { format: '%d/%m/%y', date: '2026-01-09', expected: '09/01/26' },
  { format: '%m-%d-%y', date: '2026-01-09', expected: '01-09-26' },
  { format: '%m/%d/%y', date: '2026-01-09', expected: '01/09/26' },
  // yyMMdd shortcut is expanded to a four-digit regular date, then formatted.
  { format: '%d-%m-%y', date: '261231', expected: '31-12-26', source: '2026-12-31' },
  { format: '%d/%m/%y', date: '261231', expected: '31/12/26', source: '2026-12-31' },
  { format: '%m-%d-%y', date: '261231', expected: '12-31-26', source: '2026-12-31' },
  { format: '%m/%d/%y', date: '261231', expected: '12/31/26', source: '2026-12-31' },
  // yyyyMMdd is split into yyyy-MM-dd, then formatted.
  { format: '%d-%m-%y', date: '20261231', expected: '31-12-26', source: '2026-12-31' },
  { format: '%d/%m/%y', date: '20261231', expected: '31/12/26', source: '2026-12-31' },
  { format: '%m-%d-%y', date: '20261231', expected: '12-31-26', source: '2026-12-31' },
  { format: '%m/%d/%y', date: '20261231', expected: '12/31/26', source: '2026-12-31' },
  // Spaces are stripped before the format switch, so these hit the same cases.
  { format: '%d - %m - %y', date: '2026-12-31', expected: '31-12-26', roundTripFormat: '%d-%m-%y' },
  { format: '%d / %m / %y', date: '2018-01-02', expected: '02/01/18', roundTripFormat: '%d/%m/%y' },
  { format: '%m - %d - %y', date: '1999-12-31', expected: '12-31-99', roundTripFormat: '%m-%d-%y' },
  { format: '%m / %d / %y', date: '2000-01-01', expected: '01/01/00', roundTripFormat: '%m/%d/%y' },
];

const fourDigitCases = [
  { format: '%d-%m-%Y', date: '2026-12-31', expected: '31-12-2026' },
  { format: '%d/%m/%Y', date: '2026-12-31', expected: '31/12/2026' },
  { format: '%m-%d-%Y', date: '2018-01-02', expected: '01-02-2018' },
  { format: '%m/%d/%Y', date: '2018-01-02', expected: '01/02/2018' },
  { format: '%d-%m-%Y', date: '1999-12-31', expected: '31-12-1999' },
  { format: '%m/%d/%Y', date: '2000-01-01', expected: '01/01/2000' },
];

for (const entry of twoDigitCases) {
  const { format, date, expected } = entry;
  const source = entry.source ?? date;
  const roundTripFormat = entry.roundTripFormat ?? format;

  test(`ESM convertPercentDateFormat(${JSON.stringify(format)}, ${JSON.stringify(date)}) is ${expected}`, () => {
    const report = convertPercentDateFormat(format, date);
    assert.equal(report, expected);
    const yearToken = report.split(/[-/]/).at(-1);
    assert.equal(yearToken, source.slice(2, 4));
    assert.equal(yearToken.length, 2);
  });

  test(`CJS convertPercentDateFormat(${JSON.stringify(format)}, ${JSON.stringify(date)}) is ${expected}`, () => {
    assert.equal(cjs.convertPercentDateFormat(format, date), expected);
  });

  test(`convertDateToRegularString reads ${expected} back as ${source}`, () => {
    const report = convertPercentDateFormat(format, date);
    assert.equal(convertDateToRegularString(roundTripFormat, report), source);
  });
}

for (const { format, date, expected } of fourDigitCases) {
  test(`four-digit ${format} keeps ${expected}`, () => {
    assert.equal(convertPercentDateFormat(format, date), expected);
    assert.equal(cjs.convertPercentDateFormat(format, date), expected);
    assert.equal(convertDateToRegularString(format, expected), date);
  });
}
