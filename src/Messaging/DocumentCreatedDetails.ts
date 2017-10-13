import * as NS from "./../NS";
import * as ObjectSchema from "./../ObjectSchema";
import * as Pointer from "./../Pointer";
import * as Resource from "./../Resource";

export const RDF_CLASS:string = NS.C.Class.DocumentCreatedDetails;

export const SCHEMA:ObjectSchema.Class = {
	"createdDocuments": {
		"@id": NS.C.Predicate.createdDocument,
		"@type": "@id",
		"@container": "@set",
	},
};

export interface Class extends Resource.Class {
	createdDocuments:Pointer.Class[];
}

export default Class;