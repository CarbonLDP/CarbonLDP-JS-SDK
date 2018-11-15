import { anyThatMatches } from "../../../test/helpers/jasmine-equalities";

import { TransientDocument } from "../../Document";
import { Pointer } from "../../Pointer";
import {
	extendsClass,
	hasMethod,
	hasProperty,
	interfaze,
	module,
	OBLIGATORY,
	OPTIONAL,
	property,
	STATIC,
} from "../../test/JasmineExtender";
import { CS } from "../../Vocabularies";
import { BaseRole } from "./BaseRole";

import {
	TransientRole,
	TransientRoleFactory,
} from "./TransientRole";


function createMock():TransientRole {
	return TransientDocument.createFrom( {
		parent: ".system/security/roles/parent-role/",
	} );
}

describe( module( "carbonldp/Auth/Role" ), ():void => {

	describe( interfaze(
		"CarbonLDP.Auth.TransientRole",
		"Specific interface that represents the base of an in-memory role for any context."
	), ():void => {

		it( extendsClass( "CarbonLDP.TransientDocument" ), ():void => {
			let role:TransientRole = <any> {};
			let document:TransientDocument;

			document = role;
			expect( document ).toEqual( jasmine.any( Object ) );
		} );

		it( hasProperty(
			OBLIGATORY,
			"name",
			"string",
			"A optional name for the role."
		), ():void => {
			const target:TransientRole[ "name" ] = "name" as string;
			expect( target ).toBeDefined();
		} );

		it( hasProperty(
			OPTIONAL,
			"description",
			"string",
			"An optional large description of the role."
		), ():void => {
			const target:TransientRole[ "description" ] = "description" as string;
			expect( target ).toBeDefined();
		} );

		it( hasProperty(
			OBLIGATORY,
			"parent",
			"CarbonLDP.Pointer",
			"Parent role where the new role will be added as a child role relationship."
		), ():void => {
			const target:TransientRole[ "parent" ] = {} as Pointer;
			expect( target ).toBeDefined();
		} );

	} );

	describe( interfaze(
		"CarbonLDP.Auth.TransientRoleFactory",
		"Interface with the factory and utils for `CarbonLDP.Auth.TransientRole` objects."
	), ():void => {

		it( hasProperty(
			OBLIGATORY,
			"TYPE",
			"CarbonLDP.Vocabularies.CS.Role"
		), ():void => {
			const target:TransientRoleFactory[ "TYPE" ] = "" as CS[ "Role" ];
			expect( target ).toBeDefined();
		} );

		it( hasMethod(
			OBLIGATORY,
			"is",
			"Returns true if the object provided is considered a `CarbonLDP.Auth.TransientRole` object",
			[
				{ name: "value", type: "any" },
			],
			{ type: "value is CarbonLDP.Auth.TransientRole" }
		), ():void => {} );

		it( hasMethod(
			OBLIGATORY,
			"create",
			"Create a `CarbonLDP.Auth.TransientRole` object with the properties from the data provided.", [
				{ name: "data", type: "CarbonLDP.Auth.BaseRole", description: "Object with the base data to create a role document." },
			],
			{ type: "CarbonLDP.Auth.TransientRole" }
		), ():void => {} );

		it( hasMethod(
			OBLIGATORY,
			"createFrom",
			[ "T extends object" ],
			"Create a `CarbonLDP.Auth.TransientRole` object with the base object provided.", [
				{ name: "object", type: "T & CarbonLDP.Auth.BaseRole", description: "Object where to create the new role with the base data of the role." },
			],
			{ type: "T & CarbonLDP.Auth.TransientRole" }
		), ():void => {} );

	} );

	describe( property(
		STATIC,
		"TransientRole",
		"CarbonLDP.Auth.TransientRoleFactory"
	), ():void => {

		it( "should exists", ():void => {
			expect( TransientRole ).toBeDefined();
			expect( TransientRole ).toEqual( jasmine.any( Object ) );
		} );


		describe( "TransientRole.TYPE", ():void => {

			it( "should exists", ():void => {
				expect( TransientRole.TYPE ).toBeDefined();
				expect( TransientRole.TYPE ).toEqual( jasmine.any( String ) );
			} );

			it( "should be cs:Role", ():void => {
				expect( TransientRole.TYPE ).toBe( CS.Role );
			} );

		} );


		describe( "TransientRole.is", ():void => {

			it( "should exists", ():void => {
				expect( TransientRole.is ).toBeDefined();
				expect( TransientRole.is ).toEqual( jasmine.any( Function ) );
			} );


			it( "should call TransientDocument.is", ():void => {
				const spy:jasmine.Spy = spyOn( TransientDocument, "is" )
					.and.returnValue( false );

				TransientRole.is( { the: "role" } );

				expect( spy ).toHaveBeenCalledWith( { the: "role" } );
			} );

			it( "should return true when TransientDocument with Roles properties", ():void => {
				const role:TransientRole = createMock();

				const returned:boolean = TransientRole.is( role );
				expect( returned ).toBe( true );
			} );

			it( "should return false when NO parent", ():void => {
				const role:TransientRole = createMock();
				delete role.parent;

				const returned:boolean = TransientRole.is( role );
				expect( returned ).toBe( false );
			} );

			it( "should return true when NO description", ():void => {
				const role:TransientRole = createMock();
				delete role.description;

				const returned:boolean = TransientRole.is( role );
				expect( returned ).toBe( true );
			} );

		} );

		describe( "TransientRole.create", ():void => {

			it( "should exists", ():void => {
				expect( TransientRole.create ).toBeDefined();
				expect( TransientRole.create ).toEqual( jasmine.any( Function ) );
			} );

			it( "should call TransientRole.createFrom", ():void => {
				const spy:jasmine.Spy = spyOn( TransientRole, "createFrom" );

				TransientRole.create( { parent: ".system/security/roles/parent-role/" } );
				expect( spy ).toHaveBeenCalledWith( { parent: ".system/security/roles/parent-role/" } );
			} );

			it( "should return another reference for the role document", ():void => {
				const data:BaseRole = { parent: ".system/security/roles/parent-role/" };
				const returned:TransientRole = TransientRole.create( data );

				expect( data ).not.toBe( returned );
			} );

		} );

		describe( "TransientRole.createFrom", ():void => {

			it( "should exists", ():void => {
				expect( TransientRole.createFrom ).toBeDefined();
				expect( TransientRole.createFrom ).toEqual( jasmine.any( Function ) );
			} );


			it( "should add cs:Role", ():void => {
				const role:TransientRole = TransientRole.createFrom( { parent: ".system/security/roles/parent-role/" } );

				expect( role.types ).toContain( CS.Role );
			} );

			it( "should return a TransientDocument", ():void => {
				const role:TransientRole = TransientRole.createFrom( { parent: ".system/security/roles/parent-role/" } );

				expect( role ).toEqual( anyThatMatches( TransientDocument.is, "TransientDocument" ) as any );
			} );

			it( "should return the same reference", ():void => {
				const object:BaseRole = { parent: ".system/security/roles/parent-role/" };
				const role:TransientRole = TransientRole.createFrom( object );

				expect( object ).toBe( role );
			} );

		} );

	} );

} );
