/*
 * Copyright 2017, Yahoo Inc.
 * Copyrights licensed under the New BSD License.
 * See the accompanying LICENSE file for terms.
 */

import {
    buildCachedCheckTimeZoneSupport,
    getTimeZoneOffsetInfo,
    getZoneNameForLocale
} from './lookup-utill.js';

/**
* Pollyfill ECMA402 DateTimeFormat
* https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/DateTimeFormat/format
* https://tc39.github.io/ecma402/#sec-Intl.DateTimeFormat.prototype.format
*/
export default function polyfill(globalSpace) {
    if (!(globalSpace.Intl && globalSpace.Intl.DateTimeFormat && !globalSpace.Intl._DateTimeFormatTimeZone)) {
        return;
    }

    const gIntl = globalSpace.Intl;
    const gDate = globalSpace.Date;
    const checkTimeZoneSupport = buildCachedCheckTimeZoneSupport(globalSpace);
    const jsonClone = function(o) {
        return JSON.parse(JSON.stringify(o));
    };

    gIntl._DateTimeFormat = gIntl.DateTimeFormat;

    gIntl._DateTimeFormatTimeZone = {
        checkTimeZoneSupport: checkTimeZoneSupport
    };

    class DateTimeFormatPolyfill extends gIntl._DateTimeFormat {

        constructor(locale, options) {
            const timeZone = (options && options.timeZone) || 'UTC';

            if (options === undefined) {
                // options is not provided. this means
                // we don't need to format arbitrary timezone
                super(locale, options);

                return;
            }

            if (checkTimeZoneSupport(timeZone)) {
                // native method has support for timezone. no polyfill logic needed.
                super(locale, options);

                return;
            }

            const timeZoneData = gIntl._timeZoneData.get(timeZone);

            // check if we have timezone data for this timezone
            if (!timeZoneData) {
                throw new RangeError(`invalid time zone in DateTimeFormat():  ${timeZone}`);
            }

            // Do a timeshift to UTC to avoid explosion due to unsupprted timezone.
            const tsOption = jsonClone(options);
            tsOption.timeZone = 'UTC';
            super(locale, tsOption);

            const resolvedLocale = super.resolvedOptions().locale;

            if (options.timeZoneName !== undefined) {
                // We need to include timeZoneName in date format.
                // Check if we have locale data to able to do that.
                if (!(gIntl._localeData.get(resolvedLocale) && // availability of localedata
                        Intl._metaZoneData.get(timeZone))) {   // availability of metaZone for this timeZone
                    throw new RangeError(`unsupported value "${options.timeZoneName}" for timeZone ${timeZone}. requires locale data for ${resolvedLocale}`);
                }
            }

            // to minimize pollution everything we need to perform polyfill is wrapped under one object.
            this._dateTimeFormatPolyfill = {
                optionTimeZone: timeZone,
                optionTimeZoneName: options.timeZoneName,
                timeZoneData: timeZoneData
            };

            return this;
        }

        supportedLocalesOf() {
            // there is no need to modify behaviour of this function.
            return super.supportedLocalesOf();
        }

        format(date) {
            if (!this._dateTimeFromatPolyfill) {
                return super.format(date);
            }

            if (date === null || date === undefined) {
                date = new Date();
            }

            if (!(date instanceof Date)) {
                date = new Date(date);
            }

            const polyfill = this._dateTimeFromatPolyfill;
            const timeZoneOffsetInfo = getTimeZoneOffsetInfo(polyfill.timeZoneData, date);
            const timeZoneOffset = timeZoneOffsetInfo.offset * 60000;
            const shiftedDate = new Date(date.getTime() + timeZoneOffset); // We need to  format time by offseting it
            const shiftedFormat = super.format(shiftedDate); // offseted or shifted format
            const resolvedLocale = super.resolvedOptions().locale;
            const doNeedToReplaceTimeZoneName = (polyfill.optionTimeZoneName !== undefined);

            if (doNeedToReplaceTimeZoneName) {
                /*
                    Since our timeshifted native format will only return UTC timeZone Name e.g. "1/31/2017, 6:39:55 PM GMT"
                    We have to replace GMT that with actual timezone name. like "Pacific Standard Time"
                    This is achived by replacing timeZoneNameUTC with timeZoneName
                */
                const isShort = (polyfill.optionTimeZoneName === 'short');
                const timeZoneName = getZoneNameForLocale({
                        locale: resolvedLocale,
                        ianaTimeZone: polyfill.optionTimeZone,
                        isdst: timeZoneOffsetInfo.isdst,
                        offset: timeZoneOffsetInfo.offset,
                        timeStamp: date.getTime(),
                        isShort: isShort
                    });
                const timeZoneNameUTC = getZoneNameForLocale({
                    locale: resolvedLocale,
                    ianaTimeZone: 'UTC',
                    isdst: false,
                    offset: 0,
                    timeStamp: date.getTime(),
                    isShort: isShort
                });

                if (shiftedFormat.indexOf(timeZoneNameUTC) < 0) {
                    return shiftedFormat.trim() + ' ' + timeZoneName;
                }

                return shiftedFormat.replace(timeZoneNameUTC, timeZoneName);
            }

            return shiftedFormat;
        }

        resolvedOptions() {
            if (this._dateTimeFormatPolyfill) {
                // since we have altered timezone option for super.
                // we need to correct that before returing.
                const options = jsonClone(super.resolvedOptions());
                options.timeZone = this._dateTimeFormatPolyfill.optionTimeZone;

                return options;
            }

            return super.resolvedOptions();
        }
    }

    gIntl.DateTimeFormat = DateTimeFormatPolyfill;

    /*
        Following function needs to be reimplemented to get binding to our polyfill.
        else internally they will use native DateTimeFormat.
    */
    gDate.prototype.toLocaleString = function(locale, options) {
        const defaultLocaleOption = {
            day: 'numeric',
            month: 'numeric',
            year: 'numeric',
            hour: 'numeric',
            minute: 'numeric',
            second: 'numeric'
        };

        if (options === undefined) {
            options = jsonClone(defaultLocaleOption);
        }

        if (options.day === undefined &&
            options.month === undefined &&
            options.year === undefined &&
            options.hour === undefined &&
            options.minute === undefined &&
            options.second === undefined) {
            // localeString must contain one or more from defaultLocaleOption
            // if none is specified we should fallback to to choose all from defaultLocaleOption
            options = jsonClone(options);
            options.day = defaultLocaleOption.day;
            options.month = defaultLocaleOption.month;
            options.year = defaultLocaleOption.year;
            options.hour = defaultLocaleOption.hour;
            options.minute = defaultLocaleOption.minute;
            options.second = defaultLocaleOption.second;
        }

        return (new gIntl.DateTimeFormat(locale, options)).format(this);
    };

    gDate.prototype.toLocaleDateString = function(locale, options) {
        const defaultDateOption = {
            day: 'numeric',
            month: 'numeric',
            year: 'numeric'
        };

        if (options === undefined) {
            options = jsonClone(defaultDateOption);
        }

        if (options.day === undefined &&
            options.month === undefined &&
            options.year === undefined) {
            // LocaleDateString must contain one or more from day, month & year
            // if none is specified we should fallback to to choose day, month and year
            options = jsonClone(options);
            options.day = defaultDateOption.day;
            options.month = defaultDateOption.month;
            options.year = defaultDateOption.year;
        }

        return (new gIntl.DateTimeFormat(locale, options)).format(this);
    };

    gDate.prototype.toLocaleTimeString = function(locale, options) {
        const defaultTimeOption = {
            hour: 'numeric',
            minute: 'numeric',
            second: 'numeric'
        };

        if (options === undefined) {
            options = jsonClone(defaultTimeOption);
        }

        if (options.hour === undefined &&
            options.minute === undefined &&
            options.second === undefined) {
            // toLocaleTimeString must contain one or more from hour, minute & second
            // if none is specified we should fallback to to choose hour, minute and second
            options = jsonClone(options);
            options.hour = defaultTimeOption.hour;
            options.minute = defaultTimeOption.minute;
            options.second = defaultTimeOption.second;
        }

        return (new gIntl.DateTimeFormat(locale, options)).format(this);
    };
}
