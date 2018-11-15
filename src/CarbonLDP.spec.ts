import { AbstractContext } from "./AbstractContext";
import * as Auth from "./Auth";

import * as CarbonLDP from "./CarbonLDP";

import { Document } from "./Document";
import { Documents } from "./Documents";
import * as Errors from "./Errors";
import {
	Fragment,
	TransientFragment
} from "./Fragment";
import { FreeResources } from "./FreeResources";
import * as HTTP from "./HTTP";
import * as JSONLD from "./JSONLD";
import * as LDP from "./LDP";
import * as LDPatch from "./LDPatch";
import * as Messaging from "./Messaging";
import {
	NamedFragment,
	TransientNamedFragment
} from "./NamedFragment";
import {
	ContainerType,
	DigestedObjectSchema,
	DigestedObjectSchemaProperty,
	ObjectSchemaDigester,
	ObjectSchemaUtils,
	PointerType,
} from "./ObjectSchema";
import { Pointer } from "./Pointer";
import { ProtectedDocument } from "./ProtectedDocument";
import * as RDF from "./RDF";
import {
	Resource,
	TransientResource
} from "./Resource";
import {
	globalContext,
	SDKContext,
} from "./SDKContext";
import { ServiceAwareDocument } from "./ServiceAwareDocument";
import * as Settings from "./Settings";
import * as SHACL from "./SHACL";
import * as SPARQL from "./SPARQL";
import * as System from "./System";

import {
	clazz,
	constructor,
	extendsClass,
	hasProperty,
	hasSignature,
	INSTANCE,
	isDefined,
	method,
	module,
	reexports,
	STATIC,
} from "./test/JasmineExtender";
import { TransientAccessPoint } from "./AccessPoint";
import { TransientBlankNode } from "./BlankNode";
import { TransientDocument } from "./Document";
import { TransientProtectedDocument } from "./ProtectedDocument";

import * as Utils from "./Utils";
import * as Vocabularies from "./Vocabularies";

describe( module( "carbonldp/CarbonLDP" ), ():void => {

	it( isDefined(), ():void => {
		expect( CarbonLDP ).toBeDefined();
		expect( CarbonLDP ).toEqual( jasmine.any( Object ) );
	} );

	describe( clazz( "CarbonLDP", "The main class of the SDK, which contains all the references of the modules used in the the SDK." ), ():void => {

		it( isDefined(), ():void => {
			expect( CarbonLDP.CarbonLDP ).toBeDefined();
			expect( CarbonLDP.CarbonLDP ).toEqual( jasmine.any( Function ) );
		} );

		it( extendsClass( "CarbonLDP.AbstractContext" ), ():void => {
			const carbon:CarbonLDP.CarbonLDP = new CarbonLDP.CarbonLDP( "https://example.com" );
			expect( carbon ).toEqual( jasmine.any( AbstractContext ) );
		} );

		it( hasProperty(
			STATIC,
			"version",
			"string",
			"Returns the version of the SDK."
		), ():void => {
			expect( CarbonLDP.CarbonLDP.version ).toBeDefined();
			expect( CarbonLDP.CarbonLDP.version ).toEqual( jasmine.any( String ) );

			expect( CarbonLDP.CarbonLDP.version ).toMatch( /\d+\.\d+\.\d+.*/ );
		} );

		it( reexports(
			STATIC,
			"AbstractContext",
			"CarbonLDP.AbstractContext"
		), ():void => {
			expect( CarbonLDP.CarbonLDP.AbstractContext ).toBeDefined();
			expect( CarbonLDP.CarbonLDP.AbstractContext ).toBe( AbstractContext );
		} );

		it( reexports(
			STATIC,
			"TransientAccessPoint",
			"carbonldp/TransientAccessPoint#TransientAccessPoint"
		), ():void => {
			expect( CarbonLDP.CarbonLDP.TransientAccessPoint ).toBeDefined();
			expect( CarbonLDP.CarbonLDP.TransientAccessPoint ).toBe( TransientAccessPoint );
		} );

		it( reexports(
			STATIC,
			"Auth",
			"carbonldp/Auth"
		), ():void => {
			expect( CarbonLDP.CarbonLDP.Auth ).toBeDefined();
			expect( CarbonLDP.CarbonLDP.Auth ).toBe( Auth );
		} );

		it( reexports(
			STATIC,
			"TransientBlankNode",
			"carbonldp/TransientBlankNode#TransientBlankNode"
		), ():void => {
			expect( CarbonLDP.CarbonLDP.TransientBlankNode ).toBeDefined();
			expect( CarbonLDP.CarbonLDP.TransientBlankNode ).toBe( TransientBlankNode );
		} );

		it( reexports(
			STATIC,
			"TransientDocument",
			"carbonldp/TransientDocument#TransientDocument"
		), ():void => {
			expect( CarbonLDP.CarbonLDP.TransientDocument ).toBeDefined();
			expect( CarbonLDP.CarbonLDP.TransientDocument ).toBe( TransientDocument );
		} );

		it( reexports(
			STATIC,
			"Documents",
			"CarbonLDP.Documents"
		), ():void => {
			expect( CarbonLDP.CarbonLDP.Documents ).toBeDefined();
			expect( CarbonLDP.CarbonLDP.Documents ).toBe( Documents );
		} );

		it( reexports(
			STATIC,
			"Errors",
			"carbonldp/Errors"
		), ():void => {
			expect( CarbonLDP.CarbonLDP.Errors ).toBeDefined();
			expect( CarbonLDP.CarbonLDP.Errors ).toBe( Errors );
		} );

		it( reexports(
			STATIC,
			"TransientFragment",
			"carbonldp/TransientFragment#TransientFragment"
		), ():void => {
			expect( CarbonLDP.CarbonLDP.TransientFragment ).toBeDefined();
			expect( CarbonLDP.CarbonLDP.TransientFragment ).toBe( TransientFragment );
		} );

		it( reexports(
			STATIC,
			"FreeResources",
			"carbonldp/FreeResources#FreeResources"
		), ():void => {
			expect( CarbonLDP.CarbonLDP.FreeResources ).toBeDefined();
			expect( CarbonLDP.CarbonLDP.FreeResources ).toBe( FreeResources );
		} );

		it( reexports(
			STATIC,
			"HTTP",
			"carbonldp/HTTP"
		), ():void => {
			expect( CarbonLDP.CarbonLDP.HTTP ).toBeDefined();
			expect( CarbonLDP.CarbonLDP.HTTP ).toBe( HTTP );
		} );

		it( reexports(
			STATIC,
			"JSONLD",
			"carbonldp/JSONLD"
		), ():void => {
			expect( CarbonLDP.CarbonLDP.JSONLD ).toBeDefined();
			expect( CarbonLDP.CarbonLDP.JSONLD ).toBe( JSONLD );
		} );

		it( reexports(
			STATIC,
			"LDP",
			"carbonldp/LDP"
		), ():void => {
			expect( CarbonLDP.CarbonLDP.LDP ).toBeDefined();
			expect( CarbonLDP.CarbonLDP.LDP ).toBe( LDP );
		} );

		it( reexports(
			STATIC,
			"LDPatch",
			"carbonldp/LDPatch"
		), ():void => {
			expect( CarbonLDP.CarbonLDP.LDPatch ).toBeDefined();
			expect( CarbonLDP.CarbonLDP.LDPatch ).toBe( LDPatch );
		} );

		it( reexports(
			STATIC,
			"Messaging",
			"carbonldp/Messaging"
		), ():void => {
			expect( CarbonLDP.CarbonLDP.Messaging ).toBeDefined();
			expect( CarbonLDP.CarbonLDP.Messaging ).toBe( Messaging );
		} );

		it( reexports(
			STATIC,
			"TransientNamedFragment",
			"carbonldp/TransientNamedFragment#TransientNamedFragment"
		), ():void => {
			expect( CarbonLDP.CarbonLDP.TransientNamedFragment ).toBeDefined();
			expect( CarbonLDP.CarbonLDP.TransientNamedFragment ).toBe( TransientNamedFragment );
		} );

		it( reexports(
			STATIC,
			"Vocabularies",
			"carbonldp/Vocabularies"
		), ():void => {
			expect( CarbonLDP.CarbonLDP.Vocabularies ).toBeDefined();
			expect( CarbonLDP.CarbonLDP.Vocabularies ).toBe( Vocabularies );
		} );

		it( reexports(
			STATIC,
			"DigestedObjectSchema",
			"CarbonLDP.DigestedObjectSchema"
		), ():void => {
			expect( CarbonLDP.CarbonLDP.DigestedObjectSchema ).toBeDefined();
			expect( CarbonLDP.CarbonLDP.DigestedObjectSchema ).toBe( DigestedObjectSchema );
		} );

		it( reexports(
			STATIC,
			"ContainerType",
			"CarbonLDP.ContainerType"
		), ():void => {
			expect( CarbonLDP.CarbonLDP.ContainerType ).toBeDefined();
			expect( CarbonLDP.CarbonLDP.ContainerType ).toBe( ContainerType );
		} );

		it( reexports(
			STATIC,
			"PointerType",
			"CarbonLDP.PointerType"
		), ():void => {
			expect( CarbonLDP.CarbonLDP.PointerType ).toBeDefined();
			expect( CarbonLDP.CarbonLDP.PointerType ).toBe( PointerType );
		} );

		it( reexports(
			STATIC,
			"ObjectSchemaDigester",
			"CarbonLDP.ObjectSchemaDigester"
		), ():void => {
			expect( CarbonLDP.CarbonLDP.ObjectSchemaDigester ).toBeDefined();
			expect( CarbonLDP.CarbonLDP.ObjectSchemaDigester ).toBe( ObjectSchemaDigester );
		} );

		it( reexports(
			STATIC,
			"ObjectSchemaUtils",
			"CarbonLDP.ObjectSchemaUtils"
		), ():void => {
			expect( CarbonLDP.CarbonLDP.ObjectSchemaUtils ).toBeDefined();
			expect( CarbonLDP.CarbonLDP.ObjectSchemaUtils ).toBe( ObjectSchemaUtils );
		} );

		it( reexports(
			STATIC,
			"DigestedObjectSchemaProperty",
			"CarbonLDP.DigestedObjectSchemaProperty"
		), ():void => {
			expect( CarbonLDP.CarbonLDP.DigestedObjectSchemaProperty ).toBeDefined();
			expect( CarbonLDP.CarbonLDP.DigestedObjectSchemaProperty ).toBe( DigestedObjectSchemaProperty );
		} );

		it( reexports(
			STATIC,
			"Document",
			"carbonldp/Document#Document"
		), ():void => {
			expect( CarbonLDP.CarbonLDP.Document ).toBeDefined();
			expect( CarbonLDP.CarbonLDP.Document ).toBe( Document );
		} );

		it( reexports(
			STATIC,
			"Fragment",
			"carbonldp/Fragment#Fragment"
		), ():void => {
			expect( CarbonLDP.CarbonLDP.Fragment ).toBeDefined();
			expect( CarbonLDP.CarbonLDP.Fragment ).toBe( Fragment );
		} );

		it( reexports(
			STATIC,
			"NamedFragment",
			"carbonldp/NamedFragment#NamedFragment"
		), ():void => {
			expect( CarbonLDP.CarbonLDP.NamedFragment ).toBeDefined();
			expect( CarbonLDP.CarbonLDP.NamedFragment ).toBe( NamedFragment );
		} );

		it( reexports(
			STATIC,
			"ProtectedDocument",
			"carbonldp/ProtectedDocument#ProtectedDocument"
		), ():void => {
			expect( CarbonLDP.CarbonLDP.ProtectedDocument ).toBeDefined();
			expect( CarbonLDP.CarbonLDP.ProtectedDocument ).toBe( ProtectedDocument );
		} );

		it( reexports(
			STATIC,
			"Resource",
			"carbonldp/Resource#Resource"
		), ():void => {
			expect( CarbonLDP.CarbonLDP.Resource ).toBeDefined();
			expect( CarbonLDP.CarbonLDP.Resource ).toBe( Resource );
		} );

		it( reexports(
			STATIC,
			"Pointer",
			"carbonldp/Pointer#Pointer"
		), ():void => {
			expect( CarbonLDP.CarbonLDP.Pointer ).toBeDefined();
			expect( CarbonLDP.CarbonLDP.Pointer ).toBe( Pointer );
		} );

		it( reexports(
			STATIC,
			"TransientProtectedDocument",
			"carbonldp/TransientProtectedDocument#TransientProtectedDocument"
		), ():void => {
			expect( CarbonLDP.CarbonLDP.TransientProtectedDocument ).toBeDefined();
			expect( CarbonLDP.CarbonLDP.TransientProtectedDocument ).toBe( TransientProtectedDocument );
		} );

		it( reexports(
			STATIC,
			"RDF",
			"carbonldp/RDF"
		), ():void => {
			expect( CarbonLDP.CarbonLDP.RDF ).toBeDefined();
			expect( CarbonLDP.CarbonLDP.RDF ).toBe( RDF );
		} );

		it( reexports(
			STATIC,
			"TransientResource",
			"carbonldp/TransientResource#TransientResource"
		), ():void => {
			expect( CarbonLDP.CarbonLDP.TransientResource ).toBeDefined();
			expect( CarbonLDP.CarbonLDP.TransientResource ).toBe( TransientResource );
		} );

		it( reexports(
			STATIC,
			"SDKContext",
			"CarbonLDP.SDKContext"
		), ():void => {
			expect( CarbonLDP.CarbonLDP.SDKContext ).toBeDefined();
			expect( CarbonLDP.CarbonLDP.SDKContext ).toBe( SDKContext );
		} );

		it( reexports(
			STATIC,
			"globalContext",
			"carbonldp/SDKContext#globalContext"
		), ():void => {
			expect( CarbonLDP.CarbonLDP.globalContext ).toBeDefined();
			expect( CarbonLDP.CarbonLDP.globalContext ).toBe( globalContext );
		} );

		it( reexports(
			STATIC,
			"ServiceAwareDocument",
			"carbonldp/ServiceAwareDocument#ServiceAwareDocument"
		), ():void => {
			expect( CarbonLDP.CarbonLDP.ServiceAwareDocument ).toBeDefined();
			expect( CarbonLDP.CarbonLDP.ServiceAwareDocument ).toBe( ServiceAwareDocument );
		} );

		it( reexports(
			STATIC,
			"SHACL",
			"carbonldp/SHACL"
		), ():void => {
			expect( CarbonLDP.CarbonLDP.SHACL ).toBeDefined();
			expect( CarbonLDP.CarbonLDP.SHACL ).toBe( SHACL );
		} );

		it( reexports(
			STATIC,
			"SPARQL",
			"carbonldp/SPARQL"
		), ():void => {
			expect( CarbonLDP.CarbonLDP.SPARQL ).toBeDefined();
			expect( CarbonLDP.CarbonLDP.SPARQL ).toBe( SPARQL );
		} );

		it( reexports(
			STATIC,
			"System",
			"carbonldp/System"
		), ():void => {
			expect( CarbonLDP.CarbonLDP.System ).toBeDefined();
			expect( CarbonLDP.CarbonLDP.System ).toBe( System );
		} );

		it( reexports(
			STATIC,
			"Utils",
			"carbonldp/Utils"
		), ():void => {
			expect( CarbonLDP.CarbonLDP.Utils ).toBeDefined();
			expect( CarbonLDP.CarbonLDP.Utils ).toBe( Utils );
		} );


		describe( constructor(), ():void => {

			it( hasSignature( [
				{ name: "url", type: "string", description: "The URL where the platform instance is located on." },
			] ), ():void => {} );

			it( hasSignature( [
				{ name: "settings", type: "CarbonLDP.SettingsCarbonSettings", description: "A settings object to fully configure the Carbon instance." },
			] ), ():void => {} );

			it( "should exists", ():void => {
				expect( CarbonLDP.CarbonLDP.constructor ).toBeDefined();
				expect( CarbonLDP.CarbonLDP.constructor ).toEqual( jasmine.any( Function ) );
			} );

			it( "should be instantiable", ():void => {
				const target:CarbonLDP.CarbonLDP = new CarbonLDP.CarbonLDP( "https://example.com/" );

				expect( target ).toBeDefined();
				expect( target ).toEqual( jasmine.any( CarbonLDP.CarbonLDP ) );
			} );

			it( "should throw error when URL has not protocol", ():void => {
				const helper:( url:string ) => () => void = url => () => {
					new CarbonLDP.CarbonLDP( url );
				};

				expect( helper( "example.com/" ) ).toThrowError( Errors.IllegalArgumentError, `The URL must contain a valid protocol: "http://", "https://".` );
				expect( helper( "localhost" ) ).toThrowError( Errors.IllegalArgumentError, `The URL must contain a valid protocol: "http://", "https://".` );
				expect( helper( "127.0.0.1" ) ).toThrowError( Errors.IllegalArgumentError, `The URL must contain a valid protocol: "http://", "https://".` );
			} );

			it( "should throw error when URL has invalid protocol", ():void => {
				const helper:( url:string ) => () => void = url => () => {
					new CarbonLDP.CarbonLDP( url );
				};

				expect( helper( "ftp://example.com/" ) ).toThrowError( Errors.IllegalArgumentError, `The URL must contain a valid protocol: "http://", "https://".` );
				expect( helper( "://127.0.0.1" ) ).toThrowError( Errors.IllegalArgumentError, `The URL must contain a valid protocol: "http://", "https://".` );
			} );

			it( "should assign the URL as the base URI with slash at the end", ():void => {
				const helper:( url:string, uri:string ) => void = ( url, uri ) => {
					const carbon:CarbonLDP.CarbonLDP = new CarbonLDP.CarbonLDP( url );
					expect( carbon.baseURI ).toBe( uri );
				};

				helper( "https://example.com/", "https://example.com/" );
				helper( "https://example.com", "https://example.com/" );

				helper( "https://localhost:8083/", "https://localhost:8083/" );
				helper( "https://localhost:8083", "https://localhost:8083/" );
			} );


			it( "should throw error when invalid host property", ():void => {
				const helper:( settings:Settings.CarbonLDPSettings ) => void = settings => () => {
					new CarbonLDP.CarbonLDP( settings );
				};

				expect( helper( { host: null } ) ).toThrowError( Errors.IllegalArgumentError, "The settings object must contains a valid host string." );
				expect( helper( { host: void 0 } ) ).toThrowError( Errors.IllegalArgumentError, "The settings object must contains a valid host string." );
				expect( helper( { host: {} } as any ) ).toThrowError( Errors.IllegalArgumentError, "The settings object must contains a valid host string." );
			} );

			it( "should throw error when invalid host with protocol", ():void => {
				const helper:( settings:Settings.CarbonLDPSettings ) => void = settings => () => {
					new CarbonLDP.CarbonLDP( settings );
				};

				expect( helper( { host: "http://example.com" } ) ).toThrowError( Errors.IllegalArgumentError, "The host must not contain a protocol." );
				expect( helper( { host: "https://example.com" } ) ).toThrowError( Errors.IllegalArgumentError, "The host must not contain a protocol." );
				expect( helper( { host: "ftps://example.com" } ) ).toThrowError( Errors.IllegalArgumentError, "The host must not contain a protocol." );
			} );

			it( "should throw error when invalid host with port", ():void => {
				const helper:( settings:Settings.CarbonLDPSettings ) => void = settings => () => {
					new CarbonLDP.CarbonLDP( settings );
				};

				expect( helper( { host: "example.com:80" } ) ).toThrowError( Errors.IllegalArgumentError, "The host must not contain a port." );
				expect( helper( { host: "example.com:8083" } ) ).toThrowError( Errors.IllegalArgumentError, "The host must not contain a port." );
			} );

			it( "should create base URI with settings host", ():void => {
				const helper:( settings:Settings.CarbonLDPSettings, uri:string ) => void = ( settings, uri ) => {
					const carbon:CarbonLDP.CarbonLDP = new CarbonLDP.CarbonLDP( settings );
					expect( carbon.baseURI ).toBe( uri );
				};

				helper( { host: "example.com" }, "https://example.com/" );
				helper( { host: "example.com/" }, "https://example.com/" );
			} );

			it( "should create base URI with settings host and ssl", ():void => {
				const helper:( settings:Settings.CarbonLDPSettings, uri:string ) => void = ( settings, uri ) => {
					const carbon:CarbonLDP.CarbonLDP = new CarbonLDP.CarbonLDP( settings );
					expect( carbon.baseURI ).toBe( uri );
				};

				helper( { host: "example.com", ssl: false }, "http://example.com/" );
				helper( { host: "example.com/", ssl: true }, "https://example.com/" );
			} );

			it( "should create base URI with settings host and port", ():void => {
				const helper:( settings:Settings.CarbonLDPSettings, uri:string ) => void = ( settings, uri ) => {
					const carbon:CarbonLDP.CarbonLDP = new CarbonLDP.CarbonLDP( settings );
					expect( carbon.baseURI ).toBe( uri );
				};

				helper( { host: "example.com", port: 8083 }, "https://example.com:8083/" );
				helper( { host: "example.com/", port: 80 }, "https://example.com:80/" );
			} );

			it( "should create base URI with settings host, ssl and port", ():void => {
				const helper:( settings:Settings.CarbonLDPSettings, uri:string ) => void = ( settings, uri ) => {
					const carbon:CarbonLDP.CarbonLDP = new CarbonLDP.CarbonLDP( settings );
					expect( carbon.baseURI ).toBe( uri );
				};

				helper( { host: "example.com", ssl: false, port: 8083 }, "http://example.com:8083/" );
				helper( { host: "example.com/", ssl: true, port: 80 }, "https://example.com:80/" );
			} );

			it( "should create base URI with settings host, ssl and port", ():void => {
				const helper:( settings:Settings.CarbonLDPSettings, uri:string ) => void = ( settings, uri ) => {
					const carbon:CarbonLDP.CarbonLDP = new CarbonLDP.CarbonLDP( settings );
					expect( carbon.baseURI ).toBe( uri );
				};

				helper( { host: "example.com", ssl: false, port: 8083 }, "http://example.com:8083/" );
				helper( { host: "example.com/", ssl: true, port: 80 }, "https://example.com:80/" );
			} );


			it( "should have the default settings when url provided", ():void => {
				const carbon:CarbonLDP.CarbonLDP = new CarbonLDP.CarbonLDP( "https://example.com/" );
				expect( carbon[ "settings" ] ).toEqual( {
					vocabulary: "vocabularies/main/#",
					paths: {
						system: {
							slug: ".system/",
							paths: {
								platform: "platform/",
								security: {
									slug: "security/",
									paths: {
										credentials: "credentials/",
										roles: "roles/",
									},
								},
							},
						},
						users: {
							slug: "users/",
							paths: {
								me: "me/",
							},
						},
					},
				} );
			} );

			it( "should merge when settings provided", ():void => {
				const carbon:CarbonLDP.CarbonLDP = new CarbonLDP.CarbonLDP( {
					host: "secure.example.com",
					vocabulary: "https://schema.org/",
					paths: {
						system: {
							slug: "https://secure.example.com/",
							paths: {
								security: {
									paths: { credentials: null },
								},
								another: "another/",
							},
						},
						users: "agents/",
					},
				} );

				expect( carbon[ "settings" ] ).toEqual( {
					vocabulary: "https://schema.org/",
					paths: {
						system: {
							slug: "https://secure.example.com/",
							paths: {
								platform: "platform/",
								security: {
									slug: "security/",
									paths: {
										roles: "roles/",
									},
								},
								another: "another/",
							},
						},
						users: {
							slug: "agents/",
							paths: {
								me: "me/",
							},
						},
					},
				} );
			} );


			it( "should retrieve the version form the class", ():void => {
				const carbon:CarbonLDP.CarbonLDP = new CarbonLDP.CarbonLDP( "https://example.com" );

				expect( carbon.version ).toEqual( jasmine.any( String ) );
				expect( carbon.version ).toBe( CarbonLDP.CarbonLDP.version );
			} );

			it( "should instantiate the messaging service when url", ():void => {
				const carbon:CarbonLDP.CarbonLDP = new CarbonLDP.CarbonLDP( "https://example.com" );
				expect( carbon.messaging ).toEqual( jasmine.any( Messaging.MessagingService ) );
			} );

		} );

		it( hasProperty(
			INSTANCE,
			"version",
			"string",
			"Returns the version of the SDK."
		), ():void => {} );

		it( hasProperty(
			INSTANCE,
			"baseURI",
			"string",
			"Returns the URI of your Carbon LDP."
		), ():void => {} );

		it( hasProperty(
			INSTANCE,
			"messaging",
			"CarbonLDP.Messaging.MessagingService",
			"Service that contains the RAW methods to manage the messaging/real-time features."
		), ():void => {} );

		describe( method( INSTANCE, "resolve" ), ():void => {

			it( hasSignature(
				"Resolve the URI provided in the scope your Carbon LDP Platform instance.", [
					{ name: "relativeURI", type: "string", description: "Relative URI to be resolved." },
				],
				{ type: "string", description: "The absolute URI that has been resolved." }
			), ():void => {} );

			it( "should exists", ():void => {
				expect( CarbonLDP.CarbonLDP.prototype.resolve ).toBeDefined();
				expect( CarbonLDP.CarbonLDP.prototype.resolve ).toEqual( jasmine.any( Function ) );
			} );

			it( "should resolve relative URIs", ():void => {
				const carbon:CarbonLDP.CarbonLDP = new CarbonLDP.CarbonLDP( "https://example.com/" );

				expect( carbon.resolve( "my-resource/" ) ).toBe( "https://example.com/my-resource/" );
				expect( carbon.resolve( "a-parent/my-resource/" ) ).toBe( "https://example.com/a-parent/my-resource/" );
			} );

			it( "should not resolve absolute URIs", ():void => {
				const carbon:CarbonLDP.CarbonLDP = new CarbonLDP.CarbonLDP( "https://example.com/" );

				expect( carbon.resolve( "https://example.com/my-resource/" ) ).toBe( "https://example.com/my-resource/" );
				expect( carbon.resolve( "http://another-carbon.example.com/my-resource/" ) ).toBe( "http://another-carbon.example.com/my-resource/" );
			} );

		} );

		describe( method( INSTANCE, "getPlatformMetadata" ), ():void => {

			beforeEach( ():void => {
				jasmine.Ajax.install();
			} );

			afterEach( ():void => {
				jasmine.Ajax.uninstall();
			} );

			it( hasSignature(
				"Retrieves the Metadata related to the Carbon LDP Platform.",
				{ type: "Promise<CarbonLDP.System.PlatformMetadata>" }
			), ():void => {} );

			it( "should exists", ():void => {
				expect( CarbonLDP.CarbonLDP.prototype.getPlatformMetadata ).toBeDefined();
				expect( CarbonLDP.CarbonLDP.prototype.getPlatformMetadata ).toEqual( jasmine.any( Function ) );
			} );


			it( "should ask for `system.platform` path", ( done:DoneFn ):void => {
				const carbon:CarbonLDP.CarbonLDP = new CarbonLDP.CarbonLDP( "https://example.com/" );

				const spy:jasmine.Spy = spyOn( carbon, "_resolvePath" )
					.and.callFake( () => { throw new Error( "Should not resolve" ); } );

				carbon
					.getPlatformMetadata()
					.then( () => done.fail( "Should not resolve" ) )
					.catch( error => {
						if( error.message !== "Should not resolve" ) done.fail( error );

						expect( spy ).toHaveBeenCalledWith( "system.platform" );

						done();
					} );
			} );

			it( "should retrieve a PlatformMetadata object", ( done:DoneFn ):void => {
				jasmine.Ajax.stubRequest( "https://example.com/.system/platform/", null, "GET" ).andReturn( {
					status: 200,
					responseHeaders: {
						"ETag": '"123456789"',
						"Content-Location": "https://example.com/.system/platform/",
					},
					responseText: `[ {
					"@graph": [ {
						"@id": "https://example.com/.system/platform/",
						"@type": [ "${ Vocabularies.C.Document }", "${ Vocabularies.C.Platform }" ],
						"${ Vocabularies.C.created }": [ {
							"@type": "${ Vocabularies.XSD.dateTime }",
							"@value": "2016-05-01T00:00:00.000-06:00"
						} ],
						"${ Vocabularies.C.modified }": [ {
							"@type": "${ Vocabularies.XSD.dateTime }",
							"@value": "2016-05-01T00:00:00.000-06:00"
						} ],
						"${ Vocabularies.C.instance }": [ {
							"@id": "_:1"
						} ]
					}, {
						"@id": "_:1",
						"@type": [ "${ Vocabularies.C.VolatileResource }", "${ Vocabularies.C.PlatformInstance }" ],
						"${ Vocabularies.C.buildDate }": [ {
							"@type": "http://www.w3.org/2001/XMLSchema#dateTime",
							"@value": "2016-06-01T00:00:00.000-06:00"
						} ],
						"${ Vocabularies.C.version }": [ {
							"@value": "1.0.0"
						} ]
					} ],
					"@id": "https://example.com/.system/platform/"
				} ]`,
				} );

				const carbon:CarbonLDP.CarbonLDP = new CarbonLDP.CarbonLDP( "https://example.com/" );
				spyOn( carbon, "_resolvePath" ).and.returnValue( "https://example.com/.system/platform/" );

				carbon
					.getPlatformMetadata()
					.then( ( platformMetadata ):void => {
						type AllPartial<T> = { [P in keyof T]?:Partial<T[P]> };
						type JSPlatform = AllPartial<System.PlatformMetadata>;

						expect( platformMetadata as JSPlatform ).toEqual( {
							created: new Date( "2016-05-01T06:00:00.000Z" ),
							modified: new Date( "2016-05-01T06:00:00.000Z" ),
							instance: {
								buildDate: new Date( "2016-06-01T06:00:00.000Z" ),
								version: "1.0.0",
							},
						} );

						done();
					} )
					.catch( done.fail );
			} );

		} );

	} );

} );
