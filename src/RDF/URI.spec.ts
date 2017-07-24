import {
	STATIC,
	INSTANCE,

	module,
	clazz,
	method,

	hasConstructor,
	isDefined,
	hasMethod,
	hasSignature,
	hasProperty,
	hasDefaultExport,
} from "./../test/JasmineExtender";
import * as Utils from "./../Utils";
import * as ObjectSchema from "./../ObjectSchema";

import * as URI from "./URI";
import DefaultExport from "./URI";

describe( module( "Carbon/RDF/URI" ), ():void => {

	it( isDefined(), ():void => {
		expect( URI ).toBeDefined();
		expect( Utils.isObject( URI ) ).toBe( true );
	} );

	describe( clazz( "Carbon.RDF.URI.Class", "Wrapper class for a URI string value." ), ():void => {

		it( isDefined(), ():void => {
			expect( URI.Class ).toBeDefined();
			expect( Utils.isFunction( URI.Class ) ).toBe( true );
		} );

		it( hasConstructor( [
			{ name: "stringValue", type: "string", description: "The string that represents the URI." },
		] ), ():void => {
			let uri:URI.Class = new URI.Class( "http://example.com/resource/" );

			expect( ! ! uri ).toBe( true );
			expect( uri instanceof URI.Class ).toBe( true );
		} );

		it( hasProperty(
			INSTANCE,
			"stringValue",
			"string",
			"The string value of the URI object."
		), ():void => {
			let uri:URI.Class = new URI.Class( "http://example.com/resource/" );

			expect( uri.stringValue ).toBe( "http://example.com/resource/" );

			uri.stringValue = "http://example.com/another-resource/";
			expect( uri.stringValue ).toBe( "http://example.com/another-resource/" );
		} );

		it( hasMethod(
			INSTANCE,
			"toString",
			"Returns a string that represents the URI of the class.",
			{ type: "string" }
		), ():void => {
			let stringURI:string = "http://example.com/resource/";
			let uri:URI.Class = new URI.Class( stringURI );

			expect( "toString" in uri ).toBe( true );
			expect( Utils.isFunction( uri.toString ) ).toBe( true );

			expect( uri.toString() ).toEqual( stringURI );
		} );


	} );

	describe( clazz( "Carbon.RDF.URI.Util", "Class with useful functions to manage URI strings." ), ():void => {

		it( isDefined(), ():void => {
			expect( URI.Util ).toBeDefined();
			expect( Utils.isFunction( URI.Util ) ).toBe( true );
		} );

		it( hasMethod(
			STATIC,
			"hasFragment",
			"Returns true if the URI provided contains a fragment.", [
				{ name: "uri", type: "string" },
			],
			{ type: "boolean" }
		), ():void => {
			expect( "hasFragment" in URI.Util ).toBe( true );
			expect( Utils.isFunction( URI.Util.hasFragment ) ).toBe( true );

			expect( URI.Util.hasFragment( "http://example.com/resource/#fragment" ) ).toBe( true );
			expect( URI.Util.hasFragment( "prefix:resource/#fragment" ) ).toBe( true );

			expect( URI.Util.hasFragment( "http://example.com/resource/" ) ).toBe( false );
			expect( URI.Util.hasFragment( "prefix:resource/" ) ).toBe( false );
		} );

		it( hasMethod(
			STATIC,
			"hasQuery",
			"Returns true if the URI provided contains query parameters.", [
				{ name: "uri", type: "string" },
			],
			{ type: "boolean" }
		), ():void => {
			expect( "hasQuery" in URI.Util ).toBe( true );
			expect( Utils.isFunction( URI.Util.hasQuery ) ).toBe( true );

			expect( URI.Util.hasQuery( "http://example.com/resource/" ) ).toBe( false );
			expect( URI.Util.hasQuery( "http://example.com/resource/#fragment" ) ).toBe( false );

			expect( URI.Util.hasQuery( "http://example.com/resource/?parameter=true" ) ).toBe( true );
			expect( URI.Util.hasQuery( "http://example.com/resource/#fragment?parameter=true" ) ).toBe( true );
		} );

		it( hasMethod(
			STATIC,
			"hasProtocol",
			"Returns true if the URI provided has a protocol.", [
				{ name: "uri", type: "string" },
			],
			{ type: "boolean" }
		), ():void => {
			expect( "hasProtocol" in URI.Util ).toBe( true );
			expect( Utils.isFunction( URI.Util.hasProtocol ) ).toBe( true );

			expect( URI.Util.hasProtocol( "http://example.com/resource/" ) ).toBe( true );
			expect( URI.Util.hasProtocol( "https://example.com/resource/" ) ).toBe( true );

			expect( URI.Util.hasProtocol( "ftp://example.com/resource/" ) ).toBe( false );
			expect( URI.Util.hasProtocol( "file://example.com/resource/" ) ).toBe( false );
			expect( URI.Util.hasProtocol( "://example.com/resource/" ) ).toBe( false );
			expect( URI.Util.hasProtocol( "/resource/" ) ).toBe( false );
			expect( URI.Util.hasProtocol( "resource/" ) ).toBe( false );
			expect( URI.Util.hasProtocol( "prefix:resource/" ) ).toBe( false );
		} );

		it( hasMethod(
			STATIC,
			"isAbsolute",
			"Returns true if the URI provided is absolute.", [
				{ name: "uri", type: "string" },
			],
			{ type: "boolean" }
		), ():void => {
			expect( "isAbsolute" in URI.Util ).toBe( true );
			expect( Utils.isFunction( URI.Util.isAbsolute ) ).toBe( true );

			expect( URI.Util.isAbsolute( "http://example.com/resoruce/" ) ).toBe( true );
			expect( URI.Util.isAbsolute( "https://example.com/resource/" ) ).toBe( true );
			expect( URI.Util.isAbsolute( "://example.com/resource/" ) ).toBe( true );

			expect( URI.Util.isAbsolute( "/resource/" ) ).toBe( false );
			expect( URI.Util.isAbsolute( "resource/" ) ).toBe( false );
			expect( URI.Util.isAbsolute( "resource/#fragment" ) ).toBe( false );
			expect( URI.Util.isAbsolute( "prefix:resource/" ) ).toBe( false );
		} );

		it( hasMethod(
			STATIC,
			"isRelative",
			"Returns true if the URI provided is relative.", [
				{ name: "uri", type: "string" },
			],
			{ type: "boolean" }
		), ():void => {
			expect( "isRelative" in URI.Util ).toBe( true );
			expect( Utils.isFunction( URI.Util.isRelative ) ).toBe( true );

			expect( URI.Util.isRelative( "resource/" ) ).toBe( true );
			expect( URI.Util.isRelative( "resource/#fragment" ) ).toBe( true );
			expect( URI.Util.isRelative( "/resource/" ) ).toBe( true );
			expect( URI.Util.isRelative( "prefix:resource/" ) ).toBe( true );

			expect( URI.Util.isRelative( "http://example.com/resoruce/" ) ).toBe( false );
			expect( URI.Util.isRelative( "https://example.com/resource/" ) ).toBe( false );
			expect( URI.Util.isRelative( "://example.com/resource/" ) ).toBe( false );
		} );

		it( hasMethod(
			STATIC,
			"isBNodeID",
			"Returns true if the URI provided reference to a BlankNode.", [
				{ name: "uri", type: "string" },
			],
			{ type: "boolean" }
		), ():void => {
			expect( "isBNodeID" in URI.Util ).toBe( true );
			expect( Utils.isFunction( URI.Util.isBNodeID ) ).toBe( true );

			expect( URI.Util.isBNodeID( "_:someIdNumber0123" ) ).toBe( true );

			expect( URI.Util.isBNodeID( "resource/" ) ).toBe( false );
			expect( URI.Util.isBNodeID( "resource/#fragment" ) ).toBe( false );
			expect( URI.Util.isBNodeID( "http://example.com/resoruce/" ) ).toBe( false );
			expect( URI.Util.isBNodeID( "https://example.com/resource/" ) ).toBe( false );
			expect( URI.Util.isBNodeID( "://example.com/resource/" ) ).toBe( false );
			expect( URI.Util.isBNodeID( "/resource/" ) ).toBe( false );
			expect( URI.Util.isBNodeID( "prefix:resource/" ) ).toBe( false );
		} );

		it( hasMethod(
			STATIC,
			"generateBNodeID",
			"Returns an ID for a BlankNode using an universally unique identifier (UUID)."
		), ():void => {
			let id1:string;
			let id2:string;

			id1 = URI.Util.generateBNodeID();
			expect( URI.Util.isBNodeID( id1 ) ).toBe( true );

			id2 = URI.Util.generateBNodeID();
			expect( URI.Util.isBNodeID( id2 ) ).toBe( true );

			expect( id1 ).not.toEqual( id2 );
		} );

		it( hasMethod(
			STATIC,
			"isPrefixed",
			"Returns true if the URI provided has a prefix.", [
				{ name: "uri", type: "string" },
			],
			{ type: "boolean" }
		), ():void => {
			expect( "isPrefixed" in URI.Util ).toBe( true );
			expect( Utils.isFunction( URI.Util.isPrefixed ) ).toBe( true );

			expect( URI.Util.isPrefixed( "prefix:resource/" ) ).toBe( true );

			expect( URI.Util.isPrefixed( "_:someIdNumber0123" ) ).toBe( false );
			expect( URI.Util.isPrefixed( "resource/" ) ).toBe( false );
			expect( URI.Util.isPrefixed( "resource/#fragment" ) ).toBe( false );
			expect( URI.Util.isPrefixed( "http://example.com/resoruce/" ) ).toBe( false );
			expect( URI.Util.isPrefixed( "https://example.com/resource/" ) ).toBe( false );
			expect( URI.Util.isPrefixed( "://example.com/resource/" ) ).toBe( false );
			expect( URI.Util.isPrefixed( "/resource/" ) ).toBe( false );
		} );

		it( hasMethod(
			STATIC,
			"isFragmentOf",
			"Returns true if the first URI is a fragment od the second URI provided.", [
				{ name: "fragmentURI", type: "string" },
				{ name: "uri", type: "string" },
			],
			{ type: "boolean" }
		), ():void => {
			expect( "isFragmentOf" in URI.Util ).toBe( true );
			expect( Utils.isFunction( URI.Util.isFragmentOf ) ).toBe( true );

			let fragmentURI:string = "http://example.com/resource/#fragment";
			let resourceURI:string = "http://example.com/resource/";
			let prefixFragmentURI:string = "prefix:resource/#fragment";
			let prefixResourceURI:string = "prefix:resource/";

			expect( URI.Util.isFragmentOf( fragmentURI, resourceURI ) ).toBe( true );
			expect( URI.Util.isFragmentOf( prefixFragmentURI, prefixResourceURI ) ).toBe( true );

			expect( URI.Util.isFragmentOf( fragmentURI, prefixResourceURI ) ).toBe( false );
			expect( URI.Util.isFragmentOf( prefixFragmentURI, resourceURI ) ).toBe( false );
			expect( URI.Util.isFragmentOf( resourceURI, resourceURI ) ).toBe( false );
			expect( URI.Util.isFragmentOf( prefixResourceURI, prefixResourceURI ) ).toBe( false );
			expect( URI.Util.isFragmentOf( resourceURI, fragmentURI ) ).toBe( false );
			expect( URI.Util.isFragmentOf( prefixResourceURI, prefixFragmentURI ) ).toBe( false );
		} );

		it( hasMethod(
			STATIC,
			"isBaseOf",
			"Return true if the first URI is parent of the second URI provided.", [
				{ name: "baseURI", type: "string" },
				{ name: "uri", type: "string" },
			],
			{ type: "boolean" }
		), ():void => {
			expect( "isBaseOf" in URI.Util ).toBe( true );
			expect( Utils.isFunction( URI.Util.isBaseOf ) ).toBe( true );

			let namespaceURI:string = "http://example.com/resource/#";
			let fragmentURI:string = "http://example.com/resource/#fragment";
			let childURI:string = "http://example.com/resource/child/";
			let resourceURI:string = "http://example.com/resource/";
			let prefixFragmentURI:string = "prefix:resource/#fragment";
			let prefixResourceURI:string = "prefix:resource/";
			let prefixChildURI:string = "prefix:resource/child/";
			let anotherURI:string = "http://another_example.com/resource/";
			let prefixAnotherURI:string = "another_prefix:resource";

			expect( URI.Util.isBaseOf( namespaceURI, fragmentURI ) ).toBe( true );
			expect( URI.Util.isBaseOf( resourceURI, fragmentURI ) ).toBe( true );
			expect( URI.Util.isBaseOf( resourceURI, childURI ) ).toBe( true );
			expect( URI.Util.isBaseOf( prefixResourceURI, prefixFragmentURI ) ).toBe( true );
			expect( URI.Util.isBaseOf( prefixResourceURI, prefixChildURI ) ).toBe( true );

			expect( URI.Util.isBaseOf( anotherURI, fragmentURI ) ).toBe( false );
			expect( URI.Util.isBaseOf( anotherURI, childURI ) ).toBe( false );
			expect( URI.Util.isBaseOf( prefixAnotherURI, prefixFragmentURI ) ).toBe( false );
			expect( URI.Util.isBaseOf( prefixAnotherURI, prefixChildURI ) ).toBe( false );

			expect( URI.Util.isBaseOf( resourceURI, resourceURI ) ).toBe( true );
			expect( URI.Util.isBaseOf( prefixResourceURI, prefixResourceURI ) ).toBe( true );

			expect( URI.Util.isBaseOf( resourceURI, anotherURI ) ).toBe( false );
			expect( URI.Util.isBaseOf( prefixResourceURI, prefixAnotherURI ) ).toBe( false );

			expect( URI.Util.isBaseOf( "http://example.com/resource", "/relative" ) ).toBe( true );
			expect( URI.Util.isBaseOf( "http://example.com/resource", "/relative/" ) ).toBe( true );
			expect( URI.Util.isBaseOf( "http://example.com/resource", "relative/" ) ).toBe( true );
			expect( URI.Util.isBaseOf( "http://example.com/resource", "relative" ) ).toBe( true );
		} );

		it( hasMethod(
			STATIC,
			"getRelativeURI",
			"Returns the relative URI from a base URI provided.", [
				{ name: "absoluteURI", type: "string" },
				{ name: "base", type: "string" },
			],
			{ type: "string" }
		), ():void => {
			expect( "getRelativeURI" in URI.Util ).toBe( true );
			expect( Utils.isFunction( URI.Util.getRelativeURI ) ).toBe( true );

			let childURI:string = "http://example.com/resource/child/";
			let resourceURI:string = "http://example.com/resource/";
			let anotherURI:string = "http://another_example.com/resource/";
			let relativeURI:string = "child/";

			expect( URI.Util.getRelativeURI( childURI, resourceURI ) ).toBe( relativeURI );

			expect( URI.Util.getRelativeURI( relativeURI, resourceURI ) ).toBe( relativeURI );
			expect( URI.Util.getRelativeURI( childURI, anotherURI ) ).toBe( childURI );
		} );

		it( hasMethod(
			STATIC,
			"getDocumentURI",
			"Returns the URI that just reference to the Document of the URI provided.", [
				{ name: "uri", type: "string" },
			]
		), ():void => {
			expect( "getDocumentURI" in URI.Util ).toBe( true );
			expect( Utils.isFunction( URI.Util.getDocumentURI ) ).toBe( true );

			let documentURI:string = "http://example.com/resource/";
			let fragmentURI:string = "http://example.com/resource/#fragment";
			let relativeDocumentURI:string = "resource/";
			let relativeFragmentURI:string = "resource/#fragment";
			let prefixDocumentURI:string = "prefix:resource/";
			let prefixFragmentURI:string = "prefix:resource/#fragment";
			let errorURI:string = "http://example.com/resource/#fragment#anotherFragment";

			expect( URI.Util.getDocumentURI( fragmentURI ) ).toEqual( documentURI );
			expect( URI.Util.getDocumentURI( documentURI ) ).toEqual( documentURI );
			expect( URI.Util.getDocumentURI( relativeFragmentURI ) ).toEqual( relativeDocumentURI );
			expect( URI.Util.getDocumentURI( relativeDocumentURI ) ).toEqual( relativeDocumentURI );
			expect( URI.Util.getDocumentURI( prefixFragmentURI ) ).toEqual( prefixDocumentURI );
			expect( URI.Util.getDocumentURI( prefixDocumentURI ) ).toEqual( prefixDocumentURI );

			expect( URI.Util.getDocumentURI.bind( null, errorURI ) ).toThrowError( /IllegalArgument/ );
		} );

		it( hasMethod(
			STATIC,
			"getFragment",
			"Returns the name of the fragment in the URI provided. If no fragment exists in the URI, null will be returned.", [
				{ name: "uri", type: "string" },
			],
			{ type: "string" }
		), ():void => {
			expect( "getFragment" in URI.Util ).toBe( true );
			expect( Utils.isFunction( URI.Util.getFragment ) ).toBe( true );

			let documentURI:string = "http://example.com/resource/";
			let fragmentURI:string = "http://example.com/resource/#fragment";
			let relativeDocumentURI:string = "resource/";
			let relativeFragmentURI:string = "resource/#fragment";
			let fragmentName:string = "fragment";
			let errorURI:string = "http://example.com/resource/#fragment#anotherFragment";
			let prefixDocumentURI:string = "prefix:resource/";
			let prefixFragmentURI:string = "prefix:resource/#fragment";

			expect( URI.Util.getFragment( fragmentURI ) ).toEqual( fragmentName );
			expect( URI.Util.getFragment( relativeFragmentURI ) ).toEqual( fragmentName );
			expect( URI.Util.getFragment( prefixFragmentURI ) ).toEqual( fragmentName );

			expect( URI.Util.getFragment( documentURI ) ).toBeNull();
			expect( URI.Util.getFragment( relativeDocumentURI ) ).toBeNull();
			expect( URI.Util.getFragment( prefixDocumentURI ) ).toBeNull();

			expect( URI.Util.getDocumentURI.bind( null, errorURI ) ).toThrowError( /IllegalArgument/ );
		} );

		it( hasMethod(
			STATIC,
			"getSlug",
			"Returns the slug of the URI. It takes an ending slash as part as the slug.", [
				{ name: "uri", type: "string" },
			],
			{ type: "string" }
		), ():void => {
			// Property integrity
			(() => {
				expect( "getSlug" in URI.Util ).toEqual( true );
				expect( Utils.isFunction( URI.Util.getSlug ) ).toEqual( true );
			})();

			expect( URI.Util.getSlug( "http://example.com/resource" ) ).toEqual( "resource" );
			expect( URI.Util.getSlug( "http://example.com/resource/" ) ).toEqual( "resource/" );
			expect( URI.Util.getSlug( "http://example.com/resource-1/resource-2/resource-3" ) ).toEqual( "resource-3" );
			expect( URI.Util.getSlug( "http://example.com/resource-1/resource-2/resource-3/" ) ).toEqual( "resource-3/" );
			expect( URI.Util.getSlug( "resource-1/resource-2/resource-3" ) ).toEqual( "resource-3" );
			expect( URI.Util.getSlug( "resource-1/resource-2/resource-3/" ) ).toEqual( "resource-3/" );
			expect( URI.Util.getSlug( "" ) ).toEqual( "" );
			expect( URI.Util.getSlug( "/" ) ).toEqual( "/" );
			expect( URI.Util.getSlug( "http://example.com/resource#fragment" ) ).toEqual( "fragment" );
			expect( URI.Util.getSlug( "http://example.com/resource#fragment/" ) ).toEqual( "fragment/" );
			expect( URI.Util.getSlug( "http://example.com/resource-1#fragment-2/fragment-3" ) ).toEqual( "fragment-3" );
			expect( URI.Util.getSlug( "http://example.com/resource-1#fragment-2/fragment-3/" ) ).toEqual( "fragment-3/" );
			expect( URI.Util.getSlug( "resource-1#fragment-2/fragment-3" ) ).toEqual( "fragment-3" );
			expect( URI.Util.getSlug( "resource-1#fragment-2/fragment-3/" ) ).toEqual( "fragment-3/" );
			expect( URI.Util.getSlug( "#" ) ).toEqual( "" );
			expect( URI.Util.getSlug( "#/" ) ).toEqual( "/" );
		} );

		it( hasMethod(
			STATIC,
			"getParameters",
			"Returns the query parameters of the URI provided in form of a Map.", [
				{ name: "uri", type: "string" },
			],
			{ type: "Map<string, string | string[]>" }
		), ():void => {
			expect( URI.Util.getParameters ).toBeDefined();
			expect( Utils.isFunction( URI.Util.getParameters ) ).toEqual( true );

			let parameters:Map<string, string | string[]>;

			parameters = URI.Util.getParameters( "http://example.com/resource/" );
			expect( parameters instanceof Map ).toBe( true );
			expect( parameters.size ).toBe( 0 );

			parameters = URI.Util.getParameters( "http://example.com/resource/#fragment" );
			expect( parameters instanceof Map ).toBe( true );
			expect( parameters.size ).toBe( 0 );

			parameters = URI.Util.getParameters( "http://example.com/resource/?parameter=true" );
			expect( parameters instanceof Map ).toBe( true );
			expect( parameters.size ).toBe( 1 );
			expect( parameters.get( "parameter" ) ).toBe( "true" );

			parameters = URI.Util.getParameters( "http://example.com/resource/#fragment?parameter=true" );
			expect( parameters instanceof Map ).toBe( true );
			expect( parameters.size ).toBe( 1 );
			expect( parameters.get( "parameter" ) ).toBe( "true" );

			parameters = URI.Util.getParameters( "http://example.com/resource/?parameter=true&some=1&some=2" );
			expect( parameters instanceof Map ).toBe( true );
			expect( parameters.size ).toBe( 2 );
			expect( parameters.get( "parameter" ) ).toBe( "true" );
			expect( parameters.get( "some" ) ).toEqual( [ "1", "2" ] );

			parameters = URI.Util.getParameters( "http://example.com/resource/#fragment?parameter=true&some=1&some=2" );
			expect( parameters instanceof Map ).toBe( true );
			expect( parameters.size ).toBe( 2 );
			expect( parameters.get( "parameter" ) ).toBe( "true" );
			expect( parameters.get( "some" ) ).toEqual( [ "1", "2" ] );
		} );

		it( hasMethod(
			STATIC,
			"resolve",
			"Return a URI formed from a parent URI and a relative child URI.", [
				{ name: "parentURI", type: "string" },
				{ name: "childURI", type: "string" },
			],
			{ type: "string" }
		), ():void => {
			expect( "resolve" in URI.Util ).toBe( true );
			expect( Utils.isFunction( URI.Util.resolve ) ).toBe( true );

			expect( URI.Util.resolve( "", "http://example.com/resource/" ) ).toEqual( "http://example.com/resource/" );
			expect( URI.Util.resolve( "", "child/" ) ).toEqual( "child/" );

			expect( URI.Util.resolve( "http://example.com/resource/", "/child/" ) ).toEqual( "http://example.com/resource/child/" );
			expect( URI.Util.resolve( "http://example.com/resource", "/child/" ) ).toEqual( "http://example.com/child/" );

			expect( URI.Util.resolve( "http://example.com/resource/", "child/" ) ).toEqual( "http://example.com/resource/child/" );
			expect( URI.Util.resolve( "http://example.com/resource", "child/" ) ).toEqual( "http://example.com/child/" );

			expect( URI.Util.resolve( "http://example.com/resource/", "#child" ) ).toEqual( "http://example.com/resource/#child" );
			expect( URI.Util.resolve( "http://example.com/resource", "#child" ) ).toEqual( "http://example.com/resource#child" );


			expect( URI.Util.resolve( "http://example.com/", "/child" ) ).toEqual( "http://example.com/child" );
			expect( URI.Util.resolve( "http://example.com", "/child" ) ).toEqual( "http://example.com/child" );

			expect( URI.Util.resolve( "http://example.com/", "child" ) ).toEqual( "http://example.com/child" );
			expect( URI.Util.resolve( "http://example.com", "child" ) ).toEqual( "http://example.com/child" );

			expect( URI.Util.resolve( "http://example.com/", "#child" ) ).toEqual( "http://example.com/#child" );
			expect( URI.Util.resolve( "http://example.com", "#child" ) ).toEqual( "http://example.com/#child" );


			expect( URI.Util.resolve( "http://example.com/resource#", "#child" ) ).toEqual( "http://example.com/resource#child" );
			expect( URI.Util.resolve( "http://example.com/resource#some", "#child" ) ).toEqual( "http://example.com/resource#child" );
			expect( URI.Util.resolve( "http://example.com/resource#some", "child#another" ) ).toEqual( "http://example.com/child#another" );

			expect( URI.Util.resolve( "http://example.com/resource#", "?child" ) ).toEqual( "http://example.com/resource?child" );
			expect( URI.Util.resolve( "http://example.com/resource#some", "?child" ) ).toEqual( "http://example.com/resource#some?child" );

			expect( URI.Util.resolve( "http://example.com/resource?some", "?child" ) ).toEqual( "http://example.com/resource?child" );
			expect( URI.Util.resolve( "http://example.com/resource?some", "#child?another" ) ).toEqual( "http://example.com/resource#child?another" );


			expect( URI.Util.resolve( "http://example.com/resource/", "http://example.com/resource/child/" ) ).toEqual( "http://example.com/resource/child/" );
			expect( URI.Util.resolve( "http://example.com/resource/", "prefix:resource" ) ).toEqual( "prefix:resource" );
			expect( URI.Util.resolve( "http://example.com/resource/", "_:some-random-id" ) ).toEqual( "_:some-random-id" );
		} );

		it( hasMethod(
			STATIC,
			"removeProtocol",
			"Removes the protocol of the URI provided", [
				{ name: "uri", type: "string" },
			],
			{ type: "string" }
		), ():void => {
			expect( "removeProtocol" in URI.Util ).toBe( true );
			expect( Utils.isFunction( URI.Util.removeProtocol ) ).toBe( true );

			let URI1:string = "http://example.com/resource";
			let URI2:string = "https://example.com/resource";
			let URI3:string = "resource/child/";
			let resultURI:string = "://example.com/resource";
			let prefixURI:string = "prefix:resource/";

			expect( URI.Util.removeProtocol( URI1 ) ).toEqual( resultURI );
			expect( URI.Util.removeProtocol( URI2 ) ).toEqual( resultURI );
			expect( URI.Util.removeProtocol( URI3 ) ).toEqual( URI3 );
			expect( URI.Util.removeProtocol( resultURI ) ).toEqual( resultURI );
			expect( URI.Util.removeProtocol( prefixURI ) ).toEqual( prefixURI );
		} );

		describe( method(
			STATIC,
			"prefix"
		), ():void => {

			it( hasSignature(
				"Replace a base of a URI with the prefix provided. If the prefix can not be resolved, the URI provided will be returned.", [
					{ name: "uri", type: "string" },
					{ name: "prefix", type: "string" },
					{ name: "prefixURI", type: "string" },
				],
				{ type: "string" }
			), ():void => {
				expect( "prefix" in URI.Util ).toBe( true );
				expect( Utils.isFunction( URI.Util.prefix ) ).toBe( true );

				let resourceURI:string = "http://example.com/resource/";
				let anotherResourceURI:string = "http://example.com/another_resource/";
				let prefixURI:string = "http://example.com/";
				let anotherPrefixURI:string = "http://another_example.com/";
				let prefix:string = "prefix";
				let anotherPrefix:string = "another_prefix";
				let prefixResourceURI:string = "prefix:resource/";

				expect( URI.Util.prefix( resourceURI, prefix, prefixURI ) ).toBe( prefixResourceURI );
				expect( URI.Util.prefix( prefixResourceURI, prefix, prefixURI ) ).toBe( prefixResourceURI );
				expect( URI.Util.prefix( prefixResourceURI, anotherPrefix, prefix ) ).toBe( prefixResourceURI );

				expect( URI.Util.prefix( resourceURI, prefix, anotherPrefixURI ) ).toBe( resourceURI );
				expect( URI.Util.prefix( anotherResourceURI, prefix, anotherPrefixURI ) ).toBe( anotherResourceURI );
			} );

			it( hasSignature(
				"Replace the base of a URI with a prefix in accordance with the ObjectSchema provided. If the prefix can not be resolved, the URI provided will be returned.", [
					{ name: "uri", type: "string" },
					{ name: "objectSchema", type: "Carbon.ObjectSchema.DigestedObjectSchema" },
				],
				{ type: "string" }
			), ():void => {
				expect( "prefix" in URI.Util ).toBe( true );
				expect( Utils.isFunction( URI.Util.prefix ) ).toBe( true );


				let resourceURI:string = "http://example.com/resource/";
				let anotherResourceURI:string = "http://another_example.com/resource/";
				let prefixResourceURI:string = "prefix:resource/";

				let schema:ObjectSchema.Class = {
					"xsd": "http://www.w3.org/2001/XMLSchema#",
					"prefix": "http://example.com/",
					"some_resource": {
						"@id": "prefix:some_resource",
						"@type": "@id",
					},
				};
				let anotherSchema:ObjectSchema.Class = {
					"xsd": "http://www.w3.org/2001/XMLSchema#",
					"another_prefix": "http://another_example.com/",
					"some_resource": {
						"@id": "prefix:some_resource",
						"@type": "@id",
					},
				};
				let digestedSchema:ObjectSchema.DigestedObjectSchema = ObjectSchema.Digester.digestSchema( schema );
				let anotherDigestedSchema:ObjectSchema.DigestedObjectSchema = ObjectSchema.Digester.digestSchema( anotherSchema );

				expect( URI.Util.prefix( resourceURI, digestedSchema ) ).toBe( prefixResourceURI );
				expect( URI.Util.prefix( resourceURI, anotherDigestedSchema ) ).toBe( resourceURI );
				expect( URI.Util.prefix( anotherResourceURI, digestedSchema ) ).toBe( anotherResourceURI );
				expect( URI.Util.prefix( prefixResourceURI, digestedSchema ) ).toBe( prefixResourceURI );
			} );

		} );

	} );

	it( hasDefaultExport( "Carbon.RDF.URI.Class" ), ():void => {
		expect( DefaultExport ).toBeDefined();
		expect( DefaultExport ).toBe( URI.Class );
	} );

} );
