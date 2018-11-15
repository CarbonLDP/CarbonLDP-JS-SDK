import { hasProtocol } from "sparqler/iri";

import { AbstractContext } from "./AbstractContext";
import * as Auth from "./Auth";
import { Document } from "./Document";
import { Documents } from "./Documents";
import * as Errors from "./Errors";
import { Fragment } from "./Fragment";
import { FreeResources } from "./FreeResources";
import * as HTTP from "./HTTP";
import * as JSONLD from "./JSONLD";
import * as LDP from "./LDP";
import * as LDPatch from "./LDPatch";
import * as Messaging from "./Messaging";
import { NamedFragment } from "./NamedFragment";
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
import {
	CarbonLDPSettings,
	ContextSettings,
	DocumentPaths,
} from "./Settings";
import * as SHACL from "./SHACL";
import * as SPARQL from "./SPARQL";
import * as System from "./System";
import { TransientAccessPoint } from "./AccessPoint";
import { TransientBlankNode } from "./BlankNode";
import { TransientDocument } from "./Document";
import { TransientFragment } from "./Fragment";
import { TransientNamedFragment } from "./NamedFragment";
import { TransientProtectedDocument } from "./ProtectedDocument";
import * as Utils from "./Utils";
import * as Vocabularies from "./Vocabularies";

export class CarbonLDP extends AbstractContext {

	static AbstractContext:typeof AbstractContext = AbstractContext;
	static TransientAccessPoint:typeof TransientAccessPoint = TransientAccessPoint;
	static Auth:typeof Auth = Auth;
	static TransientBlankNode:typeof TransientBlankNode = TransientBlankNode;
	static TransientDocument:typeof TransientDocument = TransientDocument;
	static Documents:typeof Documents = Documents;
	static Errors:typeof Errors = Errors;
	static TransientFragment:typeof TransientFragment = TransientFragment;
	static FreeResources:typeof FreeResources = FreeResources;
	static HTTP:typeof HTTP = HTTP;
	static JSONLD:typeof JSONLD = JSONLD;
	static LDP:typeof LDP = LDP;
	static LDPatch:typeof LDPatch = LDPatch;
	static Messaging:typeof Messaging = Messaging;
	static TransientNamedFragment:typeof TransientNamedFragment = TransientNamedFragment;
	static Vocabularies:typeof Vocabularies = Vocabularies;
	static ObjectSchemaUtils:typeof ObjectSchemaUtils = ObjectSchemaUtils;
	static ObjectSchemaDigester:typeof ObjectSchemaDigester = ObjectSchemaDigester;
	static DigestedObjectSchemaProperty:typeof DigestedObjectSchemaProperty = DigestedObjectSchemaProperty;
	static PointerType:typeof PointerType = PointerType;
	static ContainerType:typeof ContainerType = ContainerType;
	static DigestedObjectSchema:typeof DigestedObjectSchema = DigestedObjectSchema;
	static Document:typeof Document = Document;
	static Fragment:typeof Fragment = Fragment;
	static NamedFragment:typeof NamedFragment = NamedFragment;
	static ProtectedDocument:typeof ProtectedDocument = ProtectedDocument;
	static Resource:typeof Resource = Resource;
	static Pointer:typeof Pointer = Pointer;
	static TransientProtectedDocument:typeof TransientProtectedDocument = TransientProtectedDocument;
	static RDF:typeof RDF = RDF;
	static TransientResource:typeof TransientResource = TransientResource;
	static SDKContext:typeof SDKContext = SDKContext;
	static globalContext:typeof globalContext = globalContext;
	static ServiceAwareDocument:typeof ServiceAwareDocument = ServiceAwareDocument;
	static SHACL:typeof SHACL = SHACL;
	static SPARQL:typeof SPARQL = SPARQL;
	static System:typeof System = System;
	static Utils:typeof Utils = Utils;


	static get version():string { return "1.0.0-alpha.18"; }

	// noinspection JSMethodCanBeStatic
	get version():string { return CarbonLDP.version; }

	protected _baseURI:string;
	protected settings:ContextSettings = {
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
	};

	messaging:Messaging.MessagingService;

	constructor( url:string );
	constructor( settings:CarbonLDPSettings );
	constructor( urlOrSettings:string | CarbonLDPSettings ) {
		super();

		if( Utils.isString( urlOrSettings ) ) {
			if( ! RDF.URI.hasProtocol( urlOrSettings ) ) throw new Errors.IllegalArgumentError( `The URL must contain a valid protocol: "http://", "https://".` );
			this._baseURI = urlOrSettings;

		} else {
			if( ! Utils.isString( urlOrSettings.host ) ) throw new Errors.IllegalArgumentError( `The settings object must contains a valid host string.` );
			if( hasProtocol( urlOrSettings.host ) ) throw new Errors.IllegalArgumentError( `The host must not contain a protocol.` );
			if( urlOrSettings.host.includes( ":" ) ) throw new Errors.IllegalArgumentError( `The host must not contain a port.` );

			this._baseURI = `${ urlOrSettings.ssl === false ? "http://" : "https://" }${ urlOrSettings.host }`;

			if( Utils.isNumber( urlOrSettings.port ) ) {
				if( this._baseURI.endsWith( "/" ) ) this._baseURI = this._baseURI.slice( 0, - 1 );
				this._baseURI += `:${ urlOrSettings.port }`;
			}

			urlOrSettings.ssl = urlOrSettings.host = urlOrSettings.port = null;

			const paths:ContextSettings[ "paths" ] = mergePaths( this.settings.paths, urlOrSettings.paths );

			this.settings = Utils.ObjectUtils.extend( this.settings, urlOrSettings );
			this.settings.paths = paths;
		}

		if( ! this._baseURI.endsWith( "/" ) ) this._baseURI = this._baseURI + "/";

		this.auth = new Auth.AuthService( this );
		this.messaging = new Messaging.MessagingService( this );
	}

	/**
	 * Retrieves the Metadata related to the CarbonLDP Platform.
	 */
	getPlatformMetadata():Promise<System.PlatformMetadata> {
		return Utils.promiseMethod( () => {
			const uri:string = this._resolvePath( "system.platform" );
			return this.documents.get<System.PlatformMetadata>( uri );
		} );
	}

}

function mergePaths( target:ContextSettings[ "paths" ], source:ContextSettings[ "paths" ] ):ContextSettings[ "paths" ] {
	if( ! source ) return target;
	if( ! target ) return Utils.ObjectUtils.clone( source, { objects: true } );

	for( const key of Object.keys( source ) ) {
		const sourcePath:string | DocumentPaths = source[ key ];

		if( sourcePath === null ) {
			delete target[ key ];
			continue;
		}

		const targetPath:string | DocumentPaths = target[ key ];
		if( ! targetPath ) {
			target[ key ] = Utils.isObject( sourcePath ) ?
				Utils.ObjectUtils.clone( sourcePath, { objects: true } ) :
				sourcePath;
			continue;
		}

		if( Utils.isString( sourcePath ) ) {
			if( Utils.isObject( targetPath ) ) {
				targetPath.slug = sourcePath;
			} else {
				target[ key ] = sourcePath;
			}
			continue;
		}

		if( sourcePath.slug === void 0 && sourcePath.paths === void 0 ) continue;

		const targetDocPaths:DocumentPaths = Utils.isString( targetPath ) ?
			target[ key ] = { slug: targetPath } : targetPath;

		if( sourcePath.slug !== void 0 ) targetDocPaths.slug = sourcePath.slug;
		if( sourcePath.paths !== void 0 ) targetDocPaths.paths = mergePaths( targetDocPaths.paths, sourcePath.paths );
	}

	return target;
}
