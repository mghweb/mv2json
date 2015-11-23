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
				if (pathinfo.ext === '.json') {
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

		this.mv_functions = [];
		this.output_file = _OUTPUT_FILE;

	},

	done: function() {
		fse.ensureFileSync(this.output_file);
		fse.writeFile(this.output_file, JSON.stringify(this.mv_functions), function(err) {
			if (err) {
				return console.err(err);
			}
			console.log('Done!');
		});
	},

	parseDirectory: function(dir) {
		fse.walk(dir).on('data', function(item) {
			this.parseFile(item.path);
		}.bind(this)).on('end', function() {
			this.done();
		}.bind(this));
	},

	parseFile: function(file) {
		var pathinfo = path.parse(file);
		if (pathinfo.ext === '.mv') {
			var mvtext = fse.readFileSync(file);
			var parser = new htmlparser.Parser({
				onopentag: function(name, attributes) {
					if (name === 'mvfunction') {
						this.buildMvFunctionObject(file, attributes);
					}
				}.bind(this)
			});
			parser.write(mvtext);
			parser.end();
		}
	},

	/**
	 * Build an Object that contains a local path, distribution path, function name and parameters (if present).
	 * 
	 * @param {string} p - the path to be parsed into local/distribution versions
	 * @param {Object} attributes - MvFUNCTION tag XML attributes (name [,parameters])
	 */
	buildMvFunctionObject: function(p, attributes) {
		var obj = {
			local_path: p,
			distro_path: this.pathToDistroPath(p),
			name: attributes.name,
			parameters: attributes.parameters
		}
		this.mv_functions.push(obj);
	},

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

};

/* --------------- Main Script --------------- */
mv2json.init();




