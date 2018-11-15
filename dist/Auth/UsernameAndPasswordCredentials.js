"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var LDP_1 = require("../LDP");
var Vocabularies_1 = require("../Vocabularies");
var SCHEMA = {
    "username": {
        "@id": Vocabularies_1.CS.username,
        "@type": Vocabularies_1.XSD.string,
    },
    "password": {
        "@id": Vocabularies_1.CS.password,
        "@type": Vocabularies_1.XSD.string,
    },
    "passwordSecret": {
        "@id": Vocabularies_1.CS.passwordSecret,
        "@type": "@id",
    },
};
exports.UsernameAndPasswordCredentials = {
    TYPE: Vocabularies_1.CS.UsernameAndPasswordCredentials,
    SCHEMA: SCHEMA,
    create: function (data) {
        var copy = Object.assign({}, data);
        return exports.UsernameAndPasswordCredentials.createFrom(copy);
    },
    createFrom: function (object) {
        var credentials = LDP_1.VolatileResource.createFrom(object);
        credentials.addType(exports.UsernameAndPasswordCredentials.TYPE);
        return credentials;
    },
};

//# sourceMappingURL=UsernameAndPasswordCredentials.js.map
