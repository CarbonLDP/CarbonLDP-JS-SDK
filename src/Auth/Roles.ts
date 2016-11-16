import Context from "./../Context";
import * as Errors from "./../Errors";
import * as Pointer from "./../Pointer";
import * as HTTP from "./../HTTP";
import * as PersistedAgent from "./../Auth/PersistedAgent";
import * as PersistedDocument from "./../PersistedDocument";
import * as RetrievalPreferences from "./../RetrievalPreferences";
import * as PersistedProtectedDocument from "./../PersistedProtectedDocument";
import * as PersistedRole from "./PersistedRole";
import * as Role from "./Role";
import * as SPARQL from "./../SPARQL";
import * as URI from "./../RDF/URI";
import * as Utils from "./../Utils";

export abstract class Class {
	private context:Context;

	constructor( context:Context ) {
		this.context = context;
	}

	createChild<T>( parentRole:string | Pointer.Class, role:T & Role.Class, requestOptions?:HTTP.Request.Options ):Promise<[ T & PersistedRole.Class, [ HTTP.Response.Class, HTTP.Response.Class ] ]>;
	createChild<T>( parentRole:string | Pointer.Class, role:T & Role.Class, slug?:string, requestOptions?:HTTP.Request.Options ):Promise<[ T & PersistedRole.Class, [ HTTP.Response.Class, HTTP.Response.Class ] ]>;
	createChild<T>( parentRole:string | Pointer.Class, role:T & Role.Class, slugOrRequestOptions?:any, requestOptions?:HTTP.Request.Options ):Promise<[ T & PersistedRole.Class, [ HTTP.Response.Class, HTTP.Response.Class ] ]> {
		let parentURI:string = Utils.isString( parentRole ) ? <string> parentRole : ( <Pointer.Class> parentRole).id;
		let slug:string = Utils.isString( slugOrRequestOptions ) ? slugOrRequestOptions : null;
		requestOptions = HTTP.Request.Util.isOptions( slugOrRequestOptions ) ? slugOrRequestOptions : requestOptions;

		let containerURI:string;
		let persistedRole:T & PersistedRole.Class;
		let responseCreated:HTTP.Response.Class;
		return this.resolveURI( "" ).then( ( uri:string ) => {
			containerURI = uri;

			parentURI = URI.Util.resolve( containerURI, parentURI );
			if( ! URI.Util.isBaseOf( containerURI, parentURI ) ) throw new Errors.IllegalArgumentError( "The parent role provided is not a valid role of the current context." );
			return this.context.documents.exists( parentURI );

		} ).then( ( [ exists, response ]:[ boolean, HTTP.Response.Class ] ) => {
			if( ! exists ) throw new Errors.IllegalArgumentError( "The parent role provided does not exist." );
			return this.context.documents.createChild<T>( containerURI, role, slug, requestOptions );

		} ).then( ( [ newRole, response ]:[ T & PersistedDocument.Class, HTTP.Response.Class ] ) => {
			responseCreated = response;
			persistedRole = PersistedRole.Factory.decorate( newRole, this );
			return this.context.documents.addMember( parentURI, newRole );

		} ).then( ( responseAddMember:HTTP.Response.Class ) => {
			return [ persistedRole, [ responseCreated, responseAddMember ] ];
		} );
	}

	createChildren<T>( parentRole:string | Pointer.Class, roles:(T & Role.Class)[], requestOptions?:HTTP.Request.Options ):Promise<[ (T & PersistedRole.Class)[], HTTP.Response.Class[] ]>;
	createChildren<T>( parentRole:string | Pointer.Class, roles:(T & Role.Class)[], slugs?:string[], requestOptions?:HTTP.Request.Options ):Promise<[ (T & PersistedRole.Class)[], HTTP.Response.Class[] ]>;
	createChildren<T>( parentRole:string | Pointer.Class, roles:(T & Role.Class)[], slugsOrRequestOptions?:any, requestOptions?:HTTP.Request.Options ):Promise<[ (T & PersistedRole.Class)[], HTTP.Response.Class[] ]> {
		let parentURI:string = Utils.isString( parentRole ) ? <string> parentRole : ( <Pointer.Class> parentRole).id;
		let slugs:string[] = Utils.isArray( slugsOrRequestOptions ) ? slugsOrRequestOptions : null;
		requestOptions = HTTP.Request.Util.isOptions( slugsOrRequestOptions ) ? slugsOrRequestOptions : requestOptions;

		let containerURI:string;
		let persistedRoles:(T & PersistedRole.Class)[];
		let responsesCreated:HTTP.Response.Class[];
		return this.resolveURI( "" ).then( ( uri:string ) => {
			containerURI = uri;

			parentURI = URI.Util.resolve( containerURI, parentURI );
			if( ! URI.Util.isBaseOf( containerURI, parentURI ) ) throw new Errors.IllegalArgumentError( "The parent role provided is not a valid role of the current context." );
			return this.context.documents.exists( parentURI );

		} ).then( ( [ exists, response ]:[ boolean, HTTP.Response.Class ] ) => {
			if( ! exists ) throw new Errors.IllegalArgumentError( "The parent role provided does not exist." );
			return this.context.documents.createChildren<T>( containerURI, roles, slugs, requestOptions );

		} ).then( ( [ newRoles, responses ]:[ (T & PersistedDocument.Class)[], HTTP.Response.Class[] ] ) => {
			responsesCreated = responses;
			persistedRoles = newRoles.map( role => PersistedRole.Factory.decorate( role, this ) );
			return this.context.documents.addMembers( parentURI, newRoles );

		} ).then( ( responseAddMember:HTTP.Response.Class ) => {
			return [ persistedRoles, responsesCreated.concat( responseAddMember ) ];
		} );
	}

	createChildAndRetrieve<T>( parentRole:string | Pointer.Class, role:T & Role.Class, slug?:string, requestOptions?:HTTP.Request.Options ):Promise<[ T & PersistedRole.Class, [ HTTP.Response.Class, HTTP.Response.Class, HTTP.Response.Class ] ]>;
	createChildAndRetrieve<T>( parentRole:string | Pointer.Class, role:T & Role.Class, requestOptions?:HTTP.Request.Options ):Promise<[ T & PersistedRole.Class, [ HTTP.Response.Class, HTTP.Response.Class, HTTP.Response.Class ] ]>;
	createChildAndRetrieve<T>( parentRole:string | Pointer.Class, role:T & Role.Class, slugOrRequestOptions?:any, requestOptions?:HTTP.Request.Options ):Promise<[ T & PersistedRole.Class, [ HTTP.Response.Class, HTTP.Response.Class, HTTP.Response.Class ] ]> {
		let createResponses:[ HTTP.Response.Class, HTTP.Response.Class ];
		return this.createChild<T>( parentRole, role, slugOrRequestOptions, requestOptions ).then( ( [ document, responses ]:[ T & PersistedRole.Class, [ HTTP.Response.Class, HTTP.Response.Class ] ] ) => {
			createResponses = responses;
			return this.get<T>( document.id );
		} ).then( ( [ persistedDocument, response ]:[ T & PersistedProtectedDocument.Class, HTTP.Response.Class ] ) => {
			return [ persistedDocument, createResponses.concat( response ) ];
		} );
	}

	createChildrenAndRetrieve<T>( parentRole:string | Pointer.Class, roles:(T & Role.Class)[], requestOptions?:HTTP.Request.Options ):Promise<[ (T & PersistedRole.Class)[], [ HTTP.Response.Class[], HTTP.Response.Class[], HTTP.Response.Class ] ]>;
	createChildrenAndRetrieve<T>( parentRole:string | Pointer.Class, roles:(T & Role.Class)[], slugs?:string[], requestOptions?:HTTP.Request.Options ):Promise<[ (T & PersistedRole.Class)[], [ HTTP.Response.Class[], HTTP.Response.Class[], HTTP.Response.Class ] ]>;
	createChildrenAndRetrieve<T>( parentRole:string | Pointer.Class, roles:(T & Role.Class)[], slugsOrRequestOptions?:any, requestOptions?:HTTP.Request.Options ):Promise<[ (T & PersistedRole.Class)[], [ HTTP.Response.Class[], HTTP.Response.Class[], HTTP.Response.Class ] ]> {
		let parentURI:string = Utils.isString( parentRole ) ? <string> parentRole : ( <Pointer.Class> parentRole).id;
		let slugs:string[] = Utils.isArray( slugsOrRequestOptions ) ? slugsOrRequestOptions : null;
		requestOptions = HTTP.Request.Util.isOptions( slugsOrRequestOptions ) ? slugsOrRequestOptions : requestOptions;

		let containerURI:string;
		let persistedRoles:(T & PersistedRole.Class)[];
		let responsesCreated: ( HTTP.Response.Class[] | HTTP.Response.Class )[];
		return this.resolveURI( "" ).then( ( uri:string ) => {
			containerURI = uri;

			parentURI = URI.Util.resolve( containerURI, parentURI );
			if( ! URI.Util.isBaseOf( containerURI, parentURI ) ) throw new Errors.IllegalArgumentError( "The parent role provided is not a valid role of the current context." );
			return this.context.documents.exists( parentURI );

		} ).then( ( [ exists, response ]:[ boolean, HTTP.Response.Class ] ) => {
			if( ! exists ) throw new Errors.IllegalArgumentError( "The parent role provided does not exist." );
			return this.context.documents.createChildrenAndRetrieve<T>( containerURI, roles, slugs, requestOptions );

		} ).then( ( [ newRoles, responses ]:[ (T & PersistedDocument.Class)[], [ HTTP.Response.Class[], HTTP.Response.Class[] ] ] ) => {
			responsesCreated = responses;
			persistedRoles = newRoles.map( role => PersistedRole.Factory.decorate( role, this ) );
			return this.context.documents.addMembers( parentURI, newRoles );

		} ).then( ( responseAddMember:HTTP.Response.Class ) => {
			return [ persistedRoles, responsesCreated.concat( responseAddMember ) ];
		} );
	}

	get<T>( roleURI:string, requestOptions?:HTTP.Request.Options ):Promise<[ T & PersistedRole.Class, HTTP.Response.Class ]> {
		return this.resolveURI( roleURI ).then( ( uri:string ) => {
			return this.context.documents.get<T & PersistedRole.Class>( uri, requestOptions );
		} );
	}

	listAgents( roleURI:string, requestOptions?:HTTP.Request.Options ):Promise<[ PersistedProtectedDocument.Class[], HTTP.Response.Class ]> {
		return this.getAgentsAccessPoint( roleURI ).then( ( agentsAccessPoint:Pointer.Class ) => {
			return this.context.documents.listMembers( agentsAccessPoint.id, requestOptions );
		} ).then( ( [ agents, response ]:[ PersistedDocument.Class[], HTTP.Response.Class ] ) => {
			return [ agents.map( agent => PersistedProtectedDocument.Factory.decorate( agent ) ), response ];
		} );
	}

	getAgents<T>( roleURI:string, requestOptions?:HTTP.Request.Options ):Promise<[ (T & PersistedAgent.Class)[], HTTP.Response.Class ]>;
	getAgents<T>( roleURI:string, retrievalPreferences?:RetrievalPreferences.Class, requestOptions?:HTTP.Request.Options ):Promise<[ (T & PersistedAgent.Class)[], HTTP.Response.Class ]>;
	getAgents<T>( roleURI:string, retrievalPreferencesOrRequestOptions?:RetrievalPreferences.Class, requestOptions?:HTTP.Request.Options ):Promise<[ (T & PersistedAgent.Class)[], HTTP.Response.Class ]> {
		return this.getAgentsAccessPoint( roleURI ).then( ( agentsAccessPoint:Pointer.Class ) => {
			return this.context.documents.getMembers<T>( agentsAccessPoint.id, retrievalPreferencesOrRequestOptions, requestOptions );
		} );
	}

	addAgent( roleURI:string, agent:Pointer.Class | string, requestOptions?:HTTP.Request.Options ):Promise<HTTP.Response.Class> {
		return this.addAgents( roleURI, [ agent ], requestOptions );
	}

	addAgents( roleURI:string, agents:(Pointer.Class | string)[], requestOptions?:HTTP.Request.Options ):Promise<HTTP.Response.Class> {
		return this.getAgentsAccessPoint( roleURI ).then( ( agentsAccessPoint:Pointer.Class ) => {
			return this.context.documents.addMembers( agentsAccessPoint.id, agents, requestOptions );
		} );
	}

	removeAgent( roleURI:string, agent:Pointer.Class | string, requestOptions?:HTTP.Request.Options ):Promise<HTTP.Response.Class> {
		return this.removeAgents( roleURI, [ agent ], requestOptions );
	}

	removeAgents( roleURI:string, agents:(Pointer.Class | string)[], requestOptions?:HTTP.Request.Options ):Promise<HTTP.Response.Class> {
		return this.getAgentsAccessPoint( roleURI ).then( ( agentsAccessPoint:Pointer.Class ) => {
			return this.context.documents.removeMembers( agentsAccessPoint.id, agents, requestOptions );
		} );
	}

	private resolveURI( agentURI:string ):Promise<string> {
		return new Promise<string>( ( resolve:( uri:string ) => void ) => {
			let containerURI:string = this.context.resolve( this.getContainerURI() );
			let uri:string = URI.Util.resolve( containerURI, agentURI );

			if( ! URI.Util.isBaseOf( containerURI, uri ) ) throw new Errors.IllegalArgumentError( "The URI provided is not a valid role of the current context." );

			resolve( uri );
		} );
	}

	// TODO: Optimize
	private getAgentsAccessPoint( roleURI:string ):Promise<Pointer.Class> {
		return this.resolveURI( roleURI ).then( ( uri:string ) => {
			return this.context.documents.executeSELECTQuery( uri, ` select distinct ?agentsAccessPoint where {
				<${ uri }> <https://carbonldp.com/ns/v1/platform#accessPoint> ?agentsAccessPoint .
				?agentsAccessPoint <http://www.w3.org/ns/ldp#hasMemberRelation> <https://carbonldp.com/ns/v1/security#agent> .
			}` );
		} ).then( ( [ selectResults, response ]:[ SPARQL.SELECTResults.Class, HTTP.Response.Class ] ) => {
			return <Pointer.Class> selectResults.bindings[ 0 ][ "agentsAccessPoint" ];
		} );
	}

	private getContainerURI():string {
		if( ! this.context.hasSetting( "platform.roles.container" ) ) throw new Errors.IllegalStateError( "The roles container setting hasn't been declared." );
		return this.context.getSetting( "platform.roles.container" );
	}

}

export default Class;
