import {
	clazz,
	hasConstructor,
	hasDefaultExport,
	hasMethod,
	hasSignature,
	INSTANCE,
	isDefined,
	method,
	module,
} from "../test/JasmineExtender";

import AbstractContext from "./../AbstractContext";
import * as Errors from "./../Errors";
import * as HTTP from "./../HTTP";
import * as NS from "./../NS";
import * as Resource from "./../Resource";
import * as Utils from "./../Utils";
import * as PersistedUser from "./PersistedUser";

import * as TokenAuthenticator from "./TokenAuthenticator";
import DefaultExport from "./TokenAuthenticator";

import * as TokenCredentials from "./TokenCredentials";
import UsernameAndPasswordToken from "./UsernameAndPasswordToken";

describe( module( "Carbon/Auth/TokenAuthenticator" ), ():void => {

	it( isDefined(), ():void => {
		expect( TokenAuthenticator ).toBeDefined();
		expect( Utils.isObject( TokenAuthenticator ) ).toEqual( true );
	} );

	it( "should have token container constant", () => {
		expect( TokenAuthenticator.TOKEN_CONTAINER ).toBeDefined();
		expect( TokenAuthenticator.TOKEN_CONTAINER ).toBe( "auth-tokens/" );
	} );

	describe( clazz(
		"Carbon.Auth.TokenAuthenticator.Class",
		"Authenticates requests using JSON Web TokenCredentials (JWT) Authentication.", [
			"Carbon.Auth.Authenticator.Class<Carbon.Auth.UsernameAndPasswordToken.Class>",
		]
	), ():void => {

		beforeEach( function():void {
			jasmine.Ajax.install();
		} );

		afterEach( function():void {
			jasmine.Ajax.uninstall();
		} );

		it( isDefined(), ():void => {
			expect( TokenAuthenticator.Class ).toBeDefined();
			expect( Utils.isFunction( TokenAuthenticator.Class ) ).toEqual( true );
		} );

		it( hasConstructor( [
			{ name: "context", type: "Carbon.Context.Class", description: "The context where to authenticate the user." },
		] ), ():void => {
			class MockedContext extends AbstractContext {
				protected _baseURI:string;

				constructor() {
					super();
					this._baseURI = "http://example.com/";
					this.setSetting( "system.container", ".system/" );
				}
			}

			let authenticator:TokenAuthenticator.Class = new TokenAuthenticator.Class( new MockedContext() );

			expect( ! ! authenticator ).toEqual( true );
			expect( authenticator instanceof TokenAuthenticator.Class ).toEqual( true );
		} );


		describe( method( INSTANCE, "isAuthenticated" ), ():void => {

			it( hasSignature(
				"Returns true if the instance contains stored credentials.",
				{ type: "boolean" }
			), ():void => {} );

			function createAuthenticatorWith( credentials?:TokenCredentials.Class ):TokenAuthenticator.Class {
				return new class extends TokenAuthenticator.Class {
					constructor() {
						super( context );
						if( credentials ) this.credentials = credentials;
					}
				};
			}

			let context:AbstractContext;
			beforeEach( ():void => {
				context = new class extends AbstractContext {
					protected _baseURI:string = "https://example.com/";
				};
			} );

			it( "should exists", ():void => {
				expect( TokenAuthenticator.Class.prototype.isAuthenticated ).toBeDefined();
				expect( TokenAuthenticator.Class.prototype.isAuthenticated ).toEqual( jasmine.any( Function ) );
			} );

			it( "should return false when no credentials", ():void => {
				const authenticator:TokenAuthenticator.Class = createAuthenticatorWith();
				expect( authenticator.isAuthenticated() ).toBe( false );
			} );

			it( "should return false when null credentials", ():void => {
				const authenticator:TokenAuthenticator.Class = createAuthenticatorWith( null );
				expect( authenticator.isAuthenticated() ).toBe( false );
			} );

			it( "should return true when not expired credentials", ():void => {
				const expirationTime:Date = new Date();
				expirationTime.setDate( expirationTime.getDate() + 1 );

				const credentials:TokenCredentials.Class = Resource.Factory.createFrom( {
					key: "token-value",
					expirationTime,
				} );

				const authenticator:TokenAuthenticator.Class = createAuthenticatorWith( credentials );
				expect( authenticator.isAuthenticated() ).toBe( true );
			} );

			it( "should return true when expired credentials with by current time", ():void => {
				const expirationTime:Date = new Date();
				const credentials:TokenCredentials.Class = Resource.Factory.createFrom( {
					key: "token-value",
					expirationTime,
				} );

				const authenticator:TokenAuthenticator.Class = createAuthenticatorWith( credentials );
				expect( authenticator.isAuthenticated() ).toBe( false );
			} );

			it( "should return true when expired credentials with by one day", ():void => {
				const expirationTime:Date = new Date();
				expirationTime.setDate( expirationTime.getDate() - 1 );

				const credentials:TokenCredentials.Class = Resource.Factory.createFrom( {
					key: "token-value",
					expirationTime,
				} );

				const authenticator:TokenAuthenticator.Class = createAuthenticatorWith( credentials );
				expect( authenticator.isAuthenticated() ).toBe( false );
			} );

		} );

		describe( method(
			INSTANCE,
			"authenticate"
		), ():void => {

			it( hasSignature(
				"Stores credentials to authenticate future requests.", [
					{ name: "authenticationToken", type: "Carbon.Auth.UsernameAndPasswordToken" },
				],
				{ type: "Promise<Carbon.Auth.TokenCredentials.Class>" }
			), ( done:{ ():void, fail:( error:Error ) => void } ):void => {

				// Property Integrity
				(() => {
					class MockedContext extends AbstractContext {
						protected _baseURI:string;

						constructor() {
							super();
							this._baseURI = "http://example.com/";
							this.setSetting( "system.container", ".system/" );
						}
					}

					let context:AbstractContext = new MockedContext();
					let authenticator:TokenAuthenticator.Class = new TokenAuthenticator.Class( context );

					expect( "authenticate" in authenticator ).toEqual( true );
					expect( Utils.isFunction( authenticator.authenticate ) ).toEqual( true );
				})();

				let promises:Promise<void>[] = [];

				// Successful Authentication
				(() => {
					class SuccessfulContext extends AbstractContext {
						protected _baseURI:string;

						constructor() {
							super();
							this._baseURI = "http://successful.example.com/";
							this.setSetting( "system.container", ".system/" );
						}
					}

					let expirationTime:Date = new Date();
					expirationTime.setDate( expirationTime.getDate() + 1 );
					jasmine.Ajax.stubRequest( "http://successful.example.com/.system/auth-tokens/", null, "POST" ).andReturn( {
						status: 200,
						responseText: `[ {
							"@id": "_:00",
							"@type": [
								"${ NS.C.Class.ResponseMetadata }",
								"${ NS.C.Class.VolatileResource }"
							],
							"${ NS.C.Predicate.documentMetadata }": [ {
								"@id": "_:01"
							} ]
						}, {
							"@id": "_:01",
							"@type": [
								"${ NS.C.Class.DocumentMetadata }",
								"${ NS.C.Class.VolatileResource }"
							],
							"${ NS.C.Predicate.eTag }": [ {
								"@value": "\\"1234567890\\""
							} ],
							"${ NS.C.Predicate.relatedDocument }": [ {
								"@id": "http://successful.example.com/users/my-user/"
							} ]
						}, {
							"@id": "_:02",
							"@type": [
								"${ NS.CS.Class.Token }",
								"${ NS.C.Class.VolatileResource }"
							],
							"${ NS.CS.Predicate.tokenKey }": [ {
								"@value": "token-value"
							} ],
							"${ NS.CS.Predicate.expirationTime }": {
								"@value": "${ expirationTime.toISOString() }",
								"@type": "${ NS.XSD.DataType.dateTime }"
							},
							"${ NS.CS.Predicate.credentialsOf }": [ {
								"@id": "http://successful.example.com/users/my-user/"
							} ]
						}, {
							"@id": "http://successful.example.com/users/my-user/",
							"@graph": [ {
								"@id": "http://successful.example.com/users/my-user/",
								"@type": [ "${ NS.CS.Class.User }" ],
								"${ NS.CS.Predicate.name }": [ {
									"@value": "My User Name",
									"@type": "${ NS.XSD.DataType.string }"
								} ],
								"${ NS.VCARD.Predicate.email }": [ {
									"@value": "my-user@users.com",
									"@type": "${ NS.XSD.DataType.string }"
								} ],
								"${ NS.CS.Predicate.enabled }": [ {
									"@value": "true",
									"@type": "${ NS.XSD.DataType.boolean }"
								} ]
							} ]
						} ]`,
					} );

					let context:SuccessfulContext = new SuccessfulContext();
					let authenticator:TokenAuthenticator.Class = new TokenAuthenticator.Class( context );

					promises.push( authenticator.authenticate( new UsernameAndPasswordToken( "user", "pass" ) ).then( ( token:TokenCredentials.Class ):void => {
						expect( authenticator.isAuthenticated() ).toEqual( true );

						expect( token ).toBeDefined();
						expect( token ).not.toBeNull();
						expect( TokenCredentials.Factory.is( token ) ).toEqual( true );

						expect( PersistedUser.Factory.is( token.user ) ).toBe( true );
					} ) );
				})();

				// Unsuccessful Authentication
				(() => {
					class UnsuccessfulContext extends AbstractContext {
						protected _baseURI:string;

						constructor() {
							super();
							this._baseURI = "http://unsuccessful.example.com/";
							this.setSetting( "system.container", ".system/" );
						}
					}

					let expirationTime:Date = new Date();
					expirationTime.setDate( expirationTime.getDate() + 1 );
					jasmine.Ajax.stubRequest( "http://unsuccessful.example.com/.system/auth-tokens/", null, "POST" ).andReturn( {
						status: 401,
					} );

					let context:UnsuccessfulContext = new UnsuccessfulContext();
					let authenticator:TokenAuthenticator.Class = new TokenAuthenticator.Class( context );

					promises.push( authenticator.authenticate( new UsernameAndPasswordToken( "user", "pass" ) ).then( () => {
						done.fail( new Error( "The authentication should have been unsuccessful." ) );
					}, ( error:Error ) => {
						expect( error instanceof HTTP.Errors.UnauthorizedError ).toEqual( true );

						expect( authenticator.isAuthenticated() ).toEqual( false );
					} ) );
				})();

				Promise.all( promises ).then( done, done.fail );
			} );

			it( hasSignature(
				"Stores credentials to authenticate future requests.", [
					{ name: "token", type: "Carbon.Auth.TokenCredentials.Class" },
				],
				{ type: "Promise<Carbon.Auth.TokenCredentials.Class>" }
			), ( done:{ ():void, fail:( error:Error ) => void } ):void => {

				class MockedContext extends AbstractContext {
					protected _baseURI:string;

					constructor() {
						super();
						this._baseURI = "http://example.com/";
						this.setSetting( "system.container", ".system/" );
					}
				}

				let context:AbstractContext = new MockedContext();

				// Property Integrity
				(() => {
					let authenticator:TokenAuthenticator.Class = new TokenAuthenticator.Class( context );

					expect( "authenticate" in authenticator ).toEqual( true );
					expect( Utils.isFunction( authenticator.authenticate ) ).toEqual( true );
				})();

				let promises:Promise<void>[] = [];

				// Successful Authentication
				(() => {
					let expirationTime:Date = new Date();
					expirationTime.setDate( expirationTime.getDate() + 1 );
					let tokenString:string = `{
						"expirationTime": "${ expirationTime.toISOString() }",
						"id": "",
						"key": "token-value",
						"types": [ "${ NS.CS.Class.Token }" ],
						"user": { "id": "http://exmple.com/users/my-user/" }
					}`;
					let authenticator:TokenAuthenticator.Class = new TokenAuthenticator.Class( context );

					promises.push( authenticator.authenticate( JSON.parse( tokenString ) )
						.then( ( tokenCredentials:TokenCredentials.Class ):void => {
							expect( authenticator.isAuthenticated() ).toEqual( true );

							expect( tokenCredentials ).toBeDefined();
							expect( tokenCredentials ).not.toBeNull();
							expect( TokenCredentials.Factory.hasClassProperties( tokenCredentials ) ).toEqual( true );
						} )
					);
				})();
				(() => {
					let expirationTime:Date = new Date();
					expirationTime.setDate( expirationTime.getDate() + 1 );
					let tokenString:string = `{
						"expirationTime": "${expirationTime.toISOString()}",
						"id": "",
						"key": "token-value",
						"types": [ "${ NS.CS.Class.Token }" ]
					}`;
					let authenticator:TokenAuthenticator.Class = new TokenAuthenticator.Class( context );

					promises.push( authenticator.authenticate( JSON.parse( tokenString ) )
						.then( ( tokenCredentials:TokenCredentials.Class ):void => {
							expect( authenticator.isAuthenticated() ).toEqual( true );

							expect( tokenCredentials ).toBeDefined();
							expect( tokenCredentials ).not.toBeNull();
							expect( TokenCredentials.Factory.hasClassProperties( tokenCredentials ) ).toEqual( true );
						} )
					);
				})();

				// Unsuccessful Authentication, time expired
				(() => {
					let expirationTime:Date = new Date();
					expirationTime.setDate( expirationTime.getDate() - 1 );
					let tokenString:string = `{
						"expirationTime": "${ expirationTime.toISOString() }",
						"id": "",
						"key": "token-value",
						"types": [ "${ NS.CS.Class.Token }" ],
						"user": { "id": "http://exmple.com/users/my-user/" }
					}`;
					let authenticator:TokenAuthenticator.Class = new TokenAuthenticator.Class( context );

					promises.push( authenticator.authenticate( JSON.parse( tokenString ) ).then( () => {
						done.fail( new Error( "The authentication should have been unsuccessful." ) );
					}, ( error:Error ) => {
						expect( error instanceof Errors.IllegalArgumentError ).toEqual( true );

						expect( authenticator.isAuthenticated() ).toEqual( false );
					} ) );
				})();

				Promise.all( promises ).then( done, done.fail );
			} );

		} );

		it( hasMethod(
			INSTANCE,
			"addAuthentication",
			"Adds the TokenCredentials Authentication header to the passed request options object.\n" +
			"The `Carbon.HTTP.Request.Options` provided is returned without modifications if it already has an authentication header.", [
				{ name: "requestOptions", type: "Carbon.HTTP.Request.Options", description: "Request options object to add Authentication headers." },
			],
			{ type: "Carbon.HTTP.Request.Options", description: "The request options with the added authentication headers." }
		), ():void => {

			// Property Integrity
			(() => {
				class MockedContext extends AbstractContext {
					protected _baseURI:string;

					constructor() {
						super();
						this._baseURI = "http://example.com/";
						this.setSetting( "system.container", ".system/" );
					}
				}

				let authenticator:TokenAuthenticator.Class = new TokenAuthenticator.Class( new MockedContext() );

				expect( "addAuthentication" in authenticator ).toEqual( true );
				expect( Utils.isFunction( authenticator.addAuthentication ) ).toEqual( true );
			})();

			(() => {
				class Context extends AbstractContext {
					protected _baseURI:string;

					constructor() {
						super();
						this._baseURI = "http://successful.example.com/";
						this.setSetting( "system.container", ".system/" );
					}
				}

				let context:AbstractContext = new Context();
				let authenticator:TokenAuthenticator.Class = new TokenAuthenticator.Class( context );

				let expirationTime:Date = new Date();
				expirationTime.setDate( expirationTime.getDate() + 1 );
				(<any> authenticator).credentials = {
					key: "token-value",
					expirationTime: expirationTime,
				};

				let requestOptions:HTTP.Request.Options = authenticator.addAuthentication( {} );

				expect( ! ! requestOptions ).toEqual( true );
				expect( Utils.isObject( requestOptions ) ).toEqual( true );
				expect( "headers" in requestOptions ).toEqual( true );
				expect( requestOptions.headers instanceof Map ).toEqual( true );
				expect( requestOptions.headers.has( "authorization" ) ).toEqual( true );

				let authorizationHeader:HTTP.Header.Class = requestOptions.headers.get( "authorization" );

				expect( authorizationHeader instanceof HTTP.Header.Class ).toEqual( true );
				expect( authorizationHeader.values.length ).toEqual( 1 );

				let authorization:string = authorizationHeader.toString();

				expect( Utils.S.startsWith( authorization, "Token " ) ).toEqual( true );
				expect( authorization.substring( 6 ) ).toEqual( "token-value" );
			})();

			(() => {
				class Context extends AbstractContext {
					protected _baseURI:string;

					constructor() {
						super();
						this._baseURI = "http://successfull.example.com/";
						this.setSetting( "system.container", ".system/" );
					}
				}

				let context:AbstractContext = new Context();
				let authenticator:TokenAuthenticator.Class = new TokenAuthenticator.Class( context );

				let expirationTime:Date = new Date();
				expirationTime.setDate( expirationTime.getDate() + 1 );
				(<any> authenticator).credentials = {
					key: "token-value",
					expirationTime: expirationTime,
				};

				let requestOptions:HTTP.Request.Options = {
					headers: new Map<string, HTTP.Header.Class>(),
				};
				authenticator.addAuthentication( requestOptions );

				expect( ! ! requestOptions ).toEqual( true );
				expect( Utils.isObject( requestOptions ) ).toEqual( true );
				expect( "headers" in requestOptions ).toEqual( true );
				expect( requestOptions.headers instanceof Map ).toEqual( true );
				expect( requestOptions.headers.size ).toEqual( 1 );
				expect( requestOptions.headers.has( "authorization" ) ).toEqual( true );

				let authorizationHeader:HTTP.Header.Class = requestOptions.headers.get( "authorization" );

				expect( authorizationHeader instanceof HTTP.Header.Class ).toEqual( true );
				expect( authorizationHeader.values.length ).toEqual( 1 );

				let authorization:string = authorizationHeader.toString();

				expect( Utils.S.startsWith( authorization, "Token " ) ).toEqual( true );
				expect( authorization.substring( 6 ) ).toEqual( "token-value" );
			})();

			(() => {
				class Context extends AbstractContext {
					protected _baseURI:string;

					constructor() {
						super();
						this._baseURI = "http://successfull.example.com/";
						this.setSetting( "system.container", ".system/" );
					}
				}

				let context:AbstractContext = new Context();
				let authenticator:TokenAuthenticator.Class = new TokenAuthenticator.Class( context );

				let expirationTime:Date = new Date();
				expirationTime.setDate( expirationTime.getDate() + 1 );
				(<any> authenticator).credentials = {
					key: "token-value",
					expirationTime: expirationTime,
				};

				let requestOptions:HTTP.Request.Options = {
					headers: new Map<string, HTTP.Header.Class>(),
				};
				requestOptions.headers.set( "content-type", new HTTP.Header.Class( "text/plain" ) );
				requestOptions.headers.set( "accept", new HTTP.Header.Class( "text/plain" ) );
				authenticator.addAuthentication( requestOptions );

				expect( ! ! requestOptions ).toEqual( true );
				expect( Utils.isObject( requestOptions ) ).toEqual( true );
				expect( "headers" in requestOptions ).toEqual( true );
				expect( requestOptions.headers instanceof Map ).toEqual( true );
				expect( requestOptions.headers.size ).toEqual( 3 );
				expect( requestOptions.headers.has( "content-type" ) ).toEqual( true );
				expect( requestOptions.headers.has( "accept" ) ).toEqual( true );
				expect( requestOptions.headers.has( "authorization" ) ).toEqual( true );

				let authorizationHeader:HTTP.Header.Class = requestOptions.headers.get( "authorization" );

				expect( authorizationHeader instanceof HTTP.Header.Class ).toEqual( true );
				expect( authorizationHeader.values.length ).toEqual( 1 );

				let authorization:string = authorizationHeader.toString();

				expect( Utils.S.startsWith( authorization, "Token " ) ).toEqual( true );
				expect( authorization.substring( 6 ) ).toEqual( "token-value" );
			})();

			(() => {
				class Context extends AbstractContext {
					protected _baseURI:string;

					constructor() {
						super();
						this._baseURI = "http://successful.example.com/";
						this.setSetting( "system.container", ".system/" );
					}
				}

				let context:AbstractContext = new Context();
				let authenticator:TokenAuthenticator.Class = new TokenAuthenticator.Class( context );

				let expirationTime:Date = new Date();
				expirationTime.setDate( expirationTime.getDate() + 1 );
				(<any> authenticator).credentials = {
					key: "token-value",
					expirationTime: expirationTime,
				};

				let requestOptions:HTTP.Request.Options = {
					headers: new Map<string, HTTP.Header.Class>(),
				};
				requestOptions.headers.set( "content-type", new HTTP.Header.Class( "text/plain" ) );
				requestOptions.headers.set( "accept", new HTTP.Header.Class( "text/plain" ) );
				requestOptions.headers.set( "authorization", new HTTP.Header.Class( "Another another-type-of-authorization" ) );
				authenticator.addAuthentication( requestOptions );

				expect( ! ! requestOptions ).toEqual( true );
				expect( Utils.isObject( requestOptions ) ).toEqual( true );
				expect( "headers" in requestOptions ).toEqual( true );
				expect( requestOptions.headers instanceof Map ).toEqual( true );
				expect( requestOptions.headers.size ).toEqual( 3 );
				expect( requestOptions.headers.has( "content-type" ) ).toEqual( true );
				expect( requestOptions.headers.has( "accept" ) ).toEqual( true );
				expect( requestOptions.headers.has( "authorization" ) ).toEqual( true );

				let authorizationHeader:HTTP.Header.Class = requestOptions.headers.get( "authorization" );

				expect( authorizationHeader instanceof HTTP.Header.Class ).toEqual( true );
				expect( authorizationHeader.values.length ).toEqual( 1 );

				let authorization:string = authorizationHeader.toString();

				expect( Utils.S.startsWith( authorization, "Another " ) ).toEqual( true );
				expect( authorization.substring( 8 ) ).toEqual( "another-type-of-authorization" );
			})();

			(() => {
				class Context extends AbstractContext {
					protected _baseURI:string;

					constructor() {
						super();
						this._baseURI = "http://successful.example.com/";
						this.setSetting( "system.container", ".system/" );
					}
				}

				let context:AbstractContext = new Context();
				let authenticator:TokenAuthenticator.Class = new TokenAuthenticator.Class( context );

				let expirationTime:Date = new Date();
				expirationTime.setDate( expirationTime.getDate() + 1 );
				(<any> authenticator).credentials = {
					key: "token-value",
					expirationTime: expirationTime,
				};

				let requestOptions:HTTP.Request.Options = {
					headers: new Map<string, HTTP.Header.Class>(),
				};
				requestOptions.headers.set( "content-type", new HTTP.Header.Class( "text/plain" ) );
				requestOptions.headers.set( "accept", new HTTP.Header.Class( "text/plain" ) );
				requestOptions.headers.set( "authorization", new HTTP.Header.Class( "Token another-token-value" ) );
				authenticator.addAuthentication( requestOptions );

				expect( ! ! requestOptions ).toEqual( true );
				expect( Utils.isObject( requestOptions ) ).toEqual( true );
				expect( "headers" in requestOptions ).toEqual( true );
				expect( requestOptions.headers instanceof Map ).toEqual( true );
				expect( requestOptions.headers.size ).toEqual( 3 );
				expect( requestOptions.headers.has( "content-type" ) ).toEqual( true );
				expect( requestOptions.headers.has( "accept" ) ).toEqual( true );
				expect( requestOptions.headers.has( "authorization" ) ).toEqual( true );

				let authorizationHeader:HTTP.Header.Class = requestOptions.headers.get( "authorization" );

				expect( authorizationHeader instanceof HTTP.Header.Class ).toEqual( true );
				expect( authorizationHeader.values.length ).toEqual( 1 );

				let authorization:string = authorizationHeader.toString();

				expect( Utils.S.startsWith( authorization, "Token " ) ).toEqual( true );
				expect( authorization.substring( 6 ) ).toEqual( "another-token-value" );
			})();

		} );

		it( hasMethod( INSTANCE, "clearAuthentication", `
			Clears any saved credentials and restores the Authenticator to its initial state.
		` ), ( done:{ ():void; fail:( error:any ) => void } ):void => {
			// Property Integrity
			(() => {
				class MockedContext extends AbstractContext {
					protected _baseURI:string;

					constructor() {
						super();
						this._baseURI = "http://example.com/";
						this.setSetting( "system.container", ".system/" );
					}
				}

				let authenticator:TokenAuthenticator.Class = new TokenAuthenticator.Class( new MockedContext() );

				expect( "clearAuthentication" in authenticator ).toEqual( true );
				expect( Utils.isFunction( authenticator.clearAuthentication ) ).toEqual( true );

				expect( () => authenticator.clearAuthentication() ).not.toThrow();
			})();

			let promises:Promise<void>[] = [];

			// Successful Authentication
			(() => {
				class SuccessfulContext extends AbstractContext {
					protected _baseURI:string;

					constructor() {
						super();
						this._baseURI = "http://successful.example.com/";
						this.setSetting( "system.container", ".system/" );
					}
				}

				let expirationTime:Date = new Date();
				expirationTime.setDate( expirationTime.getDate() + 1 );
				jasmine.Ajax.stubRequest( "http://successful.example.com/.system/auth-tokens/", null, "POST" ).andReturn( {
					status: 200,
					responseText: `[ {
						"@id": "_:00",
						"@type": [
							"${ NS.C.Class.ResponseMetadata }",
							"${ NS.C.Class.VolatileResource }"
						],
						"${ NS.C.Predicate.documentMetadata }": [ {
							"@id": "_:01"
						} ]
					}, {
						"@id": "_:01",
						"@type": [
							"${ NS.C.Class.DocumentMetadata }",
							"${ NS.C.Class.VolatileResource }"
						],
						"${ NS.C.Predicate.eTag }": [ {
							"@value": "\\"1234567890\\""
						} ],
						"${ NS.C.Predicate.relatedDocument }": [ {
							"@id": "http://successful.example.com/users/my-user/"
						} ]
					}, {
						"@id": "_:02",
						"@type": [
							"${ NS.CS.Class.Token }",
							"${ NS.C.Class.VolatileResource }"
						],
						"${ NS.CS.Predicate.tokenKey }": [ {
							"@value": "token-value"
						} ],
						"${ NS.CS.Predicate.expirationTime }": {
							"@value": "${expirationTime.toISOString()}",
							"@type": "${ NS.XSD.DataType.dateTime }"
						},
						"${ NS.CS.Predicate.credentialsOf }": [ {
							"@id": "http://successful.example.com/users/my-user/"
						} ]
					}, {
						"@id": "http://successful.example.com/users/my-user/",
						"@graph": [ {
							"@id": "http://successful.example.com/users/my-user/",
							"@type": [ "${ NS.CS.Class.User }" ],
							"${ NS.CS.Predicate.name }": [ {
								"@value": "My User Name",
								"@type": "${ NS.XSD.DataType.string }"
							} ],
							"${ NS.VCARD.Predicate.email }": [ {
								"@value": "my-user@users.com",
								"@type": "${ NS.XSD.DataType.string }"
							} ],
							"${ NS.CS.Predicate.enabled }": [ {
								"@value": "true",
								"@type": "${ NS.XSD.DataType.boolean }"
							} ]
						} ]
					} ]`,
				} );

				let context:SuccessfulContext = new SuccessfulContext();
				let authenticator:TokenAuthenticator.Class = new TokenAuthenticator.Class( context );

				promises.push( authenticator.authenticate( new UsernameAndPasswordToken( "user", "pass" ) ).then( ():void => {
					expect( authenticator.isAuthenticated() ).toEqual( true );

					authenticator.clearAuthentication();

					expect( authenticator.isAuthenticated() ).toEqual( false );
				} ) );
			})();

			Promise.all( promises ).then( done, done.fail );
		} );

	} );

	it( hasDefaultExport( "Carbon.Auth.TokenAuthenticator.Class" ), ():void => {
		expect( DefaultExport ).toBeDefined();
		expect( DefaultExport ).toBe( TokenAuthenticator.Class );
	} );

} );
