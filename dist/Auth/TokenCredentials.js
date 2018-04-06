"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var LDP_1 = require("../LDP");
var Utils_1 = require("../Utils");
var CS_1 = require("../Vocabularies/CS");
var XSD_1 = require("../Vocabularies/XSD");
exports.TokenCredentialsBase = {
    is: function (value) {
        return Utils_1.isObject(value)
            && value.hasOwnProperty("token")
            && value.hasOwnProperty("expiresOn");
    },
};
var SCHEMA = {
    "token": {
        "@id": CS_1.CS.token,
        "@type": XSD_1.XSD.string,
    },
    "expiresOn": {
        "@id": CS_1.CS.expiresOn,
        "@type": XSD_1.XSD.dateTime,
    },
};
exports.TokenCredentials = {
    TYPE: CS_1.CS.TokenCredentials,
    SCHEMA: SCHEMA,
    is: function (value) {
        return LDP_1.VolatileResource.is(value)
            && value.hasType(exports.TokenCredentials.TYPE);
    },
    createFrom: function (object) {
        var credentials = LDP_1.VolatileResource.createFrom(object);
        credentials.addType(exports.TokenCredentials.TYPE);
        if (Utils_1.isString(credentials.expiresOn))
            credentials.expiresOn = new Date(credentials.expiresOn);
        return credentials;
    },
};

//# sourceMappingURL=TokenCredentials.js.map
