import { anyThatMatches } from "../../../test/helpers/jasmine-equalities";
import { StrictMinus } from "../../../test/helpers/types";
import { TransientBlankNode } from "../../BlankNode";
import { TransientDocument } from "../../Document";
import { TransientFragment } from "../../Fragment";
import {
	extendsClass,
	hasMethod,
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

		it( hasMethod(
			OBLIGATORY,
			"updateCredentials",
			"Add a credentials fragment with the properties provided. The document needs to be saved for the changes be applied in the platform.",
			[
				{ name: "username", type: "string" },
				{ name: "password", type: "string" },
			]
		), ():void => {
			const target:TransientUser[ "updateCredentials" ] = ( username?:string, password?:string ):TransientFragment & UsernameAndPasswordCredentials => null;
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
				"Creates a `CarbonLDP.Auth.TransientUser` object.",
				[
					{ name: "data", type: "CarbonLDP.Auth.BaseUser", description: "The data requited for creating a User document." },
				],
				{ type: "CarbonLDP.Auth.TransientUser" }
			), ():void => {} );

		} );

		describe( method( OBLIGATORY, "createFrom" ), ():void => {

			it( hasSignature(
				[ "T extends CarbonLDP.Auth.BaseUser" ],
				"Creates a `CarbonLDP.Auth.TransientUser` object with the one provided.",
				[
					{ name: "object", type: "T" },
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

		type MockUser = StrictMinus<TransientUser, TransientDocument>;

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

		describe( "TransientUser.isDecorated", ():void => {

			it( "should exists", ():void => {
				expect( TransientUser.isDecorated ).toBeDefined();
				expect( TransientUser.isDecorated ).toEqual( jasmine.any( Function ) );
			} );

			it( "should only reject in required properties", ():void => {
				const object:MockUser = {
					name: null,
					credentials: null,

					updateCredentials: ():any => {},
				};
				expect( TransientUser.isDecorated( object ) ).toBe( true );

				delete object.name;
				expect( TransientUser.isDecorated( object ) ).toBe( true );
				object.name = null;

				delete object.credentials;
				expect( TransientUser.isDecorated( object ) ).toBe( true );
				object.credentials = null;

				delete object.updateCredentials;
				expect( TransientUser.isDecorated( object ) ).toBe( false );
				object.updateCredentials = ():any => {};
			} );

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

			it( "should call the `User.decorate`", ():void => {
				const spy:jasmine.Spy = spyOn( TransientUser, "decorate" )
					.and.callThrough();

				const object:{ the:string } & BaseUser = { the: "object", credentials: null };
				TransientUser.createFrom( object );

				expect( spy ).toHaveBeenCalledWith( object );
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

		describe( "TransientUser.decorate", ():void => {

			it( "should exists", ():void => {
				expect( TransientUser.decorate ).toBeDefined();
				expect( TransientUser.decorate ).toEqual( jasmine.any( Function ) );
			} );

			it( "should return the same object", ():void => {
				const object:object = {};
				const returned:object = TransientUser.decorate( object );
				expect( returned ).toBe( object );
			} );

			it( "should return without changes if already with class properties", ():void => {
				const fn:() => any = () => {};
				const object:MockUser = {
					name: null,
					credentials: null,

					updateCredentials: fn,
				};

				TransientUser.decorate( object );
				expect( object ).toEqual( jasmine.objectContaining( {
					updateCredentials: fn,
				} ) );
			} );

			it( "should add the class properties", ():void => {
				const returned:TransientUser = TransientUser.decorate( {} );
				expect( returned ).toEqual( jasmine.objectContaining( {
					updateCredentials: jasmine.any( Function ),
				} ) );
			} );

			it( "should call `Document.decorate`", ():void => {
				const spy:jasmine.Spy = spyOn( TransientDocument, "decorate" );

				const object:object = { the: "object" };
				TransientUser.decorate( object );
				expect( spy ).toHaveBeenCalledWith( object );
			} );

		} );


		describe( "Decorated User", ():void => {

			let user:TransientUser;
			beforeEach( ():void => {
				user = TransientUser.create( {
					name: "TransientUser name",
					credentials: void 0,
				} );
			} );

			describe( "TransientUser.updateCredentials", ():void => {

				it( "should exists", ():void => {
					expect( user.updateCredentials ).toBeDefined();
					expect( user.updateCredentials ).toEqual( jasmine.any( Function ) );
				} );

				it( "should assign the credentials property", ():void => {
					user.updateCredentials( "username", "password" );

					expect( user.credentials ).toBeDefined();
					expect( user.credentials ).toEqual( jasmine.objectContaining( {
						username: "username",
						password: "password",
					} ) );
				} );

				it( "should return a credentials object", ():void => {
					const returned:UsernameAndPasswordCredentials = user.updateCredentials( "username", "password" );

					expect( returned ).toBeDefined();
					expect( returned ).toEqual( jasmine.objectContaining( {
						username: "username",
						password: "password",
					} ) );
				} );

				it( "should assign same object that returned", ():void => {
					const returned:UsernameAndPasswordCredentials = user.updateCredentials( "username", "password" );

					expect( returned ).toBeDefined( user.credentials );
				} );

				it( "should credentials be a blank node", ():void => {
					user.updateCredentials( "username", "password" );

					expect( user.credentials ).toBeDefined();
					expect( user.credentials ).toEqual( anyThatMatches( TransientBlankNode.is, "BlankNode" ) as any );
				} );

			} );

		} );

	} );

} );
