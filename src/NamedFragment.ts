import { TransientDocument } from "./TransientDocument";
import { TransientFragment } from "./TransientFragment";
import { ModelDecorator } from "./ModelDecorator";
import { ModelFactory } from "./ModelFactory";
import { URI } from "./RDF/URI";
import { isObject } from "./Utils";

export interface NamedFragment extends TransientFragment {
	slug:string;
}


export interface NamedFragmentFactory extends ModelFactory<NamedFragment>, ModelDecorator<NamedFragment> {
	isDecorated( object:object ):object is NamedFragment;

	is( object:object ):object is NamedFragment;


	create( document:TransientDocument, slug:string ):NamedFragment;

	createFrom<T extends object>( object:T, document:TransientDocument, slug:string ):T & NamedFragment;

	decorate<T extends object>( object:T ):T & NamedFragment;
}

export const NamedFragment:NamedFragmentFactory = {
	isDecorated( object:object ):object is NamedFragment {
		return isObject( object ) &&
			object.hasOwnProperty( "slug" ) && ! object.propertyIsEnumerable( "slug" )
			;
	},

	is( object:object ):object is NamedFragment {
		return TransientFragment.is( object )
			&& NamedFragment.isDecorated( object )
			;
	},

	create( document:TransientDocument, slug:string ):NamedFragment {
		return this.createFrom( {}, document, slug );
	},

	createFrom<T extends object>( object:T, document:TransientDocument, slug:string ):T & NamedFragment {
		const id:string = document.id + "#" + slug;
		const fragment:T & TransientFragment = TransientFragment.createFrom( object, document, id );

		return NamedFragment.decorate( fragment );
	},

	decorate<T extends object>( object:T ):T & NamedFragment {
		if( NamedFragment.isDecorated( object ) ) return object;

		const namedFragment:T & NamedFragment = object as T & NamedFragment;
		Object.defineProperties( namedFragment, {
			"slug": {
				enumerable: false,
				configurable: true,
				get( this:NamedFragment ):string {
					return URI.getFragment( this.id );
				},
				set( this:NamedFragment, value:string ):void {
					this.id = this._document.id + "#" + value;
				},
			},
		} );

		return namedFragment;
	},
};
