import { AbstractContext } from "../../../src/AbstractContext";
import { AuthService } from "../../../src/Auth";
import { Context } from "../../../src/Context";

import { createMockAuthService } from "./auth";


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
							security: {
								slug: "security/",
								paths: {
									roles: "roles/",
								},
							},
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
				createMockAuthService( { context: this } ) : data.auth;
		}
	};
}
