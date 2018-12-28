const requestPromise = require( 'request-promise' );
const $ = require( 'cheerio' );
const baseUrl = 'http://www.mivascript.com/item/';

const functionList = [
	'evp_pkey_derive',
	'evp_pkey_load_pubkey_mem',
	'evp_pkey_load_mem',
	'pkcs7_free',
	'pkcs7_verify',
	'pkcs7_get_certs',
	'pkcs7_load_mem',
	'crypto_evp_encrypt_auth',
	'x509_pubkey_digest',
	'x509_digest',
	'x509_get_extensions',
	'x509_get_issuer_name',
	'x509_get_subject_name',
	'x509_load_mem',
	'evp_pkey_load_pubkey_x509',
	'crypto_evp_verify',
	'crypto_evp_sign',
	'crypto_clear_error',
	'crypto_next_error',
	'crypto_next_error',
	'file_set_time'
];

const parseHTML = function( html ) {

	return $( '.item-description > pre', html ).text();

};

const parseFunctionParameters = function( data ) {

	if ( data == undefined ) {
		return false;
	}

	let matches = data.text.match( /(?<=\()(.*)(?=\))/gi );

	let parameterText = matches[ 0 ];

	let parameters = [];
	parameters = parameterText.split( ',' );
	parameters = parameters.map( ( x ) => x.trim() );

	return { ...data, parameters: parameters };

};

const buildAutocomplete = function( fn ) {

	const len = (fn.parameters.length - 1);

	const paramText = fn.parameters.reduce(function( str, current, index ) {

		let sep = ( index < len ) ? ', ' : '';

		return str += '${' + (index + 1) + ':' + current + '}' + sep;

	}, '');

	return `{ "trigger": "${ fn.name }", "contents": "${ fn.name }( ${ paramText } )" },`;

};

const makeRequest = function( functionName, data ) {

	return new Promise(function( resolve, reject ) {

		let url = baseUrl + functionName + '.html';

		console.log( '———— loading url ... ' + url );

		return requestPromise( url )
		.then(function( html ) {

			let foundHTML = parseHTML( html );

			if ( foundHTML ) {

				data.push( { name: functionName, text: foundHTML } );
				resolve( data );

			}
			else {

				reject( 'Could not find HTML fragment' );

			}
			

		})
		.catch(function( err ) {

			console.error( err, functionName );

		});

	});

};

const run = function( functionList ) {

	let data = [];

	return functionList.reduce(function( promise, functionName ) {
		
		return promise.then(function() {

			return makeRequest( functionName, data );
		
		});

	}, Promise.resolve());

};

run( functionList )
.then(function( foundFunctions ) {

	console.log( '———————————————————————————————— ' );

	for ( let data of foundFunctions ) {

		let fn = parseFunctionParameters( data );

		let builtAutocomplete = buildAutocomplete( fn );

		console.log( builtAutocomplete );

	}

});

/*


assignAdditionalCustomfields(self, data) {

		console.log('└── Getting Additional Customfield Data...');

		return data.itemSets.reduce(function(promise, itemSet) {
			return promise.then(function() {
				return self.getAdditionalAttributes(self, data, itemSet);
			});
		}, Promise.resolve());
	}

 */