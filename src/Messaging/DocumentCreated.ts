import * as NS from "./../NS";
import * as ObjectSchema from "./../ObjectSchema";
import * as DocumentCreatedDetails from "./DocumentCreatedDetails";
import * as Message from "./Message";

export const SCHEMA:ObjectSchema.Class = {
	...Message.SCHEMA,
	"details": {
		"@id": NS.C.Predicate.details,
		"@type": "@id",
	},
};

export interface Class extends Message.Class {
	details:DocumentCreatedDetails.Class;
}

export default Class;
