"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
var Errors_1 = require("./Errors");
var URI_1 = require("./RDF/URI");
var Utils = __importStar(require("./Utils"));
var XSD_1 = require("./Vocabularies/XSD");
var ContainerType;
(function (ContainerType) {
    ContainerType[ContainerType["SET"] = 0] = "SET";
    ContainerType[ContainerType["LIST"] = 1] = "LIST";
    ContainerType[ContainerType["LANGUAGE"] = 2] = "LANGUAGE";
})(ContainerType = exports.ContainerType || (exports.ContainerType = {}));
var PointerType;
(function (PointerType) {
    PointerType[PointerType["ID"] = 0] = "ID";
    PointerType[PointerType["VOCAB"] = 1] = "VOCAB";
})(PointerType = exports.PointerType || (exports.PointerType = {}));
var DigestedObjectSchemaProperty = (function () {
    function DigestedObjectSchemaProperty() {
        this.uri = null;
        this.literal = null;
        this.literalType = null;
        this.pointerType = null;
        this.containerType = null;
    }
    return DigestedObjectSchemaProperty;
}());
exports.DigestedObjectSchemaProperty = DigestedObjectSchemaProperty;
var DigestedObjectSchema = (function () {
    function DigestedObjectSchema() {
        this.base = "";
        this.vocab = null;
        this.language = null;
        this.prefixes = new Map();
        this.properties = new Map();
    }
    return DigestedObjectSchema;
}());
exports.DigestedObjectSchema = DigestedObjectSchema;
var ObjectSchemaDigester = (function () {
    function ObjectSchemaDigester() {
    }
    ObjectSchemaDigester.digestSchema = function (schemas) {
        if (!Array.isArray(schemas))
            return ObjectSchemaDigester._digestSchema(schemas);
        var digestedSchemas = schemas
            .map(function (schema) { return ObjectSchemaDigester._digestSchema(schema); });
        return ObjectSchemaDigester._combineSchemas(digestedSchemas);
    };
    ObjectSchemaDigester.digestProperty = function (name, definition, digestedSchema) {
        var digestedDefinition = new DigestedObjectSchemaProperty();
        if ("@id" in definition) {
            var uri = definition["@id"];
            if (URI_1.URI.isPrefixed(name))
                throw new Errors_1.IllegalArgumentError("A prefixed property cannot have assigned another URI.");
            if (!Utils.isString(uri))
                throw new Errors_1.IllegalArgumentError("@id needs to point to a string");
            digestedDefinition.uri = uri;
        }
        else {
            digestedDefinition.uri = name;
        }
        if ("@type" in definition) {
            var type = definition["@type"];
            if (!Utils.isString(type))
                throw new Errors_1.IllegalArgumentError("@type needs to point to a string");
            if (type === "@id" || type === "@vocab") {
                digestedDefinition.literal = false;
                digestedDefinition.pointerType = type === "@id" ? PointerType.ID : PointerType.VOCAB;
            }
            else {
                if (URI_1.URI.isRelative(type) && type in XSD_1.XSD)
                    type = XSD_1.XSD[type];
                digestedDefinition.literal = true;
                digestedDefinition.literalType = type;
            }
        }
        if ("@language" in definition) {
            var language = definition["@language"];
            if (language !== null && !Utils.isString(language))
                throw new Errors_1.IllegalArgumentError("@language needs to point to a string or null.");
            digestedDefinition.literal = true;
            digestedDefinition.language = language;
        }
        if ("@container" in definition) {
            switch (definition["@container"]) {
                case "@set":
                    digestedDefinition.containerType = ContainerType.SET;
                    break;
                case "@list":
                    digestedDefinition.containerType = ContainerType.LIST;
                    break;
                case "@language":
                    if (Utils.isString(digestedDefinition.language))
                        throw new Errors_1.IllegalArgumentError("@container cannot be set to @language when the property definition already contains an @language tag.");
                    digestedDefinition.containerType = ContainerType.LANGUAGE;
                    break;
                default:
                    throw new Errors_1.IllegalArgumentError("@container needs to be equal to '@list', '@set', or '@language'");
            }
        }
        return digestedSchema ?
            ObjectSchemaUtils.resolveProperty(digestedSchema, digestedDefinition, true) :
            digestedDefinition;
    };
    ObjectSchemaDigester.combineDigestedObjectSchemas = function (digestedSchemas) {
        if (digestedSchemas.length === 0)
            throw new Errors_1.IllegalArgumentError("At least one DigestedObjectSchema needs to be specified.");
        digestedSchemas.unshift(new DigestedObjectSchema());
        return ObjectSchemaDigester._combineSchemas(digestedSchemas);
    };
    ObjectSchemaDigester._digestSchema = function (schema) {
        var digestedSchema = new DigestedObjectSchema();
        for (var _i = 0, _a = ["@base", "@vocab"]; _i < _a.length; _i++) {
            var propertyName = _a[_i];
            if (!(propertyName in schema))
                continue;
            var value = schema[propertyName];
            if (value !== null && !Utils.isString(value))
                throw new Errors_1.IllegalArgumentError("The value of '" + propertyName + "' must be a string or null.");
            if ((propertyName === "@vocab" && value === "") || !URI_1.URI.isAbsolute(value) && !URI_1.URI.isBNodeID(value))
                throw new Errors_1.IllegalArgumentError("The value of '" + propertyName + "' must be an absolute URI" + (propertyName === "@base" ? " or an empty string" : "") + ".");
            digestedSchema[propertyName.substr(1)] = value;
        }
        digestedSchema.base = digestedSchema.base || "";
        if ("@language" in schema) {
            var value = schema["@language"];
            if (value !== null && !Utils.isString(value))
                throw new Errors_1.InvalidJSONLDSyntaxError("The value of '@language' must be a string or null.");
            digestedSchema.language = value;
        }
        for (var propertyName in schema) {
            if (!schema.hasOwnProperty(propertyName))
                continue;
            if (propertyName === "@reverse")
                continue;
            if (propertyName === "@index")
                continue;
            if (propertyName === "@base")
                continue;
            if (propertyName === "@vocab")
                continue;
            if (propertyName === "@language")
                continue;
            var propertyValue = schema[propertyName];
            if (Utils.isString(propertyValue)) {
                if (URI_1.URI.isPrefixed(propertyName))
                    throw new Errors_1.IllegalArgumentError("A prefixed property cannot be equal to another URI.");
                digestedSchema.prefixes.set(propertyName, propertyValue);
            }
            else if (!!propertyValue && Utils.isObject(propertyValue)) {
                var definition = ObjectSchemaDigester.digestProperty(propertyName, propertyValue);
                digestedSchema.properties.set(propertyName, definition);
            }
            else {
                throw new Errors_1.IllegalArgumentError("ObjectSchema Properties can only have string values or object values.");
            }
        }
        return digestedSchema;
    };
    ObjectSchemaDigester._combineSchemas = function (digestedSchemas) {
        var targetSchema = digestedSchemas[0], restSchemas = digestedSchemas.slice(1);
        restSchemas.forEach(function (schema) {
            if (schema.vocab !== null)
                targetSchema.vocab = schema.vocab;
            if (schema.base !== "")
                targetSchema.base = schema.base;
            if (schema.language !== null)
                targetSchema.language = schema.language;
            Utils.MapUtils.extend(targetSchema.prefixes, schema.prefixes);
            Utils.MapUtils.extend(targetSchema.properties, schema.properties);
        });
        return targetSchema;
    };
    return ObjectSchemaDigester;
}());
exports.ObjectSchemaDigester = ObjectSchemaDigester;
var ObjectSchemaUtils = (function () {
    function ObjectSchemaUtils() {
    }
    ObjectSchemaUtils.resolveURI = function (uri, schema, relativeTo) {
        if (relativeTo === void 0) { relativeTo = {}; }
        if (uri === null || URI_1.URI.isAbsolute(uri) || URI_1.URI.isBNodeID(uri))
            return uri;
        var _a = uri.split(":"), prefix = _a[0], _b = _a[1], localName = _b === void 0 ? "" : _b;
        var definedReference = schema.prefixes.has(prefix) ?
            schema.prefixes.get(prefix) : schema.properties.has(prefix) ?
            schema.properties.get(prefix).uri
            : null;
        if (definedReference !== null && definedReference !== prefix) {
            return ObjectSchemaUtils.resolveURI(definedReference + localName, schema, { vocab: true });
        }
        if (localName)
            return uri;
        if (relativeTo.vocab && schema.vocab !== null)
            return schema.vocab + uri;
        if (relativeTo.base)
            return URI_1.URI.resolve(schema.base, uri);
        return uri;
    };
    ObjectSchemaUtils.resolveProperty = function (schema, definition, inSame) {
        var uri = definition.uri;
        var type = definition.literalType;
        var resolvedURI = ObjectSchemaUtils.resolveURI(uri, schema, { vocab: true });
        var resolvedType = ObjectSchemaUtils.resolveURI(type, schema, { vocab: true, base: true });
        if (resolvedURI !== uri || resolvedType !== type) {
            definition = inSame ? definition : Utils.ObjectUtils.clone(definition);
            definition.uri = resolvedURI;
            definition.literalType = resolvedType;
        }
        return definition;
    };
    return ObjectSchemaUtils;
}());
exports.ObjectSchemaUtils = ObjectSchemaUtils;

//# sourceMappingURL=ObjectSchema.js.map
