/**
 * Inherited names passed to getConflictingFormatsForType must behave like any
 * other unknown format: an array (empty), which detectFormatType can search.
 *
 * These assertions fail while the helper returns an inherited function or
 * Object.prototype and detection throws TypeError on includes.
 *
 *   npm install
 *   npm run build
 *   node --test __tests__/inheritedFormatConflict.test.mjs
 */
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import test from 'node:test';

import * as esm from '../dist/index.js';

const require = createRequire(import.meta.url);
const cjs = require('../dist/cjs/index.js');

const builds = [
  { name: 'esm', api: esm },
  { name: 'cjs', api: cjs },
];

// Every name Object.prototype actually has. A denylist of only "constructor"
// and "__proto__" still fails this list. Truthy and falsy names are both
// included: the helper treats any truthy property as a match.
const inheritedNames = Object.getOwnPropertyNames(Object.prototype);

const datesThatReachIncludes = [
  ['2018-01-01', true],
  ['1', true],
  ['17000', true],
  ['12000', true],
  ['Jan01', false],
  ['18-01-02', false],
];

const ownConflicts = {
  AMERICAN: ['EUROPEAN', 'REGULAR'],
  EUROPEAN: ['AMERICAN', 'REGULAR'],
  JULIAN: ['THOUSAND', 'NEWSHAM'],
  NEWSHAM: ['THOUSAND', 'JULIAN'],
  REGULAR: ['AMERICAN', 'EUROPEAN'],
  THOUSAND: ['NEWSHAM', 'JULIAN'],
  '%b%d': [],
  '%d-%m-%y': ['%m-%d-%y', '%y-%m-%d'],
  '%d-%m-%Y': ['%m-%d-%Y'],
  '%m-%d-%y': ['%d-%m-%y', '%y-%m-%d'],
  '%m-%d-%Y': ['%d-%m-%Y'],
  '%j': ['%n', '%t'],
  '%J': [],
  '%N': ['%T'],
  '%n': ['%j', '%t'],
  '%t': ['%j', '%n'],
  '%T': ['%N'],
  '%y-%m-%d': ['%d-%m-%y', '%m-%d-%y'],
  '%Y-%m-%d': [],
};

for (const { name, api } of builds) {
  test(`${name}: inherited format names return an empty array and detection finishes`, () => {
    for (const formatName of inheritedNames) {
      const ignore = api.getConflictingFormatsForType(formatName);

      for (const [date, preferStandard] of datesThatReachIncludes) {
        const detected = api.detectFormatType(date, preferStandard, ignore);
        assert.equal(
          detected,
          api.detectFormatType(date, preferStandard, []),
          `${formatName} changed detection of ${date}`,
        );
      }

      assert.deepEqual(ignore, [], formatName);
      assert.notEqual(ignore, Object.prototype);
      assert.notEqual(ignore, Object);
    }
  });

  test(`${name}: case variants of inherited names are unknown formats`, () => {
    for (const formatName of ['Constructor', 'CONSTRUCTOR', '__PROTO__', 'ToString', 'TOSTRING']) {
      const ignore = api.getConflictingFormatsForType(formatName);
      assert.deepEqual(ignore, []);
      assert.equal(api.detectFormatType('2018-01-01', true, ignore), 'REGULAR');
      assert.equal(api.detectFormatType('1', true, ignore), 'THOUSAND');
    }
  });

  test(`${name}: own conflict keys are unchanged and still drive detection`, () => {
    for (const [formatName, expected] of Object.entries(ownConflicts)) {
      assert.deepEqual(api.getConflictingFormatsForType(formatName), expected);
    }

    const ignoreNewshamConflicts = api.getConflictingFormatsForType('NEWSHAM');
    assert.equal(api.detectFormatType('12000', true, ignoreNewshamConflicts), 'NEWSHAM');

    const ignoreReportConflicts = api.getConflictingFormatsForType('%y-%m-%d');
    assert.equal(api.detectFormatType('18-01-02', false, ignoreReportConflicts), '%y-%m-%d');

    assert.deepEqual(api.getConflictingFormatsForType('not-a-format'), []);
    assert.deepEqual(api.getConflictingFormatsForType('american'), []);
    assert.deepEqual(api.getConflictingFormatsForType('ISO'), []);
    assert.deepEqual(api.getConflictingFormatsForType(''), []);
    assert.deepEqual(api.getConflictingFormatsForType(undefined), []);
    assert.deepEqual(api.getConflictingFormatsForType(null), []);
  });

  test(`${name}: other format entry points do not throw on inherited names`, () => {
    for (const formatName of inheritedNames) {
      assert.equal(
        api.convertDateToFormatType('REGULAR', formatName, '2018-01-01'),
        'INVALID DATE',
      );
      assert.equal(api.convertShortcutDate(formatName, '2018-01-01'), 'INVALID DATE');
      assert.equal(api.convertShortcutDate(formatName, '0101'), '0101');
      assert.equal(api.convertPercentDateFormat(formatName, '2018-01-01'), '2018-01-01');
      assert.equal(api.convertDateToRegularString(formatName, '20180101'), '20180101');
    }
  });
}
