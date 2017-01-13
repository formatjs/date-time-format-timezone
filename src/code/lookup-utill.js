/*
 * Copyright 2017, Yahoo Inc.
 * Copyrights licensed under the New BSD License.
 * See the accompanying LICENSE file for terms.
 */

/**
* returns GMT+<offset> string. formatted as per CLDR spec.
* @method getGenericZoneName
* @param {Number} offset: actual offset from GMT
* @param {Boolean} isShort: is this short timeZoneName or long
* @param {String} locale: string to be used for number formatting. e.g. 'en-IN'
* @return {String} e.g. "GMT+10"
*/
function getGenericZoneName(offset, isShort, locale) {
    const offsetSign = offset < 0 ? '-' : '+',
        hourVal = Math.floor(Math.abs(offset / 60)),
        minuteVal = Math.abs(offset % 60);

    let hour = Intl.NumberFormat(locale, {
        minimumIntegerDigits: (isShort ? 1 : 2)
    }).format(hourVal);

    let minute = Intl.NumberFormat(locale, {
        minimumIntegerDigits: 2
    }).format(minuteVal);

    if (offset === 0) {
        return '';
    }

    if (isShort && minuteVal === 0) {
        minute = '';
    }

    return offsetSign + hour + (minute ? (':') : ('')) + minute;
}

/**
* returns metazone name.
* finds up metaZoneIn in metaNameData Array which fits dataRange of timeStamp.
* @method getRelevantMetaZone
* @param {Object} metaNameData (value of loaded metaZone data i.e. Intl._metaZoneData.value)
* @param {Number} timeStamp jsStyle timestamp e.g. Date.now()
* @param {String} offsetString like GMT+10
* @return {String} metaZoneName e.g. Europe_Central
*/
function getRelevantMetaZone(metaNameData, timeStamp, offsetString) {
    if (!Array.isArray(metaNameData)) {
        return null;
    }

    if (metaNameData.length === 1) {
        return metaNameData[0].mzone;
    }

    const minTs = Math.pow(2, 31) * -1000;
    const maxTs = Math.pow(2, 31) * 1000;

    let mzone = null;

    metaNameData.forEach(metaName => {
        const fromVal = metaName.from ? new Date(metaName.from + offsetString).getTime() : minTs;
        const toVal = metaName.to ? new Date(metaName.to + offsetString).getTime() : maxTs;

        if (fromVal <= timeStamp && timeStamp <= toVal) {
            mzone = metaName.mzone;
        }
    });

    return mzone;
}

/**
* returns a zoneName from cldrZoneNames.
* @method pickZoneName
* @param {Boolean} isShort if true format should be short
* @param {Boolean} isdst if true mean format should be daylight
* @param {Object} CLDR cldrZoneNames, an object e.g.  {long: {standard: '.', daylight: '.'}, ..}
* @return {String} ZoneName or false if not found.
*/
function pickZoneName(isShort, isdst, cldrZoneNames) {
    if (!isShort && cldrZoneNames.long) {
        if (isdst && cldrZoneNames.long.daylight) {
            return cldrZoneNames.long.daylight;
        } else if (!isdst && cldrZoneNames.long.standard) {
            return cldrZoneNames.long.standard;
        }
    } else if (cldrZoneNames.short) {
        if (isdst && cldrZoneNames.short.daylight) {
            return cldrZoneNames.short.daylight;
        } else if (!isdst && cldrZoneNames.short.standard) {
            return cldrZoneNames.short.standard;
        }
    }

    return false;
}

/**
 * With input timeZoneHistory and date it will pull out relevant history item.
 * @method getTimeZoneOffsetInfo [EXPORTED]
 * @param {Array} timeZoneHistory : An array of ianaTimeZoneHistoryItem
 * @param {Date} date: date for which history is required
 * @return {ianaTimeZoneHistoryItem} Relevant History {isdst , offset, untill}
 * e.g. {
       until:  4434454543,  // Timestamp untill when this offset is valid
       offset: 555,         // Offset from GMT in minutes
       isdst:  true         // Is this Day light saving?
    }
 */
function getTimeZoneOffsetInfo(timeZoneHistory, date) {
    const ts = date.getTime();
    const offsetHist = timeZoneHistory.reduce((find, hist) => ((hist.until >= ts && find === null) ? hist : find), null);
    // in timeZoneHistory Array find enrty which has until >= timestamp of date we are looking for.
    // Array.find can make this look simple. but not supported  on IE.
    return offsetHist ? offsetHist : timeZoneHistory[timeZoneHistory.length - 1];
}

/**
 * Returns ZoneName for provided value
 * follows logic decribed here http://www.unicode.org/reports/tr35/tr35-dates.html#Using_Time_Zone_Names
 * @method getZoneNameForLocale [EXPORTED]
 * @param {Object} locale, ianaTimeZone, offset, isdst, isShort, timeStamp
 * @return {String} Returns zoneName e.g. 'Pacific Standard Time'
 */
function getZoneNameForLocale({locale, ianaTimeZone, offset, isdst, isShort, timeStamp}) {
    const metaZoneName = getRelevantMetaZone(Intl._metaZoneData.get(ianaTimeZone), timeStamp, getGenericZoneName(offset));
    const cldrZones = Intl._localeData.get(locale);
    const cldrZoneNamesThruMetaZone = (metaZoneName && cldrZones && cldrZones.metazone[metaZoneName]);
    const cldrZoneNamesThruIanaTimeZone = (cldrZones && cldrZones.zone && cldrZones.zone[ianaTimeZone]);

    if (cldrZoneNamesThruIanaTimeZone && pickZoneName(isShort, isdst, cldrZoneNamesThruIanaTimeZone)) {
        // 1. Pick up thru ianaZone first
        return pickZoneName(isShort, isdst, cldrZoneNamesThruIanaTimeZone);
    } else if (cldrZoneNamesThruMetaZone && pickZoneName(isShort, isdst, cldrZoneNamesThruMetaZone)) {
        // 2. Pick up from metaZone after ianaZone
        return pickZoneName(isShort, isdst, cldrZoneNamesThruMetaZone);
    } else if (cldrZones && cldrZones.gmtFormat && offset) {
        // 3. Fallback to generic (if offset is non-zero)
        cldrZones.gmtFormat.replace('{0}', getGenericZoneName(offset, isShort, locale));
    } else if (cldrZones && cldrZones.gmtZeroFormat && !offset) {
        // 4. Fallback to gmtZeroFormat if offset is zero
        return cldrZones.gmtZeroFormat;
    }

    // 5. fallback generic GMT format i.g. GTM+10
    return (offset && ['GMT', getGenericZoneName(offset, isShort, locale)].join('')) || 'GMT';
}

/**
 * To check ianaTimeZone support we try catching exception once.
 * this is information is cached for subsequent check.
 * @method buildCachedCheckTimeZoneSupport [EXPORTED]
 * @return {Boolean} Returns true if it has native support.
 */
const buildCachedCheckTimeZoneSupport = function buildCachedCheckTimeZoneSupport(globalScope) {
    const hasSupport = {};

    return function(ianaTimeZone) {
        if (hasSupport[ianaTimeZone] !== undefined) {
            return hasSupport[ianaTimeZone];
        }

        try {
            new globalScope.Intl._DateTimeFormat('en', {
                timeZone: ianaTimeZone
            });
            hasSupport[ianaTimeZone] = true;
        } catch (exp) {
            hasSupport[ianaTimeZone] = false;
        }

        return hasSupport[ianaTimeZone];
    };
};

export {
    buildCachedCheckTimeZoneSupport,
    getTimeZoneOffsetInfo,
    getZoneNameForLocale
};
