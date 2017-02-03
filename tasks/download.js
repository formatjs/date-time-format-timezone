/*
 * Copyright 2017, Yahoo Inc.
 * Copyrights licensed under the New BSD License.
 * See the accompanying LICENSE file for terms.
 */

/*eslint-disable no-unused-vars*/
/* eslint-env node */
/* global  Promise */

const path = require('path'),
	exec = require('child_process').exec,
	Utill = require('./utill/utill.js'),
	TimeZoneDataUtil = require('./utill/timezone-data-utill.js'),
	LocaleDataUtil = require('./utill/locale-data-utill.js'),
	src = 'ftp://ftp.iana.org/tz/tzdata-latest.tar.gz',
	ts = '1479946288072', // + Date.now(),
	tsBase = path.resolve('temp', ts),
	getDir = function(name) {
		return path.resolve(tsBase, name);
	},
	tarDir = path.resolve(getDir('tarDir'), 'data.tar.gz'),
	extractDir = getDir('extractDir'),
	dataDir = path.resolve('src/data'),
	zicDir = getDir('zicDir'),
	zdumpBase = getDir('zdump'),
	cldrDatesFullDir = path.resolve('node_modules/cldr-dates-full/main'),
	metaZonesFile = path.resolve('node_modules/cldr-core/supplemental/metaZones.json'),
	zdumpLinePattern = /([a-z]{3}\s+?[a-z]{3}\s+?[0-9]{1,2}\s+?[0-9]{1,2}:[0-9]{1,2}:[0-9]{1,2}\s+?[0-9]{0,4}\s+UTC)\s+=\s+([a-z]{3}\s+?[a-z]{3}\s+?[0-9]{1,2}\s+?[0-9]{1,2}:[0-9]{1,2}:[0-9]{1,2}\s+?[0-9]{0,4})\s+([a-z0-9+\-]{3,7})\s+isdst=([01])/i;

function download(grunt) {
	return new Promise(resolve => {
		grunt.log.ok(`Downloading ${src}`);
		exec(`curl ${src} -o ${tarDir} && cd ${extractDir} && gzip -dc ${tarDir} | tar -xf -`, err => {
			if (err) {
				throw err;
			}
			grunt.log.ok(`Downloading ${src}`);
			resolve();
		});
	});
}

function compile(grunt) {
	return new Promise(resolve => {
		const files = ['africa',
			'antarctica',
			'asia',
			'australasia',
			'etcetera',
			'europe',
			'northamerica',
			'southamerica',
			'pacificnew',
			'backward'
		];

		function next() {
			if (!files.length) {
				grunt.log.ok('Zic compilation done!');

				return resolve();
			}

			const file = files.shift(),
				src = path.resolve(extractDir, file);

			exec('zic -d ' + zicDir + ' ' + src, err => {
				if (err) {
					throw err;
				}

				grunt.verbose.ok(`Compiled zic : ${file}`);

				next();
			});
		}

		next();
	});
}

function zdump(grunt) {
	return new Promise(resolve => {
		const files = grunt.file.expand({
			filter: 'isFile',
			cwd: zicDir
		}, '**/*');

		function next() {
			if (!files.length) {
				grunt.log.ok('Zdumping done!');
				return resolve();
			}

			const file = files.pop(),
				src = path.join(zicDir, file),
				dest = path.join(zdumpBase, file);

			exec('zdump -v ' + src, {
				maxBuffer: 20 * 1024 * 1024
			}, (err, stdout) => {
				if (err) {
					throw err;
				}

				grunt.file.mkdir(path.dirname(dest));
				grunt.file.write(dest + '.zdump', stdout.replace(new RegExp(zicDir + '/', 'g'), ''));

				grunt.verbose.ok(`Dumped data for :${file}`);

				next();
			});
		}
		grunt.log.ok('Zdumping...');
		next();
	});
}

function generateTimeZoneData(grunt) {
	return new Promise(resolve => {
		const files = grunt.file.expand({
				filter: 'isFile',
				cwd: zdumpBase
			}, '**/*.zdump'),
			unpacked = {};

		files.forEach(file => {
			const lines = grunt.file.read(path.join(zdumpBase, file)).split('\n'),
				name = file.replace(/\.zdump$/, '');

			let histories = [];

			lines.forEach(line => {
				const match = line.match(zdumpLinePattern),
					utcString = match && match[1],
					localString = match && match[2] + ' UTC',
					utc = new Date(utcString),
					local = new Date(localString),
					abbr = match && match[3],
					isdst = match && match[4],
					offset = Math.floor((local - utc) / (1000 * 60));

				if (line.trim().length > 5 && (!match || (match.length !== 5))) {
					grunt.warn('Wrong zdump line found! file: ' + file + ' line: ' + line, 1);
					return;
				}

				if (!match) {
					return;
				}

				if (offset > 1500 && offset > -1500) {
					grunt.warn('Wrong Offset found in zdump! file: ' + file, 1);
					return;
				}

				histories.push({
					offset: offset,
					until: (utc.getTime()/1000),
					abbr: abbr,
					isdst: (isdst * 1)
				});
			});

			// remove untills which extends up to next untill
			histories = histories.filter((history, index) => {
				if (index === histories.length - 1) {
					//always keep last one
					return true;
				}

				if (histories[index + 1].offset === history.offset && histories[index + 1].abbr === history.abbr) {
					return false;
				}

				return true;
			});

			if (!unpacked[name]) {
				unpacked[name] = {
					name: name,
					histories: histories
				};
			}
		});

		const allTimeZoneData = new TimeZoneDataUtil(unpacked);
		//let packedJSON = allTimeZoneData.getPackedJSON();
		grunt.file.mkdir(dataDir);

		// complete file
		grunt.file.write(`${dataDir}/tzdata.js`, allTimeZoneData.toModuleString());

		// map file
		grunt.file.write(`${dataDir}/tzmap.js`, allTimeZoneData.toTimeZoneMapModuleString());

		// individual timezones files
		allTimeZoneData.forEachUniqueTimeZone((timeZone, additionalZones) => {
			const zoneData = new TimeZoneDataUtil(unpacked, timeZone),
				zoneFileName = timeZone.toLowerCase().replace(/\//g, '-');

			grunt.file.write(`${dataDir}/timezones/tzdata-${zoneFileName}.js`, zoneData.toModuleString(additionalZones));
		});

		grunt.log.ok('Timezone data generation done!');

		resolve();
	});


}

function generateMetaZoneData(grunt) {
	return new Promise(resolve => {
		const json = grunt.file.readJSON(metaZonesFile),
			metaZone = {};

		if (!(json &&
				json.supplemental &&
				json.supplemental.metaZones &&
				json.supplemental.metaZones.metazoneInfo &&
				json.supplemental.metaZones.metazoneInfo.timezone)) {
			grunt.warn(`wrong metazone file format`);
			return;
		}

		Utill.forEachKeyDeep(json.supplemental.metaZones.metazoneInfo.timezone, (base, value) => {
			metaZone[base.join('/')] = value.map(zone => {
				const mappedZone = {};

				if (!zone.usesMetazone) {
					throw new Error('invalid metazone file.');
				}

				if (zone.usesMetazone._mzone) {
					mappedZone.mzone = zone.usesMetazone._mzone;
				}
				if (zone.usesMetazone._from) {
					mappedZone.from = zone.usesMetazone._from;
				}
				if (zone.usesMetazone._to) {
					mappedZone.to = zone.usesMetazone._to;
				}

				return mappedZone;
			});
		}, value=>Array.isArray(value));
		grunt.file.write(`${dataDir}/metazone.js`, Utill.getLoaderModule('_metaZoneData', JSON.stringify(metaZone, null, 4)));
		grunt.log.writeln('MetaZone data generation done!');
		resolve();
	});
}

function generateLocaleData(grunt) {
	grunt.log.ok(`generateLocaleData`);

	return new Promise(resolve => {
		const files = grunt.file.expand({
				filter: 'isFile',
				cwd: cldrDatesFullDir
			}, '**/timeZoneNames.json'),
			allLocaleData = {};

		files.forEach(file => {
			const timeZoneNamesData = grunt.file.readJSON(path.join(cldrDatesFullDir, file));
			if (!timeZoneNamesData.main) {
				grunt.warn(`wrong timeZoneNames file ${file}`);
				return;
			}
			Object.keys(timeZoneNamesData.main).forEach(localeName => {
				allLocaleData[localeName] = timeZoneNamesData.main[localeName];
			});

		});

		let localeDataUtil = new LocaleDataUtil(allLocaleData);

		grunt.file.write(`${dataDir}/locale.js`, localeDataUtil.toModuleString());

		localeDataUtil.forEachLocale(null, locale => {
			grunt.file.write(`${dataDir}/locales/locale-${locale}.js`, localeDataUtil.toModuleString(locale));
		});

		grunt.log.writeln('Locale data generation done!');
		resolve();
	});
}

module.exports = function(grunt) {
	grunt.registerTask('download', 'Download, Compile & Minify data from http://www.iana.org/time-zones.', function() {
		const done = this.async();
		grunt.file.mkdir(path.dirname(tarDir));
		grunt.file.mkdir(extractDir);
		grunt.file.mkdir(zicDir);

		Promise.resolve().
			then(() => download(grunt)).
			then(() => compile(grunt)).
			then(() => zdump(grunt)).
			then(() => generateTimeZoneData(grunt)).
			then(() => generateLocaleData(grunt)).
			then(() => generateMetaZoneData(grunt)).
		then(done);
	});
};