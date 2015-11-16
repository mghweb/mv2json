var path1 = '/Users/mhegler/Documents/Merchant-9/modules/component/mmlsk-cmp-ssui-vieworder.mv';
var path2 = '/Users/mhegler/Documents/Merchant-9/features/uri/uri_db.mv';
var path3 = '/Users/mhegler/Documents/Merchant-9/lib/dbeng/products.mv';
var path4 = '/Users/mhegler/Documents/Merchant-9/lib/util_soap.mv';

var path = require('path');

var lsk = {

	/**
	 * Convert a LSK path to it's `g.` variable representation.
	 * 
	 * @param {string} p the path to be converted.
	 * @return {string|boolean} when the passed path is matched to a `g.` variable, else false
	 */
	pathToGlobal: function(p) {

		var global = 'g.Module_'; // generic base
		var st = global; // starting value before validation

		var info = path.parse(p);

		// *Library_
		if ( p.search(new RegExp(path.sep + 'lib' + path.sep), 'i') !== -1 ) {
			global += 'Library_';

			// *DB
			if ( p.search(new RegExp(path.sep + '(dbeng|dbprim)' + path.sep), 'i') !== -1 ) {
				global += 'DB';
			}

			// *Utilities
			if ( info.name === 'util_public') {
				global += 'Utilities';
			}
		}

		// *Feature_
		if ( p.search(new RegExp(path.sep + 'features' + path.sep), 'i') !== -1 ) {
			global += 'Feature_' + info.name.toUpperCase();
		}

		return (global !== st) ? global : false;

	},

	/**
	 * Convert a local LSK path to it's distribution equivalent.
	 * 
	 * @param {string} p - the path to be converted.
	 * @param {string} local_base_path=Merchant-9/ - the local base path (e.g. 'Merchant-9')
	 * @return {string} the parsed distribution path
	 */
	pathToDistroPath: function(p, local_base_path, distro_base_path) {

		// Default parameter values
		local_base_path = (!local_base_path) ? 'Merchant-9' + path.sep : local_base_path;

		var distro = 'g.Module_Root $ ';

		var localRelativePath = p.split(local_base_path)[1]; 
		var info = path.parse(localRelativePath);

		var cleanBase = info.name.replace('mmlsk-', '');
		var compiledExt = info.ext.replace(/^.mv$/i, '.mvc');

		return distro + "'" + info.dir + '/' + cleanBase + compiledExt + "'";

	}

};

var parsed = lsk.pathToGlobal(path1) || lsk.pathToDistroPath(path1);
console.log(parsed);