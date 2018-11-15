export interface ObjectSchemaProperty {
    "@id"?: string;
    "@type"?: string;
    "@language"?: string;
    "@container"?: string;
}
export interface ObjectSchema {
    "@base"?: string;
    "@vocab"?: string;
    "@index"?: object;
    "@language"?: string;
    "@reverse"?: object;
    [name: string]: (string | ObjectSchemaProperty);
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
export declare class DigestedObjectSchemaProperty {
    uri: string;
    literal: boolean;
    literalType: string;
    pointerType: PointerType;
    language?: string;
    containerType: ContainerType;
}
export declare class DigestedObjectSchema {
    base: string;
    language: string;
    vocab?: string;
    prefixes: Map<string, string>;
    properties: Map<string, DigestedObjectSchemaProperty>;
    constructor();
}
export interface ObjectSchemaResolver {
    getGeneralSchema(): DigestedObjectSchema;
    hasSchemaFor(object: object, path?: string): boolean;
    getSchemaFor(object: object, path?: string): DigestedObjectSchema;
}
export declare class ObjectSchemaDigester {
    static digestSchema(schema: ObjectSchema): DigestedObjectSchema;
    static digestSchema(schemas: ObjectSchema[]): DigestedObjectSchema;
    static digestProperty(name: string, definition: ObjectSchemaProperty, digestedSchema?: DigestedObjectSchema): DigestedObjectSchemaProperty;
    static combineDigestedObjectSchemas(digestedSchemas: DigestedObjectSchema[]): DigestedObjectSchema;
    static _combineSchemas(digestedSchemas: DigestedObjectSchema[]): DigestedObjectSchema;
    private static _digestSchema(schema);
}
export declare class ObjectSchemaUtils {
    static resolveURI(uri: string, schema: DigestedObjectSchema, relativeTo?: {
        vocab?: boolean;
        base?: boolean;
    }): string;
    static resolveProperty(schema: DigestedObjectSchema, definition: DigestedObjectSchemaProperty, inSame?: boolean): DigestedObjectSchemaProperty;
}
