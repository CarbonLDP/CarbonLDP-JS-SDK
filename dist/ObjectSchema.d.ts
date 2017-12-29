import * as RDF from "./RDF";
export interface PropertyDefinition {
    "@id"?: string;
    "@type"?: string;
    "@language"?: string;
    "@container"?: string;
}
export interface Class {
    "@base"?: string;
    "@vocab"?: string;
    "@index"?: Object;
    "@language"?: string;
    "@reverse"?: Object;
    [name: string]: (string | PropertyDefinition);
}
export declare enum ContainerType {
    SET = 0,
    LIST = 1,
    LANGUAGE = 2,
}
export declare enum PointerType {
    ID = 0,
    VOCAB = 1,
}
export declare class DigestedObjectSchema {
    base: string;
    language: string;
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
    pointerType: PointerType;
    language: string;
    containerType: ContainerType;
}
export interface Resolver {
    getGeneralSchema(): DigestedObjectSchema;
    getSchemaFor(object: Object, path?: string): DigestedObjectSchema;
}
export declare class Digester {
    static digestSchema(schemas: Class[], vocab?: string): DigestedObjectSchema;
    static digestSchema(schema: Class, vocab?: string): DigestedObjectSchema;
    static combineDigestedObjectSchemas(digestedSchemas: DigestedObjectSchema[]): DigestedObjectSchema;
    static digestPropertyDefinition(digestedSchema: DigestedObjectSchema, propertyName: string, propertyDefinition: PropertyDefinition, vocab?: string): DigestedPropertyDefinition;
    static resolvePrefixedURI(uri: string, digestedSchema: DigestedObjectSchema): string;
    private static _resolveURI(uri, digestedSchema, vocab?);
    private static _resolvePrefixedURI(uri, digestedSchema);
    private static digestSingleSchema(schema, vocab?);
    private static resolvePrefixedURIs(digestedSchema);
}
export declare class Util {
    static resolveURI(uri: string, schema: DigestedObjectSchema, vocab?: string): string;
}
export default Class;
