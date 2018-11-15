import { QueryClause } from "sparqler/clauses";
import * as TokensModule from "sparqler/tokens";
import {
	BindToken,
	ConstructToken,
	FilterToken,
	IRIToken,
	LimitToken,
	LiteralToken,
	OffsetToken,
	OptionalToken,
	OrderToken,
	PredicateToken,
	PrefixedNameToken,
	PrefixToken,
	QueryToken,
	SelectToken,
	SubjectToken,
	ValuesToken,
	VariableToken
} from "sparqler/tokens";

import { AbstractContext } from "./AbstractContext";
import { BaseAccessPoint } from "./AccessPoint";
import { AccessPoint } from "./AccessPoint";
import { TransientBlankNode } from "./BlankNode";
import { CarbonLDP } from "./CarbonLDP";
import { Document } from "./Document";
import { TransientDocument } from "./Document";

import { Documents } from "./Documents";

import * as Errors from "./Errors";
import { TransientFragment } from "./Fragment";
import { HTTPError } from "./HTTP/Errors";
import { Header } from "./HTTP/Header";
import { RequestService } from "./HTTP/Request";
import { Response } from "./HTTP/Response";
import { JSONLDConverter } from "./JSONLD/Converter";
import { Event } from "./Messaging/Event";
import * as MessagingUtils from "./Messaging/Utils";
import { NamedFragment } from "./NamedFragment";
import * as ObjectSchema from "./ObjectSchema";
import { Pointer } from "./Pointer";
import {
	Resource,
	TransientResource
} from "./Resource";
import { ContextSettings } from "./Settings";
import * as SPARQL from "./SPARQL";
import { PartialMetadata } from "./SPARQL/QueryDocument/PartialMetadata";
import {
	clazz,
	hasConstructor,
	hasMethod,
	hasProperty,
	hasSignature,
	INSTANCE,
	isDefined,
	method,
	module,
} from "./test/JasmineExtender";
import {
	TransientAccessPoint,
} from "./AccessPoint";
import * as Utils from "./Utils";
import { C } from "./Vocabularies/C";
import { CS } from "./Vocabularies/CS";
import { LDP } from "./Vocabularies/LDP";
import { XSD } from "./Vocabularies/XSD";

function createPartialMetadata( schema:ObjectSchema.ObjectSchema ):PartialMetadata {
	const digestedSchema:ObjectSchema.DigestedObjectSchema = ObjectSchema.ObjectSchemaDigester.digestSchema( schema );
	digestedSchema.properties.forEach( definition => ObjectSchema.ObjectSchemaUtils.resolveProperty( digestedSchema, definition, true ) );
	return new PartialMetadata( digestedSchema );
}

function createMockDocument<T extends { id:string }>( data:{ documents:Documents, props:T } ):T & Document {
	const pointer:Pointer = data.documents.getPointer( data.props.id );
	const doc:T & Document = Document.decorate( Object.assign( pointer, data.props ), data.documents );

	findNonEnumerableProps( doc );
	doc._normalize();
	return doc;
}

function findNonEnumerableProps( object:object ):void {
	Object
		.keys( object )
		.filter( key => key.startsWith( "_" ) )
		.forEach( key => Object.defineProperty( object, key, { enumerable: false, configurable: true } ) )
	;

	Object
		.keys( object )
		.filter( key => Array.isArray( object[ key ] ) || Utils.isPlainObject( object[ key ] ) )
		.map( key => object[ key ] )
		.forEach( findNonEnumerableProps )
	;
}

describe( module( "carbonldp/Documents" ), ():void => {

	describe( clazz(
		"CarbonLDP.Documents",
		"Class that contains methods for retrieving, saving and updating documents from the Carbon LDP server.", [
			"CarbonLDP.PointerLibrary",
			"CarbonLDP.PointerValidator",
			"CarbonLDP.ObjectSchemaResolver",
		]
	), ():void => {

		beforeEach( ():void => {
			jasmine.Ajax.install();
		} );

		afterEach( ():void => {
			jasmine.Ajax.uninstall();
		} );

		it( isDefined(), ():void => {
			expect( Documents ).toBeDefined();
			expect( Utils.isFunction( Documents ) ).toBe( true );
		} );

		it( hasConstructor( [
			{ name: "context", type: "CarbonLDP.Context", optional: true, description: "The context where the documents instance will live. If no context is provided, calling its methods with relative URIs will throw an error, since there will be no form to resolve them." },
		] ), ():void => {
			class MockedContext extends AbstractContext {
				protected _baseURI:string;

				constructor() {
					super();
					this._baseURI = "https://example.com/";
					this.settings = { paths: { system: ".system/" } };
				}
			}

			let context:MockedContext = new MockedContext();

			let documents:Documents = new Documents( context );
			expect( documents ).toBeTruthy();
			expect( documents instanceof Documents ).toBe( true );

			documents = new Documents();
			expect( documents ).toBeTruthy();
			expect( documents instanceof Documents ).toBe( true );
		} );

		it( hasProperty(
			INSTANCE,
			"jsonldConverter",
			"CarbonLDP.JSONLD.JSONLDConverter",
			"Instance of `CarbonLDP.JSONLD.JSONLDConverter` that is used to compact retrieved documents and to expand documents to persist. This property is not writable."
		), ():void => {
			class MockedContext extends AbstractContext {
				protected _baseURI:string;

				constructor() {
					super();
					this._baseURI = "https://example.com/";
					this.settings = { paths: { system: ".system/" } };
				}
			}

			let context:MockedContext = new MockedContext();
			let documents:Documents = context.documents;

			expect( documents.jsonldConverter ).toBeDefined();
			expect( documents.jsonldConverter instanceof JSONLDConverter ).toBe( true );
		} );

		it( hasProperty(
			INSTANCE,
			"documentDecorators",
			"Map<string, CarbonLDP.DocumentDecorator>",
			"A map that specifies a type and a tuple with a function decorator and its parameters which will be called when a document with the specified type has been resolved or refreshed.\n\nThe decorator function must at least accept the object to decorate and optional parameters declared in the tuple."
		), ():void => {
			class MockedContext extends AbstractContext {
				protected _baseURI:string;

				constructor() {
					super();
					this._baseURI = "https://example.com/";
					this.settings = { paths: { system: ".system/" } };
				}
			}

			let context:MockedContext = new MockedContext();
			let documents:Documents = context.documents;

			expect( documents.documentDecorators ).toBeDefined();
			expect( documents.documentDecorators ).toEqual( jasmine.any( Map ) );

			// Has default decorators
			expect( documents.documentDecorators.size ).toBe( 3 );
			expect( documents.documentDecorators.has( CS.ProtectedDocument ) ).toBe( true );
			expect( documents.documentDecorators.has( CS.AccessControlList ) ).toBe( true );
			expect( documents.documentDecorators.has( CS.User ) ).toBe( true );
		} );

		describe( method(
			INSTANCE,
			"inScope"
		), ():void => {

			it( isDefined(), ():void => {
				class MockedContext extends AbstractContext {
					protected _baseURI:string;

					constructor() {
						super();
						this._baseURI = "https://example.com/";
						this.settings = { paths: { system: ".system/" } };
					}
				}

				let context:MockedContext = new MockedContext();
				let documents:Documents = context.documents;

				expect( documents.inScope ).toBeDefined();
				expect( Utils.isFunction( documents.inScope ) ).toBe( true );
			} );

			it( hasSignature(
				"Returns true if the pointer provided is inside the scope of the Documents instance.", [
					{ name: "pointer", type: "CarbonLDP.Pointer", description: "Pointer to evaluate." },
				],
				{ type: "boolean" }
			), ():void => {
				class MockedContext extends AbstractContext {
					protected _baseURI:string;

					constructor() {
						super();
						this._baseURI = "https://example.com/";
						this.settings = { paths: { system: ".system/" } };
					}
				}

				let context:MockedContext = new MockedContext();
				let documents:Documents = context.documents;

				let pointer:Pointer;

				pointer = Pointer.create( { id: "https://example.com/document/child/" } );
				expect( documents.inScope( pointer ) ).toBe( true );
				pointer = Pointer.create( { id: "https://example.com/another-document/" } );
				expect( documents.inScope( pointer ) ).toBe( true );
				pointer = Pointer.create( { id: "https://example.com/document/" } );
				expect( documents.inScope( pointer ) ).toBe( true );
				pointer = Pointer.create( { id: "a-relative-document/" } );
				expect( documents.inScope( pointer ) ).toBe( true );

				pointer = Pointer.create( { id: "https://example.com/document/#fragment" } );
				expect( documents.inScope( pointer ) ).toBe( true );
				pointer = Pointer.create( { id: "https://example.com/document/#another-fragment" } );
				expect( documents.inScope( pointer ) ).toBe( true );

				pointer = Pointer.create( { id: "_:BlankNode" } );
				expect( documents.inScope( pointer ) ).toBe( false );

				// Asks to context.parentContext.documents
				pointer = Pointer.create( { id: "http://example.org/document/" } );
				expect( documents.inScope( pointer ) ).toBe( true );
			} );

			it( hasSignature(
				"Returns true if the URI provided is inside the scope of the Documents instance.", [
					{ name: "id", type: "string", description: "URI to evaluate." },
				],
				{ type: "boolean" }
			), ():void => {
				class MockedContext extends AbstractContext {
					protected _baseURI:string;

					constructor() {
						super();
						this._baseURI = "https://example.com/";
						this.settings = { paths: { system: ".system/" } };
					}
				}

				let context:MockedContext = new MockedContext();
				let documents:Documents = context.documents;

				expect( documents.inScope( "https://example.com/document/" ) ).toBe( true );
				expect( documents.inScope( "https://example.com/document/child/" ) ).toBe( true );
				expect( documents.inScope( "https://example.com/another-document/" ) ).toBe( true );
				expect( documents.inScope( "a-relative-document/" ) ).toBe( true );

				expect( documents.inScope( "https://example.com/document/#fragment" ) ).toBe( true );
				expect( documents.inScope( "https://example.com/document/#another-fragment" ) ).toBe( true );

				expect( documents.inScope( "_:BlankNode" ) ).toBe( false );

				// Asks to context.parentContext.documents
				expect( documents.inScope( "http://example.org/document/" ) ).toBe( true );
			} );

		} );

		it( hasMethod(
			INSTANCE,
			"hasPointer",
			"Returns true if the Documents instance has a pointer referenced by the URI provided.", [
				{ name: "id", type: "string", description: "URI to look for." },
			],
			{ type: "boolean" }
		), ():void => {
			let context:MockedContext;
			let documents:Documents;

			class MockedContext extends AbstractContext {
				protected _baseURI:string;

				constructor() {
					super();
					this._baseURI = "https://example.com/";
					this.settings = { paths: { system: ".system/" } };
				}
			}

			context = new MockedContext();
			documents = context.documents;

			expect( documents.hasPointer ).toBeDefined();
			expect( Utils.isFunction( documents.hasPointer ) ).toBe( true );

			expect( documents.hasPointer( "https://example.com/document/" ) ).toBe( false );
			expect( documents.hasPointer( "document/" ) ).toBe( false );
			expect( documents.hasPointer( "https://example.com/document/#fragment" ) ).toBe( false );
			expect( documents.hasPointer( "https://example.com/another-document/" ) ).toBe( false );

			expect( () => documents.hasPointer( "_:BlankNode" ) ).toThrowError( Errors.IllegalArgumentError );

			context = new MockedContext();
			documents = context.documents;
			(<any> documents).pointers.set( "document/", Pointer.create( { id: "https://example.com/document/" } ) );
			expect( documents.hasPointer( "https://example.com/document/" ) ).toBe( true );
			expect( documents.hasPointer( "https://example.com/document/#fragment" ) ).toBe( false );
			expect( documents.hasPointer( "document/" ) ).toBe( true );

			expect( documents.hasPointer( "https://example.com/another-document/" ) ).toBe( false );

			(<any> documents).pointers.set( "document/", Pointer.create( { id: "https://example.com/document/" } ) );
			(<any> documents).pointers.set( "another-document/", Pointer.create( { id: "https://example.com/another-document/" } ) );
			expect( documents.hasPointer( "https://example.com/document/" ) ).toBe( true );
			expect( documents.hasPointer( "document/" ) ).toBe( true );
			expect( documents.hasPointer( "https://example.com/another-document/" ) ).toBe( true );
		} );

		it( hasMethod(
			INSTANCE,
			"getPointer",
			"Returns the pointer referenced by the URI provided. If no pointer exists, one is created and then returned.\n" +
			"Returns `null` if the URI is outside the scope of the Documents instance.", [
				{ name: "id", type: "string", description: "URI to look for." },
			],
			{ type: "boolean" }
		), ():void => {
			let context:MockedContext;
			let documents:Documents;

			class MockedContext extends AbstractContext {
				protected _baseURI:string;

				constructor() {
					super();
					this._baseURI = "https://example.com/";
					this.settings = { paths: { system: ".system/" } };
				}
			}

			context = new MockedContext();
			documents = context.documents;

			expect( documents.getPointer ).toBeDefined();
			expect( Utils.isFunction( documents.getPointer ) ).toBe( true );

			let pointer:Pointer;

			pointer = documents.getPointer( "https://example.com/document/" );
			expect( Pointer.is( pointer ) ).toBe( true );
			expect( pointer.id ).toBe( "https://example.com/document/" );

			pointer = documents.getPointer( "document/" );
			expect( Pointer.is( pointer ) ).toBe( true );
			expect( pointer.id ).toBe( "https://example.com/document/" );

			pointer = documents.getPointer( "https://example.com/document/#fragment" );
			expect( Pointer.is( pointer ) ).toBe( true );
			expect( pointer.id ).toBe( "https://example.com/document/#fragment" );

			pointer = documents.getPointer( "https://example.com/another-document/" );
			expect( Pointer.is( pointer ) ).toBe( true );
			expect( pointer.id ).toBe( "https://example.com/another-document/" );

			// Asks to context.parentContext.documents
			pointer = documents.getPointer( "http://example.org/document/" );
			expect( Pointer.is( pointer ) ).toBe( true );
			expect( pointer.id ).toBe( "http://example.org/document/" );

			expect( () => documents.getPointer( "_:BlankNode" ) ).toThrowError( Errors.IllegalArgumentError );

			let anotherPointer:Pointer = Pointer.create( { id: "https://example.com/document/" } );
			context = new MockedContext();
			documents = context.documents;
			(<any> documents).pointers.set( "document/", anotherPointer );
			pointer = documents.getPointer( "https://example.com/document/" );
			expect( pointer ).toBe( anotherPointer );
			pointer = documents.getPointer( "document/" );
			expect( pointer ).toBe( anotherPointer );
		} );

		describe( method(
			INSTANCE,
			"_parseErrorResponse"
		), ():void => {
			let documents:Documents;

			describe( "When Documents has a specified context", ():void => {

				beforeEach( () => {
					const context:AbstractContext = new class extends AbstractContext {
						protected _baseURI:string = "https://example.com/";
					};
					documents = context.documents;
				} );

				it( "should generate an HTTP error when status code is not 2xx", ( done:DoneFn ):void => {
					jasmine.Ajax.stubRequest( "https://example.com/", null, "GET" ).andReturn( {
						status: 500,
						responseText: `[ {
							"@id": "_:1",
							"@type": [ "${ C.ErrorResponse }" ],
							"${ C.error }": [ {
								"@id": "_:2"
							}, {
								"@id": "_:3"
							} ],
							"${ C.httpStatusCode }": [ {
								"@type": "${ XSD.int }",
								"@value": "500"
							} ]
						}, {
							"@id": "_:2",
							"@type": [ "${ C.Error }" ],
							"${ C.errorCode }": [ {
								"@language": "en",
								"@value": "code-01"
							} ],
							"${ C.errorMessage }": [ {
								"@language": "en",
								"@value": "Message 01"
							} ],
							"${ C.errorParameters }": [ {
								"@id": "_:4"
							} ]
						}, {
							"@id": "_:3",
							"@type": [ "${ C.Error }" ],
							"${ C.errorCode }": [ {
								"@language": "en",
								"@value": "code-02"
							} ],
							"${ C.errorMessage }": [ {
								"@language": "en",
								"@value": "Message 02"
							} ],
							"${ C.errorParameters }": [ {
								"@id": "_:6"
							} ]
						}, {
							"@id": "_:4",
							"@type": [ "${ C.Map }" ],
							"${ C.entry }": [ {
								"@id": "_:5"
							} ]
						}, {
							"@id": "_:5",
							"${ C.entryKey }": [ {
								"@value": "document"
							} ],
							"${ C.entryValue }": [ {
								"@id": "https://example.com/target-document/"
							} ]
						}, {
							"@id": "_:6",
							"@type": [ "${ C.Map }" ],
							"${ C.entry }": [ {
								"@id": "_:7"
							} ]
						}, {
							"@id": "_:7",
							"${ C.entryKey }": [ {
								"@value": "document"
							} ],
							"${ C.entryValue }": [ {
								"@id": "https://example.com/target-document/"
							} ]
						} ]`,
					} );

					documents.get( "https://example.com/" ).then( () => {
						done.fail( "Should not resolve" );
					} ).catch( ( error:HTTPError ) => {
						expect( error ).toBeDefined();
						expect( error ).toEqual( jasmine.any( HTTPError ) );

						expect( error.message ).toBe( "Message 01, Message 02" );
						expect( error.statusCode ).toBe( 500 );
						expect( error.errors ).toBeDefined();
						expect( error.errors.length ).toBe( 2 );
						error.errors.forEach( ( platformError, index ) => {
							expect( platformError.errorCode ).toBe( `code-0${ index + 1 }` );
							expect( platformError.errorMessage ).toBe( `Message 0${ index + 1 }` );

							expect( platformError.errorParameters.entries ).toBeDefined();
							platformError.errorParameters.entries.forEach( entry => {
								expect( entry.entryKey ).toBe( "document" );
								expect( entry.entryValue.id ).toEqual( "https://example.com/target-document/" );
							} );
						} );
						done();
					} );
				} );

				it( "should generate an error when multiple c:ErrorResponse in the response", ( done:DoneFn ):void => {
					jasmine.Ajax.stubRequest( "https://example.com/", null, "GET" ).andReturn( {
						status: 500,
						responseText: `[ {
							"@id": "_:1",
							"@type": [ "${ C.ErrorResponse }" ],
							"${ C.error }": [],
							"${ C.httpStatusCode }": [ {
								"@type": "http://www.w3.org/2001/XMLSchema#int",
								"@value": "1234567890"
							} ]
						}, {
							"@id": "_:2",
							"@type": [ "${ C.ErrorResponse }" ],
							"${ C.error }": [],
							"${ C.httpStatusCode }": [ {
								"@type": "http://www.w3.org/2001/XMLSchema#int",
								"@value": "0987654321"
							} ]
						} ]`,
					} );

					documents.get( "https://example.com/" ).then( () => {
						done.fail( "Should not resolve" );
					} ).catch( ( error:Error ) => {
						expect( error ).toEqual( jasmine.any( Errors.IllegalArgumentError ) );
						expect( error.message ).toBe( "The response string contains multiple c:ErrorResponse." );
						done();
					} );
				} );

				it( "should generate an error when no c:ErrorResponse in the response", ( done:DoneFn ):void => {
					jasmine.Ajax.stubRequest( "https://example.com/", null, "GET" ).andReturn( {
						status: 500,
						responseText: `[ {
							"@id": "_:3",
							"@type": [ "${ C.Error }" ],
							"${ C.errorCode }": [ {
								"@language": "en",
								"@value": "code-02"
							} ],
							"${ C.errorMessage }": [ {
								"@language": "en",
								"@value": "Message 02"
							} ],
							"${ C.errorParameters }": [ {
								"@id": "_:4"
							} ]
						}, {
							"@id": "_:4",
							"@type": [ "${ C.Map }" ],
							"${ C.entry }": [ {
								"@id": "_:5"
							} ]
						}, {
							"@id": "_:5",
							"${ C.entryKey }": [ {
								"@value": "document"
							} ],
							"${ C.entryValue }": [ {
								"@id": "https://example.com/target-document/"
							} ]
						} ]`,
					} );

					documents.get( "https://example.com/" ).then( () => {
						done.fail( "Should not resolve" );
					} ).catch( ( error:Error ) => {
						expect( error ).toEqual( jasmine.any( Errors.IllegalArgumentError ) );
						expect( error.message ).toBe( "The response string does not contains a c:ErrorResponse." );
						done();
					} );
				} );

				it( "should generate an HTTP error with the body if no JSON-LD is provided", ( done:DoneFn ):void => {
					jasmine.Ajax.stubRequest( "https://example.com/", null, "GET" ).andReturn( {
						status: 500,
						responseText: `An error message.`,
					} );

					documents.get( "https://example.com/" ).then( () => {
						done.fail( "Should not resolve" );
					} ).catch( ( error:Error ) => {
						expect( error ).toEqual( jasmine.any( HTTPError ) );
						expect( error.message ).toBe( "An error message." );
						done();
					} );
				} );

			} );

			describe( "When Documents does not have a context", ():void => {

				beforeEach( () => {
					documents = new Documents();
				} );

				it( "should generate an HTTP error with empty ErrorResponse properties", ( done:DoneFn ):void => {
					const responseText:string = `[ {
							"@id": "_:1",
							"@type": [ "${ C.ErrorResponse }" ],
							"${ C.error }": [ {
								"@id": "_:2"
							}, {
								"@id": "_:3"
							} ],
							"${ C.httpStatusCode }": [ {
								"@type": "${ XSD.int }",
								"@value": "500"
							} ]
						}, {
							"@id": "_:2",
							"@type": [ "${ C.Error }" ],
							"${ C.errorCode }": [ {
								"@language": "en",
								"@value": "code-01"
							} ],
							"${ C.errorMessage }": [ {
								"@language": "en",
								"@value": "Message 01"
							} ],
							"${ C.errorParameters }": [ {
								"@id": "_:4"
							} ]
						}, {
							"@id": "_:3",
							"@type": [ "${ C.Error }" ],
							"${ C.errorCode }": [ {
								"@language": "en",
								"@value": "code-02"
							} ],
							"${ C.errorMessage }": [ {
								"@language": "en",
								"@value": "Message 02"
							} ],
							"${ C.errorParameters }": [ {
									"@id": "_:6"
							} ]
						}, {
							"@id": "_:4",
							"@type": [ "${ C.Map }" ],
							"${ C.entry }": [ {
								"@id": "_:5"
							} ]
						}, {
							"@id": "_:5",
							"${ C.entryKey }": [ {
								"@value": "document"
							} ],
							"${ C.entryValue }": [ {
								"@id": "https://example.com/target-document/"
							} ]
						}, {
							"@id": "_:6",
							"@type": [ "${ C.Map }" ],
							"${ C.entry }": [ {
								"@id": "_:7"
							} ]
						}, {
							"@id": "_:7",
							"${ C.entryKey }": [ {
								"@value": "document"
							} ],
							"${ C.entryValue }": [ {
								"@id": "https://example.com/target-document/"
							} ]
						} ]`;
					jasmine.Ajax.stubRequest( "https://example.com/", null, "GET" ).andReturn( {
						status: 500,
						responseText,
					} );

					documents.get( "https://example.com/" ).then( () => {
						done.fail( "Should not resolve" );
					} ).catch( ( error:HTTPError ) => {
						expect( error ).toBeDefined();
						expect( error ).toEqual( jasmine.any( HTTPError ) );
						expect( error.message ).toBe( responseText );

						expect( error.statusCode ).toBe( 500 );
						expect( error.requestID ).toBeNull();
						expect( error.errors ).toBeDefined();
						expect( error.errors.length ).toBe( 0 );
						done();
					} );
				} );

			} );

		} );


		describe( method( INSTANCE, "register" ), ():void => {

			it( hasSignature(
				[ "T extends object" ],
				"Register an empty Document with the provided id and decorate it with the types provided.",
				[
					{ name: "id", type: "string" },
					{ name: "types", type: "string[]", optional: true },
				],
				{ type: "T & CarbonLDP.Document" }
			), ():void => {} );

			let context:AbstractContext;
			beforeEach( ():void => {
				context = new class extends AbstractContext {
					protected _baseURI:string = "https://example.com/";
				};
			} );

			it( "should exist", ():void => {
				expect( Documents.prototype.register ).toBeDefined();
				expect( Documents.prototype.register ).toEqual( jasmine.any( Function ) );
			} );


			it( "should throw error when id is out scope", ():void => {
				const documents:Documents = new Documents( context );

				expect( () => documents.register( "https://not-example.com/document/" ) ).toThrowError( Errors.IllegalArgumentError, "Cannot register a document outside the scope of this documents instance." );
			} );


			it( "should return empty Document when only id string", ():void => {
				const documents:Documents = new Documents( context );

				const returned:Document = documents.register( "https://example.com/document/" );

				expect( Document.is( returned ) ).toBe( true );
				expect( returned ).toEqual( jasmine.objectContaining( {
					id: "https://example.com/document/",
				} ) );

				expect( returned as Partial<Document> ).toEqual( {} );
			} );

			it( "should return existing Document when id string", ():void => {
				const documents:Documents = new Documents( context );

				interface ExistingDocument {
					alreadyExists:boolean;

					alreadyFunction():void;
				}

				const existingDoc:ExistingDocument = Object.assign(
					documents.getPointer( "https://example.com/document/" ), {
						alreadyExists: true,
						alreadyFunction():void {},
					}
				);

				const returned:ExistingDocument & Document = documents
					.register<ExistingDocument>( "https://example.com/document/" );

				expect( Document.is( returned ) ).toBe( true );
				expect( returned ).toEqual( jasmine.objectContaining( {
					id: "https://example.com/document/",
				} ) );

				expect( returned as ExistingDocument ).toEqual( {
					alreadyExists: true,
					alreadyFunction: jasmine.any( Function ),
				} );

				expect( existingDoc ).toBe( returned );
			} );

		} );


		describe( method( INSTANCE, "get" ), ():void => {

			it( hasSignature(
				[ "T extends object" ],
				"Retrieves the entire document referred by the URI specified when no query function si provided.\nIf the function builder es provided the query is able to specify the properties of the document to be retrieved and the sub-documents' properties and on and on.", [
					{ name: "uri", type: "string", description: "The URI of the document to retrieve/query." },
					{ name: "requestOptions", type: "CarbonLDP.HTTP.GETOptions", optional: true, description: "Customizable options for the request." },
					{ name: "queryBuilderFn", type: "( queryBuilder:CarbonLDP.SPARQL.QueryDocument.QueryDocumentBuilder ) => CarbonLDP.SPARQL.QueryDocument.QueryDocumentBuilder", optional: true, description: "Function that receives a the builder that helps you to construct the retrieval query.\nThe same builder must be returned." },
				],
				{ type: "Promise<T & CarbonLDP.Document>" }
			), ():void => {} );

			it( hasSignature(
				[ "T extends object" ],
				"Retrieves the entire document referred by the URI specified when no query function si provided.\nIf the function builder es provided the query is able to specify the properties of the document to be retrieved and the sub-documents' properties and on and on.", [
					{ name: "uri", type: "string", description: "The URI of the document to retrieve." },
					{ name: "queryBuilderFn", type: "( queryBuilder:CarbonLDP.SPARQL.QueryDocument.QueryDocumentBuilder ) => CarbonLDP.SPARQL.QueryDocument.QueryDocumentBuilder", optional: true, description: "Function that receives a the builder that helps you to construct the retrieval query.\nThe same builder must be returned." },
				],
				{ type: "Promise<T & CarbonLDP.Document>" }
			), ():void => {} );

			it( "should release cached request when failed", ( done:DoneFn ):void => {

				class MockedContext extends AbstractContext {
					protected _baseURI:string;

					constructor() {
						super();
						this._baseURI = "https://example.com/";
					}
				}

				const context:MockedContext = new MockedContext();
				const documents:Documents = context.documents;

				const spySend:jasmine.Spy = spyOn( RequestService, "send" );

				// First failed request
				spySend.and.returnValue( Promise.reject( new Response( {} as any, "A error in the GET request." ) ) );
				documents.get( "resource/" )
					.then<Document>( () => {
						done.fail( "Should not have been resolved." );

						return null;
					} )
					.catch<Document>( ( error:Error ) => {
						expect( error ).toEqual( new Error( "A error in the GET request." ) );

						// Second correct request
						spySend.and.returnValue( Promise.resolve( [
							[ { "@id": "https://example.com/resource/", "@graph": [ { "@id": "https://example.com/resource/" } ] } ],
							new Response( <any> null, "", <any> {
								headers: {
									"ETag": "123456",
									"Content-Location": "https://example.com/resource/",
								},
							} ),
						] ) );

						return documents.get( "resource/" );
					} )
					.then( ( document ) => {
						expect( document ).toBeDefined();
						expect( document.id ).toBe( "https://example.com/resource/" );

						done();
					} )
					.catch( error => {
						if( error.message === "A error in the GET request." )
							error = "Error is been cached";
						done.fail( error );
					} );
			} );

			it( "should reject promise if URI is a BNode", ( done:DoneFn ):void => {
				let promise:Promise<any> = new Documents().get( "_:a-blank-node" );
				promise.then( () => {
					done.fail( "Should not resolve promise." );
				} ).catch( error => {
					expect( error.message ).toBe( `BNodes cannot be fetched directly.` );
					done();
				} );
			} );

			describe( "When Documents has a specified context", ():void => {

				let context:AbstractContext;
				let documents:Documents;
				beforeEach( ():void => {
					context = new class extends AbstractContext {
						_baseURI:string = "https://example.com/";
						settings:ContextSettings = { vocabulary: "https://example.com/ns#" };
					};
					documents = context.documents;
				} );

				it( "should reject promise if URI is not in the context base", ( done:DoneFn ):void => {
					const promise:Promise<any> = documents.get( "http://not-example.com" );
					promise.then( () => {
						done.fail( "Should not resolve promise." );
					} ).catch( error => {
						expect( error.message ).toBe( `"http://not-example.com" isn't a valid URI for this Carbon instance.` );
						done();
					} );
				} );

				it( "should reject promise if prefixed URI cannot be resolved", ( done:DoneFn ):void => {
					const promise:Promise<any> = documents.get( "prefix:the-uri" );
					promise.then( () => {
						done.fail( "Should not resolve promise." );
					} ).catch( error => {
						expect( error.message ).toBe( `The prefixed URI "prefix:the-uri" could not be resolved.` );
						done();
					} );
				} );

				it( "should call _parseErrorResponse when request error", ( done:DoneFn ):void => {
					jasmine.Ajax.stubRequest( "https://example.com/" ).andReturn( {
						status: 500,
						responseText: "",
					} );

					const error:Error = new Error( "Error message" );
					const spy:jasmine.Spy = spyOn( documents, "_parseErrorResponse" ).and.callFake( () => Promise.reject( error ) );

					documents.get( "https://example.com/" ).then( () => {
						done.fail( "Should not resolve" );
					} ).catch( _error => {
						expect( spy ).toHaveBeenCalled();

						expect( _error ).toBeDefined();
						expect( _error ).toBe( error );

						done();
					} );
				} );


				it( "should retrieve the entire document", ( done:DoneFn ):void => {
					jasmine.Ajax.stubRequest( "https://example.com/resource/", null, "GET" ).andReturn( {
						status: 200,
						responseHeaders: {
							"ETag": "162458126348712643",
						},
						responseText: `{
							"@id": "https://example.com/resource/",
							"@graph": [
								{
									"@id": "https://example.com/resource/",
									"https://example.com/ns#string": [ { "@value": "Document Resource" } ],
									"https://example.com/ns#pointerSet": [
										{ "@id": "_:1" },
										{ "@id": "_:2" },
										{ "@id": "https://example.com/resource/#1" },
										{ "@id": "https://example.com/external-resource/" }
									]
								},
								{
									"@id": "_:1",
									"https://example.com/ns#string": [ { "@value": "Fragment 1" } ],
									"https://example.com/ns#pointerSet": [
										{ "@id": "https://example.com/resource/" },
										{ "@id": "https://example.com/resource/#1" }
									]
								},
								{
									"@id": "_:2",
									"https://example.com/ns#string": [ { "@value": "Fragment 2" } ]
								},
								{
									"@id": "https://example.com/resource/#1",
									"https://example.com/ns#string": [ { "@value": "NamedFragment 1" } ]
								},
								{
									"@id": "https://example.com/resource/#2",
									"https://example.com/ns#string": [ { "@value": "NamedFragment 2" } ]
								}
							]
						}`,
					} );

					context.extendObjectSchema( {
						"ex": "https://example.com/ns#",
						"xsd": "http://www.w3.org/2001/XMLSchema#",
						"string": {
							"@id": "ex:string",
							"@type": "xsd:string",
						},
						"date": {
							"@id": "ex:date",
							"@type": "xsd:dateTime",
						},
						"numberList": {
							"@id": "ex:numberList",
							"@type": "xsd:integer",
							"@container": "@list",
						},
						"languageMap": {
							"@id": "ex:languageMap",
							"@container": "@language",
						},
						"pointer": {
							"@id": "ex:pointer",
							"@type": "@id",
						},
						"pointerList": {
							"@id": "ex:pointerList",
							"@type": "@id",
							"@container": "@list",
						},
						"pointerSet": {
							"@id": "ex:pointerSet",
							"@type": "@id",
							"@container": "@set",
						},
					} );

					documents.get( "https://example.com/resource/" ).then( ( document:Document ):void => {
						expect( document ).toBeDefined();
						expect( Utils.isObject( document ) ).toEqual( true );

						expect( document[ "string" ] ).toBe( "Document Resource" );

						(():void => {
							expect( document[ "pointerSet" ].length ).toBe( 4 );
							expect( Pointer.getIDs( document[ "pointerSet" ] ) ).toContain( "_:1" );
							expect( Pointer.getIDs( document[ "pointerSet" ] ) ).toContain( "_:2" );
							expect( Pointer.getIDs( document[ "pointerSet" ] ) ).toContain( "https://example.com/resource/#1" );
							expect( Pointer.getIDs( document[ "pointerSet" ] ) ).toContain( "https://example.com/external-resource/" );
						})();

						(():void => {

							let fragment:TransientFragment;
							expect( document.getFragments().length ).toBe( 4 );

							(():void => {
								fragment = document.getFragment( "_:1" );
								expect( fragment ).toBeTruthy();
								expect( fragment[ "string" ] ).toBe( "Fragment 1" );
								expect( fragment[ "pointerSet" ].length ).toBe( 2 );
								expect( Pointer.getIDs( fragment[ "pointerSet" ] ) ).toContain( "https://example.com/resource/" );
								expect( Pointer.getIDs( fragment[ "pointerSet" ] ) ).toContain( "https://example.com/resource/#1" );
								expect( fragment[ "pointerSet" ].find( pointer => pointer.id === "https://example.com/resource/" ) ).toBe( document );
								expect( fragment[ "pointerSet" ].find( pointer => pointer.id === "https://example.com/resource/#1" ) ).toBe( document.getFragment( "1" ) );
							})();

							(():void => {
								fragment = document.getFragment( "_:2" );
								expect( fragment ).toBeTruthy();
								expect( fragment[ "string" ] ).toBe( "Fragment 2" );
							})();

							(():void => {
								fragment = document.getFragment( "1" );
								expect( fragment ).toBeTruthy();
								expect( fragment[ "string" ] ).toBe( "NamedFragment 1" );
							})();

							(():void => {
								fragment = document.getFragment( "2" );
								expect( fragment ).toBeTruthy();
								expect( fragment[ "string" ] ).toBe( "NamedFragment 2" );
							})();

						})();

						done();
					} ).catch( done.fail );
				} );

				it( "should retrieve document of content-location header", ( done:DoneFn ):void => {
					jasmine.Ajax.stubRequest( "https://example.com/resource/", null, "GET" ).andReturn( {
						status: 200,
						responseHeaders: {
							"ETag": "162458126348712643",
							"Content-Location": "https://example.com/another-resource/",
						},
						responseText: `{
							"@id": "https://example.com/another-resource/",
							"@graph": [
								{
									"@id": "https://example.com/another-resource/",
									"https://example.com/ns#string": [ { "@value": "Document Resource" } ]
								}
							]
						}`,
					} );

					context.extendObjectSchema( {
						"ex": "https://example.com/ns#",
						"xsd": "http://www.w3.org/2001/XMLSchema#",
						"string": {
							"@id": "ex:string",
							"@type": "xsd:string",
						},
						"date": {
							"@id": "ex:date",
							"@type": "xsd:dateTime",
						},
						"numberList": {
							"@id": "ex:numberList",
							"@type": "xsd:integer",
							"@container": "@list",
						},
						"languageMap": {
							"@id": "ex:languageMap",
							"@container": "@language",
						},
						"pointer": {
							"@id": "ex:pointer",
							"@type": "@id",
						},
						"pointerList": {
							"@id": "ex:pointerList",
							"@type": "@id",
							"@container": "@list",
						},
						"pointerSet": {
							"@id": "ex:pointerSet",
							"@type": "@id",
							"@container": "@set",
						},
					} );

					documents.get( "https://example.com/resource/" ).then( ( document:Document ):void => {
						expect( document ).toBeDefined();
						expect( Utils.isObject( document ) ).toEqual( true );

						expect( document.id ).toBe( "https://example.com/another-resource/" );
						expect( document[ "string" ] ).toBe( "Document Resource" );

						done();
					} ).catch( done.fail );
				} );


				it( "should send a correct construct query", ( done:DoneFn ):void => {
					interface MyDocument {
						property1:string;
						property2:{};
					}

					context.extendObjectSchema( {
						"schema": "https://schema.org/",
					} );
					context.extendObjectSchema( "Resource", {
						"property1": {
							"@id": "property-1",
							"@type": XSD.string,
						},
						"property2": {
							"@id": "property-2",
							"@type": XSD.integer,
						},
						"property3": {
							"@id": "https://schema.org/property-3",
							"@type": XSD.string,
						},
					} );

					const sendSpy:jasmine.Spy = spyOn( documents, "executeRawCONSTRUCTQuery" ).and.returnValue( Promise.reject( null ) );

					documents.get<MyDocument>( "https://example.com/resource/", _ => _
						.withType( "Resource" )
						.properties( {
							"property1": _.inherit,
							"property2": {
								"@id": "https://schema.org/property-2",
								"@type": "@id",
								"query": __ => __.properties( {
									"property2": __.inherit,
									"property3": __.inherit,
								} ),
							},
						} )
					).then( () => done.fail( "Should not resolve, spy is makes it fail." ) ).catch( () => {
						expect( sendSpy ).toHaveBeenCalledWith(
							"https://example.com/resource/",
							"PREFIX schema: <https://schema.org/> " +
							"CONSTRUCT {" +
							` ?metadata a <${ C.VolatileResource }>, <${ C.QueryMetadata }>;` +
							"" + ` <${ C.target }> ?document.` +

							" ?document a ?document__types;" +
							"" + " <https://example.com/ns#property-1> ?document__property1;" +
							"" + " schema:property-2 ?document__property2." +

							" ?document__property2 a ?document__property2__types;" +
							"" + " <https://example.com/ns#property-2> ?document__property2__property2;" +
							"" + " schema:property-3 ?document__property2__property3 " +

							"} WHERE {" +
							" BIND(BNODE() AS ?metadata)." +

							" VALUES ?document { <https://example.com/resource/> }." +
							" OPTIONAL { ?document a ?document__types }." +
							" ?document a <https://example.com/ns#Resource>." +

							" OPTIONAL {" +
							"" + " ?document <https://example.com/ns#property-1> ?document__property1." +
							"" + " FILTER( datatype( ?document__property1 ) = <http://www.w3.org/2001/XMLSchema#string> )" +
							" }." +

							" OPTIONAL {" +
							"" + " ?document schema:property-2 ?document__property2." +
							"" + " FILTER( ! isLiteral( ?document__property2 ) )." +
							"" + " OPTIONAL { ?document__property2 a ?document__property2__types }." +

							"" + " OPTIONAL {" +
							"" + "" + " ?document__property2 <https://example.com/ns#property-2> ?document__property2__property2." +
							"" + "" + " FILTER( datatype( ?document__property2__property2 ) = <http://www.w3.org/2001/XMLSchema#integer> )" +
							"" + " }." +

							"" + " OPTIONAL {" +
							"" + "" + " ?document__property2 schema:property-3 ?document__property2__property3." +
							"" + "" + " FILTER( datatype( ?document__property2__property3 ) = <http://www.w3.org/2001/XMLSchema#string> )" +
							"" + " }" +
							" } " +
							"}",

							jasmine.objectContaining( {
								headers: new Map( [
									[ "prefer", new Header( [
										`include="${ C.PreferDocumentETags }"`,
										`include="${ C.PreferResultsContext }"`,
									] ) ],
								] ),
							} )
						);
						done();
					} );
				} );

				it( "should return a partial document", ( done:DoneFn ):void => {
					jasmine.Ajax.stubRequest( "https://example.com/resource/" ).andReturn( {
						status: 200,
						responseText: `[ {
							"@id":"_:1",
							"@type": [
								"${ C.VolatileResource }",
								"${ C.QueryMetadata }"
							],
							"${ C.target }": [ {
								"@id":"${ context.baseURI }resource/"
							} ]
						}, {
							"@id": "_:2",
							"@type": [
								"${ C.ResponseMetadata }",
								"${ C.VolatileResource }"
							],
							"${ C.documentMetadata }": [ {
								"@id": "_:3"
							} ]
						}, {
							"@id": "_:3",
							"@type": [
								"${ C.DocumentMetadata }",
								"${ C.VolatileResource }"
							],
							"${ C.eTag }": [ {
								"@value": "\\"1-12345\\""
							} ],
							"${ C.relatedDocument }": [ {
								"@id": "https://example.com/resource/"
							} ]
						}, {
							"@id": "${ context.baseURI }resource/",
							"@graph": [ {
								"@id": "${ context.baseURI }resource/",
								"@type": [
									"${ C.Document }",
									"https://example.com/ns#Resource",
									"${ LDP.BasicContainer }",
									"${ LDP.RDFSource }"
								],
								"https://example.com/ns#property-1": [ {
									"@value": "value"
								} ],
								"https://schema.org/property-2": [ {
									"@id": "_:1"
								} ]
							}, {
								"@id": "_:1",
								"https://example.com/ns#property-2": [ {
									"@value": "12345",
									"@type": "${ XSD.integer }"
								} ],
								"https://schema.org/property-3": [ {
									"@value": "another value"
								} ]
							} ]
						} ]`,
					} );

					interface MyDocument {
						property1:string;
						property2:{};
					}

					context.extendObjectSchema( "Resource", {
						"property1": {
							"@id": "property-1",
							"@type": XSD.string,
						},
						"property2": {
							"@id": "property-2",
							"@type": XSD.integer,
						},
						"property3": {
							"@id": "https://schema.org/property-3",
							"@type": XSD.string,
						},
					} );

					documents.get<MyDocument>( "https://example.com/resource/", _ => _
						.withType( "Resource" )
						.properties( {
							"property1": _.inherit,
							"property2": {
								"@id": "https://schema.org/property-2",
								"@type": "@id",
								"query": __ => __.properties( {
									"property2": __.inherit,
									"property3": __.inherit,
								} ),
							},
						} )
					).then( ( document ) => {
						expect( Document.is( document ) ).toBe( true );
						expect( document ).toEqual( jasmine.objectContaining( {
							"_eTag": "\"1-12345\"",
							"property1": "value",
							"property2": jasmine.objectContaining( {
								"property2": 12345,
								"property3": "another value",
							} ),
						} ) );
						done();
					} ).catch( done.fail );
				} );

				it( "should return a partial document with partial relations", ( done:DoneFn ):void => {
					jasmine.Ajax.stubRequest( "https://example.com/resource/" ).andReturn( {
						status: 200,
						responseText: `[ {
							"@id":"_:1",
							"@type": [
								"${ C.VolatileResource }",
								"${ C.QueryMetadata }"
							],
							"${ C.target }": [ {
								"@id":"${ context.baseURI }resource/"
							} ]
						}, {
							"@id": "_:3",
							"@type": [
								"${ C.ResponseMetadata }",
								"${ C.VolatileResource }"
							],
							"${ C.documentMetadata }": [ {
								"@id": "_:4"
							}, {
								"@id": "_:5"
							} ]
						}, {
							"@id": "_:4",
							"@type": [
								"${ C.DocumentMetadata }",
								"${ C.VolatileResource }"
							],
							"${ C.eTag }": [ {
								"@value": "\\"1-12345\\""
							} ],
							"${ C.relatedDocument }": [ {
								"@id": "https://example.com/resource/"
							} ]
						}, {
							"@id": "_:5",
							"@type": [
								"${ C.DocumentMetadata }",
								"${ C.VolatileResource }"
							],
							"${ C.eTag }": [ {
								"@value": "\\"2-12345\\""
							} ],
							"${ C.relatedDocument }": [ {
								"@id": "https://example.com/another-resource/"
							} ]
						}, {
							"@id": "${ context.baseURI }resource/",
							"@graph": [ {
								"@id": "${ context.baseURI }resource/",
								"@type": [
									"${ C.Document }",
									"https://example.com/ns#Resource",
									"${ LDP.BasicContainer }",
									"${ LDP.RDFSource }"
								],
								"https://example.com/ns#property-1": [ {
									"@value": "value"
								} ],
								"https://schema.org/property-2": [ {
									"@id": "${ context.baseURI }another-resource/"
								} ]
							} ]
						}, {
							"@id": "${ context.baseURI }another-resource/",
							"@graph": [ {
								"@id": "${ context.baseURI }another-resource/",
								"https://example.com/ns#property-2": [ {
									"@value": "12345",
									"@type": "${ XSD.integer }"
								} ],
								"https://schema.org/property-3": [ {
									"@value": "another value"
								} ]
							} ]
						} ]`,
					} );

					interface MyDocument {
						property1:string;
						property2:{};
					}

					context.extendObjectSchema( "Resource", {
						"property1": {
							"@id": "property-1",
							"@type": XSD.string,
						},
						"property2": {
							"@id": "property-2",
							"@type": XSD.integer,
						},
						"property3": {
							"@id": "https://schema.org/property-3",
							"@type": XSD.string,
						},
					} );

					documents.get<MyDocument>( "https://example.com/resource/", _ => _
						.withType( "Resource" )
						.properties( {
							"property1": _.inherit,
							"property2": {
								"@id": "https://schema.org/property-2",
								"@type": "@id",
								"query": __ => __.properties( {
									"property2": __.inherit,
									"property3": __.inherit,
								} ),
							},
						} )
					).then( ( document ) => {
						expect( Document.is( document ) ).toBe( true );
						expect( Document.is( document.property2 ) ).toBe( true );

						expect( document ).toEqual( jasmine.objectContaining( {
							"_eTag": "\"1-12345\"",
							"property1": "value",
							"property2": jasmine.objectContaining( {
								"_eTag": "\"2-12345\"",
								"property2": 12345,
								"property3": "another value",
							} ),
						} ) );
						done();
					} ).catch( done.fail );
				} );

				it( "should add partial metadata to the document", ( done:DoneFn ):void => {
					jasmine.Ajax.stubRequest( "https://example.com/resource/" ).andReturn( {
						status: 200,
						responseText: `[ {
							"@id":"_:1",
							"@type": [
								"${ C.VolatileResource }",
								"${ C.QueryMetadata }"
							],
							"${ C.target }": [ {
								"@id":"${ context.baseURI }resource/"
							} ]
						}, {
							"@id": "${ context.baseURI }resource/",
							"@graph": [ {
								"@id": "${ context.baseURI }resource/",
								"@type": [
									"${ C.Document }",
									"https://example.com/ns#Resource",
									"${ LDP.BasicContainer }",
									"${ LDP.RDFSource }"
								],
								"https://example.com/ns#property-1": [ {
									"@value": "value"
								} ],
								"https://schema.org/property-2": [ {
									"@id": "_:1"
								} ]
							}, {
								"@id": "_:1",
								"https://example.com/ns#property-2": [ {
									"@value": "12345",
									"@type": "${ XSD.integer }"
								} ],
								"https://schema.org/property-3": [ {
									"@value": "another value"
								} ]
							} ]
						} ]`,
					} );

					interface MyDocument {
						property1:string;
						property2:Resource;
					}

					context.extendObjectSchema( "Resource", {
						"property1": {
							"@id": "property-1",
							"@type": XSD.string,
						},
						"property2": {
							"@id": "property-2",
							"@type": XSD.integer,
						},
						"property3": {
							"@id": "https://schema.org/property-3",
							"@type": XSD.string,
						},
					} );

					documents.get<MyDocument>( "https://example.com/resource/", _ => _
						.withType( "Resource" )
						.properties( {
							"property1": _.inherit,
							"property2": {
								"@id": "https://schema.org/property-2",
								"@type": "@id",
								"query": __ => __.properties( {
									"property2": __.inherit,
									"property3": __.inherit,
								} ),
							},
						} )
					).then( ( document ) => {
						expect( document._partialMetadata ).toEqual( jasmine.any( PartialMetadata ) );
						expect( document._partialMetadata.schema ).toEqual( ObjectSchema.ObjectSchemaDigester.digestSchema( {
							"property1": {
								"@id": "https://example.com/ns#property-1",
								"@type": XSD.string,
							},
							"property2": {
								"@id": "https://schema.org/property-2",
								"@type": "@id",
							},
						} ) );

						expect( document.property2._partialMetadata ).toEqual( jasmine.any( PartialMetadata ) );
						expect( document.property2._partialMetadata.schema ).toEqual( ObjectSchema.ObjectSchemaDigester.digestSchema( {
							"property2": {
								"@id": "https://example.com/ns#property-2",
								"@type": XSD.integer,
							},
							"property3": {
								"@id": "https://schema.org/property-3",
								"@type": XSD.string,
							},
						} ) );
						done();
					} ).catch( done.fail );
				} );

				it( "should merge partial metadata of a partial document", ( done:DoneFn ):void => {
					interface MyDocument {
						property1:string;
						property2:Resource;
					}

					context.extendObjectSchema( "Resource", {
						"property1": {
							"@id": "property-1",
							"@type": XSD.string,
						},
						"property2": {
							"@id": "property-2",
							"@type": XSD.integer,
						},
						"property3": {
							"@id": "https://schema.org/property-3",
							"@type": XSD.string,
						},
						"property4": {
							"@id": "property-4",
							"@type": XSD.boolean,
						},
						"property5": {
							"@id": "https://schema.org/property-5",
							"@type": XSD.dateTime,
						},
					} );

					Utils.promiseMethod( () => {
						jasmine.Ajax.stubRequest( "https://example.com/resource/" ).andReturn( {
							status: 200,
							responseText: `[ {
							"@id":"_:1",
							"@type": [
								"${ C.VolatileResource }",
								"${ C.QueryMetadata }"
							],
							"${ C.target }": [ {
								"@id":"${ context.baseURI }resource/"
							} ]
						}, {
							"@id": "${ context.baseURI }resource/",
							"@graph": [ {
								"@id": "${ context.baseURI }resource/",
								"@type": [
									"${ C.Document }",
									"https://example.com/ns#Resource",
									"${ LDP.BasicContainer }",
									"${ LDP.RDFSource }"
								],
								"https://example.com/ns#property-1": [ {
									"@value": "value"
								} ],
								"https://schema.org/property-2": [ {
									"@id": "_:1"
								} ]
							}, {
								"@id": "_:1",
								"https://example.com/ns#property-2": [ {
									"@value": "12345",
									"@type": "${ XSD.integer }"
								} ],
								"https://schema.org/property-3": [ {
									"@value": "another value"
								} ]
							} ]
						} ]`,
						} );

						return documents.get<MyDocument>( "https://example.com/resource/", _ => _
							.withType( "Resource" )
							.properties( {
								"property1": _.inherit,
								"property2": {
									"@id": "https://schema.org/property-2",
									"@type": "@id",
									"query": __ => __.properties( {
										"property2": __.inherit,
										"property3": __.inherit,
									} ),
								},
							} )
						);
					} ).then( () => {
						jasmine.Ajax.stubRequest( "https://example.com/resource/" ).andReturn( {
							status: 200,
							responseText: `[ {
							"@id":"_:1",
							"@type": [
								"${ C.VolatileResource }",
								"${ C.QueryMetadata }"
							],
							"${ C.target }": [ {
								"@id":"${ context.baseURI }resource/"
							} ]
						}, {
							"@id": "${ context.baseURI }resource/",
							"@graph": [ {
								"@id": "${ context.baseURI }resource/",
								"@type": [
									"${ C.Document }",
									"https://example.com/ns#Resource",
									"${ LDP.BasicContainer }",
									"${ LDP.RDFSource }"
								],
								"https://example.com/ns#property-4": [ {
									"@value": "true",
									"@type": "${ XSD.boolean }"
								} ],
								"https://schema.org/property-2": [ {
									"@id": "_:1"
								} ]
							}, {
								"@id": "_:1",
								"https://schema.org/property-3": [ {
									"@value": "updated value"
								} ],
								"https://schema.org/property-5": [ {
									"@value": "2000-01-01",
									"@type": "${ XSD.dateTime }"
								} ]
							} ]
						} ]`,
						} );

						return documents.get<MyDocument>( "https://example.com/resource/", _ => _
							.withType( "Resource" )
							.properties( {
								"property4": _.inherit,
								"property2": {
									"@id": "https://schema.org/property-2",
									"@type": "@id",
									"query": __ => __.properties( {
										"property3": __.inherit,
										"property5": __.inherit,
									} ),
								},
							} )
						);
					} ).then( ( document ) => {
						expect( document._partialMetadata ).toEqual( jasmine.any( PartialMetadata ) );
						expect( document._partialMetadata.schema ).toEqual( ObjectSchema.ObjectSchemaDigester.digestSchema( {
							"property4": {
								"@id": "https://example.com/ns#property-4",
								"@type": XSD.boolean,
							},
							"property2": {
								"@id": "https://schema.org/property-2",
								"@type": "@id",
							},
							"property1": {
								"@id": "https://example.com/ns#property-1",
								"@type": XSD.string,
							},
						} ) );

						expect( document.property2._partialMetadata ).toEqual( jasmine.any( PartialMetadata ) );
						expect( document.property2._partialMetadata.schema ).toEqual( ObjectSchema.ObjectSchemaDigester.digestSchema( {
							"property3": {
								"@id": "https://schema.org/property-3",
								"@type": XSD.string,
							},
							"property5": {
								"@id": "https://schema.org/property-5",
								"@type": XSD.dateTime,
							},
							"property2": {
								"@id": "https://example.com/ns#property-2",
								"@type": XSD.integer,
							},
						} ) );
						done();
					} ).catch( done.fail );
				} );

				it( "should merge query results to the partial", ( done:DoneFn ):void => {
					jasmine.Ajax.stubRequest( "https://example.com/resource/" ).andReturn( {
						status: 200,
						responseText: `[ {
							"@id":"_:1",
							"@type": [
								"${ C.VolatileResource }",
								"${ C.QueryMetadata }"
							],
							"${ C.target }": [ {
								"@id":"${ context.baseURI }resource/"
							} ]
						}, {
							"@id": "${ context.baseURI }resource/",
							"@graph": [ {
								"@id": "${ context.baseURI }resource/",
								"@type": [
									"${ C.Document }",
									"https://example.com/ns#Resource",
									"${ LDP.BasicContainer }",
									"${ LDP.RDFSource }"
								],
								"https://example.com/ns#property-4": [ {
									"@value": "false",
									"@type": "${ XSD.boolean }"
								} ],
								"https://schema.org/property-2": [ {
									"@id": "_:1"
								} ]
							}, {
								"@id": "_:1",
								"https://schema.org/property-3": [ {
									"@value": "updated sub-value"
								} ],
								"https://schema.org/property-5": [ {
									"@value": "2010-01-01",
									"@type": "${ XSD.dateTime }"
								} ]
							} ]
						} ]`,
					} );

					interface MyDocument {
						property4:boolean;
						property1:string;
						property2:Resource;
					}

					context.extendObjectSchema( "Resource", {
						"property1": {
							"@id": "property-1",
							"@type": XSD.string,
						},
						"property2": {
							"@id": "property-2",
							"@type": XSD.integer,
						},
						"property3": {
							"@id": "https://schema.org/property-3",
							"@type": XSD.string,
						},
						"property4": {
							"@id": "property-4",
							"@type": XSD.boolean,
						},
						"property5": {
							"@id": "https://schema.org/property-5",
							"@type": XSD.dateTime,
						},
					} );

					const persistedDocument:Document & MyDocument = Document.decorate(
						Object.assign(
							documents.getPointer( "https://example.com/resource/" ),
							{ property4: true, property1: "value", property2: null }
						),
						documents
					);
					persistedDocument._partialMetadata = createPartialMetadata( {
						"@vocab": "https://example.com/ns#",
						"property4": {
							"@id": "property-4",
							"@type": XSD.boolean,
						},
						"property2": {
							"@id": "https://schema.org/property-2",
							"@type": "@id",
						},
						"property1": {
							"@id": "property-1",
							"@type": XSD.string,
						},
					} );

					persistedDocument.property2 = persistedDocument.createFragment(
						{ property3: "sub-value", property5: new Date( "2000-01-01" ), property2: 12345 },
						"_:1"
					);
					persistedDocument.property2._partialMetadata = createPartialMetadata( {
						"@vocab": "https://example.com/ns#",
						"property3": {
							"@id": "https://schema.org/property-3",
							"@type": XSD.string,
						},
						"property5": {
							"@id": "https://schema.org/property-5",
							"@type": XSD.dateTime,
						},
						"property2": {
							"@id": "property-2",
							"@type": XSD.integer,
						},
					} );

					Utils.promiseMethod( () => {
						return documents.get<MyDocument>( "https://example.com/resource/", _ => _
							.withType( "Resource" )
							.properties( {
								"property4": _.inherit,
								"property2": {
									"@id": "https://schema.org/property-2",
									"@type": "@id",
									"query": __ => __.properties( {
										"property3": __.inherit,
										"property5": __.inherit,
									} ),
								},
							} )
						);
					} ).then( ( document ) => {
						expect( Document.is( document ) ).toBe( true );
						expect( document ).toEqual( jasmine.objectContaining( {
							"property4": false,
							"property1": "value",
							"property2": jasmine.objectContaining( {
								"property2": 12345,
								"property3": "updated sub-value",
								"property5": new Date( "2010-01-01" ),
							} ) as any,
						} ) );
						done();
					} ).catch( done.fail );
				} );

			} );

			describe( "When Documents does not have a context", ():void => {

				let documents:Documents;
				beforeEach( () => {
					documents = new Documents();
				} );

				it( "should reject if URI is relative", ( done:DoneFn ):void => {
					const promise:Promise<any> = documents.get( "relative-uri/" );
					promise.then( () => {
						done.fail( "Should not resolve promise." );
					} ).catch( error => {
						expect( error.message ).toBe( "This Documents instance doesn't support relative URIs." );
						done();
					} );
				} );

				it( "should reject if URI is prefixed", ( done:DoneFn ):void => {
					const promise:Promise<any> = documents.get( "prefix:the-uri" );
					promise.then( () => {
						done.fail( "Should not resolve promise." );
					} ).catch( error => {
						expect( error.message ).toBe( "This Documents instance doesn't support prefixed URIs." );
						done();
					} );
				} );

				it( "should call _parseErrorResponse when request error", ( done:DoneFn ):void => {
					jasmine.Ajax.stubRequest( "https://example.com/" ).andReturn( {
						status: 500,
						responseText: "",
					} );

					const error:Error = new Error( "Error message" );
					const spy:jasmine.Spy = spyOn( documents, "_parseErrorResponse" ).and.callFake( () => Promise.reject( error ) );

					documents.get( "https://example.com/" ).then( () => {
						done.fail( "Should not resolve" );
					} ).catch( _error => {
						expect( spy ).toHaveBeenCalled();

						expect( _error ).toBeDefined();
						expect( _error ).toBe( error );

						done();
					} );
				} );


				it( "should send a correct construct query", ( done:DoneFn ):void => {
					interface MyDocument {
						property1:string;
						property2:{};
					}

					const sendSpy:jasmine.Spy = spyOn( documents, "executeRawCONSTRUCTQuery" ).and.returnValue( Promise.reject( null ) );

					documents.get<MyDocument>( "https://example.com/resource/", _ => _
						.withType( "https://example.com/ns#Resource" )
						.properties( {
							"property1": {
								"@id": "https://example.com/ns#property-1",
								"@type": XSD.string,
							},
							"property2": {
								"@id": "https://schema.org/property-2",
								"@type": "@id",
								"query": __ => __.properties( {
									"property2": {
										"@id": "https://example.com/ns#property-2",
										"@type": XSD.integer,
									},
									"property3": {
										"@id": "https://schema.org/property-3",
										"@type": XSD.string,
									},
								} ),
							},
						} )
					).then( () => done.fail( "Should not resolve, spy is makes it fail." ) ).catch( ( error ) => {
						if( error ) done.fail( error );

						expect( sendSpy ).toHaveBeenCalledWith(
							"https://example.com/resource/", "" +
							"CONSTRUCT {" +
							` ?metadata a <${ C.VolatileResource }>, <${ C.QueryMetadata }>;` +
							"" + ` <${ C.target }> ?document.` +

							" ?document a ?document__types;" +
							"" + " <https://example.com/ns#property-1> ?document__property1;" +
							"" + " <https://schema.org/property-2> ?document__property2." +

							" ?document__property2 a ?document__property2__types;" +
							"" + " <https://example.com/ns#property-2> ?document__property2__property2;" +
							"" + " <https://schema.org/property-3> ?document__property2__property3 " +

							"} WHERE {" +
							" BIND(BNODE() AS ?metadata)." +

							" VALUES ?document { <https://example.com/resource/> }." +
							" OPTIONAL { ?document a ?document__types }." +
							" ?document a <https://example.com/ns#Resource>." +

							" OPTIONAL {" +
							"" + " ?document <https://example.com/ns#property-1> ?document__property1." +
							"" + " FILTER( datatype( ?document__property1 ) = <http://www.w3.org/2001/XMLSchema#string> )" +
							" }." +

							" OPTIONAL {" +
							"" + " ?document <https://schema.org/property-2> ?document__property2." +
							"" + " FILTER( ! isLiteral( ?document__property2 ) )." +
							"" + " OPTIONAL { ?document__property2 a ?document__property2__types }." +

							"" + " OPTIONAL {" +
							"" + "" + " ?document__property2 <https://example.com/ns#property-2> ?document__property2__property2." +
							"" + "" + " FILTER( datatype( ?document__property2__property2 ) = <http://www.w3.org/2001/XMLSchema#integer> )" +
							"" + " }." +

							"" + " OPTIONAL {" +
							"" + "" + " ?document__property2 <https://schema.org/property-3> ?document__property2__property3." +
							"" + "" + " FILTER( datatype( ?document__property2__property3 ) = <http://www.w3.org/2001/XMLSchema#string> )" +
							"" + " }" +
							" } " +
							"}",

							jasmine.objectContaining( {
								headers: new Map( [
									[ "prefer", new Header( [
										`include="${ C.PreferDocumentETags }"`,
										`include="${ C.PreferResultsContext }"`,
									] ) ],
								] ),
							} )
						);
						done();
					} );
				} );

				it( "should return a partial document", ( done:DoneFn ):void => {
					jasmine.Ajax.stubRequest( "https://example.com/resource/" ).andReturn( {
						status: 200,
						responseText: `[ {
							"@id":"_:1",
							"@type": [
								"${ C.VolatileResource }",
								"${ C.QueryMetadata }"
							],
							"${ C.target }": [ {
								"@id":"https://example.com/resource/"
							} ]
						}, {
							"@id": "_:2",
							"@type": [
								"${ C.ResponseMetadata }",
								"${ C.VolatileResource }"
							],
							"${ C.documentMetadata }": [ {
								"@id": "_:3"
							} ]
						}, {
							"@id": "_:3",
							"@type": [
								"${ C.DocumentMetadata }",
								"${ C.VolatileResource }"
							],
							"${ C.eTag }": [ {
								"@value": "\\"1-12345\\""
							} ],
							"${ C.relatedDocument }": [ {
								"@id": "https://example.com/resource/"
							} ]
						}, {
							"@id": "https://example.com/resource/",
							"@graph": [ {
								"@id": "https://example.com/resource/",
								"@type": [
									"${ C.Document }",
									"https://example.com/ns#Resource",
									"${ LDP.BasicContainer }",
									"${ LDP.RDFSource }"
								],
								"https://example.com/ns#property-1": [ {
									"@value": "value"
								} ],
								"https://schema.org/property-2": [ {
									"@id": "_:1"
								} ]
							}, {
								"@id": "_:1",
								"https://example.com/ns#property-2": [ {
									"@value": "12345",
									"@type": "${ XSD.integer }"
								} ],
								"https://schema.org/property-3": [ {
									"@value": "another value"
								} ]
							} ]
						} ]`,
					} );

					interface MyDocument {
						property1:string;
						property2:{};
					}

					documents.get<MyDocument>( "https://example.com/resource/", _ => _
						.withType( "https://example.com/ns#Resource" ).properties( {
							"property1": {
								"@id": "https://example.com/ns#property-1",
								"@type": XSD.string,
							},
							"property2": {
								"@id": "https://schema.org/property-2",
								"@type": "@id",
								"query": __ => __.properties( {
									"property2": {
										"@id": "https://example.com/ns#property-2",
										"@type": XSD.integer,
									},
									"property3": {
										"@id": "https://schema.org/property-3",
										"@type": XSD.string,
									},
								} ),
							},
						} )
					).then( ( document ) => {
						expect( Document.is( document ) ).toBe( true );
						expect( document ).toEqual( jasmine.objectContaining( {
							"_eTag": "\"1-12345\"",
							"property1": "value",
							"property2": jasmine.objectContaining( {
								"property2": 12345,
								"property3": "another value",
							} ),
						} ) );
						done();
					} ).catch( done.fail );
				} );

				it( "should return a partial document with partial relations", ( done:DoneFn ):void => {
					jasmine.Ajax.stubRequest( "https://example.com/resource/" ).andReturn( {
						status: 200,
						responseText: `[ {
							"@id":"_:1",
							"@type": [
								"${ C.VolatileResource }",
								"${ C.QueryMetadata }"
							],
							"${ C.target }": [ {
								"@id":"https://example.com/resource/"
							} ]
						}, {
							"@id": "_:3",
							"@type": [
								"${ C.ResponseMetadata }",
								"${ C.VolatileResource }"
							],
							"${ C.documentMetadata }": [ {
								"@id": "_:4"
							}, {
								"@id": "_:5"
							} ]
						}, {
							"@id": "_:4",
							"@type": [
								"${ C.DocumentMetadata }",
								"${ C.VolatileResource }"
							],
							"${ C.eTag }": [ {
								"@value": "\\"1-12345\\""
							} ],
							"${ C.relatedDocument }": [ {
								"@id": "https://example.com/resource/"
							} ]
						}, {
							"@id": "_:5",
							"@type": [
								"${ C.DocumentMetadata }",
								"${ C.VolatileResource }"
							],
							"${ C.eTag }": [ {
								"@value": "\\"2-12345\\""
							} ],
							"${ C.relatedDocument }": [ {
								"@id": "https://example.com/another-resource/"
							} ]
						}, {
							"@id": "https://example.com/resource/",
							"@graph": [ {
								"@id": "https://example.com/resource/",
								"@type": [
									"${ C.Document }",
									"https://example.com/ns#Resource",
									"${ LDP.BasicContainer }",
									"${ LDP.RDFSource }"
								],
								"https://example.com/ns#property-1": [ {
									"@value": "value"
								} ],
								"https://schema.org/property-2": [ {
									"@id": "https://example.com/another-resource/"
								} ]
							} ]
						}, {
							"@id": "https://example.com/another-resource/",
							"@graph": [ {
								"@id": "https://example.com/another-resource/",
								"https://example.com/ns#property-2": [ {
									"@value": "12345",
									"@type": "${ XSD.integer }"
								} ],
								"https://schema.org/property-3": [ {
									"@value": "another value"
								} ]
							} ]
						} ]`,
					} );

					interface MyDocument {
						property1:string;
						property2:{};
					}

					documents.get<MyDocument>( "https://example.com/resource/", _ => _
						.withType( "https://example.com/ns#Resource" )
						.properties( {
							"property1": {
								"@id": "https://example.com/ns#property-1",
								"@type": XSD.string,
							},
							"property2": {
								"@id": "https://schema.org/property-2",
								"@type": "@id",
								"query": __ => __.properties( {
									"property2": {
										"@id": "https://example.com/ns#property-2",
										"@type": XSD.integer,
									},
									"property3": {
										"@id": "https://schema.org/property-3",
										"@type": XSD.string,
									},
								} ),
							},
						} )
					).then( ( document ) => {
						expect( Document.is( document ) ).toBe( true );
						expect( Document.is( document.property2 ) ).toBe( true );

						expect( document ).toEqual( jasmine.objectContaining( {
							"_eTag": "\"1-12345\"",
							"property1": "value",
							"property2": jasmine.objectContaining( {
								"_eTag": "\"2-12345\"",
								"property2": 12345,
								"property3": "another value",
							} ),
						} ) );
						done();
					} ).catch( done.fail );
				} );

			} );

		} );

		describe( method(
			INSTANCE,
			"exists"
		), ():void => {

			it( hasSignature(
				"Retrieves a boolean indicating if the resource exists or not in the Carbon LDP server.", [
					{ name: "documentURI", type: "string", description: "The URI to verify if it exists." },
					{ name: "requestOptions", type: "CarbonLDP.HTTP.RequestOptions", optional: true, description: "Customizable options for the request." },
				],
				{ type: "Promise<boolean>" }
			), ( done:DoneFn ):void => {
				let promises:Promise<any>[] = [];

				class MockedContext extends AbstractContext {
					protected _baseURI:string;

					constructor() {
						super();
						this._baseURI = "https://example.com/";
						this.settings = { paths: { system: ".system/" } };
					}
				}

				let context:MockedContext = new MockedContext();
				let documents:Documents = context.documents;

				let spyExists:jasmine.Spy = jasmine.createSpy( "exists" );
				let spyNotExists:jasmine.Spy = jasmine.createSpy( "notExists" );
				let spyFail:jasmine.Spy = jasmine.createSpy( "fail" );

				jasmine.Ajax.stubRequest( "https://example.com/resource/exists/", null, "HEAD" ).andReturn( {
					status: 200,
				} );
				jasmine.Ajax.stubRequest( "https://example.com/resource/not-exists/", null, "HEAD" ).andReturn( {
					status: 404,
				} );
				jasmine.Ajax.stubRequest( "https://example.com/resource/error/", null, "HEAD" ).andReturn( {
					status: 500,
				} );

				let promise:Promise<any>;

				promise = documents.exists( "https://example.com/resource/exists/" );
				expect( promise instanceof Promise ).toBe( true );
				promises.push( promise.then( spyExists ) );

				promise = documents.exists( "https://example.com/resource/not-exists/" );
				expect( promise instanceof Promise ).toBe( true );
				promises.push( promise.then( spyNotExists ) );

				promise = documents.exists( "https://example.com/resource/error/" );
				expect( promise instanceof Promise ).toBe( true );
				promises.push( promise.catch( spyFail ) );

				Promise.all( promises ).then( ():void => {
					expect( spyExists ).toHaveBeenCalledTimes( 1 );
					expect( spyExists ).toHaveBeenCalledWith( true );

					expect( spyNotExists ).toHaveBeenCalledTimes( 1 );
					expect( spyNotExists ).toHaveBeenCalledWith( false );

					expect( spyFail ).toHaveBeenCalledTimes( 1 );
					expect( spyFail ).toHaveBeenCalledWith( jasmine.any( HTTPError ) );

					done();
				}, done.fail );
			} );

			describe( "When Documents has a specified context", ():void => {
				let documents:Documents;

				beforeEach( () => {
					const context:AbstractContext = new class extends AbstractContext {
						protected _baseURI:string;

						constructor() {
							super();
							this._baseURI = "https://example.com/";
						}
					}();
					documents = context.documents;
				} );

				it( "should reject promise if URI is not in the context base", ( done:DoneFn ):void => {
					const promise:Promise<any> = documents.exists( "http://not-example.com" );
					promise.then( () => {
						done.fail( "Should not resolve promise." );
					} ).catch( error => {
						expect( error.message ).toBe( `"http://not-example.com" isn't a valid URI for this Carbon instance.` );
						done();
					} );
				} );

				it( "should reject promise if prefixed URI cannot be resolved", ( done:DoneFn ):void => {
					const promise:Promise<any> = documents.exists( "prefix:the-uri" );
					promise.then( () => {
						done.fail( "Should not resolve promise." );
					} ).catch( error => {
						expect( error.message ).toBe( `The prefixed URI "prefix:the-uri" could not be resolved.` );
						done();
					} );
				} );

				it( "should call _parseErrorResponse when request error", ( done:DoneFn ):void => {
					jasmine.Ajax.stubRequest( "https://example.com/" ).andReturn( {
						status: 500,
						responseText: "",
					} );

					const error:Error = new Error( "Error message" );
					const spy:jasmine.Spy = spyOn( documents, "_parseErrorResponse" ).and.callFake( () => Promise.reject( error ) );

					documents.exists( "https://example.com/" ).then( () => {
						done.fail( "Should not resolve" );
					} ).catch( _error => {
						expect( spy ).toHaveBeenCalled();

						expect( _error ).toBeDefined();
						expect( _error ).toBe( error );

						done();
					} );
				} );

			} );

			describe( "When Documents does not have a context", ():void => {
				let documents:Documents;

				beforeEach( () => {
					documents = new Documents();
				} );

				it( "should reject if URI is relative", ( done:DoneFn ):void => {
					const promise:Promise<any> = documents.exists( "relative-uri/" );
					promise.then( () => {
						done.fail( "Should not resolve promise." );
					} ).catch( error => {
						expect( error.message ).toBe( "This Documents instance doesn't support relative URIs." );
						done();
					} );
				} );

				it( "should reject if URI is prefixed", ( done:DoneFn ):void => {
					const promise:Promise<any> = documents.exists( "prefix:the-uri" );
					promise.then( () => {
						done.fail( "Should not resolve promise." );
					} ).catch( error => {
						expect( error.message ).toBe( "This Documents instance doesn't support prefixed URIs." );
						done();
					} );
				} );

				it( "should call _parseErrorResponse when request error", ( done:DoneFn ):void => {
					jasmine.Ajax.stubRequest( "https://example.com/" ).andReturn( {
						status: 500,
						responseText: "",
					} );

					const error:Error = new Error( "Error message" );
					const spy:jasmine.Spy = spyOn( documents, "_parseErrorResponse" ).and.callFake( () => Promise.reject( error ) );

					documents.exists( "https://example.com/" ).then( () => {
						done.fail( "Should not resolve" );
					} ).catch( _error => {
						expect( spy ).toHaveBeenCalled();

						expect( _error ).toBeDefined();
						expect( _error ).toBe( error );

						done();
					} );
				} );

			} );

		} );


		describe( method( INSTANCE, "createChild" ), ():void => {

			it( hasSignature(
				[ "T extends object" ],
				"Persists JavaScript object as a child document for the respective parent source.", [
					{ name: "parentURI", type: "string", description: "URI of the document where to create a new child." },
					{ name: "childObject", type: "T", description: "A normal JavaScript object that will be converted and persisted as a new child document." },
					{ name: "requestOptions", type: "CarbonLDP.HTTP.RequestOptions", optional: true, description: "Customizable options for the request." },
				],
				{ type: "Promise<T & CarbonLDP.ProtectedDocument>" }
			), ():void => {} );

			it( hasSignature(
				[ "T extends object" ],
				"Persists JavaScript object as a child document for the respective parent source.", [
					{ name: "parentURI", type: "string", description: "URI of the document where to create a new child." },
					{ name: "childObject", type: "T", description: "A normal JavaScript object that will be converted and persisted as a new child document." },
					{ name: "slug", type: "string", optional: true, description: "Slug that will be used for the URI of the new child." },
					{ name: "requestOptions", type: "CarbonLDP.HTTP.RequestOptions", optional: true, description: "Customizable options for the request." },
				],
				{ type: "Promise<T & CarbonLDP.ProtectedDocument>" }
			), ():void => {} );

			it( isDefined(), ():void => {
				expect( Documents.prototype.createChild ).toBeDefined();
				expect( Documents.prototype.createChild ).toEqual( jasmine.any( Function ) );
			} );

			describe( "When Documents has a specified context", ():void => {

				let context:AbstractContext;
				let documents:Documents;
				beforeEach( ():void => {
					context = new class extends AbstractContext {
						_baseURI:string = "https://example.com/";
						settings:ContextSettings = { vocabulary: "https://example.com/ns#" };
					};
					documents = context.documents;
				} );

				it( "should reject promise if URI is not in the context base", ( done:DoneFn ):void => {
					const promise:Promise<any> = documents.createChild( "http://not-example.com", {} );
					promise.then( () => {
						done.fail( "Should not resolve promise." );
					} ).catch( error => {
						expect( error.message ).toBe( `"http://not-example.com" isn't a valid URI for this Carbon instance.` );
						done();
					} );
				} );

				it( "should reject promise if prefixed URI cannot be resolved", ( done:DoneFn ):void => {
					const promise:Promise<any> = documents.createChild( "prefix:the-uri", {} );
					promise.then( () => {
						done.fail( "Should not resolve promise." );
					} ).catch( error => {
						expect( error.message ).toBe( `The prefixed URI "prefix:the-uri" could not be resolved.` );
						done();
					} );
				} );

				it( "should sync the persisted blank nodes", async ( done:DoneFn ) => {
					jasmine.Ajax.stubRequest( "https://example.com/", null, "POST" ).andReturn( {
						status: 201,
						responseHeaders: {
							"Location": "https://example.com/new-resource/",
							"ETag": '"1234567890"',
						},
						responseText: `[
							{
								"@id": "_:responseMetadata",
								"@type": [
							        "${ C.VolatileResource }",
						            "${ C.ResponseMetadata }"
								],
								"${ C.documentMetadata }": [ {
									"@id": "_:documentMetadata"
								} ]
							},
							{
								"@id": "_:documentMetadata",
								"@type": [
						            "${ C.VolatileResource }",
						            "${ C.DocumentMetadata }"
								],
								"${ C.relatedDocument }": [ {
									"@id": "https://example.com/new-resource/"
								} ],
								"${ C.bNodesMap }": [ {
									"@id": "_:map"
								} ]
							},
							{
								"@id": "_:map",
								"@type": [ "${ C.Map }" ],
								"${ C.entry }": [
									{ "@id": "_:entry-1" },
									{ "@id": "_:entry-2" }
								]
							},
							{
								"@id": "_:entry-1",
								"${ C.entryKey }": [ {
								    "@id": "_:1"
							    } ],
								"${ C.entryValue }": [ {
									"@id": "_:new-1"
								} ]
							},
							{
								"@id": "_:entry-2",
								"${ C.entryKey }": [ {
									"@id": "_:2"
								} ],
								"${ C.entryValue }": [ {
									"@id": "_:new-2"
								} ]
							}
						]`,
					} );

					type RawBlankNode = Partial<TransientBlankNode> & { value:string };

					interface RawDocument {
						blankNode1:RawBlankNode;
						blankNode2:RawBlankNode;
					}

					const rawDocument:RawDocument = {
						blankNode1: {
							id: "_:1",
							value: "a value 1",
						},
						blankNode2: {
							id: "_:2",
							value: "a value 2",
						},
					};

					try {
						const document:Document & RawDocument = await documents.createChild<RawDocument>( "/", rawDocument );

						expect( document.blankNode1 ).toBe( rawDocument.blankNode1 );
						expect( document.blankNode1.id ).toBe( "_:new-1" );
						expect( document.blankNode1 ).toEqual( jasmine.objectContaining( {
							value: "a value 1",
						} ) );

						expect( document.blankNode2 ).toBe( rawDocument.blankNode2 );
						expect( document.blankNode2.id ).toBe( "_:new-2" );
						expect( document.blankNode2 ).toEqual( jasmine.objectContaining( {
							value: "a value 2",
						} ) );

						done();
					} catch( e ) {
						done.fail( e );
					}
				} );

				it( "should call _parseErrorResponse when request error", ( done:DoneFn ):void => {
					jasmine.Ajax.stubRequest( "https://example.com/" ).andReturn( {
						status: 500,
						responseText: "",
					} );

					const error:Error = new Error( "Error message" );
					const spy:jasmine.Spy = spyOn( documents, "_parseErrorResponse" ).and.callFake( () => Promise.reject( error ) );

					documents.createChild( "https://example.com/", {} ).then( () => {
						done.fail( "Should not resolve" );
					} ).catch( _error => {
						expect( spy ).toHaveBeenCalled();

						expect( _error ).toBeDefined();
						expect( _error ).toBe( error );

						done();
					} );
				} );


				it( "should convert plain object into document before request", ( done:DoneFn ):void => {
					const spy:jasmine.Spy = spyOn( TransientDocument, "createFrom" );
					spyOn( documents, "_persistDocument" as any ).and.returnValue( Promise.resolve( [] ) );

					const childObject:object = {};
					documents
						.createChild( "https://example.com/parent-resource/", childObject )
						.then( () => {
							expect( spy ).toHaveBeenCalledWith( childObject );

							done();
						} )
						.catch( done.fail );
				} );

				it( "should reject if document is already persisted", ( done:DoneFn ):void => {
					const childObject:Document = Document.decorate( { id: "https://example.com/some-resource/" }, documents );
					documents.createChild( "https://example.com/parent-resource/", childObject )
						.then( () => {
							done.fail( "Should not resolve" );
						} )
						.catch( error => {
							expect( error ).toEqual( jasmine.any( Errors.IllegalArgumentError ) );
							expect( error.message ).toEqual( "The child provided has been already persisted." );
							done();
						} )
					;
				} );

				it( "should process child into a valid persisted document", ( done:DoneFn ):void => {
					jasmine.Ajax.stubRequest( "https://example.com/parent-resource/", null, "POST" ).andReturn( {
						status: 200,
						responseHeaders: {
							"Location": "https://example.com/parent-resource/new-resource/",
						},
					} );

					const childObject:object = {};
					documents.createChild( "https://example.com/parent-resource/", childObject ).then( ( document:Document ):void => {
						expect( childObject ).toBe( document );

						expect( Document.is( document ) ).toBe( true );
						expect( document.id ).toBe( "https://example.com/parent-resource/new-resource/" );

						expect( document.isResolved() ).toBe( false );

						expect( documents.hasPointer( "parent-resource/new-resource/" ) ).toBe( true );

						done();
					} ).catch( done.fail );
				} );

				it( "should be able to resend failed child", ( done:DoneFn ):void => {
					jasmine.Ajax.stubRequest( "https://example.com/parent-resource/", null, "POST" ).andReturn( {
						status: 500,
					} );

					const childObject:object = {};

					documents.createChild( "https://example.com/parent-resource/", childObject )
						.catch( error => {
							expect( error ).toEqual( jasmine.any( Error ) );

							jasmine.Ajax.stubRequest( "https://example.com/parent-resource/", null, "POST" ).andReturn( {
								status: 200,
								responseHeaders: {
									"Location": "https://example.com/parent-resource/new-resource/",
								},
							} );

							return documents.createChild( "https://example.com/parent-resource/", childObject );
						} )
						.then( ( document:Document ):void => {
							expect( Document.is( document ) ).toBe( true );
							expect( document.id ).toBe( "https://example.com/parent-resource/new-resource/" );

							done();
						} )
						.catch( done.fail );
				} );

				it( "should send expected headers", ( done:DoneFn ):void => {
					jasmine.Ajax.stubRequest( "https://example.com/parent-resource/", null, "POST" ).andReturn( {
						status: 200,
						responseHeaders: {
							"Location": "https://example.com/parent-resource/new-resource/",
						},
					} );

					const childObject:object = {};

					documents.createChild( "https://example.com/parent-resource/", childObject )
						.then( ():void => {
							const request:JasmineAjaxRequest = jasmine.Ajax.requests.mostRecent();
							expect( request.requestHeaders ).toEqual( {
								"content-type": "application/ld+json",
								"accept": "application/ld+json",
								"prefer": [
									`return=minimal`,
									`${ LDP.Container }; rel=interaction-model`,
								].join( ", " ),
							} );

							done();
						} )
						.catch( done.fail );
				} );

				it( "should send expected headers with slug", ( done:DoneFn ):void => {
					jasmine.Ajax.stubRequest( "https://example.com/parent-resource/", null, "POST" ).andReturn( {
						status: 200,
						responseHeaders: {
							"Location": "https://example.com/parent-resource/new-resource/",
						},
					} );

					const childObject:object = {};

					documents.createChild( "https://example.com/parent-resource/", childObject, "child-slug" )
						.then( ():void => {
							const request:JasmineAjaxRequest = jasmine.Ajax.requests.mostRecent();
							expect( request.requestHeaders ).toEqual( {
								"content-type": "application/ld+json",
								"accept": "application/ld+json",
								"prefer": [
									`return=minimal`,
									`${ LDP.Container }; rel=interaction-model`,
								].join( ", " ),
								"slug": "child-slug",
							} );

							done();
						} )
						.catch( done.fail );
				} );

			} );

			describe( "When Documents does not have a context", ():void => {
				let documents:Documents;

				beforeEach( () => {
					documents = new Documents();
				} );

				it( "should reject if URI is relative", ( done:DoneFn ):void => {
					const promise:Promise<any> = documents.createChild( "relative-uri/", {} );
					promise.then( () => {
						done.fail( "Should not resolve promise." );
					} ).catch( error => {
						expect( error.message ).toBe( "This Documents instance doesn't support relative URIs." );
						done();
					} );
				} );

				it( "should reject if URI is prefixed", ( done:DoneFn ):void => {
					const promise:Promise<any> = documents.createChild( "prefix:the-uri", {} );
					promise.then( () => {
						done.fail( "Should not resolve promise." );
					} ).catch( error => {
						expect( error.message ).toBe( "This Documents instance doesn't support prefixed URIs." );
						done();
					} );
				} );

				it( "should call _parseErrorResponse when request error", ( done:DoneFn ):void => {
					jasmine.Ajax.stubRequest( "https://example.com/" ).andReturn( {
						status: 500,
						responseText: "",
					} );

					const error:Error = new Error( "Error message" );
					const spy:jasmine.Spy = spyOn( documents, "_parseErrorResponse" ).and.callFake( () => Promise.reject( error ) );

					documents.createChild( "https://example.com/", {} ).then( () => {
						done.fail( "Should not resolve" );
					} ).catch( _error => {
						expect( spy ).toHaveBeenCalled();

						expect( _error ).toBeDefined();
						expect( _error ).toBe( error );

						done();
					} );
				} );

			} );

		} );

		describe( method( INSTANCE, "createChildren" ), ():void => {

			it( hasSignature(
				[ "T extends object" ],
				"Persists multiple JavaScript objects as children of the parent document.", [
					{ name: "parentURI", type: "string", description: "URI of the document where to create a new child." },
					{ name: "childrenObjects", type: "T[]", description: "An array with the objects to be converted and persisted as new children of the parent document." },
					{ name: "requestOptions", type: "CarbonLDP.HTTP.RequestOptions", optional: true, description: "Customizable options for every the request." },
				],
				{ type: "Promise<(T & CarbonLDP.ProtectedDocument)[]>", description: "Promise that contains the new UNRESOLVED persisted children." }
			), ():void => {} );

			it( hasSignature(
				[ "T extends object" ],
				"Persists multiple JavaScript objects as children of the parent document.", [
					{ name: "parentURI", type: "string", description: "URI of the document where to create a new child." },
					{ name: "childrenObjects", type: "T[]", description: "An array with the objects to be converted and persisted as new children of the parent document." },
					{ name: "slugs", type: "string[]", optional: true, description: "Array with the slugs that corresponds to each object in `childrenObjects`, in the order in which they were defined. If an element in the array is undefined or null, the slug will be generated by the platform." },
					{ name: "requestOptions", type: "CarbonLDP.HTTP.RequestOptions", optional: true, description: "Customizable options for every the request." },
				],
				{ type: "Promise<(T & CarbonLDP.ProtectedDocument)[]>", description: "Promise that contains the new UNRESOLVED persisted children." }
			), ():void => {} );

			it( isDefined(), ():void => {
				expect( Documents.prototype.createChildren ).toBeDefined();
				expect( Documents.prototype.createChildren ).toEqual( jasmine.any( Function ) );
			} );

			describe( "When Documents has a specified context", ():void => {

				let context:AbstractContext;
				let documents:Documents;
				beforeEach( ():void => {
					context = new class extends AbstractContext {
						_baseURI:string = "https://example.com/";
						settings:ContextSettings = { vocabulary: "https://example.com/ns#" };
					};
					documents = context.documents;
				} );

				it( "should reject promise if URI is not in the context base", ( done:DoneFn ):void => {
					const promise:Promise<any> = documents.createChildren( "https://not-example.com", [ {} ] );
					promise.then( () => {
						done.fail( "Should not resolve promise." );
					} ).catch( error => {
						expect( error.message ).toBe( `"https://not-example.com" isn't a valid URI for this Carbon instance.` );
						done();
					} );
				} );

				it( "should reject promise if prefixed URI cannot be resolved", ( done:DoneFn ):void => {
					const promise:Promise<any> = documents.createChildren( "prefix:the-uri", [ {} ] );
					promise.then( () => {
						done.fail( "Should not resolve promise." );
					} ).catch( error => {
						expect( error.message ).toBe( `The prefixed URI "prefix:the-uri" could not be resolved.` );
						done();
					} );
				} );

				it( "should call _parseErrorResponse when request error", ( done:DoneFn ):void => {
					jasmine.Ajax.stubRequest( "https://example.com/" ).andReturn( {
						status: 500,
						responseText: "",
					} );

					const error:Error = new Error( "Error message" );
					const spy:jasmine.Spy = spyOn( documents, "_parseErrorResponse" ).and.callFake( () => Promise.reject( error ) );

					documents.createChildren( "https://example.com/", [ {} ] ).then( () => {
						done.fail( "Should not resolve" );
					} ).catch( _error => {
						expect( spy ).toHaveBeenCalled();

						expect( _error ).toBeDefined();
						expect( _error ).toBe( error );

						done();
					} );
				} );


				it( "should convert plain objects into documents before requests", ( done:DoneFn ):void => {
					const spy:jasmine.Spy = spyOn( TransientDocument, "createFrom" );
					spyOn( documents, "_persistDocument" as any ).and.returnValue( Promise.resolve( [] ) );

					const childObjects:object[] = [ { index: 1 }, { index: 2 }, { index: 3 } ];
					documents
						.createChildren( "https://example.com/parent-resource/", childObjects )
						.then( () => {
							expect( spy ).toHaveBeenCalledWith( childObjects[ 0 ] );
							expect( spy ).toHaveBeenCalledWith( childObjects[ 1 ] );
							expect( spy ).toHaveBeenCalledWith( childObjects[ 2 ] );

							done();
						} )
						.catch( done.fail );
				} );

				it( "should reject if any document is already persisted", ( done:DoneFn ):void => {
					const childObjects:(Document | object)[] = [
						{},
						Document.decorate( { id: "https://example.com/some-resource-1/" }, documents ),
						Document.decorate( { id: "https://example.com/some-resource-2/" }, documents ),
					];
					documents.createChildren( "https://example.com/parent-resource/", childObjects )
						.then( () => {
							done.fail( "Should not resolve" );
						} )
						.catch( error => {
							expect( error ).toEqual( jasmine.any( Errors.IllegalArgumentError ) );
							expect( error.message ).toEqual( "The child provided has been already persisted." );
							done();
						} )
					;
				} );

				it( "should process children into valid persisted documents", ( done:DoneFn ):void => {
					const childObjects:object[] = [ { index: 0 }, { index: 1 }, { index: 2 } ];

					documents.createChildren( "https://example.com/parent-resource/", childObjects )
						.then( ( persistedDocuments:Document[] ):void => {
							expect( persistedDocuments ).toEqual( new Array( 3 ).fill( jasmine.anything() ) );
							persistedDocuments.forEach( ( document, index ) => {
								expect( childObjects[ index ] ).toBe( document );

								expect( Document.is( document ) ).toBe( true );
								expect( document ).toEqual( jasmine.objectContaining( {
									_resolved: false,
									id: `https://example.com/parent-resource/new-resource-${ index }/`,
									index,
								} ) );
							} );

							done();
						} )
						.catch( done.fail );

					childObjects.forEach( ( childObject, index ) => {
						jasmine.Ajax.requests.at( index ).respondWith( {
							status: 200,
							responseHeaders: {
								"Location": `https://example.com/parent-resource/new-resource-${ index }/`,
							},
						} );
					} );
				} );

				it( "should send expected headers", ( done:DoneFn ):void => {
					const childObjects:object[] = [ { index: 0 }, { index: 1 }, { index: 2 } ];

					documents.createChildren( "https://example.com/parent-resource/", childObjects )
						.then( ():void => {
							childObjects.forEach( ( childObject, index ) => {
								const request:JasmineAjaxRequest = jasmine.Ajax.requests.at( index );
								expect( request.requestHeaders ).toEqual( {
									"content-type": "application/ld+json",
									"accept": "application/ld+json",
									"prefer": [
										`return=minimal`,
										`${ LDP.Container }; rel=interaction-model`,
									].join( ", " ),
								} );
							} );

							done();
						} )
						.catch( done.fail );

					childObjects.forEach( ( childObject, index ) => {
						jasmine.Ajax.requests.at( index ).respondWith( {
							status: 200,
							responseHeaders: {
								"Location": `https://example.com/parent-resource/new-resource-${ index }/`,
							},
						} );
					} );
				} );

				it( "should send expected headers with slug", ( done:DoneFn ):void => {
					const childObjects:object[] = [ { index: 0 }, { index: 1 }, { index: 2 } ];
					const slugs:string[] = [ "slug-1", null, "slug-3" ];

					documents.createChildren( "https://example.com/parent-resource/", childObjects, slugs )
						.then( ():void => {
							childObjects.forEach( ( childObject, index ) => {
								const request:JasmineAjaxRequest = jasmine.Ajax.requests.at( index );
								expect( request.requestHeaders ).toEqual( {
									"content-type": "application/ld+json",
									"accept": "application/ld+json",
									"prefer": [
										`return=minimal`,
										`${ LDP.Container }; rel=interaction-model`,
									].join( ", " ),
									...slugs[ index ] ? { slug: slugs[ index ] } : {},
								} );
							} );

							done();
						} )
						.catch( done.fail );

					childObjects.forEach( ( childObject, index ) => {
						jasmine.Ajax.requests.at( index ).respondWith( {
							status: 200,
							responseHeaders: {
								"Location": `https://example.com/parent-resource/new-resource-${ index }/`,
							},
						} );
					} );
				} );

			} );

			describe( "When Documents does not have a context", ():void => {
				let documents:Documents;

				beforeEach( () => {
					documents = new Documents();
				} );

				it( "should reject if URI is relative", ( done:DoneFn ):void => {
					const promise:Promise<any> = documents.createChildren( "relative-uri/", [ {} ] );
					promise.then( () => {
						done.fail( "Should not resolve promise." );
					} ).catch( error => {
						expect( error.message ).toBe( "This Documents instance doesn't support relative URIs." );
						done();
					} );
				} );

				it( "should reject if URI is prefixed", ( done:DoneFn ):void => {
					const promise:Promise<any> = documents.createChildren( "prefix:the-uri", [ {} ] );
					promise.then( () => {
						done.fail( "Should not resolve promise." );
					} ).catch( error => {
						expect( error.message ).toBe( "This Documents instance doesn't support prefixed URIs." );
						done();
					} );
				} );

				it( "should call _parseErrorResponse when request error", ( done:DoneFn ):void => {
					jasmine.Ajax.stubRequest( "https://example.com/" ).andReturn( {
						status: 500,
						responseText: "",
					} );

					const error:Error = new Error( "Error message" );
					const spy:jasmine.Spy = spyOn( documents, "_parseErrorResponse" ).and.callFake( () => Promise.reject( error ) );

					documents.createChildren( "https://example.com/", [ {} ] ).then( () => {
						done.fail( "Should not resolve" );
					} ).catch( _error => {
						expect( spy ).toHaveBeenCalled();

						expect( _error ).toBeDefined();
						expect( _error ).toBe( error );

						done();
					} );
				} );

			} );

		} );

		describe( method( INSTANCE, "createChildAndRetrieve" ), ():void => {

			it( hasSignature(
				[ "T extends object" ],
				"Persists JavaScript object as a child document for the respective parent source and retrieves the updated data from the server.", [
					{ name: "parentURI", type: "string", description: "URI of the document where to create a new child." },
					{ name: "childObject", type: "T", description: " A normal JavaScript object that will be converted and persisted as a new child document." },
					{ name: "requestOptions", type: "CarbonLDP.HTTP.RequestOptions", optional: true, description: "Customizable options for the request." },
				],
				{ type: "Promise<T & CarbonLDP.ProtectedDocument>" }
			), ():void => {} );

			it( hasSignature(
				[ "T extends object" ],
				"Persists JavaScript object as a child document for the respective parent source and retrieves the updated data from the server.", [
					{ name: "parentURI", type: "string", description: "URI of the document where to create a new child." },
					{ name: "childObject", type: "T", description: " A normal JavaScript object that will be converted and persisted as a new child document." },
					{ name: "slug", type: "string", optional: true, description: "Slug that will be used for the URI of the new child." },
					{ name: "requestOptions", type: "CarbonLDP.HTTP.RequestOptions", optional: true, description: "Customizable options for the request." },
				],
				{ type: "Promise<T & CarbonLDP.ProtectedDocument>" }
			), ():void => {} );

			it( isDefined(), ():void => {
				expect( Documents.prototype.createChildAndRetrieve ).toBeDefined();
				expect( Documents.prototype.createChildAndRetrieve ).toEqual( jasmine.any( Function ) );
			} );

			describe( "When Documents has a specified context", ():void => {

				let context:AbstractContext;
				let documents:Documents;
				beforeEach( ():void => {
					context = new class extends AbstractContext {
						_baseURI:string = "https://example.com/";
						settings:ContextSettings = { vocabulary: "https://example.com/ns#" };
					};
					documents = context.documents;
				} );

				it( "should reject promise if URI is not in the context base", ( done:DoneFn ):void => {
					const promise:Promise<any> = documents.createChildAndRetrieve( "https://not-example.com", {} );
					promise.then( () => {
						done.fail( "Should not resolve promise." );
					} ).catch( error => {
						expect( error.message ).toBe( `"https://not-example.com" isn't a valid URI for this Carbon instance.` );
						done();
					} );
				} );

				it( "should reject promise if prefixed URI cannot be resolved", ( done:DoneFn ):void => {
					const promise:Promise<any> = documents.createChildAndRetrieve( "prefix:the-uri", {} );
					promise.then( () => {
						done.fail( "Should not resolve promise." );
					} ).catch( error => {
						expect( error.message ).toBe( `The prefixed URI "prefix:the-uri" could not be resolved.` );
						done();
					} );
				} );

				it( "should sync the persisted blank nodes and update document", async ( done:DoneFn ) => {
					jasmine.Ajax.stubRequest( "https://example.com/", null, "POST" ).andReturn( {
						status: 201,
						responseHeaders: {
							"Location": "https://example.com/new-resource/",
							"Preference-Applied": "return=representation",
							"ETag": '"1234567890"',
						},
						responseText: `[
							{
								"@id": "_:responseMetadata",
								"@type": [
						            "${ C.VolatileResource }",
						            "${ C.ResponseMetadata }"
								],
								"${ C.documentMetadata }": [ {
									"@id": "_:documentMetadata"
								} ]
							},
							{
								"@id": "_:documentMetadata",
								"@type": [
						            "${ C.VolatileResource }",
						            "${ C.DocumentMetadata }"
								],
								"${ C.relatedDocument }": [ {
									"@id": "https://example.com/new-resource/"
								} ],
								"${ C.bNodesMap }": [ {
									"@id": "_:map"
								} ]
							},
							{
								"@id": "_:map",
								"@type": [ "${ C.Map }" ],
								"${ C.entry }": [
									{ "@id": "_:entry-1" },
									{ "@id": "_:entry-2" }
								]
							},
							{
								"@id": "_:entry-1",
								"${ C.entryKey }": [ {
								    "@id": "_:1"
							    } ],
								"${ C.entryValue }": [ {
									"@id": "_:new-1"
								} ]
							},
							{
								"@id": "_:entry-2",
								"${ C.entryKey }": [ {
									"@id": "_:2"
								} ],
								"${ C.entryValue }": [ {
									"@id": "_:new-2"
								} ]
							},
							{
								"@id": "https://example.com/new-resource/",
								"@graph": [
									{
										"@id": "_:new-1",
										"https://example.com/ns#value": [ {
											"@value": "a new value 1"
										} ]
									},
									{
										"@id": "_:new-2",
										"https://example.com/ns#value": [ {
											"@value": "a new value 2"
										} ]
									},
									{
										"@id": "https://example.com/new-resource/",
										"https://example.com/ns#blankNode1": [ {
											"@id": "_:new-1"
										} ],
										"https://example.com/ns#blankNode2": [ {
											"@id": "_:new-2"
										} ]
									}
								]
							}
						]`,
					} );

					type RawBlankNode = Partial<TransientBlankNode> & { value:string };

					interface RawDocument {
						blankNode1:RawBlankNode;
						blankNode2:RawBlankNode;
					}

					const rawDocument:RawDocument = {
						blankNode1: {
							id: "_:1",
							value: "a value 1",
						},
						blankNode2: {
							id: "_:2",
							value: "a value 2",
						},
					};

					try {
						const document:Document & RawDocument = await documents.createChildAndRetrieve<RawDocument>( "/", rawDocument );

						expect( document.getFragments().length ).toBe( 2 );

						expect( document.blankNode1 ).toBe( rawDocument.blankNode1 );
						expect( document.blankNode1.id ).toBe( "_:new-1" );
						expect( document.blankNode1 ).toEqual( jasmine.objectContaining( {
							value: "a new value 1",
						} ) );

						expect( document.blankNode2 ).toBe( rawDocument.blankNode2 );
						expect( document.blankNode2.id ).toBe( "_:new-2" );
						expect( document.blankNode2 ).toEqual( jasmine.objectContaining( {
							value: "a new value 2",
						} ) );

						done();
					} catch( e ) {
						done.fail( e );
					}
				} );

				it( "should call _parseErrorResponse when request error", ( done:DoneFn ):void => {
					jasmine.Ajax.stubRequest( "https://example.com/" ).andReturn( {
						status: 500,
						responseText: "",
					} );

					const error:Error = new Error( "Error message" );
					const spy:jasmine.Spy = spyOn( documents, "_parseErrorResponse" ).and.callFake( () => Promise.reject( error ) );

					documents.createChildAndRetrieve( "https://example.com/", {} ).then( () => {
						done.fail( "Should not resolve" );
					} ).catch( _error => {
						expect( spy ).toHaveBeenCalled();

						expect( _error ).toBeDefined();
						expect( _error ).toBe( error );

						done();
					} );
				} );


				it( "should convert plain object into document before request", ( done:DoneFn ):void => {
					const spy:jasmine.Spy = spyOn( TransientDocument, "createFrom" );
					spyOn( documents, "_persistDocument" as any ).and.returnValue( Promise.resolve( [] ) );

					const childObject:object = {};
					documents
						.createChildAndRetrieve( "https://example.com/parent-resource/", childObject )
						.then( () => {
							expect( spy ).toHaveBeenCalledWith( childObject );

							done();
						} )
						.catch( done.fail );
				} );

				it( "should reject if document is already persisted", ( done:DoneFn ):void => {
					const childObject:Document = Document.decorate( { id: "https://example.com/some-resource/" }, documents );
					documents.createChildAndRetrieve( "https://example.com/parent-resource/", childObject )
						.then( () => {
							done.fail( "Should not resolve" );
						} )
						.catch( error => {
							expect( error ).toEqual( jasmine.any( Errors.IllegalArgumentError ) );
							expect( error.message ).toEqual( "The child provided has been already persisted." );
							done();
						} )
					;
				} );

				it( "should process the children and the returned data", ( done:DoneFn ):void => {
					jasmine.Ajax.stubRequest( "https://example.com/parent-resource/", null, "POST" ).andReturn( {
						status: 201,
						responseHeaders: {
							"Location": "https://example.com/parent-resource/new-resource/",
							"Preference-Applied": "return=representation",
							"ETag": '"1-12345"',
						},
						responseText: `{
							"@id": "https://example.com/parent-resource/new-resource/",
							"@graph": [
								{
									"@id": "https://example.com/parent-resource/new-resource/",
									"https://example.com/ns#property": [ { "@value": "my UPDATED property" } ],
									"https://example.com/ns#namedFragment": [ { "@id": "https://example.com/parent-resource/new-resource/#namedFragment" } ]
								},
								{
									"@id": "https://example.com/parent-resource/new-resource/#namedFragment",
									"https://example.com/ns#property": [ { "@value": "UPDATED named fragment property" } ]
								}
							]
						}`,
					} );

					const namedFragment:object = {
						slug: "#namedFragment",
						property: "Named fragment property",
					};
					const childObject:object = {
						property: "my property",
						namedFragment: namedFragment,
					};

					documents.createChildAndRetrieve( "https://example.com/parent-resource/", childObject )
						.then( ( document:Document ) => {
							expect( childObject ).toBe( document );
							expect( document ).toEqual( jasmine.objectContaining( {
								_eTag: "\"1-12345\"",
								_resolved: true,
								id: "https://example.com/parent-resource/new-resource/",
								property: "my UPDATED property",
								namedFragment: jasmine.objectContaining( {
									property: "UPDATED named fragment property",
								} ),
							} ) );

							// Keep reference with the fragment
							expect( childObject[ "namedFragment" ] ).toBe( namedFragment );

							done();
						} )
						.catch( done.fail );
				} );

				it( "should be able to resend failed child", ( done:DoneFn ):void => {
					jasmine.Ajax.stubRequest( "https://example.com/parent-resource/", null, "POST" ).andReturn( {
						status: 500,
					} );

					const childObject:object = {};

					documents.createChildAndRetrieve( "https://example.com/parent-resource/", childObject )
						.catch( error => {
							expect( error ).toEqual( jasmine.any( Error ) );

							jasmine.Ajax.stubRequest( "https://example.com/parent-resource/", null, "POST" ).andReturn( {
								status: 201,
								responseHeaders: {
									"Location": "https://example.com/parent-resource/new-resource/",
									"Preference-Applied": "return=representation",
									"ETag": '"1-12345"',
								},
								responseText: `{
									"@id": "https://example.com/parent-resource/new-resource/",
									"@graph": [
										{
											"@id": "https://example.com/parent-resource/new-resource/",
											"https://example.com/ns#property": [ { "@value": "my UPDATED property" } ],
											"https://example.com/ns#namedFragment": [ { "@id": "https://example.com/parent-resource/new-resource/#namedFragment" } ]
										},
										{
											"@id": "https://example.com/parent-resource/new-resource/#namedFragment",
											"https://example.com/ns#property": [ { "@value": "UPDATED named fragment property" } ]
										}
									]
								}`,
							} );

							return documents.createChildAndRetrieve( "https://example.com/parent-resource/", childObject );
						} )
						.then( ( document:Document ):void => {
							expect( document ).toEqual( jasmine.objectContaining( {
								_eTag: "\"1-12345\"",
								id: "https://example.com/parent-resource/new-resource/",
								property: "my UPDATED property",
								namedFragment: jasmine.objectContaining( {
									property: "UPDATED named fragment property",
								} ),
							} ) );

							done();
						} )
						.catch( done.fail );
				} );

				it( "should send expected headers", ( done:DoneFn ):void => {
					jasmine.Ajax.stubRequest( "https://example.com/parent-resource/", null, "POST" ).andReturn( {
						status: 200,
						responseHeaders: {
							"Location": "https://example.com/parent-resource/new-resource/",
						},
					} );

					const childObject:object = {};

					documents.createChildAndRetrieve( "https://example.com/parent-resource/", childObject )
						.then( ():void => {
							const request:JasmineAjaxRequest = jasmine.Ajax.requests.mostRecent();
							expect( request.requestHeaders ).toEqual( {
								"content-type": "application/ld+json",
								"accept": "application/ld+json",
								"prefer": [
									`return=representation`,
									`${ LDP.Container }; rel=interaction-model`,
								].join( ", " ),
							} );

							done();
						} )
						.catch( done.fail );
				} );

				it( "should send expected headers with slug", ( done:DoneFn ):void => {
					jasmine.Ajax.stubRequest( "https://example.com/parent-resource/", null, "POST" ).andReturn( {
						status: 200,
						responseHeaders: {
							"Location": "https://example.com/parent-resource/new-resource/",
						},
					} );

					const childObject:object = {};

					documents.createChildAndRetrieve( "https://example.com/parent-resource/", childObject, "child-slug" )
						.then( ():void => {
							const request:JasmineAjaxRequest = jasmine.Ajax.requests.mostRecent();
							expect( request.requestHeaders ).toEqual( {
								"content-type": "application/ld+json",
								"accept": "application/ld+json",
								"prefer": [
									`return=representation`,
									`${ LDP.Container }; rel=interaction-model`,
								].join( ", " ),
								"slug": "child-slug",
							} );

							done();
						} )
						.catch( done.fail );
				} );

			} );

			describe( "When Documents does not have a context", ():void => {
				let documents:Documents;

				beforeEach( () => {
					documents = new Documents();
				} );

				it( "should reject if URI is relative", ( done:DoneFn ):void => {
					const promise:Promise<any> = documents.createChildAndRetrieve( "relative-uri/", {} );
					promise.then( () => {
						done.fail( "Should not resolve promise." );
					} ).catch( error => {
						expect( error.message ).toBe( "This Documents instance doesn't support relative URIs." );
						done();
					} );
				} );

				it( "should reject if URI is prefixed", ( done:DoneFn ):void => {
					const promise:Promise<any> = documents.createChildAndRetrieve( "prefix:the-uri", {} );
					promise.then( () => {
						done.fail( "Should not resolve promise." );
					} ).catch( error => {
						expect( error.message ).toBe( "This Documents instance doesn't support prefixed URIs." );
						done();
					} );
				} );

				it( "should call _parseErrorResponse when request error", ( done:DoneFn ):void => {
					jasmine.Ajax.stubRequest( "https://example.com/" ).andReturn( {
						status: 500,
						responseText: "",
					} );

					const error:Error = new Error( "Error message" );
					const spy:jasmine.Spy = spyOn( documents, "_parseErrorResponse" ).and.callFake( () => Promise.reject( error ) );

					documents.createChildAndRetrieve( "https://example.com/", {} ).then( () => {
						done.fail( "Should not resolve" );
					} ).catch( _error => {
						expect( spy ).toHaveBeenCalled();

						expect( _error ).toBeDefined();
						expect( _error ).toBe( error );

						done();
					} );
				} );

			} );

		} );

		describe( method( INSTANCE, "createChildrenAndRetrieve" ), ():void => {

			it( hasSignature(
				[ "T extends object" ],
				"Persists multiple JavaScript objects as children of the parent document and retrieves the updated data from the server.", [
					{ name: "parentURI", type: "string", description: "URI of the document where to create a new child." },
					{ name: "childrenObjects", type: "T[]", description: "An array with the objects to be converted and persisted as new children of the parent document." },
					{ name: "requestOptions", type: "CarbonLDP.HTTP.RequestOptions", optional: true, description: "Customizable options for every the request." },
				],
				{ type: "Promise<(T & CarbonLDP.ProtectedDocument)[]>", description: "Promise that contains the new and resolved persisted children." }
			), ():void => {} );

			it( hasSignature(
				[ "T extends object" ],
				"Persists multiple JavaScript objects as children of the parent document and retrieves the updated data from the server.", [
					{ name: "parentURI", type: "string", description: "URI of the document where to create a new child." },
					{ name: "childrenObjects", type: "T[]", description: "An array with the objects to be converted and persisted as new children of the parent document." },
					{ name: "slugs", type: "string[]", optional: true, description: "Array with the slugs that corresponds to each object in `childrenObjects`, in the order in which they were defined. If an element in the array is undefined or null, the slug will be generated by the platform." },
					{ name: "requestOptions", type: "CarbonLDP.HTTP.RequestOptions", optional: true, description: "Customizable options for every the request." },
				],
				{ type: "Promise<(T & CarbonLDP.ProtectedDocument)[]>", description: "Promise that contains the new and resolved persisted children." }
			), ():void => {} );

			it( isDefined(), ():void => {
				expect( Documents.prototype.createChildrenAndRetrieve ).toBeDefined();
				expect( Documents.prototype.createChildrenAndRetrieve ).toEqual( jasmine.any( Function ) );
			} );

			describe( "When Documents has a specified context", ():void => {

				let context:AbstractContext;
				let documents:Documents;
				beforeEach( ():void => {
					context = new class extends AbstractContext {
						_baseURI:string = "https://example.com/";
						settings:ContextSettings = { vocabulary: "https://example.com/ns#" };
					};
					documents = context.documents;
				} );

				it( "should reject promise if URI is not in the context base", ( done:DoneFn ):void => {
					const promise:Promise<any> = documents.createChildrenAndRetrieve( "https://not-example.com", [ {} ] );
					promise.then( () => {
						done.fail( "Should not resolve promise." );
					} ).catch( error => {
						expect( error.message ).toBe( `"https://not-example.com" isn't a valid URI for this Carbon instance.` );
						done();
					} );
				} );

				it( "should reject promise if prefixed URI cannot be resolved", ( done:DoneFn ):void => {
					const promise:Promise<any> = documents.createChildrenAndRetrieve( "prefix:the-uri", [ {} ] );
					promise.then( () => {
						done.fail( "Should not resolve promise." );
					} ).catch( error => {
						expect( error.message ).toBe( `The prefixed URI "prefix:the-uri" could not be resolved.` );
						done();
					} );
				} );

				it( "should call _parseErrorResponse when request error", ( done:DoneFn ):void => {
					jasmine.Ajax.stubRequest( "https://example.com/" ).andReturn( {
						status: 500,
						responseText: "",
					} );

					const error:Error = new Error( "Error message" );
					const spy:jasmine.Spy = spyOn( documents, "_parseErrorResponse" ).and.callFake( () => Promise.reject( error ) );

					documents.createChildrenAndRetrieve( "https://example.com/", [ {} ] ).then( () => {
						done.fail( "Should not resolve" );
					} ).catch( _error => {
						expect( spy ).toHaveBeenCalled();

						expect( _error ).toBeDefined();
						expect( _error ).toBe( error );

						done();
					} );
				} );


				it( "should convert plain objects into documents before requests", ( done:DoneFn ):void => {
					const spy:jasmine.Spy = spyOn( TransientDocument, "createFrom" );
					spyOn( documents, "_persistDocument" as any ).and.returnValue( Promise.resolve( [] ) );

					const childObjects:object[] = [ { index: 1 }, { index: 2 }, { index: 3 } ];
					documents
						.createChildrenAndRetrieve( "https://example.com/parent-resource/", childObjects )
						.then( () => {
							expect( spy ).toHaveBeenCalledWith( childObjects[ 0 ] );
							expect( spy ).toHaveBeenCalledWith( childObjects[ 1 ] );
							expect( spy ).toHaveBeenCalledWith( childObjects[ 2 ] );

							done();
						} )
						.catch( done.fail );
				} );

				it( "should reject if any document is already persisted", ( done:DoneFn ):void => {
					const childObjects:(Document | object)[] = [
						{},
						Document.decorate( { id: "https://example.com/some-resource-1/" }, documents ),
						Document.decorate( { id: "https://example.com/some-resource-2/" }, documents ),
					];
					documents.createChildrenAndRetrieve( "https://example.com/parent-resource/", childObjects )
						.then( () => {
							done.fail( "Should not resolve" );
						} )
						.catch( error => {
							expect( error ).toEqual( jasmine.any( Errors.IllegalArgumentError ) );
							expect( error.message ).toEqual( "The child provided has been already persisted." );
							done();
						} )
					;
				} );

				it( "should process then children and the returned data", ( done:DoneFn ):void => {
					const childObjects:object[] = [ { index: 0 }, { index: 1 }, { index: 2 } ];

					documents.createChildrenAndRetrieve( "https://example.com/parent-resource/", childObjects )
						.then( ( persistedDocuments:Document[] ):void => {
							expect( persistedDocuments ).toEqual( new Array( 3 ).fill( jasmine.anything() ) );
							persistedDocuments.forEach( ( document, index ) => {
								expect( childObjects[ index ] ).toBe( document );

								expect( Document.is( document ) ).toBe( true );
								expect( document ).toEqual( jasmine.objectContaining( {
									_resolved: true,
									_eTag: `"${ index }-12345"`,
									id: `https://example.com/parent-resource/new-resource-${ index }/`,
									index: `updated ${ index }`,
									property: "my UPDATED property",
									namedFragment: jasmine.objectContaining( {
										property: "UPDATED named fragment property",
									} ),
								} ) );
							} );

							done();
						} )
						.catch( done.fail );

					childObjects.forEach( ( childObject, index ) => {
						jasmine.Ajax.requests.at( index ).respondWith( {
							status: 201,
							responseHeaders: {
								"Location": `https://example.com/parent-resource/new-resource-${ index }/`,
								"Preference-Applied": "return=representation",
								"ETag": `"${ index }-12345"`,
							},
							responseText: `{
								"@id": "https://example.com/parent-resource/new-resource-${ index }/",
								"@graph": [
									{
										"@id": "https://example.com/parent-resource/new-resource-${ index }/",
										"https://example.com/ns#property": [ { "@value": "my UPDATED property" } ],
										"https://example.com/ns#namedFragment": [ { "@id": "https://example.com/parent-resource/new-resource-${ index }/#namedFragment" } ],
										"https://example.com/ns#index": [ { "@value": "updated ${ index }" } ]
									},
									{
										"@id": "https://example.com/parent-resource/new-resource-${ index }/#namedFragment",
										"https://example.com/ns#property": [ { "@value": "UPDATED named fragment property" } ]
									}
								]
							}`,
						} );
					} );
				} );

				it( "should send expected headers", ( done:DoneFn ):void => {
					const childObjects:object[] = [ { index: 0 }, { index: 1 }, { index: 2 } ];

					documents.createChildrenAndRetrieve( "https://example.com/parent-resource/", childObjects )
						.then( ():void => {
							childObjects.forEach( ( childObject, index ) => {
								const request:JasmineAjaxRequest = jasmine.Ajax.requests.at( index );
								expect( request.requestHeaders ).toEqual( {
									"content-type": "application/ld+json",
									"accept": "application/ld+json",
									"prefer": [
										`return=representation`,
										`${ LDP.Container }; rel=interaction-model`,
									].join( ", " ),
								} );
							} );

							done();
						} )
						.catch( done.fail );

					childObjects.forEach( ( childObject, index ) => {
						jasmine.Ajax.requests.at( index ).respondWith( {
							status: 201,
							responseHeaders: {
								"Location": `https://example.com/parent-resource/new-resource-${ index }/`,
								"Preference-Applied": "return=representation",
								"ETag": `"${ index }-12345"`,
							},
							responseText: `{
								"@id": "https://example.com/parent-resource/new-resource-${ index }/",
								"@graph": [
									{
										"@id": "https://example.com/parent-resource/new-resource-${ index }/",
										"https://example.com/ns#property": [ { "@value": "my UPDATED property" } ],
										"https://example.com/ns#namedFragment": [ { "@id": "https://example.com/parent-resource/new-resource-${ index }/#namedFragment" } ],
										"https://example.com/ns#index": [ { "@value": "updated ${ index }" } ]
									},
									{
										"@id": "https://example.com/parent-resource/new-resource-${ index }/#namedFragment",
										"https://example.com/ns#property": [ { "@value": "UPDATED named fragment property" } ]
									}
								]
							}`,
						} );
					} );
				} );

				it( "should send expected headers with slug", ( done:DoneFn ):void => {
					const childObjects:object[] = [ { index: 0 }, { index: 1 }, { index: 2 } ];
					const slugs:string[] = [ "slug-1", null, "slug-3" ];

					documents.createChildrenAndRetrieve( "https://example.com/parent-resource/", childObjects, slugs )
						.then( ():void => {
							childObjects.forEach( ( childObject, index ) => {
								const request:JasmineAjaxRequest = jasmine.Ajax.requests.at( index );
								expect( request.requestHeaders ).toEqual( {
									"content-type": "application/ld+json",
									"accept": "application/ld+json",
									"prefer": [
										`return=representation`,
										`${ LDP.Container }; rel=interaction-model`,
									].join( ", " ),
									...slugs[ index ] ? { slug: slugs[ index ] } : {},
								} );
							} );

							done();
						} )
						.catch( done.fail );

					childObjects.forEach( ( childObject, index ) => {
						jasmine.Ajax.requests.at( index ).respondWith( {
							status: 201,
							responseHeaders: {
								"Location": `https://example.com/parent-resource/new-resource-${ index }/`,
								"Preference-Applied": "return=representation",
								"ETag": `"${ index }-12345"`,
							},
							responseText: `{
								"@id": "https://example.com/parent-resource/new-resource-${ index }/",
								"@graph": [
									{
										"@id": "https://example.com/parent-resource/new-resource-${ index }/",
										"https://example.com/ns#property": [ { "@value": "my UPDATED property" } ],
										"https://example.com/ns#namedFragment": [ { "@id": "https://example.com/parent-resource/new-resource-${ index }/#namedFragment" } ],
										"https://example.com/ns#index": [ { "@value": "updated ${ index }" } ]
									},
									{
										"@id": "https://example.com/parent-resource/new-resource-${ index }/#namedFragment",
										"https://example.com/ns#property": [ { "@value": "UPDATED named fragment property" } ]
									}
								]
							}`,
						} );
					} );
				} );

			} );

			describe( "When Documents does not have a context", ():void => {
				let documents:Documents;

				beforeEach( () => {
					documents = new Documents();
				} );

				it( "should reject if URI is relative", ( done:DoneFn ):void => {
					const promise:Promise<any> = documents.createChildrenAndRetrieve( "relative-uri/", [ {} ] );
					promise.then( () => {
						done.fail( "Should not resolve promise." );
					} ).catch( error => {
						expect( error.message ).toBe( "This Documents instance doesn't support relative URIs." );
						done();
					} );
				} );

				it( "should reject if URI is prefixed", ( done:DoneFn ):void => {
					const promise:Promise<any> = documents.createChildrenAndRetrieve( "prefix:the-uri", [ {} ] );
					promise.then( () => {
						done.fail( "Should not resolve promise." );
					} ).catch( error => {
						expect( error.message ).toBe( "This Documents instance doesn't support prefixed URIs." );
						done();
					} );
				} );

				it( "should call _parseErrorResponse when request error", ( done:DoneFn ):void => {
					jasmine.Ajax.stubRequest( "https://example.com/" ).andReturn( {
						status: 500,
						responseText: "",
					} );

					const error:Error = new Error( "Error message" );
					const spy:jasmine.Spy = spyOn( documents, "_parseErrorResponse" ).and.callFake( () => Promise.reject( error ) );

					documents.createChildrenAndRetrieve( "https://example.com/", [ {} ] ).then( () => {
						done.fail( "Should not resolve" );
					} ).catch( _error => {
						expect( spy ).toHaveBeenCalled();

						expect( _error ).toBeDefined();
						expect( _error ).toBe( error );

						done();
					} );
				} );

			} );

		} );


		describe( method( INSTANCE, "listChildren" ), () => {

			it( hasSignature(
				[ "T extends object" ],
				"Retrieves the empty children of a document.", [
					{ name: "parentURI", type: "string", description: "URI of the document from where to look for its children." },
					{ name: "requestOptions", type: "CarbonLDP.HTTP.RequestOptions", optional: true, description: "Customizable options for the request." },
				],
				{ type: "Promise<(T & CarbonLDP.Document)[]>" }
			), () => {} );

			it( isDefined(), () => {
				expect( Documents.prototype.listChildren ).toBeDefined();
				expect( Documents.prototype.listChildren ).toEqual( jasmine.any( Function ) );
			} );

			describe( "When Documents has a specified context", ():void => {

				let context:AbstractContext;
				let documents:Documents;
				beforeEach( () => {
					context = new class extends AbstractContext {
						_baseURI:string = "https://example.com/";
						settings:ContextSettings = { vocabulary: "https://example.com/ns#" };
					};
					documents = context.documents;
				} );

				it( "should reject promise if URI is not in the context base", ( done:DoneFn ):void => {
					const promise:Promise<any> = documents.listChildren( "http://not-example.com" );
					promise.then( () => {
						done.fail( "Should not resolve promise." );
					} ).catch( error => {
						expect( error.message ).toBe( `"http://not-example.com" isn't a valid URI for this Carbon instance.` );
						done();
					} );
				} );

				it( "should reject promise if prefixed URI cannot be resolved", ( done:DoneFn ):void => {
					const promise:Promise<any> = documents.listChildren( "prefix:the-uri" );
					promise.then( () => {
						done.fail( "Should not resolve promise." );
					} ).catch( error => {
						expect( error.message ).toBe( `The prefixed URI "prefix:the-uri" could not be resolved.` );
						done();
					} );
				} );

				it( "should call _parseErrorResponse when request error", ( done:DoneFn ):void => {
					jasmine.Ajax.stubRequest( "https://example.com/" ).andReturn( {
						status: 500,
						responseText: "",
					} );

					const error:Error = new Error( "Error message" );
					const spy:jasmine.Spy = spyOn( documents, "_parseErrorResponse" ).and.callFake( () => Promise.reject( error ) );

					documents.listChildren( "https://example.com/" ).then( () => {
						done.fail( "Should not resolve" );
					} ).catch( _error => {
						expect( spy ).toHaveBeenCalled();

						expect( _error ).toBeDefined();
						expect( _error ).toBe( error );

						done();
					} );
				} );


				it( "should send a CONSTRUCT query", ( done:DoneFn ):void => {
					const sendSpy:jasmine.Spy = spyOn( documents, "executeRawCONSTRUCTQuery" )
						.and.returnValue( Promise.reject( null ) );

					documents.listChildren( "https://example.com/resource/" )
						.then( () => done.fail( "Should not resolve, spy is makes it fail." ) )
						.catch( ( error ) => {
							if( error ) done.fail( error );

							expect( sendSpy ).toHaveBeenCalledWith(
								"https://example.com/resource/",

								"CONSTRUCT {" +
								` ?metadata a <${ C.VolatileResource }>, <${ C.QueryMetadata }>;` +
								"" + ` <${ C.target }> ?child.` +

								" ?child a ?child__types " +

								"} WHERE {" +
								" BIND(BNODE() AS ?metadata)." +

								" {" +
								"" + " SELECT DISTINCT ?child WHERE {" +
								"" + "" + ` <https://example.com/resource/> <${ LDP.contains }> ?child` +
								"" + " }" +
								" }." +

								" OPTIONAL { ?child a ?child__types } " +

								"}",

								jasmine.objectContaining( {
									headers: new Map( [
										[ "prefer", new Header( [
											`include="${ C.PreferResultsContext }"`,
										] ) ],
									] ),
								} )
							);
							done();
						} );
				} );

				it( "should return the children", ( done:DoneFn ):void => {
					jasmine.Ajax.stubRequest( "https://example.com/resource/" ).andReturn( {
						status: 200,
						responseText: `[ {
							"@id":"_:1",
							"@type": [
								"${ C.VolatileResource }",
								"${ C.QueryMetadata }"
							],
							"${ C.target }": [ {
								"@id":"https://example.com/resource/child1/"
							} ]
						}, {
							"@id":"_:2",
							"@type": [
								"${ C.VolatileResource }",
								"${ C.QueryMetadata }"
							],
							"${ C.target }": [ {
								"@id":"https://example.com/resource/child2/"
							} ]
						}, {
							"@id": "https://example.com/resource/child1/",
							"@graph": [ {
								"@id": "https://example.com/resource/child1/",
								"@type": [
									"${ C.Document }",
									"https://example.com/ns#Resource",
									"${ LDP.BasicContainer }",
									"${ LDP.RDFSource }"
								]
							} ]
						}, {
							"@id": "https://example.com/resource/child2/",
							"@graph": [ {
								"@id": "https://example.com/resource/child2/",
								"@type": [
									"${ C.Document }",
									"https://example.com/ns#Resource",
									"${ LDP.BasicContainer }",
									"${ LDP.RDFSource }"
								]
							} ]
						} ]`,
					} );

					documents
						.listChildren( "https://example.com/resource/" )
						.then( ( myDocuments ) => {
							expect( myDocuments ).toEqual( jasmine.any( Array ) );
							expect( myDocuments.length ).toBe( 2 );

							expect( Document.is( myDocuments[ 0 ] ) ).toBe( true );
							expect( myDocuments[ 0 ] ).toEqual( jasmine.objectContaining( {
								"_eTag": void 0,
								"_resolved": false,
								"types": [
									`${ C.Document }`,
									`https://example.com/ns#Resource`,
									`${ LDP.BasicContainer }`,
									`${ LDP.RDFSource }`,
								],
							} ) );

							expect( Document.is( myDocuments[ 1 ] ) ).toBe( true );
							expect( myDocuments[ 1 ] ).toEqual( jasmine.objectContaining( {
								"_eTag": void 0,
								"_resolved": false,
								"types": [
									`${ C.Document }`,
									`https://example.com/ns#Resource`,
									`${ LDP.BasicContainer }`,
									`${ LDP.RDFSource }`,
								],
							} ) );

							done();
						} )
						.catch( done.fail );
				} );

				it( "should NOT return partial children", ( done:DoneFn ):void => {
					jasmine.Ajax.stubRequest( "https://example.com/resource/" ).andReturn( {
						status: 200,
						responseText: `[ {
							"@id":"_:1",
							"@type": [
								"${ C.VolatileResource }",
								"${ C.QueryMetadata }"
							],
							"${ C.target }": [ {
								"@id":"https://example.com/resource/child1/"
							} ]
						}, {
							"@id":"_:2",
							"@type": [
								"${ C.VolatileResource }",
								"${ C.QueryMetadata }"
							],
							"${ C.target }": [ {
								"@id":"https://example.com/resource/child2/"
							} ]
						}, {
							"@id": "https://example.com/resource/child1/",
							"@graph": [ {
								"@id": "https://example.com/resource/child1/",
								"@type": [
									"${ C.Document }",
									"https://example.com/ns#Resource",
									"${ LDP.BasicContainer }",
									"${ LDP.RDFSource }"
								]
							} ]
						}, {
							"@id": "https://example.com/resource/child2/",
							"@graph": [ {
								"@id": "https://example.com/resource/child2/",
								"@type": [
									"${ C.Document }",
									"https://example.com/ns#Resource",
									"${ LDP.BasicContainer }",
									"${ LDP.RDFSource }"
								]
							} ]
						} ]`,
					} );

					documents
						.listChildren( "https://example.com/resource/" )
						.then( ( myDocuments ) => {
							expect( myDocuments ).toEqual( jasmine.any( Array ) );
							expect( myDocuments.length ).toBe( 2 );

							expect( Document.is( myDocuments[ 0 ] ) ).toBe( true );
							expect( myDocuments[ 0 ].isPartial() ).toBe( false );

							expect( Document.is( myDocuments[ 1 ] ) ).toBe( true );
							expect( myDocuments[ 1 ].isPartial() ).toBe( false );

							done();
						} )
						.catch( done.fail );
				} );

			} );

			describe( "When Documents does not have a context", ():void => {

				let documents:Documents;
				beforeEach( () => {
					documents = new Documents();
				} );

				it( "should reject if URI is relative", ( done:DoneFn ):void => {
					const promise:Promise<any> = documents.listChildren( "relative-uri/" );
					promise.then( () => {
						done.fail( "Should not resolve promise." );
					} ).catch( error => {
						expect( error.message ).toBe( "This Documents instance doesn't support relative URIs." );
						done();
					} );
				} );

				it( "should reject if URI is prefixed", ( done:DoneFn ):void => {
					const promise:Promise<any> = documents.listChildren( "prefix:the-uri" );
					promise.then( () => {
						done.fail( "Should not resolve promise." );
					} ).catch( error => {
						expect( error.message ).toBe( "This Documents instance doesn't support prefixed URIs." );
						done();
					} );
				} );

				it( "should call _parseErrorResponse when request error", ( done:DoneFn ):void => {
					jasmine.Ajax.stubRequest( "https://example.com/" ).andReturn( {
						status: 500,
						responseText: "",
					} );

					const error:Error = new Error( "Error message" );
					const spy:jasmine.Spy = spyOn( documents, "_parseErrorResponse" ).and.callFake( () => Promise.reject( error ) );

					documents.listChildren( "https://example.com/" ).then( () => {
						done.fail( "Should not resolve" );
					} ).catch( _error => {
						expect( spy ).toHaveBeenCalled();

						expect( _error ).toBeDefined();
						expect( _error ).toBe( error );

						done();
					} );
				} );


				it( "should send a CONSTRUCT query", ( done:DoneFn ):void => {
					const sendSpy:jasmine.Spy = spyOn( documents, "executeRawCONSTRUCTQuery" )
						.and.returnValue( Promise.reject( null ) );

					documents.listChildren( "https://example.com/resource/" )
						.then( () => done.fail( "Should not resolve, spy is makes it fail." ) )
						.catch( ( error ) => {
							if( error ) done.fail( error );

							expect( sendSpy ).toHaveBeenCalledWith(
								"https://example.com/resource/",

								"CONSTRUCT {" +
								` ?metadata a <${ C.VolatileResource }>, <${ C.QueryMetadata }>;` +
								"" + ` <${ C.target }> ?child.` +

								" ?child a ?child__types " +

								"} WHERE {" +
								" BIND(BNODE() AS ?metadata)." +

								" {" +
								"" + " SELECT DISTINCT ?child WHERE {" +
								"" + "" + ` <https://example.com/resource/> <${ LDP.contains }> ?child` +
								"" + " }" +
								" }." +

								" OPTIONAL { ?child a ?child__types } " +

								"}",

								jasmine.objectContaining( {
									headers: new Map( [
										[ "prefer", new Header( [
											`include="${ C.PreferResultsContext }"`,
										] ) ],
									] ),
								} )
							);
							done();
						} );
				} );

				it( "should return the children", ( done:DoneFn ):void => {
					jasmine.Ajax.stubRequest( "https://example.com/resource/" ).andReturn( {
						status: 200,
						responseText: `[ {
							"@id":"_:1",
							"@type": [
								"${ C.VolatileResource }",
								"${ C.QueryMetadata }"
							],
							"${ C.target }": [ {
								"@id":"https://example.com/resource/child1/"
							} ]
						}, {
							"@id":"_:2",
							"@type": [
								"${ C.VolatileResource }",
								"${ C.QueryMetadata }"
							],
							"${ C.target }": [ {
								"@id":"https://example.com/resource/child2/"
							} ]
						}, {
							"@id": "https://example.com/resource/child1/",
							"@graph": [ {
								"@id": "https://example.com/resource/child1/",
								"@type": [
									"${ C.Document }",
									"https://example.com/ns#Resource",
									"${ LDP.BasicContainer }",
									"${ LDP.RDFSource }"
								]
							} ]
						}, {
							"@id": "https://example.com/resource/child2/",
							"@graph": [ {
								"@id": "https://example.com/resource/child2/",
								"@type": [
									"${ C.Document }",
									"https://example.com/ns#Resource",
									"${ LDP.BasicContainer }",
									"${ LDP.RDFSource }"
								]
							} ]
						} ]`,
					} );

					documents
						.listChildren( "https://example.com/resource/" )
						.then( ( myDocuments ) => {
							expect( myDocuments ).toEqual( jasmine.any( Array ) );
							expect( myDocuments.length ).toBe( 2 );

							expect( Document.is( myDocuments[ 0 ] ) ).toBe( true );
							expect( myDocuments[ 0 ] ).toEqual( jasmine.objectContaining( {
								"_eTag": void 0,
								"_resolved": false,
								"types": [
									`${ C.Document }`,
									`https://example.com/ns#Resource`,
									`${ LDP.BasicContainer }`,
									`${ LDP.RDFSource }`,
								],
							} ) );

							expect( Document.is( myDocuments[ 0 ] ) ).toBe( true );
							expect( myDocuments[ 1 ] ).toEqual( jasmine.objectContaining( {
								"_eTag": void 0,
								"_resolved": false,
								"types": [
									`${ C.Document }`,
									`https://example.com/ns#Resource`,
									`${ LDP.BasicContainer }`,
									`${ LDP.RDFSource }`,
								],
							} ) );

							done();
						} )
						.catch( done.fail );
				} );

				it( "should NOT return partial children", ( done:DoneFn ):void => {
					jasmine.Ajax.stubRequest( "https://example.com/resource/" ).andReturn( {
						status: 200,
						responseText: `[ {
							"@id":"_:1",
							"@type": [
								"${ C.VolatileResource }",
								"${ C.QueryMetadata }"
							],
							"${ C.target }": [ {
								"@id":"https://example.com/resource/child1/"
							} ]
						}, {
							"@id":"_:2",
							"@type": [
								"${ C.VolatileResource }",
								"${ C.QueryMetadata }"
							],
							"${ C.target }": [ {
								"@id":"https://example.com/resource/child2/"
							} ]
						}, {
							"@id": "https://example.com/resource/child1/",
							"@graph": [ {
								"@id": "https://example.com/resource/child1/",
								"@type": [
									"${ C.Document }",
									"https://example.com/ns#Resource",
									"${ LDP.BasicContainer }",
									"${ LDP.RDFSource }"
								]
							} ]
						}, {
							"@id": "https://example.com/resource/child2/",
							"@graph": [ {
								"@id": "https://example.com/resource/child2/",
								"@type": [
									"${ C.Document }",
									"https://example.com/ns#Resource",
									"${ LDP.BasicContainer }",
									"${ LDP.RDFSource }"
								]
							} ]
						} ]`,
					} );

					documents
						.listChildren( "https://example.com/resource/" )
						.then( ( myDocuments ) => {
							expect( myDocuments ).toEqual( jasmine.any( Array ) );
							expect( myDocuments.length ).toBe( 2 );

							expect( Document.is( myDocuments[ 0 ] ) ).toBe( true );
							expect( myDocuments[ 0 ].isPartial() ).toBe( false );

							expect( Document.is( myDocuments[ 1 ] ) ).toBe( true );
							expect( myDocuments[ 1 ].isPartial() ).toBe( false );

							done();
						} )
						.catch( done.fail );
				} );

			} );

		} );

		describe( method( INSTANCE, "getChildren" ), () => {

			it( hasSignature(
				[ "T extends object" ],
				"Retrieves the children of a document, building a query on which one is able to specify the properties to be retrieve and sub-documents' properties and on and on.", [
					{ name: "parentURI", type: "string", description: "URI of the document from where to look for its children." },
					{ name: "requestOptions", type: "CarbonLDP.HTTP.RequestOptions", optional: true, description: "Customizable options for the request." },
					{ name: "queryBuilderFn", type: "( queryBuilder:CarbonLDP.SPARQL.QueryDocument.QueryDocumentsBuilder ) => CarbonLDP.SPARQL.QueryDocument.QueryDocumentsBuilder", optional: true, description: "Function that receives a the builder that helps you to construct the children retrieval query.\nThe same builder must be returned." },
				],
				{ type: "Promise<(T & CarbonLDP.Document)[]>" }
			), () => {} );

			it( hasSignature(
				[ "T extends object" ],
				"Retrieves the children of a document, building a query on which one is able to specify the properties to be retrieve and sub-documents' properties and on and on.", [
					{ name: "parentURI", type: "string", description: "URI of the document from where to look for its children." },
					{ name: "queryBuilderFn", type: "( queryBuilder:CarbonLDP.SPARQL.QueryDocument.QueryDocumentsBuilder ) => CarbonLDP.SPARQL.QueryDocument.QueryDocumentsBuilder", optional: true, description: "Function that receives a the builder that helps you to construct the children retrieval query.\nThe same builder must be returned." },
				],
				{ type: "Promise<(T & CarbonLDP.Document)[]>" }
			), () => {} );

			it( isDefined(), () => {
				expect( Documents.prototype.getChildren ).toBeDefined();
				expect( Documents.prototype.getChildren ).toEqual( jasmine.any( Function ) );
			} );

			describe( "When Documents has a specified context", ():void => {

				let context:AbstractContext;
				let documents:Documents;
				beforeEach( () => {
					context = new class extends AbstractContext {
						_baseURI:string = "https://example.com/";
						settings:ContextSettings = { vocabulary: "https://example.com/ns#" };
					};
					documents = context.documents;
				} );

				it( "should reject promise if URI is not in the context base", ( done:DoneFn ):void => {
					const promise:Promise<any> = documents.getChildren( "http://not-example.com" );
					promise.then( () => {
						done.fail( "Should not resolve promise." );
					} ).catch( error => {
						expect( error.message ).toBe( `"http://not-example.com" isn't a valid URI for this Carbon instance.` );
						done();
					} );
				} );

				it( "should reject promise if prefixed URI cannot be resolved", ( done:DoneFn ):void => {
					const promise:Promise<any> = documents.getChildren( "prefix:the-uri" );
					promise.then( () => {
						done.fail( "Should not resolve promise." );
					} ).catch( error => {
						expect( error.message ).toBe( `The prefixed URI "prefix:the-uri" could not be resolved.` );
						done();
					} );
				} );

				it( "should call _parseErrorResponse when request error", ( done:DoneFn ):void => {
					jasmine.Ajax.stubRequest( "https://example.com/" ).andReturn( {
						status: 500,
						responseText: "",
					} );

					const error:Error = new Error( "Error message" );
					const spy:jasmine.Spy = spyOn( documents, "_parseErrorResponse" ).and.callFake( () => Promise.reject( error ) );

					documents.getChildren( "https://example.com/" ).then( () => {
						done.fail( "Should not resolve" );
					} ).catch( _error => {
						expect( spy ).toHaveBeenCalled();

						expect( _error ).toBeDefined();
						expect( _error ).toBe( error );

						done();
					} );
				} );


				it( "should send a partial construct query", ( done:DoneFn ):void => {
					interface MyDocument {
						property1:string;
						property2:{};
					}

					context.extendObjectSchema( {
						"schema": "https://schema.org/",
					} );
					context.extendObjectSchema( "Resource", {
						"property1": {
							"@id": "property-1",
							"@type": XSD.string,
						},
						"property2": {
							"@id": "property-2",
							"@type": XSD.integer,
						},
						"property3": {
							"@id": "https://schema.org/property-3",
							"@type": XSD.string,
						},
					} );

					const sendSpy:jasmine.Spy = spyOn( documents, "executeRawCONSTRUCTQuery" ).and.returnValue( Promise.reject( null ) );

					documents.getChildren<MyDocument>( "https://example.com/resource/", _ => _
						.withType( "Resource" )
						.properties( {
							"property1": _.inherit,
							"property2": {
								"@id": "https://schema.org/property-2",
								"@type": "@id",
								"query": __ => __.properties( {
									"property2": __.inherit,
									"property3": __.inherit,
								} ),
							},
						} )
						.orderBy( "property2" )
						.limit( 10 )
						.offset( 5 )
					).then( () => done.fail( "Should not resolve, spy is makes it fail." ) ).catch( ( error ) => {
						if( error ) done.fail( error );

						expect( sendSpy ).toHaveBeenCalledWith(
							"https://example.com/resource/",
							"PREFIX schema: <https://schema.org/> " +
							"CONSTRUCT {" +
							` ?metadata a <${ C.VolatileResource }>, <${ C.QueryMetadata }>;` +
							"" + ` <${ C.target }> ?child.` +

							" ?child a ?child__types;" +
							"" + " <https://example.com/ns#property-1> ?child__property1;" +
							"" + " schema:property-2 ?child__property2." +

							" ?child__property2 a ?child__property2__types;" +
							"" + " <https://example.com/ns#property-2> ?child__property2__property2;" +
							"" + " schema:property-3 ?child__property2__property3 " +

							"} WHERE {" +
							" BIND(BNODE() AS ?metadata)." +

							" {" +
							"" + " SELECT DISTINCT ?child WHERE {" +
							"" + "" + " <https://example.com/resource/> <http://www.w3.org/ns/ldp#contains> ?child." +
							"" + "" + " OPTIONAL { ?child schema:property-2 ?child__property2 }" +
							"" + " }" +
							"" + " ORDER BY ?child__property2" +
							"" + " LIMIT 10" +
							"" + " OFFSET 5" +
							" }." +

							" OPTIONAL { ?child a ?child__types }." +
							" ?child a <https://example.com/ns#Resource>." +

							" OPTIONAL {" +
							"" + " ?child <https://example.com/ns#property-1> ?child__property1." +
							"" + " FILTER( datatype( ?child__property1 ) = <http://www.w3.org/2001/XMLSchema#string> )" +
							" }." +

							" OPTIONAL {" +
							"" + " ?child schema:property-2 ?child__property2." +
							"" + " FILTER( ! isLiteral( ?child__property2 ) )." +
							"" + " OPTIONAL { ?child__property2 a ?child__property2__types }." +

							"" + " OPTIONAL {" +
							"" + "" + " ?child__property2 <https://example.com/ns#property-2> ?child__property2__property2." +
							"" + "" + " FILTER( datatype( ?child__property2__property2 ) = <http://www.w3.org/2001/XMLSchema#integer> )" +
							"" + " }." +

							"" + " OPTIONAL {" +
							"" + "" + " ?child__property2 schema:property-3 ?child__property2__property3." +
							"" + "" + " FILTER( datatype( ?child__property2__property3 ) = <http://www.w3.org/2001/XMLSchema#string> )" +
							"" + " }" +
							" } " +
							"}",

							jasmine.objectContaining( {
								headers: new Map( [
									[ "prefer", new Header( [
										`include="${ C.PreferDocumentETags }"`,
										`include="${ C.PreferResultsContext }"`,
									] ) ],
								] ),
							} )
						);
						done();
					} );
				} );

				it( "should send a full construct query", ( done:DoneFn ):void => {
					interface MyDocument {
						property1:string;
						property2:{};
					}

					context.extendObjectSchema( "Resource", {
						"property1": {
							"@id": "property-1",
							"@type": XSD.string,
						},
						"property2": {
							"@id": "property-2",
							"@type": XSD.integer,
						},
						"property3": {
							"@id": "https://schema.org/property-3",
							"@type": XSD.string,
						},
					} );

					const sendSpy:jasmine.Spy = spyOn( documents, "executeRawCONSTRUCTQuery" ).and.returnValue( Promise.reject( null ) );

					documents.getChildren<MyDocument>( "https://example.com/resource/" )
						.then( () => done.fail( "Should not resolve, spy is makes it fail." ) )
						.catch( ( error ) => {
							if( error ) done.fail( error );

							expect( sendSpy ).toHaveBeenCalledWith(
								"https://example.com/resource/",
								"CONSTRUCT {" +
								` ?metadata a <${ C.VolatileResource }>, <${ C.QueryMetadata }>;` +
								"" + ` <${ C.target }> ?child.` +

								" ?child___subject ?child___predicate ?child___object " +

								"} WHERE {" +
								" BIND(BNODE() AS ?metadata)." +

								" {" +
								"" + " SELECT DISTINCT ?child WHERE {" +
								"" + "" + " <https://example.com/resource/> <http://www.w3.org/ns/ldp#contains> ?child" +
								"" + " }" +
								" }." +

								" GRAPH ?child {" +
								"" + " ?child___subject ?child___predicate ?child___object" +
								" } " +

								"}",

								jasmine.objectContaining( {
									headers: new Map( [
										[ "prefer", new Header( [
											`include="${ C.PreferDocumentETags }"`,
											`include="${ C.PreferResultsContext }"`,
										] ) ],
									] ),
								} )
							);
							done();
						} );
				} );

				it( "should send a filtered .ALL construct query", ( done:DoneFn ):void => {
					interface MyDocument {
						property1:string;
						property2:{};
					}

					context.extendObjectSchema( {
						"schema": "https://schema.org/",
					} );
					context.extendObjectSchema( "Resource", {
						"property1": {
							"@id": "https://schema.org/property-1",
							"@type": XSD.string,
						},
						"property2": {
							"@id": "https://schema.org/property-2",
							"@type": XSD.integer,
						},
					} );

					const sendSpy:jasmine.Spy = spyOn( documents, "executeRawCONSTRUCTQuery" ).and.returnValue( Promise.reject( null ) );

					documents.getChildren<MyDocument>( "https://example.com/resource/", _ => {
						return _
							.properties( _.all )
							.orderBy( "property2" )
							.limit( 10 )
							.offset( 5 )
							;
					} )
						.then( () => done.fail( "Should not resolve, spy is makes it fail." ) )
						.catch( ( error ) => {
							if( error ) done.fail( error );

							expect( sendSpy ).toHaveBeenCalledWith(
								"https://example.com/resource/",
								"PREFIX schema: <https://schema.org/> " +
								"CONSTRUCT {" +
								` ?metadata a <${ C.VolatileResource }>, <${ C.QueryMetadata }>;` +
								"" + ` <${ C.target }> ?child.` +

								" ?child ?child___predicate ?child___object " +

								"} WHERE {" +
								" BIND(BNODE() AS ?metadata)." +

								" {" +
								"" + " SELECT DISTINCT ?child WHERE {" +
								"" + "" + " <https://example.com/resource/> <http://www.w3.org/ns/ldp#contains> ?child." +
								"" + "" + " OPTIONAL { ?child schema:property-2 ?child__property2 }" +
								"" + " }" +
								"" + " ORDER BY ?child__property2" +
								"" + " LIMIT 10" +
								"" + " OFFSET 5" +
								" }." +

								" ?child ?child___predicate ?child___object." +

								" OPTIONAL {" +
								"" + " ?child schema:property-2 ?child__property2." +
								"" + " FILTER( datatype( ?child__property2 ) = <http://www.w3.org/2001/XMLSchema#integer> )" +
								" }" +

								" " +
								"}",

								jasmine.objectContaining( {
									headers: new Map( [
										[ "prefer", new Header( [
											`include="${ C.PreferDocumentETags }"`,
											`include="${ C.PreferResultsContext }"`,
										] ) ],
									] ),
								} )
							);
							done();
						} );
				} );

				it( "should send a correct filtered construct query", ( done:DoneFn ):void => {
					interface MyDocument {
						property1:string;
						property2:{};
					}

					context.extendObjectSchema( {
						"schema": "https://schema.org/",
						"ex": "https://example.com/ns#",
						"xsd": XSD.namespace,
					} );
					context.extendObjectSchema( "Resource", {
						"property1": {
							"@id": "property-1",
							"@type": XSD.string,
						},
						"property2": {
							"@id": "property-2",
							"@type": XSD.integer,
						},
						"property3": {
							"@id": "https://schema.org/property-3",
							"@type": XSD.string,
						},
					} );

					spyOn( documents, "executeRawCONSTRUCTQuery" ).and.returnValue( Promise.reject( null ) );

					const queryTokenClass:{ new( ...args:any[] ) } = QueryToken;
					let query:QueryToken;
					spyOn( TokensModule, "QueryToken" ).and.callFake( ( ...args:any[] ) => {
						return query = new queryTokenClass( ...args );
					} );

					documents.getChildren<MyDocument>( "https://example.com/resource/", _ => _
						.withType( "Resource" )
						.properties( {
							"property1": _.inherit,
							"property2": {
								"@id": "https://schema.org/property-2",
								"@type": "@id",
								"query": __ => __
									.properties( {
										"property2": {
											"query": ___ => ___
												.values( ___.value( 12345 ).withType( "integer" ) )
											,
										},
										"property3": __.inherit,
									} )
									.filter( `${ __.property( "property2" ) } = ${ __.value( 12345 ).withType( "integer" ) }` )
								,
							},
						} )
						.orderBy( "property2" )
						.limit( 10 )
						.offset( 5 )
					).then( () => done.fail( "Should not resolve, spy is makes it fail." ) ).catch( ( error ) => {
						if( error ) done.fail( error );

						const variableHelper:( name:string ) => VariableToken = name => {
							return jasmine.objectContaining( {
								token: "variable",
								name,
							} ) as any;
						};

						expect( query ).toEqual( new QueryToken(
							new ConstructToken()
								.addTriple( new SubjectToken( variableHelper( "metadata" ) )
									.addPredicate( new PredicateToken( "a" )
										.addObject( new IRIToken( C.VolatileResource ) )
										.addObject( new IRIToken( C.QueryMetadata ) )
									)
									.addPredicate( new PredicateToken( new IRIToken( C.target ) )
										.addObject( variableHelper( "child" ) )
									)
								)
								.addTriple( new SubjectToken( variableHelper( "child" ) )
									.addPredicate( new PredicateToken( "a" )
										.addObject( variableHelper( "child__types" ) )
									)
									.addPredicate( new PredicateToken( new PrefixedNameToken( "ex:property-1" ) )
										.addObject( variableHelper( "child__property1" ) )
									)
									.addPredicate( new PredicateToken( new PrefixedNameToken( "schema:property-2" ) )
										.addObject( variableHelper( "child__property2" ) )
									)
								)
								.addTriple( new SubjectToken( variableHelper( "child__property2" ) )
									.addPredicate( new PredicateToken( "a" )
										.addObject( variableHelper( "child__property2__types" ) )
									)
									.addPredicate( new PredicateToken( new PrefixedNameToken( "ex:property-2" ) )
										.addObject( variableHelper( "child__property2__property2" ) )
									)
									.addPredicate( new PredicateToken( new PrefixedNameToken( "schema:property-3" ) )
										.addObject( variableHelper( "child__property2__property3" ) )
									)
								)

								.addPattern( new BindToken( "BNODE()", variableHelper( "metadata" ) ) )
								.addPattern( new SelectToken( "DISTINCT" )
									.addVariable( variableHelper( "child" ) )
									.addPattern( new SubjectToken( new IRIToken( "https://example.com/resource/" ) )
										.addPredicate( new PredicateToken( new IRIToken( LDP.contains ) )
											.addObject( variableHelper( "child" ) )
										)
									)
									.addPattern( new OptionalToken()
										.addPattern( new SubjectToken( variableHelper( "child" ) )
											.addPredicate( new PredicateToken( new PrefixedNameToken( "schema:property-2" ) )
												.addObject( variableHelper( "child__property2" ) )
											)
										)
									)
									.addModifier( new OrderToken( variableHelper( "child__property2" ) ) )
									.addModifier( new LimitToken( 10 ) )
									.addModifier( new OffsetToken( 5 ) )
								)
								.addPattern(
									new OptionalToken()
										.addPattern( new SubjectToken( variableHelper( "child" ) )
											.addPredicate( new PredicateToken( "a" )
												.addObject( variableHelper( "child__types" ) )
											)
										)
								)
								.addPattern( new SubjectToken( variableHelper( "child" ) )
									.addPredicate( new PredicateToken( "a" )
										.addObject( new PrefixedNameToken( "ex:Resource" ) )
									)
								)
								.addPattern(
									new OptionalToken()
										.addPattern( new SubjectToken( variableHelper( "child" ) )
											.addPredicate( new PredicateToken( new PrefixedNameToken( "ex:property-1" ) )
												.addObject( variableHelper( "child__property1" ) )
											)
										)
										.addPattern( new FilterToken( "datatype( ?child__property1 ) = xsd:string" ) )
								)
								.addPattern( new FilterToken( `?child__property2__property2 = "12345"^^xsd:integer` ) )
								.addPattern( new SubjectToken( variableHelper( "child" ) )
									.addPredicate( new PredicateToken( new PrefixedNameToken( "schema:property-2" ) )
										.addObject( variableHelper( "child__property2" ) )
									)
								)
								.addPattern( new FilterToken( "! isLiteral( ?child__property2 )" ) )
								.addPattern( new OptionalToken()
									.addPattern( new SubjectToken( variableHelper( "child__property2" ) )
										.addPredicate( new PredicateToken( "a" )
											.addObject( variableHelper( "child__property2__types" ) )
										)
									)
								)
								.addPattern( new SubjectToken( variableHelper( "child__property2" ) )
									.addPredicate( new PredicateToken( new PrefixedNameToken( "ex:property-2" ) )
										.addObject( variableHelper( "child__property2__property2" ) )
									)
								)
								.addPattern( new FilterToken( "datatype( ?child__property2__property2 ) = xsd:integer" ) )
								.addPattern( new ValuesToken()
									.addValues(
										variableHelper( "child__property2__property2" ),
										new LiteralToken( 12345 ).setType( "xsd:integer" )
									)
								)
								.addPattern( new OptionalToken()
									.addPattern( new SubjectToken( variableHelper( "child__property2" ) )
										.addPredicate( new PredicateToken( new PrefixedNameToken( "schema:property-3" ) )
											.addObject( variableHelper( "child__property2__property3" ) )
										)
									)
									.addPattern( new FilterToken( "datatype( ?child__property2__property3 ) = xsd:string" ) )
								)
							)

								.addPrologues( new PrefixToken( "ex", new IRIToken( "https://example.com/ns#" ) ) )
								.addPrologues( new PrefixToken( "xsd", new IRIToken( XSD.namespace ) ) )
								.addPrologues( new PrefixToken( "schema", new IRIToken( "https://schema.org/" ) ) )
						);

						done();
					} );
				} );

				it( "should order returned children", ( done:DoneFn ):void => {
					jasmine.Ajax.stubRequest( "https://example.com/resource/" ).andReturn( {
						status: 200,
						responseText: `[ {
							"@id":"_:1",
							"@type": [
								"${ C.VolatileResource }",
								"${ C.QueryMetadata }"
							],
							"${ C.target }": [ {
								"@id":"${ context.baseURI }resource/child1/"
							} ]
						}, {
							"@id":"_:2",
							"@type": [
								"${ C.VolatileResource }",
								"${ C.QueryMetadata }"
							],
							"${ C.target }": [ {
								"@id":"${ context.baseURI }resource/child2/"
							} ]
						}, {
							"@id": "_:3",
							"@type": [
								"${ C.ResponseMetadata }",
								"${ C.VolatileResource }"
							],
							"${ C.documentMetadata }": [ {
								"@id": "_:4"
							}, {
								"@id": "_:5"
							} ]
						}, {
							"@id": "_:4",
							"@type": [
								"${ C.DocumentMetadata }",
								"${ C.VolatileResource }"
							],
							"${ C.eTag }": [ {
								"@value": "\\"1-12345\\""
							} ],
							"${ C.relatedDocument }": [ {
								"@id": "https://example.com/resource/child1/"
							} ]
						}, {
							"@id": "_:5",
							"@type": [
								"${ C.DocumentMetadata }",
								"${ C.VolatileResource }"
							],
							"${ C.eTag }": [ {
								"@value": "\\"2-12345\\""
							} ],
							"${ C.relatedDocument }": [ {
								"@id": "https://example.com/resource/child2/"
							} ]
						}, {
							"@id": "${ context.baseURI }resource/child1/",
							"@graph": [ {
								"@id": "${ context.baseURI }resource/child1/",
								"@type": [
									"${ C.Document }",
									"https://example.com/ns#Resource",
									"${ LDP.BasicContainer }",
									"${ LDP.RDFSource }"
								],
								"https://example.com/ns#property-1": [ {
									"@value": "value 1"
								} ],
								"https://schema.org/property-2": [ {
									"@id": "_:1"
								} ]
							}, {
								"@id": "_:1",
								"https://example.com/ns#property-2": [ {
									"@value": "12345",
									"@type": "${ XSD.integer }"
								} ],
								"https://schema.org/property-3": [ {
									"@value": "another value 1"
								} ]
							} ]
						}, {
							"@id": "${ context.baseURI }resource/child2/",
							"@graph": [ {
								"@id": "${ context.baseURI }resource/child2/",
								"@type": [
									"${ C.Document }",
									"https://example.com/ns#Resource",
									"${ LDP.BasicContainer }",
									"${ LDP.RDFSource }"
								],
								"https://example.com/ns#property-1": [ {
									"@value": "value 2"
								} ],
								"https://schema.org/property-2": [ {
									"@id": "_:2"
								} ]
							}, {
								"@id": "_:2",
								"https://example.com/ns#property-2": [ {
									"@value": "67890",
									"@type": "${ XSD.integer }"
								} ],
								"https://schema.org/property-3": [ {
									"@value": "another value 2"
								} ]
							} ]
						} ]`,
					} );

					interface MyDocument {
						property1:string;
						property2:{
							property2:number;
							property3:string;
						};
					}

					context.extendObjectSchema( {
						"schema": "https://schema.org/",
					} );
					context.extendObjectSchema( "Resource", {
						"property1": {
							"@id": "property-1",
							"@type": XSD.string,
						},
						"property2": {
							"@id": "property-2",
							"@type": XSD.integer,
						},
						"property3": {
							"@id": "https://schema.org/property-3",
							"@type": XSD.string,
						},
					} );

					documents.getChildren<MyDocument>( "https://example.com/resource/", _ => _
						.withType( "Resource" )
						.properties( {
							"property1": _.inherit,
							"property2": {
								"@id": "https://schema.org/property-2",
								"@type": "@id",
								"query": __ => __.properties( {
									"property2": __.inherit,
									"property3": __.inherit,
								} ),
							},
						} )
						.orderBy( "property2.property2", "DESC" )
					).then( ( myDocuments ) => {
						expect( myDocuments[ 0 ] ).toEqual( jasmine.objectContaining( {
							"property2": jasmine.objectContaining( {
								"property2": 67890,
							} ) as any,
						} ) );
						expect( myDocuments[ 1 ] ).toEqual( jasmine.objectContaining( {
							"property2": jasmine.objectContaining( {
								"property2": 12345,
							} ) as any,
						} ) );

						done();
					} ).catch( done.fail );
				} );

				it( "should return full children", ( done:DoneFn ):void => {
					jasmine.Ajax.stubRequest( "https://example.com/resource/" ).andReturn( {
						status: 200,
						responseText: `[ {
							"@id":"_:1",
							"@type": [
								"${ C.VolatileResource }",
								"${ C.QueryMetadata }"
							],
							"${ C.target }": [ {
								"@id":"${ context.baseURI }resource/child1/"
							} ]
						}, {
							"@id":"_:2",
							"@type": [
								"${ C.VolatileResource }",
								"${ C.QueryMetadata }"
							],
							"${ C.target }": [ {
								"@id":"${ context.baseURI }resource/child2/"
							} ]
						}, {
							"@id": "_:3",
							"@type": [
								"${ C.ResponseMetadata }",
								"${ C.VolatileResource }"
							],
							"${ C.documentMetadata }": [ {
								"@id": "_:4"
							}, {
								"@id": "_:5"
							} ]
						}, {
							"@id": "_:4",
							"@type": [
								"${ C.DocumentMetadata }",
								"${ C.VolatileResource }"
							],
							"${ C.eTag }": [ {
								"@value": "\\"1-12345\\""
							} ],
							"${ C.relatedDocument }": [ {
								"@id": "https://example.com/resource/child1/"
							} ]
						}, {
							"@id": "_:5",
							"@type": [
								"${ C.DocumentMetadata }",
								"${ C.VolatileResource }"
							],
							"${ C.eTag }": [ {
								"@value": "\\"2-12345\\""
							} ],
							"${ C.relatedDocument }": [ {
								"@id": "https://example.com/resource/child2/"
							} ]
						}, {
							"@id": "${ context.baseURI }resource/child1/",
							"@graph": [ {
								"@id": "${ context.baseURI }resource/child1/",
								"@type": [
									"${ C.Document }",
									"https://schema.org/Resource",
									"${ LDP.BasicContainer }",
									"${ LDP.RDFSource }"
								],
								"https://schema.org/property-1": [ {
									"@value": "value 1"
								} ],
								"https://schema.org/property-2": [ {
									"@id": "_:1"
								} ]
							}, {
								"@id": "_:1",
								"@type": [
									"https://schema.org/Fragment"
								],
								"https://schema.org/property-3": [ {
									"@value": "another value 1"
								} ],
								"https://schema.org/property-4": [ {
									"@value": "12345",
									"@type": "${ XSD.integer }"
								} ]
							} ]
						}, {
							"@id": "${ context.baseURI }resource/child2/",
							"@graph": [ {
								"@id": "${ context.baseURI }resource/child2/",
								"@type": [
									"${ C.Document }",
									"https://schema.org/Resource",
									"${ LDP.BasicContainer }",
									"${ LDP.RDFSource }"
								],
								"https://schema.org/property-1": [ {
									"@value": "value 2"
								} ],
								"https://schema.org/property-2": [ {
									"@id": "_:2"
								} ]
							}, {
								"@id": "_:2",
								"@type": [
									"https://schema.org/Fragment"
								],
								"https://schema.org/property-3": [ {
									"@value": "another value 2"
								} ],
								"https://schema.org/property-4": [ {
									"@value": "67890",
									"@type": "${ XSD.integer }"
								} ]
							} ]
						} ]`,
					} );

					interface MyDocument {
						property1:string;
						property2:{
							property3:string;
							property4:number;
						};
					}

					context.extendObjectSchema( {
						"schema": "https://schema.org/",
					} );
					context.extendObjectSchema( "schema:Resource", {
						"property1": {
							"@id": "https://schema.org/property-1",
							"@type": XSD.string,
						},
						"property2": {
							"@id": "https://schema.org/property-2",
							"@type": "@id",
						},
					} );
					context.extendObjectSchema( "schema:Fragment", {
						"property3": {
							"@id": "https://schema.org/property-3",
							"@type": XSD.string,
						},
						"property4": {
							"@id": "https://schema.org/property-4",
							"@type": XSD.integer,
						},
					} );

					documents.getChildren<MyDocument>( "https://example.com/resource/" ).then( ( myDocuments ) => {
						expect( myDocuments ).toEqual( jasmine.any( Array ) );
						expect( myDocuments.length ).toBe( 2 );
						for( const document of myDocuments ) {
							expect( Document.is( document ) ).toBe( true );
							expect( document.isPartial() ).toBe( false );
						}

						expect( myDocuments[ 0 ] ).toEqual( jasmine.objectContaining( {
							"_eTag": "\"1-12345\"",
							"property1": "value 1",
							"property2": jasmine.objectContaining( {
								"property3": "another value 1",
								"property4": 12345,
							} ) as any,
						} ) );
						expect( myDocuments[ 1 ] ).toEqual( jasmine.objectContaining( {
							"_eTag": "\"2-12345\"",
							"property1": "value 2",
							"property2": jasmine.objectContaining( {
								"property3": "another value 2",
								"property4": 67890,
							} ) as any,
						} ) );
						done();
					} ).catch( done.fail );
				} );

				it( "should return .ALL children", ( done:DoneFn ):void => {
					jasmine.Ajax.stubRequest( "https://example.com/resource/" ).andReturn( {
						status: 200,
						responseText: `[ {
							"@id":"_:1",
							"@type": [
								"${ C.VolatileResource }",
								"${ C.QueryMetadata }"
							],
							"${ C.target }": [ {
								"@id":"${ context.baseURI }resource/child1/"
							} ]
						}, {
							"@id":"_:2",
							"@type": [
								"${ C.VolatileResource }",
								"${ C.QueryMetadata }"
							],
							"${ C.target }": [ {
								"@id":"${ context.baseURI }resource/child2/"
							} ]
						}, {
							"@id": "_:3",
							"@type": [
								"${ C.ResponseMetadata }",
								"${ C.VolatileResource }"
							],
							"${ C.documentMetadata }": [ {
								"@id": "_:4"
							}, {
								"@id": "_:5"
							} ]
						}, {
							"@id": "_:4",
							"@type": [
								"${ C.DocumentMetadata }",
								"${ C.VolatileResource }"
							],
							"${ C.eTag }": [ {
								"@value": "\\"1-12345\\""
							} ],
							"${ C.relatedDocument }": [ {
								"@id": "https://example.com/resource/child1/"
							} ]
						}, {
							"@id": "_:5",
							"@type": [
								"${ C.DocumentMetadata }",
								"${ C.VolatileResource }"
							],
							"${ C.eTag }": [ {
								"@value": "\\"2-12345\\""
							} ],
							"${ C.relatedDocument }": [ {
								"@id": "https://example.com/resource/child2/"
							} ]
						}, {
							"@id": "${ context.baseURI }resource/child1/",
							"@graph": [ {
								"@id": "${ context.baseURI }resource/child1/",
								"@type": [
									"${ C.Document }",
									"https://schema.org/Resource",
									"${ LDP.BasicContainer }",
									"${ LDP.RDFSource }"
								],
								"https://schema.org/property-1": [ {
									"@value": "value 1"
								} ],
								"https://schema.org/property-2": [ {
									"@id": "_:1"
								} ]
							} ]
						}, {
							"@id": "${ context.baseURI }resource/child2/",
							"@graph": [ {
								"@id": "${ context.baseURI }resource/child2/",
								"@type": [
									"${ C.Document }",
									"https://schema.org/Resource",
									"${ LDP.BasicContainer }",
									"${ LDP.RDFSource }"
								],
								"https://schema.org/property-1": [ {
									"@value": "value 2"
								} ],
								"https://schema.org/property-2": [ {
									"@id": "_:2"
								} ]
							} ]
						} ]`,
					} );

					interface MyDocument {
						property1:string;
						property2:{
							property3:string;
							property4:number;
						};
					}

					context.extendObjectSchema( {
						"schema": "https://schema.org/",
					} );
					context.extendObjectSchema( "schema:Resource", {
						"property1": {
							"@id": "https://schema.org/property-1",
							"@type": XSD.string,
						},
						"property2": {
							"@id": "https://schema.org/property-2",
							"@type": "@id",
						},
					} );
					context.extendObjectSchema( "schema:Fragment", {
						"property3": {
							"@id": "https://schema.org/property-3",
							"@type": XSD.string,
						},
						"property4": {
							"@id": "https://schema.org/property-4",
							"@type": XSD.integer,
						},
					} );

					documents.getChildren<MyDocument>( "https://example.com/resource/", _ => _.properties( _.all ) )
						.then( ( myDocuments ) => {
							expect( myDocuments ).toEqual( jasmine.any( Array ) );
							expect( myDocuments.length ).toBe( 2 );
							for( const document of myDocuments ) {
								expect( Document.is( document ) ).toBe( true );
								expect( document.isPartial() ).toBe( true );
							}

							expect( myDocuments[ 0 ] ).toEqual( jasmine.objectContaining( {
								"_eTag": "\"1-12345\"",
								"property1": "value 1",
								"property2": jasmine.any( Object ) as any,
							} ) );
							expect( myDocuments[ 0 ][ "property2" ] ).not.toEqual( jasmine.objectContaining( {
								"property3": "another value 1",
								"property4": 12345,
							} ) as any );

							expect( myDocuments[ 1 ] ).toEqual( jasmine.objectContaining( {
								"_eTag": "\"2-12345\"",
								"property1": "value 2",
								"property2": jasmine.any( Object ) as any,
							} ) );
							expect( myDocuments[ 0 ][ "property2" ] ).not.toEqual( jasmine.objectContaining( {
								"property3": "another value 2",
								"property4": 67890,
							} ) as any );

							done();
						} )
						.catch( done.fail );
				} );

				it( "should return partial children", ( done:DoneFn ):void => {
					jasmine.Ajax.stubRequest( "https://example.com/resource/" ).andReturn( {
						status: 200,
						responseText: `[ {
							"@id":"_:1",
							"@type": [
								"${ C.VolatileResource }",
								"${ C.QueryMetadata }"
							],
							"${ C.target }": [ {
								"@id":"${ context.baseURI }resource/child1/"
							} ]
						}, {
							"@id":"_:2",
							"@type": [
								"${ C.VolatileResource }",
								"${ C.QueryMetadata }"
							],
							"${ C.target }": [ {
								"@id":"${ context.baseURI }resource/child2/"
							} ]
						}, {
							"@id": "_:3",
							"@type": [
								"${ C.ResponseMetadata }",
								"${ C.VolatileResource }"
							],
							"${ C.documentMetadata }": [ {
								"@id": "_:4"
							}, {
								"@id": "_:5"
							} ]
						}, {
							"@id": "_:4",
							"@type": [
								"${ C.DocumentMetadata }",
								"${ C.VolatileResource }"
							],
							"${ C.eTag }": [ {
								"@value": "\\"1-12345\\""
							} ],
							"${ C.relatedDocument }": [ {
								"@id": "https://example.com/resource/child1/"
							} ]
						}, {
							"@id": "_:5",
							"@type": [
								"${ C.DocumentMetadata }",
								"${ C.VolatileResource }"
							],
							"${ C.eTag }": [ {
								"@value": "\\"2-12345\\""
							} ],
							"${ C.relatedDocument }": [ {
								"@id": "https://example.com/resource/child2/"
							} ]
						}, {
							"@id": "${ context.baseURI }resource/child1/",
							"@graph": [ {
								"@id": "${ context.baseURI }resource/child1/",
								"@type": [
									"${ C.Document }",
									"https://example.com/ns#Resource",
									"${ LDP.BasicContainer }",
									"${ LDP.RDFSource }"
								],
								"https://example.com/ns#property-1": [ {
									"@value": "value 1"
								} ],
								"https://schema.org/property-2": [ {
									"@id": "_:1"
								} ]
							}, {
								"@id": "_:1",
								"https://example.com/ns#property-2": [ {
									"@value": "12345",
									"@type": "${ XSD.integer }"
								} ],
								"https://schema.org/property-3": [ {
									"@value": "another value 1"
								} ]
							} ]
						}, {
							"@id": "${ context.baseURI }resource/child2/",
							"@graph": [ {
								"@id": "${ context.baseURI }resource/child2/",
								"@type": [
									"${ C.Document }",
									"https://example.com/ns#Resource",
									"${ LDP.BasicContainer }",
									"${ LDP.RDFSource }"
								],
								"https://example.com/ns#property-1": [ {
									"@value": "value 2"
								} ],
								"https://schema.org/property-2": [ {
									"@id": "_:2"
								} ]
							}, {
								"@id": "_:2",
								"https://example.com/ns#property-2": [ {
									"@value": "67890",
									"@type": "${ XSD.integer }"
								} ],
								"https://schema.org/property-3": [ {
									"@value": "another value 2"
								} ]
							} ]
						} ]`,
					} );

					interface MyDocument {
						property1:string;
						property2:{};
					}

					context.extendObjectSchema( {
						"schema": "https://schema.org/",
					} );
					context.extendObjectSchema( "Resource", {
						"property1": {
							"@id": "property-1",
							"@type": XSD.string,
						},
						"property2": {
							"@id": "property-2",
							"@type": XSD.integer,
						},
						"property3": {
							"@id": "https://schema.org/property-3",
							"@type": XSD.string,
						},
					} );

					documents.getChildren<MyDocument>( "https://example.com/resource/", _ => _
						.withType( "Resource" )
						.properties( {
							"property1": _.inherit,
							"property2": {
								"@id": "https://schema.org/property-2",
								"@type": "@id",
								"query": __ => __.properties( {
									"property2": __.inherit,
									"property3": __.inherit,
								} ),
							},
						} )
					).then( ( myDocuments ) => {
						expect( myDocuments ).toEqual( jasmine.any( Array ) );
						expect( myDocuments.length ).toBe( 2 );
						for( const document of myDocuments ) {
							expect( Document.is( document ) ).toBe( true );
						}

						expect( myDocuments[ 0 ] ).toEqual( jasmine.objectContaining( {
							"_eTag": "\"1-12345\"",
							"property1": "value 1",
							"property2": jasmine.objectContaining( {
								"property2": 12345,
								"property3": "another value 1",
							} ),
						} ) );
						expect( myDocuments[ 1 ] ).toEqual( jasmine.objectContaining( {
							"_eTag": "\"2-12345\"",
							"property1": "value 2",
							"property2": jasmine.objectContaining( {
								"property2": 67890,
								"property3": "another value 2",
							} ),
						} ) );
						done();
					} ).catch( done.fail );
				} );

				it( "should return partial children with partial relations", ( done:DoneFn ):void => {
					jasmine.Ajax.stubRequest( "https://example.com/resource/" ).andReturn( {
						status: 200,
						responseText: `[ {
							"@id":"_:1",
							"@type": [
								"${ C.VolatileResource }",
								"${ C.QueryMetadata }"
							],
							"${ C.target }": [ {
								"@id":"${ context.baseURI }resource/child1/"
							} ]
						}, {
							"@id":"_:2",
							"@type": [
								"${ C.VolatileResource }",
								"${ C.QueryMetadata }"
							],
							"${ C.target }": [ {
								"@id":"${ context.baseURI }resource/child2/"
							} ]
						}, {
							"@id": "_:3",
							"@type": [
								"${ C.ResponseMetadata }",
								"${ C.VolatileResource }"
							],
							"${ C.documentMetadata }": [ {
								"@id": "_:4"
							}, {
								"@id": "_:5"
							}, {
								"@id": "_:6"
							}, {
								"@id": "_:7"
							} ]
						}, {
							"@id": "_:4",
							"@type": [
								"${ C.DocumentMetadata }",
								"${ C.VolatileResource }"
							],
							"${ C.eTag }": [ {
								"@value": "\\"1-12345\\""
							} ],
							"${ C.relatedDocument }": [ {
								"@id": "https://example.com/resource/child1/"
							} ]
						}, {
							"@id": "_:5",
							"@type": [
								"${ C.DocumentMetadata }",
								"${ C.VolatileResource }"
							],
							"${ C.eTag }": [ {
								"@value": "\\"2-12345\\""
							} ],
							"${ C.relatedDocument }": [ {
								"@id": "https://example.com/resource/child2/"
							} ]
						}, {
							"@id": "_:6",
							"@type": [
								"${ C.DocumentMetadata }",
								"${ C.VolatileResource }"
							],
							"${ C.eTag }": [ {
								"@value": "\\"3-12345\\""
							} ],
							"${ C.relatedDocument }": [ {
								"@id": "https://example.com/sub-documents/sub-document1/"
							} ]
						}, {
							"@id": "_:7",
							"@type": [
								"${ C.DocumentMetadata }",
								"${ C.VolatileResource }"
							],
							"${ C.eTag }": [ {
								"@value": "\\"4-12345\\""
							} ],
							"${ C.relatedDocument }": [ {
								"@id": "https://example.com/sub-documents/sub-document2/"
							} ]
						}, {
							"@id": "${ context.baseURI }resource/child1/",
							"@graph": [ {
								"@id": "${ context.baseURI }resource/child1/",
								"@type": [
									"${ C.Document }",
									"https://example.com/ns#Resource",
									"${ LDP.BasicContainer }",
									"${ LDP.RDFSource }"
								],
								"https://example.com/ns#property-1": [ {
									"@value": "value 1"
								} ],
								"https://schema.org/property-2": [ {
									"@id": "${ context.baseURI }sub-documents/sub-document1/"
								} ]
							} ]
						}, {
							"@id": "${ context.baseURI }sub-documents/sub-document1/",
							"@graph": [ {
								"@id": "${ context.baseURI }sub-documents/sub-document1/",
								"https://example.com/ns#property-2": [ {
									"@value": "12345",
									"@type": "${ XSD.integer }"
								} ],
								"https://schema.org/property-3": [ {
									"@value": "another value 1"
								} ]
							} ]
						}, {
							"@id": "${ context.baseURI }resource/child2/",
							"@graph": [ {
								"@id": "${ context.baseURI }resource/child2/",
								"@type": [
									"${ C.Document }",
									"https://example.com/ns#Resource",
									"${ LDP.BasicContainer }",
									"${ LDP.RDFSource }"
								],
								"https://example.com/ns#property-1": [ {
									"@value": "value 2"
								} ],
								"https://schema.org/property-2": [ {
									"@id": "${ context.baseURI }sub-documents/sub-document2/"
								} ]
							} ]
						}, {
							"@id": "${ context.baseURI }sub-documents/sub-document2/",
							"@graph": [ {
								"@id": "${ context.baseURI }sub-documents/sub-document2/",
								"https://example.com/ns#property-2": [ {
									"@value": "67890",
									"@type": "${ XSD.integer }"
								} ],
								"https://schema.org/property-3": [ {
									"@value": "another value 2"
								} ]
							} ]
						} ]`,
					} );

					interface MyDocument {
						property1:string;
						property2:{};
					}

					context.extendObjectSchema( {
						"schema": "https://schema.org/",
					} );
					context.extendObjectSchema( "Resource", {
						"property1": {
							"@id": "property-1",
							"@type": XSD.string,
						},
						"property2": {
							"@id": "property-2",
							"@type": XSD.integer,
						},
						"property3": {
							"@id": "https://schema.org/property-3",
							"@type": XSD.string,
						},
					} );

					documents.getChildren<MyDocument>( "https://example.com/resource/", _ => _
						.withType( "Resource" )
						.properties( {
							"property1": _.inherit,
							"property2": {
								"@id": "https://schema.org/property-2",
								"@type": "@id",
								"query": __ => __.properties( {
									"property2": __.inherit,
									"property3": __.inherit,
								} ),
							},
						} )
					).then( ( myDocuments ) => {
						expect( myDocuments ).toEqual( jasmine.any( Array ) );
						expect( myDocuments.length ).toBe( 2 );
						for( const document of myDocuments ) {
							expect( Document.is( document ) ).toBe( true );
						}

						expect( myDocuments[ 0 ] ).toEqual( jasmine.objectContaining( {
							"_eTag": "\"1-12345\"",
							"property1": "value 1",
							"property2": jasmine.objectContaining( {
								"_eTag": "\"3-12345\"",
								"property2": 12345,
								"property3": "another value 1",
							} ),
						} ) );
						expect( myDocuments[ 1 ] ).toEqual( jasmine.objectContaining( {
							"_eTag": "\"2-12345\"",
							"property1": "value 2",
							"property2": jasmine.objectContaining( {
								"_eTag": "\"4-12345\"",
								"property2": 67890,
								"property3": "another value 2",
							} ),
						} ) );
						done();
					} ).catch( done.fail );
				} );

			} );

			describe( "When Documents does not have a context", ():void => {

				let documents:Documents;
				beforeEach( () => {
					documents = new Documents();
				} );

				it( "should reject if URI is relative", ( done:DoneFn ):void => {
					const promise:Promise<any> = documents.getChildren( "relative-uri/" );
					promise.then( () => {
						done.fail( "Should not resolve promise." );
					} ).catch( error => {
						expect( error.message ).toBe( "This Documents instance doesn't support relative URIs." );
						done();
					} );
				} );

				it( "should reject if URI is prefixed", ( done:DoneFn ):void => {
					const promise:Promise<any> = documents.getChildren( "prefix:the-uri" );
					promise.then( () => {
						done.fail( "Should not resolve promise." );
					} ).catch( error => {
						expect( error.message ).toBe( "This Documents instance doesn't support prefixed URIs." );
						done();
					} );
				} );

				it( "should call _parseErrorResponse when request error", ( done:DoneFn ):void => {
					jasmine.Ajax.stubRequest( "https://example.com/" ).andReturn( {
						status: 500,
						responseText: "",
					} );

					const error:Error = new Error( "Error message" );
					const spy:jasmine.Spy = spyOn( documents, "_parseErrorResponse" ).and.callFake( () => Promise.reject( error ) );

					documents.getChildren( "https://example.com/" ).then( () => {
						done.fail( "Should not resolve" );
					} ).catch( _error => {
						expect( spy ).toHaveBeenCalled();

						expect( _error ).toBeDefined();
						expect( _error ).toBe( error );

						done();
					} );
				} );


				it( "should send a correct construct query", ( done:DoneFn ):void => {
					interface MyDocument {
						property1:string;
						property2:{};
					}

					const sendSpy:jasmine.Spy = spyOn( documents, "executeRawCONSTRUCTQuery" ).and.returnValue( Promise.reject( null ) );

					documents.getChildren<MyDocument>( "https://example.com/resource/", _ => _
						.withType( "https://example.com/ns#Resource" )
						.properties( {
							"property1": {
								"@id": "https://example.com/ns#property-1",
								"@type": XSD.string,
							},
							"property2": {
								"@id": "https://schema.org/property-2",
								"@type": "@id",
								"query": __ => __.properties( {
									"property2": {
										"@id": "https://example.com/ns#property-2",
										"@type": XSD.integer,
									},
									"property3": {
										"@id": "https://schema.org/property-3",
										"@type": XSD.string,
									},
								} ),
							},
						} )
						.orderBy( "property2" )
						.limit( 10 )
						.offset( 5 )
					).then( () => done.fail( "Should not resolve, spy is makes it fail." ) ).catch( ( error ) => {
						if( error ) done.fail( error );

						expect( sendSpy ).toHaveBeenCalledWith(
							"https://example.com/resource/", "" +
							"CONSTRUCT {" +
							` ?metadata a <${ C.VolatileResource }>, <${ C.QueryMetadata }>;` +
							"" + ` <${ C.target }> ?child.` +

							" ?child a ?child__types;" +
							"" + " <https://example.com/ns#property-1> ?child__property1;" +
							"" + " <https://schema.org/property-2> ?child__property2." +

							" ?child__property2 a ?child__property2__types;" +
							"" + " <https://example.com/ns#property-2> ?child__property2__property2;" +
							"" + " <https://schema.org/property-3> ?child__property2__property3 " +

							"} WHERE {" +
							" BIND(BNODE() AS ?metadata)." +

							" {" +
							"" + " SELECT DISTINCT ?child WHERE {" +
							"" + "" + " <https://example.com/resource/> <http://www.w3.org/ns/ldp#contains> ?child." +
							"" + "" + " OPTIONAL { ?child <https://schema.org/property-2> ?child__property2 }" +
							"" + " }" +
							"" + " ORDER BY ?child__property2" +
							"" + " LIMIT 10" +
							"" + " OFFSET 5" +
							" }." +

							" OPTIONAL { ?child a ?child__types }." +
							" ?child a <https://example.com/ns#Resource>." +

							" OPTIONAL {" +
							"" + " ?child <https://example.com/ns#property-1> ?child__property1." +
							"" + " FILTER( datatype( ?child__property1 ) = <http://www.w3.org/2001/XMLSchema#string> )" +
							" }." +

							" OPTIONAL {" +
							"" + " ?child <https://schema.org/property-2> ?child__property2." +
							"" + " FILTER( ! isLiteral( ?child__property2 ) )." +
							"" + " OPTIONAL { ?child__property2 a ?child__property2__types }." +

							"" + " OPTIONAL {" +
							"" + "" + " ?child__property2 <https://example.com/ns#property-2> ?child__property2__property2." +
							"" + "" + " FILTER( datatype( ?child__property2__property2 ) = <http://www.w3.org/2001/XMLSchema#integer> )" +
							"" + " }." +

							"" + " OPTIONAL {" +
							"" + "" + " ?child__property2 <https://schema.org/property-3> ?child__property2__property3." +
							"" + "" + " FILTER( datatype( ?child__property2__property3 ) = <http://www.w3.org/2001/XMLSchema#string> )" +
							"" + " }" +
							" } " +
							"}",

							jasmine.objectContaining( {
								headers: new Map( [
									[ "prefer", new Header( [
										`include="${ C.PreferDocumentETags }"`,
										`include="${ C.PreferResultsContext }"`,
									] ) ],
								] ),
							} )
						);
						done();
					} );
				} );

				it( "should return partial children", ( done:DoneFn ):void => {
					jasmine.Ajax.stubRequest( "https://example.com/resource/" ).andReturn( {
						status: 200,
						responseText: `[ {
							"@id":"_:1",
							"@type": [
								"${ C.VolatileResource }",
								"${ C.QueryMetadata }"
							],
							"${ C.target }": [ {
								"@id":"https://example.com/resource/child1/"
							} ]
						}, {
							"@id":"_:2",
							"@type": [
								"${ C.VolatileResource }",
								"${ C.QueryMetadata }"
							],
							"${ C.target }": [ {
								"@id":"https://example.com/resource/child2/"
							} ]
						}, {
							"@id": "_:3",
							"@type": [
								"${ C.ResponseMetadata }",
								"${ C.VolatileResource }"
							],
							"${ C.documentMetadata }": [ {
								"@id": "_:4"
							}, {
								"@id": "_:5"
							} ]
						}, {
							"@id": "_:4",
							"@type": [
								"${ C.DocumentMetadata }",
								"${ C.VolatileResource }"
							],
							"${ C.eTag }": [ {
								"@value": "\\"1-12345\\""
							} ],
							"${ C.relatedDocument }": [ {
								"@id": "https://example.com/resource/child1/"
							} ]
						}, {
							"@id": "_:5",
							"@type": [
								"${ C.DocumentMetadata }",
								"${ C.VolatileResource }"
							],
							"${ C.eTag }": [ {
								"@value": "\\"2-12345\\""
							} ],
							"${ C.relatedDocument }": [ {
								"@id": "https://example.com/resource/child2/"
							} ]
						}, {
							"@id": "https://example.com/resource/child1/",
							"@graph": [ {
								"@id": "https://example.com/resource/child1/",
								"@type": [
									"${ C.Document }",
									"https://example.com/ns#Resource",
									"${ LDP.BasicContainer }",
									"${ LDP.RDFSource }"
								],
								"https://example.com/ns#property-1": [ {
									"@value": "value 1"
								} ],
								"https://schema.org/property-2": [ {
									"@id": "_:1"
								} ]
							}, {
								"@id": "_:1",
								"https://example.com/ns#property-2": [ {
									"@value": "12345",
									"@type": "${ XSD.integer }"
								} ],
								"https://schema.org/property-3": [ {
									"@value": "another value 1"
								} ]
							} ]
						}, {
							"@id": "https://example.com/resource/child2/",
							"@graph": [ {
								"@id": "https://example.com/resource/child2/",
								"@type": [
									"${ C.Document }",
									"https://example.com/ns#Resource",
									"${ LDP.BasicContainer }",
									"${ LDP.RDFSource }"
								],
								"https://example.com/ns#property-1": [ {
									"@value": "value 2"
								} ],
								"https://schema.org/property-2": [ {
									"@id": "_:2"
								} ]
							}, {
								"@id": "_:2",
								"https://example.com/ns#property-2": [ {
									"@value": "67890",
									"@type": "${ XSD.integer }"
								} ],
								"https://schema.org/property-3": [ {
									"@value": "another value 2"
								} ]
							} ]
						} ]`,
					} );

					interface MyDocument {
						property1:string;
						property2:{};
					}

					documents.getChildren<MyDocument>( "https://example.com/resource/", _ => _
						.withType( "https://example.com/ns#Resource" )
						.properties( {
							"property1": {
								"@id": "https://example.com/ns#property-1",
								"@type": XSD.string,
							},
							"property2": {
								"@id": "https://schema.org/property-2",
								"@type": "@id",
								"query": __ => __.properties( {
									"property2": {
										"@id": "https://example.com/ns#property-2",
										"@type": XSD.integer,
									},
									"property3": {
										"@id": "https://schema.org/property-3",
										"@type": XSD.string,
									},
								} ),
							},
						} )
					).then( ( myDocuments ) => {
						expect( myDocuments ).toEqual( jasmine.any( Array ) );
						expect( myDocuments.length ).toBe( 2 );
						for( const document of myDocuments ) {
							expect( Document.is( document ) ).toBe( true );
						}

						expect( myDocuments[ 0 ] ).toEqual( jasmine.objectContaining( {
							"_eTag": "\"1-12345\"",
							"property1": "value 1",
							"property2": jasmine.objectContaining( {
								"property2": 12345,
								"property3": "another value 1",
							} ),
						} ) );
						expect( myDocuments[ 1 ] ).toEqual( jasmine.objectContaining( {
							"_eTag": "\"2-12345\"",
							"property1": "value 2",
							"property2": jasmine.objectContaining( {
								"property2": 67890,
								"property3": "another value 2",
							} ),
						} ) );
						done();
					} ).catch( done.fail );
				} );

				it( "should return partial children with partial relations", ( done:DoneFn ):void => {
					jasmine.Ajax.stubRequest( "https://example.com/resource/" ).andReturn( {
						status: 200,
						responseText: `[ {
							"@id":"_:1",
							"@type": [
								"${ C.VolatileResource }",
								"${ C.QueryMetadata }"
							],
							"${ C.target }": [ {
								"@id":"https://example.com/resource/child1/"
							} ]
						}, {
							"@id":"_:2",
							"@type": [
								"${ C.VolatileResource }",
								"${ C.QueryMetadata }"
							],
							"${ C.target }": [ {
								"@id":"https://example.com/resource/child2/"
							} ]
						}, {
							"@id": "_:3",
							"@type": [
								"${ C.ResponseMetadata }",
								"${ C.VolatileResource }"
							],
							"${ C.documentMetadata }": [ {
								"@id": "_:4"
							}, {
								"@id": "_:5"
							}, {
								"@id": "_:6"
							}, {
								"@id": "_:7"
							} ]
						}, {
							"@id": "_:4",
							"@type": [
								"${ C.DocumentMetadata }",
								"${ C.VolatileResource }"
							],
							"${ C.eTag }": [ {
								"@value": "\\"1-12345\\""
							} ],
							"${ C.relatedDocument }": [ {
								"@id": "https://example.com/resource/child1/"
							} ]
						}, {
							"@id": "_:5",
							"@type": [
								"${ C.DocumentMetadata }",
								"${ C.VolatileResource }"
							],
							"${ C.eTag }": [ {
								"@value": "\\"2-12345\\""
							} ],
							"${ C.relatedDocument }": [ {
								"@id": "https://example.com/resource/child2/"
							} ]
						}, {
							"@id": "_:6",
							"@type": [
								"${ C.DocumentMetadata }",
								"${ C.VolatileResource }"
							],
							"${ C.eTag }": [ {
								"@value": "\\"3-12345\\""
							} ],
							"${ C.relatedDocument }": [ {
								"@id": "https://example.com/sub-documents/sub-document1/"
							} ]
						}, {
							"@id": "_:7",
							"@type": [
								"${ C.DocumentMetadata }",
								"${ C.VolatileResource }"
							],
							"${ C.eTag }": [ {
								"@value": "\\"4-12345\\""
							} ],
							"${ C.relatedDocument }": [ {
								"@id": "https://example.com/sub-documents/sub-document2/"
							} ]
						}, {
							"@id": "https://example.com/resource/child1/",
							"@graph": [ {
								"@id": "https://example.com/resource/child1/",
								"@type": [
									"${ C.Document }",
									"https://example.com/ns#Resource",
									"${ LDP.BasicContainer }",
									"${ LDP.RDFSource }"
								],
								"https://example.com/ns#property-1": [ {
									"@value": "value 1"
								} ],
								"https://schema.org/property-2": [ {
									"@id": "https://example.com/sub-documents/sub-document1/"
								} ]
							} ]
						}, {
							"@id": "https://example.com/sub-documents/sub-document1/",
							"@graph": [ {
								"@id": "https://example.com/sub-documents/sub-document1/",
								"https://example.com/ns#property-2": [ {
									"@value": "12345",
									"@type": "${ XSD.integer }"
								} ],
								"https://schema.org/property-3": [ {
									"@value": "another value 1"
								} ]
							} ]
						}, {
							"@id": "https://example.com/resource/child2/",
							"@graph": [ {
								"@id": "https://example.com/resource/child2/",
								"@type": [
									"${ C.Document }",
									"https://example.com/ns#Resource",
									"${ LDP.BasicContainer }",
									"${ LDP.RDFSource }"
								],
								"https://example.com/ns#property-1": [ {
									"@value": "value 2"
								} ],
								"https://schema.org/property-2": [ {
									"@id": "https://example.com/sub-documents/sub-document2/"
								} ]
							} ]
						}, {
							"@id": "https://example.com/sub-documents/sub-document2/",
							"@graph": [ {
								"@id": "https://example.com/sub-documents/sub-document2/",
								"https://example.com/ns#property-2": [ {
									"@value": "67890",
									"@type": "${ XSD.integer }"
								} ],
								"https://schema.org/property-3": [ {
									"@value": "another value 2"
								} ]
							} ]
						} ]`,
					} );

					interface MyDocument {
						property1:string;
						property2:{};
					}

					documents.getChildren<MyDocument>( "https://example.com/resource/", _ => _
						.withType( "https://example.com/ns#Resource" )
						.properties( {
							"property1": {
								"@id": "https://example.com/ns#property-1",
								"@type": XSD.string,
							},
							"property2": {
								"@id": "https://schema.org/property-2",
								"@type": "@id",
								"query": __ => __.properties( {
									"property2": {
										"@id": "https://example.com/ns#property-2",
										"@type": XSD.integer,
									},
									"property3": {
										"@id": "https://schema.org/property-3",
										"@type": XSD.string,
									},
								} ),
							},
						} )
					).then( ( myDocuments ) => {
						expect( myDocuments ).toEqual( jasmine.any( Array ) );
						expect( myDocuments.length ).toBe( 2 );
						for( const document of myDocuments ) {
							expect( Document.is( document ) ).toBe( true );
						}

						expect( myDocuments[ 0 ] ).toEqual( jasmine.objectContaining( {
							"_eTag": "\"1-12345\"",
							"property1": "value 1",
							"property2": jasmine.objectContaining( {
								"_eTag": "\"3-12345\"",
								"property2": 12345,
								"property3": "another value 1",
							} ),
						} ) );
						expect( myDocuments[ 1 ] ).toEqual( jasmine.objectContaining( {
							"_eTag": "\"2-12345\"",
							"property1": "value 2",
							"property2": jasmine.objectContaining( {
								"_eTag": "\"4-12345\"",
								"property2": 67890,
								"property3": "another value 2",
							} ),
						} ) );
						done();
					} ).catch( done.fail );
				} );

			} );

		} );


		describe( method( INSTANCE, "createAccessPoint" ), ():void => {

			it( hasSignature(
				[ "T extends object" ],
				"Persists an AccessPoint in the document specified.", [
					{ name: "documentURI", type: "string", description: "URI of the document where to create a new access point." },
					{ name: "accessPoint", type: "T & CarbonLDP.BaseAccessPoint", description: "AccessPoint Document to persist." },
					{ name: "slug", type: "string", optional: true, description: "Slug that will be used for the URI of the new access point." },
					{ name: "requestOptions", type: "CarbonLDP.HTTP.RequestOptions", optional: true, description: "Customizable options for the request." },
				],
				{ type: "Promise<T & CarbonLDP.AccessPoint>" }
			), ():void => {} );

			it( hasSignature(
				[ "T extends object" ],
				"Persists an AccessPoint in the document specified.", [
					{ name: "documentURI", type: "string", description: "URI of the document where to create a new access point." },
					{ name: "accessPoint", type: "T & CarbonLDP.BaseAccessPoint", description: "AccessPoint Document to persist." },
					{ name: "requestOptions", type: "CarbonLDP.HTTP.RequestOptions", optional: true, description: "Customizable options for the request." },
				],
				{ type: "Promise<T & CarbonLDP.AccessPoint>" }
			), ():void => {} );

			it( isDefined(), () => {
				expect( Documents.prototype.createAccessPoint ).toBeDefined();
				expect( Documents.prototype.createAccessPoint ).toEqual( jasmine.any( Function ) );
			} );

			describe( "When Documents has a specified context", ():void => {

				let context:AbstractContext;
				let documents:Documents;
				beforeEach( ():void => {
					context = new class extends AbstractContext {
						_baseURI:string = "https://example.com/";
						settings:ContextSettings = { vocabulary: "https://example.com/ns#" };
					};
					documents = context.documents;
				} );

				it( "should reject promise if URI is not in the context base", ( done:DoneFn ):void => {
					const accessPoint:BaseAccessPoint = { hasMemberRelation: "member-relation" };
					const promise:Promise<any> = documents.createAccessPoint( "https://not-example.com", accessPoint );
					promise.then( () => {
						done.fail( "Should not resolve promise." );
					} ).catch( error => {
						expect( error.message ).toBe( `"https://not-example.com" isn't a valid URI for this Carbon instance.` );
						done();
					} );
				} );

				it( "should reject promise if prefixed URI cannot be resolved", ( done:DoneFn ):void => {
					const accessPoint:BaseAccessPoint = { hasMemberRelation: "member-relation" };
					const promise:Promise<any> = documents.createAccessPoint( "prefix:the-uri", accessPoint );
					promise.then( () => {
						done.fail( "Should not resolve promise." );
					} ).catch( error => {
						expect( error.message ).toBe( `The prefixed URI "prefix:the-uri" could not be resolved.` );
						done();
					} );
				} );

				it( "should sync the persisted blank nodes", ( done:DoneFn ) => {
					jasmine.Ajax.stubRequest( "https://example.com/", null, "POST" ).andReturn( {
						status: 201,
						responseHeaders: {
							"Location": "https://example.com/new-access-point/",
							"ETag": '"1234567890"',
						},
						responseText: `[
							{
								"@id": "_:responseMetadata",
								"@type": [
							        "${ C.VolatileResource }",
						            "${ C.ResponseMetadata }"
								],
								"${ C.documentMetadata }": [ {
									"@id": "_:documentMetadata"
								} ]
							},
							{
								"@id": "_:documentMetadata",
								"@type": [
						            "${ C.VolatileResource }",
						            "${ C.DocumentMetadata }"
								],
								"${ C.relatedDocument }": [ {
									"@id": "https://example.com/new-access-point/"
								} ],
								"${ C.bNodesMap }": [ {
									"@id": "_:map"
								} ]
							},
							{
								"@id": "_:map",
								"@type": [ "${ C.Map }" ],
								"${ C.entry }": [
									{ "@id": "_:entry-1" },
									{ "@id": "_:entry-2" }
								]
							},
							{
								"@id": "_:entry-1",
								"${ C.entryKey }": [ {
								    "@id": "_:1"
							    } ],
								"${ C.entryValue }": [ {
									"@id": "_:new-1"
								} ]
							},
							{
								"@id": "_:entry-2",
								"${ C.entryKey }": [ {
									"@id": "_:2"
								} ],
								"${ C.entryValue }": [ {
									"@id": "_:new-2"
								} ]
							}
						]`,
					} );

					type RawBlankNode = Partial<TransientBlankNode> & { value:string };

					interface RawDocument {
						blankNode1:RawBlankNode;
						blankNode2:RawBlankNode;
					}

					const rawAccessPoint:RawDocument & BaseAccessPoint = {
						blankNode1: {
							id: "_:1",
							value: "a value 1",
						},
						blankNode2: {
							id: "_:2",
							value: "a value 2",
						},
						hasMemberRelation: "member-relation",
					};

					documents.createAccessPoint<RawDocument>( "/", rawAccessPoint )
						.then( ( document ) => {

							expect( document.blankNode1 ).toBe( rawAccessPoint.blankNode1 );
							expect( document.blankNode1.id ).toBe( "_:new-1" );
							expect( document.blankNode1 ).toEqual( jasmine.objectContaining( {
								value: "a value 1",
							} ) );

							expect( document.blankNode2 ).toBe( rawAccessPoint.blankNode2 );
							expect( document.blankNode2.id ).toBe( "_:new-2" );
							expect( document.blankNode2 ).toEqual( jasmine.objectContaining( {
								value: "a value 2",
							} ) );

							done();
						} )
						.catch( done.fail );
				} );

				it( "should call _parseErrorResponse when request error", ( done:DoneFn ):void => {
					jasmine.Ajax.stubRequest( "https://example.com/" ).andReturn( {
						status: 500,
						responseText: "",
					} );

					const error:Error = new Error( "Error message" );
					const spy:jasmine.Spy = spyOn( documents, "_parseErrorResponse" ).and.callFake( () => Promise.reject( error ) );

					documents.createAccessPoint( "https://example.com/", { hasMemberRelation: "memberRelation" } ).then( () => {
						done.fail( "Should not resolve" );
					} ).catch( _error => {
						expect( spy ).toHaveBeenCalled();

						expect( _error ).toBeDefined();
						expect( _error ).toBe( error );

						done();
					} );
				} );


				it( "should convert plain access-point into a document access-point before request", ( done:DoneFn ):void => {
					const spy:jasmine.Spy = spyOn( TransientAccessPoint, "createFrom" ).and.callThrough();
					spyOn( documents, "_persistDocument" as any ).and.returnValue( Promise.resolve( [] ) );

					const accessPoint:BaseAccessPoint = { hasMemberRelation: "member-relation" };
					documents.createAccessPoint( "https://example.com/parent-resource/", accessPoint )
						.then( () => {
							expect( spy ).toHaveBeenCalledWith( accessPoint );

							done();
						} )
						.catch( done.fail );

				} );

				it( "should reject if access-point is already persisted", ( done:DoneFn ):void => {
					const accessPoint:BaseAccessPoint & Document = Document.decorate( { id: "https://example.com/some-resource/", hasMemberRelation: "member-relation" }, documents );
					documents.createAccessPoint( "https://example.com/parent-resource/", accessPoint )
						.then( () => {
							done.fail( "Should not resolve" );
						} )
						.catch( error => {
							expect( error ).toEqual( jasmine.any( Errors.IllegalArgumentError ) );
							expect( error.message ).toEqual( "The access-point provided has been already persisted." );
							done();
						} )
					;
				} );

				it( "should reject if access-point has incorrect membershipResource", ( done:DoneFn ):void => {
					const accessPoint:BaseAccessPoint = TransientAccessPoint.create( {
						membershipResource: documents.getPointer( "NOT-parent-resource/" ),
						hasMemberRelation: "member-relation",
					} );

					documents.createAccessPoint( "https://example.com/parent-resource/", accessPoint )
						.then( () => {
							done.fail( "Should not resolve" );
						} )
						.catch( error => {
							expect( error ).toEqual( jasmine.any( Errors.IllegalArgumentError ) );
							expect( error.message ).toEqual( "The documentURI must be the same as the accessPoint's membershipResource." );
							done();
						} )
					;
				} );

				it( "should process the access-point into a valid persisted access-point", ( done:DoneFn ):void => {
					jasmine.Ajax.stubRequest( "https://example.com/parent-resource/", null, "POST" ).andReturn( {
						status: 200,
						responseHeaders: {
							"Location": "https://example.com/parent-resource/new-resource/",
						},
					} );

					const accessPoint:BaseAccessPoint = { hasMemberRelation: "member-relation" };
					documents.createAccessPoint( "https://example.com/parent-resource/", accessPoint ).then( ( document:AccessPoint ):void => {
						expect( accessPoint ).toBe( document );

						expect( Document.is( document ) ).toBe( true );
						expect( document ).toEqual( jasmine.objectContaining( {
							_resolved: false,
							id: "https://example.com/parent-resource/new-resource/",
							membershipResource: Pointer.create( { id: "https://example.com/parent-resource/" } ),
							hasMemberRelation: "member-relation" as any,
						} ) );

						expect( documents.hasPointer( "parent-resource/new-resource/" ) ).toBe( true );

						done();
					} ).catch( done.fail );
				} );

				it( "should be able to resend failed access-point", ( done:DoneFn ):void => {
					jasmine.Ajax.stubRequest( "https://example.com/parent-resource/", null, "POST" ).andReturn( {
						status: 500,
					} );

					const accessPoint:BaseAccessPoint = { hasMemberRelation: "member-relation" };

					documents.createAccessPoint( "https://example.com/parent-resource/", accessPoint )
						.catch( error => {
							expect( error ).toEqual( jasmine.any( Error ) );

							jasmine.Ajax.stubRequest( "https://example.com/parent-resource/", null, "POST" ).andReturn( {
								status: 200,
								responseHeaders: {
									"Location": "https://example.com/parent-resource/new-resource/",
								},
							} );

							return documents.createAccessPoint( "https://example.com/parent-resource/", accessPoint );
						} )
						.then( ( document:Document ):void => {
							expect( Document.is( document ) ).toBe( true );
							expect( document.id ).toBe( "https://example.com/parent-resource/new-resource/" );

							done();
						} )
						.catch( done.fail );
				} );

				it( "should send expected headers", ( done:DoneFn ):void => {
					jasmine.Ajax.stubRequest( "https://example.com/parent-resource/", null, "POST" ).andReturn( {
						status: 200,
						responseHeaders: {
							"Location": "https://example.com/parent-resource/new-resource/",
						},
					} );

					const accessPoint:BaseAccessPoint = { hasMemberRelation: "member-relation" };

					documents.createAccessPoint( "https://example.com/parent-resource/", accessPoint )
						.then( ():void => {
							const request:JasmineAjaxRequest = jasmine.Ajax.requests.mostRecent();
							expect( request.requestHeaders ).toEqual( {
								"content-type": "application/ld+json",
								"accept": "application/ld+json",
								"prefer": [
									`return=minimal`,
									`${ LDP.RDFSource }; rel=interaction-model`,
								].join( ", " ),
							} );

							done();
						} )
						.catch( done.fail );
				} );

				it( "should send expected headers with slug", ( done:DoneFn ):void => {
					jasmine.Ajax.stubRequest( "https://example.com/parent-resource/", null, "POST" ).andReturn( {
						status: 200,
						responseHeaders: {
							"Location": "https://example.com/parent-resource/new-resource/",
						},
					} );

					const accessPoint:BaseAccessPoint = { hasMemberRelation: "member-relation" };

					documents.createAccessPoint( "https://example.com/parent-resource/", accessPoint, "child-slug" )
						.then( ():void => {
							const request:JasmineAjaxRequest = jasmine.Ajax.requests.mostRecent();
							expect( request.requestHeaders ).toEqual( {
								"content-type": "application/ld+json",
								"accept": "application/ld+json",
								"prefer": [
									`return=minimal`,
									`${ LDP.RDFSource }; rel=interaction-model`,
								].join( ", " ),
								"slug": "child-slug",
							} );

							done();
						} )
						.catch( done.fail );
				} );

			} );

			describe( "When Documents does not have a context", ():void => {
				let documents:Documents;

				beforeEach( () => {
					documents = new Documents();
				} );

				it( "should reject if URI is relative", ( done:DoneFn ):void => {
					const accessPoint:BaseAccessPoint = { hasMemberRelation: "member-relation" };
					const promise:Promise<any> = documents.createAccessPoint( "relative-uri/", accessPoint );
					promise.then( () => {
						done.fail( "Should not resolve promise." );
					} ).catch( error => {
						expect( error.message ).toBe( "This Documents instance doesn't support relative URIs." );
						done();
					} );
				} );

				it( "should reject if URI is prefixed", ( done:DoneFn ):void => {
					const accessPoint:BaseAccessPoint = { hasMemberRelation: "member-relation" };
					const promise:Promise<any> = documents.createAccessPoint( "prefix:the-uri", accessPoint );
					promise.then( () => {
						done.fail( "Should not resolve promise." );
					} ).catch( error => {
						expect( error.message ).toBe( "This Documents instance doesn't support prefixed URIs." );
						done();
					} );
				} );

				it( "should call _parseErrorResponse when request error", ( done:DoneFn ):void => {
					jasmine.Ajax.stubRequest( "https://example.com/" ).andReturn( {
						status: 500,
						responseText: "",
					} );

					const error:Error = new Error( "Error message" );
					const spy:jasmine.Spy = spyOn( documents, "_parseErrorResponse" ).and.callFake( () => Promise.reject( error ) );

					documents.createAccessPoint( "https://example.com/", { hasMemberRelation: "memberRelation" } ).then( () => {
						done.fail( "Should not resolve" );
					} ).catch( _error => {
						expect( spy ).toHaveBeenCalled();

						expect( _error ).toBeDefined();
						expect( _error ).toBe( error );

						done();
					} );
				} );

			} );

		} );

		describe( method( INSTANCE, "createAccessPoints" ), ():void => {

			it( hasSignature(
				[ "T extends object" ],
				"Persists multiple access points objects for the specified document.", [
					{ name: "documentURI", type: "string", description: "URI of the document where to create the new access points." },
					{ name: "accessPoints", type: "T & CarbonLDP.BaseAccessPoint", description: "Array with the access points to persist." },
					{ name: "slugs", type: "string[]", optional: true, description: "Array with the slugs that corresponds to each object in `accessPoints` parameter, in the order in which they were defined. If an element in the array is undefined or null, the slug will be generated by the platform." },
					{ name: "requestOptions", type: "CarbonLDP.HTTP.RequestOptions", optional: true, description: "Customizable options for the request." },
				],
				{ type: "Promise<(T & CarbonLDP.AccessPoint)[]>", description: "Promise that contains the new and UNRESOLVED persisted access points." }
			), ():void => {} );

			it( hasSignature(
				[ "T extends object" ],
				"Persists multiple access points objects for the specified document.", [
					{ name: "documentURI", type: "string", description: "URI of the document where to create the new access points." },
					{ name: "accessPoints", type: "T & CarbonLDP.BaseAccessPoint", description: "Array with the access points to persist." },
					{ name: "requestOptions", type: "CarbonLDP.HTTP.RequestOptions", optional: true, description: "Customizable options for the request." },
				],
				{ type: "Promise<(T & CarbonLDP.AccessPoint)[]>", description: "Promise that contains the new and UNRESOLVED persisted access points." }
			), ():void => {} );

			it( isDefined(), () => {
				expect( Documents.prototype.createAccessPoints ).toBeDefined();
				expect( Documents.prototype.createAccessPoints ).toEqual( jasmine.any( Function ) );
			} );

			describe( "When Documents has a specified context", ():void => {

				let context:AbstractContext;
				let documents:Documents;
				beforeEach( ():void => {
					context = new class extends AbstractContext {
						_baseURI:string = "https://example.com/";
						settings:ContextSettings = { vocabulary: "https://example.com/ns#" };
					};
					documents = context.documents;
				} );

				it( "should reject promise if URI is not in the context base", ( done:DoneFn ):void => {
					const accessPoint:BaseAccessPoint = { hasMemberRelation: "member-relation" };
					const promise:Promise<any> = documents.createAccessPoints( "https://not-example.com", [ accessPoint ] );
					promise.then( () => {
						done.fail( "Should not resolve promise." );
					} ).catch( error => {
						expect( error.message ).toBe( `"https://not-example.com" isn't a valid URI for this Carbon instance.` );
						done();
					} );
				} );

				it( "should reject promise if prefixed URI cannot be resolved", ( done:DoneFn ):void => {
					const accessPoint:BaseAccessPoint = { hasMemberRelation: "member-relation" };
					const promise:Promise<any> = documents.createAccessPoints( "prefix:the-uri", [ accessPoint ] );
					promise.then( () => {
						done.fail( "Should not resolve promise." );
					} ).catch( error => {
						expect( error.message ).toBe( `The prefixed URI "prefix:the-uri" could not be resolved.` );
						done();
					} );
				} );

				it( "should call _parseErrorResponse when request error", ( done:DoneFn ):void => {
					jasmine.Ajax.stubRequest( "https://example.com/" ).andReturn( {
						status: 500,
						responseText: "",
					} );

					const error:Error = new Error( "Error message" );
					const spy:jasmine.Spy = spyOn( documents, "_parseErrorResponse" ).and.callFake( () => Promise.reject( error ) );

					documents.createAccessPoints( "https://example.com/", [ { hasMemberRelation: "memberRelation" } ] ).then( () => {
						done.fail( "Should not resolve" );
					} ).catch( _error => {
						expect( spy ).toHaveBeenCalled();

						expect( _error ).toBeDefined();
						expect( _error ).toBe( error );

						done();
					} );
				} );


				it( "should convert plain access-point into document access-point before requests", ( done:DoneFn ):void => {
					const spy:jasmine.Spy = spyOn( TransientAccessPoint, "createFrom" ).and.callThrough();
					spyOn( documents, "_persistDocument" as any ).and.returnValue( Promise.resolve() );

					const accessPoints:BaseAccessPoint[] = [
						{ hasMemberRelation: "member-relation-0" },
						{ hasMemberRelation: "member-relation-1" },
						{ hasMemberRelation: "member-relation-2" },
					];

					documents
						.createAccessPoints( "https://example.com/parent-resource/", accessPoints )
						.then( () => {
							expect( spy ).toHaveBeenCalledWith( accessPoints[ 0 ] );
							expect( spy ).toHaveBeenCalledWith( accessPoints[ 1 ] );
							expect( spy ).toHaveBeenCalledWith( accessPoints[ 2 ] );

							done();
						} )
						.catch( done.fail );
				} );

				it( "should reject if any access-point is already persisted", ( done:DoneFn ):void => {
					const accessPoints:(BaseAccessPoint | BaseAccessPoint & Document)[] = [
						{ hasMemberRelation: "member-relation-0" },
						Document.decorate( { id: "https://example.com/some-resource-1/", hasMemberRelation: "member-relation-1" }, documents ),
						Document.decorate( { id: "https://example.com/some-resource-2/", hasMemberRelation: "member-relation-2" }, documents ),
					];

					documents.createAccessPoints( "https://example.com/parent-resource/", accessPoints )
						.then( () => {
							done.fail( "Should not resolve" );
						} )
						.catch( error => {
							expect( error ).toEqual( jasmine.any( Errors.IllegalArgumentError ) );
							expect( error.message ).toEqual( "The access-point provided has been already persisted." );
							done();
						} )
					;
				} );

				it( "should reject if access-point has incorrect membershipResource", ( done:DoneFn ):void => {
					const accessPoints:BaseAccessPoint[] = [
						TransientAccessPoint.create( { membershipResource: documents.getPointer( "parent-resource/" ), hasMemberRelation: "member-relation-0" } ),
						TransientAccessPoint.create( { membershipResource: documents.getPointer( "NOT-parent-resource/" ), hasMemberRelation: "member-relation-1" } ),
						TransientAccessPoint.create( { membershipResource: documents.getPointer( "NOT-parent-resource/" ), hasMemberRelation: "member-relation-2" } ),
					];

					documents.createAccessPoints( "https://example.com/parent-resource/", accessPoints )
						.then( () => {
							done.fail( "Should not resolve" );
						} )
						.catch( error => {
							expect( error ).toEqual( jasmine.any( Errors.IllegalArgumentError ) );
							expect( error.message ).toEqual( "The documentURI must be the same as the accessPoint's membershipResource." );
							done();
						} )
					;
				} );

				it( "should process the access-points into a valid persisted access-points", ( done:DoneFn ):void => {
					const accessPoints:BaseAccessPoint[] = [
						{ hasMemberRelation: "member-relation-0" },
						{ hasMemberRelation: "member-relation-1" },
						{ hasMemberRelation: "member-relation-2" },
					];

					documents.createAccessPoints( "https://example.com/parent-resource/", accessPoints )
						.then( ( persistedDocuments:AccessPoint[] ):void => {
							expect( persistedDocuments ).toEqual( new Array( 3 ).fill( jasmine.anything() ) );
							persistedDocuments.forEach( ( document, index ) => {
								expect( accessPoints[ index ] ).toBe( document );

								expect( Document.is( document ) ).toBe( true );
								expect( document ).toEqual( jasmine.objectContaining( {
									_resolved: false,
									id: `https://example.com/parent-resource/new-access-point-${ index }/`,
									hasMemberRelation: `member-relation-${ index }` as any,
								} ) );
							} );

							done();
						} )
						.catch( done.fail );

					accessPoints.forEach( ( childObject, index ) => {
						jasmine.Ajax.requests.at( index ).respondWith( {
							status: 200,
							responseHeaders: {
								"Location": `https://example.com/parent-resource/new-access-point-${ index }/`,
							},
						} );
					} );
				} );

				it( "should send expected headers", ( done:DoneFn ):void => {
					const accessPoints:BaseAccessPoint[] = [
						{ hasMemberRelation: "member-relation-0" },
						{ hasMemberRelation: "member-relation-1" },
						{ hasMemberRelation: "member-relation-2" },
					];

					documents.createAccessPoints( "https://example.com/parent-resource/", accessPoints )
						.then( ():void => {
							accessPoints.forEach( ( accessPoint, index ) => {
								const request:JasmineAjaxRequest = jasmine.Ajax.requests.at( index );
								expect( request.requestHeaders ).toEqual( {
									"content-type": "application/ld+json",
									"accept": "application/ld+json",
									"prefer": [
										`return=minimal`,
										`${ LDP.RDFSource }; rel=interaction-model`,
									].join( ", " ),
								} );
							} );

							done();
						} )
						.catch( done.fail );

					accessPoints.forEach( ( accessPoint, index ) => {
						jasmine.Ajax.requests.at( index ).respondWith( {
							status: 200,
							responseHeaders: {
								"Location": `https://example.com/parent-resource/new-access-pint-${ index }/`,
							},
						} );
					} );
				} );

				it( "should send expected headers with slug", ( done:DoneFn ):void => {
					const accessPoints:BaseAccessPoint[] = [
						{ hasMemberRelation: "member-relation-0" },
						{ hasMemberRelation: "member-relation-1" },
						{ hasMemberRelation: "member-relation-2" },
					];
					const slugs:string[] = [ "slug-1", null, "slug-3" ];

					documents.createAccessPoints( "https://example.com/parent-resource/", accessPoints, slugs )
						.then( ():void => {
							accessPoints.forEach( ( accessPoint, index ) => {
								const request:JasmineAjaxRequest = jasmine.Ajax.requests.at( index );
								expect( request.requestHeaders ).toEqual( {
									"content-type": "application/ld+json",
									"accept": "application/ld+json",
									"prefer": [
										`return=minimal`,
										`${ LDP.RDFSource }; rel=interaction-model`,
									].join( ", " ),
									...slugs[ index ] ? { slug: slugs[ index ] } : {},
								} );
							} );

							done();
						} )
						.catch( done.fail );

					accessPoints.forEach( ( accessPoint, index ) => {
						jasmine.Ajax.requests.at( index ).respondWith( {
							status: 200,
							responseHeaders: {
								"Location": `https://example.com/parent-resource/new-access-point-${ index }/`,
							},
						} );
					} );
				} );

			} );

			describe( "When Documents does not have a context", ():void => {
				let documents:Documents;

				beforeEach( () => {
					documents = new Documents();
				} );

				it( "should reject if URI is relative", ( done:DoneFn ):void => {
					const accessPoint:BaseAccessPoint = { hasMemberRelation: "member-relation" };
					const promise:Promise<any> = documents.createAccessPoints( "relative-uri/", [ accessPoint ] );
					promise.then( () => {
						done.fail( "Should not resolve promise." );
					} ).catch( error => {
						expect( error.message ).toBe( "This Documents instance doesn't support relative URIs." );
						done();
					} );
				} );

				it( "should reject if URI is prefixed", ( done:DoneFn ):void => {
					const accessPoint:BaseAccessPoint = { hasMemberRelation: "member-relation" };
					const promise:Promise<any> = documents.createAccessPoints( "prefix:the-uri", [ accessPoint ] );
					promise.then( () => {
						done.fail( "Should not resolve promise." );
					} ).catch( error => {
						expect( error.message ).toBe( "This Documents instance doesn't support prefixed URIs." );
						done();
					} );
				} );

				it( "should call _parseErrorResponse when request error", ( done:DoneFn ):void => {
					jasmine.Ajax.stubRequest( "https://example.com/" ).andReturn( {
						status: 500,
						responseText: "",
					} );

					const error:Error = new Error( "Error message" );
					const spy:jasmine.Spy = spyOn( documents, "_parseErrorResponse" ).and.callFake( () => Promise.reject( error ) );

					documents.createAccessPoints( "https://example.com/", [ { hasMemberRelation: "memberRelation" } ] ).then( () => {
						done.fail( "Should not resolve" );
					} ).catch( _error => {
						expect( spy ).toHaveBeenCalled();

						expect( _error ).toBeDefined();
						expect( _error ).toBe( error );

						done();
					} );
				} );

			} );

		} );


		describe( method( INSTANCE, "listMembers" ), () => {

			it( hasSignature(
				[ "T extends object" ],
				"Retrieves the empty members of a document.", [
					{ name: "uri", type: "string", description: "URI of the document from where to look for its members." },
					{ name: "requestOptions", type: "CarbonLDP.HTTP.RequestOptions", optional: true, description: "Customizable options for the request." },
				],
				{ type: "Promise<(T & CarbonLDP.Document)[]>" }
			), () => {} );

			it( isDefined(), () => {
				expect( Documents.prototype.listMembers ).toBeDefined();
				expect( Documents.prototype.listMembers ).toEqual( jasmine.any( Function ) );
			} );

			describe( "When Documents has a specified context", ():void => {

				let context:AbstractContext;
				let documents:Documents;
				beforeEach( () => {
					context = new class extends AbstractContext {
						_baseURI:string = "https://example.com/";
						settings:ContextSettings = { vocabulary: "https://example.com/ns#" };
					};
					documents = context.documents;
				} );

				it( "should reject promise if URI is not in the context base", ( done:DoneFn ):void => {
					const promise:Promise<any> = documents.listMembers( "http://not-example.com" );
					promise.then( () => {
						done.fail( "Should not resolve promise." );
					} ).catch( error => {
						expect( error.message ).toBe( `"http://not-example.com" isn't a valid URI for this Carbon instance.` );
						done();
					} );
				} );

				it( "should reject promise if prefixed URI cannot be resolved", ( done:DoneFn ):void => {
					const promise:Promise<any> = documents.listMembers( "prefix:the-uri" );
					promise.then( () => {
						done.fail( "Should not resolve promise." );
					} ).catch( error => {
						expect( error.message ).toBe( `The prefixed URI "prefix:the-uri" could not be resolved.` );
						done();
					} );
				} );

				it( "should call _parseErrorResponse when request error", ( done:DoneFn ):void => {
					jasmine.Ajax.stubRequest( "https://example.com/" ).andReturn( {
						status: 500,
						responseText: "",
					} );

					const error:Error = new Error( "Error message" );
					const spy:jasmine.Spy = spyOn( documents, "_parseErrorResponse" ).and.callFake( () => Promise.reject( error ) );

					documents.listMembers( "https://example.com/" ).then( () => {
						done.fail( "Should not resolve" );
					} ).catch( _error => {
						expect( spy ).toHaveBeenCalled();

						expect( _error ).toBeDefined();
						expect( _error ).toBe( error );

						done();
					} );
				} );


				it( "should send a CONSTRUCT query", ( done:DoneFn ):void => {
					const sendSpy:jasmine.Spy = spyOn( documents, "executeRawCONSTRUCTQuery" )
						.and.returnValue( Promise.reject( null ) );

					documents.listMembers( "https://example.com/resource/" )
						.then( () => done.fail( "Should not resolve, spy is makes it fail." ) )
						.catch( ( error ) => {
							if( error ) done.fail( error );

							expect( sendSpy ).toHaveBeenCalledWith(
								"https://example.com/resource/",

								"CONSTRUCT {" +
								` ?metadata a <${ C.VolatileResource }>, <${ C.QueryMetadata }>;` +
								"" + ` <${ C.target }> ?member.` +

								" ?member a ?member__types " +

								"} WHERE {" +
								" BIND(BNODE() AS ?metadata)." +

								" {" +
								"" + " SELECT DISTINCT ?member WHERE {" +
								"" + "" + " <https://example.com/resource/> <http://www.w3.org/ns/ldp#membershipResource> ?membershipResource;" +
								"" + "" + "" + " <http://www.w3.org/ns/ldp#hasMemberRelation> ?hasMemberRelation." +
								"" + "" + " ?membershipResource ?hasMemberRelation ?member" +
								"" + " }" +
								" }." +

								" OPTIONAL { ?member a ?member__types } " +

								"}",

								jasmine.objectContaining( {
									headers: new Map( [
										[ "prefer", new Header( [
											`include="${ C.PreferResultsContext }"`,
										] ) ],
									] ),
								} )
							);

							done();
						} );
				} );

				it( "should return the members", ( done:DoneFn ):void => {
					jasmine.Ajax.stubRequest( "https://example.com/resource/" ).andReturn( {
						status: 200,
						responseText: `[ {
							"@id":"_:1",
							"@type": [
								"${ C.VolatileResource }",
								"${ C.QueryMetadata }"
							],
							"${ C.target }": [ {
								"@id":"https://example.com/resource/member1/"
							} ]
						}, {
							"@id":"_:2",
							"@type": [
								"${ C.VolatileResource }",
								"${ C.QueryMetadata }"
							],
							"${ C.target }": [ {
								"@id":"https://example.com/resource/member2/"
							} ]
						}, {
							"@id": "https://example.com/resource/member1/",
							"@graph": [ {
								"@id": "https://example.com/resource/member1/",
								"@type": [
									"${ C.Document }",
									"https://example.com/ns#Resource",
									"${ LDP.BasicContainer }",
									"${ LDP.RDFSource }"
								]
							} ]
						}, {
							"@id": "https://example.com/resource/member2/",
							"@graph": [ {
								"@id": "https://example.com/resource/member2/",
								"@type": [
									"${ C.Document }",
									"https://example.com/ns#Resource",
									"${ LDP.BasicContainer }",
									"${ LDP.RDFSource }"
								]
							} ]
						} ]`,
					} );

					documents
						.listMembers( "https://example.com/resource/" )
						.then( ( myDocuments ) => {
							expect( myDocuments ).toEqual( jasmine.any( Array ) );
							expect( myDocuments.length ).toBe( 2 );

							expect( Document.is( myDocuments[ 0 ] ) ).toBe( true );
							expect( myDocuments[ 0 ] ).toEqual( jasmine.objectContaining( {
								"_eTag": void 0,
								"_resolved": false,
								"types": [
									`${ C.Document }`,
									`https://example.com/ns#Resource`,
									`${ LDP.BasicContainer }`,
									`${ LDP.RDFSource }`,
								],
							} ) );

							expect( Document.is( myDocuments[ 1 ] ) ).toBe( true );
							expect( myDocuments[ 1 ] ).toEqual( jasmine.objectContaining( {
								"_eTag": void 0,
								"_resolved": false,
								"types": [
									`${ C.Document }`,
									`https://example.com/ns#Resource`,
									`${ LDP.BasicContainer }`,
									`${ LDP.RDFSource }`,
								],
							} ) );

							done();
						} )
						.catch( done.fail );
				} );

				it( "should NOT return partial members", ( done:DoneFn ):void => {
					jasmine.Ajax.stubRequest( "https://example.com/resource/" ).andReturn( {
						status: 200,
						responseText: `[ {
							"@id":"_:1",
							"@type": [
								"${ C.VolatileResource }",
								"${ C.QueryMetadata }"
							],
							"${ C.target }": [ {
								"@id":"https://example.com/resource/member1/"
							} ]
						}, {
							"@id":"_:2",
							"@type": [
								"${ C.VolatileResource }",
								"${ C.QueryMetadata }"
							],
							"${ C.target }": [ {
								"@id":"https://example.com/resource/member2/"
							} ]
						}, {
							"@id": "https://example.com/resource/member1/",
							"@graph": [ {
								"@id": "https://example.com/resource/member1/",
								"@type": [
									"${ C.Document }",
									"https://example.com/ns#Resource",
									"${ LDP.BasicContainer }",
									"${ LDP.RDFSource }"
								]
							} ]
						}, {
							"@id": "https://example.com/resource/member2/",
							"@graph": [ {
								"@id": "https://example.com/resource/member2/",
								"@type": [
									"${ C.Document }",
									"https://example.com/ns#Resource",
									"${ LDP.BasicContainer }",
									"${ LDP.RDFSource }"
								]
							} ]
						} ]`,
					} );

					documents
						.listMembers( "https://example.com/resource/" )
						.then( ( myDocuments ) => {
							expect( myDocuments ).toEqual( jasmine.any( Array ) );
							expect( myDocuments.length ).toBe( 2 );

							expect( Document.is( myDocuments[ 0 ] ) ).toBe( true );
							expect( myDocuments[ 0 ].isPartial() ).toBe( false );

							expect( Document.is( myDocuments[ 1 ] ) ).toBe( true );
							expect( myDocuments[ 1 ].isPartial() ).toBe( false );

							done();
						} )
						.catch( done.fail );
				} );

			} );

			describe( "When Documents does not have a context", ():void => {

				let documents:Documents;
				beforeEach( () => {
					documents = new Documents();
				} );

				it( "should reject if URI is relative", ( done:DoneFn ):void => {
					const promise:Promise<any> = documents.listMembers( "relative-uri/" );
					promise.then( () => {
						done.fail( "Should not resolve promise." );
					} ).catch( error => {
						expect( error.message ).toBe( "This Documents instance doesn't support relative URIs." );
						done();
					} );
				} );

				it( "should reject if URI is prefixed", ( done:DoneFn ):void => {
					const promise:Promise<any> = documents.listMembers( "prefix:the-uri" );
					promise.then( () => {
						done.fail( "Should not resolve promise." );
					} ).catch( error => {
						expect( error.message ).toBe( "This Documents instance doesn't support prefixed URIs." );
						done();
					} );
				} );

				it( "should call _parseErrorResponse when request error", ( done:DoneFn ):void => {
					jasmine.Ajax.stubRequest( "https://example.com/" ).andReturn( {
						status: 500,
						responseText: "",
					} );

					const error:Error = new Error( "Error message" );
					const spy:jasmine.Spy = spyOn( documents, "_parseErrorResponse" ).and.callFake( () => Promise.reject( error ) );

					documents.listMembers( "https://example.com/" ).then( () => {
						done.fail( "Should not resolve" );
					} ).catch( _error => {
						expect( spy ).toHaveBeenCalled();

						expect( _error ).toBeDefined();
						expect( _error ).toBe( error );

						done();
					} );
				} );


				it( "should send a CONSTRUCT query", ( done:DoneFn ):void => {
					const sendSpy:jasmine.Spy = spyOn( documents, "executeRawCONSTRUCTQuery" )
						.and.returnValue( Promise.reject( null ) );

					documents.listMembers( "https://example.com/resource/" )
						.then( () => done.fail( "Should not resolve, spy is makes it fail." ) )
						.catch( ( error ) => {
							if( error ) done.fail( error );

							expect( sendSpy ).toHaveBeenCalledWith(
								"https://example.com/resource/",

								"CONSTRUCT {" +
								` ?metadata a <${ C.VolatileResource }>, <${ C.QueryMetadata }>;` +
								"" + ` <${ C.target }> ?member.` +

								" ?member a ?member__types " +

								"} WHERE {" +
								" BIND(BNODE() AS ?metadata)." +

								" {" +
								"" + " SELECT DISTINCT ?member WHERE {" +
								"" + "" + " <https://example.com/resource/> <http://www.w3.org/ns/ldp#membershipResource> ?membershipResource;" +
								"" + "" + "" + " <http://www.w3.org/ns/ldp#hasMemberRelation> ?hasMemberRelation." +
								"" + "" + " ?membershipResource ?hasMemberRelation ?member" +
								"" + " }" +
								" }." +

								" OPTIONAL { ?member a ?member__types } " +

								"}",

								jasmine.objectContaining( {
									headers: new Map( [
										[ "prefer", new Header( [
											`include="${ C.PreferResultsContext }"`,
										] ) ],
									] ),
								} )
							);
							done();
						} );
				} );

				it( "should return the children", ( done:DoneFn ):void => {
					jasmine.Ajax.stubRequest( "https://example.com/resource/" ).andReturn( {
						status: 200,
						responseText: `[ {
							"@id":"_:1",
							"@type": [
								"${ C.VolatileResource }",
								"${ C.QueryMetadata }"
							],
							"${ C.target }": [ {
								"@id":"https://example.com/resource/member1/"
							} ]
						}, {
							"@id":"_:2",
							"@type": [
								"${ C.VolatileResource }",
								"${ C.QueryMetadata }"
							],
							"${ C.target }": [ {
								"@id":"https://example.com/resource/member2/"
							} ]
						}, {
							"@id": "https://example.com/resource/member1/",
							"@graph": [ {
								"@id": "https://example.com/resource/member1/",
								"@type": [
									"${ C.Document }",
									"https://example.com/ns#Resource",
									"${ LDP.BasicContainer }",
									"${ LDP.RDFSource }"
								]
							} ]
						}, {
							"@id": "https://example.com/resource/member2/",
							"@graph": [ {
								"@id": "https://example.com/resource/member2/",
								"@type": [
									"${ C.Document }",
									"https://example.com/ns#Resource",
									"${ LDP.BasicContainer }",
									"${ LDP.RDFSource }"
								]
							} ]
						} ]`,
					} );

					documents
						.listMembers( "https://example.com/resource/" )
						.then( ( myDocuments ) => {
							expect( myDocuments ).toEqual( jasmine.any( Array ) );
							expect( myDocuments.length ).toBe( 2 );

							expect( Document.is( myDocuments[ 0 ] ) ).toBe( true );
							expect( myDocuments[ 0 ] ).toEqual( jasmine.objectContaining( {
								"_eTag": void 0,
								"_resolved": false,
								"types": [
									`${ C.Document }`,
									`https://example.com/ns#Resource`,
									`${ LDP.BasicContainer }`,
									`${ LDP.RDFSource }`,
								],
							} ) );

							expect( Document.is( myDocuments[ 0 ] ) ).toBe( true );
							expect( myDocuments[ 1 ] ).toEqual( jasmine.objectContaining( {
								"_eTag": void 0,
								"_resolved": false,
								"types": [
									`${ C.Document }`,
									`https://example.com/ns#Resource`,
									`${ LDP.BasicContainer }`,
									`${ LDP.RDFSource }`,
								],
							} ) );

							done();
						} )
						.catch( done.fail );
				} );

				it( "should NOT return partial members", ( done:DoneFn ):void => {
					jasmine.Ajax.stubRequest( "https://example.com/resource/" ).andReturn( {
						status: 200,
						responseText: `[ {
							"@id":"_:1",
							"@type": [
								"${ C.VolatileResource }",
								"${ C.QueryMetadata }"
							],
							"${ C.target }": [ {
								"@id":"https://example.com/resource/member1/"
							} ]
						}, {
							"@id":"_:2",
							"@type": [
								"${ C.VolatileResource }",
								"${ C.QueryMetadata }"
							],
							"${ C.target }": [ {
								"@id":"https://example.com/resource/member2/"
							} ]
						}, {
							"@id": "https://example.com/resource/member1/",
							"@graph": [ {
								"@id": "https://example.com/resource/member1/",
								"@type": [
									"${ C.Document }",
									"https://example.com/ns#Resource",
									"${ LDP.BasicContainer }",
									"${ LDP.RDFSource }"
								]
							} ]
						}, {
							"@id": "https://example.com/resource/member2/",
							"@graph": [ {
								"@id": "https://example.com/resource/member2/",
								"@type": [
									"${ C.Document }",
									"https://example.com/ns#Resource",
									"${ LDP.BasicContainer }",
									"${ LDP.RDFSource }"
								]
							} ]
						} ]`,
					} );

					documents
						.listMembers( "https://example.com/resource/" )
						.then( ( myDocuments ) => {
							expect( myDocuments ).toEqual( jasmine.any( Array ) );
							expect( myDocuments.length ).toBe( 2 );

							expect( Document.is( myDocuments[ 0 ] ) ).toBe( true );
							expect( myDocuments[ 0 ].isPartial() ).toBe( false );

							expect( Document.is( myDocuments[ 1 ] ) ).toBe( true );
							expect( myDocuments[ 1 ].isPartial() ).toBe( false );

							done();
						} )
						.catch( done.fail );
				} );

			} );

		} );

		describe( method( INSTANCE, "getMembers" ), () => {

			it( hasSignature(
				[ "T extends object" ],
				"Retrieves the members of a document, building a query on which one is able to specify the properties to be retrieve and sub-documents' properties and on and on.", [
					{ name: "uri", type: "string", description: "URI of the document from where to look for its members." },
					{ name: "requestOptions", type: "CarbonLDP.HTTP.RequestOptions", optional: true, description: "Customizable options for the request." },
					{ name: "queryBuilderFn", type: "( queryBuilder:CarbonLDP.SPARQL.QueryDocument.QueryDocumentsBuilder ) => CarbonLDP.SPARQL.QueryDocument.QueryDocumentsBuilder", optional: true, description: "Function that receives a the builder that helps you to construct the member retrieval query.\nThe same builder must be returned." },
				],
				{ type: "Promise<(T & CarbonLDP.Document)[]>" }
			), () => {} );

			it( hasSignature(
				[ "T extends object" ],
				"Retrieves the members of a document, building a query on which one is able to specify the properties to be retrieve and sub-documents' properties and on and on.", [
					{ name: "uri", type: "string", description: "URI of the document from where to look for its members." },
					{ name: "queryBuilderFn", type: "( queryBuilder:CarbonLDP.SPARQL.QueryDocument.QueryDocumentsBuilder ) => CarbonLDP.SPARQL.QueryDocument.QueryDocumentsBuilder", optional: true, description: "Function that receives a the builder that helps you to construct the member retrieval query.\nThe same builder must be returned." },
				],
				{ type: "Promise<(T & CarbonLDP.Document)[]>" }
			), () => {} );

			it( isDefined(), () => {
				expect( Documents.prototype.getMembers ).toBeDefined();
				expect( Documents.prototype.getMembers ).toEqual( jasmine.any( Function ) );
			} );

			describe( "When Documents has a specified context", ():void => {

				let context:AbstractContext;
				let documents:Documents;
				beforeEach( () => {
					context = new class extends AbstractContext {
						_baseURI:string = "https://example.com/";
						settings:ContextSettings = { vocabulary: "https://example.com/ns#" };
					};
					documents = context.documents;
				} );

				it( "should reject promise if URI is not in the context base", ( done:DoneFn ):void => {
					const promise:Promise<any> = documents.getMembers( "http://not-example.com" );
					promise.then( () => {
						done.fail( "Should not resolve promise." );
					} ).catch( error => {
						expect( error.message ).toBe( `"http://not-example.com" isn't a valid URI for this Carbon instance.` );
						done();
					} );
				} );

				it( "should reject promise if prefixed URI cannot be resolved", ( done:DoneFn ):void => {
					const promise:Promise<any> = documents.getMembers( "prefix:the-uri" );
					promise.then( () => {
						done.fail( "Should not resolve promise." );
					} ).catch( error => {
						expect( error.message ).toBe( `The prefixed URI "prefix:the-uri" could not be resolved.` );
						done();
					} );
				} );

				it( "should call _parseErrorResponse when request error", ( done:DoneFn ):void => {
					jasmine.Ajax.stubRequest( "https://example.com/" ).andReturn( {
						status: 500,
						responseText: "",
					} );

					const error:Error = new Error( "Error message" );
					const spy:jasmine.Spy = spyOn( documents, "_parseErrorResponse" ).and.callFake( () => Promise.reject( error ) );

					documents.getMembers( "https://example.com/" ).then( () => {
						done.fail( "Should not resolve" );
					} ).catch( _error => {
						expect( spy ).toHaveBeenCalled();

						expect( _error ).toBeDefined();
						expect( _error ).toBe( error );

						done();
					} );
				} );


				it( "should send a partial construct query", ( done:DoneFn ):void => {
					interface MyDocument {
						property1:string;
						property2:{};
					}

					context.extendObjectSchema( {
						"schema": "https://schema.org/",
					} );
					context.extendObjectSchema( "Resource", {
						"property1": {
							"@id": "property-1",
							"@type": XSD.string,
						},
						"property2": {
							"@id": "property-2",
							"@type": XSD.integer,
						},
						"property3": {
							"@id": "https://schema.org/property-3",
							"@type": XSD.string,
						},
					} );

					const sendSpy:jasmine.Spy = spyOn( documents, "executeRawCONSTRUCTQuery" ).and.returnValue( Promise.reject( null ) );

					documents.getMembers<MyDocument>( "https://example.com/resource/", _ => _
						.withType( "Resource" )
						.properties( {
							"property1": _.inherit,
							"property2": {
								"@id": "https://schema.org/property-2",
								"@type": "@id",
								"query": __ => __.properties( {
									"property2": __.inherit,
									"property3": __.inherit,
								} ),
							},
						} )
						.orderBy( "property2" )
						.limit( 10 )
						.offset( 5 )
					).then( () => done.fail( "Should not resolve, spy is makes it fail." ) ).catch( ( error ) => {
						if( error ) done.fail( error );

						expect( sendSpy ).toHaveBeenCalledWith(
							"https://example.com/resource/",
							"PREFIX schema: <https://schema.org/> " +
							"CONSTRUCT {" +
							` ?metadata a <${ C.VolatileResource }>, <${ C.QueryMetadata }>;` +
							"" + ` <${ C.target }> ?member.` +

							" ?member a ?member__types;" +
							"" + " <https://example.com/ns#property-1> ?member__property1;" +
							"" + " schema:property-2 ?member__property2." +

							" ?member__property2 a ?member__property2__types;" +
							"" + " <https://example.com/ns#property-2> ?member__property2__property2;" +
							"" + " schema:property-3 ?member__property2__property3 " +

							"} WHERE {" +
							" BIND(BNODE() AS ?metadata)." +

							" {" +
							"" + " SELECT DISTINCT ?member WHERE {" +
							"" + "" + " <https://example.com/resource/> <http://www.w3.org/ns/ldp#membershipResource> ?membershipResource;" +
							"" + "" + "" + " <http://www.w3.org/ns/ldp#hasMemberRelation> ?hasMemberRelation." +
							"" + "" + " ?membershipResource ?hasMemberRelation ?member." +
							"" + "" + " OPTIONAL { ?member schema:property-2 ?member__property2 }" +
							"" + " }" +
							"" + " ORDER BY ?member__property2" +
							"" + " LIMIT 10" +
							"" + " OFFSET 5" +
							" }." +

							" OPTIONAL { ?member a ?member__types }." +
							" ?member a <https://example.com/ns#Resource>." +

							" OPTIONAL {" +
							"" + " ?member <https://example.com/ns#property-1> ?member__property1." +
							"" + " FILTER( datatype( ?member__property1 ) = <http://www.w3.org/2001/XMLSchema#string> )" +
							" }." +

							" OPTIONAL {" +
							"" + " ?member schema:property-2 ?member__property2." +
							"" + " FILTER( ! isLiteral( ?member__property2 ) )." +
							"" + " OPTIONAL { ?member__property2 a ?member__property2__types }." +

							"" + " OPTIONAL {" +
							"" + "" + " ?member__property2 <https://example.com/ns#property-2> ?member__property2__property2." +
							"" + "" + " FILTER( datatype( ?member__property2__property2 ) = <http://www.w3.org/2001/XMLSchema#integer> )" +
							"" + " }." +

							"" + " OPTIONAL {" +
							"" + "" + " ?member__property2 schema:property-3 ?member__property2__property3." +
							"" + "" + " FILTER( datatype( ?member__property2__property3 ) = <http://www.w3.org/2001/XMLSchema#string> )" +
							"" + " }" +
							" } " +
							"}",

							jasmine.objectContaining( {
								headers: new Map( [
									[ "prefer", new Header( [
										`include="${ C.PreferDocumentETags }"`,
										`include="${ C.PreferResultsContext }"`,
									] ) ],
								] ),
							} )
						);
						done();
					} );
				} );

				it( "should send a full construct query", ( done:DoneFn ):void => {
					interface MyDocument {
						property1:string;
						property2:{};
					}

					context.extendObjectSchema( "Resource", {
						"property1": {
							"@id": "property-1",
							"@type": XSD.string,
						},
						"property2": {
							"@id": "property-2",
							"@type": XSD.integer,
						},
						"property3": {
							"@id": "https://schema.org/property-3",
							"@type": XSD.string,
						},
					} );

					const sendSpy:jasmine.Spy = spyOn( documents, "executeRawCONSTRUCTQuery" ).and.returnValue( Promise.reject( null ) );

					documents.getMembers<MyDocument>( "https://example.com/resource/" )
						.then( () => done.fail( "Should not resolve, spy is makes it fail." ) )
						.catch( ( error ) => {
							if( error ) done.fail( error );

							expect( sendSpy ).toHaveBeenCalledWith(
								"https://example.com/resource/",
								"CONSTRUCT {" +
								` ?metadata a <${ C.VolatileResource }>, <${ C.QueryMetadata }>;` +
								"" + ` <${ C.target }> ?member.` +

								" ?member___subject ?member___predicate ?member___object " +

								"} WHERE {" +
								" BIND(BNODE() AS ?metadata)." +

								" {" +
								"" + " SELECT DISTINCT ?member WHERE {" +
								"" + "" + " <https://example.com/resource/> <http://www.w3.org/ns/ldp#membershipResource> ?membershipResource;" +
								"" + "" + "" + " <http://www.w3.org/ns/ldp#hasMemberRelation> ?hasMemberRelation." +
								"" + "" + " ?membershipResource ?hasMemberRelation ?member" +
								"" + " }" +
								" }." +

								" GRAPH ?member {" +
								"" + " ?member___subject ?member___predicate ?member___object" +
								" } " +

								"}",

								jasmine.objectContaining( {
									headers: new Map( [
										[ "prefer", new Header( [
											`include="${ C.PreferDocumentETags }"`,
											`include="${ C.PreferResultsContext }"`,
										] ) ],
									] ),
								} )
							);
							done();
						} );
				} );

				it( "should send a filtered .ALL construct query", ( done:DoneFn ):void => {
					interface MyDocument {
						property1:string;
						property2:{};
					}

					context.extendObjectSchema( {
						"schema": "https://schema.org/",
					} );
					context.extendObjectSchema( "Resource", {
						"property1": {
							"@id": "https://schema.org/property-1",
							"@type": XSD.string,
						},
						"property2": {
							"@id": "https://schema.org/property-2",
							"@type": XSD.integer,
						},
					} );

					const sendSpy:jasmine.Spy = spyOn( documents, "executeRawCONSTRUCTQuery" ).and.returnValue( Promise.reject( null ) );

					documents.getMembers<MyDocument>( "https://example.com/resource/", _ => {
						return _
							.properties( _.all )
							.orderBy( "property2" )
							.limit( 10 )
							.offset( 5 )
							;
					} )
						.then( () => done.fail( "Should not resolve, spy is makes it fail." ) )
						.catch( ( error ) => {
							if( error ) done.fail( error );

							expect( sendSpy ).toHaveBeenCalledWith(
								"https://example.com/resource/",
								"PREFIX schema: <https://schema.org/> " +
								"CONSTRUCT {" +
								` ?metadata a <${ C.VolatileResource }>, <${ C.QueryMetadata }>;` +
								"" + ` <${ C.target }> ?member.` +

								" ?member ?member___predicate ?member___object " +

								"} WHERE {" +
								" BIND(BNODE() AS ?metadata)." +

								" {" +
								"" + " SELECT DISTINCT ?member WHERE {" +
								"" + "" + " <https://example.com/resource/> <http://www.w3.org/ns/ldp#membershipResource> ?membershipResource;" +
								"" + "" + "" + " <http://www.w3.org/ns/ldp#hasMemberRelation> ?hasMemberRelation." +
								"" + "" + " ?membershipResource ?hasMemberRelation ?member." +
								"" + "" + " OPTIONAL { ?member schema:property-2 ?member__property2 }" +
								"" + " }" +
								"" + " ORDER BY ?member__property2" +
								"" + " LIMIT 10" +
								"" + " OFFSET 5" +
								" }." +

								" ?member ?member___predicate ?member___object." +

								" OPTIONAL {" +
								"" + " ?member schema:property-2 ?member__property2." +
								"" + " FILTER( datatype( ?member__property2 ) = <http://www.w3.org/2001/XMLSchema#integer> )" +
								" }" +

								" " +
								"}",

								jasmine.objectContaining( {
									headers: new Map( [
										[ "prefer", new Header( [
											`include="${ C.PreferDocumentETags }"`,
											`include="${ C.PreferResultsContext }"`,
										] ) ],
									] ),
								} )
							);
							done();
						} );
				} );

				it( "should send a correct filtered construct query", ( done:DoneFn ):void => {
					interface MyDocument {
						property1:string;
						property2:{};
					}

					context.extendObjectSchema( {
						"schema": "https://schema.org/",
						"ex": "https://example.com/ns#",
						"xsd": XSD.namespace,
					} );
					context.extendObjectSchema( "Resource", {
						"property1": {
							"@id": "property-1",
							"@type": XSD.string,
						},
						"property2": {
							"@id": "property-2",
							"@type": XSD.integer,
						},
						"property3": {
							"@id": "https://schema.org/property-3",
							"@type": XSD.string,
						},
					} );

					spyOn( documents, "executeRawCONSTRUCTQuery" ).and.returnValue( Promise.reject( null ) );

					const queryTokenClass:{ new( ...args:any[] ) } = QueryToken;
					let query:QueryToken;
					spyOn( TokensModule, "QueryToken" ).and.callFake( ( ...args:any[] ) => {
						return query = new queryTokenClass( ...args );
					} );

					documents.getMembers<MyDocument>( "https://example.com/resource/", _ => _
						.withType( "Resource" )
						.properties( {
							"property1": _.inherit,
							"property2": {
								"@id": "https://schema.org/property-2",
								"@type": "@id",
								"query": __ => __
									.properties( {
										"property2": {
											"query": ___ => ___
												.values( ___.value( 12345 ).withType( "integer" ) )
											,
										},
										"property3": __.inherit,
									} )
									.filter( `${ __.property( "property2" ) } = ${ __.value( 12345 ).withType( "integer" ) }` )
								,
							},
						} )
						.orderBy( "property2" )
						.limit( 10 )
						.offset( 5 )
					).then( () => done.fail( "Should not resolve, spy is makes it fail." ) ).catch( ( error ) => {
						if( error ) done.fail( error );

						const variableHelper:( name:string ) => VariableToken = name => {
							return jasmine.objectContaining( {
								token: "variable",
								name,
							} ) as any;
						};

						expect( query ).toEqual( new QueryToken(
							new ConstructToken()
								.addTriple( new SubjectToken( variableHelper( "metadata" ) )
									.addPredicate( new PredicateToken( "a" )
										.addObject( new IRIToken( C.VolatileResource ) )
										.addObject( new IRIToken( C.QueryMetadata ) )
									)
									.addPredicate( new PredicateToken( new IRIToken( C.target ) )
										.addObject( variableHelper( "member" ) )
									)
								)
								.addTriple( new SubjectToken( variableHelper( "member" ) )
									.addPredicate( new PredicateToken( "a" )
										.addObject( variableHelper( "member__types" ) )
									)
									.addPredicate( new PredicateToken( new PrefixedNameToken( "ex:property-1" ) )
										.addObject( variableHelper( "member__property1" ) )
									)
									.addPredicate( new PredicateToken( new PrefixedNameToken( "schema:property-2" ) )
										.addObject( variableHelper( "member__property2" ) )
									)
								)
								.addTriple( new SubjectToken( variableHelper( "member__property2" ) )
									.addPredicate( new PredicateToken( "a" )
										.addObject( variableHelper( "member__property2__types" ) )
									)
									.addPredicate( new PredicateToken( new PrefixedNameToken( "ex:property-2" ) )
										.addObject( variableHelper( "member__property2__property2" ) )
									)
									.addPredicate( new PredicateToken( new PrefixedNameToken( "schema:property-3" ) )
										.addObject( variableHelper( "member__property2__property3" ) )
									)
								)

								.addPattern( new BindToken( "BNODE()", variableHelper( "metadata" ) ) )
								.addPattern( new SelectToken( "DISTINCT" )
									.addVariable( variableHelper( "member" ) )
									.addPattern( new SubjectToken( new IRIToken( "https://example.com/resource/" ) )
										.addPredicate( new PredicateToken( new IRIToken( LDP.membershipResource ) )
											.addObject( variableHelper( "membershipResource" ) )
										)
										.addPredicate( new PredicateToken( new IRIToken( LDP.hasMemberRelation ) )
											.addObject( variableHelper( "hasMemberRelation" ) )
										)
									)
									.addPattern( new SubjectToken( variableHelper( "membershipResource" ) )
										.addPredicate( new PredicateToken( variableHelper( "hasMemberRelation" ) )
											.addObject( variableHelper( "member" ) )
										)
									)
									.addPattern( new OptionalToken()
										.addPattern( new SubjectToken( variableHelper( "member" ) )
											.addPredicate( new PredicateToken( new PrefixedNameToken( "schema:property-2" ) )
												.addObject( variableHelper( "member__property2" ) )
											)
										)
									)
									.addModifier( new OrderToken( variableHelper( "member__property2" ) ) )
									.addModifier( new LimitToken( 10 ) )
									.addModifier( new OffsetToken( 5 ) )
								)
								.addPattern(
									new OptionalToken()
										.addPattern( new SubjectToken( variableHelper( "member" ) )
											.addPredicate( new PredicateToken( "a" )
												.addObject( variableHelper( "member__types" ) )
											)
										)
								)
								.addPattern( new SubjectToken( variableHelper( "member" ) )
									.addPredicate( new PredicateToken( "a" )
										.addObject( new PrefixedNameToken( "ex:Resource" ) )
									)
								)
								.addPattern(
									new OptionalToken()
										.addPattern( new SubjectToken( variableHelper( "member" ) )
											.addPredicate( new PredicateToken( new PrefixedNameToken( "ex:property-1" ) )
												.addObject( variableHelper( "member__property1" ) )
											)
										)
										.addPattern( new FilterToken( "datatype( ?member__property1 ) = xsd:string" ) )
								)
								.addPattern( new FilterToken( `?member__property2__property2 = "12345"^^xsd:integer` ) )
								.addPattern( new SubjectToken( variableHelper( "member" ) )
									.addPredicate( new PredicateToken( new PrefixedNameToken( "schema:property-2" ) )
										.addObject( variableHelper( "member__property2" ) )
									)
								)
								.addPattern( new FilterToken( "! isLiteral( ?member__property2 )" ) )
								.addPattern( new OptionalToken()
									.addPattern( new SubjectToken( variableHelper( "member__property2" ) )
										.addPredicate( new PredicateToken( "a" )
											.addObject( variableHelper( "member__property2__types" ) )
										)
									)
								)
								.addPattern( new SubjectToken( variableHelper( "member__property2" ) )
									.addPredicate( new PredicateToken( new PrefixedNameToken( "ex:property-2" ) )
										.addObject( variableHelper( "member__property2__property2" ) )
									)
								)
								.addPattern( new FilterToken( "datatype( ?member__property2__property2 ) = xsd:integer" ) )
								.addPattern( new ValuesToken()
									.addValues(
										variableHelper( "member__property2__property2" ),
										new LiteralToken( 12345 ).setType( "xsd:integer" )
									)
								)
								.addPattern( new OptionalToken()
									.addPattern( new SubjectToken( variableHelper( "member__property2" ) )
										.addPredicate( new PredicateToken( new PrefixedNameToken( "schema:property-3" ) )
											.addObject( variableHelper( "member__property2__property3" ) )
										)
									)
									.addPattern( new FilterToken( "datatype( ?member__property2__property3 ) = xsd:string" ) )
								)
							)

								.addPrologues( new PrefixToken( "ex", new IRIToken( "https://example.com/ns#" ) ) )
								.addPrologues( new PrefixToken( "xsd", new IRIToken( XSD.namespace ) ) )
								.addPrologues( new PrefixToken( "schema", new IRIToken( "https://schema.org/" ) ) )
						);

						done();
					} );
				} );

				it( "should return partial members", ( done:DoneFn ):void => {
					jasmine.Ajax.stubRequest( "https://example.com/resource/" ).andReturn( {
						status: 200,
						responseText: `[ {
							"@id":"_:1",
							"@type": [
								"${ C.VolatileResource }",
								"${ C.QueryMetadata }"
							],
							"${ C.target }": [ {
								"@id":"${ context.baseURI }resource/member1/"
							} ]
						}, {
							"@id":"_:2",
							"@type": [
								"${ C.VolatileResource }",
								"${ C.QueryMetadata }"
							],
							"${ C.target }": [ {
								"@id":"${ context.baseURI }resource/member2/"
							} ]
						}, {
							"@id": "_:3",
							"@type": [
								"${ C.ResponseMetadata }",
								"${ C.VolatileResource }"
							],
							"${ C.documentMetadata }": [ {
								"@id": "_:4"
							}, {
								"@id": "_:5"
							} ]
						}, {
							"@id": "_:4",
							"@type": [
								"${ C.DocumentMetadata }",
								"${ C.VolatileResource }"
							],
							"${ C.eTag }": [ {
								"@value": "\\"1-12345\\""
							} ],
							"${ C.relatedDocument }": [ {
								"@id": "https://example.com/resource/member1/"
							} ]
						}, {
							"@id": "_:5",
							"@type": [
								"${ C.DocumentMetadata }",
								"${ C.VolatileResource }"
							],
							"${ C.eTag }": [ {
								"@value": "\\"2-12345\\""
							} ],
							"${ C.relatedDocument }": [ {
								"@id": "https://example.com/resource/member2/"
							} ]
						}, {
							"@id": "${ context.baseURI }resource/member1/",
							"@graph": [ {
								"@id": "${ context.baseURI }resource/member1/",
								"@type": [
									"${ C.Document }",
									"https://example.com/ns#Resource",
									"${ LDP.BasicContainer }",
									"${ LDP.RDFSource }"
								],
								"https://example.com/ns#property-1": [ {
									"@value": "value 1"
								} ],
								"https://schema.org/property-2": [ {
									"@id": "_:1"
								} ]
							}, {
								"@id": "_:1",
								"https://example.com/ns#property-2": [ {
									"@value": "12345",
									"@type": "${ XSD.integer }"
								} ],
								"https://schema.org/property-3": [ {
									"@value": "another value 1"
								} ]
							} ]
						}, {
							"@id": "${ context.baseURI }resource/member2/",
							"@graph": [ {
								"@id": "${ context.baseURI }resource/member2/",
								"@type": [
									"${ C.Document }",
									"https://example.com/ns#Resource",
									"${ LDP.BasicContainer }",
									"${ LDP.RDFSource }"
								],
								"https://example.com/ns#property-1": [ {
									"@value": "value 2"
								} ],
								"https://schema.org/property-2": [ {
									"@id": "_:2"
								} ]
							}, {
								"@id": "_:2",
								"https://example.com/ns#property-2": [ {
									"@value": "67890",
									"@type": "${ XSD.integer }"
								} ],
								"https://schema.org/property-3": [ {
									"@value": "another value 2"
								} ]
							} ]
						} ]`,
					} );

					interface MyDocument {
						property1:string;
						property2:{};
					}

					context.extendObjectSchema( {
						"schema": "https://schema.org/",
					} );
					context.extendObjectSchema( "Resource", {
						"property1": {
							"@id": "property-1",
							"@type": XSD.string,
						},
						"property2": {
							"@id": "property-2",
							"@type": XSD.integer,
						},
						"property3": {
							"@id": "https://schema.org/property-3",
							"@type": XSD.string,
						},
					} );

					documents.getMembers<MyDocument>( "https://example.com/resource/", _ => _
						.withType( "Resource" )
						.properties( {
							"property1": _.inherit,
							"property2": {
								"@id": "https://schema.org/property-2",
								"@type": "@id",
								"query": __ => __.properties( {
									"property2": __.inherit,
									"property3": __.inherit,
								} ),
							},
						} )
					).then( ( myDocuments ) => {
						expect( myDocuments ).toEqual( jasmine.any( Array ) );
						expect( myDocuments.length ).toBe( 2 );
						for( const document of myDocuments ) {
							expect( Document.is( document ) ).toBe( true );
						}

						expect( myDocuments[ 0 ] ).toEqual( jasmine.objectContaining( {
							"_eTag": "\"1-12345\"",
							"property1": "value 1",
							"property2": jasmine.objectContaining( {
								"property2": 12345,
								"property3": "another value 1",
							} ),
						} ) );
						expect( myDocuments[ 1 ] ).toEqual( jasmine.objectContaining( {
							"_eTag": "\"2-12345\"",
							"property1": "value 2",
							"property2": jasmine.objectContaining( {
								"property2": 67890,
								"property3": "another value 2",
							} ),
						} ) );
						done();
					} ).catch( done.fail );
				} );

				it( "should return full members", ( done:DoneFn ):void => {
					jasmine.Ajax.stubRequest( "https://example.com/resource/" ).andReturn( {
						status: 200,
						responseText: `[ {
							"@id":"_:1",
							"@type": [
								"${ C.VolatileResource }",
								"${ C.QueryMetadata }"
							],
							"${ C.target }": [ {
								"@id":"${ context.baseURI }resource/member1/"
							} ]
						}, {
							"@id":"_:2",
							"@type": [
								"${ C.VolatileResource }",
								"${ C.QueryMetadata }"
							],
							"${ C.target }": [ {
								"@id":"${ context.baseURI }resource/member2/"
							} ]
						}, {
							"@id": "_:3",
							"@type": [
								"${ C.ResponseMetadata }",
								"${ C.VolatileResource }"
							],
							"${ C.documentMetadata }": [ {
								"@id": "_:4"
							}, {
								"@id": "_:5"
							} ]
						}, {
							"@id": "_:4",
							"@type": [
								"${ C.DocumentMetadata }",
								"${ C.VolatileResource }"
							],
							"${ C.eTag }": [ {
								"@value": "\\"1-12345\\""
							} ],
							"${ C.relatedDocument }": [ {
								"@id": "https://example.com/resource/member1/"
							} ]
						}, {
							"@id": "_:5",
							"@type": [
								"${ C.DocumentMetadata }",
								"${ C.VolatileResource }"
							],
							"${ C.eTag }": [ {
								"@value": "\\"2-12345\\""
							} ],
							"${ C.relatedDocument }": [ {
								"@id": "https://example.com/resource/member2/"
							} ]
						}, {
							"@id": "${ context.baseURI }resource/member1/",
							"@graph": [ {
								"@id": "${ context.baseURI }resource/member1/",
								"@type": [
									"${ C.Document }",
									"https://schema.org/Resource",
									"${ LDP.BasicContainer }",
									"${ LDP.RDFSource }"
								],
								"https://schema.org/property-1": [ {
									"@value": "value 1"
								} ],
								"https://schema.org/property-2": [ {
									"@id": "_:1"
								} ]
							}, {
								"@id": "_:1",
								"@type": [
									"https://schema.org/Fragment"
								],
								"https://schema.org/property-3": [ {
									"@value": "another value 1"
								} ],
								"https://schema.org/property-4": [ {
									"@value": "12345",
									"@type": "${ XSD.integer }"
								} ]
							} ]
						}, {
							"@id": "${ context.baseURI }resource/member2/",
							"@graph": [ {
								"@id": "${ context.baseURI }resource/member2/",
								"@type": [
									"${ C.Document }",
									"https://schema.org/Resource",
									"${ LDP.BasicContainer }",
									"${ LDP.RDFSource }"
								],
								"https://schema.org/property-1": [ {
									"@value": "value 2"
								} ],
								"https://schema.org/property-2": [ {
									"@id": "_:2"
								} ]
							}, {
								"@id": "_:2",
								"@type": [
									"https://schema.org/Fragment"
								],
								"https://schema.org/property-3": [ {
									"@value": "another value 2"
								} ],
								"https://schema.org/property-4": [ {
									"@value": "67890",
									"@type": "${ XSD.integer }"
								} ]
							} ]
						} ]`,
					} );

					interface MyDocument {
						property1:string;
						property2:{
							property3:string;
							property4:number;
						};
					}

					context.extendObjectSchema( {
						"schema": "https://schema.org/",
					} );
					context.extendObjectSchema( "schema:Resource", {
						"property1": {
							"@id": "https://schema.org/property-1",
							"@type": XSD.string,
						},
						"property2": {
							"@id": "https://schema.org/property-2",
							"@type": "@id",
						},
					} );
					context.extendObjectSchema( "schema:Fragment", {
						"property3": {
							"@id": "https://schema.org/property-3",
							"@type": XSD.string,
						},
						"property4": {
							"@id": "https://schema.org/property-4",
							"@type": XSD.integer,
						},
					} );

					documents.getMembers<MyDocument>( "https://example.com/resource/" ).then( ( myDocuments ) => {
						expect( myDocuments ).toEqual( jasmine.any( Array ) );
						expect( myDocuments.length ).toBe( 2 );
						for( const document of myDocuments ) {
							expect( Document.is( document ) ).toBe( true );
							expect( document.isPartial() ).toBe( false );
						}

						expect( myDocuments[ 0 ] ).toEqual( jasmine.objectContaining( {
							"_eTag": "\"1-12345\"",
							"property1": "value 1",
							"property2": jasmine.objectContaining( {
								"property3": "another value 1",
								"property4": 12345,
							} ) as any,
						} ) );
						expect( myDocuments[ 1 ] ).toEqual( jasmine.objectContaining( {
							"_eTag": "\"2-12345\"",
							"property1": "value 2",
							"property2": jasmine.objectContaining( {
								"property3": "another value 2",
								"property4": 67890,
							} ) as any,
						} ) );
						done();
					} ).catch( done.fail );
				} );

				it( "should return .ALL members", ( done:DoneFn ):void => {
					jasmine.Ajax.stubRequest( "https://example.com/resource/" ).andReturn( {
						status: 200,
						responseText: `[ {
							"@id":"_:1",
							"@type": [
								"${ C.VolatileResource }",
								"${ C.QueryMetadata }"
							],
							"${ C.target }": [ {
								"@id":"${ context.baseURI }resource/child1/"
							} ]
						}, {
							"@id":"_:2",
							"@type": [
								"${ C.VolatileResource }",
								"${ C.QueryMetadata }"
							],
							"${ C.target }": [ {
								"@id":"${ context.baseURI }resource/child2/"
							} ]
						}, {
							"@id": "_:3",
							"@type": [
								"${ C.ResponseMetadata }",
								"${ C.VolatileResource }"
							],
							"${ C.documentMetadata }": [ {
								"@id": "_:4"
							}, {
								"@id": "_:5"
							} ]
						}, {
							"@id": "_:4",
							"@type": [
								"${ C.DocumentMetadata }",
								"${ C.VolatileResource }"
							],
							"${ C.eTag }": [ {
								"@value": "\\"1-12345\\""
							} ],
							"${ C.relatedDocument }": [ {
								"@id": "https://example.com/resource/child1/"
							} ]
						}, {
							"@id": "_:5",
							"@type": [
								"${ C.DocumentMetadata }",
								"${ C.VolatileResource }"
							],
							"${ C.eTag }": [ {
								"@value": "\\"2-12345\\""
							} ],
							"${ C.relatedDocument }": [ {
								"@id": "https://example.com/resource/child2/"
							} ]
						}, {
							"@id": "${ context.baseURI }resource/child1/",
							"@graph": [ {
								"@id": "${ context.baseURI }resource/child1/",
								"@type": [
									"${ C.Document }",
									"https://schema.org/Resource",
									"${ LDP.BasicContainer }",
									"${ LDP.RDFSource }"
								],
								"https://schema.org/property-1": [ {
									"@value": "value 1"
								} ],
								"https://schema.org/property-2": [ {
									"@id": "_:1"
								} ]
							} ]
						}, {
							"@id": "${ context.baseURI }resource/child2/",
							"@graph": [ {
								"@id": "${ context.baseURI }resource/child2/",
								"@type": [
									"${ C.Document }",
									"https://schema.org/Resource",
									"${ LDP.BasicContainer }",
									"${ LDP.RDFSource }"
								],
								"https://schema.org/property-1": [ {
									"@value": "value 2"
								} ],
								"https://schema.org/property-2": [ {
									"@id": "_:2"
								} ]
							} ]
						} ]`,
					} );

					interface MyDocument {
						property1:string;
						property2:{
							property3:string;
							property4:number;
						};
					}

					context.extendObjectSchema( {
						"schema": "https://schema.org/",
					} );
					context.extendObjectSchema( "schema:Resource", {
						"property1": {
							"@id": "https://schema.org/property-1",
							"@type": XSD.string,
						},
						"property2": {
							"@id": "https://schema.org/property-2",
							"@type": "@id",
						},
					} );
					context.extendObjectSchema( "schema:Fragment", {
						"property3": {
							"@id": "https://schema.org/property-3",
							"@type": XSD.string,
						},
						"property4": {
							"@id": "https://schema.org/property-4",
							"@type": XSD.integer,
						},
					} );

					documents.getMembers<MyDocument>( "https://example.com/resource/", _ => _.properties( _.all ) )
						.then( ( myDocuments ) => {
							expect( myDocuments ).toEqual( jasmine.any( Array ) );
							expect( myDocuments.length ).toBe( 2 );
							for( const document of myDocuments ) {
								expect( Document.is( document ) ).toBe( true );
								expect( document.isPartial() ).toBe( true );
							}

							expect( myDocuments[ 0 ] ).toEqual( jasmine.objectContaining( {
								"_eTag": "\"1-12345\"",
								"property1": "value 1",
								"property2": jasmine.any( Object ) as any,
							} ) );
							expect( myDocuments[ 0 ][ "property2" ] ).not.toEqual( jasmine.objectContaining( {
								"property3": "another value 1",
								"property4": 12345,
							} ) as any );

							expect( myDocuments[ 1 ] ).toEqual( jasmine.objectContaining( {
								"_eTag": "\"2-12345\"",
								"property1": "value 2",
								"property2": jasmine.any( Object ) as any,
							} ) );
							expect( myDocuments[ 0 ][ "property2" ] ).not.toEqual( jasmine.objectContaining( {
								"property3": "another value 2",
								"property4": 67890,
							} ) as any );

							done();
						} )
						.catch( done.fail );
				} );

				it( "should order returned members", ( done:DoneFn ):void => {
					jasmine.Ajax.stubRequest( "https://example.com/resource/" ).andReturn( {
						status: 200,
						responseText: `[ {
							"@id":"_:1",
							"@type": [
								"${ C.VolatileResource }",
								"${ C.QueryMetadata }"
							],
							"${ C.target }": [ {
								"@id":"${ context.baseURI }resource/child1/"
							} ]
						}, {
							"@id":"_:2",
							"@type": [
								"${ C.VolatileResource }",
								"${ C.QueryMetadata }"
							],
							"${ C.target }": [ {
								"@id":"${ context.baseURI }resource/child2/"
							} ]
						}, {
							"@id": "_:3",
							"@type": [
								"${ C.ResponseMetadata }",
								"${ C.VolatileResource }"
							],
							"${ C.documentMetadata }": [ {
								"@id": "_:4"
							}, {
								"@id": "_:5"
							} ]
						}, {
							"@id": "_:4",
							"@type": [
								"${ C.DocumentMetadata }",
								"${ C.VolatileResource }"
							],
							"${ C.eTag }": [ {
								"@value": "\\"1-12345\\""
							} ],
							"${ C.relatedDocument }": [ {
								"@id": "https://example.com/resource/child1/"
							} ]
						}, {
							"@id": "_:5",
							"@type": [
								"${ C.DocumentMetadata }",
								"${ C.VolatileResource }"
							],
							"${ C.eTag }": [ {
								"@value": "\\"2-12345\\""
							} ],
							"${ C.relatedDocument }": [ {
								"@id": "https://example.com/resource/child2/"
							} ]
						}, {
							"@id": "${ context.baseURI }resource/child1/",
							"@graph": [ {
								"@id": "${ context.baseURI }resource/child1/",
								"@type": [
									"${ C.Document }",
									"https://example.com/ns#Resource",
									"${ LDP.BasicContainer }",
									"${ LDP.RDFSource }"
								],
								"https://example.com/ns#property-1": [ {
									"@value": "value 1"
								} ],
								"https://schema.org/property-2": [ {
									"@id": "_:1"
								} ]
							}, {
								"@id": "_:1",
								"https://example.com/ns#property-2": [ {
									"@value": "12345",
									"@type": "${ XSD.integer }"
								} ],
								"https://schema.org/property-3": [ {
									"@value": "another value 1"
								} ]
							} ]
						}, {
							"@id": "${ context.baseURI }resource/child2/",
							"@graph": [ {
								"@id": "${ context.baseURI }resource/child2/",
								"@type": [
									"${ C.Document }",
									"https://example.com/ns#Resource",
									"${ LDP.BasicContainer }",
									"${ LDP.RDFSource }"
								],
								"https://example.com/ns#property-1": [ {
									"@value": "value 2"
								} ],
								"https://schema.org/property-2": [ {
									"@id": "_:2"
								} ]
							}, {
								"@id": "_:2",
								"https://example.com/ns#property-2": [ {
									"@value": "67890",
									"@type": "${ XSD.integer }"
								} ],
								"https://schema.org/property-3": [ {
									"@value": "another value 2"
								} ]
							} ]
						} ]`,
					} );

					interface MyDocument {
						property1:string;
						property2:{
							property2:number;
							property3:string;
						};
					}

					context.extendObjectSchema( {
						"schema": "https://schema.org/",
					} );
					context.extendObjectSchema( "Resource", {
						"property1": {
							"@id": "property-1",
							"@type": XSD.string,
						},
						"property2": {
							"@id": "property-2",
							"@type": XSD.integer,
						},
						"property3": {
							"@id": "https://schema.org/property-3",
							"@type": XSD.string,
						},
					} );

					documents.getMembers<MyDocument>( "https://example.com/resource/", _ => _
						.withType( "Resource" )
						.properties( {
							"property1": _.inherit,
							"property2": {
								"@id": "https://schema.org/property-2",
								"@type": "@id",
								"query": __ => __.properties( {
									"property2": __.inherit,
									"property3": __.inherit,
								} ),
							},
						} )
						.orderBy( "property2.property2", "DESC" )
					).then( ( myDocuments ) => {
						expect( myDocuments[ 0 ] ).toEqual( jasmine.objectContaining( {
							"property2": jasmine.objectContaining( {
								"property2": 67890,
							} ) as any,
						} ) );
						expect( myDocuments[ 1 ] ).toEqual( jasmine.objectContaining( {
							"property2": jasmine.objectContaining( {
								"property2": 12345,
							} ) as any,
						} ) );

						done();
					} ).catch( done.fail );
				} );

				it( "should return partial members with partial relations", ( done:DoneFn ):void => {
					jasmine.Ajax.stubRequest( "https://example.com/resource/" ).andReturn( {
						status: 200,
						responseText: `[ {
							"@id":"_:1",
							"@type": [
								"${ C.VolatileResource }",
								"${ C.QueryMetadata }"
							],
							"${ C.target }": [ {
								"@id":"${ context.baseURI }resource/member1/"
							} ]
						}, {
							"@id":"_:2",
							"@type": [
								"${ C.VolatileResource }",
								"${ C.QueryMetadata }"
							],
							"${ C.target }": [ {
								"@id":"${ context.baseURI }resource/member2/"
							} ]
						}, {
							"@id": "_:3",
							"@type": [
								"${ C.ResponseMetadata }",
								"${ C.VolatileResource }"
							],
							"${ C.documentMetadata }": [ {
								"@id": "_:4"
							}, {
								"@id": "_:5"
							}, {
								"@id": "_:6"
							}, {
								"@id": "_:7"
							} ]
						}, {
							"@id": "_:4",
							"@type": [
								"${ C.DocumentMetadata }",
								"${ C.VolatileResource }"
							],
							"${ C.eTag }": [ {
								"@value": "\\"1-12345\\""
							} ],
							"${ C.relatedDocument }": [ {
								"@id": "https://example.com/resource/member1/"
							} ]
						}, {
							"@id": "_:5",
							"@type": [
								"${ C.DocumentMetadata }",
								"${ C.VolatileResource }"
							],
							"${ C.eTag }": [ {
								"@value": "\\"2-12345\\""
							} ],
							"${ C.relatedDocument }": [ {
								"@id": "https://example.com/resource/member2/"
							} ]
						}, {
							"@id": "_:6",
							"@type": [
								"${ C.DocumentMetadata }",
								"${ C.VolatileResource }"
							],
							"${ C.eTag }": [ {
								"@value": "\\"3-12345\\""
							} ],
							"${ C.relatedDocument }": [ {
								"@id": "https://example.com/sub-documents/sub-document1/"
							} ]
						}, {
							"@id": "_:7",
							"@type": [
								"${ C.DocumentMetadata }",
								"${ C.VolatileResource }"
							],
							"${ C.eTag }": [ {
								"@value": "\\"4-12345\\""
							} ],
							"${ C.relatedDocument }": [ {
								"@id": "https://example.com/sub-documents/sub-document2/"
							} ]
						}, {
							"@id": "${ context.baseURI }resource/member1/",
							"@graph": [ {
								"@id": "${ context.baseURI }resource/member1/",
								"@type": [
									"${ C.Document }",
									"https://example.com/ns#Resource",
									"${ LDP.BasicContainer }",
									"${ LDP.RDFSource }"
								],
								"https://example.com/ns#property-1": [ {
									"@value": "value 1"
								} ],
								"https://schema.org/property-2": [ {
									"@id": "${ context.baseURI }sub-documents/sub-document1/"
								} ]
							} ]
						}, {
							"@id": "${ context.baseURI }sub-documents/sub-document1/",
							"@graph": [ {
								"@id": "${ context.baseURI }sub-documents/sub-document1/",
								"https://example.com/ns#property-2": [ {
									"@value": "12345",
									"@type": "${ XSD.integer }"
								} ],
								"https://schema.org/property-3": [ {
									"@value": "another value 1"
								} ]
							} ]
						}, {
							"@id": "${ context.baseURI }resource/member2/",
							"@graph": [ {
								"@id": "${ context.baseURI }resource/member2/",
								"@type": [
									"${ C.Document }",
									"https://example.com/ns#Resource",
									"${ LDP.BasicContainer }",
									"${ LDP.RDFSource }"
								],
								"https://example.com/ns#property-1": [ {
									"@value": "value 2"
								} ],
								"https://schema.org/property-2": [ {
									"@id": "${ context.baseURI }sub-documents/sub-document2/"
								} ]
							} ]
						}, {
							"@id": "${ context.baseURI }sub-documents/sub-document2/",
							"@graph": [ {
								"@id": "${ context.baseURI }sub-documents/sub-document2/",
								"https://example.com/ns#property-2": [ {
									"@value": "67890",
									"@type": "${ XSD.integer }"
								} ],
								"https://schema.org/property-3": [ {
									"@value": "another value 2"
								} ]
							} ]
						} ]`,
					} );

					interface MyDocument {
						property1:string;
						property2:{};
					}

					context.extendObjectSchema( {
						"schema": "https://schema.org/",
					} );
					context.extendObjectSchema( "Resource", {
						"property1": {
							"@id": "property-1",
							"@type": XSD.string,
						},
						"property2": {
							"@id": "property-2",
							"@type": XSD.integer,
						},
						"property3": {
							"@id": "https://schema.org/property-3",
							"@type": XSD.string,
						},
					} );

					documents.getMembers<MyDocument>( "https://example.com/resource/", _ => _
						.withType( "Resource" )
						.properties( {
							"property1": _.inherit,
							"property2": {
								"@id": "https://schema.org/property-2",
								"@type": "@id",
								"query": __ => __.properties( {
									"property2": __.inherit,
									"property3": __.inherit,
								} ),
							},
						} )
					).then( ( myDocuments ) => {
						expect( myDocuments ).toEqual( jasmine.any( Array ) );
						expect( myDocuments.length ).toBe( 2 );
						for( const document of myDocuments ) {
							expect( Document.is( document ) ).toBe( true );
						}

						expect( myDocuments[ 0 ] ).toEqual( jasmine.objectContaining( {
							"_eTag": "\"1-12345\"",
							"property1": "value 1",
							"property2": jasmine.objectContaining( {
								"_eTag": "\"3-12345\"",
								"property2": 12345,
								"property3": "another value 1",
							} ),
						} ) );
						expect( myDocuments[ 1 ] ).toEqual( jasmine.objectContaining( {
							"_eTag": "\"2-12345\"",
							"property1": "value 2",
							"property2": jasmine.objectContaining( {
								"_eTag": "\"4-12345\"",
								"property2": 67890,
								"property3": "another value 2",
							} ),
						} ) );
						done();
					} ).catch( done.fail );
				} );

			} );

			describe( "When Documents does not have a context", ():void => {

				let documents:Documents;
				beforeEach( () => {
					documents = new Documents();
				} );

				it( "should reject if URI is relative", ( done:DoneFn ):void => {
					const promise:Promise<any> = documents.getMembers( "relative-uri/" );
					promise.then( () => {
						done.fail( "Should not resolve promise." );
					} ).catch( error => {
						expect( error.message ).toBe( "This Documents instance doesn't support relative URIs." );
						done();
					} );
				} );

				it( "should reject if URI is prefixed", ( done:DoneFn ):void => {
					const promise:Promise<any> = documents.getMembers( "prefix:the-uri" );
					promise.then( () => {
						done.fail( "Should not resolve promise." );
					} ).catch( error => {
						expect( error.message ).toBe( "This Documents instance doesn't support prefixed URIs." );
						done();
					} );
				} );

				it( "should call _parseErrorResponse when request error", ( done:DoneFn ):void => {
					jasmine.Ajax.stubRequest( "https://example.com/" ).andReturn( {
						status: 500,
						responseText: "",
					} );

					const error:Error = new Error( "Error message" );
					const spy:jasmine.Spy = spyOn( documents, "_parseErrorResponse" ).and.callFake( () => Promise.reject( error ) );

					documents.getMembers( "https://example.com/" ).then( () => {
						done.fail( "Should not resolve" );
					} ).catch( _error => {
						expect( spy ).toHaveBeenCalled();

						expect( _error ).toBeDefined();
						expect( _error ).toBe( error );

						done();
					} );
				} );


				it( "should send a correct construct query", ( done:DoneFn ):void => {
					interface MyDocument {
						property1:string;
						property2:{};
					}

					const sendSpy:jasmine.Spy = spyOn( documents, "executeRawCONSTRUCTQuery" ).and.returnValue( Promise.reject( null ) );

					documents.getMembers<MyDocument>( "https://example.com/resource/", _ => _
						.withType( "https://example.com/ns#Resource" )
						.properties( {
							"property1": {
								"@id": "https://example.com/ns#property-1",
								"@type": XSD.string,
							},
							"property2": {
								"@id": "https://schema.org/property-2",
								"@type": "@id",
								"query": __ => __.properties( {
									"property2": {
										"@id": "https://example.com/ns#property-2",
										"@type": XSD.integer,
									},
									"property3": {
										"@id": "https://schema.org/property-3",
										"@type": XSD.string,
									},
								} ),
							},
						} )
						.orderBy( "property2" )
						.limit( 10 )
						.offset( 5 )
					).then( () => done.fail( "Should not resolve, spy is makes it fail." ) ).catch( ( error ) => {
						if( error ) done.fail( error );

						expect( sendSpy ).toHaveBeenCalledWith(
							"https://example.com/resource/", "" +
							"CONSTRUCT {" +
							` ?metadata a <${ C.VolatileResource }>, <${ C.QueryMetadata }>;` +
							"" + ` <${ C.target }> ?member.` +

							" ?member a ?member__types;" +
							"" + " <https://example.com/ns#property-1> ?member__property1;" +
							"" + " <https://schema.org/property-2> ?member__property2." +

							" ?member__property2 a ?member__property2__types;" +
							"" + " <https://example.com/ns#property-2> ?member__property2__property2;" +
							"" + " <https://schema.org/property-3> ?member__property2__property3 " +

							"} WHERE {" +
							" BIND(BNODE() AS ?metadata)." +

							" {" +
							"" + " SELECT DISTINCT ?member WHERE {" +
							"" + "" + " <https://example.com/resource/> <http://www.w3.org/ns/ldp#membershipResource> ?membershipResource;" +
							"" + "" + "" + " <http://www.w3.org/ns/ldp#hasMemberRelation> ?hasMemberRelation." +
							"" + "" + " ?membershipResource ?hasMemberRelation ?member." +
							"" + "" + " OPTIONAL { ?member <https://schema.org/property-2> ?member__property2 }" +
							"" + " }" +
							"" + " ORDER BY ?member__property2" +
							"" + " LIMIT 10" +
							"" + " OFFSET 5" +
							" }." +

							" OPTIONAL { ?member a ?member__types }." +
							" ?member a <https://example.com/ns#Resource>." +

							" OPTIONAL {" +
							"" + " ?member <https://example.com/ns#property-1> ?member__property1." +
							"" + " FILTER( datatype( ?member__property1 ) = <http://www.w3.org/2001/XMLSchema#string> )" +
							" }." +

							" OPTIONAL {" +
							"" + " ?member <https://schema.org/property-2> ?member__property2." +
							"" + " FILTER( ! isLiteral( ?member__property2 ) )." +
							"" + " OPTIONAL { ?member__property2 a ?member__property2__types }." +

							"" + " OPTIONAL {" +
							"" + "" + " ?member__property2 <https://example.com/ns#property-2> ?member__property2__property2." +
							"" + "" + " FILTER( datatype( ?member__property2__property2 ) = <http://www.w3.org/2001/XMLSchema#integer> )" +
							"" + " }." +

							"" + " OPTIONAL {" +
							"" + "" + " ?member__property2 <https://schema.org/property-3> ?member__property2__property3." +
							"" + "" + " FILTER( datatype( ?member__property2__property3 ) = <http://www.w3.org/2001/XMLSchema#string> )" +
							"" + " }" +
							" } " +
							"}",

							jasmine.objectContaining( {
								headers: new Map( [
									[ "prefer", new Header( [
										`include="${ C.PreferDocumentETags }"`,
										`include="${ C.PreferResultsContext }"`,
									] ) ],
								] ),
							} )
						);
						done();
					} );
				} );

				it( "should return partial members", ( done:DoneFn ):void => {
					jasmine.Ajax.stubRequest( "https://example.com/resource/" ).andReturn( {
						status: 200,
						responseText: `[ {
							"@id":"_:1",
							"@type": [
								"${ C.VolatileResource }",
								"${ C.QueryMetadata }"
							],
							"${ C.target }": [ {
								"@id":"https://example.com/resource/member1/"
							} ]
						}, {
							"@id":"_:2",
							"@type": [
								"${ C.VolatileResource }",
								"${ C.QueryMetadata }"
							],
							"${ C.target }": [ {
								"@id":"https://example.com/resource/member2/"
							} ]
						}, {
							"@id": "_:3",
							"@type": [
								"${ C.ResponseMetadata }",
								"${ C.VolatileResource }"
							],
							"${ C.documentMetadata }": [ {
								"@id": "_:4"
							}, {
								"@id": "_:5"
							} ]
						}, {
							"@id": "_:4",
							"@type": [
								"${ C.DocumentMetadata }",
								"${ C.VolatileResource }"
							],
							"${ C.eTag }": [ {
								"@value": "\\"1-12345\\""
							} ],
							"${ C.relatedDocument }": [ {
								"@id": "https://example.com/resource/member1/"
							} ]
						}, {
							"@id": "_:5",
							"@type": [
								"${ C.DocumentMetadata }",
								"${ C.VolatileResource }"
							],
							"${ C.eTag }": [ {
								"@value": "\\"2-12345\\""
							} ],
							"${ C.relatedDocument }": [ {
								"@id": "https://example.com/resource/member2/"
							} ]
						}, {
							"@id": "https://example.com/resource/member1/",
							"@graph": [ {
								"@id": "https://example.com/resource/member1/",
								"@type": [
									"${ C.Document }",
									"https://example.com/ns#Resource",
									"${ LDP.BasicContainer }",
									"${ LDP.RDFSource }"
								],
								"https://example.com/ns#property-1": [ {
									"@value": "value 1"
								} ],
								"https://schema.org/property-2": [ {
									"@id": "_:1"
								} ]
							}, {
								"@id": "_:1",
								"https://example.com/ns#property-2": [ {
									"@value": "12345",
									"@type": "${ XSD.integer }"
								} ],
								"https://schema.org/property-3": [ {
									"@value": "another value 1"
								} ]
							} ]
						}, {
							"@id": "https://example.com/resource/member2/",
							"@graph": [ {
								"@id": "https://example.com/resource/member2/",
								"@type": [
									"${ C.Document }",
									"https://example.com/ns#Resource",
									"${ LDP.BasicContainer }",
									"${ LDP.RDFSource }"
								],
								"https://example.com/ns#property-1": [ {
									"@value": "value 2"
								} ],
								"https://schema.org/property-2": [ {
									"@id": "_:2"
								} ]
							}, {
								"@id": "_:2",
								"https://example.com/ns#property-2": [ {
									"@value": "67890",
									"@type": "${ XSD.integer }"
								} ],
								"https://schema.org/property-3": [ {
									"@value": "another value 2"
								} ]
							} ]
						} ]`,
					} );

					interface MyDocument {
						property1:string;
						property2:{};
					}

					documents.getMembers<MyDocument>( "https://example.com/resource/", _ => _
						.withType( "https://example.com/ns#Resource" )
						.properties( {
							"property1": {
								"@id": "https://example.com/ns#property-1",
								"@type": XSD.string,
							},
							"property2": {
								"@id": "https://schema.org/property-2",
								"@type": "@id",
								"query": __ => __.properties( {
									"property2": {
										"@id": "https://example.com/ns#property-2",
										"@type": XSD.integer,
									},
									"property3": {
										"@id": "https://schema.org/property-3",
										"@type": XSD.string,
									},
								} ),
							},
						} )
					).then( ( myDocuments ) => {
						expect( myDocuments ).toEqual( jasmine.any( Array ) );
						expect( myDocuments.length ).toBe( 2 );
						for( const document of myDocuments ) {
							expect( Document.is( document ) ).toBe( true );
						}

						expect( myDocuments[ 0 ] ).toEqual( jasmine.objectContaining( {
							"_eTag": "\"1-12345\"",
							"property1": "value 1",
							"property2": jasmine.objectContaining( {
								"property2": 12345,
								"property3": "another value 1",
							} ),
						} ) );
						expect( myDocuments[ 1 ] ).toEqual( jasmine.objectContaining( {
							"_eTag": "\"2-12345\"",
							"property1": "value 2",
							"property2": jasmine.objectContaining( {
								"property2": 67890,
								"property3": "another value 2",
							} ),
						} ) );
						done();
					} ).catch( done.fail );
				} );

				it( "should return partial members with partial relations", ( done:DoneFn ):void => {
					jasmine.Ajax.stubRequest( "https://example.com/resource/" ).andReturn( {
						status: 200,
						responseText: `[ {
							"@id":"_:1",
							"@type": [
								"${ C.VolatileResource }",
								"${ C.QueryMetadata }"
							],
							"${ C.target }": [ {
								"@id":"https://example.com/resource/member1/"
							} ]
						}, {
							"@id":"_:2",
							"@type": [
								"${ C.VolatileResource }",
								"${ C.QueryMetadata }"
							],
							"${ C.target }": [ {
								"@id":"https://example.com/resource/member2/"
							} ]
						}, {
							"@id": "_:3",
							"@type": [
								"${ C.ResponseMetadata }",
								"${ C.VolatileResource }"
							],
							"${ C.documentMetadata }": [ {
								"@id": "_:4"
							}, {
								"@id": "_:5"
							}, {
								"@id": "_:6"
							}, {
								"@id": "_:7"
							} ]
						}, {
							"@id": "_:4",
							"@type": [
								"${ C.DocumentMetadata }",
								"${ C.VolatileResource }"
							],
							"${ C.eTag }": [ {
								"@value": "\\"1-12345\\""
							} ],
							"${ C.relatedDocument }": [ {
								"@id": "https://example.com/resource/member1/"
							} ]
						}, {
							"@id": "_:5",
							"@type": [
								"${ C.DocumentMetadata }",
								"${ C.VolatileResource }"
							],
							"${ C.eTag }": [ {
								"@value": "\\"2-12345\\""
							} ],
							"${ C.relatedDocument }": [ {
								"@id": "https://example.com/resource/member2/"
							} ]
						}, {
							"@id": "_:6",
							"@type": [
								"${ C.DocumentMetadata }",
								"${ C.VolatileResource }"
							],
							"${ C.eTag }": [ {
								"@value": "\\"3-12345\\""
							} ],
							"${ C.relatedDocument }": [ {
								"@id": "https://example.com/sub-documents/sub-document1/"
							} ]
						}, {
							"@id": "_:7",
							"@type": [
								"${ C.DocumentMetadata }",
								"${ C.VolatileResource }"
							],
							"${ C.eTag }": [ {
								"@value": "\\"4-12345\\""
							} ],
							"${ C.relatedDocument }": [ {
								"@id": "https://example.com/sub-documents/sub-document2/"
							} ]
						}, {
							"@id": "https://example.com/resource/member1/",
							"@graph": [ {
								"@id": "https://example.com/resource/member1/",
								"@type": [
									"${ C.Document }",
									"https://example.com/ns#Resource",
									"${ LDP.BasicContainer }",
									"${ LDP.RDFSource }"
								],
								"https://example.com/ns#property-1": [ {
									"@value": "value 1"
								} ],
								"https://schema.org/property-2": [ {
									"@id": "https://example.com/sub-documents/sub-document1/"
								} ]
							} ]
						}, {
							"@id": "https://example.com/sub-documents/sub-document1/",
							"@graph": [ {
								"@id": "https://example.com/sub-documents/sub-document1/",
								"https://example.com/ns#property-2": [ {
									"@value": "12345",
									"@type": "${ XSD.integer }"
								} ],
								"https://schema.org/property-3": [ {
									"@value": "another value 1"
								} ]
							} ]
						}, {
							"@id": "https://example.com/resource/member2/",
							"@graph": [ {
								"@id": "https://example.com/resource/member2/",
								"@type": [
									"${ C.Document }",
									"https://example.com/ns#Resource",
									"${ LDP.BasicContainer }",
									"${ LDP.RDFSource }"
								],
								"https://example.com/ns#property-1": [ {
									"@value": "value 2"
								} ],
								"https://schema.org/property-2": [ {
									"@id": "https://example.com/sub-documents/sub-document2/"
								} ]
							} ]
						}, {
							"@id": "https://example.com/sub-documents/sub-document2/",
							"@graph": [ {
								"@id": "https://example.com/sub-documents/sub-document2/",
								"https://example.com/ns#property-2": [ {
									"@value": "67890",
									"@type": "${ XSD.integer }"
								} ],
								"https://schema.org/property-3": [ {
									"@value": "another value 2"
								} ]
							} ]
						} ]`,
					} );

					interface MyDocument {
						property1:string;
						property2:{};
					}

					documents.getMembers<MyDocument>( "https://example.com/resource/", _ => _
						.withType( "https://example.com/ns#Resource" )
						.properties( {
							"property1": {
								"@id": "https://example.com/ns#property-1",
								"@type": XSD.string,
							},
							"property2": {
								"@id": "https://schema.org/property-2",
								"@type": "@id",
								"query": __ => __.properties( {
									"property2": {
										"@id": "https://example.com/ns#property-2",
										"@type": XSD.integer,
									},
									"property3": {
										"@id": "https://schema.org/property-3",
										"@type": XSD.string,
									},
								} ),
							},
						} )
					).then( ( myDocuments ) => {
						expect( myDocuments ).toEqual( jasmine.any( Array ) );
						expect( myDocuments.length ).toBe( 2 );
						for( const document of myDocuments ) {
							expect( Document.is( document ) ).toBe( true );
						}

						expect( myDocuments[ 0 ] ).toEqual( jasmine.objectContaining( {
							"_eTag": "\"1-12345\"",
							"property1": "value 1",
							"property2": jasmine.objectContaining( {
								"_eTag": "\"3-12345\"",
								"property2": 12345,
								"property3": "another value 1",
							} ),
						} ) );
						expect( myDocuments[ 1 ] ).toEqual( jasmine.objectContaining( {
							"_eTag": "\"2-12345\"",
							"property1": "value 2",
							"property2": jasmine.objectContaining( {
								"_eTag": "\"4-12345\"",
								"property2": 67890,
								"property3": "another value 2",
							} ),
						} ) );
						done();
					} ).catch( done.fail );
				} );

			} );

		} );


		describe( method(
			INSTANCE,
			"addMember"
		), ():void => {

			class MockedContext extends AbstractContext {
				protected _baseURI:string;

				constructor() {
					super();
					this._baseURI = "https://example.com/";
					this.settings = { paths: { system: ".system/" } };
				}
			}

			let context:AbstractContext;
			let documents:Documents;

			beforeEach( ():void => {
				context = new MockedContext();
				documents = context.documents;
			} );

			it( hasSignature(
				"Add a member relation to the resource Pointer in the document container specified.", [
					{ name: "documentURI", type: "string", description: "URI of the document container where the member will be added." },
					{ name: "member", type: "CarbonLDP.Pointer", description: "Pointer object that references the resource to add as a member." },
					{ name: "requestOptions", type: "CarbonLDP.HTTP.RequestOptions", optional: true, description: "Customizable options for the request." },
				],
				{ type: "Promise<void>" }
			), ():void => {
				expect( documents.addMember ).toBeDefined();
				expect( Utils.isFunction( documents.addMember ) ).toBe( true );

				let spy:jasmine.Spy = spyOn( documents, "addMembers" );

				let pointer:Pointer = documents.getPointer( "new-member/" );
				// noinspection JSIgnoredPromiseFromCall
				documents.addMember( "resource/", pointer );
				expect( spy ).toHaveBeenCalledWith( "resource/", [ pointer ], {} );
			} );

			it( hasSignature(
				"Add a member relation to the resource URI in the document container specified.", [
					{ name: "documentURI", type: "string", description: "URI of the document container where the member will be added." },
					{ name: "memberURI", type: "string", description: "URI of the resource to add as a member." },
					{ name: "requestOptions", type: "CarbonLDP.HTTP.RequestOptions", optional: true, description: "Customizable options for the request." },
				],
				{ type: "Promise<void>" }
			), ():void => {
				expect( documents.addMember ).toBeDefined();
				expect( Utils.isFunction( documents.addMember ) ).toBe( true );

				let spy:jasmine.Spy = spyOn( documents, "addMembers" );

				// noinspection JSIgnoredPromiseFromCall
				documents.addMember( "resource/", "new-member/" );
				expect( spy ).toHaveBeenCalledWith( "resource/", [ "new-member/" ], {} );
			} );

			describe( "When Documents has a specified context", ():void => {

				beforeEach( () => {
					context = new class extends AbstractContext {
						protected _baseURI:string;

						constructor() {
							super();
							this._baseURI = "https://example.com/";
						}
					};
					documents = context.documents;
				} );

				it( "should reject promise if URI is not in the context base", ( done:DoneFn ):void => {
					const promise:Promise<any> = documents.addMember( "http://not-example.com", "https://example.com/member/" );
					promise.then( () => {
						done.fail( "Should not resolve promise." );
					} ).catch( error => {
						expect( error.message ).toBe( `"http://not-example.com" isn't a valid URI for this Carbon instance.` );
						done();
					} );
				} );

				it( "should reject promise if prefixed URI cannot be resolved", ( done:DoneFn ):void => {
					const promise:Promise<any> = documents.addMember( "prefix:the-uri", "https://example.com/member/" );
					promise.then( () => {
						done.fail( "Should not resolve promise." );
					} ).catch( error => {
						expect( error.message ).toBe( `The prefixed URI "prefix:the-uri" could not be resolved.` );
						done();
					} );
				} );

				it( "should call _parseErrorResponse when request error", ( done:DoneFn ):void => {
					jasmine.Ajax.stubRequest( "https://example.com/" ).andReturn( {
						status: 500,
						responseText: "",
					} );

					const error:Error = new Error( "Error message" );
					const spy:jasmine.Spy = spyOn( documents, "_parseErrorResponse" ).and.callFake( () => Promise.reject( error ) );

					documents.addMember( "https://example.com/", "https://example.com/member/" ).then( () => {
						done.fail( "Should not resolve" );
					} ).catch( _error => {
						expect( spy ).toHaveBeenCalled();

						expect( _error ).toBeDefined();
						expect( _error ).toBe( error );

						done();
					} );
				} );

			} );

			describe( "When Documents does not have a context", ():void => {

				beforeEach( () => {
					documents = new Documents();
				} );

				it( "should reject if URI is relative", ( done:DoneFn ):void => {
					const promise:Promise<any> = documents.addMember( "relative-uri/", "https://example.com/member/" );
					promise.then( () => {
						done.fail( "Should not resolve promise." );
					} ).catch( error => {
						expect( error.message ).toBe( "This Documents instance doesn't support relative URIs." );
						done();
					} );
				} );

				it( "should reject if URI is prefixed", ( done:DoneFn ):void => {
					const promise:Promise<any> = documents.addMember( "prefix:the-uri", "https://example.com/member/" );
					promise.then( () => {
						done.fail( "Should not resolve promise." );
					} ).catch( error => {
						expect( error.message ).toBe( "This Documents instance doesn't support prefixed URIs." );
						done();
					} );
				} );

				it( "should reject if member is relative", ( done:DoneFn ):void => {
					const promise:Promise<any> = documents.addMember( "https://example.com/resource/", "relative-member/" );
					promise.then( () => {
						done.fail( "Should not resolve promise." );
					} ).catch( error => {
						expect( error.message ).toBe( "This Documents instance doesn't support relative URIs." );
						done();
					} );
				} );

				it( "should reject if member is prefixed", ( done:DoneFn ):void => {
					const promise:Promise<any> = documents.addMember( "https://example.com/resource/", "prefix:member" );
					promise.then( () => {
						done.fail( "Should not resolve promise." );
					} ).catch( error => {
						expect( error.message ).toBe( "This Documents instance doesn't support prefixed URIs." );
						done();
					} );
				} );

				it( "should call _parseErrorResponse when request error", ( done:DoneFn ):void => {
					jasmine.Ajax.stubRequest( "https://example.com/" ).andReturn( {
						status: 500,
						responseText: "",
					} );

					const error:Error = new Error( "Error message" );
					const spy:jasmine.Spy = spyOn( documents, "_parseErrorResponse" ).and.callFake( () => Promise.reject( error ) );

					documents.addMember( "https://example.com/", "https://example.com/member/" ).then( () => {
						done.fail( "Should not resolve" );
					} ).catch( _error => {
						expect( spy ).toHaveBeenCalled();

						expect( _error ).toBeDefined();
						expect( _error ).toBe( error );

						done();
					} );
				} );

			} );

		} );

		describe( method(
			INSTANCE,
			"addMembers"
		), ():void => {

			it( hasSignature(
				"Add a member relation to every resource URI or Pointer provided in the document container specified.", [
					{ name: "documentURI", type: "string", description: "URI of the document container where the members will be added." },
					{ name: "members", type: "(CarbonLDP.Pointer | string)[]", description: "Array of URIs or Pointers to add as members." },
					{ name: "requestOptions", type: "CarbonLDP.HTTP.RequestOptions", optional: true, description: "Customizable options for the request." },
				],
				{ type: "Promise<void>" }
			), ( done:DoneFn ):void => {
				class MockedContext extends AbstractContext {
					protected _baseURI:string;

					constructor() {
						super();
						this._baseURI = "https://example.com/";
						this.settings = { paths: { system: ".system/" } };
					}
				}

				let context:MockedContext = new MockedContext();
				let documents:Documents = context.documents;

				expect( documents.addMembers ).toBeDefined();
				expect( Utils.isFunction( documents.addMembers ) ).toBe( true );

				jasmine.Ajax.stubRequest( "https://example.com/resource/", null, "PUT" ).andReturn( {
					status: 200,
				} );

				let spySuccess:jasmine.Spy = jasmine.createSpy( "success" );
				let spyFail:jasmine.Spy = jasmine.createSpy( "fail" );

				let promises:Promise<any>[] = [];
				let promise:Promise<any>;
				let members:(Pointer | string)[];

				members = [ documents.getPointer( "new-member-01/" ), "new-member-02/" ];
				promise = documents.addMembers( "resource/", members );
				expect( promise instanceof Promise ).toBe( true );
				promises.push( promise.then( spySuccess, spyFail ) );

				members = [ documents.getPointer( "new-member-01/" ), "new-member-02/", <any> { "something": "nor string or Pointer" } ];
				promise = documents.addMembers( "resource/", members );
				expect( promise instanceof Promise ).toBe( true );
				promises.push( promise.then( spySuccess, spyFail ) );

				Promise.all( promises ).then( ():void => {
					expect( spySuccess ).toHaveBeenCalledTimes( 1 );
					expect( spySuccess ).toHaveBeenCalledWith( void 0 );

					expect( spyFail ).toHaveBeenCalledTimes( 1 );
					expect( spyFail ).toHaveBeenCalledWith( jasmine.any( Errors.IllegalArgumentError ) );
					done();
				}, done.fail );
			} );

			describe( "When Documents has a specified context", ():void => {
				let documents:Documents;

				beforeEach( () => {
					const context:AbstractContext = new class extends AbstractContext {
						protected _baseURI:string;

						constructor() {
							super();
							this._baseURI = "https://example.com/";
						}
					}();
					documents = context.documents;
				} );

				it( "should reject promise if URI is not in the context base", ( done:DoneFn ):void => {
					const promise:Promise<any> = documents.addMembers( "http://not-example.com", [ "https://example.com/member/" ] );
					promise.then( () => {
						done.fail( "Should not resolve promise." );
					} ).catch( error => {
						expect( error.message ).toBe( `"http://not-example.com" isn't a valid URI for this Carbon instance.` );
						done();
					} );
				} );

				it( "should reject promise if prefixed URI cannot be resolved", ( done:DoneFn ):void => {
					const promise:Promise<any> = documents.addMembers( "prefix:the-uri", [ "https://example.com/member/" ] );
					promise.then( () => {
						done.fail( "Should not resolve promise." );
					} ).catch( error => {
						expect( error.message ).toBe( `The prefixed URI "prefix:the-uri" could not be resolved.` );
						done();
					} );
				} );

				it( "should call _parseErrorResponse when request error", ( done:DoneFn ):void => {
					jasmine.Ajax.stubRequest( "https://example.com/" ).andReturn( {
						status: 500,
						responseText: "",
					} );

					const error:Error = new Error( "Error message" );
					const spy:jasmine.Spy = spyOn( documents, "_parseErrorResponse" ).and.callFake( () => Promise.reject( error ) );

					documents.addMembers( "https://example.com/", [ "https://example.com/member/" ] ).then( () => {
						done.fail( "Should not resolve" );
					} ).catch( _error => {
						expect( spy ).toHaveBeenCalled();

						expect( _error ).toBeDefined();
						expect( _error ).toBe( error );

						done();
					} );
				} );

			} );

			describe( "When Documents does not have a context", ():void => {
				let documents:Documents;

				beforeEach( () => {
					documents = new Documents();
				} );

				it( "should reject if URI is relative", ( done:DoneFn ):void => {
					const promise:Promise<any> = documents.addMembers( "relative-uri/", [ "https://example.com/member/" ] );
					promise.then( () => {
						done.fail( "Should not resolve promise." );
					} ).catch( error => {
						expect( error.message ).toBe( "This Documents instance doesn't support relative URIs." );
						done();
					} );
				} );

				it( "should reject if URI is prefixed", ( done:DoneFn ):void => {
					const promise:Promise<any> = documents.addMembers( "prefix:the-uri", [ "https://example.com/member/" ] );
					promise.then( () => {
						done.fail( "Should not resolve promise." );
					} ).catch( error => {
						expect( error.message ).toBe( "This Documents instance doesn't support prefixed URIs." );
						done();
					} );
				} );

				it( "should reject if members is relative", ( done:DoneFn ):void => {
					const promise:Promise<any> = documents.addMembers( "https://example.com/resource/", [ "relative-members/" ] );
					promise.then( () => {
						done.fail( "Should not resolve promise." );
					} ).catch( error => {
						expect( error.message ).toBe( "This Documents instance doesn't support relative URIs." );
						done();
					} );
				} );

				it( "should reject if member is prefixed", ( done:DoneFn ):void => {
					const promise:Promise<any> = documents.addMembers( "https://example.com/resource/", [ "prefix:member" ] );
					promise.then( () => {
						done.fail( "Should not resolve promise." );
					} ).catch( error => {
						expect( error.message ).toBe( "This Documents instance doesn't support prefixed URIs." );
						done();
					} );
				} );

				it( "should call _parseErrorResponse when request error", ( done:DoneFn ):void => {
					jasmine.Ajax.stubRequest( "https://example.com/" ).andReturn( {
						status: 500,
						responseText: "",
					} );

					const error:Error = new Error( "Error message" );
					const spy:jasmine.Spy = spyOn( documents, "_parseErrorResponse" ).and.callFake( () => Promise.reject( error ) );

					documents.addMembers( "https://example.com/", [ "https://example.com/member/" ] ).then( () => {
						done.fail( "Should not resolve" );
					} ).catch( _error => {
						expect( spy ).toHaveBeenCalled();

						expect( _error ).toBeDefined();
						expect( _error ).toBe( error );

						done();
					} );
				} );

			} );

		} );

		describe( method(
			INSTANCE,
			"removeMember"
		), ():void => {

			class MockedContext extends AbstractContext {
				protected _baseURI:string;

				constructor() {
					super();
					this._baseURI = "https://example.com/";
					this.settings = { paths: { system: ".system/" } };
				}
			}

			let context:AbstractContext;
			let documents:Documents;

			beforeEach( ():void => {
				context = new MockedContext();
				documents = context.documents;
			} );

			it( hasSignature(
				"Remove the member relation between the Pointer and the resource container specified.", [
					{ name: "documentURI", type: "string", description: "URI of the resource container from where the member will be removed." },
					{ name: "member", type: "CarbonLDP.Pointer", description: "Pointer object that references the resource to remove as a member." },
					{ name: "requestOptions", type: "CarbonLDP.HTTP.RequestOptions", optional: true, description: "Customizable options for the request." },
				],
				{ type: "Promise<void>" }
			), ():void => {
				expect( documents.removeMember ).toBeDefined();
				expect( Utils.isFunction( documents.removeMember ) ).toBe( true );

				let spy:jasmine.Spy = spyOn( documents, "removeMembers" );

				let pointer:Pointer = documents.getPointer( "remove-member/" );
				// noinspection JSIgnoredPromiseFromCall
				documents.removeMember( "resource/", pointer );
				expect( spy ).toHaveBeenCalledWith( "resource/", [ pointer ], {} );
			} );

			it( hasSignature(
				"Remove the member relation between the resource URI and the resource container specified.", [
					{ name: "documentURI", type: "string", description: "URI of the resource container from where the member will be removed." },
					{ name: "memberURI", type: "string", description: "URI of the resource to remove as a member." },
					{ name: "requestOptions", type: "CarbonLDP.HTTP.RequestOptions", optional: true, description: "Customizable options for the request." },
				],
				{ type: "Promise<void>" }
			), ():void => {
				expect( documents.removeMember ).toBeDefined();
				expect( Utils.isFunction( documents.removeMember ) ).toBe( true );

				let spy:jasmine.Spy = spyOn( documents, "removeMembers" );

				// noinspection JSIgnoredPromiseFromCall
				documents.removeMember( "resource/", "remove-member/" );
				expect( spy ).toHaveBeenCalledWith( "resource/", [ "remove-member/" ], {} );
			} );

			describe( "When Documents has a specified context", ():void => {

				beforeEach( () => {
					context = new class extends AbstractContext {
						protected _baseURI:string;

						constructor() {
							super();
							this._baseURI = "https://example.com/";
						}
					};
					documents = context.documents;
				} );

				it( "should reject promise if URI is not in the context base", ( done:DoneFn ):void => {
					const promise:Promise<any> = documents.removeMember( "http://not-example.com", "https://example.com/member/" );
					promise.then( () => {
						done.fail( "Should not resolve promise." );
					} ).catch( error => {
						expect( error.message ).toBe( `"http://not-example.com" isn't a valid URI for this Carbon instance.` );
						done();
					} );
				} );

				it( "should reject promise if prefixed URI cannot be resolved", ( done:DoneFn ):void => {
					const promise:Promise<any> = documents.removeMember( "prefix:the-uri", "https://example.com/member/" );
					promise.then( () => {
						done.fail( "Should not resolve promise." );
					} ).catch( error => {
						expect( error.message ).toBe( `The prefixed URI "prefix:the-uri" could not be resolved.` );
						done();
					} );
				} );

				it( "should call _parseErrorResponse when request error", ( done:DoneFn ):void => {
					jasmine.Ajax.stubRequest( "https://example.com/" ).andReturn( {
						status: 500,
						responseText: "",
					} );

					const error:Error = new Error( "Error message" );
					const spy:jasmine.Spy = spyOn( documents, "_parseErrorResponse" ).and.callFake( () => Promise.reject( error ) );

					documents.removeMember( "https://example.com/", "https://example.com/member/" ).then( () => {
						done.fail( "Should not resolve" );
					} ).catch( _error => {
						expect( spy ).toHaveBeenCalled();

						expect( _error ).toBeDefined();
						expect( _error ).toBe( error );

						done();
					} );
				} );

			} );

			describe( "When Documents does not have a context", ():void => {

				beforeEach( () => {
					documents = new Documents();
				} );

				it( "should reject if URI is relative", ( done:DoneFn ):void => {
					const promise:Promise<any> = documents.removeMember( "relative-uri/", "https://example.com/member/" );
					promise.then( () => {
						done.fail( "Should not resolve promise." );
					} ).catch( error => {
						expect( error.message ).toBe( "This Documents instance doesn't support relative URIs." );
						done();
					} );
				} );

				it( "should reject if URI is prefixed", ( done:DoneFn ):void => {
					const promise:Promise<any> = documents.removeMember( "prefix:the-uri", "https://example.com/member/" );
					promise.then( () => {
						done.fail( "Should not resolve promise." );
					} ).catch( error => {
						expect( error.message ).toBe( "This Documents instance doesn't support prefixed URIs." );
						done();
					} );
				} );

				it( "should reject if member is relative", ( done:DoneFn ):void => {
					const promise:Promise<any> = documents.removeMember( "https://example.com/resource/", "relative-member/" );
					promise.then( () => {
						done.fail( "Should not resolve promise." );
					} ).catch( error => {
						expect( error.message ).toBe( "This Documents instance doesn't support relative URIs." );
						done();
					} );
				} );

				it( "should reject if member is prefixed", ( done:DoneFn ):void => {
					const promise:Promise<any> = documents.removeMember( "https://example.com/resource/", "prefix:member" );
					promise.then( () => {
						done.fail( "Should not resolve promise." );
					} ).catch( error => {
						expect( error.message ).toBe( "This Documents instance doesn't support prefixed URIs." );
						done();
					} );
				} );

				it( "should call _parseErrorResponse when request error", ( done:DoneFn ):void => {
					jasmine.Ajax.stubRequest( "https://example.com/" ).andReturn( {
						status: 500,
						responseText: "",
					} );

					const error:Error = new Error( "Error message" );
					const spy:jasmine.Spy = spyOn( documents, "_parseErrorResponse" ).and.callFake( () => Promise.reject( error ) );

					documents.removeMember( "https://example.com/", "https://example.com/member/" ).then( () => {
						done.fail( "Should not resolve" );
					} ).catch( _error => {
						expect( spy ).toHaveBeenCalled();

						expect( _error ).toBeDefined();
						expect( _error ).toBe( error );

						done();
					} );
				} );

			} );

		} );

		describe( method(
			INSTANCE,
			"removeMembers"
		), ():void => {

			it( hasSignature(
				"Remove the member relation to every specified resource URI or Pointer form the document container specified.", [
					{ name: "documentURI", type: "string", description: "URI of the document container where the members will be removed." },
					{ name: "members", type: "(CarbonLDP.Pointer | string)[]", description: "Array of URIs or Pointers to remove as members" },
					{ name: "requestOptions", type: "CarbonLDP.HTTP.RequestOptions", optional: true, description: "Customizable options for the request." },
				],
				{ type: "Promise<void>" }
			), ( done:DoneFn ):void => {
				class MockedContext extends AbstractContext {
					protected _baseURI:string;

					constructor() {
						super();
						this._baseURI = "https://example.com/";
						this.settings = { paths: { system: ".system/" } };
					}
				}

				let context:MockedContext = new MockedContext();
				let documents:Documents = context.documents;

				expect( documents.removeMembers ).toBeDefined();
				expect( Utils.isFunction( documents.removeMembers ) ).toBe( true );

				jasmine.Ajax.stubRequest( "https://example.com/resource/", null, "DELETE" ).andReturn( {
					status: 200,
				} );

				let spySuccess:jasmine.Spy = jasmine.createSpy( "success" );
				let spyFail:jasmine.Spy = jasmine.createSpy( "fail" );

				let promises:Promise<any>[] = [];
				let promise:Promise<any>;
				let members:(Pointer | string)[];

				members = [ documents.getPointer( "remove-member-01/" ), "remove-member-02/" ];
				promise = documents.removeMembers( "resource/", members );
				expect( promise instanceof Promise ).toBe( true );
				promises.push( promise.then( spySuccess, spyFail ) );

				members = [ documents.getPointer( "remove-member-01/" ), "remove-member-02/", <any> { "something": "nor string or Pointer" } ];
				promise = documents.removeMembers( "resource/", members );
				expect( promise instanceof Promise ).toBe( true );
				promises.push( promise.then( spySuccess, spyFail ) );

				Promise.all( promises ).then( ():void => {
					expect( spySuccess ).toHaveBeenCalledTimes( 1 );
					expect( spySuccess ).toHaveBeenCalledWith( void 0 );

					expect( spyFail ).toHaveBeenCalledTimes( 1 );
					expect( spyFail ).toHaveBeenCalledWith( jasmine.any( Errors.IllegalArgumentError ) );
					done();
				}, done.fail );
			} );

			describe( "When Documents has a specified context", ():void => {
				let documents:Documents;

				beforeEach( () => {
					const context:AbstractContext = new class extends AbstractContext {
						protected _baseURI:string;

						constructor() {
							super();
							this._baseURI = "https://example.com/";
						}
					}();
					documents = context.documents;
				} );

				it( "should reject promise if URI is not in the context base", ( done:DoneFn ):void => {
					const promise:Promise<any> = documents.removeMembers( "http://not-example.com", [ "https://example.com/member/" ] );
					promise.then( () => {
						done.fail( "Should not resolve promise." );
					} ).catch( error => {
						expect( error.message ).toBe( `"http://not-example.com" isn't a valid URI for this Carbon instance.` );
						done();
					} );
				} );

				it( "should reject promise if prefixed URI cannot be resolved", ( done:DoneFn ):void => {
					const promise:Promise<any> = documents.removeMembers( "prefix:the-uri", [ "https://example.com/member/" ] );
					promise.then( () => {
						done.fail( "Should not resolve promise." );
					} ).catch( error => {
						expect( error.message ).toBe( `The prefixed URI "prefix:the-uri" could not be resolved.` );
						done();
					} );
				} );

				it( "should call _parseErrorResponse when request error", ( done:DoneFn ):void => {
					jasmine.Ajax.stubRequest( "https://example.com/" ).andReturn( {
						status: 500,
						responseText: "",
					} );

					const error:Error = new Error( "Error message" );
					const spy:jasmine.Spy = spyOn( documents, "_parseErrorResponse" ).and.callFake( () => Promise.reject( error ) );

					documents.removeMembers( "https://example.com/", [ "https://example.com/member/" ] ).then( () => {
						done.fail( "Should not resolve" );
					} ).catch( _error => {
						expect( spy ).toHaveBeenCalled();

						expect( _error ).toBeDefined();
						expect( _error ).toBe( error );

						done();
					} );
				} );

			} );

			describe( "When Documents does not have a context", ():void => {
				let documents:Documents;

				beforeEach( () => {
					documents = new Documents();
				} );

				it( "should reject if URI is relative", ( done:DoneFn ):void => {
					const promise:Promise<any> = documents.removeMembers( "relative-uri/", [ "https://example.com/member/" ] );
					promise.then( () => {
						done.fail( "Should not resolve promise." );
					} ).catch( error => {
						expect( error.message ).toBe( "This Documents instance doesn't support relative URIs." );
						done();
					} );
				} );

				it( "should reject if URI is prefixed", ( done:DoneFn ):void => {
					const promise:Promise<any> = documents.removeMembers( "prefix:the-uri", [ "https://example.com/member/" ] );
					promise.then( () => {
						done.fail( "Should not resolve promise." );
					} ).catch( error => {
						expect( error.message ).toBe( "This Documents instance doesn't support prefixed URIs." );
						done();
					} );
				} );

				it( "should reject if members is relative", ( done:DoneFn ):void => {
					const promise:Promise<any> = documents.removeMembers( "https://example.com/resource/", [ "relative-members/" ] );
					promise.then( () => {
						done.fail( "Should not resolve promise." );
					} ).catch( error => {
						expect( error.message ).toBe( "This Documents instance doesn't support relative URIs." );
						done();
					} );
				} );

				it( "should reject if members is prefixed", ( done:DoneFn ):void => {
					const promise:Promise<any> = documents.removeMembers( "https://example.com/resource/", [ "prefix:member" ] );
					promise.then( () => {
						done.fail( "Should not resolve promise." );
					} ).catch( error => {
						expect( error.message ).toBe( "This Documents instance doesn't support prefixed URIs." );
						done();
					} );
				} );

				it( "should call _parseErrorResponse when request error", ( done:DoneFn ):void => {
					jasmine.Ajax.stubRequest( "https://example.com/" ).andReturn( {
						status: 500,
						responseText: "",
					} );

					const error:Error = new Error( "Error message" );
					const spy:jasmine.Spy = spyOn( documents, "_parseErrorResponse" ).and.callFake( () => Promise.reject( error ) );

					documents.removeMembers( "https://example.com/", [ "https://example.com/member/" ] ).then( () => {
						done.fail( "Should not resolve" );
					} ).catch( _error => {
						expect( spy ).toHaveBeenCalled();

						expect( _error ).toBeDefined();
						expect( _error ).toBe( error );

						done();
					} );
				} );

			} );

		} );

		describe( method(
			INSTANCE,
			"removeAllMembers"
		), ():void => {

			it( hasSignature(
				"Remove all the member relations from the document container specified.", [
					{ name: "documentURI", type: "string", description: "URI of the document container where the members will be removed." },
					{ name: "requestOptions", type: "CarbonLDP.HTTP.RequestOptions", optional: true, description: "Customizable options for the request." },
				],
				{ type: "Promise<void>" }
			), ( done:DoneFn ):void => {
				class MockedContext extends AbstractContext {
					protected _baseURI:string;

					constructor() {
						super();
						this._baseURI = "https://example.com/";
						this.settings = { paths: { system: ".system/" } };
					}
				}

				let context:MockedContext = new MockedContext();
				let documents:Documents = context.documents;

				expect( documents.removeAllMembers ).toBeDefined();
				expect( Utils.isFunction( documents.removeAllMembers ) ).toBe( true );

				jasmine.Ajax.stubRequest( "https://example.com/resource/", null, "DELETE" ).andReturn( {
					status: 200,
				} );

				let spySuccess:jasmine.Spy = jasmine.createSpy( "success" );
				let spyFail:jasmine.Spy = jasmine.createSpy( "fail" );

				let promises:Promise<any>[] = [];
				let promise:Promise<any>;

				promise = documents.removeAllMembers( "resource/" );
				expect( promise instanceof Promise ).toBe( true );
				promises.push( promise.then( spySuccess, spyFail ) );

				Promise.all( promises ).then( ():void => {
					expect( spySuccess ).toHaveBeenCalledTimes( 1 );
					expect( spySuccess ).toHaveBeenCalledWith( void 0 );

					expect( spyFail ).not.toHaveBeenCalled();
					done();
				} ).catch( done.fail );
			} );

			describe( "When Documents has a specified context", ():void => {
				let documents:Documents;

				beforeEach( () => {
					const context:AbstractContext = new class extends AbstractContext {
						protected _baseURI:string;

						constructor() {
							super();
							this._baseURI = "https://example.com/";
						}
					}();
					documents = context.documents;
				} );

				it( "should reject promise if URI is not in the context base", ( done:DoneFn ):void => {
					const promise:Promise<any> = documents.removeAllMembers( "http://not-example.com" );
					promise.then( () => {
						done.fail( "Should not resolve promise." );
					} ).catch( error => {
						expect( error.message ).toBe( `"http://not-example.com" isn't a valid URI for this Carbon instance.` );
						done();
					} );
				} );

				it( "should reject promise if prefixed URI cannot be resolved", ( done:DoneFn ):void => {
					const promise:Promise<any> = documents.removeAllMembers( "prefix:the-uri" );
					promise.then( () => {
						done.fail( "Should not resolve promise." );
					} ).catch( error => {
						expect( error.message ).toBe( `The prefixed URI "prefix:the-uri" could not be resolved.` );
						done();
					} );
				} );

				it( "should call _parseErrorResponse when request error", ( done:DoneFn ):void => {
					jasmine.Ajax.stubRequest( "https://example.com/" ).andReturn( {
						status: 500,
						responseText: "",
					} );

					const error:Error = new Error( "Error message" );
					const spy:jasmine.Spy = spyOn( documents, "_parseErrorResponse" ).and.callFake( () => Promise.reject( error ) );

					documents.removeAllMembers( "https://example.com/" ).then( () => {
						done.fail( "Should not resolve" );
					} ).catch( _error => {
						expect( spy ).toHaveBeenCalled();

						expect( _error ).toBeDefined();
						expect( _error ).toBe( error );

						done();
					} );
				} );

			} );

			describe( "When Documents does not have a context", ():void => {
				let documents:Documents;

				beforeEach( () => {
					documents = new Documents();
				} );

				it( "should reject if URI is relative", ( done:DoneFn ):void => {
					const promise:Promise<any> = documents.removeAllMembers( "relative-uri/" );
					promise.then( () => {
						done.fail( "Should not resolve promise." );
					} ).catch( error => {
						expect( error.message ).toBe( "This Documents instance doesn't support relative URIs." );
						done();
					} );
				} );

				it( "should reject if URI is prefixed", ( done:DoneFn ):void => {
					const promise:Promise<any> = documents.removeAllMembers( "prefix:the-uri" );
					promise.then( () => {
						done.fail( "Should not resolve promise." );
					} ).catch( error => {
						expect( error.message ).toBe( "This Documents instance doesn't support prefixed URIs." );
						done();
					} );
				} );

				it( "should call _parseErrorResponse when request error", ( done:DoneFn ):void => {
					jasmine.Ajax.stubRequest( "https://example.com/" ).andReturn( {
						status: 500,
						responseText: "",
					} );

					const error:Error = new Error( "Error message" );
					const spy:jasmine.Spy = spyOn( documents, "_parseErrorResponse" ).and.callFake( () => Promise.reject( error ) );

					documents.removeAllMembers( "https://example.com/" ).then( () => {
						done.fail( "Should not resolve" );
					} ).catch( _error => {
						expect( spy ).toHaveBeenCalled();

						expect( _error ).toBeDefined();
						expect( _error ).toBe( error );

						done();
					} );
				} );

			} );

		} );


		describe( method( INSTANCE, "save" ), ():void => {

			it( hasSignature(
				[ "T extends object" ],
				"Update the data of the document provided in the server.", [
					{ name: "persistedDocument", type: "T & CarbonLDP.Document", description: "The persisted document with the data to update in the server." },
					{ name: "requestOptions", type: "CarbonLDP.HTTP.RequestOptions", optional: true, description: "Customisable options for the request." },
				],
				{ type: "Promise<T & CarbonLDP.Document>" }
			), ():void => {} );

			it( isDefined(), ():void => {
				expect( Documents.prototype.save ).toBeDefined();
				expect( Documents.prototype.save ).toEqual( jasmine.any( Function ) );
			} );

			describe( "When Documents has a specified context", ():void => {

				let context:AbstractContext;
				let documents:Documents;
				beforeEach( () => {
					context = new class extends AbstractContext {
						_baseURI:string = "https://example.com/";
						settings:ContextSettings = { vocabulary: "https://example.com/ns#" };
					};
					documents = context.documents;
				} );

				it( "should reject promise if not a persisted document", ( done:DoneFn ):void => {
					const promise:Promise<any> = documents.save( <any> {} );
					promise.then( () => {
						done.fail( "Should not resolve promise." );
					} ).catch( error => {
						expect( error.message ).toBe( `Provided element is not a valid persisted document.` );
						done();
					} );
				} );

				it( "should reject promise if URI is not in the context base", ( done:DoneFn ):void => {
					const document:Document = Document.decorate( { id: "https://not-example.com" }, documents );

					documents.save( document )
						.then( () => {
							done.fail( "Should not resolve promise." );
						} ).catch( error => {
						expect( error.message ).toBe( `"https://not-example.com" isn't a valid URI for this Carbon instance.` );
						done();
					} );
				} );

				it( "should reject promise if prefixed URI cannot be resolved", ( done:DoneFn ):void => {
					const document:Document = Document.decorate( { id: "prefix:the-uri" }, documents );

					documents.save( document )
						.then( () => {
							done.fail( "Should not resolve promise." );
						} )
						.catch( error => {
							expect( error.message ).toBe( `The prefixed URI "prefix:the-uri" could not be resolved.` );
							done();
						} );
				} );

				it( "should sync the persisted blank nodes", async ( done:DoneFn ) => {
					jasmine.Ajax.stubRequest( "https://example.com/resource/", null, "PATCH" ).andReturn( {
						status: 200,
						responseHeaders: {
							"ETag": '"1234567890"',
						},
						responseText: `[
							{
								"@id": "_:responseMetadata",
								"@type": [
						            "${ C.VolatileResource }",
						            "${ C.ResponseMetadata }"
								],
								"${ C.documentMetadata }": [ {
									"@id": "_:documentMetadata"
								} ]
							},
							{
								"@id": "_:documentMetadata",
								"@type": [
						            "${ C.VolatileResource }",
						            "${ C.DocumentMetadata }"
								],
								"${ C.relatedDocument }": [ {
									"@id": "https://example.com/resource/"
								} ],
								"${ C.bNodesMap }": [ {
									"@id": "_:map"
								} ]
							},
							{
								"@id": "_:map",
								"@type": [ "${ C.Map }" ],
								"${ C.entry }": [
									{ "@id": "_:entry-1" },
									{ "@id": "_:entry-2" }
								]
							},
							{
								"@id": "_:entry-1",
								"${ C.entryKey }": [ {
								    "@id": "_:1"
							    } ],
								"${ C.entryValue }": [ {
									"@id": "_:new-1"
								} ]
							},
							{
								"@id": "_:entry-2",
								"${ C.entryKey }": [ {
									"@id": "_:2"
								} ],
								"${ C.entryValue }": [ {
									"@id": "_:new-2"
								} ]
							}
						]`,
					} );

					type RawBlankNode = Partial<TransientBlankNode> & { value:string };

					interface RawDocument {
						blankNode1:RawBlankNode;
						blankNode2:RawBlankNode;
					}

					const rawDocument:Document & RawDocument = Document.decorate( Object.assign(
						documents.getPointer( "https://example.com/resource/" ), {
							blankNode1: {
								id: "_:1",
								value: "a value 1",
							},
							blankNode2: {
								id: "_:2",
								value: "a value 2",
							},
						}
					), documents );

					try {
						const document:Document & RawDocument = await documents.save<RawDocument>( rawDocument );

						expect( document.getFragments().length ).toBe( 2 );

						expect( document.blankNode1 ).toBe( rawDocument.blankNode1 );
						expect( document.blankNode1.id ).toBe( "_:new-1" );
						expect( document.blankNode1 ).toEqual( jasmine.objectContaining( {
							value: "a value 1",
						} ) );

						expect( document.blankNode2 ).toBe( rawDocument.blankNode2 );
						expect( document.blankNode2.id ).toBe( "_:new-2" );
						expect( document.blankNode2 ).toEqual( jasmine.objectContaining( {
							value: "a value 2",
						} ) );

						done();
					} catch( e ) {
						done.fail( e );
					}
				} );

				it( "should call _parseErrorResponse when request error", ( done:DoneFn ):void => {
					jasmine.Ajax.stubRequest( "https://example.com/", null, "PATCH" ).andReturn( {
						status: 500,
						responseText: "",
					} );

					const error:Error = new Error( "Error message" );
					const spy:jasmine.Spy = spyOn( documents, "_parseErrorResponse" ).and.callFake( () => Promise.reject( error ) );

					const document:Document = Document.decorate( { id: "https://example.com/" }, documents );
					documents.save( document ).then( () => {
						done.fail( "Should not resolve" );
					} ).catch( _error => {
						expect( spy ).toHaveBeenCalled();

						expect( _error ).toBeDefined();
						expect( _error ).toBe( error );

						done();
					} );
				} );


				it( "should reject if document is outdated", ( done:DoneFn ):void => {
					const document:Document = Document.decorate(
						Object.assign( documents.getPointer( "https://example.com/resource/" ), {
							_eTag: null,
						} ),
						documents
					);

					documents.save( document )
						.then( () => {
							done.fail( "Should not resolve" );
						} )
						.catch( error => {
							expect( error ).toEqual( jasmine.any( Errors.IllegalStateError ) );
							expect( error.message ).toEqual( "Cannot save an outdated document." );
							done();
						} );
				} );

				it( "should send the patch delta when full document", ( done:DoneFn ):void => {
					jasmine.Ajax.stubRequest( "https://example.com/resource/", null, "PATCH" ).andReturn( {
						status: 200,
					} );

					context.extendObjectSchema( {
						"xsd": XSD.namespace,
					} );
					context.extendObjectSchema( "https://example.com/ns#Document", {
						"list": {
							"@container": "@list",
						},
						"pointer": {
							"@type": "@id",
						},
					} );
					context.extendObjectSchema( "https://example.com/ns#Fragment", {
						"string": {
							"@type": XSD.string,
							"@container": "@set",
						},
						"pointer": {
							"@type": "@id",
						},
					} );
					context.extendObjectSchema( "https://example.com/ns#BlankNode", {
						"number": {
							"@type": XSD.integer,
						},
					} );

					const persistedDocument:Document = Document.decorate( {
						id: "https://example.com/resource/",
						types: [ "https://example.com/ns#Document" ],
						list: [ 1, 2, 3, 4, 5 ],
						pointer: {
							id: "https://example.com/resource/#fragment",
							types: [ "https://example.con/ns#Fragment" ],
							string: [ "string 1", "string 2" ],
							pointer: [ {
								id: "_:blank-node",
								types: [ "https://example.con/ns#Fragment", "https://example.com/ns#BlankNode" ],
								string: [ "string 1" ],
								number: 100,
							} ],
						},
					}, documents );
					persistedDocument._normalize();
					persistedDocument._syncSnapshot();
					persistedDocument.getFragments().forEach( fragment => fragment._syncSnapshot() );

					persistedDocument.addType( "NewType" );
					persistedDocument[ "list" ] = [ 4, 1, 2, "s-1", "s-2", "s-3", 3 ];
					persistedDocument[ "pointer" ][ "string" ] = [ "string 2", "string 3" ];
					persistedDocument[ "pointer" ][ "pointer" ][ 0 ][ "string" ] = [ "string 1", "string -1" ];
					persistedDocument[ "pointer" ][ "pointer" ][ 0 ][ "number" ] = 100.001;

					documents.save( persistedDocument ).then( ( _document:Document ) => {
						expect( _document ).toBe( persistedDocument );

						const request:JasmineAjaxRequest = jasmine.Ajax.requests.mostRecent();
						expect( request.params ).toBe( "" +
							`@prefix xsd: <${ XSD.namespace }>. ` +
							`UpdateList <https://example.com/resource/> <https://example.com/ns#list> 3..5 (). ` +
							`UpdateList <https://example.com/resource/> <https://example.com/ns#list> 0..0 ( "4"^^xsd:float ). ` +
							`UpdateList <https://example.com/resource/> <https://example.com/ns#list> 3..3 ( "s-1" "s-2" "s-3" ). ` +
							`Add { ` +
							`` + `<https://example.com/resource/> a <https://example.com/ns#NewType>. ` +
							`` + `<https://example.com/resource/#fragment> <https://example.com/ns#string> "string 3". ` +
							`` + `_:blank-node <https://example.com/ns#string> "string -1". ` +
							`}. ` +
							`Delete { ` +
							`` + `<https://example.com/resource/#fragment> <https://example.com/ns#string> "string 1". ` +
							`}.` +
							``
						);

						done();
					} ).catch( done.fail );
				} );

				it( "should send the patch delta when partial document", ( done:DoneFn ):void => {
					jasmine.Ajax.stubRequest( "https://example.com/resource/", null, "PATCH" ).andReturn( {
						status: 200,
					} );

					context.extendObjectSchema( {
						"xsd": XSD.namespace,
					} );

					const persistedDocument:Document = Document.decorate( {
						id: "https://example.com/resource/",
						types: [ "https://example.com/ns#Document" ],
						list: [ 1, 2, 3, 4, 5 ],
						pointer: {
							id: "https://example.com/resource/#fragment",
							types: [ "https://example.con/ns#Fragment" ],
							string: [ "string 1", "string 2" ],
							pointer: [ {
								id: "_:blank-node",
								types: [ "https://example.con/ns#Fragment", "https://example.com/ns#BlankNode" ],
								string: [ "string 1" ],
								number: 100,
								_partialMetadata: createPartialMetadata( {
									"string": {
										"@type": XSD.string,
										"@container": "@set",
									},
									"pointer": {
										"@type": "@id",
									},
									"number": {
										"@type": XSD.integer,
									},
								} ),
							} ],
							_partialMetadata: createPartialMetadata( {
								"string": {
									"@type": XSD.string,
									"@container": "@set",
								},
								"pointer": {
									"@type": "@id",
								},
							} ),
						},
						_partialMetadata: createPartialMetadata( {
							"list": {
								"@container": "@list",
							},
							"pointer": {
								"@type": "@id",
							},
						} ),
					}, documents );
					persistedDocument._normalize();
					persistedDocument._syncSnapshot();
					persistedDocument.getFragments().forEach( fragment => fragment._syncSnapshot() );

					persistedDocument.addType( "NewType" );
					persistedDocument[ "list" ] = [ 4, 1, 2, "s-1", "s-2", "s-3", 3 ];
					persistedDocument[ "pointer" ][ "string" ] = [ "string 2", "string 3" ];
					persistedDocument[ "pointer" ][ "pointer" ][ 0 ][ "string" ] = [ "string 1", "string -1" ];
					persistedDocument[ "pointer" ][ "pointer" ][ 0 ][ "number" ] = 100.001;

					documents.save( persistedDocument ).then( ( _document:Document ) => {
						expect( _document ).toBe( persistedDocument );

						const request:JasmineAjaxRequest = jasmine.Ajax.requests.mostRecent();
						expect( request.params ).toBe( "" +
							`@prefix xsd: <${ XSD.namespace }>. ` +
							`UpdateList <https://example.com/resource/> <https://example.com/ns#list> 3..5 (). ` +
							`UpdateList <https://example.com/resource/> <https://example.com/ns#list> 0..0 ( "4"^^xsd:float ). ` +
							`UpdateList <https://example.com/resource/> <https://example.com/ns#list> 3..3 ( "s-1" "s-2" "s-3" ). ` +
							`Add { ` +
							`` + `<https://example.com/resource/> a <https://example.com/ns#NewType>. ` +
							`` + `<https://example.com/resource/#fragment> <https://example.com/ns#string> "string 3". ` +
							`` + `_:blank-node <https://example.com/ns#string> "string -1". ` +
							`}. ` +
							`Delete { ` +
							`` + `<https://example.com/resource/#fragment> <https://example.com/ns#string> "string 1". ` +
							`}.` +
							``
						);

						done();
					} ).catch( done.fail );
				} );

				it( "should send expected headers", ( done:DoneFn ):void => {
					jasmine.Ajax.stubRequest( "https://example.com/resource/", null, "PATCH" ).andReturn( {
						status: 200,
						responseText: `[]`,
					} );

					const document:Document = Document.decorate(
						Object.assign( documents.getPointer( "https://example.com/resource/" ), {
							_eTag: `"1-12345"`,
						} ),
						documents
					);

					documents.save( document )
						.then( ():void => {
							const request:JasmineAjaxRequest = jasmine.Ajax.requests.mostRecent();
							expect( request.requestHeaders ).toEqual( {
								"content-type": "text/ldpatch",
								"accept": "application/ld+json",
								"if-match": `"1-12345"`,
								"prefer": [
									`return=minimal`,
								].join( ", " ),
							} );

							done();
						} )
						.catch( done.fail );
				} );

			} );

			describe( "When Documents does not have a context", ():void => {

				let documents:Documents;
				beforeEach( () => {
					documents = new Documents();
				} );

				it( "should reject if URI is relative", ( done:DoneFn ):void => {
					const document:Document = Document.decorate( { id: "relative-uri/" }, documents );

					documents.save( document )
						.then( () => {
							done.fail( "Should not resolve promise." );
						} )
						.catch( error => {
							expect( error.message ).toBe( "This Documents instance doesn't support relative URIs." );
							done();
						} );
				} );

				it( "should reject if URI is prefixed", ( done:DoneFn ):void => {
					const document:Document = Document.decorate( { id: "prefix:the-uri" }, documents );

					documents.save( document )
						.then( () => {
							done.fail( "Should not resolve promise." );
						} )
						.catch( error => {
							expect( error.message ).toBe( "This Documents instance doesn't support prefixed URIs." );
							done();
						} );
				} );

				it( "should call _parseErrorResponse when request error", ( done:DoneFn ):void => {
					jasmine.Ajax.stubRequest( "https://example.com/" ).andReturn( {
						status: 500,
						responseText: "",
					} );

					const error:Error = new Error( "Error message" );
					const spy:jasmine.Spy = spyOn( documents, "_parseErrorResponse" ).and.callFake( () => Promise.reject( error ) );

					const document:Document = Document.decorate( { id: "https://example.com/" }, documents );
					documents.save( document ).then( () => {
						done.fail( "Should not resolve" );
					} ).catch( _error => {
						expect( spy ).toHaveBeenCalled();

						expect( _error ).toBeDefined();
						expect( _error ).toBe( error );

						done();
					} );
				} );

			} );

		} );

		describe( method( INSTANCE, "refresh" ), ():void => {

			it( hasSignature(
				[ "T extends object" ],
				"Update the specified document with the data of the Carbon LDP server, if a newest version exists.", [
					{ name: "persistedDocument", type: "T & CarbonLDP.Document", description: "The persisted document to update." },
					{ name: "requestOptions", type: "CarbonLDP.HTTP.RequestOptions", optional: true, description: "Customizable options for the request." },
				],
				{ type: "Promise<T & CarbonLDP.Document>" }
			), ():void => {} );

			it( isDefined(), () => {
				expect( Documents.prototype.refresh ).toBeDefined();
				expect( Documents.prototype.refresh ).toEqual( jasmine.any( Function ) );
			} );

			describe( "When Documents has a specified context", ():void => {

				let context:AbstractContext;
				let documents:Documents;
				beforeEach( ():void => {
					context = new class extends AbstractContext {
						_baseURI:string = "https://example.com/";
						settings:ContextSettings = { vocabulary: "https://example.com/ns#" };
					};
					documents = context.documents;
				} );

				it( "should reject promise if not a persisted document", ( done:DoneFn ):void => {
					const promise:Promise<any> = documents.refresh( <any> { id: "http://not-example.com" } );
					promise.then( () => {
						done.fail( "Should not resolve promise." );
					} ).catch( error => {
						expect( error.message ).toBe( `Provided element is not a valid persisted document.` );
						done();
					} );
				} );

				it( "should reject promise if URI is not in the context base", ( done:DoneFn ):void => {
					const persistedDocument:Document = Document.decorate( { id: "http://not-example.com" }, documents );
					const promise:Promise<any> = documents.refresh( persistedDocument );
					promise.then( () => {
						done.fail( "Should not resolve promise." );
					} ).catch( error => {
						expect( error.message ).toBe( `"http://not-example.com" isn't a valid URI for this Carbon instance.` );
						done();
					} );
				} );

				it( "should reject promise if prefixed URI cannot be resolved", ( done:DoneFn ):void => {
					const persistedDocument:Document = Document.decorate( { id: "prefix:the-uri" }, documents );
					const promise:Promise<any> = documents.refresh( persistedDocument );
					promise.then( () => {
						done.fail( "Should not resolve promise." );
					} ).catch( error => {
						expect( error.message ).toBe( `The prefixed URI "prefix:the-uri" could not be resolved.` );
						done();
					} );
				} );

				it( "should call _parseErrorResponse when request error", ( done:DoneFn ):void => {
					jasmine.Ajax.stubRequest( "https://example.com/" ).andReturn( {
						status: 500,
						responseText: "",
					} );

					const error:Error = new Error( "Error message" );
					const spy:jasmine.Spy = spyOn( documents, "_parseErrorResponse" ).and.callFake( () => Promise.reject( error ) );

					const document:Document = Document.decorate( { id: "https://example.com/" }, documents );
					documents.refresh( document ).then( () => {
						done.fail( "Should not resolve" );
					} ).catch( _error => {
						expect( spy ).toHaveBeenCalled();

						expect( _error ).toBeDefined();
						expect( _error ).toBe( error );

						done();
					} );
				} );


				it( "should return same if no-modified received", ( done:DoneFn ):void => {
					jasmine.Ajax.stubRequest( "https://example.com/resource/", null, "GET" ).andReturn( {
						status: 304,
					} );

					const document:Document = Document.decorate(
						Object.assign( documents.getPointer( "https://example.com/resource/" ), {
							_eTag: `"1-12345"`,
						} ),
						documents
					);

					documents.refresh( document )
						.then( ( returnedDocument ) => {
							expect( document ).toBe( returnedDocument );
							done();
						} )
						.catch( done.fail );
				} );

				it( "should update the document", ( done:DoneFn ):void => {
					jasmine.Ajax.stubRequest( "https://example.com/resource/", null, "GET" ).andReturn( {
						status: 200,
						responseHeaders: {
							"ETag": `"1-67890"`,
						},
						responseText: `[ {
							"@id": "https://example.com/resource/",
							"@graph": [
								{
									"@id": "https://example.com/resource/",
									"https://example.com/ns#string": [ {"@value": "Changed Document Resource"} ],
									"https://example.com/ns#pointerSet": [
										{"@id": "https://example.com/resource/#1"}
									]
								},
								{
									"@id": "https://example.com/resource/#1",
									"https://example.com/ns#string": [ {"@value": "Changed NamedFragment 1"} ]
								},
								{
									"@id": "https://example.com/resource/#3",
									"https://example.com/ns#string": [ {"@value": "NamedFragment 3"} ]
								}
							]
						} ]`,
					} );

					const document:Document = Document.decorate(
						Object.assign( documents.getPointer( "https://example.com/resource/" ), {
							_eTag: `"1-12345"`,
							_resolved: true,
							string: "Document Resource",
							pointerSet: [
								{
									id: "#1",
									string: "NamedFragment 1",
								},
								documents.getPointer( "https://example.com/external-resource/" ),
							],
							"new-property": "A new property that will be erased at refresh",
						} ),
						documents
					);
					document._normalize();

					const fragment:NamedFragment = document.getFragment( "#1" );

					documents.refresh( document )
						.then( ( returnedDocument ) => {
							expect( returnedDocument ).toBe( document );

							expect( document ).toEqual( jasmine.objectContaining( {
								_eTag: `"1-67890"`,
								_resolved: true,
								string: "Changed Document Resource",
								pointerSet: [ jasmine.objectContaining( {
									id: "https://example.com/resource/#1",
									string: "Changed NamedFragment 1",
								} ) ],
							} ) );

							expect( document[ "pointerSet" ][ 0 ] ).toBe( fragment );

							expect( document ).not.toEqual( jasmine.objectContaining( {
								_eTag: `"1-12345"`,
								"new-property": "A new property that will be erased at refresh",
							} ) );

							expect( document.getFragment( "#3" ) ).toEqual( jasmine.objectContaining( {
								id: "https://example.com/resource/#3",
								string: "NamedFragment 3",
							} ) );

							done();
						} )
						.catch( done.fail );
				} );


				it( "should create refresh query", ( done:DoneFn ):void => {
					jasmine.Ajax.stubRequest( "https://example.com/resource/" ).andReturn( {
						status: 200,
						responseText: `[ {
							"@id":"_:1",
							"@type": [
								"${ C.VolatileResource }",
								"${ C.QueryMetadata }"
							],
							"${ C.target }": [ {
								"@id":"${ context.baseURI }resource/"
							} ]
						}, {
							"@id": "${ context.baseURI }resource/",
							"@graph": [ {
								"@id": "${ context.baseURI }resource/",
								"@type": [
									"${ C.Document }",
									"https://example.com/ns#Resource",
									"${ LDP.BasicContainer }",
									"${ LDP.RDFSource }"
								],
								"https://example.com/ns#property-1": [ {
									"@value": "updated value"
								} ],
								"https://example.com/ns#property-4": [ {
									"@value": "false",
									"@type": "${ XSD.boolean }"
								} ],
								"https://schema.org/property-2": [ {
									"@id": "_:1"
								} ]
							}, {
								"@id": "_:1",
								"https://schema.org/property-3": [ {
									"@value": "updated sub-value"
								} ],
								"https://schema.org/property-5": [ {
									"@value": "2010-01-01",
									"@type": "${ XSD.dateTime }"
								} ]
							} ]
						} ]`,
					} );

					interface MyDocument {
						property4:boolean;
						property1:string;
						property2:Resource;
					}

					context.extendObjectSchema( {
						"schema": "https://schema.org/",
					} );

					const persistedDocument:Document & MyDocument = Document.decorate(
						Object.assign(
							documents.getPointer( "https://example.com/resource/" ),
							{ property4: true, property1: "value", property2: null }
						),
						documents
					);
					persistedDocument._partialMetadata = createPartialMetadata( {
						"@vocab": "https://example.com/ns#",
						"property4": {
							"@id": "https://example.com/ns#property-4",
							"@type": XSD.boolean,
						},
						"property2": {
							"@id": "https://schema.org/property-2",
							"@type": "@id",
						},
						"property1": {
							"@id": "https://example.com/ns#property-1",
							"@type": XSD.string,
						},
					} );

					persistedDocument.property2 = persistedDocument.createFragment(
						{ property3: "sub-value", property5: new Date( "2000-01-01" ), property2: 12345 },
						"_:1"
					);
					persistedDocument.property2._partialMetadata = createPartialMetadata( {
						"@vocab": "https://example.com/ns#",
						"property3": {
							"@id": "https://schema.org/property-3",
							"@type": XSD.string,
						},
						"property5": {
							"@id": "https://schema.org/property-5",
							"@type": XSD.dateTime,
						},
						"property2": {
							"@id": "https://example.com/ns#property-2",
							"@type": XSD.integer,
						},
					} );

					const queryTokenClass:{ new( ...args:any[] ) } = QueryToken;
					let query:QueryToken;
					spyOn( TokensModule, "QueryToken" ).and.callFake( ( ...args:any[] ) => {
						return query = new queryTokenClass( ...args );
					} );

					Utils.promiseMethod( () => {
						return documents.refresh<MyDocument>( persistedDocument );
					} ).then( () => {
						const variableHelper:( name:string ) => VariableToken = name => {
							return jasmine.objectContaining( {
								token: "variable",
								name,
							} ) as any;
						};

						expect( query ).toEqual( new QueryToken(
							new ConstructToken()
								.addTriple( new SubjectToken( variableHelper( "metadata" ) )
									.addPredicate( new PredicateToken( "a" )
										.addObject( new IRIToken( C.VolatileResource ) )
										.addObject( new IRIToken( C.QueryMetadata ) )
									)
									.addPredicate( new PredicateToken( new IRIToken( C.target ) )
										.addObject( variableHelper( "document" ) )
									)
								)
								.addTriple( new SubjectToken( variableHelper( "document" ) )
									.addPredicate( new PredicateToken( "a" )
										.addObject( variableHelper( "document__types" ) )
									)
									.addPredicate( new PredicateToken( new IRIToken( "https://example.com/ns#property-4" ) )
										.addObject( variableHelper( "document__property4" ) )
									)
									.addPredicate( new PredicateToken( new PrefixedNameToken( "schema:property-2" ) )
										.addObject( variableHelper( "document__property2" ) )
									)
									.addPredicate( new PredicateToken( new IRIToken( "https://example.com/ns#property-1" ) )
										.addObject( variableHelper( "document__property1" ) )
									)
								)
								.addTriple( new SubjectToken( variableHelper( "document__property2" ) )
									.addPredicate( new PredicateToken( "a" )
										.addObject( variableHelper( "document__property2__types" ) )
									)
									.addPredicate( new PredicateToken( new PrefixedNameToken( "schema:property-3" ) )
										.addObject( variableHelper( "document__property2__property3" ) )
									)
									.addPredicate( new PredicateToken( new PrefixedNameToken( "schema:property-5" ) )
										.addObject( variableHelper( "document__property2__property5" ) )
									)
									.addPredicate( new PredicateToken( new IRIToken( "https://example.com/ns#property-2" ) )
										.addObject( variableHelper( "document__property2__property2" ) )
									)
								)

								.addPattern( new BindToken( "BNODE()", variableHelper( "metadata" ) ) )
								.addPattern( new ValuesToken()
									.addValues( variableHelper( "document" ), new IRIToken( persistedDocument.id ) )
								)
								.addPattern(
									new OptionalToken()
										.addPattern( new SubjectToken( variableHelper( "document" ) )
											.addPredicate( new PredicateToken( "a" )
												.addObject( variableHelper( "document__types" ) )
											)
										)
								)
								.addPattern(
									new OptionalToken()
										.addPattern( new SubjectToken( variableHelper( "document" ) )
											.addPredicate( new PredicateToken( new IRIToken( "https://example.com/ns#property-4" ) )
												.addObject( variableHelper( "document__property4" ) )
											)
										)
										.addPattern( new FilterToken( "datatype( ?document__property4 ) = <http://www.w3.org/2001/XMLSchema#boolean>" ) )
								)
								.addPattern(
									new OptionalToken()
										.addPattern( new SubjectToken( variableHelper( "document" ) )
											.addPredicate( new PredicateToken( new PrefixedNameToken( "schema:property-2" ) )
												.addObject( variableHelper( "document__property2" ) )
											)
										)
										.addPattern( new FilterToken( "! isLiteral( ?document__property2 )" ) )
										.addPattern( new OptionalToken()
											.addPattern( new SubjectToken( variableHelper( "document__property2" ) )
												.addPredicate( new PredicateToken( "a" )
													.addObject( variableHelper( "document__property2__types" ) )
												)
											)
										)
										.addPattern( new OptionalToken()
											.addPattern( new SubjectToken( variableHelper( "document__property2" ) )
												.addPredicate( new PredicateToken( new PrefixedNameToken( "schema:property-3" ) )
													.addObject( variableHelper( "document__property2__property3" ) )
												)
											)
											.addPattern( new FilterToken( "datatype( ?document__property2__property3 ) = <http://www.w3.org/2001/XMLSchema#string>" ) )
										)
										.addPattern( new OptionalToken()
											.addPattern( new SubjectToken( variableHelper( "document__property2" ) )
												.addPredicate( new PredicateToken( new PrefixedNameToken( "schema:property-5" ) )
													.addObject( variableHelper( "document__property2__property5" ) )
												)
											)
											.addPattern( new FilterToken( "datatype( ?document__property2__property5 ) = <http://www.w3.org/2001/XMLSchema#dateTime>" ) )
										)
										.addPattern( new OptionalToken()
											.addPattern( new SubjectToken( variableHelper( "document__property2" ) )
												.addPredicate( new PredicateToken( new IRIToken( "https://example.com/ns#property-2" ) )
													.addObject( variableHelper( "document__property2__property2" ) )
												)
											)
											.addPattern( new FilterToken( "datatype( ?document__property2__property2 ) = <http://www.w3.org/2001/XMLSchema#integer>" ) )
										)
								)
								.addPattern(
									new OptionalToken()
										.addPattern( new SubjectToken( variableHelper( "document" ) )
											.addPredicate( new PredicateToken( new IRIToken( "https://example.com/ns#property-1" ) )
												.addObject( variableHelper( "document__property1" ) )
											)
										)
										.addPattern( new FilterToken( "datatype( ?document__property1 ) = <http://www.w3.org/2001/XMLSchema#string>" ) )
								)
							)

								.addPrologues( new PrefixToken( "schema", new IRIToken( "https://schema.org/" ) ) )
						);

						done();
					} ).catch( done.fail );
				} );

				it( "should create refresh query with .ALL", ( done:DoneFn ):void => {
					interface MyDocument {
						property4:boolean;
						property1:string;
						property2:{
							property3:string,
							property5:Date;
							property2:number;
						};
					}

					context.extendObjectSchema( {
						"schema": "https://schema.org/",
					} );

					const persistedDocument:Document & MyDocument = createMockDocument( {
						documents, props: {
							id: "https://example.com/resource/",
							_partialMetadata: createPartialMetadata( {
								"@vocab": "https://example.com/ns#",
								"property4": {
									"@id": "property-4",
									"@type": XSD.boolean,
								},
								"property2": {
									"@id": "https://schema.org/property-2",
									"@type": "@id",
								},
								"property1": {
									"@id": "property-1",
									"@type": XSD.string,
								},
							} ),
							_eTag: "\"1-12345\"",
							property4: true,
							property1: "value",
							property2: {
								_partialMetadata: new PartialMetadata( PartialMetadata.ALL ),
								id: "_:1",
								property3: "sub-value",
								property5: new Date( "2000-01-01" ),
								property2: 12345,
							},
						},
					} );

					const queryTokenClass:{ new( ...args:any[] ) } = QueryToken;
					let query:QueryToken;
					spyOn( TokensModule, "QueryToken" ).and.callFake( ( ...args:any[] ) => {
						return query = new queryTokenClass( ...args );
					} );

					spyOn( documents, "executeRawCONSTRUCTQuery" ).and.returnValue( Promise.reject( null ) );

					documents
						.refresh<MyDocument>( persistedDocument )
						.then( () => {
							done.fail( "Should not resolve." );
						} )
						.catch( error => {
							if( error ) done.fail( error );

							const variableHelper:( name:string ) => VariableToken = name => {
								return jasmine.objectContaining( {
									token: "variable",
									name,
								} ) as any;
							};

							expect( query ).toEqual( new QueryToken(
								new ConstructToken()
									.addTriple( new SubjectToken( variableHelper( "metadata" ) )
										.addPredicate( new PredicateToken( "a" )
											.addObject( new IRIToken( C.VolatileResource ) )
											.addObject( new IRIToken( C.QueryMetadata ) )
										)
										.addPredicate( new PredicateToken( new IRIToken( C.target ) )
											.addObject( variableHelper( "document" ) )
										)
									)
									.addTriple( new SubjectToken( variableHelper( "document" ) )
										.addPredicate( new PredicateToken( "a" )
											.addObject( variableHelper( "document__types" ) )
										)
										.addPredicate( new PredicateToken( new IRIToken( "https://example.com/ns#property-4" ) )
											.addObject( variableHelper( "document__property4" ) )
										)
										.addPredicate( new PredicateToken( new PrefixedNameToken( "schema:property-2" ) )
											.addObject( variableHelper( "document__property2" ) )
										)
										.addPredicate( new PredicateToken( new IRIToken( "https://example.com/ns#property-1" ) )
											.addObject( variableHelper( "document__property1" ) )
										)
									)
									.addTriple( new SubjectToken( variableHelper( "document__property2" ) )
										.addPredicate( new PredicateToken( variableHelper( "document__property2___predicate" ) )
											.addObject( variableHelper( "document__property2___object" ) )
										)
									)

									.addPattern( new BindToken( "BNODE()", variableHelper( "metadata" ) ) )
									.addPattern( new ValuesToken()
										.addValues( variableHelper( "document" ), new IRIToken( persistedDocument.id ) )
									)
									.addPattern(
										new OptionalToken()
											.addPattern( new SubjectToken( variableHelper( "document" ) )
												.addPredicate( new PredicateToken( "a" )
													.addObject( variableHelper( "document__types" ) )
												)
											)
									)
									.addPattern(
										new OptionalToken()
											.addPattern( new SubjectToken( variableHelper( "document" ) )
												.addPredicate( new PredicateToken( new IRIToken( "https://example.com/ns#property-4" ) )
													.addObject( variableHelper( "document__property4" ) )
												)
											)
											.addPattern( new FilterToken( "datatype( ?document__property4 ) = <http://www.w3.org/2001/XMLSchema#boolean>" ) )
									)
									.addPattern(
										new OptionalToken()
											.addPattern( new SubjectToken( variableHelper( "document" ) )
												.addPredicate( new PredicateToken( new PrefixedNameToken( "schema:property-2" ) )
													.addObject( variableHelper( "document__property2" ) )
												)
											)
											.addPattern( new FilterToken( "! isLiteral( ?document__property2 )" ) )
											.addPattern( new SubjectToken( variableHelper( "document__property2" ) )
												.addPredicate( new PredicateToken( variableHelper( "document__property2___predicate" ) )
													.addObject( variableHelper( "document__property2___object" ) )
												)
											)
									)
									.addPattern(
										new OptionalToken()
											.addPattern( new SubjectToken( variableHelper( "document" ) )
												.addPredicate( new PredicateToken( new IRIToken( "https://example.com/ns#property-1" ) )
													.addObject( variableHelper( "document__property1" ) )
												)
											)
											.addPattern( new FilterToken( "datatype( ?document__property1 ) = <http://www.w3.org/2001/XMLSchema#string>" ) )
									)
								)

									.addPrologues( new PrefixToken( "schema", new IRIToken( "https://schema.org/" ) ) )
							);

							done();
						} );
				} );

				it( "should refresh data from query", ( done:DoneFn ):void => {
					jasmine.Ajax.stubRequest( "https://example.com/resource/" ).andReturn( {
						status: 200,
						responseText: `[ {
							"@id":"_:1",
							"@type": [
								"${ C.VolatileResource }",
								"${ C.QueryMetadata }"
							],
							"${ C.target }": [ {
								"@id":"${ context.baseURI }resource/"
							} ]
						}, {
							"@id": "_:2",
							"@type": [
								"${ C.ResponseMetadata }",
								"${ C.VolatileResource }"
							],
							"${ C.documentMetadata }": [ {
								"@id": "_:3"
							} ]
						}, {
							"@id": "_:3",
							"@type": [
								"${ C.DocumentMetadata }",
								"${ C.VolatileResource }"
							],
							"${ C.eTag }": [ {
								"@value": "\\"1-12345\\""
							} ],
							"${ C.relatedDocument }": [ {
								"@id": "https://example.com/resource/"
							} ]
						}, {
							"@id": "${ context.baseURI }resource/",
							"@graph": [ {
								"@id": "${ context.baseURI }resource/",
								"@type": [
									"${ C.Document }",
									"https://example.com/ns#Resource",
									"${ LDP.BasicContainer }",
									"${ LDP.RDFSource }"
								],
								"https://example.com/ns#property-1": [ {
									"@value": "updated value"
								} ],
								"https://schema.org/property-2": [ {
									"@id": "_:1"
								} ],
								"https://example.com/ns#property-4": [ {
									"@value": "false",
									"@type": "${ XSD.boolean }"
								} ]
							}, {
								"@id": "_:1",
								"https://schema.org/property-3": [ {
									"@value": "updated sub-value"
								} ],
								"https://schema.org/property-5": [ {
									"@value": "2010-01-01",
									"@type": "${ XSD.dateTime }"
								} ]
							} ]
						} ]`,
					} );

					interface MyDocument {
						property1:string;
						property2:Resource & {
							property2:number;
							property3:string;
							property5:Date;
						};
						property3:string;
						property4:boolean;
					}

					context.extendObjectSchema( {
						"schema": "https://schema.org/",
					} );

					const persistedDocument:Document & MyDocument = Document.decorate(
						Object.assign( documents.getPointer( "https://example.com/resource/" ), {
							property1: "value",
							property2: null,
							property3: "non query-value",
							property4: true,
							_partialMetadata: createPartialMetadata( {
								"@vocab": "https://example.com/ns#",
								"property1": {
									"@id": "https://example.com/ns#property-1",
									"@type": XSD.string,
								},
								"property2": {
									"@id": "https://schema.org/property-2",
									"@type": "@id",
								},
								"property4": {
									"@id": "https://example.com/ns#property-4",
									"@type": XSD.boolean,
								},
							} ),
						} ),
						documents
					);

					persistedDocument.property2 = persistedDocument.createFragment(
						{
							property3: "sub-value",
							property5: new Date( "2000-01-01" ),
							property2: 12345,
							_partialMetadata: createPartialMetadata( {
								"@vocab": "https://example.com/ns#",
								"property2": {
									"@id": "https://example.com/ns#property-2",
									"@type": XSD.integer,
								},
								"property3": {
									"@id": "https://schema.org/property-3",
									"@type": XSD.string,
								},
								"property5": {
									"@id": "https://schema.org/property-5",
									"@type": XSD.dateTime,
								},
							} ),
						},
						"_:1"
					);

					Utils.promiseMethod( () => {
						return documents.refresh<MyDocument>( persistedDocument );
					} ).then( ( document ) => {
						expect( Document.is( document ) ).toBe( true );

						// Data updates
						expect( document ).toEqual( jasmine.objectContaining( {
							"property4": false,
							"property1": "updated value",
							"property2": jasmine.objectContaining( {
								"property3": "updated sub-value",
								"property5": new Date( "2010-01-01" ),
							} ) as any,
						} ) );

						// Non query data
						expect( document ).toEqual( jasmine.objectContaining( {
							"property3": "non query-value",
						} ) );

						// Data removed
						expect( document.property2 ).not.toEqual( jasmine.objectContaining( {
							"property2": 12345,
						} ) );

						done();
					} ).catch( done.fail );
				} );

				it( "should not process data if same eTag", ( done:DoneFn ):void => {
					jasmine.Ajax.stubRequest( "https://example.com/resource/" ).andReturn( {
						status: 200,
						responseText: `[ {
							"@id":"_:1",
							"@type": [
								"${ C.VolatileResource }",
								"${ C.QueryMetadata }"
							],
							"${ C.target }": [ {
								"@id":"${ context.baseURI }resource/"
							} ]
						}, {
							"@id": "_:2",
							"@type": [
								"${ C.ResponseMetadata }",
								"${ C.VolatileResource }"
							],
							"${ C.documentMetadata }": [ {
								"@id": "_:3"
							} ]
						}, {
							"@id": "_:3",
							"@type": [
								"${ C.DocumentMetadata }",
								"${ C.VolatileResource }"
							],
							"${ C.eTag }": [ {
								"@value": "\\"1-12345\\""
							} ],
							"${ C.relatedDocument }": [ {
								"@id": "https://example.com/resource/"
							} ]
						}, {
							"@id": "${ context.baseURI }resource/",
							"@graph": [ {
								"@id": "${ context.baseURI }resource/",
								"@type": [
									"${ C.Document }",
									"https://example.com/ns#Resource",
									"${ LDP.BasicContainer }",
									"${ LDP.RDFSource }"
								],
								"https://example.com/ns#property-1": [ {
									"@value": "updated value"
								} ],
								"https://schema.org/property-2": [ {
									"@id": "_:1"
								} ],
								"https://example.com/ns#property-4": [ {
									"@value": "false",
									"@type": "${ XSD.boolean }"
								} ]
							}, {
								"@id": "_:1",
								"https://schema.org/property-3": [ {
									"@value": "updated sub-value"
								} ],
								"https://schema.org/property-5": [ {
									"@value": "2010-01-01",
									"@type": "${ XSD.dateTime }"
								} ]
							} ]
						} ]`,
					} );

					interface MyDocument {
						property1:string;
						property2:Resource & {
							property2:number;
							property3:string;
							property5:Date;
						};
						property3:string;
						property4:boolean;
					}

					context.extendObjectSchema( {
						"schema": "https://schema.org/",
					} );

					const persistedDocument:Document & MyDocument = Document.decorate(
						Object.assign( documents.getPointer( "https://example.com/resource/" ), {
							_eTag: "\"1-12345\"",
							property1: "value",
							property2: null,
							property3: "non query-value",
							property4: true,
							_partialMetadata: createPartialMetadata( {
								"@vocab": "https://example.com/ns#",
								"property1": {
									"@id": "property-1",
									"@type": XSD.string,
								},
								"property2": {
									"@id": "https://schema.org/property-2",
									"@type": "@id",
								},
								"property4": {
									"@id": "property-4",
									"@type": XSD.boolean,
								},
							} ),
						} ),
						documents
					);

					persistedDocument.property2 = persistedDocument.createFragment(
						{
							property3: "sub-value",
							property5: new Date( "2000-01-01" ),
							property2: 12345,
							_partialMetadata: createPartialMetadata( {
								"@vocab": "https://example.com/ns#",
								"property2": {
									"@id": "property-2",
									"@type": XSD.integer,
								},
								"property3": {
									"@id": "https://schema.org/property-3",
									"@type": XSD.string,
								},
								"property5": {
									"@id": "https://schema.org/property-5",
									"@type": XSD.dateTime,
								},
							} ),
						},
						"_:1"
					);

					Utils.promiseMethod( () => {
						return documents.refresh<MyDocument>( persistedDocument );
					} ).then( ( document ) => {
						expect( Document.is( document ) ).toBe( true );

						// Data updates
						expect( document ).toEqual( jasmine.objectContaining( {
							"property4": true,
							"property1": "value",
							"property2": jasmine.objectContaining( {
								"property2": 12345,
								"property3": "sub-value",
								"property5": new Date( "2000-01-01" ),
							} ) as any,
							"property3": "non query-value",
						} ) );

						done();
					} ).catch( done.fail );
				} );

			} );

			describe( "When Documents does not have a context", ():void => {
				let documents:Documents;

				beforeEach( () => {
					documents = new Documents();
				} );

				it( "should reject promise if not a persisted document", ( done:DoneFn ):void => {
					const promise:Promise<any> = documents.refresh( <any> { id: "http://not-example.com" } );
					promise.then( () => {
						done.fail( "Should not resolve promise." );
					} ).catch( error => {
						expect( error.message ).toBe( `Provided element is not a valid persisted document.` );
						done();
					} );
				} );

				it( "should reject if URI is relative", ( done:DoneFn ):void => {
					const persistedDocument:Document = Document.decorate( { id: "relative-uri/" }, documents );
					const promise:Promise<any> = documents.refresh( persistedDocument );
					promise.then( () => {
						done.fail( "Should not resolve promise." );
					} ).catch( error => {
						expect( error.message ).toBe( "This Documents instance doesn't support relative URIs." );
						done();
					} );
				} );

				it( "should reject if URI is prefixed", ( done:DoneFn ):void => {
					const persistedDocument:Document = Document.decorate( { id: "prefix:the-uri" }, documents );
					const promise:Promise<any> = documents.refresh( persistedDocument );
					promise.then( () => {
						done.fail( "Should not resolve promise." );
					} ).catch( error => {
						expect( error.message ).toBe( "This Documents instance doesn't support prefixed URIs." );
						done();
					} );
				} );

				it( "should call _parseErrorResponse when request error", ( done:DoneFn ):void => {
					jasmine.Ajax.stubRequest( "https://example.com/" ).andReturn( {
						status: 500,
						responseText: "",
					} );

					const error:Error = new Error( "Error message" );
					const spy:jasmine.Spy = spyOn( documents, "_parseErrorResponse" ).and.callFake( () => Promise.reject( error ) );

					const document:Document = Document.decorate( { id: "https://example.com/" }, documents );
					documents.refresh( document ).then( () => {
						done.fail( "Should not resolve" );
					} ).catch( _error => {
						expect( spy ).toHaveBeenCalled();

						expect( _error ).toBeDefined();
						expect( _error ).toBe( error );

						done();
					} );
				} );


				it( "should create refresh query", ( done:DoneFn ):void => {
					jasmine.Ajax.stubRequest( "https://example.com/resource/" ).andReturn( {
						status: 200,
						responseText: `[ {
							"@id":"_:1",
							"@type": [
								"${ C.VolatileResource }",
								"${ C.QueryMetadata }"
							],
							"${ C.target }": [ {
								"@id":"https://example.com/resource/"
							} ]
						}, {
							"@id": "https://example.com/resource/",
							"@graph": [ {
								"@id": "https://example.com/resource/",
								"@type": [
									"${ C.Document }",
									"https://example.com/ns#Resource",
									"${ LDP.BasicContainer }",
									"${ LDP.RDFSource }"
								],
								"https://example.com/ns#property-1": [ {
									"@value": "updated value"
								} ],
								"https://example.com/ns#property-4": [ {
									"@value": "false",
									"@type": "${ XSD.boolean }"
								} ],
								"https://schema.org/property-2": [ {
									"@id": "_:1"
								} ]
							}, {
								"@id": "_:1",
								"https://schema.org/property-3": [ {
									"@value": "updated sub-value"
								} ],
								"https://schema.org/property-5": [ {
									"@value": "2010-01-01",
									"@type": "${ XSD.dateTime }"
								} ]
							} ]
						} ]`,
					} );

					interface MyDocument {
						property4:boolean;
						property1:string;
						property2:Resource;
					}

					const persistedDocument:Document & MyDocument = Document.decorate(
						Object.assign(
							documents.getPointer( "https://example.com/resource/" ),
							{ property4: true, property1: "value", property2: null }
						),
						documents
					);
					persistedDocument._partialMetadata = createPartialMetadata( {
						"@vocab": "https://example.com/ns#",
						"property4": {
							"@id": "https://example.com/ns#property-4",
							"@type": XSD.boolean,
						},
						"property2": {
							"@id": "https://schema.org/property-2",
							"@type": "@id",
						},
						"property1": {
							"@id": "https://example.com/ns#property-1",
							"@type": XSD.string,
						},
					} );

					persistedDocument.property2 = persistedDocument.createFragment(
						{ property3: "sub-value", property5: new Date( "2000-01-01" ), property2: 12345 },
						"_:1"
					);
					persistedDocument.property2._partialMetadata = createPartialMetadata( {
						"@vocab": "https://example.com/ns#",
						"property3": {
							"@id": "https://schema.org/property-3",
							"@type": XSD.string,
						},
						"property5": {
							"@id": "https://schema.org/property-5",
							"@type": XSD.dateTime,
						},
						"property2": {
							"@id": "https://example.com/ns#property-2",
							"@type": XSD.integer,
						},
					} );

					const queryTokenClass:{ new( ...args:any[] ) } = QueryToken;
					let query:QueryToken;
					spyOn( TokensModule, "QueryToken" ).and.callFake( ( ...args:any[] ) => {
						return query = new queryTokenClass( ...args );
					} );

					Utils.promiseMethod( () => {
						return persistedDocument.refresh();
					} ).then( () => {
						const variableHelper:( name:string ) => VariableToken = name => {
							return jasmine.objectContaining( {
								token: "variable",
								name,
							} ) as any;
						};

						expect( query ).toEqual( new QueryToken(
							new ConstructToken()
								.addTriple( new SubjectToken( variableHelper( "metadata" ) )
									.addPredicate( new PredicateToken( "a" )
										.addObject( new IRIToken( C.VolatileResource ) )
										.addObject( new IRIToken( C.QueryMetadata ) )
									)
									.addPredicate( new PredicateToken( new IRIToken( C.target ) )
										.addObject( variableHelper( "document" ) )
									)
								)
								.addTriple( new SubjectToken( variableHelper( "document" ) )
									.addPredicate( new PredicateToken( "a" )
										.addObject( variableHelper( "document__types" ) )
									)
									.addPredicate( new PredicateToken( new IRIToken( "https://example.com/ns#property-4" ) )
										.addObject( variableHelper( "document__property4" ) )
									)
									.addPredicate( new PredicateToken( new IRIToken( "https://schema.org/property-2" ) )
										.addObject( variableHelper( "document__property2" ) )
									)
									.addPredicate( new PredicateToken( new IRIToken( "https://example.com/ns#property-1" ) )
										.addObject( variableHelper( "document__property1" ) )
									)
								)
								.addTriple( new SubjectToken( variableHelper( "document__property2" ) )
									.addPredicate( new PredicateToken( "a" )
										.addObject( variableHelper( "document__property2__types" ) )
									)
									.addPredicate( new PredicateToken( new IRIToken( "https://schema.org/property-3" ) )
										.addObject( variableHelper( "document__property2__property3" ) )
									)
									.addPredicate( new PredicateToken( new IRIToken( "https://schema.org/property-5" ) )
										.addObject( variableHelper( "document__property2__property5" ) )
									)
									.addPredicate( new PredicateToken( new IRIToken( "https://example.com/ns#property-2" ) )
										.addObject( variableHelper( "document__property2__property2" ) )
									)
								)

								.addPattern( new BindToken( "BNODE()", variableHelper( "metadata" ) ) )
								.addPattern( new ValuesToken()
									.addValues( variableHelper( "document" ), new IRIToken( persistedDocument.id ) )
								)
								.addPattern(
									new OptionalToken()
										.addPattern( new SubjectToken( variableHelper( "document" ) )
											.addPredicate( new PredicateToken( "a" )
												.addObject( variableHelper( "document__types" ) )
											)
										)
								)
								.addPattern(
									new OptionalToken()
										.addPattern( new SubjectToken( variableHelper( "document" ) )
											.addPredicate( new PredicateToken( new IRIToken( "https://example.com/ns#property-4" ) )
												.addObject( variableHelper( "document__property4" ) )
											)
										)
										.addPattern( new FilterToken( "datatype( ?document__property4 ) = <http://www.w3.org/2001/XMLSchema#boolean>" ) )
								)
								.addPattern(
									new OptionalToken()
										.addPattern( new SubjectToken( variableHelper( "document" ) )
											.addPredicate( new PredicateToken( new IRIToken( "https://schema.org/property-2" ) )
												.addObject( variableHelper( "document__property2" ) )
											)
										)
										.addPattern( new FilterToken( "! isLiteral( ?document__property2 )" ) )
										.addPattern( new OptionalToken()
											.addPattern( new SubjectToken( variableHelper( "document__property2" ) )
												.addPredicate( new PredicateToken( "a" )
													.addObject( variableHelper( "document__property2__types" ) )
												)
											)
										)
										.addPattern( new OptionalToken()
											.addPattern( new SubjectToken( variableHelper( "document__property2" ) )
												.addPredicate( new PredicateToken( new IRIToken( "https://schema.org/property-3" ) )
													.addObject( variableHelper( "document__property2__property3" ) )
												)
											)
											.addPattern( new FilterToken( "datatype( ?document__property2__property3 ) = <http://www.w3.org/2001/XMLSchema#string>" ) )
										)
										.addPattern( new OptionalToken()
											.addPattern( new SubjectToken( variableHelper( "document__property2" ) )
												.addPredicate( new PredicateToken( new IRIToken( "https://schema.org/property-5" ) )
													.addObject( variableHelper( "document__property2__property5" ) )
												)
											)
											.addPattern( new FilterToken( "datatype( ?document__property2__property5 ) = <http://www.w3.org/2001/XMLSchema#dateTime>" ) )
										)
										.addPattern( new OptionalToken()
											.addPattern( new SubjectToken( variableHelper( "document__property2" ) )
												.addPredicate( new PredicateToken( new IRIToken( "https://example.com/ns#property-2" ) )
													.addObject( variableHelper( "document__property2__property2" ) )
												)
											)
											.addPattern( new FilterToken( "datatype( ?document__property2__property2 ) = <http://www.w3.org/2001/XMLSchema#integer>" ) )
										)
								)
								.addPattern(
									new OptionalToken()
										.addPattern( new SubjectToken( variableHelper( "document" ) )
											.addPredicate( new PredicateToken( new IRIToken( "https://example.com/ns#property-1" ) )
												.addObject( variableHelper( "document__property1" ) )
											)
										)
										.addPattern( new FilterToken( "datatype( ?document__property1 ) = <http://www.w3.org/2001/XMLSchema#string>" ) )
								)
						) );

						done();
					} ).catch( done.fail );
				} );

			} );

		} );

		describe( method( INSTANCE, "saveAndRefresh" ), ():void => {

			it( hasSignature(
				[ "T extends object" ],
				"Save and refresh the Document specified.\n" +
				"If the documents is partial the refresh will be executed with another query.", [
					{ name: "persistedDocument", type: "T & CarbonLDP.Document", description: "The persistedDocument to save and refresh." },
					{ name: "requestOptions", type: "CarbonLDP.HTTP.RequestOptions", optional: true, description: "Customizable options for the request." },
				],
				{ type: "Promise<T & CarbonLDP.Document>" }
			), ():void => {} );

			it( isDefined(), () => {
				expect( Documents.prototype.saveAndRefresh ).toBeDefined();
				expect( Documents.prototype.saveAndRefresh ).toEqual( jasmine.any( Function ) );
			} );

			describe( "When Documents has a specified context", ():void => {

				let context:AbstractContext;
				let documents:Documents;
				beforeEach( ():void => {
					context = new class extends AbstractContext {
						_baseURI:string = "https://example.com/";
						settings:ContextSettings = { vocabulary: "https://example.com/ns#" };
					};
					documents = context.documents;
				} );

				it( "should reject promise if not a persisted document", ( done:DoneFn ):void => {
					const promise:Promise<any> = documents.saveAndRefresh( <any> {} );
					promise.then( () => {
						done.fail( "Should not resolve promise." );
					} ).catch( error => {
						expect( error.message ).toBe( `Provided element is not a valid persisted document.` );
						done();
					} );
				} );

				it( "should reject promise if URI is not in the context base", ( done:DoneFn ):void => {
					const document:Document = Document.decorate( { id: "https://not-example.com" }, documents );

					documents.saveAndRefresh( document )
						.then( () => {
							done.fail( "Should not resolve promise." );
						} ).catch( error => {
						expect( error.message ).toBe( `"https://not-example.com" isn't a valid URI for this Carbon instance.` );
						done();
					} );
				} );

				it( "should reject promise if prefixed URI cannot be resolved", ( done:DoneFn ):void => {
					const document:Document = Document.decorate( { id: "prefix:the-uri" }, documents );

					documents.saveAndRefresh( document )
						.then( () => {
							done.fail( "Should not resolve promise." );
						} )
						.catch( error => {
							expect( error.message ).toBe( `The prefixed URI "prefix:the-uri" could not be resolved.` );
							done();
						} );
				} );

				it( "should sync the persisted blank nodes and update document", async ( done:DoneFn ) => {
					jasmine.Ajax.stubRequest( "https://example.com/resource/", null, "PATCH" ).andReturn( {
						status: 200,
						responseHeaders: {
							"Preference-Applied": "return=representation",
							"ETag": '"1234567890"',
						},
						responseText: `[
							{
								"@id": "_:responseMetadata",
								"@type": [
						            "${ C.VolatileResource }",
						            "${ C.ResponseMetadata }"
								],
								"${ C.documentMetadata }": [ {
									"@id": "_:documentMetadata"
								} ]
							},
							{
								"@id": "_:documentMetadata",
								"@type": [
						            "${ C.VolatileResource }",
						            "${ C.DocumentMetadata }"
								],
								"${ C.relatedDocument }": [ {
									"@id": "https://example.com/resource/"
								} ],
								"${ C.bNodesMap }": [ {
									"@id": "_:map"
								} ]
							},
							{
								"@id": "_:map",
								"@type": [ "${ C.Map }" ],
								"${ C.entry }": [
									{ "@id": "_:entry-1" },
									{ "@id": "_:entry-2" }
								]
							},
							{
								"@id": "_:entry-1",
								"${ C.entryKey }": [ {
								    "@id": "_:1"
							    } ],
								"${ C.entryValue }": [ {
									"@id": "_:new-1"
								} ]
							},
							{
								"@id": "_:entry-2",
								"${ C.entryKey }": [ {
									"@id": "_:2"
								} ],
								"${ C.entryValue }": [ {
									"@id": "_:new-2"
								} ]
							},
							{
								"@id": "https://example.com/resource/",
								"@graph": [
									{
										"@id": "_:new-1",
										"https://example.com/ns#value": [ {
											"@value": "a new value 1"
										} ]
									},
									{
										"@id": "_:new-2",
										"https://example.com/ns#value": [ {
											"@value": "a new value 2"
										} ]
									},
									{
										"@id": "https://example.com/resource/",
										"https://example.com/ns#blankNode1": [ {
											"@id": "_:new-1"
										} ],
										"https://example.com/ns#blankNode2": [ {
											"@id": "_:new-2"
										} ]
									}
								]
							}
						]`,
					} );

					type RawBlankNode = Partial<TransientBlankNode> & { value:string };

					interface RawDocument {
						blankNode1:RawBlankNode;
						blankNode2:RawBlankNode;
					}

					const rawDocument:Document & RawDocument = Document.decorate( Object.assign(
						documents.getPointer( "https://example.com/resource/" ), {
							blankNode1: {
								id: "_:1",
								value: "a value 1",
							},
							blankNode2: {
								id: "_:2",
								value: "a value 2",
							},
						}
					), documents );

					try {
						const document:Document & RawDocument = await documents.saveAndRefresh<RawDocument>( rawDocument );

						expect( document.getFragments().length ).toBe( 2 );

						expect( document.blankNode1 ).toBe( rawDocument.blankNode1 );
						expect( document.blankNode1.id ).toBe( "_:new-1" );
						expect( document.blankNode1 ).toEqual( jasmine.objectContaining( {
							value: "a new value 1",
						} ) );

						expect( document.blankNode2 ).toBe( rawDocument.blankNode2 );
						expect( document.blankNode2.id ).toBe( "_:new-2" );
						expect( document.blankNode2 ).toEqual( jasmine.objectContaining( {
							value: "a new value 2",
						} ) );

						done();
					} catch( e ) {
						done.fail( e );
					}
				} );

				it( "should call _parseErrorResponse when request error", ( done:DoneFn ):void => {
					jasmine.Ajax.stubRequest( "https://example.com/" ).andReturn( {
						status: 500,
						responseText: "",
					} );

					const error:Error = new Error( "Error message" );
					const spy:jasmine.Spy = spyOn( documents, "_parseErrorResponse" ).and.callFake( () => Promise.reject( error ) );

					const document:Document = Document.decorate( { id: "https://example.com/" }, documents );
					documents.saveAndRefresh( document ).then( () => {
						done.fail( "Should not resolve" );
					} ).catch( _error => {
						expect( spy ).toHaveBeenCalled();

						expect( _error ).toBeDefined();
						expect( _error ).toBe( error );

						done();
					} );
				} );


				it( "should reject if document is outdated", ( done:DoneFn ):void => {
					const document:Document = Document.decorate(
						Object.assign( documents.getPointer( "https://example.com/resource/" ), {
							_eTag: null,
						} ),
						documents
					);

					documents.saveAndRefresh( document )
						.then( () => {
							done.fail( "Should not resolve" );
						} )
						.catch( error => {
							expect( error ).toEqual( jasmine.any( Errors.IllegalStateError ) );
							expect( error.message ).toEqual( "Cannot save an outdated document." );
							done();
						} );
				} );

				it( "should send the patch delta", ( done:DoneFn ):void => {
					jasmine.Ajax.stubRequest( "https://example.com/resource/", null, "PATCH" ).andReturn( {
						status: 200,
						responseHeaders: {
							"ETag": `"0123456789"`,
						},
					} );

					context.extendObjectSchema( {
						"xsd": XSD.namespace,
					} );
					context.extendObjectSchema( "https://example.com/ns#Document", {
						"list": {
							"@container": "@list",
						},
						"pointer": {
							"@type": "@id",
						},
					} );
					context.extendObjectSchema( "https://example.com/ns#Fragment", {
						"string": {
							"@type": XSD.string,
							"@container": "@set",
						},
						"pointer": {
							"@type": "@id",
						},
					} );
					context.extendObjectSchema( "https://example.com/ns#BlankNode", {
						"number": {
							"@type": XSD.integer,
						},
					} );

					const persistedDocument:Document = Document.decorate( {
						id: "https://example.com/resource/",
						types: [ "https://example.com/ns#Document" ],
						list: [ 1, 2, 3, 4, 5 ],
						pointer: {
							id: "https://example.com/resource/#fragment",
							types: [ "https://example.con/ns#Fragment" ],
							string: [ "string 1", "string 2" ],
							pointer: [ {
								id: "_:blank-node",
								types: [ "https://example.con/ns#Fragment", "https://example.com/ns#BlankNode" ],
								string: [ "string 1" ],
								number: 100,
							} ],
						},
					}, documents );
					persistedDocument._normalize();
					persistedDocument._syncSnapshot();
					persistedDocument.getFragments().forEach( fragment => fragment._syncSnapshot() );

					persistedDocument.addType( "NewType" );
					persistedDocument[ "list" ] = [ 4, 1, 2, "s-1", "s-2", "s-3", 3 ];
					persistedDocument[ "pointer" ][ "string" ] = [ "string 2", "string 3" ];
					persistedDocument[ "pointer" ][ "pointer" ][ 0 ][ "string" ] = [ "string 1", "string -1" ];
					persistedDocument[ "pointer" ][ "pointer" ][ 0 ][ "number" ] = 100.001;

					documents.saveAndRefresh( persistedDocument ).then( () => {
						const request:JasmineAjaxRequest = jasmine.Ajax.requests.mostRecent();
						expect( request.params ).toBe( "" +
							`@prefix xsd: <${ XSD.namespace }>. ` +
							`UpdateList <https://example.com/resource/> <https://example.com/ns#list> 3..5 (). ` +
							`UpdateList <https://example.com/resource/> <https://example.com/ns#list> 0..0 ( "4"^^xsd:float ). ` +
							`UpdateList <https://example.com/resource/> <https://example.com/ns#list> 3..3 ( "s-1" "s-2" "s-3" ). ` +
							`Add { ` +
							`` + `<https://example.com/resource/> a <https://example.com/ns#NewType>. ` +
							`` + `<https://example.com/resource/#fragment> <https://example.com/ns#string> "string 3". ` +
							`` + `_:blank-node <https://example.com/ns#string> "string -1". ` +
							`}. ` +
							`Delete { ` +
							`` + `<https://example.com/resource/#fragment> <https://example.com/ns#string> "string 1". ` +
							`}.` +
							``
						);

						done();
					} ).catch( done.fail );
				} );

				it( "should send expected headers", ( done:DoneFn ):void => {
					jasmine.Ajax.stubRequest( "https://example.com/resource/", null, "PATCH" ).andReturn( {
						status: 200,
						responseText: `[]`,
					} );

					const document:Document = Document.decorate(
						Object.assign( documents.getPointer( "https://example.com/resource/" ), {
							_eTag: `"1-12345"`,
						} ),
						documents
					);

					documents.saveAndRefresh( document )
						.then( ():void => {
							const request:JasmineAjaxRequest = jasmine.Ajax.requests.mostRecent();
							expect( request.requestHeaders ).toEqual( {
								"content-type": "text/ldpatch",
								"accept": "application/ld+json",
								"if-match": `"1-12345"`,
								"prefer": [
									`return=representation`,
								].join( ", " ),
							} );

							done();
						} )
						.catch( done.fail );
				} );

				it( "should update a full document", ( done:DoneFn ):void => {
					jasmine.Ajax.stubRequest( "https://example.com/resource/", null, "PATCH" ).andReturn( {
						status: 200,
						responseHeaders: {
							"ETag": `"2-12345"`,
							"Preference-Applied": "return=representation",
						},
						responseText: `[ {
							"@id": "https://example.com/resource/",
							"@graph": [
								{
									"@id": "https://example.com/resource/",
									"https://example.com/ns#string": [ {"@value": "Changed Document Resource"} ],
									"https://example.com/ns#pointerSet": [
										{"@id": "https://example.com/resource/#1"}
									]
								},
								{
									"@id": "https://example.com/resource/#1",
									"https://example.com/ns#string": [ {"@value": "Changed NamedFragment 1"} ]
								},
								{
									"@id": "https://example.com/resource/#3",
									"https://example.com/ns#string": [ {"@value": "NamedFragment 3"} ]
								}
							]
						} ]`,
					} );

					const document:Document = Document.decorate(
						Object.assign( documents.getPointer( "https://example.com/resource/" ), {
							_eTag: `"1-12345"`,
							_resolved: true,
							string: "Document Resource",
							pointerSet: [
								{
									id: "#1",
									string: "NamedFragment 1",
								},
								documents.getPointer( "https://example.com/external-resource/" ),
							],
							"new-property": "A new property that will be erased at refresh",
						} ),
						documents
					);
					document._normalize();

					const fragment:NamedFragment = document.getFragment( "#1" );

					documents.saveAndRefresh( document )
						.then( ( returnedDocument ) => {
							expect( returnedDocument ).toBe( document );

							expect( document ).toEqual( jasmine.objectContaining( {
								_eTag: `"2-12345"`,
								_resolved: true,
								string: "Changed Document Resource",
								pointerSet: [ jasmine.objectContaining( {
									id: "https://example.com/resource/#1",
									string: "Changed NamedFragment 1",
								} ) ],
							} ) );

							expect( document[ "pointerSet" ][ 0 ] ).toBe( fragment );

							expect( document ).not.toEqual( jasmine.objectContaining( {
								_eTag: `"1-12345"`,
								"new-property": "A new property that will be erased at refresh",
							} ) );

							expect( document.getFragment( "#3" ) ).toEqual( jasmine.objectContaining( {
								id: "https://example.com/resource/#3",
								string: "NamedFragment 3",
							} ) );

							done();
						} )
						.catch( done.fail );
				} );

				it( "should update a partial document", ( done:DoneFn ):void => {
					jasmine.Ajax.stubRequest( `${ context.baseURI }resource/`, null, "PATCH" ).andReturn( {
						status: 200,
						responseText: `[]`,
					} );
					jasmine.Ajax.stubRequest( `${ context.baseURI }resource/`, null, "POST" ).andReturn( {
						status: 200,
						responseText: `[ {
							"@id":"_:1",
							"@type": [
								"${ C.VolatileResource }",
								"${ C.QueryMetadata }"
							],
							"${ C.target }": [ {
								"@id":"${ context.baseURI }resource/"
							} ]
						}, {
							"@id": "_:2",
							"@type": [
								"${ C.ResponseMetadata }",
								"${ C.VolatileResource }"
							],
							"${ C.documentMetadata }": [ {
								"@id": "_:3"
							} ]
						}, {
							"@id": "_:3",
							"@type": [
								"${ C.DocumentMetadata }",
								"${ C.VolatileResource }"
							],
							"${ C.eTag }": [ {
								"@value": "\\"2-12345\\""
							} ],
							"${ C.relatedDocument }": [ {
								"@id": "${ context.baseURI }resource/"
							} ]
						}, {
							"@id": "${ context.baseURI }resource/",
							"@graph": [ {
								"@id": "${ context.baseURI }resource/",
								"@type": [
									"${ C.Document }",
									"https://example.com/ns#Resource",
									"${ LDP.BasicContainer }",
									"${ LDP.RDFSource }"
								],
								"https://example.com/ns#property-1": [ {
									"@value": "updated value"
								} ],
								"https://schema.org/property-2": [ {
									"@id": "_:1"
								} ],
								"https://example.com/ns#property-4": [ {
									"@value": "false",
									"@type": "${ XSD.boolean }"
								} ]
							}, {
								"@id": "_:1",
								"https://schema.org/property-3": [ {
									"@value": "updated sub-value"
								} ],
								"https://schema.org/property-5": [ {
									"@value": "2010-01-01",
									"@type": "${ XSD.dateTime }"
								} ]
							} ]
						} ]`,
					} );

					interface MyDocument {
						property1:string;
						property2:{
							property2:number;
							property3:string;
							property5:Date;
						};
						property3:string;
						property4:boolean;
					}

					const persistedDocument:Document & MyDocument = Document.decorate(
						Object.assign( documents.getPointer( `${ context.baseURI }resource/` ), {
							_eTag: `"1-12345"`,
							property1: "value",
							property3: "non query-value",
							property4: true,
							property2: {
								id: "_:1",
								property3: "sub-value",
								property5: new Date( "2000-01-01" ),
								property2: 12345,
								_partialMetadata: createPartialMetadata( {
									"@vocab": "https://example.com/ns#",
									"property2": {
										"@id": "https://example.com/ns#property-2",
										"@type": XSD.integer,
									},
									"property3": {
										"@id": "https://schema.org/property-3",
										"@type": XSD.string,
									},
									"property5": {
										"@id": "https://schema.org/property-5",
										"@type": XSD.dateTime,
									},
								} ),
							},
							_partialMetadata: createPartialMetadata( {
								"@vocab": "https://example.com/ns#",
								"property1": {
									"@id": "https://example.com/ns#property-1",
									"@type": XSD.string,
								},
								"property2": {
									"@id": "https://schema.org/property-2",
									"@type": "@id",
								},
								"property4": {
									"@id": "https://example.com/ns#property-4",
									"@type": XSD.boolean,
								},
							} ),
						} ),
						documents
					);

					Utils.promiseMethod( () => {
						return documents.saveAndRefresh<MyDocument>( persistedDocument );
					} ).then( ( document ) => {
						expect( Document.is( document ) ).toBe( true );

						// Data updates
						expect( document ).toEqual( jasmine.objectContaining( {
							"property4": false,
							"property1": "updated value",
							"property2": jasmine.objectContaining( {
								"property3": "updated sub-value",
								"property5": new Date( "2010-01-01" ),
							} ) as any,
						} ) );

						// Non query data
						expect( document ).toEqual( jasmine.objectContaining( {
							"property3": "non query-value",
						} ) );

						// Data removed
						expect( document.property2 ).not.toEqual( jasmine.objectContaining( {
							"property2": 12345,
						} ) );

						done();
					} ).catch( done.fail );
				} );

			} );

			describe( "When Documents does not have a context", ():void => {

				let documents:Documents;
				beforeEach( () => {
					documents = new Documents();
				} );

				it( "should reject if URI is relative", ( done:DoneFn ):void => {
					const document:Document = Document.decorate( { id: "relative-uri/" }, documents );

					documents.saveAndRefresh( document )
						.then( () => {
							done.fail( "Should not resolve promise." );
						} )
						.catch( error => {
							expect( error.message ).toBe( "This Documents instance doesn't support relative URIs." );
							done();
						} );
				} );

				it( "should reject if URI is prefixed", ( done:DoneFn ):void => {
					const document:Document = Document.decorate( { id: "prefix:the-uri" }, documents );

					documents.saveAndRefresh( document )
						.then( () => {
							done.fail( "Should not resolve promise." );
						} )
						.catch( error => {
							expect( error.message ).toBe( "This Documents instance doesn't support prefixed URIs." );
							done();
						} );
				} );

				it( "should call _parseErrorResponse when request error", ( done:DoneFn ):void => {
					jasmine.Ajax.stubRequest( "https://example.com/" ).andReturn( {
						status: 500,
						responseText: "",
					} );

					const error:Error = new Error( "Error message" );
					const spy:jasmine.Spy = spyOn( documents, "_parseErrorResponse" ).and.callFake( () => Promise.reject( error ) );

					const document:Document = Document.decorate( { id: "https://example.com/" }, documents );
					documents.saveAndRefresh( document ).then( () => {
						done.fail( "Should not resolve" );
					} ).catch( _error => {
						expect( spy ).toHaveBeenCalled();

						expect( _error ).toBeDefined();
						expect( _error ).toBe( error );

						done();
					} );
				} );

			} );

		} );


		describe( method(
			INSTANCE,
			"delete"
		), ():void => {

			it( hasSignature(
				"Delete the resource from the Carbon LDP server referred by the URI provided.", [
					{ name: "documentURI", type: "string", description: "The resource to delete from the Carbon LDP server." },
					{ name: "requestOptions", type: "CarbonLDP.HTTP.RequestOptions", optional: true, description: "Customizable options for the request." },
				],
				{ type: "Promise<void>" }
			), ( done:DoneFn ):void => {
				class MockedContext extends AbstractContext {
					protected _baseURI:string;

					constructor() {
						super();
						this._baseURI = "https://example.com/";
						this.settings = { paths: { system: ".system/" } };
					}
				}

				let context:MockedContext = new MockedContext();
				let documents:Documents = context.documents;

				expect( documents.delete ).toBeDefined();
				expect( Utils.isFunction( documents.delete ) ).toBe( true );

				jasmine.Ajax.stubRequest( "https://example.com/resource/", null, "DELETE" ).andReturn( {
					status: 200,
				} );
				jasmine.Ajax.stubRequest( "https://example.com/a-document/", null, "DELETE" ).andReturn( {
					status: 200,
				} );

				let spySuccess:jasmine.Spy = jasmine.createSpy( "success" );

				let promises:Promise<any>[] = [];
				let promise:Promise<any>;

				// Proper execution
				promise = documents.delete( "https://example.com/resource/" );
				expect( promise ).toEqual( jasmine.any( Promise ) );
				promises.push( promise.then( spySuccess ) );

				// Relative URI
				promise = documents.delete( "resource/" );
				expect( promise ).toEqual( jasmine.any( Promise ) );
				promises.push( promise.then( spySuccess ) );

				// Remove pointer from cache
				documents.getPointer( "https://example.com/a-document/" );
				promise = documents.delete( "https://example.com/a-document/" );
				expect( promise ).toEqual( jasmine.any( Promise ) );
				promises.push( promise.then( spySuccess ) );

				Promise.all( promises ).then( ():void => {
					expect( spySuccess ).toHaveBeenCalledTimes( 3 );
					expect( spySuccess ).toHaveBeenCalledWith( void 0 );

					expect( documents.hasPointer( "https://example.com/a-document/" ) ).toBe( false );
					done();
				}, done.fail );
			} );

			describe( "When Documents has a specified context", ():void => {
				let documents:Documents;

				beforeEach( () => {
					let context:AbstractContext = new class extends AbstractContext {
						protected _baseURI:string;

						constructor() {
							super();
							this._baseURI = "https://example.com/";
						}
					}();
					documents = context.documents;
				} );

				it( "should reject promise if URI is not in the context base", ( done:DoneFn ):void => {
					const promise:Promise<any> = documents.delete( "http://not-example.com" );
					promise.then( () => {
						done.fail( "Should not resolve promise." );
					} ).catch( error => {
						expect( error.message ).toBe( `"http://not-example.com" isn't a valid URI for this Carbon instance.` );
						done();
					} );
				} );

				it( "should reject promise if prefixed URI cannot be resolved", ( done:DoneFn ):void => {
					const promise:Promise<any> = documents.delete( "prefix:the-uri" );
					promise.then( () => {
						done.fail( "Should not resolve promise." );
					} ).catch( error => {
						expect( error.message ).toBe( `The prefixed URI "prefix:the-uri" could not be resolved.` );
						done();
					} );
				} );

				it( "should call _parseErrorResponse when request error", ( done:DoneFn ):void => {
					jasmine.Ajax.stubRequest( "https://example.com/" ).andReturn( {
						status: 500,
						responseText: "",
					} );

					const error:Error = new Error( "Error message" );
					const spy:jasmine.Spy = spyOn( documents, "_parseErrorResponse" ).and.callFake( () => Promise.reject( error ) );

					documents.delete( "https://example.com/" ).then( () => {
						done.fail( "Should not resolve" );
					} ).catch( _error => {
						expect( spy ).toHaveBeenCalled();

						expect( _error ).toBeDefined();
						expect( _error ).toBe( error );

						done();
					} );
				} );

			} );

			describe( "When Documents does not have a context", ():void => {
				let documents:Documents;

				beforeEach( () => {
					documents = new Documents();
				} );

				it( "should reject if URI is relative", ( done:DoneFn ):void => {
					const promise:Promise<any> = documents.delete( "relative-uri/" );
					promise.then( () => {
						done.fail( "Should not resolve promise." );
					} ).catch( error => {
						expect( error.message ).toBe( "This Documents instance doesn't support relative URIs." );
						done();
					} );
				} );

				it( "should reject if URI is prefixed", ( done:DoneFn ):void => {
					const promise:Promise<any> = documents.delete( "prefix:the-uri" );
					promise.then( () => {
						done.fail( "Should not resolve promise." );
					} ).catch( error => {
						expect( error.message ).toBe( "This Documents instance doesn't support prefixed URIs." );
						done();
					} );
				} );

				it( "should call _parseErrorResponse when request error", ( done:DoneFn ):void => {
					jasmine.Ajax.stubRequest( "https://example.com/" ).andReturn( {
						status: 500,
						responseText: "",
					} );

					const error:Error = new Error( "Error message" );
					const spy:jasmine.Spy = spyOn( documents, "_parseErrorResponse" ).and.callFake( () => Promise.reject( error ) );

					documents.delete( "https://example.com/" ).then( () => {
						done.fail( "Should not resolve" );
					} ).catch( _error => {
						expect( spy ).toHaveBeenCalled();

						expect( _error ).toBeDefined();
						expect( _error ).toBe( error );

						done();
					} );
				} );

			} );

		} );

		describe( method(
			INSTANCE,
			"executeRawASKQuery"
		), ():void => {

			it( hasSignature(
				"Executes an ASK query on a document and returns a raw application/sparql-results+json object.", [
					{ name: "documentURI", type: "string", description: "URI of the document that works as a SPARQL endpoint where to execute the SPARQL query." },
					{ name: "askQuery", type: "string", description: "ASK query to execute in the selected endpoint." },
					{ name: "requestOptions", type: "CarbonLDP.HTTP.RequestOptions", optional: true, description: "Customizable options for the request." },
				], { type: "Promise<CarbonLDP.SPARQL.SPARQLRawResults>" }
			), ():void => {} );

			it( "should exists", ():void => {
				const documents:Documents = new Documents();
				expect( documents.executeRawASKQuery ).toBeDefined();
				expect( documents.executeRawASKQuery ).toEqual( jasmine.any( Function ) );
			} );

			describe( "When Documents has a specified context", ():void => {
				let documents:Documents;

				beforeEach( () => {
					const context:AbstractContext = new class extends AbstractContext {
						protected _baseURI:string;

						constructor() {
							super();
							this._baseURI = "https://example.com/";
						}
					};
					documents = context.documents;
				} );

				it( "should use SPARQL service", ():void => {
					const spyService:jasmine.Spy = spyOn( SPARQL.SPARQLService, "executeRawASKQuery" ).and.returnValue( new Promise( () => {} ) );

					// noinspection JSIgnoredPromiseFromCall
					documents.executeRawASKQuery( "https://example.com/document/", "ASK { ?subject, ?predicate, ?object }" );

					expect( spyService ).toHaveBeenCalledWith( "https://example.com/document/", "ASK { ?subject, ?predicate, ?object }", jasmine.any( Object ) );
				} );

				it( "should resolve relative URIs", ():void => {
					const spyService:jasmine.Spy = spyOn( SPARQL.SPARQLService, "executeRawASKQuery" ).and.returnValue( new Promise( () => {} ) );

					// noinspection JSIgnoredPromiseFromCall
					documents.executeRawASKQuery( "document/", "ASK { ?subject, ?predicate, ?object }" );

					expect( spyService ).toHaveBeenCalledWith( "https://example.com/document/", "ASK { ?subject, ?predicate, ?object }", jasmine.any( Object ) );
				} );

				it( "should reject promise if URI is not in the context base", ( done:DoneFn ):void => {
					const promise:Promise<any> = documents.executeRawASKQuery( "http://not-example.com", "query" );
					promise.then( () => {
						done.fail( "Should not resolve promise." );
					} ).catch( error => {
						expect( error.message ).toBe( `"http://not-example.com" isn't a valid URI for this Carbon instance.` );
						done();
					} );
				} );

				it( "should reject promise if prefixed URI cannot be resolved", ( done:DoneFn ):void => {
					const promise:Promise<any> = documents.executeRawASKQuery( "prefix:the-uri", "query" );
					promise.then( () => {
						done.fail( "Should not resolve promise." );
					} ).catch( error => {
						expect( error.message ).toBe( `The prefixed URI "prefix:the-uri" could not be resolved.` );
						done();
					} );
				} );

				it( "should call _parseErrorResponse when request error", ( done:DoneFn ):void => {
					jasmine.Ajax.stubRequest( "https://example.com/" ).andReturn( {
						status: 500,
						responseText: "",
					} );

					const error:Error = new Error( "Error message" );
					const spy:jasmine.Spy = spyOn( documents, "_parseErrorResponse" ).and.callFake( () => Promise.reject( error ) );

					documents.executeRawASKQuery( "https://example.com/", "" ).then( () => {
						done.fail( "Should not resolve" );
					} ).catch( _error => {
						expect( spy ).toHaveBeenCalled();

						expect( _error ).toBeDefined();
						expect( _error ).toBe( error );

						done();
					} );
				} );

			} );

			describe( "When Documents does not have a context", ():void => {
				let documents:Documents;

				beforeEach( () => {
					documents = new Documents();
				} );

				it( "should use SPARQL service", ():void => {
					const spyService:jasmine.Spy = spyOn( SPARQL.SPARQLService, "executeRawASKQuery" ).and.returnValue( new Promise( () => {} ) );

					// noinspection JSIgnoredPromiseFromCall
					documents.executeRawASKQuery( "https://example.com/document/", "ASK { ?subject, ?predicate, ?object }" );

					expect( spyService ).toHaveBeenCalledWith( "https://example.com/document/", "ASK { ?subject, ?predicate, ?object }", jasmine.any( Object ) );
				} );

				it( "should reject if URI is relative", ( done:DoneFn ):void => {
					const promise:Promise<any> = documents.executeRawASKQuery( "relative-uri/", "query" );
					promise.then( () => {
						done.fail( "Should not resolve promise." );
					} ).catch( error => {
						expect( error.message ).toBe( "This Documents instance doesn't support relative URIs." );
						done();
					} );
				} );

				it( "should reject if URI is prefixed", ( done:DoneFn ):void => {
					const promise:Promise<any> = documents.executeRawASKQuery( "prefix:the-uri", "query" );
					promise.then( () => {
						done.fail( "Should not resolve promise." );
					} ).catch( error => {
						expect( error.message ).toBe( "This Documents instance doesn't support prefixed URIs." );
						done();
					} );
				} );

				it( "should call _parseErrorResponse when request error", ( done:DoneFn ):void => {
					jasmine.Ajax.stubRequest( "https://example.com/" ).andReturn( {
						status: 500,
						responseText: "",
					} );

					const error:Error = new Error( "Error message" );
					const spy:jasmine.Spy = spyOn( documents, "_parseErrorResponse" ).and.callFake( () => Promise.reject( error ) );

					documents.executeRawASKQuery( "https://example.com/", "" ).then( () => {
						done.fail( "Should not resolve" );
					} ).catch( _error => {
						expect( spy ).toHaveBeenCalled();

						expect( _error ).toBeDefined();
						expect( _error ).toBe( error );

						done();
					} );
				} );

			} );

		} );

		describe( method(
			INSTANCE,
			"executeASKQuery"
		), ():void => {

			it( hasSignature(
				"Executes an ASK query on a document and returns the response of the query in form of a boolean.", [
					{ name: "documentURI", type: "string", description: "URI of the document that works as a SPARQL endpoint where to execute the SPARQL query." },
					{ name: "askQuery", type: "string", description: "ASK query to execute in the selected endpoint." },
					{ name: "requestOptions", type: "CarbonLDP.HTTP.RequestOptions", optional: true, description: "Customizable options for the request." },
				], { type: "Promise<boolean>" }
			), ():void => {} );

			it( "should exists", ():void => {
				const documents:Documents = new Documents();
				expect( documents.executeASKQuery ).toBeDefined();
				expect( documents.executeASKQuery ).toEqual( jasmine.any( Function ) );
			} );

			describe( "When Documents has a specified context", ():void => {
				let documents:Documents;

				beforeEach( () => {
					let context:AbstractContext = new class extends AbstractContext {
						protected _baseURI:string;

						constructor() {
							super();
							this._baseURI = "https://example.com/";
						}
					}();
					documents = context.documents;
				} );

				it( "should use SPARQL service", ():void => {
					const spyService:jasmine.Spy = spyOn( SPARQL.SPARQLService, "executeASKQuery" ).and.returnValue( new Promise( () => {} ) );

					// noinspection JSIgnoredPromiseFromCall
					documents.executeASKQuery( "https://example.com/document/", "ASK { ?subject, ?predicate, ?object }" );

					expect( spyService ).toHaveBeenCalledWith( "https://example.com/document/", "ASK { ?subject, ?predicate, ?object }", jasmine.any( Object ) );
				} );

				it( "should resolve relative URIs", ():void => {
					const spyService:jasmine.Spy = spyOn( SPARQL.SPARQLService, "executeASKQuery" ).and.returnValue( new Promise( () => {} ) );

					// noinspection JSIgnoredPromiseFromCall
					documents.executeASKQuery( "document/", "ASK { ?subject, ?predicate, ?object }" );

					expect( spyService ).toHaveBeenCalledWith( "https://example.com/document/", "ASK { ?subject, ?predicate, ?object }", jasmine.any( Object ) );
				} );

				it( "should reject promise if URI is not in the context base", ( done:DoneFn ):void => {
					const promise:Promise<any> = documents.executeASKQuery( "http://not-example.com", "query" );
					promise.then( () => {
						done.fail( "Should not resolve promise." );
					} ).catch( error => {
						expect( error.message ).toBe( `"http://not-example.com" isn't a valid URI for this Carbon instance.` );
						done();
					} );
				} );

				it( "should reject promise if prefixed URI cannot be resolved", ( done:DoneFn ):void => {
					const promise:Promise<any> = documents.executeASKQuery( "prefix:the-uri", "query" );
					promise.then( () => {
						done.fail( "Should not resolve promise." );
					} ).catch( error => {
						expect( error.message ).toBe( `The prefixed URI "prefix:the-uri" could not be resolved.` );
						done();
					} );
				} );

				it( "should call _parseErrorResponse when request error", ( done:DoneFn ):void => {
					jasmine.Ajax.stubRequest( "https://example.com/" ).andReturn( {
						status: 500,
						responseText: "",
					} );

					const error:Error = new Error( "Error message" );
					const spy:jasmine.Spy = spyOn( documents, "_parseErrorResponse" ).and.callFake( () => Promise.reject( error ) );

					documents.executeASKQuery( "https://example.com/", "" ).then( () => {
						done.fail( "Should not resolve" );
					} ).catch( _error => {
						expect( spy ).toHaveBeenCalled();

						expect( _error ).toBeDefined();
						expect( _error ).toBe( error );

						done();
					} );
				} );

			} );

			describe( "When Documents does not have a context", ():void => {
				let documents:Documents;

				beforeEach( () => {
					documents = new Documents();
				} );

				it( "should use SPARQL service", ():void => {
					const spyService:jasmine.Spy = spyOn( SPARQL.SPARQLService, "executeASKQuery" ).and.returnValue( new Promise( () => {} ) );

					// noinspection JSIgnoredPromiseFromCall
					documents.executeASKQuery( "https://example.com/document/", "ASK { ?subject, ?predicate, ?object }" );

					expect( spyService ).toHaveBeenCalledWith( "https://example.com/document/", "ASK { ?subject, ?predicate, ?object }", jasmine.any( Object ) );
				} );

				it( "should reject if URI is relative", ( done:DoneFn ):void => {
					const promise:Promise<any> = documents.executeASKQuery( "relative-uri/", "query" );
					promise.then( () => {
						done.fail( "Should not resolve promise." );
					} ).catch( error => {
						expect( error.message ).toBe( "This Documents instance doesn't support relative URIs." );
						done();
					} );
				} );

				it( "should reject if URI is prefixed", ( done:DoneFn ):void => {
					const promise:Promise<any> = documents.executeASKQuery( "prefix:the-uri", "query" );
					promise.then( () => {
						done.fail( "Should not resolve promise." );
					} ).catch( error => {
						expect( error.message ).toBe( "This Documents instance doesn't support prefixed URIs." );
						done();
					} );
				} );

				it( "should call _parseErrorResponse when request error", ( done:DoneFn ):void => {
					jasmine.Ajax.stubRequest( "https://example.com/" ).andReturn( {
						status: 500,
						responseText: "",
					} );

					const error:Error = new Error( "Error message" );
					const spy:jasmine.Spy = spyOn( documents, "_parseErrorResponse" ).and.callFake( () => Promise.reject( error ) );

					documents.executeASKQuery( "https://example.com/", "" ).then( () => {
						done.fail( "Should not resolve" );
					} ).catch( _error => {
						expect( spy ).toHaveBeenCalled();

						expect( _error ).toBeDefined();
						expect( _error ).toBe( error );

						done();
					} );
				} );

			} );

		} );

		describe( method(
			INSTANCE,
			"executeRawSELECTQuery"
		), ():void => {

			it( hasSignature(
				"Executes a SELECT query on a document and returns a raw application/sparql-results+json object.", [
					{ name: "documentURI", type: "string", description: "URI of the document that works as a SPARQL endpoint where to execute the SPARQL query." },
					{ name: "selectQuery", type: "string", description: "SELECT query to execute in the selected endpoint." },
					{ name: "requestOptions", type: "CarbonLDP.HTTP.RequestOptions", optional: true, description: "Customizable options for the request." },
				], { type: "Promise<CarbonLDP.SPARQL.SPARQLRawResults>" }
			), ():void => {} );

			it( "should exists", ():void => {
				const documents:Documents = new Documents();
				expect( documents.executeRawSELECTQuery ).toBeDefined();
				expect( documents.executeRawSELECTQuery ).toEqual( jasmine.any( Function ) );
			} );

			describe( "When Documents has a specified context", ():void => {
				let documents:Documents;

				beforeEach( () => {
					const context:AbstractContext = new class extends AbstractContext {
						protected _baseURI:string;

						constructor() {
							super();
							this._baseURI = "https://example.com/";
						}
					};
					documents = context.documents;
				} );

				it( "should use SPARQL service", ():void => {
					const spyService:jasmine.Spy = spyOn( SPARQL.SPARQLService, "executeRawSELECTQuery" ).and.returnValue( new Promise( () => {} ) );

					// noinspection JSIgnoredPromiseFromCall
					documents.executeRawSELECTQuery( "https://example.com/document/", "SELECT ?book ?title WHERE { <https://example.com/some-document/> ?book ?title }" );

					expect( spyService ).toHaveBeenCalledWith( "https://example.com/document/", "SELECT ?book ?title WHERE { <https://example.com/some-document/> ?book ?title }", jasmine.any( Object ) );
				} );

				it( "should resolve relative URIs", ():void => {
					const spyService:jasmine.Spy = spyOn( SPARQL.SPARQLService, "executeRawSELECTQuery" ).and.returnValue( new Promise( () => {} ) );

					// noinspection JSIgnoredPromiseFromCall
					documents.executeRawSELECTQuery( "https://example.com/document/", "SELECT ?book ?title WHERE { <https://example.com/some-document/> ?book ?title }" );

					expect( spyService ).toHaveBeenCalledWith( "https://example.com/document/", "SELECT ?book ?title WHERE { <https://example.com/some-document/> ?book ?title }", jasmine.any( Object ) );
				} );

				it( "should reject promise if URI is not in the context base", ( done:DoneFn ):void => {
					const promise:Promise<any> = documents.executeRawSELECTQuery( "http://not-example.com", "query" );
					promise.then( () => {
						done.fail( "Should not resolve promise." );
					} ).catch( error => {
						expect( error.message ).toBe( `"http://not-example.com" isn't a valid URI for this Carbon instance.` );
						done();
					} );
				} );

				it( "should reject promise if prefixed URI cannot be resolved", ( done:DoneFn ):void => {
					const promise:Promise<any> = documents.executeRawSELECTQuery( "prefix:the-uri", "query" );
					promise.then( () => {
						done.fail( "Should not resolve promise." );
					} ).catch( error => {
						expect( error.message ).toBe( `The prefixed URI "prefix:the-uri" could not be resolved.` );
						done();
					} );
				} );

				it( "should call _parseErrorResponse when request error", ( done:DoneFn ):void => {
					jasmine.Ajax.stubRequest( "https://example.com/" ).andReturn( {
						status: 500,
						responseText: "",
					} );

					const error:Error = new Error( "Error message" );
					const spy:jasmine.Spy = spyOn( documents, "_parseErrorResponse" ).and.callFake( () => Promise.reject( error ) );

					documents.executeRawSELECTQuery( "https://example.com/", "" ).then( () => {
						done.fail( "Should not resolve" );
					} ).catch( _error => {
						expect( spy ).toHaveBeenCalled();

						expect( _error ).toBeDefined();
						expect( _error ).toBe( error );

						done();
					} );
				} );

			} );

			describe( "When Documents does not have a context", ():void => {
				let documents:Documents;

				beforeEach( () => {
					documents = new Documents();
				} );

				it( "should use SPARQL service", ():void => {
					const spyService:jasmine.Spy = spyOn( SPARQL.SPARQLService, "executeRawSELECTQuery" ).and.returnValue( new Promise( () => {} ) );

					// noinspection JSIgnoredPromiseFromCall
					documents.executeRawSELECTQuery( "https://example.com/document/", "SELECT ?book ?title WHERE { <https://example.com/some-document/> ?book ?title }" );

					expect( spyService ).toHaveBeenCalledWith( "https://example.com/document/", "SELECT ?book ?title WHERE { <https://example.com/some-document/> ?book ?title }", jasmine.any( Object ) );
				} );

				it( "should reject if URI is relative", ( done:DoneFn ):void => {
					const promise:Promise<any> = documents.executeRawSELECTQuery( "relative-uri/", "query" );
					promise.then( () => {
						done.fail( "Should not resolve promise." );
					} ).catch( error => {
						expect( error.message ).toBe( "This Documents instance doesn't support relative URIs." );
						done();
					} );
				} );

				it( "should reject if URI is prefixed", ( done:DoneFn ):void => {
					const promise:Promise<any> = documents.executeRawSELECTQuery( "prefix:the-uri", "query" );
					promise.then( () => {
						done.fail( "Should not resolve promise." );
					} ).catch( error => {
						expect( error.message ).toBe( "This Documents instance doesn't support prefixed URIs." );
						done();
					} );
				} );

				it( "should call _parseErrorResponse when request error", ( done:DoneFn ):void => {
					jasmine.Ajax.stubRequest( "https://example.com/" ).andReturn( {
						status: 500,
						responseText: "",
					} );

					const error:Error = new Error( "Error message" );
					const spy:jasmine.Spy = spyOn( documents, "_parseErrorResponse" ).and.callFake( () => Promise.reject( error ) );

					documents.executeRawSELECTQuery( "https://example.com/", "" ).then( () => {
						done.fail( "Should not resolve" );
					} ).catch( _error => {
						expect( spy ).toHaveBeenCalled();

						expect( _error ).toBeDefined();
						expect( _error ).toBe( error );

						done();
					} );
				} );

			} );

		} );

		describe( method(
			INSTANCE,
			"executeSELECTQuery"
		), ():void => {

			it( hasSignature(
				[ "T extends object" ],
				"Executes a SELECT query on a document and returns a parsed response object.", [
					{ name: "documentURI", type: "string", description: "URI of the document that works as a SPARQL endpoint where to execute the SPARQL query." },
					{ name: "selectQuery", type: "string", description: "SELECT query to execute in the selected endpoint." },
					{ name: "requestOptions", type: "CarbonLDP.HTTP.RequestOptions", optional: true, description: "Customizable options for the request." },
				], { type: "Promise<CarbonLDP.SPARQL.SPARQLSelectResults<T>>" }
			), ():void => {} );

			it( "should exists", ():void => {
				const documents:Documents = new Documents();
				expect( documents.executeSELECTQuery ).toBeDefined();
				expect( documents.executeSELECTQuery ).toEqual( jasmine.any( Function ) );
			} );

			describe( "When Documents has a specified context", ():void => {
				let documents:Documents;

				beforeEach( () => {
					const context:AbstractContext = new class extends AbstractContext {
						protected _baseURI:string;

						constructor() {
							super();
							this._baseURI = "https://example.com/";
						}
					}();
					documents = context.documents;
				} );

				it( "should use SPARQL service", ():void => {
					const spyService:jasmine.Spy = spyOn( SPARQL.SPARQLService, "executeSELECTQuery" ).and.returnValue( new Promise( () => {} ) );

					// noinspection JSIgnoredPromiseFromCall
					documents.executeSELECTQuery( "https://example.com/document/", "SELECT ?book ?title WHERE { <https://example.com/some-document/> ?book ?title }" );

					expect( spyService ).toHaveBeenCalledWith( "https://example.com/document/", "SELECT ?book ?title WHERE { <https://example.com/some-document/> ?book ?title }", documents, jasmine.any( Object ) );
				} );

				it( "should resolve relative URIs", ():void => {
					const spyService:jasmine.Spy = spyOn( SPARQL.SPARQLService, "executeSELECTQuery" ).and.returnValue( new Promise( () => {} ) );

					// noinspection JSIgnoredPromiseFromCall
					documents.executeSELECTQuery( "document/", "SELECT ?book ?title WHERE { <https://example.com/some-document/> ?book ?title }" );

					expect( spyService ).toHaveBeenCalledWith( "https://example.com/document/", "SELECT ?book ?title WHERE { <https://example.com/some-document/> ?book ?title }", documents, jasmine.any( Object ) );
				} );

				it( "should reject promise if URI is not in the context base", ( done:DoneFn ):void => {
					const promise:Promise<any> = documents.executeSELECTQuery( "http://not-example.com", "query" );
					promise.then( () => {
						done.fail( "Should not resolve promise." );
					} ).catch( error => {
						expect( error.message ).toBe( `"http://not-example.com" isn't a valid URI for this Carbon instance.` );
						done();
					} );
				} );

				it( "should reject promise if prefixed URI cannot be resolved", ( done:DoneFn ):void => {
					const promise:Promise<any> = documents.executeSELECTQuery( "prefix:the-uri", "query" );
					promise.then( () => {
						done.fail( "Should not resolve promise." );
					} ).catch( error => {
						expect( error.message ).toBe( `The prefixed URI "prefix:the-uri" could not be resolved.` );
						done();
					} );
				} );

				it( "should call _parseErrorResponse when request error", ( done:DoneFn ):void => {
					jasmine.Ajax.stubRequest( "https://example.com/" ).andReturn( {
						status: 500,
						responseText: "",
					} );

					const error:Error = new Error( "Error message" );
					const spy:jasmine.Spy = spyOn( documents, "_parseErrorResponse" ).and.callFake( () => Promise.reject( error ) );

					documents.executeSELECTQuery( "https://example.com/", "" ).then( () => {
						done.fail( "Should not resolve" );
					} ).catch( _error => {
						expect( spy ).toHaveBeenCalled();

						expect( _error ).toBeDefined();
						expect( _error ).toBe( error );

						done();
					} );
				} );

			} );

			describe( "When Documents does not have a context", ():void => {
				let documents:Documents;

				beforeEach( () => {
					documents = new Documents();
				} );

				it( "should use SPARQL service", ():void => {
					const spyService:jasmine.Spy = spyOn( SPARQL.SPARQLService, "executeSELECTQuery" ).and.returnValue( new Promise( () => {} ) );

					// noinspection JSIgnoredPromiseFromCall
					documents.executeSELECTQuery( "https://example.com/document/", "SELECT ?book ?title WHERE { <https://example.com/some-document/> ?book ?title }" );

					expect( spyService ).toHaveBeenCalledWith( "https://example.com/document/", "SELECT ?book ?title WHERE { <https://example.com/some-document/> ?book ?title }", documents, jasmine.any( Object ) );
				} );

				it( "should reject if URI is relative", ( done:DoneFn ):void => {
					const promise:Promise<any> = documents.executeSELECTQuery( "relative-uri/", "query" );
					promise.then( () => {
						done.fail( "Should not resolve promise." );
					} ).catch( error => {
						expect( error.message ).toBe( "This Documents instance doesn't support relative URIs." );
						done();
					} );
				} );

				it( "should reject if URI is prefixed", ( done:DoneFn ):void => {
					const promise:Promise<any> = documents.executeSELECTQuery( "prefix:the-uri", "query" );
					promise.then( () => {
						done.fail( "Should not resolve promise." );
					} ).catch( error => {
						expect( error.message ).toBe( "This Documents instance doesn't support prefixed URIs." );
						done();
					} );
				} );

				it( "should call _parseErrorResponse when request error", ( done:DoneFn ):void => {
					jasmine.Ajax.stubRequest( "https://example.com/" ).andReturn( {
						status: 500,
						responseText: "",
					} );

					const error:Error = new Error( "Error message" );
					const spy:jasmine.Spy = spyOn( documents, "_parseErrorResponse" ).and.callFake( () => Promise.reject( error ) );

					documents.executeSELECTQuery( "https://example.com/", "" ).then( () => {
						done.fail( "Should not resolve" );
					} ).catch( _error => {
						expect( spy ).toHaveBeenCalled();

						expect( _error ).toBeDefined();
						expect( _error ).toBe( error );

						done();
					} );
				} );

			} );

		} );

		describe( method(
			INSTANCE,
			"executeRawCONSTRUCTQuery"
		), ():void => {

			it( hasSignature(
				"Executes a CONSTRUCT query on a document and returns a string with the resulting model.", [
					{ name: "documentURI", type: "string", description: "URI of the document that works as a SPARQL endpoint where to execute the SPARQL query." },
					{ name: "constructQuery", type: "string", description: "CONSTRUCT query to execute in the selected endpoint." },
					{ name: "requestOptions", type: "CarbonLDP.HTTP.RequestOptions", optional: true, description: "Customizable options for the request." },
				], { type: "Promise<string>" }
			), ():void => {} );

			it( "should exists", ():void => {
				const documents:Documents = new Documents();
				expect( documents.executeRawCONSTRUCTQuery ).toBeDefined();
				expect( documents.executeRawCONSTRUCTQuery ).toEqual( jasmine.any( Function ) );
			} );

			describe( "When Documents has a specified context", ():void => {
				let documents:Documents;

				beforeEach( () => {
					const context:AbstractContext = new class extends AbstractContext {
						protected _baseURI:string;

						constructor() {
							super();
							this._baseURI = "https://example.com/";
						}
					}();
					documents = context.documents;
				} );

				it( "should use SPARQL service", ():void => {
					const spyService:jasmine.Spy = spyOn( SPARQL.SPARQLService, "executeRawCONSTRUCTQuery" ).and.returnValue( new Promise( () => {} ) );

					// noinspection JSIgnoredPromiseFromCall
					documents.executeRawCONSTRUCTQuery( "https://example.com/document/", "CONSTRUCT { ?subject ?predicate ?object } WHERE { ?subject ?predicate ?object }" );

					expect( spyService ).toHaveBeenCalledWith( "https://example.com/document/", "CONSTRUCT { ?subject ?predicate ?object } WHERE { ?subject ?predicate ?object }", jasmine.any( Object ) );
				} );

				it( "should resolve relative URIs", ():void => {
					const spyService:jasmine.Spy = spyOn( SPARQL.SPARQLService, "executeRawCONSTRUCTQuery" ).and.returnValue( new Promise( () => {} ) );

					// noinspection JSIgnoredPromiseFromCall
					documents.executeRawCONSTRUCTQuery( "document/", "CONSTRUCT { ?subject ?predicate ?object } WHERE { ?subject ?predicate ?object }" );

					expect( spyService ).toHaveBeenCalledWith( "https://example.com/document/", "CONSTRUCT { ?subject ?predicate ?object } WHERE { ?subject ?predicate ?object }", jasmine.any( Object ) );
				} );

				it( "should reject promise if URI is not in the context base", ( done:DoneFn ):void => {
					const promise:Promise<any> = documents.executeRawCONSTRUCTQuery( "http://not-example.com", "query" );
					promise.then( () => {
						done.fail( "Should not resolve promise." );
					} ).catch( error => {
						expect( error.message ).toBe( `"http://not-example.com" isn't a valid URI for this Carbon instance.` );
						done();
					} );
				} );

				it( "should reject promise if prefixed URI cannot be resolved", ( done:DoneFn ):void => {
					const promise:Promise<any> = documents.executeRawCONSTRUCTQuery( "prefix:the-uri", "query" );
					promise.then( () => {
						done.fail( "Should not resolve promise." );
					} ).catch( error => {
						expect( error.message ).toBe( `The prefixed URI "prefix:the-uri" could not be resolved.` );
						done();
					} );
				} );

				it( "should call _parseErrorResponse when request error", ( done:DoneFn ):void => {
					jasmine.Ajax.stubRequest( "https://example.com/" ).andReturn( {
						status: 500,
						responseText: "",
					} );

					const error:Error = new Error( "Error message" );
					const spy:jasmine.Spy = spyOn( documents, "_parseErrorResponse" ).and.callFake( () => Promise.reject( error ) );

					documents.executeRawCONSTRUCTQuery( "https://example.com/", "" ).then( () => {
						done.fail( "Should not resolve" );
					} ).catch( _error => {
						expect( spy ).toHaveBeenCalled();

						expect( _error ).toBeDefined();
						expect( _error ).toBe( error );

						done();
					} );
				} );

			} );

			describe( "When Documents does not have a context", ():void => {
				let documents:Documents;

				beforeEach( () => {
					documents = new Documents();
				} );

				it( "should use SPARQL service", ():void => {
					const spyService:jasmine.Spy = spyOn( SPARQL.SPARQLService, "executeRawCONSTRUCTQuery" ).and.returnValue( new Promise( () => {} ) );

					// noinspection JSIgnoredPromiseFromCall
					documents.executeRawCONSTRUCTQuery( "https://example.com/document/", "CONSTRUCT { ?subject ?predicate ?object } WHERE { ?subject ?predicate ?object }" );

					expect( spyService ).toHaveBeenCalledWith( "https://example.com/document/", "CONSTRUCT { ?subject ?predicate ?object } WHERE { ?subject ?predicate ?object }", jasmine.any( Object ) );
				} );

				it( "should reject if URI is relative", ( done:DoneFn ):void => {
					const promise:Promise<any> = documents.executeRawCONSTRUCTQuery( "relative-uri/", "query" );
					promise.then( () => {
						done.fail( "Should not resolve promise." );
					} ).catch( error => {
						expect( error.message ).toBe( "This Documents instance doesn't support relative URIs." );
						done();
					} );
				} );

				it( "should reject if URI is prefixed", ( done:DoneFn ):void => {
					const promise:Promise<any> = documents.executeRawCONSTRUCTQuery( "prefix:the-uri", "query" );
					promise.then( () => {
						done.fail( "Should not resolve promise." );
					} ).catch( error => {
						expect( error.message ).toBe( "This Documents instance doesn't support prefixed URIs." );
						done();
					} );
				} );

				it( "should call _parseErrorResponse when request error", ( done:DoneFn ):void => {
					jasmine.Ajax.stubRequest( "https://example.com/" ).andReturn( {
						status: 500,
						responseText: "",
					} );

					const error:Error = new Error( "Error message" );
					const spy:jasmine.Spy = spyOn( documents, "_parseErrorResponse" ).and.callFake( () => Promise.reject( error ) );

					documents.executeRawCONSTRUCTQuery( "https://example.com/", "" ).then( () => {
						done.fail( "Should not resolve" );
					} ).catch( _error => {
						expect( spy ).toHaveBeenCalled();

						expect( _error ).toBeDefined();
						expect( _error ).toBe( error );

						done();
					} );
				} );

			} );

		} );

		describe( method(
			INSTANCE,
			"executeRawDESCRIBEQuery"
		), ():void => {

			it( hasSignature(
				"Executes a DESCRIBE query and returns a string with the resulting model.", [
					{ name: "documentURI", type: "string", description: "URI of the document that works as a SPARQL endpoint where to execute the SPARQL query." },
					{ name: "describeQuery", type: "string", description: "DESCRIBE query to execute in the selected endpoint." },
					{ name: "requestOptions", type: "CarbonLDP.HTTP.RequestOptions", optional: true, description: "Customizable options for the request." },
				], { type: "Promise<string>" }
			), ():void => {} );

			it( "should exists", ():void => {
				const documents:Documents = new Documents();
				expect( documents.executeRawDESCRIBEQuery ).toBeDefined();
				expect( documents.executeRawDESCRIBEQuery ).toEqual( jasmine.any( Function ) );
			} );

			describe( "When Documents has a specified context", ():void => {
				let documents:Documents;

				beforeEach( () => {
					const context:AbstractContext = new class extends AbstractContext {
						protected _baseURI:string;

						constructor() {
							super();
							this._baseURI = "https://example.com/";
						}
					}();
					documents = context.documents;
				} );

				it( "should use SPARQL service", ():void => {
					const spyService:jasmine.Spy = spyOn( SPARQL.SPARQLService, "executeRawDESCRIBEQuery" ).and.returnValue( new Promise( () => {} ) );

					// noinspection JSIgnoredPromiseFromCall
					documents.executeRawDESCRIBEQuery( "https://example.com/document/", "DESCRIBE { ?subject ?predicate ?object } WHERE { ?subject ?predicate ?object }" );

					expect( spyService ).toHaveBeenCalledWith( "https://example.com/document/", "DESCRIBE { ?subject ?predicate ?object } WHERE { ?subject ?predicate ?object }", jasmine.any( Object ) );
				} );

				it( "should resolve relative URIs", ():void => {
					const spyService:jasmine.Spy = spyOn( SPARQL.SPARQLService, "executeRawDESCRIBEQuery" ).and.returnValue( new Promise( () => {} ) );

					// noinspection JSIgnoredPromiseFromCall
					documents.executeRawDESCRIBEQuery( "document/", "DESCRIBE { ?subject ?predicate ?object } WHERE { ?subject ?predicate ?object }" );

					expect( spyService ).toHaveBeenCalledWith( "https://example.com/document/", "DESCRIBE { ?subject ?predicate ?object } WHERE { ?subject ?predicate ?object }", jasmine.any( Object ) );
				} );

				it( "should reject promise if URI is not in the context base", ( done:DoneFn ):void => {
					const promise:Promise<any> = documents.executeRawDESCRIBEQuery( "http://not-example.com", "query" );
					promise.then( () => {
						done.fail( "Should not resolve promise." );
					} ).catch( error => {
						expect( error.message ).toBe( `"http://not-example.com" isn't a valid URI for this Carbon instance.` );
						done();
					} );
				} );

				it( "should reject promise if prefixed URI cannot be resolved", ( done:DoneFn ):void => {
					const promise:Promise<any> = documents.executeRawDESCRIBEQuery( "prefix:the-uri", "query" );
					promise.then( () => {
						done.fail( "Should not resolve promise." );
					} ).catch( error => {
						expect( error.message ).toBe( `The prefixed URI "prefix:the-uri" could not be resolved.` );
						done();
					} );
				} );

				it( "should call _parseErrorResponse when request error", ( done:DoneFn ):void => {
					jasmine.Ajax.stubRequest( "https://example.com/" ).andReturn( {
						status: 500,
						responseText: "",
					} );

					const error:Error = new Error( "Error message" );
					const spy:jasmine.Spy = spyOn( documents, "_parseErrorResponse" ).and.callFake( () => Promise.reject( error ) );

					documents.executeRawDESCRIBEQuery( "https://example.com/", "" ).then( () => {
						done.fail( "Should not resolve" );
					} ).catch( _error => {
						expect( spy ).toHaveBeenCalled();

						expect( _error ).toBeDefined();
						expect( _error ).toBe( error );

						done();
					} );
				} );

			} );

			describe( "When Documents does not have a context", ():void => {
				let documents:Documents;

				beforeEach( () => {
					documents = new Documents();
				} );

				it( "should use SPARQL service", ():void => {
					const spyService:jasmine.Spy = spyOn( SPARQL.SPARQLService, "executeRawDESCRIBEQuery" ).and.returnValue( new Promise( () => {} ) );

					// noinspection JSIgnoredPromiseFromCall
					documents.executeRawDESCRIBEQuery( "https://example.com/document/", "DESCRIBE { ?subject ?predicate ?object } WHERE { ?subject ?predicate ?object }" );

					expect( spyService ).toHaveBeenCalledWith( "https://example.com/document/", "DESCRIBE { ?subject ?predicate ?object } WHERE { ?subject ?predicate ?object }", jasmine.any( Object ) );
				} );

				it( "should reject if URI is relative", ( done:DoneFn ):void => {
					const promise:Promise<any> = documents.executeRawDESCRIBEQuery( "relative-uri/", "query" );
					promise.then( () => {
						done.fail( "Should not resolve promise." );
					} ).catch( error => {
						expect( error.message ).toBe( "This Documents instance doesn't support relative URIs." );
						done();
					} );
				} );

				it( "should reject if URI is prefixed", ( done:DoneFn ):void => {
					const promise:Promise<any> = documents.executeRawDESCRIBEQuery( "prefix:the-uri", "query" );
					promise.then( () => {
						done.fail( "Should not resolve promise." );
					} ).catch( error => {
						expect( error.message ).toBe( "This Documents instance doesn't support prefixed URIs." );
						done();
					} );
				} );

				it( "should call _parseErrorResponse when request error", ( done:DoneFn ):void => {
					jasmine.Ajax.stubRequest( "https://example.com/" ).andReturn( {
						status: 500,
						responseText: "",
					} );

					const error:Error = new Error( "Error message" );
					const spy:jasmine.Spy = spyOn( documents, "_parseErrorResponse" ).and.callFake( () => Promise.reject( error ) );

					documents.executeRawDESCRIBEQuery( "https://example.com/", "" ).then( () => {
						done.fail( "Should not resolve" );
					} ).catch( _error => {
						expect( spy ).toHaveBeenCalled();

						expect( _error ).toBeDefined();
						expect( _error ).toBe( error );

						done();
					} );
				} );

			} );

		} );

		describe( method(
			INSTANCE,
			"executeUPDATE"
		), ():void => {

			it( hasSignature(
				"Executes a DESCRIBE query and returns a string with the resulting model.", [
					{ name: "documentURI", type: "string", description: "URI of the document that works as a SPARQL endpoint where to execute the SPARQL query." },
					{ name: "update", type: "string", description: "UPDATE query to execute in the selected endpoint." },
					{ name: "requestOptions", type: "CarbonLDP.HTTP.RequestOptions", optional: true, description: "Customizable options for the request." },
				], { type: "Promise<void>" }
			), ():void => {} );

			it( "should exists", ():void => {
				const documents:Documents = new Documents();
				expect( documents.executeUPDATE ).toBeDefined();
				expect( documents.executeUPDATE ).toEqual( jasmine.any( Function ) );
			} );

			describe( "When Documents has a specified context", ():void => {
				let documents:Documents;

				beforeEach( () => {
					const context:AbstractContext = new class extends AbstractContext {
						protected _baseURI:string;

						constructor() {
							super();
							this._baseURI = "https://example.com/";
						}
					}();
					documents = context.documents;
				} );

				it( "should use SPARQL service", ():void => {
					const spyService:jasmine.Spy = spyOn( SPARQL.SPARQLService, "executeUPDATE" ).and.returnValue( new Promise( () => {} ) );

					// noinspection JSIgnoredPromiseFromCall
					documents.executeUPDATE( "https://example.com/document/", `INSERT DATA { GRAPH <https://example.com/some-document/> { <https://example.com/some-document/> <https://example.com/ns#propertyString> "Property Value" } }` );

					expect( spyService ).toHaveBeenCalledWith( "https://example.com/document/", `INSERT DATA { GRAPH <https://example.com/some-document/> { <https://example.com/some-document/> <https://example.com/ns#propertyString> "Property Value" } }`, jasmine.any( Object ) );
				} );

				it( "should resolve relative URIs", ():void => {
					const spyService:jasmine.Spy = spyOn( SPARQL.SPARQLService, "executeUPDATE" ).and.returnValue( new Promise( () => {} ) );

					// noinspection JSIgnoredPromiseFromCall
					documents.executeUPDATE( "document/", `INSERT DATA { GRAPH <https://example.com/some-document/> { <https://example.com/some-document/> <https://example.com/ns#propertyString> "Property Value" } }` );

					expect( spyService ).toHaveBeenCalledWith( "https://example.com/document/", `INSERT DATA { GRAPH <https://example.com/some-document/> { <https://example.com/some-document/> <https://example.com/ns#propertyString> "Property Value" } }`, jasmine.any( Object ) );
				} );

				it( "should reject promise if URI is not in the context base", ( done:DoneFn ):void => {
					const promise:Promise<any> = documents.executeUPDATE( "http://not-example.com", "query" );
					promise.then( () => {
						done.fail( "Should not resolve promise." );
					} ).catch( error => {
						expect( error.message ).toBe( `"http://not-example.com" isn't a valid URI for this Carbon instance.` );
						done();
					} );
				} );

				it( "should reject promise if prefixed URI cannot be resolved", ( done:DoneFn ):void => {
					const promise:Promise<any> = documents.executeUPDATE( "prefix:the-uri", "query" );
					promise.then( () => {
						done.fail( "Should not resolve promise." );
					} ).catch( error => {
						expect( error.message ).toBe( `The prefixed URI "prefix:the-uri" could not be resolved.` );
						done();
					} );
				} );

				it( "should call _parseErrorResponse when request error", ( done:DoneFn ):void => {
					jasmine.Ajax.stubRequest( "https://example.com/" ).andReturn( {
						status: 500,
						responseText: "",
					} );

					const error:Error = new Error( "Error message" );
					const spy:jasmine.Spy = spyOn( documents, "_parseErrorResponse" ).and.callFake( () => Promise.reject( error ) );

					documents.executeUPDATE( "https://example.com/", "" ).then( () => {
						done.fail( "Should not resolve" );
					} ).catch( _error => {
						expect( spy ).toHaveBeenCalled();

						expect( _error ).toBeDefined();
						expect( _error ).toBe( error );

						done();
					} );
				} );

			} );

			describe( "When Documents does not have a context", ():void => {
				let documents:Documents;

				beforeEach( () => {
					documents = new Documents();
				} );

				it( "should use SPARQL service", ():void => {
					const spyService:jasmine.Spy = spyOn( SPARQL.SPARQLService, "executeUPDATE" ).and.returnValue( new Promise( () => {} ) );

					// noinspection JSIgnoredPromiseFromCall
					documents.executeUPDATE( "https://example.com/document/", `INSERT DATA { GRAPH <https://example.com/some-document/> { <https://example.com/some-document/> <https://example.com/ns#propertyString> "Property Value" } }` );

					expect( spyService ).toHaveBeenCalledWith( "https://example.com/document/", `INSERT DATA { GRAPH <https://example.com/some-document/> { <https://example.com/some-document/> <https://example.com/ns#propertyString> "Property Value" } }`, jasmine.any( Object ) );
				} );

				it( "should reject if URI is relative", ( done:DoneFn ):void => {
					const promise:Promise<any> = documents.executeUPDATE( "relative-uri/", "query" );
					promise.then( () => {
						done.fail( "Should not resolve promise." );
					} ).catch( error => {
						expect( error.message ).toBe( "This Documents instance doesn't support relative URIs." );
						done();
					} );
				} );

				it( "should reject if URI is prefixed", ( done:DoneFn ):void => {
					const promise:Promise<any> = documents.executeUPDATE( "prefix:the-uri", "query" );
					promise.then( () => {
						done.fail( "Should not resolve promise." );
					} ).catch( error => {
						expect( error.message ).toBe( "This Documents instance doesn't support prefixed URIs." );
						done();
					} );
				} );

				it( "should call _parseErrorResponse when request error", ( done:DoneFn ):void => {
					jasmine.Ajax.stubRequest( "https://example.com/" ).andReturn( {
						status: 500,
						responseText: "",
					} );

					const error:Error = new Error( "Error message" );
					const spy:jasmine.Spy = spyOn( documents, "_parseErrorResponse" ).and.callFake( () => Promise.reject( error ) );

					documents.executeUPDATE( "https://example.com/", "" ).then( () => {
						done.fail( "Should not resolve" );
					} ).catch( _error => {
						expect( spy ).toHaveBeenCalled();

						expect( _error ).toBeDefined();
						expect( _error ).toBe( error );

						done();
					} );
				} );

			} );

		} );

		it( hasMethod(
			INSTANCE,
			"sparql",
			"Method that creates an instance of SPARQLER for the provided document end-point.", [
				{ name: "documentURI", type: "string", description: "URI of the document where to execute the SPARQL query." },
			],
			{ type: "SPARQLER/Clauses/QueryClause<CarbonLDP.SPARQL.Builder.FinishSPARQLSelect>" }
		), ():void => {
			class MockedContext extends AbstractContext {
				protected _baseURI:string;

				constructor() {
					super();
					this._baseURI = "https://example.com/";
					this.settings = { paths: { system: ".system/" } };
				}
			}

			let context:MockedContext = new MockedContext();
			let documents:Documents = context.documents;

			// Property Integrity
			(() => {
				expect( "sparql" in documents ).toEqual( true );
				expect( Utils.isFunction( documents.sparql ) ).toEqual( true );
			})();

			// Returns a QueryClause
			(() => {
				let queryBuilder:QueryClause = documents.sparql( "https://example.com/resource/" );
				expect( "base" in queryBuilder ).toBe( true );
				expect( "vocab" in queryBuilder ).toBe( true );
				expect( "prefix" in queryBuilder ).toBe( true );
			})();

			// Returns a ExecuteSelect
			(() => {
				context.extendObjectSchema( {
					"xsd": "http://www.w3.org/2001/XMLSchema#",
					"ex": "https://example.com/",
				} );

				let queryBuilder:SPARQL.FinishSPARQLSelect = documents
					.sparql( "https://example.com/resource/" )
					.select( "a" )
					.where( _ =>
						_.var( "a" )
							.has( _.resource( "ex:property" ), _.literal( "value" ) )
					);

				expect( queryBuilder ).toEqual( jasmine.objectContaining( {
					toPrettyString: jasmine.any( Function ),
					toCompactString: jasmine.any( Function ),
					execute: jasmine.any( Function ),
					executeRaw: jasmine.any( Function ),
				} ) );

				expect( queryBuilder.toPrettyString() ).toBe( "" +
					"BASE <https://example.com/>\n" +
					"PREFIX xsd:<http://www.w3.org/2001/XMLSchema#>\n" +
					"PREFIX ex:<https://example.com/>\n" +
					"SELECT ?a\n" +
					"WHERE { ?a ex:property \"value\" }"
				);
			})();
		} );

		describe( method(
			INSTANCE,
			"on",
			"Subscribe to an event notification in any specified URI pattern."
		), ():void => {

			it( hasSignature(
				[
					{ name: "event", type: "CarbonLDP.Messaging.Event.CHILD_CREATED", description: "The event to subscribe for its notifications." },
					{ name: "uriPattern", type: "string", description: "URI and/or pattern of the resource(s) to subscribe for the event specified." },
					{ name: "onEvent", type: "( message:CarbonLDP.Messaging.ChildCreated ) => void", description: "Callback that receives the data message from the notification event." },
					{ name: "onError", type: "( error:Error ) => void", description: "Callback that receives the errors thrown by the subscription." },
				]
			), ():void => {} );

			it( hasSignature(
				[
					{ name: "event", type: "CarbonLDP.Messaging.Event.ACCESS_POINT_CREATED", description: "The event to subscribe for its notifications." },
					{ name: "uriPattern", type: "string", description: "URI and/or pattern of the resource(s) to subscribe for the event specified." },
					{ name: "onEvent", type: "( message:CarbonLDP.Messaging.AccessPointCreated ) => void", description: "Callback that receives the data message from the notification event." },
					{ name: "onError", type: "( error:Error ) => void", description: "Callback that receives the errors thrown by the subscription." },
				]
			), ():void => {} );

			it( hasSignature(
				[
					{ name: "event", type: "CarbonLDP.Messaging.Event.DOCUMENT_CREATED", description: "The event to subscribe for its notifications." },
					{ name: "uriPattern", type: "string", description: "URI and/or pattern of the resource(s) to subscribe for the event specified." },
					{ name: "onEvent", type: "( message:CarbonLDP.Messaging.DocumentCreated ) => void", description: "Callback that receives the data message from the notification event." },
					{ name: "onError", type: "( error:Error ) => void", description: "Callback that receives the errors thrown by the subscription." },
				]
			), ():void => {} );

			it( hasSignature(
				[
					{ name: "event", type: "CarbonLDP.Messaging.Event.DOCUMENT_MODIFIED", description: "The event to subscribe for its notifications." },
					{ name: "uriPattern", type: "string", description: "URI and/or pattern of the resource(s) to subscribe for the event specified." },
					{ name: "onEvent", type: "( message:CarbonLDP.Messaging.DocumentModified ) => void", description: "Callback that receives the data message from the notification event." },
					{ name: "onError", type: "( error:Error ) => void", description: "Callback that receives the errors thrown by the subscription." },
				]
			), ():void => {} );

			it( hasSignature(
				[
					{ name: "event", type: "CarbonLDP.Messaging.Event.DOCUMENT_DELETED", description: "The event to subscribe for its notifications." },
					{ name: "uriPattern", type: "string", description: "URI and/or pattern of the resource(s) to subscribe for the event specified." },
					{ name: "onEvent", type: "( message:CarbonLDP.Messaging.DocumentDeleted ) => void", description: "Callback that receives the data message from the notification event." },
					{ name: "onError", type: "( error:Error ) => void", description: "Callback that receives the errors thrown by the subscription." },
				]
			), ():void => {} );

			it( hasSignature(
				[
					{ name: "event", type: "CarbonLDP.Messaging.Event.MEMBER_ADDED", description: "The event to subscribe for its notifications." },
					{ name: "uriPattern", type: "string", description: "URI and/or pattern of the resource(s) to subscribe for the event specified." },
					{ name: "onEvent", type: "( message:CarbonLDP.Messaging.MemberAdded ) => void", description: "Callback that receives the data message from the notification event." },
					{ name: "onError", type: "( error:Error ) => void", description: "Callback that receives the errors thrown by the subscription." },
				]
			), ():void => {} );

			it( hasSignature(
				[
					{ name: "event", type: "CarbonLDP.Messaging.Event.MEMBER_REMOVED", description: "The event to subscribe for its notifications." },
					{ name: "uriPattern", type: "string", description: "URI and/or pattern of the resource(s) to subscribe for the event specified." },
					{ name: "onEvent", type: "( message:CarbonLDP.Messaging.MemberRemoved ) => void", description: "Callback that receives the data message from the notification event." },
					{ name: "onError", type: "( error:Error ) => void", description: "Callback that receives the errors thrown by the subscription." },
				]
			), ():void => {} );

			it( hasSignature(
				[
					{ name: "event", type: "CarbonLDP.Messaging.Event | string", description: "The event to subscribe for its notifications." },
					{ name: "uriPattern", type: "string", description: "URI and/or pattern of the resource(s) to subscribe for the event specified." },
					{ name: "onEvent", type: "( message:CarbonLDP.Messaging.EventMessage ) => void", description: "Callback that receives the data message from the notification event." },
					{ name: "onError", type: "( error:Error ) => void", description: "Callback that receives the errors thrown by the subscription." },
				]
			), ():void => {} );

			it( "should exists", ():void => {
				const documents:Documents = new Documents();
				expect( documents.on ).toBeDefined();
				expect( documents.on ).toEqual( jasmine.any( Function ) );
			} );

			it( "should return error when does not have context", ( done:DoneFn ):void => {
				const documents:Documents = new Documents();
				documents.on( "*.*", "resource/", () => {
					done.fail( "Should not enter here" );
				}, ( error:Error ) => {
					expect( error ).toEqual( jasmine.any( Errors.IllegalStateError ) );
					expect( error.message ).toBe( "This instance does not support messaging subscriptions." );
					done();
				} );
			} );

			it( "should throw error when does not have context and no valid onError is provided", ( done:DoneFn ):void => {
				const documents:Documents = new Documents();
				expect( () => documents.on( "*.*", "resource/", () => done.fail( "Should not enter here" ), null ) )
					.toThrowError( Errors.IllegalStateError, "This instance does not support messaging subscriptions." );
				done();
			} );

			it( "should return error when context is no a Carbon instance", ( done:DoneFn ):void => {
				const documents:Documents = new Documents( new class extends AbstractContext {
					_baseURI:string = "https://example.com";
				} );

				documents.on( "*.*", "resource/", () => {
					done.fail( "Should not enter here" );
				}, ( error:Error ) => {
					expect( error ).toEqual( jasmine.any( Errors.IllegalStateError ) );
					expect( error.message ).toBe( "This instance does not support messaging subscriptions." );
					done();
				} );
			} );

			it( "should return error when context is no a Carbon instance and no valid onError is provided", ( done:DoneFn ):void => {
				const documents:Documents = new Documents( new class extends AbstractContext {
					_baseURI:string = "https://example.com";
				} );

				expect( () => documents.on( "*.*", "resource/", () => done.fail( "Should not enter here" ), null ) )
					.toThrowError( Errors.IllegalStateError, "This instance does not support messaging subscriptions." );
				done();
			} );

			it( "should call the createDestination from the messaging utils", ( done:DoneFn ):void => {
				const carbon:CarbonLDP = new CarbonLDP( "https://example.com" );
				spyOn( carbon.messaging, "subscribe" );

				const createDestinationSpy:jasmine.Spy = spyOn( MessagingUtils, "createDestination" );

				const event:string = "*.*";
				const uriPattern:string = "resource/*";
				carbon.documents.on( event, uriPattern, () => {
					done.fail( "Should not enter here." );
				}, () => {
					done.fail( "Should not enter here." );
				} );

				expect( createDestinationSpy ).toHaveBeenCalledWith( event, uriPattern, carbon.baseURI );
				done();
			} );

			it( "should subscribe with the Messaging Service", ( done:DoneFn ):void => {
				const destinationString:string = "destination/*";
				spyOn( MessagingUtils, "createDestination" ).and.returnValue( destinationString );

				const carbon:CarbonLDP = new CarbonLDP( "https://example.com" );

				const subscribeSpy:jasmine.Spy = spyOn( carbon.messaging, "subscribe" );

				const onEvent:( data:any ) => void = () => {
					done.fail( "Should not enter here." );
				};
				const onError:( error:Error ) => void = () => {
					done.fail( "Should not enter here." );
				};
				carbon.documents.on( "*.*", "resource/*", onEvent, onError );

				expect( subscribeSpy ).toHaveBeenCalledWith( destinationString, onEvent, onError );
				done();
			} );

		} );

		describe( method(
			INSTANCE,
			"off",
			"Remove the subscription of the URI pattern event specified that have the exact onEvent callback provided."
		), ():void => {

			it( hasSignature(
				[
					{ name: "event", type: "CarbonLDP.Messaging.Event.CHILD_CREATED", description: "The event of the subscription to remove." },
					{ name: "uriPattern", type: "string", description: "URI and/or pattern of the resource(s) of the subscription to remove." },
					{ name: "onEvent", type: "( message:CarbonLDP.Messaging.ChildCreated ) => void", description: "The onEvent callback of the subscription to be removed.\nIt must be the same call back provided in the `on` methods." },
					{ name: "onError", type: "( error:Error ) => void", description: "Callback that receives the error thrown trying to remove the subscription." },
				]
			), ():void => {} );

			it( hasSignature(
				[
					{ name: "event", type: "CarbonLDP.Messaging.Event.ACCESS_POINT_CREATED", description: "The event of the subscription to remove." },
					{ name: "uriPattern", type: "string", description: "URI and/or pattern of the resource(s) of the subscription to remove." },
					{ name: "onEvent", type: "( message:CarbonLDP.Messaging.AccessPointCreated ) => void", description: "The onEvent callback of the subscription to be removed.\nIt must be the same call back provided in the `on` methods." },
					{ name: "onError", type: "( error:Error ) => void", description: "Callback that receives the error thrown trying to remove the subscription." },
				]
			), ():void => {} );

			it( hasSignature(
				[
					{ name: "event", type: "CarbonLDP.Messaging.Event.DOCUMENT_CREATED", description: "The event of the subscription to remove." },
					{ name: "uriPattern", type: "string", description: "URI and/or pattern of the resource(s) of the subscription to remove." },
					{ name: "onEvent", type: "( message:CarbonLDP.Messaging.DocumentCreated ) => void", description: "The onEvent callback of the subscription to be removed.\nIt must be the same call back provided in the `on` methods." },
					{ name: "onError", type: "( error:Error ) => void", description: "Callback that receives the error thrown trying to remove the subscription." },
				]
			), ():void => {} );

			it( hasSignature(
				[
					{ name: "event", type: "CarbonLDP.Messaging.Event.DOCUMENT_MODIFIED", description: "The event of the subscription to remove." },
					{ name: "uriPattern", type: "string", description: "URI and/or pattern of the resource(s) of the subscription to remove." },
					{ name: "onEvent", type: "( message:CarbonLDP.Messaging.DocumentModified ) => void", description: "The onEvent callback of the subscription to be removed.\nIt must be the same call back provided in the `on` methods." },
					{ name: "onError", type: "( error:Error ) => void", description: "Callback that receives the error thrown trying to remove the subscription." },
				]
			), ():void => {} );

			it( hasSignature(
				[
					{ name: "event", type: "CarbonLDP.Messaging.Event.DOCUMENT_DELETED", description: "The event of the subscription to remove." },
					{ name: "uriPattern", type: "string", description: "URI and/or pattern of the resource(s) of the subscription to remove." },
					{ name: "onEvent", type: "( message:CarbonLDP.Messaging.DocumentDeleted ) => void", description: "The onEvent callback of the subscription to be removed.\nIt must be the same call back provided in the `on` methods." },
					{ name: "onError", type: "( error:Error ) => void", description: "Callback that receives the error thrown trying to remove the subscription." },
				]
			), ():void => {} );

			it( hasSignature(
				[
					{ name: "event", type: "CarbonLDP.Messaging.Event.MEMBER_ADDED", description: "The event of the subscription to remove." },
					{ name: "uriPattern", type: "string", description: "URI and/or pattern of the resource(s) of the subscription to remove." },
					{ name: "onEvent", type: "( message:CarbonLDP.Messaging.MemberAdded ) => void", description: "The onEvent callback of the subscription to be removed.\nIt must be the same call back provided in the `on` methods." },
					{ name: "onError", type: "( error:Error ) => void", description: "Callback that receives the error thrown trying to remove the subscription." },
				]
			), ():void => {} );

			it( hasSignature(
				[
					{ name: "event", type: "CarbonLDP.Messaging.Event.MEMBER_REMOVED", description: "The event of the subscription to remove." },
					{ name: "uriPattern", type: "string", description: "URI and/or pattern of the resource(s) of the subscription to remove." },
					{ name: "onEvent", type: "( message:CarbonLDP.Messaging.MemberRemoved ) => void", description: "The onEvent callback of the subscription to be removed.\nIt must be the same call back provided in the `on` methods." },
					{ name: "onError", type: "( error:Error ) => void", description: "Callback that receives the error thrown trying to remove the subscription." },
				]
			), ():void => {} );

			it( hasSignature(
				[
					{ name: "event", type: "CarbonLDP.Messaging.Event | string", description: "The event of the subscription to remove." },
					{ name: "uriPattern", type: "string", description: "URI and/or pattern of the resource(s) of the subscription to remove." },
					{ name: "onEvent", type: "( message:CarbonLDP.Messaging.EventMessage ) => void", description: "The onEvent callback of the subscription to be removed.\nIt must be the same call back provided in the `on` methods." },
					{ name: "onError", type: "( error:Error ) => void", description: "Callback that receives the error thrown trying to remove the subscription." },
				]
			), ():void => {} );

			it( "should exists", ():void => {
				const documents:Documents = new Documents();
				expect( documents.off ).toBeDefined();
				expect( documents.off ).toEqual( jasmine.any( Function ) );
			} );

			it( "should return error when does not have context", ( done:DoneFn ):void => {
				const documents:Documents = new Documents();
				documents.off( "*.*", "resource/", () => {
					done.fail( "Should not enter here" );
				}, ( error:Error ) => {
					expect( error ).toEqual( jasmine.any( Errors.IllegalStateError ) );
					expect( error.message ).toBe( "This instance does not support messaging subscriptions." );
					done();
				} );
			} );

			it( "should throw error when does not have context and no valid onError is provided", ( done:DoneFn ):void => {
				const documents:Documents = new Documents();
				expect( () => documents.off( "*.*", "resource/", () => done.fail( "Should not enter here" ), null ) )
					.toThrowError( Errors.IllegalStateError, "This instance does not support messaging subscriptions." );
				done();
			} );

			it( "should return error when context is no a Carbon instance", ( done:DoneFn ):void => {
				const documents:Documents = new Documents( new class extends AbstractContext {
					_baseURI:string = "https://example.com";
				} );

				documents.off( "*.*", "resource/", () => {
					done.fail( "Should not enter here" );
				}, ( error:Error ) => {
					expect( error ).toEqual( jasmine.any( Errors.IllegalStateError ) );
					expect( error.message ).toBe( "This instance does not support messaging subscriptions." );
					done();
				} );
			} );

			it( "should return error when context is no a Carbon instance and no valid onError is provided", ( done:DoneFn ):void => {
				const documents:Documents = new Documents( new class extends AbstractContext {
					_baseURI:string = "https://example.com";
				} );

				expect( () => documents.off( "*.*", "resource/", () => done.fail( "Should not enter here" ), null ) )
					.toThrowError( Errors.IllegalStateError, "This instance does not support messaging subscriptions." );
				done();
			} );

			it( "should call the createDestination from the messaging utils", ( done:DoneFn ):void => {
				const carbon:CarbonLDP = new CarbonLDP( "https://example.com" );
				spyOn( carbon.messaging, "subscribe" );

				const createDestinationSpy:jasmine.Spy = spyOn( MessagingUtils, "createDestination" );

				const event:string = "*.*";
				const uriPattern:string = "resource/*";
				carbon.documents.off( event, uriPattern, () => {
					done.fail( "Should not enter here." );
				}, () => {
					done.fail( "Should not enter here." );
				} );

				expect( createDestinationSpy ).toHaveBeenCalledWith( event, uriPattern, carbon.baseURI );
				done();
			} );

			it( "should unsubscribe with the Messaging Service", ( done:DoneFn ):void => {
				const destinationString:string = "destination/*";
				spyOn( MessagingUtils, "createDestination" ).and.returnValue( destinationString );

				const carbon:CarbonLDP = new CarbonLDP( "https://example.com" );

				const unsubscribeSpy:jasmine.Spy = spyOn( carbon.messaging, "unsubscribe" );

				const onEvent:( data:any ) => void = () => {
					done.fail( "Should not enter here." );
				};
				const onError:( error:Error ) => void = () => {
					done.fail( "Should not enter here." );
				};
				carbon.documents.off( "*.*", "resource/*", onEvent, onError );

				expect( unsubscribeSpy ).toHaveBeenCalledWith( destinationString, onEvent );
				done();
			} );

		} );

		describe( method(
			INSTANCE,
			"one",
			"Subscribe to only one event notification in any specified URI pattern."
		), ():void => {

			it( hasSignature(
				[
					{ name: "event", type: "CarbonLDP.Messaging.Event.CHILD_CREATED", description: "The event to subscribe for the notification." },
					{ name: "uriPattern", type: "string", description: "URI and/or pattern of the resource(s) to subscribe for the event specified." },
					{ name: "onEvent", type: "( message:CarbonLDP.Messaging.ChildCreated ) => void", description: "Callback that receives the data message from the notification event." },
					{ name: "onError", type: "( error:Error ) => void", description: "Callback that receives the errors thrown by the subscription." },
				]
			), ():void => {} );

			it( hasSignature(
				[
					{ name: "event", type: "CarbonLDP.Messaging.Event.ACCESS_POINT_CREATED", description: "The event to subscribe for the notification." },
					{ name: "uriPattern", type: "string", description: "URI and/or pattern of the resource(s) to subscribe for the event specified." },
					{ name: "onEvent", type: "( message:CarbonLDP.Messaging.AccessPointCreated ) => void", description: "Callback that receives the data message from the notification event." },
					{ name: "onError", type: "( error:Error ) => void", description: "Callback that receives the errors thrown by the subscription." },
				]
			), ():void => {} );

			it( hasSignature(
				[
					{ name: "event", type: "CarbonLDP.Messaging.Event.DOCUMENT_CREATED", description: "The event to subscribe for the notification." },
					{ name: "uriPattern", type: "string", description: "URI and/or pattern of the resource(s) to subscribe for the event specified." },
					{ name: "onEvent", type: "( message:CarbonLDP.Messaging.DocumentCreated ) => void", description: "Callback that receives the data message from the notification event." },
					{ name: "onError", type: "( error:Error ) => void", description: "Callback that receives the errors thrown by the subscription." },
				]
			), ():void => {} );

			it( hasSignature(
				[
					{ name: "event", type: "CarbonLDP.Messaging.Event.DOCUMENT_MODIFIED", description: "The event to subscribe for the notification." },
					{ name: "uriPattern", type: "string", description: "URI and/or pattern of the resource(s) to subscribe for the event specified." },
					{ name: "onEvent", type: "( message:CarbonLDP.Messaging.DocumentModified ) => void", description: "Callback that receives the data message from the notification event." },
					{ name: "onError", type: "( error:Error ) => void", description: "Callback that receives the errors thrown by the subscription." },
				]
			), ():void => {} );

			it( hasSignature(
				[
					{ name: "event", type: "CarbonLDP.Messaging.Event.DOCUMENT_DELETED", description: "The event to subscribe for the notification." },
					{ name: "uriPattern", type: "string", description: "URI and/or pattern of the resource(s) to subscribe for the event specified." },
					{ name: "onEvent", type: "( message:CarbonLDP.Messaging.DocumentDeleted ) => void", description: "Callback that receives the data message from the notification event." },
					{ name: "onError", type: "( error:Error ) => void", description: "Callback that receives the errors thrown by the subscription." },
				]
			), ():void => {} );

			it( hasSignature(
				[
					{ name: "event", type: "CarbonLDP.Messaging.Event.MEMBER_ADDED", description: "The event to subscribe for the notification." },
					{ name: "uriPattern", type: "string", description: "URI and/or pattern of the resource(s) to subscribe for the event specified." },
					{ name: "onEvent", type: "( message:CarbonLDP.Messaging.MemberAdded ) => void", description: "Callback that receives the data message from the notification event." },
					{ name: "onError", type: "( error:Error ) => void", description: "Callback that receives the errors thrown by the subscription." },
				]
			), ():void => {} );

			it( hasSignature(
				[
					{ name: "event", type: "CarbonLDP.Messaging.Event.MEMBER_REMOVED", description: "The event to subscribe for the notification." },
					{ name: "uriPattern", type: "string", description: "URI and/or pattern of the resource(s) to subscribe for the event specified." },
					{ name: "onEvent", type: "( message:CarbonLDP.Messaging.MemberRemoved ) => void", description: "Callback that receives the data message from the notification event." },
					{ name: "onError", type: "( error:Error ) => void", description: "Callback that receives the errors thrown by the subscription." },
				]
			), ():void => {} );

			it( hasSignature(
				[
					{ name: "event", type: "CarbonLDP.Messaging.Event | string", description: "The event to subscribe for the notification." },
					{ name: "uriPattern", type: "string", description: "URI and/or pattern of the resource(s) to subscribe for the event specified." },
					{ name: "onEvent", type: "( message:CarbonLDP.Messaging.EventMessage ) => void", description: "Callback that receives the data message from the notification event." },
					{ name: "onError", type: "( error:Error ) => void", description: "Callback that receives the errors thrown by the subscription." },
				]
			), ():void => {} );

			it( "should exists", ():void => {
				const documents:Documents = new Documents();
				expect( documents.one ).toBeDefined();
				expect( documents.one ).toEqual( jasmine.any( Function ) );
			} );

			it( "should call the `on` method", ( done:DoneFn ):void => {
				const carbon:CarbonLDP = new CarbonLDP( "https://example.com" );

				const onSpy:jasmine.Spy = spyOn( carbon.documents, "on" );

				const onEvent:( data:any ) => void = () => {
					done.fail( "Should not enter here." );
				};
				const onError:( error:Error ) => void = () => {
					done.fail( "Should not enter here." );
				};

				const event:string = "*.*";
				const uriPattern:string = "resource/*";
				carbon.documents.one( event, uriPattern, onEvent, onError );

				expect( onSpy ).toHaveBeenCalledWith( event, uriPattern, jasmine.any( Function ), onError );
				done();
			} );

			it( "should call the `off` method when the notification has been resolved", ( done:DoneFn ):void => {
				const carbon:CarbonLDP = new CarbonLDP( "https://example.com" );

				const offSpy:jasmine.Spy = spyOn( carbon.documents, "off" );
				const onSpy:jasmine.Spy = spyOn( carbon.documents, "on" )
					.and.callFake( ( _event:string, _uriPattern:string, _onEvent:( data:any ) => void ):void => _onEvent( "I'm calling you!" ) );

				const onEvent:( data:any ) => void = ( data:any ) => {
					expect( data ).toBe( "I'm calling you!" );
					done();
				};

				const onError:( error:Error ) => void = () => {
					done.fail( "Should not enter here." );
				};

				const event:string = "*.*";
				const uriPattern:string = "resource/*";
				carbon.documents.one( event, uriPattern, onEvent, onError );

				expect( onSpy ).toHaveBeenCalled();
				expect( offSpy ).toHaveBeenCalledWith( event, uriPattern, jasmine.any( Function ), onError );
			} );

			it( "should subscribe and unsubscribe with the same destination and function", ( done:DoneFn ):void => {
				const carbon:CarbonLDP = new CarbonLDP( "https://example.com" );

				const subscribeSpy:jasmine.Spy = spyOn( carbon.messaging, "subscribe" )
					.and.callFake( ( destination:string, onEvent:() => void ) => onEvent() );
				const unsubscribeSpy:jasmine.Spy = spyOn( carbon.messaging, "unsubscribe" );

				carbon.documents.one( "*.*", "resource/*", () => void 0, done.fail );

				expect( subscribeSpy ).toHaveBeenCalled();
				expect( unsubscribeSpy ).toHaveBeenCalled();

				expect( subscribeSpy.calls.first().args )
					.toEqual( jasmine.arrayContaining( unsubscribeSpy.calls.first().args ) );
				done();
			} );

		} );

		describe( method(
			INSTANCE,
			"onDocumentCreated"
		), ():void => {

			it( hasSignature(
				"Subscribe to the `CarbonLDP.Messaging.Event.DOCUMENT_CREATED` event notifications for the specified URI pattern.",
				[
					{ name: "uriPattern", type: "string", description: "URI and/or pattern of the resource(s) to subscribe for." },
					{ name: "onEvent", type: "( message:CarbonLDP.Messaging.DocumentCreated ) => void", description: "Callback that receives the data message from the notifications event." },
					{ name: "onError", type: "( error:Error ) => void", description: "Callback that receives the errors thrown by the subscription." },
				]
			), ():void => {} );

			it( "should exists", ():void => {
				const documents:Documents = new Documents();
				expect( documents.onDocumentCreated ).toBeDefined();
				expect( documents.onDocumentCreated ).toEqual( jasmine.any( Function ) );
			} );

			it( "should call the `on` method", ( done:DoneFn ):void => {
				const carbon:CarbonLDP = new CarbonLDP( "https://example.com" );

				const onSpy:jasmine.Spy = spyOn( carbon.documents, "on" );

				const onEvent:( data:any ) => void = () => {
					done.fail( "Should not enter here." );
				};
				const onError:( error:Error ) => void = () => {
					done.fail( "Should not enter here." );
				};

				const uriPattern:string = "resource/*";
				carbon.documents.onDocumentCreated( uriPattern, onEvent, onError );

				expect( onSpy ).toHaveBeenCalledWith( Event.DOCUMENT_CREATED, uriPattern, onEvent, onError );
				done();
			} );

		} );

		describe( method(
			INSTANCE,
			"onChildCreated"
		), ():void => {

			it( hasSignature(
				"Subscribe to the `CarbonLDP.Messaging.Event.CHILD_CREATED` event notifications for the specified URI pattern.",
				[
					{ name: "uriPattern", type: "string", description: "URI and/or pattern of the resource(s) to subscribe for." },
					{ name: "onEvent", type: "( message:CarbonLDP.Messaging.ChildCreated ) => void", description: "Callback that receives the data message from the notifications event." },
					{ name: "onError", type: "( error:Error ) => void", description: "Callback that receives the errors thrown by the subscription." },
				]
			), ():void => {} );

			it( "should exists", ():void => {
				const documents:Documents = new Documents();
				expect( documents.onChildCreated ).toBeDefined();
				expect( documents.onChildCreated ).toEqual( jasmine.any( Function ) );
			} );

			it( "should call the `on` method", ( done:DoneFn ):void => {
				const carbon:CarbonLDP = new CarbonLDP( "https://example.com" );

				const onSpy:jasmine.Spy = spyOn( carbon.documents, "on" );

				const onEvent:( data:any ) => void = () => {
					done.fail( "Should not enter here." );
				};
				const onError:( error:Error ) => void = () => {
					done.fail( "Should not enter here." );
				};

				const uriPattern:string = "resource/*";
				carbon.documents.onChildCreated( uriPattern, onEvent, onError );

				expect( onSpy ).toHaveBeenCalledWith( Event.CHILD_CREATED, uriPattern, onEvent, onError );
				done();
			} );

		} );

		describe( method(
			INSTANCE,
			"onAccessPointCreated"
		), ():void => {

			it( hasSignature(
				"Subscribe to the `CarbonLDP.Messaging.Event.ACCESS_POINT_CREATED` event notifications for the specified URI pattern.",
				[
					{ name: "uriPattern", type: "string", description: "URI and/or pattern of the resource(s) to subscribe for." },
					{ name: "onEvent", type: "( message:CarbonLDP.Messaging.AccessPointCreated ) => void", description: "Callback that receives the data message from the notifications event." },
					{ name: "onError", type: "( error:Error ) => void", description: "Callback that receives the errors thrown by the subscription." },
				]
			), ():void => {} );

			it( "should exists", ():void => {
				const documents:Documents = new Documents();
				expect( documents.onAccessPointCreated ).toBeDefined();
				expect( documents.onAccessPointCreated ).toEqual( jasmine.any( Function ) );
			} );

			it( "should call the `on` method", ( done:DoneFn ):void => {
				const carbon:CarbonLDP = new CarbonLDP( "https://example.com" );

				const onSpy:jasmine.Spy = spyOn( carbon.documents, "on" );

				const onEvent:( data:any ) => void = () => {
					done.fail( "Should not enter here." );
				};
				const onError:( error:Error ) => void = () => {
					done.fail( "Should not enter here." );
				};

				const uriPattern:string = "resource/*";
				carbon.documents.onAccessPointCreated( uriPattern, onEvent, onError );

				expect( onSpy ).toHaveBeenCalledWith( Event.ACCESS_POINT_CREATED, uriPattern, onEvent, onError );
				done();
			} );

		} );

		describe( method(
			INSTANCE,
			"onDocumentModified"
		), ():void => {

			it( hasSignature(
				"Subscribe to the `CarbonLDP.Messaging.Event.DOCUMENT_MODIFIED` event notifications for the specified URI pattern.",
				[
					{ name: "uriPattern", type: "string", description: "URI and/or pattern of the resource(s) to subscribe for." },
					{ name: "onEvent", type: "( message:CarbonLDP.Messaging.DocumentModified ) => void", description: "Callback that receives the data message from the notifications event." },
					{ name: "onError", type: "( error:Error ) => void", description: "Callback that receives the errors thrown by the subscription." },
				]
			), ():void => {} );

			it( "should exists", ():void => {
				const documents:Documents = new Documents();
				expect( documents.onDocumentModified ).toBeDefined();
				expect( documents.onDocumentModified ).toEqual( jasmine.any( Function ) );
			} );

			it( "should call the `on` method", ( done:DoneFn ):void => {
				const carbon:CarbonLDP = new CarbonLDP( "https://example.com" );

				const onSpy:jasmine.Spy = spyOn( carbon.documents, "on" );

				const onEvent:( data:any ) => void = () => {
					done.fail( "Should not enter here." );
				};
				const onError:( error:Error ) => void = () => {
					done.fail( "Should not enter here." );
				};

				const uriPattern:string = "resource/*";
				carbon.documents.onDocumentModified( uriPattern, onEvent, onError );

				expect( onSpy ).toHaveBeenCalledWith( Event.DOCUMENT_MODIFIED, uriPattern, onEvent, onError );
				done();
			} );

		} );

		describe( method(
			INSTANCE,
			"onDocumentDeleted"
		), ():void => {

			it( hasSignature(
				"Subscribe to the `CarbonLDP.Messaging.Event.DOCUMENT_DELETED` event notifications for the specified URI pattern.",
				[
					{ name: "uriPattern", type: "string", description: "URI and/or pattern of the resource(s) to subscribe for." },
					{ name: "onEvent", type: "( message:CarbonLDP.Messaging.DocumentDeleted ) => void", description: "Callback that receives the data message from the notifications event." },
					{ name: "onError", type: "( error:Error ) => void", description: "Callback that receives the errors thrown by the subscription." },
				]
			), ():void => {} );

			it( "should exists", ():void => {
				const documents:Documents = new Documents();
				expect( documents.onDocumentDeleted ).toBeDefined();
				expect( documents.onDocumentDeleted ).toEqual( jasmine.any( Function ) );
			} );

			it( "should call the `on` method", ( done:DoneFn ):void => {
				const carbon:CarbonLDP = new CarbonLDP( "https://example.com" );

				const onSpy:jasmine.Spy = spyOn( carbon.documents, "on" );

				const onEvent:( data:any ) => void = () => {
					done.fail( "Should not enter here." );
				};
				const onError:( error:Error ) => void = () => {
					done.fail( "Should not enter here." );
				};

				const uriPattern:string = "resource/*";
				carbon.documents.onDocumentDeleted( uriPattern, onEvent, onError );

				expect( onSpy ).toHaveBeenCalledWith( Event.DOCUMENT_DELETED, uriPattern, onEvent, onError );
				done();
			} );

		} );

		describe( method(
			INSTANCE,
			"onMemberAdded"
		), ():void => {

			it( hasSignature(
				"Subscribe to the `CarbonLDP.Messaging.Event.MEMBER_ADDED` event notifications for the specified URI pattern.",
				[
					{ name: "uriPattern", type: "string", description: "URI and/or pattern of the resource(s) to subscribe for." },
					{ name: "onEvent", type: "( message:CarbonLDP.Messaging.MemberAdded ) => void", description: "Callback that receives the data message from the notifications event." },
					{ name: "onError", type: "( error:Error ) => void", description: "Callback that receives the errors thrown by the subscription." },
				]
			), ():void => {} );

			it( "should exists", ():void => {
				const documents:Documents = new Documents();
				expect( documents.onMemberAdded ).toBeDefined();
				expect( documents.onMemberAdded ).toEqual( jasmine.any( Function ) );
			} );

			it( "should call the `on` method", ( done:DoneFn ):void => {
				const carbon:CarbonLDP = new CarbonLDP( "https://example.com" );

				const onSpy:jasmine.Spy = spyOn( carbon.documents, "on" );

				const onEvent:( data:any ) => void = () => {
					done.fail( "Should not enter here." );
				};
				const onError:( error:Error ) => void = () => {
					done.fail( "Should not enter here." );
				};

				const uriPattern:string = "resource/*";
				carbon.documents.onMemberAdded( uriPattern, onEvent, onError );

				expect( onSpy ).toHaveBeenCalledWith( Event.MEMBER_ADDED, uriPattern, onEvent, onError );
				done();
			} );

		} );

		describe( method(
			INSTANCE,
			"onMemberRemoved"
		), ():void => {

			it( hasSignature(
				"Subscribe to the `CarbonLDP.Messaging.Event.MEMBER_REMOVED` event notifications for the specified URI pattern.",
				[
					{ name: "uriPattern", type: "string", description: "URI and/or pattern of the resource(s) to subscribe for." },
					{ name: "onEvent", type: "( message:CarbonLDP.Messaging.MemberRemoved ) => void", description: "Callback that receives the data message from the notifications event." },
					{ name: "onError", type: "( error:Error ) => void", description: "Callback that receives the errors thrown by the subscription." },
				]
			), ():void => {} );

			it( "should exists", ():void => {
				const documents:Documents = new Documents();
				expect( documents.onMemberRemoved ).toBeDefined();
				expect( documents.onMemberRemoved ).toEqual( jasmine.any( Function ) );
			} );

			it( "should call the `on` method", ( done:DoneFn ):void => {
				const carbon:CarbonLDP = new CarbonLDP( "https://example.com" );

				const onSpy:jasmine.Spy = spyOn( carbon.documents, "on" );

				const onEvent:( data:any ) => void = () => {
					done.fail( "Should not enter here." );
				};
				const onError:( error:Error ) => void = () => {
					done.fail( "Should not enter here." );
				};

				const uriPattern:string = "resource/*";
				carbon.documents.onMemberRemoved( uriPattern, onEvent, onError );

				expect( onSpy ).toHaveBeenCalledWith( Event.MEMBER_REMOVED, uriPattern, onEvent, onError );
				done();
			} );

		} );

	} );

	describe( "Decorated Pointer", ():void => {

		let pointer:Pointer;
		let documents:Documents;
		let context:AbstractContext;
		beforeEach( () => {
			context = new class extends AbstractContext {
				_baseURI:string = "https://example.com/";
				settings:ContextSettings = { vocabulary: "https://example.com/ns#" };
			};
			documents = context.documents;

			pointer = documents.getPointer( "pointer/" );
		} );

		it( "should add types to query", ( done:DoneFn ):void => {
			const resource:TransientResource = TransientResource.decorate( pointer );
			resource.addType( "https://example.com/ns#Type-1" );
			resource.addType( "https://example.com/ns#Type-2" );

			context.extendObjectSchema( "https://example.com/ns#Type-2", {
				"name": { "@id": "name" },
			} );

			const spy:jasmine.Spy = spyOn( documents, "executeRawCONSTRUCTQuery" )
				.and.returnValue( Promise.reject( null ) );

			resource
				.resolve( _ => _
					.withType( "Another" )
					.properties( {
						"name": { "@type": "string" },
					} )
				)
				.then( () => done.fail( "should not resolve" ) )
				.catch( error => {
					if( error ) done.fail( error );

					expect( spy ).toHaveBeenCalledWith(
						"https://example.com/pointer/",

						"CONSTRUCT {" +
						` ?metadata a <${ C.VolatileResource }>, <${ C.QueryMetadata }>;` +
						"" + ` <${ C.target }> ?document.` +

						" ?document a ?document__types;" +
						"" + " <https://example.com/ns#name> ?document__name " +

						"} WHERE {" +
						" BIND(BNODE() AS ?metadata)." +

						" VALUES ?document { <https://example.com/pointer/> }." +
						" OPTIONAL { ?document a ?document__types }." +
						" ?document a <https://example.com/ns#Type-1>, <https://example.com/ns#Type-2>, <https://example.com/ns#Another>." +

						" OPTIONAL {" +
						"" + " ?document <https://example.com/ns#name> ?document__name." +
						"" + " FILTER( datatype( ?document__name ) = <http://www.w3.org/2001/XMLSchema#string> )" +
						" } " +
						"}",

						jasmine.any( Object )
					);

					done();
				} );
		} );

	} );

} );
