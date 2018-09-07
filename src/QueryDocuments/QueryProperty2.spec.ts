import { OptionalToken, VariableToken } from "sparqler/tokens";

import {
	createMockContext,
	createMockDigestedSchema,
	createMockDigestedSchemaProperty,
	MockQueryContainer
} from "../../test/helpers/mocks";

import { AbstractContext } from "../Context/AbstractContext";

import { DigestedObjectSchema } from "../ObjectSchema/DigestedObjectSchema";
import { DigestedObjectSchemaProperty } from "../ObjectSchema/DigestedObjectSchemaProperty";

import { clazz, constructor, hasProperty, hasSignature, INSTANCE, method, module, } from "../test/JasmineExtender";
import { QueryContainer } from "./QueryContainer";
import { QueryProperty2 } from "./QueryProperty2";


describe( module( "carbonldp/QueryDocuments/QueryProperty2" ), ():void => {

	describe( clazz(
		"CarbonLDP.QueryDocuments.QueryProperty2",
		"Class that represents a property in the query"
	), ():void => {

		it( "should exists", ():void => {
			expect( QueryProperty2 ).toBeDefined();
			expect( QueryProperty2 ).toEqual( jasmine.any( Function ) );
		} );

		it( hasProperty(
			INSTANCE,
			"name",
			"string",
			"The name of the query property."
		), ():void => {
		} );

		it( hasProperty(
			INSTANCE,
			"variable",
			"CarbonLDP.QueryDocuments.QueryVariable",
			"The variable that represents the property in the query."
		), ():void => {
		} );


		let context:AbstractContext<any, any>;
		let queryContainer:QueryContainer;
		beforeEach( ():void => {
			context = createMockContext( { settings: { vocabulary: "https://example.com/vocab#" } } );
			queryContainer = new MockQueryContainer( context );
		} );

		describe( constructor(), ():void => {

			it( hasSignature(
				"Creates a query property for the specified name.\n" +
				"By default the property will be optional, i.e. the patterns returned will be wrapped by an optional token.",
				[
					{ name: "context", type: "CarbonLDP.QueryDocuments.QueryContext", description: "The context of the query where the property is been used." },
					{ name: "name", type: "string", description: "The name of the property." },
				]
			), ():void => {
			} );

			it( "should exists", ():void => {
				const queryProperty:QueryProperty2 = new QueryProperty2( {
					queryContainer: queryContainer,
					name: "name",
					definition: new DigestedObjectSchemaProperty(),
				} );
				expect( queryProperty ).toEqual( jasmine.any( QueryProperty2 ) );
			} );


			it( "should create full name with no parent", ():void => {
				const queryProperty:QueryProperty2 = new QueryProperty2( {
					queryContainer: queryContainer,
					name: "name",
					definition: new DigestedObjectSchemaProperty(),
				} );

				expect( queryProperty.fullName ).toEqual( "name" );
			} );

			it( "should create full name with parent", ():void => {
				const parentProperty:QueryProperty2 = new QueryProperty2( {
					queryContainer: queryContainer,
					name: "parent",
					definition: new DigestedObjectSchemaProperty(),
				} );

				const queryProperty:QueryProperty2 = new QueryProperty2( {
					queryContainer: queryContainer,
					name: "name",
					parent: parentProperty,
					definition: new DigestedObjectSchemaProperty(),
				} );

				expect( queryProperty.fullName ).toEqual( "parent.name" );
			} );

			it( "should create full name with parent with parent", ():void => {
				const grandParentProperty:QueryProperty2 = new QueryProperty2( {
					queryContainer: queryContainer,
					name: "grandParent",
					definition: new DigestedObjectSchemaProperty(),
				} );

				const parentProperty:QueryProperty2 = new QueryProperty2( {
					queryContainer: queryContainer,
					name: "parent",
					parent: grandParentProperty,
					definition: new DigestedObjectSchemaProperty(),
				} );

				const queryProperty:QueryProperty2 = new QueryProperty2( {
					queryContainer: queryContainer,
					name: "name",
					parent: parentProperty,
					definition: new DigestedObjectSchemaProperty(),
				} );

				expect( queryProperty.fullName ).toEqual( "grandParent.parent.name" );
			} );


			it( "should create an variable token", ():void => {
				const queryProperty:QueryProperty2 = new QueryProperty2( {
					queryContainer: queryContainer,
					name: "name",
					definition: new DigestedObjectSchemaProperty(),
				} );

				expect( queryProperty.variable ).toEqual( jasmine.any( VariableToken ) );
			} );

		} );


		// TODO: Test .setType

		// TODO: Test .isEmpty
		// TODO: Test .isPartial
		// TODO: Test .isComplete


		// TODO: Test .getTriple

		describe( method( INSTANCE, "getSearchPatterns" ), ():void => {

			it( hasSignature(
				"Returns the pattern to be used in the query that specifies the property and its elements\n" +
				"If the property is optional the patterns will be wrapped in an optional SPARQL token.",
				{ type: "sparqler/tokens/PatternToken[]" }
			), ():void => {} );

			it( "should exists", ():void => {
				expect( QueryProperty2.prototype.getSearchPatterns ).toBeDefined();
				expect( QueryProperty2.prototype.getSearchPatterns ).toEqual( jasmine.any( Function ) );
			} );

			it( "should return the patterns as optional", ():void => {
				const queryProperty:QueryProperty2 = new QueryProperty2( {
					queryContainer: queryContainer,
					name: "name",
					parent: new QueryProperty2( {
						queryContainer: queryContainer,
						name: "parent",
						definition: new DigestedObjectSchemaProperty(),
					} ),
					definition: new DigestedObjectSchemaProperty(),
				} );

				expect( queryProperty.getSearchPatterns() ).toEqual( [
					jasmine.any( OptionalToken ) as any as OptionalToken,
				] );
			} );

			it( "should return the patterns when obligatory", ():void => {
				const queryProperty:QueryProperty2 = new QueryProperty2( {
						queryContainer: queryContainer,
						name: "name",
						parent: new QueryProperty2( {
							queryContainer: queryContainer,
							name: "parent",
							definition: new DigestedObjectSchemaProperty(),
						} ),
						definition: new DigestedObjectSchemaProperty(),
					} )
				;

				queryProperty.setObligatory();

				expect( queryProperty.getSearchPatterns() ).not.toEqual( [
					jasmine.any( OptionalToken ) as any as OptionalToken,
				] );
			} );

			// TODO: Test more cases

		} );

		// TODO: Test .getConstructPatterns


		// TODO: Test .hasProperties
		// TODO: Test .getRootProperty
		// TODO: Test .addProperty

		// TODO: Test .addValues
		// TODO: Test .addType
		// TODO: Test .setObligatory

		describe( method( INSTANCE, "getSchema" ), ():void => {

			it( hasSignature(
				"Returns the specific schema for the property objects that was created query definition.",
				{ type: "CarbonLDP.DigestedObjectSchema" }
			), ():void => {} );

			it( "should exists", ():void => {
				expect( QueryProperty2.prototype.getSchema ).toBeDefined();
				expect( QueryProperty2.prototype.getSchema ).toEqual( jasmine.any( Function ) );
			} );

			it( "should return empty schema when no properties", ():void => {
				const queryProperty:QueryProperty2 = new QueryProperty2( {
					queryContainer: queryContainer,
					name: "name",
					definition: new DigestedObjectSchemaProperty(),
				} );

				const propertySchema:DigestedObjectSchema = queryProperty.getSchema();
				expect( propertySchema ).toEqual( new DigestedObjectSchema() );
			} );

			it( "should return schema from sub-properties", ():void => {
				const queryProperty:QueryProperty2 = new QueryProperty2( {
					queryContainer: queryContainer,
					name: "name",
					definition: new DigestedObjectSchemaProperty(),
				} );

				queryProperty.addProperty( "property1" );
				queryProperty.addProperty( "property2", { "@id": "https://example.com/property2" } );

				const propertySchema:DigestedObjectSchema = queryProperty.getSchema();
				expect( propertySchema ).toEqual( createMockDigestedSchema( {
					properties: new Map<string, DigestedObjectSchemaProperty>( [
						[ "property1", createMockDigestedSchemaProperty( { uri: "https://example.com/vocab#property1" } ) ],
						[ "property2", createMockDigestedSchemaProperty( { uri: "https://example.com/property2" } ) ],
					] ),
				} ) );
			} );

		} );

	} );

} );
