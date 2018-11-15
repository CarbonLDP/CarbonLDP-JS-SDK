import { Document } from "../Document";
import { ObjectSchema } from "../ObjectSchema";
import {
	CS,
	XSD
} from "../Vocabularies";


export interface PasswordSecret extends Document {
	hashedPassword?:string;
}


export interface PasswordSecretFactory {
	TYPE:CS[ "PasswordSecret" ];
	SCHEMA:ObjectSchema;
}

export const PasswordSecret:PasswordSecretFactory = {
	TYPE: CS.PasswordSecret,
	SCHEMA: {
		"hashedPassword": {
			"@id": CS.hashedPassword,
			"@type": XSD.string,
		},
	},
};
