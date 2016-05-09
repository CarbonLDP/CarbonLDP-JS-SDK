import Documents from "./Documents";
import IllegalArgumentError from "./Errors/IllegalArgumentError";
import * as Pointer from "./Pointer";
import * as RDF from "./RDF";
import * as Resource from "./Resource";
import * as Utils from "./Utils";
import IDAlreadyInUseError from "./Errors/IDAlreadyInUseError";

export interface Class extends Pointer.Library, Pointer.Validator {
	_documents:Documents;
	_resourcesIndex:Map<string, Resource.Class>;

	hasResource( id:string ):boolean;
	getResource( id:string ):Resource.Class;
	getResources():Resource.Class[];

	createResource( id?:string ):Resource.Class;
}

function hasPointer( id:string ):boolean {
	let freeResources:Class = <Class> this;

	if( ! inLocalScope( id ) ) {
		return freeResources._documents.hasPointer( id );
	}

	return freeResources.hasResource( id );
}

function getPointer( id:string ):Pointer.Class {
	let freeResources:Class = <Class> this;

	if( ! inLocalScope( id ) ) {
		return freeResources._documents.getPointer( id );
	}

	let resource:Resource.Class = freeResources.getResource( id );

	return ! resource ? freeResources.createResource( id ) : resource;
}

function inLocalScope( id:string ):boolean {
	return RDF.URI.Util.isBNodeID( id );
}

function inScope( pointer:Pointer.Class ):boolean;
function inScope( id:string ):boolean;
function inScope( idOrPointer:any ):boolean {
	let freeResources:Class = <Class> this;
	let id:string = Pointer.Factory.is( idOrPointer ) ? idOrPointer.id : idOrPointer;

	if ( inLocalScope( id ) ) return true;
	return freeResources._documents.inScope( id );
}

function hasResource( id:string ):boolean {
	let freeResources:Class = <Class> this;

	return freeResources._resourcesIndex.has( id );
}

function getResource( id:string ):Resource.Class {
	let freeResources:Class = <Class> this;

	return freeResources._resourcesIndex.get( id ) || null;
}

function getResources():Resource.Class[] {
	let freeResources:Class = <Class> this;

	return Utils.A.from( freeResources._resourcesIndex.values() );
}

function createResource( id?:string ):Resource.Class {
	let freeResources:Class = <Class> this;

	if ( id ) {
		if ( ! inLocalScope( id ) ) throw new IllegalArgumentError( `The id "${ id }" is out of scope.` );
		if ( freeResources._resourcesIndex.has( id ) ) throw new IDAlreadyInUseError( `The id "${ id }" is already in use by another resource.`);
	} else {
		id = RDF.URI.Util.generateBNodeID();
	}

	let resource:Resource.Class = Resource.Factory.create( id );
	freeResources._resourcesIndex.set( id, resource );

	return resource;
}

export class Factory {
	static hasClassProperties( value:Object ):boolean {
		return (
			Utils.hasFunction( value, "hasPointer" ) &&
			Utils.hasFunction( value, "getPointer" ) &&

			Utils.hasFunction( value, "inScope" ) &&

			Utils.hasPropertyDefined( value, "_documents" ) &&
			Utils.hasPropertyDefined( value, "_resourcesIndex" ) &&

			Utils.hasFunction( value, "hasResource" ) &&
			Utils.hasFunction( value, "getResource" ) &&
			Utils.hasFunction( value, "getResources" ) &&
			Utils.hasFunction( value, "createResource" )
		);
	}

	static create( documents:Documents ):Class {
		return Factory.createFrom( {}, documents );
	}

	static createFrom<T extends Object>( object:T, documents:Documents ):T & Class {
		let freeResources:T & Class = Factory.decorate<T>( object );
		freeResources._documents = documents;

		return freeResources;
	}

	static decorate<T extends Object>( object:T ):T & Class {
		if ( Factory.hasClassProperties( object ) ) return <any> object;

		Object.defineProperties( object, {
			"_resourcesIndex": {
				writable: false,
				enumerable: false,
				configurable: true,
				value: new Map<string, Resource.Class>(),
			},
			"hasPointer": {
				writable: true,
				enumerable: false,
				configurable: true,
				value: hasPointer,
			},
			"getPointer": {
				writable: true,
				enumerable: false,
				configurable: true,
				value: getPointer,
			},
			"inScope": {
				writable: true,
				enumerable: false,
				configurable: true,
				value: inScope,
			},
			"hasResource": {
				writable: true,
				enumerable: false,
				configurable: true,
				value: hasResource,
			},
			"getResource": {
				writable: true,
				enumerable: false,
				configurable: true,
				value: getResource,
			},
			"getResources": {
				writable: true,
				enumerable: false,
				configurable: true,
				value: getResources,
			},
			"createResource": {
				writable: true,
				enumerable: false,
				configurable: true,
				value: createResource,
			},
		} );

		return <any> object;
	}
}

export default Class;