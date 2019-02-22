module.exports = function(grunt) {
	grunt.initConfig({
		eslint: {
			all: ['src/code/*.js', 'src/index.js', 'tasks/**/*.js', 'test/*.js']
		},
		copy: {
			srcData: {
				expand: true,
				src: 'src/data/**',
				dest: 'build'
			},
			testData: {
				expand: true,
				src: 'test/test-data/*',
				dest: 'build'
			}
		},
		babel: {
			options: {
				sourceMap: true,
				minified: false,
				comments: false
			},
			src: {
				files: [{
					expand: true,
					cwd: 'src',
					src: ['code/*.js'],
					dest: 'build/src'
				}, {
					expand: true,
					cwd: 'src',
					src: ['*.js'],
					dest: 'build/src'
				}]
			},
			test: {
				files: [{
					expand: true,
					cwd: 'test',
					src: ['*.js'],
					dest: 'build/test'
				}]
			}

		},
		browserify: {
			srcNoData: {
				src: [
					'build/src/date-time-format-timezone-no-data.js'
				],
				dest: 'build/browserified/date-time-format-timezone-no-data.js'
			},
			srcIndex: {
				src: [
					'build/src/index.js'
				],
				dest: 'build/browserified/date-time-format-timezone-complete.js'
			},
			srcGZNL: {
				src: [
					'build/src/date-time-format-timezone-golden-zones-no-locale.js'
				],
				dest: 'build/browserified/date-time-format-timezone-golden-zones-no-locale.js'
			},
			srcGZGL: {
				src: [
					'build/src/date-time-format-timezone-golden-zones-golden-locales.js'
				],
				dest: 'build/browserified/date-time-format-timezone-golden-zones-golden-locales.js'
			},
			srcAZNL: {
				src: [
					'build/src/date-time-format-timezone-all-zones-no-locale.js'
				],
				dest: 'build/browserified/date-time-format-timezone-all-zones-no-locale.js'
			},
			completeData: {
				src: [
					'build/test/test-complete.js'
				],
				dest: 'build/browserified/test/test-complete.js'
			},
			sauceLabTest: {
				src: [
					'build/test/test-saucelabs.js'
				],
				dest: 'build/browserified/test/test-saucelabs.js'
			},
			specificTimezone: {
				src: [
					'build/test/test-specific-zone-only.js'
				],
				dest: 'build/browserified/test/test-specific-zone-only.js'
			},
			specificTimezoneSpecificLocale: {
				src: [
					'build/test/test-specific-zone-specific-locale.js'
				],
				dest: 'build/browserified/test/test-specific-zone-specific-locale.js'
			}
		},
		uglify: {
			srcNoData: {
				src: [
					'build/browserified/date-time-format-timezone-no-data.js'
				],
				dest: 'build/browserified/date-time-format-timezone-no-data-min.js'
			},
			srcIndex: {
				files: {
					'build/browserified/date-time-format-timezone-complete-min.js': [
						'build/browserified/date-time-format-timezone-complete.js'
					]
				}

			},
			srcGZNL: {
				files: {
					'build/browserified/date-time-format-timezone-golden-zones-no-locale-min.js': [
						'build/browserified/date-time-format-timezone-golden-zones-no-locale.js'
					]
				}

			},
			srcGZGL: {
				files: {
					'build/browserified/date-time-format-timezone-golden-zones-golden-locales-min.js': [
						'build/browserified/date-time-format-timezone-golden-zones-golden-locales.js'
					]
				}

			},
			srcAZNL: {
				files: {
					'build/browserified/date-time-format-timezone-all-zones-no-locale-min.js': [
						'build/browserified/date-time-format-timezone-all-zones-no-locale.js'
					]
				}

			}
		},
		karma: {
			completeData: {
				configFile: 'karma.conf.js',
				files: [{
					src: 'node_modules/intl/dist/Intl.complete.js'
				}, {
					src: 'build/browserified/test/test-complete.js'
				}]
			},
			specificTimezone: {
				configFile: 'karma.conf.js',
				files: [{
					src: 'node_modules/intl/dist/Intl.complete.js'
				}, {
					src: 'build/browserified/test/test-specific-zone-only.js'
				}]
			},
			specificTimezoneSpecificLocale: {
				configFile: 'karma.conf.js',
				files: [{
					src: 'node_modules/intl/dist/Intl.complete.js'
				}, {
					src: 'build/browserified/test/test-specific-zone-specific-locale.js'
				}]
			}
		},
		connect: {
			server: {
				options: {
					base: '.',
					port: 9999
				}
			}
    },
		'saucelabs-mocha': {
			all: {
				options: {
					urls: ['http://127.0.0.1:9999/tests/index.html'],
					build: process.env.TRAVIS_BUILD_NUMBER,
					sauceConfig: {
						'record-video': false,
						'capture-html': false,
						'record-screenshots': false,
						'command-timeout': 60
					},
					throttled: 3,
					browsers: [
						{
							platform: 'Windows XP',
							browserName: 'internet explorer',
							version: '10'
						},
						{

							platform: 'Windows XP',
							browserName: 'internet explorer',
							version: '11'
						},
						{
							platform: 'OS X',
							browserName: 'safari',
							version: '10'
						},
						{
							platform: 'Windows X',
							browserName: 'microsoftedge'
						},
						{
							platform: 'Windows 7',
							browserName: 'firefox',
							version: '64'
						}
					]
				}
			}
		},
		mochaTest: {
			completeData: {
				options: {
					reporter: 'spec',
					quiet: false,
					clearRequireCache: false,
					noFail: false
				},
				src: ['build/test/test-complete.js']
			},
			specificTimezone: {
				options: {
					reporter: 'spec',
					quiet: false,
					clearRequireCache: false,
					noFail: false
				},
				src: ['build/test/test-specific-zone-only.js']
			},
			specificTimezoneSpecificLocale: {
				options: {
					reporter: 'spec',
					quiet: false,
					clearRequireCache: false,
					noFail: false
				},
				src: ['build/test/test-specific-zone-specific-locale.js']
			}
		},
		release: {
			options: {
				changelog: false,
				changelogText: false,
				tagName: 'v<%= version %>',
				commitMessage: '<%= version %>'
			},
			github: {
				repo: 'yahoo/date-time-format-timezone'
			}
		},
		clean: {
			default: ['temp', 'build'],
			build: ['build']
		},
		pkg: grunt.file.readJSON('package.json')
	});

	function allBut(task, subtask) {
		return Object.keys(grunt.config.get(task)).
		filter(sub => subtask !== sub).
		map(sub => [task, sub].join(':'));
	}

	grunt.loadTasks('tasks');
	grunt.registerTask('build', ['clean:build', 'eslint', 'babel', 'copy', 'gen-package', 'browserify', 'uglify']);

	grunt.registerTask('test', process.env.TRAVIS ? ['mochaTest', 'karma', 'connect', 'saucelabs-mocha'] : ['mochaTest', 'karma']);

	grunt.registerTask('default', ['build', 'test']);
	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.loadNpmTasks('gruntify-eslint');
	grunt.loadNpmTasks('grunt-mocha-test');
	grunt.loadNpmTasks('grunt-mocha');
	grunt.loadNpmTasks('grunt-babel');
	grunt.loadNpmTasks('grunt-browserify');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-karma');
	grunt.loadNpmTasks('grunt-release');
	grunt.loadNpmTasks('grunt-changelog');
	grunt.loadNpmTasks('grunt-saucelabs');
	grunt.loadNpmTasks('grunt-contrib-connect');
};
