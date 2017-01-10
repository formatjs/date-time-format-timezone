/*
 * Copyright 2017, Yahoo Inc.
 * Copyrights licensed under the New BSD License.
 * See the accompanying LICENSE file for terms.
 */

import {
    buildCachedCheckTimeZoneSupport,
    getRelevantHist,
    getZoneNameForLocale
} from './lookup-utill.js';

export default function polyfill(globalSpace) {
    if (!(globalSpace.Intl && globalSpace.Intl.DateTimeFormat && !globalSpace.Intl._DateTimeFormatTimeZone)) {
        return;
    }

    const gIntl = globalSpace.Intl,
        gDate = globalSpace.Date,
        checkTimeZoneSupport = buildCachedCheckTimeZoneSupport(globalSpace),
        jsonClone = function(o) {
            return JSON.parse(JSON.stringify(o));
        };

    gIntl._DateTimeFormat = gIntl.DateTimeFormat;

    gIntl._DateTimeFormatTimeZone = {
        checkTimeZoneSupport: checkTimeZoneSupport
    };

    gIntl.DateTimeFormat = function DateTimeFormat(locale, options) {
        const timeZone = (options && options.timeZone) || 'UTC';

        if (options === undefined) {
            return new gIntl._DateTimeFormat(locale, options);
        }

        if (checkTimeZoneSupport(timeZone)) {
            return new gIntl._DateTimeFormat(locale, options);
        }

        const timeZoneHistory = gIntl._timeZoneData.get(timeZone);

        if (!timeZoneHistory) {
            throw new RangeError(`invalid time zone in DateTimeFormat():  ${timeZone}`);
        }

        const tsOption = jsonClone(options);
        tsOption.timeZone = 'UTC';
        this._tsDateTimeFormat = new gIntl._DateTimeFormat(locale, tsOption);
        const resolvedLocale = this._tsDateTimeFormat.resolvedOptions().locale;

        if (!(gIntl._localeData.get(resolvedLocale) && Intl._metaZoneData.get(timeZone))) {
            if (options.timeZoneName) {
                throw new RangeError(`unsupported value "${options.timeZoneName}" for timeZone ${timeZone}. requires locale data for ${resolvedLocale}`);
            }
        } else {
            this._isShort = (options.timeZoneName === 'short');
            this._replaceTimeZone = (options.timeZoneName !== undefined);
        }

        this._resolvedLocale = resolvedLocale;
        this._timeZone = timeZone;
        this._timeZoneHist = timeZoneHistory;

        return this;
    };

    gIntl.DateTimeFormat.supportedLocalesOf = gIntl._DateTimeFormat.supportedLocalesOf;

    gIntl.DateTimeFormat.prototype = {
        format: function format(date) {
            const hist = getRelevantHist(this._timeZoneHist, date),
                timeZoneOffset = hist.offset * 60000,
                shiftedDate = new Date(date.getTime() + timeZoneOffset),
                UTCFormat = this._tsDateTimeFormat.format(shiftedDate);

            if (this._replaceTimeZone) {
                const timeZoneName = getZoneNameForLocale({
                        locale: this._resolvedLocale,
                        timeZone: this._timeZone,
                        isdst: hist.isdst,
                        offset: hist.offset,
                        timeStamp: date.getTime(),
                        isShort: this._isShort
                    }),
                    timeZoneNameUTC = getZoneNameForLocale({
                        locale: this._resolvedLocale,
                        timeZone: 'UTC',
                        isdst: false,
                        offset: 0,
                        timeStamp: date.getTime(),
                        isShort: this._isShort
                    });

                if (UTCFormat.indexOf(timeZoneNameUTC) < 0) {
                    return UTCFormat.trim() + ' ' + timeZoneName;
                }

                return UTCFormat.replace(timeZoneNameUTC, timeZoneName);
            }

            return UTCFormat;
        },
        resolvedOptions: function resolvedOptions() {
            const options = jsonClone(this._tsDateTimeFormat.resolvedOptions());

            options.timeZone = this._timeZone;

            return options;
        }
    };

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
            options = jsonClone(options);
            options.hour = defaultTimeOption.hour;
            options.minute = defaultTimeOption.minute;
            options.second = defaultTimeOption.second;
        }

        return (new gIntl.DateTimeFormat(locale, options)).format(this);
    };
}
