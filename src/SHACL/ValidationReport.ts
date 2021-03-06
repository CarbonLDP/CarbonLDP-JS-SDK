import { ModelSchema } from "../Model/ModelSchema";

import { ObjectSchema } from "../ObjectSchema/ObjectSchema";

import { SHACL } from "../Vocabularies/SHACL";
import { XSD } from "../Vocabularies/XSD";

import { ValidationResult } from "./ValidationResult";


/**
 * Model that represents a `shacl:ValidationReport`.
 * This model contains the results of a validation process.
 */
export interface ValidationReport {
	/**
	 * Indicates if the validation conforms the given shape.
	 * If that's the case, no results data will be returned.
	 */
	conforms:boolean;
	/**
	 * The results of a failure validation process.
	 */
	results?:ValidationResult[];
	/**
	 * The `shapesGraphWellFormed` of a failure validation process.
	 */
	shapesGraphWellFormed?:boolean;
}


/**
 * Factory and utils for {@link ValidationReport}.
 */
export type ValidationReportFactory =
	& ModelSchema<SHACL["ValidationReport"]>;

const SCHEMA:ObjectSchema = {
	"conforms": {
		"@id": SHACL.conforms,
		"@type": XSD.boolean,
	},
	"results": {
		"@id": SHACL.result,
		"@type": "@id",
		"@container": "@set",
	},
	"shapesGraphWellFormed": {
		"@id": SHACL.shapesGraphWellFormed,
		"@type": XSD.boolean,
	},
};

/**
 * Constant with the factory, decorator and/or utils for an {@link ValidationReport} object.
 */
export const ValidationReport:{
	/**
	 * Type of the model, in this case: `https://carbonldp.com/ns/v1/platform#ValidationReport`.
	 */
	TYPE:SHACL["ValidationReport"];

	/**
	 * Schema for the {@link ValidationReport}.
	 */
	SCHEMA:ObjectSchema;
} = <ValidationReportFactory> {
	TYPE: SHACL.ValidationReport,
	SCHEMA,
};
