/*
 * Copyright 2017, Yahoo Inc.
 * Copyrights licensed under the New BSD License.
 * See the accompanying LICENSE file for terms.
 */

const utill = require('./utill.js');


/**
 * from timeZoneNames.json file pluckes out headers
 * @method pluckLocaleData
 * @return {localeTimeZoneNameMap}
 */
function pluckHeader(localeTimeZoneNameMapWithHeader) {
	const localeTimeZoneNameMap = {};

	Object.keys(localeTimeZoneNameMapWithHeader).forEach(locale => {
		const json = localeTimeZoneNameMapWithHeader[locale];

		if (!(json &&
				json.dates &&
				json.dates.timeZoneNames)) {
			console.warn(`wrong locale data format for locale ${locale}`);
			return {};
		}

		localeTimeZoneNameMap[locale] = Object.assign({}, {
			timeZoneNames: json.dates.timeZoneNames
		});

		if (!localeTimeZoneNameMap[locale].timeZoneNames.metazone) {
			localeTimeZoneNameMap[locale].timeZoneNames.metazone = {};
		}
	});

	return localeTimeZoneNameMap;
}

function getZoneNameQuadruplet(zoneNames) {
	const quadruplet = [null, null, null, null];

	quadruplet[0] = (zoneNames.long && zoneNames.long.standard) || '';
	quadruplet[1] = (zoneNames.long && zoneNames.long.daylight) || '';
	quadruplet[2] = (zoneNames.short && zoneNames.short.standard) || '';
	quadruplet[3] = (zoneNames.short && zoneNames.short.daylight) || '';

	return quadruplet;
}

function getZoneNameLeafIndexer(wordIndexer) {
	return function({
		zoneNames
	}) {
		getZoneNameQuadruplet(zoneNames).forEach(q => q.split(/([\s,-])/).forEach(word => word && wordIndexer.index(word, {
			frequency: true
		})));
	};
}

function getZoneNameLeafEncoder(namesIndex) {
	return function({
		zoneNames
	}) {
		return getZoneNameQuadruplet(zoneNames).reduce((encoded, zoneName) => {
			encoded.push(zoneName.split(/([\s,-])/).reduce((wordEncode, word) => {
				if (word) {
					wordEncode.push(namesIndex.map[word].toString(32));
				}
				return wordEncode;
			}, []).join(','));

			return encoded;
		}, []).join('|');
	};
}



function LocaleDataUtil(localeTimeZoneNameMapWithHeader) {
	this.map = pluckHeader(localeTimeZoneNameMapWithHeader);
	return this;
}

LocaleDataUtil.prototype = {
	forEachLocale: function(localeCurry, callback) {
		if (localeCurry) {
			return this.forOneLocale(localeCurry, callback);
		}

		if (typeof(callback) !== 'function') {
			return;
		}

		Object.keys(this.map).forEach(locale => {
			callback(locale, this.map[locale].timeZoneNames);
		});
	},

	forOneLocale: function(localeCurry, callback) {
		if (typeof(callback) !== 'function') {
			return;
		}

		if (!this.map[localeCurry]) {
			return;
		}

		callback(localeCurry, this.map[localeCurry].timeZoneNames);
	},

	forEachMetaZone: function(localeCurry, callback) {
		if (typeof(callback) !== 'function') {
			return;
		}

		this.forEachLocale(localeCurry, (locale, timeZoneNames) => {
			const metaZones = timeZoneNames.metazone;
			Object.keys(metaZones).forEach(metaZoneKey => {
				callback({
					zoneNames: metaZones[metaZoneKey],
					metaZoneName: metaZoneKey,
					metaZoneList: metaZones,
					locale: locale
				});
			});
		});
	},

	forEachZone: function(localeCurry, callback) {
		if (typeof(callback) !== 'function') {
			return;
		}

		this.forEachLocale(localeCurry, (locale, timeZoneNames) => {
			const zones = timeZoneNames.zone;
			utill.forEachKeyDeep(zones, (zone, zoneNames) => {
				if (zoneNames.long || zoneNames.short) {
					callback({
						zoneNames: zoneNames,
						timeZoneName: zone.join('/'),
						zoneList: zones,
						locale: locale
					});
				}
			}, v => (v.exemplarCity || v.long || v.short));
		});
	},

	indexStrings: function(localeCurry) {
		const wordIndexer = utill.indexer(),
			zoneNameLeafIndexer = getZoneNameLeafIndexer(wordIndexer);

		this.forEachMetaZone(localeCurry, zoneNameLeafIndexer);
		this.forEachZone(localeCurry, zoneNameLeafIndexer);
		const sortedList = wordIndexer.indices.sort((a, b) => b.frequency - a.frequency);
		const map = {};
		sortedList.forEach((value, i) => {
			map[value.value] = i;
		});
		return {
			map: map,
			list: sortedList.map(value => value.value)
		};
	},

	getPackedLocaleData: function(localeCurry) {
		const namesIndex = this.indexStrings(localeCurry),
			zoneNameLeafEncoder = getZoneNameLeafEncoder(namesIndex),
			packedLocaleData = {};

		this.forEachLocale(localeCurry, (locale, tzNames) => {
			packedLocaleData[locale] = {
				gmtFormat: tzNames.gmtFormat,
				gmtZeroFormat: tzNames.gmtZeroFormat,
				zone: {},
				metazone: {}
			};
		});

		this.forEachMetaZone(localeCurry, ({zoneNames, metaZoneName, locale}) => {
			packedLocaleData[locale].metazone[metaZoneName] = zoneNameLeafEncoder({
				zoneNames: zoneNames
			});
		});

		this.forEachZone(localeCurry, ({zoneNames, timeZoneName, locale}) => {
			packedLocaleData[locale].zone[timeZoneName] = zoneNameLeafEncoder({
				zoneNames: zoneNames
			});
		});

		return {
			locales: packedLocaleData,
			zoneNameIndex: namesIndex.list
		};
	},

	toModuleString: function(localeCurry) {
		return utill.getLoaderModule('_localeData', JSON.stringify(this.getPackedLocaleData(localeCurry), null, 4));
	}
};

module.exports = LocaleDataUtil;