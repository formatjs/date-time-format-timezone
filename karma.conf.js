// Karma configuration

module.exports = function(config) {
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
		reporters: [process.env.TRAVIS ? 'dots' : 'progress'],
		logLevel: 'ERROR',
		colors: true,
		browserNoActivityTimeout: 100000,
		port: 9999,
		singleRun: true,
		browsers: ['Firefox']
	});
};
