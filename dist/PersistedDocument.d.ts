import { QueryClause } from "sparqler/clauses";
import { AccessPointBase } from "./AccessPoint";
import { Document } from "./Document";
import { Documents } from "./Documents";
import { RequestOptions } from "./HTTP/Request";
import { MessagingDocument } from "./Messaging/Document";
import { ModelDecorator } from "./ModelDecorator";
import { ModelFactory } from "./ModelFactory";
import { PersistedAccessPoint } from "./PersistedAccessPoint";
import { PersistedFragment } from "./PersistedFragment";
import { PersistedNamedFragment } from "./PersistedNamedFragment";
import { PersistedProtectedDocument } from "./PersistedProtectedDocument";
import { PersistedResource } from "./PersistedResource";
import { Pointer } from "./Pointer";
import { ServiceAwareDocument } from "./ServiceAwareDocument";
import { FinishSPARQLSelect } from "./SPARQL/Builder";
import { QueryDocumentsBuilder } from "./SPARQL/QueryDocument/QueryDocumentsBuilder";
import { SPARQLRawResults } from "./SPARQL/RawResults";
import { SPARQLSelectResults } from "./SPARQL/SelectResults";
export interface PersistedDocument extends Document, PersistedResource, ServiceAwareDocument, MessagingDocument {
    created?: Date;
    modified?: Date;
    defaultInteractionModel?: Pointer;
    accessPoints?: Pointer[];
    hasMemberRelation?: Pointer;
    isMemberOfRelation?: Pointer;
    contains?: Pointer[];
    _eTag: string;
    _fragmentsIndex: Map<string, PersistedFragment>;
    _savedFragments: PersistedFragment[];
    _syncSavedFragments(): void;
    isLocallyOutDated(): boolean;
    getFragment<T extends object>(slug: string): T & PersistedFragment;
    getNamedFragment<T extends object>(slug: string): T & PersistedNamedFragment;
    getFragments(): PersistedFragment[];
    createFragment(slug?: string): PersistedFragment;
    createFragment<T extends object>(object: T): PersistedFragment & T;
    createFragment<T extends object>(object: T, slug: string): PersistedFragment & T;
    createNamedFragment(slug: string): PersistedNamedFragment;
    createNamedFragment<T extends object>(object: T, slug: string): PersistedNamedFragment & T;
    refresh<T extends object>(requestOptions?: RequestOptions): Promise<T & this>;
    save<T extends object>(requestOptions?: RequestOptions): Promise<T & this>;
    saveAndRefresh<T extends object>(requestOptions?: RequestOptions): Promise<T & this>;
    delete(requestOptions?: RequestOptions): Promise<void>;
    getDownloadURL(requestOptions?: RequestOptions): Promise<string>;
    addMember(member: Pointer, requestOptions?: RequestOptions): Promise<void>;
    addMember(memberURI: string, requestOptions?: RequestOptions): Promise<void>;
    addMembers(members: (Pointer | string)[], requestOptions?: RequestOptions): Promise<void>;
    createChild<T extends object>(object: T, slug: string, requestOptions?: RequestOptions): Promise<T & PersistedProtectedDocument>;
    createChild<T extends object>(object: T, requestOptions?: RequestOptions): Promise<T & PersistedProtectedDocument>;
    createChild(slug: string, requestOptions?: RequestOptions): Promise<PersistedProtectedDocument>;
    createChild(requestOptions?: RequestOptions): Promise<PersistedProtectedDocument>;
    createChildren<T extends object>(objects: T[], slugs: string[], requestOptions?: RequestOptions): Promise<(T & PersistedProtectedDocument)[]>;
    createChildren<T extends object>(objects: T[], requestOptions?: RequestOptions): Promise<(T & PersistedProtectedDocument)[]>;
    createChildAndRetrieve<T extends object>(object: T, slug: string, requestOptions?: RequestOptions): Promise<T & PersistedProtectedDocument>;
    createChildAndRetrieve<T extends object>(object: T, requestOptions?: RequestOptions): Promise<T & PersistedProtectedDocument>;
    createChildAndRetrieve(slug: string, requestOptions?: RequestOptions): Promise<PersistedProtectedDocument>;
    createChildAndRetrieve(requestOptions?: RequestOptions): Promise<PersistedProtectedDocument>;
    createChildrenAndRetrieve<T extends object>(objects: T[], slugs: string[], requestOptions?: RequestOptions): Promise<(T & PersistedProtectedDocument)[]>;
    createChildrenAndRetrieve<T extends object>(objects: T[], requestOptions?: RequestOptions): Promise<(T & PersistedProtectedDocument)[]>;
    createAccessPoint<T extends object>(accessPoint: T & AccessPointBase, slug?: string, requestOptions?: RequestOptions): Promise<T & PersistedAccessPoint>;
    createAccessPoint<T extends object>(accessPoint: T & AccessPointBase, requestOptions?: RequestOptions): Promise<T & PersistedAccessPoint>;
    createAccessPoints<T extends object>(accessPoints: (T & AccessPointBase)[], slugs?: string[], requestOptions?: RequestOptions): Promise<(T & PersistedAccessPoint)[]>;
    createAccessPoints<T extends object>(accessPoints: (T & AccessPointBase)[], requestOptions?: RequestOptions): Promise<(T & PersistedAccessPoint)[]>;
    listChildren(requestOptions?: RequestOptions): Promise<PersistedDocument[]>;
    getChildren<T extends object>(requestOptions?: RequestOptions, queryBuilderFn?: (queryBuilder: QueryDocumentsBuilder) => QueryDocumentsBuilder): Promise<(T & PersistedDocument)[]>;
    getChildren<T extends object>(queryBuilderFn?: (queryBuilder: QueryDocumentsBuilder) => QueryDocumentsBuilder): Promise<(T & PersistedDocument)[]>;
    listMembers(requestOptions?: RequestOptions): Promise<PersistedDocument[]>;
    getMembers<T extends object>(requestOptions?: RequestOptions, queryBuilderFn?: (queryBuilder: QueryDocumentsBuilder) => QueryDocumentsBuilder): Promise<(T & PersistedDocument)[]>;
    getMembers<T extends object>(queryBuilderFn?: (queryBuilder: QueryDocumentsBuilder) => QueryDocumentsBuilder): Promise<(T & PersistedDocument)[]>;
    removeMember(member: Pointer, requestOptions?: RequestOptions): Promise<void>;
    removeMember(memberURI: string, requestOptions?: RequestOptions): Promise<void>;
    removeMembers(members: (Pointer | string)[], requestOptions?: RequestOptions): Promise<void>;
    removeAllMembers(requestOptions?: RequestOptions): Promise<void>;
    executeRawASKQuery(askQuery: string, requestOptions?: RequestOptions): Promise<SPARQLRawResults>;
    executeASKQuery(askQuery: string, requestOptions?: RequestOptions): Promise<boolean>;
    executeRawSELECTQuery(selectQuery: string, requestOptions?: RequestOptions): Promise<SPARQLRawResults>;
    executeSELECTQuery<T extends object>(selectQuery: string, requestOptions?: RequestOptions): Promise<SPARQLSelectResults<T>>;
    executeRawSELECTQuery(selectQuery: string, requestOptions?: RequestOptions): Promise<SPARQLRawResults>;
    executeSELECTQuery<T extends object>(selectQuery: string, requestOptions?: RequestOptions): Promise<SPARQLSelectResults<T>>;
    executeRawCONSTRUCTQuery(constructQuery: string, requestOptions?: RequestOptions): Promise<string>;
    executeRawDESCRIBEQuery(describeQuery: string, requestOptions?: RequestOptions): Promise<string>;
    executeUPDATE(updateQuery: string, requestOptions?: RequestOptions): Promise<void>;
    sparql(): QueryClause<FinishSPARQLSelect>;
}
export interface PersistedDocumentFactory extends ModelFactory<PersistedDocument>, ModelDecorator<PersistedDocument> {
    is(object: object): object is PersistedDocument;
    isDecorated(object: object): object is PersistedDocument;
    create(documents: Documents, uri: string): PersistedDocument;
    createFrom<T extends object>(object: T, documents: Documents, uri: string): T & PersistedDocument;
    decorate<T extends object>(object: T, documents: Documents): T & PersistedDocument;
}
export declare const PersistedDocument: PersistedDocumentFactory;
