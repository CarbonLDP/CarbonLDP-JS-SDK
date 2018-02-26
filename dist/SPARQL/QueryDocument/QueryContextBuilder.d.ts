import { Context } from "../../Context";
import { DigestedObjectSchema, DigestedObjectSchemaProperty } from "../../ObjectSchema";
import * as QueryContext from "./QueryContext";
import * as QueryProperty from "./QueryProperty";
export declare class Class extends QueryContext.Class {
    private _propertiesMap;
    private _schemas;
    constructor(context?: Context);
    hasProperty(name: string): boolean;
    hasProperties(name: string): boolean;
    addProperty(name: string): QueryProperty.Class;
    getProperty(name: string): QueryProperty.Class;
    getProperties(name: string): QueryProperty.Class[];
    getInheritTypeDefinition(existingSchema: DigestedObjectSchema, propertyName: string, propertyURI?: string): DigestedObjectSchemaProperty;
    hasSchemaFor(object: object, path?: string): boolean;
    getSchemaFor(object: object, path?: string): DigestedObjectSchema;
    private _getTypeSchemas();
}
export default Class;
