"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Vocabularies_1 = require("../Vocabularies");
exports.GrantingStep = {
    TYPE: Vocabularies_1.CS.GrantingStep,
    SCHEMA: {
        "subject": {
            "@id": Vocabularies_1.CS.subject,
            "@type": "@id",
        },
        "applied": {
            "@id": Vocabularies_1.CS.applied,
            "@type": Vocabularies_1.XSD.boolean,
        },
        "appliedBy": {
            "@id": Vocabularies_1.CS.appliedBy,
            "@type": "@id",
        },
        "protectedDocument": {
            "@id": Vocabularies_1.CS.protectedDocument,
            "@type": "@id",
        },
        "accessControlList": {
            "@id": Vocabularies_1.CS.accessControlList,
            "@type": "@id",
        },
        "inheritanceDisabledBy": {
            "@id": Vocabularies_1.CS.inheritanceDisabledBy,
            "@type": "@id",
            "@container": "@list",
        },
    },
};

//# sourceMappingURL=GrantingStep.js.map
