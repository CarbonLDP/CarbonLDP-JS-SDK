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
        "roles": {
            "@id": Vocabularies_1.CS.role,
            "@type": "@id",
            "@container": "@set",
        },
    },
    isDecorated: function (object) {
        return ProtectedDocument_1.ProtectedDocument.isDecorated(object)
            && TransientUser_1.TransientUser.isDecorated(object);
    },
    is: function (value) {
        return TransientUser_1.TransientUser.isDecorated(value)
            && ProtectedDocument_1.ProtectedDocument.is(value);
    },
    decorate: function (object, documents) {
        TransientUser_1.TransientUser.decorate(object);
        ProtectedDocument_1.ProtectedDocument.decorate(object, documents);
        var persistedUser = object;
        persistedUser.addType(TransientUser_1.TransientUser.TYPE);
        return persistedUser;
    },
    create: TransientUser_1.TransientUser.create,
    createFrom: TransientUser_1.TransientUser.createFrom,
};

//# sourceMappingURL=User.js.map
