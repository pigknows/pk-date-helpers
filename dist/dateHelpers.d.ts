import type { FormatNames, ReportFormats } from './types';
export declare function detectFormatType(date: string, preferStandard?: boolean, ignoreFormats?: string[]): string;
export declare function getConflictingFormatsForType(formatType: FormatNames | ReportFormats): any;
export declare function convertDateToRegularString(inputFormat: FormatNames | ReportFormats, date: string, daysAheadAllowed?: number): string;
export declare function convertDateToFormatType(inputFormatType: FormatNames | ReportFormats, destinationFormatType: FormatNames, date: string, daysAheadAllowed?: number): string;
export declare function detectIfFutureDate(regularDate: any): boolean;
export declare function detectIfValidPKDate(regularDate: any): boolean;
export declare function convertShortcutDate(formatType: FormatNames, date: string, daysAheadAllowed?: number): string;
export declare function convertPercentDateFormat(destinationFormat: ReportFormats | 'default', date: string): string;
