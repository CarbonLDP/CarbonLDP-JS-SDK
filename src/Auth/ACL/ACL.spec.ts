import { AnyJasmineValue } from "../../../test/helpers/types";
import { Pointer } from "../../Pointer";
import {
	extendsClass,
	hasProperty,
	interfaze,
	isDefined,
	module,
	OBLIGATORY,
	OPTIONAL,
	property,
	STATIC,
} from "../../test/JasmineExtender";
import { CS } from "../../Vocabularies";
import { ACE } from "../ACE";

import { ACL } from "./ACL";


describe( module( "carbonldp/Auth/ACL" ), ():void => {

	describe( interfaze(
		"CarbonLDP.Auth.ACL",
		"Interface that represents a persisted Access Control List (ACL)."
	), ():void => {

		it( extendsClass( "CarbonLDP.Document" ), ():void => {} );


		it( hasProperty(
			OPTIONAL,
			"protectedDocument",
			"CarbonLDP.Pointer",
			"Reference to the protected document the ACL belongs."
		), ():void => {
			const target:ACL[ "protectedDocument" ] = {} as Pointer;
			expect( target ).toBeDefined();
		} );

		it( hasProperty(
			OPTIONAL,
			"inherits",
			"boolean",
			"Flag that enables or disables the parents ACL inheritance.\n" +
			"If not set, it will be considered as true."
		), ():void => {
			const target:ACL[ "inherits" ] = true as boolean;
			expect( target ).toBeDefined();
		} );

		it( hasProperty(
			OPTIONAL,
			"directACEntries",
			"CarbonLDP.Auth.ACE[]",
			"Array of ACEs that applies to the target protected document."
		), ():void => {
			const target:ACL[ "directACEntries" ] = [] as ACE[];
			expect( target ).toBeDefined();
		} );

		it( hasProperty(
			OPTIONAL,
			"immediateDescendantsACEntries",
			"CarbonLDP.Auth.ACE[]",
			"Array of ACEs that applies to the immediate descendants of the protected document."
		), ():void => {
			const target:ACL[ "immediateDescendantsACEntries" ] = [] as ACE[];
			expect( target ).toBeDefined();
		} );

		it( hasProperty(
			OPTIONAL,
			"allDescendantsACEntries",
			"CarbonLDP.Auth.ACE[]",
			"Array of ACEs that applies to all the branch descendants of the protected document."
		), ():void => {
			const target:ACL[ "allDescendantsACEntries" ] = [] as ACE[];
			expect( target ).toBeDefined();
		} );


	} );

	describe( interfaze(
		"CarbonLDP.Auth.ACLFactory",
		"Interface with factory, decorate and utils methods for `CarbonLDP.Auth.ACL` objects."
	), ():void => {

		it( extendsClass( "CarbonLDP.Auth.TransientACLFactory" ), ():void => {} );

		describe( property(
			OBLIGATORY,
			"SCHEMA",
			"CarbonLDP.ObjectSchema"
		), ():void => {

			it( "should exists", ():void => {
				expect( ACL.SCHEMA ).toBeDefined();
				expect( ACL.SCHEMA ).toEqual( jasmine.any( Object ) );
			} );

			it( "should have model properties", () => {
				type Target = AnyJasmineValue<Required<Pick<ACL,
					| "protectedDocument"
					| "inherits"
					| "directACEntries"
					| "immediateDescendantsACEntries"
					| "allDescendantsACEntries">>>;

				expect( ACL.SCHEMA as Target ).toEqual( {
					protectedDocument: jasmine.any( Object ),
					inherits: jasmine.any( Object ),
					directACEntries: jasmine.any( Object ),
					immediateDescendantsACEntries: jasmine.any( Object ),
					allDescendantsACEntries: jasmine.any( Object ),
				} );
			} );

			it( "should have cs:protectedDocument", () => {
				expect( ACL.SCHEMA[ "protectedDocument" ] ).toEqual( {
					"@id": CS.protectedDocument,
					"@type": "@id",
				} );
			} );

			it( "should have cs:inherits", () => {
				expect( ACL.SCHEMA[ "inherits" ] ).toEqual( {
					"@id": CS.inherits,
					"@type": "@id",
				} );
			} );

			it( "should have cs:directACEntry", () => {
				expect( ACL.SCHEMA[ "directACEntries" ] ).toEqual( {
					"@id": CS.directACEntry,
					"@type": "@id",
					"@container": "@set",
				} );
			} );

			it( "should have cs:immediateDescendantsACEntry", () => {
				expect( ACL.SCHEMA[ "immediateDescendantsACEntries" ] ).toEqual( {
					"@id": CS.immediateDescendantsACEntry,
					"@type": "@id",
					"@container": "@set",
				} );
			} );

			it( "should have cs:allDescendantsACEntry", () => {
				expect( ACL.SCHEMA[ "allDescendantsACEntries" ] ).toEqual( {
					"@id": CS.allDescendantsACEntry,
					"@type": "@id",
					"@container": "@set",
				} );
			} );

		} );

	} );

	describe( property(
		STATIC,
		"ACL",
		"CarbonLDP.Auth.ACLFactory",
		"Constant that implements the `CarbonLDP.Auth.ACLFactory` interface."
	), ():void => {

		it( isDefined(), ():void => {
			expect( ACL ).toBeDefined();
			expect( ACL ).toEqual( jasmine.any( Object ) );
		} );

	} );

} );
