// Karma configuration

module.exports = function(config) {
	const customLaunchers = {
		sl_ie_10: {
			base: 'SauceLabs',
			browserName: 'internet explorer',
			version: '10'
		},
		sl_ie_11: {
			base: 'SauceLabs',
			browserName: 'internet explorer',
			version: '11'
		},
		sl_safari: {
			base: 'SauceLabs',
			browserName: 'safari',
			version: '10'
		},
		sl_edge: {
			base: 'SauceLabs',
			browserName: 'microsoftedge'
		},
		sl_firefox: {
			base: 'SauceLabs',
			browserName: 'firefox',
			version: '64'
		}
	};

	config.set({
		basePath: '',
		plugins: ['karma-chrome-launcher',
			'karma-firefox-launcher',
			'karma-phantomjs-launcher',
			'karma-sauce-launcher',
			'karma-mocha'
		],
		mochaReporter: {
			output: 'noFailures'
		},
		sauceLabs: {
			testName: 'DateTimeFormatTimeZone tests'
		},
		frameworks: ['mocha'],
		customLaunchers: customLaunchers,
		reporters: [process.env.TRAVIS ? 'dots' : 'progress', 'saucelabs'],
		logLevel: 'ERROR',
		colors: true,
		browserNoActivityTimeout: 100000,
		port: 9999,
		singleRun: true,
		browsers: ['sl_ie_10', 'sl_edge', 'sl_ie_11', 'sl_safari', 'sl_firefox']
	});
};