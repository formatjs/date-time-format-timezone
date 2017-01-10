/*
 * Copyright 2017, Yahoo Inc.
 * Copyrights licensed under the New BSD License.
 * See the accompanying LICENSE file for terms.
 */
module.exports = function load(global) {global.Intl && global.Intl._localeData && global.Intl._localeData.load({
    "locales": {
        "se": {
            "gmtFormat": "UTC{0}",
            "gmtZeroFormat": "UTC",
            "zone": {},
            "metazone": {
                "Europe_Central": "5,1,2,0,3|5,1,2,0,4|b|9",
                "Europe_Eastern": "8,1,2,0,3|8,1,2,0,4|i|a",
                "Europe_Western": "6,1,2,0,3|6,1,2,0,4|c|d",
                "GMT": "e,0,f,0,g||h|",
                "Moscow": "7,1,3|7,1,4||"
            }
        }
    },
    "zoneNameIndex": [
        " ",
        "-",
        "Eurohpá",
        "dábálašáigi",
        "geassiáigi",
        "gaska",
        "oarje",
        "Moskva",
        "nuorti",
        "CEST",
        "EEST",
        "CET",
        "WET",
        "WEST",
        "Greenwich",
        "gaskka",
        "áigi",
        "GMT",
        "EET"
    ]
});};
