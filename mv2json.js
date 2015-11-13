/* Max Hegler @ 2015
 * Mv to JSON
 * - Extract MvFUNCTION tag information to JSON format for use in autocompletion / documentation. 
 */

/* --------------- Define Dependencies --------------- */
var fs = require('fs');

/* --------------- Define Global Variables --------------- */
var _MVDIR = null,
	_MVFILE = null;

/* --------------- Process Arguments --------------- */
var cmdArguments = process.argv.slice(2);
if (cmdArguments.length > 0) {
	cmdArguments.forEach(function(value, index, array) {
		
		if (index === 0) {
			try {
				var stats = fs.lstatSync(value);
				if (stats.isDirectory()) {

				}
				else if (stats.isFile()) {

				}
				else {
					throw new Error('No such file or directory.');
				}
			}
			catch (e) {
				throw new Error('No such file or directory.');
			}
		}

	});
}
