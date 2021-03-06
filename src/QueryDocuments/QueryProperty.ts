import { Path, PathBuilder } from "sparqler/patterns";
import {
	FilterToken,
	GraphToken,
	IRIToken,
	LiteralToken,
	OptionalToken,
	PathToken,
	PatternToken,
	PropertyToken,
	SubjectToken,
	ValuesToken,
	VariableToken
} from "sparqler/tokens";

import { IllegalActionError } from "../Errors/IllegalActionError";

import { DigestedObjectSchema } from "../ObjectSchema/DigestedObjectSchema";
import { DigestedObjectSchemaProperty } from "../ObjectSchema/DigestedObjectSchemaProperty";
import { ObjectSchemaDigester } from "../ObjectSchema/ObjectSchemaDigester";

import { C } from "../Vocabularies/C";

import { QueryablePropertyData } from "./QueryablePropertyData";
import { QueryContainer } from "./QueryContainer";
import { QueryPropertyData } from "./QueryPropertyData";
import { QueryPropertyType } from "./QueryPropertyType";
import { QuerySubPropertyData } from "./QuerySubPropertyData";
import { SubQueryPropertyDefinition } from "./SubQueryPropertyDefinition";
import { _getBestType, _getMatchingDefinition, _getRawExpression, _getRootPath } from "./Utils";


/**
 * Class that represents a property to be query.
 */
export class QueryProperty implements QueryablePropertyData {
	readonly queryContainer:QueryContainer;
	/**
	 * Parent property if the current property is a sub-property.
	 */
	readonly parent?:QueryProperty;

	/**
	 * Name of the query property.
	 */
	readonly name:string;
	/**
	 * Full path name of the property,
	 * including the paths form the parents.
	 */
	readonly fullName:string;

	/**
	 * The variable that represents the property.
	 */
	get variable():VariableToken {
		return this.queryContainer
			.getVariable( this.fullName );
	}

	/**
	 * The identifier that represents the property.
	 * This value is one used in the final query.
	 */
	get identifier():VariableToken | LiteralToken | IRIToken {
		if( this.values.length === 1 ) {
			return this.values[ 0 ];
		}

		return this.queryContainer
			.getVariable( this.fullName );
	}

	readonly definition:DigestedObjectSchemaProperty;
	readonly pathBuilderFn?:( pathBuilder:PathBuilder ) => Path;

	propertyType?:QueryPropertyType;
	optional:boolean;


	readonly subProperties:Map<string, QueryProperty>;


	readonly values:(LiteralToken | IRIToken)[];
	protected readonly _types:string[];
	protected readonly _filters:string[];

	protected _searchSchema:DigestedObjectSchema | undefined;


	constructor( data:QueryPropertyData ) {
		this.queryContainer = data.queryContainer;
		this.parent = data.parent;

		this.name = data.name;
		this.fullName = data.parent
			? data.parent.fullName + "." + data.name
			: data.name;

		this.definition = data.definition;
		this.pathBuilderFn = data.pathBuilderFn;

		this.propertyType = data.propertyType;
		this.optional = data.optional;

		this.subProperties = new Map();

		this.values = data.values ? data.values : [];
		this._types = [];
		this._filters = [];
	}


	// Sub-properties helpers

	hasProperties():boolean {
		return this.subProperties.size !== 0
			|| this._isComplete()
			;
	}

	getProperty( path?:string, flags?:{ create:true, inherit?:false } ):QueryProperty | undefined {
		if( !path ) return this;

		const rootPath:string = _getRootPath( path );
		const property:QueryProperty | undefined = this.subProperties.get( rootPath );

		if( !property ) {
			// If immediate child and can be created in valid property
			if( rootPath === path && flags && flags.create && this._isComplete() ) {
				const newProperty:QueryProperty = this.addProperty( rootPath, flags );

				if( this.propertyType === QueryPropertyType.FULL )
					newProperty.setType( QueryPropertyType.ALL );

				return newProperty;
			}

			return;
		}

		const restPath:string = path.substr( rootPath.length + 1 );
		return property.getProperty( restPath );
	}

	addProperty( propertyName:string, propertyDefinition:SubQueryPropertyDefinition ):QueryProperty {
		const definition:DigestedObjectSchemaProperty = this
			.__getDefinition( propertyName, propertyDefinition );

		return this._addSubProperty( propertyName, {
			definition,
			pathBuilderFn: propertyDefinition.path,
			optional: !propertyDefinition.required,
		} );
	}

	_addSubProperty( propertyName:string, data:QuerySubPropertyData ):QueryProperty {
		const property:QueryProperty = new QueryProperty( {
			...data,
			name: propertyName,
			queryContainer: this.queryContainer,
			parent: this,
		} );

		this.subProperties.set( propertyName, property );

		return property;
	}

	protected __getDefinition( propertyName:string, propertyDefinition:SubQueryPropertyDefinition ):DigestedObjectSchemaProperty {
		const digestedDefinition:DigestedObjectSchemaProperty = this.queryContainer
			.digestProperty( propertyName, propertyDefinition );

		if( propertyDefinition.inherit === false ) return digestedDefinition;

		const propertyURI:string | undefined = "@id" in propertyDefinition ? digestedDefinition.uri! : void 0;
		const inheritDefinition:DigestedObjectSchemaProperty | undefined = this
			.__getInheritDefinition( propertyName, propertyURI );

		if( inheritDefinition ) {
			for( const key in inheritDefinition ) {
				if( digestedDefinition[ key ] !== null && key !== "uri" ) continue;
				digestedDefinition[ key ] = inheritDefinition[ key ];
			}
		}

		return digestedDefinition;
	}

	protected __getInheritDefinition( propertyName:string, propertyURI?:string ):DigestedObjectSchemaProperty | undefined {
		const searchSchema:DigestedObjectSchema = this._getSearchSchema();
		const localDefinition:DigestedObjectSchemaProperty | undefined =
			_getMatchingDefinition( searchSchema, searchSchema, propertyName, propertyURI );

		if( localDefinition ) return localDefinition;

		const schemas:DigestedObjectSchema[] = this.queryContainer.context
			._getTypeObjectSchemas( this._types );

		for( const targetSchema of schemas ) {
			const definition:DigestedObjectSchemaProperty | undefined = _getMatchingDefinition(
				searchSchema,
				targetSchema,
				propertyName,
				propertyURI
			);

			if( definition ) return definition;
		}
	}

	_isComplete():boolean {
		return this.propertyType === QueryPropertyType.ALL
			|| this.propertyType === QueryPropertyType.FULL
			;
	}

	_isPartial():boolean {
		return this.propertyType === QueryPropertyType.PARTIAL
			|| this.propertyType === QueryPropertyType.ALL
			|| !!this.subProperties.size
			;
	}


	// Helpers for property specialization

	setType( type:QueryPropertyType ):void {
		this.propertyType = _getBestType( this.propertyType!, type );
	}

	addType( type:string ):void {
		const schema:DigestedObjectSchema = this._getSearchSchema();
		const iri:string = schema.resolveURI( type, { vocab: true } );
		this._types.push( iri );

		if( !this.queryContainer.context.hasObjectSchema( iri ) ) return;

		const typedSchema:DigestedObjectSchema = this.queryContainer.context.getObjectSchema( iri );
		ObjectSchemaDigester._combineSchemas( [ schema, typedSchema ] );
	}

	addValues( values:(LiteralToken | IRIToken)[] ):void {
		this.values.push( ...values );
	}

	addFilter( constraint:string ):void {
		this._filters.push( constraint );
	}

	setObligatory( flags?:{ inheritParents:true } ):void {
		if( !this.optional ) return;

		this.optional = false;

		if( flags && flags.inheritParents && this.parent )
			this.parent.setObligatory( flags );
	}


	// Tokens creation helpers

	_getVariable( name:string ):VariableToken {
		return this.queryContainer
			.getVariable( `${ this.fullName }.${ name }` );
	}

	protected __createIRIToken():IRIToken {
		return this
			.queryContainer
			.compactIRI( this.definition.uri! );
	}

	protected __createPathToken():PathToken | VariableToken {
		if( !this.pathBuilderFn )
			return this.__createIRIToken();

		const pathBuilder:PathBuilder = PathBuilder
			.createFrom( this.queryContainer, {} );

		return this.pathBuilderFn
			.call( void 0, pathBuilder )
			.getPath();
	}

	// Context helpers

	protected _getContextVariable():VariableToken | IRIToken {
		if( this.propertyType === QueryPropertyType.FULL )
			return this.__getSelfToken();

		return this._getVariable( "_graph" );
	}

	protected _getContextGraph():GraphToken {
		return new GraphToken( this._getContextVariable() );
	}


	// Self description patterns

	public getSelfPattern():PatternToken {
		const pattern:PatternToken = this.__createSelfPattern();

		if( !this.optional ) return pattern;
		return new OptionalToken()
			.addPattern( pattern );
	}

	protected __createSelfPattern():PatternToken {
		if( !this.parent )
			throw new IllegalActionError( "Cannot create pattern without a parent." );

		return this
			.__addPropertyTo( new SubjectToken( this.parent.identifier ) );
	}

	protected __addPropertyTo( subject:SubjectToken ):SubjectToken {
		return subject
			.addProperty( new PropertyToken( this.__createPathToken() )
				.addObject( this.identifier ) );
	}


	// Search patterns

	/**
	 * Returns the patterns to be used in the query that specifies the property and its sub-properties.
	 * If the property is optional the patterns will be wrapped in an optional SPARQL token.
	 */
	getSearchPatterns():PatternToken[] {
		const patterns:PatternToken[] = this
			.__createSearchPatterns();

		if( !this.optional ) return patterns;
		return [ new OptionalToken()
			.addPattern( ...patterns ),
		];
	}

	protected __createSearchPatterns():PatternToken[] {
		const patterns:PatternToken[] = [];

		const values:PatternToken | undefined = this.__createValuesPattern();
		if( values ) patterns.push( values );

		patterns.push(
			this.__createSearchSelfPattern(),
			...this.__createPropertyPatterns(),
			...this.__createFilterPatterns()
		);

		return patterns;
	}

	protected __createSearchSelfPattern():PatternToken {
		const selfTriple:PatternToken = this.__createSelfPattern();

		// If self is sub-property and not virtual, add inside graph
		if( this.parent && !this.pathBuilderFn )
			return this.parent._getContextGraph()
				.addPattern( selfTriple );

		return selfTriple;
	}

	protected __createPropertyPatterns():PatternToken[] {
		const patterns:PatternToken[] = [];

		switch( this.propertyType ) {
			case QueryPropertyType.EMPTY:
				patterns.push( this.__createTypesSearchPatterns() );
				break;

			case QueryPropertyType.PARTIAL:
				patterns.push( ...this.__createPartialSearchPatterns() );
				break;

			case QueryPropertyType.ALL:
				patterns.push( this.__createSearchAllPattern() );
				patterns.push( ...this.__createSubPropertiesPatterns() );
				break;

			case QueryPropertyType.FULL:
				patterns.push( this.__createSearchGraphPattern() );
				patterns.push( ...this.__createSubPropertiesPatterns() );
				break;

			default:
				const selfTypeFilter:PatternToken | undefined = this.__createSelfTypeFilter();
				if( selfTypeFilter ) patterns.push( selfTypeFilter );
				break;
		}

		return patterns;
	}

	protected __createFilterPatterns():PatternToken[] {
		if( !this._filters.length ) return [];

		return this._filters
			.map( constraint => new FilterToken( _getRawExpression( constraint ) ) );
	}

	protected __createValuesPattern():ValuesToken | undefined {
		if( this.values.length <= 1 ) return;

		const values:ValuesToken = new ValuesToken()
			.addVariables( this.variable );

		this.values
			.forEach( value => values.addValues( value ) );

		return values;
	}

	protected __createSelfTypeFilter():PatternToken | undefined {
		const identifier:VariableToken | IRIToken | LiteralToken = this.identifier;

		if( this.definition.literal ) {
			const literalToken:IRIToken = this.queryContainer
				.compactIRI( this.definition.literalType! );

			if( identifier.token === "variable" )
				return new FilterToken( _getRawExpression( `datatype( ${ identifier } ) = ${ literalToken }` ) );
		}

		if( this.definition.pointerType !== null && identifier.token === "variable" )
			return new FilterToken( _getRawExpression( `! isLiteral( ${ identifier } )` ) );
	}

	protected __createPartialSearchPatterns():PatternToken[] {
		return [
			this.__createTypesSearchPatterns(),
			...this.__createSubPropertiesPatterns(),
		];
	}

	protected __createSubPropertiesPatterns():PatternToken[] {
		const patterns:PatternToken[] = [];

		this.subProperties.forEach( subProperty => {
			patterns.push( ...subProperty.getSearchPatterns() );
		} );

		return patterns;
	}

	protected __createTypesSearchPatterns():PatternToken {
		const types:SubjectToken = this.__createTypesPattern();

		const pattern:PatternToken = this.propertyType === QueryPropertyType.EMPTY
			? types
			: this._getContextGraph()
				.addPattern( types );

		// Return optional types
		if( !this._types.length )
			return new OptionalToken()
				.addPattern( pattern );

		// Add types to the same subject
		this.__addTypesTo( types );

		return pattern;
	}

	protected __addTypesTo( pattern:SubjectToken ):void {
		// Parse string types
		const types:IRIToken[] = this
			.__createTypesTokens();

		let aProperty:PropertyToken | undefined = pattern.properties
			.find( _ => _.verb === "a" );

		// Create a predicate if not exists
		if( !aProperty ) {
			aProperty = new PropertyToken( "a" );
			pattern.addProperty( aProperty );
		}

		aProperty.objects
			.unshift( ...types ); // Add them as first matches
	}

	protected __createTypesTokens():IRIToken[] {
		return this._types
			.map( type => this.queryContainer.compactIRI( type ) );
	}

	protected __createSearchAllPattern():GraphToken {
		const pattern:SubjectToken = this.__createAllPattern();

		if( this._types.length )
			this.__addTypesTo( pattern );

		return this
			._getContextGraph()
			.addPattern( pattern );
	}

	protected __createSearchGraphPattern():GraphToken {
		const graph:GraphToken = new GraphToken( this.__getSelfToken() );

		if( this._types.length ) {
			const pattern:SubjectToken = new SubjectToken( this.__getSelfToken() );
			this.__addTypesTo( pattern );

			graph.addPattern( pattern );
		}

		return graph
			.addPattern( this.__createGraphSubPattern() )
			;
	}


	// Values that filter the query

	protected __getValuedPatterns():PatternToken[] | undefined {
		if( this.optional ) return;

		const selfSubject:SubjectToken = new SubjectToken( this.identifier );
		const patterns:PatternToken[] = [ selfSubject ];

		const valuesPattern:PatternToken | undefined = this.__createValuesPattern();
		if( valuesPattern ) patterns.push( valuesPattern );

		if( this._types.length ) {
			const typesTokens:IRIToken[] = this
				.__createTypesTokens();

			selfSubject
				.addProperty( new PropertyToken( "a" )
					.addObject( ...typesTokens )
				);
		}

		// Create sub-properties patterns
		this.subProperties.forEach( subProperty => {
			const subPatterns:PatternToken[] | undefined = subProperty
				.__getValuedPatterns();

			if( subPatterns ) {
				subProperty.__addPropertyTo( selfSubject );
				patterns.push( ...subPatterns );
			}
		} );

		// Exclude self if no predicated added
		if( !selfSubject.properties.length )
			return patterns.slice( 1 );

		return patterns;
	}


	// Construct patterns

	/**
	 * Returns the patterns to be used in the construct patterns that specifies the property with its sub-properties.
	 */
	getConstructPatterns():SubjectToken[] {
		const patterns:SubjectToken[] = [];

		const selfPattern:SubjectToken | undefined = this.__createSelfConstructPattern();
		if( selfPattern ) patterns.push( selfPattern );

		this.subProperties.forEach( property => {
			const subPatterns:SubjectToken[] = property
				.getConstructPatterns();

			patterns.push( ...subPatterns );
		} );

		return patterns;
	}

	protected __createSelfConstructPattern():SubjectToken | undefined {
		switch( this.propertyType ) {
			case QueryPropertyType.EMPTY:
				return this.__createTypesPattern();

			case QueryPropertyType.PARTIAL:
				return this.__createPartialConstructPattern();

			case QueryPropertyType.ALL:
				return this.__createAllPattern()
					.addProperty( this.__getCDocumentPropertyContext() );

			case QueryPropertyType.FULL:
				return this.__createGraphSubPattern()
					.addProperty( this.__getCDocumentPropertyContext() );

			default:
				return;
		}
	}

	protected __getCDocumentPropertyContext():PropertyToken {
		return new PropertyToken( this.queryContainer.compactIRI( C.document ) )
			.addObject( this._getContextVariable() );
	}

	protected __createPartialConstructPattern():SubjectToken {
		const subject:SubjectToken = this.__createTypesPattern()
			.addProperty( new PropertyToken( this.queryContainer.compactIRI( C.document ) )
				.addObject( this._getContextVariable() )
			);

		this.subProperties.forEach( subProperty => {
			subject.addProperty( new PropertyToken( subProperty.__createIRIToken() )
				.addObject( subProperty.identifier )
			);
		} );

		return subject;
	}


	// Shared Construct & Search patterns

	protected __createTypesPattern():SubjectToken {
		return new SubjectToken( this.identifier )
			.addProperty( new PropertyToken( "a" )
				.addObject( this._getVariable( "types" ) )
			);
	}

	protected __createAllPattern():SubjectToken {
		return new SubjectToken( this.__getSelfToken() )
			.addProperty( new PropertyToken( this._getVariable( "_predicate" ) )
				.addObject( this._getVariable( "_object" ) )
			);
	}

	protected __createGraphSubPattern():SubjectToken {
		return new SubjectToken( this._getVariable( "_subject" ) )
			.addProperty( new PropertyToken( this._getVariable( "_predicate" ) )
				.addObject( this._getVariable( "_object" ) )
			);
	}


	protected __getSelfToken():VariableToken | IRIToken {
		const identifier:VariableToken | LiteralToken | IRIToken = this.identifier;

		if( identifier.token === "literal" )
			throw new IllegalActionError( `Property is not a resource.` );

		return identifier;
	}


	// Helper for property result compaction

	/**
	 * Returns the specific schema for the property,
	 * combining with the associated schema of the object provided if isn't a basic partial property.
	 * @param object The associated resource of the property.
	 */
	getSchemaFor( object:object ):DigestedObjectSchema {
		switch( this.propertyType ) {
			case void 0:
				return new DigestedObjectSchema();

			case QueryPropertyType.EMPTY:
			case QueryPropertyType.PARTIAL:
				return this.__createSchema();

			default:
				return ObjectSchemaDigester._combineSchemas( [
					this.queryContainer.context.registry.getSchemaFor( object ),
					this.__createSchema(),
				] );
		}
	}

	protected __createSchema():DigestedObjectSchema {
		const schema:DigestedObjectSchema = new DigestedObjectSchema();

		this.subProperties.forEach( property => {
			schema.properties.set( property.name, property.definition );
		} );

		return schema;
	}


	// Helper for schema related actions
	protected _getSearchSchema():DigestedObjectSchema {
		if( this._searchSchema ) return this._searchSchema;
		return this._searchSchema = this.queryContainer.getGeneralSchema();
	}

}
