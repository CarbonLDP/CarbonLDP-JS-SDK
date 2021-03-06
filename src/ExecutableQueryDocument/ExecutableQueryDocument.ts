import { BaseResolvableDocument, Document, ForcedMembers, OverriddenMembers } from "../Document/Document";
import { EventEmitterDocumentTrait } from "../Document/Traits/EventEmitterDocumentTrait";
import { SPARQLDocumentTrait } from "../Document/Traits/SPARQLDocumentTrait";
import { DocumentsRegistry } from "../DocumentsRegistry/DocumentsRegistry";
import { ExecutableQueryDocumentsRepository } from "../DocumentsRepository/ExecutableQueryDocumentsRepository";
import { Fragment } from "../Fragment/Fragment";
import { Response } from "../HTTP/Response";
import { ModelDecorator } from "../Model/ModelDecorator";
import { ModelFactory } from "../Model/ModelFactory";
import { ModelPrototype } from "../Model/ModelPrototype";
import { ModelSchema } from "../Model/ModelSchema";
import { ModelTypeGuard } from "../Model/ModelTypeGuard";
import { ObjectSchema } from "../ObjectSchema/ObjectSchema";
import { SPARQLRawResults } from "../SPARQL/RawResults";
import { isObject } from "../Utils";


import { C } from "../Vocabularies/C";
import { BaseExecutableQueryDocument } from "./BaseExecutableQueryDocument";
import { ExecutableQuerySPARQLResults } from "./ExecutableQuerySPARQLResults";
import { ExecutableQueryDocumentTrait } from "./Traits/ExecutableQueryDocumentTrait";
import { TransientExecutableQueryDocument } from "./TransientExecutableQueryDocument";

/**
 * Required properties for creating a {@link Document} object.
 */
export interface BaseResolvableExecutableQueryDocument extends BaseExecutableQueryDocument {
	/**
	 * Registry where the created {@link Document} will exist.
	 */
	$registry:DocumentsRegistry;
	/**
	 * Repository where the created {@link Document} can manage its data.
	 */
	$repository:ExecutableQueryDocumentsRepository;
}

/**
 * Model that represents a `c:ExecutableQueryDocument`
 */
export interface ExecutableQueryDocument extends Document {
	/**
	 * The stored SPARQL Query to execute on GET request with `ldp:ExecutableQuery` interaction model.
	 */
	readonly storedQuery:string;
	/**
	 * The last time the storedQuery was successfully executed and returned. When a new `c:ExecutableQueryDocument` is
	 * created, it has no `c:successfullyExecuted` property set.
	 */
	successfullyExecuted?:Date;

	/**
	 * Executes the stored query directly. Returns result in plain JSON Format.
	 */
	$execute():Promise<ExecutableQuerySPARQLResults>;

	/**
	 * Executes the stored query and returns the result in {@link SPARQLRawResults} format.
	 */
	$executeAsRAWSPARQLQuery():Promise<[ SPARQLRawResults, Response ]>;

	/**
	 * Modifies the document's stored query
	 */
	$modifyStoredQuery<T extends object>( newStoredQuery:string ):Promise<T & ExecutableQueryDocument>;

	/**
	 * Modifies the document's stored query and returns the updated document
	 */
	$modifyStoredQueryAndRefresh<T extends object>( newStoredQuery:string ):Promise<T & ExecutableQueryDocument>;

}

/**
 * Factory, decorator and utils of a {@link ExecutableQueryDocument} object.
 */
export type ExecutableQueryDocumentFactory =
	& ModelSchema<C[ "ExecutableQueryDocument" ]>
	& ModelPrototype<ExecutableQueryDocument, SPARQLDocumentTrait & EventEmitterDocumentTrait & ExecutableQueryDocumentTrait, OverriddenMembers>
	& ModelDecorator<ExecutableQueryDocument, BaseResolvableExecutableQueryDocument>
	& ModelTypeGuard<ExecutableQueryDocument>
	& ModelFactory<TransientExecutableQueryDocument, BaseExecutableQueryDocument>
	;


/**
 * Constant with the factory, decorator and/or utils for an {@link ExecutableQueryDocument} object.
 */
export const ExecutableQueryDocument:{

	/**
	 * Type of the model, in this case: `https://carbonldp.com/ns/v1/platform#Document`.
	 */
	TYPE:C["ExecutableQueryDocument"];

	/**
	 * Schema for the {@link Document}.
	 */
	SCHEMA:ObjectSchema;

	/**
	 * The object with the properties/methods to use in the decoration of a {@link Document}.
	 */
	PROTOTYPE:ExecutableQueryDocumentFactory["PROTOTYPE"];

	/**
	 * Returns true if the object is decorated with the specific properties and methods of a {@link Document}.
	 */
	isDecorated( object:object ):object is ExecutableQueryDocument;

	/**
	 * Returns true when the value provided is considered to be a {@link Document}.
	 */
	is( object:object ):object is ExecutableQueryDocument;

	/**
	 * Decorates the object with the properties and methods from the {@link Document} prototype.
	 */
	decorate<T extends object>( object:T & BaseResolvableDocument ):T & ExecutableQueryDocument;

	/**
	 * Creates a {@link Document} with the provided data.
	 */
	create<T extends object>( data:T & BaseExecutableQueryDocument ):T & TransientExecutableQueryDocument;

	/**
	 * Creates a {@link Document} from the provided object.
	 */
	createFrom<T extends object>( object:T & BaseExecutableQueryDocument ):T & TransientExecutableQueryDocument;
} = <ExecutableQueryDocumentFactory> {
	...Document,
	decorate<T extends BaseResolvableDocument>( object:T ):T & ExecutableQueryDocument {
		if( ExecutableQueryDocument.isDecorated( object ) ) return object;

		type ForcedT = T & ForcedMembers & Pick<ExecutableQueryDocument, "$__modelDecorator">;
		const base:ForcedT = Object.assign( object as T & ForcedMembers, {
			$__modelDecorator: Fragment,
		} );

		const target:ForcedT & SPARQLDocumentTrait & EventEmitterDocumentTrait & ExecutableQueryDocumentTrait = ModelDecorator
			.decorateMultiple( base, SPARQLDocumentTrait, EventEmitterDocumentTrait, ExecutableQueryDocumentTrait );

		return ModelDecorator
			.definePropertiesFrom( ExecutableQueryDocument.PROTOTYPE, target );
	},
	isDecorated( object:object ):object is ExecutableQueryDocument {
		return isObject( object )
			&& object.hasOwnProperty( "storedQuery" )
			&& ModelDecorator
				.hasPropertiesFrom( ExecutableQueryDocument.PROTOTYPE, object )
			;
	},

	is( object:object ):object is ExecutableQueryDocument {
		return TransientExecutableQueryDocument.is( object )
			&& SPARQLDocumentTrait.isDecorated( object )
			&& EventEmitterDocumentTrait.isDecorated( object )
			&& ExecutableQueryDocumentTrait.isDecorated( object )
			&& ExecutableQueryDocument.isDecorated( object )
			;
	},
	create: TransientExecutableQueryDocument.create,
	createFrom: TransientExecutableQueryDocument.createFrom,
	TYPE: C.ExecutableQueryDocument,
};
