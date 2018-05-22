import { RequestOptions } from "../HTTP";
import { QueryDocumentBuilder, QueryDocumentsBuilder } from "../SPARQL/QueryDocument";
import { PickSelfProps } from "../Utils";
import { Document } from "./Document";
import { PersistedDocument } from "./PersistedDocument";
export interface QueryDocumentDocument extends PersistedDocument {
    get<T extends object>(queryBuilderFn: (queryBuilder: QueryDocumentBuilder) => QueryDocumentBuilder): Promise<T & Document>;
    get<T extends object>(requestOptions: RequestOptions, queryBuilderFn: (queryBuilder: QueryDocumentBuilder) => QueryDocumentBuilder): Promise<T & Document>;
    get<T extends object>(uri: string, queryBuilderFn: (queryBuilder: QueryDocumentBuilder) => QueryDocumentBuilder): Promise<T & Document>;
    get<T extends object>(uri: string, requestOptions: RequestOptions, queryBuilderFn: (queryBuilder: QueryDocumentBuilder) => QueryDocumentBuilder): Promise<T & Document>;
    resolve<T extends object>(queryBuilderFn: (queryBuilder: QueryDocumentBuilder) => QueryDocumentBuilder): Promise<T & Document>;
    resolve<T extends object>(requestOptions: RequestOptions, queryBuilderFn: (queryBuilder: QueryDocumentBuilder) => QueryDocumentBuilder): Promise<T & Document>;
    refresh<T extends object>(requestOptions?: RequestOptions): Promise<T & this & Document>;
    save<T extends object>(requestOptions?: RequestOptions): Promise<T & this & Document>;
    saveAndRefresh<T extends object>(requestOptions?: RequestOptions): Promise<T & this & Document>;
    getChildren<T extends object>(requestOptions: RequestOptions, queryBuilderFn?: (queryBuilder: QueryDocumentsBuilder) => QueryDocumentsBuilder): Promise<(T & Document)[]>;
    getChildren<T extends object>(queryBuilderFn?: (queryBuilder: QueryDocumentsBuilder) => QueryDocumentsBuilder): Promise<(T & Document)[]>;
    getChildren<T extends object>(uri: string, requestOptions: RequestOptions, queryBuilderFn?: (queryBuilder: QueryDocumentsBuilder) => QueryDocumentsBuilder): Promise<(T & Document)[]>;
    getChildren<T extends object>(uri: string, queryBuilderFn?: (queryBuilder: QueryDocumentsBuilder) => QueryDocumentsBuilder): Promise<(T & Document)[]>;
    getMembers<T extends object>(requestOptions: RequestOptions, queryBuilderFn?: (queryBuilder: QueryDocumentsBuilder) => QueryDocumentsBuilder): Promise<(T & Document)[]>;
    getMembers<T extends object>(queryBuilderFn?: (queryBuilder: QueryDocumentsBuilder) => QueryDocumentsBuilder): Promise<(T & Document)[]>;
    getMembers<T extends object>(uri: string, requestOptions: RequestOptions, queryBuilderFn?: (queryBuilder: QueryDocumentsBuilder) => QueryDocumentsBuilder): Promise<(T & Document)[]>;
    getMembers<T extends object>(uri: string, queryBuilderFn?: (queryBuilder: QueryDocumentsBuilder) => QueryDocumentsBuilder): Promise<(T & Document)[]>;
    listChildren<T extends object>(requestOptions?: RequestOptions): Promise<(T & Document)[]>;
    listChildren<T extends object>(uri: string, requestOptions?: RequestOptions): Promise<(T & Document)[]>;
    listMembers<T extends object>(requestOptions?: RequestOptions): Promise<(T & Document)[]>;
    listMembers<T extends object>(uri: string, requestOptions?: RequestOptions): Promise<(T & Document)[]>;
}
export interface QueryDocumentDocumentFactory {
    PROTOTYPE: PickSelfProps<QueryDocumentDocument, PersistedDocument>;
    isDecorated(object: object): object is QueryDocumentDocument;
    decorate<T extends object>(object: T): T & QueryDocumentDocument;
}
export declare const QueryDocumentDocument: QueryDocumentDocumentFactory;
