"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Document_1 = require("../../Document");
var Vocabularies_1 = require("../../Vocabularies");
var TransientRole_1 = require("./TransientRole");
exports.Role = {
    TYPE: TransientRole_1.TransientRole.TYPE,
    SCHEMA: {
        "name": {
            "@id": Vocabularies_1.CS.name,
            "@type": Vocabularies_1.XSD.string,
        },
        "description": {
            "@id": Vocabularies_1.CS.description,
            "@type": Vocabularies_1.XSD.string,
        },
        "parent": {
            "@id": Vocabularies_1.CS.parent,
            "@type": "@id",
        },
        "children": {
            "@id": Vocabularies_1.CS.child,
            "@type": "@id",
            "@container": "@set",
        },
        "users": {
            "@id": Vocabularies_1.CS.user,
            "@type": "@id",
            "@container": "@set",
        },
    },
    is: function (value) {
        return Document_1.Document.is(value)
            && value.hasType(exports.Role.TYPE);
    },
    create: TransientRole_1.TransientRole.create,
    createFrom: TransientRole_1.TransientRole.createFrom,
};

//# sourceMappingURL=Role.js.map
