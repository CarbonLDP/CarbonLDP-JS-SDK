import { NotImplementedError } from "../Errors/NotImplementedError";

import { BiModelDecorator } from "../Model/BiModelDecorator";
import { ModelDecorator } from "../Model/ModelDecorator";
import { ModelPrototype } from "../Model/ModelPrototype";

import { ObjectSchemaResolver } from "../ObjectSchema/ObjectSchemaResolver";

import { Pointer } from "../Pointer/Pointer";

import { $BaseRepository, BaseRepository } from "./BaseRepository";
import { ResolvablePointer } from "./ResolvablePointer";


/**
 * Interface with the base methods of a service that manages request of an specific type of resources.
 */
export interface Repository<MODEL extends ResolvablePointer = ResolvablePointer> {
	/**
	 * Retrieves the resources of the specified URI.
	 * @param uri URI of the resource to retrieve.
	 * @param params Rest params of the method.
	 */
	get( uri:string, ...params:any[] ):Promise<MODEL>;
	/**
	 * Resolve the specified resource.
	 * @param resource Resource to resolve.
	 * @param params Rest params of the method.
	 */
	resolve( resource:MODEL, ...params:any[] ):Promise<MODEL>;
	/**
	 * Checks if the resource of the specified URI exists.
	 * @param uri URI of the resource to check.
	 * @param params Rest params of the method.
	 */
	exists( uri:string, ...params:any[] ):Promise<boolean>;

	/**
	 * Refreshes the data of the specified resource.
	 * @param resource Resource to refresh.
	 * @param params Rest params of the method.
	 */
	refresh( resource:MODEL, ...params:any[] ):Promise<MODEL>;
	/**
	 * Saves the changes of the specified resource.
	 * @param resource Resource to save.
	 * @param params Rest params of the method.
	 */
	save( resource:MODEL, ...params:any[] ):Promise<MODEL>;
	/**
	 * Saves the changes of the specified resource and retrieves its latest changes.
	 * @param resource Resource to save and refresh.
	 * @param params Rest params of the method.
	 */
	saveAndRefresh( resource:MODEL, ...params:any[] ):Promise<MODEL>;

	/**
	 * Deletes the resource of the specified URI.
	 * @param uri URI of the resource to delete.
	 * @param params Rest params of the method.
	 */
	delete( uri:string, ...params:any[] ):Promise<void>;
}

/**
 * Interface with the base methods of a model that manages request of an specific type of resources.
 */
export interface $Repository<MODEL extends ResolvablePointer = ResolvablePointer> extends Pointer {
	/**
	 * Retrieves the resources of the specified URI.
	 * @param uri URI of the resource to retrieve.
	 * @param params Rest params of the method.
	 */
	$get( uri:string, ...params:any[] ):Promise<MODEL>;
	/**
	 * Resolve the specified resource.
	 * @param resource Resource to resolve.
	 * @param params Rest params of the method.
	 */
	$resolve( resource:MODEL, ...params:any[] ):Promise<MODEL>;
	/**
	 * Checks if the resource of the specified URI exists.
	 * @param uri URI of the resource to check.
	 * @param params Rest params of the method.
	 */
	$exists( uri:string, ...params:any[] ):Promise<boolean>;

	/**
	 * Refreshes the data of the specified resource.
	 * @param resource Resource to refresh.
	 * @param params Rest params of the method.
	 */
	$refresh( resource:MODEL, ...params:any[] ):Promise<MODEL>;
	/**
	 * Saves the changes of the specified resource.
	 * @param resource Resource to save.
	 * @param params Rest params of the method.
	 */
	$save( resource:MODEL, ...params:any[] ):Promise<MODEL>;
	/**
	 * Saves the changes of the specified resource and retrieves its latest changes.
	 * @param resource Resource to save and refresh.
	 * @param params Rest params of the method.
	 */
	$saveAndRefresh( resource:MODEL, ...params:any[] ):Promise<MODEL>;

	/**
	 * Deletes the resource of the specified URI.
	 * @param uri URI of the resource to delete.
	 * @param params Rest params of the method.
	 */
	$delete( uri:string, ...params:any[] ):Promise<void>;
}


function __throwNotImplemented():Promise<never> {
	return Promise.reject( new NotImplementedError( "Must be implemented for a specific repository implementation." ) );
}

/**
 * Factory, decorator and utils for {@link Repository}.
 */
export type RepositoryFactory =
	& ModelPrototype<Repository, BaseRepository & ObjectSchemaResolver>
	& BiModelDecorator<Repository<any>, $Repository<any>, BaseRepository, $BaseRepository>
	;

/**
 * Constant with the factory, decorator and/or utils for a {@link Repository} object.
 */
export const Repository:{
	/**
	 * The object with the properties/methods to use in the decoration of a {@link Repository}.
	 */
	PROTOTYPE:RepositoryFactory["PROTOTYPE"];

	/**
	 * Returns true if the object is decorated with the specific properties and methods of a {@link Repository}.
	 */
	isDecorated( object:object ):object is any;
	/**
	 * Decorates the object with the properties and methods from the {@link Repository} prototype.
	 */
	decorate<T extends BaseRepository>( object:T ):T & any;

} = <RepositoryFactory> {
	PROTOTYPE: {
		get: __throwNotImplemented,
		resolve: __throwNotImplemented,
		exists: __throwNotImplemented,

		refresh: __throwNotImplemented,
		save: __throwNotImplemented,
		saveAndRefresh: __throwNotImplemented,

		delete: __throwNotImplemented,
	},


	isDecorated( object:object ):object is any {
		return ModelDecorator
			.hasPropertiesFrom( Repository.PROTOTYPE, object )
			;
	},

	decorate<T extends BaseRepository>( object:T ):T & any {
		if( Repository.isDecorated( object ) ) return;

		return ModelDecorator
			.definePropertiesFrom( Repository.PROTOTYPE, object );
	},
};
