import { Resource } from "../Resource";
import {
	extendsClass,
	hasMethod,
	hasProperty,
	interfaze,
	isDefined,
	module,
	OBLIGATORY,
	property,
	STATIC,
} from "../test/JasmineExtender";
import { C } from "../Vocabularies";
import * as Utils from "./../Utils";

import { AccessPointsMetadata } from "./AccessPointsMetadata";
import { VolatileResource } from "./VolatileResource";

describe( module( "carbonldp/LDP/AccessPointsMetadata" ), ():void => {

	describe( interfaze(
		"CarbonLDP.LDP.AccessPointsMetadata",
		"Interface that represents a free resource with metadata information for access points."
	), ():void => {

		it( extendsClass( "CarbonLDP.LDP.VolatileResource" ), ():void => {} );

	} );

	describe( interfaze(
		"CarbonLDP.LDP.AccessPointsMetadataFactory",
		"Interface with the factory, decorate an utils for `CarbonLDP.LDP.AccessPointsMetadata` objects."
	), ():void => {

		it( hasProperty(
			OBLIGATORY,
			"TYPE",
			"string"
		), ():void => {} );

		it( hasMethod(
			OBLIGATORY,
			"is",
			"Return true if the object provided is considered a `CarbonLDP.LDP.AccessPointsMetadata` object.", [
				{ name: "value", type: "any", description: "Object to check." },
			],
			{ type: "value is CarbonLDP.LDP.AccessPointsMetadata" }
		), ():void => {} );

	} );

	describe( property(
		STATIC,
		"AccessPointsMetadata",
		"CarbonLDP.LDP.AccessPointsMetadataFactory",
		"Constant that implements the `CarbonLDP.LDP.AccessPointsMetadataFactory` interface."
	), ():void => {

		it( isDefined(), ():void => {
			expect( AccessPointsMetadata ).toBeDefined();
			expect( AccessPointsMetadata ).toEqual( jasmine.any( Object ) );
		} );

		describe( "AccessPointsMetadata.TYPE", ():void => {

			it( "should exists", ():void => {
				expect( AccessPointsMetadata.TYPE ).toBeDefined();
				expect( AccessPointsMetadata.TYPE ).toEqual( jasmine.any( String ) );
			} );

			it( "should be c:AccessPointsMetadata", ():void => {
				expect( AccessPointsMetadata.TYPE ).toBe( C.AccessPointsMetadata );
			} );

		} );


		describe( "AccessPointsMetadata.is", ():void => {

			it( "should exists", ():void => {
				expect( AccessPointsMetadata.is ).toBeDefined();
				expect( AccessPointsMetadata.is ).toEqual( jasmine.any( Function ) );
			} );

			it( "should call VolatileResource.is", ():void => {
				const spy:jasmine.Spy = spyOn( VolatileResource, "is" )
					.and.returnValue( false );

				AccessPointsMetadata.is( { the: "object" } );
				expect( spy ).toHaveBeenCalledWith( { the: "object" } );
			} );

			it( "should very that contains AccessPointsMetadata.TYPE", ():void => {
				spyOn( VolatileResource, "is" ).and.returnValue( true );

				const object:jasmine.SpyObj<VolatileResource> = jasmine.createSpyObj( { hasType: true } );
				AccessPointsMetadata.is( object );

				expect( object.hasType ).toHaveBeenCalledWith( AccessPointsMetadata.TYPE );
			} );

			it( "should return true when all works", ():void => {
				spyOn( VolatileResource, "is" ).and.returnValue( true );
				const object:jasmine.SpyObj<VolatileResource> = jasmine.createSpyObj( { hasType: true } );

				const returned:boolean = AccessPointsMetadata.is( object );
				expect( returned ).toBe( true );
			} );

		} );

	} );

} );
