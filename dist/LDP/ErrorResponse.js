"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var C_1 = require("../Vocabularies/C");
var XSD_1 = require("../Vocabularies/XSD");
var SCHEMA = {
    "errors": {
        "@id": C_1.C.error,
        "@type": "@id",
        "@container": "@set",
    },
    "requestID": {
        "@id": C_1.C.requestID,
        "@type": XSD_1.XSD.string,
    },
    "statusCode": {
        "@id": C_1.C.httpStatusCode,
        "@type": XSD_1.XSD.int,
    },
};
exports.ErrorResponse = {
    TYPE: C_1.C.ErrorResponse,
    SCHEMA: SCHEMA,
    getMessage: function (errorResponse) {
        return errorResponse
            .errors
            .map(function (error) { return error.errorMessage; })
            .join(", ");
    },
};
exports.default = exports.ErrorResponse;

//# sourceMappingURL=ErrorResponse.js.map
