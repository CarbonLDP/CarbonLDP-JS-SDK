import { IllegalArgumentError } from "../Errors/IllegalArgumentError";

import { ContainerType } from "../ObjectSchema/ContainerType";
import { DigestedObjectSchema } from "../ObjectSchema/DigestedObjectSchema";
import { DigestedObjectSchemaProperty } from "../ObjectSchema/DigestedObjectSchemaProperty";

import { Pointer } from "../Pointer/Pointer";
import { $PointerLibrary, _getPointer, PointerLibrary } from "../Pointer/PointerLibrary";

import { RDFList } from "../RDF/List";

import { Serializer } from "../RDF/Literal/Serializer";
import * as XSDSerializers from "../RDF/Literal/Serializers/XSD";

import { RDFNode } from "../RDF/Node";
import { URI } from "../RDF/URI";
import { RDFValue } from "../RDF/Value";

import { _isExistingValue, isFunction, isNull, isObject, isString, MapUtils } from "../Utils";

import { XSD } from "../Vocabularies/XSD";

import { _guessXSDType } from "./Utils";


// TODO: Use Literal.Parsers to parse literals
/**
 * Service with that can convert expanded JSON-LD objects to compacted resources and viceversa.
 */
export class JSONLDConverter {
	private readonly _literalSerializers:Map<string, Serializer>;

	/**
	 * Map object with data-type/serializer pairs for stringify the data of a resource when expanding it.
	 */
	get literalSerializers():Map<string, Serializer> { return this._literalSerializers; }

	private static getDefaultSerializers():Map<string, Serializer> {
		let literalSerializers:Map<string, Serializer> = new Map<string, Serializer>();

		literalSerializers.set( XSD.date, XSDSerializers.dateSerializer );
		literalSerializers.set( XSD.dateTime, XSDSerializers.dateTimeSerializer );
		literalSerializers.set( XSD.time, XSDSerializers.timeSerializer );
		literalSerializers.set( XSD.integer, XSDSerializers.integerSerializer );
		literalSerializers.set( XSD.int, XSDSerializers.integerSerializer );
		literalSerializers.set( XSD.unsignedInt, XSDSerializers.unsignedIntegerSerializer );
		literalSerializers.set( XSD.long, XSDSerializers.longSerializer );
		literalSerializers.set( XSD.unsignedLong, XSDSerializers.unsignedLongSerializer );
		literalSerializers.set( XSD.float, XSDSerializers.floatSerializer );
		literalSerializers.set( XSD.double, XSDSerializers.floatSerializer );
		literalSerializers.set( XSD.boolean, XSDSerializers.booleanSerializer );
		literalSerializers.set( XSD.string, XSDSerializers.stringSerializer );

		return literalSerializers;
	}

	/**
	 * Creates a JSONLD Converter from optional literal serializers.
	 * @param literalSerializers Serializers to be set in the instance.
	 */
	constructor( literalSerializers?:Map<string, Serializer> ) {
		this._literalSerializers = literalSerializers ?
			MapUtils.extend( new Map(), literalSerializers ) :
			JSONLDConverter.getDefaultSerializers()
		;
	}

	/**
	 * Assigns the data of the expanded JSON-LD objects to the target objects in a friendly mode.
	 * i.e. without the JSON-LD Syntax Tokens and parsed values, in accordance to the schema provided.
	 * @param expandedObjects The JSON-LD objects to compact.
	 * @param targetObjects The target objects where will be added the compact data of the expanded object.
	 * @param digestedSchema The schema that describes how compact the expanded object.
	 * @param pointerLibrary An object from where one can obtain the pointers of resources.
	 */
	compact( expandedObjects:object[], targetObjects:object[], digestedSchema:DigestedObjectSchema, pointerLibrary:PointerLibrary | $PointerLibrary ):object[];
	/**
	 * Assigns the data of the expanded JSON-LD object to the target object in a friendly mode.
	 * i.e. without the JSON-LD Syntax Tokens and parsed values, in accordance to the schema provided.
	 * @param expandedObject The JSON-LD object to compact.
	 * @param targetObject The target object where will be added the compact data of the expanded object.
	 * @param digestedSchema The schema that describes how compact the expanded object.
	 * @param pointerLibrary An object from where one can obtain the pointers of resources.
	 * @param strict Flag to ignore the compaction of properties that are not defined in the schema.
	 */
	compact( expandedObject:object, targetObject:object, digestedSchema:DigestedObjectSchema, pointerLibrary:PointerLibrary | $PointerLibrary, strict?:boolean ):object;
	/**
	 * Assigns the data of the expanded JSON-LD objects into new objects in a friendly mode.
	 * i.e. without the JSON-LD Syntax Tokens and parsed values, in accordance to the schema provided.
	 * @param expandedObjects The JSON-LD objects to compact.
	 * @param digestedSchema The schema that describes how compact the expanded object.
	 * @param pointerLibrary An object from where one can obtain the pointers of resources.
	 */
	compact( expandedObjects:object[], digestedSchema:DigestedObjectSchema, pointerLibrary:PointerLibrary | $PointerLibrary ):object[];
	/**
	 * Assigns the data of the expanded JSON-LD object into a new object in a friendly mode.
	 * i.e. without the JSON-LD Syntax Tokens and parsed values, in accordance to the schema provided.
	 * @param expandedObject The JSON-LD object to compact.
	 * @param digestedSchema The schema that describes how compact the expanded object.
	 * @param pointerLibrary An object from where one can obtain the pointers of resources.
	 */
	compact( expandedObject:object, digestedSchema:DigestedObjectSchema, pointerLibrary:PointerLibrary | $PointerLibrary ):object;
	compact( expandedObjectOrObjects:any, targetObjectOrObjectsOrDigestedContext:any, digestedSchemaOrPointerLibrary:any, pointerLibrary?:PointerLibrary | $PointerLibrary, strict?:boolean ):any {
		let targetObjectOrObjects:any = !pointerLibrary ? null : targetObjectOrObjectsOrDigestedContext;
		let digestedSchema:any = !pointerLibrary ? targetObjectOrObjectsOrDigestedContext : digestedSchemaOrPointerLibrary;
		pointerLibrary = !pointerLibrary ? digestedSchemaOrPointerLibrary : pointerLibrary;

		if( !Array.isArray( expandedObjectOrObjects ) ) return this.__compactSingle( expandedObjectOrObjects, targetObjectOrObjects, digestedSchema, pointerLibrary!, strict );

		let expandedObjects:Object[] = expandedObjectOrObjects;
		let targetObjects:Object[] = !!targetObjectOrObjects ? targetObjectOrObjects : [];
		for( let i:number = 0, length:number = expandedObjects.length; i < length; i ++ ) {
			let expandedObject:Object = expandedObjects[ i ];
			let targetObject:Object = targetObjects[ i ] = !!targetObjects[ i ] ? targetObjects[ i ] : {};

			this.__compactSingle( expandedObject, targetObject, digestedSchema, pointerLibrary!, strict );
		}

		return targetObjects;
	}

	/**
	 * Creates an expanded JSON-LD object from the compacted objects in accordance to the schema provided.
	 * @param compactedObjects The compacted resources to expand.
	 * @param generalSchema The general schema that applies to any compacted resource.
	 * @param digestedSchema The specific schema that applies to the compacted resources.
	 */
	expand( compactedObjects:object[], generalSchema:DigestedObjectSchema, digestedSchema:DigestedObjectSchema ):RDFNode[];
	/**
	 * Creates an expanded JSON-LD object from the compacted object in accordance to the schema provided.
	 * @param compactedObject The compacted resource to expand.
	 * @param generalSchema The general schema that applies to any compacted resource.
	 * @param digestedSchema The specific schema that applies to the compacted resource.
	 */
	expand( compactedObject:object, generalSchema:DigestedObjectSchema, digestedSchema:DigestedObjectSchema ):RDFNode;
	expand( compactedObjectOrObjects:object[], generalSchema:DigestedObjectSchema, digestedSchema:DigestedObjectSchema ):any {
		if( !Array.isArray( compactedObjectOrObjects ) ) return this.__expandSingle( compactedObjectOrObjects, generalSchema, digestedSchema );
	}


	/**
	 * Compacts and updates the data of the expanded JSON-LD object into the target object.
	 * i.e. without the JSON-LD Syntax Tokens and parsed values, in accordance to the schema provided.
	 * @param target Object to be updated from the expanded one.
	 * @param node The expanded object to be compacted and updated into the target.
	 * @param digestedSchema The schema that describes how compact the expanded object.
	 * @param pointerLibrary An object from where one can obtain the pointers of resources.
	 * @param strict Flag to ignore the compaction of properties that are not defined in the schema.
	 */
	update( target:object, node:RDFNode, digestedSchema:DigestedObjectSchema, pointerLibrary:PointerLibrary | $PointerLibrary, strict?:boolean ):void {
		const compactedData:object = this.compact( node, {}, digestedSchema, pointerLibrary, strict );

		new Set( [
			...Object.getOwnPropertyNames( target ),
			...Object.keys( compactedData ),
		] ).forEach( key => {
			if( key.startsWith( "$" ) ) return;
			if( isFunction( target[ key ] ) ) return;

			if( !compactedData.hasOwnProperty( key ) ) {
				if( !strict || digestedSchema.properties.has( key ) ) delete target[ key ];
				return;
			}

			if( !Array.isArray( target[ key ] ) ) {
				target[ key ] = compactedData[ key ];
				return;
			}

			const values:any[] = Array.isArray( compactedData[ key ] ) ? compactedData[ key ] : [ compactedData[ key ] ];
			target[ key ].length = 0;
			target[ key ].push( ...values );
		} );
	}


	private __expandSingle( compactedObject:Object, generalSchema:DigestedObjectSchema, digestedSchema:DigestedObjectSchema ):RDFNode {
		let expandedObject:any = {};

		expandedObject[ "@id" ] = !!compactedObject[ "$id" ] ? compactedObject[ "$id" ] : "";

		if( compactedObject[ "types" ] ) {
			const types:string[] = Array.isArray( compactedObject[ "types" ] ) ?
				compactedObject[ "types" ] : [ compactedObject[ "types" ] ];

			if( types.length )
				expandedObject[ "@type" ] = types
					.map( type => generalSchema.resolveURI( type, { vocab: true, base: true } ) );
		}

		for( const propertyName of Object.keys( compactedObject ) ) {
			if( propertyName === "$id" ) continue;
			if( propertyName === "types" ) continue;

			const expandedPropertyName:string = digestedSchema.resolveURI( propertyName, { vocab: true } );
			if( URI.isRelative( expandedPropertyName ) ) continue;

			const expandedValue:any[] | null = this.__expandProperty( propertyName, compactedObject[ propertyName ], digestedSchema, generalSchema );
			if( expandedValue === null ) continue;

			expandedObject[ expandedPropertyName ] = expandedValue;
		}

		return expandedObject;
	}

	private __expandProperty( propertyName:string, propertyValue:any, digestedSchema:DigestedObjectSchema, generalSchema:DigestedObjectSchema ):any[] | null {
		const definition:DigestedObjectSchemaProperty | undefined = digestedSchema.properties.get( propertyName );

		const propertyContainer:ContainerType | undefined | null = definition ? definition.containerType : void 0;
		if( propertyContainer === ContainerType.LANGUAGE ) return this.__expandPropertyLanguageMap( propertyValue );

		propertyValue = Array.isArray( propertyValue ) ? propertyValue : [ propertyValue ];
		if( propertyContainer === null ) propertyValue = [ propertyValue[ 0 ] ];

		const propertyType:boolean | null = definition ? definition.literal : null;
		const expandedValues:any[] = propertyType === true ?
			this.__expandPropertyLiteral( propertyValue, definition!, digestedSchema ) :
			propertyType === false ?
				this.__expandPropertyPointer( propertyValue, digestedSchema, generalSchema ) :
				this.__expandPropertyValue( propertyValue, digestedSchema, generalSchema )
		;

		const filteredValues:any[] = expandedValues.filter( value => value !== null );
		if( !filteredValues.length ) return null;

		if( propertyContainer === ContainerType.LIST ) return [
			{ "@list": filteredValues },
		];

		return filteredValues;
	}

	private __expandPropertyValue( propertyValue:any[], digestedSchema:DigestedObjectSchema, generalSchema:DigestedObjectSchema ):any[] {
		return propertyValue.map( value => this.__expandValue( value, digestedSchema, generalSchema ) );
	}

	private __expandPropertyPointer( propertyValue:any[], digestedSchema:DigestedObjectSchema, generalSchema:DigestedObjectSchema ):any[] {
		return propertyValue.map( value => this.__expandPointerValue( value, digestedSchema, generalSchema ) );
	}

	private __expandPropertyLiteral( propertyValue:any[], definition:DigestedObjectSchemaProperty, digestedSchema:DigestedObjectSchema ):any[] {
		const literalType:string = digestedSchema.resolveURI( definition.literalType!, { vocab: true, base: true } );
		const expandedValues:any[] = propertyValue.map( value => this.__expandLiteralValue( value, literalType ) );

		if( definition.language ) expandedValues.forEach( value => value[ "@language" ] = definition.language );

		return expandedValues;
	}

	private __expandPropertyLanguageMap( propertyValue:any ):any {
		if( !isObject( propertyValue ) ) {
			// TODO: Warn of data loss
			return null;
		}

		let mapValues:Array<any> = [];
		for( const languageTag of Object.keys( propertyValue ) ) {
			// TODO: Validate language tags

			let serializedValue:string = this.literalSerializers.get( XSD.string )!.serialize( propertyValue[ languageTag ] );
			mapValues.push( { "@value": serializedValue, "@type": XSD.string, "@language": languageTag } );
		}

		return mapValues;
	}

	private __expandPointerValue( propertyValue:any, digestedSchema:DigestedObjectSchema, generalSchema:DigestedObjectSchema ):RDFNode | null {
		const isStringID:boolean = isString( propertyValue );
		const id:string = Pointer.is( propertyValue ) ?
			propertyValue.$id :
			isStringID ?
				propertyValue :
				null;

		// TODO: Warn of data loss
		if( !id ) return null;

		const resolved:string = generalSchema.resolveURI( id, { vocab: isStringID } );
		return { "@id": resolved };
	}

	private __expandValue( propertyValue:any, digestedSchema:DigestedObjectSchema, generalSchema:DigestedObjectSchema ):any {
		// TODO: Lists of lists are not currently supported by the spec
		if( Array.isArray( propertyValue ) ) return null;

		return Pointer.is( propertyValue ) ?
			this.__expandPointerValue( propertyValue, generalSchema, digestedSchema ) :
			this.__expandLiteralValue( propertyValue, _guessXSDType( propertyValue ) )
			;
	}

	private __expandLiteralValue( literalValue:any, literalType:string | null ):any | null {
		if( literalType === null ) return null;

		// TODO: Warn of data loss
		if( !this.literalSerializers.has( literalType ) ) return null;

		const serializedValue:string = this.literalSerializers
			.get( literalType )!
			.serialize( literalValue );
		return { "@value": serializedValue, "@type": literalType };
	}


	private __compactSingle( expandedObject:any, targetObject:any, digestedSchema:DigestedObjectSchema, pointerLibrary:PointerLibrary | $PointerLibrary, strict?:boolean ):void {
		if( !expandedObject[ "@id" ] ) throw new IllegalArgumentError( "The expandedObject doesn't have an @id defined." );

		targetObject[ "$id" ] = expandedObject[ "@id" ];
		targetObject[ "types" ] = !!expandedObject[ "@type" ] ? expandedObject[ "@type" ] : [];

		const propertyURINameMap:Map<string, string> = this.__getPropertyURINameMap( digestedSchema );
		for( const propertyURI of Object.keys( expandedObject ) ) {
			if( propertyURI === "@id" ) continue;
			if( propertyURI === "@type" ) continue;

			const propertyValues:any[] = expandedObject[ propertyURI ];
			if( !_isExistingValue( propertyValues ) ) continue;

			if( !propertyURINameMap.has( propertyURI ) && strict ) continue;

			const propertyName:string = propertyURINameMap.has( propertyURI ) ?
				propertyURINameMap.get( propertyURI )! :
				digestedSchema.vocab ?
					URI.getRelativeURI( propertyURI, digestedSchema.vocab ) :
					propertyURI
			;

			const targetValue:any = this.__getPropertyValue( propertyName, propertyValues, digestedSchema, pointerLibrary );
			if( targetValue === null || targetValue === void 0 ) continue;

			targetObject[ propertyName ] = targetValue;
		}

		return targetObject;
	}

	private __getPropertyContainerType( propertyValues:any ):ContainerType | null {
		if( propertyValues.length === 1 ) {
			if( RDFList.is( propertyValues[ 0 ] ) ) return ContainerType.LIST;
		} else {
			return ContainerType.SET;
		}

		return null;
	}

	private __getPropertyValue( propertyName:string, propertyValues:any[], digestedSchema:DigestedObjectSchema, pointerLibrary:PointerLibrary | $PointerLibrary ):any {
		const definition:DigestedObjectSchemaProperty | undefined = digestedSchema.properties.get( propertyName );
		const propertyContainer:ContainerType | null = definition ?
			definition.containerType :
			this.__getPropertyContainerType( propertyValues );

		if( propertyContainer === ContainerType.LANGUAGE ) {
			return RDFNode.getPropertyLanguageMap( propertyValues );
		}

		if( propertyContainer === ContainerType.LIST ) {
			const list:RDFList | undefined = RDFNode.getList( propertyValues );

			if( !list ) return null;
			propertyValues = list[ "@list" ];
		}

		const propertyType:boolean | null = definition ? definition.literal : null;

		if( propertyType === true && (definition && definition.language) ) {
			propertyValues = propertyValues.filter( value => value[ "@language" ] === definition.language );
		}

		if( propertyContainer === null ) propertyValues = [ propertyValues[ 0 ] ];

		const compactedValues:any[] | undefined = propertyType === true ?
			this.__compactPropertyLiteral( propertyValues, definition!, digestedSchema ) :
			propertyType === false ?
				this.__getPropertyPointers( propertyValues, pointerLibrary ) :
				this.__getProperties( propertyValues, pointerLibrary )
		;
		if( !compactedValues ) return null;

		const filteredValues:any[] = compactedValues.filter( value => value !== null );
		if( !filteredValues.length ) return null;

		if( propertyContainer === null ) return filteredValues[ 0 ];
		return filteredValues;
	}

	private __getPropertyURINameMap( digestedSchema:DigestedObjectSchema ):Map<string, string> {
		const map:Map<string, string> = new Map<string, string>();
		digestedSchema.properties.forEach( ( definition:DigestedObjectSchemaProperty, propertyName:string ):void => {
			const uri:string = digestedSchema.resolveURI( definition.uri!, { vocab: true } );
			map.set( uri, propertyName );
		} );
		return map;
	}

	private __compactPropertyLiteral( propertyValues:any[], definition:DigestedObjectSchemaProperty, digestedSchema:DigestedObjectSchema ):any[] | undefined {
		const literalType:string = definition.literalType === null ?
			XSD.string : digestedSchema.resolveURI( definition.literalType, { vocab: true, base: true } );

		return RDFNode.getPropertyLiterals( propertyValues, literalType );
	}

	private __getProperties( propertyValues:any[], pointerLibrary:PointerLibrary | $PointerLibrary ):any[] | undefined {
		if( !Array.isArray( propertyValues ) ) return;

		return propertyValues
			.map( RDFValue.parse.bind( null, pointerLibrary ) )
			.filter( value => !isNull( value ) )
			;
	}

	private __getPropertyPointers( propertyValues:any[], pointerLibrary:PointerLibrary | $PointerLibrary ):any[] | undefined {
		if( !Array.isArray( propertyValues ) ) return;

		return propertyValues
			.filter( RDFNode.is )
			.map( RDFNode.getID )
			.map( _getPointer.bind( null, pointerLibrary ) )
			.filter( pointer => !isNull( pointer ) )
			;
	}

}
