// Karma configuration

module.exports = function(config) {
	const customLaunchers = {
		sl_ie_9: {
			base: 'SauceLabs',
			browserName: 'internet explorer',
			version: '9'
		},
		sl_safari: {
			base: 'SauceLabs',
			browserName: 'safari',
			version: '9'
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
		browsers: ['Firefox']
	});
};