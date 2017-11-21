import { LimitToken, OffsetToken, OptionalToken, OrderToken, PredicateToken, PrefixedNameToken, SelectToken, SubjectToken, VariableToken } from "sparqler/tokens";

import AbstractContext from "../../AbstractContext";
import { clazz, extendsClass, hasDefaultExport, INSTANCE, method, module } from "../../test/JasmineExtender";
import QueryContextBuilder from "./QueryContextBuilder";
import * as QueryDocumentBuilder from "./QueryDocumentBuilder";
import * as Module from "./QueryDocumentsBuilder";
import { Class as QueryDocumentsBuilder } from "./QueryDocumentsBuilder";
import * as QueryProperty from "./QueryProperty";

describe( module( "Carbon/SPARQL/QueryDocument/QueryDocumentsBuilder" ), ():void => {

	it( "should exists", ():void => {
		expect( Module ).toBeDefined();
		expect( Module ).toEqual( jasmine.any( Object ) );
	} );

	it( hasDefaultExport( "Carbon.SPARQL.QueryDocument.QueryDocumentsBuilder.Class" ), ():void => {
		expect( Module.default ).toBeDefined();
		expect( Module.default ).toBe( QueryDocumentsBuilder );
	} );

	describe( clazz( "Carbon.SPARQL.QueryDocument.QueryDocumentsBuilder.Class", "Class with the helpers and properties for construct a query document" ), ():void => {

		it( "should exists", ():void => {
			expect( QueryDocumentsBuilder ).toBeDefined();
			expect( QueryDocumentsBuilder ).toEqual( jasmine.any( Function ) );
		} );

		let context:AbstractContext;
		let queryContext:QueryContextBuilder;
		let baseProperty:QueryProperty.Class;
		let selectToken:SelectToken;
		beforeEach( ():void => {
			context = new class extends AbstractContext {
				protected _baseURI:string = "http://example.com";
			};
			context.setSetting( "vocabulary", "http://example.com/vocab#" );
			context.extendObjectSchema( {
				"ex": "http://example.com/ns#",
			} );

			queryContext = new QueryContextBuilder( context );

			baseProperty = queryContext.addProperty( "member" );

			const membershipResource:VariableToken = queryContext.getVariable( "membershipResource" );
			const hasMemberRelation:VariableToken = queryContext.getVariable( "hasMemberRelation" );
			selectToken = new SelectToken()
				.addVariable( baseProperty.variable )
				.addPattern( new SubjectToken( membershipResource )
					.addPredicate( new PredicateToken( hasMemberRelation )
						.addObject( baseProperty.variable )
					)
				)
			;
			baseProperty.addPattern( selectToken );
		} );

		describe( "QueryDocumentsBuilder.constructor", ():void => {

			it( "should exists", ():void => {
				const builder:QueryDocumentsBuilder = new QueryDocumentsBuilder( queryContext, baseProperty );
				expect( builder ).toBeDefined();
				expect( builder ).toEqual( jasmine.any( QueryDocumentsBuilder ) );
			} );

			it( "should be instantiable", ():void => {
				const builder:QueryDocumentsBuilder = new QueryDocumentsBuilder( queryContext, baseProperty );
				expect( builder ).toBeDefined();
				expect( builder ).toEqual( jasmine.any( QueryDocumentsBuilder ) );
			} );

		} );

		it( extendsClass( "Carbon.QueryDocuments.QueryDocumentBuilder.Class" ), ():void => {
			const builder:QueryDocumentsBuilder = new QueryDocumentsBuilder( queryContext, baseProperty );
			expect( builder ).toEqual( jasmine.any( QueryDocumentBuilder.Class ) );
		} );

		describe( method( INSTANCE, "orderBy" ), ():void => {

			it( "should exists", ():void => {
				expect( QueryDocumentsBuilder.prototype.orderBy ).toBeDefined();
				expect( QueryDocumentsBuilder.prototype.orderBy ).toEqual( jasmine.any( Function ) );
			} );

			it( "should call to private _orderBy", ():void => {
				const builder:QueryDocumentsBuilder = new QueryDocumentsBuilder( queryContext, baseProperty );
				const spy:jasmine.Spy = spyOn( builder, "_orderBy" as any ).and.returnValue( builder );

				const property:QueryProperty.Class = new QueryProperty.Class( queryContext, "member.property" );
				builder.orderBy( property );

				expect( spy ).toHaveBeenCalledWith( property );
			} );

			it( "should return itself", ():void => {
				const builder:QueryDocumentsBuilder = new QueryDocumentsBuilder( queryContext, baseProperty );
				spyOn( builder, "_orderBy" as any ).and.returnValue( builder );

				const property:QueryProperty.Class = new QueryProperty.Class( queryContext, "member.property" );
				const returnedValue:QueryDocumentsBuilder = builder.orderBy( property );

				expect( returnedValue ).toBe( builder );
			} );

		} );

		describe( method( INSTANCE, "orderAscendantBy" ), ():void => {

			it( "should exists", ():void => {
				expect( QueryDocumentsBuilder.prototype.orderAscendantBy ).toBeDefined();
				expect( QueryDocumentsBuilder.prototype.orderAscendantBy ).toEqual( jasmine.any( Function ) );
			} );

			it( "should call to private _orderBy", ():void => {
				const builder:QueryDocumentsBuilder = new QueryDocumentsBuilder( queryContext, baseProperty );
				const spy:jasmine.Spy = spyOn( builder, "_orderBy" as any ).and.returnValue( builder );

				const property:QueryProperty.Class = new QueryProperty.Class( queryContext, "member.property" );
				builder.orderAscendantBy( property );

				expect( spy ).toHaveBeenCalledWith( property, "ASC" );
			} );

			it( "should return itself", ():void => {
				const builder:QueryDocumentsBuilder = new QueryDocumentsBuilder( queryContext, baseProperty );
				spyOn( builder, "_orderBy" as any ).and.returnValue( builder );

				const property:QueryProperty.Class = new QueryProperty.Class( queryContext, "member.property" );
				const returnedValue:QueryDocumentsBuilder = builder.orderAscendantBy( property );

				expect( returnedValue ).toBe( builder );
			} );

		} );

		describe( method( INSTANCE, "orderDescendantBy" ), ():void => {

			it( "should exists", ():void => {
				expect( QueryDocumentsBuilder.prototype.orderDescendantBy ).toBeDefined();
				expect( QueryDocumentsBuilder.prototype.orderDescendantBy ).toEqual( jasmine.any( Function ) );
			} );

			it( "should call to private _orderBy", ():void => {
				const builder:QueryDocumentsBuilder = new QueryDocumentsBuilder( queryContext, baseProperty );
				const spy:jasmine.Spy = spyOn( builder, "_orderBy" as any ).and.returnValue( builder );

				const property:QueryProperty.Class = new QueryProperty.Class( queryContext, "member.property" );
				builder.orderDescendantBy( property );

				expect( spy ).toHaveBeenCalledWith( property, "DESC" );
			} );

			it( "should return itself", ():void => {
				const builder:QueryDocumentsBuilder = new QueryDocumentsBuilder( queryContext, baseProperty );
				spyOn( builder, "_orderBy" as any ).and.returnValue( builder );

				const property:QueryProperty.Class = new QueryProperty.Class( queryContext, "member.property" );
				const returnedValue:QueryDocumentsBuilder = builder.orderDescendantBy( property );

				expect( returnedValue ).toBe( builder );
			} );

		} );

		describe( method( INSTANCE, "limit" ), ():void => {

			it( "should exists", ():void => {
				expect( QueryDocumentsBuilder.prototype.limit ).toBeDefined();
				expect( QueryDocumentsBuilder.prototype.limit ).toEqual( jasmine.any( Function ) );
			} );

			it( "should throw error when no select token defined", ():void => {
				baseProperty = queryContext.addProperty( "member" );
				const builder:QueryDocumentsBuilder = new QueryDocumentsBuilder( queryContext, baseProperty );
				const helper:( limit:number ) => void = limit => () => {
					builder.limit( limit );
				};

				expect( helper( 10 ) ).toThrowError( `A sub-select token has not been defined.` );
				expect( helper( 100 ) ).toThrowError( `A sub-select token has not been defined.` );
			} );

			it( "should return itself", ():void => {
				const builder:QueryDocumentsBuilder = new QueryDocumentsBuilder( queryContext, baseProperty );
				const helper:( limit:number ) => void = limit => {
					const returnedValue:QueryDocumentsBuilder = builder.limit( limit );
					expect( returnedValue ).toBe( builder );
				};

				helper( 10 );
				helper( 100 );
			} );

			it( "should add modifier in the sub-select", ():void => {
				const builder:QueryDocumentsBuilder = new QueryDocumentsBuilder( queryContext, baseProperty );

				builder.limit( 10 );
				expect( selectToken.modifiers ).toEqual( [
					new LimitToken( 10 ),
				] );
			} );

			it( "should replace the modifier in the sub-select", ():void => {
				selectToken.modifiers.push( new LimitToken( 10 ) );
				const builder:QueryDocumentsBuilder = new QueryDocumentsBuilder( queryContext, baseProperty );

				builder.limit( 100 );
				expect( selectToken.modifiers ).toEqual( [
					new LimitToken( 100 ),
				] );
			} );

			it( "should add modifier last that offset modifier", ():void => {
				selectToken.modifiers.push( new OffsetToken( 10 ) );
				const builder:QueryDocumentsBuilder = new QueryDocumentsBuilder( queryContext, baseProperty );

				builder.limit( 100 );
				expect( selectToken.modifiers ).toEqual( [
					new OffsetToken( 10 ),
					new LimitToken( 100 ),
				] );
			} );

			it( "should add modifier last that order modifier", ():void => {
				selectToken.modifiers.push( new OrderToken( queryContext.getVariable( "member.property" ) ) );
				const builder:QueryDocumentsBuilder = new QueryDocumentsBuilder( queryContext, baseProperty );

				builder.limit( 100 );
				expect( selectToken.modifiers ).toEqual( [
					new OrderToken( queryContext.getVariable( "member.property" ) ),
					new LimitToken( 100 ),
				] );
			} );

		} );

		describe( method( INSTANCE, "offset" ), ():void => {

			it( "should exists", ():void => {
				expect( QueryDocumentsBuilder.prototype.offset ).toBeDefined();
				expect( QueryDocumentsBuilder.prototype.offset ).toEqual( jasmine.any( Function ) );
			} );

			it( "should throw error when no select token defined", ():void => {
				baseProperty = queryContext.addProperty( "member" );
				const builder:QueryDocumentsBuilder = new QueryDocumentsBuilder( queryContext, baseProperty );
				const helper:( offset:number ) => void = offset => () => {
					builder.offset( offset );
				};

				expect( helper( 10 ) ).toThrowError( `A sub-select token has not been defined.` );
				expect( helper( 100 ) ).toThrowError( `A sub-select token has not been defined.` );
			} );

			it( "should return itself", ():void => {
				const builder:QueryDocumentsBuilder = new QueryDocumentsBuilder( queryContext, baseProperty );
				const helper:( offset:number ) => void = offset => {
					const returnedValue:QueryDocumentsBuilder = builder.offset( offset );
					expect( returnedValue ).toBe( builder );
				};

				helper( 10 );
				helper( 100 );
			} );

			it( "should add modifier in the sub-select", ():void => {
				const builder:QueryDocumentsBuilder = new QueryDocumentsBuilder( queryContext, baseProperty );

				builder.offset( 10 );
				expect( selectToken.modifiers ).toEqual( [
					new OffsetToken( 10 ),
				] );
			} );

			it( "should replace the modifier in the sub-select", ():void => {
				selectToken.modifiers.push( new OffsetToken( 10 ) );
				const builder:QueryDocumentsBuilder = new QueryDocumentsBuilder( queryContext, baseProperty );

				builder.offset( 100 );
				expect( selectToken.modifiers ).toEqual( [
					new OffsetToken( 100 ),
				] );
			} );

			it( "should add modifier last that limit modifier", ():void => {
				selectToken.modifiers.push( new LimitToken( 10 ) );
				const builder:QueryDocumentsBuilder = new QueryDocumentsBuilder( queryContext, baseProperty );

				builder.offset( 100 );
				expect( selectToken.modifiers ).toEqual( [
					new LimitToken( 10 ),
					new OffsetToken( 100 ),
				] );
			} );

			it( "should add modifier last that order modifier", ():void => {
				selectToken.modifiers.push( new OrderToken( queryContext.getVariable( "member.property" ) ) );
				const builder:QueryDocumentsBuilder = new QueryDocumentsBuilder( queryContext, baseProperty );

				builder.offset( 100 );
				expect( selectToken.modifiers ).toEqual( [
					new OrderToken( queryContext.getVariable( "member.property" ) ),
					new OffsetToken( 100 ),
				] );
			} );

		} );

		describe( "QueryDocumentsBuilder._orderBy", ():void => {

			it( "should exists", ():void => {
				expect( QueryDocumentsBuilder.prototype[ "_orderBy" ] ).toBeDefined();
				expect( QueryDocumentsBuilder.prototype[ "_orderBy" ] ).toEqual( jasmine.any( Function ) );
			} );

			it( "should throw error when property is not a direct property", ():void => {
				const builder:QueryDocumentsBuilder = new QueryDocumentsBuilder( queryContext, baseProperty );
				const helper:( name:string ) => void = name => () => {
					const property:QueryProperty.Class = new QueryProperty.Class( queryContext, name );
					builder[ "_orderBy" ]( property );
				};

				expect( helper( "member" ) ).toThrowError( `Property "member" isn't a direct property of a member.` );

				expect( helper( "member.property" ) ).not.toThrowError( `Property "member.property" isn't a direct property of a member.` );

				expect( helper( "member.property.sub-property" ) ).toThrowError( `Property "member.property.sub-property" isn't a direct property of a member.` );
				expect( helper( "member.property-2.sub-property-2" ) ).toThrowError( `Property "member.property-2.sub-property-2" isn't a direct property of a member.` );
			} );

			it( "should throw error when no select token defined", ():void => {
				baseProperty = queryContext.addProperty( "member" );
				const builder:QueryDocumentsBuilder = new QueryDocumentsBuilder( queryContext, baseProperty );
				const helper:( name:string ) => void = name => () => {
					const property:QueryProperty.Class = new QueryProperty.Class( queryContext, name );
					builder[ "_orderBy" ]( property );
				};

				expect( helper( "member.property" ) ).toThrowError( `A sub-select token has not been defined.` );
				expect( helper( "member.property-2" ) ).toThrowError( `A sub-select token has not been defined.` );
			} );

			it( "should throw error when no valid property provided", ():void => {
				const builder:QueryDocumentsBuilder = new QueryDocumentsBuilder( queryContext, baseProperty );
				const helper:( name:string ) => void = name => () => {
					const property:QueryProperty.Class = new QueryProperty.Class( queryContext, name );
					builder[ "_orderBy" ]( property );
				};

				expect( helper( "member.property" ) ).toThrowError( `The property provided is not a valid property defined by the builder.` );
				expect( helper( "member.property-2" ) ).toThrowError( `The property provided is not a valid property defined by the builder.` );
			} );

			it( "should return itself", ():void => {
				const builder:QueryDocumentsBuilder = new QueryDocumentsBuilder( queryContext, baseProperty );
				const helper:( name:string ) => void = name => {
					const property:QueryProperty.Class = new QueryProperty.Class( queryContext, name );
					property.addPattern( new OptionalToken()
						.addPattern( new SubjectToken( baseProperty.variable )
							.addPredicate( new PredicateToken( new PrefixedNameToken( "ex:path" ) )
								.addObject( property.variable ) ) ) );

					const returnedValue:QueryDocumentsBuilder = builder[ "_orderBy" ]( property );
					expect( returnedValue ).toBe( builder );
				};

				helper( "member.property" );
				helper( "member.property-2" );
			} );

			it( "should add modifier in the sub-select", ():void => {
				const builder:QueryDocumentsBuilder = new QueryDocumentsBuilder( queryContext, baseProperty );

				const property:QueryProperty.Class = new QueryProperty.Class( queryContext, "member.property" );
				property.addPattern( new OptionalToken()
					.addPattern( new SubjectToken( baseProperty.variable )
						.addPredicate( new PredicateToken( new PrefixedNameToken( "ex:path" ) )
							.addObject( property.variable )
						)
					)
				);

				builder[ "_orderBy" ]( property );
				expect( selectToken.modifiers ).toEqual( [
					new OrderToken( property.variable ),
				] );
			} );

			it( "should add modifier with specific ascendant flow in the sub-select", ():void => {
				const builder:QueryDocumentsBuilder = new QueryDocumentsBuilder( queryContext, baseProperty );

				const property:QueryProperty.Class = new QueryProperty.Class( queryContext, "member.property" );
				property.addPattern( new OptionalToken()
					.addPattern( new SubjectToken( baseProperty.variable )
						.addPredicate( new PredicateToken( new PrefixedNameToken( "ex:path" ) )
							.addObject( property.variable )
						)
					)
				);

				builder[ "_orderBy" ]( property, "ASC" );
				expect( selectToken.modifiers ).toEqual( [
					new OrderToken( property.variable, "ASC" ),
				] );
			} );

			it( "should add modifier with specific descendant flow in the sub-select", ():void => {
				const builder:QueryDocumentsBuilder = new QueryDocumentsBuilder( queryContext, baseProperty );

				const property:QueryProperty.Class = new QueryProperty.Class( queryContext, "member.property" );
				property.addPattern( new OptionalToken()
					.addPattern( new SubjectToken( baseProperty.variable )
						.addPredicate( new PredicateToken( new PrefixedNameToken( "ex:path" ) )
							.addObject( property.variable )
						)
					)
				);

				builder[ "_orderBy" ]( property, "DESC" );
				expect( selectToken.modifiers ).toEqual( [
					new OrderToken( property.variable, "DESC" ),
				] );
			} );

			it( "should replace existing modifier in the sub-select", ():void => {
				const builder:QueryDocumentsBuilder = new QueryDocumentsBuilder( queryContext, baseProperty );

				const oldProperty:QueryProperty.Class = new QueryProperty.Class( queryContext, "member.property-1" );
				oldProperty.addPattern( new OptionalToken()
					.addPattern( new SubjectToken( baseProperty.variable )
						.addPredicate( new PredicateToken( new PrefixedNameToken( "ex:path" ) )
							.addObject( oldProperty.variable )
						)
					)
				);
				builder[ "_orderBy" ]( oldProperty );

				const newProperty:QueryProperty.Class = new QueryProperty.Class( queryContext, "member.property-2" );
				newProperty.addPattern( new OptionalToken()
					.addPattern( new SubjectToken( baseProperty.variable )
						.addPredicate( new PredicateToken( new PrefixedNameToken( "ex:path" ) )
							.addObject( newProperty.variable )
						)
					)
				);
				builder[ "_orderBy" ]( newProperty );

				expect( selectToken.modifiers ).toEqual( [
					new OrderToken( newProperty.variable ),
				] );
			} );

			it( "should add modifier first that limit modifier", ():void => {
				selectToken.addModifier( new LimitToken( 10 ) );

				const builder:QueryDocumentsBuilder = new QueryDocumentsBuilder( queryContext, baseProperty );

				const property:QueryProperty.Class = new QueryProperty.Class( queryContext, "member.property" );
				property.addPattern( new OptionalToken()
					.addPattern( new SubjectToken( baseProperty.variable )
						.addPredicate( new PredicateToken( new PrefixedNameToken( "ex:path" ) )
							.addObject( property.variable )
						)
					)
				);

				builder[ "_orderBy" ]( property );
				expect( selectToken.modifiers ).toEqual( [
					new OrderToken( property.variable ),
					new LimitToken( 10 ),
				] );
			} );

			it( "should add modifier first that offset modifier", ():void => {
				selectToken.addModifier( new OffsetToken( 10 ) );

				const builder:QueryDocumentsBuilder = new QueryDocumentsBuilder( queryContext, baseProperty );

				const property:QueryProperty.Class = new QueryProperty.Class( queryContext, "member.property" );
				property.addPattern( new OptionalToken()
					.addPattern( new SubjectToken( baseProperty.variable )
						.addPredicate( new PredicateToken( new PrefixedNameToken( "ex:path" ) )
							.addObject( property.variable )
						)
					)
				);

				builder[ "_orderBy" ]( property );
				expect( selectToken.modifiers ).toEqual( [
					new OrderToken( property.variable ),
					new OffsetToken( 10 ),
				] );
			} );

			it( "should add the property triple in the sub-select", ():void => {
				const builder:QueryDocumentsBuilder = new QueryDocumentsBuilder( queryContext, baseProperty );

				const property:QueryProperty.Class = new QueryProperty.Class( queryContext, "member.property" );
				property.addPattern( new OptionalToken()
					.addPattern( new SubjectToken( baseProperty.variable )
						.addPredicate( new PredicateToken( new PrefixedNameToken( "ex:path" ) )
							.addObject( property.variable )
						)
					)
				);

				builder[ "_orderBy" ]( property );
				expect( selectToken.patterns ).toEqual( jasmine.arrayContaining( [
					new OptionalToken()
						.addPattern( new SubjectToken( baseProperty.variable )
							.addPredicate( new PredicateToken( new PrefixedNameToken( "ex:path" ) )
								.addObject( property.variable )
							)
						)
					,
				] ) as any );
			} );

			it( "should replace the property triple in the sub-select", ():void => {
				const builder:QueryDocumentsBuilder = new QueryDocumentsBuilder( queryContext, baseProperty );

				const oldProperty:QueryProperty.Class = new QueryProperty.Class( queryContext, "member.property-1" );
				oldProperty.addPattern( new OptionalToken()
					.addPattern( new SubjectToken( baseProperty.variable )
						.addPredicate( new PredicateToken( new PrefixedNameToken( "ex:path" ) )
							.addObject( oldProperty.variable )
						)
					)
				);
				builder[ "_orderBy" ]( oldProperty );

				const newProperty:QueryProperty.Class = new QueryProperty.Class( queryContext, "member.property-2" );
				newProperty.addPattern( new OptionalToken()
					.addPattern( new SubjectToken( baseProperty.variable )
						.addPredicate( new PredicateToken( new PrefixedNameToken( "ex:path" ) )
							.addObject( newProperty.variable )
						)
					)
				);
				builder[ "_orderBy" ]( newProperty );

				expect( selectToken.patterns ).not.toEqual( jasmine.arrayContaining( [
					new OptionalToken()
						.addPattern( new SubjectToken( baseProperty.variable )
							.addPredicate( new PredicateToken( new PrefixedNameToken( "ex:path" ) )
								.addObject( oldProperty.variable )
							)
						)
					,
				] ) as any );

				expect( selectToken.patterns ).toEqual( jasmine.arrayContaining( [
					new OptionalToken()
						.addPattern( new SubjectToken( baseProperty.variable )
							.addPredicate( new PredicateToken( new PrefixedNameToken( "ex:path" ) )
								.addObject( newProperty.variable )
							)
						)
					,
				] ) as any );
			} );

		} );

	} );

} );