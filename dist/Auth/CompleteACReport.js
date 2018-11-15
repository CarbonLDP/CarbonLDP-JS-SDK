"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Resource_1 = require("../Resource");
var Vocabularies_1 = require("../Vocabularies");
exports.CompleteACReport = {
    TYPE: Vocabularies_1.CS.CompleteACReport,
    SCHEMA: {
        "protectedDocument": {
            "@id": Vocabularies_1.CS.protectedDocument,
            "@type": "@id",
        },
        "subjectReports": {
            "@id": Vocabularies_1.CS.subjectReport,
            "@type": "@id",
            "@container": "@set",
        },
    },
    is: function (value) {
        return Resource_1.TransientResource.is(value)
            && value.hasType(exports.CompleteACReport.TYPE);
    },
};

//# sourceMappingURL=CompleteACReport.js.map
