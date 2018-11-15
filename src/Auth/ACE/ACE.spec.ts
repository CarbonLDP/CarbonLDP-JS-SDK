import { anyThatMatches } from "../../../test/helpers/jasmine-equalities";
import { AnyJasmineValue } from "../../../test/helpers/types";
import { Pointer } from "../../Pointer";
import { TransientResource } from "../../Resource";
import {
	extendsClass,
	hasProperty,
	hasSignature,
	interfaze,
	method,
	module,
	OBLIGATORY,
	property,
	STATIC,
} from "../../test/JasmineExtender";
import { CS } from "../../Vocabularies";
import { ACE } from "./ACE";
import { BaseACE } from "./BaseACE";


describe( module( "carbonldp/Auth/ACE" ), ():void => {

	describe( interfaze(
		"CarbonLDP.Auth.ACE",
		"Interface that represents a persisted Access Control Entry (ACE) of a persisted Access Control List (ACL)."
	), ():void => {

		it( extendsClass( "CarbonLDP.TransientResource" ), ():void => {
			const target:TransientResource = {} as ACE;
			expect( target ).toBeDefined();
		} );

		it( hasProperty(
			OBLIGATORY,
			"permissions",
			"CarbonLDP.Pointer[]",
			"An array with all the permissions to grant or deny."
		), ():void => {
			const target:ACE[ "permissions" ] = [] as Pointer[];
			expect( target ).toBeDefined();
		} );

		it( hasProperty(
			OBLIGATORY,
			"subject",
			"CarbonLDP.Pointer",
			"The subject to grant the specified permissions."
		), ():void => {
			const target:ACE[ "subject" ] = {} as Pointer;
			expect( target ).toBeDefined();
		} );

	} );

	describe( interfaze(
		"CarbonLDP.Auth.ACEFactory",
		"Interface with the factory and utils for `CarbonLDP.Auth.ACE` objects."
	), ():void => {


		describe( property(
			OBLIGATORY,
			"TYPE",
			"CarbonLDP.Vocabularies.CS.AccessControlEntry"
		), ():void => {

			it( "should exists", ():void => {
				expect( ACE.TYPE ).toBeDefined();
				expect( ACE.TYPE ).toEqual( jasmine.any( String ) );
			} );

			it( "should be cs:AccessControlEntry", () => {
				expect( ACE.TYPE ).toBe( CS.AccessControlEntry );
			} );

		} );

		describe( property(
			OBLIGATORY,
			"SCHEMA",
			"CarbonLDP.ObjectSchema"
		), ():void => {

			it( "should exists", ():void => {
				expect( ACE.SCHEMA ).toBeDefined();
				expect( ACE.SCHEMA ).toEqual( jasmine.any( Object ) );
			} );


			it( "should has model properties", () => {
				type Target = AnyJasmineValue<Required<Pick<ACE,
					| "subject"
					| "permissions">>>;

				expect( ACE.SCHEMA as Target ).toEqual( {
					subject: jasmine.any( Object ),
					permissions: jasmine.any( Object ),
				} );
			} );

			it( "should have cs:subject", () => {
				expect( ACE.SCHEMA[ "subject" ] ).toEqual( {
					"@id": CS.subject,
					"@type": "@id",
				} );
			} );

			it( "should have cs:permission", () => {
				expect( ACE.SCHEMA[ "permissions" ] ).toEqual( {
					"@id": CS.permission,
					"@type": "@id",
					"@container": "@set",
				} );
			} );

		} );


		describe( method( OBLIGATORY, "create" ), () => {

			it( hasSignature(
				[ "T extends object" ],
				"Creates a `CarbonLDP.Auth.ACE` object with the parameters specified.", [
					{ name: "data", type: "T & CarbonLDP.Auth.BaseACE", description: "Data for creation an access control entry." },
				],
				{ type: "CarbonLDP.Auth.ACE" }
			), ():void => {} );

			it( "should exists", ():void => {
				expect( ACE.create ).toBeDefined();
				expect( ACE.create ).toEqual( jasmine.any( Function ) );
			} );


			it( "should return a resource", () => {
				const returned:TransientResource = ACE.create( {
					subject: Pointer.create( { id: "subject/" } ),
					permissions: [ Pointer.create( { id: "Permission" } ) ],
				} );

				expect( returned ).toEqual( anyThatMatches( TransientResource.is, "isResource" ) as any );
			} );

			it( "should add cs:AccessControlEntry type", () => {
				const returned:TransientResource = ACE.create( {
					subject: Pointer.create( { id: "subject/" } ),
					permissions: [ Pointer.create( { id: "Permission" } ) ],
				} );

				expect( returned.types ).toContain( CS.AccessControlEntry );
			} );


			it( "should return different object reference", () => {
				const base:BaseACE = {
					subject: Pointer.create( { id: "subject/" } ),
					permissions: [ Pointer.create( { id: "Permission" } ) ],
				};

				const returned:ACE = ACE.create( base );

				expect( base ).not.toBe( returned );
			} );

		} );

		describe( method( OBLIGATORY, "createFrom" ), () => {

			it( hasSignature(
				[ "T extends object" ],
				"Creates a `CarbonLDP.Auth.ACE` object with the parameters specified.", [
					{ name: "object", type: "T & CarbonLDP.Auth.BaseACE", description: "The object that will be converted into a `CarbonLDP.Auth.ACE`" },
				],
				{ type: "T & CarbonLDP.Auth.ACE" }
			), ():void => {} );

			it( "should exists", ():void => {
				expect( ACE.createFrom ).toBeDefined();
				expect( ACE.createFrom ).toEqual( jasmine.any( Function ) );
			} );


			it( "should return a resource", () => {
				const returned:TransientResource = ACE.createFrom( {
					subject: Pointer.create( { id: "subject/" } ),
					permissions: [ Pointer.create( { id: "Permission" } ) ],
				} );

				expect( returned ).toEqual( anyThatMatches( TransientResource.is, "isResource" ) as any );
			} );

			it( "should add cs:AccessControlEntry type", () => {
				const returned:TransientResource = ACE.createFrom( {
					subject: Pointer.create( { id: "subject/" } ),
					permissions: [ Pointer.create( { id: "Permission" } ) ],
				} );

				expect( returned.types ).toContain( CS.AccessControlEntry );
			} );


			it( "should return same object reference", () => {
				const base:BaseACE = {
					subject: Pointer.create( { id: "subject/" } ),
					permissions: [ Pointer.create( { id: "Permission" } ) ],
				};

				const returned:ACE = ACE.createFrom( base );

				expect( base ).toBe( returned );
			} );

		} );

	} );

	describe( property(
		STATIC,
		"ACE",
		"CarbonLDP.Auth.ACEFactory"
	), ():void => {

		it( "should exists", ():void => {
			expect( ACE ).toBeDefined();
			expect( ACE ).toEqual( jasmine.any( Object ) );
		} );

	} );

} );
