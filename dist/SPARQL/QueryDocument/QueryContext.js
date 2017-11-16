"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var iri_1 = require("sparqler/iri");
var tokens_1 = require("sparqler/tokens");
var ObjectSchema_1 = require("../../ObjectSchema");
var QueryProperty = require("./QueryProperty");
var QueryVariable = require("./QueryVariable");
var Utils_1 = require("./Utils");
var Class = (function () {
    function Class(context) {
        this.context = context;
        this._propertiesMap = new Map();
        this._variablesCounter = 0;
        this._variablesMap = new Map();
        this._prefixesMap = new Map();
    }
    Class.prototype.getVariable = function (name) {
        if (this._variablesMap.has(name))
            return this._variablesMap.get(name);
        var variable = new QueryVariable.Class(name, this._variablesCounter++);
        this._variablesMap.set(name, variable);
        return variable;
    };
    Class.prototype.hasProperty = function (name) {
        return this._propertiesMap.has(name);
    };
    Class.prototype.hasProperties = function (name) {
        name += ".";
        return Array.from(this._propertiesMap.keys())
            .some(function (key) { return key.startsWith(name); });
    };
    Class.prototype.addProperty = function (name, pattern) {
        var property = new QueryProperty.Class(this, name, pattern);
        this._propertiesMap.set(name, property);
        return property;
    };
    Class.prototype.getProperty = function (name) {
        return this._propertiesMap.get(name);
    };
    Class.prototype.getProperties = function (propertyLevel) {
        var levelRegex = Utils_1.getLevelRegExp(propertyLevel);
        return Array.from(this._propertiesMap.entries())
            .filter(function (_a) {
            var name = _a[0];
            return levelRegex.test(name);
        })
            .map(function (_a) {
            var name = _a[0], property = _a[1];
            return property;
        });
    };
    Class.prototype.serializeLiteral = function (type, value) {
        type = this.expandIRI(type);
        if (!this.context || !this.context.documents.jsonldConverter.literalSerializers.has(type))
            return "" + value;
        return this.context.documents.jsonldConverter.literalSerializers.get(type).serialize(value);
    };
    Class.prototype.expandIRI = function (iri) {
        if (this.context) {
            var vocab = this.context.hasSetting("vocabulary") ? this.context.resolve(this.context.getSetting("vocabulary")) : void 0;
            iri = ObjectSchema_1.Util.resolveURI(iri, this.context.getObjectSchema(), vocab);
        }
        if (iri_1.isPrefixed(iri))
            throw new Error("Prefix \"" + iri.split(":")[0] + "\" has not been declared.");
        return iri;
    };
    Class.prototype.compactIRI = function (iri) {
        if (!this.context) {
            if (iri_1.isPrefixed(iri))
                throw new Error("Prefixed iri \"" + iri + "\" is not supported without a context.");
            if (iri_1.isRelative(iri))
                throw new Error("Relative iri \"" + iri + "\" is not supported without a context.");
            return new tokens_1.IRIToken(iri);
        }
        var schema = this.context.getObjectSchema();
        var namespace;
        var localName;
        if (!iri_1.isPrefixed(iri)) {
            for (var _i = 0, _a = Array.from(schema.prefixes.entries()); _i < _a.length; _i++) {
                var _b = _a[_i], prefixName = _b[0], prefixURI = _b[1].stringValue;
                if (!iri.startsWith(prefixURI))
                    continue;
                namespace = prefixName;
                localName = iri.substr(prefixURI.length);
                break;
            }
            if (namespace === void 0)
                return new tokens_1.IRIToken(iri);
        }
        var prefixedName = new tokens_1.PrefixedNameToken(namespace || iri, localName);
        namespace = prefixedName.namespace;
        if (!this._prefixesMap.has(namespace)) {
            if (!schema.prefixes.has(namespace))
                throw new Error("Prefix \"" + namespace + "\" has not been declared.");
            var prefixIRI = new tokens_1.IRIToken(schema.prefixes.get(namespace).stringValue);
            this._prefixesMap.set(namespace, new tokens_1.PrefixToken(namespace, prefixIRI));
        }
        return prefixedName;
    };
    Class.prototype.getInheritTypeDefinition = function (propertyName, propertyURI, existingSchema) {
        if (existingSchema === void 0) { existingSchema = this.context.getObjectSchema(); }
        var schemas = [existingSchema].concat(this._getTypeSchemas());
        for (var _i = 0, schemas_1 = schemas; _i < schemas_1.length; _i++) {
            var schema = schemas_1[_i];
            if (!schema.properties.has(propertyName))
                continue;
            var digestedProperty = schema.properties.get(propertyName);
            if (propertyURI && digestedProperty.uri.stringValue !== propertyURI)
                continue;
            return digestedProperty;
        }
    };
    Class.prototype.getGeneralSchema = function () {
        if (!this.context)
            return new ObjectSchema_1.DigestedObjectSchema();
        return this.context.documents.getGeneralSchema();
    };
    Class.prototype.getSchemaFor = function (object, path) {
        if (path === void 0) {
            if (!this.context)
                return new ObjectSchema_1.DigestedObjectSchema();
            return this.context.documents.getSchemaFor(object);
        }
        var property = this._propertiesMap.get(path);
        if (!property)
            throw new Error("Schema path \"" + path + "\" does not exists.");
        return property.getSchema();
    };
    Class.prototype.getPrologues = function () {
        return Array.from(this._prefixesMap.values());
    };
    Class.prototype._getTypeSchemas = function () {
        var _this = this;
        if (this._schemas)
            return this._schemas;
        var schemasTypes = new Set();
        (function addSchemasTypes(context) {
            if (!context)
                return;
            Array.from(context["typeObjectSchemaMap"].keys()).forEach(schemasTypes.add, schemasTypes);
            addSchemasTypes(context.parentContext);
        })(this.context);
        this._schemas = [];
        schemasTypes.forEach(function (type) { return _this._schemas.push(_this.context.getObjectSchema(type)); });
        return this._schemas;
    };
    return Class;
}());
exports.Class = Class;
exports.default = Class;

//# sourceMappingURL=QueryContext.js.map
