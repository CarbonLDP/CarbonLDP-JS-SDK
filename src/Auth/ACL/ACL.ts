import { Document } from "../../Document";
import { ObjectSchema } from "../../ObjectSchema";
import { Pointer } from "../../Pointer";
import { CS } from "../../Vocabularies";
import { ACE } from "../ACE";
import {
	TransientACL,
	TransientACLFactory,
} from "./TransientACL";


export interface ACL extends Document {
	// TODO: Change to Document
	protectedDocument?:Pointer;
	inherits?:boolean;
	directACEntries?:ACE[];
	immediateDescendantsACEntries?:ACE[];
	allDescendantsACEntries?:ACE[];
}


export interface ACLFactory extends TransientACLFactory {
	SCHEMA:ObjectSchema;
}

export const ACL:ACLFactory = {
	TYPE: TransientACL.TYPE,
	SCHEMA: {
		"protectedDocument": {
			"@id": CS.protectedDocument,
			"@type": "@id",
		},
		"inherits": {
			"@id": CS.inherits,
			"@type": "@id",
		},
		"directACEntries": {
			"@id": CS.directACEntry,
			"@type": "@id",
			"@container": "@set",
		},
		"immediateDescendantsACEntries": {
			"@id": CS.immediateDescendantsACEntry,
			"@type": "@id",
			"@container": "@set",
		},
		"allDescendantsACEntries": {
			"@id": CS.allDescendantsACEntry,
			"@type": "@id",
			"@container": "@set",
		},
	},

	create: TransientACL.create,
	createFrom: TransientACL.createFrom,
};
