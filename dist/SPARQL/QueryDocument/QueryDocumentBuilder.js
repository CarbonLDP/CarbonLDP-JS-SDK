"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tokens_1 = require("sparqler/tokens");
var ObjectSchema_1 = require("../../ObjectSchema");
var Utils_1 = require("../../Utils");
var Errors_1 = require("./../../Errors");
var QueryObject = require("./QueryObject");
var QueryValue = require("./QueryValue");
var Utils_2 = require("./Utils");
var inherit = Object.freeze({});
var Class = (function () {
    function Class(queryContext, property) {
        this.inherit = inherit;
        this._context = queryContext;
        this._document = property.addOptionalPattern(new tokens_1.OptionalToken()
            .addPattern(new tokens_1.SubjectToken(property.variable)
            .addPredicate(new tokens_1.PredicateToken("a")
            .addObject(queryContext.getVariable(property.name + "__types")))));
        this._typesTriple = new tokens_1.SubjectToken(property.variable).addPredicate(new tokens_1.PredicateToken("a"));
        this._values = new tokens_1.ValuesToken();
        this._schema = this._context.getSchemaFor({ id: "" });
    }
    Class.prototype.property = function (name) {
        if (name === void 0)
            return this._document;
        var originalName = name;
        var path = this._document.name;
        while (path) {
            name = path + "." + originalName;
            if (this._context.hasProperty(name))
                return this._context.getProperty(name);
            path = path.split(".").slice(0, -1).join(".");
        }
        throw new Error("The \"" + originalName + "\" property was not declared.");
    };
    Class.prototype.value = function (value) {
        return new QueryValue.Class(this._context, value);
    };
    Class.prototype.object = function (object) {
        return new QueryObject.Class(this._context, object);
    };
    Class.prototype.withType = function (type) {
        if (this._context.hasProperties(this._document.name))
            throw new Error("Types must be specified before the properties.");
        type = this._context.expandIRI(type);
        if (!this._typesTriple.predicates[0].objects.length)
            this._document.addOptionalPattern(this._typesTriple);
        this._typesTriple.predicates[0].addObject(this._context.compactIRI(type));
        if (!this._context.context)
            return this;
        var schema = this._context.context.getObjectSchema(type);
        if (schema) {
            this._schema = ObjectSchema_1.Digester.combineDigestedObjectSchemas([this._schema, schema]);
        }
        return this;
    };
    Class.prototype.properties = function (propertiesSchema) {
        for (var propertyName in propertiesSchema) {
            var queryPropertySchema = propertiesSchema[propertyName];
            var propertyDefinition = Utils_1.isObject(queryPropertySchema) ? queryPropertySchema : { "@id": queryPropertySchema };
            var digestedDefinition = this.addPropertyDefinition(propertyName, propertyDefinition);
            var name_1 = this._document.name + "." + propertyName;
            var propertyPattern = Utils_2.createPropertyPattern(this._context, this._document.name, name_1, digestedDefinition);
            var property = this._context.addProperty(name_1, propertyPattern);
            if ("query" in propertyDefinition) {
                var builder = new Class(this._context, property);
                if (builder !== propertyDefinition["query"].call(void 0, builder))
                    throw new Errors_1.IllegalArgumentError("The provided query builder was not returned");
            }
            (_a = this._document).addOptionalPattern.apply(_a, property.getPatterns());
        }
        return this;
        var _a;
    };
    Class.prototype.filter = function (constraint) {
        var baseName = this._document.name.split(".").pop();
        this._context
            .getProperty(baseName)
            .addPattern(new tokens_1.FilterToken(constraint));
        return this;
    };
    Class.prototype.values = function () {
        var values = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            values[_i] = arguments[_i];
        }
        var termTokens = values.map(function (value) {
            var token = value.getToken();
            if (token.token === "blankNode")
                throw new Error("Blank node \"" + token.label + "\" is not a valid value.");
            return token;
        });
        if (!this._values.values.length)
            this._document
                .addPattern(this._values
                .addValues(this._document.variable));
        (_a = this._values.values[0]).push.apply(_a, termTokens);
        return this;
        var _a;
    };
    Class.prototype.addPropertyDefinition = function (propertyName, propertyDefinition) {
        var uri = "@id" in propertyDefinition ? this._context.expandIRI(propertyDefinition["@id"]) : void 0;
        var inheritDefinition = this._context.getInheritTypeDefinition(propertyName, uri, this._schema);
        var digestedDefinition = ObjectSchema_1.Digester.digestPropertyDefinition(this._schema, propertyName, propertyDefinition);
        if (inheritDefinition) {
            for (var key in inheritDefinition) {
                if (key !== "uri" && digestedDefinition[key] !== null)
                    continue;
                digestedDefinition[key] = inheritDefinition[key];
            }
        }
        if (!digestedDefinition.uri)
            throw new Error("Invalid property \"" + propertyName + "\" definition, \"@id\" is necessary.");
        this._document.getSchema()
            .properties.set(propertyName, digestedDefinition);
        return digestedDefinition;
    };
    return Class;
}());
exports.Class = Class;
exports.default = Class;

//# sourceMappingURL=QueryDocumentBuilder.js.map