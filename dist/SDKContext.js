"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
var ACE_1 = require("./Auth/ACE");
var ACL_1 = require("./Auth/ACL");
var AuthenticatedUserInformationAccessor_1 = require("./Auth/AuthenticatedUserInformationAccessor");
var AuthenticatedUserMetadata_1 = require("./Auth/AuthenticatedUserMetadata");
var CredentialsSet_1 = require("./Auth/CredentialsSet");
var LDAPCredentials_1 = require("./Auth/LDAPCredentials");
var Role_1 = require("./Auth/Role");
var TokenCredentials_1 = require("./Auth/TokenCredentials");
var User_1 = require("./Auth/User");
var UsernameAndPasswordCredentials_1 = require("./Auth/UsernameAndPasswordCredentials");
var Document_1 = require("./Document");
var Documents_1 = require("./Documents");
var Errors = __importStar(require("./Errors"));
var AddMemberAction_1 = require("./LDP/AddMemberAction");
var DocumentMetadata_1 = require("./LDP/DocumentMetadata");
var Error_1 = require("./LDP/Error");
var ErrorResponse_1 = require("./LDP/ErrorResponse");
var Map_1 = require("./LDP/Map");
var MapEntry_1 = require("./LDP/MapEntry");
var RemoveMemberAction_1 = require("./LDP/RemoveMemberAction");
var ResponseMetadata_1 = require("./LDP/ResponseMetadata");
var ValidationError_1 = require("./LDP/ValidationError");
var AccessPointCreated_1 = require("./Messaging/AccessPointCreated");
var ChildCreated_1 = require("./Messaging/ChildCreated");
var DocumentCreatedDetails_1 = require("./Messaging/DocumentCreatedDetails");
var DocumentDeleted_1 = require("./Messaging/DocumentDeleted");
var DocumentModified_1 = require("./Messaging/DocumentModified");
var MemberAdded_1 = require("./Messaging/MemberAdded");
var MemberAddedDetails_1 = require("./Messaging/MemberAddedDetails");
var MemberRemoved_1 = require("./Messaging/MemberRemoved");
var MemberRemovedDetails_1 = require("./Messaging/MemberRemovedDetails");
var ObjectSchema = __importStar(require("./ObjectSchema"));
var ProtectedDocument_1 = require("./ProtectedDocument");
var URI_1 = require("./RDF/URI");
var ValidationReport_1 = require("./SHACL/ValidationReport");
var ValidationResult_1 = require("./SHACL/ValidationResult");
var QueryMetadata_1 = require("./SPARQL/QueryDocument/QueryMetadata");
var PlatformInstance_1 = require("./System/PlatformInstance");
var PlatformMetadata_1 = require("./System/PlatformMetadata");
var Utils_1 = require("./Utils");
var SDKContext = (function () {
    function SDKContext() {
        this.generalObjectSchema = new ObjectSchema.DigestedObjectSchema();
        this.typeObjectSchemaMap = new Map();
        this.documents = new Documents_1.Documents(this);
        this.registerDefaultObjectSchemas();
    }
    Object.defineProperty(SDKContext.prototype, "baseURI", {
        get: function () { return ""; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SDKContext.prototype, "parentContext", {
        get: function () { return null; },
        enumerable: true,
        configurable: true
    });
    SDKContext.prototype.resolve = function (relativeURI) {
        return URI_1.URI.resolve(this.baseURI, relativeURI);
    };
    SDKContext.prototype._resolvePath = function (path) {
        var leftSearchedPaths = path.split(".");
        var currentSearchedPaths = [];
        var url = "";
        var documentPaths = this.settings && this.settings.paths;
        while (leftSearchedPaths.length) {
            var containerKey = leftSearchedPaths.shift();
            currentSearchedPaths.push(containerKey);
            var containerPath = documentPaths ? documentPaths[containerKey] : null;
            if (!containerPath)
                throw new Errors.IllegalStateError("The path \"" + currentSearchedPaths.join(".") + "\" hasn't been declared.");
            var slug = Utils_1.isString(containerPath) ? containerPath : containerPath.slug;
            if (!slug)
                throw new Errors.IllegalStateError("The path \"" + currentSearchedPaths.join(".") + "\" doesn't have a slug set.");
            url = URI_1.URI.resolve(url, slug);
            documentPaths = Utils_1.isObject(containerPath) ? containerPath.paths : null;
        }
        return this.resolve(url);
    };
    SDKContext.prototype.hasObjectSchema = function (type) {
        type = this._resolveTypeURI(type);
        if (this.typeObjectSchemaMap.has(type))
            return true;
        return !!this.parentContext && this.parentContext.hasObjectSchema(type);
    };
    SDKContext.prototype.getObjectSchema = function (type) {
        if (type === void 0) { type = null; }
        if (!!type) {
            type = this._resolveTypeURI(type);
            if (this.typeObjectSchemaMap.has(type))
                return this.typeObjectSchemaMap.get(type);
            if (!!this.parentContext && this.parentContext.hasObjectSchema(type))
                return this.parentContext.getObjectSchema(type);
            return null;
        }
        else {
            if (!this.generalObjectSchema && !this.parentContext)
                throw new Errors.IllegalStateError();
            var generalSchema = this.generalObjectSchema || this.parentContext.getObjectSchema();
            var clonedSchema = ObjectSchema.ObjectSchemaDigester
                .combineDigestedObjectSchemas([generalSchema]);
            if (clonedSchema.vocab === null && this.settings && this.settings.vocabulary)
                clonedSchema.vocab = this.resolve(this.settings.vocabulary);
            if (!clonedSchema.base)
                clonedSchema.base = this.baseURI;
            return clonedSchema;
        }
    };
    SDKContext.prototype.extendObjectSchema = function (typeOrObjectSchema, objectSchema) {
        if (objectSchema === void 0) { objectSchema = null; }
        var type = objectSchema ? typeOrObjectSchema : null;
        objectSchema = !!objectSchema ? objectSchema : typeOrObjectSchema;
        var digestedSchema = ObjectSchema.ObjectSchemaDigester.digestSchema(objectSchema);
        if (!type) {
            this.extendGeneralObjectSchema(digestedSchema);
        }
        else {
            this.extendTypeObjectSchema(digestedSchema, type);
        }
    };
    SDKContext.prototype.clearObjectSchema = function (type) {
        if (type === void 0) { type = null; }
        if (!type) {
            this.generalObjectSchema = !!this.parentContext ? null : new ObjectSchema.DigestedObjectSchema();
        }
        else {
            type = this._resolveTypeURI(type);
            this.typeObjectSchemaMap.delete(type);
        }
    };
    SDKContext.prototype.extendGeneralObjectSchema = function (digestedSchema) {
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
        this.generalObjectSchema = ObjectSchema.ObjectSchemaDigester.combineDigestedObjectSchemas([
            digestedSchemaToExtend,
            digestedSchema,
        ]);
    };
    SDKContext.prototype.extendTypeObjectSchema = function (digestedSchema, type) {
        type = this._resolveTypeURI(type);
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
        var extendedDigestedSchema = ObjectSchema.ObjectSchemaDigester.combineDigestedObjectSchemas([
            digestedSchemaToExtend,
            digestedSchema,
        ]);
        this.typeObjectSchemaMap.set(type, extendedDigestedSchema);
    };
    SDKContext.prototype.registerDefaultObjectSchemas = function () {
        this.extendObjectSchema(Document_1.Document.TYPE, Document_1.Document.SCHEMA);
        this.extendObjectSchema(ProtectedDocument_1.ProtectedDocument.TYPE, ProtectedDocument_1.ProtectedDocument.SCHEMA);
        this.extendObjectSchema(PlatformMetadata_1.PlatformMetadata.TYPE, PlatformMetadata_1.PlatformMetadata.SCHEMA);
        this.extendObjectSchema(PlatformInstance_1.PlatformInstance.TYPE, PlatformInstance_1.PlatformInstance.SCHEMA);
        this.extendObjectSchema(AddMemberAction_1.AddMemberAction.TYPE, AddMemberAction_1.AddMemberAction.SCHEMA);
        this.extendObjectSchema(Error_1.Error.TYPE, Error_1.Error.SCHEMA);
        this.extendObjectSchema(Map_1.Map.TYPE, Map_1.Map.SCHEMA);
        this.extendObjectSchema(MapEntry_1.MapEntry.SCHEMA);
        this.extendObjectSchema(DocumentMetadata_1.DocumentMetadata.TYPE, DocumentMetadata_1.DocumentMetadata.SCHEMA);
        this.extendObjectSchema(ErrorResponse_1.ErrorResponse.TYPE, ErrorResponse_1.ErrorResponse.SCHEMA);
        this.extendObjectSchema(RemoveMemberAction_1.RemoveMemberAction.TYPE, RemoveMemberAction_1.RemoveMemberAction.SCHEMA);
        this.extendObjectSchema(ResponseMetadata_1.ResponseMetadata.TYPE, ResponseMetadata_1.ResponseMetadata.SCHEMA);
        this.extendObjectSchema(ValidationError_1.ValidationError.TYPE, ValidationError_1.ValidationError.SCHEMA);
        this.extendObjectSchema(Role_1.Role.TYPE, Role_1.Role.SCHEMA);
        this.extendObjectSchema(ACE_1.ACE.TYPE, ACE_1.ACE.SCHEMA);
        this.extendObjectSchema(ACL_1.ACL.TYPE, ACL_1.ACL.SCHEMA);
        this.extendObjectSchema(AuthenticatedUserInformationAccessor_1.AuthenticatedUserInformationAccessor.TYPE, AuthenticatedUserInformationAccessor_1.AuthenticatedUserInformationAccessor.SCHEMA);
        this.extendObjectSchema(AuthenticatedUserMetadata_1.AuthenticatedUserMetadata.TYPE, AuthenticatedUserMetadata_1.AuthenticatedUserMetadata.SCHEMA);
        this.extendObjectSchema(User_1.User.TYPE, User_1.User.SCHEMA);
        this.extendObjectSchema(TokenCredentials_1.TokenCredentials.TYPE, TokenCredentials_1.TokenCredentials.SCHEMA);
        this.extendObjectSchema(CredentialsSet_1.CredentialsSet.TYPE, CredentialsSet_1.CredentialsSet.SCHEMA);
        this.extendObjectSchema(UsernameAndPasswordCredentials_1.UsernameAndPasswordCredentials.TYPE, UsernameAndPasswordCredentials_1.UsernameAndPasswordCredentials.SCHEMA);
        this.extendObjectSchema(LDAPCredentials_1.LDAPCredentials.TYPE, LDAPCredentials_1.LDAPCredentials.SCHEMA);
        this.extendObjectSchema(ValidationReport_1.ValidationReport.TYPE, ValidationReport_1.ValidationReport.SCHEMA);
        this.extendObjectSchema(ValidationResult_1.ValidationResult.TYPE, ValidationResult_1.ValidationResult.SCHEMA);
        this.extendObjectSchema(QueryMetadata_1.QueryMetadata.TYPE, QueryMetadata_1.QueryMetadata.SCHEMA);
        this.extendObjectSchema(AccessPointCreated_1.AccessPointCreated.TYPE, AccessPointCreated_1.AccessPointCreated.SCHEMA);
        this.extendObjectSchema(ChildCreated_1.ChildCreated.TYPE, ChildCreated_1.ChildCreated.SCHEMA);
        this.extendObjectSchema(DocumentCreatedDetails_1.DocumentCreatedDetails.TYPE, DocumentCreatedDetails_1.DocumentCreatedDetails.SCHEMA);
        this.extendObjectSchema(DocumentDeleted_1.DocumentDeleted.TYPE, DocumentDeleted_1.DocumentDeleted.SCHEMA);
        this.extendObjectSchema(DocumentModified_1.DocumentModified.TYPE, DocumentModified_1.DocumentModified.SCHEMA);
        this.extendObjectSchema(MemberAdded_1.MemberAdded.TYPE, MemberAdded_1.MemberAdded.SCHEMA);
        this.extendObjectSchema(MemberAddedDetails_1.MemberAddedDetails.TYPE, MemberAddedDetails_1.MemberAddedDetails.SCHEMA);
        this.extendObjectSchema(MemberRemoved_1.MemberRemoved.TYPE, MemberRemoved_1.MemberRemoved.SCHEMA);
        this.extendObjectSchema(MemberRemovedDetails_1.MemberRemovedDetails.TYPE, MemberRemovedDetails_1.MemberRemovedDetails.SCHEMA);
    };
    SDKContext.prototype._resolveTypeURI = function (uri) {
        return ObjectSchema.ObjectSchemaUtils.resolveURI(uri, this.getObjectSchema(), { vocab: true });
    };
    return SDKContext;
}());
exports.SDKContext = SDKContext;
exports.globalContext = new SDKContext();

//# sourceMappingURL=SDKContext.js.map
