import {
	AnyJasmineValue,
	StrictMinus
} from "../../../test/helpers/types";
import { Pointer } from "../../Pointer";
import { ProtectedDocument } from "../../ProtectedDocument";
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
import * as Utils from "../../Utils";
import {
	CS,
	XSD
} from "../../Vocabularies";
import { TransientUser } from "./TransientUser";

import { User } from "./User";


describe( module( "carbonldp/Auth/User" ), ():void => {

	describe( interfaze(
		"CarbonLDP.Auth.User",
		"Interface that represents the base of a persisted User in any context."
	), ():void => {

		it( extendsClass( "CarbonLDP.ProtectedDocument" ), ():void => {} );


		it( hasProperty(
			OPTIONAL,
			"name",
			"string",
			"Optional name of the user."
		), ():void => {
			const target:User[ "name" ] = "name";
			expect( target ).toBeDefined();
		} );

		it( hasProperty(
			OPTIONAL,
			"roles",
			"CarbonLDP.Pointer[]",
			"Array of the roles assigned to the current user."
		), ():void => {
			const target:User[ "roles" ] = [] as Pointer[];
			expect( target ).toBeDefined();
		} );

	} );

	describe( interfaze(
		"CarbonLDP.Auth.UserFactory",
		"Interface with the factory, decorate and utils for `CarbonLDP.Auth.User` objects."
	), ():void => {

		it( hasProperty(
			OBLIGATORY,
			"TYPE",
			"CarbonLDP.Vocabularies.CS.User"
		), ():void => {} );

		describe( property(
			OBLIGATORY,
			"SCHEMA",
			"CarbonLDP.ObjectSchema"
		), ():void => {

			it( "should exists", () => {
				expect( User.SCHEMA ).toBeDefined();
				expect( Utils.isObject( User.SCHEMA ) ).toBe( true );
			} );

			it( "should has interface properties", () => {
				type Target = Required<AnyJasmineValue<Pick<TransientUser & User, "name" | "credentials" | "roles">>>;

				expect( User.SCHEMA as Target ).toEqual( {
					name: jasmine.any( Object ),
					credentials: jasmine.any( Object ),
					roles: jasmine.any( Object ),
				} );
			} );

			it( "should has property name", () => {
				expect( User.SCHEMA[ "name" ] ).toEqual( {
					"@id": CS.name,
					"@type": XSD.string,
				} );
			} );

			it( "should has property credentials", () => {
				expect( User.SCHEMA[ "credentials" ] ).toEqual( {
					"@id": CS.credentials,
					"@type": "@id",
				} );
			} );

			it( "should has property roles", () => {
				expect( User.SCHEMA[ "roles" ] ).toEqual( {
					"@id": CS.role,
					"@type": "@id",
					"@container": "@set",
				} );
			} );

		} );

		describe( method( OBLIGATORY, "isDecorated" ), ():void => {

			it( hasSignature(
				"Returns true if the object provided has the properties of a `CarbonLDP.Auth.User` object.", [
					{ name: "value", type: "any" },
				],
				{ type: "value is CarbonLDP.Auth.User" }
			), ():void => {} );

		} );

		describe( method( OBLIGATORY, "is" ), ():void => {

			it( hasSignature(
				"Returns true if the object provided is considered a `CarbonLDP.Auth.User` object.", [
					{ name: "value", type: "any" },
				],
				{ type: "value is CarbonLDP.Auth.User" }
			), ():void => {} );

		} );

		describe( method( OBLIGATORY, "decorate" ), ():void => {

			it( hasSignature(
				[ "T extends object" ],
				"Decorates the object provided with the properties and methods of a `CarbonLDP.Auth.User` object.", [
					{ name: "object", type: "T", description: "The object to decorate." },
					{ name: "documents", type: "CarbonLDP.Documents", description: "The documents service the persisted belongs to." },
				],
				{ type: "T & CarbonLDP.Auth.User" }
			), ():void => {} );

		} );

	} );

	describe( property(
		STATIC,
		"User",
		"CarbonLDP.Auth.UserFactory"
	), ():void => {

		type MockUser = StrictMinus<User, TransientUser & ProtectedDocument>;

		it( isDefined(), ():void => {
			expect( User ).toBeDefined();
			expect( User ).toEqual( jasmine.any( Object ) );
		} );

		// TODO: Separate in different test
		it( "User.TYPE", ():void => {
			expect( User.TYPE ).toBeDefined();
			expect( Utils.isString( User.TYPE ) ).toBe( true );

			expect( User.TYPE ).toBe( CS.User );
		} );

		describe( "User.is", ():void => {

			it( "should exists", ():void => {
				expect( User.is ).toBeDefined();
				expect( User.is ).toEqual( jasmine.any( Function ) );
			} );

			it( "should call to `User.isDecorated`", ():void => {
				const spy:jasmine.Spy = spyOn( TransientUser, "isDecorated" );

				const object:object = { the: "object" };
				User.is( object );
				expect( spy ).toHaveBeenCalledWith( object );
			} );

			it( "should call to `ProtectedDocument.is`", ():void => {
				spyOn( TransientUser, "isDecorated" )
					.and.returnValue( true );
				const spy:jasmine.Spy = spyOn( ProtectedDocument, "is" );

				const object:object = { the: "object" };
				User.is( object );
				expect( spy ).toHaveBeenCalledWith( object );
			} );

			it( "should return true when all verifications pass", ():void => {
				spyOn( TransientUser, "isDecorated" )
					.and.returnValue( true );
				spyOn( ProtectedDocument, "is" )
					.and.returnValue( true );

				const object:object = { the: "object" };
				const returned:boolean = User.is( object );

				expect( returned ).toBe( true );
			} );

		} );

		describe( "User.decorate", ():void => {

			it( "should exists", ():void => {
				expect( User.decorate ).toBeDefined();
				expect( User.decorate ).toEqual( jasmine.any( Function ) );
			} );

			it( "should return the same object", ():void => {
				const object:object = {};
				const returned:object = User.decorate( object, null );
				expect( returned ).toBe( object );
			} );

			it( "should call `User.decorate`", ():void => {
				const spy:jasmine.Spy = spyOn( TransientUser, "decorate" );

				const object:object = { the: "object" };
				User.decorate( object, null );
				expect( spy ).toHaveBeenCalledWith( object );
			} );

			it( "should call `ProtectedDocument.decorate`", ():void => {
				const spy:jasmine.Spy = spyOn( ProtectedDocument, "decorate" );

				const object:object = { the: "object" };
				const fakeDocuments:any = { fake: "Documents" };
				User.decorate( object, fakeDocuments );

				expect( spy ).toHaveBeenCalledWith( object, fakeDocuments );
			} );

		} );

	} );

} );
