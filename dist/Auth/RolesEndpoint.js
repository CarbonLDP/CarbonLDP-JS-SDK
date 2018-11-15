"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ProtectedDocument_1 = require("../ProtectedDocument");
exports.RolesEndpoint = {
    is: function (value) {
        return ProtectedDocument_1.ProtectedDocument.is(value);
    },
    decorate: function (object, documents) {
        ProtectedDocument_1.ProtectedDocument.decorate(object, documents);
        return object;
    },
};

//# sourceMappingURL=RolesEndpoint.js.map
