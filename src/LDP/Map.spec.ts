import {
	STATIC,

	OBLIGATORY,

	module,
	clazz,
	interfaze,

	isDefined,
	hasMethod,
	hasProperty,
	extendsClass,
	hasDefaultExport,
} from "../test/JasmineExtender";
import * as NS from "./../NS";
import * as Resource from "./../Resource";
import * as Utils from "./../Utils";

import * as Map from "./Map";
import DefaultExport from "./Map";

describe( module( "Carbon/LDP/Map" ), ():void => {

	it( isDefined(), ():void => {
		expect( Map ).toBeDefined();
		expect( Utils.isObject( Map ) ).toBe( true );
	} );

	it( hasProperty(
		STATIC,
		"RDF_CLASS",
		"string"
	), ():void => {
		expect( Map.RDF_CLASS ).toBeDefined();
		expect( Utils.isString( Map.RDF_CLASS ) ).toBe( true );

		expect( Map.RDF_CLASS ).toBe( NS.C.Class.Map );
	} );

	it( hasProperty(
		STATIC,
		"SCHEMA",
		"Carbon.ObjectSchema.Class"
	), ():void => {
		expect( Map.SCHEMA ).toBeDefined();
		expect( Utils.isObject( Map.SCHEMA ) ).toBe( true );

		expect( Map.SCHEMA as { [key:string]:object } ).toEqual( {
			entries: jasmine.any( Object ),
		} );

		expect( Map.SCHEMA[ "entries" ] ).toEqual( {
			"@id": NS.C.Predicate.entry,
			"@type": "@id",
			"@container": "@set",
		} );

	} );

	describe( interfaze(
		"Carbon.LDP.Map.Class",
		[ "K", "V" ],
		"Interface that contains a set entries with a close relation in the form of a key/value pair."
	), ():void => {

		it( extendsClass( "Carbon.Resource.Class" ), ():void => {} );

		it( hasProperty(
			OBLIGATORY,
			"entries",
			"Carbon.LDP.Entry.Class<K,V>[]",
			"An array of entries' pair relations."
		), ():void => {} );

	} );

	describe( clazz(
		"Carbon.LDP.Map.Factory",
		"Factory class for `Carbon.LDP.Map.Class` objects."
	), ():void => {

		it( isDefined(), ():void => {
			expect( Map.Factory ).toBeDefined();
			expect( Utils.isFunction( Map.Factory ) ).toBe( true );
		} );

		it( hasMethod(
			STATIC,
			"is",
			"Return true if the object provided is considered a `Carbon.LDP.Map.Class` object.", [
				{ name: "object", type: "Object", description: "Object to check" },
			],
			{ type: "boolean" }
		), ():void => {
			expect( Map.Factory.is ).toBeDefined();
			expect( Utils.isFunction( Map.Factory.is ) ).toBe( true );

			let object:Map.Class<any, any> = void 0;
			expect( Map.Factory.is( object ) ).toBe( false );
			object = null;
			expect( Map.Factory.is( object ) ).toBe( false );

			object = Resource.Factory.decorate( {
				types: [
					NS.C.Class.Map,
				],
				entries: null,
			} );
			expect( Map.Factory.is( object ) ).toBe( true );

			object.removeType( NS.C.Class.Map );
			expect( Map.Factory.is( object ) ).toBe( false );
			object.addType( NS.C.Class.Map );

			delete object.entries;
			expect( Map.Factory.is( object ) ).toBe( false );
			object.entries = null;
		} );

	} );

	it( hasDefaultExport( "Carbon.LDP.Map.Class" ), ():void => {
		let defaultExport:DefaultExport<any, any> = <any> {};
		let defaultTarget:Map.Class<any, any>;

		defaultTarget = defaultExport;
		expect( defaultTarget ).toEqual( jasmine.any( Object ) );
	} );

} );