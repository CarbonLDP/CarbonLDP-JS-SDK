/// <reference path="./../typings/tsd.d.ts" />
var App = require("./App");
var APIDescription = require("./APIDescription");
var Auth = require("./Auth");
var Documents_1 = require("./Documents");
var Errors = require("./Errors");
var LDP = require("./LDP");
var ObjectSchema = require("./ObjectSchema");
var Class = (function () {
    function Class() {
        this.settings = new Map();
        this.generalObjectSchema = new ObjectSchema.DigestedObjectSchema();
        this.typeObjectSchemaMap = new Map();
        this.Auth = new Auth.Class(this);
        this.Documents = new Documents_1.default(this);
        this.registerDefaultObjectSchemas();
    }
    Object.defineProperty(Class.prototype, "parentContext", {
        /* tslint:enable: variable-name */
        get: function () { return null; },
        enumerable: true,
        configurable: true
    });
    Class.prototype.getBaseURI = function () {
        return this.resolve("");
    };
    Class.prototype.resolve = function (relativeURI) {
        return relativeURI;
    };
    Class.prototype.hasSetting = function (name) {
        return (this.settings.has(name) ||
            (this.parentContext && this.parentContext.hasSetting(name)));
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
        if (this.typeObjectSchemaMap.has(type))
            return true;
        if (!!this.parentContext && this.parentContext.hasObjectSchema(type))
            return true;
        return false;
    };
    Class.prototype.getObjectSchema = function (type) {
        if (type === void 0) { type = null; }
        if (!!type) {
            // Type specific schema
            if (this.typeObjectSchemaMap.has(type))
                return this.typeObjectSchemaMap.get(type);
            if (!!this.parentContext && this.parentContext.hasObjectSchema(type))
                return this.parentContext.getObjectSchema(type);
            return null;
        }
        else {
            // General schema
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
        var digestedSchema = ObjectSchema.Digester.digestSchema(objectSchema);
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
            new ObjectSchema.DigestedObjectSchema(),
            digestedSchemaToExtend,
            digestedSchema,
        ]);
    };
    Class.prototype.extendTypeObjectSchema = function (digestedSchema, type) {
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
            new ObjectSchema.DigestedObjectSchema(),
            digestedSchemaToExtend,
            digestedSchema,
        ]);
        this.typeObjectSchemaMap.set(type, extendedDigestedSchema);
    };
    Class.prototype.registerDefaultObjectSchemas = function () {
        this.extendObjectSchema(LDP.RDFSource.RDF_CLASS, LDP.RDFSource.SCHEMA);
        this.extendObjectSchema(LDP.Container.RDF_CLASS, LDP.Container.SCHEMA);
        this.extendObjectSchema(LDP.BasicContainer.RDF_CLASS, LDP.Container.SCHEMA);
        this.extendObjectSchema(APIDescription.RDF_CLASS, APIDescription.SCHEMA);
        this.extendObjectSchema(App.RDF_CLASS, App.SCHEMA);
        this.extendObjectSchema(Auth.Token.RDF_CLASS, Auth.Token.CONTEXT);
    };
    return Class;
})();
exports.Class = Class;
/* tslint:disable: variable-name */
exports.instance = new Class();
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = exports.instance;

//# sourceMappingURL=SDKContext.js.map
