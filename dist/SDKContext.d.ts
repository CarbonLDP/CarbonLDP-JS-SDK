import * as Auth from "./Auth";
import * as Context from "./Context";
import * as Documents from "./Documents";
import * as ObjectSchema from "./ObjectSchema";
import * as Settings from "./Settings";
export declare class Class implements Context.Class {
    auth: Auth.Class;
    documents: Documents.Class;
    readonly baseURI: string;
    readonly parentContext: Context.Class;
    protected settings: Settings.ContextSettings;
    protected generalObjectSchema: ObjectSchema.DigestedObjectSchema;
    protected typeObjectSchemaMap: Map<string, ObjectSchema.DigestedObjectSchema>;
    constructor();
    resolve(relativeURI: string): string;
    _resolvePath(path: string): string;
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
