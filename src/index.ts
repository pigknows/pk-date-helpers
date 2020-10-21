import * as dateHelpers from './dateHelpers';

export { getConflictingFormatsForType } from './dateHelpers';

export const convertDateToFormatType: typeof dateHelpers.convertDateToFormatType = (...args) => {
  const [inputFormat, destinationFormat, date] = args;
  const dates = date.split(';');
  const results = dates.map(i => dateHelpers.convertDateToFormatType(inputFormat, destinationFormat, i));

  return results.join(';');
};
export const convertDateToRegularString: typeof dateHelpers.convertDateToRegularString = (...args) => {
  const [inputFormat, date] = args;
  const dates = date.split(';');
  const results = dates.map(i => dateHelpers.convertDateToRegularString(inputFormat, i));

  return results.join(';');
};
export const convertPercentDateFormat: typeof dateHelpers.convertPercentDateFormat = (...args) => {
  const [destinationFormat, date] = args;
  const dates = date.split(';');
  const results = dates.map(i => dateHelpers.convertPercentDateFormat(destinationFormat, i));

  return results.join(';');
};
export const convertShortcutDate: typeof dateHelpers.convertShortcutDate = (...args) => {
  const [formatType, date] = args;
  const dates = date.split(';');
  const results = dates.map(i => dateHelpers.convertShortcutDate(formatType, i));

  return results.join(';');
};
export const detectFormatType: typeof dateHelpers.detectFormatType = (...args) => {
  const [date, preferStandard, ignoreFormats] = args;
  const dates = date.split(';');
  const results = dates.map(i => dateHelpers.detectFormatType(i, preferStandard, ignoreFormats));

  return results.join(';');
};
export const detectIfFutureDate: typeof dateHelpers.detectIfFutureDate = (date) => {
  const dates = date.split(';');
  const results = dates.map(i => dateHelpers.detectIfFutureDate(i));

  return results.every(i => i === true);
};
export const detectIfValidPKDate: typeof dateHelpers.detectIfValidPKDate = (date) => {
  const dates = date.split(';');
  const results = dates.map(i => dateHelpers.detectIfValidPKDate(i));

  return results.every(i => i === true);
};

