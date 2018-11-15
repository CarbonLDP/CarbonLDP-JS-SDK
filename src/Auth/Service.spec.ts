import { anyThatMatches } from "../../test/helpers/jasmine-equalities";
import {
	createMockAuthService,
	createMockContext,
} from "../../test/helpers/mocks";

import { Context } from "../Context";
import { IllegalArgumentError } from "../Errors";
import { RequestOptions } from "../HTTP";
import {
	clazz,
	constructor,
	hasMethod,
	hasProperty,
	hasSignature,
	INSTANCE,
	isDefined,
	method,
	module
} from "../test/JasmineExtender";
import * as Utils from "../Utils";
import { C } from "../Vocabularies/C";
import { CS } from "../Vocabularies/CS";
import { XSD } from "../Vocabularies/XSD";
import { Authenticator } from "./Authenticator";
import { AuthMethod } from "./AuthMethod";
import { RolesEndpoint } from "./RolesEndpoint";

import { AuthService } from "./Service";

import { TokenCredentials } from "./TokenCredentials";
import { User } from "./User";
import { UsersEndpoint } from "./UsersEndpoint";


describe( module( "carbonldp/Auth/Service" ), ():void => {

	describe( clazz(
		"CarbonLDP.AuthService",
		"Abstract class that manages authentications and authorizations."
	), ():void => {

		beforeEach( ():void => {
			jasmine.Ajax.install();
		} );

		afterEach( ():void => {
			jasmine.Ajax.uninstall();
		} );

		it( isDefined(), ():void => {
			expect( AuthService ).toBeDefined();
			expect( Utils.isFunction( AuthService ) ).toBe( true );
		} );

		let context:Context;
		beforeEach( ():void => {
			context = createMockContext();
		} );

		describe( constructor(), ():void => {

			it( hasSignature( [
				{ name: "context", type: "CarbonLDP.Context" },
			] ), ():void => {} );

			it( "should be instantiable", ():void => {
				const auth:AuthService = new AuthService( context );
				expect( auth ).toEqual( jasmine.any( AuthService ) );
			} );

			it( "should assign UsersEndpoint in users", ():void => {
				const auth:AuthService = new AuthService( context );

				expect( auth.users ).toEqual( anyThatMatches( UsersEndpoint.is, "UsersEndpoint" ) as any );
				expect( auth.users ).toEqual( jasmine.objectContaining( {
					id: "https://example.com/users/",
				} ) );
			} );

			it( "should assign RolesEndpoint in roles", ():void => {
				const auth:AuthService = new AuthService( context );

				expect( auth.users ).toEqual( anyThatMatches( RolesEndpoint.is, "RolesEndpoint" ) as any );
				expect( auth.users ).toEqual( jasmine.objectContaining( {
					id: "https://example.com/users/",
				} ) );
			} );

		} );

		it( hasProperty(
			INSTANCE,
			"users",
			"CarbonLDP.Auth.UsersEndpoint",
			"Instance of `CarbonLDP.Auth.UsersEndpoint` that helps managing the users of your Carbon LDP."
		), ():void => {} );

		it( hasProperty(
			INSTANCE,
			"roles",
			"CarbonLDP.Auth.RolesEndpoint",
			"Instance of `CarbonLDP.Auth.RolesEndpoint` that helps managing the roles of your Carbon LDP."
		), ():void => {} );

		// TODO: Separate in different tests
		it( hasProperty(
			INSTANCE,
			"authenticatedUser",
			"CarbonLDP.Auth.User",
			"The user of the user that has been authenticated.\n" +
			"Returns `null` if the user it not authenticated."
		), ():void => {

			(() => {
				const auth:AuthService = new AuthService( context );
				expect( auth.authenticatedUser ).toBeNull();
			})();

			(() => {
				// Authenticated Auth
				let auth:AuthService = createMockAuthService( { context, user: true } );
				expect( auth.authenticatedUser ).toBeTruthy();
				expect( User.is( auth.authenticatedUser ) ).toBe( true );
			})();

			(() => {
				context.auth = createMockAuthService( { context, user: true } );

				let contextWithParent:Context = createMockContext( { parentContext: context, auth: true } );

				expect( context.auth.authenticatedUser ).toBeTruthy();
				expect( User.is( context.auth.authenticatedUser ) ).toBe( true );

				expect( contextWithParent.auth.authenticatedUser ).toBeTruthy();
				expect( User.is( contextWithParent.auth.authenticatedUser ) ).toBe( true );

				expect( context.auth.authenticatedUser ).toBe( contextWithParent.auth.authenticatedUser );
			})();

			(() => {
				context.auth = createMockAuthService( { context, user: true } );

				let childContext:Context = createMockContext( { parentContext: context } );
				childContext.auth = createMockAuthService( { context: childContext, user: true } );

				expect( context.auth.authenticatedUser ).toBeTruthy();
				expect( User.is( context.auth.authenticatedUser ) ).toBe( true );

				expect( childContext.auth.authenticatedUser ).toBeTruthy();
				expect( User.is( childContext.auth.authenticatedUser ) ).toBe( true );

				expect( context.auth.authenticatedUser ).not.toBe( childContext.auth.authenticatedUser );
			})();

		} );

		// TODO: Separate in different tests
		it( hasMethod(
			INSTANCE,
			"isAuthenticated",
			"Returns true if the user is authenticated.", [
				{ name: "askParent", type: "boolean", optional: true, defaultValue: "true" },
			],
			{ type: "boolean" }
		), ():void => {

			// Property Integrity
			(():void => {
				const auth:AuthService = new AuthService( context );
				expect( auth.isAuthenticated ).toBeDefined();
				expect( Utils.isFunction( auth.isAuthenticated ) ).toBe( true );
			})();


			// Neither current nor parent authenticated
			(():void => {
				let parentAuth:AuthService = new AuthService( context );
				context.auth = parentAuth;

				let subContext:Context = createMockContext( { parentContext: context } );
				let auth:AuthService = new AuthService( subContext );

				let spyParent:jasmine.Spy = spyOn( parentAuth, "isAuthenticated" ).and.returnValue( false );

				expect( auth.isAuthenticated() ).toBe( false );
				expect( spyParent ).toHaveBeenCalled();
				spyParent.calls.reset();

				expect( auth.isAuthenticated( true ) ).toBe( false );
				expect( spyParent ).toHaveBeenCalled();
				spyParent.calls.reset();

				expect( auth.isAuthenticated( false ) ).toBe( false );
				expect( spyParent ).not.toHaveBeenCalled();
			})();

			// Current not authenticated but parent is
			(():void => {
				context.auth = new AuthService( context );

				let subContext:Context = createMockContext( { parentContext: context } );
				let auth:AuthService = new AuthService( subContext );

				let spyParent:jasmine.Spy = spyOn( context.auth, "isAuthenticated" ).and.returnValue( true );

				expect( auth.isAuthenticated() ).toBe( true );
				expect( spyParent ).toHaveBeenCalled();
				spyParent.calls.reset();

				expect( auth.isAuthenticated( true ) ).toBe( true );
				expect( spyParent ).toHaveBeenCalled();
				spyParent.calls.reset();

				expect( auth.isAuthenticated( false ) ).toBe( false );
				expect( spyParent ).not.toHaveBeenCalled();
			})();

			// Current and parent authenticated
			(():void => {
				context.auth = createMockAuthService( { context } );
				const spyParent:jasmine.Spy = spyOn( context.auth, "isAuthenticated" ).and.returnValue( true );

				const authenticator:jasmine.SpyObj<Authenticator<{}, {}>> = jasmine.createSpyObj( "Authenticator", { isAuthenticated: true } );
				const subContext:Context = createMockContext( { parentContext: context } );
				const auth:AuthService = createMockAuthService( { context: subContext, authenticator: authenticator } );

				expect( auth.isAuthenticated() ).toBe( true );
				expect( spyParent ).not.toHaveBeenCalled();
				spyParent.calls.reset();

				expect( auth.isAuthenticated( true ) ).toBe( true );
				expect( spyParent ).not.toHaveBeenCalled();
				spyParent.calls.reset();

				expect( auth.isAuthenticated( false ) ).toBe( true );
				expect( spyParent ).not.toHaveBeenCalled();
			})();

			// Current authenticated but parent not
			(():void => {
				context.auth = createMockAuthService( { context } );
				const spyParent:jasmine.Spy = spyOn( context.auth, "isAuthenticated" ).and.returnValue( false );

				const subContext:Context = createMockContext( { parentContext: context } );
				const authenticator:jasmine.SpyObj<Authenticator<{}, {}>> = jasmine.createSpyObj( "Authenticator", { isAuthenticated: true } );
				const auth:AuthService = createMockAuthService( { context: subContext, authenticator } );

				expect( auth.isAuthenticated() ).toBe( true );
				expect( spyParent ).not.toHaveBeenCalled();
				spyParent.calls.reset();

				expect( auth.isAuthenticated( true ) ).toBe( true );
				expect( spyParent ).not.toHaveBeenCalled();
				spyParent.calls.reset();

				expect( auth.isAuthenticated( false ) ).toBe( true );
				expect( spyParent ).not.toHaveBeenCalled();
			})();

		} );

		// TODO: Separate in different tests
		it( hasMethod(
			INSTANCE,
			"authenticate",
			"Authenticate the user with a `username` and `password`. Uses the `CarbonLDP.Auth.AuthMethod.TOKEN` method for the authentication.", [
				{ name: "username", type: "string" },
				{ name: "password", type: "string" },
			],
			{ type: "Promise<CarbonLDP.Auth.TokenCredentials>" }
		), ():void => {
			let auth:AuthService = new AuthService( context );

			expect( auth.authenticate ).toBeDefined();
			expect( Utils.isFunction( auth.authenticate ) ).toBe( true );

			let spy:jasmine.Spy = spyOn( auth, "authenticateUsing" );

			//noinspection JSIgnoredPromiseFromCall
			auth.authenticate( "myUer@user.com", "myAwesomePassword" );

			expect( spy ).toHaveBeenCalledWith( AuthMethod.TOKEN, "myUer@user.com", "myAwesomePassword" );
		} );

		describe( method( INSTANCE, "authenticateUsing" ), ():void => {

			it( hasSignature(
				"Authenticates the user with Basic HTTP Authentication, which uses an encoded string with username and password in every request.", [
					{ name: "method", type: "CarbonLDP.Auth.AuthMethod.BASIC" },
					{ name: "username", type: "string" },
					{ name: "password", type: "string" },
				],
				{ type: "Promise<CarbonLDP.Auth.BasicCredentials>" }
			), ():void => {} );

			it( hasSignature(
				"Authenticates the user with a username and password, and generates a JSON Web Token (JWT) credential that will be used in every request.", [
					{ name: "method", type: "CarbonLDP.Auth.AuthMethod.TOKEN" },
					{ name: "username", type: "string" },
					{ name: "password", type: "string" },
				],
				{ type: "Promise<CarbonLDP.Auth.TokenCredentials>" }
			), ():void => {} );

			it( hasSignature(
				"Authenticates the user with a `CarbonLDP.Auth.TokenCredentials`, which contains a JSON Web Token (JWT) that will be used in every request.", [
					{ name: "method", type: "CarbonLDP.Auth.AuthMethod.TOKEN" },
					{ name: "token", type: "CarbonLDP.Auth.TokenCredentialsBase" },
				],
				{ type: "Promise<CarbonLDP.Auth.TokenCredentials>" }
			), ():void => {} );


			beforeEach( () => {
				jasmine.Ajax.stubRequest( "https://example.com/users/me/" ).andReturn( {
					status: 200,
					responseHeaders: {
						"eTag": `"1-12345"`,
					},
					responseText: `[ {
							"@id": "https://example.com/users/me/",
							"@graph": [
								{
									"@id": "https://example.com/users/me/",
									"@type": [ "${ C.Document }", "${ CS.AuthenticatedUserInformationAccessor }" ],
									"${ CS.authenticatedUserMetadata }": [ {
										"@id": "_:1"
									} ]
								},
								{
									"@id": "_:1",
									"@type": [ "${ CS.AuthenticatedUserMetadata }", "${ C.VolatileResource }" ],
									"${ CS.user }": [ {
										"@id": "https://example.com/users/the-user/"
									} ]
								}
							]
						} ]`,
				} );
			} );

			it( "should exists", ():void => {
				expect( AuthService.prototype.authenticateUsing ).toBeDefined();
				expect( AuthService.prototype.authenticateUsing ).toEqual( jasmine.any( Function ) );
			} );

			it( "should throw error if invalid auth method", ( done:DoneFn ):void => {
				const auth:AuthService = new AuthService( context );
				auth
					.authenticateUsing( "ERROR" as any, "username", "password" )
					.then( () => done.fail( "should not resolve" ) )
					.catch( error => {
						expect( () => { throw error; } ).toThrowError( IllegalArgumentError, `Invalid authentication method "ERROR".` );

						done();
					} );
			} );


			describe( "When BASIC auth method with basic credentials", ():void => {

				it( "should return credentials", ( done:DoneFn ):void => {
					const auth:AuthService = new AuthService( context );
					auth
						.authenticateUsing( AuthMethod.BASIC, "username", "password" )
						.then( credentials => {
							expect( credentials ).toBeDefined();
							expect( credentials ).toEqual( jasmine.objectContaining( {
								username: "username",
								password: "password",
							} ) );

							done();
						} )
						.catch( done.fail );
				} );

				it( "should populate the authenticated user", ( done:DoneFn ):void => {
					const auth:AuthService = new AuthService( context );
					auth
						.authenticateUsing( AuthMethod.BASIC, "username", "password" )
						.then( () => {
							expect( auth.authenticatedUser ).toBeDefined();
							expect( auth.authenticatedUser ).toEqual( jasmine.objectContaining( {
								_resolved: false,
								types: jasmine.arrayContaining( [ User.TYPE ] ) as any,
							} ) );

							done();
						} )
						.catch( done.fail );
				} );

			} );

			describe( "When TOKEN auth method with basic credentials", ():void => {

				beforeEach( ():void => {
					jasmine.Ajax.stubRequest( "https://example.com/users/me/" ).andReturn( {
						status: 200,
						responseHeaders: {
							"eTag": `"1-12345"`,
							"Preference-Applied": `include="${ CS.PreferAuthToken }"`,
						},
						responseText: `[ {
						"@id": "_:1",
						"@type": [ "${ C.ResponseMetadata }", "${ C.VolatileResource }" ],
						"${ CS.authToken }": [ {
							"@id": "_:2"
						} ]
					}, {
						"@id": "_:2",
						"@type": [ "${ CS.TokenCredentials }", "${ C.VolatileResource }" ],
						"${ CS.token }": [ {
							"@value": "token-key"
						} ],
						"${ CS.expires }": [ {
							"@value": "${ new Date( Date.now() + 24 * 60 * 60 * 1000 ).toISOString() }",
							"@type": "${ XSD.dateTime }"
						} ]
					}, {
						"@id": "https://example.com/users/me/",
						"@graph": [
							{
								"@id": "https://example.com/users/me/",
								"@type": [ "${ C.Document }", "${ CS.AuthenticatedUserInformationAccessor }" ],
								"${ CS.authenticatedUserMetadata }": [ {
									"@id": "_:1"
								} ]
							},
							{
								"@id": "_:1",
								"@type": [ "${ CS.AuthenticatedUserMetadata }", "${ C.VolatileResource }" ],
								"${ CS.user }": [ {
									"@id": "https://example.com/users/the-user/"
								} ]
							}
						]
					} ]`,
					} );
				} );

				it( "should return credentials", ( done:DoneFn ):void => {
					const auth:AuthService = new AuthService( context );
					auth
						.authenticateUsing( AuthMethod.TOKEN, "username", "password" )
						.then( credentials => {
							expect( credentials ).toBeDefined();
							expect( credentials ).toEqual( jasmine.objectContaining( {
								token: "token-key",
								expires: jasmine.any( Date ) as any as Date,
							} ) );

							done();
						} )
						.catch( done.fail );
				} );

				it( "should populate the authenticated user", ( done:DoneFn ):void => {
					const auth:AuthService = new AuthService( context );
					auth
						.authenticateUsing( AuthMethod.TOKEN, "username", "password" )
						.then( () => {
							expect( auth.authenticatedUser ).toBeDefined();
							expect( auth.authenticatedUser ).toEqual( jasmine.objectContaining( {
								_resolved: false,
								types: jasmine.arrayContaining( [ User.TYPE ] ) as any,
							} ) );

							done();
						} )
						.catch( done.fail );
				} );

			} );

			describe( "When TOKEN auth method with token credentials", ():void => {

				it( "should throw error if invalid token credentials", ( done:DoneFn ):void => {
					const auth:AuthService = new AuthService( context );
					auth
						.authenticateUsing( AuthMethod.TOKEN, {} as any )
						.then( () => done.fail( "should not resolve" ) )
						.catch( error => {
							expect( () => { throw error; } ).toThrowError( IllegalArgumentError, `Invalid authentication token.` );

							done();
						} );
				} );

				it( "should return credentials", ( done:DoneFn ):void => {
					const tokenCredentials:TokenCredentials = <TokenCredentials> {
						token: "token-key",
						expires: new Date( Date.now() + 24 * 60 * 60 * 1000 ),
					};

					const auth:AuthService = new AuthService( context );
					auth
						.authenticateUsing( AuthMethod.TOKEN, tokenCredentials )
						.then( credentials => {
							expect( credentials ).toBeDefined();
							expect( credentials ).toEqual( jasmine.objectContaining( {
								token: "token-key",
								expires: jasmine.any( Date ) as any as Date,
							} ) );

							done();
						} )
						.catch( done.fail );
				} );

				it( "should populate the authenticated user", ( done:DoneFn ):void => {
					const tokenCredentials:TokenCredentials = <TokenCredentials> {
						token: "token-key",
						expires: new Date( Date.now() + 24 * 60 * 60 * 1000 ),
					};

					const auth:AuthService = new AuthService( context );
					auth
						.authenticateUsing( AuthMethod.TOKEN, tokenCredentials )
						.then( () => {
							expect( auth.authenticatedUser ).toBeDefined();
							expect( auth.authenticatedUser ).toEqual( jasmine.objectContaining( {
								_resolved: false,
								types: jasmine.arrayContaining( [ User.TYPE ] ) as any,
							} ) );

							done();
						} )
						.catch( done.fail );
				} );

			} );

		} );

		// TODO: Separate in different tests
		it( hasMethod(
			INSTANCE,
			"addAuthentication",
			"Adds the authentication header to a `CarbonLDP.HTTP.RequestOptions` object.", [
				{ name: "options", type: "CarbonLDP.HTTP.RequestOptions" },
			]
		), ():void => {

			// Property Integrity
			(():void => {
				let auth:AuthService = new AuthService( context );

				expect( auth.addAuthentication ).toBeDefined();
				expect( Utils.isFunction( auth.addAuthentication ) ).toBe( true );
			})();

			// Neither current nor parent authenticated
			(():void => {
				const mockAuthSpy:jasmine.SpyObj<AuthService> = jasmine
					.createSpyObj( "AuthService", [ "addAuthentication" ] );
				context.auth = mockAuthSpy;

				let subContext:Context = createMockContext( { parentContext: context } );
				let auth:AuthService = new AuthService( subContext );

				let options:RequestOptions & { parentAuth?:string } = {};

				auth.addAuthentication( options );
				expect( mockAuthSpy.addAuthentication ).toHaveBeenCalledWith( options );
			})();

			// Current not authenticated but parent is
			(():void => {
				const mockAuthSpy:jasmine.SpyObj<AuthService> = jasmine
					.createSpyObj( "AuthService", [ "addAuthentication" ] );
				context.auth = mockAuthSpy;

				let subContext:Context = createMockContext( { parentContext: context } );
				let auth:AuthService = new AuthService( subContext );

				let options:RequestOptions & { parentAuth?:string } = {};

				auth.addAuthentication( options );
				expect( mockAuthSpy.addAuthentication ).toHaveBeenCalledWith( options );
			})();

			// Current and parent authenticated
			(():void => {
				const mockAuthSpy:jasmine.SpyObj<AuthService> = jasmine
					.createSpyObj( "AuthService", [ "addAuthentication" ] );
				context.auth = mockAuthSpy;

				let subContext:Context = createMockContext( { parentContext: context } );
				let auth:AuthService = new AuthService( subContext );

				(<any> auth).authenticator = {
					isAuthenticated: ():boolean => true, addAuthentication: ( mockOptions:any ):void => {
						mockOptions[ "currentAuth" ] = "is authenticated";
					},
				};

				let options:RequestOptions & { currentAuth?:string } = {};

				auth.addAuthentication( options );
				expect( mockAuthSpy.addAuthentication ).not.toHaveBeenCalled();
				expect( options ).toEqual( { currentAuth: "is authenticated" } );
			})();

			// Current authenticated but parent not
			(():void => {
				const parentAuth:AuthService = new AuthService( context );
				let spyParent:jasmine.Spy = spyOn( parentAuth, "addAuthentication" ).and.callFake( mockOptions => {
					mockOptions[ "parentAuth" ] = "no authenticated";
				} );

				let subContext:Context = createMockContext( { parentContext: context } );
				let auth:AuthService = new AuthService( subContext );
				(<any> auth).authenticator = {
					isAuthenticated: ():boolean => true, addAuthentication: ( mockOptions:any ):void => {
						mockOptions[ "currentAuth" ] = "is authenticated";
					},
				};

				let options:RequestOptions & { currentAuth?:string } = {};

				auth.addAuthentication( options );
				expect( spyParent ).not.toHaveBeenCalled();
				expect( options ).toEqual( { currentAuth: "is authenticated" } );
			})();

		} );

		// TODO: Separate in different tests
		it( hasMethod(
			INSTANCE,
			"clearAuthentication",
			"Deletes the authentication of the current instance."
		), ():void => {

			// Property Integrity
			(():void => {
				let auth:AuthService = new AuthService( context );

				expect( auth.clearAuthentication ).toBeDefined();
				expect( Utils.isFunction( auth.clearAuthentication ) ).toBe( true );
			})();

			// The module isn't authenticated
			(():void => {
				let auth:AuthService = new AuthService( context );

				auth.clearAuthentication();
				expect( (<any> auth).authenticator ).toBeFalsy();
			})();

			// The module is authenticated
			(():void => {
				let auth:AuthService = new AuthService( context );

				(<any> auth).authenticator = {
					isAuthenticated: ():boolean => true,
					clearAuthentication: ():void => {},
				};
				let spyClear:jasmine.Spy = spyOn( (<any> auth).authenticator, "clearAuthentication" );

				expect( auth.isAuthenticated() ).toBe( true );
				auth.clearAuthentication();
				expect( (<any> auth).authenticator ).toBeFalsy();
				expect( auth.isAuthenticated() ).toBe( false );
				expect( spyClear ).toHaveBeenCalled();
			})();

		} );

	} );

} );
