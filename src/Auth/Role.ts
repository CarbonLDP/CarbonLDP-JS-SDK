import { Document } from "../Document";
import { IllegalArgumentError } from "../Errors/IllegalArgumentError";
import { CS } from "../Vocabularies/CS";
import { XSD } from "../Vocabularies/XSD";
import * as ObjectSchema from "./../ObjectSchema";
import * as Utils from "./../Utils";

export const RDF_CLASS:string = CS.Role;

export const SCHEMA:ObjectSchema.ObjectSchema = {
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
};

export interface Class extends Document {
	name:string;
	description?:string;
}

export class Factory {
	static hasClassProperties( object:Object ):boolean {
		return Utils.hasPropertyDefined( object, "name" );
	}

	static is( object:Object ):boolean {
		return Factory.hasClassProperties( object )
			&& Document.is( object )
			;
	}

	static create( name:string, description?:string ):Class {
		return Factory.createFrom<object>( {}, name, description );
	}

	static createFrom<T extends object>( object:T, name:string, description?:string ):T & Class {
		if( ! Document.isDecorated( object ) ) object = Document.createFrom( object );

		if( ! name ) throw new IllegalArgumentError( "The name cannot be empty." );

		let role:T & Class = <T & Class> object;
		role.name = name;
		role.description = description;

		return role;
	}

}

export default Class;
