import { ModelDecorator, ModelSchema } from "../core";
import { GETOptions, RequestOptions } from "../HTTP";
import { MembersDocument } from "../Members";
import { MessagingDocument } from "../Messaging";
import { Pointer } from "../Pointer";
import { DocumentsRegistry } from "../Registry";
import { SPARQLDocument } from "../SPARQL";
import { QueryDocumentBuilder, QueryDocumentDocument } from "../SPARQL/QueryDocument";
import { PickSelfProps } from "../Utils";
import { C } from "../Vocabularies";
import { BaseDocument } from "./BaseDocument";
import { CRUDDocument } from "./CRUDDocument";
import { TransientDocument } from "./TransientDocument";
export interface Document extends CRUDDocument, MembersDocument, SPARQLDocument, MessagingDocument, QueryDocumentDocument {
    _registry: DocumentsRegistry;
    created?: Date;
    modified?: Date;
    defaultInteractionModel?: Pointer;
    accessPoints?: Pointer[];
    hasMemberRelation?: Pointer;
    isMemberOfRelation?: Pointer;
    contains?: Pointer[];
    get<T extends object>(queryBuilderFn: (queryBuilder: QueryDocumentBuilder) => QueryDocumentBuilder): Promise<T & Document>;
    get<T extends object>(requestOptions?: GETOptions, queryBuilderFn?: (queryBuilder: QueryDocumentBuilder) => QueryDocumentBuilder): Promise<T & Document>;
    get<T extends object>(uri: string, queryBuilderFn: (queryBuilder: QueryDocumentBuilder) => QueryDocumentBuilder): Promise<T & Document>;
    get<T extends object>(uri: string, requestOptions?: GETOptions, queryBuilderFn?: (queryBuilder: QueryDocumentBuilder) => QueryDocumentBuilder): Promise<T & Document>;
    resolve<T extends object>(queryBuilderFn: (queryBuilder: QueryDocumentBuilder) => QueryDocumentBuilder): Promise<T & this & Document>;
    resolve<T extends object>(requestOptions?: GETOptions, queryBuilderFn?: (queryBuilder: QueryDocumentBuilder) => QueryDocumentBuilder): Promise<T & this & Document>;
    refresh<T extends object>(requestOptions?: RequestOptions): Promise<T & this>;
    save<T extends object>(requestOptions?: RequestOptions): Promise<T & this>;
    saveAndRefresh<T extends object>(requestOptions?: RequestOptions): Promise<T & this>;
}
export interface DocumentFactory extends ModelSchema, ModelDecorator<Document> {
    PROTOTYPE: PickSelfProps<Document, CRUDDocument & MembersDocument & SPARQLDocument & MessagingDocument & QueryDocumentDocument, "get" | "resolve" | "refresh" | "save" | "saveAndRefresh" | "isDirty" | "revert">;
    TYPE: C["Document"];
    is(object: object): object is Document;
    isDecorated(object: object): object is Document;
    create<T extends object>(data?: T & BaseDocument): T & TransientDocument;
    createFrom<T extends object>(object: T & BaseDocument): T & TransientDocument;
    decorate<T extends object>(object: T): T & Document;
}
export declare const Document: DocumentFactory;