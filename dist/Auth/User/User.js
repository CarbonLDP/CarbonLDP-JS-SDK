"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ProtectedDocument_1 = require("../../ProtectedDocument");
var Vocabularies_1 = require("../../Vocabularies");
var TransientUser_1 = require("./TransientUser");
exports.User = {
    TYPE: TransientUser_1.TransientUser.TYPE,
    SCHEMA: {
        "name": {
            "@id": Vocabularies_1.CS.name,
            "@type": Vocabularies_1.XSD.string,
        },
        "credentials": {
            "@id": Vocabularies_1.CS.credentials,
            "@type": "@id",
        },
        "credentialSet": {
            "@id": Vocabularies_1.CS.credentialSet,
            "@type": "@id",
        },
    },
    is: function (value) {
        return ProtectedDocument_1.ProtectedDocument.is(value)
            && value.hasType(exports.User.TYPE);
    },
    create: TransientUser_1.TransientUser.create,
    createFrom: TransientUser_1.TransientUser.createFrom,
};

//# sourceMappingURL=User.js.map
