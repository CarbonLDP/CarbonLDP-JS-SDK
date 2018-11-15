"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
var XSD_1 = require("../Vocabularies/XSD");
var Utils = __importStar(require("./../Utils"));
var Document_1 = require("./Document");
var List_1 = require("./List");
var Literal_1 = require("./Literal");
var URI_1 = require("./URI");
var Value_1 = require("./Value");
exports.RDFNode = {
    is: function (value) {
        return Utils.hasProperty(value, "@id")
            && Utils.isString(value["@id"]);
    },
    create: function (uri) {
        return {
            "@id": uri,
        };
    },
    getID: function (node) {
        return node["@id"];
    },
    getRelativeID: function (node) {
        var id = exports.RDFNode.getID(node);
        return URI_1.URI.hasFragment(id) ? URI_1.URI.getFragment(id) : id;
    },
    areEqual: function (node1, node2) {
        return exports.RDFNode.getID(node1) === exports.RDFNode.getID(node2);
    },
    isFragment: function (node) {
        var id = exports.RDFNode.getID(node);
        return URI_1.URI.hasFragment(id) || URI_1.URI.isBNodeID(id);
    },
    hasType: function (node, type) {
        return exports.RDFNode.getTypes(node).indexOf(type) !== -1;
    },
    getTypes: function (node) {
        if (!("@type" in node))
            return [];
        return node["@type"];
    },
    getFreeNodes: function (objects) {
        if (!Array.isArray(objects))
            return [];
        return objects
            .filter(function (element) { return !Document_1.RDFDocument.is(element); })
            .filter(exports.RDFNode.is);
    },
    getList: function (propertyValues) {
        if (!Array.isArray(propertyValues))
            return;
        return propertyValues
            .find(List_1.RDFList.is);
    },
    getProperties: function (propertyValues, pointerLibrary) {
        if (!Array.isArray(propertyValues))
            return;
        return propertyValues
            .map(Value_1.RDFValue.parse.bind(null, pointerLibrary))
            .filter(function (value) { return !Utils.isNull(value); });
    },
    getPropertyPointers: function (propertyValues, pointerLibrary) {
        if (!Array.isArray(propertyValues))
            return;
        return propertyValues
            .filter(exports.RDFNode.is)
            .map(exports.RDFNode.getID)
            .map(pointerLibrary.getPointer, pointerLibrary)
            .filter(function (pointer) { return !Utils.isNull(pointer); });
    },
    getPropertyLiterals: function (propertyValues, literalType) {
        if (!Array.isArray(propertyValues))
            return;
        return propertyValues
            .filter(Literal_1.RDFLiteral.is)
            .filter(function (literal) { return Literal_1.RDFLiteral.hasType(literal, literalType); })
            .map(Literal_1.RDFLiteral.parse);
    },
    getPropertyLanguageMap: function (propertyValues) {
        if (!Array.isArray(propertyValues))
            return;
        var propertyLanguageMap = {};
        for (var _i = 0, propertyValues_1 = propertyValues; _i < propertyValues_1.length; _i++) {
            var propertyValue = propertyValues_1[_i];
            if (!Literal_1.RDFLiteral.is(propertyValue))
                continue;
            if (!Literal_1.RDFLiteral.hasType(propertyValue, XSD_1.XSD.string))
                continue;
            var languageTag = propertyValue["@language"];
            if (!languageTag)
                continue;
            propertyLanguageMap[languageTag] = Literal_1.RDFLiteral.parse(propertyValue);
        }
        return propertyLanguageMap;
    },
};

//# sourceMappingURL=Node.js.map
