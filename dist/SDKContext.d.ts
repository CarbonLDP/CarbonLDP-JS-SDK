import * as Documents from "./Documents";
import * as Auth from "./Auth";
import * as Context from "./Context";
import * as ObjectSchema from "./ObjectSchema";
export declare class Class implements Context.Class {
    auth: Auth.Class;
    documents: Documents.Class;
    readonly baseURI: string;
    readonly parentContext: Context.Class;
    protected settings: Map<string, any>;
    protected generalObjectSchema: ObjectSchema.DigestedObjectSchema;
    protected typeObjectSchemaMap: Map<string, ObjectSchema.DigestedObjectSchema>;
    constructor();
    resolve(relativeURI: string): string;
    resolveSystemURI(relativeURI: string): string;
    hasSetting(name: string): boolean;
    getSetting(name: string): any;
    setSetting(name: string, value: any): void;
    deleteSetting(name: string): void;
    hasObjectSchema(type: string): boolean;
    getObjectSchema(type?: string): ObjectSchema.DigestedObjectSchema;
    extendObjectSchema(type: string, objectSchema: ObjectSchema.Class): void;
    extendObjectSchema(objectSchema: ObjectSchema.Class): void;
    clearObjectSchema(type?: string): void;
    protected extendGeneralObjectSchema(digestedSchema: ObjectSchema.DigestedObjectSchema): void;
    protected extendTypeObjectSchema(digestedSchema: ObjectSchema.DigestedObjectSchema, type: string): void;
    private registerDefaultObjectSchemas();
    private resolveTypeURI(uri);
}
export declare const instance: Class;
export default instance;
