import { ProtectedDocument } from "../ProtectedDocument";
import {
	hasMethod,
	interfaze,
	isDefined,
	module,
	OBLIGATORY,
	property,
	STATIC,
} from "../test/JasmineExtender";

import { RolesEndpoint } from "./RolesEndpoint";


describe( module( "carbonldp/Auth/RolesEndpoint" ), ():void => {

	describe( interfaze(
		"CarbonLDP.Auth.RolesEndpoint",
		"Endpoint for manage the users of a Carbon LDP instance."
	), ():void => {
	} );

	describe( interfaze(
		"CarbonLDP.Auth.RolesEndpointFactory",
		"Interface with the factory, decorate and utils for `CarbonLDP.Auth.RolesEndpoint` objects."
	), ():void => {

		it( hasMethod(
			OBLIGATORY,
			"is",
			"Returns true if the object is a `CarbonLDP.Auth.RolesEndpoint` object.",
			[
				{ name: "value", type: "any" },
			],
			{ type: "value is CarbonLDP.Auth.RolesEndpoint" }
		), ():void => {} );

		it( hasMethod(
			OBLIGATORY,
			"decorate",
			[ "T extends object" ],
			"Decorates the object provided with the properties and methods of a `CarbonLDP.Auth.RolesEndpoint` object.",
			[
				{ name: "object", type: "T", description: "The object to decorate." },
			],
			{ type: "T & CarbonLDP.Auth.RolesEndpoint" }
		), ():void => {} );

	} );

	describe( property(
		STATIC,
		"RolesEndpoint",
		"CarbonLDP.AuthRolesEndpointFactory"
	), ():void => {

		it( isDefined(), ():void => {
			expect( RolesEndpoint ).toBeDefined();
			expect( RolesEndpoint ).toEqual( jasmine.any( Object ) );
		} );

		describe( "RolesEndpoint.is", ():void => {

			it( "should exists", ():void => {
				expect( RolesEndpoint.is ).toBeDefined();
				expect( RolesEndpoint.is ).toEqual( jasmine.any( Function ) );
			} );

			it( "should call ProtectedDocument.is", ():void => {
				const spy:jasmine.Spy = spyOn( ProtectedDocument, "is" )
					.and.returnValue( false );

				const value:any = { the: "object" };
				RolesEndpoint.is( value );

				expect( spy ).toHaveBeenCalledWith( value );
			} );

			it( "should return true if all dependencies are true", ():void => {
				spyOn( ProtectedDocument, "is" )
					.and.returnValue( true );

				const returned:boolean = RolesEndpoint.is( {} );
				expect( returned ).toBe( true );
			} );

		} );

		describe( "RolesEndpoint.decorate", ():void => {

			it( "should exists", ():void => {
				expect( RolesEndpoint.decorate ).toBeDefined();
				expect( RolesEndpoint.decorate ).toEqual( jasmine.any( Function ) );
			} );

			it( "should call ProtectedDocument.decorate", ():void => {
				const spy:jasmine.Spy = spyOn( ProtectedDocument, "decorate" )
					.and.callThrough();

				const object:{} = { the: "object" };
				RolesEndpoint.decorate( object, null );

				expect( spy ).toHaveBeenCalledWith( object, null );
			} );

			it( "should return object provided", ():void => {
				const object:{} = { the: "object" };

				const returned:{} = RolesEndpoint.decorate( object, null );

				expect( returned ).toBe( object );
			} );

		} );

	} );

} );
