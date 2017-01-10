/*
 * Copyright 2017, Yahoo Inc.
 * Copyrights licensed under the New BSD License.
 * See the accompanying LICENSE file for terms.
 */

import polyfill from './code/polyfill.js';
import dataLoader from './code/data-loader.js';
import tzdata from './data/tzdata.js';
import locale from './data/locale.js';
import metazone from './data/metazone.js';

const isNode = (typeof global !== "undefined" && {}.toString.call(global) === '[object global]');
const myGlobal = (isNode) ? global : window;

dataLoader(myGlobal);  // Functions facilitates data loading
polyfill(myGlobal);    // Applies polyfill in place
metazone(myGlobal);    // Data which maps zoneName to cldr metaNames
tzdata(myGlobal);      // Loads timezone iana data in memory
locale(myGlobal);      // Loads timezone CLDR data in memory

export default myGlobal.Intl.DateTimeFormat;