import * as ObjectSchema from "./../ObjectSchema";
import * as PersistedFragment from "./../PersistedFragment";
import * as Pointer from "./../Pointer";
export declare const RDF_CLASS: string;
export declare const SCHEMA: ObjectSchema.Class;
export interface Class extends PersistedFragment.Class {
    granting: boolean;
    permissions: Pointer.Class[];
    subjects: Pointer.Class[];
    subjectsClass: Pointer.Class;
}
export default Class;
