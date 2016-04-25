import * as HTTP from "./HTTP";
import Context from "./Context";
import * as AccessPoint from "./AccessPoint";
import * as Document from "./Document";
import * as JSONLDConverter from "./JSONLDConverter";
import * as PersistedDocument from "./PersistedDocument";
import * as Pointer from "./Pointer";
import * as ObjectSchema from "./ObjectSchema";
import * as SPARQL from "./SPARQL";
declare class Documents implements Pointer.Library, Pointer.Validator, ObjectSchema.Resolver {
    _jsonldConverter: JSONLDConverter.Class;
    jsonldConverter: JSONLDConverter.Class;
    private context;
    private pointers;
    private _inProgress;
    constructor(context?: Context);
    inScope(pointer: Pointer.Class): boolean;
    inScope(id: string): boolean;
    hasPointer(id: string): boolean;
    getPointer(id: string): Pointer.Class;
    get(uri: string, requestOptions?: HTTP.Request.Options): Promise<[PersistedDocument.Class, HTTP.Response.Class]>;
    exists(documentURI: string, requestOptions?: HTTP.Request.Options): Promise<[boolean, HTTP.Response.Class]>;
    createChild(parentURI: string, slug: string, childDocument: Document.Class, requestOptions?: HTTP.Request.Options): Promise<[Pointer.Class, HTTP.Response.Class]>;
    createChild(parentURI: string, childDocument: Document.Class, requestOptions?: HTTP.Request.Options): Promise<[Pointer.Class, HTTP.Response.Class]>;
    createChild(parentURI: string, slug: string, childObject: Object, requestOptions?: HTTP.Request.Options): Promise<[Pointer.Class, HTTP.Response.Class]>;
    createChild(parentURI: string, childObject: Object, requestOptions?: HTTP.Request.Options): Promise<[Pointer.Class, HTTP.Response.Class]>;
    getChildren(parentURI: string, requestOptions?: HTTP.Request.Options): Promise<[Pointer.Class[], HTTP.Response.Class]>;
    createAccessPoint(documentURI: string, accessPoint: AccessPoint.Class, slug?: string, requestOptions?: HTTP.Request.Options): Promise<[Pointer.Class, HTTP.Response.Class]>;
    createAccessPoint(accessPoint: AccessPoint.Class, slug?: string, requestOptions?: HTTP.Request.Options): Promise<[Pointer.Class, HTTP.Response.Class]>;
    upload(parentURI: string, slug: string, file: Blob, requestOptions?: HTTP.Request.Options): Promise<[Pointer.Class, HTTP.Response.Class]>;
    upload(parentURI: string, file: Blob, requestOptions?: HTTP.Request.Options): Promise<[Pointer.Class, HTTP.Response.Class]>;
    getMembers(uri: string, includeNonReadable: boolean, requestOptions: HTTP.Request.Options): Promise<[Pointer.Class[], HTTP.Response.Class]>;
    getMembers(uri: string, includeNonReadable: boolean): Promise<[Pointer.Class[], HTTP.Response.Class]>;
    getMembers(uri: string, requestOptions: HTTP.Request.Options): Promise<[Pointer.Class[], HTTP.Response.Class]>;
    getMembers(uri: string): Promise<[Pointer.Class[], HTTP.Response.Class]>;
    addMember(documentURI: string, member: Pointer.Class, requestOptions?: HTTP.Request.Options): Promise<HTTP.Response.Class>;
    addMember(documentURI: string, memberURI: string, requestOptions?: HTTP.Request.Options): Promise<HTTP.Response.Class>;
    addMembers(documentURI: string, members: (Pointer.Class | string)[], requestOptions?: HTTP.Request.Options): Promise<HTTP.Response.Class>;
    removeMember(documentURI: string, member: Pointer.Class, requestOptions?: HTTP.Request.Options): Promise<HTTP.Response.Class>;
    removeMember(documentURI: string, memberURI: string, requestOptions?: HTTP.Request.Options): Promise<HTTP.Response.Class>;
    removeMembers(documentURI: string, members: (Pointer.Class | string)[], requestOptions?: HTTP.Request.Options): Promise<HTTP.Response.Class>;
    removeAllMembers(documentURI: string, requestOptions?: HTTP.Request.Options): Promise<HTTP.Response.Class>;
    save(persistedDocument: PersistedDocument.Class, requestOptions?: HTTP.Request.Options): Promise<[PersistedDocument.Class, HTTP.Response.Class]>;
    delete(documentURI: string, requestOptions?: HTTP.Request.Options): Promise<HTTP.Response.Class>;
    getSchemaFor(object: Object): ObjectSchema.DigestedObjectSchema;
    executeRawASKQuery(documentURI: string, askQuery: string, requestOptions?: HTTP.Request.Options): Promise<[SPARQL.RawResults.Class, HTTP.Response.Class]>;
    executeASKQuery(documentURI: string, askQuery: string, requestOptions?: HTTP.Request.Options): Promise<[boolean, HTTP.Response.Class]>;
    executeRawSELECTQuery(documentURI: string, selectQuery: string, requestOptions?: HTTP.Request.Options): Promise<[SPARQL.RawResults.Class, HTTP.Response.Class]>;
    executeSELECTQuery(documentURI: string, selectQuery: string, requestOptions?: HTTP.Request.Options): Promise<[SPARQL.SELECTResults.Class, HTTP.Response.Class]>;
    executeRawCONSTRUCTQuery(documentURI: string, constructQuery: string, requestOptions?: HTTP.Request.Options): Promise<[string, HTTP.Response.Class]>;
    executeRawDESCRIBEQuery(documentURI: string, constructQuery: string, requestOptions?: HTTP.Request.Options): Promise<[string, HTTP.Response.Class]>;
    private getRDFDocument(requestURL, rdfDocuments, response);
    private getDocumentResource(rdfDocument, response);
    private getPointerID(uri);
    private createPointer(localID);
    private compact(expandedObjects, targetObjects, pointerLibrary);
    private compact(expandedObject, targetObject, pointerLibrary);
    private compactSingle(expandedObject, targetObject, pointerLibrary);
    private getDigestedObjectSchemaForExpandedObject(expandedObject);
    private getDigestedObjectSchemaForDocument(document);
    private getDigestedObjectSchema(objectTypes);
    private getExpandedObjectTypes(expandedObject);
    private getDocumentTypes(document);
}
export default Documents;
