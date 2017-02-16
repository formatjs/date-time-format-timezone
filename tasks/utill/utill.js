/*
 * Copyright 2017, Yahoo Inc.
 * Copyrights licensed under the New BSD License.
 * See the accompanying LICENSE file for terms.
 */

const copyRightText = `/*
 * Copyright 2017, Yahoo Inc.
 * Copyrights licensed under the New BSD License.
 * See the accompanying LICENSE file for terms.
 */`;

/**
 * Utillity function to index any value.
 * Can be used to replace values with it's index in indices
 * @method indexer
 * @return {Object} with {function index and indices which is aray of values}
 */
function indexer() {
	const hash = {},
		indices = [];

	return {
		/**
		 * given a key it will return index from indices list.
		 * if its is already present it will return existing index.
		 * option is optional.
		 * if option.extra (optional) is provided
		 * 	indices contains key and reverseMap which holds all these extra values
		 * if option.frequency is true. frequency is tracked
		 */
		index: function(key, option) {
			let index = 0,
				value = key;
			option = option || {};
			let extra = option.extra;
			let frequency = option.frequency;
			if (hash[key] === undefined) {
				if (extra !== undefined || frequency !== undefined) {
					value = {
						value: key
					};

					if (extra !== undefined) {
						value.reverseMap = [];
					}

					if (frequency !== undefined) {
						value.frequency = 1;
					}
				}
				index = indices.push(value) - 1;
				hash[key] = index;
			} else {
				index = hash[key];
			}

			if (extra !== undefined && Array.isArray(indices[index].reverseMap)) {
				indices[index].reverseMap.push(extra);
			}

			if (frequency !== undefined && indices[index].frequency) {
				indices[index].frequency = indices[index].frequency + 1;
			}

			return index;
		},

		/**
		 * Simple list of keys
		 */
		indices: indices
	};
}

function getLoaderModule(name, json) {
	return `${copyRightText}\nmodule.exports = function load(global) {global.Intl && global.Intl.${name} && global.Intl.${name}.load(${json});};\n`;
}

function getJSONModule(name, json) {
	return `${copyRightText}\nmodule.exports = ${json};\n`;
}

function getPolyfillPackageModule(files) {
	let moduleLines = [];

	moduleLines.push(`${copyRightText}\nvar myGlobal = (typeof global !== "undefined" && {}.toString.call(global) === \'[object global]\') ? global : window;`);
	moduleLines = moduleLines.concat(files.map(file => {
		const exportedFn = file.indexOf('code/') >= 0 ? '.default' : '';
		return `(require('${file}')${exportedFn})(myGlobal);`;
	}));
	moduleLines.push('module.exports = myGlobal.Intl.DateTimeFormat;');

	return moduleLines.join('\n');
}

function getBrowserifiedDataFile(namespace, json) {
	return `${copyRightText}\nIntl.${namespace}.load(${json});`;
}

function forEachKeyDeep(object, callback, depthCheckFn, base) {
	if (!base) {
		base = [];
	}
	if (typeof(callback) !== 'function') {
		return;
	}

	Object.keys(object).forEach(key => {
		const value = object[key],
			newBase = base.concat([key]);
		if (!depthCheckFn(value)) {
			forEachKeyDeep(value, callback, depthCheckFn, newBase);
		} else {
			callback(newBase, value);
		}
	});
}

module.exports = {
	getLoaderModule: getLoaderModule,
	getJSONModule: getJSONModule,
	indexer: indexer,
	forEachKeyDeep: forEachKeyDeep,
	getBrowserifiedDataFile: getBrowserifiedDataFile,
	getPolyfillPackageModule: getPolyfillPackageModule
};