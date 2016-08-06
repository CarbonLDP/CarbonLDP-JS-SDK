import {
	INSTANCE,
	STATIC,

	module,
	clazz,
	method,

	isDefined,
	hasMethod,
	hasSignature,
	hasProperty,
	decoratedObject,
} from "./test/JasmineExtender";
import AbstractContext from "./AbstractContext";
import * as Document from "./Document";
import Documents from "./Documents";
import * as Errors from "./Errors";
import * as Fragment from "./Fragment";
import * as HTTP from "./HTTP";
import * as NamedFragment from "./NamedFragment";
import * as PersistedFragment from "./PersistedFragment";
import * as PersistedNamedFragment from "./PersistedNamedFragment";
import * as Pointer from "./Pointer";
import * as RetrievalPreferences from "./RetrievalPreferences";
import * as URI from "./RDF/URI";
import * as Utils from "./Utils";

import * as PersistedDocument from "./PersistedDocument";

describe( module( "Carbon/PersistedDocument" ), ():void => {

	it( isDefined(), ():void => {
		expect( PersistedDocument ).toBeDefined();
		expect( Utils.isObject( PersistedDocument ) ).toEqual( true );
	} );

	describe( clazz(
		"Carbon.PersistedDocument.Factory",
		"Factory class for `Carbon.PersistedDocument.Class` objects."
	), ():void => {
		let context:AbstractContext;

		beforeEach( ():void => {
			class MockedContext extends AbstractContext {
				resolve( uri:string ):string {
					return URI.Util.isRelative( uri ) ? `http://example.com/${uri}` : uri;
				}
			}
			context = new MockedContext();
		} );

		it( isDefined(), ():void => {
			expect( PersistedDocument.Factory ).toBeDefined();
			expect( Utils.isFunction( PersistedDocument.Factory ) ).toBe( true );
		} );

		it( hasMethod(
			STATIC,
			"hasClassProperties",
			"Returns true if the Document provided has the properties and methods of a `Carbon.PersistedDocument.Class` object.", [
				{name: "document", type: "Carbon.Document.Class"},
			],
			{type: "boolean"}
		), ():void => {
			expect( PersistedDocument.Factory.hasClassProperties ).toBeDefined();
			expect( Utils.isFunction( PersistedDocument.Factory.hasClassProperties ) ).toBe( true );

			let document:any = undefined;
			expect( PersistedDocument.Factory.hasClassProperties( document ) ).toBe( false );

			document = {
				created: null,
				modified: null,
				defaultInteractionModel: null,
				accessPoints: null,

				_documents: null,
				_etag: null,

				refresh: ():void => {},
				save: ():void => {},
				saveAndRefresh: ():void => {},
				delete: ():void => {},

				getDownloadURL: ():void => {},

				addMember: ():void => {},
				addMembers: ():void => {},
				createAccessPoint: ():void => {},
				createChild: ():void => {},
				createChildAndRetrieve: ():void => {},
				listChildren: ():void => {},
				getChildren: ():void => {},
				listMembers: ():void => {},
				getMembers: ():void => {},
				removeMember: ():void => {},
				removeMembers: ():void => {},
				removeAllMembers: ():void => {},
				upload: ():void => {},

				executeRawASKQuery: ():void => {},
				executeASKQuery: ():void => {},
				executeRawSELECTQuery: ():void => {},
				executeSELECTQuery: ():void => {},
				executeRawDESCRIBEQuery: ():void => {},
				executeRawCONSTRUCTQuery: ():void => {},
				executeUPDATE: ():void => {},
			};
			expect( PersistedDocument.Factory.hasClassProperties( document ) ).toBe( true );

			delete document.accessPoints;
			expect( PersistedDocument.Factory.hasClassProperties( document ) ).toBe( true );
			document.accessPoints = null;

			delete document.created;
			expect( PersistedDocument.Factory.hasClassProperties( document ) ).toBe( true );
			document.created = null;

			delete document.modified;
			expect( PersistedDocument.Factory.hasClassProperties( document ) ).toBe( true );
			document.modified = null;

			delete document.defaultInteractionModel;
			expect( PersistedDocument.Factory.hasClassProperties( document ) ).toBe( true );
			document.defaultInteractionModel = null;

			delete document._documents;
			expect( PersistedDocument.Factory.hasClassProperties( document ) ).toBe( false );
			document._documents = null;

			delete document._etag;
			expect( PersistedDocument.Factory.hasClassProperties( document ) ).toBe( false );
			document._etag = null;

			delete document.refresh;
			expect( PersistedDocument.Factory.hasClassProperties( document ) ).toBe( false );
			document.refresh = ():void => {};

			delete document.save;
			expect( PersistedDocument.Factory.hasClassProperties( document ) ).toBe( false );
			document.save = ():void => {};

			delete document.saveAndRefresh;
			expect( PersistedDocument.Factory.hasClassProperties( document ) ).toBe( false );
			document.saveAndRefresh = ():void => {};

			delete document.delete;
			expect( PersistedDocument.Factory.hasClassProperties( document ) ).toBe( false );
			document.delete = ():void => {};

			delete document.getDownloadURL;
			expect( PersistedDocument.Factory.hasClassProperties( document ) ).toBe( false );
			document.getDownloadURL = ():void => {};

			delete document.addMember;
			expect( PersistedDocument.Factory.hasClassProperties( document ) ).toBe( false );
			document.addMember = ():void => {};

			delete document.addMembers;
			expect( PersistedDocument.Factory.hasClassProperties( document ) ).toBe( false );
			document.addMembers = ():void => {};

			delete document.createAccessPoint;
			expect( PersistedDocument.Factory.hasClassProperties( document ) ).toBe( false );
			document.createAccessPoint = ():void => {};

			delete document.createChild;
			expect( PersistedDocument.Factory.hasClassProperties( document ) ).toBe( false );
			document.createChild = ():void => {};

			delete document.createChildAndRetrieve;
			expect( PersistedDocument.Factory.hasClassProperties( document ) ).toBe( false );
			document.createChildAndRetrieve = ():void => {};

			delete document.listChildren;
			expect( PersistedDocument.Factory.hasClassProperties( document ) ).toBe( false );
			document.listChildren = ():void => {};

			delete document.getChildren;
			expect( PersistedDocument.Factory.hasClassProperties( document ) ).toBe( false );
			document.getChildren = ():void => {};

			delete document.listMembers;
			expect( PersistedDocument.Factory.hasClassProperties( document ) ).toBe( false );
			document.listMembers = ():void => {};

			delete document.getMembers;
			expect( PersistedDocument.Factory.hasClassProperties( document ) ).toBe( false );
			document.getMembers = ():void => {};

			delete document.removeMember;
			expect( PersistedDocument.Factory.hasClassProperties( document ) ).toBe( false );
			document.removeMember = ():void => {};

			delete document.removeMembers;
			expect( PersistedDocument.Factory.hasClassProperties( document ) ).toBe( false );
			document.removeMembers = ():void => {};

			delete document.removeAllMembers;
			expect( PersistedDocument.Factory.hasClassProperties( document ) ).toBe( false );
			document.removeAllMembers = ():void => {};

			delete document.upload;
			expect( PersistedDocument.Factory.hasClassProperties( document ) ).toBe( false );
			document.upload = ():void => {};

			delete document.executeRawASKQuery;
			expect( PersistedDocument.Factory.hasClassProperties( document ) ).toBe( false );
			document.executeRawASKQuery = ():void => {};

			delete document.executeASKQuery;
			expect( PersistedDocument.Factory.hasClassProperties( document ) ).toBe( false );
			document.executeASKQuery = ():void => {};

			delete document.executeRawSELECTQuery;
			expect( PersistedDocument.Factory.hasClassProperties( document ) ).toBe( false );
			document.executeRawSELECTQuery = ():void => {};

			delete document.executeSELECTQuery;
			expect( PersistedDocument.Factory.hasClassProperties( document ) ).toBe( false );
			document.executeSELECTQuery = ():void => {};

			delete document.executeRawDESCRIBEQuery;
			expect( PersistedDocument.Factory.hasClassProperties( document ) ).toBe( false );
			document.executeRawDESCRIBEQuery = ():void => {};

			delete document.executeRawCONSTRUCTQuery;
			expect( PersistedDocument.Factory.hasClassProperties( document ) ).toBe( false );
			document.executeRawCONSTRUCTQuery = ():void => {};

			delete document.executeUPDATE;
			expect( PersistedDocument.Factory.hasClassProperties( document ) ).toBe( false );
			document.executeUPDATE = ():void => {};
		} );

		it( hasMethod(
			STATIC,
			"is",
			"Returns true if the element provided is considered a `Carbon.PersistedDocument.Class` object.", [
				{name: "object", type: "Object"},
			],
			{type: "boolean"}
		), ():void => {
			expect( PersistedDocument.Factory.is ).toBeDefined();
			expect( Utils.isFunction( PersistedDocument.Factory.is ) ).toBe( true );

			expect( PersistedDocument.Factory.is( undefined ) ).toBe( false );
			expect( PersistedDocument.Factory.is( null ) ).toBe( false );
			expect( PersistedDocument.Factory.is( "a string" ) ).toBe( false );
			expect( PersistedDocument.Factory.is( 100 ) ).toBe( false );
			expect( PersistedDocument.Factory.is( {} ) ).toBe( false );

			let object:any = Document.Factory.createFrom( {
				created: null,
				modified: null,
				defaultInteractionModel: null,
				accessPoints: null,

				_documents: null,
				_etag: null,

				refresh: ():void => {},
				save: ():void => {},
				saveAndRefresh: ():void => {},
				delete: ():void => {},

				getDownloadURL: ():void => {},

				addMember: ():void => {},
				addMembers: ():void => {},
				createAccessPoint: ():void => {},
				createChild: ():void => {},
				createChildAndRetrieve: ():void => {},
				listChildren: ():void => {},
				getChildren: ():void => {},
				listMembers: ():void => {},
				getMembers: ():void => {},
				removeMember: ():void => {},
				removeMembers: ():void => {},
				removeAllMembers: ():void => {},
				upload: ():void => {},

				executeRawASKQuery: ():void => {},
				executeASKQuery: ():void => {},
				executeRawSELECTQuery: ():void => {},
				executeSELECTQuery: ():void => {},
				executeRawDESCRIBEQuery: ():void => {},
				executeRawCONSTRUCTQuery: ():void => {},
				executeUPDATE: ():void => {},
			} );
			expect( PersistedDocument.Factory.is( object ) ).toBe( true );
		} );

		it( hasMethod(
			STATIC,
			"create",
			"Creates an empty `Carbon.PersistedDocument.Class` object with the URI provided.", [
				{name: "uri", type: "string"},
				{name: "documents", type: "Carbon.Documents", description: "The Documents instance to which the PersistedDocument belongs."},
			],
			{type: "Carbon.PersistedDocument.Class"}
		), ():void => {
			expect( PersistedDocument.Factory.create ).toBeDefined();
			expect( Utils.isFunction( PersistedDocument.Factory.create ) ).toBe( true );

			let document:PersistedDocument.Class;
			document = PersistedDocument.Factory.create( "http://example.com/document/", context.documents );
			expect( PersistedDocument.Factory.is( document ) ).toBe( true );

			expect( document.id ).toBe( "http://example.com/document/" );
			expect( document._documents ).toBe( context.documents );
		} );

		it( hasMethod(
			STATIC,
			"createFrom",
			[ "T extends Object" ],
			"Creates a PersistedDocument object from the object and URI provided.", [
				{name: "object", type: "T"},
				{name: "uri", type: "string"},
				{name: "documents", type: "Carbon.Documents", description: "The Documents instance to which the PersistedDocument belongs."},
			],
			{type: "T & Carbon.PersistedDocument.Class"}
		), ():void => {
			expect( PersistedDocument.Factory.createFrom ).toBeDefined();
			expect( Utils.isFunction( PersistedDocument.Factory.createFrom ) ).toBe( true );

			interface MyObject {
				myProperty?:string;
			}

			interface MyPersistedDocument extends MyObject, PersistedDocument.Class {}
			let persistedDocument:MyPersistedDocument;

			persistedDocument = PersistedDocument.Factory.createFrom<MyObject>( {}, "http://example.com/document/", context.documents );
			expect( PersistedDocument.Factory.is( persistedDocument ) ).toBe( true );
			expect( persistedDocument.id ).toBe( "http://example.com/document/" );

			persistedDocument = PersistedDocument.Factory.createFrom<MyObject>( {myProperty: "a property"}, "http://example.com/document/", context.documents );
			expect( PersistedDocument.Factory.is( persistedDocument ) ).toBe( true );
			expect( persistedDocument.id ).toBe( "http://example.com/document/" );
			expect( persistedDocument.myProperty ).toBe( "a property" );
		} );

		it( hasMethod(
			STATIC,
			"decorate",
			[ "T extends Object" ],
			"Decorates the object provided with the properties and methods of a `Carbon.PersistedDocument.Class` object.", [
				{name: "object", type: "T"},
				{name: "documents", type: "Carbon.Documents", description: "The Documents instance to which the PersistedDocument belongs."},
			],
			{type: "T & Carbon.PersistedDocument.Class"}
		), ():void => {
			expect( PersistedDocument.Factory.decorate ).toBeDefined();
			expect( Utils.isFunction( PersistedDocument.Factory.decorate ) ).toBe( true );

			interface MyObject {
				myProperty?:string;
			}

			interface MyDocument extends MyObject, Document.Class {}
			let document:MyDocument;

			interface MyPersistedDocument extends MyObject, PersistedDocument.Class {
			}
			let persistedDocument:MyPersistedDocument;

			document = Document.Factory.createFrom<MyObject>( {} );
			persistedDocument = PersistedDocument.Factory.decorate<MyDocument>( document, context.documents );
			expect( PersistedDocument.Factory.is( persistedDocument ) ).toBe( true );
			expect( persistedDocument.myProperty ).toBeUndefined();
			expect( persistedDocument._documents ).toBe( context.documents );

			document = Document.Factory.createFrom<MyObject>( {myProperty: "a property"} );
			persistedDocument = PersistedDocument.Factory.decorate<MyDocument>( document, context.documents );
			expect( PersistedDocument.Factory.is( persistedDocument ) ).toBe( true );
			expect( persistedDocument.myProperty ).toBeDefined();
			expect( persistedDocument.myProperty ).toBe( "a property" );
			expect( persistedDocument._documents ).toBe( context.documents );
		} );

		describe( decoratedObject(
			"Object decorated by the `Carbon.LDP.PersistedContainer.Factory.decorate()` function.", [
				"Carbon.LDP.PersistedContainer.Class",
			]
		), ():void => {
			let document:PersistedDocument.Class;

			beforeEach( ():void => {
				context.setSetting( "vocabulary", "vocab#" );
				context.extendObjectSchema( {
					"exTypes": "http://example.com/types#",
					"another": "http://example.com/another-url/ns#",
				} );

				context.documents.getPointer( "http://example.com/in/documents/" );

				document = PersistedDocument.Factory.create( "http://example.com/document/", context.documents );
				document.createNamedFragment( "fragment" );
				document.createFragment( "_:BlankNode" );
			} );

			it( hasProperty(
				INSTANCE,
				"_documents",
				"Carbon.Documents",
				"The Documents instance to which the PersistedContainer belongs."
			), ():void => {
				expect( document._documents ).toBeDefined();
				expect( Utils.isObject( document._documents ) ).toBe( true );
				expect( document._documents instanceof Documents ).toBe( true );
			} );

			it( hasProperty(
				INSTANCE,
				"_etag",
				"string",
				"The ETag (entity tag) of the PersistedDocument."
			), ():void => {
				expect( document._etag ).toBeDefined();
				// By default, the ETag is null.
				expect( document._etag ).toBeNull();
			} );

			it( hasMethod(
				INSTANCE,
				"addType",
				"Adds a type to the Document. Relative and prefixed types are resolved before the operation.", [
					{name: "type", type: "string", description: "The type to be added."},
				]
			), ():void => {
				expect( document.addType ).toBeDefined();
				expect( Utils.isFunction( document.addType ) ).toBe( true );

				expect( document.types.length ).toBe( 0 );

				document.addType( "http://example.com/types#Type-1" );
				expect( document.types.length ).toBe( 1 );
				expect( document.types ).toContain( "http://example.com/types#Type-1" );

				document.addType( "http://example.com/types#Type-2" );
				expect( document.types.length ).toBe( 2 );
				expect( document.types ).toContain( "http://example.com/types#Type-1" );
				expect( document.types ).toContain( "http://example.com/types#Type-2" );

				document.addType( "exTypes:Type-3" );
				expect( document.types.length ).toBe( 3 );
				expect( document.types ).toContain( "http://example.com/types#Type-1" );
				expect( document.types ).toContain( "http://example.com/types#Type-2" );
				expect( document.types ).toContain( "http://example.com/types#Type-3" );

				document.addType( "another:Type-0" );
				expect( document.types.length ).toBe( 4 );
				expect( document.types ).toContain( "http://example.com/types#Type-1" );
				expect( document.types ).toContain( "http://example.com/types#Type-2" );
				expect( document.types ).toContain( "http://example.com/types#Type-3" );
				expect( document.types ).toContain( "http://example.com/another-url/ns#Type-0" );

				document.addType( "Current-Type" );
				expect( document.types.length ).toBe( 5 );
				expect( document.types ).toContain( "http://example.com/types#Type-1" );
				expect( document.types ).toContain( "http://example.com/types#Type-2" );
				expect( document.types ).toContain( "http://example.com/types#Type-3" );
				expect( document.types ).toContain( "http://example.com/another-url/ns#Type-0" );
				expect( document.types ).toContain( "http://example.com/vocab#Current-Type" );
			} );

			it( hasMethod(
				INSTANCE,
				"hasType",
				"Returns true if the Document contains the type specified. Relative and prefixed types are resolved before the operation.", [
					{name: "type", type: "string", description: "The type to look for."},
				]
			), ():void => {
				expect( document.hasType ).toBeDefined();
				expect( Utils.isFunction( document.hasType ) ).toBe( true );

				document.types = [ "http://example.com/types#Type-1" ];
				expect( document.hasType( "http://example.com/types#Type-1" ) ).toBe( true );
				expect( document.hasType( "exTypes:Type-1" ) ).toBe( true );
				expect( document.hasType( "http://example.com/types#Type-2" ) ).toBe( false );


				document.types = [ "http://example.com/types#Type-1", "http://example.com/types#Type-2" ];
				expect( document.hasType( "http://example.com/types#Type-1" ) ).toBe( true );
				expect( document.hasType( "exTypes:Type-1" ) ).toBe( true );
				expect( document.hasType( "http://example.com/types#Type-2" ) ).toBe( true );
				expect( document.hasType( "exTypes:Type-2" ) ).toBe( true );
				expect( document.hasType( "http://example.com/types#Type-3" ) ).toBe( false );
				expect( document.hasType( "exTypes:#Type-3" ) ).toBe( false );

				document.types = [ "http://example.com/types#Type-1", "http://example.com/another-url/ns#Type-2" ];
				expect( document.hasType( "http://example.com/types#Type-1" ) ).toBe( true );
				expect( document.hasType( "exTypes:Type-1" ) ).toBe( true );
				expect( document.hasType( "another:Type-1" ) ).toBe( false );
				expect( document.hasType( "http://example.com/another-url/ns#Type-2" ) ).toBe( true );
				expect( document.hasType( "exTypes:Type-2" ) ).toBe( false );
				expect( document.hasType( "another:Type-2" ) ).toBe( true );

				document.types = [ "http://example.com/types#Type-1", "http://example.com/another-url/ns#Type-2", "http://example.com/vocab#Current-Type" ];
				expect( document.hasType( "http://example.com/types#Type-1" ) ).toBe( true );
				expect( document.hasType( "exTypes:Type-1" ) ).toBe( true );
				expect( document.hasType( "another:Type-1" ) ).toBe( false );
				expect( document.hasType( "Type-1" ) ).toBe( false );
				expect( document.hasType( "http://example.com/another-url/ns#Type-2" ) ).toBe( true );
				expect( document.hasType( "exTypes:Type-2" ) ).toBe( false );
				expect( document.hasType( "another:Type-2" ) ).toBe( true );
				expect( document.hasType( "Type-2" ) ).toBe( false );
				expect( document.hasType( "http://example.com/vocab#Current-Type" ) ).toBe( true );
				expect( document.hasType( "exTypes:Current-Type" ) ).toBe( false );
				expect( document.hasType( "another:Current-Type" ) ).toBe( false );
				expect( document.hasType( "Current-Type" ) ).toBe( true );
			} );

			it( hasMethod(
				INSTANCE,
				"removeType",
				"Remove the type specified from the Document. Relative and prefixed types are resolved before the operation.", [
					{name: "type", type: "string", description: "The type to be removed."},
				]
			), ():void => {
				expect( document.removeType ).toBeDefined();
				expect( Utils.isFunction( document.removeType ) ).toBe( true );

				document.types = [ "http://example.com/types#Type-1" ];
				document.removeType( "http://example.com/types#Type-2" );
				expect( document.types.length ).toBe( 1 );
				expect( document.types ).toContain( "http://example.com/types#Type-1" );
				document.removeType( "another:Type-1" );
				expect( document.types.length ).toBe( 1 );
				expect( document.types ).toContain( "http://example.com/types#Type-1" );
				document.removeType( "Type-1" );
				expect( document.types.length ).toBe( 1 );
				expect( document.types ).toContain( "http://example.com/types#Type-1" );

				document.types = [ "http://example.com/types#Type-1" ];
				document.removeType( "http://example.com/types#Type-1" );
				expect( document.types.length ).toBe( 0 );
				document.types = [ "http://example.com/types#Type-1" ];
				document.removeType( "exTypes:Type-1" );
				expect( document.types.length ).toBe( 0 );

				document.types = [ "http://example.com/types#Type-1", "http://example.com/types#Type-2" ];
				document.removeType( "http://example.com/types#Type-1" );
				expect( document.types.length ).toBe( 1 );
				expect( document.types ).toContain( "http://example.com/types#Type-2" );
				document.removeType( "exTypes:Type-2" );
				expect( document.types.length ).toBe( 0 );

				document.types = [ "http://example.com/types#Type-1", "http://example.com/types#Type-2", "http://example.com/another-url/ns#Type-3" ];
				document.removeType( "http://example.com/types#Type-1" );
				expect( document.types.length ).toBe( 2 );
				expect( document.types ).toContain( "http://example.com/types#Type-2" );
				expect( document.types ).toContain( "http://example.com/another-url/ns#Type-3" );
				document.removeType( "exTypes:Type-2" );
				expect( document.types.length ).toBe( 1 );
				expect( document.types ).toContain( "http://example.com/another-url/ns#Type-3" );
				document.removeType( "another:Type-3" );
				expect( document.types.length ).toBe( 0 );

				document.types = [ "http://example.com/types#Type-1", "http://example.com/types#Type-2", "http://example.com/another-url/ns#Type-3", "http://example.com/vocab#Type-4" ];
				document.removeType( "http://example.com/types#Type-1" );
				expect( document.types.length ).toBe( 3 );
				expect( document.types ).toContain( "http://example.com/types#Type-2" );
				expect( document.types ).toContain( "http://example.com/another-url/ns#Type-3" );
				expect( document.types ).toContain( "http://example.com/vocab#Type-4" );
				document.removeType( "exTypes:Type-2" );
				expect( document.types.length ).toBe( 2 );
				expect( document.types ).toContain( "http://example.com/another-url/ns#Type-3" );
				expect( document.types ).toContain( "http://example.com/vocab#Type-4" );
				document.removeType( "another:Type-3" );
				expect( document.types.length ).toBe( 1 );
				expect( document.types ).toContain( "http://example.com/vocab#Type-4" );
				document.removeType( "Type-4" );
				expect( document.types.length ).toBe( 0 );
			} );

			it( hasMethod(
				INSTANCE,
				"hasPointer",
				"Returns true if the PersistedDocument object has a pointer referenced by the URI provided.", [
					{name: "id", type: "string"},
				],
				{type: "boolean"}
			), ():void => {

				expect( document.hasPointer ).toBeDefined();
				expect( Utils.isFunction( document.hasPointer ) ).toBe( true );

				expect( document.hasPointer( "http://example.com/document/" ) ).toBe( true );
				expect( document.hasPointer( "http://example.com/document/#fragment" ) ).toBe( true );
				expect( document.hasPointer( "_:BlankNode" ) ).toBe( true );
				expect( document.hasPointer( "http://example.com/in/documents/" ) ).toBe( true );

				expect( document.hasPointer( "this-uri-is-resolved-relative/" ) ).toBe( false );
				expect( document.hasPointer( "http://example.com/document/#another-fragment" ) ).toBe( false );
				expect( document.hasPointer( "_:AnotherBlankNode" ) ).toBe( false );
				expect( document.hasPointer( "http://example.com/another-document/" ) ).toBe( false );
			} );

			it( hasMethod(
				INSTANCE,
				"getPointer",
				"Returns the pointer referenced by the URI provided. If none exists, an empty pointer is created.\n" +
				"Returns null if the URI is not inside the scope of the PersistedDocument.", [
					{name: "id", type: "string"},
				],
				{type: "boolean"}
			), ():void => {
				expect( document.getPointer ).toBeDefined();
				expect( Utils.isFunction( document.getPointer ) ).toBe( true );

				let pointer:Pointer.Class;

				pointer = document.getPointer( "http://example.com/document/" );
				expect( pointer ).toBe( document );
				pointer = document.getPointer( "http://example.com/document/#fragment" );
				expect( pointer.id ).toBe( "http://example.com/document/#fragment" );
				pointer = document.getPointer( "_:BlankNode" );
				expect( pointer.id ).toBe( "_:BlankNode" );
				pointer = document.getPointer( "#fragment" );
				expect( pointer.id ).toBe( "http://example.com/document/#fragment" );

				pointer = document.getPointer( "http://example.com/document/#another-fragment" );
				expect( pointer.id ).toBe( "http://example.com/document/#another-fragment" );
				pointer = document.getPointer( "_:AnotherBlankNode" );
				expect( pointer.id ).toBe( "_:AnotherBlankNode" );

				// Ask to the Documents container.
				pointer = document.getPointer( "this-uri-is-resolved-relative/" );
				expect( pointer.id ).toBe( "http://example.com/this-uri-is-resolved-relative/" );
				pointer = document.getPointer( "http://example.com/in/documents/" );
				expect( pointer.id ).toBe( "http://example.com/in/documents/" );
				pointer = document.getPointer( "http://example.com/another-document/" );
				expect( pointer.id ).toBe( "http://example.com/another-document/" );
			} );

			describe( method(
				INSTANCE,
				"inScope"
			), ():void => {

				it( hasSignature(
					"Returns true if the pointer provided is in the scope of the PersistedDocument.", [
						{name: "pointer", type: "Carbon.Pointer.Class"},
					],
					{type: "boolean"}
				), ():void => {
					expect( document.inScope ).toBeDefined();
					expect( Utils.isFunction( document.inScope ) ).toBe( true );

					let pointer:Pointer.Class;

					expect( document.inScope.bind( document, undefined ) ).toThrowError();
					expect( document.inScope.bind( document, null ) ).toThrowError();

					expect( document.inScope( document ) ).toBe( true );
					pointer = Pointer.Factory.create( "http://example.com/document/" );
					expect( document.inScope( pointer ) ).toBe( true );
					pointer = Pointer.Factory.create( "http://example.com/document/#fragment" );
					expect( document.inScope( pointer ) ).toBe( true );
					pointer = Pointer.Factory.create( "http://example.com/document/#another-fragment" );
					expect( document.inScope( pointer ) ).toBe( true );
					pointer = Pointer.Factory.create( "_:BlankNode" );
					expect( document.inScope( pointer ) ).toBe( true );
					pointer = Pointer.Factory.create( "#fragment" );
					expect( document.inScope( pointer ) ).toBe( true );

					// In Documents
					pointer = Pointer.Factory.create( "this-uri-is-resolved-relative/" );
					expect( document.inScope( pointer ) ).toBe( true );
					pointer = Pointer.Factory.create( "http://example.com/in/documents/" );
					expect( document.inScope( pointer ) ).toBe( true );
					pointer = Pointer.Factory.create( "http://example.com/document/child/" );
					expect( document.inScope( pointer ) ).toBe( true );
					pointer = Pointer.Factory.create( "http://example.com/another-document/" );
					expect( document.inScope( pointer ) ).toBe( true );
					pointer = Pointer.Factory.create( "http://example.org/document/" );
					expect( document.inScope( pointer ) ).toBe( true );
				} );

				it( hasSignature(
					"Returns true if the URI provided is in the scope of the PersistedDocument.", [
						{name: "id", type: "string"},
					],
					{type: "boolean"}
				), ():void => {
					expect( document.inScope ).toBeDefined();
					expect( Utils.isFunction( document.inScope ) ).toBe( true );

					expect( document.inScope( document.id ) ).toBe( true );
					expect( document.inScope( "http://example.com/document/" ) ).toBe( true );
					expect( document.inScope( "http://example.com/document/#fragment" ) ).toBe( true );
					expect( document.inScope( "http://example.com/document/#another-fragment" ) ).toBe( true );
					expect( document.inScope( "_:BlankNode" ) ).toBe( true );
					expect( document.inScope( "#fragment" ) ).toBe( true );

					// In Documents
					expect( document.inScope( "this-uri-is-resolved-relative/" ) ).toBe( true );
					expect( document.inScope( "http://example.com/in/documents/" ) ).toBe( true );
					expect( document.inScope( "http://example.com/document/child/" ) ).toBe( true );
					expect( document.inScope( "http://example.com/another-document/" ) ).toBe( true );
					expect( document.inScope( "http://example.org/document/" ) ).toBe( true );
				} );

			} );

			describe( method(
				INSTANCE,
				"createFragment"
			), ():void => {

				it( hasSignature(
					[ "T extends Object" ],
					"Creates a PersistedFragment from the object provided and the slug specified.", [
						{name: "object", type: "T"},
						{name: "slug", type: "string"},
					],
					{type: "T & Carbon.PersistedFragment.Class"}
				), ():void => {
					expect( document.createFragment ).toBeDefined();
					expect( Utils.isFunction( document.createFragment ) ).toBe( true );

					interface MyInterface { myProperty?:string; myPointer?:MyInterface; }

					let object:MyInterface;
					let fragment:PersistedFragment.Class & MyInterface;

					object = {};
					fragment = document.createFragment<MyInterface>( object, "my-fragment" );
					expect( object ).toBe( fragment );
					expect( Fragment.Factory.hasClassProperties( fragment ) ).toBe( true );
					expect( fragment.id ).toBe( "http://example.com/document/#my-fragment" );
					expect( fragment.myProperty ).toBeUndefined();

					object = {myProperty: "The property"};
					fragment = document.createFragment<MyInterface>( object, "http://example.com/document/#another-fragment" );
					expect( Fragment.Factory.hasClassProperties( fragment ) ).toBe( true );
					expect( fragment.id ).toBe( "http://example.com/document/#another-fragment" );
					expect( fragment.myProperty ).toBe( "The property" );

					object = {myProperty: "The BlankNode property"};
					fragment = document.createFragment<MyInterface>( object, "_:My-BlankNode" );
					expect( Fragment.Factory.hasClassProperties( fragment ) ).toBe( true );
					expect( fragment.id ).toBe( "_:My-BlankNode" );
					expect( fragment.myProperty ).toBe( "The BlankNode property" );

					object = {myProperty: "Fragment with nested object", myPointer: {myProperty: "The Nested object"}};
					fragment = document.createFragment<MyInterface>( object, "#another-another-fragment" );
					expect( Fragment.Factory.hasClassProperties( fragment ) ).toBe( true );
					expect( fragment.id ).toBe( "http://example.com/document/#another-another-fragment" );
					expect( fragment.myProperty ).toBe( "Fragment with nested object" );
					expect( fragment.myPointer ).toBeDefined();
					expect( Fragment.Factory.hasClassProperties( fragment.myPointer ) ).toBe( true );
					expect( URI.Util.isBNodeID( (<Fragment.Class> fragment.myPointer).id ) ).toBe( true );
					expect( fragment.myPointer.myProperty ).toBeDefined();
					expect( fragment.myPointer.myProperty ).toBe( "The Nested object" );

					object = {myProperty: "Fragment with nested object", myPointer: {myProperty: "The Nested object"}};
					fragment = document.createFragment<MyInterface>( object, "_:AnotherBlankNode" );
					expect( Fragment.Factory.hasClassProperties( fragment ) ).toBe( true );
					expect( fragment.id ).toBe( "_:AnotherBlankNode" );
					expect( fragment.myProperty ).toBe( "Fragment with nested object" );
					expect( fragment.myPointer ).toBeDefined();
					expect( Fragment.Factory.hasClassProperties( fragment.myPointer ) ).toBe( true );
					expect( URI.Util.isBNodeID( (<Fragment.Class> fragment.myPointer).id ) ).toBe( true );
					expect( fragment.myPointer.myProperty ).toBeDefined();
					expect( fragment.myPointer.myProperty ).toBe( "The Nested object" );

					expect( () => document.createFragment( {}, "http://example.com/another-document/#fragment" ) ).toThrowError( Errors.IllegalArgumentError );
					expect( () => document.createFragment( {}, "fragment" ) ).toThrowError( Errors.IDAlreadyInUseError );
					expect( () => document.createFragment( {}, "_:BlankNode" ) ).toThrowError( Errors.IDAlreadyInUseError );
				} );

				it( hasSignature(
					[ "T extends Object" ],
					"Creates a PersistedBlankNode from the object provided, sing no slug was specified.", [
						{name: "object", type: "T"},
					],
					{type: "T & Carbon.PersistedFragment.Class"}
				), ():void => {
					expect( document.createFragment ).toBeDefined();
					expect( Utils.isFunction( document.createFragment ) ).toBe( true );

					interface MyInterface { myProperty?:string; myPointer?:MyInterface; }

					let object:MyInterface;
					let fragment:PersistedFragment.Class & MyInterface;

					object = {};
					fragment = document.createFragment<MyInterface>( object );
					expect( object ).toBe( fragment );
					expect( Fragment.Factory.hasClassProperties( fragment ) ).toBe( true );
					expect( URI.Util.isBNodeID( fragment.id ) ).toBe( true );
					expect( fragment.myProperty ).toBeUndefined();

					object = {myProperty: "The property"};
					fragment = document.createFragment<MyInterface>( object );
					expect( Fragment.Factory.hasClassProperties( fragment ) ).toBe( true );
					expect( URI.Util.isBNodeID( fragment.id ) ).toBe( true );
					expect( fragment.myProperty ).toBe( "The property" );

					object = {myProperty: "Fragment with nested object", myPointer: {myProperty: "The Nested object"}};
					fragment = document.createFragment<MyInterface>( object );
					expect( Fragment.Factory.hasClassProperties( fragment ) ).toBe( true );
					expect( URI.Util.isBNodeID( fragment.id ) ).toBe( true );
					expect( fragment.myProperty ).toBe( "Fragment with nested object" );
					expect( fragment.myPointer ).toBeDefined();
					expect( Fragment.Factory.hasClassProperties( fragment.myPointer ) ).toBe( true );
					expect( URI.Util.isBNodeID( (<Fragment.Class> fragment.myPointer).id ) ).toBe( true );
					expect( fragment.myPointer.myProperty ).toBeDefined();
					expect( fragment.myPointer.myProperty ).toBe( "The Nested object" );
				} );

				it( hasSignature(
					"Creates a PersistedFragment with the slug provided.", [
						{name: "slug", type: "string"},
					],
					{type: "Carbon.PersistedFragment.Class"}
				), ():void => {
					expect( document.createFragment ).toBeDefined();
					expect( Utils.isFunction( document.createFragment ) ).toBe( true );

					let fragment:PersistedFragment.Class;

					fragment = document.createFragment( "my-fragment" );
					expect( Fragment.Factory.hasClassProperties( fragment ) ).toBe( true );
					expect( fragment.id ).toBe( "http://example.com/document/#my-fragment" );

					fragment = document.createFragment( "http://example.com/document/#another-fragment" );
					expect( Fragment.Factory.hasClassProperties( fragment ) ).toBe( true );
					expect( fragment.id ).toBe( "http://example.com/document/#another-fragment" );

					fragment = document.createFragment( "_:My-BlankNode" );
					expect( Fragment.Factory.hasClassProperties( fragment ) ).toBe( true );
					expect( fragment.id ).toBe( "_:My-BlankNode" );

					expect( () => document.createFragment( "http://example.com/another-document/#fragment" ) ).toThrowError( Errors.IllegalArgumentError );
					expect( () => document.createFragment( "fragment" ) ).toThrowError( Errors.IDAlreadyInUseError );
					expect( () => document.createFragment( "_:BlankNode" ) ).toThrowError( Errors.IDAlreadyInUseError );
				} );

				it( hasSignature(
					"Creates a PersistedBlankNode, since no slug is provided",
					{type: "Carbon.PersistedFragment.Class"}
				), ():void => {
					expect( document.createFragment ).toBeDefined();
					expect( Utils.isFunction( document.createFragment ) ).toBe( true );

					let fragment1:PersistedFragment.Class;
					let fragment2:PersistedFragment.Class;

					fragment1 = document.createFragment();
					expect( Fragment.Factory.hasClassProperties( fragment1 ) ).toBe( true );
					expect( Utils.isString( fragment1.id ) ).toBe( true );
					expect( URI.Util.isBNodeID( fragment1.id ) ).toBe( true );

					fragment2 = document.createFragment();
					expect( Fragment.Factory.hasClassProperties( fragment2 ) ).toBe( true );
					expect( Utils.isString( fragment2.id ) ).toBe( true );
					expect( URI.Util.isBNodeID( fragment2.id ) ).toBe( true );

					expect( fragment1.id ).not.toBe( fragment2.id );
				} );

			} );

			describe( method(
				INSTANCE,
				"createNamedFragment"
			), ():void => {

				it( hasSignature(
					"Creates a PersistedNamedFragment with the slug provided", [
						{name: "slug", type: "string"},
					],
					{type: "Carbon.PersistedNamedFragment.Class"}
				), ():void => {
					expect( document.createNamedFragment ).toBeDefined();
					expect( Utils.isFunction( document.createNamedFragment ) ).toBe( true );

					let fragment:PersistedNamedFragment.Class;

					fragment = document.createNamedFragment( "my-fragment" );
					expect( NamedFragment.Factory.hasClassProperties( fragment ) ).toBe( true );
					expect( fragment.slug ).toBe( "my-fragment" );
					expect( fragment.id ).toBe( "http://example.com/document/#my-fragment" );

					fragment = document.createNamedFragment( "http://example.com/document/#another-fragment" );
					expect( Fragment.Factory.hasClassProperties( fragment ) ).toBe( true );
					expect( fragment.slug ).toBe( "another-fragment" );
					expect( fragment.id ).toBe( "http://example.com/document/#another-fragment" );

					expect( () => document.createNamedFragment( "_:BlankNode" ) ).toThrowError( Errors.IllegalArgumentError );
					expect( () => document.createNamedFragment( "http://example.com/another-document/#fragment" ) ).toThrowError( Errors.IllegalArgumentError );
					expect( () => document.createNamedFragment( "fragment" ) ).toThrowError( Errors.IDAlreadyInUseError );
				} );

				it( hasSignature(
					[ "T extends Object" ],
					"Creates a PersistedNamedFragment from the object provided and the slug specified.", [
						{name: "object", type: "T"},
						{name: "slug", type: "string"},
					],
					{type: "T & Carbon.PersistedNamedFragment.Class"}
				), ():void => {

					expect( document.createNamedFragment ).toBeDefined();
					expect( Utils.isFunction( document.createNamedFragment ) ).toBe( true );

					interface MyInterface { myProperty?:string; myPointer?:MyInterface; }

					let object:MyInterface;
					let fragment:PersistedFragment.Class & MyInterface;

					object = {};
					fragment = document.createNamedFragment<MyInterface>( object, "my-fragment" );
					expect( object ).toBe( fragment );
					expect( Fragment.Factory.hasClassProperties( fragment ) ).toBe( true );
					expect( fragment.id ).toBe( "http://example.com/document/#my-fragment" );
					expect( fragment.myProperty ).toBeUndefined();

					object = {myProperty: "The property"};
					fragment = document.createNamedFragment<MyInterface>( object, "http://example.com/document/#another-fragment" );
					expect( Fragment.Factory.hasClassProperties( fragment ) ).toBe( true );
					expect( fragment.id ).toBe( "http://example.com/document/#another-fragment" );
					expect( fragment.myProperty ).toBe( "The property" );

					object = {myProperty: "Fragment with nested object", myPointer: {myProperty: "The Nested object"}};
					fragment = document.createNamedFragment<MyInterface>( object, "#another-another-fragment" );
					expect( Fragment.Factory.hasClassProperties( fragment ) ).toBe( true );
					expect( fragment.id ).toBe( "http://example.com/document/#another-another-fragment" );
					expect( fragment.myProperty ).toBe( "Fragment with nested object" );
					expect( fragment.myPointer ).toBeDefined();
					expect( Fragment.Factory.hasClassProperties( fragment.myPointer ) ).toBe( true );
					expect( URI.Util.isBNodeID( (<Fragment.Class> fragment.myPointer).id ) ).toBe( true );
					expect( fragment.myPointer.myProperty ).toBeDefined();
					expect( fragment.myPointer.myProperty ).toBe( "The Nested object" );
				} );

			} );

			it( hasMethod(
				INSTANCE,
				"refresh",
				[ "T extends Carbon.PersistedDocument.Class" ],
				"Sync the PersistedDocument with the data in the server.",
				{type: "Promise<[ T, Carbon.HTTP.Response.Class]>"}
			), ():void => {
				expect( document.refresh ).toBeDefined();
				expect( Utils.isFunction( document.refresh ) ).toBe( true );

				let spy:jasmine.Spy = spyOn( context.documents, "refresh" );
				document.refresh();
				expect( spy ).toHaveBeenCalledWith( document );
			} );

			it( hasMethod(
				INSTANCE,
				"save",
				[ "T extends Carbon.PersistedDocument.Class" ],
				"Save the PersistedDocument to the server.",
				{type: "Promise<[ T, Carbon.HTTP.Response.Class ]>"}
			), ():void => {
				expect( document.save ).toBeDefined();
				expect( Utils.isFunction( document.save ) ).toBe( true );

				let spy:jasmine.Spy = spyOn( context.documents, "save" );
				document.save();
				expect( spy ).toHaveBeenCalledWith( document );
			} );

			it( hasMethod(
				INSTANCE,
				"saveAndRefresh",
				[ "T extends Carbon.PersistedDocument.Class" ],
				"Save and refresh the PersistedDocument.",
				{type: "Promise<[ T, [ HTTP.Response.Class, HTTP.Response.Class ] ]>"}
			), ():void => {
				expect( document.saveAndRefresh ).toBeDefined();
				expect( Utils.isFunction( document.saveAndRefresh ) ).toBe( true );

				let spy:jasmine.Spy = spyOn( context.documents, "saveAndRefresh" );
				document.saveAndRefresh();
				expect( spy ).toHaveBeenCalledWith( document );
			} );

			it( hasMethod(
				INSTANCE,
				"delete",
				"Remove the data in the server referred by the id of the PersistedDocument.",
				{type: "Promise<Carbon.HTTP.Response.Class>"}
			), ():void => {
				expect( document.delete ).toBeDefined();
				expect( Utils.isFunction( document.delete ) ).toBe( true );

				let spy:jasmine.Spy = spyOn( context.documents, "delete" );
				document.delete();
				expect( spy ).toHaveBeenCalledWith( document.id );
			} );

			it( hasMethod(
				INSTANCE,
				"getDownloadURL",
				"Returns the URI of the current document with the properties necessarily for a single download request.",
				{type: "Promise<Carbon.HTTP.Response.Class>"}
			), ():void => {
				expect( document.getDownloadURL ).toBeDefined();
				expect( Utils.isFunction( document.getDownloadURL ) ).toBe( true );

				let spy:jasmine.Spy = spyOn( context.documents, "getDownloadURL" );
				document.getDownloadURL();
				expect( spy ).toHaveBeenCalledWith( document.id );
			} );

			describe( method(
				INSTANCE,
				"addMember"
			), ():void => {

				it( hasSignature(
					"Adds the specified resource Pointer as a member of the container.", [
						{name: "member", type: "Carbon.Pointer.Class", description: "Pointer object that references the resource to add as a member."},
					],
					{type: "Promise<Carbon.HTTP.Response.Class>"}
				), ():void => {
					expect( document.addMember ).toBeDefined();
					expect( Utils.isFunction( document.addMember ) ).toBeDefined();

					let spy:jasmine.Spy = spyOn( document._documents, "addMember" );

					let pointer:Pointer.Class = context.documents.getPointer( "new-member/" );
					document.addMember( pointer );

					expect( spy ).toHaveBeenCalledWith( "http://example.com/document/", pointer );
				} );

				it( hasSignature(
					"Adds the specified resource URI as a member of the container.", [
						{name: "memberURI", type: "string", description: "URI of the resource to add as a member."},
					],
					{type: "Promise<Carbon.HTTP.Response.Class>"}
				), ():void => {
					expect( document.addMember ).toBeDefined();
					expect( Utils.isFunction( document.addMember ) ).toBeDefined();

					let spy:jasmine.Spy = spyOn( document._documents, "addMember" );

					document.addMember( "new-member/" );

					expect( spy ).toHaveBeenCalledWith( "http://example.com/document/", "new-member/" );
				} );

			} );

			it( hasMethod(
				INSTANCE,
				"addMembers",
				"Adds the specified resources as members of the container.", [
					{name: "members", type: "(Carbon.Pointer.Class | string)[]", description: "Array of URIs or Pointers to add as members."},
				],
				{type: "Promise<Carbon.HTTP.Response.Class>"}
			), ():void => {
				expect( document.addMembers ).toBeDefined();
				expect( Utils.isFunction( document.addMembers ) ).toBeDefined();

				let spy:jasmine.Spy = spyOn( document._documents, "addMembers" );

				let pointers:Pointer.Class[] = [];
				pointers.push( context.documents.getPointer( "new-member/" ) );
				document.addMembers( pointers );

				expect( spy ).toHaveBeenCalledWith( "http://example.com/document/", pointers );
			} );

			describe( method(
				INSTANCE,
				"createChild"
			), ():void => {

				it( hasSignature(
					[ "T extends Object" ],
					"Persists a document with the slug specified as a child of the current container.", [
						{name: "object", type: "T", description: "The object from where create the child. If it's a non `Carbon.Document.Class` object, it's transformed into one."},
						{name: "slug", type: "string", description: "The slug that will be used in the child URI."},
					],
					{type: "Promise<[ T & Carbon.PersistedDocument.Class, Carbon.HTTP.Response.Class ]>"}
				), ():void => {
					expect( document.createChild ).toBeDefined();
					expect( Utils.isFunction( document.createChild ) ).toBeDefined();

					let spy:jasmine.Spy = spyOn( document._documents, "createChild" );

					let childDocument:Document.Class = Document.Factory.create();
					document.createChild( childDocument, "child" );

					expect( spy ).toHaveBeenCalledWith( "http://example.com/document/", childDocument, "child" );
					spy.calls.reset();

					let object:Object = {my: "object"};
					document.createChild( object, "child" );
					expect( spy ).toHaveBeenCalledWith( "http://example.com/document/", object, "child" );
				} );

				it( hasSignature(
					[ "T extends Object" ],
					"Persists a document as a child of the current container.", [
						{name: "object", type: "T", description: "The object from where create the child. If it's a non `Carbon.Document.Class` object, it's transformed into one."},
					],
					{type: "Promise<[ T & Carbon.PersistedDocument.Class, Carbon.HTTP.Response.Class ]>"}
				), ():void => {
					expect( document.createChild ).toBeDefined();
					expect( Utils.isFunction( document.createChild ) ).toBeDefined();

					let spy:jasmine.Spy = spyOn( document._documents, "createChild" );

					let childDocument:Document.Class = Document.Factory.create();
					document.createChild( childDocument );

					expect( spy ).toHaveBeenCalledWith( "http://example.com/document/", childDocument, undefined );
					spy.calls.reset();

					let object:Object = {my: "object"};
					document.createChild( object );
					expect( spy ).toHaveBeenCalledWith( "http://example.com/document/", object, undefined );
				} );

				it( hasSignature(
					"Creates an persists an empty child for the current container with the slug provided.", [
						{name: "slug", type: "string", description: "The slug that will be used in the child URI."},
					],
					{type: "Promise<[ Carbon.PersistedDocument.Class, Carbon.HTTP.Response.Class ]>"}
				), ():void => {
					expect( document.createChild ).toBeDefined();
					expect( Utils.isFunction( document.createChild ) ).toBeDefined();

					let spy:jasmine.Spy = spyOn( document._documents, "createChild" );

					document.createChild( "child" );
					expect( spy ).toHaveBeenCalledWith( "http://example.com/document/", {}, "child" );
				} );

				it( hasSignature(
					"Creates and persists an empty child fot he current document.",
					{type: "Promise<[ Carbon.Pointer.Class, Carbon.HTTP.Response.Class ]>"}
				), ():void => {
					expect( document.createChild ).toBeDefined();
					expect( Utils.isFunction( document.createChild ) ).toBeDefined();

					let spy:jasmine.Spy = spyOn( document._documents, "createChild" );

					document.createChild();
					expect( spy ).toHaveBeenCalledWith( "http://example.com/document/", {}, undefined );
				} );

			} );

			describe( method(
				INSTANCE,
				"createChildAndRetrieve",
				"Create a child for the document and retrieves the updated data from the server."
			), ():void => {

				it( isDefined(), ():void => {
					expect( document.createChildAndRetrieve ).toBeDefined();
					expect( Utils.isFunction( document.createChildAndRetrieve ) ).toBeDefined();
				} );

				it( hasSignature(
					[ "T extends Object" ], [
						{name: "object", type: "T", description: "The object from where create the child. If it's a non `Carbon.Document.Class` object, it is transformed into one."},
						{name: "slug", type: "string", description: "The slug name for the children URI."},
					],
					{type: "Promise<[ T & Carbon.PersistedDocument.Class, [ Carbon.HTTP.Response.Class, Carbon.HTTP.Response.Class ] ]>"}
				), ():void => {
					let spy:jasmine.Spy = spyOn( document._documents, "createChildAndRetrieve" );

					let childDocument:Document.Class = Document.Factory.create();
					document.createChildAndRetrieve( childDocument, "child" );

					expect( spy ).toHaveBeenCalledWith( "http://example.com/document/", childDocument, "child" );
					spy.calls.reset();

					let object:Object = {my: "object"};
					document.createChildAndRetrieve( object, "child" );
					expect( spy ).toHaveBeenCalledWith( "http://example.com/document/", object, "child" );
				} );

				it( hasSignature(
					[ "T extends Object" ], [
						{name: "object", type: "T", description: "The object from where create the child. If it's a non `Carbon.PersistedDocument.Class` object, it is transformed into one."},
					],
					{type: "Promise<[ T & Carbon.PersistedDocument.Class, [ Carbon.HTTP.Response.Class, Carbon.HTTP.Response.Class ] ]>"}
				), ():void => {
					let spy:jasmine.Spy = spyOn( document._documents, "createChildAndRetrieve" );

					let childDocument:Document.Class = Document.Factory.create();
					document.createChildAndRetrieve( childDocument );

					expect( spy ).toHaveBeenCalledWith( "http://example.com/document/", childDocument, undefined );
					spy.calls.reset();

					let object:Object = {my: "object"};
					document.createChildAndRetrieve( object );
					expect( spy ).toHaveBeenCalledWith( "http://example.com/document/", object, undefined );
				} );

				it( hasSignature( [
						{name: "slug", type: "string", description: "The slug name for the children URI."},
					],
					{type: "Promise<[ Carbon.PersistedDocument.Class, [ Carbon.HTTP.Response.Class, Carbon.HTTP.Response.Class ] ]>"}
				), ():void => {
					let spy:jasmine.Spy = spyOn( document._documents, "createChildAndRetrieve" );

					document.createChildAndRetrieve( "child" );
					expect( spy ).toHaveBeenCalledWith( "http://example.com/document/", {}, "child" );
				} );

				it( hasSignature(
					{type: "Promise<[ Carbon.PersistedDocument.Class, [ Carbon.HTTP.Response.Class, Carbon.HTTP.Response.Class ] ]>"}
				), ():void => {
					let spy:jasmine.Spy = spyOn( document._documents, "createChildAndRetrieve" );

					document.createChildAndRetrieve();
					expect( spy ).toHaveBeenCalledWith( "http://example.com/document/", {}, undefined );
				} );

			} );

			describe( method(
				INSTANCE,
				"createAccessPoint"
			), ():void => {

				it( hasSignature(
					[ "T extends Carbon.AccessPoint.Class" ],
					"Create an AccessPoint for the document with the slug specified.", [
						{name: "accessPoint", type: "T", description: "AccessPoint Document to persist."},
						{name: "slug", type: "string", optional: true, description: "Slug that will be used for the URI of the new access point."},
						{name: "requestOptions", type: "Carbon.HTTP.Request.Options", optional: true, description: "Customisable options for the request."},
					],
					{type: "Promise<[ T & Carbon.PersistedAccessPoint.Class, Carbon.HTTP.Response ]>"}
				), ():void => {
					expect( document.createAccessPoint ).toBeDefined();
					expect( Utils.isFunction( document.createAccessPoint ) ).toBeDefined();

					let spy:jasmine.Spy = spyOn( document._documents, "createAccessPoint" );

					document.createAccessPoint( {hasMemberRelation: "http://example.com/ns#memeber-relation"}, "my-new-access-point" );
					expect( spy ).toHaveBeenCalledWith( "http://example.com/document/", {hasMemberRelation: "http://example.com/ns#memeber-relation"}, "my-new-access-point", undefined );
				} );

				it( hasSignature(
					[ "T extends Carbon.AccessPoint.Class" ],
					"Create an AccessPoint for the document.", [
						{name: "accessPoint", type: "T", description: "AccessPoint Document to persist."},
						{name: "requestOptions", type: "Carbon.HTTP.Request.Options", optional: true, description: " Customizable options for the request."},
					],
					{type: "Promise<[ T & Carbon.PersistedAccessPoint.Class, Carbon.HTTP.Response ]>"}
				), ():void => {
					expect( document.createAccessPoint ).toBeDefined();
					expect( Utils.isFunction( document.createAccessPoint ) ).toBeDefined();

					let spy:jasmine.Spy = spyOn( document._documents, "createAccessPoint" );

					document.createAccessPoint( {hasMemberRelation: "http://example.com/ns#memeber-relation"} );
					expect( spy ).toHaveBeenCalledWith( "http://example.com/document/", {hasMemberRelation: "http://example.com/ns#memeber-relation"}, undefined, undefined );
				} );

			} );

			it( hasMethod(
				INSTANCE,
				"listChildren",
				"Retrieves an array of unresolved persisted documents that refers to the children of the current container.",
				{type: "Promise<[ Carbon.PersistedDocument.Class[], Carbon.HTTP.Response ]>"}
			), ():void => {
				expect( document.listChildren ).toBeDefined();
				expect( Utils.isFunction( document.listChildren ) ).toBeDefined();

				let spy:jasmine.Spy = spyOn( document._documents, "listChildren" );

				document.listChildren();
				expect( spy ).toHaveBeenCalledWith( "http://example.com/document/" );
			} );

			it( hasMethod(
				INSTANCE,
				"getChildren",
				[ "T" ],
				"Retrieves an array of resolved persisted documents that refers to the children of the current container, in accordance to the retrieval preferences specified.", [
					{name: "retrievalPreferences", type: "Carbon.RetrievalPreferences.Class", optional: true},
				],
				{type: "Promise<[ (T & Carbon.PersistedDocument.Class)[], Carbon.HTTP.Response ]>"}
			), ():void => {
				expect( document.getChildren ).toBeDefined();
				expect( Utils.isFunction( document.getChildren ) ).toBeDefined();

				let spy:jasmine.Spy = spyOn( document._documents, "getChildren" );

				document.getChildren();
				expect( spy ).toHaveBeenCalledWith( "http://example.com/document/", undefined );
				spy.calls.reset();


				let retrievalPreferences:RetrievalPreferences.Class = {
					limit: 10,
					offset: 0,
					orderBy: [ {"@id": "http://example.com/ns#string", "@type": "string"} ],
				};
				document.getChildren( retrievalPreferences );
				expect( spy ).toHaveBeenCalledWith( "http://example.com/document/", retrievalPreferences );
			} );

			it( hasMethod(
				INSTANCE,
				"listMembers",
				"Retrieves an array of unresolved persisted documents that refers to the members of the current container.", [
					{name: "includeNonReadable", type: "boolean", optional: true, description: "By default this option is set to `true`."},
				],
				{type: "Promise<[ Carbon.PersistedDocument.Class[], Carbon.HTTP.Response.Class ]>"}
			), ():void => {
				expect( document.listMembers ).toBeDefined();
				expect( Utils.isFunction( document.listMembers ) ).toBeDefined();

				let spy:jasmine.Spy = spyOn( document._documents, "listMembers" );

				document.listMembers();
				expect( spy ).toHaveBeenCalledWith( "http://example.com/document/", true );
				spy.calls.reset();

				document.listMembers( false );
				expect( spy ).toHaveBeenCalledWith( "http://example.com/document/", false );
			} );

			describe( method(
				INSTANCE,
				"getMembers"
			), ():void => {

				it( hasSignature(
					[ "T" ],
					"Retrieves an array of resolved persisted documents that refers to the members of the current container, in accordance to the retrieval preferences specified.", [
						{name: "includeNonReadable", type: "boolean", optional: true, description: "By default this option is set to `true`."},
						{name: "retrievalPreferences", type: "Carbon.RetrievalPreferences.Class", optional: true},
					],
					{type: "Promise<[ (T & Carbon.PersistedDocument.Class)[], Carbon.HTTP.Response.Class ]>"}
				), ():void => {
					expect( document.getMembers ).toBeDefined();
					expect( Utils.isFunction( document.getMembers ) ).toBeDefined();

					let spy:jasmine.Spy = spyOn( document._documents, "getMembers" );

					document.getMembers();
					expect( spy ).toHaveBeenCalledWith( "http://example.com/document/", true, undefined );
					spy.calls.reset();

					document.getMembers( false );
					expect( spy ).toHaveBeenCalledWith( "http://example.com/document/", false, undefined );
					spy.calls.reset();

					let retrievalPreferences:RetrievalPreferences.Class = {
						limit: 10,
						offset: 0,
						orderBy: [ {"@id": "http://example.com/ns#string", "@type": "string"} ],
					};

					document.getMembers( false, retrievalPreferences );
					expect( spy ).toHaveBeenCalledWith( "http://example.com/document/", false, retrievalPreferences );
					spy.calls.reset();

					document.getMembers( true, retrievalPreferences );
					expect( spy ).toHaveBeenCalledWith( "http://example.com/document/", true, retrievalPreferences );
					spy.calls.reset();

					document.getMembers( retrievalPreferences );
					expect( spy ).toHaveBeenCalledWith( "http://example.com/document/", retrievalPreferences, undefined );
					spy.calls.reset();
				} );

			} );

			describe( method(
				INSTANCE,
				"removeMember"
			), ():void => {

				it( hasSignature(
					"Remove the specified resource Pointer as a member of the current container.", [
						{name: "member", type: "Carbon.Pointer.Class", description: "Pointer object that references the resource to remove as a member."},
					],
					{type: "Promise<Carbon.HTTP.Response.Class>"}
				), ():void => {
					expect( document.removeMember ).toBeDefined();
					expect( Utils.isFunction( document.removeMember ) ).toBeDefined();

					let spy:jasmine.Spy = spyOn( document._documents, "removeMember" );

					let pointer:Pointer.Class = context.documents.getPointer( "remove-member/" );
					document.removeMember( pointer );

					expect( spy ).toHaveBeenCalledWith( "http://example.com/document/", pointer );
				} );

				it( hasSignature(
					"Remove the specified resource URI as a member of the current container.", [
						{name: "memberURI", type: "string", description: "URI of the resource to remove as a member."},
					],
					{type: "Promise<Carbon.HTTP.Response.Class>"}
				), ():void => {
					expect( document.removeMember ).toBeDefined();
					expect( Utils.isFunction( document.removeMember ) ).toBeDefined();

					let spy:jasmine.Spy = spyOn( document._documents, "removeMember" );

					document.removeMember( "remove-member/" );

					expect( spy ).toHaveBeenCalledWith( "http://example.com/document/", "remove-member/" );
				} );

			} );

			it( hasMethod(
				INSTANCE,
				"removeMembers",
				"Remove the specified resources URI or Pointers as members of the current container.", [
					{name: "members", type: "(Carbon.Pointer.Class | string)[]", description: "Array of URIs or Pointers to remove as members"},
				],
				{type: "Promise<Carbon.HTTP.Response.Class>"}
			), ():void => {
				expect( document.removeMembers ).toBeDefined();
				expect( Utils.isFunction( document.removeMembers ) ).toBeDefined();

				let spy:jasmine.Spy = spyOn( document._documents, "removeMembers" );

				let pointers:Pointer.Class[] = [];
				pointers.push( context.documents.getPointer( "remove-member/" ) );
				document.removeMembers( pointers );

				expect( spy ).toHaveBeenCalledWith( "http://example.com/document/", pointers );
			} );

			it( hasMethod(
				INSTANCE,
				"removeAllMembers",
				"Remove the specified resources URI or Pointers as members of the current container.",
				{type: "Promise<Carbon.HTTP.Response.Class>"}
			), ():void => {
				expect( document.removeAllMembers ).toBeDefined();
				expect( Utils.isFunction( document.removeAllMembers ) ).toBeDefined();

				let spy:jasmine.Spy = spyOn( document._documents, "removeAllMembers" );

				document.removeAllMembers();

				expect( spy ).toHaveBeenCalledWith( "http://example.com/document/" );
			} );

			describe( method(
				INSTANCE,
				"upload"
			), ():void => {

				it( hasSignature(
					"Upload a File to the server as a child of the current container with the slug specified. This signature only works in a web browser.", [
						{name: "data", type: "Blob", description: "Binary data to store in the server."},
						{name: "slug", type: "string", description: "The slug that will be used in the URI of the data."},
					],
					{type: "Promise<[ Carbon.Pointer.Class, Carbon.HTTP.Response.Class ]>"}
				), ():void => {
					expect( document.upload ).toBeDefined();
					expect( Utils.isFunction( document.upload ) ).toBeDefined();

					if( typeof Blob !== "undefined" ) {
						let spy:jasmine.Spy = spyOn( document._documents, "upload" );

						let blob:Blob = new Blob( [ JSON.stringify( {"some content": "for the blob."} ) ], {type: "application/json"} );
						document.upload( blob, "child" );

						expect( spy ).toHaveBeenCalledWith( "http://example.com/document/", blob, "child" );
					}
				} );

				it( hasSignature(
					"Upload a File to the server as a child of the current container. This signature only works in a web browser.", [
						{name: "data", type: "Blob", description: "Binary data to store in the server."},
					],
					{type: "Promise<[ Carbon.Pointer.Class, Carbon.HTTP.Response.Class ]>"}
				), ():void => {
					expect( document.upload ).toBeDefined();
					expect( Utils.isFunction( document.upload ) ).toBeDefined();

					if( typeof Blob !== "undefined" ) {
						let spy:jasmine.Spy = spyOn( document._documents, "upload" );

						let blob:Blob = new Blob( [ JSON.stringify( {"some content": "for the blob."} ) ], {type: "application/json"} );
						document.upload( blob );

						expect( spy ).toHaveBeenCalledWith( "http://example.com/document/", blob, undefined );
					}
				} );

				it( hasSignature(
					"Upload a File to the server as a child of the current container with the slug specified. This signature only works with Node.js.", [
						{name: "data", type: "Buffer", description: "Binary data to store in the server. The Buffer only works in Node.js."},
						{name: "slug", type: "string", description: "The slug that will be used in the URI of the data."},
					],
					{type: "Promise<[ Carbon.Pointer.Class, Carbon.HTTP.Response.Class ]>"}
				), ():void => {
					expect( document.upload ).toBeDefined();
					expect( Utils.isFunction( document.upload ) ).toBeDefined();

					if( typeof Buffer !== "undefined" ) {
						let spy:jasmine.Spy = spyOn( document._documents, "upload" );

						let buffer:Buffer = new Buffer( JSON.stringify( {"some content": "for the buffer."} ) );
						document.upload( buffer, "child" );

						expect( spy ).toHaveBeenCalledWith( "http://example.com/document/", buffer, "child" );
					}
				} );

				it( hasSignature(
					"Upload a File to the server as a child of the current container. This signature only works with Node.js.", [
						{name: "data", type: "Buffer", description: "Binary data to store in the server. The Buffer only works in Node.js."},
					],
					{type: "Promise<[ Carbon.Pointer.Class, Carbon.HTTP.Response.Class ]>"}
				), ():void => {
					expect( document.upload ).toBeDefined();
					expect( Utils.isFunction( document.upload ) ).toBeDefined();

					if( typeof Buffer !== "undefined" ) {
						let spy:jasmine.Spy = spyOn( document._documents, "upload" );

						let buffer:Buffer = new Buffer( JSON.stringify( {"some content": "for the buffer."} ) );
						document.upload( buffer );

						expect( spy ).toHaveBeenCalledWith( "http://example.com/document/", buffer, undefined );
					}
				} );

			} );

			it( hasMethod(
				INSTANCE,
				"executeRawASKQuery",
				"Executes an ASK query in the document and returns a raw application/sparql-results+json object.", [
					{name: "askQuery", type: "string"},
					{name: "requestOptions", type: "Carbon.HTTP.Request.Options", optional: true, description: "Customizable options for the request."},
				],
				{type: "Promise<[ Carbon.SPARQL.RawResults.Class, Carbon.HTTP.Response.Class ]>"}
			), ():void => {
				expect( document.executeRawASKQuery ).toBeDefined();
				expect( Utils.isFunction( document.executeRawASKQuery ) ).toBe( true );

				let spy:jasmine.Spy = spyOn( context.documents, "executeRawASKQuery" );
				document.executeRawASKQuery( "ASK { ?subject, ?predicate, ?object }" );
				expect( spy ).toHaveBeenCalledWith( document.id, "ASK { ?subject, ?predicate, ?object }", {} );
			} );

			it( hasMethod(
				INSTANCE,
				"executeASKQuery",
				"Executes an ASK query in the document and returns a boolean of the result.", [
					{name: "askQuery", type: "string"},
					{name: "requestOptions", type: "Carbon.HTTP.Request.Options", optional: true, description: "Customizable options for the request."},
				],
				{type: "Promise<[ boolean, Carbon.HTTP.Response.Class ]>"}
			), ():void => {
				expect( document.executeASKQuery ).toBeDefined();
				expect( Utils.isFunction( document.executeASKQuery ) ).toBe( true );

				let spy:jasmine.Spy = spyOn( context.documents, "executeASKQuery" );
				document.executeASKQuery( "ASK { ?subject, ?predicate, ?object }" );
				expect( spy ).toHaveBeenCalledWith( document.id, "ASK { ?subject, ?predicate, ?object }", {} );
			} );

			it( hasMethod(
				INSTANCE,
				"executeRawSELECTQuery",
				"Executes a SELECT query in the document and returns a raw application/sparql-results+json object.", [
					{name: "selectQuery", type: "string"},
					{name: "requestOptions", type: "Carbon.HTTP.Request.Options", optional: true, description: "Customizable options for the request."},
				],
				{type: "Promise<[ Carbon.SPARQL.RawResults.Class, Carbon.HTTP.Response.Class ]>"}
			), ():void => {
				expect( document.executeRawSELECTQuery ).toBeDefined();
				expect( Utils.isFunction( document.executeRawSELECTQuery ) ).toBe( true );

				let spy:jasmine.Spy = spyOn( context.documents, "executeRawSELECTQuery" );
				document.executeRawSELECTQuery( "SELECT ?book ?title WHERE { <http://example.com/some-document/> ?book ?title }" );
				expect( spy ).toHaveBeenCalledWith( document.id, "SELECT ?book ?title WHERE { <http://example.com/some-document/> ?book ?title }", {} );
			} );

			it( hasMethod(
				INSTANCE,
				"executeSELECTQuery",
				"Executes a SELECT query in the document and returns the results as a `Carbon.SPARQL.SELECTResults.Class` object.", [
					{name: "selectQuery", type: "string"},
					{name: "requestOptions", type: "Carbon.HTTP.Request.Options", optional: true, description: "Customizable options for the request."},
				],
				{type: "Promise<[ Carbon.SPARQL.SELECTResults.Class, Carbon.HTTP.Response.Class ]>"}
			), ():void => {
				expect( document.executeSELECTQuery ).toBeDefined();
				expect( Utils.isFunction( document.executeSELECTQuery ) ).toBe( true );

				let spy:jasmine.Spy = spyOn( context.documents, "executeSELECTQuery" );
				document.executeSELECTQuery( "SELECT ?book ?title WHERE { <http://example.com/some-document/> ?book ?title }" );
				expect( spy ).toHaveBeenCalledWith( document.id, "SELECT ?book ?title WHERE { <http://example.com/some-document/> ?book ?title }", {} );
			} );

			it( hasMethod(
				INSTANCE,
				"executeRawCONSTRUCTQuery",
				"Executes a CONSTRUCT query in the document and returns a string with the resulting model.", [
					{name: "constructQuery", type: "string"},
					{name: "requestOptions", type: "Carbon.HTTP.Request.Options", optional: true, description: "Customizable options for the request."},
				],
				{type: "Promise<[ string, Carbon.HTTP.Response.Class ]>"}
			), ():void => {
				expect( document.executeRawCONSTRUCTQuery ).toBeDefined();
				expect( Utils.isFunction( document.executeRawCONSTRUCTQuery ) ).toBe( true );

				let spy:jasmine.Spy = spyOn( context.documents, "executeRawCONSTRUCTQuery" );
				document.executeRawCONSTRUCTQuery( "CONSTRUCT { ?subject ?predicate ?object } WHERE { ?subject ?predicate ?object }" );
				expect( spy ).toHaveBeenCalledWith( document.id, "CONSTRUCT { ?subject ?predicate ?object } WHERE { ?subject ?predicate ?object }", {} );
			} );

			it( hasMethod(
				INSTANCE,
				"executeRawDESCRIBEQuery",
				"Executes a DESCRIBE query in the document and returns a string with the resulting model.", [
					{name: "constructQuery", type: "string"},
					{name: "requestOptions", type: "Carbon.HTTP.Request.Options", optional: true, description: "Customizable options for the request."},
				],
				{type: "Promise<[ string, Carbon.HTTP.Response.Class ]>"}
			), ():void => {
				expect( document.executeRawDESCRIBEQuery ).toBeDefined();
				expect( Utils.isFunction( document.executeRawDESCRIBEQuery ) ).toBe( true );

				let spy:jasmine.Spy = spyOn( context.documents, "executeRawDESCRIBEQuery" );
				document.executeRawDESCRIBEQuery( "DESCRIBE { ?subject ?predicate ?object } WHERE { ?subject ?predicate ?object }" );
				expect( spy ).toHaveBeenCalledWith( document.id, "DESCRIBE { ?subject ?predicate ?object } WHERE { ?subject ?predicate ?object }", {} );
			} );

			it( hasMethod(
				INSTANCE,
				"executeUPDATE",
				"Executes an UPDATE query.", [
					{name: "updateQuery", type: "string", description: "UPDATE query to execute in the selected endpoint."},
					{name: "requestOptions", type: "Carbon.HTTP.Request.Options", optional: true, description: "Customizable options for the request."},
				],
				{type: "Promise<Carbon.HTTP.Response.Class>"}
			), ():void => {
				expect( document.executeUPDATE ).toBeDefined();
				expect( Utils.isFunction( document.executeUPDATE ) ).toBe( true );

				let spy:jasmine.Spy = spyOn( context.documents, "executeUPDATE" );
				document.executeUPDATE( `INSERT DATA { GRAPH <http://example.com/some-document/> { <http://example.com/some-document/> <http://example.com/ns#propertyString> "Property Value" } }` );
				expect( spy ).toHaveBeenCalledWith( document.id, `INSERT DATA { GRAPH <http://example.com/some-document/> { <http://example.com/some-document/> <http://example.com/ns#propertyString> "Property Value" } }`, {} );
			} );

		} );

	} );

} );
