import { ACL, CompleteACReport, DetailedUserACReport, SimpleUserACReport } from "../Auth";
import { ModelDecorator } from "../core/ModelDecorator";
import { Document } from "../Document";
import { Documents } from "../Documents";
import { RequestOptions } from "../HTTP";
import { ObjectSchema } from "../ObjectSchema";
import { Pointer } from "../Pointer";
import { TransientProtectedDocumentFactory } from "./TransientProtectedDocument";
export interface ProtectedDocument extends Document {
    accessControlList?: Pointer;
    creator?: Pointer;
    owners?: Pointer;
    getACL(requestOptions?: RequestOptions): Promise<ACL>;
    getSimpleUserACReport(requestOptions?: RequestOptions): Promise<SimpleUserACReport>;
    getSimpleUserACReport(uri: string, requestOptions?: RequestOptions): Promise<SimpleUserACReport>;
    getDetailedUserACReport(requestOptions?: RequestOptions): Promise<DetailedUserACReport>;
    getDetailedUserACReport(uri: string, requestOptions?: RequestOptions): Promise<DetailedUserACReport>;
    getCompleteACReport(requestOptions?: RequestOptions): Promise<CompleteACReport>;
    getCompleteACReport(uri: string, requestOptions?: RequestOptions): Promise<CompleteACReport>;
}
export interface ProtectedDocumentFactory extends ModelDecorator<ProtectedDocument>, TransientProtectedDocumentFactory {
    SCHEMA: ObjectSchema;
    isDecorated(object: object): object is ProtectedDocument;
    is(object: object): object is ProtectedDocument;
    decorate<T extends object>(object: T, documents: Documents): T & ProtectedDocument;
}
export declare const ProtectedDocument: ProtectedDocumentFactory;
