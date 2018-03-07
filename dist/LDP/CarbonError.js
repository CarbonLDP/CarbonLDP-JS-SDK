"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var C_1 = require("../Vocabularies/C");
var XSD_1 = require("../Vocabularies/XSD");
var SCHEMA = {
    "errorCode": {
        "@id": C_1.C.errorCode,
        "@type": XSD_1.XSD.string,
    },
    "errorMessage": {
        "@id": C_1.C.errorMessage,
        "@language": "en",
    },
    "errorParameters": {
        "@id": C_1.C.errorParameters,
        "@type": "@id",
    },
};
exports.CarbonError = {
    TYPE: C_1.C.Error,
    SCHEMA: SCHEMA,
};
exports.default = exports.CarbonError;

//# sourceMappingURL=CarbonError.js.map