import { Context } from "../Context";
import * as Errors from "../Errors";
import { RequestOptions } from "../HTTP";
import { Pointer } from "../Pointer";
import * as Utils from "../Utils";
import { CS } from "../Vocabularies";
import { Authenticator } from "./Authenticator";
import { AuthMethod } from "./AuthMethod";
import { BasicAuthenticator } from "./BasicAuthenticator";
import { BasicCredentials } from "./BasicCredentials";
import { BasicToken } from "./BasicToken";
import * as Roles from "./Roles";
import { TokenAuthenticator } from "./TokenAuthenticator";
import {
	TokenCredentials,
	TokenCredentialsBase,
} from "./TokenCredentials";
import { User } from "./User";
import { UsersEndpoint } from "./UsersEndpoint";

export class AuthService {
	public readonly users:UsersEndpoint;
	public readonly roles:Roles.Class;

	protected readonly context:Context;
	protected readonly authenticators:{ [P in AuthMethod]:Authenticator<object, object> };
	protected authenticator:Authenticator<object, object>;

	protected _authenticatedUser:User;
	public get authenticatedUser():User {
		if( this._authenticatedUser ) return this._authenticatedUser;
		if( this.context.parentContext && this.context.parentContext.auth ) return this.context.parentContext.auth.authenticatedUser;

		return null;
	}

	public Permission:{
		READ:Pointer;
		UPDATE:Pointer;
		DELETE:Pointer;
		CREATE_CHILD:Pointer;
		CREATE_ACCESS_POINT:Pointer;
		ADD_MEMBER:Pointer;
		REMOVE_MEMBER:Pointer;
		CONTROL_ACCESS:Pointer;
		IMPERSONATE:Pointer;
	};

	constructor( context:Context ) {
		this.context = context;

		const usersIRI:string = context._resolvePath( "users" );
		this.users = context.documents.register( usersIRI );
		UsersEndpoint.decorate( this.users, this.context.documents );

		this.roles = new Roles.Class( context );

		this.authenticators = {
			[ AuthMethod.BASIC ]: new BasicAuthenticator( this.context ),
			[ AuthMethod.TOKEN ]: new TokenAuthenticator( this.context ),
		};

		this.Permission = {
			READ: context.documents.getPointer( CS.Read ),
			UPDATE: context.documents.getPointer( CS.Update ),
			DELETE: context.documents.getPointer( CS.Delete ),
			CREATE_CHILD: context.documents.getPointer( CS.CreateChild ),
			CREATE_ACCESS_POINT: context.documents.getPointer( CS.CreateAccessPoint ),
			ADD_MEMBER: context.documents.getPointer( CS.AddMember ),
			REMOVE_MEMBER: context.documents.getPointer( CS.RemoveMember ),
			CONTROL_ACCESS: context.documents.getPointer( CS.ControlAccess ),
			IMPERSONATE: context.documents.getPointer( CS.Impersonate ),
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
			} ).then( ( persistedUser:User ) => {
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
