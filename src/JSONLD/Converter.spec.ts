import {
	Pointer,
	PointerLibrary,
} from "../Pointer";
import { RDFList } from "../RDF/List";
import { RDFLiteral } from "../RDF/Literal";
import { Serializer } from "../RDF/Literal/Serializer";
import { RDFNode } from "../RDF/Node";
import { RDFValue } from "../RDF/Value";
import {
	clazz,
	hasConstructor,
	hasProperty,
	hasSignature,
	INSTANCE,
	isDefined,
	method,
	module,
} from "../test/JasmineExtender";
import * as Utils from "../Utils";
import { XSD } from "../Vocabularies/XSD";
import * as ObjectSchema from "./../ObjectSchema";

import { JSONLDConverter } from "./Converter";

describe( module( "carbonldp/JSONLD/Converter" ), ():void => {

	describe( clazz( "CarbonLDP.JSONLD.JSONLDConverter", "Class that have methods for convert expanded JSON-LD objects to compacted Carbon SDK Resources and vice versa." ), ():void => {

		it( isDefined(), ():void => {
			expect( JSONLDConverter ).toBeDefined();
			expect( Utils.isFunction( JSONLDConverter ) ).toEqual( true );
		} );

		// TODO: Separate in different tests
		it( hasConstructor( [
			{ name: "literalSerializers", type: "Map<string, CarbonLDP.RDF.Literal.Serializer>", optional: true, description: "A Map object with the data type serializers that the converter will only be able to handle." },
		] ), ():void => {
			let jsonldConverter:JSONLDConverter;

			jsonldConverter = new JSONLDConverter();
			expect( jsonldConverter ).toBeTruthy();
			expect( jsonldConverter instanceof JSONLDConverter ).toBe( true );

			let customSerializers:Map<string, Serializer> = new Map();
			customSerializers.set( "http://example.com/ns#my-custom-type", <any> {} );

			jsonldConverter = new JSONLDConverter( customSerializers );
			expect( jsonldConverter ).toBeTruthy();
			expect( jsonldConverter instanceof JSONLDConverter ).toBe( true );
		} );

		// TODO: Separate in different tests
		it( hasProperty(
			INSTANCE,
			"literalSerializers",
			"Map<string, CarbonLDP.RDF.Literal.Serializer>",
			"A Map object with data-type/serializer pairs for stringify the data of a SDK Resource when expanding it."
		), ():void => {
			let jsonldConverter:JSONLDConverter;
			let serializers:Map<string, Serializer>;

			jsonldConverter = new JSONLDConverter();
			serializers = jsonldConverter.literalSerializers;
			expect( serializers.size ).toBeGreaterThan( 1 );

			let customSerializers:Map<string, Serializer> = new Map();
			customSerializers.set( "http://example.com/ns#my-custom-type", <any> {} );

			jsonldConverter = new JSONLDConverter( customSerializers );
			serializers = jsonldConverter.literalSerializers;
			expect( serializers.size ).toBe( 1 );
		} );

		// TODO: Separate in different tests
		describe( method( INSTANCE, "compact" ), ():void => {

			it( hasSignature(
				"Assign the data of the expanded JSON-LD object, to the target object in a friendly mode, ie. without the JSON-LD Syntax Tokens and parsed values, in accordance to the schema provided.", [
					{ name: "expandedObject", type: "Object", description: "The JSON-LD object to compact." },
					{ name: "targetObject", type: "Object", description: "The target object where will be added the data of the expanded object." },
					{ name: "digestedSchema", type: "CarbonLDP.DigestedObjectSchema", description: "The schema that describes how compact the expanded object." },
					{ name: "pointerLibrary", type: "CarbonLDP.PointerLibrary", description: "An object from where one can obtain pointers to SDK Resources." },
				],
				{ type: "Object", description: "The compacted target object." }
			), ():void => {
				let jsonldConverter:JSONLDConverter = new JSONLDConverter();

				expect( jsonldConverter.compact ).toBeDefined();
				expect( Utils.isFunction( jsonldConverter.compact ) ).toBeDefined();

				let expandedObject:any = {
					"@id": "http://example.com/expandedObject/",
					"http://example.com/ns#string": [
						{ "@value": "some-string", "@type": "http://www.w3.org/2001/XMLSchema#string" },
					],
					"http://example.com/ns#date": [
						{ "@value": "2015-12-04T23:06:57.920Z", "@type": "http://www.w3.org/2001/XMLSchema#dateTime" },
					],
					"http://example.com/ns#numberList": [
						{
							"@list": [
								{ "@value": "2", "@type": "http://www.w3.org/2001/XMLSchema#integer" },
								{ "@value": "3", "@type": "http://www.w3.org/2001/XMLSchema#integer" },
								{ "@value": "4", "@type": "http://www.w3.org/2001/XMLSchema#integer" },
								{ "@value": "5", "@type": "http://www.w3.org/2001/XMLSchema#integer" },
								{ "@value": "6", "@type": "http://www.w3.org/2001/XMLSchema#integer" },
							],
						},
					],
					"http://example.com/ns#languageMap": [
						{ "@value": "español", "@type": "http://www.w3.org/2001/XMLSchema#string", "@language": "es" },
						{ "@value": "english", "@type": "http://www.w3.org/2001/XMLSchema#string", "@language": "en" },
						{ "@value": "日本語", "@language": "ja" },
					],
					"http://example.com/ns#pointer": [
						{ "@id": "http://example.com/pointer/" },
					],
					"http://example.com/ns#pointerList": [
						{
							"@list": [
								{ "@id": "http://example.com/pointer-1/" },
								{ "@id": "http://example.com/pointer-2/" },
								{ "@id": "http://example.com/pointer-3/" },
							],
						},
					],
					"http://example.com/ns#pointerSet": [
						{ "@id": "http://example.com/pointer-1/" },
						{ "@id": "http://example.com/pointer-2/" },
						{ "@id": "http://example.com/pointer-3/" },
					],
					"http://example.com/my-vocabulary#elementWithoutID": [
						{ "@value": "One element in a set" },
					],
					"http://example.com/my-vocabulary#relative-at-id": [
						{ "@value": "Property without an absolute @id" },
					],
				};

				let schema:ObjectSchema.ObjectSchema = {
					"@vocab": "http://example.com/my-vocabulary#",
					"ex": "http://example.com/ns#",
					"xsd": "http://www.w3.org/2001/XMLSchema#",
					"string": {
						"@id": "ex:string",
						"@type": "xsd:string",
					},
					"date": {
						"@id": "ex:date",
						"@type": "xsd:dateTime",
					},
					"numberList": {
						"@id": "ex:numberList",
						"@type": "xsd:integer",
						"@container": "@list",
					},
					"languageMap": {
						"@id": "ex:languageMap",
						"@container": "@language",
					},
					"pointer": {
						"@id": "ex:pointer",
						"@type": "@id",
					},
					"pointerList": {
						"@id": "ex:pointerList",
						"@type": "@id",
						"@container": "@list",
					},
					"pointerSet": {
						"@id": "ex:pointerSet",
						"@type": "@id",
						"@container": "@set",
					},
					"elementWithoutID": {
						"@type": "xsd:string",
						"@container": "@set",
					},
					"relative@id": {
						"@id": "relative-at-id",
						"@container": "@set",
					},
				};

				let mockedPointerLibrary:PointerLibrary = {
					hasPointer: ( id:string ):boolean => {
						return true;
					},
					getPointer: ( id:string ):Pointer => {
						let pointer:Pointer = Pointer.createFrom( { id } );
						pointer._resolved = true;
						return pointer;
					},
				};

				let compactedObject:any = {};
				let digestedSchema:ObjectSchema.DigestedObjectSchema = ObjectSchema.ObjectSchemaDigester.digestSchema( schema );

				expect( jsonldConverter.compact ).toBeDefined();
				expect( Utils.isFunction( jsonldConverter.compact ) ).toBeDefined();

				jsonldConverter.compact( expandedObject, compactedObject, digestedSchema, mockedPointerLibrary );

				expect( compactedObject ).toBeDefined();
				expect( Utils.isObject( compactedObject ) ).toEqual( true );

				expect( Utils.hasProperty( compactedObject, "string" ) ).toEqual( true );
				expect( compactedObject.string ).toEqual( "some-string" );

				expect( Utils.hasProperty( compactedObject, "date" ) ).toEqual( true );
				expect( Utils.isDate( compactedObject.date ) ).toEqual( true );

				expect( Utils.hasProperty( compactedObject, "numberList" ) ).toEqual( true );
				expect( Utils.isArray( compactedObject.numberList ) ).toEqual( true );
				expect( compactedObject.numberList.length ).toEqual( 5 );
				expect( compactedObject.numberList[ 0 ] ).toEqual( 2 );
				expect( compactedObject.numberList[ 1 ] ).toEqual( 3 );
				expect( compactedObject.numberList[ 2 ] ).toEqual( 4 );
				expect( compactedObject.numberList[ 3 ] ).toEqual( 5 );
				expect( compactedObject.numberList[ 4 ] ).toEqual( 6 );

				expect( Utils.hasProperty( compactedObject, "languageMap" ) ).toEqual( true );
				expect( Utils.isObject( compactedObject.languageMap ) ).toEqual( true );
				expect( compactedObject.languageMap.es ).toEqual( "español" );
				expect( compactedObject.languageMap.en ).toEqual( "english" );
				expect( compactedObject.languageMap.ja ).toEqual( "日本語" );

				expect( Utils.hasProperty( compactedObject, "pointer" ) ).toEqual( true );
				expect( Utils.isObject( compactedObject.pointer ) ).toEqual( true );
				expect( compactedObject.pointer.id ).toEqual( "http://example.com/pointer/" );

				expect( Utils.hasProperty( compactedObject, "pointerList" ) ).toEqual( true );
				expect( Utils.isArray( compactedObject.pointerList ) ).toEqual( true );
				expect( compactedObject.pointerList.length ).toEqual( 3 );
				expect( compactedObject.pointerList[ 0 ].id ).toEqual( "http://example.com/pointer-1/" );
				expect( compactedObject.pointerList[ 1 ].id ).toEqual( "http://example.com/pointer-2/" );
				expect( compactedObject.pointerList[ 2 ].id ).toEqual( "http://example.com/pointer-3/" );

				expect( Utils.hasProperty( compactedObject, "pointerSet" ) ).toEqual( true );
				expect( Utils.isArray( compactedObject.pointerSet ) ).toEqual( true );
				expect( compactedObject.pointerSet.length ).toEqual( 3 );
				expect( compactedObject.pointerSet[ 0 ].id ).toEqual( "http://example.com/pointer-1/" );
				expect( compactedObject.pointerSet[ 1 ].id ).toEqual( "http://example.com/pointer-2/" );
				expect( compactedObject.pointerSet[ 2 ].id ).toEqual( "http://example.com/pointer-3/" );

				expect( Utils.hasProperty( compactedObject, "elementWithoutID" ) ).toBe( true );
				expect( Utils.isArray( compactedObject.elementWithoutID ) ).toBe( true );
				expect( compactedObject.elementWithoutID.length ).toBe( 1 );
				expect( compactedObject.elementWithoutID[ 0 ] ).toBe( "One element in a set" );

				expect( Utils.hasProperty( compactedObject, "relative@id" ) ).toBe( true );
				expect( Utils.isArray( compactedObject[ "relative@id" ] ) ).toBe( true );
				expect( compactedObject[ "relative@id" ].length ).toBe( 1 );
				expect( compactedObject[ "relative@id" ][ 0 ] ).toBe( "Property without an absolute @id" );
			} );
		} );

		// TODO: Separate in different tests
		describe( method( INSTANCE, "expand" ), ():void => {


			it( hasSignature(
				"Creates a expanded JSON-LD object from the compacted object in accordance to the schema provided.", [
					{ name: "compactedObject", type: "Object", description: "The compacted object to generate its expanded JSON-LD object." },
					{ name: "digestedSchema", type: "CarbonLDP.DigestedObjectSchema", description: "The schema that describes how construct the expanded object." },
				],
				{ type: "Object", description: "The expanded JSON-LD object generated." }
			), ():void => {
				let jsonldConverter:JSONLDConverter = new JSONLDConverter();

				expect( jsonldConverter.compact ).toBeDefined();
				expect( Utils.isFunction( jsonldConverter.compact ) ).toBeDefined();

				let generalSchema:ObjectSchema.ObjectSchema = {
					"@base": "http://example.com/",
					"@vocab": "http://example.com/my-vocabulary#",
					"ex": "http://example.com/ns#",
					"xsd": "http://www.w3.org/2001/XMLSchema#",
					"propertyInGeneral": {
						"@id": "ex:property-in-general",
						"@type": "@id",
					},
				};

				let schemas:ObjectSchema.ObjectSchema[] = [ {
					"@vocab": "http://example.com/my-vocabulary#",
					"ex": "http://example.com/ns#",
					"xsd": "http://www.w3.org/2001/XMLSchema#",
					"another": "http://example.com/another-namespace#",
					"string": {
						"@id": "ex:string",
						"@type": "xsd:string",
					},
					"date": {
						"@id": "ex:date",
						"@type": "xsd:dateTime",
					},
					"numberList": {
						"@id": "ex:numberList",
						"@type": "xsd:integer",
						"@container": "@list",
					},
					"languageMap": {
						"@id": "ex:languageMap",
						"@container": "@language",
					},
					"pointer": {
						"@id": "ex:pointer",
						"@type": "@id",
					},
					"pointerList": {
						"@id": "ex:pointerList",
						"@type": "@id",
						"@container": "@list",
					},
					"pointerSet": {
						"@id": "ex:pointerSet",
						"@type": "@id",
						"@container": "@set",
					},
					"unknownTypeLiteral": {
						"@id": "ex:unknownTypeLiteral",
					},
					"unknownTypeArray": {
						"@id": "ex:unknownTypeArray",
						"@container": "@set",
					},
					"unknownTypePointer": {
						"@id": "ex:unknownTypePointer",
					},
					"anotherPrefixedPointer": {
						"@id": "ex:another-prefixed-pointer",
						"@type": "@id",
					},
					"anotherPointerInSchema": {
						"@id": "ex:another-pointer-in-schema",
						"@type": "@id",
					},
					"vocabPointer": {
						"@id": "ex:vocab-pointer",
						"@type": "@vocab",
					},
					"relativePointer": {
						"@id": "ex:relative-pointer",
						"@type": "@id",
					},
				}, {
					"xsd": "http://www.w3.org/2001/XMLSchema#",
					"elementWithoutID": {
						"@type": "xsd:string",
						"@container": "@set",
					},
					"relative@id": {
						"@id": "relative-at-id",
						"@container": "@set",
					},
				} ];

				let compactedObject:any = {
					"id": "http://example.com/compactedObject/",
					"types": [
						"http://example.com/ns#MyType",
						"ex:Another-Type",
						"another:Another-Namespace-Type",
						"Another-Another-Type",
						"http://example.com/ns#Type-1",
						"http://example.com/ns#Type-2",
					],
					"string": "Some string",
					"date": new Date( "2015-12-04T23:06:57.920Z" ),
					"numberList": [ 2, 3, 4, 5, 6, ],
					"languageMap": {
						"es": "español",
						"en": "english",
						"ja": "日本語",
					},
					"pointer": Pointer.create( { id: "http://example.com/pointer/" } ),
					"pointerList": [
						Pointer.create( { id: "http://example.com/pointer-1/" } ),
						Pointer.create( { id: "http://example.com/pointer-2/" } ),
						Pointer.create( { id: "http://example.com/pointer-3/" } ),
					],
					"pointerSet": [
						Pointer.create( { id: "http://example.com/pointer-1/" } ),
						Pointer.create( { id: "http://example.com/pointer-2/" } ),
						Pointer.create( { id: "http://example.com/pointer-3/" } ),
					],
					"unknownTypeLiteral": 1,
					"unknownTypeArray": [
						1.12,
						false,
						new Date( "2015-12-04T23:06:57.920Z" ),
						"Some string",
						function():void {},
						Pointer.create( { id: "http://example.com/pointer/" } ),
					],
					"unknownTypePointer": Pointer.create( { id: "http://example.com/pointer/" } ),
					"anotherPrefixedPointer": "ex:another-resource/",
					"anotherPointerInSchema": "propertyInGeneral",
					"notInSchemaLiteral": "Property Literal not defined in Schema",
					"notInSchemaPointer": Pointer.create( { id: "http://example.com/another-pointer/" } ),
					"vocabPointer": "to-pointer",
					"relativePointer": Pointer.create( { id: "relative-pointer/" } ),
					"elementWithoutID": "This element will be converted into a set",
					"relative@id": [ "Property with a relative @id" ],
				};

				let digestedGeneralSchema:ObjectSchema.DigestedObjectSchema = ObjectSchema.ObjectSchemaDigester.digestSchema( generalSchema );
				let digestedSchema:ObjectSchema.DigestedObjectSchema = ObjectSchema.ObjectSchemaDigester.digestSchema( schemas );

				expect( jsonldConverter.expand ).toBeDefined();
				expect( Utils.isFunction( jsonldConverter.expand ) ).toBeDefined();

				let expandedObject:any = jsonldConverter.expand( compactedObject, digestedGeneralSchema, digestedSchema );

				expect( expandedObject ).toBeDefined();
				expect( Utils.isObject( expandedObject ) ).toEqual( true );

				expect( expandedObject[ "@id" ] ).toBe( "http://example.com/compactedObject/" );

				expect( Utils.isArray( expandedObject[ "@type" ] ) ).toBe( true );
				expect( expandedObject[ "@type" ].length ).toBe( 6 );
				expect( expandedObject[ "@type" ] ).toContain( "http://example.com/ns#Type-1" );
				expect( expandedObject[ "@type" ] ).toContain( "http://example.com/ns#Type-2" );
				expect( expandedObject[ "@type" ] ).toContain( "http://example.com/ns#MyType" );
				expect( expandedObject[ "@type" ] ).toContain( "http://example.com/ns#Another-Type" );
				expect( expandedObject[ "@type" ] ).toContain( "another:Another-Namespace-Type" );
				expect( expandedObject[ "@type" ] ).toContain( "http://example.com/my-vocabulary#Another-Another-Type" );

				let property:RDFLiteral[] | RDFNode[] | [ RDFList ];
				let literal:RDFLiteral;
				let node:RDFNode;
				let list:RDFList;
				let value:RDFValue;

				property = expandedObject[ "http://example.com/ns#string" ];
				expect( Utils.isArray( property ) ).toBe( true );
				expect( property.length ).toBe( 1 );
				literal = <RDFLiteral> property[ 0 ];
				expect( RDFLiteral.is( literal ) ).toBe( true );
				expect( RDFLiteral.hasType( literal, XSD.string ) ).toBe( true );
				expect( literal[ "@value" ] ).toBe( "Some string" );

				property = expandedObject[ "http://example.com/ns#date" ];
				expect( Utils.isArray( property ) ).toBe( true );
				expect( property.length ).toBe( 1 );
				literal = <RDFLiteral> property[ 0 ];
				expect( RDFLiteral.is( literal ) ).toBe( true );
				expect( RDFLiteral.hasType( literal, XSD.dateTime ) ).toBe( true );
				expect( literal[ "@value" ] ).toBe( "2015-12-04T23:06:57.920Z" );

				property = expandedObject[ "http://example.com/ns#languageMap" ];
				expect( Utils.isArray( property ) ).toBe( true );
				expect( property.length ).toBe( 3 );
				literal = <RDFLiteral> property[ 0 ];
				expect( RDFLiteral.is( literal ) ).toBe( true );
				expect( RDFLiteral.hasType( literal, XSD.string ) ).toBe( true );
				expect( literal[ "@language" ] ).toBe( "es" );
				expect( literal[ "@value" ] ).toBe( "español" );
				literal = <RDFLiteral> property[ 1 ];
				expect( RDFLiteral.is( literal ) ).toBe( true );
				expect( RDFLiteral.hasType( literal, XSD.string ) ).toBe( true );
				expect( literal[ "@language" ] ).toBe( "en" );
				expect( literal[ "@value" ] ).toBe( "english" );
				literal = <RDFLiteral> property[ 2 ];
				expect( RDFLiteral.is( literal ) ).toBe( true );
				expect( RDFLiteral.hasType( literal, XSD.string ) ).toBe( true );
				expect( literal[ "@language" ] ).toBe( "ja" );
				expect( literal[ "@value" ] ).toBe( "日本語" );

				property = expandedObject[ "http://example.com/ns#pointer" ];
				expect( Utils.isArray( property ) ).toBe( true );
				expect( property.length ).toBe( 1 );
				node = <RDFNode> property[ 0 ];
				expect( RDFNode.is( node ) ).toBe( true );
				expect( node[ "@id" ] ).toBe( "http://example.com/pointer/" );

				property = expandedObject[ "http://example.com/ns#pointerList" ];
				expect( Utils.isArray( property ) ).toBe( true );
				expect( property.length ).toBe( 1 );
				list = <RDFList> property[ 0 ];
				expect( RDFList.is( list ) ).toBe( true );
				expect( list[ "@list" ].length ).toBe( 3 );
				value = list[ "@list" ][ 0 ];
				expect( value[ "@id" ] ).toBe( "http://example.com/pointer-1/" );
				value = list[ "@list" ][ 1 ];
				expect( value[ "@id" ] ).toBe( "http://example.com/pointer-2/" );
				value = list[ "@list" ][ 2 ];
				expect( value[ "@id" ] ).toBe( "http://example.com/pointer-3/" );

				property = expandedObject[ "http://example.com/ns#pointerSet" ];
				expect( Utils.isArray( property ) ).toBe( true );
				expect( property.length ).toBe( 3 );
				node = <RDFNode> property[ 0 ];
				expect( node[ "@id" ] ).toBe( "http://example.com/pointer-1/" );
				node = <RDFNode> property[ 1 ];
				expect( node[ "@id" ] ).toBe( "http://example.com/pointer-2/" );
				node = <RDFNode> property[ 2 ];
				expect( node[ "@id" ] ).toBe( "http://example.com/pointer-3/" );

				property = expandedObject[ "http://example.com/ns#unknownTypeLiteral" ];
				expect( Utils.isArray( property ) ).toBe( true );
				expect( property.length ).toBe( 1 );
				literal = <RDFLiteral> property[ 0 ];
				expect( RDFLiteral.is( literal ) ).toBe( true );
				expect( RDFLiteral.hasType( literal, XSD.float ) ).toBe( true );
				expect( literal[ "@value" ] ).toBe( "1" );

				property = expandedObject[ "http://example.com/ns#unknownTypeArray" ];
				expect( Utils.isArray( property ) ).toBe( true );
				expect( property.length ).toBe( 5 );
				literal = <RDFLiteral> property[ 0 ];
				expect( RDFLiteral.is( literal ) ).toBe( true );
				expect( RDFLiteral.hasType( literal, XSD.float ) ).toBe( true );
				expect( literal[ "@value" ] ).toBe( "1.12" );
				literal = <RDFLiteral> property[ 1 ];
				expect( RDFLiteral.is( literal ) ).toBe( true );
				expect( RDFLiteral.hasType( literal, XSD.boolean ) ).toBe( true );
				expect( literal[ "@value" ] ).toBe( "false" );
				literal = <RDFLiteral> property[ 2 ];
				expect( RDFLiteral.is( literal ) ).toBe( true );
				expect( RDFLiteral.hasType( literal, XSD.dateTime ) ).toBe( true );
				expect( literal[ "@value" ] ).toBe( "2015-12-04T23:06:57.920Z" );
				literal = <RDFLiteral> property[ 3 ];
				expect( RDFLiteral.is( literal ) ).toBe( true );
				expect( RDFLiteral.hasType( literal, XSD.string ) ).toBe( true );
				expect( literal[ "@value" ] ).toBe( "Some string" );
				node = <RDFNode> property[ 4 ];
				expect( RDFNode.is( node ) ).toBe( true );
				expect( node[ "@id" ] ).toBe( "http://example.com/pointer/" );

				property = expandedObject[ "http://example.com/ns#unknownTypePointer" ];
				expect( Utils.isArray( property ) ).toBe( true );
				expect( property.length ).toBe( 1 );
				node = <RDFNode> property[ 0 ];
				expect( RDFNode.is( node ) ).toBe( true );
				expect( node[ "@id" ] ).toBe( "http://example.com/pointer/" );

				expect( expandedObject[ "http://example.com/ns#another-prefixed-pointer" ] ).toBeDefined();
				expect( expandedObject[ "http://example.com/ns#another-prefixed-pointer" ] ).toEqual( [ {
					"@id": "http://example.com/ns#another-resource/",
				} ] );

				expect( expandedObject[ "http://example.com/ns#another-pointer-in-schema" ] ).toBeDefined();
				expect( expandedObject[ "http://example.com/ns#another-pointer-in-schema" ] ).toEqual( [ {
					"@id": "http://example.com/ns#property-in-general",
				} ] );

				expect( expandedObject[ "http://example.com/my-vocabulary#notInSchemaLiteral" ] ).toBeDefined();
				expect( expandedObject[ "http://example.com/my-vocabulary#notInSchemaLiteral" ] ).toEqual( [ {
					"@value": "Property Literal not defined in Schema",
					"@type": XSD.string,
				} ] );

				expect( expandedObject[ "http://example.com/my-vocabulary#notInSchemaPointer" ] ).toBeDefined();
				expect( expandedObject[ "http://example.com/my-vocabulary#notInSchemaPointer" ] ).toEqual( [ {
					"@id": "http://example.com/another-pointer/",
				} ] );

				expect( expandedObject[ "http://example.com/ns#vocab-pointer" ] ).toBeDefined();
				expect( expandedObject[ "http://example.com/ns#vocab-pointer" ] ).toEqual( [ {
					"@id": "http://example.com/my-vocabulary#to-pointer",
				} ] );

				expect( expandedObject[ "http://example.com/ns#relative-pointer" ] ).toBeDefined();
				expect( expandedObject[ "http://example.com/ns#relative-pointer" ] ).toEqual( [ {
					"@id": "http://example.com/relative-pointer/",
				} ] );

				expect( expandedObject[ "http://example.com/my-vocabulary#elementWithoutID" ] ).toBeDefined();
				property = expandedObject[ "http://example.com/my-vocabulary#elementWithoutID" ];
				expect( property ).toEqual( jasmine.any( Array ) );
				expect( property.length ).toBe( 1 );
				literal = <RDFLiteral> property[ 0 ];
				expect( RDFLiteral.is( literal ) ).toBe( true );
				expect( RDFLiteral.hasType( literal, XSD.string ) ).toBe( true );
				expect( literal[ "@value" ] ).toBe( "This element will be converted into a set" );

				expect( expandedObject[ "http://example.com/my-vocabulary#relative-at-id" ] ).toBeDefined();
				property = expandedObject[ "http://example.com/my-vocabulary#relative-at-id" ];
				expect( property ).toEqual( jasmine.any( Array ) );
				expect( property.length ).toBe( 1 );
				literal = <RDFLiteral> property[ 0 ];
				expect( RDFLiteral.is( literal ) ).toBe( true );
				expect( RDFLiteral.hasType( literal, XSD.string ) ).toBe( true );
				expect( literal[ "@value" ] ).toBe( "Property with a relative @id" );
			} );

		} );

	} );

} );
