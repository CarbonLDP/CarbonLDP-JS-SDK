/// <reference types="node" />
import { QueryClause } from "sparqler/Clauses";
import * as HTTP from "./HTTP";
import Context from "./Context";
import * as RDF from "./RDF";
import * as AccessPoint from "./AccessPoint";
import * as FreeResources from "./FreeResources";
import * as JSONLD from "./JSONLD";
import * as PersistedAccessPoint from "./PersistedAccessPoint";
import * as PersistedDocument from "./PersistedDocument";
import * as PersistedProtectedDocument from "./PersistedProtectedDocument";
import * as Pointer from "./Pointer";
import * as Messaging from "./Messaging";
import * as ObjectSchema from "./ObjectSchema";
import * as SPARQL from "./SPARQL";
import * as RetrievalPreferences from "./RetrievalPreferences";
export interface DocumentDecorator {
    decorator: (object: Object, ...parameters: any[]) => Object;
    parameters?: any[];
}
export declare class Class implements Pointer.Library, Pointer.Validator, ObjectSchema.Resolver {
    private static _documentSchema;
    private _jsonldConverter;
    readonly jsonldConverter: JSONLD.Converter.Class;
    private _documentDecorators;
    readonly documentDecorators: Map<string, DocumentDecorator>;
    private context;
    private pointers;
    private documentsBeingResolved;
    constructor(context?: Context);
    inScope(pointer: Pointer.Class): boolean;
    inScope(id: string): boolean;
    hasPointer(id: string): boolean;
    getPointer(id: string): Pointer.Class;
    removePointer(idOrPointer: string | Pointer.Class): boolean;
    get<T>(uri: string, requestOptions?: HTTP.Request.Options): Promise<[T & PersistedDocument.Class, HTTP.Response.Class]>;
    exists(documentURI: string, requestOptions?: HTTP.Request.Options): Promise<[boolean, HTTP.Response.Class]>;
    createChild<T>(parentURI: string, childObject: T, slug?: string, requestOptions?: HTTP.Request.Options): Promise<[T & PersistedProtectedDocument.Class, HTTP.Response.Class]>;
    createChild<T>(parentURI: string, childObject: T, requestOptions?: HTTP.Request.Options): Promise<[T & PersistedProtectedDocument.Class, HTTP.Response.Class]>;
    createChildren<T>(parentURI: string, childrenObjects: T[], slugs?: string[], requestOptions?: HTTP.Request.Options): Promise<[(T & PersistedProtectedDocument.Class)[], HTTP.Response.Class[]]>;
    createChildren<T>(parentURI: string, childrenObjects: T[], requestOptions?: HTTP.Request.Options): Promise<[(T & PersistedProtectedDocument.Class)[], HTTP.Response.Class[]]>;
    createChildAndRetrieve<T>(parentURI: string, childObject: T, slug?: string, requestOptions?: HTTP.Request.Options): Promise<[T & PersistedProtectedDocument.Class, HTTP.Response.Class[]]>;
    createChildAndRetrieve<T>(parentURI: string, childObject: T, requestOptions?: HTTP.Request.Options): Promise<[T & PersistedProtectedDocument.Class, HTTP.Response.Class[]]>;
    createChildrenAndRetrieve<T>(parentURI: string, childrenObjects: T[], slugs?: string[], requestOptions?: HTTP.Request.Options): Promise<[(T & PersistedProtectedDocument.Class)[], HTTP.Response.Class[][]]>;
    createChildrenAndRetrieve<T>(parentURI: string, childrenObjects: T[], requestOptions?: HTTP.Request.Options): Promise<[(T & PersistedProtectedDocument.Class)[], HTTP.Response.Class[][]]>;
    listChildren(parentURI: string, requestOptions?: HTTP.Request.Options): Promise<[PersistedDocument.Class[], HTTP.Response.Class]>;
    getChildren<T>(parentURI: string, retrievalPreferences?: RetrievalPreferences.Class, requestOptions?: HTTP.Request.Options): Promise<[(T & PersistedDocument.Class)[], HTTP.Response.Class]>;
    getChildren<T>(parentURI: string, requestOptions?: HTTP.Request.Options): Promise<[(T & PersistedDocument.Class)[], HTTP.Response.Class]>;
    createAccessPoint<T>(documentURI: string, accessPoint: T & AccessPoint.Class, slug?: string, requestOptions?: HTTP.Request.Options): Promise<[T & PersistedAccessPoint.Class, HTTP.Response.Class]>;
    createAccessPoint<T>(documentURI: string, accessPoint: T & AccessPoint.Class, requestOptions?: HTTP.Request.Options): Promise<[T & PersistedAccessPoint.Class, HTTP.Response.Class]>;
    createAccessPoints<T>(documentURI: string, accessPoints: (T & AccessPoint.Class)[], slugs?: string[], requestOptions?: HTTP.Request.Options): Promise<[(T & PersistedAccessPoint.Class)[], HTTP.Response.Class[]]>;
    createAccessPoints<T>(documentURI: string, accessPoints: (T & AccessPoint.Class)[], requestOptions?: HTTP.Request.Options): Promise<[(T & PersistedAccessPoint.Class)[], HTTP.Response.Class[]]>;
    upload(parentURI: string, data: Buffer, slug?: string, requestOptions?: HTTP.Request.Options): Promise<[Pointer.Class, HTTP.Response.Class]>;
    upload(parentURI: string, data: Buffer, requestOptions?: HTTP.Request.Options): Promise<[Pointer.Class, HTTP.Response.Class]>;
    upload(parentURI: string, data: Blob, slug?: string, requestOptions?: HTTP.Request.Options): Promise<[Pointer.Class, HTTP.Response.Class]>;
    upload(parentURI: string, data: Blob, requestOptions?: HTTP.Request.Options): Promise<[Pointer.Class, HTTP.Response.Class]>;
    listMembers(uri: string, includeNonReadable?: boolean, requestOptions?: HTTP.Request.Options): Promise<[PersistedDocument.Class[], HTTP.Response.Class]>;
    listMembers(uri: string, requestOptions?: HTTP.Request.Options): Promise<[PersistedDocument.Class[], HTTP.Response.Class]>;
    getMembers<T>(uri: string, includeNonReadable?: boolean, retrievalPreferences?: RetrievalPreferences.Class, requestOptions?: HTTP.Request.Options): Promise<[(T & PersistedDocument.Class)[], HTTP.Response.Class]>;
    getMembers<T>(uri: string, includeNonReadable?: boolean, requestOptions?: HTTP.Request.Options): Promise<[(T & PersistedDocument.Class)[], HTTP.Response.Class]>;
    getMembers<T>(uri: string, retrievalPreferences?: RetrievalPreferences.Class, requestOptions?: HTTP.Request.Options): Promise<[(T & PersistedDocument.Class)[], HTTP.Response.Class]>;
    getMembers<T>(uri: string, requestOptions?: HTTP.Request.Options): Promise<[(T & PersistedDocument.Class)[], HTTP.Response.Class]>;
    addMember(documentURI: string, member: Pointer.Class, requestOptions?: HTTP.Request.Options): Promise<HTTP.Response.Class>;
    addMember(documentURI: string, memberURI: string, requestOptions?: HTTP.Request.Options): Promise<HTTP.Response.Class>;
    addMembers(documentURI: string, members: (Pointer.Class | string)[], requestOptions?: HTTP.Request.Options): Promise<HTTP.Response.Class>;
    removeMember(documentURI: string, member: Pointer.Class, requestOptions?: HTTP.Request.Options): Promise<HTTP.Response.Class>;
    removeMember(documentURI: string, memberURI: string, requestOptions?: HTTP.Request.Options): Promise<HTTP.Response.Class>;
    removeMembers(documentURI: string, members: (Pointer.Class | string)[], requestOptions?: HTTP.Request.Options): Promise<HTTP.Response.Class>;
    removeAllMembers(documentURI: string, requestOptions?: HTTP.Request.Options): Promise<HTTP.Response.Class>;
    save<T>(persistedDocument: T & PersistedDocument.Class, requestOptions?: HTTP.Request.Options): Promise<[T & PersistedDocument.Class, HTTP.Response.Class]>;
    refresh<T>(persistedDocument: T & PersistedDocument.Class, requestOptions?: HTTP.Request.Options): Promise<[T & PersistedDocument.Class, HTTP.Response.Class]>;
    saveAndRefresh<T>(persistedDocument: T & PersistedDocument.Class, requestOptions?: HTTP.Request.Options): Promise<[T & PersistedDocument.Class, HTTP.Response.Class[]]>;
    delete(documentURI: string, requestOptions?: HTTP.Request.Options): Promise<HTTP.Response.Class>;
    getDownloadURL(documentURI: string, requestOptions?: HTTP.Request.Options): Promise<string>;
    getGeneralSchema(): ObjectSchema.DigestedObjectSchema;
    getSchemaFor(object: Object): ObjectSchema.DigestedObjectSchema;
    executeRawASKQuery(documentURI: string, askQuery: string, requestOptions?: HTTP.Request.Options): Promise<[SPARQL.RawResults.Class, HTTP.Response.Class]>;
    executeASKQuery(documentURI: string, askQuery: string, requestOptions?: HTTP.Request.Options): Promise<[boolean, HTTP.Response.Class]>;
    executeRawSELECTQuery(documentURI: string, selectQuery: string, requestOptions?: HTTP.Request.Options): Promise<[SPARQL.RawResults.Class, HTTP.Response.Class]>;
    executeSELECTQuery<T>(documentURI: string, selectQuery: string, requestOptions?: HTTP.Request.Options): Promise<[SPARQL.SELECTResults.Class<T>, HTTP.Response.Class]>;
    executeRawCONSTRUCTQuery(documentURI: string, constructQuery: string, requestOptions?: HTTP.Request.Options): Promise<[string, HTTP.Response.Class]>;
    executeRawDESCRIBEQuery(documentURI: string, describeQuery: string, requestOptions?: HTTP.Request.Options): Promise<[string, HTTP.Response.Class]>;
    executeUPDATE(documentURI: string, update: string, requestOptions?: HTTP.Request.Options): Promise<HTTP.Response.Class>;
    sparql(documentURI: string): QueryClause;
    on(event: Messaging.Event | string, uriPattern: string, onEvent: (message: Messaging.Message.Class) => void, onError: (error: Error) => void): void;
    off(event: Messaging.Event | string, uriPattern: string, onEvent: (message: Messaging.Message.Class) => void, onError: (error: Error) => void): void;
    one(event: Messaging.Event | string, uriPattern: string, onEvent: (message: Messaging.Message.Class) => void, onError: (error: Error) => void): void;
    onDocumentCreated(uriPattern: string, onEvent: (message: Messaging.Message.Class) => void, onError: (error: Error) => void): void;
    onChildCreated(uriPattern: string, onEvent: (message: Messaging.Message.Class) => void, onError: (error: Error) => void): void;
    onAccessPointCreated(uriPattern: string, onEvent: (message: Messaging.Message.Class) => void, onError: (error: Error) => void): void;
    onDocumentModified(uriPattern: string, onEvent: (message: Messaging.Message.Class) => void, onError: (error: Error) => void): void;
    onDocumentDeleted(uriPattern: string, onEvent: (message: Messaging.Message.Class) => void, onError: (error: Error) => void): void;
    onMemberAdded(uriPattern: string, onEvent: (message: Messaging.Message.Class) => void, onError: (error: Error) => void): void;
    onMemberRemoved(uriPattern: string, onEvent: (message: Messaging.Message.Class) => void, onError: (error: Error) => void): void;
    _getPersistedDocument<T>(rdfDocument: RDF.Document.Class, response: HTTP.Response.Class): T & PersistedDocument.Class;
    _getFreeResources(nodes: RDF.Node.Class[]): FreeResources.Class;
    private persistDocument<T, W>(parentURI, slug, document, requestOptions);
    private getRDFDocument(requestURL, rdfDocuments, response);
    private getDocumentResource(rdfDocument, response);
    private getPointerID(uri);
    private createPointer(localID);
    private createPointerFrom<T>(object, localID);
    private compact(expandedObjects, targetObjects, pointerLibrary);
    private compact(expandedObject, targetObject, pointerLibrary);
    private compactSingle(expandedObject, targetObject, pointerLibrary);
    private getDigestedObjectSchemaForExpandedObject(expandedObject);
    private getDigestedObjectSchemaForDocument(document);
    private getDigestedObjectSchema(objectTypes, objectID);
    private getRequestURI(uri);
    private setDefaultRequestOptions(requestOptions, interactionModel);
    private getMembershipResource(documentResource, rdfDocuments, response);
    private createPersistedDocument<T>(documentPointer, documentResource, fragmentResources);
    private updatePersistedDocument<T>(persistedDocument, documentResource, fragmentsNode);
    private getPersistedMetadataResources<T>(freeNodes, rdfDocuments, response);
    private decoratePersistedDocument(persistedDocument);
    private updateFromPreferenceApplied<T>(persistedDocument, rdfDocuments, response);
    private _parseMembers(pointers);
    private applyResponseData<T>(persistedProtectedDocument, response);
    private applyNodeMap(freeNodes);
}
export default Class;
