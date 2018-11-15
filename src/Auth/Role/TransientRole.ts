import { TransientDocument } from "../../Document";
import { Pointer } from "../../Pointer";
import { CS } from "../../Vocabularies";
import { BaseRole } from "./BaseRole";


export interface TransientRole extends TransientDocument {
	name?:string;
	description?:string;
	parent:Pointer | string;
}


export interface TransientRoleFactory {
	TYPE:CS[ "Role" ];


	is( value:any ):value is TransientRole;


	create<T extends object>( data:T & BaseRole ):T & TransientRole;

	createFrom<T extends object>( object:T & BaseRole ):T & TransientRole;
}

export const TransientRole:TransientRoleFactory = {
	TYPE: CS.Role,


	is( value:any ):value is TransientRole {
		return TransientDocument.is( value )
			&& value.hasOwnProperty( "parent" )
			;
	},


	create<T extends object>( data:T & BaseRole ):T & TransientRole {
		const copy:T & BaseRole = Object.assign( {}, data );
		return TransientRole.createFrom( copy );
	},

	createFrom<T extends object>( object:T & BaseRole ):T & TransientRole {
		const role:T & TransientRole = TransientDocument.isDecorated( object ) ?
			object : TransientDocument.createFrom( object );

		role.addType( TransientRole.TYPE );

		return role;
	},

};
