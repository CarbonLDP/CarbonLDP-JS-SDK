"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
}
Object.defineProperty(exports, "__esModule", { value: true });
var Errors = __importStar(require("./../Errors"));
var NS = __importStar(require("../Vocabularies/index"));
var ObjectSchema = __importStar(require("./../ObjectSchema"));
var Pointer = __importStar(require("./../Pointer"));
var RDF = __importStar(require("./../RDF"));
var Utils = __importStar(require("./../Utils"));
var Utils_1 = require("./Utils");
var Class = (function () {
    function Class(literalSerializers) {
        this._literalSerializers = !!literalSerializers ? literalSerializers : Class.getDefaultSerializers();
    }
    Object.defineProperty(Class.prototype, "literalSerializers", {
        get: function () { return this._literalSerializers; },
        enumerable: true,
        configurable: true
    });
    Class.getDefaultSerializers = function () {
        var literalSerializers = new Map();
        literalSerializers.set(NS.XSD.date, RDF.Literal.Serializers.XSD.dateSerializer);
        literalSerializers.set(NS.XSD.dateTime, RDF.Literal.Serializers.XSD.dateTimeSerializer);
        literalSerializers.set(NS.XSD.time, RDF.Literal.Serializers.XSD.timeSerializer);
        literalSerializers.set(NS.XSD.integer, RDF.Literal.Serializers.XSD.integerSerializer);
        literalSerializers.set(NS.XSD.int, RDF.Literal.Serializers.XSD.integerSerializer);
        literalSerializers.set(NS.XSD.unsignedInt, RDF.Literal.Serializers.XSD.unsignedIntegerSerializer);
        literalSerializers.set(NS.XSD.long, RDF.Literal.Serializers.XSD.longSerializer);
        literalSerializers.set(NS.XSD.unsignedLong, RDF.Literal.Serializers.XSD.unsignedLongSerializer);
        literalSerializers.set(NS.XSD.float, RDF.Literal.Serializers.XSD.floatSerializer);
        literalSerializers.set(NS.XSD.double, RDF.Literal.Serializers.XSD.floatSerializer);
        literalSerializers.set(NS.XSD.boolean, RDF.Literal.Serializers.XSD.booleanSerializer);
        literalSerializers.set(NS.XSD.string, RDF.Literal.Serializers.XSD.stringSerializer);
        return literalSerializers;
    };
    Class.prototype.compact = function (expandedObjectOrObjects, targetObjectOrObjectsOrDigestedContext, digestedSchemaOrPointerLibrary, pointerLibrary, strict) {
        if (pointerLibrary === void 0) { pointerLibrary = null; }
        var targetObjectOrObjects = !pointerLibrary ? null : targetObjectOrObjectsOrDigestedContext;
        var digestedSchema = !pointerLibrary ? targetObjectOrObjectsOrDigestedContext : digestedSchemaOrPointerLibrary;
        pointerLibrary = !pointerLibrary ? digestedSchemaOrPointerLibrary : pointerLibrary;
        if (!Utils.isArray(expandedObjectOrObjects))
            return this.compactSingle(expandedObjectOrObjects, targetObjectOrObjects, digestedSchema, pointerLibrary, strict);
        var expandedObjects = expandedObjectOrObjects;
        var targetObjects = !!targetObjectOrObjects ? targetObjectOrObjects : [];
        for (var i = 0, length_1 = expandedObjects.length; i < length_1; i++) {
            var expandedObject = expandedObjects[i];
            var targetObject = targetObjects[i] = !!targetObjects[i] ? targetObjects[i] : {};
            this.compactSingle(expandedObject, targetObject, digestedSchema, pointerLibrary, strict);
        }
        return targetObjects;
    };
    Class.prototype.expand = function (compactedObjectOrObjects, generalSchema, digestedSchema) {
        if (!Utils.isArray(compactedObjectOrObjects))
            return this.expandSingle(compactedObjectOrObjects, generalSchema, digestedSchema);
    };
    Class.prototype.expandSingle = function (compactedObject, generalSchema, digestedSchema) {
        var _this = this;
        var expandedObject = {};
        expandedObject["@id"] = !!compactedObject["id"] ? compactedObject["id"] : "";
        if (!!compactedObject["types"])
            expandedObject["@type"] = compactedObject["types"].map(function (type) { return ObjectSchema.Util.resolveURI(type, generalSchema, { vocab: true, base: true }); });
        Utils.forEachOwnProperty(compactedObject, function (propertyName, value) {
            if (propertyName === "id")
                return;
            if (propertyName === "types")
                return;
            var expandedPropertyName = ObjectSchema.Util.resolveURI(propertyName, digestedSchema, { vocab: true });
            if (RDF.URI.Util.isRelative(expandedPropertyName))
                return;
            var expandedValue = _this.expandProperty(propertyName, value, digestedSchema, generalSchema);
            if (expandedPropertyName === null)
                return;
            expandedObject[expandedPropertyName] = expandedValue;
        });
        return expandedObject;
    };
    Class.prototype.expandProperty = function (propertyName, propertyValue, digestedSchema, generalSchema) {
        var definition = digestedSchema.properties.get(propertyName);
        var propertyContainer = definition ? definition.containerType : void 0;
        if (propertyContainer === ObjectSchema.ContainerType.LANGUAGE)
            return this.expandPropertyLanguageMap(propertyValue);
        propertyValue = Array.isArray(propertyValue) ? propertyValue : [propertyValue];
        if (propertyContainer === null)
            propertyValue = [propertyValue[0]];
        var propertyType = definition ? definition.literal : null;
        var expandedValues = propertyType === true ?
            this.expandPropertyLiteral(propertyValue, definition, digestedSchema) :
            propertyType === false ?
                this.expandPropertyPointer(propertyValue, digestedSchema, generalSchema) :
                this.expandPropertyValue(propertyValue, digestedSchema, generalSchema);
        var filteredValues = expandedValues.filter(function (value) { return value !== null; });
        if (!filteredValues.length)
            return null;
        if (propertyContainer === ObjectSchema.ContainerType.LIST)
            return [
                { "@list": filteredValues },
            ];
        return filteredValues;
    };
    Class.prototype.expandPropertyValue = function (propertyValue, digestedSchema, generalSchema) {
        var _this = this;
        return propertyValue.map(function (value) { return _this.expandValue(value, digestedSchema, generalSchema); });
    };
    Class.prototype.expandPropertyPointer = function (propertyValue, digestedSchema, generalSchema) {
        var _this = this;
        return propertyValue.map(function (value) { return _this.expandPointerValue(value, digestedSchema, generalSchema); });
    };
    Class.prototype.expandPropertyLiteral = function (propertyValue, definition, digestedSchema) {
        var _this = this;
        var literalType = ObjectSchema.Util.resolveURI(definition.literalType, digestedSchema, { vocab: true, base: true });
        var expandedValues = propertyValue.map(function (value) { return _this.expandLiteralValue(value, literalType); });
        if (!definition.language)
            expandedValues.forEach(function (value) { return value["@language"] = definition.language; });
        return expandedValues;
    };
    Class.prototype.expandPropertyLanguageMap = function (propertyValue) {
        var _this = this;
        if (!Utils.isObject(propertyValue)) {
            return null;
        }
        var mapValues = [];
        Utils.forEachOwnProperty(propertyValue, function (languageTag, value) {
            var serializedValue = _this.literalSerializers.get(NS.XSD.string).serialize(value);
            mapValues.push({ "@value": serializedValue, "@type": NS.XSD.string, "@language": languageTag });
        });
        return mapValues;
    };
    Class.prototype.expandPointerValue = function (propertyValue, digestedSchema, generalSchema) {
        var isString = Utils.isString(propertyValue);
        var id = Pointer.Factory.is(propertyValue) ?
            propertyValue.id :
            isString ?
                propertyValue :
                null;
        if (!id)
            return null;
        var resolved = ObjectSchema.Util.resolveURI(id, generalSchema, { vocab: isString, base: true });
        return { "@id": resolved };
    };
    Class.prototype.expandValue = function (propertyValue, digestedSchema, generalSchema) {
        if (Utils.isArray(propertyValue))
            return null;
        return Pointer.Factory.is(propertyValue) ?
            this.expandPointerValue(propertyValue, generalSchema, digestedSchema) :
            this.expandLiteralValue(propertyValue, Utils_1.guessXSDType(propertyValue));
    };
    Class.prototype.expandLiteralValue = function (literalValue, literalType) {
        if (literalType === null)
            return null;
        if (!this.literalSerializers.has(literalType))
            return null;
        var serializedValue = this.literalSerializers
            .get(literalType)
            .serialize(literalValue);
        return { "@value": serializedValue, "@type": literalType };
    };
    Class.prototype.compactSingle = function (expandedObject, targetObject, digestedSchema, pointerLibrary, strict) {
        var _this = this;
        if (!expandedObject["@id"])
            throw new Errors.IllegalArgumentError("The expandedObject doesn't have an @id defined.");
        targetObject["id"] = expandedObject["@id"];
        targetObject["types"] = !!expandedObject["@type"] ? expandedObject["@type"] : [];
        var propertyURINameMap = this.getPropertyURINameMap(digestedSchema);
        Utils.forEachOwnProperty(expandedObject, function (propertyURI, propertyValues) {
            if (propertyURI === "@id")
                return;
            if (propertyURI === "@type")
                return;
            if (!propertyURINameMap.has(propertyURI) && strict)
                return;
            var propertyName = propertyURINameMap.has(propertyURI) ?
                propertyURINameMap.get(propertyURI) :
                digestedSchema.vocab !== null ?
                    RDF.URI.Util.getRelativeURI(propertyURI, digestedSchema.vocab) :
                    propertyURI;
            var targetValue = _this.getPropertyValue(propertyName, propertyValues, digestedSchema, pointerLibrary);
            if (targetValue === null)
                return;
            targetObject[propertyName] = targetValue;
        });
        return targetObject;
    };
    Class.prototype.getPropertyContainerType = function (propertyValues) {
        if (propertyValues.length === 1) {
            if (RDF.List.Factory.is(propertyValues[0]))
                return ObjectSchema.ContainerType.LIST;
        }
        else {
            return ObjectSchema.ContainerType.SET;
        }
        return null;
    };
    Class.prototype.getPropertyValue = function (propertyName, propertyValues, digestedSchema, pointerLibrary) {
        var definition = digestedSchema.properties.get(propertyName);
        var propertyContainer = definition ?
            definition.containerType :
            this.getPropertyContainerType(propertyValues);
        if (propertyContainer === ObjectSchema.ContainerType.LANGUAGE)
            return RDF.Node.Util.getPropertyLanguageMap(propertyValues);
        if (propertyContainer === ObjectSchema.ContainerType.LIST) {
            var list = RDF.Node.Util.getList(propertyValues);
            if (!propertyValues)
                return null;
            propertyValues = list["@list"];
        }
        var propertyType = definition ? definition.literal : null;
        if (propertyType === true && definition.language) {
            propertyValues = propertyValues.filter(function (value) { return value["@language"] === definition.language; });
        }
        if (propertyContainer === null)
            propertyValues = [propertyValues[0]];
        var compactedValues = propertyType === true ?
            this.compactPropertyLiteral(propertyValues, definition, digestedSchema) :
            propertyType === false ?
                RDF.Node.Util.getPropertyPointers(propertyValues, pointerLibrary) :
                RDF.Node.Util.getProperties(propertyValues, pointerLibrary);
        var filteredValues = compactedValues.filter(function (value) { return value !== null; });
        if (!filteredValues.length)
            return null;
        if (propertyContainer === null)
            return filteredValues[0];
        return filteredValues;
    };
    Class.prototype.getPropertyURINameMap = function (digestedSchema) {
        var map = new Map();
        digestedSchema.properties.forEach(function (definition, propertyName) {
            var uri = ObjectSchema.Util.resolveURI(definition.uri, digestedSchema, { vocab: true });
            map.set(uri, propertyName);
        });
        return map;
    };
    Class.prototype.compactPropertyLiteral = function (propertyValues, definition, digestedSchema) {
        var literalType = definition.literalType === null ?
            NS.XSD.string : ObjectSchema.Util.resolveURI(definition.literalType, digestedSchema, { vocab: true, base: true });
        return RDF.Node.Util.getPropertyLiterals(propertyValues, literalType);
    };
    return Class;
}());
exports.Class = Class;
exports.default = Class;

//# sourceMappingURL=Converter.js.map
