/*
 * Copyright 2017, Yahoo Inc.
 * Copyrights licensed under the New BSD License.
 * See the accompanying LICENSE file for terms.
 */

function getGenericOffset(offset, isShort, locale) {
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
 * To check timezone support we try catching exception once.
 * this is information is cached for subsequent check.
 * @method buildCachedCheckTimeZoneSupport
 * @return {Boolean} Returns true is it has native support.
 */
const buildCachedCheckTimeZoneSupport = function buildCachedCheckTimeZoneSupport(globalScope) {
    const hasSupport = {};

    return function(timeZone) {
        if (hasSupport[timeZone] !== undefined) {
            return hasSupport[timeZone];
        }

        try {
            new globalScope.Intl._DateTimeFormat('en', {
                timeZone: timeZone
            });
            hasSupport[timeZone] = true;
        } catch (exp) {
            hasSupport[timeZone] = false;
        }

        return hasSupport[timeZone];
    };
};

function getRelevantMetaZone(metaNameData, timeStamp, offsetString) {
    if (!Array.isArray(metaNameData)) {
        return null;
    }

    if (metaNameData.length === 1) {
        return metaNameData[0].mzone;
    }

    const minTs = Math.pow(2, 31) * -1000,
        maxTs = Math.pow(2, 31) * 1000;

    let mzone = null;

    metaNameData.forEach((metaName) => {
        const fromVal = metaName.from ? new Date(metaName.from + offsetString).getTime() : minTs;
        const toVal = metaName.to ? new Date(metaName.to + offsetString).getTime() : maxTs;

        if (fromVal <= timeStamp && timeStamp <= toVal) {
            mzone = metaName.mzone;
        }
    });

    return mzone;
}

/**
 * With input timeZoneHistory and date it will pull out relevant history item.
 * @method getRelevantHist
 * @param {Array} timeZoneHistory
 * @param {Date} date
 * @return {Object} Relevant History {isdst , offset, untill}
 */
function getRelevantHist(timeZoneHistory, date) {
    const ts = date.getTime();
    const offsetHist = timeZoneHistory.reduce((find, hist) => ((hist.until >= ts && find===null) ? hist : find), null);

    return offsetHist ? offsetHist : timeZoneHistory[timeZoneHistory.length - 1];
}

function pickZoneName(isShort, isdst, zoneNames) {
    if (!isShort && zoneNames.long) {
        if (isdst && zoneNames.long.daylight) {
            return zoneNames.long.daylight;
        } else if (!isdst && zoneNames.long.standard) {
            return zoneNames.long.standard;
        }
    } else if (zoneNames.short) {
        if (isdst && zoneNames.short.daylight) {
            return zoneNames.short.daylight;
        } else if (!isdst && zoneNames.short.standard) {
            return zoneNames.short.standard;
        }
    }

    return false;
}

/**
 * Returns ZoneName for provided value
 * @method getZoneNameForLocale
 * @param {Object} locale, timeZone, offset, isdst, isShort, timeStamp
 * @return {String} Returns zoneName
 */
function getZoneNameForLocale({locale, timeZone, offset, isdst, isShort, timeStamp}) {
    const metaNameData = Intl._metaZoneData.get(timeZone),
        metaZoneName = getRelevantMetaZone(metaNameData, timeStamp, getGenericOffset(offset)),
        timeZoneNames = Intl._localeData.get(locale),
        metaZone = (metaZoneName && timeZoneNames && timeZoneNames.metazone[metaZoneName]),
        zone = (timeZoneNames && timeZoneNames.zone && timeZoneNames.zone[timeZone]);

    if (zone && pickZoneName(isShort, isdst, zone)) {
        return pickZoneName(isShort, isdst, zone);
    } else if (metaZone && pickZoneName(isShort, isdst, metaZone)) {
        return pickZoneName(isShort, isdst, metaZone);
    } else if (timeZoneNames && timeZoneNames.gmtFormat && offset) {
        timeZoneNames.gmtFormat.replace('{0}', getGenericOffset(offset, isShort, locale));
    } else if (timeZoneNames && timeZoneNames.gmtZeroFormat && !offset) {
        return timeZoneNames.gmtZeroFormat;
    }

    return (offset && ['GMT', getGenericOffset(offset, isShort, locale)].join('')) || 'GMT';
}

export {
    buildCachedCheckTimeZoneSupport,
    getRelevantHist,
    getZoneNameForLocale
};