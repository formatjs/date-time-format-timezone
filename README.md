# Intl.DateTimeFormat timezone polyfill
Surgically polyfills timezone support in `Intl.DateTimeFormat` API

[![Build Status][]](https://travis-ci.org/yahoo/date-time-format-timezone)  [![NPMRel][]](https://www.npmjs.com/package/date-time-format-timezone)
[Build Status]: https://travis-ci.org/yahoo/date-time-format-timezone.svg?branch=master
[NPMRel]: https://img.shields.io/npm/v/date-time-format-timezone.svg

Some [browsers do not support arbitrary time zone ](http://kangax.github.io/compat-table/esintl/) in Intl.DateTimeFormat API (becuase its optional as per [ECMA-402 standard](https://www.ecma-international.org/ecma-402/1.0/#sec-6.4)). This polyfill is only to bring this support. Polyfill contains historical timezone data, CLDR data & tiny code to polyfill this support.

## How to use?

   1. install
	```sh
	npm i date-time-format-timezone
	```

   1. nodejs
	```js
	require('date-time-format-timezone'); // polyfill is ready
	```

   1. browser
	```html
	<script src="build/browserified/date-time-format-time-zone-complete-min.js">
	```

This polyfill can add this support.

```javascript
new Intl.DateTimeFormat('hi', {
    timeZone: 'Asia/Calcutta',
    timeZoneName:'long',
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
}).format(new Date());

"११/१/२०१७, पू १:२६ भारतीय मानक समय"


new Intl.DateTimeFormat('en', {
    timeZone: 'America/Los_Angeles',
    timeZoneName:'long',
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
}).format(new Date());

"1/10/2017, 12:00 PM Pacific Standard Time"
```

## Support
|     API                           |Support|
|---------------------------------  |------ |
| Intl.DateTimeFormat               | ✅   |
| Date.toLocaleString               | ✅   |
| Date.toLocaleTimeString           | ✅   |
| Date.toLocaleTimeString           | ✅   |


## Generate latest data from [www.iana.org](http://www.iana.org/time-zones).
```
git checkout https://github.com/markandey/DateTimeFormatTimeZone.git
npm install
grunt download
grunt
npm publish
```

## Browserified file size

|                            | Minified | gzipped |
|----------------------------|----------|---------|
| complete                   | 2.64MB   | 322KB   |
| top zones only no locale   | 369.32KB | 71KB    |
| all zones no locale        | 303.19KB | 75KB    |
| top zones top locale       | 641.86KB | 148KB   |

## References
   1. http://www.unicode.org/reports/tr35/tr35-dates.html#Using_Time_Zone_Names
   1. http://icu-project.org/apiref/icu4j/com/ibm/icu/text/TimeZoneNames.html