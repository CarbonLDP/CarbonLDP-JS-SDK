"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var NS = require("./../NS");
var Utils = require("./../Utils");
var VolatileResource = require("./VolatileResource");
exports.RDF_CLASS = NS.C.Class.DocumentMetadata;
exports.SCHEMA = {
    "resource": {
        "@id": NS.C.Predicate.resource,
        "@type": "@id",
    },
    "eTag": {
        "@id": NS.C.Predicate.eTag,
        "@type": NS.XSD.DataType.string,
    },
    "bNodesMap": {
        "@id": NS.C.Predicate.bNodesMap,
        "@type": "@id",
    },
};
var Factory = (function () {
    function Factory() {
    }
    Factory.hasClassProperties = function (object) {
        return Utils.hasPropertyDefined(object, "resource");
    };
    Factory.is = function (object) {
        return VolatileResource.Factory.is(object)
            && Factory.hasClassProperties(object)
            && object.hasType(exports.RDF_CLASS);
    };
    return Factory;
}());
exports.Factory = Factory;

//# sourceMappingURL=DocumentMetadata.js.map