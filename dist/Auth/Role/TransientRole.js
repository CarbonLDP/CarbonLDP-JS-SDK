"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Document_1 = require("../../Document");
var Vocabularies_1 = require("../../Vocabularies");
exports.TransientRole = {
    TYPE: Vocabularies_1.CS.Role,
    is: function (value) {
        return Document_1.TransientDocument.is(value)
            && value.hasOwnProperty("parent");
    },
    create: function (data) {
        var copy = Object.assign({}, data);
        return exports.TransientRole.createFrom(copy);
    },
    createFrom: function (object) {
        var role = Document_1.TransientDocument.isDecorated(object) ?
            object : Document_1.TransientDocument.createFrom(object);
        role.addType(exports.TransientRole.TYPE);
        return role;
    },
};

//# sourceMappingURL=TransientRole.js.map
