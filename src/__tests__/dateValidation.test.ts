import { DateTime } from 'luxon';
import { detectIfFutureDate, detectIfValidPKDate } from '../dateHelpers';
import { currentYear } from './dataEntryDateHelpers.test';

const regularValid = '2019-01-01';
const regularFuture1 = `${currentYear + 1}-01-01`;
const regularFuture2 =  DateTime.local().plus({ days: 1 }).toFormat('yyyy-MM-dd');
const regularInvalidMonth = '2019-13-01';
const regularInvalidDay = '2019-02-31';
const regularInvalidDay2 = '2019-01-32';

describe('Detecting future dates', () => {
  test('future year returned true', () => {
    expect(detectIfFutureDate(regularFuture1)).toEqual(true);
  });

  test('tomorrow returned true', () => {
    expect(detectIfFutureDate(regularFuture2)).toEqual(true);
  });

  test('past date returns false', () => {
    expect(detectIfFutureDate(regularValid)).toEqual(false);
  });
});

describe('Detecting valid dates', () => {
  test('invalid month returns false', () => {
    expect(detectIfValidPKDate(regularInvalidMonth)).toEqual(false);
  });

  test('invalid day returns false', () => {
    expect(detectIfValidPKDate(regularInvalidDay2)).toEqual(false);
  });

  test('invalid day for month (Feb 31) returns false', () => {
    expect(detectIfValidPKDate(regularInvalidDay)).toEqual(false);
  });

  test('valid date returns true', () => {
    expect(detectIfValidPKDate(regularValid)).toEqual(true);
  });
});
