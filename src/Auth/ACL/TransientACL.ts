import { TransientDocument } from "../../Document";
import { Pointer } from "../../Pointer";
import { CS } from "../../Vocabularies";
import { ACE } from "../ACE";
import { BaseACL } from "./BaseACL";


export interface TransientACL extends TransientDocument {
	// TODO: Change to Document
	protectedDocument:Pointer;
	inherits?:boolean;
	directACEntries?:ACE[];
	immediateDescendantsACEntries?:ACE[];
	allDescendantsACEntries?:ACE[];
}


export interface TransientACLFactory {
	TYPE:CS[ "AccessControlList" ];


	create<T extends object>( data:T & BaseACL ):T & TransientACL;

	createFrom<T extends object>( object:T & BaseACL ):T & TransientACL;
}


export const TransientACL:TransientACLFactory = {
	TYPE: CS.AccessControlList,


	create<T extends object>( data:T & BaseACL ):T & TransientACL {
		const copy:T & BaseACL = Object.assign( {}, data );
		return TransientACL.createFrom( copy );
	},

	createFrom<T extends object>( object:T & BaseACL ):T & TransientACL {
		const document:T & TransientACL = TransientDocument.createFrom( object );

		document.addType( TransientACL.TYPE );

		return document;
	},
};
