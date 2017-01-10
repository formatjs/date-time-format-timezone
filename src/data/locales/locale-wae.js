/*
 * Copyright 2017, Yahoo Inc.
 * Copyrights licensed under the New BSD License.
 * See the accompanying LICENSE file for terms.
 */
module.exports = function load(global) {global.Intl && global.Intl._localeData && global.Intl._localeData.load({
    "locales": {
        "wae": {
            "gmtFormat": "GMT{0}",
            "gmtZeroFormat": "GMT",
            "zone": {},
            "metazone": {
                "Atlantic": "3,0,1|3,0,2||",
                "Europe_Central": "4,0,1|4,0,2|7|c",
                "Europe_Eastern": "5,0,1|5,0,2|8|9",
                "Europe_Western": "6,0,1|6,0,2|b|a"
            }
        }
    },
    "zoneNameIndex": [
        " ",
        "Standardzit",
        "Summerzit",
        "Atlantiši",
        "Mitteleuropäiši",
        "Ošteuropäiši",
        "Wešteuropäiši",
        "MEZ",
        "OEZ",
        "OESZ",
        "WESZ",
        "WEZ",
        "MESZ"
    ]
});};
