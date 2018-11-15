"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Document_1 = require("../../Document");
var Vocabularies_1 = require("../../Vocabularies");
exports.TransientUser = {
    TYPE: Vocabularies_1.CS.User,
    is: function (value) {
        return Document_1.TransientDocument.is(value)
            && value.hasOwnProperty("credentials");
    },
    create: function (data) {
        var copy = Object.assign({}, data);
        return exports.TransientUser.createFrom(copy);
    },
    createFrom: function (object) {
        var user = Document_1.TransientDocument.decorate(object);
        user._normalize();
        user.addType(exports.TransientUser.TYPE);
        return user;
    },
};

//# sourceMappingURL=TransientUser.js.map
