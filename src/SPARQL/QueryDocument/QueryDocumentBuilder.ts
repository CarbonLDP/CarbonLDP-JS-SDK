import { FilterToken, IRIToken, LiteralToken, OptionalToken, PredicateToken, PrefixedNameToken, SubjectToken, TermToken, ValuesToken, VariableToken } from "sparqler/tokens";

import { DigestedObjectSchema, DigestedPropertyDefinition, Digester, PropertyDefinition } from "../../ObjectSchema";
import { isObject, M } from "../../Utils";
import { IllegalArgumentError } from "./../../Errors";
import * as Pointer from "./../../Pointer";
import * as URI from "./../../RDF/URI";
import * as QueryContextBuilder from "./QueryContextBuilder";
import * as QueryObject from "./QueryObject";
import * as QueryPropertiesSchema from "./QueryPropertiesSchema";
import * as QueryProperty from "./QueryProperty";
import * as QueryPropertySchema from "./QueryPropertySchema";
import * as QueryValue from "./QueryValue";
import { createPropertyPattern } from "./Utils";

const inherit:Readonly<{}> = Object.freeze( {} );

export class Class {
	inherit:Readonly<{}> = inherit;

	protected _context:QueryContextBuilder.Class;
	protected _document:QueryProperty.Class;

	private _typesTriple:SubjectToken;
	private _values:ValuesToken;

	private _schema:DigestedObjectSchema;

	constructor( queryContext:QueryContextBuilder.Class, property:QueryProperty.Class ) {
		this._context = queryContext;
		this._document = property.addOptionalPattern( new OptionalToken()
			.addPattern( new SubjectToken( property.variable )
				.addPredicate( new PredicateToken( "a" )
					.addObject( queryContext.getVariable( property.name + "__types" ) ) ) )
		);

		this._typesTriple = new SubjectToken( property.variable ).addPredicate( new PredicateToken( "a" ) );
		this._values = new ValuesToken();

		this._schema = this._context.getSchemaFor( { id: "" } );
	}

	property( name?:string ):QueryProperty.Class {
		if( name === void 0 ) return this._document;

		const originalName:string = name;

		let path:string = this._document.name;
		while( path ) {
			name = `${ path }.${ originalName }`;
			if( this._context.hasProperty( name ) ) return this._context.getProperty( name );
			path = path.split( "." ).slice( 0, - 1 ).join( "." );
		}

		throw new Error( `The "${ originalName }" property was not declared.` );
	}

	value( value:string | number | boolean | Date ):QueryValue.Class {
		return new QueryValue.Class( this._context, value );
	}

	object( object:Pointer.Class | string ):QueryObject.Class {
		return new QueryObject.Class( this._context, object );
	}

	withType( type:string ):this {
		if( this._context.hasProperties( this._document.name ) ) throw new Error( "Types must be specified before the properties." );

		type = this._context.expandIRI( type );
		if( ! this._typesTriple.predicates[ 0 ].objects.length )
			this._document.addOptionalPattern( this._typesTriple );

		this._typesTriple.predicates[ 0 ].addObject( this._context.compactIRI( type ) );

		if( ! this._context.context ) return this;

		const schema:DigestedObjectSchema = this._context.context.getObjectSchema( type );
		if( schema ) {
			this._schema = Digester.combineDigestedObjectSchemas( [ this._schema, schema ] );
		}

		return this;
	}

	properties( propertiesSchema:QueryPropertiesSchema.Class ):this {
		for( const propertyName in propertiesSchema ) {
			const queryPropertySchema:QueryPropertySchema.Class | string = propertiesSchema[ propertyName ];
			const propertyDefinition:QueryPropertySchema.Class = isObject( queryPropertySchema ) ? queryPropertySchema : { "@id": queryPropertySchema };

			const digestedDefinition:DigestedPropertyDefinition = this.addPropertyDefinition( propertyName, propertyDefinition );
			const name:string = `${ this._document.name }.${ propertyName }`;

			const propertyPattern:OptionalToken = createPropertyPattern(
				this._context,
				this._document.name,
				name,
				digestedDefinition
			);

			const property:QueryProperty.Class = this._context.addProperty( name, propertyPattern );
			if( "query" in propertyDefinition ) {
				const builder:Class = new Class( this._context, property );
				if( builder !== propertyDefinition[ "query" ].call( void 0, builder ) )
					throw new IllegalArgumentError( "The provided query builder was not returned" );
			}

			this._document.addOptionalPattern( ...property.getPatterns() );
		}

		return this;
	}

	filter( constraint:string ):this {
		const baseName:string = this._document.name.split( "." ).pop();
		this._context
			.getProperty( baseName )
			.addPattern( new FilterToken( constraint ) );

		return this;
	}

	values( ...values:( QueryValue.Class | QueryObject.Class )[] ):this {
		const termTokens:( LiteralToken | IRIToken | PrefixedNameToken )[] = values.map( value => {
			const token:TermToken = value.getToken();
			if( token.token === "blankNode" ) throw new Error( `Blank node "${ token.label }" is not a valid value.` );

			return token;
		} );

		if( ! this._values.values.length ) this._document
			.addPattern( this._values
				.addValues( this._document.variable ) );

		this._values.values[ 0 ].push( ...termTokens );

		return this;
	}

	private addPropertyDefinition( propertyName:string, propertyDefinition:PropertyDefinition ):DigestedPropertyDefinition {
		const uri:string = "@id" in propertyDefinition ? this._context.expandIRI( propertyDefinition[ "@id" ] ) : void 0;

		const inheritDefinition:DigestedPropertyDefinition = this._context.getInheritTypeDefinition( propertyName, uri, this._schema );
		const digestedDefinition:DigestedPropertyDefinition = Digester.digestPropertyDefinition( this._schema, propertyName, propertyDefinition );

		if( inheritDefinition ) {
			for( const key in inheritDefinition ) {
				if( key !== "uri" && digestedDefinition[ key ] !== null ) continue;
				digestedDefinition[ key ] = inheritDefinition[ key ];
			}
		}

		if( ! digestedDefinition.uri ) throw new Error( `Invalid property "${ propertyName }" definition, "@id" is necessary.` );

		this._document.getSchema()
			.properties.set( propertyName, digestedDefinition );
		return digestedDefinition;
	}

}

export default Class;