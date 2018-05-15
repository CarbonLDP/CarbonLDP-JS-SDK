import { TransientBlankNode, } from "../BlankNode";
import { CarbonLDP } from "../CarbonLDP";
import {
	ModelDecorator,
	ModelFactory,
} from "../core";
import { IllegalArgumentError, } from "../Errors";
import {
	BaseFragment,
	TransientFragment
} from "../Fragment";
import { JSONLDConverter } from "../JSONLD";
import {
	BaseNamedFragment,
	TransientNamedFragment,
} from "../NamedFragment";
import { DigestedObjectSchema, } from "../ObjectSchema";
import { Pointer, } from "../Pointer";
import {
	RDFDocument,
	RDFNode,
	URI,
} from "../RDF";
import {
	DocumentsRegistry,
	Registry
} from "../Registry";
import { TransientResource } from "../Resource";
import {
	isObject,
	isPlainObject,
	isString,
	PickSelfProps,
} from "../Utils";
import { C } from "../Vocabularies";
import { BaseDocument } from "./BaseDocument";


export interface TransientDocument extends TransientResource, Registry<TransientBlankNode | TransientNamedFragment> {
	_context:CarbonLDP | undefined;
	_registry:DocumentsRegistry | undefined;

	defaultInteractionModel?:Pointer;
	isMemberOfRelation?:Pointer;
	hasMemberRelation?:Pointer;


	hasFragment( slug:string ):boolean;


	getFragment<T extends object>( slug:string ):(T & TransientFragment) | null;

	getNamedFragment<T extends object>( slug:string ):(T & TransientNamedFragment) | null;

	getFragments():TransientFragment[];


	createFragment<T extends object>( object:T, slug?:string ):T & TransientFragment;
	createFragment( slug?:string ):TransientFragment;

	createNamedFragment<T extends object>( object:T, slug:string ):T & TransientNamedFragment;
	createNamedFragment( slug:string ):TransientNamedFragment;


	removeNamedFragment( slugOrFragment:string | TransientNamedFragment ):boolean;

	_removeFragment( slugOrFragment:string | TransientFragment ):boolean;


	_normalize():void;


	_getLocalID( id:string ):string;

	_register<T extends object>( base:T & { id?:string } ):T & TransientFragment;


	toJSON( registry?:DocumentsRegistry ):RDFDocument;
}

type OverloadedProps =
	| "_context"
	| "_registry"
	| "_getLocalID"
	| "_register"
	;

const PROTOTYPE:PickSelfProps<TransientDocument, TransientResource & Registry<TransientBlankNode | TransientNamedFragment>, OverloadedProps> = {
	_context: void 0,
	_registry: void 0,

	_normalize( this:TransientDocument ):void {
		const currentBNodes:string[] = this.getFragments()
			.map( Pointer.getID )
			.filter( URI.isBNodeID );

		const usedFragmentsIDs:Set<string> = new Set();
		TransientDocument._convertNestedObjects( this, this, usedFragmentsIDs );

		currentBNodes.forEach( bNode => {
			if( usedFragmentsIDs.has( bNode ) ) return;
			this._resourcesMap.delete( bNode );
		} );
	},


	_getLocalID( this:TransientDocument, id:string ):string | null {
		id = Registry.PROTOTYPE._getLocalID.call( this, id );

		if( URI.isBNodeID( id ) ) return id;

		if( URI.isFragmentOf( id, this.id ) ) return URI.getFragment( id );

		if( URI.isRelative( id ) ) return id;

		return null;
	},

	_register<T extends object>( this:TransientDocument, base:T & { id?:string, slug?:string } ):T & TransientFragment {
		if( base.slug ) base.id = base.slug;
		if( ! base.id ) base.id = URI.generateBNodeID();

		const pointer:T & Pointer = Registry.PROTOTYPE._register.call( this, base );
		TransientDocument._convertNestedObjects( this, pointer );

		if( URI.isBNodeID( pointer.id ) )
			return TransientBlankNode.decorate( pointer );

		const resource:T & TransientNamedFragment = TransientNamedFragment.decorate( pointer );
		resource.slug = this._getLocalID( resource._id );

		return resource;
	},


	hasFragment( this:TransientDocument, id:string ):boolean {
		if( ! this.inScope( id ) ) return false;

		const localID:string = this._getLocalID( id );
		return this._resourcesMap.has( localID );
	},


	getFragment<T extends object>( this:TransientDocument, id:string ):(T & TransientFragment) | null {
		if( ! this.inScope( id ) ) throw new IllegalArgumentError( `"${ id }" is outside the scope of the registry.` );

		const localID:string = this._getLocalID( id );

		const resource:TransientFragment = this._resourcesMap.get( localID );
		if( ! resource ) return null;

		return resource as T & TransientFragment;
	},

	getNamedFragment<T extends object>( this:TransientDocument, slug:string ):(T & TransientNamedFragment) | null {
		if( URI.isBNodeID( slug ) ) throw new IllegalArgumentError( `Invalid named fragment slug "${ slug }", it can't start with "_:".` );
		return this.getFragment( slug );
	},

	getFragments( this:TransientDocument ):TransientFragment[] {
		return Array.from( this._resourcesMap.values() );
	},


	createFragment<T extends object>( this:TransientDocument, isOrObject?:string | T, id?:string ):T & TransientFragment {
		const object:T & BaseFragment = isObject( isOrObject ) ? isOrObject : {} as T;

		id = isString( isOrObject ) ? isOrObject : id;
		if( id ) object.id = id;

		return this._register( object );
	},

	createNamedFragment<T extends object>( this:TransientDocument, slugOrObject:string | T, slug?:string ):T & TransientNamedFragment {
		slug = isString( slugOrObject ) ? slugOrObject : slug;

		if( ! slug ) throw new IllegalArgumentError( `The slug can't be empty.` );
		if( URI.isBNodeID( slug ) ) throw new IllegalArgumentError( `Invalid named fragment slug "${ slug }", it can't start with "_:".` );

		const object:T = isObject( slugOrObject ) ? slugOrObject : {} as T;
		const base:T & BaseNamedFragment = Object.assign( object, { slug } );
		return this._register( base );
	},


	removeNamedFragment( this:TransientDocument, fragmentOrSlug:TransientNamedFragment | string ):boolean {
		const id:string = Pointer.getID( fragmentOrSlug );

		if( URI.isBNodeID( id ) ) throw new IllegalArgumentError( `"${ id }" is not a valid named fragment.` );
		return this._removeFragment( id );
	},

	_removeFragment( this:TransientDocument, fragmentOrSlug:string | TransientFragment ):boolean {
		if( ! this.inScope( fragmentOrSlug ) ) return false;
		return this.removePointer( fragmentOrSlug );
	},


	toJSON( this:TransientDocument, registryOrKey?:DocumentsRegistry | string ):RDFDocument {
		const registry:DocumentsRegistry = isObject( registryOrKey ) ?
			registryOrKey : this._registry;

		const generalSchema:DigestedObjectSchema = registry ?
			registry.getGeneralSchema() : new DigestedObjectSchema();

		const jsonldConverter:JSONLDConverter = registry ?
			registry.jsonldConverter : new JSONLDConverter();

		const expandedResources:RDFNode[] = [ this, ...this.getFragments(), ]
			.map( resource => {
				const resourceSchema:DigestedObjectSchema = registry ?
					registry.getSchemaFor( resource ) :
					new DigestedObjectSchema()
				;

				return jsonldConverter.expand( resource, generalSchema, resourceSchema );
			} )
		;

		return {
			"@id": this.id,
			"@graph": expandedResources,
		};
	},
};


export interface TransientDocumentFactory extends ModelFactory<TransientDocument>, ModelDecorator<TransientDocument> {
	PROTOTYPE:PickSelfProps<TransientDocument,
		TransientResource & Registry<TransientBlankNode | TransientNamedFragment>,
		| "_context"
		| "_registry"
		| "_getLocalID"
		| "_register">;

	TYPE:C[ "Document" ];


	is( value:any ):value is TransientDocument;

	isDecorated( object:object ):object is TransientDocument;


	create<T extends object>( data?:T & BaseDocument ):T & TransientDocument;

	createFrom<T extends object>( object:T & BaseDocument ):T & TransientDocument;

	decorate<T extends object>( object:T ):T & TransientDocument;


	_convertNestedObjects<T extends object>( parent:TransientDocument, actual:T, fragmentsTracker?:Set<string> ):T;
}

export const TransientDocument:TransientDocumentFactory = {
	PROTOTYPE,

	TYPE: C.Document,

	isDecorated: ( object ):object is TransientDocument =>
		isObject( object )
		&& ModelDecorator
			.hasPropertiesFrom( PROTOTYPE, object )
	,

	is: ( value ):value is TransientDocument =>
		TransientResource.is( value ) &&
		Registry.isDecorated( value ) &&
		TransientDocument.isDecorated( value )
	,


	decorate<T extends object>( object:T ):T & TransientDocument {
		if( TransientDocument.isDecorated( object ) ) return object;

		const resource:T & TransientResource & Registry<TransientBlankNode | TransientNamedFragment> = ModelDecorator
			.decorateMultiple( object, TransientResource, Registry );

		return ModelDecorator
			.definePropertiesFrom( PROTOTYPE, resource )
			;
	},

	createFrom: <T extends object>( object:T & BaseDocument ) => {
		if( TransientDocument.is( object ) ) throw new IllegalArgumentError( "The object provided is already a Document." );

		const document:T & TransientDocument = TransientDocument.decorate<T>( object );
		TransientDocument._convertNestedObjects( document, document );

		return document;
	},

	create: <T extends object>( data?:T & BaseDocument ) => {
		const copy:T = Object.assign( {}, data );
		return TransientDocument.createFrom( copy );
	},


	_convertNestedObjects<T extends object>( parent:TransientDocument, actual:T, fragmentsTracker:Set<string> = new Set() ):T {
		for( let key of Object.keys( actual ) ) {
			const next:any = actual[ key ];

			if( Array.isArray( next ) ) {
				TransientDocument._convertNestedObjects( parent, next, fragmentsTracker );
				continue;
			}

			if( ! isPlainObject( next ) ) continue;
			if( next._registry ) continue;
			if( TransientDocument.is( next ) ) continue;

			const idOrSlug:string = getNestedObjectId( next );
			if( ! ! idOrSlug && ! parent.inScope( idOrSlug ) ) continue;

			const parentFragment:TransientFragment = parent.getFragment( idOrSlug );
			if( ! parentFragment ) {
				const fragment:TransientFragment = parent.createFragment( <Object> next, idOrSlug );
				TransientDocument._convertNestedObjects( parent, fragment, fragmentsTracker );

			} else if( parentFragment !== next ) {
				const fragment:TransientFragment = actual[ key ] = Object.assign( parentFragment, next );
				TransientDocument._convertNestedObjects( parent, fragment, fragmentsTracker );

			} else if( ! fragmentsTracker.has( next.id ) ) {
				fragmentsTracker.add( next.id );
				TransientDocument._convertNestedObjects( parent, next, fragmentsTracker );
			}

		}

		return actual;
	},
};

function getNestedObjectId( object:any ):string {
	if( "id" in object ) return object.id;

	if( "slug" in object ) return URI.hasFragment( object.slug ) ?
		object.slug : "#" + object.slug;

	return "";
}
