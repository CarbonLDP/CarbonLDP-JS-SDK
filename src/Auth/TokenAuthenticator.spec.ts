import * as Errors from "../Errors";
import { UnauthorizedError } from "../HTTP/Errors";
import { Header } from "../HTTP/Header";
import { RequestOptions } from "../HTTP/Request";
import { C } from "../Vocabularies/C";
import { CS } from "../Vocabularies/CS";
import { VCARD } from "../Vocabularies/VCARD";
import { XSD } from "../Vocabularies/XSD";
import { AbstractContext } from "./../AbstractContext";
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
} from "./../test/JasmineExtender";
import * as Utils from "./../Utils";
import * as PersistedUser from "./PersistedUser";
import * as Token from "./Token";

import * as TokenAuthenticator from "./TokenAuthenticator";
import DefaultExport from "./TokenAuthenticator";

import UsernameAndPasswordToken from "./UsernameAndPasswordToken";

describe( module( "carbonldp/Auth/TokenAuthenticator" ), ():void => {

	it( isDefined(), ():void => {
		expect( TokenAuthenticator ).toBeDefined();
		expect( Utils.isObject( TokenAuthenticator ) ).toEqual( true );
	} );

	it( "should have token container constant", () => {
		expect( TokenAuthenticator.TOKEN_CONTAINER ).toBeDefined();
		expect( TokenAuthenticator.TOKEN_CONTAINER ).toBe( "auth-tokens/" );
	} );

	describe( clazz(
		"CarbonLDP.Auth.TokenAuthenticator.Class",
		"Authenticates requests using JSON Web Token (JWT) Authentication.", [
			"CarbonLDP.Auth.Authenticator.Class<CarbonLDP.Auth.UsernameAndPasswordToken.Class>",
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
			{ name: "context", type: "CarbonLDP.Context.Context", description: "The context where to authenticate the user." },
		] ), ():void => {
			class MockedContext extends AbstractContext {
				protected _baseURI:string;

				constructor() {
					super();
					this._baseURI = "http://example.com/";
					this.settings = { paths: { system: ".system/" } };
				}
			}

			let authenticator:TokenAuthenticator.Class = new TokenAuthenticator.Class( new MockedContext() );

			expect( ! ! authenticator ).toEqual( true );
			expect( authenticator instanceof TokenAuthenticator.Class ).toEqual( true );
		} );

		it( hasMethod(
			INSTANCE,
			"isAuthenticated",
			"Returns true if the instance contains stored credentials.",
			{ type: "boolean" }
		), ():void => {
			class MockedContext extends AbstractContext {
				protected _baseURI:string;

				constructor() {
					super();
					this._baseURI = "http://example.com/";
					this.settings = { paths: { system: ".system/" } };
				}
			}

			let authenticator:TokenAuthenticator.Class = new TokenAuthenticator.Class( new MockedContext() );

			expect( "isAuthenticated" in authenticator ).toEqual( true );
			expect( Utils.isFunction( authenticator.isAuthenticated ) ).toEqual( true );

			expect( authenticator.isAuthenticated() ).toBe( false );

			let expirationTime:Date = new Date();
			expirationTime.setDate( expirationTime.getDate() + 1 );
			(<any> authenticator)._credentials = {
				key: "token-value",
				expirationTime: expirationTime,
			};
			expect( authenticator.isAuthenticated() ).toBe( true );

			(<any> authenticator)._credentials = {
				key: "token-value",
				expirationTime: new Date(),
			};
			expect( authenticator.isAuthenticated() ).toBe( false );

			expirationTime = new Date();
			expirationTime.setDate( expirationTime.getDate() - 1 );
			(<any> authenticator)._credentials = {
				key: "token-value",
				expirationTime: expirationTime,
			};
			expect( authenticator.isAuthenticated() ).toBe( false );
		} );

		describe( method(
			INSTANCE,
			"authenticate"
		), ():void => {

			it( hasSignature(
				"Stores credentials to authenticate future requests.", [
					{ name: "authenticationToken", type: "CarbonLDP.Auth.UsernameAndPasswordToken" },
				],
				{ type: "Promise<CarbonLDP.Auth.Token.Class>" }
			), ( done:{ ():void, fail:( error:Error ) => void } ):void => {

				// Property Integrity
				(() => {
					class MockedContext extends AbstractContext {
						protected _baseURI:string;

						constructor() {
							super();
							this._baseURI = "http://example.com/";
							this.settings = { paths: { system: ".system/" } };
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
							this.settings = { paths: { system: ".system/" } };
						}
					}

					let expirationTime:Date = new Date();
					expirationTime.setDate( expirationTime.getDate() + 1 );
					jasmine.Ajax.stubRequest( "http://successful.example.com/.system/auth-tokens/", null, "POST" ).andReturn( {
						status: 200,
						responseText: `[ {
							"@id": "_:00",
							"@type": [
								"${ C.ResponseMetadata }",
								"${ C.VolatileResource }"
							],
							"${ C.documentMetadata }": [ {
								"@id": "_:01"
							} ]
						}, {
							"@id": "_:01",
							"@type": [
								"${ C.DocumentMetadata }",
								"${ C.VolatileResource }"
							],
							"${ C.eTag }": [ {
								"@value": "\\"1234567890\\""
							} ],
							"${ C.relatedDocument }": [ {
								"@id": "http://successful.example.com/users/my-user/"
							} ]
						}, {
							"@id": "_:02",
							"@type": [
								"${ CS.Token }",
								"${ C.VolatileResource }"
							],
							"${ CS.tokenKey }": [ {
								"@value": "token-value"
							} ],
							"${ CS.expirationTime }": {
								"@value": "${ expirationTime.toISOString() }",
								"@type": "${ XSD.dateTime }"
							},
							"${ CS.credentialsOf }": [ {
								"@id": "http://successful.example.com/users/my-user/"
							} ]
						}, {
							"@id": "http://successful.example.com/users/my-user/",
							"@graph": [ {
								"@id": "http://successful.example.com/users/my-user/",
								"@type": [ "${ CS.User }" ],
								"${ CS.name }": [ {
									"@value": "My User Name",
									"@type": "${ XSD.string }"
								} ],
								"${ VCARD.email }": [ {
									"@value": "my-user@users.com",
									"@type": "${ XSD.string }"
								} ],
								"${ CS.enabled }": [ {
									"@value": "true",
									"@type": "${ XSD.boolean }"
								} ]
							} ]
						} ]`,
					} );

					let context:SuccessfulContext = new SuccessfulContext();
					let authenticator:TokenAuthenticator.Class = new TokenAuthenticator.Class( context );

					promises.push( authenticator.authenticate( new UsernameAndPasswordToken( "user", "pass" ) ).then( ( token:Token.Class ):void => {
						expect( authenticator.isAuthenticated() ).toEqual( true );

						expect( token ).toBeDefined();
						expect( token ).not.toBeNull();
						expect( Token.Factory.is( token ) ).toEqual( true );

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
							this.settings = { paths: { system: ".system/" } };
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
						expect( error instanceof UnauthorizedError ).toEqual( true );

						expect( authenticator.isAuthenticated() ).toEqual( false );
					} ) );
				})();

				Promise.all( promises ).then( done, done.fail );
			} );

			it( hasSignature(
				"Stores credentials to authenticate future requests.", [
					{ name: "token", type: "CarbonLDP.Auth.Token.Class" },
				],
				{ type: "Promise<CarbonLDP.Auth.Token.Class>" }
			), ( done:{ ():void, fail:( error:Error ) => void } ):void => {

				class MockedContext extends AbstractContext {
					protected _baseURI:string;

					constructor() {
						super();
						this._baseURI = "http://example.com/";
						this.settings = { paths: { system: ".system/" } };
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
						"types": [ "${ CS.Token }" ],
						"user": { "id": "http://exmple.com/users/my-user/" }
					}`;
					let authenticator:TokenAuthenticator.Class = new TokenAuthenticator.Class( context );

					promises.push( authenticator.authenticate( JSON.parse( tokenString ) )
						.then( ( tokenCredentials:Token.Class ):void => {
							expect( authenticator.isAuthenticated() ).toEqual( true );

							expect( tokenCredentials ).toBeDefined();
							expect( tokenCredentials ).not.toBeNull();
							expect( Token.Factory.hasRequiredValues( tokenCredentials ) ).toEqual( true );
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
						"types": [ "${ CS.Token }" ]
					}`;
					let authenticator:TokenAuthenticator.Class = new TokenAuthenticator.Class( context );

					promises.push( authenticator.authenticate( JSON.parse( tokenString ) )
						.then( ( tokenCredentials:Token.Class ):void => {
							expect( authenticator.isAuthenticated() ).toEqual( true );

							expect( tokenCredentials ).toBeDefined();
							expect( tokenCredentials ).not.toBeNull();
							expect( Token.Factory.hasRequiredValues( tokenCredentials ) ).toEqual( true );
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
						"types": [ "${ CS.Token }" ],
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
			"Adds the Token Authentication header to the passed request options object.\n" +
			"The `CarbonLDP.HTTP.RequestOptions` provided is returned without modifications if it already has an authentication header.", [
				{ name: "requestOptions", type: "CarbonLDP.HTTP.RequestOptions", description: "Request options object to add Authentication headers." },
			],
			{ type: "CarbonLDP.HTTP.RequestOptions", description: "The request options with the added authentication headers." }
		), ():void => {

			// Property Integrity
			(() => {
				class MockedContext extends AbstractContext {
					protected _baseURI:string;

					constructor() {
						super();
						this._baseURI = "http://example.com/";
						this.settings = { paths: { system: ".system/" } };
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
						this.settings = { paths: { system: ".system/" } };
					}
				}

				let context:AbstractContext = new Context();
				let authenticator:TokenAuthenticator.Class = new TokenAuthenticator.Class( context );

				let expirationTime:Date = new Date();
				expirationTime.setDate( expirationTime.getDate() + 1 );
				(<any> authenticator)._credentials = {
					key: "token-value",
					expirationTime: expirationTime,
				};

				let requestOptions:RequestOptions = authenticator.addAuthentication( {} );

				expect( ! ! requestOptions ).toEqual( true );
				expect( Utils.isObject( requestOptions ) ).toEqual( true );
				expect( "headers" in requestOptions ).toEqual( true );
				expect( requestOptions.headers instanceof Map ).toEqual( true );
				expect( requestOptions.headers.has( "authorization" ) ).toEqual( true );

				let authorizationHeader:Header = requestOptions.headers.get( "authorization" );

				expect( authorizationHeader instanceof Header ).toEqual( true );
				expect( authorizationHeader.values.length ).toEqual( 1 );

				let authorization:string = authorizationHeader.toString();

				expect( Utils.StringUtils.startsWith( authorization, "Token " ) ).toEqual( true );
				expect( authorization.substring( 6 ) ).toEqual( "token-value" );
			})();

			(() => {
				class Context extends AbstractContext {
					protected _baseURI:string;

					constructor() {
						super();
						this._baseURI = "http://successfull.example.com/";
						this.settings = { paths: { system: ".system/" } };
					}
				}

				let context:AbstractContext = new Context();
				let authenticator:TokenAuthenticator.Class = new TokenAuthenticator.Class( context );

				let expirationTime:Date = new Date();
				expirationTime.setDate( expirationTime.getDate() + 1 );
				(<any> authenticator)._credentials = {
					key: "token-value",
					expirationTime: expirationTime,
				};

				let requestOptions:RequestOptions = {
					headers: new Map<string, Header>(),
				};
				authenticator.addAuthentication( requestOptions );

				expect( ! ! requestOptions ).toEqual( true );
				expect( Utils.isObject( requestOptions ) ).toEqual( true );
				expect( "headers" in requestOptions ).toEqual( true );
				expect( requestOptions.headers instanceof Map ).toEqual( true );
				expect( requestOptions.headers.size ).toEqual( 1 );
				expect( requestOptions.headers.has( "authorization" ) ).toEqual( true );

				let authorizationHeader:Header = requestOptions.headers.get( "authorization" );

				expect( authorizationHeader instanceof Header ).toEqual( true );
				expect( authorizationHeader.values.length ).toEqual( 1 );

				let authorization:string = authorizationHeader.toString();

				expect( Utils.StringUtils.startsWith( authorization, "Token " ) ).toEqual( true );
				expect( authorization.substring( 6 ) ).toEqual( "token-value" );
			})();

			(() => {
				class Context extends AbstractContext {
					protected _baseURI:string;

					constructor() {
						super();
						this._baseURI = "http://successfull.example.com/";
						this.settings = { paths: { system: ".system/" } };
					}
				}

				let context:AbstractContext = new Context();
				let authenticator:TokenAuthenticator.Class = new TokenAuthenticator.Class( context );

				let expirationTime:Date = new Date();
				expirationTime.setDate( expirationTime.getDate() + 1 );
				(<any> authenticator)._credentials = {
					key: "token-value",
					expirationTime: expirationTime,
				};

				let requestOptions:RequestOptions = {
					headers: new Map<string, Header>(),
				};
				requestOptions.headers.set( "content-type", new Header( "text/plain" ) );
				requestOptions.headers.set( "accept", new Header( "text/plain" ) );
				authenticator.addAuthentication( requestOptions );

				expect( ! ! requestOptions ).toEqual( true );
				expect( Utils.isObject( requestOptions ) ).toEqual( true );
				expect( "headers" in requestOptions ).toEqual( true );
				expect( requestOptions.headers instanceof Map ).toEqual( true );
				expect( requestOptions.headers.size ).toEqual( 3 );
				expect( requestOptions.headers.has( "content-type" ) ).toEqual( true );
				expect( requestOptions.headers.has( "accept" ) ).toEqual( true );
				expect( requestOptions.headers.has( "authorization" ) ).toEqual( true );

				let authorizationHeader:Header = requestOptions.headers.get( "authorization" );

				expect( authorizationHeader instanceof Header ).toEqual( true );
				expect( authorizationHeader.values.length ).toEqual( 1 );

				let authorization:string = authorizationHeader.toString();

				expect( Utils.StringUtils.startsWith( authorization, "Token " ) ).toEqual( true );
				expect( authorization.substring( 6 ) ).toEqual( "token-value" );
			})();

			(() => {
				class Context extends AbstractContext {
					protected _baseURI:string;

					constructor() {
						super();
						this._baseURI = "http://successful.example.com/";
						this.settings = { paths: { system: ".system/" } };
					}
				}

				let context:AbstractContext = new Context();
				let authenticator:TokenAuthenticator.Class = new TokenAuthenticator.Class( context );

				let expirationTime:Date = new Date();
				expirationTime.setDate( expirationTime.getDate() + 1 );
				(<any> authenticator)._credentials = {
					key: "token-value",
					expirationTime: expirationTime,
				};

				let requestOptions:RequestOptions = {
					headers: new Map<string, Header>(),
				};
				requestOptions.headers.set( "content-type", new Header( "text/plain" ) );
				requestOptions.headers.set( "accept", new Header( "text/plain" ) );
				requestOptions.headers.set( "authorization", new Header( "Another another-type-of-authorization" ) );
				authenticator.addAuthentication( requestOptions );

				expect( ! ! requestOptions ).toEqual( true );
				expect( Utils.isObject( requestOptions ) ).toEqual( true );
				expect( "headers" in requestOptions ).toEqual( true );
				expect( requestOptions.headers instanceof Map ).toEqual( true );
				expect( requestOptions.headers.size ).toEqual( 3 );
				expect( requestOptions.headers.has( "content-type" ) ).toEqual( true );
				expect( requestOptions.headers.has( "accept" ) ).toEqual( true );
				expect( requestOptions.headers.has( "authorization" ) ).toEqual( true );

				let authorizationHeader:Header = requestOptions.headers.get( "authorization" );

				expect( authorizationHeader instanceof Header ).toEqual( true );
				expect( authorizationHeader.values.length ).toEqual( 1 );

				let authorization:string = authorizationHeader.toString();

				expect( Utils.StringUtils.startsWith( authorization, "Another " ) ).toEqual( true );
				expect( authorization.substring( 8 ) ).toEqual( "another-type-of-authorization" );
			})();

			(() => {
				class Context extends AbstractContext {
					protected _baseURI:string;

					constructor() {
						super();
						this._baseURI = "http://successful.example.com/";
						this.settings = { paths: { system: ".system/" } };
					}
				}

				let context:AbstractContext = new Context();
				let authenticator:TokenAuthenticator.Class = new TokenAuthenticator.Class( context );

				let expirationTime:Date = new Date();
				expirationTime.setDate( expirationTime.getDate() + 1 );
				(<any> authenticator)._credentials = {
					key: "token-value",
					expirationTime: expirationTime,
				};

				let requestOptions:RequestOptions = {
					headers: new Map<string, Header>(),
				};
				requestOptions.headers.set( "content-type", new Header( "text/plain" ) );
				requestOptions.headers.set( "accept", new Header( "text/plain" ) );
				requestOptions.headers.set( "authorization", new Header( "Token another-token-value" ) );
				authenticator.addAuthentication( requestOptions );

				expect( ! ! requestOptions ).toEqual( true );
				expect( Utils.isObject( requestOptions ) ).toEqual( true );
				expect( "headers" in requestOptions ).toEqual( true );
				expect( requestOptions.headers instanceof Map ).toEqual( true );
				expect( requestOptions.headers.size ).toEqual( 3 );
				expect( requestOptions.headers.has( "content-type" ) ).toEqual( true );
				expect( requestOptions.headers.has( "accept" ) ).toEqual( true );
				expect( requestOptions.headers.has( "authorization" ) ).toEqual( true );

				let authorizationHeader:Header = requestOptions.headers.get( "authorization" );

				expect( authorizationHeader instanceof Header ).toEqual( true );
				expect( authorizationHeader.values.length ).toEqual( 1 );

				let authorization:string = authorizationHeader.toString();

				expect( Utils.StringUtils.startsWith( authorization, "Token " ) ).toEqual( true );
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
						this.settings = { paths: { system: ".system/" } };
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
						this.settings = { paths: { system: ".system/" } };
					}
				}

				let expirationTime:Date = new Date();
				expirationTime.setDate( expirationTime.getDate() + 1 );
				jasmine.Ajax.stubRequest( "http://successful.example.com/.system/auth-tokens/", null, "POST" ).andReturn( {
					status: 200,
					responseText: `[ {
						"@id": "_:00",
						"@type": [
							"${ C.ResponseMetadata }",
							"${ C.VolatileResource }"
						],
						"${ C.documentMetadata }": [ {
							"@id": "_:01"
						} ]
					}, {
						"@id": "_:01",
						"@type": [
							"${ C.DocumentMetadata }",
							"${ C.VolatileResource }"
						],
						"${ C.eTag }": [ {
							"@value": "\\"1234567890\\""
						} ],
						"${ C.relatedDocument }": [ {
							"@id": "http://successful.example.com/users/my-user/"
						} ]
					}, {
						"@id": "_:02",
						"@type": [
							"${ CS.Token }",
							"${ C.VolatileResource }"
						],
						"${ CS.tokenKey }": [ {
							"@value": "token-value"
						} ],
						"${ CS.expirationTime }": {
							"@value": "${expirationTime.toISOString()}",
							"@type": "${ XSD.dateTime }"
						},
						"${ CS.credentialsOf }": [ {
							"@id": "http://successful.example.com/users/my-user/"
						} ]
					}, {
						"@id": "http://successful.example.com/users/my-user/",
						"@graph": [ {
							"@id": "http://successful.example.com/users/my-user/",
							"@type": [ "${ CS.User }" ],
							"${ CS.name }": [ {
								"@value": "My User Name",
								"@type": "${ XSD.string }"
							} ],
							"${ VCARD.email }": [ {
								"@value": "my-user@users.com",
								"@type": "${ XSD.string }"
							} ],
							"${ CS.enabled }": [ {
								"@value": "true",
								"@type": "${ XSD.boolean }"
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

	it( hasDefaultExport( "CarbonLDP.Auth.TokenAuthenticator.Class" ), ():void => {
		expect( DefaultExport ).toBeDefined();
		expect( DefaultExport ).toBe( TokenAuthenticator.Class );
	} );

} );
