import { AbstractContext } from "../../AbstractContext";
import { DigestedObjectSchema, DigestedObjectSchemaProperty } from "../../ObjectSchema";
import { QueryContext } from "./QueryContext";
import { QueryProperty } from "./QueryProperty";
export declare class QueryContextBuilder extends QueryContext {
    private _propertiesMap;
    private _schemas;
    constructor(context?: AbstractContext<any, any>);
    hasProperty(name: string): boolean;
    hasProperties(name: string): boolean;
    addProperty(name: string): QueryProperty;
    getProperty(name: string): QueryProperty;
    getProperties(name: string): QueryProperty[];
    getInheritTypeDefinition(existingSchema: DigestedObjectSchema, propertyName: string, propertyURI?: string): DigestedObjectSchemaProperty;
    hasSchemaFor(object: object, path?: string): boolean;
    getSchemaFor(object: object, path?: string): DigestedObjectSchema;
    private _getTypeSchemas();
}
