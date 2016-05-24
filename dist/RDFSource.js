"use strict";
var NS = require("./NS");
exports.RDF_CLASS = NS.LDP.Class.RDFSource;
exports.SCHEMA = {
    "defaultInteractionModel": {
        "@id": NS.C.Predicate.defaultInteractionModel,
        "@type": "@id",
    },
    "accessPoints": {
        "@id": NS.C.Predicate.accessPoint,
        "@type": "@id",
        "@container": "@set",
    },
    "accessControlList": {
        "@id": NS.CS.Predicate.accessControlList,
        "@type": "@id",
    },
};

//# sourceMappingURL=RDFSource.js.map