"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Vocabularies_1 = require("../Vocabularies");
exports.PermissionReport = {
    TYPE: Vocabularies_1.CS.PermissionReport,
    SCHEMA: {
        "permission": {
            "@id": Vocabularies_1.CS.permission,
            "@type": "@id",
        },
        "granted": {
            "@id": Vocabularies_1.CS.granted,
            "@type": Vocabularies_1.XSD.boolean,
        },
        "grantingChain": {
            "@id": Vocabularies_1.CS.grantingChain,
            "@type": "@id",
            "@container": "@list",
        },
    },
};

//# sourceMappingURL=PermissionReport.js.map
