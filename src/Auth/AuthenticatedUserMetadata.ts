import { VolatileResource } from "../LDP";
import { ObjectSchema } from "../ObjectSchema";
import { Pointer } from "../Pointer";
import { CS } from "../Vocabularies";


export interface AuthenticatedUserMetadata extends VolatileResource {
	user:Pointer;
}


export interface AuthenticatedUserMetadataFactory {
	TYPE:CS[ "AuthenticatedUserMetadata" ];
	SCHEMA:ObjectSchema;
}

const SCHEMA:ObjectSchema = {
	"user": {
		"@id": CS.user,
		"@type": "@id",
	},
};

export const AuthenticatedUserMetadata:AuthenticatedUserMetadataFactory = {
	TYPE: CS.AuthenticatedUserMetadata,
	SCHEMA,
};

