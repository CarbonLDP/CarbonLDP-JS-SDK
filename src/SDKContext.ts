import * as Auth from "./Auth";
import { ACE } from "./Auth/ACE";
import { ACL } from "./Auth/ACL";
import { AuthenticatedUserInformationAccessor } from "./Auth/AuthenticatedUserInformationAccessor";
import { AuthenticatedUserMetadata } from "./Auth/AuthenticatedUserMetadata";
import { CredentialsSet } from "./Auth/CredentialsSet";
import { LDAPCredentials } from "./Auth/LDAPCredentials";
import { AuthService } from "./Auth/Service";
import { TokenCredentials } from "./Auth/TokenCredentials";
import { User } from "./Auth/User";
import { UsernameAndPasswordCredentials } from "./Auth/UsernameAndPasswordCredentials";
import { Context } from "./Context";
import { Document } from "./Document";
import { Documents } from "./Documents";
import * as Errors from "./Errors";
import { AccessPointsMetadata } from "./LDP";
import { AddMemberAction } from "./LDP/AddMemberAction";
import { DocumentMetadata } from "./LDP/DocumentMetadata";
import { Error } from "./LDP/Error";
import { ErrorResponse } from "./LDP/ErrorResponse";
import { Map as CarbonMap } from "./LDP/Map";
import { MapEntry } from "./LDP/MapEntry";
import { RemoveMemberAction } from "./LDP/RemoveMemberAction";
import { ResponseMetadata } from "./LDP/ResponseMetadata";
import { ValidationError } from "./LDP/ValidationError";
import { AccessPointCreated } from "./Messaging/AccessPointCreated";
import { ChildCreated } from "./Messaging/ChildCreated";
import { DocumentCreatedDetails } from "./Messaging/DocumentCreatedDetails";
import { DocumentDeleted } from "./Messaging/DocumentDeleted";
import { DocumentModified } from "./Messaging/DocumentModified";
import { MemberAdded } from "./Messaging/MemberAdded";
import { MemberAddedDetails } from "./Messaging/MemberAddedDetails";
import { MemberRemoved } from "./Messaging/MemberRemoved";
import { MemberRemovedDetails } from "./Messaging/MemberRemovedDetails";
import * as ObjectSchema from "./ObjectSchema";
import { ProtectedDocument } from "./ProtectedDocument";
import { URI } from "./RDF/URI";
import * as Settings from "./Settings";
import { ValidationReport } from "./SHACL/ValidationReport";
import { ValidationResult } from "./SHACL/ValidationResult";
import { QueryMetadata } from "./SPARQL/QueryDocument/QueryMetadata";
import { PlatformInstance } from "./System/PlatformInstance";
import { PlatformMetadata } from "./System/PlatformMetadata";
import {
	isObject,
	isString,
} from "./Utils";

export class SDKContext implements Context {
	auth:AuthService;
	documents:Documents;

	get baseURI():string { return ""; }

	get parentContext():Context { return null; }

	protected settings:Settings.ContextSettings;

	protected generalObjectSchema:ObjectSchema.DigestedObjectSchema;
	protected typeObjectSchemaMap:Map<string, ObjectSchema.DigestedObjectSchema>;

	constructor() {
		this.generalObjectSchema = new ObjectSchema.DigestedObjectSchema();
		this.typeObjectSchemaMap = new Map<string, ObjectSchema.DigestedObjectSchema>();

		this.documents = new Documents( this );

		this.registerDefaultObjectSchemas();
	}

	resolve( relativeURI:string ):string {
		return URI.resolve( this.baseURI, relativeURI );
	}

	/**
	 * Resolves the path provided into an URL using the `path` settings of the context.
	 * If such path does hasn't been declared an IllegalStateError will be thrown.
	 *
	 * Example: The path `system.platform` with the default setting:
	 * ```javascript
	 * {
	 *  paths: {
	 *      system: {
	 *          slug: ".system/",
	 *          paths: { platform: "platform/" }
	 *      }
	 *  }
	 * }```,
	 * This should resolve to something like `https://example.com/.system/platform/`.
	 *
	 * @param path The dot notation string that refers the path declared in the settings
	 * of the context.
	 *
	 * @returns The absolute URI of the path provided.
	 */
	_resolvePath( path:string ):string {
		const leftSearchedPaths:string[] = path.split( "." );
		const currentSearchedPaths:string[] = [];

		let url:string = "";
		let documentPaths:Settings.DocumentPaths[ "paths" ] = this.settings && this.settings.paths;
		while( leftSearchedPaths.length ) {
			const containerKey:string = leftSearchedPaths.shift();
			currentSearchedPaths.push( containerKey );

			const containerPath:string | Settings.DocumentPaths = documentPaths ? documentPaths[ containerKey ] : null;
			if( ! containerPath ) throw new Errors.IllegalStateError( `The path "${ currentSearchedPaths.join( "." ) }" hasn't been declared.` );

			const slug:string = isString( containerPath ) ? containerPath : containerPath.slug;
			if( ! slug ) throw new Errors.IllegalStateError( `The path "${ currentSearchedPaths.join( "." ) }" doesn't have a slug set.` );

			url = URI.resolve( url, slug );
			documentPaths = isObject( containerPath ) ? containerPath.paths : null;
		}

		return this.resolve( url );
	}

	hasObjectSchema( type:string ):boolean {
		type = this._resolveTypeURI( type );
		if( this.typeObjectSchemaMap.has( type ) ) return true;
		return ! ! this.parentContext && this.parentContext.hasObjectSchema( type );
	}

	getObjectSchema( type:string = null ):ObjectSchema.DigestedObjectSchema {
		if( ! ! type ) {
			// Type specific schema
			type = this._resolveTypeURI( type );
			if( this.typeObjectSchemaMap.has( type ) ) return this.typeObjectSchemaMap.get( type );
			if( ! ! this.parentContext && this.parentContext.hasObjectSchema( type ) ) return this.parentContext.getObjectSchema( type );

			return null;
		} else {
			// General schema
			if( ! this.generalObjectSchema && ! this.parentContext )
				throw new Errors.IllegalStateError();

			const generalSchema:ObjectSchema.DigestedObjectSchema = this.generalObjectSchema || this.parentContext.getObjectSchema();
			const clonedSchema:ObjectSchema.DigestedObjectSchema = ObjectSchema.ObjectSchemaDigester
				.combineDigestedObjectSchemas( [ generalSchema ] );

			if( clonedSchema.vocab === void 0 && this.settings && this.settings.vocabulary )
				clonedSchema.vocab = this.resolve( this.settings.vocabulary );

			if( ! clonedSchema.base )
				clonedSchema.base = this.baseURI;

			return clonedSchema;
		}
	}

	extendObjectSchema( type:string, objectSchema:ObjectSchema.ObjectSchema ):void;
	extendObjectSchema( objectSchema:ObjectSchema.ObjectSchema ):void;
	extendObjectSchema( typeOrObjectSchema:any, objectSchema:ObjectSchema.ObjectSchema = null ):void {
		const type:string = objectSchema ? typeOrObjectSchema : null;
		objectSchema = ! ! objectSchema ? objectSchema : typeOrObjectSchema;

		const digestedSchema:ObjectSchema.DigestedObjectSchema = ObjectSchema.ObjectSchemaDigester.digestSchema( objectSchema );

		if( ! type ) {
			this.extendGeneralObjectSchema( digestedSchema );
		} else {
			this.extendTypeObjectSchema( digestedSchema, type );
		}
	}

	clearObjectSchema( type:string = null ):void {
		if( ! type ) {
			this.generalObjectSchema = ! ! this.parentContext ? null : new ObjectSchema.DigestedObjectSchema();
		} else {
			type = this._resolveTypeURI( type );
			this.typeObjectSchemaMap.delete( type );
		}
	}

	protected extendGeneralObjectSchema( digestedSchema:ObjectSchema.DigestedObjectSchema ):void {
		let digestedSchemaToExtend:ObjectSchema.DigestedObjectSchema;
		if( ! ! this.generalObjectSchema ) {
			digestedSchemaToExtend = this.generalObjectSchema;
		} else if( ! ! this.parentContext ) {
			digestedSchemaToExtend = this.parentContext.getObjectSchema();
		} else {
			digestedSchemaToExtend = new ObjectSchema.DigestedObjectSchema();
		}

		this.generalObjectSchema = ObjectSchema.ObjectSchemaDigester.combineDigestedObjectSchemas( [
			digestedSchemaToExtend,
			digestedSchema,
		] );
	}

	protected extendTypeObjectSchema( digestedSchema:ObjectSchema.DigestedObjectSchema, type:string ):void {
		type = this._resolveTypeURI( type );
		let digestedSchemaToExtend:ObjectSchema.DigestedObjectSchema;

		if( this.typeObjectSchemaMap.has( type ) ) {
			digestedSchemaToExtend = this.typeObjectSchemaMap.get( type );
		} else if( ! ! this.parentContext && this.parentContext.hasObjectSchema( type ) ) {
			digestedSchemaToExtend = this.parentContext.getObjectSchema( type );
		} else {
			digestedSchemaToExtend = new ObjectSchema.DigestedObjectSchema();
		}

		let extendedDigestedSchema:ObjectSchema.DigestedObjectSchema = ObjectSchema.ObjectSchemaDigester.combineDigestedObjectSchemas( [
			digestedSchemaToExtend,
			digestedSchema,
		] );

		this.typeObjectSchemaMap.set( type, extendedDigestedSchema );
	}

	private registerDefaultObjectSchemas():void {
		this.extendObjectSchema( Document.TYPE, Document.SCHEMA );
		this.extendObjectSchema( ProtectedDocument.TYPE, ProtectedDocument.SCHEMA );

		this.extendObjectSchema( PlatformMetadata.TYPE, PlatformMetadata.SCHEMA );
		this.extendObjectSchema( PlatformInstance.TYPE, PlatformInstance.SCHEMA );

		this.extendObjectSchema( AddMemberAction.TYPE, AddMemberAction.SCHEMA );
		this.extendObjectSchema( Error.TYPE, Error.SCHEMA );
		this.extendObjectSchema( CarbonMap.TYPE, CarbonMap.SCHEMA );
		this.extendObjectSchema( MapEntry.SCHEMA );
		this.extendObjectSchema( DocumentMetadata.TYPE, DocumentMetadata.SCHEMA );
		this.extendObjectSchema( ErrorResponse.TYPE, ErrorResponse.SCHEMA );
		this.extendObjectSchema( RemoveMemberAction.TYPE, RemoveMemberAction.SCHEMA );
		this.extendObjectSchema( ResponseMetadata.TYPE, ResponseMetadata.SCHEMA );
		this.extendObjectSchema( ValidationError.TYPE, ValidationError.SCHEMA );

		this.extendObjectSchema( Auth.Role.RDF_CLASS, Auth.Role.SCHEMA );
		this.extendObjectSchema( ACE.TYPE, ACE.SCHEMA );
		this.extendObjectSchema( ACL.TYPE, ACL.SCHEMA );
		this.extendObjectSchema( AuthenticatedUserInformationAccessor.TYPE, AuthenticatedUserInformationAccessor.SCHEMA );
		this.extendObjectSchema( AuthenticatedUserMetadata.TYPE, AuthenticatedUserMetadata.SCHEMA );
		this.extendObjectSchema( User.TYPE, User.SCHEMA );
		this.extendObjectSchema( TokenCredentials.TYPE, TokenCredentials.SCHEMA );
		this.extendObjectSchema( CredentialsSet.TYPE, CredentialsSet.SCHEMA );
		this.extendObjectSchema( UsernameAndPasswordCredentials.TYPE, UsernameAndPasswordCredentials.SCHEMA );
		this.extendObjectSchema( LDAPCredentials.TYPE, LDAPCredentials.SCHEMA );

		this.extendObjectSchema( ValidationReport.TYPE, ValidationReport.SCHEMA );
		this.extendObjectSchema( ValidationResult.TYPE, ValidationResult.SCHEMA );

		this.extendObjectSchema( QueryMetadata.TYPE, QueryMetadata.SCHEMA );
		this.extendObjectSchema( AccessPointsMetadata.TYPE, AccessPointsMetadata.SCHEMA );

		this.extendObjectSchema( AccessPointCreated.TYPE, AccessPointCreated.SCHEMA );
		this.extendObjectSchema( ChildCreated.TYPE, ChildCreated.SCHEMA );
		this.extendObjectSchema( DocumentCreatedDetails.TYPE, DocumentCreatedDetails.SCHEMA );
		this.extendObjectSchema( DocumentDeleted.TYPE, DocumentDeleted.SCHEMA );
		this.extendObjectSchema( DocumentModified.TYPE, DocumentModified.SCHEMA );
		this.extendObjectSchema( MemberAdded.TYPE, MemberAdded.SCHEMA );
		this.extendObjectSchema( MemberAddedDetails.TYPE, MemberAddedDetails.SCHEMA );
		this.extendObjectSchema( MemberRemoved.TYPE, MemberRemoved.SCHEMA );
		this.extendObjectSchema( MemberRemovedDetails.TYPE, MemberRemovedDetails.SCHEMA );
	}

	private _resolveTypeURI( uri:string ):string {
		return ObjectSchema.ObjectSchemaUtils.resolveURI( uri, this.getObjectSchema(), { vocab: true } );
	}
}

export const globalContext:SDKContext = new SDKContext();
