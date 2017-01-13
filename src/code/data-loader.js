/*
 * Copyright 2017, Yahoo Inc.
 * Copyrights licensed under the New BSD License.
 * See the accompanying LICENSE file for terms.
 */

/*
    This module contains methods which loads dataFiles.
    We have 3 kinds of data files.
    packedTzData       (tzdata.js)  : Contains history list of each ianaTimeZones which defines offset for given time.
    packedCLDRZoneData (locale.js)  : Contains timeZone names for [locale X ianaTimeZones X isDST] combination
    metaZoneMap        (metazone.js): Contains mapping from ianaTimeZone to metaZone defined by CLDR.

    Here are few terma
    ianaTimeZone                    : timezone names defined by iana. this is a standard e.g. Europe/Dublin
    metaZone                        : A metazone is an grouping of one or more internal TZIDs (bit.ly/clrdmetazone)

Here is a quick diagram to show you how loading works for 3 different files.

============================================================================================================================================
    1. TIME ZONE DATA FILE AND IN-MEMORY FORMAT (packedTzData)
       see function loadTimeZoneData
+------------------------------------------------------+            +------------------------------------------------+
|                                                      |            |                                                |
|                                                      |            |  globalSpace.Intl._metaZoneData.value = {      |
|    global.Intl._timeZoneData.load({                  |            |   timeZoneA: [{                                |
|       "zoneDefs": [                 [all base32 num] |            |       until: 1234567891011,                    |
|            "timeZoneA||0,0,0,1,1,1,2,0,0",           |            |       offset: 481,                             |
|            "timeZoneB||............................."|            |       idst: false                              |
|        ],                    ^ ^ ^                   |            |   }, {                                         |
|        "timeStamps": [       | | |                   |----->>-----|       until: 1110987654321,                    |
|            "13tovm223",      | | |                   |----->>-----|       offset: 400,                             |
|            "10am0ch5h",      | | |                   |            |       idst: true                               |
|            "620q4oqla" <-----+ | |                   |            |   }, {                                         |
|        ],              base32  | |                   |            |       until: 6666666666666,                    |
|        "offsets": [            | |                   |            |       offset: 481,                             |
|            481, <--------------+ |                   |            |       idst: false                              |
|            400                   V                   |            |   }],                                          |
|        ]                        isdst                |            |   timeZoneB: [...]                             |
|    });                                               |            |       ...: [...]                               |
|                                                      |            |  }                                             |
|                                                      |            |                                                |
+------------------------------------------------------+            +------------------------------------------------+
                   FILE                                                      ACTUAL DATA (IN MEMORY + ORIGINAL)

1. Get all zones from zoneDefs
2. For each zoneName split the string in triplets
3. Extract until, offset and idst from triplets.
    e.g. 0,0,0 ==> {until: 13tovm223, offset:481, isdst:flase} ==> {until: 1234567891011, offset:481, isdst:flase}
============================================================================================================================================


============================================================================================================================================
   2. LOCALE DATA FILE AND IN-MEMORY FORMAT (packedCLDRZoneData)
      see function Loader.load (generic loader)
                                                                     +-----------------------------------------------------------------+
                                                                     |                                                                 |
                                                                     |  global.Intl._localeData.value({                                |
+--------------------------------------------------------------+     |      "locales": {                                               |
|                                                              |     |          "en-US": {                                             |
|                                                              |     |              "gmtFormat": "GMT{0}",                             |
|    global.Intl._localeData.load({                            |     |              "gmtZeroFormat": "GMT",                            |
|        "locales": {                                          |     |              "zone": {                                          |
|            "en-US": {                                        |     |                  "Europe/Dublin": {                             |
|                "gmtFormat": "GMT{0}",                        |     |                      long: {                                    |
|                "gmtZeroForma`t": "GMT",                       |     |                          standard: 'Dublin Standard Time',      |
|                "zone": {                                     |     |                          daylight: '...'                        |
|                    "Europe/Dublin": "1,0,2,0,3|...|...|..."  |     |                      },                                         |
|                },                                            |     |                      short:{                                    |
|                "metazone": {                                 |     |                          standard: '...',                       |
|                    "metaZoneB": "5,0,2,0,3|...|...|..."      |     |                          daylight: '...'                        |
|                    .....         ^                           |     |                      }                                          |
|                }                 |                           |     |                  }                                              |
|            }                     |                           |->>>-|              },                                                 |
|        },                        |                           |->>>-|              "metazone": {                                      |
|        "zoneNameIndex": [        |                           |     |                  "metaZoneB": {                                 |
|            " ",                  |                           |     |                      long: {                                    |
|            "Dublin",       Base32 encoded index              |     |                          standard: 'Metazone Standard Time',    |
|            "Standard",           |                           |     |                          daylight: '...'                        |
|            "Time",               |                           |     |                      },                                         |
|            "Daylight",           |                           |     |                      short:{                                    |
|            "Metazone"<-----------+                           |     |                          standard: '...',                       |
|            ....                                              |     |                          daylight: '...'                        |
|        ]                                                     |     |                      }                                          |
|    })                                                        |     |                  },                                             |
|                                                              |     |                  .....                                          |
|                                                              |     |              }                                                  |
|                                                              |     |          }                                                      |
+--------------------------------------------------------------+     |      }                                                          |
                                                                     |  })                                                             |
                                                                     +-----------------------------------------------------------------+

1. For each locale key e.g.(en-US)
2. for every ianaTimeZones (e.g. 'Europe/Dublin') expand quadruplet.
3. for every metaZones expand quadruplet.
4. Quadruplet (e.g. "1,0,2,0,3|<q2>|<q3>|<q4>" ) generates 4 timeZone names coresponding to long.standard, long.daylight etc.
5. Each single value in Quadruplet is index to zoneNameIndex for every word in timeZone name.
    e.g. "1,0,2,0,3" converts to "Dublin Standard Time" by dereferencing zoneNameIndex.
============================================================================================================================================

============================================================================================================================================
   3. METAZONE MAP DATA FILE AND IN-MEMORY FORMAT (metaZoneMap loads as is)
      see function loadLocaleData
            +------------------------------------------------+     +----------------------------------------------+
            |                                                |     |                                              |
            |       global.Intl._metaZoneData.load({         |     |                                              |
            |           "Africa/Algiers": [                  |     |      global.Intl._metaZoneData.value({       |
            |               {                                |     |          "Africa/Algiers": [                 |
            |                   "mzone": "Europe_Western",   |     |              {                               |
            |                   "to": "1977-10-20 23:00"     |     |                  "mzone": "Europe_Western",  |
            |               },                               |     |                  "to": "1977-10-20 23:00"    |
            |               {                                |     |              },                              |
            |                   "mzone": "Europe_Central",   |->>>-|              {                               |
            |                   "from": "1981-05-01 00:00"   |     |                  "mzone": "Europe_Central",  |
            |               }                                |     |                  "from": "1981-05-01 00:00"  |
            |           ]                                    |->>>-|              }                               |
            |           ianaTimeZoneA: [{                    |     |          ]                                   |
            |               mzone: metaZoneA                 |     |          ianaTimeZoneA: [{                   |
            |           }],                                  |     |              mzone: metaZoneA                |
            |           ....                                 |     |          }],                                 |
            |       }                                        |     |          ....                                |
            |                                                |     |      }                                       |
            |                                                |     |                                              |
            |                                                |     |                                              |
            +------------------------------------------------+     +----------------------------------------------+

============================================================================================================================================
*/

/**
 * Returns ianaTimeZoneHistoryItem by decoding triplets using indices.
 * @method getHistryFromTriplet
 * @param {Object} indices e.g. {timeStamps:[444, ..] offsets:[555, ...]}
 * @param {Array}  triplet e.g. [<timeStamps-index>, <offsets-index>, <isdst-index>]
 * @return {ianaTimeZoneHistoryItem} Object e.g.
    {
       until:  4434454543,  // Timestamp untill when this offset is valid
       offset: 555,         // Offset from GMT in minutes
       isdst:  true         // Is this Day light saving?
    }
 */
function getHistoryFromTriplet(indices, triplet) {
    return {
        /*
            triplet[0] is a index in indices.timeStamps represented as base32 for decode parseInt(triplet[0], 32)
            then actual values in indices.timeStamps are also base32 encoded so decode that to get untill.
            untill is time-stamp until when this offset is valid.
        */
        until: parseInt(indices.timeStamps[parseInt(triplet[0], 32)], 32) * 1000,

        /*
            triplet[1] is a index in indices.offsets represented as base32 for decode parseInt(triplet[1], 32)
            offset is minutes from GMT.
        */
        offset: indices.offsets[parseInt(triplet[1], 32)],

        /*
            triplet[1] is a 1, 0 if dst is true or false.
        */
        isdst: !!parseInt(triplet[2], 10)
    };
}

/**
* Reduces and array into array of arrays of length 3.
* @method reduceToTriplets
* @param {Array} array flat array
* @return {Array} Array of triplets. eg. [1, 2, 3, 4, 5, 6] return [[1,2,3], [4,5,6]];
*/
function reduceToTriplets(array) {
    let result = [];
    let i = 0;

    while (i < array.length) {
        result.push([array[i], array[i + 1], array[i + 2]]);
        i += 3;
    }

    return result;
}

/**
 * Unpacks historyStringCSV (comma separated indices) into array of objects
 * @method unpackHistory
 * @param {Object} indices e.g. {timeStamps:[444, ..] offsets:[555, ...]}
 * @param {String} historyStringCSV: comma separated indices string
 * any timezone data is basicaly a series of untill, offset & isdst triplets.
 * historyStringCSV is comma separated value of these. But untill and time-stamps are not values themselves but index in
 * indices.timeStamps and indices.offsets which holds the actual values.
 * @return {Array of ianaTimeZoneHistoryItem}
 */
function unpackHistory(indices, historyStringCSV) {
    const encodedIndexList = historyStringCSV.split(',');
    const count = encodedIndexList.length;

    if (count % 3 !== 0) {
        throw new Error('wrong length of history Array, must be multiple of 3');
    }

    const history = reduceToTriplets(encodedIndexList).map(triplet => getHistoryFromTriplet(indices, triplet));

    if ((count / 3) !== history.length) {
        throw new Error('failed to harvest all data!!');
    }

    return history;
}

/**
* When timezone data loads it find few timezone names equivalent.
* this function can enrich CLRD metaZone map with these additional names.
* this will modify globalSpace.Intl._metaZoneData values.
* @method enrichMetaZoneMapWithEquivalentZones
* @param {Array of iana-timezone} equivalentIanaTimeZone
* @return {void} this will modify globalSpace.Intl._metaZoneData values.
*/
function enrichMetaZoneMapWithEquivalentZones(equivalentIanaTimeZones) {
    const globalSpace = this.globalSpace;

    if (!(globalSpace && globalSpace.Intl._metaZoneData)) {
        return;
    }

    const metaZoneData = globalSpace.Intl._metaZoneData;
    let foundMetaZone = null;

    equivalentIanaTimeZones.forEach(ianaTimeZone => {
        if (metaZoneData.get(ianaTimeZone)) {
            foundMetaZone = metaZoneData.get(ianaTimeZone);
        }
    });

    if (!foundMetaZone) {
        return;
    }

    const allMetaZoneData = metaZoneData.get();
    equivalentIanaTimeZones.forEach(ianaTimeZone => {
        if (!metaZoneData.get(ianaTimeZone)) {
            allMetaZoneData[ianaTimeZone] = foundMetaZone;
        }
    });
}

/**
* loads timeZoneData file in momory by unpacking it.
* given a packedTzData, it loads at globalSpace.Intl._timeZoneData.value
* @method loadTimeZoneData
* @param {Object} packedTzData from timeZoneData file i.e. tzdata.js or tzdata-america-lima.js
* @return {Void} unpacks & loads data at globalSpace.Intl._timeZoneData.value
*/
function loadTimeZoneData(packedTzData) {
    if (!packedTzData ||
        !Array.isArray(packedTzData.zoneDefs) ||
        !Array.isArray(packedTzData.timeStamps) ||
        !Array.isArray(packedTzData.offsets)) {
        throw new Error('loadTimeZoneData: rejected packedTzData, packedTzData is not in right shape.');
    }

    const indices = {
        timeStamps: packedTzData.timeStamps,
        offsets: packedTzData.offsets
    };

    packedTzData.zoneDefs.forEach(zoneDef => {
        const zoneDefSplit = zoneDef.split('||');
        const equivalentIanaTimeZones = zoneDefSplit[0].split(',');
        const historyString = zoneDefSplit[1];
        const ianaTimeZoneHistoryList = unpackHistory(indices, historyString);

        equivalentIanaTimeZones.forEach(ianaTimeZone => {
            this.value[ianaTimeZone] = ianaTimeZoneHistoryList;
        });

        this.enrichMetaZoneMapWithEquivalentZones(equivalentIanaTimeZones);
    });
}

/**
* Utility to get CLDR style zoneName definition from strQuadruplet
* @method getCLDRZoneNamesFromQuadruplet
* @param {zoneNameDecoder} zoneNameDecoder higher level function which provides mapping index->zoneName
* @param {String} strQuadruplet <longStandard, longStandard, shortStandard, shortDaylight>
* @return {CLDRZoneNames} Returns CLDR style zoneName definition
*/
function getCLDRZoneNamesFromQuadruplet(zoneNameIndex, strQuadruplet) {
    const quadruplet = strQuadruplet.split('|');
    const lookupIndex = function(w) {
        return zoneNameIndex[parseInt(w, 32)];
    };

    return {
        long: {
            standard: quadruplet[0].split(',').filter(w => !!w).map(lookupIndex).join(''),
            daylight: quadruplet[1].split(',').filter(w => !!w).map(lookupIndex).join('')
        },
        short: {
            standard: quadruplet[2].split(',').filter(w => !!w).map(lookupIndex).join(''),
            daylight: quadruplet[3].split(',').filter(w => !!w).map(lookupIndex).join('')
        }
    };
}

/**
* unpacks json from localeData file and loads at globalSpace.Intl._localeData.value
* @method loadLocaleData
* @param {Object} packedCLDRZoneData json parsed json from localeData file.
*        this file contains timeZone names for [locale X ianaTimeZones X isDST] combination
* @return {Void}
*/
function loadLocaleData(packedCLDRZoneData) {
    if (!packedCLDRZoneData ||
        !packedCLDRZoneData.locales ||
        !Array.isArray(packedCLDRZoneData.zoneNameIndex)) {
        throw new Error('loadLocaleData: rejected data, data is not in right shape.');
    }

    const decodeQuadruplet = function(strQuadruplet) {
        return getCLDRZoneNamesFromQuadruplet(packedCLDRZoneData.zoneNameIndex, strQuadruplet);
    };

    Object.keys(packedCLDRZoneData.locales).forEach(locale => {
        const metaZones = packedCLDRZoneData.locales[locale].metazone;
        Object.keys(metaZones).forEach(metaZone => {
            metaZones[metaZone] = decodeQuadruplet(metaZones[metaZone]);
        });

        const ianaTimeZones = packedCLDRZoneData.locales[locale].zone;
        Object.keys(ianaTimeZones).forEach(ianaTimeZone => {
            ianaTimeZones[ianaTimeZone] = decodeQuadruplet(ianaTimeZones[ianaTimeZone]);
        });

        this.value[locale] = packedCLDRZoneData.locales[locale];
    });

    Object.keys(packedCLDRZoneData.locales).forEach(locale => {
        let localeItems = locale.split('-');

        for (let i = 0; i < localeItems.length - 1; i++) {
            let generalLocale = localeItems.slice(0, localeItems.length - i - 1).join('-');

            if (!this.value[generalLocale]) {
                this.value[generalLocale] = this.value[locale];
            }
        }
    });
}

/**
* Class every loader is instance.
* data files call load function on this object.
* @class Loader
*/
class Loader {
    constructor(loaderFunction, extraMethods) {
        this.value = {};
        this.load = loaderFunction || function(json) {
            this.value = json;
        };

        if (extraMethods) {
            Object.keys(extraMethods).forEach(name => this[name] = extraMethods[name]);
        }

        this.get = function(key) {
            if (key === undefined) {
                return this.value;
            }

            return this.value[key];
        };
    }
}

export default function dataloader(globalSpace) {
    if (globalSpace.Intl) {
        /*
            Data files structured like JSONP. They just contain A JSON data
            and makes a callback to these globally exposed function to load data in memory.
            loader functions are written in way that in consumes data without overwriting previously loaded values.
            Loader Class is a way to expose data and callback function in consistent way i.e.

            globalSpace.Intl.<someNameSpace>.load       : is callback
            globalSpace.Intl.<someNameSpace>.value      : will hold the value.
        */
        globalSpace.Intl._metaZoneData = new Loader();
        globalSpace.Intl._localeData = new Loader(loadLocaleData);
        globalSpace.Intl._timeZoneData = new Loader(loadTimeZoneData, {
            // this timeZone loader needs to modify _metaZoneData so it need access to global object.
            // this is why this function is bind to globalSpace
            enrichMetaZoneMapWithEquivalentZones: enrichMetaZoneMapWithEquivalentZones.bind({
                globalSpace: globalSpace
            })
        });
    }
}
