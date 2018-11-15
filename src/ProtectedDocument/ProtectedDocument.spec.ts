import { AnyJasmineValue } from "../../test/helpers/types";
import { AbstractContext } from "../AbstractContext";
import {
	CompleteACReport,
	DetailedUserACReport,
	SimpleUserACReport
} from "../Auth";
import { CarbonLDP } from "../CarbonLDP";
import { Document, } from "../Document";
import { Documents } from "../Documents";
import { Header } from "../HTTP";
import { Pointer } from "../Pointer";

import {
	extendsClass,
	hasMethod,
	hasProperty,
	hasSignature,
	interfaze,
	isDefined,
	method,
	module,
	OBLIGATORY,
	OPTIONAL,
	property,
	STATIC,
} from "../test/JasmineExtender";
import * as Utils from "../Utils";
import {
	C,
	CS,
	LDP,
	XSD,
} from "../Vocabularies";
import { ProtectedDocument } from "./ProtectedDocument";


function createMock<T extends object>( documents:Documents, data?:T & Partial<ProtectedDocument> ):T & ProtectedDocument {
	return ProtectedDocument.decorate( Object.assign( {
		id: "https://example.com/resource/",
	}, data ), documents );
}

describe( module( "carbonldp/ProtectedDocument" ), ():void => {

	describe( interfaze(
		"CarbonLDP.ProtectedDocument",
		"Interface that represents a persisted protected document."
	), ():void => {

		let context:AbstractContext;
		beforeEach( ():void => {
			jasmine.Ajax.install();

			context = new class extends AbstractContext {
				protected _baseURI:string = "https://example.com/";
			};
		} );

		afterEach( ():void => {
			jasmine.Ajax.uninstall();
		} );

		it( extendsClass( "CarbonLDP.Document" ), ():void => {} );

		it( hasProperty(
			OPTIONAL,
			"accessControlList",
			"CarbonLDP.Pointer",
			"A reference to the ACL of the document."
		), ():void => {} );

		it( hasProperty(
			OPTIONAL,
			"creator",
			"CarbonLDP.Pointer"
		), ():void => {
			const target:ProtectedDocument[ "creator" ] = {} as Pointer;
			expect( target ).toBeDefined();
		} );

		it( hasProperty(
			OPTIONAL,
			"owners",
			"CarbonLDP.Pointer"
		), ():void => {
			const target:ProtectedDocument[ "owners" ] = {} as Pointer;
			expect( target ).toBeDefined();
		} );


		describe( method( OBLIGATORY, "getACL" ), ():void => {

			it( hasSignature(
				"Obtains and resolve the ACL of the actual document.", [
					{ name: "requestOptions", type: "CarbonLDP.HTTP.RequestOptions", optional: true, description: "Customizable options for the request." },
				],
				{ type: "Promise<CarbonLDP.Auth.ACL>" }
			), ():void => {} );

			it( "should exists", ():void => {
				const document:ProtectedDocument = ProtectedDocument.decorate(
					context.documents.getPointer( "http://example.com/resource/" ),
					context.documents
				);

				expect( document.getACL ).toBeDefined();
				expect( document.getACL ).toEqual( jasmine.any( Function ) );
			} );

			it( "should call get when document resolved", ( done:DoneFn ):void => {
				const document:ProtectedDocument = ProtectedDocument.decorate(
					Object.assign( context.documents.getPointer( "https://example.com/resource/" ), {
						_resolved: true,
						accessControlList: context.documents.getPointer( "https://example.com/resource/.acl/" ),
					} ),
					context.documents
				);

				const spy:jasmine.Spy = spyOn( context.documents, "get" )
					.and.returnValue( Promise.reject( "spy called" ) );

				document.getACL()
					.then( () => {
						done.fail( "Should not resolve" );
					} )
					.catch( returned => {
						expect( returned ).toBe( "spy called" );

						expect( spy ).toHaveBeenCalledWith( "https://example.com/resource/.acl/", void 0 );

						done();
					} );
			} );

			it( "should construct correct query", ( done:DoneFn ):void => {
				const document:ProtectedDocument = ProtectedDocument.decorate(
					Object.assign( context.documents.getPointer( "https://example.com/resource/" ), {
						_resolved: false,
					} ),
					context.documents
				);

				const spy:jasmine.Spy = spyOn( context.documents, "executeRawCONSTRUCTQuery" )
					.and.returnValue( Promise.reject( null ) );

				document.getACL()
					.then( () => {
						done.fail( "Should not resolve" );
					} )
					.catch( ( error ) => {
						if( error ) done.fail( error );

						const [ uri, query ] = spy
							.calls
							.mostRecent()
							.args;

						expect( uri ).toBe( "https://example.com/resource/" );

						expect( query ).toBe( "" +
							"CONSTRUCT {" +
							` ?metadata a <${ C.VolatileResource }>, <${ C.QueryMetadata }>;` +
							"" + ` <${ C.target }> ?document.` +

							" ?document a ?document__types;" +
							"" + ` <${ CS.accessControlList }> ?document__accessControlList.` +

							" ?document__accessControlList___subject ?document__accessControlList___predicate ?document__accessControlList___object " +

							"} WHERE {" +
							" BIND(BNODE() AS ?metadata)." +

							" VALUES ?document { <https://example.com/resource/> }." +
							" OPTIONAL { ?document a ?document__types }." +
							` ?document a <${ CS.ProtectedDocument }>.` +

							" OPTIONAL {" +
							"" + ` ?document <${ CS.accessControlList }> ?document__accessControlList.` +
							"" + " FILTER( ! isLiteral( ?document__accessControlList ) )." +
							"" + " GRAPH ?document__accessControlList {" +
							"" + "" + " ?document__accessControlList___subject ?document__accessControlList___predicate ?document__accessControlList___object" +
							"" + " }" +
							" } " +
							"}"
						);

						done();
					} );
			} );

			it( "should return the queried ACL", ( done:DoneFn ):void => {
				jasmine.Ajax.stubRequest( "https://example.com/resource/" ).andReturn( {
					status: 200,
					responseText: `[ {
							"@id":"_:1",
							"@type": [
								"${ C.VolatileResource }",
								"${ C.QueryMetadata }"
							],
							"${ C.target }": [ {
								"@id":"https://example.com/resource/"
							} ]
						}, {
							"@id": "_:2",
							"@type": [
								"${ C.ResponseMetadata }",
								"${ C.VolatileResource }"
							],
							"${ C.documentMetadata }": [ {
								"@id": "_:3"
							}, {
								"@id": "_:4"
							} ]
						}, {
							"@id": "_:3",
							"@type": [
								"${ C.DocumentMetadata }",
								"${ C.VolatileResource }"
							],
							"${ C.eTag }": [ {
								"@value": "\\"1-12345\\""
							} ],
							"${ C.relatedDocument }": [ {
								"@id": "https://example.com/resource/"
							} ]
						}, {
							"@id": "_:4",
							"@type": [
								"${ C.DocumentMetadata }",
								"${ C.VolatileResource }"
							],
							"${ C.eTag }": [ {
								"@value": "\\"2-12345\\""
							} ],
							"${ C.relatedDocument }": [ {
								"@id": "https://example.com/resource/.acl/"
							} ]
						}, {
							"@id": "https://example.com/resource/",
							"@graph": [ {
								"@id": "https://example.com/resource/",
								"@type": [
									"${ C.Document }",
									"${ CS.ProtectedDocument }"
								],
								"${ CS.accessControlList }": [ {
									"@id": "https://example.com/resource/.acl/"
								} ]
							} ]
						}, {
							"@id": "https://example.com/resource/.acl/",
							"@graph": [ {
								"@id": "https://example.com/resource/.acl/",
								"@type": [
									"${ C.Document }",
									"${ CS.AccessControlList }"
								],
								"${ CS.protectedDocument }": [ {
									"@id": "https://example.com/resource/"
								} ]
							} ]
						} ]`,
				} );

				const document:ProtectedDocument = ProtectedDocument.decorate(
					Object.assign( context.documents.getPointer( "https://example.com/resource/" ), {
						_resolved: false,
					} ),
					context.documents
				);

				document.getACL()
					.then( ( acl ) => {
						expect( acl ).toEqual( jasmine.objectContaining( {
							_eTag: "\"2-12345\"",
							types: jasmine.arrayContaining( [ CS.AccessControlList ] ) as any as string[],
							protectedDocument: jasmine.objectContaining( {
								"id": "https://example.com/resource/",
							} ) as any,
						} ) );

						done();
					} )
					.catch( done.fail );
			} );

		} );


		describe( method( OBLIGATORY, "getSimpleUserACReport" ), () => {

			it( hasSignature(
				"Returns a `CarbonLDP.Auth.SimpleUserACReport` of the current document.",
				[
					{ name: "requestOptions", type: "CarbonLDP.HTTP.RequestOptions", optional: true, description: "Customizable options for the request." },
				],
				{ type: "CarbonLDP.Auth.SimpleUserACReport" }
			), () => {} );

			it( hasSignature(
				"Returns a `CarbonLDP.Auth.SimpleUserACReport` of the specified document.",
				[
					{ name: "uri", type: "string", description: "URI of the document to get the report for." },
					{ name: "requestOptions", type: "CarbonLDP.HTTP.RequestOptions", optional: true, description: "Customizable options for the request." },
				],
				{ type: "CarbonLDP.Auth.SimpleUserACReport" }
			), () => {} );

			it( "should exists", ():void => {
				const resource:ProtectedDocument = createMock( new Documents() );

				expect( resource.getSimpleUserACReport ).toBeDefined();
				expect( resource.getSimpleUserACReport ).toEqual( jasmine.any( Function ) );
			} );


			function stubRequest( uri:string ):void {
				jasmine.Ajax.stubRequest( uri, null, "GET" )
					.andReturn( {
						responseHeaders: {},
						responseText: JSON.stringify( [
							{
								"@id": "_:1",
								"@type": [ CS.SimpleUserACReport ],
								[ CS.protectedDocument ]: [ {
									"@id": uri,
								} ],
								[ CS.permission ]: [
									{ "@id": CS.Read },
									{ "@id": CS.Update },
									{ "@id": CS.CreateChild },
								],
							},
						] ),
					} );
			}

			describe( "When has a context", () => {

				let resource:ProtectedDocument;
				beforeEach( () => {
					context = new CarbonLDP( "https://example.com/" );
					resource = createMock( context.documents );
				} );

				it( "should send request to self ID when no URI", async () => {
					stubRequest( "https://example.com/resource/" );

					await resource
						.getSimpleUserACReport();

					const request:JasmineAjaxRequest = jasmine.Ajax.requests.mostRecent();
					expect( request.url ).toBe( "https://example.com/resource/" );
				} );

				it( "should send request to of specified URI", async () => {
					stubRequest( "https://example.com/another-resource/" );

					await resource
						.getSimpleUserACReport( "https://example.com/another-resource/" );

					const request:JasmineAjaxRequest = jasmine.Ajax.requests.mostRecent();
					expect( request.url ).toBe( "https://example.com/another-resource/" );
				} );

				it( "should send request to of resolved relative URI", async () => {
					stubRequest( "https://example.com/resource/child/" );

					await resource
						.getSimpleUserACReport( "child/" );

					const request:JasmineAjaxRequest = jasmine.Ajax.requests.mostRecent();
					expect( request.url ).toBe( "https://example.com/resource/child/" );
				} );


				it( "should send default request headers when no URI", async () => {
					stubRequest( "https://example.com/resource/" );

					await resource
						.getSimpleUserACReport();

					const request:JasmineAjaxRequest = jasmine.Ajax.requests.mostRecent();
					expect( request.requestHeaders ).toEqual( {
						"accept": "application/ld+json",
						"prefer": [
							`include="${ CS.PreferSimpleUserACReport }"`,
							`include="${ C.PreferMinimalDocument }"`,
							`${ LDP.RDFSource }; rel=interaction-model`,
						].join( ", " ),
					} );
				} );

				it( "should send default request headers when URI", async () => {
					stubRequest( "https://example.com/resource/child/" );

					await resource
						.getSimpleUserACReport( "child/" );

					const request:JasmineAjaxRequest = jasmine.Ajax.requests.mostRecent();
					expect( request.requestHeaders ).toEqual( {
						"accept": "application/ld+json",
						"prefer": [
							`include="${ CS.PreferSimpleUserACReport }"`,
							`include="${ C.PreferMinimalDocument }"`,
							`${ LDP.RDFSource }; rel=interaction-model`,
						].join( ", " ),
					} );
				} );

				it( "should authorization header", async () => {
					stubRequest( "https://example.com/resource/" );

					const spy:jasmine.Spy = spyOn( context.auth, "addAuthentication" );

					await resource
						.getSimpleUserACReport();

					expect( spy ).toHaveBeenCalled();
				} );

				it( "should send custom headers when no URI", async () => {
					stubRequest( "https://example.com/resource/" );

					await resource
						.getSimpleUserACReport( {
							headers: new Map()
								.set( "custom", new Header( "custom value" ) )
							,
						} );

					const request:JasmineAjaxRequest = jasmine.Ajax.requests.mostRecent();
					expect( request.requestHeaders ).toEqual( jasmine.objectContaining( {
						"custom": "custom value",
					} ) );
				} );

				it( "should send custom headers when specified URI", async () => {
					stubRequest( "https://example.com/resource/child/" );

					await resource
						.getSimpleUserACReport( "child/", {
							headers: new Map()
								.set( "custom", new Header( "custom value" ) )
							,
						} );

					const request:JasmineAjaxRequest = jasmine.Ajax.requests.mostRecent();
					expect( request.requestHeaders ).toEqual( jasmine.objectContaining( {
						"custom": "custom value",
					} ) );
				} );


				it( "should return the report of self", async () => {
					stubRequest( "https://example.com/resource/" );

					const report:SimpleUserACReport = await resource
						.getSimpleUserACReport();

					expect( report as AnyJasmineValue<typeof report> ).toEqual( {
						protectedDocument: jasmine.objectContaining( { id: "https://example.com/resource/" } ),
						permissions: [
							jasmine.objectContaining( { id: CS.Read } ),
							jasmine.objectContaining( { id: CS.Update } ),
							jasmine.objectContaining( { id: CS.CreateChild } ),
						],
					} );
				} );

				it( "should return the report of the specified URI", async () => {
					stubRequest( "https://example.com/resource/child/" );

					const report:SimpleUserACReport = await resource
						.getSimpleUserACReport( "child/" );

					expect( report as AnyJasmineValue<typeof report> ).toEqual( {
						protectedDocument: jasmine.objectContaining( { id: "https://example.com/resource/child/" } ),
						permissions: [
							jasmine.objectContaining( { id: CS.Read } ),
							jasmine.objectContaining( { id: CS.Update } ),
							jasmine.objectContaining( { id: CS.CreateChild } ),
						],
					} );
				} );

			} );

			describe( "When has NO context", () => {

				let resource:ProtectedDocument;
				beforeEach( () => {
					resource = createMock( new Documents() );
				} );

				it( "should send request to self ID when no URI", async () => {
					stubRequest( "https://example.com/resource/" );

					await resource
						.getSimpleUserACReport();

					const request:JasmineAjaxRequest = jasmine.Ajax.requests.mostRecent();
					expect( request.url ).toBe( "https://example.com/resource/" );
				} );

				it( "should send request to of specified URI", async () => {
					stubRequest( "https://example.com/another-resource/" );

					await resource
						.getSimpleUserACReport( "https://example.com/another-resource/" );

					const request:JasmineAjaxRequest = jasmine.Ajax.requests.mostRecent();
					expect( request.url ).toBe( "https://example.com/another-resource/" );
				} );

				it( "should send request to of resolved relative URI", async () => {
					stubRequest( "https://example.com/resource/child/" );

					await resource
						.getSimpleUserACReport( "child/" );

					const request:JasmineAjaxRequest = jasmine.Ajax.requests.mostRecent();
					expect( request.url ).toBe( "https://example.com/resource/child/" );
				} );


				it( "should send default request headers when no URI", async () => {
					stubRequest( "https://example.com/resource/" );

					await resource
						.getSimpleUserACReport();

					const request:JasmineAjaxRequest = jasmine.Ajax.requests.mostRecent();
					expect( request.requestHeaders ).toEqual( {
						"accept": "application/ld+json",
						"prefer": [
							`include="${ CS.PreferSimpleUserACReport }"`,
							`include="${ C.PreferMinimalDocument }"`,
							`${ LDP.RDFSource }; rel=interaction-model`,
						].join( ", " ),
					} );
				} );

				it( "should send default request headers when URI", async () => {
					stubRequest( "https://example.com/resource/child/" );

					await resource
						.getSimpleUserACReport( "child/" );

					const request:JasmineAjaxRequest = jasmine.Ajax.requests.mostRecent();
					expect( request.requestHeaders ).toEqual( {
						"accept": "application/ld+json",
						"prefer": [
							`include="${ CS.PreferSimpleUserACReport }"`,
							`include="${ C.PreferMinimalDocument }"`,
							`${ LDP.RDFSource }; rel=interaction-model`,
						].join( ", " ),
					} );
				} );

				it( "should send custom headers when no URI", async () => {
					stubRequest( "https://example.com/resource/" );

					await resource
						.getSimpleUserACReport( {
							headers: new Map()
								.set( "custom", new Header( "custom value" ) )
							,
						} );

					const request:JasmineAjaxRequest = jasmine.Ajax.requests.mostRecent();
					expect( request.requestHeaders ).toEqual( jasmine.objectContaining( {
						"custom": "custom value",
					} ) );
				} );

				it( "should send custom headers when specified URI", async () => {
					stubRequest( "https://example.com/resource/child/" );

					await resource
						.getSimpleUserACReport( "child/", {
							headers: new Map()
								.set( "custom", new Header( "custom value" ) )
							,
						} );

					const request:JasmineAjaxRequest = jasmine.Ajax.requests.mostRecent();
					expect( request.requestHeaders ).toEqual( jasmine.objectContaining( {
						"custom": "custom value",
					} ) );
				} );


				it( "should return the report of self", async () => {
					stubRequest( "https://example.com/resource/" );

					const report:SimpleUserACReport = await resource
						.getSimpleUserACReport();

					expect( report as AnyJasmineValue<{ [ s:string ]:any }> ).toEqual( {
						[ CS.protectedDocument ]: jasmine.objectContaining( { id: "https://example.com/resource/" } ),
						[ CS.permission ]: [
							jasmine.objectContaining( { id: CS.Read } ),
							jasmine.objectContaining( { id: CS.Update } ),
							jasmine.objectContaining( { id: CS.CreateChild } ),
						],
					} );
				} );

				it( "should return the report of the specified URI", async () => {
					stubRequest( "https://example.com/resource/child/" );

					const report:SimpleUserACReport = await resource
						.getSimpleUserACReport( "child/" );

					expect( report as AnyJasmineValue<{ [ s:string ]:any }> ).toEqual( {
						[ CS.protectedDocument ]: jasmine.objectContaining( { id: "https://example.com/resource/child/" } ),
						[ CS.permission ]: [
							jasmine.objectContaining( { id: CS.Read } ),
							jasmine.objectContaining( { id: CS.Update } ),
							jasmine.objectContaining( { id: CS.CreateChild } ),
						],
					} );
				} );

			} );

		} );

		describe( method( OBLIGATORY, "getDetailedUserACReport" ), () => {

			it( hasSignature(
				"Returns a `CarbonLDP.Auth.DetailedUserACReport` of the current document.",
				[
					{ name: "requestOptions", type: "CarbonLDP.HTTP.RequestOptions", optional: true, description: "Customizable options for the request." },
				],
				{ type: "CarbonLDP.Auth.DetailedUserACReport" }
			), () => {} );

			it( hasSignature(
				"Returns a `CarbonLDP.Auth.DetailedUserACReport` of the specified document.",
				[
					{ name: "uri", type: "string", description: "URI of the document to get the report for." },
					{ name: "requestOptions", type: "CarbonLDP.HTTP.RequestOptions", optional: true, description: "Customizable options for the request." },
				],
				{ type: "CarbonLDP.Auth.DetailedUserACReport" }
			), () => {} );

			it( "should exists", ():void => {
				const resource:ProtectedDocument = createMock( new Documents() );

				expect( resource.getDetailedUserACReport ).toBeDefined();
				expect( resource.getDetailedUserACReport ).toEqual( jasmine.any( Function ) );
			} );


			function stubRequest( uri:string ):void {
				jasmine.Ajax.stubRequest( uri, null, "GET" )
					.andReturn( {
						responseHeaders: {},
						responseText: JSON.stringify( [
							{
								"@id": "_:1",
								"@type": [ CS.DetailedUserACReport ],
								[ CS.protectedDocument ]: [
									{ "@id": uri },
								],
								[ CS.permissionReport ]: [
									{ "@id": "_:2" },
									{ "@id": "_:3" },
								],
							},
							{
								"@id": "_:2",
								"@type": [ CS.PermissionReport ],
								[ CS.permission ]: [
									{ "@id": CS.Read },
								],
								[ CS.granted ]: [
									{ "@value": "true", "@type": XSD.boolean },
								],
								[ CS.grantingChain ]: [ {
									"@list": [
										{ "@id": "_:4" },
										{ "@id": "_:5" },
									],
								} ],
							},
							{
								"@id": "_:3",
								"@type": [ CS.PermissionReport ],
								[ CS.permission ]: [
									{ "@id": CS.Update },
								],
								[ CS.granted ]: [
									{ "@value": "true", "@type": XSD.boolean },
								],
								[ CS.grantingChain ]: [ {
									"@list": [
										{ "@id": "_:6" },
										{ "@id": "_:7" },
									],
								} ],
							},
							{
								"@id": "_:4",
								"@type": [ CS.GrantingStep ],
								[ CS.subject ]: [
									{ "@id": "https://example.com/.system/security/roles/some-role/" },
								],
								[ CS.applied ]: [
									{ "@value": "true", "@type": XSD.boolean },
								],
								[ CS.appliedBy ]: [
									{ "@id": CS.DirectACEntry },
								],
								[ CS.protectedDocument ]: [
									{ "@id": uri },
								],
								[ CS.accessControlList ]: [
									{ "@id": `${ uri }.acl/` },
								],
							},
							{
								"@id": "_:5",
								"@type": [ CS.GrantingStep ],
								[ CS.subject ]: [
									{ "@id": CS.AuthenticatedUser },
								],
								[ CS.appliedBy ]: [
									{ "@id": CS.AllDescendantsACEntry },
								],
								[ CS.applied ]: [
									{ "@value": "false", "@type": XSD.boolean },
								],
								[ CS.inheritanceDisabledBy ]: [ {
									"@list": [
										{ "@id": "https://example.com/resource/.acl/" },
									],
								} ],
								[ CS.protectedDocument ]: [
									{ "@id": "https://example.com/" },
								],
								[ CS.accessControlList ]: [
									{ "@id": "https://example.com/.acl/" },
								],
							},
							{
								"@id": "_:6",
								"@type": [ CS.GrantingStep ],
								[ CS.subject ]: [
									{ "@id": "https://example.com/.system/security/roles/some-role/" },
								],
								[ CS.applied ]: [
									{ "@value": "true", "@type": XSD.boolean },
								],
								[ CS.appliedBy ]: [
									{ "@id": CS.DirectACEntry },
								],
								[ CS.protectedDocument ]: [
									{ "@id": uri },
								],
								[ CS.accessControlList ]: [
									{ "@id": `${ uri }.acl/` },
								],
							},
							{
								"@id": "_:7",
								"@type": [ CS.GrantingStep ],
								[ CS.subject ]: [
									{ "@id": "https://example.com/.system/security/roles/another-role/" },
								],
								[ CS.appliedBy ]: [
									{ "@id": CS.ImmediateDescendantsACEntry },
								],
								[ CS.applied ]: [
									{ "@value": "true", "@type": XSD.boolean },
								],
								[ CS.protectedDocument ]: [
									{ "@id": "https://example.com/resource/" },
								],
								[ CS.accessControlList ]: [
									{ "@id": "https://example.com/resource/.acl/" },
								],
							},
						] ),
					} );
			}

			describe( "When has a context", () => {

				let resource:ProtectedDocument;
				beforeEach( () => {
					context = new CarbonLDP( "https://example.com/" );
					resource = createMock( context.documents );
				} );

				it( "should send request to self ID when no URI", async () => {
					stubRequest( "https://example.com/resource/" );

					await resource
						.getDetailedUserACReport();

					const request:JasmineAjaxRequest = jasmine.Ajax.requests.mostRecent();
					expect( request.url ).toBe( "https://example.com/resource/" );
				} );

				it( "should send request to of specified URI", async () => {
					stubRequest( "https://example.com/another-resource/" );

					await resource
						.getDetailedUserACReport( "https://example.com/another-resource/" );

					const request:JasmineAjaxRequest = jasmine.Ajax.requests.mostRecent();
					expect( request.url ).toBe( "https://example.com/another-resource/" );
				} );

				it( "should send request to of resolved relative URI", async () => {
					stubRequest( "https://example.com/resource/child/" );

					await resource
						.getDetailedUserACReport( "child/" );

					const request:JasmineAjaxRequest = jasmine.Ajax.requests.mostRecent();
					expect( request.url ).toBe( "https://example.com/resource/child/" );
				} );


				it( "should send default request headers when no URI", async () => {
					stubRequest( "https://example.com/resource/" );

					await resource
						.getDetailedUserACReport();

					const request:JasmineAjaxRequest = jasmine.Ajax.requests.mostRecent();
					expect( request.requestHeaders ).toEqual( {
						"accept": "application/ld+json",
						"prefer": [
							`include="${ CS.PreferDetailedUserACReport }"`,
							`include="${ C.PreferMinimalDocument }"`,
							`${ LDP.RDFSource }; rel=interaction-model`,
						].join( ", " ),
					} );
				} );

				it( "should send default request headers when URI", async () => {
					stubRequest( "https://example.com/resource/child/" );

					await resource
						.getDetailedUserACReport( "child/" );

					const request:JasmineAjaxRequest = jasmine.Ajax.requests.mostRecent();
					expect( request.requestHeaders ).toEqual( {
						"accept": "application/ld+json",
						"prefer": [
							`include="${ CS.PreferDetailedUserACReport }"`,
							`include="${ C.PreferMinimalDocument }"`,
							`${ LDP.RDFSource }; rel=interaction-model`,
						].join( ", " ),
					} );
				} );

				it( "should authorization header", async () => {
					stubRequest( "https://example.com/resource/" );

					const spy:jasmine.Spy = spyOn( context.auth, "addAuthentication" );

					await resource
						.getDetailedUserACReport();

					expect( spy ).toHaveBeenCalled();
				} );

				it( "should send custom headers when no URI", async () => {
					stubRequest( "https://example.com/resource/" );

					await resource
						.getDetailedUserACReport( {
							headers: new Map()
								.set( "custom", new Header( "custom value" ) )
							,
						} );

					const request:JasmineAjaxRequest = jasmine.Ajax.requests.mostRecent();
					expect( request.requestHeaders ).toEqual( jasmine.objectContaining( {
						"custom": "custom value",
					} ) );
				} );

				it( "should send custom headers when specified URI", async () => {
					stubRequest( "https://example.com/resource/child/" );

					await resource
						.getDetailedUserACReport( "child/", {
							headers: new Map()
								.set( "custom", new Header( "custom value" ) )
							,
						} );

					const request:JasmineAjaxRequest = jasmine.Ajax.requests.mostRecent();
					expect( request.requestHeaders ).toEqual( jasmine.objectContaining( {
						"custom": "custom value",
					} ) );
				} );


				it( "should return the report of self", async () => {
					stubRequest( "https://example.com/resource/" );

					const report:DetailedUserACReport = await resource
						.getDetailedUserACReport();

					expect( report as AnyJasmineValue<typeof report> ).toEqual( {
						protectedDocument: jasmine.objectContaining( { id: "https://example.com/resource/" } ),
						permissionReports: [
							{
								permission: jasmine.objectContaining( { id: CS.Read } ),
								granted: true,
								grantingChain: [
									{
										subject: jasmine.objectContaining( { id: "https://example.com/.system/security/roles/some-role/" } ),
										applied: true,
										appliedBy: jasmine.objectContaining( { id: CS.DirectACEntry } ),
										protectedDocument: jasmine.objectContaining( { id: "https://example.com/resource/" } ),
										accessControlList: jasmine.objectContaining( { id: "https://example.com/resource/.acl/" } ),
									},
									{
										subject: jasmine.objectContaining( { id: CS.AuthenticatedUser } ),
										applied: false,
										appliedBy: jasmine.objectContaining( { id: CS.AllDescendantsACEntry } ),
										inheritanceDisabledBy: [
											jasmine.objectContaining( { id: "https://example.com/resource/.acl/" } ),
										],
										protectedDocument: jasmine.objectContaining( { id: "https://example.com/" } ),
										accessControlList: jasmine.objectContaining( { id: "https://example.com/.acl/" } ),
									},
								],
							},
							{
								permission: jasmine.objectContaining( { id: CS.Update } ),
								granted: true,
								grantingChain: [
									{
										subject: jasmine.objectContaining( { id: "https://example.com/.system/security/roles/some-role/" } ),
										applied: true,
										appliedBy: jasmine.objectContaining( { id: CS.DirectACEntry } ),
										protectedDocument: jasmine.objectContaining( { id: "https://example.com/resource/" } ),
										accessControlList: jasmine.objectContaining( { id: "https://example.com/resource/.acl/" } ),
									},
									{
										subject: jasmine.objectContaining( { id: "https://example.com/.system/security/roles/another-role/" } ),
										applied: true,
										appliedBy: jasmine.objectContaining( { id: CS.ImmediateDescendantsACEntry } ),
										protectedDocument: jasmine.objectContaining( { id: "https://example.com/resource/" } ),
										accessControlList: jasmine.objectContaining( { id: "https://example.com/resource/.acl/" } ),
									},
								],
							},
						],
					} );
				} );

				it( "should return the report of the specified URI", async () => {
					stubRequest( "https://example.com/resource/child/" );

					const report:DetailedUserACReport = await resource
						.getDetailedUserACReport( "child/" );

					expect( report as AnyJasmineValue<typeof report> ).toEqual( {
						protectedDocument: jasmine.objectContaining( { id: "https://example.com/resource/child/" } ),
						permissionReports: [
							{
								permission: jasmine.objectContaining( { id: CS.Read } ),
								granted: true,
								grantingChain: [
									{
										subject: jasmine.objectContaining( { id: "https://example.com/.system/security/roles/some-role/" } ),
										applied: true,
										appliedBy: jasmine.objectContaining( { id: CS.DirectACEntry } ),
										protectedDocument: jasmine.objectContaining( { id: "https://example.com/resource/child/" } ),
										accessControlList: jasmine.objectContaining( { id: "https://example.com/resource/child/.acl/" } ),
									},
									{
										subject: jasmine.objectContaining( { id: CS.AuthenticatedUser } ),
										applied: false,
										appliedBy: jasmine.objectContaining( { id: CS.AllDescendantsACEntry } ),
										inheritanceDisabledBy: [
											jasmine.objectContaining( { id: "https://example.com/resource/.acl/" } ),
										],
										protectedDocument: jasmine.objectContaining( { id: "https://example.com/" } ),
										accessControlList: jasmine.objectContaining( { id: "https://example.com/.acl/" } ),
									},
								],
							},
							{
								permission: jasmine.objectContaining( { id: CS.Update } ),
								granted: true,
								grantingChain: [
									{
										subject: jasmine.objectContaining( { id: "https://example.com/.system/security/roles/some-role/" } ),
										applied: true,
										appliedBy: jasmine.objectContaining( { id: CS.DirectACEntry } ),
										protectedDocument: jasmine.objectContaining( { id: "https://example.com/resource/child/" } ),
										accessControlList: jasmine.objectContaining( { id: "https://example.com/resource/child/.acl/" } ),
									},
									{
										subject: jasmine.objectContaining( { id: "https://example.com/.system/security/roles/another-role/" } ),
										applied: true,
										appliedBy: jasmine.objectContaining( { id: CS.ImmediateDescendantsACEntry } ),
										protectedDocument: jasmine.objectContaining( { id: "https://example.com/resource/" } ),
										accessControlList: jasmine.objectContaining( { id: "https://example.com/resource/.acl/" } ),
									},
								],
							},
						],
					} );
				} );

			} );

			describe( "When has NO context", () => {

				let resource:ProtectedDocument;
				beforeEach( () => {
					resource = createMock( new Documents() );
				} );

				it( "should send request to self ID when no URI", async () => {
					stubRequest( "https://example.com/resource/" );

					await resource
						.getDetailedUserACReport();

					const request:JasmineAjaxRequest = jasmine.Ajax.requests.mostRecent();
					expect( request.url ).toBe( "https://example.com/resource/" );
				} );

				it( "should send request to of specified URI", async () => {
					stubRequest( "https://example.com/another-resource/" );

					await resource
						.getDetailedUserACReport( "https://example.com/another-resource/" );

					const request:JasmineAjaxRequest = jasmine.Ajax.requests.mostRecent();
					expect( request.url ).toBe( "https://example.com/another-resource/" );
				} );

				it( "should send request to of resolved relative URI", async () => {
					stubRequest( "https://example.com/resource/child/" );

					await resource
						.getDetailedUserACReport( "child/" );

					const request:JasmineAjaxRequest = jasmine.Ajax.requests.mostRecent();
					expect( request.url ).toBe( "https://example.com/resource/child/" );
				} );


				it( "should send default request headers when no URI", async () => {
					stubRequest( "https://example.com/resource/" );

					await resource
						.getDetailedUserACReport();

					const request:JasmineAjaxRequest = jasmine.Ajax.requests.mostRecent();
					expect( request.requestHeaders ).toEqual( {
						"accept": "application/ld+json",
						"prefer": [
							`include="${ CS.PreferDetailedUserACReport }"`,
							`include="${ C.PreferMinimalDocument }"`,
							`${ LDP.RDFSource }; rel=interaction-model`,
						].join( ", " ),
					} );
				} );

				it( "should send default request headers when URI", async () => {
					stubRequest( "https://example.com/resource/child/" );

					await resource
						.getDetailedUserACReport( "child/" );

					const request:JasmineAjaxRequest = jasmine.Ajax.requests.mostRecent();
					expect( request.requestHeaders ).toEqual( {
						"accept": "application/ld+json",
						"prefer": [
							`include="${ CS.PreferDetailedUserACReport }"`,
							`include="${ C.PreferMinimalDocument }"`,
							`${ LDP.RDFSource }; rel=interaction-model`,
						].join( ", " ),
					} );
				} );

				it( "should send custom headers when no URI", async () => {
					stubRequest( "https://example.com/resource/" );

					await resource
						.getDetailedUserACReport( {
							headers: new Map()
								.set( "custom", new Header( "custom value" ) )
							,
						} );

					const request:JasmineAjaxRequest = jasmine.Ajax.requests.mostRecent();
					expect( request.requestHeaders ).toEqual( jasmine.objectContaining( {
						"custom": "custom value",
					} ) );
				} );

				it( "should send custom headers when specified URI", async () => {
					stubRequest( "https://example.com/resource/child/" );

					await resource
						.getDetailedUserACReport( "child/", {
							headers: new Map()
								.set( "custom", new Header( "custom value" ) )
							,
						} );

					const request:JasmineAjaxRequest = jasmine.Ajax.requests.mostRecent();
					expect( request.requestHeaders ).toEqual( jasmine.objectContaining( {
						"custom": "custom value",
					} ) );
				} );


				it( "should return the report of self", async () => {
					stubRequest( "https://example.com/resource/" );

					const report:DetailedUserACReport = await resource
						.getDetailedUserACReport();

					expect( report as AnyJasmineValue<any> ).toEqual( {
						[ CS.protectedDocument ]: jasmine.objectContaining( { id: "https://example.com/resource/" } ),
						[ CS.permissionReport ]: [
							{
								[ CS.permission ]: jasmine.objectContaining( { id: CS.Read } ),
								[ CS.granted ]: true,
								[ CS.grantingChain ]: [
									{
										[ CS.subject ]: jasmine.objectContaining( { id: "https://example.com/.system/security/roles/some-role/" } ),
										[ CS.applied ]: true,
										[ CS.appliedBy ]: jasmine.objectContaining( { id: CS.DirectACEntry } ),
										[ CS.protectedDocument ]: jasmine.objectContaining( { id: "https://example.com/resource/" } ),
										[ CS.accessControlList ]: jasmine.objectContaining( { id: "https://example.com/resource/.acl/" } ),
									},
									{
										[ CS.subject ]: jasmine.objectContaining( { id: CS.AuthenticatedUser } ),
										[ CS.applied ]: false,
										[ CS.appliedBy ]: jasmine.objectContaining( { id: CS.AllDescendantsACEntry } ),
										[ CS.inheritanceDisabledBy ]: [
											jasmine.objectContaining( { id: "https://example.com/resource/.acl/" } ),
										],
										[ CS.protectedDocument ]: jasmine.objectContaining( { id: "https://example.com/" } ),
										[ CS.accessControlList ]: jasmine.objectContaining( { id: "https://example.com/.acl/" } ),
									},
								],
							},
							{
								[ CS.permission ]: jasmine.objectContaining( { id: CS.Update } ),
								[ CS.granted ]: true,
								[ CS.grantingChain ]: [
									{
										[ CS.subject ]: jasmine.objectContaining( { id: "https://example.com/.system/security/roles/some-role/" } ),
										[ CS.applied ]: true,
										[ CS.appliedBy ]: jasmine.objectContaining( { id: CS.DirectACEntry } ),
										[ CS.protectedDocument ]: jasmine.objectContaining( { id: "https://example.com/resource/" } ),
										[ CS.accessControlList ]: jasmine.objectContaining( { id: "https://example.com/resource/.acl/" } ),
									},
									{
										[ CS.subject ]: jasmine.objectContaining( { id: "https://example.com/.system/security/roles/another-role/" } ),
										[ CS.applied ]: true,
										[ CS.appliedBy ]: jasmine.objectContaining( { id: CS.ImmediateDescendantsACEntry } ),
										[ CS.protectedDocument ]: jasmine.objectContaining( { id: "https://example.com/resource/" } ),
										[ CS.accessControlList ]: jasmine.objectContaining( { id: "https://example.com/resource/.acl/" } ),
									},
								],
							},
						],
					} );
				} );

				it( "should return the report of the specified URI", async () => {
					stubRequest( "https://example.com/resource/child/" );

					const report:DetailedUserACReport = await resource
						.getDetailedUserACReport( "child/" );

					expect( report as AnyJasmineValue<any> ).toEqual( {
						[ CS.protectedDocument ]: jasmine.objectContaining( { id: "https://example.com/resource/child/" } ),
						[ CS.permissionReport ]: [
							{
								[ CS.permission ]: jasmine.objectContaining( { id: CS.Read } ),
								[ CS.granted ]: true,
								[ CS.grantingChain ]: [
									{
										[ CS.subject ]: jasmine.objectContaining( { id: "https://example.com/.system/security/roles/some-role/" } ),
										[ CS.applied ]: true,
										[ CS.appliedBy ]: jasmine.objectContaining( { id: CS.DirectACEntry } ),
										[ CS.protectedDocument ]: jasmine.objectContaining( { id: "https://example.com/resource/child/" } ),
										[ CS.accessControlList ]: jasmine.objectContaining( { id: "https://example.com/resource/child/.acl/" } ),
									},
									{
										[ CS.subject ]: jasmine.objectContaining( { id: CS.AuthenticatedUser } ),
										[ CS.applied ]: false,
										[ CS.appliedBy ]: jasmine.objectContaining( { id: CS.AllDescendantsACEntry } ),
										[ CS.inheritanceDisabledBy ]: [
											jasmine.objectContaining( { id: "https://example.com/resource/.acl/" } ),
										],
										[ CS.protectedDocument ]: jasmine.objectContaining( { id: "https://example.com/" } ),
										[ CS.accessControlList ]: jasmine.objectContaining( { id: "https://example.com/.acl/" } ),
									},
								],
							},
							{
								[ CS.permission ]: jasmine.objectContaining( { id: CS.Update } ),
								[ CS.granted ]: true,
								[ CS.grantingChain ]: [
									{
										[ CS.subject ]: jasmine.objectContaining( { id: "https://example.com/.system/security/roles/some-role/" } ),
										[ CS.applied ]: true,
										[ CS.appliedBy ]: jasmine.objectContaining( { id: CS.DirectACEntry } ),
										[ CS.protectedDocument ]: jasmine.objectContaining( { id: "https://example.com/resource/child/" } ),
										[ CS.accessControlList ]: jasmine.objectContaining( { id: "https://example.com/resource/child/.acl/" } ),
									},
									{
										[ CS.subject ]: jasmine.objectContaining( { id: "https://example.com/.system/security/roles/another-role/" } ),
										[ CS.applied ]: true,
										[ CS.appliedBy ]: jasmine.objectContaining( { id: CS.ImmediateDescendantsACEntry } ),
										[ CS.protectedDocument ]: jasmine.objectContaining( { id: "https://example.com/resource/" } ),
										[ CS.accessControlList ]: jasmine.objectContaining( { id: "https://example.com/resource/.acl/" } ),
									},
								],
							},
						],
					} );
				} );

			} );

		} );

		describe( method( OBLIGATORY, "getCompleteACReport" ), () => {

			it( hasSignature(
				"Returns a `CarbonLDP.Auth.CompleteACReport` of the current document.",
				[
					{ name: "requestOptions", type: "CarbonLDP.HTTP.RequestOptions", optional: true, description: "Customizable options for the request." },
				],
				{ type: "CarbonLDP.Auth.CompleteACReport" }
			), () => {} );

			it( hasSignature(
				"Returns a `CarbonLDP.Auth.CompleteACReport` of the specified document.",
				[
					{ name: "uri", type: "string", description: "URI of the document to get the report for." },
					{ name: "requestOptions", type: "CarbonLDP.HTTP.RequestOptions", optional: true, description: "Customizable options for the request." },
				],
				{ type: "CarbonLDP.Auth.CompleteACReport" }
			), () => {} );

			it( "should exists", ():void => {
				const resource:ProtectedDocument = createMock( new Documents() );

				expect( resource.getCompleteACReport ).toBeDefined();
				expect( resource.getCompleteACReport ).toEqual( jasmine.any( Function ) );
			} );


			function stubRequest( uri:string ):void {
				jasmine.Ajax.stubRequest( uri, null, "GET" )
					.andReturn( {
						responseHeaders: {},
						responseText: JSON.stringify( [
							{
								"@id": "_:1",
								"@type": [ CS.CompleteACReport ],
								[ CS.protectedDocument ]: [
									{ "@id": uri },
								],
								[ CS.subjectReport ]: [
									{ "@id": "_:2" },
									{ "@id": "_:3" },
								],
							},

							{
								"@id": "_:2",
								"@type": [ CS.SubjectReport ],
								[ CS.subject ]: [
									{ "@id": "https://example.com/.system/security/roles/some-role/" },
								],
								[ CS.permissionReport ]: [
									{ "@id": "_:4" },
									{ "@id": "_:5" },
								],
							},
							{
								"@id": "_:3",
								"@type": [ CS.SubjectReport ],
								[ CS.subject ]: [
									{ "@id": CS.AuthenticatedUser },
								],
								[ CS.permissionReport ]: [
									{ "@id": "_:6" },
								],
							},

							{
								"@id": "_:4",
								"@type": [ CS.PermissionReport ],
								[ CS.permission ]: [
									{ "@id": CS.Read },
								],
								[ CS.granted ]: [
									{ "@value": "true", "@type": XSD.boolean },
								],
								[ CS.grantingChain ]: [ {
									"@list": [
										{ "@id": "_:7" },
										{ "@id": "_:10" },
									],
								} ],
							},
							{
								"@id": "_:5",
								"@type": [ CS.PermissionReport ],
								[ CS.permission ]: [
									{ "@id": CS.Update },
								],
								[ CS.granted ]: [
									{ "@value": "true", "@type": XSD.boolean },
								],
								[ CS.grantingChain ]: [ {
									"@list": [
										{ "@id": "_:9" },
									],
								} ],
							},
							{
								"@id": "_:6",
								"@type": [ CS.PermissionReport ],
								[ CS.permission ]: [
									{ "@id": CS.Read },
								],
								[ CS.granted ]: [
									{ "@value": "false", "@type": XSD.boolean },
								],
								[ CS.grantingChain ]: [ {
									"@list": [
										{ "@id": "_:8" },
									],
								} ],
							},

							{
								"@id": "_:7",
								"@type": [ CS.GrantingStep ],
								[ CS.applied ]: [
									{ "@value": "true", "@type": XSD.boolean },
								],
								[ CS.appliedBy ]: [
									{ "@id": CS.DirectACEntry },
								],
								[ CS.protectedDocument ]: [
									{ "@id": uri },
								],
								[ CS.accessControlList ]: [
									{ "@id": `${ uri }.acl/` },
								],
							},
							{
								"@id": "_:8",
								"@type": [ CS.GrantingStep ],
								[ CS.appliedBy ]: [
									{ "@id": CS.AllDescendantsACEntry },
								],
								[ CS.applied ]: [
									{ "@value": "false", "@type": XSD.boolean },
								],
								[ CS.inheritanceDisabledBy ]: [ {
									"@list": [
										{ "@id": "https://example.com/resource/.acl/" },
									],
								} ],
								[ CS.protectedDocument ]: [
									{ "@id": "https://example.com/" },
								],
								[ CS.accessControlList ]: [
									{ "@id": "https://example.com/.acl/" },
								],
							},
							{
								"@id": "_:9",
								"@type": [ CS.GrantingStep ],
								[ CS.applied ]: [
									{ "@value": "true", "@type": XSD.boolean },
								],
								[ CS.appliedBy ]: [
									{ "@id": CS.DirectACEntry },
								],
								[ CS.protectedDocument ]: [
									{ "@id": uri },
								],
								[ CS.accessControlList ]: [
									{ "@id": `${ uri }.acl/` },
								],
							},
							{
								"@id": "_:10",
								"@type": [ CS.GrantingStep ],
								[ CS.applied ]: [
									{ "@value": "true", "@type": XSD.boolean },
								],
								[ CS.appliedBy ]: [
									{ "@id": CS.AllDescendantsACEntry },
								],
								[ CS.protectedDocument ]: [
									{ "@id": "https://example.com/" },
								],
								[ CS.accessControlList ]: [
									{ "@id": "https://example.com/.acl/" },
								],
							},
						] ),
					} );
			}

			describe( "When has a context", () => {

				let resource:ProtectedDocument;
				beforeEach( () => {
					context = new CarbonLDP( "https://example.com/" );
					resource = createMock( context.documents );
				} );

				it( "should send request to self ID when no URI", async () => {
					stubRequest( "https://example.com/resource/" );

					await resource
						.getCompleteACReport();

					const request:JasmineAjaxRequest = jasmine.Ajax.requests.mostRecent();
					expect( request.url ).toBe( "https://example.com/resource/" );
				} );

				it( "should send request to of specified URI", async () => {
					stubRequest( "https://example.com/another-resource/" );

					await resource
						.getCompleteACReport( "https://example.com/another-resource/" );

					const request:JasmineAjaxRequest = jasmine.Ajax.requests.mostRecent();
					expect( request.url ).toBe( "https://example.com/another-resource/" );
				} );

				it( "should send request to of resolved relative URI", async () => {
					stubRequest( "https://example.com/resource/child/" );

					await resource
						.getCompleteACReport( "child/" );

					const request:JasmineAjaxRequest = jasmine.Ajax.requests.mostRecent();
					expect( request.url ).toBe( "https://example.com/resource/child/" );
				} );


				it( "should send default request headers when no URI", async () => {
					stubRequest( "https://example.com/resource/" );

					await resource
						.getCompleteACReport();

					const request:JasmineAjaxRequest = jasmine.Ajax.requests.mostRecent();
					expect( request.requestHeaders ).toEqual( {
						"accept": "application/ld+json",
						"prefer": [
							`include="${ CS.PreferCompleteACReport }"`,
							`include="${ C.PreferMinimalDocument }"`,
							`${ LDP.RDFSource }; rel=interaction-model`,
						].join( ", " ),
					} );
				} );

				it( "should send default request headers when URI", async () => {
					stubRequest( "https://example.com/resource/child/" );

					await resource
						.getCompleteACReport( "child/" );

					const request:JasmineAjaxRequest = jasmine.Ajax.requests.mostRecent();
					expect( request.requestHeaders ).toEqual( {
						"accept": "application/ld+json",
						"prefer": [
							`include="${ CS.PreferCompleteACReport }"`,
							`include="${ C.PreferMinimalDocument }"`,
							`${ LDP.RDFSource }; rel=interaction-model`,
						].join( ", " ),
					} );
				} );

				it( "should authorization header", async () => {
					stubRequest( "https://example.com/resource/" );

					const spy:jasmine.Spy = spyOn( context.auth, "addAuthentication" );

					await resource
						.getCompleteACReport();

					expect( spy ).toHaveBeenCalled();
				} );

				it( "should send custom headers when no URI", async () => {
					stubRequest( "https://example.com/resource/" );

					await resource
						.getCompleteACReport( {
							headers: new Map()
								.set( "custom", new Header( "custom value" ) )
							,
						} );

					const request:JasmineAjaxRequest = jasmine.Ajax.requests.mostRecent();
					expect( request.requestHeaders ).toEqual( jasmine.objectContaining( {
						"custom": "custom value",
					} ) );
				} );

				it( "should send custom headers when specified URI", async () => {
					stubRequest( "https://example.com/resource/child/" );

					await resource
						.getCompleteACReport( "child/", {
							headers: new Map()
								.set( "custom", new Header( "custom value" ) )
							,
						} );

					const request:JasmineAjaxRequest = jasmine.Ajax.requests.mostRecent();
					expect( request.requestHeaders ).toEqual( jasmine.objectContaining( {
						"custom": "custom value",
					} ) );
				} );


				it( "should return the report of self", async () => {
					stubRequest( "https://example.com/resource/" );

					const report:CompleteACReport = await resource
						.getCompleteACReport();

					expect( report as AnyJasmineValue<typeof report> ).toEqual( {
						protectedDocument: jasmine.objectContaining( { id: "https://example.com/resource/" } ),
						subjectReports: [
							{
								subject: jasmine.objectContaining( { id: "https://example.com/.system/security/roles/some-role/" } ),
								permissionReports: [
									{
										permission: jasmine.objectContaining( { id: CS.Read } ),
										granted: true,
										grantingChain: [
											{
												applied: true,
												appliedBy: jasmine.objectContaining( { id: CS.DirectACEntry } ),
												protectedDocument: jasmine.objectContaining( { id: "https://example.com/resource/" } ),
												accessControlList: jasmine.objectContaining( { id: "https://example.com/resource/.acl/" } ),
											},
											{
												applied: true,
												appliedBy: jasmine.objectContaining( { id: CS.AllDescendantsACEntry } ),
												protectedDocument: jasmine.objectContaining( { id: "https://example.com/" } ),
												accessControlList: jasmine.objectContaining( { id: "https://example.com/.acl/" } ),
											},
										],
									},
									{
										permission: jasmine.objectContaining( { id: CS.Update } ),
										granted: true,
										grantingChain: [
											{
												applied: true,
												appliedBy: jasmine.objectContaining( { id: CS.DirectACEntry } ),
												protectedDocument: jasmine.objectContaining( { id: "https://example.com/resource/" } ),
												accessControlList: jasmine.objectContaining( { id: "https://example.com/resource/.acl/" } ),
											},
										],
									},
								],
							},
							{
								subject: jasmine.objectContaining( { id: CS.AuthenticatedUser } ),
								permissionReports: [
									{
										permission: jasmine.objectContaining( { id: CS.Read } ),
										granted: false,
										grantingChain: [
											{
												applied: false,
												appliedBy: jasmine.objectContaining( { id: CS.AllDescendantsACEntry } ),
												inheritanceDisabledBy: [
													jasmine.objectContaining( { id: "https://example.com/resource/.acl/" } ),
												],
												protectedDocument: jasmine.objectContaining( { id: "https://example.com/" } ),
												accessControlList: jasmine.objectContaining( { id: "https://example.com/.acl/" } ),
											},
										],
									},
								],
							},
						],
					} );
				} );

				it( "should return the report of the specified URI", async () => {
					stubRequest( "https://example.com/resource/child/" );

					const report:CompleteACReport = await resource
						.getCompleteACReport( "child/" );

					expect( report as AnyJasmineValue<typeof report> ).toEqual( {
						protectedDocument: jasmine.objectContaining( { id: "https://example.com/resource/child/" } ),
						subjectReports: [
							{
								subject: jasmine.objectContaining( { id: "https://example.com/.system/security/roles/some-role/" } ),
								permissionReports: [
									{
										permission: jasmine.objectContaining( { id: CS.Read } ),
										granted: true,
										grantingChain: [
											{
												applied: true,
												appliedBy: jasmine.objectContaining( { id: CS.DirectACEntry } ),
												protectedDocument: jasmine.objectContaining( { id: "https://example.com/resource/child/" } ),
												accessControlList: jasmine.objectContaining( { id: "https://example.com/resource/child/.acl/" } ),
											},
											{
												applied: true,
												appliedBy: jasmine.objectContaining( { id: CS.AllDescendantsACEntry } ),
												protectedDocument: jasmine.objectContaining( { id: "https://example.com/" } ),
												accessControlList: jasmine.objectContaining( { id: "https://example.com/.acl/" } ),
											},
										],
									},
									{
										permission: jasmine.objectContaining( { id: CS.Update } ),
										granted: true,
										grantingChain: [
											{
												applied: true,
												appliedBy: jasmine.objectContaining( { id: CS.DirectACEntry } ),
												protectedDocument: jasmine.objectContaining( { id: "https://example.com/resource/child/" } ),
												accessControlList: jasmine.objectContaining( { id: "https://example.com/resource/child/.acl/" } ),
											},
										],
									},
								],
							},
							{
								subject: jasmine.objectContaining( { id: CS.AuthenticatedUser } ),
								permissionReports: [
									{
										permission: jasmine.objectContaining( { id: CS.Read } ),
										granted: false,
										grantingChain: [
											{
												applied: false,
												appliedBy: jasmine.objectContaining( { id: CS.AllDescendantsACEntry } ),
												inheritanceDisabledBy: [
													jasmine.objectContaining( { id: "https://example.com/resource/.acl/" } ),
												],
												protectedDocument: jasmine.objectContaining( { id: "https://example.com/" } ),
												accessControlList: jasmine.objectContaining( { id: "https://example.com/.acl/" } ),
											},
										],
									},
								],
							},
						],
					} );
				} );

			} );

			describe( "When has NO context", () => {

				let resource:ProtectedDocument;
				beforeEach( () => {
					resource = createMock( new Documents() );
				} );

				it( "should send request to self ID when no URI", async () => {
					stubRequest( "https://example.com/resource/" );

					await resource
						.getCompleteACReport();

					const request:JasmineAjaxRequest = jasmine.Ajax.requests.mostRecent();
					expect( request.url ).toBe( "https://example.com/resource/" );
				} );

				it( "should send request to of specified URI", async () => {
					stubRequest( "https://example.com/another-resource/" );

					await resource
						.getCompleteACReport( "https://example.com/another-resource/" );

					const request:JasmineAjaxRequest = jasmine.Ajax.requests.mostRecent();
					expect( request.url ).toBe( "https://example.com/another-resource/" );
				} );

				it( "should send request to of resolved relative URI", async () => {
					stubRequest( "https://example.com/resource/child/" );

					await resource
						.getCompleteACReport( "child/" );

					const request:JasmineAjaxRequest = jasmine.Ajax.requests.mostRecent();
					expect( request.url ).toBe( "https://example.com/resource/child/" );
				} );


				it( "should send default request headers when no URI", async () => {
					stubRequest( "https://example.com/resource/" );

					await resource
						.getCompleteACReport();

					const request:JasmineAjaxRequest = jasmine.Ajax.requests.mostRecent();
					expect( request.requestHeaders ).toEqual( {
						"accept": "application/ld+json",
						"prefer": [
							`include="${ CS.PreferCompleteACReport }"`,
							`include="${ C.PreferMinimalDocument }"`,
							`${ LDP.RDFSource }; rel=interaction-model`,
						].join( ", " ),
					} );
				} );

				it( "should send default request headers when URI", async () => {
					stubRequest( "https://example.com/resource/child/" );

					await resource
						.getCompleteACReport( "child/" );

					const request:JasmineAjaxRequest = jasmine.Ajax.requests.mostRecent();
					expect( request.requestHeaders ).toEqual( {
						"accept": "application/ld+json",
						"prefer": [
							`include="${ CS.PreferCompleteACReport }"`,
							`include="${ C.PreferMinimalDocument }"`,
							`${ LDP.RDFSource }; rel=interaction-model`,
						].join( ", " ),
					} );
				} );

				it( "should send custom headers when no URI", async () => {
					stubRequest( "https://example.com/resource/" );

					await resource
						.getCompleteACReport( {
							headers: new Map()
								.set( "custom", new Header( "custom value" ) )
							,
						} );

					const request:JasmineAjaxRequest = jasmine.Ajax.requests.mostRecent();
					expect( request.requestHeaders ).toEqual( jasmine.objectContaining( {
						"custom": "custom value",
					} ) );
				} );

				it( "should send custom headers when specified URI", async () => {
					stubRequest( "https://example.com/resource/child/" );

					await resource
						.getCompleteACReport( "child/", {
							headers: new Map()
								.set( "custom", new Header( "custom value" ) )
							,
						} );

					const request:JasmineAjaxRequest = jasmine.Ajax.requests.mostRecent();
					expect( request.requestHeaders ).toEqual( jasmine.objectContaining( {
						"custom": "custom value",
					} ) );
				} );


				it( "should return the report of self", async () => {
					stubRequest( "https://example.com/resource/" );

					const report:CompleteACReport = await resource
						.getCompleteACReport();

					expect( report as AnyJasmineValue<any> ).toEqual( {
						[ CS.protectedDocument ]: jasmine.objectContaining( { id: "https://example.com/resource/" } ),
						[ CS.subjectReport ]: [
							{
								[ CS.subject ]: jasmine.objectContaining( { id: "https://example.com/.system/security/roles/some-role/" } ),
								[ CS.permissionReport ]: [
									{
										[ CS.permission ]: jasmine.objectContaining( { id: CS.Read } ),
										[ CS.granted ]: true,
										[ CS.grantingChain ]: [
											{
												[ CS.applied ]: true,
												[ CS.appliedBy ]: jasmine.objectContaining( { id: CS.DirectACEntry } ),
												[ CS.protectedDocument ]: jasmine.objectContaining( { id: "https://example.com/resource/" } ),
												[ CS.accessControlList ]: jasmine.objectContaining( { id: "https://example.com/resource/.acl/" } ),
											},
											{
												[ CS.applied ]: true,
												[ CS.appliedBy ]: jasmine.objectContaining( { id: CS.AllDescendantsACEntry } ),
												[ CS.protectedDocument ]: jasmine.objectContaining( { id: "https://example.com/" } ),
												[ CS.accessControlList ]: jasmine.objectContaining( { id: "https://example.com/.acl/" } ),
											},
										],
									},
									{
										[ CS.permission ]: jasmine.objectContaining( { id: CS.Update } ),
										[ CS.granted ]: true,
										[ CS.grantingChain ]: [
											{
												[ CS.applied ]: true,
												[ CS.appliedBy ]: jasmine.objectContaining( { id: CS.DirectACEntry } ),
												[ CS.protectedDocument ]: jasmine.objectContaining( { id: "https://example.com/resource/" } ),
												[ CS.accessControlList ]: jasmine.objectContaining( { id: "https://example.com/resource/.acl/" } ),
											},
										],
									},
								],
							},
							{
								[ CS.subject ]: jasmine.objectContaining( { id: CS.AuthenticatedUser } ),
								[ CS.permissionReport ]: {
									[ CS.permission ]: jasmine.objectContaining( { id: CS.Read } ),
									[ CS.granted ]: false,
									[ CS.grantingChain ]: [
										{
											[ CS.applied ]: false,
											[ CS.appliedBy ]: jasmine.objectContaining( { id: CS.AllDescendantsACEntry } ),
											[ CS.inheritanceDisabledBy ]: [
												jasmine.objectContaining( { id: "https://example.com/resource/.acl/" } ),
											],
											[ CS.protectedDocument ]: jasmine.objectContaining( { id: "https://example.com/" } ),
											[ CS.accessControlList ]: jasmine.objectContaining( { id: "https://example.com/.acl/" } ),
										},
									],
								},
							},
						],
					} );
				} );

				it( "should return the report of the specified URI", async () => {
					stubRequest( "https://example.com/resource/child/" );

					const report:CompleteACReport = await resource
						.getCompleteACReport( "child/" );

					expect( report as AnyJasmineValue<any> ).toEqual( {
						[ CS.protectedDocument ]: jasmine.objectContaining( { id: "https://example.com/resource/child/" } ),
						[ CS.subjectReport ]: [
							{
								[ CS.subject ]: jasmine.objectContaining( { id: "https://example.com/.system/security/roles/some-role/" } ),
								[ CS.permissionReport ]: [
									{
										[ CS.permission ]: jasmine.objectContaining( { id: CS.Read } ),
										[ CS.granted ]: true,
										[ CS.grantingChain ]: [
											{
												[ CS.applied ]: true,
												[ CS.appliedBy ]: jasmine.objectContaining( { id: CS.DirectACEntry } ),
												[ CS.protectedDocument ]: jasmine.objectContaining( { id: "https://example.com/resource/child/" } ),
												[ CS.accessControlList ]: jasmine.objectContaining( { id: "https://example.com/resource/child/.acl/" } ),
											},
											{
												[ CS.applied ]: true,
												[ CS.appliedBy ]: jasmine.objectContaining( { id: CS.AllDescendantsACEntry } ),
												[ CS.protectedDocument ]: jasmine.objectContaining( { id: "https://example.com/" } ),
												[ CS.accessControlList ]: jasmine.objectContaining( { id: "https://example.com/.acl/" } ),
											},
										],
									},
									{
										[ CS.permission ]: jasmine.objectContaining( { id: CS.Update } ),
										[ CS.granted ]: true,
										[ CS.grantingChain ]: [
											{
												[ CS.applied ]: true,
												[ CS.appliedBy ]: jasmine.objectContaining( { id: CS.DirectACEntry } ),
												[ CS.protectedDocument ]: jasmine.objectContaining( { id: "https://example.com/resource/child/" } ),
												[ CS.accessControlList ]: jasmine.objectContaining( { id: "https://example.com/resource/child/.acl/" } ),
											},
										],
									},
								],
							},
							{
								[ CS.subject ]: jasmine.objectContaining( { id: CS.AuthenticatedUser } ),
								[ CS.permissionReport ]: {
									[ CS.permission ]: jasmine.objectContaining( { id: CS.Read } ),
									[ CS.granted ]: false,
									[ CS.grantingChain ]: [
										{
											[ CS.applied ]: false,
											[ CS.appliedBy ]: jasmine.objectContaining( { id: CS.AllDescendantsACEntry } ),
											[ CS.inheritanceDisabledBy ]: [
												jasmine.objectContaining( { id: "https://example.com/resource/.acl/" } ),
											],
											[ CS.protectedDocument ]: jasmine.objectContaining( { id: "https://example.com/" } ),
											[ CS.accessControlList ]: jasmine.objectContaining( { id: "https://example.com/.acl/" } ),
										},
									],
								},
							},
						],
					} );
				} );

			} );

		} );

	} );

	describe( interfaze(
		"CarbonLDP.ProtectedDocumentFactory",
		"Interface with the factory, decorate and utils methods for `CarbonLDP.ProtectedDocument` objects."
	), ():void => {

		it( extendsClass( "CarbonLDP.TransientProtectedDocument" ), () => {} );

		describe( property(
			OBLIGATORY,
			"SCHEMA",
			"CarbonLDP.ObjectSchema"
		), ():void => {

			it( "should exists", ():void => {
				expect( ProtectedDocument.SCHEMA ).toBeDefined();
			} );

			it( "should have model properties", () => {
				type Target = AnyJasmineValue<Required<Pick<ProtectedDocument,
					"accessControlList" | "creator" | "owners">>>;

				expect( ProtectedDocument.SCHEMA as Target ).toEqual( {
					accessControlList: jasmine.any( Object ),
					creator: jasmine.any( Object ),
					owners: jasmine.any( Object ),
				} );
			} );

			it( "should have cs:accessControlList", () => {
				expect( ProtectedDocument.SCHEMA[ "accessControlList" ] ).toEqual( {
					"@id": CS.accessControlList,
					"@type": "@id",
				} );
			} );

			it( "should have cs:creator", () => {
				expect( ProtectedDocument.SCHEMA[ "creator" ] ).toEqual( {
					"@id": CS.creator,
					"@type": "@id",
				} );
			} );

			it( "should have cs:owner", () => {
				expect( ProtectedDocument.SCHEMA[ "owners" ] ).toEqual( {
					"@id": CS.owner,
					"@type": "@id",
					"@container": "@set",
				} );
			} );

		} );

		it( hasMethod(
			STATIC,
			"isDecorated",
			"Returns true if the object provided contains the properties and methods of a `CarbonLDP.ProtectedDocument` object.", [
				{ name: "object", type: "object", description: "The object to check." },
			],
			{ type: "object is CarbonLDP.ProtectedDocument" }
		), ():void => {} );

		it( hasMethod(
			STATIC,
			"is",
			"Returns true if the object provided is considered a `CarbonLDP.ProtectedDocument` object.", [
				{ name: "object", type: "object", description: "The object to check." },
			],
			{ type: "object is CarbonLDP.ProtectedDocument" }
		), ():void => {} );

		it( hasMethod(
			STATIC,
			"decorate",
			[ "T extends object" ],
			"Decorate the object with the properties and methods of a `CarbonLDP.ProtectedDocument` object.", [
				{ name: "object", type: "T", description: "The object to decorate." },
			],
			{ type: "T & CarbonLDP.ProtectedDocument" }
		), ():void => {} );

	} );

	describe( property(
		STATIC,
		"ProtectedDocument",
		"CarbonLDP.ProtectedDocumentFactory",
		"Constant that implements the `CarbonLDP.ProtectedDocumentFactory` interface."
	), ():void => {

		it( isDefined(), ():void => {
			expect( ProtectedDocument ).toBeDefined();
			expect( ProtectedDocument ).toEqual( jasmine.any( Object ) );
		} );

		// TODO: Separate in different tests
		it( "ProtectedDocument.isDecorated", ():void => {
			expect( ProtectedDocument.isDecorated ).toBeDefined();
			expect( Utils.isFunction( ProtectedDocument.isDecorated ) ).toBe( true );

			let object:any = void 0;
			expect( ProtectedDocument.isDecorated( object ) ).toBe( false );

			object = {
				accessControlList: null,
				getACL: ():void => {},
			};
			expect( ProtectedDocument.isDecorated( object ) ).toBe( true );

			delete object.accessControlList;
			expect( ProtectedDocument.isDecorated( object ) ).toBe( true );
			object.accessControlList = null;

			delete object.getACL;
			expect( ProtectedDocument.isDecorated( object ) ).toBe( false );
			object.getACL = ():void => {};
		} );

		// TODO: Separate in different tests
		it( "ProtectedDocument.is", ():void => {
			expect( ProtectedDocument.is ).toBeDefined();
			expect( Utils.isFunction( ProtectedDocument.is ) ).toBe( true );

			let object:any = void 0;
			expect( ProtectedDocument.is( object ) ).toBe( false );

			object = {
				accessControlList: null,
				getACL: ():void => {},
			};
			expect( ProtectedDocument.is( object ) ).toBe( false );

			let document:Document = Document.decorate( object, new Documents() );
			expect( ProtectedDocument.is( document ) ).toBe( true );
		} );

		// TODO: Separate in different tests
		it( "ProtectedDocument.decorate", ():void => {
			expect( ProtectedDocument.decorate ).toBeDefined();
			expect( Utils.isFunction( ProtectedDocument.decorate ) ).toBe( true );

			const persistedDocumentSpy:jasmine.Spy = spyOn( Document, "decorate" ).and.callThrough();

			let fn:Function = ():void => {};
			let document:object;
			let protectedDocument:ProtectedDocument;

			document = {
				accessControlList: null,
				getACL: fn,
			};
			protectedDocument = ProtectedDocument.decorate( document, new Documents() );
			expect( ProtectedDocument.isDecorated( protectedDocument ) ).toBe( true );
			expect( protectedDocument.getACL ).toBe( fn );

			document = {
				accessControlList: null,
			};
			protectedDocument = ProtectedDocument.decorate( document, new Documents() );
			expect( ProtectedDocument.isDecorated( protectedDocument ) ).toBe( true );
			expect( protectedDocument.getACL ).not.toBe( fn );

			expect( persistedDocumentSpy ).toHaveBeenCalledTimes( 1 );
		} );

	} );

} );
