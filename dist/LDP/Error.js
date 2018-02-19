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
exports.RDF_CLASS = NS.C.Error;
exports.SCHEMA = {
    "errorCode": {
        "@id": NS.C.errorCode,
        "@type": NS.XSD.DataType.string,
    },
    "errorMessage": {
        "@id": NS.C.errorMessage,
        "@language": "en",
    },
    "errorParameters": {
        "@id": NS.C.errorParameters,
        "@type": "@id",
    },
};

//# sourceMappingURL=Error.js.map
