import {
	ACL,
	CompleteACReport,
	DetailedUserACReport,
	SimpleUserACReport
} from "../Auth";
import { ModelDecorator } from "../core/ModelDecorator";
import { ModelFactory } from "../core/ModelFactory";
import { ModelSchema } from "../core/ModelSchema";
import { Document } from "../Document";
import { Documents } from "../Documents";
import {
	RequestOptions,
	RequestService,
	RequestUtils,
	Response
} from "../HTTP";
import { BadResponseError } from "../HTTP/Errors/ServerErrors";
import { JSONLDParser } from "../JSONLD";
import { ObjectSchema } from "../ObjectSchema";
import { Pointer } from "../Pointer";
import {
	RDFNode,
	URI
} from "../RDF";
import { TransientResource } from "../Resource";
import * as Utils from "../Utils";
import {
	isObject,
	isString
} from "../Utils";
import {
	C,
	CS,
	LDP
} from "../Vocabularies";
import {
	TransientProtectedDocument,
	TransientProtectedDocumentFactory,
} from "./TransientProtectedDocument";


export interface ProtectedDocument extends Document {
	accessControlList?:Pointer;

	creator?:Pointer;
	owners?:Pointer;


	getACL( requestOptions?:RequestOptions ):Promise<ACL>;


	getSimpleUserACReport( requestOptions?:RequestOptions ):Promise<SimpleUserACReport>;
	getSimpleUserACReport( uri:string, requestOptions?:RequestOptions ):Promise<SimpleUserACReport>;

	getDetailedUserACReport( requestOptions?:RequestOptions ):Promise<DetailedUserACReport>;
	getDetailedUserACReport( uri:string, requestOptions?:RequestOptions ):Promise<DetailedUserACReport>;

	getCompleteACReport( requestOptions?:RequestOptions ):Promise<CompleteACReport>;
	getCompleteACReport( uri:string, requestOptions?:RequestOptions ):Promise<CompleteACReport>;
}


export interface ProtectedDocumentFactory extends ModelDecorator<ProtectedDocument>, TransientProtectedDocumentFactory {
	SCHEMA:ObjectSchema;


	isDecorated( object:object ):object is ProtectedDocument;

	is( object:object ):object is ProtectedDocument;


	decorate<T extends object>( object:T, documents:Documents ):T & ProtectedDocument;
}

export const ProtectedDocument:ProtectedDocumentFactory = {
	TYPE: TransientProtectedDocument.TYPE,
	SCHEMA: {
		"accessControlList": {
			"@id": CS.accessControlList,
			"@type": "@id",
		},
		"creator": {
			"@id": CS.creator,
			"@type": "@id",
		},
		"owners": {
			"@id": CS.owner,
			"@type": "@id",
			"@container": "@set",
		},
	},

	isDecorated( object:object ):object is ProtectedDocument {
		return Utils.isObject( object )
			&& Utils.hasFunction( object, "getACL" )
			;
	},

	is( object:object ):object is ProtectedDocument {
		return ProtectedDocument.isDecorated( object )
			&& Document.is( object )
			;
	},

	decorate<T extends object>( object:T, documents:Documents ):T & ProtectedDocument {
		if( ProtectedDocument.isDecorated( object ) ) return object;

		Document.decorate( object, documents );

		const persistedProtectedDocument:T & ProtectedDocument = object as T & ProtectedDocument;
		Object.defineProperties( persistedProtectedDocument, {
			"getACL": {
				writable: false,
				enumerable: false,
				configurable: true,
				value: getACL,
			},

			"getSimpleUserACReport": {
				writable: false,
				enumerable: false,
				configurable: true,
				value: getSimpleUserACReport,
			},
			"getDetailedUserACReport": {
				writable: false,
				enumerable: false,
				configurable: true,
				value: getDetailedUserACReport,
			},
			"getCompleteACReport": {
				writable: false,
				enumerable: false,
				configurable: true,
				value: getCompleteACReport,
			},
		} );

		return persistedProtectedDocument;
	},
};


function getACL( this:ProtectedDocument, requestOptions:RequestOptions ):Promise<ACL> {
	if( this.accessControlList ) return this._documents.get( this.accessControlList.id, requestOptions );

	return this.resolve( _ => _
		.withType( CS.ProtectedDocument )
		.properties( {
			accessControlList: {
				"query": __ => __
					.properties( __.full ),
			},
		} )
	).then( () => {
		return this.accessControlList as ACL;
	} );
}


function addDefaultRequestOptions( this:void, documents:Documents, requestOptions:RequestOptions ):void {
	if( documents[ "context" ] && documents[ "context" ].auth )
		documents[ "context" ].auth.addAuthentication( requestOptions );

	RequestUtils.setAcceptHeader( "application/ld+json", requestOptions );
	RequestUtils.setRetrievalPreferences( { include: [ C.PreferMinimalDocument ] }, requestOptions );
	RequestUtils.setPreferredInteractionModel( LDP.RDFSource, requestOptions );
}

function parseParams( this:void, resource:Pointer, uriOrOptions?:string | RequestOptions, requestOptions?:RequestOptions ):{ url:string, options:RequestOptions } {
	const uri:string | undefined = isString( uriOrOptions ) ? uriOrOptions : void 0;
	const url:string = uri ? URI.resolve( resource.id, uri ) : resource.id;

	const options:RequestOptions = isObject( uriOrOptions ) ? uriOrOptions :
		requestOptions ? requestOptions : {};

	return { url, options };
}

function makeMinimalGET( this:void, documents:Documents, url:string, options:RequestOptions ):Promise<[ object[], Response ]> {
	addDefaultRequestOptions( documents, options );

	return RequestService
		.get( url, options, new JSONLDParser() )
		.catch( error => documents._parseErrorResponse( error ) )
		;
}

function getReport<T extends TransientResource>( this:void, reportFactory:ModelSchema & Pick<ModelFactory<T>, "is">, documents:Documents, rdfData:object[], response:Response ):T {
	const freeNodes:RDFNode[] = RDFNode.getFreeNodes( rdfData );

	const acReport:T | undefined = documents
		._getFreeResources( freeNodes )
		.getResources()
		.find<T>( reportFactory.is )
	;

	if( ! acReport )
		throw new BadResponseError( `Expecting a ${ reportFactory.TYPE }, none has returned.`, response );

	return acReport;
}

function getSimpleUserACReport( this:ProtectedDocument, uriOrOptions?:string | RequestOptions, requestOptions?:RequestOptions ):Promise<SimpleUserACReport> {
	const { url, options } = parseParams( this, uriOrOptions, requestOptions );

	RequestUtils.setRetrievalPreferences( { include: [ CS.PreferSimpleUserACReport ] }, options );

	return makeMinimalGET( this._documents, url, options )
		.then( ( [ rdfData, response ] ) => getReport( SimpleUserACReport, this._documents, rdfData, response ) )
		;
}

function getDetailedUserACReport( this:ProtectedDocument, uriOrOptions?:string | RequestOptions, requestOptions?:RequestOptions ):Promise<DetailedUserACReport> {
	const { url, options } = parseParams( this, uriOrOptions, requestOptions );

	RequestUtils.setRetrievalPreferences( { include: [ CS.PreferDetailedUserACReport ] }, options );

	return makeMinimalGET( this._documents, url, options )
		.then( ( [ rdfData, response ] ) => getReport( DetailedUserACReport, this._documents, rdfData, response ) )
		;
}

function getCompleteACReport( this:ProtectedDocument, uriOrOptions?:string | RequestOptions, requestOptions?:RequestOptions ):Promise<CompleteACReport> {
	const { url, options } = parseParams( this, uriOrOptions, requestOptions );

	RequestUtils.setRetrievalPreferences( { include: [ CS.PreferCompleteACReport ] }, options );

	return makeMinimalGET( this._documents, url, options )
		.then( ( [ rdfData, response ] ) => getReport( CompleteACReport, this._documents, rdfData, response ) )
		;
}
