import { ObjectSchema } from "../ObjectSchema";
import { Pointer } from "../Pointer";
import { Resource } from "../Resource";
import {
	CS,
	XSD,
} from "../Vocabularies";


export interface LDAPCredentials extends Resource {
	ldapServer:Pointer;
	ldapUserDN:string;
}


export interface LDAPCredentialsFactory {
	TYPE:CS[ "LDAPCredentials" ];
	SCHEMA:ObjectSchema;
}

const SCHEMA:ObjectSchema = {
	"ldapServer": {
		"@id": CS.ldapServer,
		"@type": "@id",
	},
	"ldapUserDN": {
		"@id": CS.ldapUserDN,
		"@type": XSD.string,
	},
};

export const LDAPCredentials:LDAPCredentialsFactory = {
	TYPE: CS.LDAPCredentials,
	SCHEMA,
};