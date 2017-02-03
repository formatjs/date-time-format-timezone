/* eslint-env node */
/* global  describe, it*/
import assert from 'assert';
import timeStampTests from './test-data/time-stamp-fixtures.js';
import localeTests from './test-data/locale-test-fixtures.js';
import polyfill from '../src/code/polyfill.js';
import dataLoader from '../src/code/data-loader.js';
import tzdataMoonLanding from './test-data/tzdata-moon-nearside.js';
import tzdata from '../src/data/tzdata.js';
import locale from '../src/data/locale.js';
import metazone from '../src/data/metazone.js';

const isNode = (typeof global !== "undefined" && {}.toString.call(global) === '[object global]');
const myGlobal = (isNode) ? global : window;


dataLoader(myGlobal);  // Functions facilitates data loading
polyfill(myGlobal);    // Applies polyfill in place
metazone(myGlobal);    // Data which maps zoneName to cldr metaNames
tzdata(myGlobal);      // Loads timezone iana data in memory
locale(myGlobal);      // Loads timezone CLDR data in memory
tzdataMoonLanding(myGlobal);

describe('Polyfill with complete package', () => {
	describe('DateTimeFormat', () => {
		describe('Instanceof integrity', () => {
			it('nativedDateTimeFormat  instanceof Intl.DateTimeFormat', () => {
				const nativedDateTimeFormat = new Intl.DateTimeFormat(locale, {
					timeZone: 'America/Los_Angeles'
				});
				assert.equal(nativedDateTimeFormat instanceof Intl.DateTimeFormat, true);
			});

			it('polyfilledDateTimeFormat  instanceof Intl.DateTimeFormat', () => {
				const polyfilledDateTimeFormat = new Intl.DateTimeFormat(locale, {
					timeZone: 'Moon/Nearside'
				});
				assert.equal(polyfilledDateTimeFormat instanceof Intl.DateTimeFormat, true);
			});
		});

		describe('.format(locale, option)', () => {
			timeStampTests.forEach(testFixture => {
				const param = testFixture[0].split(':'),
					locale = param[0],
					timeZone = param[1],
					timeStamp = param[2],
					expected = testFixture[1].replace('،', '');

				if (!Intl._DateTimeFormatTimeZone.checkTimeZoneSupport(timeZone)) {
					it(`without t̶i̶m̶e̶Z̶o̶n̶e̶N̶a̶m̶e̶ [${locale+(new Array(6-locale.length).join(' '))} ${timeZone+(new Array(40-timeZone.length).join(' '))} ${timeStamp+(new Array(15-timeStamp.length).join(' '))}]`, () => {
						const option = {
							year: 'numeric',
							month: 'numeric',
							day: 'numeric',
							hour: 'numeric',
							minute: 'numeric'
						};

						option.timeZone = timeZone;

						let actual = new Intl.DateTimeFormat(locale, option).format(new Date(timeStamp * 1));

						assert.equal(expected, actual);
					});
				}

			});

			localeTests.forEach(testFixture => {
				const param = testFixture[0].split(','),
					locale = param[0],
					timeZone = param[1],
					timeStamp = param[2],
					timeZoneNameFormat = param[3],
					expected = testFixture[1];

				if (!Intl._DateTimeFormatTimeZone.checkTimeZoneSupport(timeZone)) {
					it(`with    timeZoneName [${locale+(new Array(6-locale.length).join(' '))} ${timeZone+(new Array(40-timeZone.length).join(' '))} ${timeStamp+(new Array(15-timeStamp.length).join(' '))} ${timeZoneNameFormat}]`, () => {
						const option = {
							year: 'numeric'
						};

						option.timeZone = timeZone;
						option.timeZoneName = timeZoneNameFormat;

						let actual = (new Intl.DateTimeFormat(locale, option).format(new Date(timeStamp * 1)));
						assert.equal(expected, actual);
					});
				}
			});

		});
		describe('.resolvedOptions()', () => {
			it('should reflect correct timeZone added', () => {
				const inputTimezone = 'Moon/Nearside',
					option = {
						year: 'numeric',
						month: 'numeric',
						day: 'numeric',
						hour: 'numeric',
						minute: 'numeric',
						timeZone: inputTimezone
					},
					dateformat = new Intl.DateTimeFormat('en', option);

				assert.equal(inputTimezone, dateformat.resolvedOptions().timeZone);
			});
		});
		describe('.supportedLocalesOf()', () => {
			it('should work as usual.', () => {
				const supportedLocales = Intl.DateTimeFormat.supportedLocalesOf('en');

				assert.deepEqual(supportedLocales, ['en']);
			});
		});
	});

	describe('Date', () => {
		const date = new Date(1480946713977),
			stringTestData = [{
				locale: undefined,
				option: undefined,
				outputString: '12/5/2016, 6:05:13 AM',
				outputDateString: '12/5/2016',
				outputTimeString: '6:05:13 AM'
			}, {
				locale: 'en',
				option: undefined,
				outputString: '12/5/2016, 6:05:13 AM',
				outputDateString: '12/5/2016',
				outputTimeString: '6:05:13 AM'
			}, {
				locale: 'en',
				option: {},
				outputString: '12/5/2016, 6:05:13 AM',
				outputDateString: '12/5/2016',
				outputTimeString: '6:05:13 AM'
			}, {
				locale: 'en',
				option: {
					timeZone: 'Asia/Calcutta'
				},
				outputString: '12/5/2016, 7:35:13 PM',
				outputDateString: '12/5/2016',
				outputTimeString: '7:35:13 PM'
			}, {
				locale: 'en',
				option: {
					timeZone: 'Antarctica/DumontDUrville'
				},
				outputString: '12/6/2016, 12:05:13 AM',
				outputDateString: '12/6/2016',
				outputTimeString: '12:05:13 AM'
			}, {
				locale: 'en',
				option: {
					timeZone: 'Antarctica/DumontDUrville',
					'hour': 'numeric'
				},
				outputString: '12 AM',
				outputDateString: '12/6/2016, 12 AM',
				outputTimeString: '12 AM'
			}, {
				locale: 'en',
				option: {
					timeZone: 'Antarctica/DumontDUrville',
					'day': 'numeric'
				},
				outputString: '6',
				outputDateString: '6',
				outputTimeString: '6, 12:05:13 AM'
			}, {
				locale: 'en',
				option: {
					timeZone: 'Asia/Calcutta',
					'hour': 'numeric'
				},
				outputString: '7 PM',
				outputDateString: '12/5/2016, 7 PM',
				outputTimeString: '7 PM'
			}, {
				locale: 'en',
				option: {
					timeZone: 'Asia/Calcutta',
					'day': 'numeric'
				},
				outputString: '5',
				outputDateString: '5',
				outputTimeString: '5, 7:35:13 PM'
			}];
		describe('.toLocaleString(locale option)', () => {
			stringTestData.forEach(test => {
				if (date.getTimezoneOffset()!==480 && !(test.option && test.option.timeZone)) {
					console.log('Environment Timezone must be America/Los_Angeles to run some tests');
					return;
				}
				it(`should work as usual. with locale ${test.locale} option ${JSON.stringify(test.option)}`, () => {
					assert.equal(test.outputString, date.toLocaleString(test.locale, test.option));
				});
			});
		});
		describe('.toLocaleDateString(locale option)', () => {
			stringTestData.forEach(test => {
				if (date.getTimezoneOffset()!==480 && !(test.option && test.option.timeZone)) {
					console.log('Environment Timezone must be America/Los_Angeles to run some tests');
					return;
				}
				it(`should work as usual. with locale ${test.locale} option ${JSON.stringify(test.option)}`, () => {
					assert.equal(test.outputDateString, date.toLocaleDateString(test.locale, test.option));
				});
			});
		});
		describe('.toLocaleTimeString(locale option)', () => {
			stringTestData.forEach(test => {
				if (date.getTimezoneOffset()!==480 && !(test.option && test.option.timeZone)) {
					console.log('Environment Timezone must be America/Los_Angeles to run some tests');
					return;
				}

				it(`should work as usual. with locale ${test.locale} option ${JSON.stringify(test.option)}`, () => {
					assert.equal(test.outputTimeString, date.toLocaleTimeString(test.locale, test.option));
				});
			});
		});
	});
});