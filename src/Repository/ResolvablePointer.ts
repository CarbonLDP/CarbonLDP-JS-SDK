import { _parseResourceParams, _parseURIParams } from "../DocumentsRepository/Utils";
import { IllegalArgumentError } from "../Errors/IllegalArgumentError";

import { ModelDecorator } from "../Model/ModelDecorator";
import { ModelPrototype } from "../Model/ModelPrototype";
import { ModelTypeGuard } from "../Model/ModelTypeGuard";

import { Pointer } from "../Pointer/Pointer";

import { isFunction, isObject, ObjectUtils } from "../Utils";

import { BaseResolvablePointer } from "./BaseResolvablePointer";
import { Repository } from "./Repository";


export interface ResolvablePointer extends Pointer, Repository {
	$repository:Repository;
	$eTag:string | undefined;

	_resolved:boolean;
	_snapshot:object;


	isResolved():boolean;


	_syncSnapshot():void;

	isDirty():boolean;

	revert():void;


	get( ...params:any[] ):Promise<ResolvablePointer>;
	get( uri:string, ...params:any[] ):Promise<ResolvablePointer>;

	resolve( ...params:any[] ):Promise<ResolvablePointer>;
	resolve( resource:ResolvablePointer, ...params:any[] ):Promise<ResolvablePointer>;

	exists( ...params:any[] ):Promise<boolean>;
	exists( uri:string, ...params:any[] ):Promise<boolean>;


	refresh( ...params:any[] ):Promise<ResolvablePointer>;
	refresh( resource:ResolvablePointer, ...params:any[] ):Promise<ResolvablePointer>;

	save( ...params:any[] ):Promise<ResolvablePointer>;
	save( resource:ResolvablePointer, ...params:any[] ):Promise<ResolvablePointer>;

	saveAndRefresh( ...params:any[] ):Promise<ResolvablePointer>;
	saveAndRefresh( resource:ResolvablePointer, ...params:any[] ):Promise<ResolvablePointer>;


	delete( ...params:any[] ):Promise<void>;
	delete( uri:string, ...params:any[] ):Promise<void>;
}


function __internalRevert( target:any, source:any ):void {
	if( ! isObject( target ) || ! isObject( source ) ) return;

	new Set<string>( [
		...Object.keys( target ),
		...Object.keys( source ),
	] ).forEach( key => {
		const sourceValue:any = Array.isArray( source[ key ] ) ?
			[ ...source[ key ] ] : source[ key ];

		if( sourceValue === null || sourceValue === void 0 ) {
			delete target[ key ];
			return;
		}

		if( isFunction( sourceValue ) ) return;

		target[ key ] = sourceValue;
	} );
}


export type ResolvablePointerFactory =
	& ModelPrototype<ResolvablePointer, Pointer>
	& ModelDecorator<ResolvablePointer, BaseResolvablePointer>
	& ModelTypeGuard<ResolvablePointer>
	;

export const ResolvablePointer:ResolvablePointerFactory = {
	PROTOTYPE: {
		get $repository():Repository {
			throw new IllegalArgumentError( `Property "$repository" is required.` );
		},

		$eTag: void 0,


		_resolved: false,

		isResolved( this:ResolvablePointer ):boolean {
			return this._resolved;
		},


		_snapshot: {},

		_syncSnapshot( this:{ types?:string[] } & ResolvablePointer ):void {
			const clone:{ types?:string[] } & ResolvablePointer = ObjectUtils.clone( this, { arrays: true } );
			if( this.types ) clone.types = [ ...this.types ];

			this._snapshot = clone;
		},

		isDirty( this:ResolvablePointer ):boolean {
			return ! ObjectUtils
				.areEqual( this, this._snapshot, { arrays: true } );
		},

		revert( this:{ types?:string[] } & ResolvablePointer ):void {
			__internalRevert( this, this._snapshot );
			if( ! this.types ) this.types = [];
		},


		get( this:ResolvablePointer, uri?:string ):Promise<ResolvablePointer> {
			const { _uri, _args } = _parseURIParams( this, uri, arguments );
			return this.$repository.get( _uri, ..._args );
		},

		resolve( this:ResolvablePointer, resource?:ResolvablePointer ):Promise<ResolvablePointer> {
			const { _resource, _args } = _parseResourceParams( this, resource, arguments );
			return this.$repository.resolve( _resource, ..._args );
		},

		exists( this:ResolvablePointer, uri?:string ):Promise<boolean> {
			const { _uri, _args } = _parseURIParams( this, uri, arguments );
			return this.$repository.exists( _uri, ..._args );
		},


		refresh( this:ResolvablePointer, resource?:ResolvablePointer, ...args:any[] ):Promise<ResolvablePointer> {
			const { _resource, _args } = _parseResourceParams( this, resource, arguments );
			return this.$repository.refresh( _resource, ..._args );
		},

		save( this:ResolvablePointer, resource?:ResolvablePointer, ...args:any[] ):Promise<ResolvablePointer> {
			const { _resource, _args } = _parseResourceParams( this, resource, arguments );
			return this.$repository.save( _resource, ..._args );
		},

		saveAndRefresh( this:ResolvablePointer, resource?:ResolvablePointer, ...args:any[] ):Promise<ResolvablePointer> {
			const { _resource, _args } = _parseResourceParams( this, resource, arguments );
			return this.$repository.saveAndRefresh( _resource, ..._args );
		},


		delete( uri?:string, ...args:any[] ):Promise<void> {
			const { _uri, _args } = _parseURIParams( this, uri, arguments );
			return this.$repository.delete( _uri, ..._args );
		},
	},


	isDecorated( object:object ):object is ResolvablePointer {
		return ModelDecorator
			.hasPropertiesFrom( ResolvablePointer.PROTOTYPE, object )
			;
	},

	decorate<T extends BaseResolvablePointer>( object:T ):T & ResolvablePointer {
		if( ResolvablePointer.isDecorated( object ) ) return object;

		const resource:T & Pointer = ModelDecorator
			.decorateMultiple( object, Pointer );

		return ModelDecorator
			.definePropertiesFrom( ResolvablePointer.PROTOTYPE, resource );
	},


	is( value:any ):value is ResolvablePointer {
		return Pointer.is( value )
			&& ResolvablePointer.isDecorated( value )
			;
	},
};
