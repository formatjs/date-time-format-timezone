/*
 * Copyright 2017, Yahoo Inc.
 * Copyrights licensed under the New BSD License.
 * See the accompanying LICENSE file for terms.
 */
module.exports = function load(global) {global.Intl && global.Intl._localeData && global.Intl._localeData.load({
    "locales": {
        "nn": {
            "gmtFormat": "GMT{0}",
            "gmtZeroFormat": "GMT",
            "zone": {},
            "metazone": {
                "Africa_Central": "g,0,4|||",
                "Africa_Eastern": "j,0,4|||",
                "Africa_Southern": "d,0,4|||",
                "Africa_Western": "6,0,1|6,0,2||",
                "Australia_Central": "3,0,1|3,0,2||",
                "Australia_CentralWestern": "5,7,3,0,1|5,7,3,0,2||",
                "Australia_Eastern": "8,0,1|8,0,2||",
                "Australia_Western": "9,0,1|9,0,2||",
                "Europe_Central": "a,0,1|a,0,2|e|f",
                "Europe_Eastern": "b,0,1|b,0,2|h|i",
                "Europe_Western": "c,0,1|c,0,2|k|l",
                "GMT": "m,0,n||o|"
            }
        }
    },
    "zoneNameIndex": [
        " ",
        "standardtid",
        "sommartid",
        "sentralaustralsk",
        "tid",
        "vest",
        "vestafrikansk",
        "-",
        "austaustralsk",
        "vestaustralsk",
        "sentraleuropeisk",
        "austeuropeisk",
        "vesteuropeisk",
        "sørafrikansk",
        "CET",
        "CEST",
        "sentralafrikansk",
        "EET",
        "EEST",
        "austafrikansk",
        "WET",
        "WEST",
        "greenwich",
        "middeltid",
        "GMT"
    ]
});};
