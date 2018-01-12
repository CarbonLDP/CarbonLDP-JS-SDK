import { PatternToken, SubjectToken } from "sparqler/tokens";
import { DigestedPropertyDefinition } from "../../ObjectSchema";
import * as QueryContext from "./QueryContext";
export declare function getLevelRegExp(property: string): RegExp;
export declare function createPropertyPatterns(context: QueryContext.Class, resourcePath: string, propertyPath: string, propertyDefinition: DigestedPropertyDefinition): PatternToken[];
export declare function createTypesPattern(context: QueryContext.Class, resourcePath: string): PatternToken;
export declare function createGraphPattern(context: QueryContext.Class, resourcePath: string): PatternToken;
export declare function createAllPattern(context: QueryContext.Class, resourcePath: string): PatternToken;
export declare function getParentPath(path: string): string;
export declare function isFullTriple(triple: SubjectToken): boolean;
export declare function getAllTriples(patterns: PatternToken[]): SubjectToken[];
export declare function getPathValue(element: any, path: string): any;
