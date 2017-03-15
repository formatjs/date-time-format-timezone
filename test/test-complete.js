/* eslint-env node */
/* global  describe, it*/
import assert from 'assert';
import timeStampTests from './test-data/time-stamp-fixtures.js';
import localeTests from './test-data/locale-test-fixtures.js';
import formatToPartTests from './test-data/format-to-parts-fixtures.js';
import polyfill from '../src/code/polyfill.js';
import dataLoader from '../src/code/data-loader.js';
import tzdataMoonLanding from './test-data/tzdata-moon-nearside.js';
import tzdata from '../src/data/tzdata.js';
import localeData from '../src/data/locale.js';
import metazone from '../src/data/metazone.js';

const isNode = (typeof global !== "undefined" && {}.toString.call(global) === '[object global]');
const myGlobal = (isNode) ? global : window;


dataLoader(myGlobal);  // Functions facilitates data loading
polyfill(myGlobal);    // Applies polyfill in place
metazone(myGlobal);    // Data which maps zoneName to cldr metaNames
tzdata(myGlobal);      // Loads timezone iana data in memory
localeData(myGlobal);      // Loads timezone CLDR data in memory
tzdataMoonLanding(myGlobal);

describe('Polyfill with complete package', () => {
	describe('DateTimeFormat', () => {
		describe('Instanceof integrity', () => {
			it('nativedDateTimeFormat  instanceof Intl.DateTimeFormat', () => {
				const nativedDateTimeFormat = new Intl.DateTimeFormat('en', {
					timeZone: 'UTC'
				});
				assert.equal(nativedDateTimeFormat instanceof Intl.DateTimeFormat, true);
			});

			it('polyfilledDateTimeFormat  instanceof Intl.DateTimeFormat', () => {
				const polyfilledDateTimeFormat = new Intl.DateTimeFormat('en', {
					timeZone: 'Moon/Nearside'
				});
				assert.equal(polyfilledDateTimeFormat instanceof Intl.DateTimeFormat, true);
			});
		});

        describe('called as a function', () => {
            it('preserves this ability', () => {
                assert.doesNotThrow(() => Intl.DateTimeFormat());
            });
        });

		describe.skip('.formatToParts(date)', () => {
			it('polyfilled DateTimeFormat should implement iff native DateTimeFormat implemented it', () => {
				const nativeDateTimeFormat = new Intl.DateTimeFormat('en', {
					timeZone: 'UTC'
				}); // UTC is always implemented
				const polyfilledDateTimeFormat = new Intl.DateTimeFormat('en', {
					timeZone: 'Moon/Nearside'
				}); // Moon/Nearside must never be implemented in browser, because its fake timezone name
				assert(!((polyfilledDateTimeFormat.formatToParts) ^ (nativeDateTimeFormat.formatToParts)), 'formatToParts implementation mismatched');
			});

			if (!new Intl.DateTimeFormat('en', {
					timeZone: 'Moon/Nearside'
				}).formatToParts) {
				return;
			}

			formatToPartTests.forEach(test => {
				it(`with locale ${test.locale} timeZone ${test.timeZone} and format ${test.nameFormat}`, () => {
					const dateTimeFormat = new Intl.DateTimeFormat(test.locale, {
						timeZone: test.timeZone,
						timeZoneName: test.nameFormat
					});
					const parts = dateTimeFormat.formatToParts(test.date);
					const timeZonePart = parts.reduce((found, part) => ((part.type === 'timeZoneName') ? part : found), null);
					assert.equal(timeZonePart.value, test.expectedTimeZoneName);
				});
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

			it('should format with current time, if date is passed as null or undefined or number', () => {
				const now = new Date();
				const option = {
						year: 'numeric',
						month: 'numeric',
						day: 'numeric',
						hour: 'numeric',
						minute: 'numeric',
						timeZone: 'Moon/Nearside'
					};
				const locale = 'en';

				assert.equal(new Intl.DateTimeFormat(locale, option).format(now), new Intl.DateTimeFormat(locale, option).format(undefined));
				assert.equal(new Intl.DateTimeFormat(locale, option).format(now), new Intl.DateTimeFormat(locale, option).format(null));
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

	describe('globalSpace.Intl._localeData', () => {
		const ld = Intl._localeData;

		describe('getLocale', () => {
			it('finds valid locale', () => {
				assert(ld.getLocale('en-US-u-va-posix'));
				assert(ld.getLocale('en'));
			});

			it('should not find an invalid locale', () => {
				assert(!ld.getLocale('noooo-not-a-locale'));
			});

			it('fallsback on generic locale if specific locale is not found', () => {
				const loadedLocales = Object.keys(ld.get());

				loadedLocales.forEach(locale => assert(ld.getLocale(locale + '-abcd')));
				loadedLocales.forEach(locale => assert(ld.getLocale(locale + '-abcd-bcb')));
			});
		});
	});
});
