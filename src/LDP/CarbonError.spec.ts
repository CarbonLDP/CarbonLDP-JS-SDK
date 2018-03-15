import {
	extendsClass,
	hasProperty,
	interfaze,
	module,
	OBLIGATORY,
	property,
	STATIC,
} from "../test/JasmineExtender";
import { C } from "../Vocabularies/C";
import { XSD } from "../Vocabularies/XSD";
import * as Utils from "./../Utils";

import { CarbonError } from "./CarbonError";

describe( module( "carbonldp/LDP/Error" ), ():void => {

	describe( interfaze(
		"CarbonLDP.LDP.CarbonError",
		"Interface that represents an error occurred in the server."
	), ():void => {

		it( extendsClass( "CarbonLDP.Resource" ), ():void => {} );

		it( hasProperty(
			OBLIGATORY,
			"errorCode",
			"string",
			"An specific code that indicates the type of error the current object is."
		), ():void => {} );

		it( hasProperty(
			OBLIGATORY,
			"errorMessage",
			"string",
			"Message that explains the error occurred in the server."
		), ():void => {} );

		it( hasProperty(
			OBLIGATORY,
			"errorParameters",
			"CarbonLDP.LDP.CarbonMap<string, any>",
			"Map that contains the specific elements that make the error been thrown."
		), ():void => {} );

	} );

	describe( interfaze(
		"CarbonLDP.LDP.CarbonErrorFactory",
		"Interface with the factory, decorate and utils function for `CarbonLDP.LDP.CarbonError` objects."
	), ():void => {

		it( hasProperty(
			OBLIGATORY,
			"TYPE",
			"string"
		), ():void => {} );

		it( hasProperty(
			OBLIGATORY,
			"SCHEMA",
			"CarbonLDP.ObjectSchema"
		), ():void => {} );

	} );

	describe( property(
		STATIC,
		"CarbonError",
		"CarbonLDP.LDP.CarbonErrorFactory"
	), ():void => {

		it( "should exist", ():void => {
			expect( CarbonError ).toBeDefined();
			expect( CarbonError ).toEqual( jasmine.any( Object ) );
		} );

		// TODO: Separate in different tests
		it( "CarbonError.TYPE", ():void => {
			expect( CarbonError.TYPE ).toBeDefined();
			expect( Utils.isString( CarbonError.TYPE ) ).toBe( true );

			expect( CarbonError.TYPE ).toBe( C.Error );
		} );

		// TODO: Separate in different tests
		it( "CarbonError.SCHEMA", ():void => {
			expect( CarbonError.SCHEMA ).toBeDefined();
			expect( Utils.isObject( CarbonError.SCHEMA ) ).toBe( true );

			expect( Utils.hasProperty( CarbonError.SCHEMA, "errorCode" ) ).toBe( true );
			expect( CarbonError.SCHEMA[ "errorCode" ] ).toEqual( {
				"@id": C.errorCode,
				"@type": XSD.string,
			} );

			expect( Utils.hasProperty( CarbonError.SCHEMA, "errorMessage" ) ).toBe( true );
			expect( CarbonError.SCHEMA[ "errorMessage" ] ).toEqual( {
				"@id": C.errorMessage,
				"@language": "en",
			} );

			expect( Utils.hasProperty( CarbonError.SCHEMA, "errorParameters" ) ).toBe( true );
			expect( CarbonError.SCHEMA[ "errorParameters" ] ).toEqual( {
				"@id": C.errorParameters,
				"@type": "@id",
			} );
		} );

	} );

} );