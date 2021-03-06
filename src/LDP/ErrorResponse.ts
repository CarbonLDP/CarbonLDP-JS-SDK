import { ModelSchema } from "../Model/ModelSchema";

import { ObjectSchema } from "../ObjectSchema/ObjectSchema";

import { Resource } from "../Resource/Resource";

import { C } from "../Vocabularies/C";
import { XSD } from "../Vocabularies/XSD";

import { Error } from "./Error";


/**
 * Model that represents a `c:ErrorResponse`.
 * This model is returned as the response of a request when any error occurs.
 */
export interface ErrorResponse extends Resource {
	/**
	 * Set of all the errors that the request generated.
	 */
	errors:Error[];
	/**
	 * String that identifies the request that caused the error.
	 */
	requestID:string;
	/**
	 * The HTTP status code for the general error of the request.
	 */
	statusCode:number;
}


/**
 * Factory, decorator and utils for {@link ErrorResponse}.
 */
// TODO: Change to type-alias
export interface ErrorResponseFactory extends ModelSchema {
	TYPE:C[ "ErrorResponse" ];
	SCHEMA:ObjectSchema;


	is( value:any ):value is ErrorResponse;


	getMessage( errorResponse:ErrorResponse ):string;
}

const SCHEMA:ObjectSchema = {
	"errors": {
		"@id": C.error,
		"@type": "@id",
		"@container": "@set",
	},
	"requestID": {
		"@id": C.requestID,
		"@type": XSD.string,
	},
	"statusCode": {
		"@id": C.httpStatusCode,
		"@type": XSD.int,
	},
};

/**
 * Constant with the factory, decorator and/or utils for an {@link ErrorResponse} object.
 */
export const ErrorResponse:{
	/**
	 * Type of the model, in this case: `https://carbonldp.com/ns/v1/platform#ErrorResponse`.
	 */
	TYPE:C["ErrorResponse"];

	/**
	 * Schema for the {@link ErrorResponse}.
	 */
	SCHEMA:ObjectSchema;

	/**
	 * Returns true when the value provided is considered to be an {@link ErrorResponse}.
	 */
	is( value:any ):value is ErrorResponse;

	/**
	 *  Gets the errors from the Error Response.
	 */
	getMessage( errorResponse:ErrorResponse ):string;
} = <ErrorResponseFactory> {
	TYPE: C.ErrorResponse,
	SCHEMA,


	is( value:any ):value is ErrorResponse {
		return Resource.is( value )
			&& value.$hasType( ErrorResponse.TYPE )
			;
	},


	getMessage( errorResponse:ErrorResponse ):string {
		return errorResponse.errors
			.map( error => error.errorMessage )
			.join( ", " );
	},

};
