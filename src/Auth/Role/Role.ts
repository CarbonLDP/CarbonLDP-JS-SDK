import { Document } from "../../Document";
import { ObjectSchema } from "../../ObjectSchema";
import { Pointer } from "../../Pointer";
import { ProtectedDocument } from "../../ProtectedDocument";
import {
	CS,
	XSD,
} from "../../Vocabularies";
import {
	TransientRole,
	TransientRoleFactory,
} from "./TransientRole";


// TODO: extend TransientRole
export interface Role extends ProtectedDocument {
	name?:string;
	description?:string;

	parent?:Pointer;
	children?:Pointer[];

	users?:Pointer[];
}

// TODO: Extend TransientRoleFactory
export interface RoleFactory extends Pick<TransientRoleFactory, "TYPE" | "create" | "createFrom"> {
	SCHEMA:ObjectSchema;

	is( value:any ):value is Role;
}

export const Role:RoleFactory = {
	TYPE: TransientRole.TYPE,
	SCHEMA: {
		"name": {
			"@id": CS.name,
			"@type": XSD.string,
		},
		"description": {
			"@id": CS.description,
			"@type": XSD.string,
		},
		"parent": {
			"@id": CS.parent,
			"@type": "@id",
		},
		"children": {
			"@id": CS.child,
			"@type": "@id",
			"@container": "@set",
		},
		"users": {
			"@id": CS.user,
			"@type": "@id",
			"@container": "@set",
		},
	},


	is( value:any ):value is Role {
		return Document.is( value )
			&& value.hasType( Role.TYPE )
			;
	},

	create: TransientRole.create,
	createFrom: TransientRole.createFrom,
};
