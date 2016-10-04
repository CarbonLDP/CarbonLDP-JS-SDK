import * as HTTP from "./HTTP";
import * as Auth from "./Auth";
import * as PersistedDocument from "./PersistedDocument";
import * as Pointer from "./Pointer";
export interface Class extends PersistedDocument.Class {
    accessControlList?: Pointer.Class;
    getACL(requestOptions?: HTTP.Request.Options): Promise<[Auth.PersistedACL.Class, HTTP.Response.Class]>;
}
export declare class Factory {
    static hasClassProperties(object: Object): boolean;
    static is(object: Object): boolean;
    static decorate<T extends PersistedDocument.Class>(document: T): T & Class;
}
export default Class;
