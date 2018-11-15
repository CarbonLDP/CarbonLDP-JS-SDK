import { Documents } from "../Documents";
import { ProtectedDocument } from "../ProtectedDocument";


export interface RolesEndpoint extends ProtectedDocument {
}


export interface RolesEndpointFactory {
	is( value:any ):value is RolesEndpoint;

	decorate<T extends object>( object:T, documents:Documents ):T & RolesEndpoint;
}

export const RolesEndpoint:RolesEndpointFactory = {
	is( value:any ):value is RolesEndpoint {
		return ProtectedDocument.is( value )
			;
	},

	decorate<T extends object>( object:T, documents:Documents ):T & RolesEndpoint {
		ProtectedDocument.decorate( object, documents );

		return object as T & RolesEndpoint;
	},
};
