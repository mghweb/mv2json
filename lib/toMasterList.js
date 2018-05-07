'use strict';

// Modules
const fs = require('fs');

// Variables
const basePath = ( process.env.HOME ) + '/Library/Application Support/Sublime Text 3/Packages/Miva IDE/functions-merchant.json';

// Script
fs.readFile( basePath , 'utf8', function( err, json ) {
	if ( err ) return console.error( err );

	let files = JSON.parse( json );

	files.map(function( file ) {
		if ( file.functions == undefined ) return false;

		file.functions.map(function( fn ) {

			console.log(
				`<mvt:do file="${ file.distro_path }" name="l.success"' value="${ fn.name }( ${ fn.parameters.join( ' ' ) } )" />`
			);

		});

	});

});