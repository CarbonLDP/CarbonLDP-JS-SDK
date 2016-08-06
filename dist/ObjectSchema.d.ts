import * as RDF from "./RDF";
export interface PropertyDefinition {
    "@id"?: string;
    "@type"?: string;
    "@language"?: string;
    "@container"?: string;
}
export interface Class {
    "@base"?: string;
    "@index"?: Object;
    "@language"?: string;
    "@reverse"?: Object;
    "@vocab"?: string;
    [name: string]: (string | PropertyDefinition);
}
export declare enum ContainerType {
    SET = 0,
    LIST = 1,
    LANGUAGE = 2,
}
export declare class DigestedObjectSchema {
    base: string;
    vocab: string;
    prefixes: Map<string, RDF.URI.Class>;
    properties: Map<string, DigestedPropertyDefinition>;
    prefixedURIs: Map<string, RDF.URI.Class[]>;
    constructor();
}
export declare class DigestedPropertyDefinition {
    uri: RDF.URI.Class;
    literal: boolean;
    literalType: RDF.URI.Class;
    language: string;
    containerType: ContainerType;
}
export interface Resolver {
    getGeneralSchema(): DigestedObjectSchema;
    getSchemaFor(object: Object): DigestedObjectSchema;
}
export declare class Digester {
    static digestSchema(schemas: Class[]): DigestedObjectSchema;
    static digestSchema(schema: Class): DigestedObjectSchema;
    static combineDigestedObjectSchemas(digestedSchemas: DigestedObjectSchema[]): DigestedObjectSchema;
    static resolvePrefixedURI(uri: RDF.URI.Class, digestedSchema: DigestedObjectSchema): RDF.URI.Class;
    private static digestSingleSchema(schema);
    private static resolvePrefixedURIs(digestedSchema);
}
export default Class;
