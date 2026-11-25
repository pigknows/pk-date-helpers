/**
 * Spec for the fail-open future-date check.
 *
 * These tests fail while detectIfFutureDate reports an incomplete or invalid
 * value as not in the future. They pass once that helper fails closed (throws,
 * or returns true) for anything that is not a real yyyy-MM-dd calendar date,
 * while complete past and future dates keep their results.
 *
 * Run:
 *   yarn build && node --experimental-strip-types --test __tests__/futureDateFailOpen.test.ts
 */
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { DateTime } from 'luxon';
import { detectIfFutureDate, detectIfValidPKDate } from '../dist/index.js';

const futureYear = DateTime.local().year + 2;

// Reduced ISO values Luxon reads as the first of a month. The day characters
// the future helper slices are "0" or "00" (the start of a time), or empty.
const reducedFutureInputs = [
  `${futureYear}-12T00`,
  `${futureYear}-12T00:00`,
  `${futureYear}-12T00:00:00`,
  `${futureYear}-12T00Z`,
  `${futureYear}-12T0000`,
  `${futureYear}-12T00+00:00`,
  `${futureYear}-06T00`,
  `${futureYear}12T00`,
  `${futureYear}12T00Z`,
  '2027-12T00',
  '2027-12',
];

const reducedNotFutureInputs = ['2019-01T00', '2019-01'];

const invalidCalendarInputs = ['2099-12-00', '2099-12-99', '2099-02-31'];

type FutureAnswer = boolean | 'threw';

function futureAnswer(input: string): FutureAnswer {
  try {
    return detectIfFutureDate(input);
  } catch {
    return 'threw';
  }
}

function assertNotReportedAsNotFuture(input: string): void {
  const answer = futureAnswer(input);
  assert.notEqual(
    answer,
    false,
    `${input} must fail closed in detectIfFutureDate, but it returned false`,
  );
}

describe('detectIfFutureDate fails closed on incomplete or invalid dates', () => {
  for (const input of reducedFutureInputs) {
    it(`does not report ${input} as not in the future`, () => {
      const interpreted = DateTime.fromISO(input);
      assert.equal(interpreted.isValid, true);
      assert.ok(
        interpreted.startOf('day') > DateTime.local().startOf('day'),
        `${input} is ${interpreted.toISODate()}, which is not after today`,
      );
      assertNotReportedAsNotFuture(input);
    });
  }

  for (const input of [...reducedNotFutureInputs, ...invalidCalendarInputs]) {
    it(`does not report ${input} as not in the future`, () => {
      assertNotReportedAsNotFuture(input);
    });
  }

  it('still reports a complete future yyyy-MM-dd as future', () => {
    assert.equal(detectIfFutureDate(`${futureYear}-12-01`), true);
    assert.equal(detectIfValidPKDate(`${futureYear}-12-01`), true);
  });

  it('still reports a complete past yyyy-MM-dd as not future', () => {
    assert.equal(detectIfFutureDate('2019-01-01'), false);
    assert.equal(detectIfValidPKDate('2019-01-01'), true);
  });
});

describe('valid-and-not-future gate', () => {
  function storedDayIfGateAccepts(input: string): string | null {
    try {
      if (detectIfValidPKDate(input) !== true) return null;
      if (detectIfFutureDate(input) !== false) return null;
    } catch {
      return null;
    }
    const stored = DateTime.fromISO(input);
    return stored.isValid ? stored.toISODate() : null;
  }

  for (const input of reducedFutureInputs) {
    it(`does not store ${input} as a future calendar day`, () => {
      const stored = storedDayIfGateAccepts(input);
      const today = DateTime.local().startOf('day');
      const storedIsFuture =
        stored !== null && DateTime.fromISO(stored).startOf('day') > today;
      assert.equal(
        storedIsFuture,
        false,
        `gate accepted ${input} and Luxon stored ${stored}`,
      );
    });
  }

  it('still treats a complete future yyyy-MM-dd as future, so the gate does not store it', () => {
    assert.equal(storedDayIfGateAccepts(`${futureYear}-12-01`), null);
    assert.equal(detectIfFutureDate(`${futureYear}-12-01`), true);
  });
});
