import { TransientDocument } from "./Document";
import { Documents } from "./Documents";
import { ModelDecorator } from "./core/ModelDecorator";
export interface ServiceAwareDocument extends TransientDocument {
    _documents: Documents;
}
export interface ServiceAwareDocumentFactory extends ModelDecorator<ServiceAwareDocument> {
    isDecorated(object: object): object is ServiceAwareDocument;
    decorate<T extends object>(object: T, documents: Documents): T & ServiceAwareDocument;
}
export declare const ServiceAwareDocument: ServiceAwareDocumentFactory;
