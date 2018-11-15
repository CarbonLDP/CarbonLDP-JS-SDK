"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
var Document_1 = require("../Document");
var IllegalArgumentError_1 = require("../Errors/IllegalArgumentError");
var CS_1 = require("../Vocabularies/CS");
var XSD_1 = require("../Vocabularies/XSD");
var Utils = __importStar(require("./../Utils"));
exports.RDF_CLASS = CS_1.CS.Role;
exports.SCHEMA = {
    "name": {
        "@id": CS_1.CS.name,
        "@type": XSD_1.XSD.string,
    },
    "description": {
        "@id": CS_1.CS.description,
        "@type": XSD_1.XSD.string,
    },
    "parentRole": {
        "@id": CS_1.CS.parentRole,
        "@type": "@id",
    },
    "childRoles": {
        "@id": CS_1.CS.childRole,
        "@type": "@id",
        "@container": "@set",
    },
    "users": {
        "@id": CS_1.CS.user,
        "@type": "@id",
        "@container": "@set",
    },
};
var Factory = (function () {
    function Factory() {
    }
    Factory.hasClassProperties = function (object) {
        return Utils.hasPropertyDefined(object, "name");
    };
    Factory.is = function (object) {
        return Factory.hasClassProperties(object)
            && Document_1.TransientDocument.is(object);
    };
    Factory.create = function (name, description) {
        return Factory.createFrom({}, name, description);
    };
    Factory.createFrom = function (object, name, description) {
        if (!Document_1.TransientDocument.isDecorated(object))
            object = Document_1.TransientDocument.createFrom(object);
        if (!name)
            throw new IllegalArgumentError_1.IllegalArgumentError("The name cannot be empty.");
        var role = object;
        role.name = name;
        role.description = description;
        return role;
    };
    return Factory;
}());
exports.Factory = Factory;

//# sourceMappingURL=Role.js.map
