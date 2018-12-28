/* Max Hegler @ 2015
 * Mv to JSON
 * - Extract MvFUNCTION tag information to JSON format for use in autocompletion / documentation. 
 */

/* --------------- Define Dependencies --------------- */
var fse = require('fs-extra'),
	path = require('path'),
	htmlparser = require('htmlparser2');

/* --------------- Define Global Variables --------------- */
var _MV_DIR = null,
	_MV_FILE = null,
	_OUTPUT_FILE = null;

/* --------------- Process Arguments --------------- */
var cmdArguments = process.argv.slice(2);
if (cmdArguments.length > 0) {
	cmdArguments.forEach(function(value, index, array) {
		
		if (index === 0) {
			var st = fse.statSync(value);
			if (st.isDirectory()) {
				_MV_DIR = value;
			}
			else if(st.isFile()) {
				var pathinfo = path.parse(value);
				if (pathinfo.ext === '.mv') {
					_MV_FILE = value;
				}
				else {
					throw new Error('Input: Ivalid file extension (expected .mv).');
				}
			}
		}
		else if (index === 1) {
			var pathinfo = path.parse(value);
			if (pathinfo) {
				if (pathinfo.ext === '.json' || '.mv2json-cache') {
					_OUTPUT_FILE = value;
				}
				else {
					throw new Error('Output: No *.json output file specified.');
				}
			}
			else {
				throw new Error('Output: No *.json output file specified.');
			}
		}

	});
}

/* --------------- mv2json Class --------------- */
var mv2json = {

	init: function() {

		if (_MV_DIR) {
			this.mode = 'D';
			this.local_path = _MV_DIR;
			this.local_path_end = this.pathGetLastDirectory(this.local_path);
			this.parseDirectory(this.local_path);
		}
		else if (_MV_FILE) {
			this.mode = 'F';
			this.local_path = _MV_FILE;
			this.local_path_end = this.pathGetLastDirectory(this.local_path);
			this.parseFile(this.local_path);
		}

		this.ignored_directories = [
			
		];

		this.include_local_paths = false;
		this.pretty_json = true;

		this.mv_files = [];
		this.output_file = _OUTPUT_FILE;

	},

	done: function() {
		fse.ensureFileSync(this.output_file);
		var json = '';
		if (this.pretty_json) {
			json = JSON.stringify(this.mv_files, null, '\t');
		}
		else {
			json = JSON.stringify(this.mv_files);
		}
		fse.writeFile(this.output_file, json, function(err) {
			if (err) {
				return console.error(err);
			}
			console.log('Ｌ', 'Done!');
		});
	},

	parseDirectory: function(dir) {
		fse.walk(dir).on('data', function(item) {
			if (this.ignored_directories.length > 0) {
				this.ignored_directories.forEach(function(idir, index) {
					if (item.path.search(new RegExp(path.sep + idir + path.sep), 'i') == -1) {
						this.parseFile(item.path);
					}
				}.bind(this));
			}
			else {
				this.parseFile(item.path);
			}
		}.bind(this)).on('end', function() {
			this.done();
		}.bind(this));
	},

	parseFile: function(file) {
		var pathinfo = path.parse(file);
		var functions = [];
		if (pathinfo.ext === '.mv') {
			var mvtext = fse.readFileSync(file);
			var parser = new htmlparser.Parser({
				onopentag: function(name, attributes) {
					if (name === 'mvfunction') {
						functions.push(this.buildMvFunctionObject(attributes));
					}
				}.bind(this)
			});
			parser.write(mvtext);
			parser.end();

			console.log('| parsing...', file);

			var obj = {};
			if (this.include_local_paths) {
				obj.local_path = file;
			}
			obj.distro_path = this.pathToGlobal(file) || this.pathToDistroPath(file);
			obj.functions = functions

			this.mv_files.push(obj);
		}
	},

	/**
	 * Build an Object that contains a function name and parameters, if present.
	 * 
	 * @param {Object} attributes - MvFUNCTION tag XML attributes (name [,parameters])
	 * @return {Object}
	 */
	buildMvFunctionObject: function(attributes) {
		var parameters = [];
		if (attributes.parameters) {
			parameters = attributes.parameters.split(',').map(Function.prototype.call, String.prototype.trim);
		}
		return {
			name: attributes.name,
			parameters: this.makeSpecificParamAdjustments(attributes.name, parameters)
			// return_variable: this.generateReturnVariable(parameters)
		};
	},

	/**
	 * Apply specific rules / adjustments to the parameters array based on an individual basis.
	 * 
	 * @param  {String} name      - The function's name.
	 * @param  {Array} parameters - The parameters array.
	 * @return {Array}            - The adjusted parameters array.
	 */
	makeSpecificParamAdjustments: function(name, parameters) {

		// Function Parameter "Adjustments" For Specific Scenarios
		if (name === 'CurrencyModule_AddFormatting' || name ===  'CurrencyModule_AddFormatPlainText' || name ===  'CurrencyModule_AddFormatPlainTextShort') {
			parameters[0] = 'g.Store:currncy_mod';
		}

		return parameters;
	},

	/**
	 * Determine what variable name to use as the `name=""` attribute on an `<mvt:do>` tag.
	 * 
	 * @param  {Array} parameters - An array of parameters.
	 * @return {String}            - A string representing a MVT variable.
	 */
	/*generateReturnVariable: function(parameters) {
		if (parameters.length === 0) {
			return 'l.success';
		}

		var found = 0;
		for (var parameter of parameters) {
			if (parameter.indexOf(' var') !== -1) {
				found += 1;
			}
		}
		if (found > 0) {
			return 'l.success';
		}
		else {
			return 'l.return';
		}
	},*/

	/**
	 * Get the last matching directory name within a given path.
	 * 
	 * @param  {String} p - The path to parse through.
	 * @return {String}   - The extracted last directory name.
	 */
	pathGetLastDirectory: function(p) {
		var regex = new RegExp('([^' + path.sep + ']*)' + path.sep + '*$');
		return p.match(regex)[1];
	},

	/**
	 * Convert a local LSK path to it's distribution equivalent.
	 * 
	 * @param {string} p - the path to be converted.
	 * @return {string} the parsed distribution path
	 */
	pathToDistroPath: function(p) {
		var short_path = p.split(this.local_path_end)[1];
		var pathinfo = path.parse(short_path);
		var cleanBase = pathinfo.name.replace('mmlsk-', '');
		var compiledExt = pathinfo.ext.replace(/^.mv$/i, '.mvc');

		var output = 'g.Module_Root $'
			output += " '";
			if (pathinfo.dir !== '/' && pathinfo.dir.length > 0) {
				output += pathinfo.dir;
				output += '/';
			}
			output += cleanBase;
			output += compiledExt;
			output += "'";
		return output;
	},

	/**
	 * Convert a LSK path to it's `g.Module_*` variable representation.
	 * 
	 * @param {string} p the path to be converted.
	 * @return {string|boolean} when the passed path is matched to a `g.` variable, else false
	 */
	pathToGlobal: function(p) {
		var global = '';
		var pathinfo = path.parse(p);
		var cleanPathName = pathinfo.name.replace('mmlsk-', '');

		// == g.Module_Merchant
		if ( p.search(new RegExp(path.sep + 'merchant\.mv'), 'i') !== -1 ) {
			global = 'g.Module_Merchant';
			return global;
		}

		// == g.Module_Admin
		if ( p.search(new RegExp(path.sep + 'admin' + path.sep), 'i') !== -1 ) {
			global = 'g.Module_Admin'
			return global;
		}

		// == g.Module_JSON
		if ( p.search(new RegExp(path.sep + 'json' + path.sep), 'i') !== -1 ) {
			global = 'g.Module_JSON';
			return global;
		}
		if ( p.search(new RegExp(path.sep + '(mmlsk-)?json\.mv'), 'i') !== -1 ) {
			global = 'g.Module_JSON';
			return global;
		}

		// == g.Module_Library_DB
		if ( p.search(new RegExp(path.sep + 'lib' + path.sep + '(dbprim|dbeng)' + path.sep), 'i') !== -1 ) {
			global = 'g.Module_Library_DB';
			return global;
		}

		// == g.Module_Library_Utilities
		if ( p.search(new RegExp(path.sep + 'lib' + path.sep + 'util_public\.mv'), 'i') !== -1 ) {
			global = 'g.Module_Library_Utilities';
			return global;
		}
		if ( p.search(new RegExp(path.sep + 'lib' + path.sep + 'util_soap\.mv'), 'i') !== -1 ) {
			global = 'g.Module_Library_Utilities';
			return global;
		}

		// == g.Module_Library_DBAPI
		if ( p.search(new RegExp(path.sep + 'lib' + path.sep + 'dbapi_mivasql\.mv'), 'i') !== -1 ) {
			global = 'g.Module_Library_DBAPI';
			return global;
		}
		if ( p.search(new RegExp(path.sep + 'lib' + path.sep + 'dbapi_public\.mv'), 'i') !== -1 ) {
			global = 'g.Module_Library_DBAPI';
			return global;
		}

		// == g.Module_Library_Native_DBAPI
		if ( p.search(new RegExp(path.sep + 'lib' + path.sep + 'dbapi_mysql\.mv'), 'i') !== -1 ) {
			global = 'g.Module_Library_Native_DBAPI';
			return global;
		}

		// == g.Module_Library_Crypto
		if ( p.search(new RegExp(path.sep + 'lib' + path.sep + 'crypto_public\.mv'), 'i') !== -1 ) {
			global = 'g.Module_Library_DBAPI';
			return global;
		}

		// == g.Module_Feature_*_*
		if ( p.search(new RegExp(path.sep + 'features' + path.sep), 'i') !== -1 ) {
			global = 'g.Module_Feature_' + cleanPathName.toUpperCase();
			return global;
		}

		// == g.Module_Store_Module_Currency
		if ( p.search(new RegExp(path.sep + 'modules' + path.sep + 'currency' + path.sep), 'i') !== -1 ) {
			global = 'g.Module_Store_Module_Currency'
			return global;
		}

		return false;
	}

};

/* --------------- Main Script --------------- */
mv2json.init();


