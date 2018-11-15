import { QueryClause } from "sparqler/clauses";

import {
	AccessPoint,
	BaseAccessPoint,
} from "../AccessPoint";
import { ModelDecorator } from "../core/ModelDecorator";
import { ModelSchema } from "../core/ModelSchema";
import { Documents } from "../Documents";
import {
	Fragment,
	TransientFragment,
} from "../Fragment";
import {
	GETOptions,
	RequestOptions,
	RequestUtils,
} from "../HTTP";
import { MessagingDocument } from "../Messaging";
import {
	NamedFragment,
	TransientNamedFragment,
} from "../NamedFragment";
import {
	DigestedObjectSchema,
	ObjectSchemaUtils,
} from "../ObjectSchema";
import { Pointer } from "../Pointer";
import { ProtectedDocument } from "../ProtectedDocument";
import { URI } from "../RDF";
import { Resource } from "../Resource";
import { ServiceAwareDocument } from "../ServiceAwareDocument";
import {
	FinishSPARQLSelect,
	SPARQLRawResults,
	SPARQLSelectResults,
} from "../SPARQL";
import {
	QueryDocumentBuilder,
	QueryDocumentsBuilder,
} from "../SPARQL/QueryDocument";
import * as Utils from "../Utils";
import {
	C,
	LDP,
	XSD,
} from "../Vocabularies";
import { BaseDocument } from "./BaseDocument";
import { TransientDocument } from "./TransientDocument";


export interface Document extends TransientDocument, Resource, ServiceAwareDocument, MessagingDocument {
	created?:Date;
	modified?:Date;
	defaultInteractionModel?:Pointer;
	accessPoints?:Pointer[];
	hasMemberRelation?:Pointer;
	isMemberOfRelation?:Pointer;
	contains?:Pointer[];

	_eTag:string;
	_fragmentsIndex:Map<string, Fragment>;
	_savedFragments:Fragment[];

	_syncSavedFragments():void;


	isLocallyOutDated():boolean;


	getFragment<T extends object>( slug:string ):T & Fragment;

	getNamedFragment<T extends object>( slug:string ):T & NamedFragment;

	getFragments():Fragment[];


	createFragment( slug?:string ):Fragment;

	createFragment<T extends object>( object:T ):Fragment & T;

	createFragment<T extends object>( object:T, slug:string ):Fragment & T;


	createNamedFragment( slug:string ):NamedFragment;

	createNamedFragment<T extends object>( object:T, slug:string ):NamedFragment & T;


	refresh<T extends object>( requestOptions?:RequestOptions ):Promise<T & this>;

	save<T extends object>( requestOptions?:RequestOptions ):Promise<T & this>;

	saveAndRefresh<T extends object>( requestOptions?:RequestOptions ):Promise<T & this>;


	delete( requestOptions?:RequestOptions ):Promise<void>;


	addMember( member:Pointer, requestOptions?:RequestOptions ):Promise<void>;

	addMember( memberURI:string, requestOptions?:RequestOptions ):Promise<void>;

	addMembers( members:(Pointer | string)[], requestOptions?:RequestOptions ):Promise<void>;


	createChild<T extends object>( object:T, slug:string, requestOptions?:RequestOptions ):Promise<T & ProtectedDocument>;

	createChild<T extends object>( object:T, requestOptions?:RequestOptions ):Promise<T & ProtectedDocument>;

	createChild( slug:string, requestOptions?:RequestOptions ):Promise<ProtectedDocument>;

	createChild( requestOptions?:RequestOptions ):Promise<ProtectedDocument>;


	createChildren<T extends object>( objects:T[], slugs:string[], requestOptions?:RequestOptions ):Promise<(T & ProtectedDocument)[]>;

	createChildren<T extends object>( objects:T[], requestOptions?:RequestOptions ):Promise<(T & ProtectedDocument)[]>;


	createChildAndRetrieve<T extends object>( object:T, slug:string, requestOptions?:RequestOptions ):Promise<T & ProtectedDocument>;

	createChildAndRetrieve<T extends object>( object:T, requestOptions?:RequestOptions ):Promise<T & ProtectedDocument>;

	createChildAndRetrieve( slug:string, requestOptions?:RequestOptions ):Promise<ProtectedDocument>;

	createChildAndRetrieve( requestOptions?:RequestOptions ):Promise<ProtectedDocument>;


	createChildrenAndRetrieve<T extends object>( objects:T[], slugs:string[], requestOptions?:RequestOptions ):Promise<(T & ProtectedDocument)[]>;

	createChildrenAndRetrieve<T extends object>( objects:T[], requestOptions?:RequestOptions ):Promise<(T & ProtectedDocument)[]>;


	createAccessPoint<T extends object>( accessPoint:T & BaseAccessPoint, slug?:string, requestOptions?:RequestOptions ):Promise<T & AccessPoint>;

	createAccessPoint<T extends object>( accessPoint:T & BaseAccessPoint, requestOptions?:RequestOptions ):Promise<T & AccessPoint>;


	createAccessPoints<T extends object>( accessPoints:(T & BaseAccessPoint)[], slugs?:string[], requestOptions?:RequestOptions ):Promise<(T & AccessPoint)[]>;

	createAccessPoints<T extends object>( accessPoints:(T & BaseAccessPoint)[], requestOptions?:RequestOptions ):Promise<(T & AccessPoint)[]>;


	listChildren<T extends object>( requestOptions?:RequestOptions ):Promise<(T & Document)[]>;


	getChildren<T extends object>( requestOptions?:RequestOptions, queryBuilderFn?:( queryBuilder:QueryDocumentsBuilder ) => QueryDocumentsBuilder ):Promise<(T & Document)[]>;

	getChildren<T extends object>( queryBuilderFn?:( queryBuilder:QueryDocumentsBuilder ) => QueryDocumentsBuilder ):Promise<(T & Document)[]>;


	listMembers<T extends object>( requestOptions?:RequestOptions ):Promise<(T & Document)[]>;


	getMembers<T extends object>( requestOptions?:RequestOptions, queryBuilderFn?:( queryBuilder:QueryDocumentsBuilder ) => QueryDocumentsBuilder ):Promise<(T & Document)[]>;

	getMembers<T extends object>( queryBuilderFn?:( queryBuilder:QueryDocumentsBuilder ) => QueryDocumentsBuilder ):Promise<(T & Document)[]>;


	removeMember( member:Pointer, requestOptions?:RequestOptions ):Promise<void>;

	removeMember( memberURI:string, requestOptions?:RequestOptions ):Promise<void>;

	removeMembers( members:(Pointer | string)[], requestOptions?:RequestOptions ):Promise<void>;

	removeAllMembers( requestOptions?:RequestOptions ):Promise<void>;


	executeRawASKQuery( askQuery:string, requestOptions?:RequestOptions ):Promise<SPARQLRawResults>;

	executeASKQuery( askQuery:string, requestOptions?:RequestOptions ):Promise<boolean>;

	executeRawSELECTQuery( selectQuery:string, requestOptions?:RequestOptions ):Promise<SPARQLRawResults>;

	executeSELECTQuery<T extends object>( selectQuery:string, requestOptions?:RequestOptions ):Promise<SPARQLSelectResults<T>>;

	executeRawSELECTQuery( selectQuery:string, requestOptions?:RequestOptions ):Promise<SPARQLRawResults>;

	executeSELECTQuery<T extends object>( selectQuery:string, requestOptions?:RequestOptions ):Promise<SPARQLSelectResults<T>>;

	executeRawCONSTRUCTQuery( constructQuery:string, requestOptions?:RequestOptions ):Promise<string>;

	executeRawDESCRIBEQuery( describeQuery:string, requestOptions?:RequestOptions ):Promise<string>;

	executeUPDATE( updateQuery:string, requestOptions?:RequestOptions ):Promise<void>;


	sparql():QueryClause<FinishSPARQLSelect>;
}


export interface DocumentFactory extends ModelSchema, ModelDecorator<Document> {
	TYPE:C[ "Document" ];

	is( object:object ):object is Document;

	isDecorated( object:object ):object is Document;


	create<T extends object>( data?:T & BaseDocument ):T & TransientDocument;

	createFrom<T extends object>( object:T & BaseDocument ):T & TransientDocument;

	decorate<T extends object>( object:T, documents:Documents ):T & Document;
}

export const Document:DocumentFactory = {
	TYPE: C.Document,
	SCHEMA: {
		"contains": {
			"@id": LDP.contains,
			"@container": "@set",
			"@type": "@id",
		},
		"members": {
			"@id": LDP.member,
			"@container": "@set",
			"@type": "@id",
		},
		"membershipResource": {
			"@id": LDP.membershipResource,
			"@type": "@id",
		},
		"isMemberOfRelation": {
			"@id": LDP.isMemberOfRelation,
			"@type": "@vocab",
		},
		"hasMemberRelation": {
			"@id": LDP.hasMemberRelation,
			"@type": "@vocab",
		},
		"insertedContentRelation": {
			"@id": LDP.insertedContentRelation,
			"@type": "@id",
		},
		"created": {
			"@id": C.created,
			"@type": XSD.dateTime,
		},
		"modified": {
			"@id": C.modified,
			"@type": XSD.dateTime,
		},
		"defaultInteractionModel": {
			"@id": C.defaultInteractionModel,
			"@type": "@id",
		},
		"accessPoints": {
			"@id": C.accessPoint,
			"@type": "@id",
			"@container": "@set",
		},
	},


	isDecorated( object:object ):object is Document {
		return Utils.hasPropertyDefined( object, "_eTag" )
			&& Utils.hasFunction( object, "isLocallyOutDated" )

			&& Utils.hasFunction( object, "refresh" )
			&& Utils.hasFunction( object, "save" )
			&& Utils.hasFunction( object, "saveAndRefresh" )
			&& Utils.hasFunction( object, "delete" )

			&& Utils.hasFunction( object, "addMember" )
			&& Utils.hasFunction( object, "addMembers" )
			&& Utils.hasFunction( object, "createAccessPoint" )
			&& Utils.hasFunction( object, "createAccessPoints" )
			&& Utils.hasFunction( object, "createChild" )
			&& Utils.hasFunction( object, "createChildren" )
			&& Utils.hasFunction( object, "createChildAndRetrieve" )
			&& Utils.hasFunction( object, "createChildrenAndRetrieve" )
			&& Utils.hasFunction( object, "listChildren" )
			&& Utils.hasFunction( object, "getChildren" )
			&& Utils.hasFunction( object, "listMembers" )
			&& Utils.hasFunction( object, "getMembers" )
			&& Utils.hasFunction( object, "removeMember" )
			&& Utils.hasFunction( object, "removeMembers" )
			&& Utils.hasFunction( object, "removeAllMembers" )

			&& Utils.hasFunction( object, "executeRawASKQuery" )
			&& Utils.hasFunction( object, "executeASKQuery" )
			&& Utils.hasFunction( object, "executeRawSELECTQuery" )
			&& Utils.hasFunction( object, "executeSELECTQuery" )
			&& Utils.hasFunction( object, "executeRawDESCRIBEQuery" )
			&& Utils.hasFunction( object, "executeRawCONSTRUCTQuery" )
			&& Utils.hasFunction( object, "executeUPDATE" )

			&& Utils.hasFunction( object, "sparql" )
			;
	},

	is( object:object ):object is Document {
		return TransientDocument.is( object )
			&& MessagingDocument.isDecorated( object )
			&& Document.isDecorated( object )
			;
	},


	decorate<T extends object>( object:T, documents:Documents ):T & Document {
		if( Document.isDecorated( object ) ) return object;

		TransientDocument.decorate( object );
		Resource.decorate( object );
		ServiceAwareDocument.decorate( object, documents );
		MessagingDocument.decorate( <T & ServiceAwareDocument> object );

		const persistedDocument:T & Document = <T & Document> object;
		return Object.defineProperties( persistedDocument, {
			"_eTag": {
				writable: true,
				enumerable: false,
				configurable: true,
			},
			"isLocallyOutDated": {
				writable: false,
				enumerable: false,
				configurable: true,
				value: isLocallyOutDated,
			},

			"_savedFragments": {
				writable: true,
				enumerable: false,
				configurable: true,
				value: [],
			},
			"_syncSavedFragments": {
				writable: false,
				enumerable: false,
				configurable: true,
				value: syncSavedFragments,
			},

			"addType": {
				writable: false,
				enumerable: false,
				configurable: true,
				value: extendAddType( persistedDocument.addType ),
			},
			"hasType": {
				writable: false,
				enumerable: false,
				configurable: true,
				value: extendHasType( persistedDocument.hasType ),
			},
			"removeType": {
				writable: false,
				enumerable: false,
				configurable: true,
				value: extendRemoveType( persistedDocument.removeType ),
			},

			"hasPointer": {
				writable: false,
				enumerable: false,
				configurable: true,
				value: (():( id:string ) => boolean => {
					let superFunction:( id:string ) => boolean = persistedDocument.hasPointer;
					return function( this:Document, id:string ):boolean {
						id = ObjectSchemaUtils.resolveURI( id, this._documents.getGeneralSchema() );

						if( superFunction.call( this, id ) ) return true;
						return ! URI.isBNodeID( id ) && this._documents.hasPointer( id );
					};
				})(),
			},
			"getPointer": {
				writable: false,
				enumerable: false,
				configurable: true,
				value: (():( id:string ) => Pointer => {
					let superFunction:( id:string ) => Pointer = persistedDocument.getPointer;
					let inScopeFunction:( id:string ) => boolean = persistedDocument.inScope;
					return function( this:Document, id:string ):Pointer {
						id = ObjectSchemaUtils.resolveURI( id, this._documents.getGeneralSchema() );

						if( inScopeFunction.call( this, id ) ) return superFunction.call( this, id );
						return this._documents.getPointer( id );
					};
				})(),
			},
			"inScope": {
				writable: false,
				enumerable: false,
				configurable: true,
				value: (():( idOrPointer:any ) => boolean => {
					let superFunction:( idOrPointer:any ) => boolean = persistedDocument.inScope;
					return function( this:Document, idOrPointer:any ):boolean {
						let id:string = Pointer.is( idOrPointer ) ? idOrPointer.id : idOrPointer;
						id = ObjectSchemaUtils.resolveURI( id, this._documents.getGeneralSchema() );

						if( superFunction.call( this, id ) ) return true;
						return this._documents.inScope( id );
					};
				})(),
			},
			"refresh": {
				writable: false,
				enumerable: false,
				configurable: true,
				value: refresh,
			},
			"save": {
				writable: false,
				enumerable: false,
				configurable: true,
				value: save,
			},
			"saveAndRefresh": {
				writable: false,
				enumerable: false,
				configurable: true,
				value: saveAndRefresh,
			},
			"delete": {
				writable: false,
				enumerable: false,
				configurable: true,
				value: _delete,
			},

			"addMember": {
				writable: false,
				enumerable: false,
				configurable: true,
				value: addMember,
			},
			"addMembers": {
				writable: false,
				enumerable: false,
				configurable: true,
				value: addMembers,
			},

			"createChild": {
				writable: false,
				enumerable: false,
				configurable: true,
				value: createChild,
			},
			"createChildren": {
				writable: false,
				enumerable: false,
				configurable: true,
				value: createChildren,
			},
			"createChildAndRetrieve": {
				writable: false,
				enumerable: false,
				configurable: true,
				value: createChildAndRetrieve,
			},
			"createChildrenAndRetrieve": {
				writable: false,
				enumerable: false,
				configurable: true,
				value: createChildrenAndRetrieve,
			},
			"createAccessPoint": {
				writable: false,
				enumerable: false,
				configurable: true,
				value: createAccessPoint,
			},
			"createAccessPoints": {
				writable: false,
				enumerable: false,
				configurable: true,
				value: createAccessPoints,
			},
			"listChildren": {
				writable: false,
				enumerable: false,
				configurable: true,
				value: listChildren,
			},
			"getChildren": {
				writable: false,
				enumerable: false,
				configurable: true,
				value: getChildren,
			},
			"listMembers": {
				writable: false,
				enumerable: false,
				configurable: true,
				value: listMembers,
			},
			"getMembers": {
				writable: false,
				enumerable: false,
				configurable: true,
				value: getMembers,
			},
			"removeMember": {
				writable: false,
				enumerable: false,
				configurable: true,
				value: removeMember,
			},
			"removeMembers": {
				writable: false,
				enumerable: false,
				configurable: true,
				value: removeMembers,
			},
			"removeAllMembers": {
				writable: false,
				enumerable: false,
				configurable: true,
				value: removeAllMembers,
			},

			"executeRawASKQuery": {
				writable: false,
				enumerable: false,
				configurable: true,
				value: executeRawASKQuery,
			},
			"executeASKQuery": {
				writable: false,
				enumerable: false,
				configurable: true,
				value: executeASKQuery,
			},
			"executeRawSELECTQuery": {
				writable: false,
				enumerable: false,
				configurable: true,
				value: executeRawSELECTQuery,
			},
			"executeSELECTQuery": {
				writable: false,
				enumerable: false,
				configurable: true,
				value: executeSELECTQuery,
			},
			"executeRawCONSTRUCTQuery": {
				writable: false,
				enumerable: false,
				configurable: true,
				value: executeRawCONSTRUCTQuery,
			},
			"executeRawDESCRIBEQuery": {
				writable: false,
				enumerable: false,
				configurable: true,
				value: executeRawDESCRIBEQuery,
			},
			"executeUPDATE": {
				writable: false,
				enumerable: false,
				configurable: true,
				value: executeUPDATE,
			},

			"sparql": {
				writable: false,
				enumerable: false,
				configurable: true,
				value: sparql,
			},

			"createFragment": {
				writable: false,
				enumerable: false,
				configurable: true,
				value: extendCreateFragment( persistedDocument.createFragment ),
			},
			"createNamedFragment": {
				writable: false,
				enumerable: false,
				configurable: true,
				value: extendCreateNamedFragment( persistedDocument.createNamedFragment ),
			},

			// Overwrite Resource.isDirty to take into account fragments state
			"isDirty": {
				writable: false,
				enumerable: false,
				configurable: true,
				value: extendIsDirty( persistedDocument.isDirty ),
			},
			"revert": {
				writable: false,
				enumerable: false,
				configurable: true,
				value: extendRevert( persistedDocument.revert ),
			},
		} );
	},


	create: TransientDocument.create,
	createFrom: TransientDocument.createFrom,
};


function extendIsDirty( superFunction:() => boolean ):() => boolean {
	return function():boolean {
		let isDirty:boolean = superFunction.call( this );
		if( isDirty ) return true;

		let document:Document = this;

		for( let fragment of document.getFragments() ) {
			if( fragment.isDirty() ) return true;
		}

		// Check if an already saved fragment was removed
		for( let fragment of document._savedFragments ) {
			if( ! document.hasFragment( fragment.id ) ) return true;
		}

		return false;
	};
}

function isLocallyOutDated( this:Document ):boolean {
	return this._eTag === null;
}

function extendRevert( superFunction:() => void ):() => void {
	return function():void {
		let persistedDocument:Document = this;
		persistedDocument._fragmentsIndex.clear();
		for( let fragment of persistedDocument._savedFragments ) {
			let slug:string = "slug" in fragment ? (fragment as NamedFragment).slug : fragment.id;

			fragment.revert();
			persistedDocument._fragmentsIndex.set( slug, fragment );
		}
		superFunction.call( persistedDocument );
	};
}

function syncSavedFragments():void {
	let document:Document = this;
	document._savedFragments = Utils.ArrayUtils.from( document._fragmentsIndex.values() );
}

function resolveURI( uri:string ):string {
	if( URI.isAbsolute( uri ) ) return uri;

	let schema:DigestedObjectSchema = this._documents.getGeneralSchema();
	return ObjectSchemaUtils.resolveURI( uri, schema, { vocab: true } );
}

function extendAddType( superFunction:( type:string ) => void ):( type:string ) => void {
	return function( type:string ):void {
		type = resolveURI.call( this, type );
		superFunction.call( this, type );
	};
}

function extendHasType( superFunction:( type:string ) => boolean ):( type:string ) => boolean {
	return function( type:string ):boolean {
		type = resolveURI.call( this, type );
		return superFunction.call( this, type );
	};
}

function extendRemoveType( superFunction:( type:string ) => void ):( type:string ) => void {
	return function( type:string ):void {
		type = resolveURI.call( this, type );
		superFunction.call( this, type );
	};
}

function extendCreateFragment( superFunction:() => TransientFragment ):() => Fragment;
function extendCreateFragment( superFunction:( slug:string ) => TransientFragment ):( slug:string ) => Fragment;
function extendCreateFragment( superFunction:( object:object, slug:string ) => TransientFragment ):( slug:string, object:object ) => Fragment;
function extendCreateFragment( superFunction:( object:object ) => TransientFragment ):( object:object ) => Fragment;
function extendCreateFragment( superFunction:( slugOrObject?:any, slug?:string ) => TransientFragment ):any {
	return function( slugOrObject?:any, slug?:string ):any {
		let fragment:TransientFragment = superFunction.call( this, slugOrObject, slug );
		let id:string = fragment.id;

		if( URI.isBNodeID( id ) ) Fragment.decorate( fragment );
		return fragment;
	};
}

function extendCreateNamedFragment( superFunction:( slug:string ) => TransientNamedFragment ):( slug:string ) => NamedFragment;
function extendCreateNamedFragment( superFunction:( object:object, slug:string ) => TransientNamedFragment ):( slug:string, object:object ) => NamedFragment;
function extendCreateNamedFragment( superFunction:( slugOrObject:any, slug?:string ) => TransientNamedFragment ):any {
	return function( slugOrObject:any, slug?:string ):NamedFragment {
		let fragment:TransientNamedFragment = superFunction.call( this, slugOrObject, slug );
		return NamedFragment.decorate( fragment );
	};
}

function refresh<T extends object>( this:T & Document, requestOptions?:RequestOptions ):Promise<T & Document> {
	return this._documents.refresh<T>( this, requestOptions );
}

function save<T extends object>( this:T & Document, requestOptions?:RequestOptions ):Promise<T> {
	return this._documents.save( this, requestOptions );
}

function saveAndRefresh<T extends object>( this:T & Document, requestOptions?:RequestOptions ):Promise<T> {
	return this._documents.saveAndRefresh<T>( this, requestOptions );
}

function _delete( this:Document, requestOptions?:RequestOptions ):Promise<void> {
	return this._documents.delete( this.id, requestOptions );
}

function addMember( member:Pointer, requestOptions?:RequestOptions ):Promise<void>;
function addMember( memberURI:string, requestOptions?:RequestOptions ):Promise<void>;
function addMember( this:Document, memberOrUri:any, requestOptions?:RequestOptions ):Promise<void> {
	return this._documents.addMember( this.id, memberOrUri, requestOptions );
}

function addMembers( this:Document, members:(Pointer | string)[], requestOptions?:RequestOptions ):Promise<void> {
	return this._documents.addMembers( this.id, members, requestOptions );
}

function get<T extends object>( relativeURI:string, requestOptions?:GETOptions, queryBuilderFn?:( queryBuilder:QueryDocumentBuilder ) => QueryDocumentBuilder ):Promise<T & Document>;
function get<T extends object>( relativeURI:string, queryBuilderFn?:( queryBuilder:QueryDocumentBuilder ) => QueryDocumentBuilder ):Promise<T & Document>;
function get<T extends object>( this:Document, relativeURI:string, optionsOrQueryBuilderFn:any, queryBuilderFn?:( queryBuilder:QueryDocumentBuilder ) => QueryDocumentBuilder ):Promise<T & Document> {
	const uri:string = URI.resolve( this.id, relativeURI );
	return this._documents
		.get<T>( uri, optionsOrQueryBuilderFn, queryBuilderFn )
		.then( data => data[ 0 ] )
		;
}

function createChild<T extends object>( object:T, slug:string, requestOptions?:RequestOptions ):Promise<T & ProtectedDocument>;
function createChild<T extends object>( object:T, requestOptions?:RequestOptions ):Promise<T & ProtectedDocument>;
function createChild( slug:string, requestOptions?:RequestOptions ):Promise<ProtectedDocument>;
function createChild( requestOptions?:RequestOptions ):Promise<ProtectedDocument>;
function createChild<T extends object>( this:Document, objectOrSlugOrRequestOptions?:any, slugOrRequestOptions?:any, requestOptions?:RequestOptions ):Promise<T & ProtectedDocument> {
	requestOptions = RequestUtils.isOptions( objectOrSlugOrRequestOptions ) ? objectOrSlugOrRequestOptions : RequestUtils.isOptions( slugOrRequestOptions ) ? slugOrRequestOptions : requestOptions;
	let object:T = Utils.isString( objectOrSlugOrRequestOptions ) || RequestUtils.isOptions( objectOrSlugOrRequestOptions ) || ! objectOrSlugOrRequestOptions ? <T> {} : objectOrSlugOrRequestOptions;
	let slug:string = Utils.isString( objectOrSlugOrRequestOptions ) ? objectOrSlugOrRequestOptions : Utils.isString( slugOrRequestOptions ) ? slugOrRequestOptions : null;

	return this._documents.createChild<T>( this.id, object, slug, requestOptions );
}

function createChildren<T extends object>( objects:T[], slugs:string[], requestOptions?:RequestOptions ):Promise<(T & ProtectedDocument)[]>;
function createChildren<T extends object>( objects:T[], requestOptions?:RequestOptions ):Promise<(T & ProtectedDocument)[]>;
function createChildren<T extends object>( this:Document, objects:T[], slugsOrRequestOptions?:any, requestOptions?:RequestOptions ):Promise<(T & ProtectedDocument)[]> {
	return this._documents.createChildren<T>( this.id, objects, slugsOrRequestOptions, requestOptions );
}

function createChildAndRetrieve<T extends object>( object:T, slug:string, requestOptions?:RequestOptions ):Promise<T & ProtectedDocument>;
function createChildAndRetrieve<T extends object>( object:T, requestOptions?:RequestOptions ):Promise<T & ProtectedDocument>;
function createChildAndRetrieve( slug:string, requestOptions?:RequestOptions ):Promise<ProtectedDocument>;
function createChildAndRetrieve( requestOptions?:RequestOptions ):Promise<ProtectedDocument>;
function createChildAndRetrieve<T extends object>( this:Document, objectOrSlugOrRequestOptions?:any, slugOrRequestOptions?:any, requestOptions?:RequestOptions ):Promise<T & ProtectedDocument> {
	requestOptions = RequestUtils.isOptions( objectOrSlugOrRequestOptions ) ? objectOrSlugOrRequestOptions : RequestUtils.isOptions( slugOrRequestOptions ) ? slugOrRequestOptions : requestOptions;
	let object:T = Utils.isString( objectOrSlugOrRequestOptions ) || RequestUtils.isOptions( objectOrSlugOrRequestOptions ) || ! objectOrSlugOrRequestOptions ? <T> {} : objectOrSlugOrRequestOptions;
	let slug:string = Utils.isString( objectOrSlugOrRequestOptions ) ? objectOrSlugOrRequestOptions : Utils.isString( slugOrRequestOptions ) ? slugOrRequestOptions : null;

	return this._documents.createChildAndRetrieve<T>( this.id, object, slug, requestOptions );
}

function createChildrenAndRetrieve<T extends object>( objects:T[], slugs:string[], requestOptions?:RequestOptions ):Promise<(T & ProtectedDocument)[]>;
function createChildrenAndRetrieve<T extends object>( objects:T[], requestOptions?:RequestOptions ):Promise<(T & ProtectedDocument)[]>;
function createChildrenAndRetrieve<T extends object>( this:Document, objects:T[], slugsOrRequestOptions?:any, requestOptions?:RequestOptions ):Promise<(T & ProtectedDocument)[]> {
	return this._documents.createChildrenAndRetrieve<T>( this.id, objects, slugsOrRequestOptions, requestOptions );
}

function createAccessPoint<T extends object>( accessPoint:T & BaseAccessPoint, slug?:string, requestOptions?:RequestOptions ):Promise<T & AccessPoint>;
function createAccessPoint<T extends object>( accessPoint:T & BaseAccessPoint, requestOptions?:RequestOptions ):Promise<T & AccessPoint>;
function createAccessPoint<T extends object>( this:Document, accessPoint:T & BaseAccessPoint, slugOrRequestOptions?:any, requestOptions?:RequestOptions ):Promise<T & AccessPoint> {
	return this._documents.createAccessPoint<T>( this.id, accessPoint, slugOrRequestOptions, requestOptions );
}

function createAccessPoints<T extends object>( accessPoints:(T & BaseAccessPoint)[], slugs?:string[], requestOptions?:RequestOptions ):Promise<(T & AccessPoint)[]>;
function createAccessPoints<T extends object>( accessPoints:(T & BaseAccessPoint)[], requestOptions?:RequestOptions ):Promise<(T & AccessPoint)[]>;
function createAccessPoints<T extends object>( this:Document, accessPoints:(T & BaseAccessPoint)[], slugsOrRequestOptions?:any, requestOptions?:RequestOptions ):Promise<(T & AccessPoint)[]> {
	return this._documents.createAccessPoints<T>( this.id, accessPoints, slugsOrRequestOptions, requestOptions );
}


function listChildren( this:Document, requestOptions?:RequestOptions ):Promise<Document[]> {
	return this._documents.listChildren( this.id, requestOptions );
}

function getChildren<T extends object>( this:Document, requestOptions?:RequestOptions, childrenQuery?:( queryBuilder:QueryDocumentsBuilder ) => QueryDocumentsBuilder ):Promise<(T & Document)[]>;
function getChildren<T extends object>( this:Document, queryBuilderFn?:( queryBuilder:QueryDocumentsBuilder ) => QueryDocumentsBuilder ):Promise<(T & Document)[]>;
function getChildren<T extends object>( this:Document, requestOptionsOrQueryBuilderFn?:any, queryBuilderFn?:( queryBuilder:QueryDocumentsBuilder ) => QueryDocumentsBuilder ):Promise<(T & Document)[]> {
	return this._documents.getChildren<T>( this.id, requestOptionsOrQueryBuilderFn, queryBuilderFn );
}


function listMembers( this:Document, requestOptions?:RequestOptions ):Promise<Document[]> {
	return this._documents.listMembers( this.id, requestOptions );
}

function getMembers<T extends object>( this:Document, requestOptions?:RequestOptions, queryBuilderFn?:( queryBuilder:QueryDocumentsBuilder ) => QueryDocumentsBuilder ):Promise<(T & Document)[]>;
function getMembers<T extends object>( this:Document, queryBuilderFn?:( queryBuilder:QueryDocumentsBuilder ) => QueryDocumentsBuilder ):Promise<(T & Document)[]>;
function getMembers<T extends object>( this:Document, requestOptionsOrQueryBuilderFn?:any, childrenQuery?:( queryBuilder:QueryDocumentsBuilder ) => QueryDocumentsBuilder ):Promise<(T & Document)[]> {
	return this._documents.getMembers<T>( this.id, requestOptionsOrQueryBuilderFn, childrenQuery );
}

function removeMember( member:Pointer, requestOptions?:RequestOptions ):Promise<void>;
function removeMember( memberURI:string, requestOptions?:RequestOptions ):Promise<void>;
function removeMember( this:Document, memberOrUri:any, requestOptions?:RequestOptions ):Promise<void> {
	return this._documents.removeMember( this.id, memberOrUri, requestOptions );
}

function removeMembers( this:Document, members:(Pointer | string)[], requestOptions?:RequestOptions ):Promise<void> {
	return this._documents.removeMembers( this.id, members, requestOptions );
}

function removeAllMembers( this:Document, requestOptions?:RequestOptions ):Promise<void> {
	return this._documents.removeAllMembers( this.id, requestOptions );
}

function executeRawASKQuery( this:Document, askQuery:string, requestOptions?:RequestOptions ):Promise<SPARQLRawResults> {
	return this._documents.executeRawASKQuery( this.id, askQuery, requestOptions );
}

function executeASKQuery( this:Document, askQuery:string, requestOptions?:RequestOptions ):Promise<boolean> {
	return this._documents.executeASKQuery( this.id, askQuery, requestOptions );
}

function executeRawSELECTQuery( this:Document, selectQuery:string, requestOptions?:RequestOptions ):Promise<SPARQLRawResults> {
	return this._documents.executeRawSELECTQuery( this.id, selectQuery, requestOptions );
}

function executeSELECTQuery<T extends object>( this:Document, selectQuery:string, requestOptions?:RequestOptions ):Promise<SPARQLSelectResults<T>> {
	return this._documents.executeSELECTQuery<T>( this.id, selectQuery, requestOptions );
}

function executeRawCONSTRUCTQuery( this:Document, constructQuery:string, requestOptions?:RequestOptions ):Promise<string> {
	return this._documents.executeRawCONSTRUCTQuery( this.id, constructQuery, requestOptions );
}

function executeRawDESCRIBEQuery( this:Document, describeQuery:string, requestOptions?:RequestOptions ):Promise<string> {
	return this._documents.executeRawDESCRIBEQuery( this.id, describeQuery, requestOptions );
}

function executeUPDATE( this:Document, updateQuery:string, requestOptions?:RequestOptions ):Promise<void> {
	return this._documents.executeUPDATE( this.id, updateQuery, requestOptions );
}

function sparql( this:Document ):QueryClause<FinishSPARQLSelect> {
	return this._documents.sparql( this.id );
}
