import { anyThatMatches } from "../../test/helpers/jasmine/equalities";
import { spyOnDecorated } from "../../test/helpers/jasmine/spies";
import { createNonEnumerable } from "../../test/helpers/miscellaneous";

import { DocumentsContext } from "../Context/DocumentsContext";

import { DocumentsRegistry } from "../DocumentsRegistry/DocumentsRegistry";

import { IDAlreadyInUseError } from "../Errors/IDAlreadyInUseError";
import { IllegalArgumentError } from "../Errors/IllegalArgumentError";

import { TransientFragment } from "../Fragment/TransientFragment";

import { ObjectSchemaDigester } from "../ObjectSchema/ObjectSchemaDigester";

import { Pointer } from "../Pointer/Pointer";

import { RDFDocument } from "../RDF/Document";
import { URI } from "../RDF/URI";

import { $Registry, Registry } from "../Registry/Registry";

import { Resource } from "../Resource/Resource";

import { XSD } from "../Vocabularies/XSD";

import {
	TransientExecutableQueryDocument,
	TransientExecutableQueryDocumentFactory
} from "./TransientExecutableQueryDocument";

const defaultStoredQuery:string = `
	SELECT ?s
	WHERE {
		?s ?o ?p
	}
`;

function createMock<T extends {}>( origin:T & Partial<TransientExecutableQueryDocument> = {} as T ):T & TransientExecutableQueryDocument {
	return TransientExecutableQueryDocument.createFrom( Object.assign( origin, {
		storedQuery: defaultStoredQuery,
		$id: "https://example.com/document/",
	} ) );
}

describe( "TransientExecutableQueryDocument", () => {

	it( "should exist", () => {
		expect( TransientExecutableQueryDocument ).toBeDefined();
		expect( TransientExecutableQueryDocument ).toEqual( jasmine.any( Object ) );
	} );


	describe( "[[interface impl]]", () => {


		describe( "TransientExecutableQueryDocument.$_normalize", () => {

			it( "should exist", () => {
				const document:TransientExecutableQueryDocument = createMock();

				expect( document.$_normalize ).toBeDefined();
				expect( document.$_normalize ).toEqual( jasmine.any( Function ) );
			} );


			it( "should remove blank nodes not referenced from the main document", () => {
				type TargetDocument = TransientExecutableQueryDocument & { object?:{ id:string } };
				const document:TargetDocument = createMock( { object: { id: "_:1" } } );
				delete document.object;

				document.$_normalize();
				expect( document.object ).not.toBeDefined();
				expect( document.$hasFragment( "_:1" ) ).toBe( false );
			} );

			it( "should remove blank nodes not referenced from the fragments", () => {
				type TargetDocument = TransientExecutableQueryDocument & { object:{ object?:{ id:string } } };
				const document:TargetDocument = createMock( { object: { object: { id: "_:1" } } } );
				delete document.object.object;

				document.$_normalize();
				expect( document.object.object ).not.toBeDefined();
				expect( document.$hasFragment( "_:1" ) ).toBe( false );
			} );

			it( "should maintain named fragments not referenced from the main document", () => {
				type TargetDocument = TransientExecutableQueryDocument & { object?:{ $id:string } };
				const document:TargetDocument = createMock( { object: { $id: "#1" } } );
				delete document.object;

				document.$_normalize();
				expect( document.object ).not.toBeDefined();
				expect( document.$hasFragment( "#1" ) ).toBe( true );
			} );

			it( "should maintain named fragments not referenced from the fragments", () => {
				type TargetDocument = TransientExecutableQueryDocument & { object:{ object?:{ $id:string } } };
				const document:TargetDocument = createMock( { object: { object: { $id: "#1" } } } );
				delete document.object.object;

				document.$_normalize();
				expect( document.object.object ).not.toBeDefined();
				expect( document.$hasFragment( "#1" ) ).toBe( true );
			} );

			it( "should convert without problems in cyclical referenced fragments", () => {
				type TargetDocument = TransientExecutableQueryDocument & { object?:{ self?:{} } };
				const document:TargetDocument = createMock( {} );

				const object:{ $id?:string, self?:{} } = { $id: "_:1" };
				object.self = object;

				document.object = object;
				document.$_normalize();

				expect( document.object ).toBeDefined();
				expect( TransientFragment.is( document.object ) ).toBe( true );
				expect( document.$hasFragment( "_:1" ) ).toBe( true );
				expect( document.object.self ).toBe( document.object );
			} );

		} );


		describe( "TransientExecutableQueryDocument.$getPointer", () => {

			it( "should exist", () => {
				const document:TransientExecutableQueryDocument = createMock();

				expect( document.$getPointer ).toBeDefined();
				expect( document.$getPointer ).toEqual( jasmine.any( Function ) );
			} );


			it( "should throw error when IRI of the document and no $registry", () => {
				const document:TransientExecutableQueryDocument = createMock();

				expect( () => {
					document.$getPointer( "https://example.com/document/" );
				} ).toThrowError( IllegalArgumentError );
			} );

			it( "should throw error when relative IRI and no $registry", () => {
				const document:TransientExecutableQueryDocument = createMock();

				expect( () => {
					document.$getPointer( "document/" );
				} ).toThrowError( IllegalArgumentError );
			} );

			it( "should throw error when another absolute IRI and no $registry", () => {
				const document:TransientExecutableQueryDocument = createMock();

				expect( () => {
					document.$getPointer( "https://example.com/another/document/" );
				} ).toThrowError( IllegalArgumentError );
			} );

			it( "should return the document when IRI of the document and has $registry", () => {
				const context:DocumentsContext = new DocumentsContext( "https://example.com/" );
				const registry:DocumentsRegistry = DocumentsRegistry.create( { context: context } );

				const document:TransientExecutableQueryDocument = createMock( { $registry: registry } );

				registry.__resourcesMap.set( registry._getLocalID( document.$id ), document as any );

				const returned:Pointer = document.$getPointer( "https://example.com/document/" );
				expect( returned ).toBe( document );
			} );

			it( "should return document as child when relative IRI and has $registry", () => {
				const context:DocumentsContext = new DocumentsContext( "https://example.com/" );
				const registry:DocumentsRegistry = DocumentsRegistry.create( { context: context } );

				const document:TransientExecutableQueryDocument = createMock( { $registry: registry } );

				const returned:Pointer = document.$getPointer( "relative/" );
				expect( returned ).toEqual( anyThatMatches( TransientExecutableQueryDocument.is, "isTransientExecutableQueryDocument" ) as any );
				expect( returned.$id ).toEqual( document.$id + "relative/" );
			} );

			it( "should return document when another absolute IRI and has $registry", () => {
				const context:DocumentsContext = new DocumentsContext( "https://example.com/" );
				const registry:DocumentsRegistry = DocumentsRegistry.create( { context: context } );

				const document:TransientExecutableQueryDocument = createMock( { $registry: registry } );

				const returned:Pointer = document.$getPointer( "https://example.com/another/document/" );
				expect( returned ).toEqual( anyThatMatches( TransientExecutableQueryDocument.is, "isTransientExecutableQueryDocument" ) as any );
				expect( returned.$id ).toEqual( "https://example.com/another/document/" );
			} );


			it( "should create named fragment when relative fragment label and not exits", () => {
				const document:TransientExecutableQueryDocument = createMock();
				const pointer:Pointer = document.$getPointer( "#fragment" );

				expect( TransientFragment.is( pointer ) ).toBe( true );

				expect( document.$__resourcesMap ).toEqual( new Map( [
					[ "fragment", pointer as TransientFragment ],
				] ) );
			} );

			it( "should return fragment when relative fragment label and exits", () => {
				const document:TransientExecutableQueryDocument = createMock();
				const fragment:TransientFragment = {} as any;
				document.$__resourcesMap.set( "fragment", fragment );

				expect( document.$getPointer( "#fragment" ) ).toBe( fragment );
			} );

			it( "should create named fragment when absolute fragment label and not exits", () => {
				const document:TransientExecutableQueryDocument = createMock();
				const pointer:Pointer = document.$getPointer( "https://example.com/document/#fragment" );

				expect( TransientFragment.is( pointer ) ).toBe( true );
				expect( document.$__resourcesMap ).toEqual( new Map( [
					[ "fragment", pointer as TransientFragment ],
				] ) );
			} );

			it( "should return fragment when absolute fragment label and exits", () => {
				const document:TransientExecutableQueryDocument = createMock();
				const fragment:TransientFragment = {} as any;
				document.$__resourcesMap.set( "fragment", fragment );

				expect( document.$getPointer( "https://example.com/document/#fragment" ) ).toBe( fragment );
			} );

			it( "should create blank node when blank node label and not exists", () => {
				const document:TransientExecutableQueryDocument = createMock();
				const pointer:Pointer = document.$getPointer( "_:1" );

				expect( TransientFragment.is( pointer ) ).toBe( true );
				expect( document.$__resourcesMap ).toEqual( new Map( [
					[ "_:1", pointer as TransientFragment ],
				] ) );
			} );

			it( "should return blank node when blank node label and exits", () => {
				const document:TransientExecutableQueryDocument = createMock();
				const fragment:TransientFragment = {} as any;
				document.$__resourcesMap.set( "_:1", fragment );

				expect( document.$getPointer( "_:1" ) ).toBe( fragment );
			} );

		} );


		describe( "TransientExecutableQueryDocument.$_getLocalID", () => {

			it( "should exist", () => {
				const document:TransientExecutableQueryDocument = createMock();

				expect( document.$_getLocalID ).toBeDefined();
				expect( document.$_getLocalID ).toEqual( jasmine.any( Function ) );
			} );


			it( "should throw error false when IRI of the document", () => {
				const document:TransientExecutableQueryDocument = createMock();

				expect( () => document.$_getLocalID( "https://example.com/document/" ) ).toThrow();
			} );

			it( "should throw error when relative IRIs", () => {
				const document:TransientExecutableQueryDocument = createMock();

				expect( () => document.$_getLocalID( "relative/" ) ).toThrow();
			} );

			it( "should throw error when another absolute IRIs", () => {
				const document:TransientExecutableQueryDocument = createMock();

				expect( () => document.$_getLocalID( "https://example.com/another/document/" ) ).toThrow();
			} );

			it( "should return fragment when relative fragment label", () => {
				const document:TransientExecutableQueryDocument = createMock();

				expect( document.$_getLocalID( "#fragment" ) ).toBe( "fragment" );
			} );

			it( "should return fragment when absolute fragment label", () => {
				const document:TransientExecutableQueryDocument = createMock();

				expect( document.$_getLocalID( "https://example.com/document/#fragment" ) ).toBe( "fragment" );
			} );

			it( "should throw error when another absolute fragment label", () => {
				const document:TransientExecutableQueryDocument = createMock();

				expect( () => document.$_getLocalID( "https://example.com/another/document/#fragment" ) ).toThrow();
			} );

			it( "should return label when blank node label", () => {
				const document:TransientExecutableQueryDocument = createMock();

				expect( document.$_getLocalID( "_:1" ) ).toBe( "_:1" );
			} );

		} );


		describe( "TransientExecutableQueryDocument.$hasFragment", () => {

			it( "should exist", () => {
				const document:TransientExecutableQueryDocument = createMock();

				expect( document.$hasFragment ).toBeDefined();
				expect( document.$hasFragment ).toEqual( jasmine.any( Function ) );
			} );


			it( "should return false when IRI of the document", () => {
				const document:TransientExecutableQueryDocument = createMock();

				expect( document.$hasFragment( "https://example.com/document/" ) ).toBe( false );
			} );

			it( "should return false when relative IRIs", () => {
				const document:TransientExecutableQueryDocument = createMock();

				expect( document.$hasFragment( "document/" ) ).toBe( false );
				expect( document.$hasFragment( "another/document/" ) ).toBe( false );
			} );

			it( "should return false when another absolute IRIs", () => {
				const document:TransientExecutableQueryDocument = createMock();

				expect( document.$hasFragment( "https://example.com/another/document/" ) ).toBe( false );
			} );

			it( "should return false when relative fragment label and not exits", () => {
				const document:TransientExecutableQueryDocument = createMock();

				expect( document.$hasFragment( "#fragment" ) ).toBe( false );
			} );

			it( "should return true when relative fragment label and exits", () => {
				const document:TransientExecutableQueryDocument = createMock();
				document.$__resourcesMap.set( "fragment", {} as any );

				expect( document.$hasFragment( "#fragment" ) ).toBe( true );
			} );

			it( "should return false when absolute fragment label and not exits", () => {
				const document:TransientExecutableQueryDocument = createMock();

				expect( document.$hasFragment( "https://example.com/document/#fragment" ) ).toBe( false );
			} );

			it( "should return true when absolute fragment label and exits", () => {
				const document:TransientExecutableQueryDocument = createMock();
				document.$__resourcesMap.set( "fragment", {} as any );

				expect( document.$hasFragment( "https://example.com/document/#fragment" ) ).toBe( true );
			} );

			it( "should return true when label and not exits", () => {
				const document:TransientExecutableQueryDocument = createMock();
				document.$__resourcesMap.set( "fragment", {} as any );

				expect( document.$hasFragment( "fragment" ) ).toBe( true );
			} );

			it( "should return true when label and exits", () => {
				const document:TransientExecutableQueryDocument = createMock();

				expect( document.$hasFragment( "fragment" ) ).toBe( false );
			} );

			it( "should return false when blank node label and not exists", () => {
				const document:TransientExecutableQueryDocument = createMock();

				expect( document.$hasFragment( "_:1" ) ).toBe( false );
			} );

			it( "should be true when blank node label and exits", () => {
				const document:TransientExecutableQueryDocument = createMock();
				document.$__resourcesMap.set( "_:1", {} as any );

				expect( document.$hasFragment( "_:1" ) ).toBe( true );
			} );

		} );


		describe( "TransientExecutableQueryDocument.$getFragment", () => {

			it( "should exist", () => {
				const document:TransientExecutableQueryDocument = createMock();

				expect( document.$getFragment ).toBeDefined();
				expect( document.$getFragment ).toEqual( jasmine.any( Function ) );
			} );


			it( "should throw error when IRI of the document", () => {
				const document:TransientExecutableQueryDocument = createMock();

				expect( () => document.$getFragment( "https://example.com/document/" ) ).toThrowError( IllegalArgumentError, `"https://example.com/document/" is out of scope.` );
			} );

			it( "should throw error when another absolute IRIs", () => {
				const document:TransientExecutableQueryDocument = createMock();

				expect( () => document.$getFragment( "https://example.com/another/document/" ) ).toThrowError( IllegalArgumentError, `"https://example.com/another/document/" is out of scope.` );
			} );

			it( "should return null when relative fragment label and not exits", () => {
				const document:TransientExecutableQueryDocument = createMock();

				expect( document.$getFragment( "#fragment" ) ).toBeNull();
			} );

			it( "should return fragment when relative fragment label and exits", () => {
				const document:TransientExecutableQueryDocument = createMock();
				const fragment:TransientFragment = {} as any;
				document.$__resourcesMap.set( "fragment", fragment );

				expect( document.$getFragment<{}>( "#fragment" ) ).toBe( fragment );
			} );

			it( "should return null when absolute fragment label and not exits", () => {
				const document:TransientExecutableQueryDocument = createMock();

				expect( document.$getFragment( "https://example.com/document/#fragment" ) ).toBeNull();
			} );

			it( "should return fragment when absolute fragment label and exits", () => {
				const document:TransientExecutableQueryDocument = createMock();
				const fragment:TransientFragment = {} as any;
				document.$__resourcesMap.set( "fragment", fragment );

				expect( document.$getFragment<{}>( "https://example.com/document/#fragment" ) ).toBe( fragment );
			} );

			it( "should return null when label and not exits", () => {
				const document:TransientExecutableQueryDocument = createMock();

				expect( document.$getFragment( "fragment" ) ).toBeNull();
			} );

			it( "should return fragment when label and exits", () => {
				const document:TransientExecutableQueryDocument = createMock();
				const fragment:TransientFragment = {} as any;
				document.$__resourcesMap.set( "fragment", fragment );

				expect( document.$getFragment<{}>( "fragment" ) ).toBe( fragment );
			} );

			it( "should return null when blank node label and not exists", () => {
				const document:TransientExecutableQueryDocument = createMock();

				expect( document.$getFragment( "_:1" ) ).toBeNull();
			} );

			it( "should return true when blank node label and exits", () => {
				const document:TransientExecutableQueryDocument = createMock();
				const fragment:TransientFragment = {} as any;
				document.$__resourcesMap.set( "_:1", fragment );

				expect( document.$getFragment<{}>( "_:1" ) ).toBe( fragment );
			} );

		} );

		describe( "TransientExecutableQueryDocument.$getFragments", () => {

			it( "should exist", () => {
				const document:TransientExecutableQueryDocument = createMock();

				expect( document.$getFragments ).toBeDefined();
				expect( document.$getFragments ).toEqual( jasmine.any( Function ) );
			} );


			it( "should return empty array when no fragments", () => {
				const document:TransientExecutableQueryDocument = createMock();

				expect( document.$getFragments() ).toEqual( [] );
			} );

			it( "should return array with all fragments", () => {
				const document:TransientExecutableQueryDocument = createMock();
				document.$__resourcesMap
					.set( "fragment", { the: "first fragment" } as any )
					.set( "_:1", { the: "second fragment" } as any )
					.set( "another", { the: "third fragment" } as any )
					.set( "_:2", { the: "fourth fragment" } as any )
				;

				expect( document.$getFragments() ).toEqual( [
					{ the: "first fragment" } as any,
					{ the: "second fragment" } as any,
					{ the: "third fragment" } as any,
					{ the: "fourth fragment" } as any,
				] );
			} );

		} );

		describe( "TransientExecutableQueryDocument.$createFragment", () => {

			it( "should exist", () => {
				const document:TransientExecutableQueryDocument = createMock();

				expect( document.$createFragment ).toBeDefined();
				expect( document.$createFragment ).toEqual( jasmine.any( Function ) );
			} );


			it( "should create named fragment when object and slug label provided", () => {
				const document:TransientExecutableQueryDocument = createMock();

				const fragment:TransientFragment & { string:string } = document
					.$createFragment( { string: "a string" }, "fragment" );

				expect( TransientFragment.is( fragment ) ).toBe( true, "Not asserting as a TransientFragment." );
				expect( fragment.$id ).toBe( "https://example.com/document/#fragment" );

				expect( fragment as { string:string } ).toEqual( {
					string: "a string",
				} );

				expect( fragment.$id ).toBe( "https://example.com/document/#fragment" );
			} );

			it( "should create named fragment when only slug label provided", () => {
				const document:TransientExecutableQueryDocument = createMock();
				const fragment:TransientFragment = document.$createFragment( "fragment" );

				expect( TransientFragment.is( fragment ) ).toBe( true, "Not asserting as a TransientFragment." );
				expect( fragment.$id ).toBe( "https://example.com/document/#fragment" );
			} );

			it( "should create named fragment when object and absolute IRI provided", () => {
				const document:TransientExecutableQueryDocument = createMock();
				type TargetFragment = TransientFragment & { string:string };
				const fragment:TargetFragment = document.$createFragment( { string: "a string" }, "https://example.com/document/#fragment" );

				expect( TransientFragment.is( fragment ) ).toBe( true, "Not asserting as a TransientFragment." );
				expect( fragment.$id ).toBe( "https://example.com/document/#fragment" );

				expect( fragment as { string:string } ).toEqual( {
					string: "a string",
				} );
				expect( fragment.$id ).toBe( "https://example.com/document/#fragment" );
			} );

			it( "should create named fragment when only absolute IRI provided", () => {
				const document:TransientExecutableQueryDocument = createMock();
				const fragment:TransientFragment = document.$createFragment( "https://example.com/document/#fragment" );

				expect( TransientFragment.is( fragment ) ).toBe( true, "Not asserting as a TransientFragment." );
				expect( fragment.$id ).toBe( "https://example.com/document/#fragment" );
			} );

			it( "should create blank node when no label provided", () => {
				const document:TransientExecutableQueryDocument = createMock();
				const fragment:TransientFragment = document.$createFragment( {} );

				expect( TransientFragment.is( fragment ) ).toBe( true, "Not asserting object as a fragment" );
				expect( URI.isBNodeID( fragment.$id ) ).toBe( true, "No bNode label been assigned" );
			} );

			it( "should create blank node when object and blank node label provided", () => {
				const document:TransientExecutableQueryDocument = createMock();
				type TargetFragment = TransientFragment & { string:string };
				const fragment:TargetFragment = document.$createFragment( { string: "a string" }, "_:1" );

				expect( TransientFragment.is( fragment ) ).toBe( true, "Not asserting object as a fragment" );
				expect( fragment.$id ).toBe( "_:1", "Changing the provided $id" );

				expect( fragment as { string:string } ).toEqual( {
					string: "a string",
				} );
			} );

			it( "should create blank node when only blank node label provided", () => {
				const document:TransientExecutableQueryDocument = createMock();
				const fragment:TransientFragment = document.$createFragment( "_:1" );

				expect( TransientFragment.is( fragment ) ).toBe( true, "Not asserting object as a fragment" );
				expect( fragment.$id ).toBe( "_:1", "Changing the provided $id" );
			} );

			it( "should convert nested objects when object provided", () => {
				const document:TransientExecutableQueryDocument = createMock();

				const nestedObject:object = { the: "nested object" };
				const object:object = { the: "object", nested: nestedObject };
				document.$createFragment( object );

				expect( TransientFragment.is( nestedObject ) ).toBe( true, "Not converting nested objects" );
			} );

			it( "should convert nested-nested objects when object provided", () => {
				const document:TransientExecutableQueryDocument = createMock();

				const nestedNestedObject:object = { the: "nested-nested object" };
				const nestedObject:object = { the: "nested object", nested: nestedNestedObject };
				const object:object = { the: "object", nested: nestedObject };
				document.$createFragment( object );

				expect( TransientFragment.is( nestedNestedObject ) ).toBe( true, "Not converting nested objects" );
			} );


			it( "should throw error when only absolute IRI has not document $id as base", () => {
				const document:TransientExecutableQueryDocument = createMock();

				expect( () => {
					document.$createFragment( "https://example.com/another-document/#fragment" );
				} ).toThrowError( IllegalArgumentError, `"https://example.com/another-document/#fragment" is out of scope.` );
			} );

			it( "should throw error when object and absolute IRI has not document $id as base", () => {
				const document:TransientExecutableQueryDocument = createMock();

				expect( () => {
					document.$createFragment( {}, "https://example.com/another-document/#fragment" );
				} ).toThrowError( IllegalArgumentError, `"https://example.com/another-document/#fragment" is out of scope.` );
			} );

			it( "should throw error when object but slug label is already used", () => {
				const document:TransientExecutableQueryDocument = createMock();
				document.$__resourcesMap.set( "fragment", TransientFragment.create( { $registry: document } ) );

				expect( () => document.$createFragment( {}, "fragment" ) ).toThrowError( IDAlreadyInUseError, `"#fragment" is already being used.` );
			} );

			it( "should throw error when only slug label is already used", () => {
				const document:TransientExecutableQueryDocument = createMock();
				document.$__resourcesMap.set( "fragment", TransientFragment.create( { $registry: document } ) );

				expect( () => document.$createFragment( "fragment" ) ).toThrowError( IDAlreadyInUseError, `"#fragment" is already being used.` );
			} );

			it( "should throw error when object but absolute IRI provided is already used", () => {
				const document:TransientExecutableQueryDocument = createMock();
				document.$__resourcesMap.set( "fragment", TransientFragment.create( { $registry: document } ) );

				expect( () => document.$createFragment( {}, "https://example.com/document/#fragment" ) ).toThrowError( IDAlreadyInUseError, `"https://example.com/document/#fragment" is already being used.` );
			} );

			it( "should throw error when only absolute IRI provided is already used", () => {
				const document:TransientExecutableQueryDocument = createMock();
				document.$__resourcesMap.set( "fragment", TransientFragment.create( { $registry: document } ) );

				expect( () => document.$createFragment( "https://example.com/document/#fragment" ) ).toThrowError( IDAlreadyInUseError, `"https://example.com/document/#fragment" is already being used.` );
			} );

			it( "should throw error when object but blank node label is used", () => {
				const document:TransientExecutableQueryDocument = createMock();
				document.$__resourcesMap.set( "_:1", TransientFragment.create( { $registry: document } ) );

				expect( () => document.$createFragment( {}, "_:1" ) ).toThrowError( IDAlreadyInUseError, `"_:1" is already being used.` );
			} );

			it( "should throw error when only blank node label is used", () => {
				const document:TransientExecutableQueryDocument = createMock();
				document.$__resourcesMap.set( "_:1", TransientFragment.create( { $registry: document } ) );

				expect( () => document.$createFragment( "_:1" ) ).toThrowError( IDAlreadyInUseError, `"_:1" is already being used.` );
			} );

		} );

		describe( "TransientExecutableQueryDocument.$removeFragment", () => {

			it( "should exist", () => {
				const document:TransientExecutableQueryDocument = createMock();

				expect( document.$removeFragment ).toBeDefined();
				expect( document.$removeFragment ).toEqual( jasmine.any( Function ) );
			} );


			it( "should remove providing a named fragment", () => {
				const document:TransientExecutableQueryDocument = createMock();

				const fragment:TransientFragment = TransientFragment.create( {
					$registry: document,
					$id: "#fragment",
				} );
				document.$__resourcesMap.set( "fragment", fragment );

				document.$removeFragment( fragment );
				expect( document.$__resourcesMap ).toEqual( new Map() );
			} );

			it( "should remove providing a blank node", () => {
				const document:TransientExecutableQueryDocument = createMock();

				const fragment:TransientFragment = TransientFragment.create( {
					$registry: document,
					$id: "_:1",
				} );
				document.$__resourcesMap.set( "_:1", fragment );

				document.$removeFragment( fragment );
				expect( document.$__resourcesMap ).toEqual( new Map() );
			} );

			it( "should remove providing a fragment label", () => {
				const document:TransientExecutableQueryDocument = createMock();

				document.$__resourcesMap.set( "fragment", TransientFragment.create( { $registry: document } ) );

				document.$removeFragment( "#fragment" );
				expect( document.$__resourcesMap ).toEqual( new Map() );
			} );

			it( "should remove providing a fragment slug label", () => {
				const document:TransientExecutableQueryDocument = createMock();

				document.$__resourcesMap.set( "fragment", TransientFragment.create( { $registry: document } ) );

				document.$removeFragment( "fragment" );
				expect( document.$__resourcesMap ).toEqual( new Map() );
			} );

			it( "should remove providing an absolute fragment IRI", () => {
				const document:TransientExecutableQueryDocument = createMock();

				document.$__resourcesMap.set( "fragment", TransientFragment.create( { $registry: document } ) );

				document.$removeFragment( "https://example.com/document/#fragment" );
				expect( document.$__resourcesMap ).toEqual( new Map() );
			} );

			it( "should remove providing a blank node label", () => {
				const document:TransientExecutableQueryDocument = createMock();
				document.$__resourcesMap.set( "_:1", TransientFragment.create( { $registry: document } ) );

				document.$removeFragment( "_:1" );
				expect( document.$__resourcesMap ).toEqual( new Map() );
			} );

		} );


		describe( "TransientExecutableQueryDocument.toJSON", () => {

			it( "should exist", () => {
				const document:TransientExecutableQueryDocument = createMock();

				expect( document.toJSON ).toBeDefined();
				expect( document.toJSON ).toEqual( jasmine.any( Function ) );
			} );


			it( "should expand empty when no assigned registry", () => {
				const document:TransientExecutableQueryDocument = createMock( { the: "document" } );
				document.$createFragment( { $id: "_:1", the: "blank node" } );
				document.$createFragment( { $id: "#fragment", the: "named fragment" } );

				const rdfDocument:RDFDocument = document.toJSON();
				expect( rdfDocument ).toEqual( {
					"@id": "https://example.com/document/",
					"@graph": [
						{
							"@id": "https://example.com/document/",
							"@type": [ "https://carbonldp.com/ns/v1/platform#ExecutableQueryDocument" ],

						},
						{
							"@id": "_:1",
						},
						{
							"@id": "https://example.com/document/#fragment",
						},
					],
				} );
			} );

			it( "should expand with the assigned registry", () => {
				const context:DocumentsContext = new DocumentsContext( "https://example.com/" );
				spyOnDecorated( context.registry, "getSchemaFor" ).and
					.returnValue( ObjectSchemaDigester.digestSchema( {
						"@vocab": "https://example.com/ns#",
						"the": { "@type": "string" },
					} ) );

				const document:TransientExecutableQueryDocument = createMock( { $registry: context.registry, the: "document" } );
				document.$createFragment( { $id: "_:1", the: "blank node" } );
				document.$createFragment( { $id: "#fragment", the: "named fragment" } );

				const rdfDocument:RDFDocument = document.toJSON();
				expect( rdfDocument ).toEqual( {
					"@id": "https://example.com/document/",
					"@graph": [
						{
							"@id": "https://example.com/document/",
							"https://example.com/ns#the": [ {
								"@value": "document",
								"@type": XSD.string,
							} ],
							"https://example.com/ns#storedQuery": [ {
								"@value": defaultStoredQuery,
								"@type": XSD.string,
							} ],
							"@type": [ "https://carbonldp.com/ns/v1/platform#ExecutableQueryDocument" ],

						},
						{
							"@id": "_:1",
							"https://example.com/ns#the": [ {
								"@value": "blank node",
								"@type": XSD.string,
							} ],
						},
						{
							"@id": "https://example.com/document/#fragment",
							"https://example.com/ns#the": [ {
								"@value": "named fragment",
								"@type": XSD.string,
							} ],
						},
					],
				} );

			} );

			it( "should expand with the provided context", () => {
				const context:DocumentsContext = new DocumentsContext( "https://example.com/" );
				const registry:DocumentsRegistry = DocumentsRegistry.create( { context: context } );

				spyOnDecorated( registry, "getSchemaFor" ).and
					.returnValue( ObjectSchemaDigester.digestSchema( {
						"@vocab": "https://example.com/ns#",
						"the": { "@type": "string" },
					} ) );


				spyOnDecorated( context.registry, "getSchemaFor" ).and
					.returnValue( ObjectSchemaDigester.digestSchema( {
						"@vocab": "https://example.com/another#",
						"the": { "@type": "string" },
					} ) );

				const document:TransientExecutableQueryDocument = createMock( { $registry: registry, the: "document" } );
				document.$createFragment( { $id: "_:1", the: "blank node" } );
				document.$createFragment( { $id: "#fragment", the: "named fragment" } );

				const rdfDocument:RDFDocument = document.toJSON( context );
				expect( rdfDocument ).toEqual( {
					"@id": "https://example.com/document/",
					"@graph": [
						{
							"@id": "https://example.com/document/",
							"https://example.com/another#the": [ {
								"@value": "document",
								"@type": XSD.string,
							} ],
							"https://example.com/another#storedQuery": [ {
								"@value": defaultStoredQuery,
								"@type": XSD.string,
							} ],
							"@type": [ "https://carbonldp.com/ns/v1/platform#ExecutableQueryDocument" ],

						},
						{
							"@id": "_:1",
							"https://example.com/another#the": [ {
								"@value": "blank node",
								"@type": XSD.string,
							} ],
						},
						{
							"@id": "https://example.com/document/#fragment",
							"https://example.com/another#the": [ {
								"@value": "named fragment",
								"@type": XSD.string,
							} ],
						},
					],
				} );

			} );


		} );

	} );

	describe( "[[factory]]", () => {

		describe( "TransientExecutableQueryDocument.is", () => {

			it( "should exist", () => {
				expect( TransientExecutableQueryDocument.is ).toBeDefined();
				expect( TransientExecutableQueryDocument.is ).toEqual( jasmine.any( Function ) );
			} );


			let isResourceSpy:jasmine.Spy;
			let isRegistrySpy:jasmine.Spy;
			let isSelfDecoratedSpy:jasmine.Spy;
			beforeEach( () => {
				isResourceSpy = spyOn( Resource, "is" )
					.and.returnValue( true );
				isRegistrySpy = spyOn( Registry, "isDecorated" )
					.and.returnValue( true );

				isSelfDecoratedSpy = spyOn( TransientExecutableQueryDocument, "isDecorated" )
					.and.returnValue( true );
			} );

			it( "should assert that is a `Resource`", () => {
				const target:object = { the: "object" };
				TransientExecutableQueryDocument.is( target );

				expect( isResourceSpy ).toHaveBeenCalledWith( target );
			} );

			it( "should assert that is a `Registry`", () => {
				const target:object = { the: "object" };
				TransientExecutableQueryDocument.is( target );

				expect( isRegistrySpy ).toHaveBeenCalledWith( target );
			} );

			it( "should assert that is decorated", () => {
				const target:object = { the: "object" };
				TransientExecutableQueryDocument.is( target );

				expect( isSelfDecoratedSpy ).toHaveBeenCalledWith( target );
			} );


			it( "should return true when all assertions", () => {
				expect( TransientExecutableQueryDocument.is( {} ) ).toBe( true );
			} );

			it( "should return false when isn't Resource", () => {
				isResourceSpy.and.returnValue( false );

				expect( TransientExecutableQueryDocument.is( {} ) ).toBe( false );
			} );

			it( "should return false when isn't Registry", () => {
				isRegistrySpy.and.returnValue( false );

				expect( TransientExecutableQueryDocument.is( {} ) ).toBe( false );
			} );

			it( "should return false when isn't decorated", () => {
				isSelfDecoratedSpy.and.returnValue( false );

				expect( TransientExecutableQueryDocument.is( {} ) ).toBe( false );
			} );

		} );

		describe( "TransientExecutableQueryDocument.isDecorated", () => {

			it( "should exist", () => {
				expect( TransientExecutableQueryDocument.isDecorated ).toBeDefined();
				expect( TransientExecutableQueryDocument.isDecorated ).toEqual( jasmine.any( Function ) );
			} );


			let target:TransientExecutableQueryDocumentFactory[ "PROTOTYPE" ];
			beforeEach( () => {
				const fn:() => any = () => {};
				const val:any = null;

				target = createNonEnumerable<TransientExecutableQueryDocumentFactory[ "PROTOTYPE" ]>( {
					$registry: val,

					$_getLocalID: fn,

					$getPointer: fn,

					hasMemberRelation: val,
					isMemberOfRelation: val,
					defaultInteractionModel: val,
					insertedContentRelation: val,

					$_normalize: fn,

					$hasFragment: fn,
					$getFragment: fn,
					$getFragments: fn,
					$createFragment: fn,

					$removeFragment: fn,

					toJSON: fn,
					storedQuery: defaultStoredQuery,
				} );
			} );

			it( "should return true when all properties", () => {
				expect( TransientExecutableQueryDocument.isDecorated( target ) ).toBe( true );
			} );


			it( "should return false when no `$registry`", () => {
				delete target.$registry;
				expect( TransientExecutableQueryDocument.isDecorated( target ) ).toBe( false );
			} );

			it( "should return false when no `$_getLocalID`", () => {
				delete target.$_getLocalID;
				expect( TransientExecutableQueryDocument.isDecorated( target ) ).toBe( false );
			} );

			it( "should return false when no `$getPointer`", () => {
				delete target.$getPointer;
				expect( TransientExecutableQueryDocument.isDecorated( target ) ).toBe( false );
			} );


			it( "should return true when no `hasMemberRelation`", () => {
				delete target.hasMemberRelation;
				expect( TransientExecutableQueryDocument.isDecorated( target ) ).toBe( true );
			} );

			it( "should return true when no `isMemberOfRelation`", () => {
				delete target.isMemberOfRelation;
				expect( TransientExecutableQueryDocument.isDecorated( target ) ).toBe( true );
			} );

			it( "should return true when no `defaultInteractionModel`", () => {
				delete target.defaultInteractionModel;
				expect( TransientExecutableQueryDocument.isDecorated( target ) ).toBe( true );
			} );

			it( "should return true when no `insertedContentRelation`", () => {
				delete target.insertedContentRelation;
				expect( TransientExecutableQueryDocument.isDecorated( target ) ).toBe( true );
			} );


			it( "should return false when no `$_normalize`", () => {
				delete target.$_normalize;
				expect( TransientExecutableQueryDocument.isDecorated( target ) ).toBe( false );
			} );

			it( "should return false when no `$hasFragment`", () => {
				delete target.$hasFragment;
				expect( TransientExecutableQueryDocument.isDecorated( target ) ).toBe( false );
			} );

			it( "should return false when no `$getFragment`", () => {
				delete target.$getFragment;
				expect( TransientExecutableQueryDocument.isDecorated( target ) ).toBe( false );
			} );

			it( "should return false when no `$getFragments`", () => {
				delete target.$getFragments;
				expect( TransientExecutableQueryDocument.isDecorated( target ) ).toBe( false );
			} );

			it( "should return false when no `$createFragment`", () => {
				delete target.$createFragment;
				expect( TransientExecutableQueryDocument.isDecorated( target ) ).toBe( false );
			} );

			it( "should return false when no `$removeFragment`", () => {
				delete target.$removeFragment;
				expect( TransientExecutableQueryDocument.isDecorated( target ) ).toBe( false );
			} );


			it( "should return false when no `toJSON`", () => {
				delete target.toJSON;
				expect( TransientExecutableQueryDocument.isDecorated( target ) ).toBe( false );
			} );

		} );

		describe( "TransientExecutableQueryDocument.create", () => {

			it( "should exist", () => {
				expect( TransientExecutableQueryDocument.create ).toBeDefined();
				expect( TransientExecutableQueryDocument.create ).toEqual( jasmine.any( Function ) );
			} );


			it( "should throw error when no storedQuery is passed", () => {
				expect( () => TransientExecutableQueryDocument.create() )
					.toThrow( new IllegalArgumentError( "The new ExecutableQueryDocument must contain a storedQuery property" ) );
			} );

			it( "should throw error when the storedQuery is not a string", () => {
				expect( () => TransientExecutableQueryDocument.create( {
					storedQuery: 123,
				} as any ) )
					.toThrow( new IllegalArgumentError( "The storedQuery property must be of type string" ) );
			} );

			it( "should return an `ExecutableQueryDocument`", () => {
				const target:TransientExecutableQueryDocument = TransientExecutableQueryDocument.create( {
					storedQuery: defaultStoredQuery,
				} );
				expect( TransientExecutableQueryDocument.is( target ) ).toBe( true );
			} );
		} );

		describe( "TransientExecutableQueryDocument.createFrom", () => {

			it( "should exist", () => {
				expect( TransientExecutableQueryDocument.createFrom ).toBeDefined();
				expect( TransientExecutableQueryDocument.createFrom ).toEqual( jasmine.any( Function ) );
			} );


			it( "should create a `Document`", () => {
				const target:TransientExecutableQueryDocument = TransientExecutableQueryDocument.createFrom( {
					storedQuery: defaultStoredQuery,
				} );
				expect( TransientExecutableQueryDocument.is( target ) ).toBe( true );
			} );

			it( "should convert nested objects to `Fragment`s", () => {
				type TargetDocument = TransientExecutableQueryDocument & { object:object };
				const target:TargetDocument = TransientExecutableQueryDocument.createFrom( {
					$id: "",
					storedQuery: defaultStoredQuery,
					object: {},
				} );

				expect( TransientFragment.is( target.object ) ).toBe( true );
			} );

		} );

		describe( "TransientExecutableQueryDocument.decorate", () => {

			it( "should exist", () => {
				expect( TransientExecutableQueryDocument.decorate ).toBeDefined();
				expect( TransientExecutableQueryDocument.decorate ).toEqual( jasmine.any( Function ) );
			} );


			it( "should add the `Resource` properties", () => {
				const target:Resource = TransientExecutableQueryDocument.decorate( {
					storedQuery: defaultStoredQuery,
				} );
				expect( Resource.isDecorated( target ) ).toBe( true );
			} );

			it( "should add the `$Registry` properties", () => {
				const target:$Registry<any> = TransientExecutableQueryDocument.decorate( {
					storedQuery: defaultStoredQuery,
				} );
				expect( Registry.isDecorated( target ) ).toBe( true );
			} );

			it( "should add the `TransientExecutableQueryDocument` properties", () => {
				const target:TransientExecutableQueryDocument = TransientExecutableQueryDocument.decorate( {
					storedQuery: defaultStoredQuery,
				} );
				expect( TransientExecutableQueryDocument.isDecorated( target ) ).toBe( true );
			} );

		} );

	} );

} );
