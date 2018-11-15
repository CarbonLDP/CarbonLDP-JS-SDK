import { Documents } from "../../Documents";
import { ObjectSchema } from "../../ObjectSchema";
import { Pointer } from "../../Pointer";
import { ProtectedDocument } from "../../ProtectedDocument";
import {
	CS,
	XSD
} from "../../Vocabularies";
import { UsernameAndPasswordCredentials } from "../UsernameAndPasswordCredentials";
import {
	TransientUser,
	TransientUserFactory
} from "./TransientUser";


export interface User extends ProtectedDocument {
	name?:string;
	credentials?:UsernameAndPasswordCredentials;
	roles?:Pointer[];

	updateCredentials( username?:string, password?:string ):UsernameAndPasswordCredentials;
}


export interface UserFactory extends TransientUserFactory {
	TYPE:CS[ "User" ];
	SCHEMA:ObjectSchema;

	is( value:any ):value is User;

	isDecorated( object:object ):object is User;


	decorate<T extends object>( object:T, documents:Documents ):User & T;
}


export const User:UserFactory = {
	TYPE: TransientUser.TYPE,
	SCHEMA: {
		"name": {
			"@id": CS.name,
			"@type": XSD.string,
		},
		"credentials": {
			"@id": CS.credentials,
			"@type": "@id",
		},
		"roles": {
			"@id": CS.role,
			"@type": "@id",
			"@container": "@set",
		},
	},


	isDecorated( object:object ):object is User {
		return ProtectedDocument.isDecorated( object )
			&& TransientUser.isDecorated( object )
			;
	},

	is( value:any ):value is User {
		return TransientUser.isDecorated( value )
			&& ProtectedDocument.is( value )
			;
	},


	decorate<T extends object>( object:T, documents:Documents ):User & T {
		TransientUser.decorate( object );
		ProtectedDocument.decorate( object, documents );

		const persistedUser:T & User = object as T & User;
		persistedUser.addType( TransientUser.TYPE );

		return persistedUser;
	},

	create: TransientUser.create,
	createFrom: TransientUser.createFrom,
};
