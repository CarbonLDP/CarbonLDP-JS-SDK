import * as AccessPoint from "./AccessPoint";
import * as Document from "./Document";
import Documents from "./Documents";
import * as HTTP from "./HTTP";
import * as PersistedAccessPoint from "./PersistedAccessPoint";
import * as PersistedResource from "./PersistedResource";
import * as PersistedFragment from "./PersistedFragment";
import * as PersistedNamedFragment from "./PersistedNamedFragment";
import * as PersistedProtectedDocument from "./PersistedProtectedDocument";
import * as Pointer from "./Pointer";
import * as RetrievalPreferences from "./RetrievalPreferences";
import * as SPARQL from "./SPARQL";
export interface Class extends PersistedResource.Class, Document.Class {
    created?: Date;
    modified?: Date;
    defaultInteractionModel?: Pointer.Class;
    accessPoints?: Pointer.Class[];
    hasMemberRelation?: Pointer.Class;
    isMemberOfRelation?: Pointer.Class;
    contains?: Pointer.Class[];
    _documents: Documents;
    _etag: string;
    _fragmentsIndex: Map<string, PersistedFragment.Class>;
    _savedFragments: PersistedFragment.Class[];
    _syncSavedFragments(): void;
    getFragment<T>(slug: string): T & PersistedFragment.Class;
    getNamedFragment<T>(slug: string): T & PersistedNamedFragment.Class;
    getFragments(): PersistedFragment.Class[];
    createFragment(): PersistedFragment.Class;
    createFragment(slug: string): PersistedFragment.Class;
    createFragment<T>(object: T): PersistedFragment.Class & T;
    createFragment<T>(object: T, slug: string): PersistedFragment.Class & T;
    createNamedFragment(slug: string): PersistedNamedFragment.Class;
    createNamedFragment<T extends Object>(object: T, slug: string): PersistedNamedFragment.Class & T;
    refresh<T>(): Promise<[T & Class, HTTP.Response.Class]>;
    save<T>(): Promise<[T & Class, HTTP.Response.Class]>;
    saveAndRefresh<T>(): Promise<[T & Class, [HTTP.Response.Class, HTTP.Response.Class]]>;
    delete(): Promise<HTTP.Response.Class>;
    getDownloadURL(): Promise<string>;
    addMember(member: Pointer.Class): Promise<HTTP.Response.Class>;
    addMember(memberURI: string): Promise<HTTP.Response.Class>;
    addMembers(members: (Pointer.Class | string)[]): Promise<HTTP.Response.Class>;
    createChild<T>(object: T, slug: string, requestOptions?: HTTP.Request.Options): Promise<[T & PersistedProtectedDocument.Class, HTTP.Response.Class]>;
    createChild<T>(object: T, requestOptions?: HTTP.Request.Options): Promise<[T & PersistedProtectedDocument.Class, HTTP.Response.Class]>;
    createChild(slug: string, requestOptions?: HTTP.Request.Options): Promise<[PersistedProtectedDocument.Class, HTTP.Response.Class]>;
    createChild(requestOptions?: HTTP.Request.Options): Promise<[PersistedProtectedDocument.Class, HTTP.Response.Class]>;
    createChildren<T>(objects: T[], slugs: string[], requestOptions?: HTTP.Request.Options): Promise<[(T & PersistedProtectedDocument.Class)[], HTTP.Response.Class[]]>;
    createChildren<T>(objects: T[], requestOptions?: HTTP.Request.Options): Promise<[(T & PersistedProtectedDocument.Class)[], HTTP.Response.Class[]]>;
    createChildAndRetrieve<T>(object: T, slug: string, requestOptions?: HTTP.Request.Options): Promise<[T & PersistedProtectedDocument.Class, [HTTP.Response.Class, HTTP.Response.Class]]>;
    createChildAndRetrieve<T>(object: T, requestOptions?: HTTP.Request.Options): Promise<[T & PersistedProtectedDocument.Class, [HTTP.Response.Class, HTTP.Response.Class]]>;
    createChildAndRetrieve(slug: string, requestOptions?: HTTP.Request.Options): Promise<[PersistedProtectedDocument.Class, [HTTP.Response.Class, HTTP.Response.Class]]>;
    createChildAndRetrieve(requestOptions?: HTTP.Request.Options): Promise<[PersistedProtectedDocument.Class, [HTTP.Response.Class, HTTP.Response.Class]]>;
    createChildrenAndRetrieve<T>(objects: T[], slugs: string[], requestOptions?: HTTP.Request.Options): Promise<[(T & PersistedProtectedDocument.Class)[], [HTTP.Response.Class[], HTTP.Response.Class[]]]>;
    createChildrenAndRetrieve<T>(objects: T[], requestOptions?: HTTP.Request.Options): Promise<[(T & PersistedProtectedDocument.Class)[], [HTTP.Response.Class[], HTTP.Response.Class[]]]>;
    createAccessPoint<T>(accessPoint: T & AccessPoint.Class, slug?: string, requestOptions?: HTTP.Request.Options): Promise<[T & PersistedAccessPoint.Class, HTTP.Response.Class]>;
    createAccessPoint<T>(accessPoint: T & AccessPoint.Class, requestOptions?: HTTP.Request.Options): Promise<[T & PersistedAccessPoint.Class, HTTP.Response.Class]>;
    createAccessPoints<T>(accessPoints: (T & AccessPoint.Class)[], slugs?: string[], requestOptions?: HTTP.Request.Options): Promise<[(T & PersistedAccessPoint.Class)[], HTTP.Response.Class[]]>;
    createAccessPoints<T>(accessPoints: (T & AccessPoint.Class)[], requestOptions?: HTTP.Request.Options): Promise<[(T & PersistedAccessPoint.Class)[], HTTP.Response.Class[]]>;
    listChildren(): Promise<[Class[], HTTP.Response.Class]>;
    getChildren<T>(retrievalPreferences?: RetrievalPreferences.Class): Promise<[(T & Class)[], HTTP.Response.Class]>;
    listMembers(includeNonReadable?: boolean): Promise<[Class[], HTTP.Response.Class]>;
    getMembers<T>(includeNonReadable?: boolean, retrievalPreferences?: RetrievalPreferences.Class): Promise<[(T & Class)[], HTTP.Response.Class]>;
    getMembers<T>(retrievalPreferences?: RetrievalPreferences.Class): Promise<[(T & Class)[], HTTP.Response.Class]>;
    removeMember(member: Pointer.Class): Promise<HTTP.Response.Class>;
    removeMember(memberURI: string): Promise<HTTP.Response.Class>;
    removeMembers(members: (Pointer.Class | string)[]): Promise<HTTP.Response.Class>;
    removeAllMembers(): Promise<HTTP.Response.Class>;
    upload(blob: Blob, slug: string): Promise<[Pointer.Class, HTTP.Response.Class]>;
    upload(blob: Blob): Promise<[Pointer.Class, HTTP.Response.Class]>;
    upload(blob: Buffer, slug: string): Promise<[Pointer.Class, HTTP.Response.Class]>;
    upload(blob: Buffer): Promise<[Pointer.Class, HTTP.Response.Class]>;
    executeRawASKQuery(askQuery: string, requestOptions?: HTTP.Request.Options): Promise<[SPARQL.RawResults.Class, HTTP.Response.Class]>;
    executeASKQuery(askQuery: string, requestOptions?: HTTP.Request.Options): Promise<[boolean, HTTP.Response.Class]>;
    executeRawSELECTQuery(selectQuery: string, requestOptions?: HTTP.Request.Options): Promise<[SPARQL.RawResults.Class, HTTP.Response.Class]>;
    executeSELECTQuery(selectQuery: string, requestOptions?: HTTP.Request.Options): Promise<[SPARQL.SELECTResults.Class, HTTP.Response.Class]>;
    executeRawCONSTRUCTQuery(constructQuery: string, requestOptions?: HTTP.Request.Options): Promise<[string, HTTP.Response.Class]>;
    executeRawDESCRIBEQuery(describeQuery: string, requestOptions?: HTTP.Request.Options): Promise<[string, HTTP.Response.Class]>;
    executeUPDATE(updateQuery: string, requestOptions?: HTTP.Request.Options): Promise<HTTP.Response.Class>;
}
export declare class Factory {
    static hasClassProperties(object: Object): boolean;
    static is(object: Object): boolean;
    static create(uri: string, documents: Documents, snapshot?: Object): Class;
    static createFrom<T extends Object>(object: T, uri: string, documents: Documents, snapshot?: Object): Class;
    static decorate<T extends Object>(document: T, documents: Documents, snapshot?: Object): T & Class;
}
export default Class;
