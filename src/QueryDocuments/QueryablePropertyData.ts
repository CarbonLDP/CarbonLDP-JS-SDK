import { Path, PathBuilder } from "sparqler/patterns";
import { IRIToken, LiteralToken } from "sparqler/tokens";

import { DigestedObjectSchemaProperty } from "../ObjectSchema/DigestedObjectSchemaProperty";

import { QueryPropertyType } from "./QueryPropertyType";


/**
 * Base data to create a {@link QueryableProperty}.
 */
export interface QueryablePropertyData {
	definition:DigestedObjectSchemaProperty;
	pathBuilderFn?:( pathBuilder:PathBuilder ) => Path;

	propertyType?:QueryPropertyType;
	optional:boolean;

	values?:(IRIToken | LiteralToken)[];
}
