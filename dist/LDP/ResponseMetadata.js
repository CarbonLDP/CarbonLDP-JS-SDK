"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var NS = require("./../NS");
var VolatileResource = require("./VolatileResource");
exports.RDF_CLASS = NS.C.Class.ResponseMetadata;
exports.SCHEMA = {
    "resourcesMetadata": {
        "@id": NS.C.Predicate.resourceMetadata,
        "@type": "@id",
        "@container": "@set",
    },
    "bNodesMapping": {
        "@id": NS.C.Predicate.bNodesMapping,
        "@type": "@id",
    },
};
var Factory = (function () {
    function Factory() {
    }
    Factory.is = function (object) {
        return VolatileResource.Factory.is(object)
            && object.hasType(exports.RDF_CLASS);
    };
    return Factory;
}());
exports.Factory = Factory;

//# sourceMappingURL=ResponseMetadata.js.map
