import { TransientDocument } from "../../Document";
import { CS } from "../../Vocabularies";
import { UsernameAndPasswordCredentials } from "../UsernameAndPasswordCredentials";
import { BaseUser } from "./BaseUser";


export interface TransientUser extends TransientDocument {
	name?:string;
	credentials?:UsernameAndPasswordCredentials;
}


export interface TransientUserFactory {
	TYPE:CS[ "User" ];


	is( value:any ):value is TransientUser;


	create<T extends object>( data:T & BaseUser ):T & TransientUser;

	createFrom<T extends object>( object:T & BaseUser ):T & TransientUser;
}

export const TransientUser:TransientUserFactory = {
	TYPE: CS.User,


	is( value:any ):value is TransientUser {
		return TransientDocument.is( value )
			&& value.hasOwnProperty( "credentials" )
			;
	},


	create<T extends object>( data:T & BaseUser ):T & TransientUser {
		const copy:T & BaseUser = Object.assign( {}, data );
		return TransientUser.createFrom( copy );
	},

	createFrom<T extends object>( object:T & BaseUser ):T & TransientUser {
		const user:T & TransientUser = TransientDocument.decorate( object );
		user._normalize();

		user.addType( TransientUser.TYPE );

		return user;
	},
};
