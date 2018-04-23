import { QueryClause } from "sparqler/clauses";
import { AccessPoint } from "../AccessPoint";
import { ModelDecorator } from "../core/ModelDecorator";
import { ModelSchema } from "../core/ModelSchema";
import { Documents } from "../Documents";
import { Fragment } from "../Fragment";
import { RequestOptions } from "../HTTP";
import { MessagingDocument } from "../Messaging";
import { NamedFragment } from "../NamedFragment";
import { Pointer } from "../Pointer";
import { ProtectedDocument } from "../ProtectedDocument";
import { Resource } from "../Resource";
import { ServiceAwareDocument } from "../ServiceAwareDocument";
import { FinishSPARQLSelect, SPARQLRawResults, SPARQLSelectResults } from "../SPARQL";
import { QueryDocumentsBuilder } from "../SPARQL/QueryDocument";
import { BaseAccessPoint } from "../AccessPoint/BaseAccessPoint";
import { C } from "../Vocabularies";
import { BaseDocument } from "./BaseDocument";
import { TransientDocument } from "./TransientDocument";
export interface Document extends TransientDocument, Resource, ServiceAwareDocument, MessagingDocument {
    created?: Date;
    modified?: Date;
    defaultInteractionModel?: Pointer;
    accessPoints?: Pointer[];
    hasMemberRelation?: Pointer;
    isMemberOfRelation?: Pointer;
    contains?: Pointer[];
    _eTag: string;
    _fragmentsIndex: Map<string, Fragment>;
    _savedFragments: Fragment[];
    _syncSavedFragments(): void;
    isLocallyOutDated(): boolean;
    getFragment<T extends object>(slug: string): T & Fragment;
    getNamedFragment<T extends object>(slug: string): T & NamedFragment;
    getFragments(): Fragment[];
    createFragment(slug?: string): Fragment;
    createFragment<T extends object>(object: T): Fragment & T;
    createFragment<T extends object>(object: T, slug: string): Fragment & T;
    createNamedFragment(slug: string): NamedFragment;
    createNamedFragment<T extends object>(object: T, slug: string): NamedFragment & T;
    refresh<T extends object>(requestOptions?: RequestOptions): Promise<T & this>;
    save<T extends object>(requestOptions?: RequestOptions): Promise<T & this>;
    saveAndRefresh<T extends object>(requestOptions?: RequestOptions): Promise<T & this>;
    delete(requestOptions?: RequestOptions): Promise<void>;
    addMember(member: Pointer, requestOptions?: RequestOptions): Promise<void>;
    addMember(memberURI: string, requestOptions?: RequestOptions): Promise<void>;
    addMembers(members: (Pointer | string)[], requestOptions?: RequestOptions): Promise<void>;
    createChild<T extends object>(object: T, slug: string, requestOptions?: RequestOptions): Promise<T & ProtectedDocument>;
    createChild<T extends object>(object: T, requestOptions?: RequestOptions): Promise<T & ProtectedDocument>;
    createChild(slug: string, requestOptions?: RequestOptions): Promise<ProtectedDocument>;
    createChild(requestOptions?: RequestOptions): Promise<ProtectedDocument>;
    createChildren<T extends object>(objects: T[], slugs: string[], requestOptions?: RequestOptions): Promise<(T & ProtectedDocument)[]>;
    createChildren<T extends object>(objects: T[], requestOptions?: RequestOptions): Promise<(T & ProtectedDocument)[]>;
    createChildAndRetrieve<T extends object>(object: T, slug: string, requestOptions?: RequestOptions): Promise<T & ProtectedDocument>;
    createChildAndRetrieve<T extends object>(object: T, requestOptions?: RequestOptions): Promise<T & ProtectedDocument>;
    createChildAndRetrieve(slug: string, requestOptions?: RequestOptions): Promise<ProtectedDocument>;
    createChildAndRetrieve(requestOptions?: RequestOptions): Promise<ProtectedDocument>;
    createChildrenAndRetrieve<T extends object>(objects: T[], slugs: string[], requestOptions?: RequestOptions): Promise<(T & ProtectedDocument)[]>;
    createChildrenAndRetrieve<T extends object>(objects: T[], requestOptions?: RequestOptions): Promise<(T & ProtectedDocument)[]>;
    createAccessPoint<T extends object>(accessPoint: T & BaseAccessPoint, slug?: string, requestOptions?: RequestOptions): Promise<T & AccessPoint>;
    createAccessPoint<T extends object>(accessPoint: T & BaseAccessPoint, requestOptions?: RequestOptions): Promise<T & AccessPoint>;
    createAccessPoints<T extends object>(accessPoints: (T & BaseAccessPoint)[], slugs?: string[], requestOptions?: RequestOptions): Promise<(T & AccessPoint)[]>;
    createAccessPoints<T extends object>(accessPoints: (T & BaseAccessPoint)[], requestOptions?: RequestOptions): Promise<(T & AccessPoint)[]>;
    listChildren<T extends object>(requestOptions?: RequestOptions): Promise<(T & Document)[]>;
    getChildren<T extends object>(requestOptions?: RequestOptions, queryBuilderFn?: (queryBuilder: QueryDocumentsBuilder) => QueryDocumentsBuilder): Promise<(T & Document)[]>;
    getChildren<T extends object>(queryBuilderFn?: (queryBuilder: QueryDocumentsBuilder) => QueryDocumentsBuilder): Promise<(T & Document)[]>;
    listMembers<T extends object>(requestOptions?: RequestOptions): Promise<(T & Document)[]>;
    getMembers<T extends object>(requestOptions?: RequestOptions, queryBuilderFn?: (queryBuilder: QueryDocumentsBuilder) => QueryDocumentsBuilder): Promise<(T & Document)[]>;
    getMembers<T extends object>(queryBuilderFn?: (queryBuilder: QueryDocumentsBuilder) => QueryDocumentsBuilder): Promise<(T & Document)[]>;
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
export interface DocumentFactory extends ModelSchema, ModelDecorator<Document> {
    TYPE: C["Document"];
    is(object: object): object is Document;
    isDecorated(object: object): object is Document;
    create<T extends BaseDocument>(data?: T): T & TransientDocument;
    createFrom<T extends BaseDocument>(object: T): T & TransientDocument;
    decorate<T extends object>(object: T, documents: Documents): T & Document;
}
export declare const Document: DocumentFactory;
