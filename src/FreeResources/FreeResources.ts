import { isAbsolute } from "sparqler/core";

import { Context } from "../Context/Context";
import { IllegalArgumentError } from "../Errors/IllegalArgumentError";

import { GeneralRegistry } from "../GeneralRegistry/GeneralRegistry";

import { ModelDecorator } from "../Model/ModelDecorator";
import { ModelFactory } from "../Model/ModelFactory";
import { ModelPrototype } from "../Model/ModelPrototype";
import { ModelTypeGuard } from "../Model/ModelTypeGuard";

import { DigestedObjectSchema } from "../ObjectSchema/DigestedObjectSchema";

import { Pointer } from "../Pointer/Pointer";

import { RDFNode } from "../RDF/Node";
import { URI } from "../RDF/URI";

import { BaseRegistry } from "../Registry/BaseRegistry";
import { Registry } from "../Registry/Registry";

import { Resource } from "../Resource/Resource";

import { BaseFreeResources } from "./BaseFreeResources";


/**
 * Model that represents resources that doesn't have a context.
 */
export interface FreeResources extends Registry<Resource> {
	/**
	 * Registry where the {@link FreeResources} scope is in.
	 */
	readonly registry:GeneralRegistry<any>;

	/**
	 * @see {@link Registry._getLocalID}
	 */
	_getLocalID( id:string ):string;

	/**
	 * @see {@link Registry._addPointer}
	 */
	_addPointer<T extends object>( base:T & Partial<Pointer> ):T & Resource;


	/**
	 * Returns the JSON-LD representation of the every resources inside an array.
	 * @param contextOrKey A specific context to use for expand the data into JSON-LD instead of the internal one.
	 */
	toJSON( contextOrKey?:Context | string ):RDFNode[];
}


export type OverriddenMembers =
	| "_getLocalID"
	| "_addPointer"
	;

/**
 * Utils for {@link FreeResources}.
 */
export interface FreeResourcesUtils {
	parseFreeNodes( registry:GeneralRegistry<any>, freeNodes:RDFNode[] ):FreeResources;
}

/**
 * Factory, decorator and utils for {@link FreeResources}.
 */
export type FreeResourcesFactory =
	& ModelPrototype<FreeResources, Registry, OverriddenMembers>
	& ModelDecorator<FreeResources, BaseFreeResources>
	& ModelTypeGuard<FreeResources>
	& ModelFactory<FreeResources, BaseFreeResources>
	& FreeResourcesUtils
	;

/**
 * Constant with the factory, decorator and/or utils for a {@link FreeResources} object.
 */
export const FreeResources:{
	/**
	 * The object with the properties/methods to use in the decoration of a {@link FreeResources}.
	 */
	PROTOTYPE:FreeResourcesFactory["PROTOTYPE"];

	/**
	 * Returns true if the object is decorated with the specific properties and methods of a {@link FreeResources}.
	 */
	isDecorated( object:object ):object is FreeResources;

	/**
	 * Returns true when the value provided is considered to be a {@link FreeResources}.
	 */
	is( object:object ):object is FreeResources;

	/**
	 * Decorates the object with the properties and methods from the {@link FreeResources} prototype.
	 */
	decorate<T extends BaseFreeResources>( object:T ):T & FreeResources

	/**
	 * Creates a {@link FreeResources} with the provided data.
	 */
	create<T extends object>( data:T & BaseFreeResources ):T & FreeResources

	/**
	 * Creates a {@link FreeResources} from the provided object.
	 */
	createFrom<T extends object>( object:T & BaseFreeResources ):T & FreeResources

	/**
	 * Function that parses free {@link RDFNode}s into a {@link FreeResources} object.
	 * @param registry Base registry used in the context.
	 * @param freeNodes List of RDFNodes to parse.
	 */
	parseFreeNodes( this:void, registry:GeneralRegistry<any>, freeNodes:RDFNode[] ):FreeResources;
} = <FreeResourcesFactory> {
	PROTOTYPE: {
		_getLocalID( this:FreeResources, id:string ):string {
			if( isAbsolute( id ) && !URI.hasProtocol( id ) ) return id;
			throw new IllegalArgumentError( `"${ id }" is out of scope.` );
		},

		_addPointer<T extends object>( this:FreeResources, base:T & Partial<Pointer> ):T & Resource {
			if( !base.$id ) base.$id = URI.generateBNodeID();
			type FilledID = typeof base & { $id:string };
			return Registry.PROTOTYPE._addPointer.call( this, base as FilledID );
		},


		toJSON( this:FreeResources, contextOrKey?:Context | string ):RDFNode[] {
			return this
				.getPointers( true )
				.map( resource => resource.toJSON( contextOrKey ) )
				;
		},
	},


	is( value:any ):value is FreeResources {
		return Registry.isDecorated( value )
			&& FreeResources.isDecorated( value )
			;
	},

	isDecorated( object:object ):object is FreeResources {
		return ModelDecorator
			.hasPropertiesFrom( FreeResources.PROTOTYPE, object );
	},


	create<T extends object>( data:T & BaseFreeResources ):T & FreeResources {
		const copy:T & BaseFreeResources = Object.assign( {}, data );
		return FreeResources.createFrom( copy );
	},

	createFrom<T extends object>( object:T & BaseFreeResources ):T & FreeResources {
		return FreeResources.decorate( object );
	},

	decorate<T extends BaseFreeResources>( object:T ):T & FreeResources {
		if( FreeResources.isDecorated( object ) ) return object;

		const base:T & BaseRegistry<Resource> = Object.assign<T, Pick<FreeResources, "__modelDecorator">>( object, {
			__modelDecorator: Resource,
		} );

		const resource:T & Registry<Resource> = ModelDecorator
			.decorateMultiple( base, Registry );

		return ModelDecorator
			.definePropertiesFrom( FreeResources.PROTOTYPE, resource );
	},


	parseFreeNodes( this:void, registry:GeneralRegistry<any>, freeNodes:RDFNode[] ):FreeResources {
		const freeResources:FreeResources = FreeResources
			.createFrom( { registry: registry } );

		freeNodes
			.forEach( node => {
				const digestedSchema:DigestedObjectSchema = registry.getSchemaFor( node );

				const target:object = freeResources.getPointer( node[ "@id" ], true );
				registry.context.jsonldConverter.compact( node, target, digestedSchema, freeResources );
			} );

		return freeResources;
	},
};

