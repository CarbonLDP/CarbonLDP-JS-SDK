import { Pointer } from "../Pointer";
import { TransientResource } from "../Resource";
import {
	extendsClass,
	hasProperty,
	interfaze,
	isDefined,
	module,
	OBLIGATORY,
	property,
	STATIC
} from "../test/JasmineExtender";
import { C } from "../Vocabularies/C";

import { DocumentCreatedDetails } from "./DocumentCreatedDetails";

describe( module( "carbonldp/Messaging/DocumentCreatedDetails" ), ():void => {

	describe( interfaze(
		"CarbonLDP.Messaging.DocumentCreatedDetails",
		"Interface with the properties of the details in a document created event."
	), ():void => {

		it( isDefined(), ():void => {
			const target:DocumentCreatedDetails = {} as any;
			expect( target ).toBeDefined();
		} );

		it( extendsClass( "CarbonLDP.TransientResource" ), ():void => {
			const target:TransientResource = {} as DocumentCreatedDetails;
			expect( target ).toBeDefined();
		} );

		it( hasProperty(
			OBLIGATORY,
			"createdDocuments",
			"CarbonLDP.Pointer[]"
		), ():void => {
			const target:DocumentCreatedDetails[ "createdDocuments" ] = [] as Pointer[];
			expect( target ).toBeDefined();
		} );

	} );

	describe( interfaze(
		"CarbonLDP.Messaging.DocumentCreatedDetailsFactory",
		"Interface with the factory, decorate and utils for `CarbonLDP.Messaging.DocumentCreatedDetails` objects."
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
		"DocumentCreatedDetails",
		"CarbonLDP.Messaging.DocumentCreatedDetailsFactory"
	), ():void => {

		it( isDefined(), ():void => {
			expect( DocumentCreatedDetails ).toBeDefined();
			expect( DocumentCreatedDetails ).toEqual( jasmine.any( Object ) );
		} );

		// TODO: Separate in different tests
		it( "DocumentCreatedDetails.TYPE", ():void => {
			expect( DocumentCreatedDetails.TYPE ).toBeDefined();
			expect( DocumentCreatedDetails.TYPE ).toEqual( jasmine.any( String ) );

			expect( DocumentCreatedDetails.TYPE ).toBe( C.DocumentCreatedDetails );
		} );

		// TODO: Separate in different tests
		it( "DocumentCreatedDetails.SCHEMA", ():void => {
			expect( DocumentCreatedDetails.SCHEMA ).toBeDefined();
			expect( DocumentCreatedDetails.SCHEMA ).toEqual( jasmine.any( Object ) );

			expect( DocumentCreatedDetails.SCHEMA as {} ).toEqual( {
				"createdDocuments": jasmine.any( Object ),
			} );

			expect( DocumentCreatedDetails.SCHEMA[ "createdDocuments" ] ).toEqual( {
				"@id": C.createdDocument,
				"@type": "@id",
				"@container": "@set",
			} );
		} );

	} );

} );
