import { DateTime, DateObjectUnits } from 'luxon';
const NEWSHAM_DAY_ZERO = '1985-06-05';
const THOUSAND_DAY_ZERO = '1971-09-27';

// reference: https://bitbucket.org/pigknowsdev/documentation/src/master/product%20specs/DATE_FORMATS.md

/* CONTENT:
  - padNum (helper function to add leading zeros to numbers)
  - dateFormatsMap (object mapper that takes format type and returns either luxon format string or conversion function)
  - convertDateToRegularString
  - converDateToFormatType
  - convertShortcutDate
*/

function padNum(input: number | string, places = 2) {
  let temp = input.toString();
  while (temp.length < places) {
    temp = `0${temp}`;
  }
  return temp;
}

export type FormatNames = 'AMERICAN' | 'american' | 'American'
  | 'EUROPEAN' | 'european' | 'European'
  | 'ISO' | 'iso' | 'Iso'
  | 'JULIAN' | 'Julian' | 'julian'
  | 'NEWSHAM' | 'Newsham' | 'newsham'
  | 'REGULAR' | 'Regular' | 'regular'
  | 'THOUSAND' | 'Thousand' | 'thousand';

export type ReportFormats = '%b%d' | '%b%d%y' |
  '%b%d%Y' | '%d%b' | '%d%b%y' | '%d%b%Y' | '%d-%m-%y' |
  '%d/%m/%y' | '%d/%m/%Y' | '%m/%d' | '%m/%d/%y' | '%m/%d/%Y' |
  '%d-%m-%Y' | '%m-%d' | '%m-%d-%y' | '%m-%d-%Y' | '%j' | 
  '%J' | '%N' | '%n' | '%t' | '%T' | '%y-%m-%d' | '%Y-%m-%d' |
  '%y/%m/%d' | '%Y/%m/%d';

// dateFormatsMap requires Regular-like input
// convert to regular first using helper function below
const dateFormatsMap = {
  AMERICAN: 'MM-dd-yyyy',
  EUROPEAN: 'dd-MM-yyyy',
  ISO: 'yyyy-MM-dd',
  JULIAN: 'yy-ooo',
  NEWSHAM: (date: string): string => {
    const temp = date.toString().replace(/\D/g, '');
    const luxonDate = DateTime.fromObject({
      day: parseInt(temp.slice(6, 8)),
      month: parseInt(temp.slice(4, 6)),
      year: parseInt(temp.slice(0, 4)),
    });
    const dayZero = NEWSHAM_DAY_ZERO.toString().replace(/\D/g, '');
    const luxonZeroDay = DateTime.fromObject({
      day: parseInt(dayZero.slice(6, 8)),
      month: parseInt(dayZero.slice(4, 6)),
      year: parseInt(dayZero.slice(0, 4)),
    });

    const diffInDays = Math.abs(luxonZeroDay.diff(luxonDate, 'days').as('days'));
    const thousands = Math.floor(diffInDays / 1000);
    const dayInYear = Math.floor(diffInDays - (thousands * 1000));

    return `${padNum(thousands)}${padNum(dayInYear, 3)}`;
  },
  REGULAR: 'yyyy-MM-dd',
  THOUSAND: (date: string): string => {
    const temp = date.toString().replace(/\D/g, '');
    const luxonDate = DateTime.fromObject({
      day: parseInt(temp.slice(6, 8)),
      month: parseInt(temp.slice(4, 6)),
      year: parseInt(temp.slice(0, 4)),
    });
    const dayZero = THOUSAND_DAY_ZERO.toString().replace(/\D/g, '');
    const luxonZeroDay = DateTime.fromObject({
      day: parseInt(dayZero.slice(6)),
      month: parseInt(dayZero.slice(4, 6)),
      year: parseInt(dayZero.slice(0, 4)),
    });

    const diffInDays = Math.abs(luxonZeroDay.diff(luxonDate, 'days').as('days'));
    const thousands = Math.floor(diffInDays / 1000);
    const dayInYear = Math.floor(diffInDays - (thousands * 1000));

    return `${padNum(thousands)}${padNum(dayInYear, 3)}`;
  },
};

export function detectFormatType(date, preferStandard = true, ignoreFormats = []) {
  if (!date) {
    console.error('Input date required.');
    return '';
  }

  const formatMap = preferStandard
    ? {
      'AMERICAN': /^\d{2}-\d{2}-\d{4}$/,
      'EUROPEAN': /^\d{2}-\d{2}-\d{4}$/,
      'JULIAN': /^\d{2}-\d{3}$/,
      'NEWSHAM': /^\d{5}$/,
      'REGULAR': /^\d{4}-\d{2}-\d{2}$/,
      'THOUSAND': /^\d{5}$/,
    } : {
      '%b%d': /^([a-zA-Z]){3}\d{2}$/,
      '%b%d%y': /^([a-zA-Z]){3}\d{2}\d{2}$/,
      '%b%d%Y': /^([a-zA-Z]){3}\d{2}\d{4}$/,
      '%d%b': /^\d{2}([a-zA-Z]){3}$/,
      '%d%b%y': /^\d{2}([a-zA-Z]){3}\d{2}$/,
      '%d%b%Y': /^\d{2}([a-zA-Z]){3}\d{4}$/,
      '%d-%m-%y': /^\d{2}-\d{2}-\d{2}$/,
      '%d-%m-%Y': /^\d{2}-\d{2}-\d{4}$/,
      '%m-%d': /^\d{2}-\d{2}$/,
      '%m-%d-%y': /^\d{2}-\d{2}-\d{2}$/,
      '%m-%d-%Y': /^\d{2}-\d{2}-\d{4}$/,
      '%j': /^\d{3}$/,
      '%J': /^\d{2}-\d{3}$/,
      '%N': /^\d{5}$/,
      '%n': /^\d{3}$/,
      '%t': /^\d{3}$/,
      '%T': /^\d{5}$/,
      '%y-%m-%d': /^\d{2}-\d{2}-\d{2}$/,
      '%Y-%m-%d': /^\d{4}-\d{2}-\d{2}$/,
    }

  // remove unneeded formats and set preference for conflicting formats
  ignoreFormats.forEach(format => {
    delete formatMap[format];
  });

  const standardizedDate = date.toString().replace(/\//g, '-').split('-').map(x => x.replace(/[^a-zA-z0-9]/g, '')).join('-');
  if (standardizedDate.length === 8) { // 2 digits for month, day, year
    if (formatMap.AMERICAN && !formatMap.EUROPEAN && !formatMap.REGULAR) {
      return 'AMERICAN';
    } else if (!formatMap.AMERICAN && formatMap.EUROPEAN && !formatMap.REGULAR) {
      return 'EUROPEAN';
    } else if (!formatMap.AMERICAN && !formatMap.EUROPEAN && formatMap.REGULAR) {
      return 'REGULAR';
    }
  }
  for (const formatName in formatMap) {
    if (formatMap[formatName].test(standardizedDate)) {
      return formatName;
    }
  }

  console.error(`Unknown format type for date: ${date.toString()}`);
  return '';
}

export function getConflictingFormatsForType(formatType: FormatNames | ReportFormats) {
  if (!formatType || typeof formatType !== 'string') {
    console.error('Please use an existing format type supported by PigKnows.');
    return [];
  }

  const conflictsMap = {
    'AMERICAN': ['EUROPEAN'],
    'EUROPEAN': ['AMERICAN'],
    'JULIAN': [],
    'NEWSHAM': ['THOUSAND'],
    'REGULAR': [],
    'THOUSAND': ['NEWSHAM'],
    '%b%d': [],
    '%b%d%y': [],
    '%b%d%Y': [],
    '%d%b': [],
    '%d%b%y': [],
    '%d%b%Y': [],
    '%d-%m-%y': ['%m-%d-%y', '%y-%m-%d'],
    '%d-%m-%Y': ['%m-%d-%Y'],
    '%m-%d': [],
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
  }

  if (conflictsMap[formatType]) {
    return conflictsMap[formatType];
  }

  console.error(`Unknown format type: ${formatType}`);
  return [];
}

export function convertDateToRegularString(inputFormat: FormatNames | ReportFormats, date: string): string {
  if (typeof date !== 'string') {
    console.error('Date must be a string.');
  }

  if (!date) {
    return '';
  }
  let dateStr = date.toString().replace(/[^a-zA-Z0-9]/g, '');
  const dateConfigObj : DateObjectUnits = {};
  switch (inputFormat) {
    case 'AMERICAN':
    case 'American':
    case 'american':
      if (dateStr.length !== 8) {
        dateStr = convertShortcutDate('AMERICAN', dateStr).replace(/\D/g, '');
      } else if (date.length === 10 && (date[4] === '-')) {
        // regular format was entered. convert.
        dateConfigObj.month = parseInt(date.slice(5,7));
        dateConfigObj.day = parseInt(date.slice(8,10));
        dateConfigObj.year = parseInt(date.slice(0,4));
        break;
      }
      dateConfigObj.month = parseInt(dateStr.slice(0, 2));
      dateConfigObj.day = parseInt(dateStr.slice(2, 4));
      dateConfigObj.year = parseInt(dateStr.slice(4, 8));
      break;
    case 'EUROPEAN':
    case 'European':
    case 'european':
      if (dateStr.length !== 8) {
        dateStr = convertShortcutDate('European', dateStr).replace(/\D/g, '');
      } else if (date.length === 10 && (date[4] === '-')) {
        // regular format was entered. convert.
        dateConfigObj.month = parseInt(date.slice(5,7));
        dateConfigObj.day = parseInt(date.slice(8,10));
        dateConfigObj.year = parseInt(date.slice(0,4));
        break;
      }
      dateConfigObj.month = parseInt(dateStr.slice(2, 4));
      dateConfigObj.day = parseInt(dateStr.slice(0, 2));
      dateConfigObj.year = parseInt(dateStr.slice(4, 8));
      break;
    case 'ISO':
    case 'iso':
    case 'REGULAR':
    case 'Regular':
    case 'regular':
      if (dateStr.length !== 8) {
        dateStr = convertShortcutDate('REGULAR', dateStr).replace(/\D/g, '');
      }
      dateConfigObj.year = parseInt(dateStr.slice(0, 4));
      dateConfigObj.month = parseInt(dateStr.slice(4, 6));
      dateConfigObj.day = parseInt(dateStr.slice(6, 8));
      break;
    case '%J':
    case 'JULIAN':
    case 'Julian':
    case 'julian':
      if (dateStr.length !== 5) {
        dateStr = convertShortcutDate('JULIAN', dateStr).replace(/\D/g, '');
      }
      dateConfigObj.year = parseInt(`20${dateStr.slice(0, 2)}`);
      dateConfigObj.ordinal = parseInt(dateStr.slice(2, 6));
      break;
    case 'NEWSHAM':
    case 'Newsham':
    case 'newsham':
    case 'THOUSAND':
    case 'Thousand':
    case 'thousand':
      if (dateStr.length !== 5) {
        dateStr = convertShortcutDate(inputFormat, dateStr).replace(/\D/g, '');
      }
      const cycles = parseInt(dateStr.slice(0, 2));
      const leftover = parseInt(dateStr.slice(2));
      const dayZero = inputFormat.toUpperCase() === 'NEWSHAM'
        ? NEWSHAM_DAY_ZERO
        : THOUSAND_DAY_ZERO;
      return DateTime.fromISO(dayZero).plus({ days: (cycles * 1000) + leftover }).toFormat('yyyy-MM-dd');
    case '%b%d':
      return DateTime.fromFormat(dateStr, 'MMMdd').toFormat('yyyy-MM-dd');
    case '%b%d%y':
      return DateTime.fromFormat(dateStr, 'MMMddyy').toFormat('yyyy-MM-dd');
    case '%b%d%Y':
      return DateTime.fromFormat(dateStr, 'MMMddyyyy').toFormat('yyyy-MM-dd');
    case '%d%b':
      return DateTime.fromFormat(dateStr, 'ddMMM').toFormat('yyyy-MM-dd');
    case '%d%b%y':
      return DateTime.fromFormat(dateStr, 'ddMMMyy').toFormat('yyyy-MM-dd');
    case '%d%b%Y':
      return DateTime.fromFormat(dateStr, 'ddMMMyyyy').toFormat('yyyy-MM-dd');
    case '%d-%m-%y':
    case '%d/%m/%y':
      return DateTime.fromFormat(dateStr, 'ddMMyy').toFormat('yyyy-MM-dd');
    case '%d-%m-%Y':
    case '%d/%m/%Y':
      return DateTime.fromFormat(dateStr, 'ddMMyyyy').toFormat('yyyy-MM-dd');
    case '%m-%d':
    case '%m/%d':
      return DateTime.fromFormat(dateStr, 'MMdd').toFormat('yyyy-MM-dd');
    case '%m-%d-%y':
    case '%m/%d/%y':
      return DateTime.fromFormat(dateStr, 'MMddyy').toFormat('yyyy-MM-dd');
    case '%m-%d-%Y':
    case '%m/%d/%Y':
      return DateTime.fromFormat(dateStr, 'MMddyyyy').toFormat('yyyy-MM-dd');
    case '%j':
      return convertDateToRegularString('JULIAN', convertShortcutDate('JULIAN', dateStr));
    case '%N':
      return convertDateToRegularString('NEWSHAM', dateStr);
    case '%n':
      return convertDateToRegularString('NEWSHAM', convertShortcutDate('NEWSHAM', dateStr));
    case '%t':
      const shortcutToFull = convertShortcutDate('THOUSAND', dateStr);
      return convertDateToRegularString('THOUSAND', shortcutToFull);
    case '%T':
      return convertDateToRegularString('THOUSAND', dateStr)
    case '%y-%m-%d':
    case '%y/%m/%d':
      return DateTime.fromFormat(dateStr, 'yyMMdd').toFormat('yyyy-MM-dd');
    case '%Y-%m-%d':
    case '%Y/%m/%d':
      return DateTime.fromFormat(dateStr, 'yyyyMMdd').toFormat('yyyy-MM-dd');
    default:
      return dateStr;
      console.error(`Unknown date format: ${inputFormat}.`)
  }

  return DateTime.fromObject(dateConfigObj).toLocal().toFormat('yyyy-MM-dd');
}

export function convertDateToFormatType(
  inputFormatType: FormatNames | ReportFormats,
  destinationFormatType: FormatNames,
  date: string): string {

  if (!date || !inputFormatType || !destinationFormatType) {
    console.error('Trying to convert with missing fields.')
    return '';
  }

  if (typeof date !== 'string') {
    throw new Error('Date must be a string.');
  }

  const isInRegular = /^\d{4}-\d{2}-\d{2}$/.test(date.toString());
  let dateConvertedToRegular = isInRegular
    ? date.toString()
    : convertDateToRegularString(inputFormatType, date);

  if (!dateConvertedToRegular) {
    return '';
  }
  
  if (dateConvertedToRegular.replace(/\D/g, '').length !== 8 ||
    !(/^\d{8}$/).test(dateConvertedToRegular.replace(/\D/g, ''))) {
      console.warn(`input '${date}' does not match inputFormat '${inputFormatType}' or any of its shortcuts.`);
      return date.toString();
    }
  
  const formatter = dateFormatsMap[destinationFormatType.toUpperCase()];
  if (!formatter) {
    console.warn(`${destinationFormatType} is not a valid date format.`);
    return date.toString();
  }

  if (/^\d{4}-\d{2}-\d{2}$/.test(dateConvertedToRegular)) {
    return typeof formatter === 'string'
      ? DateTime.fromISO(dateConvertedToRegular).toFormat(formatter)
      : formatter(dateConvertedToRegular);
  } else {
    return date.toString();
  }
};

function detectIfFutureDate(regularDate) {
  const currentDateTime = DateTime.local();
  const comparedDateTime = DateTime.fromObject({
    day: parseInt(regularDate.slice(8, 10)),
    month: parseInt(regularDate.slice(5, 7)),
    year: parseInt(regularDate.slice(0, 4)),
  });
  return currentDateTime < comparedDateTime
}

// shortcut used must belong to the destination formatType.
// example: 4 digit American format means something different than 4 digit European
export function convertShortcutDate(formatType: FormatNames, date: string) {
  const inputDate = date.toString().replace(/\D/g, '');
  const currentYear = (new Date()).getFullYear();
  const currentYearEnd = currentYear.toString().slice(2);

  // all formats are allowed to convert from regular to their desired format
  if (/^\d{4}-\d{2}-\d{2}$/.test(date.toString())) {
    return convertDateToFormatType('REGULAR', formatType, inputDate);
  }

  /* all year-less shortcuts should be converted to previous year if future date */
  switch (formatType.toUpperCase()) {
    case 'AMERICAN':
    case 'EUROPEAN':
      // allowed shortcuts: MMdd and MMddyy (American)
      // allowed shortcuts: ddMM and ddMMyy (European)
      if (inputDate.length === 4) {
        const month = formatType.toUpperCase() === 'EUROPEAN'
          ? inputDate.slice(2, 4)
          : inputDate.slice(0, 2);
        const day = formatType.toUpperCase() === 'EUROPEAN'
          ? inputDate.slice(0, 2)
          : inputDate.slice(2, 4);
        return detectIfFutureDate(`${currentYear}-${month}-${day}`)
          ? `${inputDate.slice(0, 2)}-${inputDate.slice(2, 4)}-${currentYear-1}`
          : `${inputDate.slice(0, 2)}-${inputDate.slice(2, 4)}-${currentYear}`;
      } else if (inputDate.length === 6) {
        return `${inputDate.slice(0, 2)}-${inputDate.slice(2, 4)}-20${inputDate.slice(4)}`;
      } else {
        return inputDate;
      }
    case 'JULIAN':
      if (inputDate.length < 4) {
        const paddedDate = `${currentYearEnd}-${padNum(inputDate, 3)}`;
        const regularizedDate = convertDateToFormatType('JULIAN', 'Regular', paddedDate);
        return detectIfFutureDate(regularizedDate)
          ? `${(currentYear - 1).toString().slice(2)}-${padNum(inputDate, 3)}`
          : `${currentYearEnd}-${padNum(inputDate, 3)}`;
      } else if (inputDate.length === 4) {
        const luxonDate = DateTime.fromObject({
          year: currentYear,
          month: parseInt(inputDate.slice(0, 2)),
          day: parseInt(inputDate.slice(2)),
        });
        return detectIfFutureDate(luxonDate.toFormat('yyyy-MM-dd'))
          ? `${(currentYear - 1).toString().slice(2)}-${luxonDate.toFormat('ooo')}`
          : `${currentYearEnd}-${luxonDate.toFormat('ooo')}`;
      } else if (inputDate.length === 5) {
        return `${inputDate.slice(0, 2)}-${inputDate.slice(2)}`;
      } else if (inputDate.length === 6) {
        const luxonDate = DateTime.fromObject({
          year: parseInt(inputDate.slice(0, 2)),
          month: parseInt(inputDate.slice(2, 4)),
          day: parseInt(inputDate.slice(4)),
        });
        return `${luxonDate.toFormat('yy')}-${luxonDate.toFormat('ooo')}`;
      } else if (inputDate.length === 8) {
        return convertDateToFormatType('REGULAR', formatType, inputDate);
      } else {
        return inputDate;
      }
    case 'ISO':
    case 'REGULAR':
      // allowed shortcuts: MMdd and yyMMdd
      if (inputDate.length === 4) {
        const date = `${currentYear}-${inputDate.slice(0, 2)}-${inputDate.slice(2)}`;
        return detectIfFutureDate(date)
          ? `${currentYear-1}-${inputDate.slice(0, 2)}-${inputDate.slice(2)}`
          : date;
      } else if (inputDate.length === 6) {
        return `20${inputDate.slice(0, 2)}-${inputDate.slice(2, 4)}-${inputDate.slice(4)}`;
      } else {
        return inputDate;
      }
    case 'NEWSHAM':
      const todayNewsham = convertDateToFormatType('REGULAR', 'NEWSHAM', DateTime.local().toFormat('yyyy-MM-dd'));
      const currentNewshamCycle = todayNewsham.slice(0, 2);
      if (inputDate.length < 4) {
        const paddedDate = `${currentNewshamCycle}${padNum(inputDate, 3)}`;
        const regularizedDate = convertDateToFormatType('NEWSHAM', 'REGULAR', paddedDate);
        return detectIfFutureDate(regularizedDate)
          ? `${parseInt(currentNewshamCycle)-1}${padNum(inputDate, 3)}`
          : paddedDate;
      } else if (inputDate.length === 4) {
        return `1${inputDate}`
      } else if (inputDate.length === 6) {
        const regularDate = `20${inputDate.slice(0, 2)}-${inputDate.slice(2, 4)}-${inputDate.slice(4)}`;
        return convertDateToFormatType('REGULAR', 'NEWSHAM', regularDate);
      } else {
        return inputDate;
      }
    case 'THOUSAND':
      const todayThousand = convertDateToFormatType('REGULAR', 'THOUSAND', DateTime.local().toFormat('yyyy-MM-dd'));
      const currentCycle = todayThousand.slice(0, 2);
      if (inputDate.length < 4) {
        const paddedDate = `${currentCycle}${padNum(inputDate, 3)}`;
        const regularizedDate = convertDateToFormatType('THOUSAND', 'REGULAR', paddedDate);
        return detectIfFutureDate(regularizedDate)
          ? `${parseInt(currentCycle)-1}${padNum(inputDate, 3)}`
          : paddedDate;
      } else if (inputDate.length === 4) {
        const regularDate = `${currentYear}-${inputDate.slice(0, 2)}-${inputDate.slice(2)}`;
        return detectIfFutureDate(regularDate)
          ? convertDateToFormatType('REGULAR', 'THOUSAND', regularDate.replace(currentYear.toString(), (currentYear-1).toString()))
          : convertDateToFormatType('REGULAR', 'THOUSAND', regularDate);
      } else if (inputDate.length === 6) {
        const regularDate = `20${inputDate.slice(0, 2)}-${inputDate.slice(2, 4)}-${inputDate.slice(4)}`;
        return convertDateToFormatType('REGULAR', 'THOUSAND', regularDate);
      } else {
        return inputDate;
      }
    default:
      return inputDate;
  }
}

export function convertPercentDateFormat(destinationFormat: ReportFormats | 'default', date: string) {
  if (destinationFormat === 'default') {
    console.error('"default" format entered for percent date format. Please provide fallback.');
  }

  if (destinationFormat.indexOf('%') === -1) {
    console.error(`${destinationFormat} does not match percentage format type.`);
  }

  let regularDate = date;
  if (regularDate.length !== 10) {
    // check for shortcut
    switch (regularDate.length) {
      case 1:
      case 2:
      case 3:
      case 5: {
        regularDate = convertDateToFormatType('THOUSAND', 'REGULAR', regularDate);
        break;
      }
      case 4:
      case 6:
      case 8: {
        regularDate = convertShortcutDate('REGULAR', regularDate);
        break;
      }
      default:
        break;
    }
  }
  if (regularDate.length === 8) {
    regularDate = `${regularDate.slice(0,4)}-${regularDate.slice(4,6)}-${regularDate.slice(6)}`;
  }

  switch (destinationFormat.replace(/\s/g, '').replace(/\,/g, '')) {
    case '%b%d':
      return DateTime.fromFormat(regularDate, 'yyyy-MM-dd').toFormat('MMMdd');
    case '%b%d%y':
      return DateTime.fromFormat(regularDate, 'yyyy-MM-dd').toFormat('MMMdd,yy');
    case '%b%d%Y':
      return DateTime.fromFormat(regularDate, 'yyyy-MM-dd').toFormat('MMMdd,yyyy');
    case '%d%b':
      return DateTime.fromFormat(regularDate, 'yyyy-MM-dd').toFormat('ddMMM');
    case '%d%b%y':
      return DateTime.fromFormat(regularDate, 'yyyy-MM-dd').toFormat('ddMMMyy');
    case '%d%b%Y':
      return DateTime.fromFormat(regularDate, 'yyyy-MM-dd').toFormat('ddMMMyyyy');
    case '%d-%m-%y':
      return convertDateToFormatType('REGULAR', 'EUROPEAN', regularDate).slice(0, 9);
    case '%d/%m/%y':
      return convertDateToFormatType('REGULAR', 'EUROPEAN', regularDate).slice(0, 9).replace(/\-/g, '/');
    case '%d-%m-%Y':
      return convertDateToFormatType('REGULAR', 'EUROPEAN', regularDate);
    case '%d/%m/%Y':
      return convertDateToFormatType('REGULAR', 'EUROPEAN', regularDate).replace(/\-/g, '/');
    case '%m-%d':
      return convertDateToFormatType('REGULAR', 'AMERICAN', regularDate).slice(0, 5);
    case '%m/%d':
      return convertDateToFormatType('REGULAR', 'AMERICAN', regularDate).slice(0, 5).replace(/\-/g, '/');
    case '%m-%d-%y':
      return convertDateToFormatType('REGULAR', 'AMERICAN', regularDate).slice(0, 9);
    case '%m/%d/%y':
      return convertDateToFormatType('REGULAR', 'AMERICAN', regularDate).slice(0, 9).replace(/\-/g, '/');
    case '%m-%d-%Y':
      return convertDateToFormatType('REGULAR', 'AMERICAN', regularDate);
    case '%m/%d/%Y':
      return convertDateToFormatType('REGULAR', 'AMERICAN', regularDate).replace(/\-/g, '/');
    case '%j': // 3-digit julian
      return convertDateToFormatType('REGULAR', 'JULIAN', regularDate).slice(2);
    case '%J': // full julian
      return convertDateToFormatType('REGULAR', 'JULIAN', regularDate);
    case '%N': // full newsham
      return convertDateToFormatType('REGULAR', 'NEWSHAM', regularDate);
    case '%n':
    case '%t': // 3-digit thousand or 3-digit newsham (same because cycle is removed)
      return convertDateToFormatType('REGULAR', 'THOUSAND', regularDate).slice(2);
    case '%T': // full thousand
      return convertDateToFormatType('REGULAR', 'THOUSAND', regularDate);
    case '%y-%m-%d': // 2-digit year - month - day
      return regularDate.slice(2);
    case '%y/%m/%d': // 2-digit year / month / day
      return regularDate.slice(2).replace(/\-/g, '/');
    case '%Y-%m-%d':
      return regularDate;
    case '%Y/%m/%d':
      return regularDate.replace(/\-/g, '/');
    default:
      return regularDate;
  }
}
