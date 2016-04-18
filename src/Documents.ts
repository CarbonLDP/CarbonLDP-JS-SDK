import * as Errors from "./Errors";
import * as HTTP from "./HTTP";
import Context from "./Context";
import * as RDF from "./RDF";
import * as Utils from "./Utils";

import * as AccessPoint from "./AccessPoint";
import * as Document from "./Document";
import * as JSONLDConverter from "./JSONLDConverter";
import * as PersistedResource from "./PersistedResource";
import * as PersistedDocument from "./PersistedDocument";
import * as PersistedFragment from "./PersistedFragment";
import * as PersistedNamedFragment from "./PersistedNamedFragment";
import * as Pointer from "./Pointer";
import * as NS from "./NS";
import * as ObjectSchema from "./ObjectSchema";
import * as LDP from "./LDP";
import * as SPARQL from "./SPARQL";

class Documents implements Pointer.Library, Pointer.Validator, ObjectSchema.Resolver {
	_jsonldConverter:JSONLDConverter.Class;

	get jsonldConverter():JSONLDConverter.Class { return this._jsonldConverter; }

	private context:Context;
	private pointers:Map<string, Pointer.Class>;

	constructor( context:Context = null ) {
		this.context = context;

		this.pointers = new Map<string, Pointer.Class>();

		if( !! this.context && !! this.context.parentContext ) {
			let contextJSONLDConverter:JSONLDConverter.Class = this.context.parentContext.documents.jsonldConverter;
			this._jsonldConverter = new JSONLDConverter.Class( contextJSONLDConverter.literalSerializers );
		} else {
			this._jsonldConverter = new JSONLDConverter.Class();
		}
	}

	inScope( pointer:Pointer.Class ):boolean;
	inScope( id:string ):boolean;
	inScope( idOrPointer:any ):boolean {
		let id:string = Pointer.Factory.is( idOrPointer ) ? idOrPointer.id : idOrPointer;

		if( RDF.URI.Util.isBNodeID( id ) ) return false;

		if( !! this.context ) {
			let baseURI:string = this.context.getBaseURI();
			if( RDF.URI.Util.isAbsolute( id ) && RDF.URI.Util.isBaseOf( baseURI, id ) ) return true;
		} else {
			if( RDF.URI.Util.isAbsolute( id ) ) return true;
		}

		if( !! this.context && !! this.context.parentContext ) return this.context.parentContext.documents.inScope( id );

		return false;
	}

	hasPointer( id:string ):boolean {
		id = this.getPointerID( id );

		if( this.pointers.has( id ) ) return true;

		if( !! this.context && !! this.context.parentContext ) return this.context.parentContext.documents.hasPointer( id );

		return false;
	}

	getPointer( id:string ):Pointer.Class {
		let localID:string = this.getPointerID( id );

		if( Utils.isNull( localID ) ) {
			if( !! this.context && !! this.context.parentContext ) return this.context.parentContext.documents.getPointer( id );
			throw new Errors.IllegalArgumentError( "The pointer id is not supported by this module." );
		}

		let pointer:Pointer.Class;
		if( ! this.pointers.has( localID ) ) {
			pointer = this.createPointer( localID );
			this.pointers.set( localID, pointer );
		}

		return this.pointers.get( localID );
	}

	get( uri:string, requestOptions:HTTP.Request.Options = {} ):Promise<[ PersistedDocument.Class, HTTP.Response.Class ]> {
		let pointerID:string = this.getPointerID( uri );
		if( !! this.context ) uri = this.context.resolve( uri );

		if( this.pointers.has( pointerID ) ) {
			let pointer:Pointer.Class = this.getPointer( uri );
			if( pointer.isResolved() ) {
				return new Promise( ( resolve:( result:[ PersistedDocument.Class, HTTP.Response.Class ]) => void, reject:( error:Error ) => void ) => {
					resolve( [ <any> pointer, null ] );
				} );
			}
		}

		if ( this.context && this.context.auth.isAuthenticated() ) this.context.auth.addAuthentication( requestOptions );

		HTTP.Request.Util.setAcceptHeader( "application/ld+json", requestOptions );
		HTTP.Request.Util.setPreferredInteractionModel( NS.LDP.Class.RDFSource, requestOptions );

		return HTTP.Request.Service.get( uri, requestOptions, new RDF.Document.Parser() ).then( ( [ rdfDocuments, response ]:[ RDF.Document.Class[], HTTP.Response.Class ] ) => {
			let etag:string = HTTP.Response.Util.getETag( response );
			if( etag === null ) throw new HTTP.Errors.BadResponseError( "The response doesn't contain an ETag", response );

			let rdfDocument:RDF.Document.Class = this.getRDFDocument( uri, rdfDocuments, response );
			if ( rdfDocument === null ) throw new HTTP.Errors.BadResponseError( "No document was returned.", response );

			let documentResources:RDF.Node.Class[] = RDF.Document.Util.getDocumentResources( rdfDocument );
			if( documentResources.length > 1 ) throw new HTTP.Errors.BadResponseError( "The RDFDocument contains more than one document resource.", response );
			if( documentResources.length === 0 ) throw new HTTP.Errors.BadResponseError( "The RDFDocument doesn\'t contain a document resource.", response );

			let documentResource:RDF.Node.Class = documentResources[ 0 ];
			let fragmentResources:RDF.Node.Class[] = RDF.Document.Util.getBNodeResources( rdfDocument );
			let namedFragmentResources:RDF.Node.Class[] = RDF.Document.Util.getFragmentResources( rdfDocument );

			let documentPointer:Pointer.Class = this.getPointer( uri );
			documentPointer._resolved = true;

			let document:PersistedDocument.Class = PersistedDocument.Factory.createFrom( documentPointer, uri, this );
			document._etag = etag;

			let fragments:PersistedFragment.Class[] = [];
			for( let fragmentResource of fragmentResources ) {
				fragments.push( document.createFragment( fragmentResource[ "@id" ] ) );
			}

			let namedFragments:PersistedNamedFragment.Class[] = [];
			for( let namedFragmentResource of namedFragmentResources ) {
				namedFragments.push( document.createNamedFragment( namedFragmentResource[ "@id" ] ) );
			}

			this.compact( documentResource, document, document );
			this.compact( fragmentResources, fragments, document );
			this.compact( namedFragmentResources, namedFragments, document );

			// TODO: Move this to a more appropriate place. See also refresh() method
			document._syncSnapshot();
			fragments.forEach( ( fragment:PersistedFragment.Class ) => fragment._syncSnapshot() );
			namedFragments.forEach( ( fragment:PersistedNamedFragment.Class ) => fragment._syncSnapshot() );
			document._syncSavedFragments();

			// TODO: Decorate additional behavior (app, etc.). See also refresh() method
			// TODO: Make it dynamic. See also refresh() method
			if( LDP.Container.Factory.hasRDFClass( document ) ) LDP.PersistedContainer.Factory.decorate( document );

			return [ document, response ];
		} );
	}

	exists( documentURI:string, requestOptions:HTTP.Request.Options = {} ):Promise<[ boolean, HTTP.Response.Class ]> {
		if( !! this.context ) {
			documentURI = this.context.resolve( documentURI );
			if ( this.context.auth.isAuthenticated() ) this.context.auth.addAuthentication( requestOptions );
		}

		HTTP.Request.Util.setAcceptHeader( "application/ld+json", requestOptions );
		HTTP.Request.Util.setPreferredInteractionModel( NS.LDP.Class.RDFSource, requestOptions );

		return HTTP.Request.Service.head( documentURI, requestOptions ).then( ( response:HTTP.Response.Class ) => [ true, response ], ( error:HTTP.Errors.Error ) => {
			if ( error.response.status === 404 )
				return [ false, error.response ];

			return Promise.reject<any>( error );
		});
	}

	createChild( parentURI:string, slug:string, childDocument:Document.Class, requestOptions?:HTTP.Request.Options ):Promise<[ Pointer.Class, HTTP.Response.Class ]>;
	createChild( parentURI:string, childDocument:Document.Class, requestOptions?:HTTP.Request.Options ):Promise<[ Pointer.Class, HTTP.Response.Class ]>;

	createChild( parentURI:string, slug:string, childObject:Object, requestOptions?:HTTP.Request.Options ):Promise<[ Pointer.Class, HTTP.Response.Class ]>;
	createChild( parentURI:string, childObject:Object, requestOptions?:HTTP.Request.Options ):Promise<[ Pointer.Class, HTTP.Response.Class ]>;

	createChild( parentURI:string, slugOrChildDocument:any, childDocumentOrRequestOptions:any = {}, requestOptions:HTTP.Request.Options = {} ):Promise<[ Pointer.Class, HTTP.Response.Class ]> {
		let slug:string = Utils.isString( slugOrChildDocument ) ? slugOrChildDocument : null;
		let childDocument:Document.Class = ! Utils.isString( slugOrChildDocument ) ? slugOrChildDocument : childDocumentOrRequestOptions;
		requestOptions = ! Utils.isString( slugOrChildDocument ) ? childDocumentOrRequestOptions : requestOptions;

		if ( ! Document.Factory.is( childDocument ) ) childDocument = Document.Factory.createFrom( childDocument );

		if( !! this.context ) parentURI = this.context.resolve( parentURI );

		if( PersistedDocument.Factory.is( childDocument ) ) return Promise.reject<any>( new Errors.IllegalArgumentError( "The childDocument provided has been already persisted." ) );

		if( childDocument.id ) {
			let childURI:string = childDocument.id;
			if( !! this.context ) childURI = this.context.resolve( childURI );
			if ( ! RDF.URI.Util.isBaseOf( parentURI, childURI ) ) {
				return Promise.reject<any>( new Errors.IllegalArgumentError( "The childDocument's URI is not relative to the parentURI specified" ) );
			}
		}

		if ( this.context && this.context.auth.isAuthenticated() ) this.context.auth.addAuthentication( requestOptions );

		HTTP.Request.Util.setContentTypeHeader( "application/ld+json", requestOptions );
		HTTP.Request.Util.setAcceptHeader( "application/ld+json", requestOptions );
		HTTP.Request.Util.setPreferredInteractionModel( NS.LDP.Class.Container, requestOptions );

		let body:string = childDocument.toJSON( this, this.jsonldConverter );

		if( slug !== null ) HTTP.Request.Util.setSlug( slug, requestOptions );

		return HTTP.Request.Service.post( parentURI, body, requestOptions ).then( ( response:HTTP.Response.Class ) => {
			let locationHeader:HTTP.Header.Class = response.getHeader( "Location" );
			if( locationHeader === null || locationHeader.values.length < 1 ) throw new HTTP.Errors.BadResponseError( "The response is missing a Location header.", response );
			if( locationHeader.values.length !== 1 ) throw new HTTP.Errors.BadResponseError( "The response contains more than one Location header.", response );

			let locationURI:string = locationHeader.values[0].toString();

			// TODO: If a Document was supplied, use it to create the pointer instead of creating a new one
			let pointer:Pointer.Class = this.getPointer( locationURI );

			return [
				pointer,
				response,
			];
		});
	}

	createAccessPoint( documentURI:string, accessPoint:AccessPoint.Class, slug?:string, requestOptions?:HTTP.Request.Options ):Promise<[ Pointer.Class, HTTP.Response.Class ]>;
	createAccessPoint( accessPoint:AccessPoint.Class, slug?:string, requestOptions?:HTTP.Request.Options ):Promise<[ Pointer.Class, HTTP.Response.Class ]>;
	createAccessPoint( documentURIOrAccessPoint:any, accessPointOrSlug:any, slugOrRequestOptions:any = null, requestOptions:HTTP.Request.Options = {} ):Promise<[ Pointer.Class, HTTP.Response.Class ]> {
		let documentURI:string = Utils.isString( documentURIOrAccessPoint ) ? documentURIOrAccessPoint : null;
		let accessPoint:AccessPoint.Class = ! Utils.isString( documentURIOrAccessPoint ) ? documentURIOrAccessPoint : accessPointOrSlug;
		let slug:string = Utils.isString( accessPointOrSlug ) ? accessPointOrSlug : slugOrRequestOptions;
		requestOptions = ! Utils.isString( slugOrRequestOptions ) && slugOrRequestOptions !== null ? slugOrRequestOptions : requestOptions;

		if( documentURI === null ) documentURI = accessPoint.membershipResource.id;

		if( !! this.context ) documentURI = this.context.resolve( documentURI );

		if( accessPoint.membershipResource.id !== documentURI ) return Promise.reject<any>( new Errors.IllegalArgumentError( "The documentURI must be the same as the accessPoint's membershipResource" ) );
		if( PersistedDocument.Factory.is( accessPoint ) ) return Promise.reject<any>( new Errors.IllegalArgumentError( "The accessPoint provided has been already persisted." ) );

		// TODO: Reuse logic with createChild
		if( accessPoint.id ) {
			let childURI:string = accessPoint.id;
			if( !! this.context ) childURI = this.context.resolve( childURI );
			if ( ! RDF.URI.Util.isBaseOf( documentURI, childURI ) ) {
				return Promise.reject<any>( new Errors.IllegalArgumentError( "The accessPoint's URI is not relative to the parentURI specified" ) );
			}
		}

		if ( this.context && this.context.auth.isAuthenticated() ) this.context.auth.addAuthentication( requestOptions );

		HTTP.Request.Util.setContentTypeHeader( "application/ld+json", requestOptions );
		HTTP.Request.Util.setAcceptHeader( "application/ld+json", requestOptions );
		HTTP.Request.Util.setPreferredInteractionModel( NS.LDP.Class.RDFSource, requestOptions );

		let body:string = accessPoint.toJSON( this, this.jsonldConverter );

		if( slug !== null ) HTTP.Request.Util.setSlug( slug, requestOptions );

		return HTTP.Request.Service.post( documentURI, body, requestOptions ).then( ( response:HTTP.Response.Class ) => {
			let locationHeader:HTTP.Header.Class = response.getHeader( "Location" );
			if( locationHeader === null || locationHeader.values.length < 1 ) throw new HTTP.Errors.BadResponseError( "The response is missing a Location header.", response );
			if( locationHeader.values.length !== 1 ) throw new HTTP.Errors.BadResponseError( "The response contains more than one Location header.", response );

			let locationURI:string = locationHeader.values[0].toString();

			// TODO: If a Document was supplied, use it to create the pointer instead of creating a new one
			let pointer:Pointer.Class = this.getPointer( locationURI );

			return [
				pointer,
				response,
			];
		});
	}

	upload( parentURI:string, slug:string, file:Blob, requestOptions?:HTTP.Request.Options ):Promise<[ Pointer.Class, HTTP.Response.Class ]>;
	upload( parentURI:string, file:Blob, requestOptions?:HTTP.Request.Options ):Promise<[ Pointer.Class, HTTP.Response.Class ]>;
	upload( parentURI:string, slugOrBlob:any, blobOrRequestOptions:any = {}, requestOptions:HTTP.Request.Options = {} ):Promise<[ Pointer.Class, HTTP.Response.Class ]> {
		let slug:string = Utils.isString( slugOrBlob ) ? slugOrBlob : null;
		let blob:Blob = ! Utils.isString(slugOrBlob) ? slugOrBlob : blobOrRequestOptions;
		requestOptions = ! Utils.isString(slugOrBlob) ? blobOrRequestOptions : requestOptions;

		if( ! ( blob instanceof Blob ) ) return Promise.reject<any>( new Errors.IllegalArgumentError( "The file is not a valid Blob object." ) );

		if( !! this.context ) parentURI = this.context.resolve( parentURI );
		if ( this.context && this.context.auth.isAuthenticated() ) this.context.auth.addAuthentication( requestOptions );

		HTTP.Request.Util.setContentTypeHeader( blob.type, requestOptions );
		HTTP.Request.Util.setAcceptHeader( "application/ld+json", requestOptions );
		HTTP.Request.Util.setPreferredInteractionModel( NS.LDP.Class.Container, requestOptions );

		if( slug !== null ) HTTP.Request.Util.setSlug( slug, requestOptions );

		return HTTP.Request.Service.post( parentURI, blob, requestOptions ).then( ( response:HTTP.Response.Class ) => {
			let locationHeader:HTTP.Header.Class = response.getHeader( "Location" );
			if( locationHeader === null || locationHeader.values.length < 1 ) throw new HTTP.Errors.BadResponseError( "The response is missing a Location header.", response );
			if( locationHeader.values.length !== 1 ) throw new HTTP.Errors.BadResponseError( "The response contains more than one Location header.", response );

			let locationURI:string = locationHeader.values[0].toString();

			let pointer:Pointer.Class = this.getPointer( locationURI );

			return [
				pointer,
				response,
			];
		});
	}

	getMembers( uri:string, includeNonReadable:boolean, requestOptions:HTTP.Request.Options ):Promise<[ Pointer.Class[], HTTP.Response.Class ]>;
	getMembers( uri:string, includeNonReadable:boolean ):Promise<[ Pointer.Class[], HTTP.Response.Class ]>;
	getMembers( uri:string, requestOptions:HTTP.Request.Options ):Promise<[ Pointer.Class[], HTTP.Response.Class ]>;
	getMembers( uri:string ):Promise<[ Pointer.Class[], HTTP.Response.Class ]>;
	getMembers( uri:string, includeNonReadableOrRequestOptions:any = null, requestOptions:HTTP.Request.Options = {} ):Promise<[ Pointer.Class[], HTTP.Response.Class ]> {
		let includeNonReadable:boolean = Utils.isBoolean( includeNonReadableOrRequestOptions ) ? includeNonReadableOrRequestOptions : true;
		requestOptions = Utils.isObject( includeNonReadableOrRequestOptions ) && includeNonReadableOrRequestOptions !== null ? includeNonReadableOrRequestOptions : requestOptions;

		if( ! RDF.URI.Util.isAbsolute( uri ) ) {
			if( ! this.context ) throw new Errors.IllegalArgumentError( "This Documents instance doesn't support relative URIs." );
			uri = this.context.resolve( uri );
		}

		if ( this.context && this.context.auth.isAuthenticated() ) this.context.auth.addAuthentication( requestOptions );

		HTTP.Request.Util.setAcceptHeader( "application/ld+json", requestOptions );
		HTTP.Request.Util.setPreferredInteractionModel( NS.LDP.Class.Container, requestOptions );

		let containerRetrievalPreferences:HTTP.Request.ContainerRetrievalPreferences = {
			include: [
				NS.LDP.Class.PreferMinimalContainer,
				NS.LDP.Class.PreferMembership,
			],
			omit: [
				NS.LDP.Class.PreferContainment,
				NS.C.Class.PreferContainmentResources,
				NS.C.Class.PreferMembershipResources,
			],
		};

		if( includeNonReadable ) {
			containerRetrievalPreferences.include.push( NS.C.Class.NonReadableMembershipResourceTriples );
		} else {
			containerRetrievalPreferences.omit.push( NS.C.Class.NonReadableMembershipResourceTriples );
		}
		HTTP.Request.Util.setContainerRetrievalPreferences( containerRetrievalPreferences, requestOptions );

		return HTTP.Request.Service.get( uri, requestOptions, new RDF.Document.Parser() ).then( ( [ rdfDocuments, response ]:[ RDF.Document.Class[], HTTP.Response.Class ] ) => {
			let rdfDocument:RDF.Document.Class = this.getRDFDocument( uri, rdfDocuments, response );
			if ( rdfDocument === null ) throw new HTTP.Errors.BadResponseError( "No document was returned.", response );

			let documentResource:RDF.Node.Class = this.getDocumentResource( rdfDocument, response );
			let membershipResourceURI:string = RDF.Node.Util.getPropertyURI( documentResource, NS.LDP.Predicate.membershipResource );

			let membershipResource:RDF.Node.Class;
			if( documentResource[ "@id" ] === membershipResourceURI ) {
				membershipResource = documentResource;
			} else if( membershipResourceURI === null ) {
				if( documentResource[ "@type" ].indexOf( NS.LDP.Class.BasicContainer ) !== -1 ) {
					membershipResource = documentResource;
				} else {
					throw new HTTP.Errors.BadResponseError( "The document is not an ldp:BasicContainer and it doesn't contain an ldp:membershipResource triple.", response );
				}
			} else {
				let membershipResourceDocument:RDF.Document.Class = this.getRDFDocument( membershipResourceURI, rdfDocuments, response );
				if ( membershipResourceDocument === null ) throw new HTTP.Errors.BadResponseError( "The membershipResource document was not included in the response.", response );
				membershipResource = this.getDocumentResource( membershipResourceDocument, response );
			}

			let hasMemberRelation:string = RDF.Node.Util.getPropertyURI( documentResource, NS.LDP.Predicate.hasMemberRelation );

			let memberPointers:Pointer.Class[] = RDF.Value.Util.getPropertyPointers( membershipResource, hasMemberRelation, this );

			return [ memberPointers, response ];
		});
	}

	addMember( documentURI:string, member:Pointer.Class, requestOptions?:HTTP.Request.Options ): Promise<HTTP.Response.Class>;
	addMember( documentURI:string, memberURI:string, requestOptions?:HTTP.Request.Options ): Promise<HTTP.Response.Class>;
	addMember( documentURI:string, memberORUri:Pointer.Class | string, requestOptions:HTTP.Request.Options = {} ): Promise<HTTP.Response.Class> {
		return this.addMembers( documentURI, [ memberORUri ], requestOptions );
	}

	addMembers( documentURI:string, members:(Pointer.Class | string)[], requestOptions?:HTTP.Request.Options ): Promise<HTTP.Response.Class>;
	addMembers( documentURI:string, members:(Pointer.Class | string)[], requestOptions:HTTP.Request.Options = {} ): Promise<HTTP.Response.Class> {
		let pointers:Pointer.Class[] = [];
		for ( let member  of members ) {
			member = Utils.isString( member ) ? this.getPointer( <string> member ) : member;
			if ( ! Pointer.Factory.is( member ) ) return Promise.reject<any>( new Errors.IllegalArgumentError( "No Carbon.Pointer or string URI provided.") );

			pointers.push( <Pointer.Class> member );
		}

		if( !! this.context ) documentURI = this.context.resolve( documentURI );

		let document:Document.Class = LDP.AddMemberAction.Factory.createDocument( pointers );

		if ( this.context && this.context.auth.isAuthenticated() ) this.context.auth.addAuthentication( requestOptions );
		HTTP.Request.Util.setAcceptHeader( "application/ld+json", requestOptions );
		HTTP.Request.Util.setContentTypeHeader( "application/ld+json", requestOptions );
		HTTP.Request.Util.setPreferredInteractionModel( NS.LDP.Class.Container, requestOptions );

		let body:string = document.toJSON( this, this.jsonldConverter );

		return HTTP.Request.Service.put( documentURI, body, requestOptions );
	}

	removeMember( documentURI:string, member:Pointer.Class, requestOptions?:HTTP.Request.Options ): Promise<HTTP.Response.Class>;
	removeMember( documentURI:string, memberURI:string, requestOptions?:HTTP.Request.Options ): Promise<HTTP.Response.Class>;
	removeMember( documentURI:string, memberORUri:Pointer.Class | string, requestOptions:HTTP.Request.Options = {} ): Promise<HTTP.Response.Class> {
		return this.removeMembers( documentURI, [ memberORUri ], requestOptions );
	}

	removeMembers( documentURI:string, members:(Pointer.Class | string)[], requestOptions:HTTP.Request.Options = {} ):Promise<HTTP.Response.Class> {
		let pointers:Pointer.Class[] = [];
		for ( let member of members ) {
			member = Utils.isString( member ) ? this.getPointer( <string> member ) : member;
			if ( ! Pointer.Factory.is( member ) ) return Promise.reject<any>( new Errors.IllegalArgumentError( "No Carbon.Pointer or string URI provided.") );

			pointers.push( <Pointer.Class> member );
		}

		if( !! this.context ) documentURI = this.context.resolve( documentURI );

		let document:Document.Class = LDP.RemoveMemberAction.Factory.createDocument( pointers );
		let containerRetrievalPreferences:HTTP.Request.ContainerRetrievalPreferences = {
			include: [ NS.C.Class.PreferSelectedMembershipTriples ],
			omit: [ NS.C.Class.PreferMembershipTriples ],
		};

		if ( this.context && this.context.auth.isAuthenticated() ) this.context.auth.addAuthentication( requestOptions );
		HTTP.Request.Util.setAcceptHeader( "application/ld+json", requestOptions );
		HTTP.Request.Util.setContentTypeHeader( "application/ld+json", requestOptions );
		HTTP.Request.Util.setPreferredInteractionModel( NS.LDP.Class.Container, requestOptions );
		HTTP.Request.Util.setContainerRetrievalPreferences( containerRetrievalPreferences, requestOptions, false );

		let body:string = document.toJSON( this, this.jsonldConverter );

		return HTTP.Request.Service.delete( documentURI, body, requestOptions );
	}

	save( persistedDocument:PersistedDocument.Class, requestOptions:HTTP.Request.Options = {} ):Promise<[ PersistedDocument.Class, HTTP.Response.Class ]> {
		// TODO: Check if the document isDirty
		/*
		if( ! persistedDocument.isDirty() ) return new Promise<HTTP.Response.Class>( ( resolve:( result:HTTP.Response.Class ) => void ) => {
			resolve( null );
		});
		*/

		if ( this.context && this.context.auth.isAuthenticated() ) this.context.auth.addAuthentication( requestOptions );

		HTTP.Request.Util.setAcceptHeader( "application/ld+json", requestOptions );
		HTTP.Request.Util.setContentTypeHeader( "application/ld+json", requestOptions );
		HTTP.Request.Util.setPreferredInteractionModel( NS.LDP.Class.RDFSource, requestOptions );
		HTTP.Request.Util.setIfMatchHeader( persistedDocument._etag, requestOptions );

		let body:string = persistedDocument.toJSON( this, this.jsonldConverter );

		return HTTP.Request.Service.put( persistedDocument.id, body, requestOptions ).then( ( response:HTTP.Response.Class ) => {
			return [ persistedDocument, response ];
		});
	}

	refresh( persistedDocument:PersistedDocument.Class, requestOptions:HTTP.Request.Options = {} ):Promise<[ PersistedDocument.Class, HTTP.Response.Class ]> {
		if ( this.context && this.context.auth.isAuthenticated() ) this.context.auth.addAuthentication( requestOptions );

		HTTP.Request.Util.setAcceptHeader( "application/ld+json", requestOptions );
		HTTP.Request.Util.setContentTypeHeader( "application/ld+json", requestOptions );
		HTTP.Request.Util.setPreferredInteractionModel( NS.LDP.Class.RDFSource, requestOptions );

		return HTTP.Request.Service.head( persistedDocument.id, requestOptions ).then( ( headerResponse:HTTP.Response.Class ) => {
			let eTag:string = HTTP.Response.Util.getETag( headerResponse );
			if ( eTag === persistedDocument._etag ) return [ persistedDocument, null ];

			return HTTP.Request.Service.get( persistedDocument.id, requestOptions, new RDF.Document.Parser() ).then( ( [ rdfDocuments, response ]:[ RDF.Document.Class[], HTTP.Response.Class ] ) => {
				eTag = HTTP.Response.Util.getETag( response );
				if( eTag === null ) throw new HTTP.Errors.BadResponseError( "The response doesn't contain an ETag", response );

				let rdfDocument:RDF.Document.Class = this.getRDFDocument( persistedDocument.id, rdfDocuments, response );
				if ( rdfDocument === null ) throw new HTTP.Errors.BadResponseError( "No document was returned.", response );
				persistedDocument._etag = eTag;

				let documentResources:RDF.Node.Class[] = RDF.Document.Util.getDocumentResources( rdfDocument );
				if( documentResources.length > 1 ) throw new HTTP.Errors.BadResponseError( "The RDFDocument contains more than one document resource.", response );
				if( documentResources.length === 0 ) throw new HTTP.Errors.BadResponseError( "The RDFDocument doesn\'t contain a document resource.", response );

				let documentResource:RDF.Node.Class = documentResources[ 0 ];
				let fragmentResources:RDF.Node.Class[] = RDF.Document.Util.getBNodeResources( rdfDocument );
				fragmentResources.concat( RDF.Document.Util.getFragmentResources( rdfDocument ) );

				let updatedData:Object = {};
				this.compact( documentResource, updatedData, persistedDocument );
				this.mix( persistedDocument, updatedData );
				persistedDocument._syncSnapshot();

				let id:string;
				let fragment:PersistedFragment.Class;
				for( let fragmentResource of fragmentResources ) {
					updatedData = this.compact( fragmentResource, {}, persistedDocument );

					id = updatedData[ "id" ] || "";
					if ( persistedDocument.hasFragment( id ) ) {
						fragment = this.mix( persistedDocument.getFragment( id ), updatedData );
					} else {
						fragment = persistedDocument.createFragment( id, updatedData );
					}

					fragment._syncSnapshot();
				}

				persistedDocument._syncSavedFragments();

				return [ persistedDocument, response ];
			});
		});
	}

	delete( documentURI:string, requestOptions:HTTP.Request.Options = {} ):Promise<HTTP.Response.Class> {
		if ( this.context && this.context.auth.isAuthenticated() ) this.context.auth.addAuthentication( requestOptions );

		if( !! this.context ) documentURI = this.context.resolve( documentURI );

		HTTP.Request.Util.setAcceptHeader( "application/ld+json", requestOptions );
		HTTP.Request.Util.setPreferredInteractionModel( NS.LDP.Class.RDFSource, requestOptions );

		return HTTP.Request.Service.delete( documentURI, requestOptions );
	}

	getSchemaFor( object:Object ):ObjectSchema.DigestedObjectSchema {
		if( "@id" in object ) {
			return this.getDigestedObjectSchemaForExpandedObject( object );
		} else {
			return this.getDigestedObjectSchemaForDocument( <any> object );
		}
	}

	executeRawASKQuery( documentURI:string, askQuery:string, requestOptions:HTTP.Request.Options = {} ):Promise<[ SPARQL.RawResults.Class, HTTP.Response.Class ]> {
		if( ! RDF.URI.Util.isAbsolute( documentURI ) ) {
			if( ! this.context ) throw new Errors.IllegalArgumentError( "This Documents instance doesn't support relative URIs." );
			documentURI = this.context.resolve( documentURI );
		}

		if ( this.context && this.context.auth.isAuthenticated() ) this.context.auth.addAuthentication( requestOptions );

		return SPARQL.Service.executeRawASKQuery( documentURI, askQuery, requestOptions );
	}

	executeASKQuery( documentURI:string, askQuery:string, requestOptions:HTTP.Request.Options = {} ):Promise<[ boolean, HTTP.Response.Class ]> {
		if( ! RDF.URI.Util.isAbsolute( documentURI ) ) {
			if( ! this.context ) throw new Errors.IllegalArgumentError( "This Documents instance doesn't support relative URIs." );
			documentURI = this.context.resolve( documentURI );
		}

		if ( this.context && this.context.auth.isAuthenticated() ) this.context.auth.addAuthentication( requestOptions );

		return SPARQL.Service.executeASKQuery( documentURI, askQuery, requestOptions );
	}

	executeRawSELECTQuery( documentURI:string, selectQuery:string, requestOptions:HTTP.Request.Options = {} ):Promise<[ SPARQL.RawResults.Class, HTTP.Response.Class ]> {
		if( ! RDF.URI.Util.isAbsolute( documentURI ) ) {
			if( ! this.context ) throw new Errors.IllegalArgumentError( "This Documents instance doesn't support relative URIs." );
			documentURI = this.context.resolve( documentURI );
		}

		if ( this.context && this.context.auth.isAuthenticated() ) this.context.auth.addAuthentication( requestOptions );

		return SPARQL.Service.executeRawSELECTQuery( documentURI, selectQuery, requestOptions );
	}

	executeSELECTQuery( documentURI:string, selectQuery:string, requestOptions:HTTP.Request.Options = {} ):Promise<[ SPARQL.SELECTResults.Class, HTTP.Response.Class ]> {
		if( ! RDF.URI.Util.isAbsolute( documentURI ) ) {
			if( ! this.context ) throw new Errors.IllegalArgumentError( "This Documents instance doesn't support relative URIs." );
			documentURI = this.context.resolve( documentURI );
		}

		if ( this.context && this.context.auth.isAuthenticated() ) this.context.auth.addAuthentication( requestOptions );

		return SPARQL.Service.executeSELECTQuery( documentURI, selectQuery, this, requestOptions );
	}

	executeRawCONSTRUCTQuery( documentURI:string, constructQuery:string, requestOptions:HTTP.Request.Options = {} ):Promise<[ string, HTTP.Response.Class ]> {
		if( ! RDF.URI.Util.isAbsolute( documentURI ) ) {
			if( ! this.context ) throw new Errors.IllegalArgumentError( "This Documents instance doesn't support relative URIs." );
			documentURI = this.context.resolve( documentURI );
		}

		if ( this.context && this.context.auth.isAuthenticated() ) this.context.auth.addAuthentication( requestOptions );

		return SPARQL.Service.executeRawCONSTRUCTQuery( documentURI, constructQuery, requestOptions );
	}

	executeRawDESCRIBEQuery( documentURI:string, constructQuery:string, requestOptions:HTTP.Request.Options = {} ):Promise<[ string, HTTP.Response.Class ]> {
		if( ! RDF.URI.Util.isAbsolute( documentURI ) ) {
			if( ! this.context ) throw new Errors.IllegalArgumentError( "This Documents instance doesn't support relative URIs." );
			documentURI = this.context.resolve( documentURI );
		}

		if ( this.context && this.context.auth.isAuthenticated() ) this.context.auth.addAuthentication( requestOptions );

		return SPARQL.Service.executeRawDESCRIBEQuery( documentURI, constructQuery, requestOptions );
	}

	private getRDFDocument( requestURL:string, rdfDocuments:RDF.Document.Class[], response:HTTP.Response.Class ):RDF.Document.Class {
		rdfDocuments = rdfDocuments.filter( ( rdfDocument:RDF.Document.Class ) => rdfDocument[ "@id" ] === requestURL );

		if ( rdfDocuments.length > 1 ) throw new HTTP.Errors.BadResponseError( "Several documents share the same id.", response );

		return rdfDocuments.length > 0 ? rdfDocuments[ 0 ] : null;
	}

	private getDocumentResource( rdfDocument:RDF.Document.Class, response:HTTP.Response.Class ):RDF.Node.Class {
		let documentResources:RDF.Node.Class[] = RDF.Document.Util.getDocumentResources( rdfDocument );
		if ( documentResources.length === 0 ) throw new HTTP.Errors.BadResponseError( `The RDFDocument: ${ rdfDocument[ "@id" ] }, doesn't contain a document resource.`, response );
		if ( documentResources.length > 1 ) throw new HTTP.Errors.BadResponseError( `The RDFDocument: ${ rdfDocument[ "@id" ] }, contains more than one document resource.`, response );

		return documentResources[ 0 ];
	}

	private getPointerID( uri:string ):string {
		if( RDF.URI.Util.isBNodeID( uri ) ) throw new Errors.IllegalArgumentError( "BNodes cannot be fetched directly." );
		// TODO: Make named fragments independently resolvable
		/*
			if( RDF.URI.Util.hasFragment( uri ) ) throw new Errors.IllegalArgumentError( "Fragment URI's cannot be fetched directly." );
		*/

		if( !! this.context ) {
			if( ! RDF.URI.Util.isRelative( uri ) ) {
				let baseURI:string = this.context.getBaseURI();
				if( ! RDF.URI.Util.isBaseOf( baseURI, uri ) ) return null;

				return uri.substring( baseURI.length );
			} else {
				return uri;
			}
		} else {
			if( RDF.URI.Util.isRelative( uri ) ) throw new Errors.IllegalArgumentError( "This Documents instance doesn't support relative URIs." );
			return uri;
		}
	}

	private createPointer( localID:string ):Pointer.Class {
		let id:string = !! this.context ? this.context.resolve( localID ) : localID;
		let pointer:Pointer.Class = Pointer.Factory.create( id );
		Object.defineProperty( pointer, "resolve", {
			writable: false,
			enumerable: false,
			configurable: true,
			value: ():Promise<[ PersistedDocument.Class, HTTP.Response.Class ]> => {
				return this.get( id );
			},
		});

		return pointer;
	}

	private compact( expandedObjects:Object[], targetObjects:Object[], pointerLibrary:Pointer.Library ):Object[];
	private compact( expandedObject:Object, targetObject:Object, pointerLibrary:Pointer.Library ):Object;
	private compact( expandedObjectOrObjects:any, targetObjectOrObjects:any, pointerLibrary:Pointer.Library ):any {
		if( ! Utils.isArray( expandedObjectOrObjects ) ) return this.compactSingle( expandedObjectOrObjects, targetObjectOrObjects, pointerLibrary );

		let expandedObjects:Object[] = expandedObjectOrObjects;
		let targetObjects:Object[] = !! targetObjectOrObjects ? targetObjectOrObjects : [];
		for( let i:number = 0, length:number = expandedObjects.length; i < length; i++ ) {
			let expandedObject:Object = expandedObjects[ i ];
			let targetObject:Object = targetObjects[ i ] = !! targetObjects[ i ] ? targetObjects[ i ] : {};

			this.compactSingle( expandedObject, targetObject, pointerLibrary );
		}

		return targetObjects;
	}

	private compactSingle( expandedObject:Object, targetObject:Object, pointerLibrary:Pointer.Library ):Object {
		let digestedSchema:ObjectSchema.DigestedObjectSchema = this.getDigestedObjectSchemaForExpandedObject( expandedObject );

		return this.jsonldConverter.compact( expandedObject, targetObject, digestedSchema, pointerLibrary );
	}

	private getDigestedObjectSchemaForExpandedObject( expandedObject:Object ):ObjectSchema.DigestedObjectSchema {
		let types:string[] = this.getExpandedObjectTypes( expandedObject );

		return this.getDigestedObjectSchema( types );
	}

	private getDigestedObjectSchemaForDocument( document:Document.Class ):ObjectSchema.DigestedObjectSchema {
		let types:string[] = this.getDocumentTypes( document );

		return this.getDigestedObjectSchema( types );
	}

	private getDigestedObjectSchema( objectTypes:string[] ):ObjectSchema.DigestedObjectSchema {
		let digestedSchema:ObjectSchema.DigestedObjectSchema;
		if( !! this.context ) {
			let typesDigestedObjectSchemas:ObjectSchema.DigestedObjectSchema[] = [ this.context.getObjectSchema() ];
			for( let type of objectTypes ) {
				if( this.context.getObjectSchema( type ) ) typesDigestedObjectSchemas.push( this.context.getObjectSchema( type ) );
			}

			if( typesDigestedObjectSchemas.length > 1 ) {
				digestedSchema = ObjectSchema.Digester.combineDigestedObjectSchemas( typesDigestedObjectSchemas );
			} else {
				digestedSchema = typesDigestedObjectSchemas[ 0 ];
			}
		} else {
			digestedSchema = new ObjectSchema.DigestedObjectSchema();
		}

		return digestedSchema;
	}

	private getExpandedObjectTypes( expandedObject:Object ):string[] {
		if( ! expandedObject[ "@type" ] ) return [];

		return expandedObject[ "@type" ];
	}

	private getDocumentTypes( document:Document.Class ):string[] {
		if( ! document.types ) return [];
		return document.types;
	}

	private mix( target:any, source:any ):any {
		if ( ! isPlainObject( target ) || ! isPlainObject( source ) ) return;

		let keys:Set<string> = new Set( Object.keys( source ).concat(  Object.keys( target ) ) );

		for ( let key of Array.from( keys ) ) {
			if ( Utils.hasProperty( source, key ) ) {
				if ( PersistedResource.Factory.hasClassProperties( target[ key ] ) ) continue;

				this.mix( target[ key ], source[ key ] );
				target[ key ] = source[ key ];
			} else {
				if ( Utils.isArray( target ) ) {
					(< Array<any> > target).splice( parseFloat( key ), 1 );
				} else {
					delete target[ key ];
				}
			}
		}

		return target;
	}

}

function isPlainObject( element:any ):boolean {
	return Utils.isObject( element )
		&& ! Utils.isMap( element )
		&& ! Utils.isDate( element );
}

export default Documents;
