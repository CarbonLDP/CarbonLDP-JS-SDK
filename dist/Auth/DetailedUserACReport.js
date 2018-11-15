"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Resource_1 = require("../Resource");
var Vocabularies_1 = require("../Vocabularies");
exports.DetailedUserACReport = {
    TYPE: Vocabularies_1.CS.DetailedUserACReport,
    SCHEMA: {
        "protectedDocument": {
            "@id": Vocabularies_1.CS.protectedDocument,
            "@type": "@id",
        },
        "permissionReports": {
            "@id": Vocabularies_1.CS.permissionReport,
            "@type": "@id",
            "@container": "@set",
        },
    },
    is: function (value) {
        return Resource_1.TransientResource.is(value)
            && value.hasType(exports.DetailedUserACReport.TYPE);
    },
};

//# sourceMappingURL=DetailedUserACReport.js.map
