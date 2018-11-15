"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Document_1 = require("../../Document");
var Vocabularies_1 = require("../../Vocabularies");
exports.TransientACL = {
    TYPE: Vocabularies_1.CS.AccessControlList,
    create: function (data) {
        var copy = Object.assign({}, data);
        return exports.TransientACL.createFrom(copy);
    },
    createFrom: function (object) {
        var document = Document_1.TransientDocument.createFrom(object);
        document.addType(exports.TransientACL.TYPE);
        return document;
    },
};

//# sourceMappingURL=TransientACL.js.map
