import { StrictMinus } from "../../test/helpers/types";
import { AbstractContext } from "../AbstractContext";
import * as Errors from "../Errors";
import { Document } from "../Document";
import { ProtectedDocument } from "../ProtectedDocument";
import { Pointer } from "../Pointer";
import {
	clazz,
	extendsClass,
	hasDefaultExport,
	hasProperty,
	hasSignature,
	interfaze,
	isDefined,
	method,
	module,
	OBLIGATORY,
	OPTIONAL,
	STATIC,
} from "../test/JasmineExtender";

import * as PersistedRole from "./PersistedRole";

xdescribe( module( "carbonldp/Auth/PersistedRole" ), ():void => {

	it( isDefined(), ():void => {
		expect( PersistedRole ).toBeDefined();
		expect( PersistedRole ).toEqual( jasmine.any( Object ) );
	} );

	describe( interfaze( "CarbonLDP.PersistedRole.Class", "Specific interface that represents a persisted role of an application." ), ():void => {

		let context:AbstractContext;
		let persistedRole:PersistedRole.Class;
		beforeEach( ():void => {
			context = new class extends AbstractContext {
				protected _baseURI:string = "https://example.com/";
			};

			persistedRole = PersistedRole.Factory.decorate( Object.assign(
				context.documents.getPointer( "https://example.com/.system/security/roles/a-role/" ),
				{
					id: "https://example.com/.system/security/roles/a-role/",
				} ),
				context.documents
			);
		} );

		it( extendsClass( "CarbonLDP.ProtectedDocument.Class" ), ():void => {} );

		it( hasProperty(
			OPTIONAL,
			"name",
			"string",
			"A name that describes the current role."
		), ():void => {
			const target:PersistedRole.Class[ "name" ] = "name";
			expect( target ).toBeDefined();
		} );

		it( hasProperty(
			OPTIONAL,
			"description",
			"string",
			"An optional description of the current role."
		), ():void => {
			const target:PersistedRole.Class[ "description" ] = "description";
			expect( target ).toBeDefined();
		} );

		it( hasProperty(
			OPTIONAL,
			"users",
			"CarbonLDP.Pointer[]",
			"An array of pointers that references to all the users that have the current role."
		), ():void => {
			const target:PersistedRole.Class[ "users" ] = [] as Pointer[];
			expect( target ).toBeDefined();
		} );

		describe( method( OBLIGATORY, "createChild" ), ():void => {

			it( hasSignature(
				[ "T extends object" ],
				"Persists a new role with the slug specified as a child of the current role.", [
					{ name: "role", type: "T & Carbon.Auth.Roles.NewRole", description: "The role to be persisted." },
					{ name: "slug", type: "string", optional: true, description: "The slug that will be used in the child role URI." },
					{ name: "requestOptions", type: "CarbonLDP.HTTP.RequestOptions", optional: true, description: "Customizable options for the request." },
				],
				{ type: "Promise<T & CarbonLDP.Auth.PersistedRole.Class>" }
			), ():void => {} );

			it( hasSignature(
				[ "T extends object" ],
				"Persists a new role as a child of the current one.", [
					{ name: "role", type: "T & Carbon.Auth.Roles.NewRole", description: "The role to be persisted." },
					{ name: "requestOptions", type: "CarbonLDP.HTTP.RequestOptions", optional: true, description: "Customizable options for the request." },
				],
				{ type: "Promise<T & CarbonLDP.Auth.PersistedRole.Class>" }
			), ():void => {} );

			it( "should exists", ():void => {
				expect( persistedRole.createChild ).toBeDefined();
				expect( persistedRole.createChild ).toEqual( jasmine.any( Function ) );
			} );


			it( "should reject when no context", ( done:DoneFn ):void => {
				delete persistedRole._documents[ "context" ];

				persistedRole
					.createChild( { name: "New Role" } )
					.then( () => {
						done.fail( "Should not resolve" );
					} )
					.catch( error => {
						expect( () => { throw error; } ).toThrowError( Errors.IllegalStateError, "The context of the role doesn't support roles management." );

						done();
					} )
				;
			} );


			it( "should call the roles class", ( done:DoneFn ):void => {
				const spy:jasmine.Spy = spyOn( context.auth.roles, "createChild" )
					.and.returnValue( Promise.reject( null ) );

				persistedRole
					.createChild( { name: "New Role" } )
					.then( () => {
						done.fail( "Should not resolve" );
					} )
					.catch( () => {
						expect( spy ).toHaveBeenCalledWith(
							"https://example.com/.system/security/roles/a-role/",
							{ name: "New Role" },
							void 0,
							void 0
						);

						done();
					} )
				;
			} );

		} );

		describe( method( OBLIGATORY, "getUsers" ), ():void => {

			it( hasSignature(
				"Retrieves an array of resolved pointers for all the users of the role.", [
					{ name: "requestOptions", type: "CarbonLDP.HTTP.RequestOptions", optional: true, description: "Customizable options for the request." },
					{ name: "queryBuilderFn", type: "( queryBuilder:Carbon.SPARQL.QueryDocumentsBuilder ) => Carbon.SPARQL.QueryDocumentsBuilder", optional: true, description: "Function that receives a the builder that helps you to construct the users retrieval query.\nThe same builder must be returned." },
				],
				{ type: "Promise<CarbonLDP.Auth.PersistedRole.Class>" }
			), ():void => {} );

			it( hasSignature(
				"Retrieves an array of resolved pointers for the users of the role, in accordance of the retrievalPreferences provided.", [
					{ name: "requestOptions", type: "Carbon.HTTP.RequestOptions", optional: true, description: "Customizable options for the request." },
				],
				{ type: "Promise<CarbonLDP.Auth.PersistedRole.Class>" }
			), ():void => {} );


			it( "should exists", ():void => {
				expect( persistedRole.getUsers ).toBeDefined();
				expect( persistedRole.getUsers ).toEqual( jasmine.any( Function ) );
			} );


			it( "should reject when no context", ( done:DoneFn ):void => {
				delete persistedRole._documents[ "context" ];

				persistedRole
					.getUsers()
					.then( () => {
						done.fail( "Should not resolve" );
					} )
					.catch( error => {
						expect( () => { throw error; } ).toThrowError( Errors.IllegalStateError, "The context of the role doesn't support roles management." );

						done();
					} )
				;
			} );


			it( "should call the roles class", ( done:DoneFn ):void => {
				const spy:jasmine.Spy = spyOn( context.auth.roles, "getUsers" )
					.and.returnValue( Promise.reject( null ) );

				persistedRole
					.getUsers()
					.then( () => {
						done.fail( "Should not resolve" );
					} )
					.catch( () => {
						expect( spy ).toHaveBeenCalledWith(
							"https://example.com/.system/security/roles/a-role/",
							void 0,
							void 0
						);

						done();
					} )
				;
			} );

		} );

		describe( method( OBLIGATORY, "addUser" ), ():void => {

			it( hasSignature(
				"Makes a relation in the role towards the users specified.", [
					{ name: "user", type: "string | CarbonLDP.Pointer", description: "The users that wants to add to the role." },
					{ name: "requestOptions", type: "CarbonLDP.HTTP.RequestOptions", optional: true },
				],
				{ type: "Promise<void>" }
			), ():void => {} );


			it( "should exists", ():void => {
				expect( persistedRole.addUser ).toBeDefined();
				expect( persistedRole.addUser ).toEqual( jasmine.any( Function ) );
			} );


			it( "should reject when no context", ( done:DoneFn ):void => {
				delete persistedRole._documents[ "context" ];

				persistedRole
					.addUser( "users/a-user/" )
					.then( () => {
						done.fail( "Should not resolve" );
					} )
					.catch( error => {
						expect( () => { throw error; } ).toThrowError( Errors.IllegalStateError, "The context of the role doesn't support roles management." );

						done();
					} )
				;
			} );


			it( "should call the roles class", ( done:DoneFn ):void => {
				const spy:jasmine.Spy = spyOn( context.auth.roles, "addUser" )
					.and.returnValue( Promise.reject( null ) );

				persistedRole
					.addUser( "users/a-user/" )
					.then( () => {
						done.fail( "Should not resolve" );
					} )
					.catch( () => {
						expect( spy ).toHaveBeenCalledWith(
							"https://example.com/.system/security/roles/a-role/",
							"users/a-user/",
							void 0
						);

						done();
					} )
				;
			} );

		} );

		describe( method( OBLIGATORY, "addUsers" ), ():void => {

			it( hasSignature(
				"Makes a relation in the role towards the users specified.", [
					{ name: "users", type: "(string | CarbonLDP.Pointer)[]", description: "An array with strings or Pointers that refers to the users that wants to add to the role." },
					{ name: "requestOptions", type: "CarbonLDP.HTTP.RequestOptions", optional: true },
				],
				{ type: "Promise<void>" }
			), ():void => {} );


			it( "should exists", ():void => {
				expect( persistedRole.addUsers ).toBeDefined();
				expect( persistedRole.addUsers ).toEqual( jasmine.any( Function ) );
			} );


			it( "should reject when no context", ( done:DoneFn ):void => {
				delete persistedRole._documents[ "context" ];

				persistedRole
					.addUsers( [ "users/a-user/" ] )
					.then( () => {
						done.fail( "Should not resolve" );
					} )
					.catch( error => {
						expect( () => { throw error; } ).toThrowError( Errors.IllegalStateError, "The context of the role doesn't support roles management." );

						done();
					} )
				;
			} );


			it( "should call the roles class", ( done:DoneFn ):void => {
				const spy:jasmine.Spy = spyOn( context.auth.roles, "addUsers" )
					.and.returnValue( Promise.reject( null ) );

				persistedRole
					.addUsers( [ "users/a-user/" ] )
					.then( () => {
						done.fail( "Should not resolve" );
					} )
					.catch( () => {
						expect( spy ).toHaveBeenCalledWith(
							"https://example.com/.system/security/roles/a-role/",
							[ "users/a-user/" ],
							void 0
						);

						done();
					} )
				;
			} );

		} );

		describe( method( OBLIGATORY, "removeUser" ), ():void => {

			it( hasSignature(
				"Removes the relation in the role towards the users specified.", [
					{ name: "user", type: "string | CarbonLDP.Pointer", description: "The users that wants to be removed from the role." },
					{ name: "requestOptions", type: "CarbonLDP.HTTP.RequestOptions", optional: true },
				],
				{ type: "Promise<void>" }
			), ():void => {} );


			it( "should exists", ():void => {
				expect( persistedRole.removeUser ).toBeDefined();
				expect( persistedRole.removeUser ).toEqual( jasmine.any( Function ) );
			} );


			it( "should reject when no context", ( done:DoneFn ):void => {
				delete persistedRole._documents[ "context" ];

				persistedRole
					.removeUser( "users/a-user/" )
					.then( () => {
						done.fail( "Should not resolve" );
					} )
					.catch( error => {
						expect( () => { throw error; } ).toThrowError( Errors.IllegalStateError, "The context of the role doesn't support roles management." );

						done();
					} )
				;
			} );


			it( "should call the roles class", ( done:DoneFn ):void => {
				const spy:jasmine.Spy = spyOn( context.auth.roles, "removeUser" )
					.and.returnValue( Promise.reject( null ) );

				persistedRole
					.removeUser( "users/a-user/" )
					.then( () => {
						done.fail( "Should not resolve" );
					} )
					.catch( () => {
						expect( spy ).toHaveBeenCalledWith(
							"https://example.com/.system/security/roles/a-role/",
							"users/a-user/",
							void 0
						);

						done();
					} )
				;
			} );

		} );

		describe( method( OBLIGATORY, "removeUsers" ), ():void => {

			it( hasSignature(
				"Remove the relation in the role towards the users specified.", [
					{ name: "users", type: "(string | CarbonLDP.Pointer)[]", description: "An array with strings or Pointers that refers to the users that wants to be removed from the role." },
					{ name: "requestOptions", type: "CarbonLDP.HTTP.RequestOptions", optional: true },
				],
				{ type: "Promise<void>" }
			), ():void => {} );


			it( "should exists", ():void => {
				expect( persistedRole.removeUsers ).toBeDefined();
				expect( persistedRole.removeUsers ).toEqual( jasmine.any( Function ) );
			} );


			it( "should reject when no context", ( done:DoneFn ):void => {
				delete persistedRole._documents[ "context" ];

				persistedRole
					.removeUsers( [ "users/a-user/" ] )
					.then( () => {
						done.fail( "Should not resolve" );
					} )
					.catch( error => {
						expect( () => { throw error; } ).toThrowError( Errors.IllegalStateError, "The context of the role doesn't support roles management." );

						done();
					} )
				;
			} );


			it( "should call the roles class", ( done:DoneFn ):void => {
				const spy:jasmine.Spy = spyOn( context.auth.roles, "removeUsers" )
					.and.returnValue( Promise.reject( null ) );

				persistedRole
					.removeUsers( [ "users/a-user/" ] )
					.then( () => {
						done.fail( "Should not resolve" );
					} )
					.catch( () => {
						expect( spy ).toHaveBeenCalledWith(
							"https://example.com/.system/security/roles/a-role/",
							[ "users/a-user/" ],
							void 0
						);

						done();
					} )
				;
			} );
		} );

	} );

	describe( clazz( "CarbonLDP.Auth.PersistedRole.Factory", "Factory class for `CarbonLDP.Auth.PersistedRole.Class` objects" ), ():void => {

		it( isDefined(), ():void => {
			expect( PersistedRole.Factory ).toBeDefined();
			expect( PersistedRole.Factory ).toEqual( jasmine.any( Function ) );
		} );

		describe( method( STATIC, "hasClassProperties" ), ():void => {

			it( hasSignature(
				"Returns true if the object provided has the properties that defines a `CarbonLDP.Auth.PersistedRole.Class` object", [
					{ name: "object", type: "object" },
				],
				{ type: "boolean" }
			), ():void => {} );

			it( "should exists", ():void => {
				expect( PersistedRole.Factory.hasClassProperties ).toBeDefined();
				expect( PersistedRole.Factory.hasClassProperties ).toEqual( jasmine.any( Function ) );
			} );


			it( "should return false when no object", ():void => {
				expect( PersistedRole.Factory.hasClassProperties( void 0 ) ).toBe( false );
				expect( PersistedRole.Factory.hasClassProperties( null ) ).toBe( false );
			} );

			it( "should verify obligatory and optional properties", ():void => {
				const target:StrictMinus<PersistedRole.Class, ProtectedDocument> & { createChild:Function } = {
					name: null,
					description: null,
					parent: null,
					children: null,
					users: null,

					createChild: ():any => {},
					getUsers: ():any => {},
					addUser: ():any => {},
					addUsers: ():any => {},
					removeUser: ():any => {},
					removeUsers: ():any => {},
				};

				expect( PersistedRole.Factory.hasClassProperties( target ) ).toBe( true );

				delete target.name;
				expect( PersistedRole.Factory.hasClassProperties( target ) ).toBe( true );
				target.name = null;

				delete target.description;
				expect( PersistedRole.Factory.hasClassProperties( target ) ).toBe( true );
				target.description = null;

				delete target.parent;
				expect( PersistedRole.Factory.hasClassProperties( target ) ).toBe( true );
				target.parent = null;

				delete target.children;
				expect( PersistedRole.Factory.hasClassProperties( target ) ).toBe( true );
				target.children = null;

				delete target.users;
				expect( PersistedRole.Factory.hasClassProperties( target ) ).toBe( true );
				target.users = null;

				delete target.createChild;
				expect( PersistedRole.Factory.hasClassProperties( target ) ).toBe( false );
				target.createChild = ():any => {};

				delete target.getUsers;
				expect( PersistedRole.Factory.hasClassProperties( target ) ).toBe( false );
				target.getUsers = ():any => {};

				delete target.addUser;
				expect( PersistedRole.Factory.hasClassProperties( target ) ).toBe( false );
				target.addUser = ():any => {};

				delete target.addUsers;
				expect( PersistedRole.Factory.hasClassProperties( target ) ).toBe( false );
				target.addUsers = ():any => {};

				delete target.removeUser;
				expect( PersistedRole.Factory.hasClassProperties( target ) ).toBe( false );
				target.removeUser = ():any => {};

				delete target.removeUsers;
				expect( PersistedRole.Factory.hasClassProperties( target ) ).toBe( false );
				target.removeUsers = ():any => {};
			} );

		} );

		describe( method( STATIC, "is" ), ():void => {

			it( hasSignature(
				"Returns true if the object provided is considered a `CarbonLDP.Auth.PersistedRole.Class` object", [
					{ name: "object", type: "object" },
				],
				{ type: "boolean" }
			), ():void => {} );

			it( "should exists", ():void => {
				expect( PersistedRole.Factory.is ).toBeDefined();
				expect( PersistedRole.Factory.is ).toEqual( jasmine.any( Function ) );
			} );


			it( "should return false when no object", ():void => {
				expect( PersistedRole.Factory.is( void 0 ) ).toBe( false );
				expect( PersistedRole.Factory.is( null ) ).toBe( false );
			} );

			it( "should return true when minimal persisted role", ():void => {
				const target:PersistedRole.Class = ProtectedDocument.decorate( {
					createChild: ():any => {},
					getUsers: ():any => {},
					addUser: ():any => {},
					addUsers: ():any => {},
					removeUser: ():any => {},
					removeUsers: ():any => {},
				}, null );

				expect( PersistedRole.Factory.is( target ) ).toBe( true );
			} );

		} );

		describe( method( STATIC, "decorate" ), ():void => {

			it( hasSignature(
				[ "T extends object" ],
				"Decorates the object provided with the methods and properties of a `Carbon.Auth.PersistedRole.Class` object.", [
					{ name: "object", type: "T" },
					{ name: "documents", type: "CarbonLDP.Documents" },
				],
				{ type: "T & CarbonLDP.Auth.PersistedRole.Class" }
			), ():void => {} );

			it( "should exists", ():void => {
				expect( PersistedRole.Factory.decorate ).toBeDefined();
				expect( PersistedRole.Factory.decorate ).toEqual( jasmine.any( Function ) );
			} );


			it( "should add class properties", ():void => {
				const target:PersistedRole.Class = PersistedRole.Factory.decorate( {}, null );
				expect( PersistedRole.Factory.hasClassProperties( target ) ).toBe( true );
			} );

			it( "should override persistedDocument's `createChild` method", ():void => {
				const persisted:Document = Document.decorate( {}, null );
				const target:PersistedRole.Class = PersistedRole.Factory.decorate( {}, null );

				expect( target.createChild ).not.toBe( persisted.createChild );
			} );

		} );

	} );

	it( hasDefaultExport( "CarbonLDP.Auth.PersistedRole.Class" ), ():void => {
		const target:PersistedRole.default = {} as PersistedRole.Class;
		expect( target ).toBeDefined();
	} );

} );
