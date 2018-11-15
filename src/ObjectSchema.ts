import {
	IllegalArgumentError,
	InvalidJSONLDSyntaxError,
} from "./Errors";
import { URI } from "./RDF/URI";
import * as Utils from "./Utils";
import { XSD } from "./Vocabularies/XSD";

export interface ObjectSchemaProperty {
	"@id"?:string;
	"@type"?:string;
	"@language"?:string;
	"@container"?:string;
}

export interface ObjectSchema {
	"@base"?:string;
	"@vocab"?:string;
	"@index"?:object;
	"@language"?:string;
	"@reverse"?:object;

	[ name:string ]:(string | ObjectSchemaProperty);
}

export enum ContainerType {
	SET,
	LIST,
	LANGUAGE,
}

export enum PointerType {
	ID,
	VOCAB,
}

export class DigestedObjectSchemaProperty {
	uri:string = null;
	literal:boolean = null;
	literalType:string = null;
	pointerType:PointerType = null;
	language?:string;
	containerType:ContainerType = null;
}

export class DigestedObjectSchema {
	base:string;
	language:string;
	vocab?:string;
	prefixes:Map<string, string>;
	properties:Map<string, DigestedObjectSchemaProperty>;

	constructor() {
		this.base = "";
		this.language = null;
		this.prefixes = new Map<string, string>();
		this.properties = new Map<string, DigestedObjectSchemaProperty>();
	}

}

export interface ObjectSchemaResolver {
	getGeneralSchema():DigestedObjectSchema;

	hasSchemaFor( object:object, path?:string ):boolean;

	getSchemaFor( object:object, path?:string ):DigestedObjectSchema;
}

export class ObjectSchemaDigester {

	static digestSchema( schema:ObjectSchema ):DigestedObjectSchema;
	static digestSchema( schemas:ObjectSchema[] ):DigestedObjectSchema;
	static digestSchema( schemas:ObjectSchema | ObjectSchema[] ):DigestedObjectSchema {
		if( ! Array.isArray( schemas ) ) return ObjectSchemaDigester._digestSchema( schemas );

		const digestedSchemas:DigestedObjectSchema[] = schemas
			.map( schema => ObjectSchemaDigester._digestSchema( schema ) );

		return ObjectSchemaDigester._combineSchemas( digestedSchemas );
	}

	static digestProperty( name:string, definition:ObjectSchemaProperty, digestedSchema?:DigestedObjectSchema ):DigestedObjectSchemaProperty {
		const digestedDefinition:DigestedObjectSchemaProperty = new DigestedObjectSchemaProperty();

		if( "@id" in definition ) {
			const uri:any = definition[ "@id" ];

			if( URI.isPrefixed( name ) ) throw new IllegalArgumentError( "A prefixed property cannot have assigned another URI." );
			if( ! Utils.isString( uri ) ) throw new IllegalArgumentError( "@id needs to point to a string" );

			digestedDefinition.uri = uri;
		} else {
			digestedDefinition.uri = name;
		}

		if( "@type" in definition ) {
			let type:any = definition[ "@type" ];
			if( ! Utils.isString( type ) ) throw new IllegalArgumentError( "@type needs to point to a string" );

			if( type === "@id" || type === "@vocab" ) {
				digestedDefinition.literal = false;
				digestedDefinition.pointerType = type === "@id" ? PointerType.ID : PointerType.VOCAB;

			} else {
				if( URI.isRelative( type ) && type in XSD ) type = XSD[ type ];

				digestedDefinition.literal = true;
				digestedDefinition.literalType = type;
			}
		}

		if( "@language" in definition ) {
			const language:string = definition[ "@language" ];
			if( language !== null && ! Utils.isString( language ) ) throw new IllegalArgumentError( "@language needs to point to a string or null." );

			digestedDefinition.literal = true;
			digestedDefinition.language = language;
		}

		if( "@container" in definition ) {
			switch( definition[ "@container" ] ) {
				case "@set":
					digestedDefinition.containerType = ContainerType.SET;
					break;

				case "@list":
					digestedDefinition.containerType = ContainerType.LIST;
					break;

				case "@language":
					if( Utils.isString( digestedDefinition.language ) ) throw new IllegalArgumentError( "@container cannot be set to @language when the property definition already contains an @language tag." );
					digestedDefinition.containerType = ContainerType.LANGUAGE;
					break;

				default:
					throw new IllegalArgumentError( "@container needs to be equal to '@list', '@set', or '@language'" );
			}
		}

		return digestedSchema ?
			ObjectSchemaUtils.resolveProperty( digestedSchema, digestedDefinition, true ) :
			digestedDefinition;
	}

	static combineDigestedObjectSchemas( digestedSchemas:DigestedObjectSchema[] ):DigestedObjectSchema {
		if( digestedSchemas.length === 0 ) throw new IllegalArgumentError( "At least one DigestedObjectSchema needs to be specified." );

		digestedSchemas.unshift( new DigestedObjectSchema() );
		return ObjectSchemaDigester._combineSchemas( digestedSchemas );
	}

	static _combineSchemas( digestedSchemas:DigestedObjectSchema[] ):DigestedObjectSchema {
		const [ targetSchema, ...restSchemas ] = digestedSchemas;

		restSchemas.forEach( schema => {
			if( schema.vocab !== void 0 ) targetSchema.vocab = schema.vocab;
			if( schema.base !== "" ) targetSchema.base = schema.base;
			if( schema.language !== null ) targetSchema.language = schema.language;

			Utils.MapUtils.extend( targetSchema.prefixes, schema.prefixes );
			Utils.MapUtils.extend( targetSchema.properties, schema.properties );
		} );

		return targetSchema;
	}

	private static _digestSchema( schema:ObjectSchema ):DigestedObjectSchema {
		const digestedSchema:DigestedObjectSchema = new DigestedObjectSchema();

		for( const propertyName of [ "@base", "@vocab" ] as [ "@base", "@vocab" ] ) {
			if( ! (propertyName in schema) ) continue;
			const value:string = schema[ propertyName ];

			if( value !== null ) {
				if( ! Utils.isString( value ) ) throw new IllegalArgumentError( `The value of '${ propertyName }' must be a string or null.` );
				if( propertyName === "@vocab" && value === "" ) throw new IllegalArgumentError( `The value of '${ propertyName }' must be an absolute URI.` );
				if( ! URI.isAbsolute( value ) && ! URI.isBNodeID( value ) ) throw new IllegalArgumentError( `The value of '${ propertyName }' must be an absolute URI${ propertyName === "@base" ? " or an empty string" : "" }.` );
			}

			digestedSchema[ propertyName.substr( 1 ) ] = value;
		}
		digestedSchema.base = digestedSchema.base || "";

		if( "@language" in schema ) {
			const value:string = schema[ "@language" ];
			if( value !== null && ! Utils.isString( value ) ) throw new InvalidJSONLDSyntaxError( `The value of '@language' must be a string or null.` );
			digestedSchema.language = value;
		}

		for( const propertyName in schema ) {
			if( ! schema.hasOwnProperty( propertyName ) ) continue;

			if( propertyName === "@reverse" ) continue;
			if( propertyName === "@index" ) continue;
			if( propertyName === "@base" ) continue;
			if( propertyName === "@vocab" ) continue;
			if( propertyName === "@language" ) continue;

			let propertyValue:(string | ObjectSchemaProperty) = schema[ propertyName ];

			if( Utils.isString( propertyValue ) ) {
				if( URI.isPrefixed( propertyName ) ) throw new IllegalArgumentError( "A prefixed property cannot be equal to another URI." );
				digestedSchema.prefixes.set( propertyName, propertyValue );

			} else if( ! ! propertyValue && Utils.isObject( propertyValue ) ) {
				const definition:DigestedObjectSchemaProperty = ObjectSchemaDigester.digestProperty( propertyName, propertyValue );
				digestedSchema.properties.set( propertyName, definition );

			} else {
				throw new IllegalArgumentError( "ObjectSchema Properties can only have string values or object values." );
			}
		}

		return digestedSchema;
	}

}

export class ObjectSchemaUtils {

	static resolveURI( uri:string, schema:DigestedObjectSchema, relativeTo:{ vocab?:boolean, base?:boolean } = {} ):string {
		if( uri === null || URI.isAbsolute( uri ) || URI.isBNodeID( uri ) ) return uri;

		const [ prefix, localName = "" ]:[ string, string ] = uri.split( ":" ) as [ string, string ];

		const definedReference:string = schema.prefixes.has( prefix ) ?
			schema.prefixes.get( prefix ) : schema.properties.has( prefix ) ?
				schema.properties.get( prefix ).uri
				: null;
		if( definedReference !== null && definedReference !== prefix ) {
			return ObjectSchemaUtils.resolveURI( definedReference + localName, schema, { vocab: true } );
		}

		if( localName ) return uri;

		if( relativeTo.vocab && Utils.isString( schema.vocab ) ) return schema.vocab + uri;
		if( relativeTo.base ) return URI.resolve( schema.base, uri );

		return uri;
	}

	static resolveProperty( schema:DigestedObjectSchema, definition:DigestedObjectSchemaProperty, inSame?:boolean ):DigestedObjectSchemaProperty {
		const uri:string = definition.uri;
		const type:string = definition.literalType;

		const resolvedURI:string = ObjectSchemaUtils.resolveURI( uri, schema, { vocab: true } );
		const resolvedType:string = ObjectSchemaUtils.resolveURI( type, schema, { vocab: true, base: true } );

		if( resolvedURI !== uri || resolvedType !== type ) {
			definition = inSame ? definition : Utils.ObjectUtils.clone( definition );
			definition.uri = resolvedURI;
			definition.literalType = resolvedType;
		}

		return definition;
	}
}
