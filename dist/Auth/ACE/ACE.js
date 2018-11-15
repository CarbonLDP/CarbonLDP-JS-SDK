"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Fragment_1 = require("../../Fragment");
var Vocabularies_1 = require("../../Vocabularies");
exports.ACE = {
    TYPE: Vocabularies_1.CS.AccessControlEntry,
    SCHEMA: {
        "permissions": {
            "@id": Vocabularies_1.CS.permission,
            "@type": "@id",
            "@container": "@set",
        },
        "subject": {
            "@id": Vocabularies_1.CS.subject,
            "@type": "@id",
        },
    },
    create: function (data) {
        var copy = Object.assign({}, data);
        return exports.ACE.createFrom(copy);
    },
    createFrom: function (object) {
        var ace = Fragment_1.TransientFragment.decorate(object);
        ace.addType(exports.ACE.TYPE);
        return ace;
    },
};

//# sourceMappingURL=ACE.js.map
