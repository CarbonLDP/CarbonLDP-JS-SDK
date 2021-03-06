import { ModelSchema } from "../Model/ModelSchema";

import { ObjectSchema } from "../ObjectSchema/ObjectSchema";

import { C } from "../Vocabularies/C";

import { EventMessage } from "./EventMessage";
import { MemberRemovedEventDetails } from "./MemberRemovedEventDetails";


/**
 * Model that represents a `c:MemberRemovedEvent`.
 */
export interface MemberRemovedEvent extends EventMessage {
	/**
	 * Object with the members removed.
	 */
	details:MemberRemovedEventDetails;
}


/**
 * Factory, decorator and utils form {@link MemberRemovedEvent}.
 */
export type MemberRemovedEventFactory =
	& ModelSchema<C["MemberRemovedEvent"]>;

const SCHEMA:ObjectSchema = {
	...EventMessage.SCHEMA,
	"details": {
		"@id": C.details,
		"@type": "@id",
	},
};

/**
 * Constant with the factory, decorator and/or utils for a {@link MemberRemovedEvent} object.
 */
export const MemberRemovedEvent:{
	/**
	 * Type of the model, in this case: `https://carbonldp.com/ns/v1/platform#MemberRemovedEvent`.
	 */
	TYPE:C["MemberRemovedEvent"];

	/**
	 * Schema for the {@link MemberRemovedEvent}.
	 */
	SCHEMA:ObjectSchema;
} = <MemberRemovedEventFactory> {
	TYPE: C.MemberRemovedEvent,
	SCHEMA,
};
