/* eslint-env node */
/* global  describe, it*/
import assert from 'assert';
import polyfill from '../src/code/polyfill.js';
import dataLoader from '../src/code/data-loader.js';
import tzdataDumontdurville from '../src/data/timezones/tzdata-antarctica-dumontdurville.js';
import tzdataLosAngeles from '../src/data/timezones/tzdata-america-los_angeles.js';
import localeDataFR from '../src/data/locales/locale-fr.js';
import localeDataEN from '../src/data/locales/locale-en.js';
import metazone from '../src/data/metazone.js';


const isNode = (typeof global !== "undefined" && {}.toString.call(global) === '[object global]');
const myGlobal = (isNode) ? global : window;


dataLoader(myGlobal); // Functions facilitates data loading
polyfill(myGlobal); // Applies polyfill in place
tzdataDumontdurville(myGlobal); // Loads timezone iana data in memory
tzdataLosAngeles(myGlobal); // Loads timezone iana data in memory
metazone(myGlobal);    // Data which maps zoneName to cldr metaNames
localeDataFR(myGlobal);      // Loads timezone iana data in memory
localeDataEN(myGlobal);      // Loads timezone iana data in memory


describe('Polyfill packaged with specific timezone data', () => {
	describe('DateTimeFormat', () => {
		describe('.format(locale, option)', () => {
			it('should format with timezone America/Los_Angeles', () => {
				const date = new Date(1480946713977);

				const losAngelesTime = new Intl.DateTimeFormat('en', {
					year: 'numeric',
					month: 'numeric',
					day: 'numeric',
					hour: 'numeric',
					minute: 'numeric',
					timeZone: 'America/Los_Angeles'
				}).format(date);

				assert.equal('12/5/2016, 6:05 AM', losAngelesTime);
			});

			if (Intl.DateTimeFormat.supportedLocalesOf('fr').indexOf('fr') >= 0) {
				it('should format if timeZoneName is printed with loaded locale', () => {
					const date = new Date(1480946713977);

					const losAngelesTime = new Intl.DateTimeFormat('fr', {
						year: 'numeric',
						month: 'numeric',
						day: 'numeric',
						hour: 'numeric',
						minute: 'numeric',
						timeZoneName: 'long',
						timeZone: 'Antarctica/DumontDUrville'
					}).format(date);

					assert.equal('06/12/2016 à 00:05 heure de Dumont-d’Urville', losAngelesTime);
				});
			}
			if (Intl.DateTimeFormat.supportedLocalesOf('en').indexOf('en') >= 0) {
				it('should format if timeZoneName is printed with loaded locale', () => {
					const date = new Date(1480946713977);

					const losAngelesTime = new Intl.DateTimeFormat('en', {
						year: 'numeric',
						month: 'numeric',
						day: 'numeric',
						hour: 'numeric',
						minute: 'numeric',
						timeZoneName: 'long',
						timeZone: 'Antarctica/DumontDUrville'
					}).format(date);

					assert.equal('12/6/2016, 12:05 AM Dumont-d’Urville Time', losAngelesTime);
				});
			}

			it('should throw exception if timeZoneName is printed with non-loaded locale', () => {
				const date = new Date(1480946713977);

				assert.throws(() => {
					new Intl.DateTimeFormat('hi', {
						year: 'numeric',
						month: 'numeric',
						day: 'numeric',
						hour: 'numeric',
						minute: 'numeric',
						timeZoneName: 'long',
						timeZone: 'Antarctica/DumontDUrville'
					}).format(date);
				}, /RangeError/);
			});
		});
	});
});