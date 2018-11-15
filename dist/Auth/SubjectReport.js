"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Vocabularies_1 = require("../Vocabularies");
exports.SubjectReport = {
    TYPE: Vocabularies_1.CS.SubjectReport,
    SCHEMA: {
        "subject": {
            "@id": Vocabularies_1.CS.subject,
            "@type": "@id",
        },
        "permissionReports": {
            "@id": Vocabularies_1.CS.permissionReport,
            "@type": "@id",
            "@container": "@set",
        },
    },
};

//# sourceMappingURL=SubjectReport.js.map
