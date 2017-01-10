/*
 * Copyright 2017, Yahoo Inc.
 * Copyrights licensed under the New BSD License.
 * See the accompanying LICENSE file for terms.
 */
module.exports = function load(global) {global.Intl && global.Intl._localeData && global.Intl._localeData.load({
    "locales": {
        "haw": {
            "gmtFormat": "GMT{0}",
            "gmtZeroFormat": "GMT",
            "zone": {
                "Pacific/Honolulu": "||4|5"
            },
            "metazone": {
                "Alaska": "||0|1",
                "Hawaii_Aleutian": "||2|3"
            }
        }
    },
    "zoneNameIndex": [
        "AKST",
        "AKDT",
        "HAST",
        "HADT",
        "HST",
        "HDT"
    ]
});};
