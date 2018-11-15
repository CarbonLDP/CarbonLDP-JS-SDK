import { QueryClause } from "sparqler/clauses";
import {
	BindToken,
	ConstructToken,
	IRIToken,
	OptionalToken,
	PatternToken,
	PredicateToken,
	QueryToken,
	SelectToken,
	SubjectToken,
	ValuesToken,
	VariableToken,
} from "sparqler/tokens";

import {
	AccessPoint,
	BaseAccessPoint,
	TransientAccessPoint
} from "./AccessPoint";
import * as Auth from "./Auth";
import { ACL } from "./Auth/ACL";
import { User } from "./Auth/User";
import { BlankNode } from "./BlankNode";
import { CarbonLDP } from "./CarbonLDP";
import { Context } from "./Context";
import {
	Document,
	TransientDocument
} from "./Document";
import * as Errors from "./Errors";
import { Fragment } from "./Fragment";
import { FreeResources } from "./FreeResources";
import { statusCodeMap } from "./HTTP/Errors";
import { HTTPError } from "./HTTP/Errors/HTTPError";
import { BadResponseError } from "./HTTP/Errors/ServerErrors/BadResponseError";
import { UnknownError } from "./HTTP/Errors/UnknownError";
import { Header } from "./HTTP/Header";
import { HTTPMethod } from "./HTTP/HTTPMethod";
import { Parser } from "./HTTP/Parser";
import {
	GETOptions,
	RequestOptions,
	RequestService,
	RequestUtils,
	RetrievalPreferences,
} from "./HTTP/Request";
import { Response } from "./HTTP/Response";
import { JSONLDCompacter } from "./JSONLD/Compacter";
import { JSONLDConverter } from "./JSONLD/Converter";
import { JSONLDParser } from "./JSONLD/Parser";
import { AccessPointsMetadata } from "./LDP";
import { AddMemberAction } from "./LDP/AddMemberAction";
import { DocumentMetadata } from "./LDP/DocumentMetadata";
import { ErrorResponse } from "./LDP/ErrorResponse";
import { RemoveMemberAction } from "./LDP/RemoveMemberAction";
import { ResponseMetadata } from "./LDP/ResponseMetadata";
import { DeltaCreator } from "./LDPatch/DeltaCreator";
import { AccessPointCreated } from "./Messaging/AccessPointCreated";
import { ChildCreated } from "./Messaging/ChildCreated";
import { DocumentCreated } from "./Messaging/DocumentCreated";
import { DocumentDeleted } from "./Messaging/DocumentDeleted";
import { DocumentModified } from "./Messaging/DocumentModified";
import { Event } from "./Messaging/Event";
import { EventMessage } from "./Messaging/EventMessage";
import { MemberAdded } from "./Messaging/MemberAdded";
import { MemberRemoved } from "./Messaging/MemberRemoved";
import {
	createDestination,
	validateEventContext,
} from "./Messaging/Utils";
import {
	DigestedObjectSchema,
	ObjectSchemaDigester,
	ObjectSchemaResolver,
	ObjectSchemaUtils,
} from "./ObjectSchema";
import {
	Pointer,
	PointerLibrary,
	PointerValidator,
} from "./Pointer";
import { ProtectedDocument } from "./ProtectedDocument";
import {
	RDFDocument,
	RDFDocumentParser,
} from "./RDF/Document";
import { RDFNode } from "./RDF/Node";
import { URI } from "./RDF/URI";
import {
	Resource,
	TransientResource
} from "./Resource";
import {
	FinishSPARQLSelect,
	SPARQLBuilder,
} from "./SPARQL/Builder";
import { QueryContext } from "./SPARQL/QueryDocument";
import { PartialMetadata } from "./SPARQL/QueryDocument/PartialMetadata";
import { QueryContextBuilder } from "./SPARQL/QueryDocument/QueryContextBuilder";
import { QueryContextPartial } from "./SPARQL/QueryDocument/QueryContextPartial";
import { QueryDocumentBuilder } from "./SPARQL/QueryDocument/QueryDocumentBuilder";
import { QueryDocumentsBuilder } from "./SPARQL/QueryDocument/QueryDocumentsBuilder";
import { QueryMetadata } from "./SPARQL/QueryDocument/QueryMetadata";
import {
	QueryProperty,
	QueryPropertyType,
} from "./SPARQL/QueryDocument/QueryProperty";
import {
	areDifferentType,
	createAllPattern,
	createPropertyPatterns,
	createTypesPattern,
	getAllTriples,
	getPathProperty,
	getResourcesVariables,
} from "./SPARQL/QueryDocument/Utils";
import { SPARQLRawResults } from "./SPARQL/RawResults";
import { SPARQLSelectResults } from "./SPARQL/SelectResults";
import { SPARQLService } from "./SPARQL/Service";
import * as Utils from "./Utils";
import { promiseMethod } from "./Utils";
import { C } from "./Vocabularies/C";
import { LDP } from "./Vocabularies/LDP";

export class Documents implements PointerLibrary, PointerValidator, ObjectSchemaResolver {

	private _jsonldConverter:JSONLDConverter;
	get jsonldConverter():JSONLDConverter { return this._jsonldConverter; }

	private _documentDecorators:Map<string, ( object:object, documents?:Documents ) => object>;
	get documentDecorators():Map<string, ( object:object, documents?:Documents ) => object> { return this._documentDecorators; }

	private context:Context;
	private pointers:Map<string, Pointer>;

	// Tracks the documents that are being resolved to avoid triggering repeated requests
	private documentsBeingResolved:Map<string, Promise<Document>>;

	constructor( context?:Context ) {
		this.context = context;

		this.pointers = new Map<string, Pointer>();
		this.documentsBeingResolved = new Map<string, Promise<Document>>();

		if( ! ! this.context && ! ! this.context.parentContext ) {
			let contextJSONLDConverter:JSONLDConverter = this.context.parentContext.documents.jsonldConverter;
			this._jsonldConverter = new JSONLDConverter( contextJSONLDConverter.literalSerializers );
		} else {
			this._jsonldConverter = new JSONLDConverter();
		}

		let decorators:Documents[ "documentDecorators" ] = new Map();
		if( this.context && this.context.parentContext ) {
			let parentDecorators:Documents[ "documentDecorators" ] = this.context.parentContext.documents.documentDecorators;
			if( parentDecorators ) decorators = this._documentDecorators = Utils.MapUtils.extend( decorators, parentDecorators );
		} else {
			decorators
				.set( ProtectedDocument.TYPE, ProtectedDocument.decorate )
				.set( User.TYPE, User.decorate )
				.set( ACL.TYPE, ACL.decorate )
				.set( Auth.Role.RDF_CLASS, Auth.PersistedRole.Factory.decorate )
			;
		}

		this._documentDecorators = decorators;
	}

	inScope( pointer:Pointer ):boolean;
	inScope( id:string ):boolean;
	inScope( idOrPointer:any ):boolean {
		let id:string = Pointer.is( idOrPointer ) ? idOrPointer.id : idOrPointer;

		if( URI.isBNodeID( id ) ) return false;

		if( ! ! this.context ) {
			id = ObjectSchemaUtils.resolveURI( id, this.context.getObjectSchema() );

			if( URI.isRelative( id ) ) return true;
			if( URI.isBaseOf( this.context.baseURI, id ) ) return true;
		} else {
			if( URI.isAbsolute( id ) ) return true;
		}

		if( ! ! this.context && ! ! this.context.parentContext ) return this.context.parentContext.documents.inScope( id );

		return URI.isRelative( id );
	}

	hasPointer( id:string ):boolean {
		id = this._getPointerID( id );

		if( this.pointers.has( id ) ) return true;

		if( ! ! this.context && ! ! this.context.parentContext ) return this.context.parentContext.documents.hasPointer( id );

		return false;
	}

	getPointer( id:string ):Pointer {
		let localID:string = this._getPointerID( id );

		if( localID === null ) {
			if( ! ! this.context && ! ! this.context.parentContext ) return this.context.parentContext.documents.getPointer( id );
			throw new Errors.IllegalArgumentError( "The pointer id is not supported by this module." );
		}

		let pointer:Pointer;
		if( ! this.pointers.has( localID ) ) {
			pointer = this._createPointer( localID );
			this.pointers.set( localID, pointer );
		}

		return this.pointers.get( localID );
	}

	removePointer( idOrPointer:string | Pointer ):boolean {
		let id:string = Utils.isString( idOrPointer ) ? idOrPointer : idOrPointer.id;
		let localID:string = this._getPointerID( id );

		if( localID === null ) {
			if( ! ! this.context && ! ! this.context.parentContext ) return this.context.parentContext.documents.removePointer( id );
			return false;
		}

		return this.pointers.delete( localID );
	}

	register<T extends object>( id:string ):T & Document {
		const pointerID:string = this._getPointerID( id );
		if( ! pointerID ) throw new Errors.IllegalArgumentError( `Cannot register a document outside the scope of this documents instance.` );

		const persistedDocument:Document =
			Document.decorate( this.getPointer( pointerID ), this )
		;

		return persistedDocument as T & Document;
	}


	get<T extends object>( uri:string, requestOptions?:GETOptions, queryBuilderFn?:( queryBuilder:QueryDocumentBuilder ) => QueryDocumentBuilder ):Promise<T & Document>;
	get<T extends object>( uri:string, queryBuilderFn?:( queryBuilder:QueryDocumentBuilder ) => QueryDocumentBuilder ):Promise<T & Document>;
	get<T extends object>( uri:string, optionsOrQueryBuilderFn:any, queryBuilderFn?:( queryBuilder:QueryDocumentBuilder ) => QueryDocumentBuilder ):Promise<T & Document> {
		const requestOptions:RequestOptions = RequestUtils.isOptions( optionsOrQueryBuilderFn ) ? optionsOrQueryBuilderFn : {};
		if( Utils.isFunction( optionsOrQueryBuilderFn ) ) queryBuilderFn = optionsOrQueryBuilderFn;

		return promiseMethod( () => {
			uri = this._getRequestURI( uri );

			return queryBuilderFn ?
				this._getPartialDocument( uri, requestOptions, queryBuilderFn ) :
				this._getFullDocument( uri, requestOptions );
		} );
	}

	exists( documentURI:string, requestOptions:RequestOptions = {} ):Promise<boolean> {
		return promiseMethod( () => {
			documentURI = this._getRequestURI( documentURI );
			this._setDefaultRequestOptions( requestOptions, LDP.RDFSource );

			return this._sendRequest( HTTPMethod.HEAD, documentURI, requestOptions );
		} ).then<boolean>( () => {
			return true;
		} ).catch<boolean>( ( error:HTTPError ) => {
			if( error.statusCode === 404 ) return false;
			return Promise.reject( error );
		} );
	}

	createChild<T extends object>( parentURI:string, childObject:T, slug?:string, requestOptions?:RequestOptions ):Promise<T & ProtectedDocument>;
	createChild<T extends object>( parentURI:string, childObject:T, requestOptions?:RequestOptions ):Promise<T & ProtectedDocument>;
	createChild<T extends object>( parentURI:string, childObject:T, slugOrRequestOptions?:any, requestOptions:RequestOptions = {} ):Promise<T & ProtectedDocument> {
		const slug:string = Utils.isString( slugOrRequestOptions ) ? slugOrRequestOptions : null;
		requestOptions = ! Utils.isString( slugOrRequestOptions ) && ! ! slugOrRequestOptions ? slugOrRequestOptions : requestOptions;

		return promiseMethod( () => {
			parentURI = this._getRequestURI( parentURI );
			RequestUtils.setPreferredRetrieval( "minimal", requestOptions );

			return this._persistChildDocument<T>( parentURI, childObject, slug, requestOptions );
		} );
	}

	createChildren<T extends object>( parentURI:string, childrenObjects:T[], slugs?:string[], requestOptions?:RequestOptions ):Promise<(T & ProtectedDocument)[]>;
	createChildren<T extends object>( parentURI:string, childrenObjects:T[], requestOptions?:RequestOptions ):Promise<(T & ProtectedDocument)[]>;
	createChildren<T extends object>( parentURI:string, childrenObjects:T[], slugsOrRequestOptions?:any, requestOptions:RequestOptions = {} ):Promise<(T & ProtectedDocument)[]> {
		const slugs:string[] = Utils.isArray( slugsOrRequestOptions ) ? slugsOrRequestOptions : [];
		requestOptions = ! Utils.isArray( slugsOrRequestOptions ) && ! ! slugsOrRequestOptions ? slugsOrRequestOptions : requestOptions;

		return promiseMethod( () => {
			parentURI = this._getRequestURI( parentURI );
			RequestUtils.setPreferredRetrieval( "minimal", requestOptions );

			const creationPromises:Promise<T & ProtectedDocument>[] = childrenObjects
				.map( ( childObject:T, index:number ) => {
					const cloneOptions:RequestOptions = RequestUtils.cloneOptions( requestOptions );
					return this._persistChildDocument<T>( parentURI, childObject, slugs[ index ], cloneOptions );
				} );
			return Promise.all( creationPromises );
		} );
	}

	createChildAndRetrieve<T extends object>( parentURI:string, childObject:T, slug?:string, requestOptions?:RequestOptions ):Promise<T & ProtectedDocument>;
	createChildAndRetrieve<T extends object>( parentURI:string, childObject:T, requestOptions?:RequestOptions ):Promise<T & ProtectedDocument>;
	createChildAndRetrieve<T extends object>( parentURI:string, childObject:T, slugOrRequestOptions?:any, requestOptions:RequestOptions = {} ):Promise<T & ProtectedDocument> {
		requestOptions = RequestUtils.isOptions( slugOrRequestOptions ) ? slugOrRequestOptions : requestOptions;
		const slug:string = Utils.isString( slugOrRequestOptions ) ? slugOrRequestOptions : null;

		return promiseMethod( () => {
			parentURI = this._getRequestURI( parentURI );
			RequestUtils.setPreferredRetrieval( "representation", requestOptions );

			return this._persistChildDocument<T>( parentURI, childObject, slug, requestOptions );
		} );
	}

	createChildrenAndRetrieve<T extends object>( parentURI:string, childrenObjects:T[], slugs?:string[], requestOptions?:RequestOptions ):Promise<(T & ProtectedDocument)[]>;
	createChildrenAndRetrieve<T extends object>( parentURI:string, childrenObjects:T[], requestOptions?:RequestOptions ):Promise<(T & ProtectedDocument)[]>;
	createChildrenAndRetrieve<T extends object>( parentURI:string, childrenObjects:T[], slugsOrRequestOptions?:any, requestOptions:RequestOptions = {} ):Promise<(T & ProtectedDocument)[]> {
		const slugs:string[] = Utils.isArray( slugsOrRequestOptions ) ? slugsOrRequestOptions : [];
		requestOptions = ! Utils.isArray( slugsOrRequestOptions ) && ! ! slugsOrRequestOptions ? slugsOrRequestOptions : requestOptions;

		return promiseMethod( () => {
			parentURI = this._getRequestURI( parentURI );
			RequestUtils.setPreferredRetrieval( "representation", requestOptions );

			const creationPromises:Promise<T & ProtectedDocument>[] = childrenObjects
				.map( ( childObject, index ) => {
					const cloneOptions:RequestOptions = RequestUtils.cloneOptions( requestOptions );
					return this._persistChildDocument<T>( parentURI, childObject, slugs[ index ], cloneOptions );
				} );
			return Promise.all( creationPromises );
		} );
	}


	listChildren<T extends object>( parentURI:string, requestOptions:RequestOptions = {} ):Promise<(T & Document)[]> {
		return this._executeChildrenBuilder( parentURI, requestOptions, emptyQueryBuildFn );
	}

	getChildren<T extends object>( parentURI:string, requestOptions:RequestOptions, queryBuilderFn?:( queryBuilder:QueryDocumentsBuilder ) => QueryDocumentsBuilder ):Promise<(T & Document)[]>;
	getChildren<T extends object>( parentURI:string, queryBuilderFn?:( queryBuilder:QueryDocumentsBuilder ) => QueryDocumentsBuilder ):Promise<(T & Document)[]>;
	getChildren<T extends object>( parentURI:string, requestOptionsOrQueryBuilderFn?:any, queryBuilderFn?:( queryBuilder:QueryDocumentsBuilder ) => QueryDocumentsBuilder ):Promise<(T & Document)[]> {
		const requestOptions:RequestOptions = RequestUtils.isOptions( requestOptionsOrQueryBuilderFn ) ? requestOptionsOrQueryBuilderFn : {};
		queryBuilderFn = Utils.isFunction( requestOptionsOrQueryBuilderFn ) ? requestOptionsOrQueryBuilderFn : queryBuilderFn;

		RequestUtils.setRetrievalPreferences( { include: [ C.PreferDocumentETags ] }, requestOptions );

		return this._executeChildrenBuilder( parentURI, requestOptions, queryBuilderFn );
	}

	createAccessPoint<T extends object>( documentURI:string, accessPoint:T & BaseAccessPoint, slug?:string, requestOptions?:RequestOptions ):Promise<T & AccessPoint>;
	createAccessPoint<T extends object>( documentURI:string, accessPoint:T & BaseAccessPoint, requestOptions?:RequestOptions ):Promise<T & AccessPoint>;
	createAccessPoint<T extends object>( documentURI:string, accessPoint:T & BaseAccessPoint, slugOrRequestOptions:any, requestOptions:RequestOptions = {} ):Promise<T & AccessPoint> {
		const slug:string = Utils.isString( slugOrRequestOptions ) ? slugOrRequestOptions : null;
		requestOptions = ! Utils.isString( slugOrRequestOptions ) && ! ! slugOrRequestOptions ? slugOrRequestOptions : requestOptions;

		return promiseMethod( () => {
			documentURI = this._getRequestURI( documentURI );
			RequestUtils.setPreferredRetrieval( "minimal", requestOptions );

			return this._persistAccessPoint( documentURI, accessPoint, slug, requestOptions );
		} );
	}

	createAccessPoints<T extends object>( documentURI:string, accessPoints:(T & BaseAccessPoint)[], slugs?:string[], requestOptions?:RequestOptions ):Promise<(T & AccessPoint)[]>;
	createAccessPoints<T extends object>( documentURI:string, accessPoints:(T & BaseAccessPoint)[], requestOptions?:RequestOptions ):Promise<(T & AccessPoint)[]>;
	createAccessPoints<T extends object>( documentURI:string, accessPoints:(T & BaseAccessPoint)[], slugsOrRequestOptions:any, requestOptions:RequestOptions = {} ):Promise<(T & AccessPoint)[]> {
		const slugs:string[] = Utils.isArray( slugsOrRequestOptions ) ? slugsOrRequestOptions : [];
		requestOptions = ! Utils.isArray( slugsOrRequestOptions ) && ! ! slugsOrRequestOptions ? slugsOrRequestOptions : requestOptions;

		return promiseMethod( () => {
			documentURI = this._getRequestURI( documentURI );
			RequestUtils.setPreferredRetrieval( "minimal", requestOptions );

			const creationPromises:Promise<T & AccessPoint>[] = accessPoints
				.map( ( accessPoint:T & BaseAccessPoint, index:number ) => {
					const cloneOptions:RequestOptions = RequestUtils.cloneOptions( requestOptions );
					return this._persistAccessPoint<T>( documentURI, accessPoint, slugs[ index ], cloneOptions );
				} );
			return Promise.all( creationPromises );
		} );
	}

	listMembers<T extends object>( uri:string, requestOptions:RequestOptions = {} ):Promise<(T & Document)[]> {
		return this._executeMembersBuilder( uri, requestOptions, emptyQueryBuildFn );
	}

	getMembers<T extends object>( uri:string, requestOptions:RequestOptions, queryBuilderFn?:( queryBuilder:QueryDocumentsBuilder ) => QueryDocumentsBuilder ):Promise<(T & Document)[]>;
	getMembers<T extends object>( uri:string, queryBuilderFn?:( queryBuilder:QueryDocumentsBuilder ) => QueryDocumentsBuilder ):Promise<(T & Document)[]>;
	getMembers<T extends object>( uri:string, requestOptionsOrQueryBuilderFn?:any, queryBuilderFn?:( queryBuilder:QueryDocumentsBuilder ) => QueryDocumentsBuilder ):Promise<(T & Document)[]> {
		const requestOptions:RequestOptions = RequestUtils.isOptions( requestOptionsOrQueryBuilderFn ) ? requestOptionsOrQueryBuilderFn : {};
		queryBuilderFn = Utils.isFunction( requestOptionsOrQueryBuilderFn ) ? requestOptionsOrQueryBuilderFn : queryBuilderFn;

		RequestUtils.setRetrievalPreferences( { include: [ C.PreferDocumentETags ] }, requestOptions );

		return this._executeMembersBuilder( uri, requestOptions, queryBuilderFn );
	}

	addMember( documentURI:string, member:Pointer, requestOptions?:RequestOptions ):Promise<void>;
	addMember( documentURI:string, memberURI:string, requestOptions?:RequestOptions ):Promise<void>;
	addMember( documentURI:string, memberORUri:Pointer | string, requestOptions:RequestOptions = {} ):Promise<void> {
		return this.addMembers( documentURI, [ memberORUri ], requestOptions );
	}

	addMembers( documentURI:string, members:(Pointer | string)[], requestOptions?:RequestOptions ):Promise<void>;
	addMembers( documentURI:string, members:(Pointer | string)[], requestOptions:RequestOptions = {} ):Promise<void> {
		return promiseMethod( () => {
			const targetMembers:Pointer[] = this._parseMembers( members );

			documentURI = this._getRequestURI( documentURI );
			this._setDefaultRequestOptions( requestOptions, LDP.Container );
			RequestUtils.setContentTypeHeader( "application/ld+json", requestOptions );

			const freeResources:FreeResources = FreeResources.createFrom( { _documents: this } );
			freeResources.createResourceFrom( AddMemberAction.createFrom( { targetMembers } ) );

			const body:string = JSON.stringify( freeResources );

			return this
				._sendRequest( HTTPMethod.PUT, documentURI, requestOptions, body )
				.then( () => {} );
		} );
	}

	removeMember( documentURI:string, member:Pointer, requestOptions?:RequestOptions ):Promise<void>;
	removeMember( documentURI:string, memberURI:string, requestOptions?:RequestOptions ):Promise<void>;
	removeMember( documentURI:string, memberORUri:Pointer | string, requestOptions:RequestOptions = {} ):Promise<void> {
		return this.removeMembers( documentURI, [ memberORUri ], requestOptions );
	}

	removeMembers( documentURI:string, members:(Pointer | string)[], requestOptions:RequestOptions = {} ):Promise<void> {
		return promiseMethod( () => {
			const targetMembers:Pointer[] = this._parseMembers( members );

			documentURI = this._getRequestURI( documentURI );
			this._setDefaultRequestOptions( requestOptions, LDP.Container );
			RequestUtils.setContentTypeHeader( "application/ld+json", requestOptions );

			let containerRetrievalPreferences:RetrievalPreferences = {
				include: [ C.PreferSelectedMembershipTriples ],
				omit: [ C.PreferMembershipTriples ],
			};
			RequestUtils.setRetrievalPreferences( containerRetrievalPreferences, requestOptions );

			const freeResources:FreeResources = FreeResources.createFrom( { _documents: this } );
			freeResources.createResourceFrom( RemoveMemberAction.createFrom( { targetMembers } ) );

			const body:string = JSON.stringify( freeResources );

			return this
				._sendRequest( HTTPMethod.DELETE, documentURI, requestOptions, body )
				.then( () => {} );
		} );
	}

	removeAllMembers( documentURI:string, requestOptions:RequestOptions = {} ):Promise<void> {
		return promiseMethod( () => {
			documentURI = this._getRequestURI( documentURI );
			this._setDefaultRequestOptions( requestOptions, LDP.Container );

			const containerRetrievalPreferences:RetrievalPreferences = {
				include: [
					C.PreferMembershipTriples,
				],
				omit: [
					C.PreferMembershipResources,
					C.PreferContainmentTriples,
					C.PreferContainmentResources,
					C.PreferContainer,
				],
			};
			RequestUtils.setRetrievalPreferences( containerRetrievalPreferences, requestOptions );

			return this
				._sendRequest( HTTPMethod.DELETE, documentURI, requestOptions )
				.then( () => {} );
		} );
	}


	save<T extends object>( persistedDocument:T & Document, requestOptions:RequestOptions = {} ):Promise<T & Document> {
		return promiseMethod( () => {
			if( ! Document.is( persistedDocument ) ) throw new Errors.IllegalArgumentError( "Provided element is not a valid persisted document." );

			RequestUtils.setPreferredRetrieval( "minimal", requestOptions );
			return this._patchDocument<T>( persistedDocument, requestOptions );
		} );
	}

	refresh<T extends object>( persistedDocument:T & Document, requestOptions:RequestOptions = {} ):Promise<T & Document> {
		return Utils.promiseMethod( () => {
			if( ! Document.is( persistedDocument ) ) throw new Errors.IllegalArgumentError( "Provided element is not a valid persisted document." );

			return persistedDocument.isPartial() ?
				this._refreshPartialDocument<T>( persistedDocument, requestOptions ) :
				this._refreshFullDocument<T>( persistedDocument, requestOptions );
		} );
	}

	saveAndRefresh<T extends object>( persistedDocument:T & Document, requestOptions:RequestOptions = {} ):Promise<T & Document> {
		return promiseMethod( () => {
			if( ! Document.is( persistedDocument ) ) throw new Errors.IllegalArgumentError( "Provided element is not a valid persisted document." );

			const cloneOptions:RequestOptions = RequestUtils.cloneOptions( requestOptions );
			RequestUtils.setPreferredRetrieval( persistedDocument.isPartial() ? "minimal" : "representation", cloneOptions );

			return this._patchDocument<T>( persistedDocument, cloneOptions );
		} ).then<T & Document>( () => {
			if( ! persistedDocument.isPartial() ) return persistedDocument;

			return this._refreshPartialDocument<T>( persistedDocument, requestOptions );
		} );
	}


	delete( documentURI:string, requestOptions:RequestOptions = {} ):Promise<void> {
		return promiseMethod( () => {
			documentURI = this._getRequestURI( documentURI );
			this._setDefaultRequestOptions( requestOptions, LDP.RDFSource );

			return this._sendRequest( HTTPMethod.DELETE, documentURI, requestOptions );
		} ).then( () => {
			const pointerID:string = this._getPointerID( documentURI );
			this.pointers.delete( pointerID );
		} );
	}


	getGeneralSchema():DigestedObjectSchema {
		if( ! this.context ) return new DigestedObjectSchema();
		return this.context.getObjectSchema();
	}

	hasSchemaFor( object:object, path?:string ):boolean {
		if( path !== void 0 ) return false;
		return "@id" in object || "id" in object;
	}

	getSchemaFor( object:object ):DigestedObjectSchema {
		return ("@id" in object) ?
			this._getDigestedObjectSchemaForExpandedObject( object ) :
			this._getDigestedObjectSchemaForDocument( <any> object );
	}


	executeRawASKQuery( documentURI:string, askQuery:string, requestOptions:RequestOptions = {} ):Promise<SPARQLRawResults> {
		return promiseMethod( () => {
			documentURI = this._getRequestURI( documentURI );

			if( this.context && this.context.auth && this.context.auth.isAuthenticated() ) this.context.auth.addAuthentication( requestOptions );

			return SPARQLService
				.executeRawASKQuery( documentURI, askQuery, requestOptions )
				.then( ( [ rawResults ] ) => rawResults )
				.catch( this._parseErrorResponse.bind( this ) );
		} );
	}

	executeASKQuery( documentURI:string, askQuery:string, requestOptions:RequestOptions = {} ):Promise<boolean> {
		return promiseMethod( () => {
			documentURI = this._getRequestURI( documentURI );

			if( this.context && this.context.auth && this.context.auth.isAuthenticated() ) this.context.auth.addAuthentication( requestOptions );

			return SPARQLService
				.executeASKQuery( documentURI, askQuery, requestOptions )
				.then( ( [ rawResults ] ) => rawResults )
				.catch( this._parseErrorResponse.bind( this ) );
		} );
	}

	executeRawSELECTQuery( documentURI:string, selectQuery:string, requestOptions:RequestOptions = {} ):Promise<SPARQLRawResults> {
		return promiseMethod( () => {
			documentURI = this._getRequestURI( documentURI );

			if( this.context && this.context.auth && this.context.auth.isAuthenticated() ) this.context.auth.addAuthentication( requestOptions );

			return SPARQLService
				.executeRawSELECTQuery( documentURI, selectQuery, requestOptions )
				.then( ( [ rawResults ] ) => rawResults )
				.catch( this._parseErrorResponse.bind( this ) );
		} );
	}

	executeSELECTQuery<T extends object>( documentURI:string, selectQuery:string, requestOptions:RequestOptions = {} ):Promise<SPARQLSelectResults<T>> {
		return promiseMethod( () => {
			documentURI = this._getRequestURI( documentURI );

			if( this.context && this.context.auth && this.context.auth.isAuthenticated() ) this.context.auth.addAuthentication( requestOptions );

			return SPARQLService
				.executeSELECTQuery<T>( documentURI, selectQuery, this, requestOptions )
				.then( ( [ selectResults ] ) => selectResults )
				.catch( this._parseErrorResponse.bind( this ) );
		} );
	}

	executeRawCONSTRUCTQuery( documentURI:string, constructQuery:string, requestOptions:RequestOptions = {} ):Promise<string> {
		return promiseMethod( () => {
			documentURI = this._getRequestURI( documentURI );

			if( this.context && this.context.auth && this.context.auth.isAuthenticated() ) this.context.auth.addAuthentication( requestOptions );

			return SPARQLService
				.executeRawCONSTRUCTQuery( documentURI, constructQuery, requestOptions )
				.then( ( [ strConstruct ] ) => strConstruct )
				.catch( this._parseErrorResponse.bind( this ) );
		} );
	}

	executeRawDESCRIBEQuery( documentURI:string, describeQuery:string, requestOptions:RequestOptions = {} ):Promise<string> {
		return promiseMethod( () => {
			documentURI = this._getRequestURI( documentURI );

			if( this.context && this.context.auth && this.context.auth.isAuthenticated() ) this.context.auth.addAuthentication( requestOptions );

			return SPARQLService
				.executeRawDESCRIBEQuery( documentURI, describeQuery, requestOptions )
				.then( ( [ strDescribe ] ) => strDescribe )
				.catch( this._parseErrorResponse.bind( this ) );
		} );
	}

	executeUPDATE( documentURI:string, update:string, requestOptions:RequestOptions = {} ):Promise<void> {
		return promiseMethod( () => {
			documentURI = this._getRequestURI( documentURI );

			if( this.context && this.context.auth && this.context.auth.isAuthenticated() ) this.context.auth.addAuthentication( requestOptions );

			return SPARQLService
				.executeUPDATE( documentURI, update, requestOptions )
				.then( () => {} )
				.catch( this._parseErrorResponse.bind( this ) );
		} );
	}


	sparql( documentURI:string ):QueryClause<FinishSPARQLSelect> {
		let builder:QueryClause<FinishSPARQLSelect> = new SPARQLBuilder( this, this._getRequestURI( documentURI ) );

		if( this.context ) {
			const schema:DigestedObjectSchema = this._getProcessedSchema();

			builder = builder
				.base( schema.base )
				.vocab( schema.vocab );

			schema.prefixes.forEach( ( uri:string, prefix:string ) => {
				builder = builder.prefix( prefix, uri );
			} );
		}

		return builder;
	}

	on( event:Event.CHILD_CREATED, uriPattern:string, onEvent:( message:ChildCreated ) => void, onError:( error:Error ) => void ):void;
	on( event:Event.ACCESS_POINT_CREATED, uriPattern:string, onEvent:( message:AccessPointCreated ) => void, onError:( error:Error ) => void ):void;
	on( event:Event.DOCUMENT_CREATED, uriPattern:string, onEvent:( message:DocumentCreated ) => void, onError:( error:Error ) => void ):void;
	on( event:Event.DOCUMENT_MODIFIED, uriPattern:string, onEvent:( message:DocumentModified ) => void, onError:( error:Error ) => void ):void;
	on( event:Event.DOCUMENT_DELETED, uriPattern:string, onEvent:( message:DocumentDeleted ) => void, onError:( error:Error ) => void ):void;
	on( event:Event.MEMBER_ADDED, uriPattern:string, onEvent:( message:MemberAdded ) => void, onError:( error:Error ) => void ):void;
	on( event:Event.MEMBER_REMOVED, uriPattern:string, onEvent:( message:MemberRemoved ) => void, onError:( error:Error ) => void ):void;
	on( event:Event | string, uriPattern:string, onEvent:( message:EventMessage ) => void, onError:( error:Error ) => void ):void;
	on<T extends EventMessage>( event:Event | string, uriPattern:string, onEvent:( message:T ) => void, onError:( error:Error ) => void ):void {
		try {
			validateEventContext( this.context );
			const destination:string = createDestination( event, uriPattern, this.context.baseURI );
			(this.context as CarbonLDP).messaging.subscribe( destination, onEvent, onError );
		} catch( error ) {
			if( ! onError ) throw error;
			onError( error );
		}
	}

	off( event:Event.CHILD_CREATED, uriPattern:string, onEvent:( message:ChildCreated ) => void, onError:( error:Error ) => void ):void;
	off( event:Event.ACCESS_POINT_CREATED, uriPattern:string, onEvent:( message:AccessPointCreated ) => void, onError:( error:Error ) => void ):void;
	off( event:Event.DOCUMENT_CREATED, uriPattern:string, onEvent:( message:DocumentCreated ) => void, onError:( error:Error ) => void ):void;
	off( event:Event.DOCUMENT_MODIFIED, uriPattern:string, onEvent:( message:DocumentModified ) => void, onError:( error:Error ) => void ):void;
	off( event:Event.DOCUMENT_DELETED, uriPattern:string, onEvent:( message:DocumentDeleted ) => void, onError:( error:Error ) => void ):void;
	off( event:Event.MEMBER_ADDED, uriPattern:string, onEvent:( message:MemberAdded ) => void, onError:( error:Error ) => void ):void;
	off( event:Event.MEMBER_REMOVED, uriPattern:string, onEvent:( message:MemberRemoved ) => void, onError:( error:Error ) => void ):void;
	off( event:Event | string, uriPattern:string, onEvent:( message:EventMessage ) => void, onError:( error:Error ) => void ):void;
	off<T extends EventMessage>( event:Event | string, uriPattern:string, onEvent:( message:T ) => void, onError:( error:Error ) => void ):void {
		try {
			validateEventContext( this.context );
			const destination:string = createDestination( event, uriPattern, this.context.baseURI );
			(this.context as CarbonLDP).messaging.unsubscribe( destination, onEvent );
		} catch( error ) {
			if( ! onError ) throw error;
			onError( error );
		}
	}

	one( event:Event.CHILD_CREATED, uriPattern:string, onEvent:( message:ChildCreated ) => void, onError:( error:Error ) => void ):void;
	one( event:Event.ACCESS_POINT_CREATED, uriPattern:string, onEvent:( message:AccessPointCreated ) => void, onError:( error:Error ) => void ):void;
	one( event:Event.DOCUMENT_CREATED, uriPattern:string, onEvent:( message:DocumentCreated ) => void, onError:( error:Error ) => void ):void;
	one( event:Event.DOCUMENT_MODIFIED, uriPattern:string, onEvent:( message:DocumentModified ) => void, onError:( error:Error ) => void ):void;
	one( event:Event.DOCUMENT_DELETED, uriPattern:string, onEvent:( message:DocumentDeleted ) => void, onError:( error:Error ) => void ):void;
	one( event:Event.MEMBER_ADDED, uriPattern:string, onEvent:( message:MemberAdded ) => void, onError:( error:Error ) => void ):void;
	one( event:Event.MEMBER_REMOVED, uriPattern:string, onEvent:( message:MemberRemoved ) => void, onError:( error:Error ) => void ):void;
	one( event:Event | string, uriPattern:string, onEvent:( message:EventMessage ) => void, onError:( error:Error ) => void ):void;
	one<T extends EventMessage>( event:Event | string, uriPattern:string, onEvent:( message:T ) => void, onError:( error:Error ) => void ):void {
		const self:Documents = this;
		this.on( event, uriPattern, function onEventWrapper( message:T ):void {
			onEvent( message );
			self.off( event, uriPattern, onEventWrapper, onError );
		}, onError );
	}

	onDocumentCreated( uriPattern:string, onEvent:( message:DocumentCreated ) => void, onError:( error:Error ) => void ):void {
		return this.on( Event.DOCUMENT_CREATED, uriPattern, onEvent, onError );
	}

	onChildCreated( uriPattern:string, onEvent:( message:ChildCreated ) => void, onError:( error:Error ) => void ):void {
		return this.on( Event.CHILD_CREATED, uriPattern, onEvent, onError );
	}

	onAccessPointCreated( uriPattern:string, onEvent:( message:AccessPointCreated ) => void, onError:( error:Error ) => void ):void {
		return this.on( Event.ACCESS_POINT_CREATED, uriPattern, onEvent, onError );
	}

	onDocumentModified( uriPattern:string, onEvent:( message:DocumentModified ) => void, onError:( error:Error ) => void ):void {
		return this.on( Event.DOCUMENT_MODIFIED, uriPattern, onEvent, onError );
	}

	onDocumentDeleted( uriPattern:string, onEvent:( message:DocumentDeleted ) => void, onError:( error:Error ) => void ):void {
		return this.on( Event.DOCUMENT_DELETED, uriPattern, onEvent, onError );
	}

	onMemberAdded( uriPattern:string, onEvent:( message:MemberAdded ) => void, onError:( error:Error ) => void ):void {
		return this.on( Event.MEMBER_ADDED, uriPattern, onEvent, onError );
	}

	onMemberRemoved( uriPattern:string, onEvent:( message:MemberRemoved ) => void, onError:( error:Error ) => void ):void {
		return this.on( Event.MEMBER_REMOVED, uriPattern, onEvent, onError );
	}


	_convertRDFDocument<T extends object>( rdfDocument:RDFDocument, response:Response ):T & Document {
		const [ documentResources ] = RDFDocument.getNodes( rdfDocument );
		if( documentResources.length === 0 ) throw new BadResponseError( `The RDFDocument: ${ rdfDocument[ "@id" ] }, doesn't contain a document resource.`, response );
		if( documentResources.length > 1 ) throw new BadResponseError( `The RDFDocument: ${ rdfDocument[ "@id" ] }, contains more than one document resource.`, response );

		const persistedDocument:T & Document = new JSONLDCompacter( this )
			.compactDocument( rdfDocument );
		persistedDocument._resolved = true;

		return persistedDocument;
	}

	_getFreeResources( nodes:RDFNode[] ):FreeResources {
		let freeResourcesDocument:FreeResources = FreeResources.createFrom( { _documents: this } );

		let resources:TransientResource[] = nodes.map( node => freeResourcesDocument.createResource( node[ "@id" ] ) );
		this._compact( nodes, resources, freeResourcesDocument );

		return freeResourcesDocument;
	}

	_parseErrorResponse<T extends object>( response:Response | Error ):Promise<never> {
		if( response instanceof Error ) return Promise.reject( response );

		if( ! (response.status >= 400 && response.status < 600 && statusCodeMap.has( response.status )) )
			return Promise.reject( new UnknownError( response.data, response ) );

		const error:HTTPError = new (statusCodeMap.get( response.status ))( response.data, response );
		if( ! response.data || ! this.context ) return Promise.reject( error );

		return new JSONLDParser()
			.parse( response.data )
			.then( ( freeNodes:RDFNode[] ) => {
				const freeResources:FreeResources = this._getFreeResources( freeNodes );
				const errorResponses:ErrorResponse[] = freeResources
					.getResources()
					.filter( ( resource ):resource is ErrorResponse => resource.hasType( ErrorResponse.TYPE ) );
				if( errorResponses.length === 0 ) return Promise.reject( new Errors.IllegalArgumentError( "The response string does not contains a c:ErrorResponse." ) );
				if( errorResponses.length > 1 ) return Promise.reject( new Errors.IllegalArgumentError( "The response string contains multiple c:ErrorResponse." ) );

				Object.assign( error, errorResponses[ 0 ] );
				error.message = ErrorResponse.getMessage( error );
				return Promise.reject( error );
			}, () => {
				return Promise.reject( error );
			} );
	}


	private _getFullDocument<T extends object>( uri:string, requestOptions:GETOptions ):T & Document | Promise<T & Document> {
		if( this.hasPointer( uri ) && ! requestOptions.ensureLatest ) {
			const pointer:T & Pointer = this.getPointer( uri ) as T & Pointer;
			if( pointer.isResolved() && ! (pointer as Document).isPartial() ) return pointer as T & Document;
		}

		this._setDefaultRequestOptions( requestOptions, LDP.RDFSource );

		if( this.documentsBeingResolved.has( uri ) )
			return this.documentsBeingResolved.get( uri ) as Promise<T & Document>;

		const promise:Promise<T & Document> = this
			._sendRequest( HTTPMethod.GET, uri, requestOptions, null, new RDFDocumentParser() )
			.then<T & Document>( ( [ rdfDocuments, response ]:[ RDFDocument[], Response ] ) => {
				const eTag:string = response.getETag();
				if( eTag === null ) throw new BadResponseError( "The response doesn't contain an ETag", response );

				let targetURI:string = uri;
				const locationHeader:Header = response.getHeader( "Content-Location" );
				if( locationHeader ) {
					if( locationHeader.values.length !== 1 ) throw new BadResponseError( "The response must contain one Content-Location header.", response );
					const locationString:string = "" + locationHeader;

					if( ! locationString ) throw new BadResponseError( `The response doesn't contain a valid 'Content-Location' header.`, response );
					targetURI = locationString;
				}

				const rdfDocument:RDFDocument = this._getRDFDocument( targetURI, rdfDocuments, response );
				if( rdfDocument === null ) throw new BadResponseError( "No document was returned.", response );

				const document:T & Document = this._convertRDFDocument<T>( rdfDocument, response );
				document._eTag = eTag;

				this.documentsBeingResolved.delete( uri );
				return document;
			} ).catch( error => {
				this.documentsBeingResolved.delete( uri );
				return Promise.reject( error );
			} );

		this.documentsBeingResolved.set( uri, promise );
		return promise;
	}

	private _getPartialDocument<T extends object>( uri:string, requestOptions:RequestOptions, queryBuilderFn?:( queryBuilder:QueryDocumentBuilder ) => QueryDocumentBuilder ):Promise<T & Document> {
		const queryContext:QueryContextBuilder = new QueryContextBuilder( this.context );

		const documentProperty:QueryProperty = queryContext
			.addProperty( "document" )
			.setOptional( false );

		const propertyValue:ValuesToken = new ValuesToken().addValues( documentProperty.variable, queryContext.compactIRI( uri ) );
		documentProperty.addPattern( propertyValue );

		RequestUtils.setRetrievalPreferences( { include: [ C.PreferDocumentETags ] }, requestOptions );

		return this
			._executeQueryBuilder<T>( uri, requestOptions, queryContext, documentProperty, queryBuilderFn )
			.then<T & Document>( ( documents ) => documents[ 0 ] );
	}


	private _patchDocument<T extends object>( persistedDocument:T & Document, requestOptions:RequestOptions ):T & Document | Promise<T & Document> {
		const uri:string = this._getRequestURI( persistedDocument.id );

		if( ! persistedDocument.isDirty() ) return persistedDocument;
		if( persistedDocument.isLocallyOutDated() ) throw new Errors.IllegalStateError( "Cannot save an outdated document." );

		this._setDefaultRequestOptions( requestOptions );
		RequestUtils.setContentTypeHeader( "text/ldpatch", requestOptions );
		RequestUtils.setIfMatchHeader( persistedDocument._eTag, requestOptions );

		persistedDocument._normalize();
		const deltaCreator:DeltaCreator = new DeltaCreator( this.jsonldConverter );
		[ persistedDocument, ...persistedDocument.getFragments() ].forEach( ( resource:Resource ) => {
			const schema:DigestedObjectSchema = this.getSchemaFor( resource );
			deltaCreator.addResource( schema, resource._snapshot, resource );
		} );

		const body:string = deltaCreator.getPatch();

		return this
			._sendRequest( HTTPMethod.PATCH, uri, requestOptions, body )
			.then<T & Document>( ( response:Response ) => {
				return this._applyResponseData( persistedDocument, response );
			} );
	}


	private _refreshFullDocument<T extends object>( persistedDocument:T & Document, requestOptions:RequestOptions ):Promise<T & Document> {
		const uri:string = this._getRequestURI( persistedDocument.id );

		this._setDefaultRequestOptions( requestOptions, LDP.RDFSource );
		RequestUtils.setIfNoneMatchHeader( persistedDocument._eTag, requestOptions );

		return this
			._sendRequest( HTTPMethod.GET, uri, requestOptions, null, new RDFDocumentParser() )
			.then<T & Document>( ( [ rdfDocuments, response ]:[ RDFDocument[], Response ] ) => {
				if( response === null ) return persistedDocument;

				const eTag:string = response.getETag();
				if( eTag === null ) throw new BadResponseError( "The response doesn't contain an ETag.", response );

				const rdfDocument:RDFDocument = this._getRDFDocument( uri, rdfDocuments, response );
				if( rdfDocument === null ) throw new BadResponseError( "No document was returned.", response );

				const updatedPersistedDocument:T & Document = this._convertRDFDocument( rdfDocument, response );
				updatedPersistedDocument._eTag = eTag;

				return updatedPersistedDocument;
			} ).catch<T & Document>( ( error:HTTPError ) => {
				if( error.statusCode === 304 ) return persistedDocument;
				return Promise.reject( error );
			} );
	}

	private _refreshPartialDocument<T extends object>( persistedDocument:T & Document, requestOptions:RequestOptions ):Promise<T & Document> {
		const uri:string = this._getRequestURI( persistedDocument.id );
		const queryContext:QueryContextPartial = new QueryContextPartial( persistedDocument, this.context );

		const targetName:string = "document";
		const constructPatterns:OptionalToken = new OptionalToken()
			.addPattern( new ValuesToken()
				.addValues( queryContext.getVariable( targetName ), new IRIToken( uri ) )
			)
		;

		this._addRefreshQueryPatterns( queryContext, constructPatterns, persistedDocument, targetName );

		RequestUtils.setRetrievalPreferences( { include: [ C.PreferDocumentETags ] }, requestOptions );

		return this
			._executeConstructPatterns<T>( uri, requestOptions, queryContext, targetName, constructPatterns.patterns, persistedDocument )
			.then<T & Document>( ( documents ) => documents[ 0 ] );
	}

	private _addRefreshQueryPatterns( queryContext:QueryContextPartial, parentAdder:OptionalToken, resource:Resource, parentName:string ):void {
		if( resource._partialMetadata.schema === PartialMetadata.ALL ) {
			parentAdder.addPattern( createAllPattern( queryContext, parentName ) );
			return;
		}

		parentAdder.addPattern( createTypesPattern( queryContext, parentName ) );

		resource._partialMetadata.schema.properties.forEach( ( digestedProperty, propertyName ) => {
			const path:string = `${ parentName }.${ propertyName }`;

			const propertyPattern:OptionalToken = new OptionalToken()
				.addPattern( ...createPropertyPatterns(
					queryContext,
					parentName,
					path,
					digestedProperty
				) );
			parentAdder.addPattern( propertyPattern );

			const propertyValues:any[] = Array.isArray( resource[ propertyName ] ) ? resource[ propertyName ] : [ resource[ propertyName ] ];
			const propertyFragment:Fragment = propertyValues
				.filter( Fragment.is )
				.find( fragment => fragment.isPartial() );
			if( ! propertyFragment ) return;

			this._addRefreshQueryPatterns( queryContext, propertyPattern, propertyFragment, path );
		} );
	}


	private _executeChildrenBuilder<T extends object>( uri:string, requestOptions:RequestOptions, queryBuilderFn?:( queryBuilder:QueryDocumentBuilder ) => QueryDocumentBuilder ):Promise<(T & Document)[]> {
		return promiseMethod( () => {
			uri = this._getRequestURI( uri );

			const queryContext:QueryContextBuilder = new QueryContextBuilder( this.context );
			const childrenProperty:QueryProperty = queryContext
				.addProperty( "child" )
				.setOptional( false );

			const selectChildren:SelectToken = new SelectToken( "DISTINCT" )
				.addVariable( childrenProperty.variable )
				.addPattern( new SubjectToken( queryContext.compactIRI( uri ) )
					.addPredicate( new PredicateToken( queryContext.compactIRI( LDP.contains ) )
						.addObject( childrenProperty.variable )
					)
				)
			;
			childrenProperty.addPattern( selectChildren );

			return this._executeQueryBuilder<T>( uri, requestOptions, queryContext, childrenProperty, queryBuilderFn );
		} );
	}

	private _executeMembersBuilder<T extends object>( uri:string, requestOptions:RequestOptions, queryBuilderFn?:( queryBuilder:QueryDocumentBuilder ) => QueryDocumentBuilder ):Promise<(T & Document)[]> {
		return promiseMethod( () => {
			uri = this._getRequestURI( uri );

			const queryContext:QueryContextBuilder = new QueryContextBuilder( this.context );
			const membersProperty:QueryProperty = queryContext
				.addProperty( "member" )
				.setOptional( false );

			const membershipResource:VariableToken = queryContext.getVariable( "membershipResource" );
			const hasMemberRelation:VariableToken = queryContext.getVariable( "hasMemberRelation" );
			const selectMembers:SelectToken = new SelectToken( "DISTINCT" )
				.addVariable( membersProperty.variable )
				.addPattern( new SubjectToken( queryContext.compactIRI( uri ) )
					.addPredicate( new PredicateToken( queryContext.compactIRI( LDP.membershipResource ) )
						.addObject( membershipResource )
					)
					.addPredicate( new PredicateToken( queryContext.compactIRI( LDP.hasMemberRelation ) )
						.addObject( hasMemberRelation )
					)
				)
				.addPattern( new SubjectToken( membershipResource )
					.addPredicate( new PredicateToken( hasMemberRelation )
						.addObject( membersProperty.variable )
					)
				)
			;
			membersProperty.addPattern( selectMembers );

			return this._executeQueryBuilder<T>( uri, requestOptions, queryContext, membersProperty, queryBuilderFn );
		} );
	}

	private _executeQueryBuilder<T extends object>( uri:string, requestOptions:RequestOptions, queryContext:QueryContextBuilder, targetProperty:QueryProperty, queryBuilderFn?:( queryBuilder:QueryDocumentBuilder ) => QueryDocumentBuilder ):Promise<(T & Document)[]> {
		const Builder:typeof QueryDocumentBuilder = targetProperty.name === "document" ?
			QueryDocumentBuilder : QueryDocumentsBuilder;
		const queryBuilder:QueryDocumentBuilder | QueryDocumentBuilder = new Builder( queryContext, targetProperty );

		targetProperty.setType( queryBuilderFn ?
			queryBuilderFn === emptyQueryBuildFn ?
				QueryPropertyType.EMPTY :
				QueryPropertyType.PARTIAL :
			QueryPropertyType.FULL
		);

		if( queryBuilderFn && queryBuilderFn.call( void 0, queryBuilder ) !== queryBuilder )
			throw new Errors.IllegalArgumentError( "The provided query builder was not returned" );

		const constructPatterns:PatternToken[] = targetProperty.getPatterns();
		return this
			._executeConstructPatterns<T>( uri, requestOptions, queryContext, targetProperty.name, constructPatterns )
			.then( ( documents ) => {
				if( queryBuilder instanceof QueryDocumentsBuilder && queryBuilder._orderData ) {
					const { path, flow } = queryBuilder._orderData;
					const inverter:number = flow === "DESC" ? - 1 : 1;

					documents.sort( ( a:any, b:any ) => {
						a = getPathProperty( a, path );
						b = getPathProperty( b, path );

						const aValue:any = Pointer.is( a ) ? a.id : a;
						const bValue:any = Pointer.is( b ) ? b.id : b;

						if( aValue === bValue ) return 0;

						if( aValue === void 0 ) return - 1 * inverter;
						if( bValue === void 0 ) return inverter;

						if( ! areDifferentType( a, b ) ) {
							if( Pointer.is( a ) ) {
								const aIsBNode:boolean = URI.isBNodeID( aValue );
								const bIsBNode:boolean = URI.isBNodeID( bValue );

								if( aIsBNode && ! bIsBNode ) return - 1 * inverter;
								if( bIsBNode && ! aIsBNode ) return inverter;
							}
						} else {
							if( Pointer.is( a ) ) return - 1 * inverter;
							if( Pointer.is( b ) ) return inverter;

							if( Utils.isNumber( a ) ) return - 1 * inverter;
							if( Utils.isNumber( b ) ) return inverter;

							if( Utils.isDate( a ) ) return - 1 * inverter;
							if( Utils.isDate( b ) ) return inverter;

							if( Utils.isBoolean( a ) ) return - 1 * inverter;
							if( Utils.isBoolean( b ) ) return inverter;

							if( Utils.isString( a ) ) return - 1 * inverter;
							if( Utils.isString( b ) ) return inverter;
						}

						if( aValue < bValue ) return - 1 * inverter;
						if( aValue > bValue ) return inverter;
					} );
				}

				return documents;
			} )
			;
	}

	private _executeConstructPatterns<T extends object>( uri:string, requestOptions:RequestOptions, queryContext:QueryContext, targetName:string, constructPatterns:PatternToken[], targetDocument?:T & Document ):Promise<(T & Document)[]> {
		const queryMetadata:VariableToken = queryContext.getVariable( "queryMetadata" );
		const accessPointsMetadata:VariableToken = queryContext.getVariable( "accessPointsMetadata" );
		const construct:ConstructToken = new ConstructToken()
			.addTriple( new SubjectToken( queryMetadata )
				.addPredicate( new PredicateToken( "a" )
					.addObject( queryContext.compactIRI( C.VolatileResource ) )
					.addObject( queryContext.compactIRI( C.QueryMetadata ) )
				)
				.addPredicate( new PredicateToken( queryContext.compactIRI( C.target ) )
					.addObject( queryContext.getVariable( targetName ) )
				)
			)
			.addPattern( new BindToken( "BNODE()", queryMetadata ) )
			// TODO: Make GroupGraphToken in `sparqler`
			.addPattern( `{ ${ new BindToken( "BNODE()", accessPointsMetadata ) } }` as any )
			.addPattern( ...constructPatterns );

		const query:QueryToken = new QueryToken( construct )
			.addPrologues( ...queryContext.getPrologues() );

		const accessPointsTriple:SubjectToken = new SubjectToken( accessPointsMetadata )
			.addPredicate( new PredicateToken( "a" )
				.addObject( queryContext.compactIRI( C.VolatileResource ) )
				.addObject( queryContext.compactIRI( C.AccessPointsMetadata ) )
			);
		construct.addTriple( accessPointsTriple );

		getResourcesVariables( constructPatterns )
			.forEach( resource => {
				const name:string = resource.name.replace( /__/g, "." );
				const accessPoints:VariableToken = queryContext.getVariable( name + ".accessPoints" );
				const relation:VariableToken = queryContext.getVariable( name + ".accessPoints.hasMemberRelation" );

				construct
					.addPattern( new OptionalToken()
						.addPattern( new SubjectToken( resource )
							.addPredicate( new PredicateToken( queryContext.compactIRI( C.accessPoint ) )
								.addObject( accessPoints )
							)
						)
						.addPattern( new SubjectToken( accessPoints )
							.addPredicate( new PredicateToken( queryContext.compactIRI( LDP.hasMemberRelation ) )
								.addObject( relation )
							)
						)
					);

				accessPointsTriple
					.addPredicate( new PredicateToken( relation )
						.addObject( accessPoints ) );
			} );

		const triples:SubjectToken[] = getAllTriples( constructPatterns );
		construct.addTriple( ...triples );

		RequestUtils.setRetrievalPreferences( { include: [ C.PreferResultsContext ] }, requestOptions );

		return this
			.executeRawCONSTRUCTQuery( uri, query.toString(), requestOptions )
			.then( ( jsonldString ) => {
				return new JSONLDParser().parse( jsonldString );

			} ).then<(T & Document)[]>( ( rdfNodes:RDFNode[] ) => {
				const targetETag:string = targetDocument && targetDocument._eTag;
				if( targetDocument ) targetDocument._eTag = void 0;

				const freeResources:TransientResource[] = this
					._getFreeResources( RDFNode.getFreeNodes( rdfNodes ) )
					.getResources()
				;

				freeResources
					.filter( ResponseMetadata.is )
					.map<DocumentMetadata[] | DocumentMetadata>( responseMetadata => responseMetadata.documentsMetadata || responseMetadata[ C.documentMetadata ] )
					.map<DocumentMetadata[]>( documentsMetadata => Array.isArray( documentsMetadata ) ? documentsMetadata : [ documentsMetadata ] )
					.forEach( documentsMetadata => documentsMetadata.forEach( documentMetadata => {
						if( ! documentMetadata ) return;

						const relatedDocument:Document = documentMetadata.relatedDocument || documentMetadata[ C.relatedDocument ];
						const eTag:string = documentMetadata.eTag || documentMetadata[ C.eTag ];

						if( ! eTag ) return;
						relatedDocument._resolved = true;

						if( relatedDocument._eTag === void 0 ) relatedDocument._eTag = eTag;
						if( relatedDocument._eTag !== eTag ) relatedDocument._eTag = null;
					} ) );

				if( targetDocument && targetETag === targetDocument._eTag )
					return [ targetDocument ];

				const rdfDocuments:RDFDocument[] = rdfNodes
					.filter<any>( RDFDocument.is );

				const targetSet:Set<string> = new Set( freeResources
					.filter( QueryMetadata.is )
					.map( x => this.context ? x.target : x[ C.target ] )
					// Alternative to flatMap
					.reduce( ( targets, currentTargets ) => targets.concat( currentTargets ), [] )
					.map( x => x.id )
				);
				const targetDocuments:RDFDocument[] = rdfDocuments
					.filter( x => targetSet.has( x[ "@id" ] ) );

				const documents:(T & Document)[] = new JSONLDCompacter( this, targetName, queryContext )
					.compactDocuments( rdfDocuments, targetDocuments );

				const accessPointsMetadatas:AccessPointsMetadata[] = freeResources
					.filter( AccessPointsMetadata.is );
				this._applyAccessPointsMetadatas( accessPointsMetadatas );

				return documents;
			} );
	}


	private _persistChildDocument<T extends object>( parentURI:string, childObject:T, slug:string, requestOptions:RequestOptions ):Promise<T & ProtectedDocument> {
		if( Document.is( childObject ) ) throw new Errors.IllegalArgumentError( "The child provided has been already persisted." );
		let childDocument:T & TransientDocument = TransientDocument.is( childObject ) ? <T & TransientDocument> childObject : TransientDocument.createFrom<T>( childObject );

		this._setDefaultRequestOptions( requestOptions, LDP.Container );
		return this._persistDocument<T & TransientDocument, ProtectedDocument>( parentURI, slug, childDocument, requestOptions );
	}

	private _persistAccessPoint<T extends object>( documentURI:string, accessPoint:T & BaseAccessPoint, slug:string, requestOptions:RequestOptions ):Promise<T & AccessPoint> {
		if( Document.is( accessPoint ) ) throw new Errors.IllegalArgumentError( "The access-point provided has been already persisted." );

		const accessPointDocument:T & TransientAccessPoint = TransientAccessPoint.is( accessPoint ) ?
			accessPoint : TransientAccessPoint.createFrom<T>( accessPoint );

		if( ! accessPointDocument.membershipResource ) accessPointDocument.membershipResource = this.getPointer( documentURI );
		else if( accessPointDocument.membershipResource.id !== documentURI ) throw new Errors.IllegalArgumentError( "The documentURI must be the same as the accessPoint's membershipResource." );

		this._setDefaultRequestOptions( requestOptions, LDP.RDFSource );
		return this._persistDocument<T & TransientAccessPoint, AccessPoint>( documentURI, slug, accessPointDocument, requestOptions );
	}

	private _persistDocument<T extends TransientDocument, W extends ProtectedDocument>( parentURI:string, slug:string, document:T, requestOptions:RequestOptions ):Promise<T & W> {
		RequestUtils.setContentTypeHeader( "application/ld+json", requestOptions );

		if( document.id ) {
			let childURI:string = document.id;
			if( ! ! this.context ) childURI = this.context.resolve( childURI );
			if( ! URI.isBaseOf( parentURI, childURI ) ) {
				return Promise.reject( new Errors.IllegalArgumentError( "The document's URI is not relative to the parentURI specified" ) );
			}
		}

		if( document[ "__CarbonSDK_InProgressOfPersisting" ] ) return Promise.reject( new Errors.IllegalArgumentError( "The document is already being persisted." ) );
		Object.defineProperty( document, "__CarbonSDK_InProgressOfPersisting", { configurable: true, enumerable: false, writable: false, value: true } );

		let body:string = JSON.stringify( document.toJSON( this, this.jsonldConverter ) );

		if( ! ! slug ) RequestUtils.setSlug( slug, requestOptions );

		return this
			._sendRequest( HTTPMethod.POST, parentURI, requestOptions, body )
			.then<T & W>( ( response:Response ) => {
				delete document[ "__CarbonSDK_InProgressOfPersisting" ];

				let locationHeader:Header = response.getHeader( "Location" );
				if( locationHeader === null || locationHeader.values.length < 1 ) throw new BadResponseError( "The response is missing a Location header.", response );
				if( locationHeader.values.length !== 1 ) throw new BadResponseError( "The response contains more than one Location header.", response );

				const localID:string = this._getPointerID( locationHeader.values[ 0 ].toString() );
				this.pointers.set( localID, this._createPointerFrom( document, localID ) );

				const persistedDocument:T & W & ProtectedDocument = <T & W & ProtectedDocument> ProtectedDocument.decorate<T>( document, this );
				persistedDocument.getFragments().forEach( Fragment.decorate );

				return this._applyResponseData( persistedDocument, response );
			} ).catch( ( error ) => {
				delete document[ "__CarbonSDK_InProgressOfPersisting" ];
				return Promise.reject( error );
			} );
	}


	private _getRDFDocument( requestURL:string, rdfDocuments:RDFDocument[], response:Response ):RDFDocument {
		rdfDocuments = rdfDocuments.filter( ( rdfDocument:RDFDocument ) => rdfDocument[ "@id" ] === requestURL );

		if( rdfDocuments.length > 1 ) throw new BadResponseError( "Several documents share the same id.", response );

		return rdfDocuments.length > 0 ? rdfDocuments[ 0 ] : null;
	}


	private _getPointerID( uri:string ):string {
		if( URI.isBNodeID( uri ) ) throw new Errors.IllegalArgumentError( "BNodes cannot be fetched directly." );
		// TODO: Make named fragments independently resolvable
		/*
			if( URI.Util.hasFragment( uri ) ) throw new Errors.IllegalArgumentError( "Fragment URI's cannot be fetched directly." );
		*/

		if( ! ! this.context ) {
			uri = ObjectSchemaUtils.resolveURI( uri, this.getGeneralSchema() );

			if( ! URI.isRelative( uri ) ) {
				const baseURI:string = this.context.baseURI;
				if( ! URI.isBaseOf( baseURI, uri ) ) return null;

				return uri.substring( baseURI.length );
			} else {
				return uri[ 0 ] === "/" ? uri.substr( 1 ) : uri;
			}
		} else {
			if( URI.isPrefixed( uri ) ) throw new Errors.IllegalArgumentError( "This Documents instance doesn't support prefixed URIs." );
			if( URI.isRelative( uri ) ) throw new Errors.IllegalArgumentError( "This Documents instance doesn't support relative URIs." );
			return uri;
		}
	}

	private _createPointer( localID:string ):Pointer {
		return this._createPointerFrom( {}, localID );
	}

	private _createPointerFrom<T extends object>( object:T, localID:string ):T & Pointer {
		const pointer:T & Pointer = Pointer.createFrom<T>( object );
		pointer.id = this.context ? this.context.resolve( localID ) : localID;

		const resolve:Pointer[ "resolve" ] = <W extends object>( requestOptionsOrQueryBuilderFn?:GETOptions | (( queryBuilder:QueryDocumentBuilder ) => QueryDocumentBuilder), queryBuilderFn?:( queryBuilder:QueryDocumentBuilder ) => QueryDocumentBuilder ):Promise<W & T & Document> => {
			let requestOptions:GETOptions;
			if( Utils.isFunction( requestOptionsOrQueryBuilderFn ) ) {
				requestOptions = {};
				queryBuilderFn = requestOptionsOrQueryBuilderFn;
			} else {
				requestOptions = requestOptionsOrQueryBuilderFn;
			}

			if( queryBuilderFn && "types" in pointer ) {
				const resource:TransientResource = pointer as TransientResource;
				const superQueryBuilderFn:typeof queryBuilderFn = queryBuilderFn;
				queryBuilderFn = _ => {
					resource.types.forEach( type => _.withType( type ) );
					return superQueryBuilderFn.call( void 0, _ );
				};
			}

			return this.get( pointer.id, requestOptions, queryBuilderFn );
		};

		Object.defineProperty( pointer, "resolve", {
			writable: false,
			enumerable: false,
			configurable: true,
			value: resolve,
		} );

		return pointer;
	}


	private _compact( expandedObjects:Object[], targetObjects:Object[], pointerLibrary:PointerLibrary ):Object[];
	private _compact( expandedObject:Object, targetObject:Object, pointerLibrary:PointerLibrary ):Object;
	private _compact( expandedObjectOrObjects:any, targetObjectOrObjects:any, pointerLibrary:PointerLibrary ):any {
		if( ! Utils.isArray( expandedObjectOrObjects ) ) return this._compactSingle( expandedObjectOrObjects, targetObjectOrObjects, pointerLibrary );

		let expandedObjects:Object[] = expandedObjectOrObjects;
		let targetObjects:Object[] = ! ! targetObjectOrObjects ? targetObjectOrObjects : [];
		for( let i:number = 0, length:number = expandedObjects.length; i < length; i ++ ) {
			let expandedObject:Object = expandedObjects[ i ];
			let targetObject:Object = targetObjects[ i ] = ! ! targetObjects[ i ] ? targetObjects[ i ] : {};

			this._compactSingle( expandedObject, targetObject, pointerLibrary );
		}

		return targetObjects;
	}

	private _compactSingle( expandedObject:Object, targetObject:Object, pointerLibrary:PointerLibrary ):Object {
		let digestedSchema:DigestedObjectSchema = this._getDigestedObjectSchemaForExpandedObject( expandedObject );

		return this.jsonldConverter.compact( expandedObject, targetObject, digestedSchema, pointerLibrary );
	}


	private _getDigestedObjectSchemaForExpandedObject( expandedObject:Object ):DigestedObjectSchema {
		let types:string[] = RDFNode.getTypes( <any> expandedObject );

		return this._getDigestedObjectSchema( types, expandedObject[ "@id" ] );
	}

	private _getDigestedObjectSchemaForDocument( document:TransientDocument ):DigestedObjectSchema {
		if( Resource.isDecorated( document ) && document.isPartial() ) {
			const schemas:DigestedObjectSchema[] = [ document._partialMetadata.schema ];
			return this._getProcessedSchema( schemas );
		} else {
			const types:string[] = document.types || [];
			return this._getDigestedObjectSchema( types, document.id );
		}
	}

	private _getDigestedObjectSchema( objectTypes:string[], objectID:string ):DigestedObjectSchema {
		if( ! this.context ) return new DigestedObjectSchema();

		if(
			Utils.isDefined( objectID ) &&
			! URI.hasFragment( objectID ) &&
			! URI.isBNodeID( objectID ) &&
			objectTypes.indexOf( TransientDocument.TYPE ) === - 1
		)
			objectTypes = objectTypes.concat( TransientDocument.TYPE );

		const schemas:DigestedObjectSchema[] = objectTypes
			.filter( type => this.context.hasObjectSchema( type ) )
			.map( type => this.context.getObjectSchema( type ) )
		;

		return this._getProcessedSchema( schemas );
	}

	private _getProcessedSchema( objectSchemas:DigestedObjectSchema[] = [] ):DigestedObjectSchema {
		objectSchemas.unshift( this.context.getObjectSchema() );
		return ObjectSchemaDigester
			.combineDigestedObjectSchemas( objectSchemas );
	}


	private _getRequestURI( uri:string ):string {
		if( URI.isBNodeID( uri ) ) {
			throw new Errors.IllegalArgumentError( "BNodes cannot be fetched directly." );
		} else if( URI.isPrefixed( uri ) ) {
			if( ! this.context ) throw new Errors.IllegalArgumentError( "This Documents instance doesn't support prefixed URIs." );
			uri = ObjectSchemaUtils.resolveURI( uri, this.context.getObjectSchema() );
			if( URI.isPrefixed( uri ) ) throw new Errors.IllegalArgumentError( `The prefixed URI "${ uri }" could not be resolved.` );
		} else if( URI.isRelative( uri ) ) {
			if( ! this.context ) throw new Errors.IllegalArgumentError( "This Documents instance doesn't support relative URIs." );
			uri = this.context.resolve( uri );
		} else if( this.context && ! URI.isBaseOf( this.context.baseURI, uri ) ) {
			throw new Errors.IllegalArgumentError( `"${ uri }" isn't a valid URI for this Carbon instance.` );
		}
		return uri;
	}

	private _setDefaultRequestOptions( requestOptions:RequestOptions, interactionModel?:string ):RequestOptions {
		if( this.context && this.context.auth && this.context.auth.isAuthenticated() ) this.context.auth.addAuthentication( requestOptions );
		if( interactionModel ) RequestUtils.setPreferredInteractionModel( interactionModel, requestOptions );

		RequestUtils.setAcceptHeader( "application/ld+json", requestOptions );

		return requestOptions;
	}

	private _updateFromPreferenceApplied<T extends object>( persistedDocument:T & Document, rdfDocuments:RDFDocument[], response:Response ):T {
		const eTag:string = response.getETag();
		if( eTag === null ) throw new BadResponseError( "The response doesn't contain an ETag", response );

		const rdfDocument:RDFDocument = this._getRDFDocument( persistedDocument.id, rdfDocuments, response );
		if( rdfDocument === null ) throw new BadResponseError( "No document was returned.", response );

		persistedDocument = this._convertRDFDocument<T>( rdfDocument, response );
		persistedDocument._eTag = eTag;

		return persistedDocument;
	}

	private _parseMembers( pointers:(string | Pointer)[] ):Pointer[] {
		return pointers.map( pointer => {
			if( Utils.isString( pointer ) ) return this.getPointer( pointer );
			if( Pointer.is( pointer ) ) return pointer;

			throw new Errors.IllegalArgumentError( "No CarbonLDP.Pointer or URI provided." );
		} );
	}

	private _applyResponseData<T extends Document>( persistedProtectedDocument:T, response:Response ):T | Promise<T> {
		if( response.status === 204 || ! response.data ) return persistedProtectedDocument;

		return new JSONLDParser()
			.parse( response.data )
			.then<T>( ( expandedResult:object[] ) => {
				const freeNodes:RDFNode[] = RDFNode.getFreeNodes( expandedResult );
				this._applyNodeMap( freeNodes );

				const preferenceHeader:Header = response.getHeader( "Preference-Applied" );
				if( preferenceHeader === null || preferenceHeader.toString() !== "return=representation" ) return persistedProtectedDocument;

				const rdfDocuments:RDFDocument[] = RDFDocument.getDocuments( expandedResult );
				return this._updateFromPreferenceApplied<T>( persistedProtectedDocument, rdfDocuments, response );
			} );
	}

	private _applyNodeMap( freeNodes:RDFNode[] ):void {
		if( ! freeNodes.length ) return;
		const freeResources:FreeResources = this._getFreeResources( freeNodes );
		const responseMetadata:ResponseMetadata = <ResponseMetadata> freeResources.getResources().find( ResponseMetadata.is );

		for( const documentMetadata of responseMetadata.documentsMetadata ) {
			const document:Document = documentMetadata.relatedDocument as Document;
			for( const { entryKey, entryValue } of documentMetadata.bNodesMap.entries ) {
				const originalBNode:BlankNode = document.getFragment( entryKey.id );
				originalBNode.id = entryValue.id;

				document._fragmentsIndex.delete( entryKey.id );
				document._fragmentsIndex.set( entryValue.id, originalBNode );
			}
			document._syncSavedFragments();
		}
	}

	private _applyAccessPointsMetadatas( accessPointsMetadatas:AccessPointsMetadata[] ):void {
		if( ! accessPointsMetadatas.length ) return;

		const getResourcesData:( resourceURI:string ) => MembershipResourceData = this
			._createMembershipResourceDataGetter();

		accessPointsMetadatas.forEach( metadata => {
			const relationURIs:string[] = Object.keys( metadata );

			relationURIs.forEach( relationURI => {
				const pointers:Pointer[] = Array.isArray( metadata[ relationURI ] ) ?
					metadata[ relationURI ] : [ metadata[ relationURI ] ];

				const compactRelation:( schema:DigestedObjectSchema, uris:Map<string, string> ) => string = ( schema, uris ) => {
					if( uris.has( relationURI ) ) return uris.get( relationURI );
					if( schema.vocab ) return URI.getRelativeURI( relationURI, schema.vocab );

					return relationURI;
				};

				pointers.forEach( pointer => {
					const resourceURI:string = pointer.id
						.split( "/" )
						.slice( 0, - 2 )
						.concat( "" )
						.join( "/" );

					const { resource, schema, uris } = getResourcesData( resourceURI );
					const relationName:string = compactRelation( schema, uris );

					const accessPoint:AccessPoint = ProtectedDocument
						.decorate( pointer, this );

					Object.defineProperty( resource, "$" + relationName, {
						enumerable: false,
						configurable: true,
						value: accessPoint,
					} );
				} );
			} );
		} );
	}

	private _createMembershipResourceGetter():( resourceURI:string ) => Document {
		const resources:Map<string, Document> = new Map();
		return resourceURI => {
			if( resources.has( resourceURI ) ) return resources.get( resourceURI );
			const resource:Document = this.register( resourceURI );

			// Delete existing access points
			Object
				.getOwnPropertyNames( resource )
				.filter( key => key.startsWith( "$" ) )
				.filter( key => ! resource.propertyIsEnumerable( key ) )
				.forEach( key => delete resource[ key ] )
			;

			resources.set( resourceURI, resource );
			return resource;
		};
	}

	private _createMembershipResourceDataGetter():( resourceURI:string ) => MembershipResourceData {
		const getResource:( resourceURI:string ) => Document = this
			._createMembershipResourceGetter();

		const resourcesData:Map<string, MembershipResourceData> = new Map();
		return resourceURI => {
			if( resourcesData.has( resourceURI ) ) return resourcesData.get( resourceURI );
			const resource:Document = getResource( resourceURI );

			const schema:DigestedObjectSchema = this._getDigestedObjectSchema( resource.types, resource.id );
			if( resource.isPartial() ) ObjectSchemaDigester._combineSchemas( [ schema, resource._partialMetadata.schema ] );

			const uris:Map<string, string> = JSONLDConverter.getPropertyURINameMap( schema );

			const resourceData:MembershipResourceData = {
				resource,
				schema,
				uris,
			};

			resourcesData.set( resourceURI, resourceData );
			return resourceData;
		};
	}

	private _sendRequest( method:HTTPMethod, uri:string, options:RequestOptions, body?:string | Blob | Buffer ):Promise<Response>;
	private _sendRequest<T extends object>( method:HTTPMethod, uri:string, options:RequestOptions, body?:string | Blob | Buffer, parser?:Parser<T> ):Promise<[ T, Response ]>;
	private _sendRequest( method:HTTPMethod, uri:string, options:RequestOptions, body?:string | Blob | Buffer, parser?:Parser<any> ):any {
		return RequestService.send( method, uri, body || null, options, parser )
			.catch( this._parseErrorResponse.bind( this ) );
	}
}


type MembershipResourceData = { resource:Resource, schema:DigestedObjectSchema, uris:Map<string, string> };

const emptyQueryBuildFn:( queryBuilder:QueryDocumentsBuilder ) => QueryDocumentsBuilder = _ => _;
