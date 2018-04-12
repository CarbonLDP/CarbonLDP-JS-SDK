import { Context } from "../Context";
import * as Errors from "../Errors";
import { RequestOptions } from "../HTTP";
import * as Utils from "../Utils";
import { Authenticator } from "./Authenticator";
import { AuthMethod } from "./AuthMethod";
import { BasicAuthenticator } from "./BasicAuthenticator";
import { BasicCredentials } from "./BasicCredentials";
import { BasicToken } from "./BasicToken";
import { PersistedUser } from "./PersistedUser";
import { RolesEndpoint } from "./RolesEndpoint";
import { TokenAuthenticator } from "./TokenAuthenticator";
import {
	TokenCredentials,
	TokenCredentialsBase,
} from "./TokenCredentials";
import { UsersEndpoint } from "./UsersEndpoint";

export class AuthService {
	public readonly users:UsersEndpoint;
	public readonly roles:RolesEndpoint;

	protected readonly context:Context;
	protected readonly authenticators:{ [P in AuthMethod]:Authenticator<object, object> };
	protected authenticator:Authenticator<object, object>;

	protected _authenticatedUser:PersistedUser;
	public get authenticatedUser():PersistedUser {
		if( this._authenticatedUser ) return this._authenticatedUser;
		if( this.context.parentContext && this.context.parentContext.auth ) return this.context.parentContext.auth.authenticatedUser;

		return null;
	}

	constructor( context:Context ) {
		this.context = context;

		const usersIRI:string = context._resolvePath( "users" );
		this.users = context.documents.register( usersIRI );
		UsersEndpoint.decorate( this.users, this.context.documents );

		const rolesIRI:string = context._resolvePath( "system.security.roles" );
		this.roles = context.documents.register( rolesIRI );
		UsersEndpoint.decorate( this.roles, this.context.documents );

		this.authenticators = {
			[ AuthMethod.BASIC ]: new BasicAuthenticator( this.context ),
			[ AuthMethod.TOKEN ]: new TokenAuthenticator( this.context ),
		};
	}

	isAuthenticated( askParent:boolean = true ):boolean {
		return (
			(this.authenticator && this.authenticator.isAuthenticated()) ||
			(askParent && ! ! this.context.parentContext && ! ! this.context.parentContext.auth && this.context.parentContext.auth.isAuthenticated())
		);
	}

	authenticate( username:string, password:string ):Promise<TokenCredentials> {
		return this.authenticateUsing( AuthMethod.TOKEN, username, password );
	}

	authenticateUsing( method:AuthMethod.BASIC, username:string, password:string ):Promise<BasicCredentials>;
	authenticateUsing( method:AuthMethod.TOKEN, username:string, password:string ):Promise<TokenCredentials>;
	authenticateUsing( method:AuthMethod.TOKEN, token:TokenCredentialsBase ):Promise<TokenCredentials>;
	authenticateUsing( method:AuthMethod, userOrCredentials:string | TokenCredentialsBase, password?:string ):Promise<BasicCredentials | TokenCredentials> {
		this.clearAuthentication();

		const authenticator:Authenticator<any, any> = this.authenticators[ method ];
		if( ! authenticator ) return Promise.reject( new Errors.IllegalArgumentError( `Invalid authentication method "${method}".` ) );

		let authenticationToken:BasicToken | TokenCredentialsBase;
		if( Utils.isString( userOrCredentials ) )
			authenticationToken = new BasicToken( userOrCredentials, password );
		else if( TokenCredentialsBase.is( userOrCredentials ) ) {
			authenticationToken = userOrCredentials;
		} else {
			return Promise.reject( new Errors.IllegalArgumentError( "Invalid authentication token." ) );
		}

		let credentials:BasicCredentials | TokenCredentials;
		return authenticator
			.authenticate( authenticationToken )
			.then( ( _credentials ) => {
				credentials = _credentials;

				return authenticator
					.getAuthenticatedUser();
			} ).then( ( persistedUser:PersistedUser ) => {
				this._authenticatedUser = persistedUser;
				this.authenticator = authenticator;

				return credentials;
			} );
	}

	addAuthentication( requestOptions:RequestOptions ):void {
		if( this.isAuthenticated( false ) ) {
			this.authenticator.addAuthentication( requestOptions );
		} else if( ! ! this.context.parentContext && ! ! this.context.parentContext.auth ) {
			this.context.parentContext.auth.addAuthentication( requestOptions );
		} else {
			console.warn( "There is no authentication to add to the request." );
		}
	}

	clearAuthentication():void {
		if( ! this.authenticator ) return;

		this.authenticator.clearAuthentication();
		this.authenticator = null;
		this._authenticatedUser = null;
	}

}
