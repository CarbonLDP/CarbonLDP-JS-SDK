import { ObjectSchema } from "../../ObjectSchema";
import { ProtectedDocument } from "../../ProtectedDocument";
import {
	CS,
	XSD
} from "../../Vocabularies";
import {
	TransientUser,
	TransientUserFactory
} from "./TransientUser";


export interface User extends ProtectedDocument {
	name?:string;
}


export interface UserFactory extends TransientUserFactory {
	TYPE:CS[ "User" ];
	SCHEMA:ObjectSchema;

	is( value:any ):value is User;
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
		"credentialSet": {
			"@id": CS.credentialSet,
			"@type": "@id",
		},
	},


	is( value:any ):value is User {
		return ProtectedDocument.is( value )
			&& value.hasType( User.TYPE )
			;
	},


	create: TransientUser.create,
	createFrom: TransientUser.createFrom,
};
