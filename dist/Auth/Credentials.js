"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
}
Object.defineProperty(exports, "__esModule", { value: true });
var Document = __importStar(require("./../Document"));
var NS = __importStar(require("../Vocabularies/index"));
var Errors_1 = require("./../Errors");
exports.RDF_CLASS = NS.CS.Credentials;
exports.SCHEMA = {
    "email": {
        "@id": NS.VCARD.email,
        "@type": NS.XSD.string,
    },
    "password": {
        "@id": NS.CS.password,
        "@type": NS.XSD.string,
    },
    "enabled": {
        "@id": NS.CS.enabled,
        "@type": NS.XSD.boolean,
    },
    "user": {
        "@id": NS.CS.credentialsOf,
        "@type": "@id",
    },
};
var Factory = (function () {
    function Factory() {
    }
    Factory.create = function (email, password) {
        return Factory.createFrom({}, email, password);
    };
    Factory.createFrom = function (object, email, password) {
        var credentials = Document.Factory.createFrom(object);
        if (!email)
            throw new Errors_1.IllegalArgumentError("The email cannot be empty.");
        if (!password)
            throw new Errors_1.IllegalArgumentError("The password cannot be empty.");
        credentials.addType(exports.RDF_CLASS);
        credentials.email = email;
        credentials.password = password;
        return credentials;
    };
    return Factory;
}());
exports.Factory = Factory;

//# sourceMappingURL=Credentials.js.map
