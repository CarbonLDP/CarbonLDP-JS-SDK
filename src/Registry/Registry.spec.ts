import { anyThatMatches } from "../../test/helpers/jasmine/equalities";
import { spyOnDecorated } from "../../test/helpers/jasmine/spies";

import { IDAlreadyInUseError } from "../Errors/IDAlreadyInUseError";
import { IllegalArgumentError } from "../Errors/IllegalArgumentError";

import { ModelDecorator } from "../Model/ModelDecorator";

import { Pointer } from "../Pointer/Pointer";

import { RegisteredPointer } from "./RegisteredPointer";
import { $Registry, Registry } from "./Registry";


function createMock<T extends object>( data:T & Partial<Registry<RegisteredPointer>> ):T & Registry<RegisteredPointer> {
	return Registry.decorate( Object.assign( {
		__modelDecorator: RegisteredPointer,
		_getLocalID: id => id,
	}, data ) );
}

describe( "Registry", () => {

	it( "should exist", () => {
		expect( Registry ).toBeDefined();
		expect( Registry ).toEqual( jasmine.any( Object ) );
	} );

	describe( "[[interface impl]]", () => {

		describe( "Registry._getLocalID", () => {

			it( "should exist", () => {
				const registry:Registry<RegisteredPointer> = createMock( {} );

				expect( registry._getLocalID ).toBeDefined();
				expect( registry._getLocalID ).toEqual( jasmine.any( Function ) );
			} );


			it( "should return same id", () => {
				const registry:Registry<RegisteredPointer> = createMock( {} );

				expect( registry._getLocalID( "" ) ).toBe( "" );
				expect( registry._getLocalID( "resource/" ) ).toBe( "resource/" );
			} );

		} );

		describe( "Registry._addPointer", () => {

			it( "should exist", () => {
				const registry:Registry<RegisteredPointer> = createMock( {} );

				expect( registry._addPointer ).toBeDefined();
				expect( registry._addPointer ).toEqual( jasmine.any( Function ) );
			} );


			it( "should throw error if no ID in the base object", () => {
				const registry:Registry<RegisteredPointer> = createMock( {} );

				expect( () => {
					registry._addPointer( {} as any );
				} ).toThrowError( IllegalArgumentError, "The pointer $id cannot be empty." );
			} );

			it( "should throw error when ID out of scope", () => {
				const registry:Registry<RegisteredPointer> = createMock( {} );
				spyOnDecorated( registry, "_getLocalID" )
					.and.callFake( () => { throw new IllegalArgumentError( `"id" is out of scope.` ); } );

				expect( () => {
					registry._addPointer( { $id: "id" } );
				} ).toThrowError( IllegalArgumentError, `"id" is out of scope.` );
			} );

			it( "should return the given resource even though the ID is already in use", () => {
				const registry:Registry<RegisteredPointer> = createMock( {} );

				registry.__resourcesMap.set( "id", RegisteredPointer.create( { $registry: registry } ) );

				expect(
					registry._addPointer( { $id: "id" } )
				).toEqual( registry.__resourcesMap.get( "id" )! );
			} );

			it( "should return the same object reference", () => {
				const registry:Registry<RegisteredPointer> = createMock( {} );

				const object:{ $id:string } = { $id: "id" };
				const returned:RegisteredPointer = registry._addPointer( object );

				expect( object ).toBe( returned );
			} );

			it( "should return the resource type", () => {
				const registry:Registry<RegisteredPointer> = createMock( {} );

				const returned:RegisteredPointer = registry._addPointer( { $id: "id" } );
				expect( returned ).toEqual( anyThatMatches( RegisteredPointer.is, "isPointer" ) );
			} );

			it( "should assign resource.$registry as itself", () => {
				const registry:Registry<RegisteredPointer> = createMock( {} );

				const returned:RegisteredPointer = registry._addPointer( { $id: "id" } );
				expect( returned.$registry ).toBe( registry );
			} );

			it( "should store resource in the _resourcesMap", () => {
				const registry:Registry<RegisteredPointer> = createMock( {} );

				const returned:RegisteredPointer = registry._addPointer( { $id: "id" } );

				expect( registry.__resourcesMap ).toEqual( new Map( [
					[ "id", returned ],
				] ) );
			} );

		} );


		describe( "Registry.inScope", () => {

			it( "should exist", () => {
				const registry:Registry<RegisteredPointer> = createMock( {} );

				expect( registry.inScope ).toBeDefined();
				expect( registry.inScope ).toEqual( jasmine.any( Function ) );
			} );


			it( "should call _getLocalID when string", () => {
				const registry:Registry<RegisteredPointer> = createMock( {} );
				const spy:jasmine.Spy = spyOnDecorated( registry, "_getLocalID" )
					.and.callThrough();

				registry.inScope( "id" );
				expect( spy ).toHaveBeenCalledWith( "id" );
			} );

			it( "should call _getLocalID when RegisteredPointer", () => {
				const registry:Registry<RegisteredPointer> = createMock( {} );
				const spy:jasmine.Spy = spyOnDecorated( registry, "_getLocalID" )
					.and.callThrough();

				registry.inScope( RegisteredPointer.create( { $registry: registry, $id: "id" } ) );
				expect( spy ).toHaveBeenCalledWith( "id" );
			} );


			it( "should return true if string can be converted to local", () => {
				const registry:Registry<RegisteredPointer> = createMock( {} );

				const returned:boolean = registry.inScope( "id" );
				expect( returned ).toBe( true );

			} );

			it( "should return true if RegisteredPointer.$id can be converted to local", () => {
				const registry:Registry<RegisteredPointer> = createMock( {} );

				const returned:boolean = registry.inScope( RegisteredPointer.create( { $registry: registry, $id: "id" } ) );
				expect( returned ).toBe( true );
			} );

			it( "should return true if string can be converted by parent registry", () => {
				const parent:Registry<RegisteredPointer> = createMock( {} );

				const registry:Registry<RegisteredPointer> = createMock( { registry: parent } );
				spyOnDecorated( registry, "_getLocalID" )
					.and.throwError( "no local" );

				const returned:boolean = registry.inScope( "id" );
				expect( returned ).toBe( true );
			} );

			it( "should return true if RegisteredPointer.$id can be converted by parent registry", () => {
				const parent:Registry<RegisteredPointer> = createMock( {} );

				const registry:Registry<RegisteredPointer> = createMock( { registry: parent } );
				spyOnDecorated( registry, "_getLocalID" )
					.and.throwError( "no local" );


				const returned:boolean = registry.inScope( RegisteredPointer.create( { $registry: registry, $id: "id" } ) );
				expect( returned ).toBe( true );
			} );


			it( "should return false if string can't be converted & has no parent", () => {
				const registry:Registry<RegisteredPointer> = createMock( {} );

				spyOnDecorated( registry, "_getLocalID" )
					.and.throwError( "no local" );

				const returned:boolean = registry.inScope( "id" );
				expect( returned ).toBe( false );
			} );

			it( "should return false if RegisteredPointer.$id can't be converted & has no parent", () => {
				const registry:Registry<RegisteredPointer> = createMock( {} );

				spyOnDecorated( registry, "_getLocalID" )
					.and.throwError( "no local" );

				const returned:boolean = registry.inScope( RegisteredPointer.create( { $registry: registry, $id: "id" } ) );
				expect( returned ).toBe( false );
			} );

			it( "should return false if string can't be converted by parent", () => {
				const parent:Registry<RegisteredPointer> = createMock( {} );
				spyOnDecorated( parent, "_getLocalID" )
					.and.throwError( "no local" );

				const registry:Registry<RegisteredPointer> = createMock( { registry: parent } );
				spyOnDecorated( registry, "_getLocalID" )
					.and.throwError( "no local" );

				const returned:boolean = registry.inScope( "id" );
				expect( returned ).toBe( false );
			} );

			it( "should return false if RegisteredPointer.$id can't be converted by parent", () => {
				const parent:Registry<RegisteredPointer> = createMock( {} );
				spyOnDecorated( parent, "_getLocalID" )
					.and.throwError( "no local" );

				const registry:Registry<RegisteredPointer> = createMock( { registry: parent } );
				spyOnDecorated( registry, "_getLocalID" )
					.and.throwError( "no local" );

				const returned:boolean = registry.inScope( RegisteredPointer.create( { $registry: registry, $id: "id" } ) );
				expect( returned ).toBe( false );
			} );

			it( "should return false if string can be converted by parent registry but local flag set", () => {
				const parent:Registry<RegisteredPointer> = createMock( {} );

				const registry:Registry<RegisteredPointer> = createMock( { registry: parent } );
				spyOnDecorated( registry, "_getLocalID" )
					.and.throwError( "no local" );

				const returned:boolean = registry.inScope( "id", true );
				expect( returned ).toBe( false );
			} );

			it( "should return false if RegisteredPointer.$id can be converted by parent registry but local flag set", () => {
				const parent:Registry<RegisteredPointer> = createMock( {} );

				const registry:Registry<RegisteredPointer> = createMock( { registry: parent } );
				spyOnDecorated( registry, "_getLocalID" )
					.and.throwError( "no local" );

				const returned:boolean = registry.inScope( RegisteredPointer.create( { $registry: registry, $id: "id" } ), true );
				expect( returned ).toBe( false );
			} );

		} );


		describe( "Registry.hasPointer", () => {

			it( "should exist", () => {
				const registry:Registry<RegisteredPointer> = createMock( {} );

				expect( registry.hasPointer ).toBeDefined();
				expect( registry.hasPointer ).toEqual( jasmine.any( Function ) );
			} );


			it( "should return false when not in scope & has no parent", () => {
				const registry:Registry<RegisteredPointer> = createMock( {} );

				spyOnDecorated( registry, "_getLocalID" )
					.and.callFake( () => { throw new Error( "not local" ); } );

				const returned:boolean = registry.hasPointer( "id" );
				expect( returned ).toBe( false );
			} );

			it( "should return false when in scope but not exists & has no parent", () => {
				const registry:Registry<RegisteredPointer> = createMock( {} );

				spyOnDecorated( registry, "_getLocalID" )
					.and.returnValue( "local" );

				const returned:boolean = registry.hasPointer( "id" );
				expect( returned ).toBe( false );
			} );

			it( "should return true when in scope and exists & has no parent", () => {
				const registry:Registry<RegisteredPointer> = createMock( {} );
				registry._addPointer( { "$id": "id" } );

				const returned:boolean = registry.hasPointer( "id" );
				expect( returned ).toBe( true );
			} );

			it( "should return false when not in scope & has no parent & local flag is set", () => {
				const registry:Registry<RegisteredPointer> = createMock( {} );

				spyOnDecorated( registry, "_getLocalID" )
					.and.callFake( () => { throw new Error( "not local" ); } );

				const returned:boolean = registry.hasPointer( "id", true );
				expect( returned ).toBe( false );
			} );

			it( "should return false when in scope but not exists & has no parent & local flag is set ", () => {
				const registry:Registry<RegisteredPointer> = createMock( {} );

				const returned:boolean = registry.hasPointer( "id", true );
				expect( returned ).toBe( false );
			} );

			it( "should return true when in scope and exists & has no parent & local flag is set ", () => {
				const registry:Registry<RegisteredPointer> = createMock( {} );
				registry._addPointer( { "$id": "id" } );

				const returned:boolean = registry.hasPointer( "id", true );
				expect( returned ).toBe( true );
			} );


			it( "should return false when not in scope & not in parent", () => {
				const parent:Registry<RegisteredPointer> = createMock( {} );

				const registry:Registry<RegisteredPointer> = createMock( { registry: parent } );
				spyOnDecorated( registry, "_getLocalID" )
					.and.callFake( () => { throw new Error( "not local" ); } );

				const returned:boolean = registry.hasPointer( "id" );
				expect( returned ).toBe( false );
			} );

			it( "should return true when not in scope & in parent", () => {
				const parent:Registry<RegisteredPointer> = createMock( {} );
				parent._addPointer( { "$id": "id" } );

				const registry:Registry<RegisteredPointer> = createMock( { registry: parent } );
				spyOnDecorated( registry, "_getLocalID" )
					.and.callFake( () => { throw new Error( "not local" ); } );

				const returned:boolean = registry.hasPointer( "id" );
				expect( returned ).toBe( true );
			} );

			it( "should return false when not in scope & not in parent & local flag is set", () => {
				const parent:Registry<RegisteredPointer> = createMock( {} );

				const registry:Registry<RegisteredPointer> = createMock( { registry: parent } );
				spyOnDecorated( registry, "_getLocalID" )
					.and.callFake( () => { throw new Error( "not local" ); } );

				const returned:boolean = registry.hasPointer( "id", true );
				expect( returned ).toBe( false );
			} );

			it( "should return false when not in scope & in parent & local flag is set", () => {
				const parent:Registry<RegisteredPointer> = createMock( {} );
				parent._addPointer( { "$id": "id" } );

				const registry:Registry<RegisteredPointer> = createMock( { registry: parent } );
				spyOnDecorated( registry, "_getLocalID" )
					.and.callFake( () => { throw new Error( "not local" ); } );

				const returned:boolean = registry.hasPointer( "id", true );
				expect( returned ).toBe( false );
			} );


			it( "should return false when in scope and not exists & not in parent & local flag is set", () => {
				const parent:Registry<RegisteredPointer> = createMock( {} );

				const registry:Registry<RegisteredPointer> = createMock( { registry: parent } );
				spyOnDecorated( registry, "_getLocalID" )
					.and.returnValue( "parent" );

				const returned:boolean = registry.hasPointer( "id", true );
				expect( returned ).toBe( false );
			} );

			it( "should return true when in scope and not exists & in parent", () => {
				const parent:Registry<RegisteredPointer> = createMock( {} );
				parent._addPointer( { "$id": "id" } );

				const registry:Registry<RegisteredPointer> = createMock( { registry: parent } );
				spyOnDecorated( registry, "_getLocalID" )
					.and.returnValue( "parent" );

				const returned:boolean = registry.hasPointer( "id" );
				expect( returned ).toBe( true );
			} );

			it( "should return true when in scope and exists & in parent", () => {
				const parent:Registry<RegisteredPointer> = createMock( {} );
				parent._addPointer( { "$id": "id" } );


				const registry:Registry<RegisteredPointer> = createMock( { registry: parent } );
				registry._addPointer( { "$id": "id" } );

				const returned:boolean = registry.hasPointer( "id" );
				expect( returned ).toBe( true );
			} );

			it( "should return false when in scope and not exists & not in parent & local flag is set", () => {
				const parent:Registry<RegisteredPointer> = createMock( {} );

				const registry:Registry<RegisteredPointer> = createMock( { registry: parent } );
				spyOnDecorated( registry, "_getLocalID" )
					.and.returnValue( "parent" );

				const returned:boolean = registry.hasPointer( "id", true );
				expect( returned ).toBe( false );
			} );

			it( "should return false when in scope and not exists & in parent & local flag is set", () => {
				const parent:Registry<RegisteredPointer> = createMock( {} );
				parent._addPointer( { "$id": "id" } );

				const registry:Registry<RegisteredPointer> = createMock( { registry: parent } );

				const returned:boolean = registry.hasPointer( "id", true );
				expect( returned ).toBe( false );
			} );

			it( "should return true when in scope and exists & in parent & local flag is set", () => {
				const parent:Registry<RegisteredPointer> = createMock( {} );
				parent._addPointer( { "$id": "id" } );


				const registry:Registry<RegisteredPointer> = createMock( { registry: parent } );
				registry._addPointer( { "$id": "id" } );

				const returned:boolean = registry.hasPointer( "id", true );
				expect( returned ).toBe( true );
			} );

		} );

		describe( "Registry.getPointer", () => {

			it( "should exist", () => {
				const registry:Registry<RegisteredPointer> = createMock( {} );

				expect( registry.getPointer ).toBeDefined();
				expect( registry.getPointer ).toEqual( jasmine.any( Function ) );
			} );


			type TargetResource = RegisteredPointer & { index?:string };

			it( "should throw error when not in scope & has no parent", () => {
				const registry:Registry<RegisteredPointer> = createMock( {} );

				spyOnDecorated( registry, "_getLocalID" )
					.and.callFake( () => { throw new Error( "not local" ); } );

				expect( () => registry.getPointer( "id" ) )
					.toThrowError( IllegalArgumentError, `"id" is out of scope.` );
			} );

			it( "should return new resource when in scope but not exists & has no parent", () => {
				const registry:Registry<RegisteredPointer> = createMock( {} );

				const returned:TargetResource = registry.getPointer( "id" );
				expect( returned ).toEqual( jasmine.objectContaining<TargetResource>( { $id: "id" } ) );
			} );

			it( "should return local resource when in scope and exists & has no parent", () => {
				const registry:Registry<RegisteredPointer> = createMock( {} );
				const localPointer:TargetResource = registry._addPointer( { $id: "id", index: "local" } );

				const returned:TargetResource = registry.getPointer( "id" );
				expect( returned ).toBe( localPointer );
			} );

			it( "should throw error when not in scope & has no parent & local flag is set", () => {
				const registry:Registry<RegisteredPointer> = createMock( {} );

				spyOnDecorated( registry, "_getLocalID" )
					.and.callFake( () => { throw new Error( "not local" ); } );

				expect( () => registry.getPointer( "id", true ) )
					.toThrowError( IllegalArgumentError, `"id" is out of scope.` );
			} );

			it( "should return new resource when in scope but not exists & has no parent & local flag is set ", () => {
				const registry:Registry<RegisteredPointer> = createMock( {} );

				const returned:TargetResource = registry.getPointer( "id", true );
				expect( returned ).toEqual( jasmine.objectContaining<TargetResource>( { $id: "id" } ) );
			} );

			it( "should return local resource when in scope and exists & has no parent & local flag is set ", () => {
				const registry:Registry<RegisteredPointer> = createMock( {} );
				const localPointer:TargetResource = registry._addPointer( { $id: "id", index: "local" } );

				const returned:TargetResource = registry.getPointer( "id", true );
				expect( returned ).toBe( localPointer );
			} );


			it( "should throw error when not in scope & not in parent", () => {
				const parent:Registry<RegisteredPointer> = createMock( {} );
				spyOnDecorated( parent, "_getLocalID" )
					.and.callFake( () => { throw new Error( "not parent" ); } );

				const registry:Registry<RegisteredPointer> = createMock( { registry: parent } );
				spyOnDecorated( registry, "_getLocalID" )
					.and.callFake( () => { throw new Error( "not local" ); } );

				expect( () => registry.getPointer( "id" ) )
					.toThrowError( IllegalArgumentError, `"id" is out of scope.` );
			} );

			it( "should return parent resource when not in scope & in parent", () => {
				const parent:Registry<RegisteredPointer> = createMock( {} );
				const parentPointer:TargetResource = parent._addPointer( { $id: "id", index: "parent" } );

				const registry:Registry<RegisteredPointer> = createMock( { registry: parent } );
				spyOnDecorated( registry, "_getLocalID" )
					.and.callFake( () => { throw new Error( "not local" ); } );

				const returned:TargetResource = registry.getPointer( "id" );
				expect( returned ).toBe( parentPointer );
			} );

			it( "should throw error when not in scope & not in parent & local flag is set", () => {
				const parent:Registry<RegisteredPointer> = createMock( {} );

				const registry:Registry<RegisteredPointer> = createMock( { registry: parent } );
				spyOnDecorated( registry, "_getLocalID" )
					.and.callFake( () => { throw new Error( "not local" ); } );

				expect( () => registry.getPointer( "id", true ) )
					.toThrowError( IllegalArgumentError, `"id" is out of scope.` );
			} );

			it( "should throw error when not in scope & in parent & local flag is set", () => {
				const parent:Registry<RegisteredPointer> = createMock( {} );
				parent._addPointer( { $id: "id", index: "parent" } );

				const registry:Registry<RegisteredPointer> = createMock( { registry: parent } );
				spyOnDecorated( registry, "_getLocalID" )
					.and.callFake( () => { throw new Error( "not local" ); } );

				expect( () => registry.getPointer( "id", true ) )
					.toThrowError( IllegalArgumentError, `"id" is out of scope.` );
			} );


			it( "should return new local resource when in scope and not exists & not in parent & local flag is set", () => {
				const parent:Registry<RegisteredPointer> = createMock( {} );

				const registry:Registry<RegisteredPointer> = createMock( { registry: parent } );

				const returned:TargetResource = registry.getPointer( "id", true );
				expect( returned ).toEqual( jasmine.objectContaining<TargetResource>( { $id: "id" } ) );
			} );

			it( "should return parent resource when in scope and not exists & in parent", () => {
				const parent:Registry<RegisteredPointer> = createMock( {} );
				const parentPointer:TargetResource = parent._addPointer( { $id: "id", index: "parent" } );

				const registry:Registry<RegisteredPointer> = createMock( { registry: parent } );

				const returned:TargetResource = registry.getPointer( "id" );
				expect( returned ).toBe( parentPointer );
			} );

			it( "should return local resource when in scope and exists & in parent", () => {
				const parent:Registry<RegisteredPointer> = createMock( {} );
				parent._addPointer( { $id: "id", index: "parent" } );

				const registry:Registry<RegisteredPointer> = createMock( { registry: parent } );
				const localPointer:TargetResource = registry._addPointer( { $id: "id", index: "local" } );

				const returned:TargetResource = registry.getPointer( "id" );
				expect( returned ).toBe( localPointer );
			} );

			it( "should return new resource in scope and not exists & not in parent & local flag is set", () => {
				const parent:Registry<RegisteredPointer> = createMock( {} );

				const registry:Registry<RegisteredPointer> = createMock( { registry: parent } );

				const returned:TargetResource = registry.getPointer( "id", true );
				expect( returned ).toEqual( jasmine.objectContaining<TargetResource>( { $id: "id" } ) );
			} );

			it( "should return new resource when in scope and not exists & in parent & local flag is set", () => {
				const parent:Registry<RegisteredPointer> = createMock( {} );
				const parentPointer:TargetResource = parent._addPointer( { $id: "id", index: "parent" } );

				const registry:Registry<RegisteredPointer> = createMock( { registry: parent } );

				const returned:TargetResource = registry.getPointer( "id", true );
				expect( returned ).toEqual( jasmine.objectContaining<TargetResource>( { $id: "id" } ) );
				expect( returned ).not.toBe( parentPointer );
			} );

			it( "should return local resource when in scope and exists & in parent & local flag is set", () => {
				const parent:Registry<RegisteredPointer> = createMock( {} );
				parent._addPointer( { $id: "id", index: "parent" } );

				const registry:Registry<RegisteredPointer> = createMock( { registry: parent } );
				const localPointer:RegisteredPointer = registry._addPointer( { $id: "id", index: "local" } );

				const returned:RegisteredPointer = registry.getPointer( "id", true );
				expect( returned ).toBe( localPointer );
			} );

		} );

		describe( "Registry.getPointers", () => {

			it( "should exist", () => {
				const registry:Registry<RegisteredPointer> = createMock( {} );

				expect( registry.getPointers ).toBeDefined();
				expect( registry.getPointers ).toEqual( jasmine.any( Function ) );
			} );


			it( "should return local resources when locals & has no parent", () => {
				const registry:Registry<RegisteredPointer> = createMock( {} );

				const localPointer1:RegisteredPointer = registry._addPointer( { $id: "in local 1", index: "local 1" } );
				const localPointer2:RegisteredPointer = registry._addPointer( { $id: "in local 2", index: "local 2" } );

				const returned:RegisteredPointer[] = registry.getPointers();
				expect( returned.length ).toBe( 2 );
				expect( returned ).toContain( localPointer1 );
				expect( returned ).toContain( localPointer2 );
			} );

			it( "should return empty resources no locals & has no parent & local flag is set ", () => {
				const registry:Registry<RegisteredPointer> = createMock( {} );

				const returned:RegisteredPointer[] = registry.getPointers( true );
				expect( returned ).toEqual( [] );
			} );

			it( "should return local resources when locals & has no parent & local flag is set ", () => {
				const registry:Registry<RegisteredPointer> = createMock( {} );

				const localPointer1:RegisteredPointer = registry._addPointer( { $id: "in local 1", index: "local 1" } );
				const localPointer2:RegisteredPointer = registry._addPointer( { $id: "in local 2", index: "local 2" } );

				const returned:RegisteredPointer[] = registry.getPointers( true );
				expect( returned.length ).toBe( 2 );
				expect( returned ).toContain( localPointer1 );
				expect( returned ).toContain( localPointer2 );
			} );


			it( "should return parent resources when no locals & in parent", () => {
				const parent:Registry<RegisteredPointer> = createMock( {} );
				const parentPointer:RegisteredPointer = parent._addPointer( { $id: "in parent", index: "parent" } );

				const registry:Registry<RegisteredPointer> = createMock( { registry: parent } );

				const returned:RegisteredPointer[] = registry.getPointers();
				expect( returned.length ).toBe( 1 );
				expect( returned ).toContain( parentPointer );
			} );

			it( "should return empty when no locals & not in parent & local flag is set", () => {
				const parent:Registry<RegisteredPointer> = createMock( {} );

				const registry:Registry<RegisteredPointer> = createMock( { registry: parent } );

				const returned:RegisteredPointer[] = registry.getPointers( true );
				expect( returned.length ).toBe( 0 );
			} );

			it( "should return empty when no locals & in parent & local flag is set", () => {
				const parent:Registry<RegisteredPointer> = createMock( {} );
				const parentPointer:RegisteredPointer = parent._addPointer( { $id: "in parent", index: "parent" } );

				const registry:Registry<RegisteredPointer> = createMock( { registry: parent } );

				const returned:RegisteredPointer[] = registry.getPointers( true );
				expect( returned.length ).toBe( 0 );
				expect( returned ).not.toContain( parentPointer );
			} );


			it( "should return local and parent resources when locals & in parent", () => {
				const parent:Registry<RegisteredPointer> = createMock( {} );
				const parentPointer:RegisteredPointer = parent._addPointer( { $id: "in parent", index: "parent" } );

				const registry:Registry<RegisteredPointer> = createMock( { registry: parent } );
				const localPointer:RegisteredPointer = registry._addPointer( { $id: "the resource", index: "local" } );

				const returned:RegisteredPointer[] = registry.getPointers();
				expect( returned.length ).toBe( 2 );
				expect( returned ).toContain( parentPointer );
				expect( returned ).toContain( localPointer );
			} );

			it( "should return empty resources when no locals & not in parent & local flag is set", () => {
				const parent:Registry<RegisteredPointer> = createMock( {} );

				const registry:Registry<RegisteredPointer> = createMock( { registry: parent } );

				const returned:RegisteredPointer[] = registry.getPointers( true );
				expect( returned.length ).toBe( 0 );
			} );

			it( "should return empty resources when no locals & in parent & local flag is set", () => {
				const parent:Registry<RegisteredPointer> = createMock( {} );
				const parentPointer:RegisteredPointer = parent._addPointer( { $id: "in parent", index: "parent" } );

				const registry:Registry<RegisteredPointer> = createMock( { registry: parent } );

				const returned:RegisteredPointer[] = registry.getPointers( true );
				expect( returned.length ).toBe( 0 );
				expect( returned ).not.toContain( parentPointer );
			} );

			it( "should return local resources when locals & in parent & local flag is set", () => {
				const parent:Registry<RegisteredPointer> = createMock( {} );
				const parentPointer:RegisteredPointer = parent._addPointer( { $id: "in parent", index: "parent" } );

				const registry:Registry<RegisteredPointer> = createMock( { registry: parent } );
				const localPointer:RegisteredPointer = registry._addPointer( { $id: "the resource", index: "local" } );

				const returned:RegisteredPointer[] = registry.getPointers( true );
				expect( returned.length ).toBe( 1 );
				expect( returned ).toContain( localPointer );
				expect( returned ).not.toContain( parentPointer );
			} );

		} );

		describe( "Registry.removePointer", () => {

			it( "should exist", () => {
				const registry:Registry<RegisteredPointer> = createMock( {} );

				expect( registry.removePointer ).toBeDefined();
				expect( registry.removePointer ).toEqual( jasmine.any( Function ) );
			} );


			it( "should return false when not in scope & has no parent", () => {
				const registry:Registry<RegisteredPointer> = createMock( {} );

				spyOnDecorated( registry, "_getLocalID" )
					.and.callFake( () => { throw new Error( "not local" ); } );

				const returned:boolean = registry.removePointer( "id" );
				expect( returned ).toBe( false );
			} );

			it( "should return false when in scope but not exists & has no parent", () => {
				const registry:Registry<RegisteredPointer> = createMock( {} );

				const returned:boolean = registry.removePointer( "id" );
				expect( returned ).toBe( false );
			} );

			it( "should return true when in scope and exists & has no parent", () => {
				const registry:Registry<RegisteredPointer> = createMock( {} );
				registry._addPointer( { "$id": "id" } );

				const returned:boolean = registry.removePointer( "id" );
				expect( returned ).toBe( true );

				expect( registry.__resourcesMap ).toEqual( new Map() );
			} );

			it( "should return false when not in scope & has no parent & local flag is set", () => {
				const registry:Registry<RegisteredPointer> = createMock( {} );

				spyOnDecorated( registry, "_getLocalID" )
					.and.callFake( () => { throw new Error( "not local" ); } );

				const returned:boolean = registry.removePointer( "id", true );
				expect( returned ).toBe( false );
			} );

			it( "should return false when in scope but not exists & has no parent & local flag is set ", () => {
				const registry:Registry<RegisteredPointer> = createMock( {} );

				const returned:boolean = registry.removePointer( "id", true );
				expect( returned ).toBe( false );
			} );

			it( "should return true when in scope and exists & has no parent & local flag is set ", () => {
				const registry:Registry<RegisteredPointer> = createMock( {} );
				registry._addPointer( { "$id": "id" } );

				const returned:boolean = registry.removePointer( "id", true );
				expect( returned ).toBe( true );

				expect( registry.__resourcesMap ).toEqual( new Map() );
			} );


			it( "should return false when not in scope & not in parent", () => {
				const parent:Registry<RegisteredPointer> = createMock( {} );

				const registry:Registry<RegisteredPointer> = createMock( { registry: parent } );
				spyOnDecorated( registry, "_getLocalID" )
					.and.callFake( () => { throw new Error( "not local" ); } );

				const returned:boolean = registry.removePointer( "id" );
				expect( returned ).toBe( false );
			} );

			it( "should return true when not in scope & in parent", () => {
				const parent:Registry<RegisteredPointer> = createMock( {} );
				parent._addPointer( { "$id": "id" } );

				const registry:Registry<RegisteredPointer> = createMock( { registry: parent } );
				spyOnDecorated( registry, "_getLocalID" )
					.and.callFake( () => { throw new Error( "not local" ); } );

				const returned:boolean = registry.removePointer( "id" );
				expect( returned ).toBe( true );
			} );

			it( "should return false when not in scope & not in parent & local flag is set", () => {
				const parent:Registry<RegisteredPointer> = createMock( {} );

				const registry:Registry<RegisteredPointer> = createMock( { registry: parent } );
				spyOnDecorated( registry, "_getLocalID" )
					.and.callFake( () => { throw new Error( "not local" ); } );

				const returned:boolean = registry.removePointer( "id", true );
				expect( returned ).toBe( false );
			} );

			it( "should return false when not in scope & in parent & local flag is set", () => {
				const parent:Registry<RegisteredPointer> = createMock( {} );
				parent._addPointer( { "$id": "id" } );

				const registry:Registry<RegisteredPointer> = createMock( { registry: parent } );
				spyOnDecorated( registry, "_getLocalID" )
					.and.callFake( () => { throw new Error( "not local" ); } );

				const returned:boolean = registry.removePointer( "id", true );
				expect( returned ).toBe( false );
			} );


			it( "should return false when in scope and not exists & not in parent & local flag is set", () => {
				const parent:Registry<RegisteredPointer> = createMock( {} );

				const registry:Registry<RegisteredPointer> = createMock( { registry: parent } );

				const returned:boolean = registry.removePointer( "id", true );
				expect( returned ).toBe( false );
			} );

			it( "should return true when in scope and not exists & in parent", () => {
				const parent:Registry<RegisteredPointer> = createMock( {} );
				parent._addPointer( { "$id": "id" } );

				const registry:Registry<RegisteredPointer> = createMock( { registry: parent } );

				const returned:boolean = registry.removePointer( "id" );
				expect( returned ).toBe( true );
			} );

			it( "should return true when in scope and exists & in parent", () => {
				const parent:Registry<RegisteredPointer> = createMock( {} );
				parent._addPointer( { "$id": "id" } );

				const registry:Registry<RegisteredPointer> = createMock( { registry: parent } );
				registry._addPointer( { "$id": "id" } );

				const returned:boolean = registry.removePointer( "id" );
				expect( returned ).toBe( true );

				expect( registry.__resourcesMap ).toEqual( new Map() );
			} );

			it( "should return false when in scope and not exists & not in parent & local flag is set", () => {
				const parent:Registry<RegisteredPointer> = createMock( {} );

				const registry:Registry<RegisteredPointer> = createMock( { registry: parent } );

				const returned:boolean = registry.removePointer( "id", true );
				expect( returned ).toBe( false );
			} );

			it( "should return false when in scope and not exists & in parent & local flag is set", () => {
				const parent:Registry<RegisteredPointer> = createMock( {} );
				parent._addPointer( { "$id": "id" } );

				const registry:Registry<RegisteredPointer> = createMock( { registry: parent } );

				const returned:boolean = registry.removePointer( "id", true );
				expect( returned ).toBe( false );
			} );

			it( "should return true when in scope and exists & in parent & local flag is set", () => {
				const parent:Registry<RegisteredPointer> = createMock( {} );
				parent._addPointer( { "$id": "id" } );

				const registry:Registry<RegisteredPointer> = createMock( { registry: parent } );
				registry._addPointer( { "$id": "id" } );

				const returned:boolean = registry.removePointer( "id", true );
				expect( returned ).toBe( true );

				expect( registry.__resourcesMap ).toEqual( new Map() );
			} );

		} );

	} );

	describe( "[[factory]]", () => {

		describe( "Registry.isDecorated", () => {

			it( "should exist", () => {
				expect( Registry.isDecorated ).toBeDefined();
				expect( Registry.isDecorated ).toEqual( jasmine.any( Function ) );
			} );


			it( "should call ModelDecorator.hasPropertiesFrom with the PROTOTYPE when $BASE", () => {
				const spy:jasmine.Spy = spyOn( ModelDecorator, "hasPropertiesFrom" );

				Registry.isDecorated( { $id: "", the: "object" } );

				expect( spy ).toHaveBeenCalledWith( Registry.PROTOTYPE, { $id: "", the: "object" } );
			} );


			it( "should call ModelDecorator.hasPropertiesFrom with the PROTOTYPE when BASE", () => {
				const spy:jasmine.Spy = spyOn( ModelDecorator, "hasPropertiesFrom" );

				Registry.isDecorated( { the: "object" } );

				expect( spy ).toHaveBeenCalledWith( Registry.PROTOTYPE, { the: "object" } );
			} );

		} );

		describe( "Registry.decorate", () => {

			it( "should exist", () => {
				expect( Registry.decorate ).toBeDefined();
				expect( Registry.decorate ).toEqual( jasmine.any( Function ) );
			} );


			it( "should call ModelDecorator.definePropertiesFrom with PROTOTYPE when $BASE", () => {
				const spy:jasmine.Spy = spyOn( ModelDecorator, "definePropertiesFrom" )
					.and.callThrough();

				Registry.decorate( { $id: "", $__modelDecorator: RegisteredPointer, the: "object" } );

				expect( spy ).toHaveBeenCalledWith( Registry.PROTOTYPE, { the: "object" } );
			} );

			it( "should call decorate Pointer when $BASE", () => {
				const spy:jasmine.Spy = spyOn( Pointer, "decorate" )
					.and.callThrough();

				Registry.decorate( { $id: "", $__modelDecorator: RegisteredPointer, the: "object" } );

				expect( spy ).toHaveBeenCalledWith( { the: "object" } );
			} );


			it( "should call ModelDecorator.definePropertiesFrom with PROTOTYPE when BASE", () => {
				const spy:jasmine.Spy = spyOn( ModelDecorator, "definePropertiesFrom" )
					.and.callThrough();

				Registry.decorate( { __modelDecorator: RegisteredPointer, the: "object" } );

				expect( spy ).toHaveBeenCalledWith( Registry.PROTOTYPE, { the: "object" } );
			} );


			it( "should no call ModelDecorator.definePropertiesFrom when already decorated", () => {
				spyOn( Registry, "isDecorated" )
					.and.returnValue( true );

				const spy:jasmine.Spy = spyOn( ModelDecorator, "definePropertiesFrom" );
				Registry.decorate( { __modelDecorator: RegisteredPointer } );

				expect( spy ).not.toHaveBeenCalled();
			} );

		} );

	} );

} );


function create$Mock<T extends object>( data:T & Partial<$Registry<RegisteredPointer>> ):T & $Registry<RegisteredPointer> {
	return Registry.decorate( Object.assign( {
		$id: "",
		$__modelDecorator: RegisteredPointer,
		$_getLocalID: id => id,
	}, data ) );
}

describe( "$Registry", () => {

	describe( "[[interface impl]]", () => {


		describe( "$Registry.$_getLocalID", () => {


			it( "should exist", () => {
				const registry:$Registry<RegisteredPointer> = create$Mock( {} );

				expect( registry.$_getLocalID ).toBeDefined();
				expect( registry.$_getLocalID ).toEqual( jasmine.any( Function ) );
			} );


			it( "should return same id", () => {
				const registry:$Registry<RegisteredPointer> = create$Mock( {} );

				expect( registry.$_getLocalID( "" ) ).toBe( "" );
				expect( registry.$_getLocalID( "resource/" ) ).toBe( "resource/" );
			} );

		} );

		describe( "$Registry.$_addPointer", () => {

			it( "should exist", () => {
				const registry:$Registry<RegisteredPointer> = create$Mock( {} );

				expect( registry.$_addPointer ).toBeDefined();
				expect( registry.$_addPointer ).toEqual( jasmine.any( Function ) );
			} );


			it( "should throw error if no ID in the base object", () => {
				const registry:$Registry<RegisteredPointer> = create$Mock( {} );

				expect( () => {
					registry.$_addPointer( {} as any );
				} ).toThrowError( IllegalArgumentError, "The pointer $id cannot be empty." );
			} );

			it( "should throw error when ID out of scope", () => {
				const registry:$Registry<RegisteredPointer> = create$Mock( {} );
				spyOnDecorated( registry, "$_getLocalID" )
					.and.callFake( () => { throw new IllegalArgumentError( `"id" is out of scope.` ); } );

				expect( () => {
					registry.$_addPointer( { $id: "id" } );
				} ).toThrowError( IllegalArgumentError, `"id" is out of scope.` );
			} );

			it( "should return the given resource even though the ID is already in use", () => {
				const registry:$Registry<RegisteredPointer> = create$Mock( {} );
				registry.$__resourcesMap.set( "id", RegisteredPointer.create( { $registry: registry } ) );

				expect(
					registry.$_addPointer( { $id: "id" } )
				).toEqual( registry.$__resourcesMap.get( "id" )! );
			} );

			it( "should return the same object reference", () => {
				const registry:$Registry<RegisteredPointer> = create$Mock( {} );

				const object:{ $id:string } = { $id: "id" };
				const returned:RegisteredPointer = registry.$_addPointer( object );

				expect( object ).toBe( returned );
			} );

			it( "should return the resource type", () => {
				const registry:$Registry<RegisteredPointer> = create$Mock( {} );

				const returned:RegisteredPointer = registry.$_addPointer( { $id: "id" } );
				expect( returned ).toEqual( anyThatMatches( RegisteredPointer.is, "isPointer" ) );
			} );

			it( "should assign resource.$registry as itself", () => {
				const registry:$Registry<RegisteredPointer> = create$Mock( {} );

				const returned:RegisteredPointer = registry.$_addPointer( { $id: "id" } );
				expect( returned.$registry ).toBe( registry );
			} );

			it( "should store resource in the _resourcesMap", () => {
				const registry:$Registry<RegisteredPointer> = create$Mock( {} );

				const returned:RegisteredPointer = registry.$_addPointer( { $id: "id" } );

				expect( registry.$__resourcesMap ).toEqual( new Map( [
					[ "id", returned ],
				] ) );
			} );

		} );


		describe( "$Registry.$inScope", () => {

			it( "should exist", () => {
				const registry:$Registry<RegisteredPointer> = create$Mock( {} );

				expect( registry.$inScope ).toBeDefined();
				expect( registry.$inScope ).toEqual( jasmine.any( Function ) );
			} );


			it( "should call _getLocalID when string", () => {
				const registry:$Registry<RegisteredPointer> = create$Mock( {} );
				const spy:jasmine.Spy = spyOnDecorated( registry, "$_getLocalID" )
					.and.callThrough();

				registry.$inScope( "id" );
				expect( spy ).toHaveBeenCalledWith( "id" );
			} );

			it( "should call _getLocalID when RegisteredPointer", () => {
				const registry:$Registry<RegisteredPointer> = create$Mock( {} );
				const spy:jasmine.Spy = spyOnDecorated( registry, "$_getLocalID" )
					.and.callThrough();

				registry.$inScope( RegisteredPointer.create( { $registry: registry, $id: "id" } ) );
				expect( spy ).toHaveBeenCalledWith( "id" );
			} );


			it( "should return true if string can be converted to local", () => {
				const registry:$Registry<RegisteredPointer> = create$Mock( {} );

				const returned:boolean = registry.$inScope( "id" );
				expect( returned ).toBe( true );

			} );

			it( "should return true if RegisteredPointer.$id can be converted to local", () => {
				const registry:$Registry<RegisteredPointer> = create$Mock( {} );

				const returned:boolean = registry.$inScope( RegisteredPointer.create( { $registry: registry, $id: "id" } ) );
				expect( returned ).toBe( true );
			} );

			it( "should return true if string can be converted by parent registry", () => {
				const parent:$Registry<RegisteredPointer> = create$Mock( {} );

				const registry:$Registry<RegisteredPointer> = create$Mock( { $registry: parent } );
				spyOnDecorated( registry, "$_getLocalID" )
					.and.throwError( "no local" );

				const returned:boolean = registry.$inScope( "id" );
				expect( returned ).toBe( true );
			} );

			it( "should return true if RegisteredPointer.$id can be converted by parent registry", () => {
				const parent:$Registry<RegisteredPointer> = create$Mock( {} );

				const registry:$Registry<RegisteredPointer> = create$Mock( { $registry: parent } );
				spyOnDecorated( registry, "$_getLocalID" )
					.and.throwError( "no local" );


				const returned:boolean = registry.$inScope( RegisteredPointer.create( { $registry: registry, $id: "id" } ) );
				expect( returned ).toBe( true );
			} );


			it( "should return false if string can't be converted & has no parent", () => {
				const registry:$Registry<RegisteredPointer> = create$Mock( {} );

				spyOnDecorated( registry, "$_getLocalID" )
					.and.throwError( "no local" );

				const returned:boolean = registry.$inScope( "id" );
				expect( returned ).toBe( false );
			} );

			it( "should return false if RegisteredPointer.$id can't be converted & has no parent", () => {
				const registry:$Registry<RegisteredPointer> = create$Mock( {} );

				spyOnDecorated( registry, "$_getLocalID" )
					.and.throwError( "no local" );

				const returned:boolean = registry.$inScope( RegisteredPointer.create( { $registry: registry, $id: "id" } ) );
				expect( returned ).toBe( false );
			} );

			it( "should return false if string can't be converted by parent", () => {
				const parent:$Registry<RegisteredPointer> = create$Mock( {} );
				spyOnDecorated( parent, "$_getLocalID" )
					.and.throwError( "no local" );

				const registry:$Registry<RegisteredPointer> = create$Mock( { $registry: parent } );
				spyOnDecorated( registry, "$_getLocalID" )
					.and.throwError( "no local" );

				const returned:boolean = registry.$inScope( "id" );
				expect( returned ).toBe( false );
			} );

			it( "should return false if RegisteredPointer.$id can't be converted by parent", () => {
				const parent:$Registry<RegisteredPointer> = create$Mock( {} );
				spyOnDecorated( parent, "$_getLocalID" )
					.and.throwError( "no local" );

				const registry:$Registry<RegisteredPointer> = create$Mock( { $registry: parent } );
				spyOnDecorated( registry, "$_getLocalID" )
					.and.throwError( "no local" );

				const returned:boolean = registry.$inScope( RegisteredPointer.create( { $registry: registry, $id: "id" } ) );
				expect( returned ).toBe( false );
			} );

			it( "should return false if string can be converted by parent registry but local flag set", () => {
				const parent:$Registry<RegisteredPointer> = create$Mock( {} );

				const registry:$Registry<RegisteredPointer> = create$Mock( { $registry: parent } );
				spyOnDecorated( registry, "$_getLocalID" )
					.and.throwError( "no local" );

				const returned:boolean = registry.$inScope( "id", true );
				expect( returned ).toBe( false );
			} );

			it( "should return false if RegisteredPointer.$id can be converted by parent registry but local flag set", () => {
				const parent:$Registry<RegisteredPointer> = create$Mock( {} );

				const registry:$Registry<RegisteredPointer> = create$Mock( { $registry: parent } );
				spyOnDecorated( registry, "$_getLocalID" )
					.and.throwError( "no local" );

				const returned:boolean = registry.$inScope( RegisteredPointer.create( { $registry: registry, $id: "id" } ), true );
				expect( returned ).toBe( false );
			} );

		} );


		describe( "$Registry.$hasPointer", () => {

			it( "should exist", () => {
				const registry:$Registry<RegisteredPointer> = create$Mock( {} );

				expect( registry.$hasPointer ).toBeDefined();
				expect( registry.$hasPointer ).toEqual( jasmine.any( Function ) );
			} );


			it( "should return false when not in scope & has no parent", () => {
				const registry:$Registry<RegisteredPointer> = create$Mock( {} );

				spyOnDecorated( registry, "$_getLocalID" )
					.and.callFake( () => { throw new Error( "not local" ); } );

				const returned:boolean = registry.$hasPointer( "id" );
				expect( returned ).toBe( false );
			} );

			it( "should return false when in scope but not exists & has no parent", () => {
				const registry:$Registry<RegisteredPointer> = create$Mock( {} );

				spyOnDecorated( registry, "$_getLocalID" )
					.and.returnValue( "local" );

				const returned:boolean = registry.$hasPointer( "id" );
				expect( returned ).toBe( false );
			} );

			it( "should return true when in scope and exists & has no parent", () => {
				const registry:$Registry<RegisteredPointer> = create$Mock( {} );
				registry.$_addPointer( { "$id": "id" } );

				const returned:boolean = registry.$hasPointer( "id" );
				expect( returned ).toBe( true );
			} );

			it( "should return false when not in scope & has no parent & local flag is set", () => {
				const registry:$Registry<RegisteredPointer> = create$Mock( {} );

				spyOnDecorated( registry, "$_getLocalID" )
					.and.callFake( () => { throw new Error( "not local" ); } );

				const returned:boolean = registry.$hasPointer( "id", true );
				expect( returned ).toBe( false );
			} );

			it( "should return false when in scope but not exists & has no parent & local flag is set ", () => {
				const registry:$Registry<RegisteredPointer> = create$Mock( {} );

				const returned:boolean = registry.$hasPointer( "id", true );
				expect( returned ).toBe( false );
			} );

			it( "should return true when in scope and exists & has no parent & local flag is set ", () => {
				const registry:$Registry<RegisteredPointer> = create$Mock( {} );
				registry.$_addPointer( { "$id": "id" } );

				const returned:boolean = registry.$hasPointer( "id", true );
				expect( returned ).toBe( true );
			} );


			it( "should return false when not in scope & not in parent", () => {
				const parent:$Registry<RegisteredPointer> = create$Mock( {} );

				const registry:$Registry<RegisteredPointer> = create$Mock( { $registry: parent } );
				spyOnDecorated( registry, "$_getLocalID" )
					.and.callFake( () => { throw new Error( "not local" ); } );

				const returned:boolean = registry.$hasPointer( "id" );
				expect( returned ).toBe( false );
			} );

			it( "should return true when not in scope & in parent", () => {
				const parent:$Registry<RegisteredPointer> = create$Mock( {} );
				parent.$_addPointer( { "$id": "id" } );

				const registry:$Registry<RegisteredPointer> = create$Mock( { $registry: parent } );
				spyOnDecorated( registry, "$_getLocalID" )
					.and.callFake( () => { throw new Error( "not local" ); } );

				const returned:boolean = registry.$hasPointer( "id" );
				expect( returned ).toBe( true );
			} );

			it( "should return false when not in scope & not in parent & local flag is set", () => {
				const parent:$Registry<RegisteredPointer> = create$Mock( {} );

				const registry:$Registry<RegisteredPointer> = create$Mock( { $registry: parent } );
				spyOnDecorated( registry, "$_getLocalID" )
					.and.callFake( () => { throw new Error( "not local" ); } );

				const returned:boolean = registry.$hasPointer( "id", true );
				expect( returned ).toBe( false );
			} );

			it( "should return false when not in scope & in parent & local flag is set", () => {
				const parent:$Registry<RegisteredPointer> = create$Mock( {} );
				parent.$_addPointer( { "$id": "id" } );

				const registry:$Registry<RegisteredPointer> = create$Mock( { $registry: parent } );
				spyOnDecorated( registry, "$_getLocalID" )
					.and.callFake( () => { throw new Error( "not local" ); } );

				const returned:boolean = registry.$hasPointer( "id", true );
				expect( returned ).toBe( false );
			} );


			it( "should return false when in scope and not exists & not in parent & local flag is set", () => {
				const parent:$Registry<RegisteredPointer> = create$Mock( {} );

				const registry:$Registry<RegisteredPointer> = create$Mock( { $registry: parent } );
				spyOnDecorated( registry, "$_getLocalID" )
					.and.returnValue( "parent" );

				const returned:boolean = registry.$hasPointer( "id", true );
				expect( returned ).toBe( false );
			} );

			it( "should return true when in scope and not exists & in parent", () => {
				const parent:$Registry<RegisteredPointer> = create$Mock( {} );
				parent.$_addPointer( { "$id": "id" } );

				const registry:$Registry<RegisteredPointer> = create$Mock( { $registry: parent } );
				spyOnDecorated( registry, "$_getLocalID" )
					.and.returnValue( "parent" );

				const returned:boolean = registry.$hasPointer( "id" );
				expect( returned ).toBe( true );
			} );

			it( "should return true when in scope and exists & in parent", () => {
				const parent:$Registry<RegisteredPointer> = create$Mock( {} );
				parent.$_addPointer( { "$id": "id" } );


				const registry:$Registry<RegisteredPointer> = create$Mock( { $registry: parent } );
				registry.$_addPointer( { "$id": "id" } );

				const returned:boolean = registry.$hasPointer( "id" );
				expect( returned ).toBe( true );
			} );

			it( "should return false when in scope and not exists & not in parent & local flag is set", () => {
				const parent:$Registry<RegisteredPointer> = create$Mock( {} );

				const registry:$Registry<RegisteredPointer> = create$Mock( { $registry: parent } );
				spyOnDecorated( registry, "$_getLocalID" )
					.and.returnValue( "parent" );

				const returned:boolean = registry.$hasPointer( "id", true );
				expect( returned ).toBe( false );
			} );

			it( "should return false when in scope and not exists & in parent & local flag is set", () => {
				const parent:$Registry<RegisteredPointer> = create$Mock( {} );
				parent.$_addPointer( { "$id": "id" } );

				const registry:$Registry<RegisteredPointer> = create$Mock( { $registry: parent } );

				const returned:boolean = registry.$hasPointer( "id", true );
				expect( returned ).toBe( false );
			} );

			it( "should return true when in scope and exists & in parent & local flag is set", () => {
				const parent:$Registry<RegisteredPointer> = create$Mock( {} );
				parent.$_addPointer( { "$id": "id" } );


				const registry:$Registry<RegisteredPointer> = create$Mock( { $registry: parent } );
				registry.$_addPointer( { "$id": "id" } );

				const returned:boolean = registry.$hasPointer( "id", true );
				expect( returned ).toBe( true );
			} );

		} );

		describe( "$Registry.$getPointer", () => {

			it( "should exist", () => {
				const registry:$Registry<RegisteredPointer> = create$Mock( {} );

				expect( registry.$getPointer ).toBeDefined();
				expect( registry.$getPointer ).toEqual( jasmine.any( Function ) );
			} );


			type TargetResource = RegisteredPointer & { index?:string };

			it( "should throw error when not in scope & has no parent", () => {
				const registry:$Registry<RegisteredPointer> = create$Mock( {} );

				spyOnDecorated( registry, "$_getLocalID" )
					.and.callFake( () => { throw new Error( "not local" ); } );

				expect( () => registry.$getPointer( "id" ) )
					.toThrowError( IllegalArgumentError, `"id" is out of scope.` );
			} );

			it( "should return new resource when in scope but not exists & has no parent", () => {
				const registry:$Registry<RegisteredPointer> = create$Mock( {} );

				const returned:TargetResource = registry.$getPointer( "id" );
				expect( returned ).toEqual( jasmine.objectContaining<TargetResource>( { $id: "id" } ) );
			} );

			it( "should return local resource when in scope and exists & has no parent", () => {
				const registry:$Registry<RegisteredPointer> = create$Mock( {} );
				const localPointer:TargetResource = registry.$_addPointer( { $id: "id", index: "local" } );

				const returned:TargetResource = registry.$getPointer( "id" );
				expect( returned ).toBe( localPointer );
			} );

			it( "should throw error when not in scope & has no parent & local flag is set", () => {
				const registry:$Registry<RegisteredPointer> = create$Mock( {} );

				spyOnDecorated( registry, "$_getLocalID" )
					.and.callFake( () => { throw new Error( "not local" ); } );

				expect( () => registry.$getPointer( "id", true ) )
					.toThrowError( IllegalArgumentError, `"id" is out of scope.` );
			} );

			it( "should return new resource when in scope but not exists & has no parent & local flag is set ", () => {
				const registry:$Registry<RegisteredPointer> = create$Mock( {} );

				const returned:TargetResource = registry.$getPointer( "id", true );
				expect( returned ).toEqual( jasmine.objectContaining<TargetResource>( { $id: "id" } ) );
			} );

			it( "should return local resource when in scope and exists & has no parent & local flag is set ", () => {
				const registry:$Registry<RegisteredPointer> = create$Mock( {} );
				const localPointer:TargetResource = registry.$_addPointer( { $id: "id", index: "local" } );

				const returned:TargetResource = registry.$getPointer( "id", true );
				expect( returned ).toBe( localPointer );
			} );


			it( "should throw error when not in scope & not in parent", () => {
				const parent:$Registry<RegisteredPointer> = create$Mock( {} );
				spyOnDecorated( parent, "$_getLocalID" )
					.and.callFake( () => { throw new Error( "not parent" ); } );

				const registry:$Registry<RegisteredPointer> = create$Mock( { $registry: parent } );
				spyOnDecorated( registry, "$_getLocalID" )
					.and.callFake( () => { throw new Error( "not local" ); } );

				expect( () => registry.$getPointer( "id" ) )
					.toThrowError( IllegalArgumentError, `"id" is out of scope.` );
			} );

			it( "should return parent resource when not in scope & in parent", () => {
				const parent:$Registry<RegisteredPointer> = create$Mock( {} );
				const parentPointer:TargetResource = parent.$_addPointer( { $id: "id", index: "parent" } );

				const registry:$Registry<RegisteredPointer> = create$Mock( { $registry: parent } );
				spyOnDecorated( registry, "$_getLocalID" )
					.and.callFake( () => { throw new Error( "not local" ); } );

				const returned:TargetResource = registry.$getPointer( "id" );
				expect( returned ).toBe( parentPointer );
			} );

			it( "should throw error when not in scope & not in parent & local flag is set", () => {
				const parent:$Registry<RegisteredPointer> = create$Mock( {} );

				const registry:$Registry<RegisteredPointer> = create$Mock( { $registry: parent } );
				spyOnDecorated( registry, "$_getLocalID" )
					.and.callFake( () => { throw new Error( "not local" ); } );

				expect( () => registry.$getPointer( "id", true ) )
					.toThrowError( IllegalArgumentError, `"id" is out of scope.` );
			} );

			it( "should throw error when not in scope & in parent & local flag is set", () => {
				const parent:$Registry<RegisteredPointer> = create$Mock( {} );
				parent.$_addPointer( { $id: "id", index: "parent" } );

				const registry:$Registry<RegisteredPointer> = create$Mock( { $registry: parent } );
				spyOnDecorated( registry, "$_getLocalID" )
					.and.callFake( () => { throw new Error( "not local" ); } );

				expect( () => registry.$getPointer( "id", true ) )
					.toThrowError( IllegalArgumentError, `"id" is out of scope.` );
			} );


			it( "should return new local resource when in scope and not exists & not in parent & local flag is set", () => {
				const parent:$Registry<RegisteredPointer> = create$Mock( {} );

				const registry:$Registry<RegisteredPointer> = create$Mock( { $registry: parent } );

				const returned:TargetResource = registry.$getPointer( "id", true );
				expect( returned ).toEqual( jasmine.objectContaining<TargetResource>( { $id: "id" } ) );
			} );

			it( "should return parent resource when in scope and not exists & in parent", () => {
				const parent:$Registry<RegisteredPointer> = create$Mock( {} );
				const parentPointer:TargetResource = parent.$_addPointer( { $id: "id", index: "parent" } );

				const registry:$Registry<RegisteredPointer> = create$Mock( { $registry: parent } );

				const returned:TargetResource = registry.$getPointer( "id" );
				expect( returned ).toBe( parentPointer );
			} );

			it( "should return local resource when in scope and exists & in parent", () => {
				const parent:$Registry<RegisteredPointer> = create$Mock( {} );
				parent.$_addPointer( { $id: "id", index: "parent" } );

				const registry:$Registry<RegisteredPointer> = create$Mock( { $registry: parent } );
				const localPointer:TargetResource = registry.$_addPointer( { $id: "id", index: "local" } );

				const returned:TargetResource = registry.$getPointer( "id" );
				expect( returned ).toBe( localPointer );
			} );

			it( "should return new resource in scope and not exists & not in parent & local flag is set", () => {
				const parent:$Registry<RegisteredPointer> = create$Mock( {} );

				const registry:$Registry<RegisteredPointer> = create$Mock( { $registry: parent } );

				const returned:TargetResource = registry.$getPointer( "id", true );
				expect( returned ).toEqual( jasmine.objectContaining<TargetResource>( { $id: "id" } ) );
			} );

			it( "should return new resource when in scope and not exists & in parent & local flag is set", () => {
				const parent:$Registry<RegisteredPointer> = create$Mock( {} );
				const parentPointer:TargetResource = parent.$_addPointer( { $id: "id", index: "parent" } );

				const registry:$Registry<RegisteredPointer> = create$Mock( { $registry: parent } );

				const returned:TargetResource = registry.$getPointer( "id", true );
				expect( returned ).toEqual( jasmine.objectContaining<TargetResource>( { $id: "id" } ) );
				expect( returned ).not.toBe( parentPointer );
			} );

			it( "should return local resource when in scope and exists & in parent & local flag is set", () => {
				const parent:$Registry<RegisteredPointer> = create$Mock( {} );
				parent.$_addPointer( { $id: "id", index: "parent" } );

				const registry:$Registry<RegisteredPointer> = create$Mock( { $registry: parent } );
				const localPointer:RegisteredPointer = registry.$_addPointer( { $id: "id", index: "local" } );

				const returned:RegisteredPointer = registry.$getPointer( "id", true );
				expect( returned ).toBe( localPointer );
			} );

		} );

		describe( "$Registry.$getPointers", () => {

			it( "should exist", () => {
				const registry:$Registry<RegisteredPointer> = create$Mock( {} );

				expect( registry.$getPointers ).toBeDefined();
				expect( registry.$getPointers ).toEqual( jasmine.any( Function ) );
			} );


			it( "should return local resources when locals & has no parent", () => {
				const registry:$Registry<RegisteredPointer> = create$Mock( {} );

				const localPointer1:RegisteredPointer = registry.$_addPointer( { $id: "in local 1", index: "local 1" } );
				const localPointer2:RegisteredPointer = registry.$_addPointer( { $id: "in local 2", index: "local 2" } );

				const returned:RegisteredPointer[] = registry.$getPointers();
				expect( returned.length ).toBe( 2 );
				expect( returned ).toContain( localPointer1 );
				expect( returned ).toContain( localPointer2 );
			} );

			it( "should return empty resources no locals & has no parent & local flag is set ", () => {
				const registry:$Registry<RegisteredPointer> = create$Mock( {} );

				const returned:RegisteredPointer[] = registry.$getPointers( true );
				expect( returned ).toEqual( [] );
			} );

			it( "should return local resources when locals & has no parent & local flag is set ", () => {
				const registry:$Registry<RegisteredPointer> = create$Mock( {} );

				const localPointer1:RegisteredPointer = registry.$_addPointer( { $id: "in local 1", index: "local 1" } );
				const localPointer2:RegisteredPointer = registry.$_addPointer( { $id: "in local 2", index: "local 2" } );

				const returned:RegisteredPointer[] = registry.$getPointers( true );
				expect( returned.length ).toBe( 2 );
				expect( returned ).toContain( localPointer1 );
				expect( returned ).toContain( localPointer2 );
			} );


			it( "should return parent resources when no locals & in parent", () => {
				const parent:$Registry<RegisteredPointer> = create$Mock( {} );
				const parentPointer:RegisteredPointer = parent.$_addPointer( { $id: "in parent", index: "parent" } );

				const registry:$Registry<RegisteredPointer> = create$Mock( { $registry: parent } );

				const returned:RegisteredPointer[] = registry.$getPointers();
				expect( returned.length ).toBe( 1 );
				expect( returned ).toContain( parentPointer );
			} );

			it( "should return empty when no locals & not in parent & local flag is set", () => {
				const parent:$Registry<RegisteredPointer> = create$Mock( {} );

				const registry:$Registry<RegisteredPointer> = create$Mock( { $registry: parent } );

				const returned:RegisteredPointer[] = registry.$getPointers( true );
				expect( returned.length ).toBe( 0 );
			} );

			it( "should return empty when no locals & in parent & local flag is set", () => {
				const parent:$Registry<RegisteredPointer> = create$Mock( {} );
				const parentPointer:RegisteredPointer = parent.$_addPointer( { $id: "in parent", index: "parent" } );

				const registry:$Registry<RegisteredPointer> = create$Mock( { $registry: parent } );

				const returned:RegisteredPointer[] = registry.$getPointers( true );
				expect( returned.length ).toBe( 0 );
				expect( returned ).not.toContain( parentPointer );
			} );


			it( "should return local and parent resources when locals & in parent", () => {
				const parent:$Registry<RegisteredPointer> = create$Mock( {} );
				const parentPointer:RegisteredPointer = parent.$_addPointer( { $id: "in parent", index: "parent" } );

				const registry:$Registry<RegisteredPointer> = create$Mock( { $registry: parent } );
				const localPointer:RegisteredPointer = registry.$_addPointer( { $id: "the resource", index: "local" } );

				const returned:RegisteredPointer[] = registry.$getPointers();
				expect( returned.length ).toBe( 2 );
				expect( returned ).toContain( parentPointer );
				expect( returned ).toContain( localPointer );
			} );

			it( "should return empty resources when no locals & not in parent & local flag is set", () => {
				const parent:$Registry<RegisteredPointer> = create$Mock( {} );

				const registry:$Registry<RegisteredPointer> = create$Mock( { $registry: parent } );

				const returned:RegisteredPointer[] = registry.$getPointers( true );
				expect( returned.length ).toBe( 0 );
			} );

			it( "should return empty resources when no locals & in parent & local flag is set", () => {
				const parent:$Registry<RegisteredPointer> = create$Mock( {} );
				const parentPointer:RegisteredPointer = parent.$_addPointer( { $id: "in parent", index: "parent" } );

				const registry:$Registry<RegisteredPointer> = create$Mock( { $registry: parent } );

				const returned:RegisteredPointer[] = registry.$getPointers( true );
				expect( returned.length ).toBe( 0 );
				expect( returned ).not.toContain( parentPointer );
			} );

			it( "should return local resources when locals & in parent & local flag is set", () => {
				const parent:$Registry<RegisteredPointer> = create$Mock( {} );
				const parentPointer:RegisteredPointer = parent.$_addPointer( { $id: "in parent", index: "parent" } );

				const registry:$Registry<RegisteredPointer> = create$Mock( { $registry: parent } );
				const localPointer:RegisteredPointer = registry.$_addPointer( { $id: "the resource", index: "local" } );

				const returned:RegisteredPointer[] = registry.$getPointers( true );
				expect( returned.length ).toBe( 1 );
				expect( returned ).toContain( localPointer );
				expect( returned ).not.toContain( parentPointer );
			} );

		} );

		describe( "$Registry.$removePointer", () => {

			it( "should exist", () => {
				const registry:$Registry<RegisteredPointer> = create$Mock( {} );

				expect( registry.$removePointer ).toBeDefined();
				expect( registry.$removePointer ).toEqual( jasmine.any( Function ) );
			} );


			it( "should return false when not in scope & has no parent", () => {
				const registry:$Registry<RegisteredPointer> = create$Mock( {} );

				spyOnDecorated( registry, "$_getLocalID" )
					.and.callFake( () => { throw new Error( "not local" ); } );

				const returned:boolean = registry.$removePointer( "id" );
				expect( returned ).toBe( false );
			} );

			it( "should return false when in scope but not exists & has no parent", () => {
				const registry:$Registry<RegisteredPointer> = create$Mock( {} );

				const returned:boolean = registry.$removePointer( "id" );
				expect( returned ).toBe( false );
			} );

			it( "should return true when in scope and exists & has no parent", () => {
				const registry:$Registry<RegisteredPointer> = create$Mock( {} );
				registry.$_addPointer( { "$id": "id" } );

				const returned:boolean = registry.$removePointer( "id" );
				expect( returned ).toBe( true );

				expect( registry.$__resourcesMap ).toEqual( new Map() );
			} );

			it( "should return false when not in scope & has no parent & local flag is set", () => {
				const registry:$Registry<RegisteredPointer> = create$Mock( {} );

				spyOnDecorated( registry, "$_getLocalID" )
					.and.callFake( () => { throw new Error( "not local" ); } );

				const returned:boolean = registry.$removePointer( "id", true );
				expect( returned ).toBe( false );
			} );

			it( "should return false when in scope but not exists & has no parent & local flag is set ", () => {
				const registry:$Registry<RegisteredPointer> = create$Mock( {} );

				const returned:boolean = registry.$removePointer( "id", true );
				expect( returned ).toBe( false );
			} );

			it( "should return true when in scope and exists & has no parent & local flag is set ", () => {
				const registry:$Registry<RegisteredPointer> = create$Mock( {} );
				registry.$_addPointer( { "$id": "id" } );

				const returned:boolean = registry.$removePointer( "id", true );
				expect( returned ).toBe( true );

				expect( registry.$__resourcesMap ).toEqual( new Map() );
			} );


			it( "should return false when not in scope & not in parent", () => {
				const parent:$Registry<RegisteredPointer> = create$Mock( {} );

				const registry:$Registry<RegisteredPointer> = create$Mock( { $registry: parent } );
				spyOnDecorated( registry, "$_getLocalID" )
					.and.callFake( () => { throw new Error( "not local" ); } );

				const returned:boolean = registry.$removePointer( "id" );
				expect( returned ).toBe( false );
			} );

			it( "should return true when not in scope & in parent", () => {
				const parent:$Registry<RegisteredPointer> = create$Mock( {} );
				parent.$_addPointer( { "$id": "id" } );

				const registry:$Registry<RegisteredPointer> = create$Mock( { $registry: parent } );
				spyOnDecorated( registry, "$_getLocalID" )
					.and.callFake( () => { throw new Error( "not local" ); } );

				const returned:boolean = registry.$removePointer( "id" );
				expect( returned ).toBe( true );
			} );

			it( "should return false when not in scope & not in parent & local flag is set", () => {
				const parent:$Registry<RegisteredPointer> = create$Mock( {} );

				const registry:$Registry<RegisteredPointer> = create$Mock( { $registry: parent } );
				spyOnDecorated( registry, "$_getLocalID" )
					.and.callFake( () => { throw new Error( "not local" ); } );

				const returned:boolean = registry.$removePointer( "id", true );
				expect( returned ).toBe( false );
			} );

			it( "should return false when not in scope & in parent & local flag is set", () => {
				const parent:$Registry<RegisteredPointer> = create$Mock( {} );
				parent.$_addPointer( { "$id": "id" } );

				const registry:$Registry<RegisteredPointer> = create$Mock( { $registry: parent } );
				spyOnDecorated( registry, "$_getLocalID" )
					.and.callFake( () => { throw new Error( "not local" ); } );

				const returned:boolean = registry.$removePointer( "id", true );
				expect( returned ).toBe( false );
			} );


			it( "should return false when in scope and not exists & not in parent & local flag is set", () => {
				const parent:$Registry<RegisteredPointer> = create$Mock( {} );

				const registry:$Registry<RegisteredPointer> = create$Mock( { $registry: parent } );

				const returned:boolean = registry.$removePointer( "id", true );
				expect( returned ).toBe( false );
			} );

			it( "should return true when in scope and not exists & in parent", () => {
				const parent:$Registry<RegisteredPointer> = create$Mock( {} );
				parent.$_addPointer( { "$id": "id" } );

				const registry:$Registry<RegisteredPointer> = create$Mock( { $registry: parent } );

				const returned:boolean = registry.$removePointer( "id" );
				expect( returned ).toBe( true );
			} );

			it( "should return true when in scope and exists & in parent", () => {
				const parent:$Registry<RegisteredPointer> = create$Mock( {} );
				parent.$_addPointer( { "$id": "id" } );

				const registry:$Registry<RegisteredPointer> = create$Mock( { $registry: parent } );
				registry.$_addPointer( { "$id": "id" } );

				const returned:boolean = registry.$removePointer( "id" );
				expect( returned ).toBe( true );

				expect( registry.$__resourcesMap ).toEqual( new Map() );
			} );

			it( "should return false when in scope and not exists & not in parent & local flag is set", () => {
				const parent:$Registry<RegisteredPointer> = create$Mock( {} );

				const registry:$Registry<RegisteredPointer> = create$Mock( { $registry: parent } );

				const returned:boolean = registry.$removePointer( "id", true );
				expect( returned ).toBe( false );
			} );

			it( "should return false when in scope and not exists & in parent & local flag is set", () => {
				const parent:$Registry<RegisteredPointer> = create$Mock( {} );
				parent.$_addPointer( { "$id": "id" } );

				const registry:$Registry<RegisteredPointer> = create$Mock( { $registry: parent } );

				const returned:boolean = registry.$removePointer( "id", true );
				expect( returned ).toBe( false );
			} );

			it( "should return true when in scope and exists & in parent & local flag is set", () => {
				const parent:$Registry<RegisteredPointer> = create$Mock( {} );
				parent.$_addPointer( { "$id": "id" } );

				const registry:$Registry<RegisteredPointer> = create$Mock( { $registry: parent } );
				registry.$_addPointer( { "$id": "id" } );

				const returned:boolean = registry.$removePointer( "id", true );
				expect( returned ).toBe( true );

				expect( registry.$__resourcesMap ).toEqual( new Map() );
			} );

		} );

	} );

} );
