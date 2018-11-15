import { VolatileResource } from "../LDP";
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
import * as Utils from "../Utils";
import { CS } from "../Vocabularies/CS";
import { XSD } from "../Vocabularies/XSD";

import {
	UsernameAndPasswordCredentials,
	UsernameAndPasswordCredentialsBase,
} from "./UsernameAndPasswordCredentials";


describe( module( "carbonldp/Auth/UsernameAndPasswordCredentials" ), ():void => {

	describe( interfaze(
		"CarbonLDP.Auth.UsernameAndPasswordCredentialsBase",
		"Interface that represents the basic properties of a UsernameAndPasswordCredentials."
	), ():void => {

		it( extendsClass( "CarbonLDP.TransientResource" ), () => {} );

		it( hasProperty(
			OBLIGATORY,
			"username",
			"string",
			"The username of the credentials."
		), ():void => {} );

		it( hasProperty(
			OBLIGATORY,
			"password",
			"string",
			"The password of the credentials."
		), ():void => {} );

	} );


	describe( interfaze(
		"CarbonLDP.Auth.UsernameAndPasswordCredentials",
		"Interface that represents an in-memory UsernameAndPasswordCredentials of a user."
	), ():void => {

		it( extendsClass( "CarbonLDP.VolatileResource" ), ():void => {
			const target:VolatileResource = {} as UsernameAndPasswordCredentials;
			expect( target ).toBeDefined();
		} );

		it( hasProperty(
			OBLIGATORY,
			"username",
			"string",
			"Username of the user credentials."
		), ():void => {
			const username:UsernameAndPasswordCredentials[ "username" ] = "user@email.com";
			expect( username ).toBeDefined();
		} );

		it( hasProperty(
			OBLIGATORY,
			"password",
			"string",
			"Password of the user credentials."
		), ():void => {
			const password:UsernameAndPasswordCredentials[ "password" ] = "THE-password";
			expect( password ).toBeDefined();
		} );

	} );

	describe( interfaze(
		"CarbonLDP.Auth.UsernameAndPasswordCredentialsFactory",
		"Interface with the factory and utils for `CarbonLDP.Auth.UsernameAndPasswordCredentials` objects."
	), ():void => {

		it( hasProperty(
			OBLIGATORY,
			"TYPE",
			"CarbonLDP.Vocabularies.CS.UsernameAndPasswordCredentials"
		), ():void => {} );

		it( hasProperty(
			OBLIGATORY,
			"SCHEMA",
			"CarbonLDP.ObjectSchema"
		), ():void => {} );

		it( hasMethod(
			OBLIGATORY,
			"create",
			"Creates a `CarbonLDP.Auth.UsernameAndPasswordCredentials` object with the username and password specified.", [
				{ name: "data", type: "CarbonLDP.Auth.UsernameAndPasswordCredentialsBase", description: "Object with the username and password for the credentials." },
			],
			{ type: "CarbonLDP.Auth.UsernameAndPasswordCredentials" }
		), ():void => {} );

		it( hasMethod(
			OBLIGATORY,
			"createFrom",
			[ "T extends CarbonLDP.Auth.UsernameAndPasswordCredentialsBase" ],
			"Creates a `CarbonLDP.Auth.UsernameAndPasswordCredentials` object from the object and parameters specified.",
			[
				{ name: "object", type: "T", description: "Object that will be converted into a credentials resource" },
			],
			{ type: "T & CarbonLDP.Auth.UsernameAndPasswordCredentials" }
		), ():void => {} );

	} );

	describe( property(
		STATIC,
		"UsernameAndPasswordCredentials",
		"CarbonLDP.Auth.UsernameAndPasswordCredentialsFactory"
	), ():void => {

		it( isDefined(), ():void => {
			expect( UsernameAndPasswordCredentials ).toBeDefined();
			expect( UsernameAndPasswordCredentials ).toEqual( jasmine.any( Object ) );
		} );

		// TODO: Separate in different tests
		it( "UsernameAndPasswordCredentials.TYPE", ():void => {
			expect( UsernameAndPasswordCredentials.TYPE ).toBeDefined();
			expect( UsernameAndPasswordCredentials.TYPE ).toEqual( jasmine.any( String ) );

			expect( UsernameAndPasswordCredentials.TYPE ).toBe( CS.UsernameAndPasswordCredentials );
		} );

		// TODO: Separate in different tests
		it( "UsernameAndPasswordCredentials.SCHEMA", ():void => {
			expect( UsernameAndPasswordCredentials.SCHEMA ).toBeDefined();
			expect( UsernameAndPasswordCredentials.SCHEMA ).toEqual( jasmine.any( Object ) );

			expect( Utils.hasProperty( UsernameAndPasswordCredentials.SCHEMA, "username" ) ).toBe( true );
			expect( UsernameAndPasswordCredentials.SCHEMA[ "username" ] ).toEqual( {
				"@id": CS.username,
				"@type": XSD.string,
			} );

			expect( Utils.hasProperty( UsernameAndPasswordCredentials.SCHEMA, "password" ) ).toBe( true );
			expect( UsernameAndPasswordCredentials.SCHEMA[ "password" ] ).toEqual( {
				"@id": CS.password,
				"@type": XSD.string,
			} );
		} );

		describe( "UsernameAndPasswordCredentials.create", ():void => {

			it( "should exists", ():void => {
				expect( UsernameAndPasswordCredentials.create ).toBeDefined();
				expect( UsernameAndPasswordCredentials.create ).toEqual( jasmine.any( Function ) );
			} );

			it( "should call UsernameAndPasswordCredentials.createFrom", ():void => {
				const spy:jasmine.Spy = spyOn( UsernameAndPasswordCredentials, "createFrom" );

				UsernameAndPasswordCredentials.create( {
					username: "username@example.com",
					password: "myAwesomePassword",
				} );

				expect( spy ).toHaveBeenCalledWith( {
					username: "username@example.com",
					password: "myAwesomePassword",
				} );
			} );

			it( "should return another object", ():void => {
				const baseCredentials:UsernameAndPasswordCredentialsBase = {
					username: "username@example.com",
					password: "myAwesomePassword",
				};
				const returned:UsernameAndPasswordCredentials = UsernameAndPasswordCredentials
					.create( baseCredentials );

				expect( returned ).not.toBe( baseCredentials as any );
			} );

		} );

		describe( "UsernameAndPasswordCredentials.createFrom", ():void => {

			it( "should exists", ():void => {
				expect( UsernameAndPasswordCredentials.createFrom ).toBeDefined();
				expect( UsernameAndPasswordCredentials.createFrom ).toEqual( jasmine.any( Function ) );
			} );


			it( "should return the same object provided", ():void => {
				const object:UsernameAndPasswordCredentialsBase = {
					username: "username@example.com",
					password: "myAwesomePassword",
				};

				const returned:{} = UsernameAndPasswordCredentials.createFrom( object );

				expect( returned ).toBe( object );
			} );

			it( "should return object with the credentials properties", ():void => {
				const returned:{ the:string } & UsernameAndPasswordCredentials = UsernameAndPasswordCredentials
					.createFrom( {
						the: "credentials",
						username: "username@example.com",
						password: "myAwesomePassword",
					} );

				expect( returned ).toEqual( {
					the: "credentials",
					username: "username@example.com",
					password: "myAwesomePassword",
				} as any );
			} );

			it( "should add the cs:UsernameAndPasswordCredentials type", ():void => {
				const credentials:UsernameAndPasswordCredentials = UsernameAndPasswordCredentials.createFrom( {
					username: "username@example.com",
					password: "myAwesomePassword",
				} );

				expect( credentials.types ).toContain( CS.UsernameAndPasswordCredentials );
			} );

		} );

	} );

} );
