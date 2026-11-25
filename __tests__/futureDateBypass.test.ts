import assert from 'node:assert/strict';
import { afterEach, describe, test } from 'node:test';
import { DateTime, Settings } from 'luxon';
import {
  convertDateToFormatType,
  convertDateToRegularString,
  convertPercentDateFormat,
  convertShortcutDate,
  detectIfFutureDate,
} from '../src/index.ts';

// Tomorrow is a future calendar day. Year-less shortcuts with no daysAheadAllowed
// keep a separate one-day grace: tomorrow stays on this occurrence, and any later
// day falls back. These assertions fail while detectIfFutureDate treats tomorrow
// as not in the future.

const originalNow = Settings.now;

afterEach(() => {
  Settings.now = originalNow;
});

function atLocalClock(parts: {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute?: number;
  second?: number;
  millisecond?: number;
}): DateTime {
  return DateTime.fromObject(
    {
      minute: 0,
      second: 0,
      millisecond: 0,
      ...parts,
    },
    { zone: 'local' },
  );
}

function withClock<T>(clock: DateTime, run: () => T): T {
  Settings.now = () => clock.toMillis();
  try {
    return run();
  } finally {
    Settings.now = originalNow;
  }
}

function ymd(date: DateTime): string {
  return date.toFormat('yyyy-MM-dd');
}

// A year-less date is kept when its this-year start is today or tomorrow.
// A later start falls back one year. This is the shortcut grace, not the
// public future-date check.
function yearKeptForMonthDay(clock: DateTime, month: number, day: number): number {
  const candidate = DateTime.fromObject(
    { year: clock.year, month, day },
    { zone: 'local' },
  ).startOf('day');
  const lastDayStillKept = clock.startOf('day').plus({ days: 1 });
  return candidate > lastDayStillKept ? clock.year - 1 : clock.year;
}

describe('detectIfFutureDate rejects every calendar day after today', () => {
  const clocks = [
    atLocalClock({ year: 2026, month: 6, day: 15, hour: 15, minute: 30 }),
    atLocalClock({ year: 2026, month: 6, day: 15, hour: 0 }),
    atLocalClock({ year: 2026, month: 6, day: 15, hour: 23, minute: 59, second: 59, millisecond: 999 }),
    atLocalClock({ year: 2026, month: 12, day: 31, hour: 12 }),
    atLocalClock({ year: 2024, month: 2, day: 28, hour: 8 }),
  ];

  test('tomorrow in yyyy-MM-dd is a future date at midday, midnight, end of day, year end, and a leap day', () => {
    const failures: string[] = [];
    for (const clock of clocks) {
      withClock(clock, () => {
        const tomorrow = ymd(clock.startOf('day').plus({ days: 1 }));
        const acceptedAsNotFuture = detectIfFutureDate(tomorrow) === false;
        if (acceptedAsNotFuture) {
          failures.push(`${clock.toISO()} accepted ${tomorrow}`);
        }
      });
    }
    assert.deepEqual(failures, []);
  });

  test('the package test construction of tomorrow is a future date on the live clock', () => {
    const tomorrow = DateTime.local().plus({ days: 1 }).toFormat('yyyy-MM-dd');
    assert.equal(detectIfFutureDate(tomorrow), true);
  });

  test('today and yesterday are not future dates', () => {
    for (const clock of clocks) {
      withClock(clock, () => {
        assert.equal(detectIfFutureDate(ymd(clock.startOf('day'))), false);
        assert.equal(detectIfFutureDate(ymd(clock.startOf('day').minus({ days: 1 }))), false);
      });
    }
  });

  test('a date at least two calendar days ahead is a future date', () => {
    for (const clock of clocks) {
      withClock(clock, () => {
        const dayAfter = ymd(clock.startOf('day').plus({ days: 2 }));
        const nextYear = ymd(clock.startOf('day').plus({ years: 1 }));
        assert.equal(detectIfFutureDate(dayAfter), true, dayAfter);
        assert.equal(detectIfFutureDate(nextYear), true, nextYear);
      });
    }
  });
});

describe('year-less shortcuts keep a one-day grace when daysAheadAllowed is omitted', () => {
  const clock = atLocalClock({ year: 2026, month: 6, day: 15, hour: 15, minute: 30 });
  const tomorrow = clock.startOf('day').plus({ days: 1 });
  const dayAfter = clock.startOf('day').plus({ days: 2 });

  function american(date: DateTime): string {
    const year = yearKeptForMonthDay(clock, date.month, date.day);
    return `${date.toFormat('MM-dd')}-${year}`;
  }

  function european(date: DateTime): string {
    const year = yearKeptForMonthDay(clock, date.month, date.day);
    return `${date.toFormat('dd-MM')}-${year}`;
  }

  function regular(date: DateTime): string {
    const year = yearKeptForMonthDay(clock, date.month, date.day);
    return `${year}-${date.toFormat('MM-dd')}`;
  }

  function julianFromMonthDay(date: DateTime): string {
    const year = yearKeptForMonthDay(clock, date.month, date.day);
    const ordinal = DateTime.fromObject(
      { year, month: date.month, day: date.day },
      { zone: 'local' },
    ).toFormat('ooo');
    return `${String(year).slice(2)}-${ordinal}`;
  }

  function julianFromOrdinal(ordinal: string): string {
    const thisYear = DateTime.fromObject(
      { year: clock.year, ordinal: Number(ordinal) },
      { zone: 'local' },
    ).startOf('day');
    const year = thisYear > clock.startOf('day').plus({ days: 1 }) ? clock.year - 1 : clock.year;
    return `${String(year).slice(2)}-${ordinal}`;
  }

  function cycleShortcut(format: 'THOUSAND' | 'NEWSHAM', day: string): string {
    const todayFull = convertDateToFormatType('REGULAR', format, ymd(clock));
    const currentCycle = todayFull.slice(0, 2);
    const thisCycle = `${currentCycle}${day}`;
    const thisYmd = convertDateToFormatType(format, 'REGULAR', thisCycle);
    const candidate = DateTime.fromISO(thisYmd).startOf('day');
    const offset = candidate > clock.startOf('day').plus({ days: 1 }) ? -1 : 0;
    return offset === 0 ? thisCycle : `${parseInt(currentCycle, 10) + offset}${day}`;
  }

  test('AMERICAN, EUROPEAN, REGULAR, and ISO keep tomorrow and fall back the day after', () => {
    withClock(clock, () => {
      assert.equal(convertShortcutDate('AMERICAN', tomorrow.toFormat('MMdd')), american(tomorrow));
      assert.equal(convertShortcutDate('AMERICAN', dayAfter.toFormat('MMdd')), american(dayAfter));
      assert.equal(convertShortcutDate('american', tomorrow.toFormat('MMdd'), undefined), american(tomorrow));
      assert.equal(convertShortcutDate('AMERICAN', tomorrow.toFormat('MMdd'), null as unknown as number), american(tomorrow));

      assert.equal(convertShortcutDate('EUROPEAN', tomorrow.toFormat('ddMM')), european(tomorrow));
      assert.equal(convertShortcutDate('European', dayAfter.toFormat('ddMM')), european(dayAfter));

      assert.equal(convertShortcutDate('REGULAR', tomorrow.toFormat('MMdd')), regular(tomorrow));
      assert.equal(convertShortcutDate('regular', dayAfter.toFormat('MMdd')), regular(dayAfter));
      assert.equal(convertShortcutDate('ISO', tomorrow.toFormat('MMdd')), regular(tomorrow));
      assert.equal(convertShortcutDate('iso', dayAfter.toFormat('MMdd')), regular(dayAfter));
    });
  });

  test('JULIAN month-day and ordinal shortcuts keep tomorrow and fall back the day after', () => {
    withClock(clock, () => {
      assert.equal(convertShortcutDate('JULIAN', tomorrow.toFormat('MMdd')), julianFromMonthDay(tomorrow));
      assert.equal(convertShortcutDate('julian', dayAfter.toFormat('MMdd')), julianFromMonthDay(dayAfter));
      assert.equal(convertShortcutDate('JULIAN', tomorrow.toFormat('ooo')), julianFromOrdinal(tomorrow.toFormat('ooo')));
      assert.equal(convertShortcutDate('JULIAN', dayAfter.toFormat('ooo')), julianFromOrdinal(dayAfter.toFormat('ooo')));
    });
  });

  test('THOUSAND and NEWSHAM 3-digit shortcuts keep tomorrow and fall back the day after', () => {
    withClock(clock, () => {
      for (const format of ['THOUSAND', 'NEWSHAM'] as const) {
        for (const date of [tomorrow, dayAfter]) {
          const full = convertDateToFormatType('REGULAR', format, ymd(date));
          const day = full.slice(2);
          assert.equal(convertShortcutDate(format, day), cycleShortcut(format, day));
        }
      }
    });
  });

  test('convertDateToRegularString and convertDateToFormatType use that same grace', () => {
    withClock(clock, () => {
      assert.equal(convertDateToRegularString('REGULAR', tomorrow.toFormat('MMdd')), regular(tomorrow));
      assert.equal(convertDateToRegularString('REGULAR', dayAfter.toFormat('MMdd')), regular(dayAfter));
      assert.equal(convertDateToRegularString('AMERICAN', tomorrow.toFormat('MMdd')), regular(tomorrow));
      assert.equal(convertDateToRegularString('EUROPEAN', tomorrow.toFormat('ddMM')), regular(tomorrow));
      assert.equal(convertDateToRegularString('JULIAN', tomorrow.toFormat('ooo')), regular(tomorrow));
      assert.equal(convertDateToRegularString('JULIAN', dayAfter.toFormat('ooo')), regular(dayAfter));
      assert.equal(convertDateToRegularString('%j', tomorrow.toFormat('ooo')), regular(tomorrow));
      assert.equal(
        convertDateToFormatType('REGULAR', 'AMERICAN', tomorrow.toFormat('MMdd')),
        american(tomorrow),
      );
      assert.equal(
        convertDateToFormatType('REGULAR', 'AMERICAN', dayAfter.toFormat('MMdd')),
        american(dayAfter),
      );
      assert.equal(
        convertDateToFormatType('JULIAN', 'REGULAR', tomorrow.toFormat('ooo')),
        regular(tomorrow),
      );
    });
  });

  test('convertPercentDateFormat year-less shortcuts use that same grace', () => {
    withClock(clock, () => {
      assert.equal(convertPercentDateFormat('%Y-%m-%d', tomorrow.toFormat('MMdd')), regular(tomorrow));
      assert.equal(convertPercentDateFormat('%Y-%m-%d', dayAfter.toFormat('MMdd')), regular(dayAfter));
      assert.equal(
        convertPercentDateFormat('%m-%d-%Y', tomorrow.toFormat('MMdd')),
        american(tomorrow),
      );
      assert.equal(
        convertPercentDateFormat('%J', tomorrow.toFormat('MMdd')),
        julianFromMonthDay(tomorrow),
      );
      for (const format of ['THOUSAND', 'NEWSHAM'] as const) {
        const full = convertDateToFormatType('REGULAR', format, ymd(tomorrow));
        const day = full.slice(2);
        const kept = cycleShortcut(format, day);
        const report = format === 'THOUSAND' ? '%t' : '%n';
        assert.equal(
          convertDateToRegularString(report, day),
          convertDateToFormatType(format, 'REGULAR', kept),
        );
      }
      const thousandDay = convertDateToFormatType('REGULAR', 'THOUSAND', ymd(tomorrow)).slice(2);
      assert.equal(convertPercentDateFormat('%t', thousandDay), thousandDay);
      assert.equal(convertPercentDateFormat('%n', thousandDay), thousandDay);
    });
  });
});
