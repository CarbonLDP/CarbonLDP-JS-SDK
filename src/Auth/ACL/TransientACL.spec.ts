import { anyThatMatches } from "../../../test/helpers/jasmine-equalities";
import { TransientDocument } from "../../Document";
import { Pointer } from "../../Pointer";
import {
	extendsClass,
	hasProperty,
	hasSignature,
	interfaze,
	isDefined,
	method,
	module,
	OBLIGATORY,
	OPTIONAL,
	property,
	STATIC,
} from "../../test/JasmineExtender";
import { CS } from "../../Vocabularies";
import { ACE } from "../ACE";
import { BaseACL } from "./BaseACL";

import { TransientACL } from "./TransientACL";

describe( module( "carbonldp/Auth/ACL" ), ():void => {

	describe( interfaze(
		"CarbonLDP.Auth.TransientACL",
		"Interface that represents an in-memory Access Control List (ACL)."
	), ():void => {

		it( extendsClass( "CarbonLDP.TransientDocument" ), ():void => {
			const target:TransientDocument = {} as TransientACL;
			expect( target ).toBeDefined();
		} );

		it( hasProperty(
			OBLIGATORY,
			"protectedDocument",
			"CarbonLDP.Pointer",
			"Reference to the protected document the ACL belongs."
		), ():void => {
			const target:TransientACL[ "protectedDocument" ] = {} as Pointer;
			expect( target ).toBeDefined();
		} );

		it( hasProperty(
			OPTIONAL,
			"inherits",
			"boolean",
			"Flag that enables or disables the parents ACL inheritance.\n" +
			"If not set, it will be considered as true."
		), ():void => {
			const target:TransientACL[ "inherits" ] = true as boolean;
			expect( target ).toBeDefined();
		} );

		it( hasProperty(
			OPTIONAL,
			"directACEntries",
			"CarbonLDP.Auth.ACE[]",
			"Array of ACEs that applies to the target protected document."
		), ():void => {
			const target:TransientACL[ "directACEntries" ] = [] as ACE[];
			expect( target ).toBeDefined();
		} );

		it( hasProperty(
			OPTIONAL,
			"immediateDescendantsACEntries",
			"CarbonLDP.Auth.ACE[]",
			"Array of ACEs that applies to the immediate descendants of the protected document."
		), ():void => {
			const target:TransientACL[ "immediateDescendantsACEntries" ] = [] as ACE[];
			expect( target ).toBeDefined();
		} );

		it( hasProperty(
			OPTIONAL,
			"allDescendantsACEntries",
			"CarbonLDP.Auth.ACE[]",
			"Array of ACEs that applies to all the branch descendants of the protected document."
		), ():void => {
			const target:TransientACL[ "allDescendantsACEntries" ] = [] as ACE[];
			expect( target ).toBeDefined();
		} );

	} );

	describe( interfaze(
		"CarbonLDP.Auth.TransientACLFactory",
		"Interface with factory, decorate and utils methods for `CarbonLDP.Auth.TransientACL` objects."
	), ():void => {

		describe( property(
			OBLIGATORY,
			"TYPE",
			"CarbonLDP.Vocabulary.CS.AccessControlList"
		), ():void => {

			it( "should exists", ():void => {
				expect( TransientACL.TYPE ).toBeDefined();
				expect( TransientACL.TYPE ).toEqual( jasmine.any( String ) );
			} );

			it( "should be cs:AccessControlList", () => {
				expect( TransientACL.TYPE ).toBe( CS.AccessControlList );
			} );

		} );


		describe( method( OBLIGATORY, "create" ), () => {

			it( hasSignature(
				[ "T extends object" ],
				[
					{ name: "data", type: "T & CarbonLDP.Auth.BaseACL" },
				],
				{ type: "T & CarbonLDP.Auth.TransientACL" }
			), () => {} );

			it( "should exists", ():void => {
				expect( TransientACL.create ).toBeDefined();
				expect( TransientACL.create ).toEqual( jasmine.any( Function ) );
			} );


			it( "should return a TransientDocument", () => {
				const returned:TransientDocument = TransientACL.create( {
					protectedDocument: Pointer.create( { id: "document/" } ),
				} );

				expect( returned ).toEqual( anyThatMatches( TransientDocument.is, "isTransientDocument" ) as any );
			} );

			it( "should add cs:AccessControlList type", () => {
				const returned:TransientDocument = TransientACL.create( {
					protectedDocument: Pointer.create( { id: "document/" } ),
				} );

				expect( returned.types ).toContain( CS.AccessControlList );
			} );

			it( "should return a different object reference", () => {
				const base:BaseACL = {
					protectedDocument: Pointer.create( { id: "document/" } ),
				};

				const returned:TransientACL = TransientACL.create( base );

				expect( base ).not.toBe( returned );
			} );

		} );

		describe( method( OBLIGATORY, "createFrom" ), () => {

			it( hasSignature(
				[ "T extends object" ],
				[
					{ name: "data", type: "T & CarbonLDP.Auth.BaseACL" },
				],
				{ type: "T & CarbonLDP.Auth.TransientACL" }
			), () => {} );

			it( "should exists", ():void => {
				expect( TransientACL.createFrom ).toBeDefined();
				expect( TransientACL.createFrom ).toEqual( jasmine.any( Function ) );
			} );


			it( "should return a TransientDocument", () => {
				const returned:TransientDocument = TransientACL.createFrom( {
					protectedDocument: Pointer.createFrom( { id: "document/" } ),
				} );

				expect( returned ).toEqual( anyThatMatches( TransientDocument.is, "isTransientDocument" ) as any );
			} );

			it( "should add cs:AccessControlList type", () => {
				const returned:TransientDocument = TransientACL.createFrom( {
					protectedDocument: Pointer.createFrom( { id: "document/" } ),
				} );

				expect( returned.types ).toContain( CS.AccessControlList );
			} );

			it( "should return a same object reference", () => {
				const base:BaseACL = {
					protectedDocument: Pointer.create( { id: "document/" } ),
				};

				const returned:TransientACL = TransientACL.createFrom( base );

				expect( base ).toBe( returned );
			} );

		} );

	} );

	describe( property(
		STATIC,
		"TransientACL",
		"CarbonLDP.Auth.TransientACLFactory",
		"Constant that implements the `CarbonLDP.Auth.TransientACLFactory` interface."
	), ():void => {

		it( isDefined(), ():void => {
			expect( TransientACL ).toBeDefined();
			expect( TransientACL ).toEqual( jasmine.any( Object ) );
		} );

	} );

} );
