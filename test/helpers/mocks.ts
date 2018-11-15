import { AbstractContext } from "../../src/AbstractContext";
import {
	Authenticator,
	AuthService,
	TransientUser,
	User,
} from "../../src/Auth";
import { Context } from "../../src/Context";
import { Pointer } from "../../src/Pointer";
import { ProtectedDocument } from "../../src/ProtectedDocument";


export function createMockUser( context:Context ):User {
	const pointer:Pointer = context.documents.getPointer( "https://example.com/users/my-user/" );

	return ProtectedDocument.decorate( Object.assign( pointer, {
		types: [ TransientUser.TYPE ],
		name: null,
	} ), context.documents );
}


export function createMockAuthService( context:Context, data?:{
	user?:User | true,
	authenticator?:Authenticator<any, any>,
} ):AuthService {
	data = Object.assign( {}, data );

	return new class extends AuthService {
		constructor() {
			super( context );

			if( data.user ) this._authenticatedUser = data.user === true ?
				createMockUser( this.context ) : data.user;

			if( data.authenticator ) this.authenticator = data.authenticator;
		}
	};
}


export function createMockContext( data?:{
	uri?:string | boolean,
	parentContext?:Context | boolean,
	auth?:AuthService | boolean,
} ):Context {
	data = Object.assign( {
		uri: true,
		auth: true,
	}, data );

	return new class extends AbstractContext {
		protected _baseURI:string;

		constructor() {
			super();

			this.settings = {
				paths: {
					system: {
						slug: ".system/",
						paths: {
							security: "security/",
						},
					},
					users: {
						slug: "users/",
						paths: { me: "me/" },
					},
				},
			};

			this._baseURI = data.uri !== false ? data.uri === true ?
				"https://example.com/" : data.uri : "";

			if( data.parentContext ) this._parentContext = data.parentContext === true ?
				createMockContext() : data.parentContext;

			if( data.auth ) this.auth = data.auth === true ?
				createMockAuthService( this ) : data.auth;
		}
	};
}
