import { ModelSchema } from "../../core/ModelSchema";
import { TransientFragment } from "../../Fragment";
import { ObjectSchema } from "../../ObjectSchema";
import { Pointer } from "../../Pointer";
import { TransientResource } from "../../Resource";
import { CS } from "../../Vocabularies";
import { BaseACE } from "./BaseACE";


export interface ACE extends TransientResource {
	subject:Pointer;
	permissions:Pointer[];
}


export interface ACEFactory extends ModelSchema {
	TYPE:CS[ "AccessControlEntry" ];
	SCHEMA:ObjectSchema;


	create<T extends object>( data:T & BaseACE ):T & ACE;

	createFrom<T extends object>( object:T & BaseACE ):T & ACE;
}

export const ACE:ACEFactory = {
	TYPE: CS.AccessControlEntry,
	SCHEMA: {
		"permissions": {
			"@id": CS.permission,
			"@type": "@id",
			"@container": "@set",
		},
		"subject": {
			"@id": CS.subject,
			"@type": "@id",
		},
	},


	create<T extends object>( data:T & BaseACE ):T & ACE {
		const copy:T & BaseACE = Object.assign( {}, data );
		return ACE.createFrom( copy );
	},

	createFrom<T extends object>( object:T & BaseACE ):T & ACE {
		const ace:T & ACE = TransientFragment.decorate( object );

		ace.addType( ACE.TYPE );

		return ace;
	},
};
