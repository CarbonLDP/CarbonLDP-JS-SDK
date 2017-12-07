"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Auth = require("./Auth");
var Document = require("./Document");
var Documents = require("./Documents");
var Errors = require("./Errors");
var LDP = require("./LDP");
var Messaging = require("./Messaging");
var ObjectSchema = require("./ObjectSchema");
var ProtectedDocument = require("./ProtectedDocument");
var RDF = require("./RDF");
var RDFRepresentation = require("./RDFRepresentation");
var SHACL = require("./SHACL");
var SPARQL = require("./SPARQL");
var System = require("./System");
var Class = (function () {
    function Class() {
        this.settings = new Map();
        this.generalObjectSchema = new ObjectSchema.DigestedObjectSchema();
        this.typeObjectSchemaMap = new Map();
        this.auth = new Auth.Class(this);
        this.documents = new Documents.Class(this);
        this.registerDefaultObjectSchemas();
    }
    Object.defineProperty(Class.prototype, "baseURI", {
        get: function () { return ""; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Class.prototype, "parentContext", {
        get: function () { return null; },
        enumerable: true,
        configurable: true
    });
    Class.prototype.resolve = function (relativeURI) {
        return relativeURI;
    };
    Class.prototype.resolveSystemURI = function (relativeURI) {
        if (!this.hasSetting("system.container"))
            throw new Errors.IllegalStateError("The \"system.container\" setting hasn't been defined.");
        var systemContainer = this.resolve(this.getSetting("system.container"));
        var systemURI = RDF.URI.Util.resolve(systemContainer, relativeURI);
        if (!systemURI.startsWith(systemContainer))
            throw new Errors.IllegalArgumentError("The provided URI \"" + relativeURI + "\" doesn't belong to the system container of your Carbon LDP.");
        return systemURI;
    };
    Class.prototype.hasSetting = function (name) {
        return (this.settings.has(name))
            || (!!this.parentContext && this.parentContext.hasSetting(name));
    };
    Class.prototype.getSetting = function (name) {
        if (this.settings.has(name))
            return this.settings.get(name);
        if (this.parentContext && this.parentContext.hasSetting(name))
            return this.parentContext.getSetting(name);
        return null;
    };
    Class.prototype.setSetting = function (name, value) {
        this.settings.set(name, value);
    };
    Class.prototype.deleteSetting = function (name) {
        this.settings.delete(name);
    };
    Class.prototype.hasObjectSchema = function (type) {
        type = this.resolveTypeURI(type);
        if (this.typeObjectSchemaMap.has(type))
            return true;
        return !!this.parentContext && this.parentContext.hasObjectSchema(type);
    };
    Class.prototype.getObjectSchema = function (type) {
        if (type === void 0) { type = null; }
        if (!!type) {
            type = this.resolveTypeURI(type);
            if (this.typeObjectSchemaMap.has(type))
                return this.typeObjectSchemaMap.get(type);
            if (!!this.parentContext && this.parentContext.hasObjectSchema(type))
                return this.parentContext.getObjectSchema(type);
            return null;
        }
        else {
            if (!!this.generalObjectSchema)
                return this.generalObjectSchema;
            if (!!this.parentContext)
                return this.parentContext.getObjectSchema();
            throw new Errors.IllegalStateError();
        }
    };
    Class.prototype.extendObjectSchema = function (typeOrObjectSchema, objectSchema) {
        if (objectSchema === void 0) { objectSchema = null; }
        var type = objectSchema ? typeOrObjectSchema : null;
        objectSchema = !!objectSchema ? objectSchema : typeOrObjectSchema;
        var vocab = this.hasSetting("vocabulary") ? this.resolve(this.getSetting("vocabulary")) : void 0;
        var digestedSchema = ObjectSchema.Digester.digestSchema(objectSchema, vocab);
        if (!type) {
            this.extendGeneralObjectSchema(digestedSchema);
        }
        else {
            this.extendTypeObjectSchema(digestedSchema, type);
        }
    };
    Class.prototype.clearObjectSchema = function (type) {
        if (type === void 0) { type = null; }
        if (!type) {
            this.generalObjectSchema = !!this.parentContext ? null : new ObjectSchema.DigestedObjectSchema();
        }
        else {
            type = this.resolveTypeURI(type);
            this.typeObjectSchemaMap.delete(type);
        }
    };
    Class.prototype.extendGeneralObjectSchema = function (digestedSchema) {
        var digestedSchemaToExtend;
        if (!!this.generalObjectSchema) {
            digestedSchemaToExtend = this.generalObjectSchema;
        }
        else if (!!this.parentContext) {
            digestedSchemaToExtend = this.parentContext.getObjectSchema();
        }
        else {
            digestedSchemaToExtend = new ObjectSchema.DigestedObjectSchema();
        }
        this.generalObjectSchema = ObjectSchema.Digester.combineDigestedObjectSchemas([
            digestedSchemaToExtend,
            digestedSchema,
        ]);
    };
    Class.prototype.extendTypeObjectSchema = function (digestedSchema, type) {
        type = this.resolveTypeURI(type);
        var digestedSchemaToExtend;
        if (this.typeObjectSchemaMap.has(type)) {
            digestedSchemaToExtend = this.typeObjectSchemaMap.get(type);
        }
        else if (!!this.parentContext && this.parentContext.hasObjectSchema(type)) {
            digestedSchemaToExtend = this.parentContext.getObjectSchema(type);
        }
        else {
            digestedSchemaToExtend = new ObjectSchema.DigestedObjectSchema();
        }
        var extendedDigestedSchema = ObjectSchema.Digester.combineDigestedObjectSchemas([
            digestedSchemaToExtend,
            digestedSchema,
        ]);
        this.typeObjectSchemaMap.set(type, extendedDigestedSchema);
    };
    Class.prototype.registerDefaultObjectSchemas = function () {
        this.extendObjectSchema(Document.RDF_CLASS, Document.SCHEMA);
        this.extendObjectSchema(ProtectedDocument.RDF_CLASS, ProtectedDocument.SCHEMA);
        this.extendObjectSchema(System.PlatformMetadata.RDF_CLASS, System.PlatformMetadata.SCHEMA);
        this.extendObjectSchema(System.InstanceMetadata.RDF_CLASS, System.InstanceMetadata.SCHEMA);
        this.extendObjectSchema(RDFRepresentation.RDF_CLASS, RDFRepresentation.SCHEMA);
        this.extendObjectSchema(LDP.Entry.SCHEMA);
        this.extendObjectSchema(LDP.Error.RDF_CLASS, LDP.Error.SCHEMA);
        this.extendObjectSchema(LDP.ErrorResponse.RDF_CLASS, LDP.ErrorResponse.SCHEMA);
        this.extendObjectSchema(LDP.ResponseMetadata.RDF_CLASS, LDP.ResponseMetadata.SCHEMA);
        this.extendObjectSchema(LDP.DocumentMetadata.RDF_CLASS, LDP.DocumentMetadata.SCHEMA);
        this.extendObjectSchema(LDP.AddMemberAction.RDF_CLASS, LDP.AddMemberAction.SCHEMA);
        this.extendObjectSchema(LDP.RemoveMemberAction.RDF_CLASS, LDP.RemoveMemberAction.SCHEMA);
        this.extendObjectSchema(LDP.Map.RDF_CLASS, LDP.Map.SCHEMA);
        this.extendObjectSchema(LDP.ValidationError.RDF_CLASS, LDP.ValidationError.SCHEMA);
        this.extendObjectSchema(Auth.Role.RDF_CLASS, Auth.Role.SCHEMA);
        this.extendObjectSchema(Auth.ACE.RDF_CLASS, Auth.ACE.SCHEMA);
        this.extendObjectSchema(Auth.ACL.RDF_CLASS, Auth.ACL.SCHEMA);
        this.extendObjectSchema(Auth.User.RDF_CLASS, Auth.User.SCHEMA);
        this.extendObjectSchema(Auth.Credentials.RDF_CLASS, Auth.Credentials.SCHEMA);
        this.extendObjectSchema(Auth.Ticket.RDF_CLASS, Auth.Ticket.SCHEMA);
        this.extendObjectSchema(Auth.TokenCredentials.RDF_CLASS, Auth.TokenCredentials.SCHEMA);
        this.extendObjectSchema(SHACL.ValidationReport.RDF_CLASS, SHACL.ValidationReport.SCHEMA);
        this.extendObjectSchema(SHACL.ValidationResult.RDF_CLASS, SHACL.ValidationResult.SCHEMA);
        this.extendObjectSchema(SPARQL.QueryDocument.QueryMetadata.RDF_CLASS, SPARQL.QueryDocument.QueryMetadata.SCHEMA);
        this.extendObjectSchema(Messaging.AccessPointCreated.RDF_CLASS, Messaging.AccessPointCreated.SCHEMA);
        this.extendObjectSchema(Messaging.ChildCreated.RDF_CLASS, Messaging.ChildCreated.SCHEMA);
        this.extendObjectSchema(Messaging.DocumentCreatedDetails.RDF_CLASS, Messaging.DocumentCreatedDetails.SCHEMA);
        this.extendObjectSchema(Messaging.DocumentDeleted.RDF_CLASS, Messaging.DocumentDeleted.SCHEMA);
        this.extendObjectSchema(Messaging.DocumentModified.RDF_CLASS, Messaging.DocumentModified.SCHEMA);
        this.extendObjectSchema(Messaging.MemberAdded.RDF_CLASS, Messaging.MemberAdded.SCHEMA);
        this.extendObjectSchema(Messaging.MemberAddedDetails.RDF_CLASS, Messaging.MemberAddedDetails.SCHEMA);
        this.extendObjectSchema(Messaging.MemberRemoved.RDF_CLASS, Messaging.MemberRemoved.SCHEMA);
        this.extendObjectSchema(Messaging.MemberRemovedDetails.RDF_CLASS, Messaging.MemberRemovedDetails.SCHEMA);
    };
    Class.prototype.resolveTypeURI = function (uri) {
        var vocab = this.hasSetting("vocabulary") ?
            this.resolve(this.getSetting("vocabulary")) : null;
        return ObjectSchema.Util.resolveURI(uri, this.getObjectSchema(), vocab);
    };
    return Class;
}());
exports.Class = Class;
exports.instance = new Class();
exports.default = exports.instance;

//# sourceMappingURL=SDKContext.js.map
