"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tokens_1 = require("sparqler/tokens");
var IllegalArgumentError_1 = require("../../Errors/IllegalArgumentError");
var IllegalStateError_1 = require("../../Errors/IllegalStateError");
var ObjectSchema_1 = require("../../ObjectSchema");
var Utils_1 = require("../../Utils");
var QueryObject_1 = require("./QueryObject");
var QueryProperty_1 = require("./QueryProperty");
var QueryValue_1 = require("./QueryValue");
var Utils_2 = require("./Utils");
var INHERIT = Object.freeze({});
var QueryDocumentBuilder = (function () {
    function QueryDocumentBuilder(queryContext, property) {
        this.inherit = INHERIT;
        this.all = QueryDocumentBuilder.ALL;
        this.full = QueryDocumentBuilder.FULL;
        this._context = queryContext;
        property._builder = this;
        this._document = property;
        this._typesTriple = new tokens_1.SubjectToken(property.variable).addPredicate(new tokens_1.PredicateToken("a"));
        this._values = new tokens_1.ValuesToken().addValues(property.variable);
        this._schema = this._context.getSchemaFor({ id: "" });
    }
    QueryDocumentBuilder.prototype.property = function (name) {
        if (name === void 0)
            return this._document;
        var parent = this._document.name;
        while (parent) {
            var fullPath = parent + "." + name;
            if (this._context.hasProperty(fullPath))
                return this._context.getProperty(fullPath);
            var directPath = Utils_2.getParentPath(fullPath);
            if (this._context.hasProperty(directPath)) {
                var direct = this._context.getProperty(directPath);
                var directType = direct.getType();
                if (directType === QueryProperty_1.QueryPropertyType.FULL || directType === QueryProperty_1.QueryPropertyType.ALL) {
                    var propertyName = fullPath.substr(directPath.length + 1);
                    return direct._builder._addProperty(propertyName, INHERIT);
                }
            }
            parent = Utils_2.getParentPath(parent);
        }
        throw new IllegalArgumentError_1.IllegalArgumentError("The \"" + name + "\" property was not declared.");
    };
    QueryDocumentBuilder.prototype.value = function (value) {
        return new QueryValue_1.QueryValue(this._context, value);
    };
    QueryDocumentBuilder.prototype.object = function (object) {
        return new QueryObject_1.QueryObject(this._context, object);
    };
    QueryDocumentBuilder.prototype.withType = function (type) {
        if (this._context.hasProperties(this._document.name))
            throw new IllegalStateError_1.IllegalStateError("Types must be specified before the properties.");
        type = ObjectSchema_1.ObjectSchemaUtils.resolveURI(type, this._schema, { vocab: true, base: true });
        if (!this._typesTriple.predicates[0].objects.length)
            this._document.addPattern(this._typesTriple);
        this._typesTriple.predicates[0].addObject(this._context.compactIRI(type));
        if (!this._context.context)
            return this;
        var schema = this._context.context.getObjectSchema(type);
        if (schema) {
            this._schema = ObjectSchema_1.ObjectSchemaDigester.combineDigestedObjectSchemas([this._schema, schema]);
        }
        return this;
    };
    QueryDocumentBuilder.prototype.properties = function (propertiesSchema) {
        if (propertiesSchema === QueryDocumentBuilder.ALL) {
            this._document.setType(QueryProperty_1.QueryPropertyType.ALL);
            return this;
        }
        if (propertiesSchema === QueryDocumentBuilder.FULL) {
            this._document.setType(QueryProperty_1.QueryPropertyType.FULL);
            return this;
        }
        for (var propertyName in propertiesSchema) {
            var queryPropertySchema = propertiesSchema[propertyName];
            var propertyDefinition = Utils_1.isObject(queryPropertySchema) ? queryPropertySchema : { "@id": queryPropertySchema };
            this._addProperty(propertyName, propertyDefinition);
        }
        return this;
    };
    QueryDocumentBuilder.prototype.filter = function (constraint) {
        var baseName = this._document.name.split(".")[0];
        this._context
            .getProperty(baseName)
            .addPattern(new tokens_1.FilterToken(constraint));
        return this;
    };
    QueryDocumentBuilder.prototype.values = function () {
        var values = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            values[_i] = arguments[_i];
        }
        var termTokens = values.map(function (value) {
            var token = value.getToken();
            if (token.token === "blankNode")
                throw new IllegalArgumentError_1.IllegalArgumentError("Blank node \"" + token.label + "\" is not a valid value.");
            return token;
        });
        if (!this._values.values[0].length)
            this._document.addPattern(this._values);
        (_a = this._values.values[0]).push.apply(_a, termTokens);
        var property = this._document;
        while (property.isOptional()) {
            property.setOptional(false);
            var parentPath = Utils_2.getParentPath(property.name);
            property = this._context.getProperty(parentPath);
        }
        return this;
        var _a;
    };
    QueryDocumentBuilder.prototype._addProperty = function (propertyName, propertyDefinition) {
        var digestedDefinition = this.addPropertyDefinition(propertyName, propertyDefinition);
        var name = this._document.name + "." + propertyName;
        var property = (_a = this._context
            .addProperty(name)).addPattern.apply(_a, Utils_2.createPropertyPatterns(this._context, this._document.name, name, digestedDefinition));
        if ("query" in propertyDefinition) {
            if (digestedDefinition.literal === false) {
                property.setType(QueryProperty_1.QueryPropertyType.PARTIAL);
            }
            var builder = new QueryDocumentBuilder(this._context, property);
            if (builder !== propertyDefinition["query"].call(void 0, builder))
                throw new IllegalArgumentError_1.IllegalArgumentError("The provided query builder was not returned");
        }
        (_b = this._document).addPattern.apply(_b, property.getPatterns());
        return property;
        var _a, _b;
    };
    QueryDocumentBuilder.prototype.addPropertyDefinition = function (propertyName, propertyDefinition) {
        var digestedDefinition = ObjectSchema_1.ObjectSchemaDigester.digestProperty(propertyName, propertyDefinition, this._schema);
        var uri = "@id" in propertyDefinition ? digestedDefinition.uri : void 0;
        var inheritDefinition = this._context.getInheritTypeDefinition(this._schema, propertyName, uri);
        if (inheritDefinition) {
            for (var key in inheritDefinition) {
                if (digestedDefinition[key] !== null && key !== "uri")
                    continue;
                digestedDefinition[key] = inheritDefinition[key];
            }
        }
        if (!digestedDefinition.uri)
            throw new IllegalArgumentError_1.IllegalArgumentError("Invalid property \"" + propertyName + "\" definition, \"@id\" is necessary.");
        this._document.getSchema()
            .properties.set(propertyName, digestedDefinition);
        return digestedDefinition;
    };
    QueryDocumentBuilder.ALL = Object.freeze({});
    QueryDocumentBuilder.FULL = Object.freeze({});
    return QueryDocumentBuilder;
}());
exports.QueryDocumentBuilder = QueryDocumentBuilder;

//# sourceMappingURL=QueryDocumentBuilder.js.map
