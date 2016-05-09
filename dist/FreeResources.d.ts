import Documents from "./Documents";
import * as Pointer from "./Pointer";
import * as Resource from "./Resource";
export interface Class extends Pointer.Library, Pointer.Validator {
    _documents: Documents;
    _resourcesIndex: Map<string, Resource.Class>;
    hasResource(id: string): boolean;
    getResource(id: string): Resource.Class;
    getResources(): Resource.Class[];
    createResource(id?: string): Resource.Class;
}
export declare class Factory {
    static hasClassProperties(value: Object): boolean;
    static create(documents: Documents): Class;
    static createFrom<T extends Object>(object: T, documents: Documents): T & Class;
    static decorate<T extends Object>(object: T): T & Class;
}
export default Class;