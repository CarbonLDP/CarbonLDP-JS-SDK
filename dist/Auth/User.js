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
var Utils = __importStar(require("./../Utils"));
exports.RDF_CLASS = NS.CS.User;
exports.SCHEMA = {
    "name": {
        "@id": NS.CS.name,
        "@type": NS.XSD.string,
    },
    "credentials": {
        "@id": NS.CS.credentials,
        "@type": "@id",
    },
};
var Factory = (function () {
    function Factory() {
    }
    Factory.hasClassProperties = function (object) {
        return Utils.hasPropertyDefined(object, "name");
    };
    return Factory;
}());
exports.Factory = Factory;

//# sourceMappingURL=User.js.map
