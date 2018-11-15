import { VolatileResource } from "../LDP";
import { ObjectSchema } from "../ObjectSchema";
import { Pointer } from "../Pointer";
import { TransientResource } from "../Resource";
import {
	CS,
	XSD,
} from "../Vocabularies";


export interface UsernameAndPasswordCredentialsBase {
	username:string;
	password:string;
}

export interface UsernameAndPasswordCredentials extends TransientResource {
	username?:string;
	password?:string;
	// TODO: Change to a PasswordSecret
	passwordSecret?:Pointer;
}


export interface UsernameAndPasswordCredentialsFactory {
	TYPE:CS[ "UsernameAndPasswordCredentials" ];
	SCHEMA:ObjectSchema;

	create<T extends object>( data:T & UsernameAndPasswordCredentialsBase ):T & UsernameAndPasswordCredentials & VolatileResource;

	createFrom<T extends object>( object:T & UsernameAndPasswordCredentialsBase ):T & UsernameAndPasswordCredentials & VolatileResource;
}

const SCHEMA:ObjectSchema = {
	"username": {
		"@id": CS.username,
		"@type": XSD.string,
	},
	"password": {
		"@id": CS.password,
		"@type": XSD.string,
	},
	"passwordSecret": {
		"@id": CS.passwordSecret,
		"@type": "@id",
	},
};

export const UsernameAndPasswordCredentials:UsernameAndPasswordCredentialsFactory = {
	TYPE: CS.UsernameAndPasswordCredentials,
	SCHEMA,

	create<T extends object>( data:T & UsernameAndPasswordCredentialsBase ):T & UsernameAndPasswordCredentials & VolatileResource {
		const copy:T & UsernameAndPasswordCredentialsBase = Object.assign( {}, data );
		return UsernameAndPasswordCredentials.createFrom( copy );
	},

	createFrom<T extends object>( object:T & UsernameAndPasswordCredentialsBase ):T & UsernameAndPasswordCredentials & VolatileResource {
		const credentials:T & UsernameAndPasswordCredentials = VolatileResource.createFrom<T>( object );

		credentials.addType( UsernameAndPasswordCredentials.TYPE );

		return credentials;
	},
};
