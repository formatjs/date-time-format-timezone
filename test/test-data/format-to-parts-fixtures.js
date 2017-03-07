module.exports = [{
// locale en
	date: new Date('Mon Mar 06 2017 14:50:00 GMT'),
	locale: 'en',
	timeZone: 'America/Los_Angeles',
	nameFormat: 'long',
	expectedTimeZoneName: 'Pacific Standard Time'
}, {
	date: new Date('Sun Apr 30 2017 09:30:10 GMT'),
	locale: 'en',
	timeZone: 'America/Los_Angeles',
	nameFormat: 'long',
	expectedTimeZoneName: 'Pacific Daylight Time'
},
{
	date: new Date('Mon Mar 06 2017 14:50:00 GMT'),
	locale: 'en',
	timeZone: 'America/Los_Angeles',
	nameFormat: 'short',
	expectedTimeZoneName: 'PST'
},
{
	date: new Date('Sun Apr 30 2017 09:30:10 GMT'),
	locale: 'en',
	timeZone: 'America/Los_Angeles',
	nameFormat: 'short',
	expectedTimeZoneName: 'PDT'
},
{
	date: new Date('Mon Mar 06 2017 14:50:00 GMT'),
	locale: 'hi',
	timeZone: 'America/Los_Angeles',
	nameFormat: 'long',
	expectedTimeZoneName: 'उत्तरी अमेरिकी प्रशांत मानक समय'
}, {
	date: new Date('Sun Apr 30 2017 09:30:10 GMT'),
	locale: 'hi',
	timeZone: 'America/Los_Angeles',
	nameFormat: 'long',
	expectedTimeZoneName: 'उत्तरी अमेरिकी प्रशांत डेलाइट समय'
},
{
	date: new Date('Sun Apr 30 2017 09:30:10 GMT'),
	locale: 'hi',
	timeZone: 'America/Los_Angeles',
	nameFormat: 'short',
	expectedTimeZoneName: 'GMT-7'
},
{
	date: new Date('Mon Mar 06 2017 14:50:00 GMT'),
	locale: 'hi',
	timeZone: 'America/Los_Angeles',
	nameFormat: 'short',
	expectedTimeZoneName: 'GMT-8'
},
{
	date: new Date('Mon Mar 06 2017 14:50:00 GMT'),
	locale: 'en',
	timeZone: 'Asia/Calcutta',
	nameFormat: 'long',
	expectedTimeZoneName: 'India Standard Time'
}, {
	date: new Date('Sun Apr 30 2017 09:30:10 GMT'),
	locale: 'en',
	timeZone: 'Asia/Calcutta',
	nameFormat: 'long',
	expectedTimeZoneName: 'India Standard Time'
},
{
	date: new Date('Sun Apr 30 2017 09:30:10 GMT'),
	locale: 'en',
	timeZone: 'Asia/Calcutta',
	nameFormat: 'short',
	expectedTimeZoneName: 'GMT+5:30'
},
{
	date: new Date('Sun Apr 30 2017 09:30:10 GMT'),
	locale: 'en',
	timeZone: 'Asia/Calcutta',
	nameFormat: 'short',
	expectedTimeZoneName: 'GMT+5:30'
},
{
	date: new Date('Mon Mar 06 2017 14:50:00 GMT'),
	locale: 'hi',
	timeZone: 'Asia/Calcutta',
	nameFormat: 'long',
	expectedTimeZoneName: 'भारतीय मानक समय'
}, {
	date: new Date('Sun Apr 30 2017 09:30:10 GMT'),
	locale: 'hi',
	timeZone: 'Asia/Calcutta',
	nameFormat: 'long',
	expectedTimeZoneName: 'भारतीय मानक समय'
},
{
	date: new Date('Mon Mar 06 2017 14:50:00 GMT'),
	locale: 'hi',
	timeZone: 'Asia/Calcutta',
	nameFormat: 'short',
	expectedTimeZoneName: 'IST'
},
{
	date: new Date('Sun Apr 30 2017 09:30:10 GMT'),
	locale: 'hi',
	timeZone: 'Asia/Calcutta',
	nameFormat: 'short',
	expectedTimeZoneName: 'IST'
}
];