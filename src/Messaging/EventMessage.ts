import { Document } from "../Document/Document";

import { ObjectSchema } from "../ObjectSchema/ObjectSchema";

import { Resource } from "../Resource/Resource";

import { C } from "../Vocabularies/C";


/**
 * Base model for every notification message in a subscription event.
 */
export interface EventMessage extends Resource {
	/**
	 * Target document where the event occurred.
	 */
	target:Document;
}


// TODO: Change to type-alias
/**
 * Factory, decorator and utils for {@link EventMessage}.
 */
export interface EventMessageFactory {
	SCHEMA:ObjectSchema;

	is( value:any ):value is EventMessage;
}

const SCHEMA:ObjectSchema = {
	"target": {
		"@id": C.target,
		"@type": "@id",
	},
};

/**
 * Constant with the factory, decorator and/or utils for an {@link EventMessage} object.
 */
export const EventMessage:{
	/**
	 * Schema for the {@link EventMessage}.
	 */
	SCHEMA:ObjectSchema;

	/**
	 * Returns true when the value provided is considered to be a {@link EventMessage}.
	 */
	is( value:any ):value is EventMessage;
} = <EventMessageFactory> {
	SCHEMA,

	is( value:any ):value is EventMessage {
		return Resource.is( value )
			&& value.hasOwnProperty( "target" )
			;
	},
};

