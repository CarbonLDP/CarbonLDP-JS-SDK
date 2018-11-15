import { AnyJasmineValue } from "../../../test/helpers/types";
import { Pointer } from "../../Pointer";
import {
	extendsClass,
	hasProperty,
	hasSignature,
	interfaze,
	method,
	module,
	OBLIGATORY,
	OPTIONAL,
	property,
	STATIC,
} from "../../test/JasmineExtender";
import {
	CS,
	XSD
} from "../../Vocabularies";
import { Role } from "./Role";
import { TransientRoleFactory } from "./TransientRole";

describe( module( "carbonldp/Auth/Role" ), ():void => {

	describe( interfaze(
		"CarbonLDP.Role",
		"Specific interface that represents a persisted role of an application."
	), ():void => {

		it( extendsClass( "CarbonLDP.ProtectedDocument" ), ():void => {} );

		it( hasProperty(
			OPTIONAL,
			"name",
			"string",
			"A name that describes the current role."
		), ():void => {
			const target:Role[ "name" ] = "name";
			expect( target ).toBeDefined();
		} );

		it( hasProperty(
			OPTIONAL,
			"description",
			"string",
			"An optional description of the current role."
		), ():void => {
			const target:Role[ "description" ] = "description";
			expect( target ).toBeDefined();
		} );

		it( hasProperty(
			OPTIONAL,
			"users",
			"CarbonLDP.Pointer[]",
			"An array of pointers that references to all the users that have the current role."
		), ():void => {
			const target:Role[ "users" ] = [] as Pointer[];
			expect( target ).toBeDefined();
		} );

	} );

	describe( interfaze(
		"CarbonLDP.Auth.RolesFactory",
		"Interface with the factory and utils for `CarbonLDP.Auth.Role` objects."
	), ():void => {

		it( extendsClass( "CarbonLDP.Auth.TransientRolesFactory" ), () => {
			const target:TransientRoleFactory = Role as any;

			expect( target as AnyJasmineValue<TransientRoleFactory> ).toEqual( jasmine.objectContaining( {
				TYPE: jasmine.any( String ),

				is: jasmine.any( Function ),
				create: jasmine.any( Function ),
				createFrom: jasmine.any( Function ),
			} ) );
		} );

		describe( property(
			OBLIGATORY,
			"SCHEMA",
			"CarbonLDP.ObjectSchema"
		), () => {

			it( "should exists", ():void => {
				expect( Role.SCHEMA ).toEqual( jasmine.any( Object ) );
			} );

			it( "should have the Role & PersistedRole properties", ():void => {
				expect( Role.SCHEMA as {} ).toEqual( {
					"name": jasmine.any( Object ),
					"description": jasmine.any( Object ),
					"parent": jasmine.any( Object ),
					"children": jasmine.any( Object ),
					"users": jasmine.any( Object ),
				} );
			} );

			it( "should have cs:name", ():void => {
				expect( Role.SCHEMA[ "name" ] ).toEqual( {
					"@id": CS.name,
					"@type": XSD.string,
				} );
			} );

			it( "should have cs:description", ():void => {
				expect( Role.SCHEMA[ "description" ] ).toEqual( {
					"@id": CS.description,
					"@type": XSD.string,
				} );
			} );

			it( "should have cs:parent", ():void => {
				expect( Role.SCHEMA[ "parent" ] ).toEqual( {
					"@id": CS.parent,
					"@type": "@id",
				} );
			} );

			it( "should have cs:child", ():void => {
				expect( Role.SCHEMA[ "children" ] ).toEqual( {
					"@id": CS.child,
					"@type": "@id",
					"@container": "@set",
				} );
			} );

			it( "should have cs:user", ():void => {
				expect( Role.SCHEMA[ "users" ] ).toEqual( {
					"@id": CS.user,
					"@type": "@id",
					"@container": "@set",
				} );
			} );

		} );


		describe( method( OBLIGATORY, "is" ), ():void => {

			it( hasSignature(
				"Returns true if the object provided is considered a `CarbonLDP.Auth.TransientRole` object",
				[
					{ name: "value", type: "any" },
				],
				{ type: "value is CarbonLDP.Auth.Role" }
			), () => {} );

			// TODO: Test

		} );

	} );

	describe( property(
		STATIC,
		"Role",
		"CarbonLDP.Auth.RoleFactory"
	), () => {

		it( "should exists", ():void => {
			expect( Role ).toBeDefined();
			expect( Role ).toEqual( jasmine.any( Object ) );
		} );

	} );

} );
