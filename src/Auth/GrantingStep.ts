import { ObjectSchema } from "../ObjectSchema";
import { Pointer } from "../Pointer";
import { TransientResource } from "../Resource";
import {
	CS,
	XSD
} from "../Vocabularies";


export interface GrantingStep extends TransientResource {
	subject?:Pointer;

	applied:boolean;
	appliedBy:Pointer;
	protectedDocument:Pointer;
	accessControlList:Pointer;

	inheritanceDisabledBy?:Pointer[];
}


export interface GrantingStepFactory {
	TYPE:CS[ "GrantingStep" ];
	SCHEMA:ObjectSchema;
}

export const GrantingStep:GrantingStepFactory = {
	TYPE: CS.GrantingStep,
	SCHEMA: {
		"subject": {
			"@id": CS.subject,
			"@type": "@id",
		},
		"applied": {
			"@id": CS.applied,
			"@type": XSD.boolean,
		},
		"appliedBy": {
			"@id": CS.appliedBy,
			"@type": "@id",
		},
		"protectedDocument": {
			"@id": CS.protectedDocument,
			"@type": "@id",
		},
		"accessControlList": {
			"@id": CS.accessControlList,
			"@type": "@id",
		},
		"inheritanceDisabledBy": {
			"@id": CS.inheritanceDisabledBy,
			"@type": "@id",
			"@container": "@list",
		},
	},
};
