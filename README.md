# PigKnows Date Helpers

Supports conversions from all of PigKnows date formats from any format into any other format.

## Supported Standard Formats:
1. American (MM-dd-yyyy)
2. European (dd-MM-yyyy)
3. ISO / Regular (yyyy-MM-dd)
4. Julian (yy-ooo) -- o meaning ordinal, or day out of 365
5. Newsham (5 digit and 3 digit)
6. Thousand (5 digits and 3 digit)

## Supported % Formats: (case sensitive)
1. '%b%d' - Jan02
2. '%b%d%y' - Jan02,18
3. '%b%d%Y' - Jan02,2018
4. '%d%b' - 02Jan
5. '%d%b%y' - 02Jan18
6. '%d%b%Y' - 02Jan2018
7. '%d-%m-%y' - 02-01-18
8. '%d-%m-%Y' - 02-02-2018
9. '%d/%m/%y' - 02/01/18
10. '%d/%m/%Y' - 02-01/2018
11. '%m/%d' - 01/02
12. '%m/%d/%y' - 01/02/18
13. '%m/%d/%Y' - 01/02/2018
14. '%m-%d' - 01-02
15. '%m-%d-%y' - 01-02-18
16. '%m-%d-%Y' - 01-02-2018
17. '%j' - 002 (3 digit Julian)
18. '%J' - 18-002 (5 digit Julian)
19. '%N' - 11899 (5 digit Newsham)
20. '%n' - 899 (3 digit Newsham)
21. '%t' - 899 (3 digit Thousand)
22. '%T' - 16899 (5 digit Thousand)
24. '%y-%m-%d' - 18-01-02
25. '%Y-%m-%d' - 2018-01-02
26. '%y/%m/%d' - 18/01/02
27. '%Y/%m/%d' - 2018/01/02

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

NOTE: `inputFormat` can be in either a standard format (i.e. 'REGULAR', 'NEWSHAM', etc) or Report / percent format.

#### convertPercentDateFormat
Used for % style date formats instead of the string formats ("European", "THOUSAND", etc.). Used exclusively for reporting at this point in time. Requires that the input be in Regular format, or one of 7 supported shortcuts.

    Usage:

    import { convertPercentDateFormat } from 'pk-date-helpers';

    ...

    const newRegularString = convertPercentDateFormat(destinationFormat, regularStringToConvert); // outputs in destination format

##### 7 supported shortcuts:
Shortcuts supported: 1,2,3,4,5,6 or 8.

- "1 digit" Thousand day is translated into the Regular date value. (i.e. if I type in 1, then the system will translate that into 2018-04-14

- "2 digits" Thousand day is again translated into the Regular date value (i.e.if I type in 10, it gets translated into 2018-04-23)

- "3 digits" Thousand day is again translated into the Regular date value (i.e. if I type in 100, it gets translated into 2018-07-22)

- "4 digits" Translates the MMDD into the current Regular date year format

- "5 digits" Thousand day is translated into Regular date format (i.e. if I type in 17001, then the system translates that into 2018-04-14)

- "6 digits" This is a Regular date format shortcut that allows you to enter a previous year (i.e. like YYMMDD, so 170101 would be translated into 2017-01-01)

- "8 digits" this shortcut allows YYYYMMDD to be translated into Regular date format (i.e. if I enter 20170101, it will be translated into 2017-01-01).

#### convertShortcutDate
Converts a shortcut of any format into its long form. For example, converting `0101` (a regular shortcut) into `2018-01-01`.

    Usage:

    import { convertShortcutDate } from 'pk-date-helpers';

    ...

    const fullFormat = convertShortcutDate(inputAndOutputFormat, stringToConvert);

** Note: `convertShortcutDate` should be wrapped in a try/catch in case an invalid number of characters is thrown in for a format, since it will throw errors. For example, inputting '123' as a shortcut for a 'REGULAR' date will throw `123 does match 'REGULAR' format or any of its shortcuts`.

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

### detectIfFutureDate
This returns true / false for if the date is in the future.

### detectValidPKDate
This returns true / false for if the date is valid according to PigKnows rules. For example, any years prior to 1900, Feb 31, a month '14', etc.

#### getConflictingFormatsForType
Returns an array of formats that may appear the same from a regex / structure perspective. Useful for finding the third parameter in `detectFormatType` above.

    Usage:

    import { getConflictingFormatsForType } from 'pk-date-helpers';

    ...

    const ignoreStandardFormats = getConflictingFormatsForType('THOUSAND'); // returns ['NEWSHAM']
    const ignoreReportFormats = getConflictingFormatsForType('%y-%m-%d'); // returns ['%d-%m-%y', '%m-%d-%y']

Supported Shortcuts (standard formats only):

```
6-digit date (either dd/mm/yy, mm/dd/yy, or yy/mm/dd):
- If 'ignoredFormats' includes *both* of the 2 possible conflicts (i.e. 'AMERICAN', 'EUROPEAN' for 'REGULAR'), then this will detect properly. If you do not pass in these possible conflicts, it will fail. Conflicts detected for Julian, for example, will return 'INVALID DATE' with this shortcut because it does not know which format is intended.

1, 2, 3, and 5-digit shortcuts
- Order of Preference: Thousand, Julian, Newsham
- By default, one of these shortcuts will return 'THOUSAND', unless 'THOUSAND' is added to 'ignoredFormat'. The same applies to Julian and Newsham, but 'ignoredFormats' must include 'THOUSAND' to reach 'JULIAN', and 'ignoredFormats' must include both 'THOUSAND' and 'JULIAN' to reach 'NEWSHAM'.


NOTE: Shortcut conflicts do not have perfect detection, as there are many conflicts.
