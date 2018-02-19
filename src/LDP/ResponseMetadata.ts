import * as NS from "../Vocabularies/index";
import * as ObjectSchema from "./../ObjectSchema";
import * as DocumentMetadata from "./DocumentMetadata";
import * as VolatileResource from "./VolatileResource";
import * as Utils from "./../Utils";

export const RDF_CLASS:string = NS.C.ResponseMetadata;

export const SCHEMA:ObjectSchema.Class = {
	"documentsMetadata": {
		"@id": NS.C.documentMetadata,
		"@type": "@id",
		"@container": "@set",
	},
};

export interface Class extends VolatileResource.Class {
	documentsMetadata?:DocumentMetadata.Class[];
}

export class Factory {

	static is( object:object ):object is Class {
		return VolatileResource.Factory.is( object )
			&& object.hasType( RDF_CLASS );
	}

}

export default Class;
