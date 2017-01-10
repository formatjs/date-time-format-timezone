/*
 * Copyright 2017, Yahoo Inc.
 * Copyrights licensed under the New BSD License.
 * See the accompanying LICENSE file for terms.
 */

/**
 * from triplet of 3 indices resolves as history object
 * @method getHistryFromTriplet
 * @param {Object} with keys timeStamps, offsets, isdst, which are arrays
 * @param {Array} of length 3 where 0 is index of timeStamps and so forth.
 * @return {Objecr} Returns true on success
 */
function getHistoryFromTriplet(indices, triplet) {
    return {
        until: parseInt(indices.timeStamps[parseInt(triplet[0], 32)], 32) * 1000,
        offset: indices.offsets[parseInt(triplet[1], 32)],
        isdst: !!parseInt(triplet[2], 10)
    };
}

/**
 * unpacks historyStringList (comma seperated indices) into array of objects
 * @method unpackHistory
 * @param {Object} with keys timeStamps, offsets, isdst, which are arrays
 * @param {String} historyStringList (comma seperated indices string)
 * @return {Array} Ob objects
 */
function unpackHistory(indices, historyStringList) {
    const history = [],
        historyStrings = historyStringList.split(','),
        count = historyStrings.length;

    if (count % 3 !== 0) {
        console.warn('wrong length of history Array, must be mupltiple of 3');

        return;
    }

    let triplet = [],
        i = 0;

    while (i < count) {
        triplet.push(historyStrings[i]);

        if (triplet.length === 3) {
            history.push(getHistoryFromTriplet(indices, triplet));
            triplet = [];
        }

        i = i + 1;
    }

    if ((historyStrings.length / 3) !== history.length) {
        console.warn('failed to harvest all data!!');

        return;
    }

    return history;
}

let commonUtillity = null;

const CommonUtillity = function(globalSpace){
    this.globalSpace = globalSpace;
};

CommonUtillity.prototype = {
    updateMetaZoneData: function updateMetaZoneData(zones) {
        const globalSpace = this.globalSpace;

        if (!(globalSpace && globalSpace.Intl._metaZoneData)) {
            return;
        }
        const metaZoneData = globalSpace.Intl._metaZoneData;

        let availableMeta = null;
        zones.forEach((zone) => {
            if (metaZoneData.get(zone)) {
                availableMeta = metaZoneData.get(zone);
            }
        });

        const allMetaZoneData = metaZoneData.get();
        zones.forEach((zone) => {
            if (availableMeta && !metaZoneData.get(zone)) {
                allMetaZoneData[zone] = availableMeta;
            }
        });
    }
};


function loadTimeZoneData(json) {
    if (!json ||
        !Array.isArray(json.zoneDefs) ||
        !Array.isArray(json.timeStamps) ||
        !Array.isArray(json.offsets)) {
        console.warn('__loadTimeZoneData: rejected data, data is not in right shape.');

        return;
    }

    const indices = {
        timeStamps: json.timeStamps,
        offsets: json.offsets
    };

    json.zoneDefs.map((zoneDef) => {
        const zoneDefSplit = zoneDef.split('||'),
            zones = zoneDefSplit[0].split(','),
            historyString = zoneDefSplit[1],
            unpackedHistory = unpackHistory(indices, historyString);

        zones.forEach((zone) => {
            this.value[zone] = unpackedHistory;
        });

        if (commonUtillity) {
            commonUtillity.updateMetaZoneData(zones);
        }

        return unpackedHistory;
    });
}

function localeTimeZoneNamesFromQuadruplet(zoneNameDecoder, strSextuplet) {
    const quadruplet = strSextuplet.split('|');

    return {
        long: {
            standard: quadruplet[0].split(',').filter((w) => !!w).map(zoneNameDecoder).join(''),
            daylight: quadruplet[1].split(',').filter((w) => !!w).map(zoneNameDecoder).join('')
        },
        short: {
            standard: quadruplet[2].split(',').filter((w) => !!w).map(zoneNameDecoder).join(''),
            daylight: quadruplet[3].split(',').filter((w) => !!w).map(zoneNameDecoder).join('')
        }
    };
}

function getZoneNameDecoder(zoneNames) {
    return function(w) {
        return zoneNames[parseInt(w, 32)];
    };
}

function loadLocaleData(json) {
    if (!json ||
        !json.locales ||
        !Array.isArray(json.zoneNameIndex)) {
        console.warn('loadLocaleData: rejected data, data is not in right shape.');

        return;
    }

    const zoneNameDecoder = getZoneNameDecoder(json.zoneNameIndex);

    Object.keys(json.locales).forEach((locale) => {
        const metaZones = json.locales[locale].metazone;
        Object.keys(metaZones).forEach((metaZone) => {
            metaZones[metaZone] = localeTimeZoneNamesFromQuadruplet(zoneNameDecoder, metaZones[metaZone]);
        });

        const zones = json.locales[locale].zone;
        Object.keys(zones).forEach((timeZone) => {
            zones[timeZone] = localeTimeZoneNamesFromQuadruplet(zoneNameDecoder, zones[timeZone]);
        });

        this.value[locale] = json.locales[locale];
    });

    Object.keys(json.locales).forEach((locale) => {
        let localeItems = locale.split('-');
        for (let i = 0; i < localeItems.length - 1; i++) {
            let generalLocale = localeItems.slice(0, localeItems.length - i - 1).join('-');

            if (!this.value[generalLocale]) {
                this.value[generalLocale] = this.value[locale];
            }
        }
    });
}

function Loader(loaderFunction) {
    this.value = {};
    this.load = loaderFunction || function(json) {
        this.value = json;
    };
    this.get = function(key) {
        if(key === undefined){
            return this.value;
        }

        return this.value[key];
    };
}

export default function dataloader(globalSpace) {
    if (globalSpace.Intl) {
        commonUtillity = new CommonUtillity(globalSpace);
        globalSpace.Intl._timeZoneData = new Loader(loadTimeZoneData);
        globalSpace.Intl._localeData = new Loader(loadLocaleData);
        globalSpace.Intl._metaZoneData = new Loader();
    }
}