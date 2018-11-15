import { ObjectSchema } from "../ObjectSchema";
import { Pointer } from "../Pointer";
import { CS } from "../Vocabularies";


// TODO: Add $tokens AccessPoint
export interface CredentialSet extends Document {
	user:Pointer;
}


export interface CredentialSetFactory {
	TYPE:CS[ "CredentialSet" ];
	SCHEMA:ObjectSchema;
}

const SCHEMA:ObjectSchema = {
	"user": {
		"@id": CS.user,
		"@type": "@id",
	},
};

export const CredentialSet:CredentialSetFactory = {
	TYPE: CS.CredentialSet,
	SCHEMA,
};
