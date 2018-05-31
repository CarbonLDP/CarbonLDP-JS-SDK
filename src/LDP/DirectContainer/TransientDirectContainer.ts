import { ModelFactory } from "../../core/ModelFactory";
import { TransientDocument } from "../../Document";
import { IllegalArgumentError } from "../../Errors";
import { Pointer } from "../../Pointer";
import { LDP } from "../../Vocabularies";
import { BaseDirectContainer } from "./BaseDirectContainer";


export interface TransientDirectContainer extends TransientDocument {
	membershipResource?:Pointer;
	hasMemberRelation:Pointer;
}


export interface TransientDirectContainerFactory extends ModelFactory<TransientDirectContainer> {
	TYPE:LDP[ "DirectContainer" ];

	is( value:any ):value is TransientDirectContainer;


	create<T extends object>( data:T & BaseDirectContainer ):T & TransientDirectContainer;

	createFrom<T extends object>( object:T & BaseDirectContainer ):T & TransientDirectContainer;
}

export const TransientDirectContainer:TransientDirectContainerFactory = {
	TYPE: LDP.DirectContainer,

	is( value:any ):value is TransientDirectContainer {
		return TransientDocument.is( value )
			&& value.hasType( TransientDirectContainer.TYPE )
			&& value.hasOwnProperty( "membershipResource" )
			;
	},

	create<T extends object>( data:T & BaseDirectContainer ):T & TransientDirectContainer {
		const copy:T & BaseDirectContainer = Object.assign( {}, data );
		return TransientDirectContainer.createFrom( copy );
	},

	createFrom<T extends object>( object:T & BaseDirectContainer ):T & TransientDirectContainer {
		if( TransientDirectContainer.is( object ) ) throw new IllegalArgumentError( "The base object is already a DirectContainer." );

		if( ! object.hasMemberRelation ) throw new IllegalArgumentError( "The property hasMemberRelation is required." );

		const container:T & TransientDirectContainer = TransientDocument.is( object ) ?
			object : TransientDocument.createFrom( object );

		container.addType( TransientDirectContainer.TYPE );
		// TODO: Handle properties correctly and validate them (hasMemberRelation, isMemberOfRelation)

		return container;
	},
};
