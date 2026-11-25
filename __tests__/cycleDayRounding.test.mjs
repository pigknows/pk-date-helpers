import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { Settings } from 'luxon';
import {
  convertDateToFormatType,
  convertDateToRegularString,
  convertPercentDateFormat,
  convertShortcutDate,
} from '../dist/index.js';

const THOUSAND_EPOCH = '1971-09-27';
const NEWSHAM_EPOCH = '1985-06-05';

// Civil-day distance between the two calendar dates. The cycle code is that
// distance, not the elapsed UTC time divided into 24-hour days.
function calendarCycleCode(epoch, date) {
  const [ey, em, ed] = epoch.split('-').map(Number);
  const [y, m, d] = date.split('-').map(Number);
  const days = Math.round((Date.UTC(y, m - 1, d) - Date.UTC(ey, em - 1, ed)) / 86400000);
  const span = Math.abs(days);
  const cycles = Math.floor(span / 1000);
  const day = span - (cycles * 1000);
  return String(cycles).padStart(2, '0') + String(day).padStart(3, '0');
}

function epochFor(format) {
  return format === 'NEWSHAM' ? NEWSHAM_EPOCH : THOUSAND_EPOCH;
}

// Submitted civil dates on which the host zone's offset is later than the
// cycle epoch. The formatter currently stores the previous civil day.
const backdatedDates = [
  { zone: 'America/Dawson', format: 'THOUSAND', date: '2018-11-04' },
  { zone: 'America/Nome', format: 'THOUSAND', date: '2024-11-03' },
  { zone: 'America/Bahia_Banderas', format: 'THOUSAND', date: '2018-10-28' },
  { zone: 'Africa/El_Aaiun', format: 'THOUSAND', date: '2026-09-20' },
  { zone: 'America/Bahia_Banderas', format: 'NEWSHAM', date: '2015-10-25' },
  { zone: 'America/Scoresbysund', format: 'NEWSHAM', date: '2025-03-30' },
];

// The same conversion in zones where the epoch already sits at the later
// offset, or where a later offset does not shorten the day count.
const stableDates = [
  { zone: 'America/New_York', format: 'THOUSAND', date: '2018-11-04' },
  { zone: 'America/New_York', format: 'THOUSAND', date: '2018-12-31' },
  { zone: 'America/New_York', format: 'NEWSHAM', date: '2018-12-31' },
  { zone: 'Europe/London', format: 'THOUSAND', date: '2018-12-31' },
  { zone: 'Europe/London', format: 'NEWSHAM', date: '2018-12-31' },
  { zone: 'Australia/Sydney', format: 'THOUSAND', date: '2018-12-31' },
  { zone: 'Australia/Sydney', format: 'NEWSHAM', date: '2018-12-31' },
];

function storedCodeIsThatDate(format, date) {
  const epoch = epochFor(format);
  const expected = calendarCycleCode(epoch, date);
  const code = convertDateToFormatType('REGULAR', format, date);
  const back = convertDateToRegularString(format, code);
  const roundTrip = convertDateToFormatType(format, 'REGULAR', code);
  assert.equal(
    code,
    expected,
    `${format} stored ${code}, which reads back as ${back}, for submitted ${date}`,
  );
  assert.equal(back, date);
  assert.equal(roundTrip, date);
}

test.afterEach(() => {
  Settings.defaultZone = 'system';
});

for (const { zone, format, date } of backdatedDates) {
  test(`${format} keeps ${date} in ${zone} instead of the previous civil day`, () => {
    Settings.defaultZone = zone;
    storedCodeIsThatDate(format, date);
  });
}

for (const { zone, format, date } of stableDates) {
  test(`${format} keeps ${date} in ${zone}`, () => {
    Settings.defaultZone = zone;
    storedCodeIsThatDate(format, date);
  });
}

test('calendar-date entry points store the Dawson Thousand day that was submitted', () => {
  Settings.defaultZone = 'America/Dawson';
  const date = '2018-11-04';
  const code = calendarCycleCode(THOUSAND_EPOCH, date);

  assert.equal(convertDateToFormatType('REGULAR', 'THOUSAND', date), code);
  assert.equal(convertDateToFormatType('ISO', 'THOUSAND', date), code);
  assert.equal(convertDateToFormatType('AMERICAN', 'THOUSAND', '11-04-2018'), code);
  assert.equal(convertDateToFormatType('EUROPEAN', 'THOUSAND', '04-11-2018'), code);
  assert.equal(convertDateToFormatType('JULIAN', 'THOUSAND', '18-308'), code);
  assert.equal(convertDateToFormatType('regular', 'thousand', date), code);
  assert.equal(convertPercentDateFormat('%T', date), code);
  assert.equal(convertPercentDateFormat('%t', date), code.slice(2));
  // %n is documented as a 3-digit Newsham code and is produced by the Thousand formatter.
  assert.equal(convertPercentDateFormat('%n', date), code.slice(2));
  assert.equal(convertShortcutDate('THOUSAND', '181104'), code);
  assert.equal(convertShortcutDate('thousand', '181104'), code);

  const stored = convertDateToFormatType('REGULAR', 'THOUSAND', date);
  assert.equal(convertDateToFormatType('THOUSAND', 'AMERICAN', stored), '11-04-2018');
  assert.equal(convertDateToRegularString('thousand', stored), date);
});

test('calendar-date entry points store the Bahia Banderas Newsham day that was submitted', () => {
  Settings.defaultZone = 'America/Bahia_Banderas';
  const date = '2015-10-25';
  const code = calendarCycleCode(NEWSHAM_EPOCH, date);

  assert.equal(convertDateToFormatType('REGULAR', 'NEWSHAM', date), code);
  assert.equal(convertDateToFormatType('ISO', 'NEWSHAM', date), code);
  assert.equal(convertDateToFormatType('AMERICAN', 'NEWSHAM', '10-25-2015'), code);
  assert.equal(convertDateToFormatType('EUROPEAN', 'NEWSHAM', '25-10-2015'), code);
  assert.equal(convertDateToFormatType('JULIAN', 'NEWSHAM', '15-298'), code);
  assert.equal(convertDateToFormatType('Regular', 'newsham', date), code);
  assert.equal(convertPercentDateFormat('%N', date), code);
  assert.equal(convertShortcutDate('NEWSHAM', '151025'), code);
  assert.equal(convertShortcutDate('newsham', '151025'), code);

  const stored = convertDateToFormatType('REGULAR', 'NEWSHAM', date);
  assert.equal(convertDateToRegularString('NEWSHAM', stored), date);
  assert.equal(convertDateToFormatType('NEWSHAM', 'EUROPEAN', stored), '25-10-2015');
});

// The formatters never pass a zone. Luxon then uses the host zone
// (Settings.defaultZone, initially "system"). A child process with TZ set
// is that host zone, with no test override inside the conversion.
function hostZoneRoundTrip(tz, format, date) {
  const root = fileURLToPath(new URL('..', import.meta.url));
  const script = `
    import { convertDateToFormatType, convertDateToRegularString } from './dist/index.js';
    const format = ${JSON.stringify(format)};
    const date = ${JSON.stringify(date)};
    const code = convertDateToFormatType('REGULAR', format, date);
    const back = convertDateToRegularString(format, code);
    process.stdout.write(JSON.stringify({ code, back }));
  `;
  const result = spawnSync(process.execPath, ['--input-type=module', '-e', script], {
    cwd: root,
    env: { ...process.env, TZ: tz },
    encoding: 'utf8',
  });
  assert.equal(result.status, 0, result.stderr);
  return JSON.parse(result.stdout);
}

test('a host in America/Dawson stores 2018-11-04 as that Thousand day', () => {
  const date = '2018-11-04';
  const { code, back } = hostZoneRoundTrip('America/Dawson', 'THOUSAND', date);
  assert.equal(code, calendarCycleCode(THOUSAND_EPOCH, date), `stored ${code}, read back as ${back}`);
  assert.equal(back, date);
});

test('a host in America/Bahia_Banderas stores 2015-10-25 as that Newsham day', () => {
  const date = '2015-10-25';
  const { code, back } = hostZoneRoundTrip('America/Bahia_Banderas', 'NEWSHAM', date);
  assert.equal(code, calendarCycleCode(NEWSHAM_EPOCH, date), `stored ${code}, read back as ${back}`);
  assert.equal(back, date);
});
