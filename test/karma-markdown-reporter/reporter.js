"use strict";

var fs = require( "fs" );
var glob = require( "glob" );
var path = require( "path" );
var Handlebars = require( "handlebars" );
var swag = require( "swag" );
swag.registerHelpers( Handlebars );

(() => {
	Handlebars.registerHelper( "new-line", () => {
		return "\n";
	} );
	Handlebars.registerHelper( "trim", str => {
		str = str || "";
		return str.replace( /\t/g, '' );
	} );
})();

var MarkdownReporter = (() => {
	var docsData;
	var template;
	var destFile;

	function isJSON( description ) {
		return description && description.indexOf( "JSON" ) === 0;
	}

	// Parse the string data of a suite or spec
	function parseData( data ) {
		if( isJSON( data ) ) {
			data = data.substring( 4 );
			try {
				return JSON.parse( data );
			} catch( error ) {
				console.warn( error );
			}
		}
		return { name: data };
	}

	// Obtains or generate the object for store and arrange the specs data
	function getContainer( parent, data, isSuite ) {
		if( "suiteType" in data || isSuite ) {
			return composeSuite( parent, data );
		} else {
			return composeSpec( parent, data );
		}
	}

	function composeSuite( parent, suite ) {
		var name = suite.name;
		var type = suite.suiteType;
		delete suite.suiteType;

		switch( type ) {
			case "module":
				suite.path = suite.name;
				suite.name = suite.path.split( "/" ).pop();
				break;

			case "class":
				parent = parent[ "classes" ] || ( parent[ "classes" ] = {} );
				suite.path = suite.name;
				suite.name = suite.path.split( "." ).pop();
				break;

			case "interface":
				parent = parent[ "interfaces" ] || ( parent[ "interfaces" ] = {} );
				suite.path = suite.name;
				suite.name = suite.path.split( "." ).pop();
				break;

			case "constructor":
				return parent[ "constructors" ] || ( parent[ "constructors" ] = suite );

			case "method":
				parent = parent[ "methods" ] || ( parent[ "methods" ] = {} );

				if( suite.access !== null ) {
					parent = parent[ suite.access ] || ( parent[ suite.access ] = {} );
				}
				break;

			case "decoratedObject":
				return parent[ "decorated-object" ] || ( parent[ "decorated-object" ] = suite );

			case "enum":
				parent = parent[ "enums" ] || ( parent[ "enums" ] = {} );
				break;

			default:
				name = name.replace( " ", "-" );
		}

		return parent[ name ] || ( parent[ name ] = suite );
	}

	function composeSpec( parent, spec ) {
		var signatures;
		var type = spec.specType;
		delete spec.specType;

		switch( type ) {
			case "constructor":
				var constructors = parent[ "constructors" ] || ( parent[ "constructors" ] = {} );
				signatures = constructors[ "signatures" ] || ( constructors[ "signatures" ] = [] );

				signatures.push( spec );
				break;

			case "method":
				var methods = parent[ "methods" ] || ( parent[ "methods" ] = {} );

				if( spec.access !== null ) {
					methods = methods[ spec.access ] || ( methods[ spec.access ] = {} );
				}

				var method = methods[ spec.name ] = { name: spec.name };

				signatures = method[ "signatures" ] || ( method[ "signatures" ] = [] );
				signatures.push( spec );
				break;

			case "property":
				var properties = parent[ "properties" ] || ( parent[ "properties" ] = {} );

				if( spec.access !== null ) {
					properties = properties[ spec.access ] || ( properties[ spec.access ] = {} );
				}

				properties[ spec.name ] = spec;
				break;

			case "signature":
				signatures = parent[ "signatures" ] || ( parent[ "signatures" ] = [] );
				signatures.push( spec );

				if( ! spec.description )
					spec.description = parent.description;

				break;

			case "super-class":
				var superClasses = parent[ "super-classes" ] || ( parent[ "super-classes" ] = [] );
				superClasses.push( spec );
				break;

			case "reexports":
				var reexports = parent[ "reexports" ] || ( parent[ "reexports" ] = [] );
				reexports.push( spec );
				break;

			case "defaultExport":
				parent[ "default-export" ] = spec;
				break;

			case "enum":
				var enumerals = parent[ "enumerals" ] || ( parent[ "enumerals" ] = [] );
				enumerals.push( spec );
				break;

			default:
				var name = spec.name.replace( " ", "-" );
				parent[ name ] = true;
				break;
		}

		return spec;
	}

	function specSuccess() {

	}

	function specSkipped() {

	}

	function specFailure() {

	}

	/**
	 *
	 * @param browser
	 * @param {Object} result
	 * @param {string} result.description
	 * @param {string} result.id
	 * @param {boolean} result.skipped
	 * @param {boolean} result.success
	 * @param {string[]} result.suite - Suites the spec belongs to, from top to bottom
	 */
	function onSpecComplete( browser, result ) {
	}

	function onRunStart( browsers, server ) {
		docsData = {};
	}

	/**
	 *
	 * @param browser
	 * @param {Object} results
	 * @param {Object} results.specs - A map-object like containing a property per suite, each property points to another map-object like constructing the spec tree
	 * @param {string[]} results.specs._ - A list of all the specs of the suite
	 * @param server
	 */
	function onBrowserStart( browser, results, server ) {
		parseSpecs( docsData, results.specs );
		// fs.writeFileSync( "doc/data.json", JSON.stringify( docsData ), "utf8" );
	}

	function parseSpecs( parent, specs ) {
		let container;
		let data;
		for( let key of Object.keys( specs ) ) {
			data = parseData( key );
			container = getContainer( parent, data, true );
			for( let spec of specs[ key ]._ ) {
				data = parseData( spec );
				getContainer( container, data, false );
			}
			delete specs[ key ]._;
			parseSpecs( container, specs[ key ] );

			sortObjectProperty( container, "classes" );
			sortObjectProperty( container, "reexports" );
			sortObjectProperty( container, "enums" );
			sortObjectProperty( container, "methods", "instance" );
			sortObjectProperty( container, "methods", "static" );
			sortObjectProperty( container, "properties", "instance" );
			sortObjectProperty( container, "properties", "static" );
		}
	}

	/**
	 *
	 * @param browsers
	 * @param {Object} overallResults - Results of the complete testsuite
	 * @param {boolean} overallResults.disconnected
	 * @param {boolean} overallResults.error
	 * @param {int} overallResults.exitCode
	 * @param {int} overallResults.failed - Number of tests failed
	 * @param {int} overallResults.success - Number of successful tests
	 * @param server
	 */
	function onRunComplete( browsers, overallResults, server ) {
		var data = sortObject( docsData );
		var outData = template( { modules: data } );
		fs.writeFileSync( destFile, outData, "utf8" );
	}

	function sortObjectProperty( object, property, extra ) {
		if( ! object[ property ] ) return;
		var propertyObject = object[ property ];

		if( ! ! extra ) {
			if( ! propertyObject[ extra ] ) return;
			object = propertyObject;
			property = extra;

			propertyObject = propertyObject[ extra ];
		}

		if( Array.isArray( propertyObject ) )
			return propertyObject.sort( function( a, b ) {
				return a.name.localeCompare( b.name )
			} );

		return object[ property ] = sortObject( propertyObject );
	}

	function sortObject( object ) {
		var keys = Object.keys( object ).sort();
		var result = [];
		for( var key of keys ) {
			result.push( object[ key ] );
		}
		return result;
	}

	function obtainConfig( config, name ) {
		if( config[ name ] )
			return config[ name ];

		throw new Error( `No ${name} configuration provided.` );
	}

	function addPartials( partials ) {
		var partial;

		if( typeof partials === "object" ) {
			for( var key of Object.keys( partials ) ) {
				partial = partials[ key ];
				if( partial.src ) {
					partial = fs.readFileSync( partial.src, "utf8" );
				}
				Handlebars.registerPartial( key, partial );
			}

		} else if( typeof partials === "string" ) {
			glob( partials, function( err, files ) {
				if( err ) throw  err;

				for( var file of files ) {
					partial = fs.readFileSync( file, "utf8" );
					Handlebars.registerPartial( path.basename( file, ".hbs" ), partial );
				}
			} );
		} else {
			throw new Error( "Partials configuration malformed. Partial no recognized: " + partials );
		}
	}

	var MarkdownReporter = function( config ) {
		config = config.markdownReporter || {};
		var src = obtainConfig( config, "src" );
		destFile = obtainConfig( config, "dest" );

		src = fs.readFileSync( src, "utf8" );
		template = Handlebars.compile( src );

		var partials = Array.isArray( config.partials ) ? config.partials : [ config.partials ];
		for( var partial of partials ) {
			addPartials( partial );
		}

		// this.specSuccess = specSuccess;
		// this.specSkipped = specSkipped;
		// this.specFailure = specFailure;
		// this.onSpecComplete = onSpecComplete;
		this.onRunStart = onRunStart;
		this.onBrowserStart = onBrowserStart;
		this.onRunComplete = onRunComplete;
	};
	MarkdownReporter.$inject = [ "config" ];

	return MarkdownReporter;
})();

module.exports = {
	"reporter:markdown": [ "type", MarkdownReporter ]
};
