import { ModelSchema } from "../Model/ModelSchema";

import { ObjectSchema } from "../ObjectSchema/ObjectSchema";

import { Resource } from "../Resource/Resource";

import { C } from "../Vocabularies/C";
import { XSD } from "../Vocabularies/XSD";

import { Map } from "./Map";


/**
 * Model that represents a `c:Error`.
 * This model is returned by the server when an error occurs.
 */
export interface Error extends Resource {
	/**
	 * Code that indicates the type of error occurred.
	 */
	errorCode:string;
	/**
	 * Message that explains the error.
	 */
	errorMessage:string;
	/**
	 * `c:Map` that contains the specific elements that generated the error.
	 */
	errorParameters:Map<string, any>;
}


/**
 * Factory, decorator and utils for {@link Error}.
 */
export type ErrorFactory =
	& ModelSchema<C[ "Error" ]>;


const SCHEMA:ObjectSchema = {
	"errorCode": {
		"@id": C.errorCode,
		"@type": XSD.string,
	},
	"errorMessage": {
		"@id": C.errorMessage,
		"@language": "en",
	},
	"errorParameters": {
		"@id": C.errorParameters,
		"@type": "@id",
	},
};

/**
 * Constant with the factory, decorator and/or utils for an {@link Error} object.
 */
export const Error:{
	/**
	 * Type of the model, in this case: `https://carbonldp.com/ns/v1/platform#Error`.
	 */
	TYPE:C["Error"];

	/**
	 * Schema for the error.
	 */
	SCHEMA:ObjectSchema;
} = <ErrorFactory> {
	TYPE: C.Error,
	SCHEMA,
};
