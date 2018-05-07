'use strict';

// Modules
const fs = require('fs');

// Variables
const basePath = ( process.env.HOME ) + '/Library/Application Support/Sublime Text 3/Packages/Miva IDE/functions-merchant.json';
let uniqueFunctions = new Set();

// Script
fs.readFile( basePath , 'utf8', function( err, json ) {
	if ( err ) return console.error( err );

	let files = JSON.parse( json );

	files.map(function( file ) {
		if ( file.functions == undefined ) return false;

		file.functions.map(function( fn ) {

			uniqueFunctions.add( fn.name );

		});

	});

	console.log(
		Array.from( uniqueFunctions ).join( '|' )
	);

});