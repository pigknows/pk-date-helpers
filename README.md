# PigKnows Date Helpers

Supports conversions from all of PigKnows date formats from any format into any other format.

## Supported Formats:
1. American (MM-dd-yyyy)
2. European (dd-MM-yyyy)
3. ISO / Regular (yyyy-MM-dd)
4. Julian (yy-ooo) -- o meaning ordinal, or day out of 365
5. Newsham (5 digit and 3 digit)
6. Regular / ISO (yyyy-MM-dd)
7. Thousand (5 digits and 3 digit)

## Available Methods:

#### convertDateToFormatType
    Usage:

    import { convertDateToFormatType } from 'pk-date-helpers';

    ...

    const newDate = convertDateToFormatType(inputFormat, destinationFormat, stringToConvert); // outputs in specified destination format

#### convertDateToRegularString
    Usage:

    import { convertDateToRegularString } from 'pk-date-helpers';

    ...

    const newRegularString = convertDateToRegularString(inputFormat, stringToConvert); // outputs in yyyy-MM-dd format

#### convertPercentDateFormat
Used for % style date formats instead of the string formats ("European", "THOUSAND", etc.). Used exclusively for reporting at this point in time. Requires that the input be in Regular format.

    Usage:

    import { convertPercentDateFormat } from 'pk-date-helpers';

    ...

    const newRegularString = convertPercentDateFormat(destinationFormat, regularStringToConvert); // outputs in destination format

#### convertShortcutDate
Converts a shortcut of any format into its long form. For example, converting `0101` (a regular shortcut) into `2018-01-01`.

    Usage:

    import { convertShortcutDate } from 'pk-date-helpers';

    ...

    const fullFormat = convertShortcutDate(inputAndOutputFormat, stringToConvert);

#### detectFormatType
Detects the format of a string, if it matches a known date format. Optional parameters guide the detection to ignore any conflicting formats.

    Usage:

    import { detectFormatType } from 'pk-date-helpers';

    ...

    const generalDetection = detectFormatType(dateString, preferStandardFormats?, arrayOfFormatsToIgnore?);

    // examples:
    const detectAStandardFormat = detectFormatType('17001', true, ['THOUSAND']); // ignoring thousand, as this is probably newsham
    const detectNonStandardFormat = detectFormatType('001', false, ['%n', '%t']); // ignoring %n and %t as this is probably %j

Note that shortcuts *are not* supported for detection. You must use the full version of any format for accurate detection.

#### getConflictingFormatsForType
Returns an array of formats that may appear the same from a regex / structure perspective. Useful for finding the third parameter in `detectFormatType` above.

    Usage:

    import { getConflictingFormatsForType } from 'pk-date-helpers';

    ...

    const ignoreStandardFormats = getConflictingFormatsForType('THOUSAND'); // returns ['NEWSHAM']
    const ignoreReportFormats = getConflictingFormatsForType('%y-%m-%d'); // returns ['%d-%m-%y', '%m-%d-%y']

NOTE: This method *will not* detect shortcut conflicts. This is used for full formats only.
