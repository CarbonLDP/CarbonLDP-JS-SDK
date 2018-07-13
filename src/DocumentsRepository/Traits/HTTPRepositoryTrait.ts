import { Context } from "../../Context/Context";

import { IllegalArgumentError } from "../../Errors/IllegalArgumentError";

import { BaseGeneralRepository } from "../../GeneralRepository/BaseGeneralRepository";
import { GeneralRepository } from "../../GeneralRepository/GeneralRepository";

import { HTTPError } from "../../HTTP/Errors/HTTPError";
import { statusCodeMap } from "../../HTTP/Errors/index";
import { UnknownError } from "../../HTTP/Errors/UnknownError";

import { GETOptions, RequestOptions, RequestService, RequestUtils } from "../../HTTP/Request";
import { Response } from "../../HTTP/Response";

import { ModelDecorator } from "../../Model/ModelDecorator";
import { ModelPrototype } from "../../Model/ModelPrototype";

import { RegisteredPointer } from "../../Registry/RegisteredPointer";
import { ResolvablePointer } from "../../Repository/ResolvablePointer";

import { _getNotInContextMessage } from "../Utils";


export interface HTTPRepositoryTrait<MODEL extends ResolvablePointer = ResolvablePointer> extends GeneralRepository<MODEL> {
	readonly $context:Context<MODEL & RegisteredPointer, MODEL>;

	get<T extends object>( uri:string, requestOptions?:GETOptions ):Promise<T & MODEL>;
	resolve<T extends object>( resource:MODEL, requestOptions?:RequestOptions ):Promise<T & MODEL>;
	exists( uri:string, requestOptions?:RequestOptions ):Promise<boolean>;

	refresh<T extends object>( resource:MODEL, requestOptions?:RequestOptions ):Promise<T & MODEL>;
	save<T extends object>( resource:MODEL, requestOptions?:RequestOptions ):Promise<T & MODEL>;
	saveAndRefresh<T extends object>( resource:MODEL, requestOptions?:RequestOptions ):Promise<T & MODEL>;

	delete( uri:string, requestOptions?:RequestOptions ):Promise<void>;

	_parseFailedResponse( response:Response | Error | null ):Promise<never>;
	_parseResponseData<T extends object>( response:Response, id:string ):Promise<T & MODEL>;
}


export type OverriddenMembers =
	| "get"
	| "resolve"
	| "exists"
	| "refresh"
	| "save"
	| "saveAndRefresh"
	| "delete"
	;

// FIXME: Use `unknown` for TS 3.0
export type GeneralRepositoryFactory =
	& ModelPrototype<HTTPRepositoryTrait, GeneralRepository, OverriddenMembers>
	& ModelDecorator<HTTPRepositoryTrait<any>, BaseGeneralRepository>
	;

export const HTTPRepositoryTrait:GeneralRepositoryFactory = {
	PROTOTYPE: {
		get<T extends object>( this:HTTPRepositoryTrait, uri:string, requestOptions?:GETOptions ):Promise<T & ResolvablePointer> {
			if( this.$context.registry.inScope( uri ) ) return Promise.reject( new IllegalArgumentError( _getNotInContextMessage( uri ) ) );
			const url:string = this.$context.resolve( uri );

			if( this.$context.registry.hasPointer( url, true ) ) {
				const resource:ResolvablePointer = this.$context.registry.getPointer( url, true );
				if( resource.isResolved() ) {
					if( ! requestOptions.ensureLatest ) return Promise.resolve( resource as T & ResolvablePointer );
					RequestUtils.setIfNoneMatchHeader( resource.$eTag, requestOptions );
				}
			}

			return RequestService
				.get( url, requestOptions )
				.then( ( response:Response ) => {
					return this._parseResponseData<T>( response, uri );
				} )
				.catch( this._parseFailedResponse.bind( this ) );
		},

		resolve<T extends object>( this:HTTPRepositoryTrait, resource:ResolvablePointer, requestOptions?:RequestOptions ):Promise<T & ResolvablePointer> {
			return this.get<T>( resource.$id, requestOptions );
		},

		exists( this:HTTPRepositoryTrait, uri:string, requestOptions?:RequestOptions ):Promise<boolean> {
			if( this.$context.registry.inScope( uri ) ) return Promise.reject( new IllegalArgumentError( _getNotInContextMessage( uri ) ) );
			const url:string = this.$context.resolve( uri );

			return RequestService
				.head( url, requestOptions )
				.then( () => true )
				.catch<boolean>( ( response:Response ) => {
					if( response.status === 404 ) return false;
					return this._parseFailedResponse( response );
				} );
		},


		refresh<T extends object>( this:HTTPRepositoryTrait, resource:ResolvablePointer, requestOptions?:RequestOptions ):Promise<T & ResolvablePointer> {
			if( ! ResolvablePointer.is( resource ) ) return Promise.reject( new IllegalArgumentError( "The resource isn't a resolvable pointer." ) );

			if( this.$context.registry.inScope( resource.$id ) ) return Promise.reject( new IllegalArgumentError( _getNotInContextMessage( resource.$id ) ) );
			const url:string = this.$context.resolve( resource.$id );

			return RequestService
				.get( url, requestOptions )
				.then<T & ResolvablePointer>( ( response:Response ) => {
					return this._parseResponseData<T>( response, url );
				} )
				.catch<T & ResolvablePointer>( ( response:Response ) => {
					if( response.status === 304 ) return resource as T & ResolvablePointer;
					return this._parseFailedResponse( response );
				} )
				;
		},

		save<T extends object>( this:HTTPRepositoryTrait, resource:ResolvablePointer, requestOptions?:RequestOptions ):Promise<T & ResolvablePointer> {
			if( ! ResolvablePointer.is( resource ) ) return Promise.reject( new IllegalArgumentError( "The resource isn't a resolvable pointer." ) );

			if( this.$context.registry.inScope( resource.$id ) ) return Promise.reject( new IllegalArgumentError( _getNotInContextMessage( resource.$id ) ) );
			const url:string = this.$context.resolve( resource.$id );

			if( ! resource.isDirty() ) return Promise.resolve( resource as T & ResolvablePointer );

			const body:string = JSON.stringify( resource );
			return RequestService
				.put( url, body, requestOptions )
				.then( () => resource as T & ResolvablePointer )
				.catch( this._parseFailedResponse.bind( this ) )
				;
		},

		saveAndRefresh<T extends object>( this:HTTPRepositoryTrait, resource:ResolvablePointer, requestOptions?:RequestOptions ):Promise<T & ResolvablePointer> {
			return this
				.save<T>( resource, requestOptions )
				.then( () => this.refresh<T>( resource, requestOptions ) )
				;
		},


		delete( this:HTTPRepositoryTrait, uri:string, requestOptions?:RequestOptions ):Promise<void> {
			if( this.$context.registry.inScope( uri ) ) return Promise.reject( new IllegalArgumentError( _getNotInContextMessage( uri ) ) );
			const url:string = this.$context.resolve( uri );

			return RequestService
				.delete( url, requestOptions )
				.then( () => {
					this.$context.registry.removePointer( url );
				} )
				.catch( this._parseFailedResponse.bind( this ) )
				;
		},


		_parseFailedResponse( this:HTTPRepositoryTrait, response:Response | Error | null ):Promise<never> {
			if( ! response || response instanceof Error ) return Promise.reject( response );

			if( ! statusCodeMap.has( response.status ) )
				return Promise.reject( new UnknownError( response.data, response ) );

			const error:HTTPError = new (statusCodeMap.get( response.status ))( response.data, response );
			return Promise.reject( error );
		},

		async _parseResponseData<T extends object>( this:HTTPRepositoryTrait<T & ResolvablePointer>, response:Response, id:string ):Promise<T & ResolvablePointer> {
			const resolvable:T & ResolvablePointer = this.$context.registry
				.getPointer( id, true );

			resolvable.$eTag = response.getETag();
			resolvable._resolved = true;

			return resolvable;
		},
	},


	isDecorated( object:object ):object is HTTPRepositoryTrait {
		return ModelDecorator
			.hasPropertiesFrom( HTTPRepositoryTrait.PROTOTYPE, object )
			;
	},

	decorate<T extends BaseGeneralRepository>( object:T ):T & HTTPRepositoryTrait {
		if( HTTPRepositoryTrait.isDecorated( object ) ) return;

		const resource:T & GeneralRepository = ModelDecorator
			.decorateMultiple( object, GeneralRepository );

		return ModelDecorator
			.definePropertiesFrom( HTTPRepositoryTrait.PROTOTYPE, resource );
	},
};
