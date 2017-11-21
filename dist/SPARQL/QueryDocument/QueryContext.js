"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var iri_1 = require("sparqler/iri");
var tokens_1 = require("sparqler/tokens");
var ObjectSchema_1 = require("../../ObjectSchema");
var QueryVariable = require("./QueryVariable");
var Class = (function () {
    function Class(context) {
        this.context = context;
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
    Class.prototype.getPrologues = function () {
        return Array.from(this._prefixesMap.values());
    };
    Class.prototype.getGeneralSchema = function () {
        if (!this.context)
            return new ObjectSchema_1.DigestedObjectSchema();
        return this.context.documents.getGeneralSchema();
    };
    Class.prototype.getSchemaFor = function (object, path) {
        if (!this.context)
            return new ObjectSchema_1.DigestedObjectSchema();
        return this.context.documents.getSchemaFor(object);
    };
    return Class;
}());
exports.Class = Class;
exports.default = Class;

//# sourceMappingURL=QueryContext.js.map