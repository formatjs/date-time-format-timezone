/* eslint-env node */
/* global  describe, it*/
import assert from 'assert';
import polyfill from '../src/code/polyfill.js';
import dataLoader from '../src/code/data-loader.js';
import tzdataDumontdurville from '../src/data/timezones/tzdata-antarctica-dumontdurville.js';
import tzdataLosAngeles from '../src/data/timezones/tzdata-america-los_angeles.js';


const isNode = (typeof global !== "undefined" && {}.toString.call(global) === '[object global]');
const myGlobal = (isNode) ? global : window;


dataLoader(myGlobal); // Functions facilitates data loading
polyfill(myGlobal); // Applies polyfill in place
tzdataDumontdurville(myGlobal); // Loads timezone iana data in memory
tzdataLosAngeles(myGlobal); // Loads timezone iana data in memory

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

			it('should format with timezone Antarctica/DumontDUrville', () => {
				const date = new Date(1480946713977);

				const dumontDUrvilleTime = new Intl.DateTimeFormat('en', {
					year: 'numeric',
					month: 'numeric',
					day: 'numeric',
					hour: 'numeric',
					minute: 'numeric',
					timeZone: 'Antarctica/DumontDUrville'
				}).format(date);

				assert.equal('12/6/2016, 12:05 AM', dumontDUrvilleTime);
			});

			it('should throw RangeError if timeZoneName is printed', () => {
				const date = new Date(1480946713977);

				assert.throws(() => {
					new Intl.DateTimeFormat('en', {
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

			it('should throw RangeError with timezone random/wrong', () => {
				const date = new Date(1480946713977);

				assert.throws(() => {
					new Intl.DateTimeFormat('en', {
						year: 'numeric',
						month: 'numeric',
						day: 'numeric',
						hour: 'numeric',
						minute: 'numeric',
						timeZone: 'random/wrong'
					}).format(date);
				}, /RangeError/);
			});
		});
	});
});