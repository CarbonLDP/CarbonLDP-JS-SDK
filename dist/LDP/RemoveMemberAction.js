"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
}
Object.defineProperty(exports, "__esModule", { value: true });
var NS = __importStar(require("../Vocabularies/index"));
var Resource = __importStar(require("./../Resource"));
var Utils = __importStar(require("./../Utils"));
exports.RDF_CLASS = NS.C.Class.RemoveMemberAction;
exports.SCHEMA = {
    "targetMembers": {
        "@id": NS.C.Predicate.targetMember,
        "@type": "@id",
        "@container": "@set",
    },
};
var Factory = (function () {
    function Factory() {
    }
    Factory.hasClassProperties = function (object) {
        return Utils.hasPropertyDefined(object, "targetMembers");
    };
    Factory.create = function (targetMembers) {
        return Resource.Factory.createFrom({
            types: [exports.RDF_CLASS],
            targetMembers: targetMembers,
        });
    };
    return Factory;
}());
exports.Factory = Factory;

//# sourceMappingURL=RemoveMemberAction.js.map
