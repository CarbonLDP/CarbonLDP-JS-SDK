import * as AbstractContext from "./AbstractContext";
import * as AccessPoint from "./AccessPoint";
import * as Auth from "./Auth";
import * as Document from "./Document";
import * as Documents from "./Documents";
import * as Errors from "./Errors";
import * as Fragment from "./Fragment";
import * as HTTP from "./HTTP";
import * as JSONLD from "./JSONLD";
import * as LDP from "./LDP";
import * as LDPatch from "./LDPatch";
import * as Messaging from "./Messaging";
import * as NamedFragment from "./NamedFragment";
import * as Vocabularies from "./Vocabularies/index";
import * as ObjectSchema from "./ObjectSchema";
import * as PersistedDocument from "./PersistedDocument";
import * as PersistedFragment from "./PersistedFragment";
import * as PersistedNamedFragment from "./PersistedNamedFragment";
import * as PersistedResource from "./PersistedResource";
import * as Pointer from "./Pointer";
import * as RDF from "./RDF";
import * as Resource from "./Resource";
import * as SDKContext from "./SDKContext";
import * as Settings from "./Settings";
import * as SHACL from "./SHACL";
import * as SPARQL from "./SPARQL";
import * as System from "./System";
import * as Utils from "./Utils";
export declare class Class extends AbstractContext.AbstractContext {
    static AbstractContext: typeof AbstractContext;
    static AccessPoint: typeof AccessPoint;
    static Auth: typeof Auth;
    static Document: typeof Document;
    static Documents: typeof Documents;
    static Errors: typeof Errors;
    static Fragment: typeof Fragment;
    static HTTP: typeof HTTP;
    static JSONLD: typeof JSONLD;
    static LDP: typeof LDP;
    static LDPatch: typeof LDPatch;
    static Messaging: typeof Messaging;
    static NamedFragment: typeof NamedFragment;
    static Vocabularies: typeof Vocabularies;
    static ObjectSchema: typeof ObjectSchema;
    static PersistedDocument: typeof PersistedDocument;
    static PersistedFragment: typeof PersistedFragment;
    static PersistedNamedFragment: typeof PersistedNamedFragment;
    static PersistedResource: typeof PersistedResource;
    static Pointer: typeof Pointer;
    static RDF: typeof RDF;
    static Resource: typeof Resource;
    static SDKContext: typeof SDKContext;
    static Settings: typeof Settings;
    static SHACL: typeof SHACL;
    static SPARQL: typeof SPARQL;
    static System: typeof System;
    static Utils: typeof Utils;
    static readonly version: string;
    readonly version: string;
    protected _baseURI: string;
    protected settings: Settings.ContextSettings;
    messaging: Messaging.Service.Class;
    constructor(url: string);
    constructor(settings: Settings.Class);
    getPlatformMetadata(): Promise<[System.PlatformMetadata.Class, HTTP.Response.Class]>;
}
export default Class;
