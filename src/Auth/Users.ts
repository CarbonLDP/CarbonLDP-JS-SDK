import * as Context from "./../Context";
import * as Errors from "./../Errors";
import * as HTTP from "./../HTTP";
import * as Pointer from "./../Pointer";
import * as URI from "./../RDF/URI";
import * as Credentials from "./Credentials";
import * as PersistedCredentials from "./PersistedCredentials";
import * as PersistedUser from "./PersistedUser";
import { promiseMethod } from "../Utils";

export class Class {
	private context:Context.Class;

	constructor( context:Context.Class ) {
		this.context = context;
	}

	register( email:string, password:string, enabled?:boolean ):Promise<[ PersistedUser.Class, HTTP.Response.Class ]> {
		const credentials:Credentials.Class = Credentials.Factory.create( email, password );
		credentials.enabled = enabled;
		return promiseMethod( () => {
			const containerURI:string = this.getCredentialsContainerURI();
			return this.context.documents.createChildAndRetrieve<PersistedCredentials.Class>( containerURI, credentials as any );
		} ).then<[ PersistedUser.Class, HTTP.Response.Class ]>( ( [ persistedCredentials, response ] ) => {
			return [ persistedCredentials.user, response ];
		} );
	}

	get( userURI:string, requestOptions?:HTTP.Request.Options ):Promise<[ PersistedUser.Class, HTTP.Response.Class ]> {
		return new Promise( resolve =>
			resolve( this.context.documents.get( this.resolveURI( userURI ), requestOptions ) )
		);
	}

	enableCredentials( userURI:string, requestOptions?:HTTP.Request.Options ):Promise<[ PersistedUser.Class, HTTP.Response.Class[] ]> {
		return this.changeEnabledStatus( userURI, true, requestOptions );
	}

	disableCredentials( userURI:string, requestOptions?:HTTP.Request.Options ):Promise<[ PersistedUser.Class, HTTP.Response.Class[] ]> {
		return this.changeEnabledStatus( userURI, false, requestOptions );
	}

	delete( userURI:string, requestOptions?:HTTP.Request.Options ):Promise<HTTP.Response.Class> {
		return new Promise( resolve =>
			resolve( this.context.documents.delete( this.resolveURI( userURI ), requestOptions ) )
		);
	}

	private changeEnabledStatus( userURI:string, value:boolean, requestOptions?:HTTP.Request.Options ):Promise<[ PersistedUser.Class, HTTP.Response.Class[] ]> {
		return Promise.resolve().then( () => {
			const absoluteUserURI:string = this.resolveURI( userURI );
			const userPointer:Pointer.Class = this.context.documents.getPointer( absoluteUserURI );
			const persistedUser:PersistedUser.Class = PersistedUser.Factory.decorate( userPointer, this.context.documents );

			if( value ) return persistedUser.enableCredentials( requestOptions );
			return persistedUser.disableCredentials( requestOptions );
		} );
	}

	private resolveURI( relativeURI:string ):string {
		const usersContainer:string = this.getContainerURI();
		const absoluteRoleURI:string = URI.Util.resolve( usersContainer, relativeURI );
		if( ! absoluteRoleURI.startsWith( usersContainer ) ) throw new Errors.IllegalArgumentError( `The provided URI "${ relativeURI }" isn't a valid Carbon LDP user.` );

		return absoluteRoleURI;
	}

	private getContainerURI():string {
		return this.context._resolvePath( "users" );
	}

	private getCredentialsContainerURI():string {
		return this.context._resolvePath( "system.credentials" );
	}
}

export default Class;
