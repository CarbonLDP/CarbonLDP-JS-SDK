import { anyThatMatches } from "../../../test/helpers/jasmine-equalities";
import { TransientBlankNode } from "../../BlankNode";
import { TransientDocument } from "../../Document";
import { TransientFragment } from "../../Fragment";
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
import { CS } from "../../Vocabularies";
import { UsernameAndPasswordCredentials } from "../UsernameAndPasswordCredentials";
import { BaseUser } from "./BaseUser";
import { TransientUser } from "./TransientUser";


describe( module( "carbonldp/Auth/TransientUser" ), ():void => {

	describe( interfaze(
		"CarbonLDP.Auth.TransientUser",
		"Interface that represents an in-memory User of any Context."
	), ():void => {

		it( extendsClass( "CarbonLDP.TransientDocument" ), ():void => {
			let user:TransientUser = <any> {};
			let document:TransientDocument;

			document = user;
			expect( document ).toEqual( jasmine.any( Object ) );
		} );

		it( hasProperty(
			OPTIONAL,
			"name",
			"string",
			"Optional name of the user."
		), ():void => {
			const target:TransientUser[ "name" ] = "name";
			expect( target ).toBeDefined();
		} );

		it( hasProperty(
			OBLIGATORY,
			"credentials",
			"CarbonLDP.Auth.UsernameAndPasswordCredentials"
		), ():void => {
			const target:TransientUser[ "credentials" ] = {} as TransientFragment & UsernameAndPasswordCredentials;
			expect( target ).toBeDefined();
		} );

	} );

	describe( interfaze(
		"CarbonLDP.Auth.TransientUserFactory",
		"Interface with the factory, decorate and utils for `CarbonLDP.Auth.TransientUser` objects."
	), ():void => {

		it( hasProperty(
			OBLIGATORY,
			"TYPE",
			"CarbonLDP.Vocabularies.CS.User"
		), ():void => {} );

		describe( method( OBLIGATORY, "isDecorated" ), ():void => {

			it( hasSignature(
				"Returns true if the object provided has the properties that defines a `CarbonLDP.Auth.TransientUser` object.", [
					{ name: "object", type: "object" },
				],
				{ type: "object is CarbonLDP.Auth.TransientUser" }
			), ():void => {} );

		} );

		describe( method( OBLIGATORY, "is" ), ():void => {

			it( hasSignature(
				"Returns true if the object is a `CarbonLDP.Auth.TransientUser` object.", [
					{ name: "value", type: "any" },
				],
				{ type: "value is CarbonLDP.Auth.TransientUser" }
			), ():void => {} );

		} );

		describe( method( OBLIGATORY, "create" ), ():void => {

			it( hasSignature(
				[ "T extends object" ],
				"Creates a `CarbonLDP.Auth.TransientUser` object.",
				[
					{ name: "data", type: "T & CarbonLDP.Auth.BaseUser", description: "The data requited for creating a User document." },
				],
				{ type: "T & CarbonLDP.Auth.TransientUser" }
			), ():void => {} );

		} );

		describe( method( OBLIGATORY, "createFrom" ), ():void => {

			it( hasSignature(
				[ "T extends object" ],
				"Creates a `CarbonLDP.Auth.TransientUser` object with the one provided.",
				[
					{ name: "object", type: "T & CarbonLDP.Auth.BaseUser" },
				],
				{ type: "T & CarbonLDP.Auth.TransientUser" }
			), ():void => {} );

		} );

		describe( method( OBLIGATORY, "decorate" ), ():void => {

			it( hasSignature(
				[ "T extends object" ],
				"Decorates the object provided with the properties and methods of a `CarbonLDP.Auth.TransientUser` object.", [
					{ name: "object", type: "T", description: "The object to decorate." },
				],
				{ type: "T & CarbonLDP.Auth.TransientUser" }
			), ():void => {} );

		} );

	} );

	describe( property(
		STATIC,
		"TransientUser",
		"CarbonLDP.Auth.TransientUserFactory"
	), ():void => {

		it( isDefined(), ():void => {
			expect( TransientUser ).toBeDefined();
			expect( TransientUser ).toEqual( jasmine.any( Object ) );
		} );


		// TODO: Separate in different test
		it( "TransientUser.TYPE", ():void => {
			expect( TransientUser.TYPE ).toBeDefined();
			expect( Utils.isString( TransientUser.TYPE ) ).toBe( true );

			expect( TransientUser.TYPE ).toBe( CS.User );
		} );

		describe( "TransientUser.create", ():void => {

			it( "should exists", ():void => {
				expect( TransientUser.create ).toBeDefined();
				expect( TransientUser.create ).toEqual( jasmine.any( Function ) );
			} );

			it( "should call `User.createFrom`", ():void => {
				const spy:jasmine.Spy = spyOn( TransientUser, "createFrom" );

				TransientUser.create( { credentials: null } );
				expect( spy ).toHaveBeenCalledWith( jasmine.any( Object ) );
			} );

			it( "should pass the base object properties in copy", ():void => {
				const spy:jasmine.Spy = spyOn( TransientUser, "createFrom" );

				const base:BaseUser = { name: "TransientUser name", credentials: null };
				TransientUser.create( base );

				expect( spy.calls.argsFor( 0 )[ 0 ] ).toEqual( base );
				expect( spy.calls.argsFor( 0 )[ 0 ] ).not.toBe( base );
			} );

		} );

		describe( "TransientUser.createFrom", ():void => {

			it( "should exists", ():void => {
				expect( TransientUser.createFrom ).toBeDefined();
				expect( TransientUser.createFrom ).toEqual( jasmine.any( Function ) );
			} );

			it( "should return a TransientDocument", ():void => {
				const returned:TransientDocument = TransientUser.createFrom( { credentials: null } );
				expect( returned ).toEqual( anyThatMatches( TransientDocument.is, "isTransientDocument" ) as any );
			} );

			it( "should add cs:User type", ():void => {
				const user:TransientUser = TransientUser.createFrom( { credentials: null } );

				expect( user.types ).toContain( TransientUser.TYPE );
			} );

			it( "should convert the credentials in a fragment", ():void => {
				const user:TransientUser = TransientUser.createFrom( {
					credentials: UsernameAndPasswordCredentials.create( {
						username: "username@example.com",
						password: "password",
					} ),
				} );

				expect( user.credentials ).toEqual( anyThatMatches( TransientBlankNode.is, "BlankNode" ) as any );
			} );

		} );

	} );

} );
