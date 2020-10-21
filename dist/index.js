"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.detectIfValidPKDate = exports.detectIfFutureDate = exports.detectFormatType = exports.convertShortcutDate = exports.convertPercentDateFormat = exports.convertDateToRegularString = exports.convertDateToFormatType = exports.getConflictingFormatsForType = void 0;
var dateHelpers = __importStar(require("./dateHelpers"));
var dateHelpers_1 = require("./dateHelpers");
Object.defineProperty(exports, "getConflictingFormatsForType", { enumerable: true, get: function () { return dateHelpers_1.getConflictingFormatsForType; } });
exports.convertDateToFormatType = function () {
    var args = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        args[_i] = arguments[_i];
    }
    var inputFormat = args[0], destinationFormat = args[1], date = args[2];
    var dates = date.split(';');
    var results = dates.map(function (i) { return dateHelpers.convertDateToFormatType(inputFormat, destinationFormat, i); });
    return results.join(';');
};
exports.convertDateToRegularString = function () {
    var args = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        args[_i] = arguments[_i];
    }
    var inputFormat = args[0], date = args[1];
    var dates = date.split(';');
    var results = dates.map(function (i) { return dateHelpers.convertDateToRegularString(inputFormat, i); });
    return results.join(';');
};
exports.convertPercentDateFormat = function () {
    var args = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        args[_i] = arguments[_i];
    }
    var destinationFormat = args[0], date = args[1];
    var dates = date.split(';');
    var results = dates.map(function (i) { return dateHelpers.convertPercentDateFormat(destinationFormat, i); });
    return results.join(';');
};
exports.convertShortcutDate = function () {
    var args = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        args[_i] = arguments[_i];
    }
    var formatType = args[0], date = args[1];
    var dates = date.split(';');
    var results = dates.map(function (i) { return dateHelpers.convertShortcutDate(formatType, i); });
    return results.join(';');
};
exports.detectFormatType = function () {
    var args = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        args[_i] = arguments[_i];
    }
    var date = args[0], preferStandard = args[1], ignoreFormats = args[2];
    var dates = date.split(';');
    var results = dates.map(function (i) { return dateHelpers.detectFormatType(i, preferStandard, ignoreFormats); });
    return results.join(';');
};
exports.detectIfFutureDate = function (date) {
    var dates = date.split(';');
    var results = dates.map(function (i) { return dateHelpers.detectIfFutureDate(i); });
    return results.every(function (i) { return i === true; });
};
exports.detectIfValidPKDate = function (date) {
    var dates = date.split(';');
    var results = dates.map(function (i) { return dateHelpers.detectIfValidPKDate(i); });
    return results.every(function (i) { return i === true; });
};
//# sourceMappingURL=index.js.map