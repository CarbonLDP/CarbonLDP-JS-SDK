import { Minus } from "../Utils";
import { Document } from "../Document";
import { Documents } from "../Documents";
import { RequestOptions } from "../HTTP/Request";
import { PersistedProtectedDocument } from "../PersistedProtectedDocument";
import * as User from "./User";
export interface Class extends Minus<User.Class, Document>, PersistedProtectedDocument {
    enable(requestOptions?: RequestOptions): Promise<Class>;
    disable(requestOptions?: RequestOptions): Promise<Class>;
}
export declare function enable(this: Class, requestOptions?: RequestOptions): Promise<Class>;
export declare function disable(this: Class, requestOptions?: RequestOptions): Promise<Class>;
export declare class Factory {
    static hasClassProperties(object: object): object is Class;
    static is(object: object): object is Class;
    static decorate<T extends object>(object: T, documents: Documents): Class & T;
}
export default Class;
