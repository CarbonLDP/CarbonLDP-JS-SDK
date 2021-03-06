import { isBNodeLabel } from "sparqler/core";
import {
	BlankNodeToken,
	CollectionToken,
	IRIRefToken,
	IRIToken,
	LanguageToken,
	LiteralToken,
	ObjectToken,
	PathToken,
	PrefixedNameToken,
	PropertyToken,
	RDFLiteralToken,
	SubjectToken,
} from "sparqler/tokens";

import { Context } from "../Context/Context";

import { _guessXSDType } from "../JSONLD/Utils";

import { ContainerType } from "../ObjectSchema/ContainerType";
import { DigestedObjectSchema } from "../ObjectSchema/DigestedObjectSchema";
import { DigestedObjectSchemaProperty } from "../ObjectSchema/DigestedObjectSchemaProperty";
import { ObjectSchemaDigester } from "../ObjectSchema/ObjectSchemaDigester";
import { PointerType } from "../ObjectSchema/PointerType";

import { Pointer } from "../Pointer/Pointer";

import { QueryablePointer } from "../QueryDocuments/QueryablePointer";
import { QueryableProperty } from "../QueryDocuments/QueryableProperty";

import { Resource } from "../Resource/Resource";

import { _isExistingValue, isString } from "../Utils";

import { XSD } from "../Vocabularies/XSD";

import { AddToken, DeleteToken, LDPatchToken, PrefixToken, SliceToken, UpdateListToken } from "./Tokens";


interface ArrayDelta {
	toAdd:ObjectToken[];
	toDelete:ObjectToken[];
}

interface UpdateDelta {
	slice:[ number | undefined, number | undefined ];
	objects:ObjectToken[];
}

const typesDefinition:DigestedObjectSchemaProperty = new DigestedObjectSchemaProperty();
typesDefinition.literal = false;
typesDefinition.pointerType = PointerType.ID;
typesDefinition.containerType = ContainerType.SET;


type TargetResource = Partial<Pick<Resource, "types"> & Pick<QueryablePointer, "$_queryableMetadata">>;


/**
 * Creates a LD Patch delta for the resources provided.
 */
export class DeltaCreator {

	private prefixesMap:Map<string, PrefixToken>;
	private context:Context;

	private readonly addToken:AddToken;
	private readonly deleteToken:DeleteToken;
	private readonly updateLists:UpdateListToken[];

	/**
	 * Creates the instant with the provided context as the addition data source.
	 * @param context The context of the resources to create its LD Patch delta.
	 */
	constructor( context:Context ) {
		this.prefixesMap = new Map();
		this.context = context;

		this.addToken = new AddToken();
		this.deleteToken = new DeleteToken();
		this.updateLists = [];
	}

	/**
	 * Returns the LD Patch string of the resources set in {@link DeltaCreator.addResource()}.
	 */
	getPatch():string {
		const patch:LDPatchToken = new LDPatchToken();

		this.prefixesMap.forEach( prefix => patch.prologues.push( prefix ) );

		patch.statements.push( ...this.updateLists );
		if( this.addToken.triples.length ) patch.statements.push( this.addToken );
		if( this.deleteToken.triples.length ) patch.statements.push( this.deleteToken );

		return `${ patch }`;
	}

	/**
	 * Add the resources states ({@param previousResource} and {@param currentResource}) from where to create the delta.
	 * @param id The URI of the resource been added.
	 * @param previousResource The previous state of the resource to compare for its delta.
	 * @param currentResource The current state of the resource to compare for its delta.
	 */
	addResource( id:string, previousResource:object, currentResource:object ):void {
		const schema:DigestedObjectSchema = this.__getSchema( id, previousResource, currentResource );

		const resource:IRIToken | BlankNodeToken = isBNodeLabel( id ) ?
			new BlankNodeToken( id ) : this.__compactIRI( schema, id );

		const updateLists:UpdateListToken[] = [];
		const addTriples:SubjectToken = new SubjectToken( resource );
		const deleteTriples:SubjectToken = new SubjectToken( resource );

		new Set( [
			"types",
			...Object.keys( previousResource ),
			...Object.keys( currentResource ),
		] ).forEach( propertyName => {
			if( propertyName === "$id" ) return;

			const predicateURI:IRIToken | "a" = propertyName === "types" ?
				"a" : this._getPropertyIRI( schema, propertyName );

			const definition:DigestedObjectSchemaProperty | undefined = predicateURI === "a" ?
				typesDefinition : schema.getProperty( propertyName );

			const oldValue:any = previousResource[ propertyName ];
			const newValue:any = currentResource[ propertyName ];

			if( definition && definition.containerType === ContainerType.LIST && _isExistingValue( oldValue ) ) {
				const listUpdates:UpdateDelta[] = [];

				if( !_isExistingValue( newValue ) ) {
					deleteTriples.addProperty( new PropertyToken( predicateURI ).addObject( new CollectionToken() ) );
					listUpdates.push( { slice: [ 0, void 0 ], objects: [] } );

				} else {
					definition.containerType = ContainerType.SET;

					listUpdates.push( ...__getListDelta(
						this.__getObjects( oldValue, schema, definition ),
						this.__getObjects( newValue, schema, definition )
					) );
				}

				if( !listUpdates.length ) return;

				this.__addPrefixFrom( predicateURI, schema );
				listUpdates.forEach( updateDelta => {
					const collection:CollectionToken = new CollectionToken();

					updateDelta.objects.forEach( object => {
						collection.addObject( object );
						this.__addPrefixFrom( object, schema );
					} );

					updateLists.push( new UpdateListToken(
						resource,
						predicateURI as IRIToken,
						updateDelta.objects.length ?
							new SliceToken( updateDelta.slice[ 0 ], updateDelta.slice[ 0 ] ) :
							new SliceToken( ...updateDelta.slice ),
						collection
					) );
				} );

			} else {
				const oldObjects:ObjectToken[] = this.__getObjects( oldValue, schema, definition );
				const newObjects:ObjectToken[] = this.__getObjects( newValue, schema, definition );

				const setDelta:ArrayDelta = __getArrayDelta( oldObjects, newObjects );

				const addValues:( objects:ObjectToken[], triple:SubjectToken ) => void = ( objects, triple ) => {
					if( !objects.length ) return;

					const property:PropertyToken = new PropertyToken( predicateURI );
					objects.forEach( object => {
						property.addObject( object );
						this.__addPrefixFrom( object, schema );
					} );

					triple.addProperty( property );
				};

				addValues( setDelta.toAdd, addTriples );
				addValues( setDelta.toDelete, deleteTriples );
			}
		} );

		this.updateLists.push( ...updateLists );
		updateLists.forEach( x => this.__addPrefixFrom( x.predicate, schema ) );

		if( addTriples.properties.length ) this.addToken.triples.push( addTriples );
		addTriples.properties.forEach( x => this.__addPrefixFrom( x.verb, schema ) );

		if( deleteTriples.properties.length ) this.deleteToken.triples.push( deleteTriples );
		deleteTriples.properties.forEach( x => this.__addPrefixFrom( x.verb, schema ) );

		this.__addPrefixFrom( resource, schema );
	}

	private __getSchema( $id:string, previousResource:TargetResource, currentResource:TargetResource ):DigestedObjectSchema {
		const typesSet:Set<string> = new Set();

		if( "types" in previousResource ) previousResource
			.types!.forEach( typesSet.add, typesSet );
		if( "types" in currentResource ) currentResource
			.types!.forEach( typesSet.add, typesSet );


		const mergedResource:object = { $id, types: Array.from( typesSet ) };
		const baseSchema:DigestedObjectSchema = this.context.registry
			.getSchemaFor( mergedResource );

		const queryableProperty:QueryableProperty | undefined = previousResource.$_queryableMetadata || previousResource.$_queryableMetadata;
		if( !queryableProperty ) return baseSchema;

		return ObjectSchemaDigester._combineSchemas( [
			baseSchema,
			queryableProperty.getSchema(),
		] );
	}

	private _getPropertyIRI( schema:DigestedObjectSchema, propertyName:string ):IRIToken {
		const propertyDefinition:DigestedObjectSchemaProperty | undefined = schema.properties.get( propertyName );
		const uri:string = propertyDefinition && propertyDefinition.uri ?
			propertyDefinition.uri :
			propertyName;

		return this.__compactIRI( schema, uri );
	}

	private __getObjects( value:any, schema:DigestedObjectSchema, definition?:DigestedObjectSchemaProperty ):ObjectToken[] {
		const values:any[] = (Array.isArray( value ) ?
				!definition || definition.containerType !== null ? value : value.slice( 0, 1 ) :
				[ value ]
		).filter( _isExistingValue );

		if( definition && definition.containerType === ContainerType.LIST ) {
			if( !_isExistingValue( value ) ) return [];

			const collection:CollectionToken = new CollectionToken();
			collection.objects.push( ...this.__expandValues( values, schema, definition ) );

			return [ collection ];
		}

		if( definition && definition.containerType === ContainerType.LANGUAGE ) {
			return this.__expandLanguageMap( values, schema );
		}

		return this.__expandValues( values, schema, definition );
	}

	private __expandValues( values:any[], schema:DigestedObjectSchema, definition?:DigestedObjectSchemaProperty ):ObjectToken[] {
		const areDefinedLiteral:boolean | null = definition && definition.literal !== null ? definition.literal : null;

		return values
			.map( value => {
				const isLiteral:boolean = areDefinedLiteral !== null ? areDefinedLiteral : !Pointer.is( value );

				if( isLiteral ) return this.__expandLiteral( value, schema, definition );
				return this.__expandPointer( value, schema );
			} )
			.filter( _isExistingValue );
	}

	private __expandLanguageMap( values:any[], schema:DigestedObjectSchema ):ObjectToken[] {
		if( !values.length ) return [];
		const languageMap:object = values[ 0 ];

		return Object
			.keys( languageMap )
			.map( key => {
				const value:any = languageMap[ key ];

				const tempDefinition:DigestedObjectSchemaProperty = new DigestedObjectSchemaProperty();
				tempDefinition.language = key;
				tempDefinition.literalType = XSD.string;

				return this.__expandLiteral( value, schema, tempDefinition );
			} )
			.filter( _isExistingValue );
	}

	private __expandPointer( value:any, schema:DigestedObjectSchema ):IRIToken | BlankNodeToken | null {
		const id:string = Pointer.is( value ) ? value.$id : value;
		if( !isString( id ) ) return null;

		return isBNodeLabel( id ) ?
			new BlankNodeToken( id ) :
			this.__compactIRI( schema, id );
	}

	private __expandLiteral( value:any, schema:DigestedObjectSchema, definition?:DigestedObjectSchemaProperty ):LiteralToken | null {
		const type:string | null = definition && definition.literalType ?
			definition.literalType :
			_guessXSDType( value );

		if( type === null || !this.context.jsonldConverter.literalSerializers.has( type ) ) return null;

		value = this.context.jsonldConverter.literalSerializers.get( type )!.serialize( value );
		if( type !== XSD.string )
			return new RDFLiteralToken( value, this.__compactIRI( schema, type ) );

		if( definition && typeof definition.language === "string" )
			return new RDFLiteralToken( value, new LanguageToken( definition.language ) );

		return new LiteralToken( value );
	}

	private __compactIRI( schema:DigestedObjectSchema, iri:string ):IRIToken {
		iri = schema.resolveURI( iri, { vocab: true } );

		const matchPrefix:[ string, string ] | undefined = Array.from( schema.prefixes.entries() )
			.find( ( [ , prefixURI ] ) => iri.startsWith( prefixURI ) );

		if( !matchPrefix ) return new IRIRefToken( iri );

		return new PrefixedNameToken( matchPrefix[ 0 ], iri.substr( matchPrefix[ 1 ].length ) );
	}

	private __addPrefixFrom( object:ObjectToken | PathToken, schema:DigestedObjectSchema ):void {
		if( object === "a" ) return;

		if( "objects" in object )
			return object.objects.forEach( collectionObject => {
				this.__addPrefixFrom( collectionObject, schema );
			} );

		if( "type" in object )
			return this.__addPrefixFrom( object.type!, schema );

		if( object.token !== "prefixedName" ) return;

		const namespace:string = object.namespace;
		if( this.prefixesMap.has( namespace ) ) return;

		const iri:string = schema.prefixes.get( namespace )!;
		this.prefixesMap.set( namespace, new PrefixToken( namespace, new IRIRefToken( iri ) ) );
	}

}

function __getArrayDelta( oldValues:ObjectToken[], newValues:ObjectToken[] ):ArrayDelta {
	const objectMapper:( object:ObjectToken ) => [ string, ObjectToken ] = object => [ `${ object }`, object ];
	const toAdd:Map<string, ObjectToken> = new Map( newValues.map( objectMapper ) );
	const toDelete:Map<string, ObjectToken> = new Map( oldValues.map( objectMapper ) );

	toAdd.forEach( ( value, identifier ) => {
		if( !toDelete.has( identifier ) ) return;

		toDelete.delete( identifier );
		toAdd.delete( identifier );
	} );

	return {
		toAdd: Array.from( toAdd.values() ),
		toDelete: Array.from( toDelete.values() ),
	};
}

function __getListDelta( oldValues:ObjectToken[], newValues:ObjectToken[] ):UpdateDelta[] {
	interface Node {
		identifier:string;
		object:ObjectToken;
		index:number;
	}

	const nodeMapper:( object:ObjectToken, index:number ) => Node = ( object, index ) => ({
		identifier: `${ object }`,
		object,
		index,
	});
	const oldPositions:Node[] = oldValues.map( nodeMapper );
	const newPositions:Node[] = newValues.map( nodeMapper );

	const addsSet:Set<Node> = new Set( newPositions );
	const deletes:Node[] = [];

	let offset:number = 0;
	let remnants:Node[] = newPositions;

	oldPositions.forEach( oldNode => {
		const currentIndex:number = remnants.findIndex( newNode => newNode.identifier === oldNode.identifier );

		if( currentIndex === - 1 ) {
			oldNode.index -= offset ++;
			deletes.push( oldNode );
		} else {
			addsSet.delete( remnants[ currentIndex ] );
			remnants = remnants.slice( currentIndex + 1 );
		}
	} );

	const updates:UpdateDelta[] = [];

	let last:UpdateDelta | undefined;
	deletes.forEach( node => {
		if( last && last.slice[ 0 ] === node.index ) {
			last.slice = [ last.slice[ 0 ], last.slice[ 1 ]! + 1 ];
			return;
		}

		updates.push( last = {
			slice: [ node.index, node.index + 1 ],
			objects: [],
		} );
	} );

	last = void 0;
	addsSet.forEach( node => {
		if( last && last.slice[ 1 ] === node.index ) {
			last.slice = [ last.slice[ 0 ], node.index + 1 ];
			last.objects.push( node.object );
			return;
		}

		updates.push( last = {
			slice: [ node.index, node.index + 1 ],
			objects: [ node.object ],
		} );
	} );

	return updates;
}
