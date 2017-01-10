/*
 * Copyright 2017, Yahoo Inc.
 * Copyrights licensed under the New BSD License.
 * See the accompanying LICENSE file for terms.
 */


const utill =  require('./utill.js');

/**
* indexes the unpacked data.
* unpacked =>> is map of timezoneName --> Array of histories i.e. {offset, until, isdst}
* e.g {
	'America/Los_Angeles': [{offset: 0 , until:0, isdst: false}]
	'...'
}
if timeZone argument is provided index if built for only one timezone else all timezone.
* @method indexTimeZoneData
* @return {TimeZoneDataIndex} {historyListIndexer, timeStampIndexer, offsetIndexer}
*/
function indexTimeZoneData(unpacked, timeZone) {
	const timeStampIndexer = utill.indexer(),
		offsetIndexer = utill.indexer(),
		historyListIndexer = utill.indexer();

	Object.keys(unpacked).forEach((zoneName) => {
		const zone = unpacked[zoneName];
		let historyString = [];

		if (!(timeZone === undefined || zoneName === timeZone)) {
			return;
		}

		zone.histories.forEach((history) => {
			const offsetIndex = offsetIndexer.index(history.offset),
				untillIndex = timeStampIndexer.index(history.until.toString(32)),
				isdst = history.isdst;

			historyString.push(untillIndex.toString(32), offsetIndex.toString(32), isdst);
		});

		historyString = historyString.join(',');
		historyListIndexer.index(historyString, {
			extra: zoneName
		});
	});

	return {
		historyListIndexer,
		timeStampIndexer,
		offsetIndexer
	};
}

function TimeZoneDataUtil(unpacked, timeZone) {
	this.index = indexTimeZoneData(unpacked, timeZone);

	return this;

}

TimeZoneDataUtil.prototype = {
	getPackedJSON: function(additionalZones) {
		additionalZones = additionalZones || [];

		return {
			zoneDefs: this.index.historyListIndexer.indices.map((history) => {
				return additionalZones.concat(history.reverseMap).join(',') + '||' + history.value;
			}),
			timeStamps: this.index.timeStampIndexer.indices,
			offsets: this.index.offsetIndexer.indices
		};
	},

	getUniqueTimeZoneMap: function() {
		const map = {};

		this.index.historyListIndexer.indices.forEach((history) => {
			map[history.reverseMap[0]] = history.reverseMap.slice(1);
		});

		return map;
	},

	forEachUniqueTimeZone: function(callback) {
		const map = this.getUniqueTimeZoneMap();

		if (typeof(callback) !== 'function') {
			return;
		}

		Object.keys(map).forEach((timeZoneName) => {
			callback(timeZoneName, map[timeZoneName]);
		});
	},

	toModuleString: function(additionalZones) {
		return utill.getLoaderModule('_timeZoneData', JSON.stringify(this.getPackedJSON(additionalZones), null, 4));
	},

	toTimeZoneMapModuleString: function() {
		const timeZoneMap = {};

		this.forEachUniqueTimeZone((timeZoneName, additionalZones) => {
			timeZoneMap[timeZoneName] = timeZoneName;
			additionalZones.forEach((additionalZone) => {
				timeZoneMap[additionalZone] = timeZoneName;
			});
		});

		return utill.getJSONModule('zoneNameMap', JSON.stringify(timeZoneMap, null, 4));
	}
};

module.exports = TimeZoneDataUtil;