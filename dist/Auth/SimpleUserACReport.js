"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Resource_1 = require("../Resource");
var Vocabularies_1 = require("../Vocabularies");
exports.SimpleUserACReport = {
    TYPE: Vocabularies_1.CS.SimpleUserACReport,
    SCHEMA: {
        "protectedDocument": {
            "@id": Vocabularies_1.CS.protectedDocument,
            "@type": "@id",
        },
        "permissions": {
            "@id": Vocabularies_1.CS.permission,
            "@type": "@id",
            "@container": "@set",
        },
    },
    is: function (value) {
        return Resource_1.TransientResource.is(value)
            && value.hasType(exports.SimpleUserACReport.TYPE);
    },
};

//# sourceMappingURL=SimpleUserACReport.js.map
