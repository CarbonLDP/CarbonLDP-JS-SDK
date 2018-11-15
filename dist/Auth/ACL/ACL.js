"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Vocabularies_1 = require("../../Vocabularies");
var TransientACL_1 = require("./TransientACL");
exports.ACL = {
    TYPE: TransientACL_1.TransientACL.TYPE,
    SCHEMA: {
        "protectedDocument": {
            "@id": Vocabularies_1.CS.protectedDocument,
            "@type": "@id",
        },
        "inherits": {
            "@id": Vocabularies_1.CS.inherits,
            "@type": "@id",
        },
        "directACEntries": {
            "@id": Vocabularies_1.CS.directACEntry,
            "@type": "@id",
            "@container": "@set",
        },
        "immediateDescendantsACEntries": {
            "@id": Vocabularies_1.CS.immediateDescendantsACEntry,
            "@type": "@id",
            "@container": "@set",
        },
        "allDescendantsACEntries": {
            "@id": Vocabularies_1.CS.allDescendantsACEntry,
            "@type": "@id",
            "@container": "@set",
        },
    },
    create: TransientACL_1.TransientACL.create,
    createFrom: TransientACL_1.TransientACL.createFrom,
};

//# sourceMappingURL=ACL.js.map
