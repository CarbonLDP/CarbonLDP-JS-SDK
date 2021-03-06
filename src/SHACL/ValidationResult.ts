import { ModelSchema } from "../Model/ModelSchema";

import { ObjectSchema } from "../ObjectSchema/ObjectSchema";

import { Pointer } from "../Pointer/Pointer";

import { Resource } from "../Resource/Resource";

import { SHACL } from "../Vocabularies/SHACL";
import { XSD } from "../Vocabularies/XSD";


/**
 * Model that represents a `shacl:ValidationResource`.
 * This model contains the report of an individual SHACL validation failure.
 */
export interface ValidationResult extends Resource {
	/**
	 * The focus node that has caused the result.
	 */
	focusNode:Pointer;
	/**
	 * The SHACL shape property path that where tested.
	 */
	resultPath?:Pointer;
	/**
	 * The value of the previous SHACL property path that raised the validation violation.
	 */
	value?:any;
	/**
	 * Pointer to the source SHACL shape used in the validation.
	 */
	sourceShape?:Pointer;
	/**
	 * Pointer to the constraint that caused the resource.
	 */
	sourceConstraintComponent?:Pointer;
	/**
	 * Pointer to the possible parent wih one or more SHACL results.
	 */
	detail?:Pointer;
	/**
	 * The message string taken from the SHACL shape message property.
	 */
	resultMessage?:string;
	/**
	 * The severity described by the SHACL shape severity property.
	 */
	resultSeverity?:Pointer;
}


/**
 * Factory and utils for {@link ValidationResult}.
 */
export type ValidationResultFactory =
	& ModelSchema<SHACL["ValidationResult"]>;

const SCHEMA:ObjectSchema = {
	"focusNode": {
		"@id": SHACL.focusNode,
		"@type": "@id",
	},
	"resultPath": {
		"@id": SHACL.resultPath,
		"@type": "@id",
	},
	"value": {
		"@id": SHACL.value,
	},
	"sourceShape": {
		"@id": SHACL.sourceShape,
		"@type": "@id",
	},
	"sourceConstraintComponent": {
		"@id": SHACL.sourceConstraintComponent,
		"@type": "@id",
	},
	"detail": {
		"@id": SHACL.detail,
		"@type": "@id",
	},
	"resultMessage": {
		"@id": SHACL.resultMessage,
		"@type": XSD.string,
	},
	"resultSeverity": {
		"@id": SHACL.resultSeverity,
		"@type": "@id",
	},
};

/**
 * Constant with the factory, decorator and/or utils for a {@link ValidationResult} object.
 */
export const ValidationResult:{
	/**
	 * Type of the model, in this case: `https://carbonldp.com/ns/v1/platform#ValidationResult`.
	 */
	TYPE:SHACL["ValidationResult"];

	/**
	 * Schema for the {@link ValidationResult}.
	 */
	SCHEMA:ObjectSchema;
} = <ValidationResultFactory> {
	TYPE: SHACL.ValidationResult,
	SCHEMA,
};
